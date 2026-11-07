import { Suspense, type ReactNode } from "react";

import Navigation, { NavigationWithPathname } from "./navigation";
import styles from "./styles.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      {/*
        상세(/boards/[boardId]) 페이지는 주소를 미리 알 수 없어서 usePathname이 잠시 대기(Suspense)합니다.
        그동안 보여줄 화면으로 '전체 글 보기'가 활성화된 메뉴를 넣어 깜빡임이 없게 했습니다.
      */}
      <Suspense fallback={<Navigation activeMenu="list" />}>
        <NavigationWithPathname />
      </Suspense>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
