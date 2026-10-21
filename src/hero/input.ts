/* ======================================================================
   BUTTONS, KEYS, POINTER
   ====================================================================== */
import { $ } from './canvas';
import { skip } from './clock';
import { reduced } from './env';
import { clamp, safe } from './math';
import { replay } from './loop';
import { mouse, tilt } from './motion';
import { taps } from './pose';
import { sfx, thunk } from './sound';
import { V, clock, dyn } from './state';

const toastEl = $('toast');
let toastT = 0;
function toast(msg: string): void {
  toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT);
  toastT = window.setTimeout(() => toastEl.classList.remove('on'), 1800);
}

/** production mode: Replay is hidden. P toggles it for pitching. */
export function setProd(on: boolean): void { document.body.classList.toggle('prod', on); }

/** tap the cup: a fresh puff of steam and a tiny bounce */
function onTap(e: PointerEvent): void {
  const p = dyn.lastPose;
  if (!p || dyn.dockE > .05 || clock.phase !== 'live' || reduced) return;
  const sx = (e.clientX - V.ox) / V.s, sy = (e.clientY - V.oy) / V.s;
  const dx = (sx - p.x) / (V.DRAW_W * .5 * p.sx), dy = (sy - p.y) / (V.DRAW_H * .5 * p.sy);
  if (dx * dx + dy * dy > 1) return;
  taps.push(clock.tl); if (taps.length > 6) taps.shift();
  const DOE = (window as Window & { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (typeof DOE !== 'undefined' && typeof DOE.requestPermission === 'function' && !tilt.on) safe(() => (DOE.requestPermission as () => Promise<string>)().catch(() => {}));
  if (sfx.on && sfx.ctx) thunk(.35, 320);
}

export function initInput(): void {
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.tx = clamp((e.clientX - V.vw / 2) / (V.vw / 2), -1, 1); mouse.ty = clamp((e.clientY - V.vh / 2) / (V.vh / 2), -1, 1);
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    tilt.x = clamp(e.gamma / 28, -1, 1); tilt.y = clamp((e.beta - 50) / 28, -1, 1); tilt.on = true;
  }, { passive: true });

  $('replay').addEventListener('click', (e) => { e.stopPropagation(); replay(); });
  addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('#ui')) return;
    if (clock.phase === 'intro') { skip(); return; }
    onTap(e);
  });
  (['wheel', 'touchmove'] as const).forEach((n) => addEventListener(n, () => { if (clock.phase === 'intro' && clock.real > .6) skip(); }, { passive: true }));
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key;
    if (k === 'Escape') { if (!e.defaultPrevented) skip(); }   // an open menu sheet or lightbox has already used this Esc
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'p' || k === 'P') { const on = !document.body.classList.contains('prod'); setProd(on); toast(on ? 'Production mode on' : 'Pitch mode on - Replay is visible. Press P to go back'); }
    else if (clock.phase === 'intro' && (k === ' ' || k === 'ArrowDown' || k === 'PageDown')) skip();
  });
}
