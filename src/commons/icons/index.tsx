import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** TALKR 로고 (말풍선 두 개) */
export function LogoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 21 18" fill="currentColor" aria-hidden="true" {...props}>
      <defs>
        <mask id="talkr-logo-gap" maskUnits="userSpaceOnUse">
          <rect width="21" height="18" fill="#fff" />
          <circle cx="6.4" cy="12" r="7.1" fill="#000" />
          <path d="M1.9 14.6 L-0.4 18.6 L5.2 17.3 Z" fill="#000" />
        </mask>
      </defs>
      {/* 뒤쪽 말풍선 */}
      <g mask="url(#talkr-logo-gap)">
        <circle cx="12.7" cy="7.3" r="7.2" />
        <path d="M16.4 12.9 L20.1 15.9 Q20.6 16.4 19.9 16.4 L13.9 14.2 Z" />
      </g>
      {/* 앞쪽 말풍선 */}
      <circle cx="6.4" cy="12" r="5.8" />
      <path d="M2.4 15 L0.7 17.4 Q0.4 17.9 1 17.8 L5 16.9 Z" />
    </svg>
  );
}

/** 전체 글 보기 (목록) */
export function ListIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 15 12.5" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="0" y="0" width="2.4" height="2.4" rx="0.6" />
      <rect x="3.8" y="0" width="11.2" height="2.4" rx="0.6" />
      <rect x="0" y="5.05" width="2.4" height="2.4" rx="0.6" />
      <rect x="3.8" y="5.05" width="11.2" height="2.4" rx="0.6" />
      <rect x="0" y="10.1" width="2.4" height="2.4" rx="0.6" />
      <rect x="3.8" y="10.1" width="11.2" height="2.4" rx="0.6" />
    </svg>
  );
}

/** 새 글 작성 (말풍선 + 더하기) */
export function AddCommentIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3.4a8.6 8.6 0 1 1-3.6 16.4l-5 1.4 1.3-4.9A8.6 8.6 0 0 1 12 3.4Z" />
      <path d="M12 8.6v6.8M8.6 12h6.8" />
    </svg>
  );
}

/** 작성자 프로필 */
export function ProfileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20Z" />
    </svg>
  );
}

/** 이미지 추가 (원 + 더하기) */
export function PlusCircleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.8v8.4M7.8 12h8.4" />
    </svg>
  );
}

/** 닫기 / 삭제 (X) */
export function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}
