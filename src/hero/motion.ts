/* ---------- pointer, tilt, idle float, and the first-scroll dock ---------- */
import { cv, stage } from './canvas';
import { FX } from './config';
import { COARSE, reduced } from './env';
import { clamp } from './math';
import { el } from './page';
import { ptr } from './pose';
import { V, clock, dyn } from './state';
import type { Cached } from './types';

export const mouse = { tx: 0, ty: 0 };
export const tilt = { x: 0, y: 0, on: false };

export function updatePointer(dt: number): void {
  let tx: number, ty: number;
  if (COARSE) {
    if (tilt.on) { tx = tilt.x; ty = tilt.y; }
    else { tx = Math.sin(clock.tl * .55) * .8 + Math.sin(clock.tl * .23 + 1) * .2; ty = Math.cos(clock.tl * .43) * .7; }   // slow idle float
  } else { tx = mouse.tx; ty = mouse.ty; }
  const k = 1 - Math.pow(.945, dt * 60);
  ptr.x += (tx - ptr.x) * k; ptr.y += (ty - ptr.y) * k;
}

/** first scroll: the cup shrinks into the header while the page slides up */
export function updateDock(snap?: boolean): void {
  const sp = clamp(window.scrollY / (V.vh * FX.dockRange));
  if (snap) dyn.spS = sp; else { dyn.spS += (sp - dyn.spS) * .3; if (Math.abs(sp - dyn.spS) < .002) dyn.spS = sp; }
  dyn.dockE = (clock.phase === 'live' && !reduced) ? dyn.spS : 0;               // reduced motion: the cup never travels, the hero simply fades
  const spS = dyn.spS, st = stage as Cached;
  const o = (1 - clamp((spS - .15) / .6)).toFixed(3);
  if (st._o !== o) { st._o = o; st.style.opacity = o; el.marq.style.opacity = o; if (reduced) cv.style.opacity = o; }
  const hb = clamp((spS - .5) / .35).toFixed(3); if (el.hdrBg._o !== hb) { el.hdrBg._o = hb; el.hdrBg.style.opacity = hb; }
  const dk = dyn.dockE.toFixed(3); if (el.dock._o !== dk) { el.dock._o = dk; el.dock.style.setProperty('--dk', dk); }
  const uo = (1 - clamp(spS * 4)).toFixed(2); if (el.ui._o !== uo) { el.ui._o = uo; el.ui.style.opacity = uo; el.ui.style.visibility = +uo > .02 ? 'visible' : 'hidden'; }
}
