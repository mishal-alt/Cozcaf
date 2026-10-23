/** The COZCAF opening page: one film that travels round four tables (Coffee, Cold Drinks, Snacks & Sides, Mains) in a loop, behind the
 *  lettering that docks into the header. The category chip follows the film. Loaded as its own chunk after the first paint. */
import { hero } from '../data/copy';
import { reduced } from './env';
import { initPage } from './page';

const COUNT = hero.scenes.length, DISH = hero.film.dish, MOVE = hero.film.move, LOOP = COUNT * (DISH + MOVE);
/** the film starts this long after load: the poster is its first frame, so the hand-over is seamless and the page paints first */
const START_DELAY = 600;
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
/** reduced motion or Data Saver: the film never downloads; its first frame stands in for it */
const still = reduced || saveData;

/** which table is in view at film time t, and how far through its turn (the label changes halfway through each camera move) */
function sceneAt(t: number): { cur: number; progress: number } {
  const span = DISH + MOVE, x = ((t % LOOP) + LOOP + MOVE / 2) % LOOP;
  const cur = Math.floor(x / span) % COUNT;
  return { cur, progress: (x - cur * span) / span };
}

const hideLoader = (): void => {
  const ld = document.getElementById('loader');
  if (ld) { ld.classList.add('out'); setTimeout(() => ld.remove(), 600); }
};

/** if anything fails the page still shows its finished text on a plain dark ground */
const fallback = (err: unknown): void => {
  console.error(err);
  document.documentElement.classList.add('hero-static');
  hideLoader();
};

export async function bootHero(): Promise<void> {
  try {
    const film = document.getElementById('film') as HTMLVideoElement, soft = document.getElementById('soft') as HTMLVideoElement;
    const page = initPage();
    const wide = (): boolean => getComputedStyle(soft).display !== 'none';
    let raf = 0, covered = false, skip = 0;
    const t0 = performance.now();
    const clock = (): number => (performance.now() - t0) / 1000 + skip;

    const tick = (): void => {
      raf = requestAnimationFrame(tick);
      page.chrome(clock());
      const s = sceneAt(film.currentTime || 0);
      page.table(s.cur, s.progress);
      if (wide() && !soft.paused && Math.abs(soft.currentTime - film.currentTime) > 0.25) soft.currentTime = film.currentTime;   // keep the soft backdrop in step
    };
    const wake = (): void => { if (!raf) raf = requestAnimationFrame(tick); };
    const sleep = (): void => { cancelAnimationFrame(raf); raf = 0; };
    const play = (): void => {
      if (still || covered || document.hidden) return;
      film.muted = true; void film.play().then(() => film.classList.add('on')).catch(() => {});
      if (wide()) { soft.muted = true; void soft.play().catch(() => {}); }
    };
    const pause = (): void => { film.pause(); soft.pause(); };

    page.scroll();
    hideLoader();
    if (still) { page.chrome(9); page.table(0, 0); }
    else {
      wake();
      const start = (): void => { setTimeout(play, START_DELAY); };   // the film starts downloading only after the page has loaded
      if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
    }

    // a dot jumps the film to the start of that table
    page.onPick((i) => { film.currentTime = i * (DISH + MOVE); soft.currentTime = film.currentTime; if (still) page.table(i, 0); else play(); });
    page.onHold((h) => { if (still) return; if (h) pause(); else play(); });
    // autoplay refused (battery saver, in-app browsers): the first touch tries again
    for (const ev of ['touchstart', 'pointerdown'] as const) addEventListener(ev, () => play(), { once: true, passive: true });

    addEventListener('scroll', () => {
      const c = page.scroll() >= 0.99;                                                  // fully covered by the page: stop drawing and playing
      if (c !== covered) { covered = c; if (c) { skip = 99; page.chrome(clock()); sleep(); pause(); } else { wake(); play(); } }
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { sleep(); pause(); } else if (!covered) { wake(); play(); } });
    let rz = 0;
    addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(() => { page.measure(); page.scroll(); if (wide()) play(); }, 120); });
  } catch (err) {
    fallback(err);
  }
}
