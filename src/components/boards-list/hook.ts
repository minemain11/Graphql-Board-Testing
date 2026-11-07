"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { BOARDS_PER_PAGE } from "@/commons/libraries/constants";
import { FETCH_BOARDS } from "./queries";

export function useBoardsList() {
  const { data, loading, error, fetchMore, refetch } = useQuery(FETCH_BOARDS, {
    variables: { page: 1 },
  });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // 마지막 페이지에 도달했을 때의 글 개수 (목록이 새로 시작되면 자연스럽게 다시 불러올 수 있음)
  const [endReachedAt, setEndReachedAt] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const boards = data?.fetchBoards ?? [];
  const totalCount = data?.fetchBoardsCount ?? 0;
  const hasMore = boards.length < totalCount && endReachedAt !== boards.length;

  const onLoadMore = async () => {
    if (!data || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = Math.ceil(boards.length / BOARDS_PER_PAGE) + 1;
      const result = await fetchMore({ variables: { page: nextPage } });
      const received = result.data?.fetchBoards.length ?? 0;
      if (received < BOARDS_PER_PAGE) {
        setEndReachedAt(boards.length + received);
      }
    } finally {
      setIsFetchingMore(false);
    }
  };

  const onIntersect = useEffectEvent(() => {
    void onLoadMore();
  });

  // 목록 맨 아래(sentinel)가 화면에 보이면 다음 페이지를 불러옵니다. (무한 스크롤)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, boards.length]);

  return {
    boards,
    isInitialLoading: loading && !data,
    error: data ? undefined : error,
    hasMore,
    isFetchingMore,
    sentinelRef,
    onRetry: () => void refetch(),
  };
}
