"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "../button";
import styles from "./styles.module.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
  /** 설명 아래에 넣을 추가 내용 (예: 비밀번호 입력칸) */
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * 확인용 모달 (삭제 확인, 작성 취소 확인 등)
 * 브라우저 기본 <dialog>를 사용해서 ESC 닫기, 포커스 가두기가 자동으로 됩니다.
 */
export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = "취소",
  isLoading = false,
  children,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeOnHide = useEffectEvent(() => {
    if (dialogRef.current?.open) onClose();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // 다른 페이지로 이동해서 이 화면이 숨겨질 때, 열려 있던 모달을 닫아둡니다.
  // (Next.js가 방문한 페이지를 숨겨서 보관하기 때문에, 돌아왔을 때 모달이 다시 떠 있지 않게 하기 위함)
  useLayoutEffect(() => {
    return () => closeOnHide();
  }, []);

  // 입력칸에서 Enter를 눌러도 확인 버튼을 누른 것과 같게 동작
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoading) onConfirm();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault(); // ESC → 상태를 통해 닫기
        if (!isLoading) onClose();
      }}
      onClick={(event) => {
        // 바깥(어두운 배경)을 누르면 닫기
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <form className={styles.content} onSubmit={onSubmit} noValidate>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
        {children && <div className={styles.extra}>{children}</div>}
        <div className={styles.buttons}>
          <Button variant="gray" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "처리 중…" : confirmText}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
