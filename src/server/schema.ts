import bcrypt from "bcryptjs";
import { GraphQLError, GraphQLScalarType } from "graphql";
import { createSchema } from "graphql-yoga";

import { getDb } from "./db";
import { deleteImages, IMAGE_EXTENSIONS, isOwnImageUrl, MAX_IMAGE_SIZE, saveImage } from "./storage";

/**
 * TALKR GraphQL API
 * 화면에서 쓰는 query/mutation 이름과 모양은 그대로 두고, 서버만 직접 구현했습니다.
 */
const typeDefs = /* GraphQL */ `
  scalar Upload

  type Board {
    _id: ID!
    writer: String
    title: String!
    contents: String!
    images: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type FileManager {
    url: String!
  }

  input CreateBoardInput {
    writer: String!
    password: String!
    title: String!
    contents: String!
    images: [String!]
  }

  input UpdateBoardInput {
    title: String
    contents: String
    images: [String!]
  }

  type Query {
    "게시글 목록 (한 페이지에 10개, 최신순)"
    fetchBoards(page: Int): [Board!]!
    "전체 게시글 수"
    fetchBoardsCount: Int!
    "게시글 하나"
    fetchBoard(boardId: ID!): Board!
  }

  type Mutation {
    createBoard(createBoardInput: CreateBoardInput!): Board!
    "비밀번호가 맞아야 수정됩니다."
    updateBoard(boardId: ID!, password: String, updateBoardInput: UpdateBoardInput!): Board!
    "비밀번호가 맞아야 삭제됩니다."
    deleteBoard(boardId: ID!, password: String): ID!
    uploadFile(file: Upload!): FileManager!
  }
`;

// ---------- 공통 ----------
const PAGE_SIZE = 10;
const MAX_IMAGES = 3;
const LIMITS = { writer: 20, password: 20, title: 100, contents: 3000 } as const;
const LABELS = { writer: "작성자를", password: "비밀번호를", title: "제목을", contents: "내용을" } as const;
const TOPICS = { writer: "작성자는", password: "비밀번호는", title: "제목은", contents: "내용은" } as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const userError = (message: string) =>
  new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });

interface BoardRow {
  id: string;
  writer: string;
  password_hash: string;
  title: string;
  contents: string;
  images: string[];
  created_at: Date | string;
  updated_at: Date | string;
}

const toIso = (value: Date | string) => new Date(value).toISOString();

const toBoard = (row: BoardRow) => ({
  _id: row.id,
  writer: row.writer,
  title: row.title,
  contents: row.contents,
  images: row.images ?? [],
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

/** 필수 글자 값 검사: 앞뒤 공백 제거 → 비었는지, 너무 긴지 확인 */
function requireText(field: keyof typeof LIMITS, value: unknown, { trim = true } = {}) {
  const text = typeof value === "string" ? (trim ? value.trim() : value) : "";
  if (text.trim() === "") throw userError(`${LABELS[field]} 입력해 주세요.`);
  if (text.length > LIMITS[field]) {
    throw userError(`${TOPICS[field]} ${LIMITS[field]}자까지 입력할 수 있어요.`);
  }
  return text;
}

function checkImages(images: unknown) {
  const list = Array.isArray(images) ? images.filter((url) => typeof url === "string" && url) : [];
  if (list.length > MAX_IMAGES) throw userError(`이미지는 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
  if (!list.every(isOwnImageUrl)) throw userError("올바르지 않은 이미지 주소예요.");
  return list as string[];
}

async function findBoard(boardId: string) {
  if (!UUID.test(boardId)) throw userError("게시물이 존재하지 않습니다.");
  const db = await getDb();
  const [row] = await db.query<BoardRow & Record<string, unknown>>(
    "SELECT * FROM boards WHERE id = $1",
    [boardId]
  );
  if (!row) throw userError("게시물이 존재하지 않습니다.");
  return row;
}

async function checkPassword(row: BoardRow, password: unknown) {
  if (typeof password !== "string" || password === "") {
    throw userError("비밀번호를 입력해 주세요.");
  }
  const isMatch = await bcrypt.compare(password, row.password_hash);
  if (!isMatch) throw userError("비밀번호가 일치하지 않습니다.");
}

// ---------- resolvers ----------
const resolvers = {
  Upload: new GraphQLScalarType({
    name: "Upload",
    description: "multipart로 올린 파일",
    parseValue: (value) => value,
  }),

  Query: {
    fetchBoards: async (_: unknown, { page }: { page?: number | null }) => {
      const safePage = Math.max(1, Math.floor(page ?? 1));
      const db = await getDb();
      const rows = await db.query<BoardRow & Record<string, unknown>>(
        "SELECT * FROM boards ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2",
        [PAGE_SIZE, (safePage - 1) * PAGE_SIZE]
      );
      return rows.map(toBoard);
    },

    fetchBoardsCount: async () => {
      const db = await getDb();
      const [{ count }] = await db.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM boards"
      );
      return count;
    },

    fetchBoard: async (_: unknown, { boardId }: { boardId: string }) =>
      toBoard(await findBoard(boardId)),
  },

  Mutation: {
    createBoard: async (
      _: unknown,
      { createBoardInput: input }: { createBoardInput: Record<string, unknown> }
    ) => {
      const writer = requireText("writer", input.writer);
      const password = requireText("password", input.password, { trim: false });
      const title = requireText("title", input.title);
      const contents = requireText("contents", input.contents, { trim: false });
      const images = checkImages(input.images);

      const passwordHash = await bcrypt.hash(password, 10);
      const db = await getDb();
      const [row] = await db.query<BoardRow & Record<string, unknown>>(
        `INSERT INTO boards (writer, password_hash, title, contents, images)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [writer, passwordHash, title, contents, images]
      );
      return toBoard(row);
    },

    updateBoard: async (
      _: unknown,
      {
        boardId,
        password,
        updateBoardInput: input,
      }: { boardId: string; password?: string | null; updateBoardInput: Record<string, unknown> }
    ) => {
      const row = await findBoard(boardId);
      await checkPassword(row, password);

      const title = input.title == null ? row.title : requireText("title", input.title);
      const contents =
        input.contents == null ? row.contents : requireText("contents", input.contents, { trim: false });
      const images = input.images == null ? row.images : checkImages(input.images);

      const db = await getDb();
      const [updated] = await db.query<BoardRow & Record<string, unknown>>(
        `UPDATE boards SET title = $2, contents = $3, images = $4, updated_at = now()
         WHERE id = $1 RETURNING *`,
        [boardId, title, contents, images]
      );

      // 빠진 이미지는 저장소에서도 지움
      await deleteImages(row.images.filter((url) => !images.includes(url)));
      return toBoard(updated);
    },

    deleteBoard: async (
      _: unknown,
      { boardId, password }: { boardId: string; password?: string | null }
    ) => {
      const row = await findBoard(boardId);
      await checkPassword(row, password);

      const db = await getDb();
      await db.query("DELETE FROM boards WHERE id = $1", [boardId]);
      await deleteImages(row.images);
      return boardId;
    },

    uploadFile: async (_: unknown, { file }: { file: File }) => {
      if (!file || typeof file.arrayBuffer !== "function") throw userError("파일이 없어요.");
      if (!IMAGE_EXTENSIONS[file.type]) {
        throw userError("JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.");
      }
      if (file.size > MAX_IMAGE_SIZE) throw userError("이미지는 4MB 이하만 올릴 수 있어요.");
      return { url: await saveImage(file) };
    },
  },
};

export const schema = createSchema({ typeDefs, resolvers });
