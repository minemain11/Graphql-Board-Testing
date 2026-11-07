"use client";

import { useId } from "react";

import { MAX_CONTENTS_LENGTH } from "@/commons/libraries/constants";
import type { Board } from "@/commons/types/board";
import { Button, ButtonGroup } from "../commons/button";
import ConfirmModal from "../commons/modal";
import { useBoardsWrite } from "./hook";
import ImageUpload from "./image-upload";
import styles from "./styles.module.css";

interface BoardsWriteProps {
  isEdit: boolean;
  board?: Board;
}

export default function BoardsWrite({ isEdit, board }: BoardsWriteProps) {
  const {
    values,
    slots,
    errors,
    imageError,
    submitError,
    isSubmitting,
    isCancelModalOpen,
    onChangeValue,
    onChangeFile,
    onRemoveImage,
    onSubmit,
    onClickCancel,
    onConfirmCancel,
    onCloseCancelModal,
  } = useBoardsWrite({ isEdit, board });

  // 같은 화면이 두 번 존재해도 label과 input 연결이 꼬이지 않도록 고유 id 사용
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;

  const inputClass = (field: keyof typeof errors) =>
    errors[field] ? `${styles.input} ${styles.inputError}` : styles.input;

  const errorMessage = (field: keyof typeof errors) =>
    errors[field] ? (
      <p id={fieldId(`${field}-error`)} className={styles.errorText} role="alert">
        {errors[field]}
      </p>
    ) : null;

  const describedBy = (field: keyof typeof errors) =>
    errors[field] ? fieldId(`${field}-error`) : undefined;

  return (
    <>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <section className={styles.card}>
          <h1 className={styles.heading}>{isEdit ? "게시물 수정" : "새 글 작성"}</h1>

          <div className={styles.fields}>
            {/* 제목 */}
            <div className={styles.row}>
              <label htmlFor={fieldId("title")} className={styles.label}>
                제목
              </label>
              <div className={styles.control}>
                <input
                  id={fieldId("title")}
                  name="title"
                  type="text"
                  className={inputClass("title")}
                  value={values.title}
                  onChange={onChangeValue}
                  maxLength={100}
                  aria-invalid={!!errors.title}
                  aria-describedby={describedBy("title")}
                />
                {errorMessage("title")}
              </div>
            </div>

            {/* 내용 */}
            <div className={`${styles.row} ${styles.rowTop}`}>
              <label htmlFor={fieldId("contents")} className={styles.label}>
                내용
              </label>
              <div className={styles.control}>
                <textarea
                  id={fieldId("contents")}
                  name="contents"
                  className={`${inputClass("contents")} ${styles.textarea}`}
                  value={values.contents}
                  onChange={onChangeValue}
                  maxLength={MAX_CONTENTS_LENGTH}
                  aria-invalid={!!errors.contents}
                  aria-describedby={describedBy("contents")}
                />
                {errorMessage("contents")}
              </div>
            </div>

            {/* 이미지 */}
            <div className={`${styles.row} ${styles.rowTop}`}>
              <span id={fieldId("images")} className={styles.label}>
                이미지
              </span>
              <div className={styles.control}>
                <div className={styles.slots} role="group" aria-labelledby={fieldId("images")}>
                  {slots.map((slot, index) => (
                    <ImageUpload
                      key={index}
                      index={index}
                      slot={slot}
                      onChangeFile={onChangeFile}
                      onRemove={onRemoveImage}
                    />
                  ))}
                </div>
                {imageError && (
                  <p className={styles.errorText} role="alert">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* 작성자 + 비밀번호 */}
            <div className={styles.rowPair}>
              <div className={styles.row}>
                <label htmlFor={fieldId("writer")} className={styles.label}>
                  작성자
                </label>
                <div className={styles.control}>
                  <input
                    id={fieldId("writer")}
                    name="writer"
                    type="text"
                    className={inputClass("writer")}
                    value={values.writer}
                    onChange={onChangeValue}
                    disabled={isEdit}
                    maxLength={20}
                    autoComplete="nickname"
                    aria-invalid={!!errors.writer}
                    aria-describedby={describedBy("writer")}
                  />
                  {errorMessage("writer")}
                </div>
              </div>

              <div className={styles.row}>
                <label htmlFor={fieldId("password")} className={styles.label}>
                  비밀번호
                </label>
                <div className={styles.control}>
                  <input
                    id={fieldId("password")}
                    name="password"
                    type="password"
                    className={inputClass("password")}
                    value={values.password}
                    onChange={onChangeValue}
                    maxLength={20}
                    autoComplete="off"
                    aria-invalid={!!errors.password}
                    aria-describedby={describedBy("password")}
                  />
                  {errorMessage("password")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <ButtonGroup>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "수정 중…" : "등록 중…") : isEdit ? "수정" : "등록"}
          </Button>
          <Button variant="gray" onClick={onClickCancel} disabled={isSubmitting}>
            취소
          </Button>
        </ButtonGroup>
      </form>

      {/* 모달 안에도 form이 있어서, 겹치지 않도록 바깥 form 밖에 둡니다. */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={isEdit ? "수정을 취소할까요?" : "작성을 취소할까요?"}
        description="입력한 내용은 저장되지 않아요."
        confirmText="나가기"
        cancelText="계속 쓰기"
        onConfirm={onConfirmCancel}
        onClose={onCloseCancelModal}
      />
    </>
  );
}
