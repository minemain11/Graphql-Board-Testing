import { gql, type TypedDocumentNode } from "@apollo/client";

import type { Board } from "@/commons/types/board";

export interface FetchBoardsData {
  fetchBoards: Pick<Board, "_id" | "title" | "createdAt">[];
  fetchBoardsCount: number;
}

export interface FetchBoardsVariables {
  page?: number;
}

export const FETCH_BOARDS: TypedDocumentNode<FetchBoardsData, FetchBoardsVariables> = gql`
  query fetchBoards($page: Int) {
    fetchBoards(page: $page) {
      _id
      title
      createdAt
    }
    fetchBoardsCount
  }
`;
