import { LinkButton } from "@/components/commons/button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.card}>
      <p className={styles.code}>404</p>
      <p className={styles.title}>페이지를 찾을 수 없어요.</p>
      <p className={styles.text}>주소를 다시 확인해 주세요.</p>
      <LinkButton href="/boards">글목록으로</LinkButton>
    </div>
  );
}
