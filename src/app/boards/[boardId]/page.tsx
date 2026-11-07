import type { Metadata } from "next";
import { Suspense } from "react";

import Banner from "@/commons/layout/banner";
import BoardsDetail, { BoardsDetailSkeleton } from "@/components/boards-detail";

export const metadata: Metadata = { title: "게시글" };

export default function BoardDetailPage({ params }: PageProps<"/boards/[boardId]">) {
  return (
    <>
      <Banner />
      {/* 게시글 번호(boardId)는 접속해야 알 수 있어서 Suspense로 감싸 로딩 화면을 먼저 보여줍니다. */}
      <Suspense fallback={<BoardsDetailSkeleton />}>
        <BoardsDetail params={params} />
      </Suspense>
    </>
  );
}
