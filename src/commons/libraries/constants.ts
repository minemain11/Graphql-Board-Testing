/** 서버(fetchBoards)가 한 번에 내려주는 게시글 수 */
export const BOARDS_PER_PAGE = 10;

/** 게시글 하나에 올릴 수 있는 이미지 수 */
export const MAX_IMAGES = 3;

/** 내용 최대 글자 수 (서버와 같은 값) */
export const MAX_CONTENTS_LENGTH = 3000;

/**
 * 이미지 최대 용량 (4MB)
 * Vercel 같은 배포 환경은 요청 본문을 약 4.5MB까지만 받아서 여유 있게 4MB로 제한했습니다.
 */
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
