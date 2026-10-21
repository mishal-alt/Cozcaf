/* ======================================================================
   PAGE ELEMENTS: the header, big lettering, copy, buttons, badge and glow the hero drives
   ====================================================================== */
import { $ } from './canvas';
import { FX, T } from './config';
import { reduced } from './env';
import { clamp, easeOutBack, easeOutCubic, easeOutExpo, lerp, prog, rng } from './math';
import { V, dyn } from './state';
import { levelAt } from './timeline';
import type { Cached } from './types';

interface Els {
  logo: Cached;
  nav: Cached;
  hr: Cached;
  kicker: Cached;
  coz: Cached;
  caf: Cached;
  badge: Cached;
  bsvg: Cached;
  bl: Cached[];
  br: Cached;
  trust: Cached;
  btnM: Cached;
  btnV: Cached;
  marq: Cached;
  glow: Cached;
  hdrBg: Cached;
  ui: Cached;
  dock: Cached;
  words: Cached[];
}

export const el = {} as Els;

export function bindEls(): void {
  const c = (id: string): Cached => $(id);
  Object.assign(el, {
    logo: c('logoLink'), nav: c('nav'), hr: c('hr'), kicker: c('kicker'), coz: c('coz'), caf: c('caf'), badge: c('badge'), bsvg: c('bsvg'),
    bl: [c('bl1'), c('bl2'), c('bl3')], br: c('br'), trust: c('trust'), btnM: c('ctaMenu'), btnV: c('ctaVisit'),
    marq: c('marq'), glow: c('glow'), hdrBg: c('hdrBg'), ui: c('ui'), dock: c('dock'), words: [],
  });
}

/** the kicker stays real text; each word gets its own span to reveal */
export function setupWords(): void {
  const k = el.kicker, words = (k.textContent ?? '').trim().split(/\s+/);
  k.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span') as Cached; s.className = 'w'; s.textContent = w; k.appendChild(s); el.words.push(s);
    if (i < words.length - 1) k.appendChild(document.createTextNode(' '));
  });
}

/** a small noise tile, laid over the page at FX.grain opacity */
export function makeGrain(): void {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const g = c.getContext('2d') as CanvasRenderingContext2D, id = g.createImageData(160, 160), r = rng(77);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  const gr = $('grain'); gr.style.backgroundImage = `url(${c.toDataURL('image/png')})`; gr.style.opacity = String(FX.grain);
}

export function placeGlow(): void {
  const d = V.DRAW_H * 1.9, g = el.glow.style;
  g.left = (V.cup.x - d / 2) + 'px'; g.top = (V.cup.y - d / 2) + 'px'; g.width = d + 'px'; g.height = d + 'px';
}

/* write opacity / transform / visibility only when they change */
function put(e: Cached, o: number, x = 0, y = 0, sc = 1): void {
  const op = o.toFixed(3); if (e._o !== op) { e.style.opacity = op; e._o = op; }
  const tf = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${sc.toFixed(4)})`; if (e._t !== tf) { e.style.transform = tf; e._t = tf; }
  const v = o > .02 ? 'visible' : 'hidden'; if (e._v !== v) { e.style.visibility = v; e._v = v; }
}
function putWord(e: Cached, q: number): void {
  const op = q.toFixed(3); if (e._o === op) return; e._o = op;
  e.style.opacity = op; e.style.transform = `translateY(${(8 * (1 - q)).toFixed(2)}px)`;
}

let badgeAngle = 0;
export function arrive(t: number, par: { x: number; y: number }): void {
  const s = V.s;
  let p = easeOutCubic(prog(t, T.header));
  put(el.logo, p, -24 * (1 - p), 0);
  put(el.nav, p, 0, -8 * (1 - p));
  put(el.hr, p, 24 * (1 - p), 0);
  // the kicker reveals word by word once the lid has seated
  el.words.forEach((w, i) => putWord(w, easeOutCubic(prog(t, [T.kicker[0] + i * T.kickerStagger, T.kicker[1] + i * T.kickerStagger]))));
  // big lettering slides in from the sides and drifts opposite to the cup (parallax)
  p = easeOutExpo(prog(t, T.coz)); put(el.coz, p, -170 * (1 - p) + par.x, par.y);
  p = easeOutExpo(prog(t, T.caf)); put(el.caf, p, 170 * (1 - p) + par.x, par.y);
  // the rotating badge: pops in, speeds up once after the lid seats, then calms
  const bp = prog(t, T.badge);
  put(el.badge, clamp(bp * 2), 0, 0, lerp(.55, 1, easeOutBack(bp, 1.2)));
  const w0 = 360 / FX.badgeSpinSeconds, b0 = T.badgeBoost[0], bd = T.badgeBoost[1] - b0, u = clamp((t - b0) / bd);
  const extra = w0 * FX.badgeBoost * (u * bd / 2 - bd / (4 * Math.PI) * Math.sin(2 * Math.PI * u));
  badgeAngle = reduced ? 0 : w0 * t + extra;
  const ba = `rotate(${badgeAngle.toFixed(2)}deg)`; if (el.bsvg._t !== ba) { el.bsvg.style.transform = ba; el.bsvg._t = ba; }
  el.bl.forEach((e, i) => { const q = easeOutCubic(prog(t, [T.textL[0] + i * .08, T.textL[1] + i * .08])); put(e, q, 0, 18 * (1 - q)); });
  p = easeOutCubic(prog(t, T.textM)); put(el.trust, p, 0, 12 * (1 - p));
  p = easeOutCubic(prog(t, T.textR)); put(el.br, p, 0, 16 * (1 - p));
  // conversion layer: right after the lid presses on
  p = easeOutCubic(prog(t, T.cta)); put(el.btnM, p, 0, 14 * (1 - p));
  p = easeOutCubic(prog(t, [T.cta[0] + .1, T.cta[1] + .1])); put(el.btnV, p, 0, 14 * (1 - p));
  p = easeOutCubic(prog(t, T.marquee)); put(el.marq, 1, 0, 46 * s * (1 - p));
  // warm light behind the cup, growing as the coffee fills
  const lv = levelAt(t), gp = easeOutCubic(prog(t, T.cupEnter));
  put(el.glow, gp * (FX.glowMin + (FX.glowMax - FX.glowMin) * lv) * (1 - dyn.dockE), 0, 0, 1 + FX.glowGrow * lv);
}
