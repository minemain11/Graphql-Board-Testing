import type { Metadata } from "next";

import BoardsWrite from "@/components/boards-write";

export const metadata: Metadata = { title: "새 글 작성" };

export default function BoardsNewPage() {
  return <BoardsWrite isEdit={false} />;
}
