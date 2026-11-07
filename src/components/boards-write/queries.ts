import { gql, type TypedDocumentNode } from "@apollo/client";

import type { Board, CreateBoardInput, UpdateBoardInput } from "@/commons/types/board";

export const CREATE_BOARD: TypedDocumentNode<
  { createBoard: Board },
  { createBoardInput: CreateBoardInput }
> = gql`
  mutation createBoard($createBoardInput: CreateBoardInput!) {
    createBoard(createBoardInput: $createBoardInput) {
      _id
      writer
      title
      contents
      images
      createdAt
    }
  }
`;

export const UPDATE_BOARD: TypedDocumentNode<
  { updateBoard: Board },
  { boardId: string; password: string; updateBoardInput: UpdateBoardInput }
> = gql`
  mutation updateBoard($boardId: ID!, $password: String, $updateBoardInput: UpdateBoardInput!) {
    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput) {
      _id
      writer
      title
      contents
      images
      createdAt
    }
  }
`;

export const UPLOAD_FILE: TypedDocumentNode<
  { uploadFile: { url: string } },
  { file: File }
> = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;
