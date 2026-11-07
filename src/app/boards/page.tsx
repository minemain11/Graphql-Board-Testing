import type { Metadata } from "next";

import Banner from "@/commons/layout/banner";
import BoardsList from "@/components/boards-list";

export const metadata: Metadata = { title: "전체 글 보기" };

export default function BoardsPage() {
  return (
    <>
      <Banner />
      <BoardsList />
    </>
  );
}
