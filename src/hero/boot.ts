/* ======================================================================
   BOOT: wait for fonts + images, pre-compute the morph, hand off from the loader
   ====================================================================== */
import { loadImages } from './assets';
import { $, resetView, ctx } from './canvas';
import { startIntro, updateUi } from './clock';
import { CONFIG, T } from './config';
import { reduced, TEST } from './env';
import { initInput, setProd } from './input';
import { applyLayout, resetBigMetrics } from './layout';
import { frame, initLoop, perf, relayout } from './loop';
import { tick } from './math';
import { updateDock } from './motion';
import { bindEls, makeGrain, placeGlow, setupWords } from './page';
import { render, sizeCanvas } from './render';
import { buildSplash } from './scatter';
import { initSound } from './sound';
import { buildSpritesAsync } from './sprites';
import { buildMorphFrames } from './morph';
import { warmAsync } from './steam';
import { clock, dyn, V } from './state';
import { safe } from './math';

/** the fonts are self-hosted and preloaded, so this only waits for them to decode (never longer than CONFIG.fontTimeout) */
function waitFonts(): Promise<unknown> {
  const work = (async () => {
    if (!document.fonts) return;
    await Promise.all([
      document.fonts.load('800 40px "Barlow Condensed"', 'COZCAF'), document.fonts.load('700 20px "Barlow Condensed"', 'COZCAF'),
      document.fonts.load('400 14px "Plus Jakarta Sans"', 'Aa'), document.fonts.load('500 14px "Plus Jakarta Sans"', 'Aa'),
      document.fonts.load('600 14px "Plus Jakarta Sans"', 'Aa'), document.fonts.load('700 14px "Plus Jakarta Sans"', 'Aa'),
    ]);
    await document.fonts.ready;
  })().catch(() => {});
  return Promise.race([work, new Promise((res) => setTimeout(res, CONFIG.fontTimeout))]);
}

/** a first visit in the session plays the full intro; a return visit plays CONFIG.returnVisit; reduced motion skips straight to the end */
function pickMode(): 'full' | 'short' | 'instant' {
  if (reduced) return 'instant';
  let seen = false;
  safe(() => { seen = sessionStorage.getItem(CONFIG.sessionKey) === '1'; sessionStorage.setItem(CONFIG.sessionKey, '1'); });
  return seen ? CONFIG.returnVisit : 'full';
}

const hideLoader = (): void => {
  const ld = document.getElementById('loader');
  if (ld) { ld.classList.add('out'); setTimeout(() => ld.remove(), 600); }
};

async function boot(): Promise<void> {
  initLoop(); initInput(); initSound();
  setProd(CONFIG.production);
  bindEls(); setupWords(); makeGrain();
  await Promise.all([waitFonts(), loadImages()]);
  await tick(); resetBigMetrics(); applyLayout(); sizeCanvas(); $('ui').hidden = false; updateDock(true); await tick();   // the intro controls appear once the layout is known (a new box, so nothing shifts)
  await buildSpritesAsync();
  await new Promise<void>((r) => buildMorphFrames(r));       // done behind the loader, in small slices
  await tick(); buildSplash(); placeGlow(); await tick(); await warmAsync();
  startIntro(pickMode());
  clock.last = performance.now();
  render(clock.tl);
  if (reduced && clock.phase === 'live') clock.frozen = true;   // reduced motion: one calm frame, no loop at all
  else clock.raf = requestAnimationFrame(frame);
  hideLoader();
  let bsH = $('bstack').offsetHeight;
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { const h = $('bstack').offsetHeight; if (h !== bsH) { bsH = h; resetBigMetrics(); relayout(true); } });
}

export async function bootHero(): Promise<void> {
  if (TEST) installTestHandles();
  try {
    await boot();
  } catch (err) {
    console.error(err);
    hideLoader();
  }
}

/** handles for the frame-for-frame comparison against the approved prototype (PUBLIC_HERO_TEST=1 builds only) */
function installTestHandles(): void {
  const seek = (t: number, dock?: number): void => {
    clock.frozen = true; cancelAnimationFrame(clock.raf); clock.raf = 0; clock.tl = t; clock.phase = t >= T.end ? 'live' : 'intro'; clock.mode = 'full'; dyn.dockE = dock || 0; updateUi(); render(t);
  };
  Object.assign(window, {
    __seek: seek,
    COZ: { perf, CONFIG, seek, layout: () => ({ ...V }), state: () => ({ phase: clock.phase, tl: clock.tl, mode: clock.mode, dockE: dyn.dockE, docked: dyn.docked, running: !!clock.raf }), resetView, ctx },
  });
}
