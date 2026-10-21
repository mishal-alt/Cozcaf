/* ======================================================================
   MAIN LOOP (pauses when the tab is hidden)
   ====================================================================== */
import { closeSheet } from '../scripts/mobile-nav';
import { $ } from './canvas';
import { advance, startIntro } from './clock';
import { FX, Q } from './config';
import { COARSE, TEST, reduced } from './env';
import { applyLayout } from './layout';
import { clamp } from './math';
import { updateDock, updatePointer } from './motion';
import { placeGlow } from './page';
import { render, sizeCanvas } from './render';
import { buildSplash } from './scatter';
import { sfx, sfxUpdate } from './sound';
import { buildSprites } from './sprites';
import { V, clock, dyn } from './state';
import { derive } from './timeline';
import { safe } from './math';

/** render cost per frame (ms), for checking smoothness; only recorded in the comparison build */
export const perf = { n: 0, sum: 0, max: 0, over: 0, big: [] as [number, number][] };

let emaDt = 0, slowN = 0;
export function frame(now: number): void {
  clock.raf = requestAnimationFrame(frame);
  const raw = (now - clock.last) / 1000, dt = clamp(raw, 0, .05); clock.last = now;
  if (clock.frozen) return;
  if (Q.adaptive && raw > 0 && raw < .5) {                  // frame rate sagging? render fewer pixels
    emaDt = emaDt ? emaDt * .95 + raw * .05 : raw; slowN = emaDt > 1 / 24 ? slowN + 1 : 0;
    if (slowN > 50 && V.dpr > 1.01) { dyn.dprCap = Math.max(1, V.dpr - .25); sizeCanvas(); slowN = 0; emaDt = 0; }
  }
  advance(dt); updatePointer(dt); updateDock();
  if (dyn.dockE > .995) {                                   // scrolled past the hero: draw the docked cup once, then stop the loop
    if (dyn.docked) { cancelAnimationFrame(clock.raf); clock.raf = 0; return; }
    dyn.docked = true;
  } else dyn.docked = false;
  if (TEST) {
    const r0 = performance.now(); render(clock.tl); const rt = performance.now() - r0;
    perf.n++; perf.sum += rt; if (rt > perf.max) perf.max = rt; if (rt > 16.7) perf.over++; if (rt > 5) perf.big.push([+clock.tl.toFixed(2), +rt.toFixed(1)]);
  } else render(clock.tl);
  sfxUpdate();
}

export function wake(): void {
  if (!clock.raf && !clock.frozen && !reduced && !document.hidden) { clock.last = performance.now(); clock.raf = requestAnimationFrame(frame); }
}

/** re-read CONFIG (so values tweaked in the console take effect on the next replay) */
function applyConfig(): void { $('grain').style.opacity = String(FX.grain); derive(); buildSplash(); placeGlow(); }

export function replay(): void {
  applyConfig();
  const h = document.documentElement.style; h.scrollBehavior = 'auto'; window.scrollTo(0, 0); h.scrollBehavior = '';
  closeSheet(false); startIntro('full');
  if (!clock.raf && !document.hidden) { clock.frozen = false; clock.last = performance.now(); clock.raf = requestAnimationFrame(frame); } else clock.frozen = false;
}

export function relayout(force?: boolean): void {
  if (!force && COARSE && Math.abs(innerWidth - V.vw) < 2 && Math.abs(innerHeight - V.vh) < 130) return;   // phone address bar sliding away
  applyLayout(); sizeCanvas(); buildSprites(); buildSplash(); placeGlow();
  if (clock.frozen || clock.phase === 'idle') render(clock.tl); else { dyn.docked = false; wake(); }
}

let rz = 0;
export function initLoop(): void {
  addEventListener('scroll', () => { if (reduced) updateDock(true); else wake(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(clock.raf); clock.raf = 0; if (sfx.ctx) safe(() => (sfx.ctx as AudioContext).suspend()); }   // tab hidden: the canvas stops
    else { if (sfx.ctx && sfx.on) safe(() => (sfx.ctx as AudioContext).resume()); wake(); }
  });
  addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(() => relayout(), 120); });
}

