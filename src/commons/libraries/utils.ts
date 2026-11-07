import { CombinedGraphQLErrors } from "@apollo/client/errors";

const pad = (value: number) => String(value).padStart(2, "0");

/** "2022-03-28T04:00:00.000Z" → "2022.03.28. 13:00" (사용자 기기의 시간대 기준) */
export function formatDate(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}.${mm}.${dd}. ${hh}:${min}`;
}

/** Apollo 에러에서 화면에 보여줄 메시지를 꺼냅니다. */
export function getErrorMessage(error: unknown, fallback: string) {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? fallback;
  }
  return fallback;
}
