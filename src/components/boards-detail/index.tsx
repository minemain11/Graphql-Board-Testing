"use client";

import { use, useId } from "react";

import { ProfileIcon } from "@/commons/icons";
import { Button, ButtonGroup, LinkButton } from "../commons/button";
import ConfirmModal from "../commons/modal";
import { useBoardsDetail } from "./hook";
import styles from "./styles.module.css";

/** 데이터를 불러오는 동안 보여줄 화면 */
export function BoardsDetailSkeleton() {
  return (
    <>
      <article className={styles.card} aria-busy="true" aria-label="게시글 불러오는 중">
        <div className={styles.titleArea}>
          <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        </div>
        <div className={styles.body}>
          <span className={`${styles.skeleton} ${styles.skeletonAuthor}`} />
          <div className={styles.skeletonLines}>
            <span className={styles.skeleton} />
            <span className={styles.skeleton} />
            <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
          </div>
        </div>
      </article>
      <ButtonGroup>
        <LinkButton href="/boards">글목록</LinkButton>
      </ButtonGroup>
    </>
  );
}

interface BoardsDetailProps {
  params: Promise<{ boardId: string }>;
}

export default function BoardsDetail({ params }: BoardsDetailProps) {
  // useParams() 대신 페이지가 받은 params를 사용합니다.
  // (다른 페이지로 이동해 이 화면이 숨겨져 있을 때도 원래 게시글 번호를 유지하기 위함)
  const { boardId } = use(params);
  const {
    board,
    isLoading,
    isNotFound,
    isDeleteModalOpen,
    isDeleting,
    deletePassword,
    deleteError,
    onClickDelete,
    onChangeDeletePassword,
    onConfirmDelete,
    onCloseDeleteModal,
  } = useBoardsDetail(boardId);
  const passwordId = useId();

  if (isLoading) return <BoardsDetailSkeleton />;

  if (isNotFound || !board) {
    return (
      <>
        <div className={`${styles.card} ${styles.notFound}`} role="alert">
          <p className={styles.notFoundTitle}>게시글을 찾을 수 없어요.</p>
          <p className={styles.notFoundText}>삭제되었거나 주소가 올바르지 않아요.</p>
        </div>
        <ButtonGroup>
          <LinkButton href="/boards">글목록</LinkButton>
        </ButtonGroup>
      </>
    );
  }

  const images = (board.images ?? []).filter(Boolean);

  return (
    <>
      <article className={styles.card}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{board.title}</h1>
        </div>

        {images.length > 0 && (
          <ul className={styles.images} aria-label="첨부 이미지">
            {images.map((image, index) => (
              <li key={`${image}-${index}`} className={styles.imageItem}>
                {/* 사용자가 올린 이미지(Vercel Blob 주소)라 next/image 대신 img를 사용합니다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${board.title} 첨부 이미지 ${index + 1}`}
                  className={styles.image}
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        )}

        <div className={images.length > 0 ? styles.body : `${styles.body} ${styles.bodyNoImage}`}>
          <p className={styles.author}>
            <ProfileIcon className={styles.profileIcon} />
            <span className="sr-only">작성자</span>
            <span className={styles.authorName}>{board.writer || "익명"}</span>
          </p>
          <p className={styles.contents}>{board.contents}</p>
        </div>
      </article>

      <ButtonGroup>
        <LinkButton href="/boards">글목록</LinkButton>
        <LinkButton href={`/boards/${boardId}/edit`} variant="gray">
          수정
        </LinkButton>
        <Button variant="gray" onClick={onClickDelete}>
          삭제
        </Button>
      </ButtonGroup>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="게시글을 삭제할까요?"
        description="삭제한 글은 되돌릴 수 없어요."
        confirmText="삭제"
        isLoading={isDeleting}
        onConfirm={onConfirmDelete}
        onClose={onCloseDeleteModal}
      >
        <label htmlFor={passwordId} className={styles.modalLabel}>
          글 작성 시 입력한 비밀번호
        </label>
        <input
          id={passwordId}
          type="password"
          className={
            deleteError ? `${styles.modalInput} ${styles.modalInputError}` : styles.modalInput
          }
          value={deletePassword}
          onChange={onChangeDeletePassword}
          maxLength={20}
          autoComplete="off"
          autoFocus
          aria-invalid={!!deleteError}
        />
        {deleteError && (
          <p className={styles.modalError} role="alert">
            {deleteError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
}
