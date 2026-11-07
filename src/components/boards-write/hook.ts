"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { MAX_IMAGES } from "@/commons/libraries/constants";
import { getErrorMessage } from "@/commons/libraries/utils";
import type { Board, UpdateBoardInput } from "@/commons/types/board";
import { FETCH_BOARDS } from "../boards-list/queries";
import { CREATE_BOARD, UPDATE_BOARD, UPLOAD_FILE } from "./queries";
import { validateForm, validateImageFile, type FormErrors, type FormValues } from "./validation";

export interface ImageSlot {
  url: string; // 업로드가 끝난 이미지 주소 (서버에 저장할 값)
  preview: string; // 업로드 중 바로 보여줄 미리보기 주소 (blob:)
  isUploading: boolean;
}

const EMPTY_SLOT: ImageSlot = { url: "", preview: "", isUploading: false };

const toSlots = (images: string[] = []): ImageSlot[] =>
  Array.from({ length: MAX_IMAGES }, (_, index) => ({
    ...EMPTY_SLOT,
    url: images[index] ?? "",
  }));

interface UseBoardsWriteParams {
  isEdit: boolean;
  board?: Board;
}

export function useBoardsWrite({ isEdit, board }: UseBoardsWriteParams) {
  const router = useRouter();
  const [createBoard] = useMutation(CREATE_BOARD);
  const [updateBoard] = useMutation(UPDATE_BOARD);
  const [uploadFile] = useMutation(UPLOAD_FILE);

  // 수정 모드에서는 기존 게시글 값으로 시작합니다.
  const initialValues: FormValues = {
    writer: board?.writer ?? "",
    password: "",
    title: board?.title ?? "",
    contents: board?.contents ?? "",
  };
  const initialImages = (board?.images ?? []).filter(Boolean);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [slots, setSlots] = useState<ImageSlot[]>(() => toSlots(initialImages));
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const images = slots.map((slot) => slot.url).filter(Boolean);
  const isUploading = slots.some((slot) => slot.isUploading);
  const isDirty =
    values.writer !== initialValues.writer ||
    values.password !== "" ||
    values.title !== initialValues.title ||
    values.contents !== initialValues.contents ||
    images.join() !== initialImages.join();

  const listPath = isEdit && board ? `/boards/${board._id}` : "/boards";

  // 미리보기용 blob 주소는 더 이상 쓰지 않을 때 메모리에서 해제합니다.
  const releasePreview = (slot: ImageSlot) => {
    if (slot.preview) URL.revokeObjectURL(slot.preview);
  };

  const resetForm = () => {
    slots.forEach(releasePreview);
    setValues(initialValues);
    setSlots(toSlots(initialImages));
    setErrors({});
    setImageError("");
    setSubmitError("");
  };

  // ---------- 입력 ----------
  const onChangeValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as keyof FormValues;
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    // 입력을 시작하면 해당 칸의 에러 메시지를 지웁니다.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError("");
  };

  // ---------- 이미지 ----------
  const onChangeFile = async (index: number, file: File | undefined) => {
    if (!file) return;

    const message = validateImageFile(file);
    if (message) {
      setImageError(message);
      return;
    }
    setImageError("");

    // 업로드가 끝나기 전에 미리보기부터 보여줍니다.
    const previousSlot = slots[index];
    const preview = URL.createObjectURL(file);
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, preview, isUploading: true } : slot))
    );

    // 업로드가 끝났을 때, 그 사이 같은 칸에 다른 사진을 고르지 않았을 때만 반영합니다.
    const finish = (next: ImageSlot) =>
      setSlots((prev) =>
        prev.map((slot, i) => (i === index && slot.preview === preview ? next : slot))
      );

    try {
      const { data } = await uploadFile({ variables: { file } });
      releasePreview(previousSlot);
      finish({ url: data?.uploadFile.url ?? "", preview, isUploading: false });
    } catch {
      URL.revokeObjectURL(preview);
      finish(previousSlot); // 실패하면 원래 이미지로 되돌림
      setImageError("이미지를 올리지 못했어요. 다시 시도해 주세요.");
    }
  };

  const onRemoveImage = (index: number) => {
    releasePreview(slots[index]);
    setSlots((prev) => prev.map((slot, i) => (i === index ? EMPTY_SLOT : slot)));
    setImageError("");
  };

  // ---------- 등록 / 수정 ----------
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(values, isEdit);
    setErrors(nextErrors);
    const firstErrorField = Object.keys(nextErrors)[0];
    if (firstErrorField) {
      // 첫 번째로 비어 있는 칸으로 커서를 옮겨줍니다.
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstErrorField}"]`)?.focus();
      return;
    }
    if (isUploading) {
      setSubmitError("이미지 업로드가 끝날 때까지 잠시만 기다려 주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      if (isEdit && board) {
        await submitUpdate(board);
      } else {
        await submitCreate();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCreate = async () => {
    try {
      const { data } = await createBoard({
        variables: {
          createBoardInput: {
            writer: values.writer.trim(),
            password: values.password,
            title: values.title.trim(),
            contents: values.contents,
            images,
          },
        },
        // 목록 첫 페이지를 다시 받아와서 새 글이 맨 위에 보이게 합니다.
        refetchQueries: [{ query: FETCH_BOARDS, variables: { page: 1 } }],
      });
      const boardId = data?.createBoard._id;
      if (!boardId) throw new Error("no id");

      resetForm(); // 다음에 새 글 작성 화면에 왔을 때 빈 칸으로 시작
      router.push(`/boards/${boardId}`);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요."));
    }
  };

  const submitUpdate = async (original: Board) => {
    // 바뀐 값만 골라서 보냅니다.
    const updateBoardInput: UpdateBoardInput = {};
    if (values.title.trim() !== original.title) updateBoardInput.title = values.title.trim();
    if (values.contents !== original.contents) updateBoardInput.contents = values.contents;
    if (images.join() !== initialImages.join()) updateBoardInput.images = images;

    if (Object.keys(updateBoardInput).length === 0) {
      setSubmitError("수정한 내용이 없어요.");
      return;
    }

    try {
      await updateBoard({
        variables: { boardId: original._id, password: values.password, updateBoardInput },
      });
      setValues((prev) => ({ ...prev, password: "" })); // 비밀번호는 화면에 남겨두지 않음
      router.push(`/boards/${original._id}`);
    } catch (error) {
      const message = getErrorMessage(error, "글을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
      if (message.includes("비밀번호")) {
        setErrors((prev) => ({ ...prev, password: message }));
      } else {
        setSubmitError(message);
      }
    }
  };

  // ---------- 취소 ----------
  const onClickCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    router.push(listPath);
  };

  const onConfirmCancel = () => {
    setIsCancelModalOpen(false);
    resetForm();
    router.push(listPath);
  };

  return {
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
    onCloseCancelModal: () => setIsCancelModalOpen(false),
  };
}
