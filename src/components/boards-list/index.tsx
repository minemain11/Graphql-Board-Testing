"use client";

import Link from "next/link";

import { formatDate } from "@/commons/libraries/utils";
import { Button, LinkButton } from "../commons/button";
import { useBoardsList } from "./hook";
import styles from "./styles.module.css";

const SKELETON_COUNT = 7;

function SkeletonRows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <li key={index} className={`${styles.row} ${styles.skeletonRow}`} aria-hidden="true">
      <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <span className={`${styles.skeleton} ${styles.skeletonDate}`} />
    </li>
  ));
}

export default function BoardsList() {
  const { boards, isInitialLoading, error, hasMore, isFetchingMore, sentinelRef, onRetry } =
    useBoardsList();

  if (error) {
    return (
      <div className={styles.message} role="alert">
        <p className={styles.messageTitle}>게시글을 불러오지 못했어요.</p>
        <p className={styles.messageText}>잠시 후 다시 시도해 주세요.</p>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    );
  }

  if (!isInitialLoading && boards.length === 0) {
    return (
      <div className={styles.message}>
        <p className={styles.messageTitle}>아직 작성된 글이 없어요.</p>
        <p className={styles.messageText}>첫 번째 이야기를 남겨보세요!</p>
        <LinkButton href="/boards/new">새 글 작성</LinkButton>
      </div>
    );
  }

  return (
    <section aria-label="전체 글 목록">
      <h1 className="sr-only">전체 글 보기</h1>
      <ul className={styles.list} aria-busy={isInitialLoading || isFetchingMore}>
        {isInitialLoading ? (
          <SkeletonRows count={SKELETON_COUNT} />
        ) : (
          boards.map((board) => (
            <li key={board._id}>
              <Link href={`/boards/${board._id}`} className={`${styles.row} ${styles.rowLink}`}>
                <span className={styles.title}>{board.title}</span>
                <time className={styles.date} dateTime={board.createdAt}>
                  {formatDate(board.createdAt)}
                </time>
              </Link>
            </li>
          ))
        )}
        {isFetchingMore && <SkeletonRows count={2} />}
      </ul>
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </section>
  );
}
