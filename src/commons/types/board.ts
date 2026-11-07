/** GraphQL 서버(src/server/schema.ts)의 게시글 타입 */

export interface Board {
  __typename?: "Board";
  _id: string;
  writer?: string | null;
  title: string;
  contents: string;
  images?: string[] | null;
  createdAt: string;
}

export interface CreateBoardInput {
  writer: string;
  password: string;
  title: string;
  contents: string;
  images?: string[];
}

export interface UpdateBoardInput {
  title?: string;
  contents?: string;
  images?: string[];
}
