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
    { rootMargin: '200px 0px', threshold: 0.15 },
  );
  clips.forEach((v) => io.observe(v));
}
