"use client";

/* 배너(캐러셀)에 들어가는 3D 느낌의 일러스트 (SVG로 직접 그림) */
import { useId } from "react";

/**
 * SVG 그라데이션 id가 페이지 안에서 겹치지 않도록 컴포넌트마다 고유 id를 만듭니다.
 * (목록·상세 페이지에 배너가 동시에 존재할 수 있기 때문)
 */
function useSvgId() {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${raw}-${name}`;
}

export function RocketIllustration() {
  const u = useSvgId();
  return (
    <svg viewBox="0 0 64 100" aria-hidden="true" width="40" height="62">
      <defs>
        <linearGradient id={u("rk-body")} x1="0" x2="1">
          <stop offset="0" stopColor="#ece7f6" />
          <stop offset="0.28" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f8f6fc" />
          <stop offset="1" stopColor="#c9bfdc" />
        </linearGradient>
        <linearGradient id={u("rk-nose")} x1="0" x2="1">
          <stop offset="0" stopColor="#f39bff" />
          <stop offset="0.5" stopColor="#d43df0" />
          <stop offset="1" stopColor="#a11bd6" />
        </linearGradient>
        <radialGradient id={u("rk-window")} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#f8b8ff" />
          <stop offset="0.55" stopColor="#d23cf0" />
          <stop offset="1" stopColor="#9312c4" />
        </radialGradient>
        <linearGradient id={u("rk-fin")} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6cee6" />
        </linearGradient>
        <linearGradient id={u("rk-flame")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f15cff" />
          <stop offset="0.7" stopColor="#c21ee6" />
          <stop offset="1" stopColor="#c21ee6" stopOpacity="0" />
        </linearGradient>
        <filter id={u("rk-blur")} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id={u("rk-clip")}>
          <path d="M32 4C44 14 48 34 46 58c-.4 5-1 9-1.8 12H19.8c-.8-3-1.4-7-1.8-12C16 34 20 14 32 4Z" />
        </clipPath>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="44" cy="95" rx="18" ry="2.4" fill="#3b0a8c" opacity="0.22" filter={`url(#${u("rk-blur")})`} />
      {/* 불꽃 */}
      <path d="M28.6 72c0 7 1.8 13 3.4 19.5 1.6-6.5 3.4-12.5 3.4-19.5Z" fill={`url(#${u("rk-flame")})`} />
      {/* 날개 */}
      <path d="M19.8 49C12 55 8 64 8.6 77.5c.2 2 1.9 2.3 2.9.6 2-4.3 4.9-6.9 8.6-8.3Z" fill={`url(#${u("rk-fin")})`} />
      <path d="M44.2 49c7.8 6 11.8 15 11.2 28.5-.2 2-1.9 2.3-2.9.6-2-4.3-4.9-6.9-8.6-8.3Z" fill="#d9d1e8" />
      {/* 몸통 */}
      <path d="M32 4C44 14 48 34 46 58c-.4 5-1 9-1.8 12H19.8c-.8-3-1.4-7-1.8-12C16 34 20 14 32 4Z" fill={`url(#${u("rk-body")})`} />
      {/* 코(머리) */}
      <g clipPath={`url(#${u("rk-clip")})`}>
        <path d="M10 0h44v17.6Q32 21.6 10 17.6Z" fill={`url(#${u("rk-nose")})`} />
        <path d="M10 17.6Q32 21.6 54 17.6" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.8" />
      </g>
      {/* 창문 */}
      <circle cx="28.8" cy="35" r="8.2" fill="#ece7f5" />
      <circle cx="28.8" cy="35" r="6" fill={`url(#${u("rk-window")})`} />
      <ellipse cx="26.6" cy="32.6" rx="2" ry="1.3" fill="#ffffff" opacity="0.75" />
      {/* 가운데 날개 */}
      <path d="M30.6 57h3.2l.6 22.5c0 1.8-4.4 1.8-4.4 0Z" fill="#efebf6" />
      {/* 분사구 */}
      <rect x="24.5" y="68.8" width="15" height="4.4" rx="1.6" fill="#d8d0e6" />
    </svg>
  );
}

export function ChatIllustration() {
  const u = useSvgId();
  return (
    <svg viewBox="0 0 80 72" aria-hidden="true" width="62" height="56">
      <defs>
        <linearGradient id={u("ct-back")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f39bff" />
          <stop offset="1" stopColor="#a11bd6" />
        </linearGradient>
        <linearGradient id={u("ct-front")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f6f3fb" />
          <stop offset="1" stopColor="#cfc5e2" />
        </linearGradient>
        <filter id={u("ct-blur")} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <ellipse cx="46" cy="68" rx="24" ry="2.4" fill="#3b0a8c" opacity="0.22" filter={`url(#${u("ct-blur")})`} />
      {/* 뒤 말풍선 */}
      <path d="M44 4h22a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10h-2l2 8-10-8H44a10 10 0 0 1-10-10V14A10 10 0 0 1 44 4Z" fill={`url(#${u("ct-back")})`} />
      {/* 앞 말풍선 */}
      <path d="M14 20h32a11 11 0 0 1 11 11v14a11 11 0 0 1-11 11H24l-12 9 3-9.4A11 11 0 0 1 3 45V31a11 11 0 0 1 11-11Z" fill={`url(#${u("ct-front")})`} />
      <circle cx="19" cy="38" r="3.2" fill="#c42fe8" />
      <circle cx="30" cy="38" r="3.2" fill="#c42fe8" />
      <circle cx="41" cy="38" r="3.2" fill="#c42fe8" />
    </svg>
  );
}

export function PlaneIllustration() {
  const u = useSvgId();
  return (
    <svg viewBox="0 0 84 70" aria-hidden="true" width="64" height="54">
      <defs>
        <linearGradient id={u("pl-top")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ece6f6" />
        </linearGradient>
        <linearGradient id={u("pl-trail")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#f15cff" />
          <stop offset="1" stopColor="#f15cff" stopOpacity="0" />
        </linearGradient>
        <filter id={u("pl-blur")} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <ellipse cx="48" cy="66" rx="22" ry="2.2" fill="#3b0a8c" opacity="0.2" filter={`url(#${u("pl-blur")})`} />
      {/* 꼬리 */}
      <path d="M4 52c10-1 18-5 24-11" fill="none" stroke={`url(#${u("pl-trail")})`} strokeWidth="3" strokeLinecap="round" />
      {/* 종이비행기 */}
      <path d="M80 6 26 30l16 7Z" fill={`url(#${u("pl-top")})`} />
      <path d="M80 6 42 37l4 20Z" fill="#d9d0ea" />
      <path d="M80 6 46 57l12-10 12 7Z" fill="#ffffff" />
      <path d="M42 37l4 20 3-13Z" fill="#b7a8d3" />
    </svg>
  );
}
