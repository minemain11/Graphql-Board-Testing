import { gql, type TypedDocumentNode } from "@apollo/client";

import type { Board } from "@/commons/types/board";

export interface FetchBoardData {
  fetchBoard: Board;
}

export interface FetchBoardVariables {
  boardId: string;
}

export const FETCH_BOARD: TypedDocumentNode<FetchBoardData, FetchBoardVariables> = gql`
  query fetchBoard($boardId: ID!) {
    fetchBoard(boardId: $boardId) {
      _id
      writer
      title
      contents
      images
      createdAt
    }
  }
`;

export const DELETE_BOARD: TypedDocumentNode<
  { deleteBoard: string },
  { boardId: string; password: string }
> = gql`
  mutation deleteBoard($boardId: ID!, $password: String!) {
    deleteBoard(boardId: $boardId, password: $password)
  }
`;
