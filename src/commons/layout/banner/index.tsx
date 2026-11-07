"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  ChatIllustration,
  PlaneIllustration,
  RocketIllustration,
} from "./illustrations";
import styles from "./styles.module.css";

const SLIDES = [
  { title: "Carousel", Illustration: RocketIllustration },
  { title: "Talk Together", Illustration: ChatIllustration },
  { title: "Share Ideas", Illustration: PlaneIllustration },
];

const AUTOPLAY_DELAY = 4000; // 4초마다 다음 슬라이드
const SWIPE_THRESHOLD = 40; // 40px 이상 밀면 슬라이드 이동

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  const goTo = (index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  };

  // 자동 재생: 마우스를 올리거나 포커스가 있으면 멈추고, '동작 줄이기' 설정 사용자는 재생하지 않음
  // (current가 바뀔 때마다 타이머를 새로 시작해서, 직접 넘긴 직후 바로 넘어가지 않게 함)
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isPaused || reduceMotion) return;

    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [current, isPaused]);

  // 터치·드래그로 넘기기
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    goTo(distance < 0 ? current + 1 : current - 1);
  };

  return (
    <section
      className={styles.banner}
      aria-roledescription="carousel"
      aria-label="TALKR 소개 배너"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointerStartX.current = null)}
      >
        <ul
          className={styles.track}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map(({ title, Illustration }, index) => (
            <li
              key={title}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${SLIDES.length}`}
              aria-hidden={index !== current}
            >
              <p className={styles.title}>{title}</p>
              <div className={styles.illustration}>
                <Illustration />
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.dots}>
          {SLIDES.map(({ title }, index) => (
            <button
              key={title}
              type="button"
              className={styles.dot}
              aria-label={`${index + 1}번째 슬라이드 보기`}
              aria-current={index === current}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
