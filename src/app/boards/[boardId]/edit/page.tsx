import type { Metadata } from "next";
import { Suspense } from "react";

import BoardsEdit, { BoardsEditSkeleton } from "@/components/boards-edit";

export const metadata: Metadata = { title: "게시물 수정" };

export default function BoardEditPage({ params }: PageProps<"/boards/[boardId]/edit">) {
  return (
    <Suspense fallback={<BoardsEditSkeleton />}>
      <BoardsEdit params={params} />
    </Suspense>
  );
}
