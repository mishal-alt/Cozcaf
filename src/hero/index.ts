/** The COZCAF opening page: a warm still-life drawn live on a canvas, with the lettering that docks into the header. Loaded as its own chunk after the first paint. */
import chickenUrl from '../assets/hero/chicken.webp?url';
import coffeeUrl from '../assets/hero/coffee.webp?url';
import friesUrl from '../assets/hero/fries.webp?url';
import pastaUrl from '../assets/hero/pasta.webp?url';
import plateUrl from '../assets/hero/plate.webp?url';
import { COARSE, LOW_END, TALL, reduced } from './env';
import { initPage } from './page';
import { T_REST, createScene } from './scene';
import { prog, smooth } from './math';
import type { Images } from './scene';

/** the arrival (dishes landing, heading revealed) plays this much faster than the design clock, easing back to normal speed between INTRO_EASE_FROM and INTRO_EASE_TO
 *  (a sudden change of speed shows up as a jerk in everything that is still moving) */
const INTRO_SPEED = 1.3, INTRO_EASE_FROM = 3.2, INTRO_EASE_TO = 6;

const load = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => { (i.decode ? i.decode() : Promise.resolve()).catch(() => {}).then(() => res(i)); };   // decoded off the main thread, so the first draw does not stall
    i.onerror = () => rej(new Error(`COZCAF hero: could not load ${src}`));
    i.src = src;
  });

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
    const [plate, chicken, pasta, fries, coffee] = await Promise.all([plateUrl, chickenUrl, pastaUrl, friesUrl, coffeeUrl].map(load));
    const imgs = { plate, chicken, pasta, fries, coffee } as Images;
    const cv = document.getElementById('fx') as HTMLCanvasElement;
    const scene = await createScene(cv, imgs, () => TALL.matches);
    const page = initPage();

    let t = reduced ? T_REST : 0, last = 0, raf = 0, slow = 0, acc = 0;
    const draw = (): void => { page.chrome(t, scene.render(t)); };

    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      acc += dt;
      if (LOW_END && acc < 1 / 32) return;                                         // a modest phone draws about 30 frames a second: the motion is slow, and the battery lasts
      t += acc * (1 + (INTRO_SPEED - 1) * (1 - smooth(prog(t, INTRO_EASE_FROM, INTRO_EASE_TO)))); acc = 0;                        // the arrival plays quicker; the ambient motion keeps its calm pace
      const a = performance.now();
      draw();
      slow = performance.now() - a > 22 ? slow + 1 : Math.max(0, slow - 1);      // a sagging frame rate: draw fewer pixels
      if (slow > 45 && scene.cheaper()) slow = 0;
    };
    const wake = (): void => { if (!raf && !reduced && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
    const sleep = (): void => { cancelAnimationFrame(raf); raf = 0; };
    const onScroll = (): void => {
      const sp = page.scroll();
      if (sp >= 0.99) sleep(); else wake();                                       // fully covered by the page: stop drawing
    };

    page.scroll();
    draw();
    hideLoader();
    if (reduced) { /* one calm finished frame, no loop */ } else wake();

    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) sleep(); else if (page.scroll() < 0.99) wake(); });
    let rz = 0, w0 = innerWidth, h0 = innerHeight;
    addEventListener('resize', () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (COARSE && Math.abs(innerWidth - w0) < 2 && Math.abs(innerHeight - h0) < 130) return;   // a phone's address bar sliding away
        w0 = innerWidth; h0 = innerHeight;
        void scene.resize().then(() => { page.measure(); page.scroll(); draw(); });
      }, 120);
    });
  } catch (err) {
    fallback(err);
  }
}
