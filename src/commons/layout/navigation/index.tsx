"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AddCommentIcon, ListIcon, LogoIcon } from "@/commons/icons";
import styles from "./styles.module.css";

type MenuKey = "list" | "new";

const MENUS: { key: MenuKey; href: string; label: string; Icon: typeof ListIcon }[] = [
  { key: "list", href: "/boards", label: "전체 글 보기", Icon: ListIcon },
  { key: "new", href: "/boards/new", label: "새 글 작성", Icon: AddCommentIcon },
];

/** 현재 주소를 보고 어떤 메뉴를 활성화할지 정합니다. */
export function NavigationWithPathname() {
  const pathname = usePathname();
  const activeMenu: MenuKey = pathname === "/boards/new" ? "new" : "list";
  return <Navigation activeMenu={activeMenu} />;
}

export default function Navigation({ activeMenu }: { activeMenu: MenuKey }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/boards" className={styles.logo} aria-label="TALKR 홈">
          <LogoIcon className={styles.logoIcon} />
          <span className={styles.logoText}>TALKR</span>
        </Link>
      </div>

      <nav className={styles.nav} aria-label="게시판 메뉴">
        <ul className={styles.menuList}>
          {MENUS.map(({ key, href, label, Icon }) => {
            const isActive = key === activeMenu;
            return (
              <li key={key}>
                <Link
                  href={href}
                  className={isActive ? `${styles.menu} ${styles.active}` : styles.menu}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.menuIcon}>
                    <Icon className={key === "list" ? styles.listIcon : styles.addIcon} />
                  </span>
                  <span className={styles.menuLabel}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
