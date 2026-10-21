import { qa } from './dom';

/**
 * Silent looping clips play only while they are on screen. Nothing downloads until the first one scrolls near,
 * and with reduced motion or Data Saver on they stay on their poster photo.
 */
export function initClips(): void {
  const clips = qa<HTMLVideoElement>('video[data-clip]');
  if (!clips.length) return;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    },
    { rootMargin: '500px 0px', threshold: 0.05 },
  );
  clips.forEach((v) => io.observe(v));
  // autoplay refused (battery saver, some in-app browsers): the poster stays, and the first touch or scroll tries again
  const retry = (): void => clips.forEach((v) => { if (v.paused && v.getBoundingClientRect().top < innerHeight && v.getBoundingClientRect().bottom > 0) v.play().catch(() => {}); });
  for (const ev of ['touchstart', 'pointerdown', 'scroll'] as const) addEventListener(ev, retry, { once: true, passive: true });
}
