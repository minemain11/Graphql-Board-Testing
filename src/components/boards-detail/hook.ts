"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

import { getErrorMessage } from "@/commons/libraries/utils";
import { FETCH_BOARDS } from "../boards-list/queries";
import { DELETE_BOARD, FETCH_BOARD } from "./queries";

export function useBoardsDetail(boardId: string) {
  const router = useRouter();

  const { data, loading, error } = useQuery(FETCH_BOARD, {
    variables: { boardId },
  });
  const [deleteBoard, { loading: isDeleting }] = useMutation(DELETE_BOARD);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const onClickDelete = () => {
    setDeletePassword("");
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const onChangeDeletePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setDeletePassword(event.target.value);
    if (deleteError) setDeleteError("");
  };

  const onCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletePassword(""); // 비밀번호는 화면에 남겨두지 않음
  };

  const onConfirmDelete = async () => {
    if (deletePassword === "") {
      setDeleteError("비밀번호를 입력해 주세요.");
      return;
    }
    try {
      await deleteBoard({
        variables: { boardId, password: deletePassword },
        // 목록을 1페이지부터 다시 받아와서 삭제된 글이 사라지게 합니다.
        refetchQueries: [{ query: FETCH_BOARDS, variables: { page: 1 } }],
        awaitRefetchQueries: true,
      });
      onCloseDeleteModal();
      // replace: 뒤로 가기를 눌러도 삭제된 글로 돌아가지 않도록
      router.replace("/boards");
    } catch (error) {
      // 비밀번호가 틀리면 서버 메시지("비밀번호가 일치하지 않습니다.")를 모달 안에 보여줍니다.
      setDeleteError(getErrorMessage(error, "삭제하지 못했어요. 잠시 후 다시 시도해 주세요."));
    }
  };

  return {
    board: data?.fetchBoard,
    isLoading: loading && !data,
    isNotFound: !loading && !data && !!error,
    isDeleteModalOpen,
    isDeleting,
    deletePassword,
    deleteError,
    onClickDelete,
    onChangeDeletePassword,
    onConfirmDelete,
    onCloseDeleteModal,
  };
}
