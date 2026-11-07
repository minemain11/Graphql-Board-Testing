import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./styles.module.css";

type Variant = "primary" | "gray";

const getClassName = (variant: Variant) => `${styles.button} ${styles[variant]}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** 피그마 버튼 (보라색 primary / 회색 gray) */
export function Button({ variant = "primary", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={getClassName(variant)} {...rest} />;
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  children: ReactNode;
}

/** 버튼 모양의 링크 (페이지 이동용) */
export function LinkButton({ href, variant = "primary", children }: LinkButtonProps) {
  return (
    <Link href={href} className={getClassName(variant)}>
      {children}
    </Link>
  );
}

/** 화면 아래 가운데 정렬된 버튼 묶음 */
export function ButtonGroup({ children }: { children: ReactNode }) {
  return <div className={styles.group}>{children}</div>;
}
