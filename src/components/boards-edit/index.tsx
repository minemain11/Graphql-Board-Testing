"use client";

import { useQuery } from "@apollo/client/react";
import { use } from "react";

import { FETCH_BOARD } from "../boards-detail/queries";
import { ButtonGroup, LinkButton } from "../commons/button";
import BoardsWrite from "../boards-write";
import styles from "./styles.module.css";

/** 수정할 게시글을 불러오는 동안 보여줄 화면 */
export function BoardsEditSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-label="게시글 불러오는 중">
      <span className={styles.skeletonHeading} />
    </div>
  );
}

interface BoardsEditProps {
  params: Promise<{ boardId: string }>;
}

export default function BoardsEdit({ params }: BoardsEditProps) {
  // 페이지가 받은 params 사용 (숨겨진 화면에서도 게시글 번호가 바뀌지 않도록)
  const { boardId } = use(params);
  const { data, loading, error } = useQuery(FETCH_BOARD, { variables: { boardId } });

  if (loading && !data) return <BoardsEditSkeleton />;

  if (error || !data) {
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

  // 게시글이 바뀌면(key 변경) 입력 폼을 새 값으로 다시 시작합니다.
  return <BoardsWrite key={data.fetchBoard._id} isEdit board={data.fetchBoard} />;
}
