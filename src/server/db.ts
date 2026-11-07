import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";

/**
 * 데이터베이스 연결
 * - DATABASE_URL이 있으면(배포 환경) → Postgres(Neon)에 연결
 * - 없으면(내 컴퓨터) → 설치 없이 쓰는 내장 Postgres(PGlite)를 .local-data 폴더에 저장
 * 두 경우 모두 같은 SQL을 사용합니다.
 */

type Row = Record<string, unknown>;

export interface Db {
  query<T extends Row = Row>(text: string, params?: unknown[]): Promise<T[]>;
}

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const LOCAL_DB_DIR = path.join(process.cwd(), ".local-data", "pglite");

// 개발 서버가 코드를 다시 불러와도 연결을 하나만 유지하도록 globalThis에 보관
const globalForDb = globalThis as typeof globalThis & {
  __talkrDb?: Promise<Db>;
};

export function getDb(): Promise<Db> {
  globalForDb.__talkrDb ??= createDb().catch((error) => {
    globalForDb.__talkrDb = undefined; // 실패하면 다음 요청에서 다시 시도
    throw error;
  });
  return globalForDb.__talkrDb;
}

async function createDb(): Promise<Db> {
  let db: Db;

  if (DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: DATABASE_URL, max: 3 });
    db = { query: async (text, params) => (await pool.query(text, params)).rows };
  } else if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL 환경 변수가 없습니다. Vercel 프로젝트의 Storage 탭에서 Neon 데이터베이스를 연결해 주세요."
    );
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    mkdirSync(LOCAL_DB_DIR, { recursive: true });
    const pglite = await PGlite.create(LOCAL_DB_DIR);
    db = {
      query: async <T extends Row>(text: string, params?: unknown[]) =>
        (await pglite.query<T>(text, params)).rows,
    };
  }

  await ensureSchema(db);
  return db;
}

/** 처음 실행할 때 테이블을 만들고 안내용 게시글 3개를 넣어둡니다. */
async function ensureSchema(db: Db) {
  const [{ exists }] = await db.query<{ exists: boolean }>(
    "SELECT to_regclass('public.boards') IS NOT NULL AS exists"
  );
  if (exists) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        writer        varchar(20)  NOT NULL,
        password_hash text         NOT NULL,
        title         varchar(100) NOT NULL,
        contents      text         NOT NULL,
        images        text[]       NOT NULL DEFAULT '{}',
        created_at    timestamptz  NOT NULL DEFAULT now(),
        updated_at    timestamptz  NOT NULL DEFAULT now()
      )
    `);
    await db.query(
      "CREATE INDEX IF NOT EXISTS boards_created_at_idx ON boards (created_at DESC, id DESC)"
    );
  } catch (error) {
    // 서버 여러 대가 동시에 테이블을 만들려고 한 경우 → 이미 만들어졌으면 괜찮음
    const [{ exists: createdByOther }] = await db.query<{ exists: boolean }>(
      "SELECT to_regclass('public.boards') IS NOT NULL AS exists"
    );
    if (!createdByOther) throw error;
    return;
  }

  await seedWelcomePosts(db);
}

async function seedWelcomePosts(db: Db) {
  // 안내 글은 아무도 수정·삭제할 수 없도록 무작위 비밀번호로 저장합니다.
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const posts = [
    {
      title: "글을 수정·삭제하려면 비밀번호가 필요해요 🔒",
      contents:
        "글을 쓸 때 입력한 비밀번호는 암호화(bcrypt)되어 저장돼요.\n수정하거나 삭제할 때 같은 비밀번호를 입력해야 하니 꼭 기억해 주세요.",
    },
    {
      title: "이미지는 최대 3장까지 올릴 수 있어요 🖼️",
      contents:
        "새 글 작성 화면의 + 버튼을 눌러 JPG, PNG, WEBP, GIF 이미지를 올려보세요.\n한 장에 4MB까지 올릴 수 있어요.",
    },
    {
      title: "TALKR에 오신 걸 환영해요 👋",
      contents:
        "TALKR는 누구나 자유롭게 이야기를 나누는 게시판이에요.\n왼쪽의 '새 글 작성'을 눌러 첫 이야기를 남겨보세요!",
    },
  ];

  for (const [index, post] of posts.entries()) {
    await db.query(
      `INSERT INTO boards (writer, password_hash, title, contents, created_at, updated_at)
       VALUES ($1, $2, $3, $4, now() - make_interval(mins => $5), now() - make_interval(mins => $5))`,
      ["TALKR", passwordHash, post.title, post.contents, posts.length - index]
    );
  }
}
