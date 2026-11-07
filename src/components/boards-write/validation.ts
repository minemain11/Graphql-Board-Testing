import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/commons/libraries/constants";

export interface FormValues {
  writer: string;
  password: string;
  title: string;
  contents: string;
}

export type FormErrors = Partial<Record<keyof FormValues, string>>;

const REQUIRED_MESSAGES: Record<keyof FormValues, string> = {
  writer: "작성자를 입력해 주세요.",
  password: "비밀번호를 입력해 주세요.",
  title: "제목을 입력해 주세요.",
  contents: "내용을 입력해 주세요.",
};

/** 비어 있는 필수 항목마다 에러 메시지를 만들어 돌려줍니다. */
export function validateForm(values: FormValues, isEdit: boolean): FormErrors {
  // 화면 위쪽 칸부터 순서대로 검사합니다. (수정할 때는 작성자를 바꿀 수 없으므로 제외)
  const requiredFields: (keyof FormValues)[] = isEdit
    ? ["title", "contents", "password"]
    : ["title", "contents", "writer", "password"];

  const errors: FormErrors = {};
  for (const field of requiredFields) {
    if (values[field].trim() === "") errors[field] = REQUIRED_MESSAGES[field];
  }
  return errors;
}

/** 이미지 파일의 형식과 용량을 확인합니다. 문제가 없으면 빈 문자열을 돌려줍니다. */
export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "JPG, PNG, WEBP, GIF 이미지만 올릴 수 있어요.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "이미지는 4MB 이하만 올릴 수 있어요.";
  }
  return "";
}
