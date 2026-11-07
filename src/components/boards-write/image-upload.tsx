"use client";

import { useRef } from "react";

import { CloseIcon, PlusCircleIcon } from "@/commons/icons";
import { ALLOWED_IMAGE_TYPES } from "@/commons/libraries/constants";
import type { ImageSlot } from "./hook";
import styles from "./styles.module.css";

interface ImageUploadProps {
  index: number;
  slot: ImageSlot;
  onChangeFile: (index: number, file: File | undefined) => void;
  onRemove: (index: number) => void;
}

/** 이미지 한 칸 (비어 있으면 + 버튼, 있으면 미리보기 + 삭제 버튼) */
export default function ImageUpload({ index, slot, onChangeFile, onRemove }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const src = slot.preview || slot.url;
  const order = index + 1;

  const openFilePicker = () => fileRef.current?.click();

  return (
    <div className={styles.slot}>
      {src ? (
        <>
          <button
            type="button"
            className={styles.slotPreview}
            onClick={openFilePicker}
            aria-label={`${order}번째 이미지 바꾸기`}
            disabled={slot.isUploading}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className={styles.slotImage} />
            {slot.isUploading && (
              <span className={styles.uploading}>
                <span className={styles.spinner} />
                <span className="sr-only">업로드 중</span>
              </span>
            )}
          </button>
          {!slot.isUploading && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onRemove(index)}
              aria-label={`${order}번째 이미지 삭제`}
            >
              <CloseIcon />
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          className={styles.slotEmpty}
          onClick={openFilePicker}
          aria-label={`${order}번째 이미지 추가`}
        >
          <PlusCircleIcon className={styles.plusIcon} />
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className={styles.fileInput}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          onChangeFile(index, event.target.files?.[0]);
          event.target.value = ""; // 같은 파일을 다시 골라도 동작하도록 초기화
        }}
      />
    </div>
  );
}
