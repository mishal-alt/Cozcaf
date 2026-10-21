import { ctx } from './canvas';
import { HOLE_IMG, RIM } from './constants';
import { FX, T } from './config';
import { beanSource } from './bean';
import { clamp, prog, rng, smooth, tick } from './math';
import { taps } from './pose';
import { D, V, dyn } from './state';
import { toWorld } from './timeline';
import type { Pose } from './types';

/* ---------- steam: from the open cup, then from the lid's sip hole, plus a puff when the cup is tapped ---------- */
let wisps: HTMLCanvasElement[] | null = null;
function makeWisp(seed: number): HTMLCanvasElement {                                    // one soft curling ribbon of steam, painted once
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D, r = rng(seed * 13 + 3);
  for (let i = 0; i < 90; i++) {
    const q = i / 89, y = 248 - q * 238, x = 64 + Math.sin(q * 5.4 + seed) * 22 * (.35 + q) + (r() - .5) * 7;
    const rad = 6 + q * 22 + r() * 5, al = .075 * Math.sin(Math.PI * Math.min(1, q * 1.04)) * (.55 + r() * .8);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(248,244,236,${al})`); gr.addColorStop(1, 'rgba(248,244,236,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
  }
  return c;
}
function steamAt(t: number, x0: number, y0: number, spread: number, amp: number, seed: number): void {
  if (amp <= 0) return;
  if (!wisps) wisps = [1, 2, 3, 4, 5].map(makeWisp);
  const SS = V.SS, LIFE = 3.4, N = 8, small = spread < 30;
  ctx.save();
  for (let j = 0; j < N; j++) {
    const a = ((t - j * (LIFE / N) - seed) % LIFE + LIFE) % LIFE, k = a / LIFE;
    const lane = (j * 5) % 7 / 6 - .5, sc = (small ? .5 : .78) * (.75 + .5 * k) * SS;
    const x = x0 + (lane * spread + Math.sin(a * 1.4 + j * 1.7) * 11 * k + k * 16) * SS, y = y0 - (4 + a * (small ? 26 : 34)) * SS;
    ctx.globalAlpha = Math.min(1, amp) * Math.pow(Math.sin(Math.PI * k), 1.3) * (small ? .9 : 1.15);
    ctx.drawImage((wisps as HTMLCanvasElement[])[j % 5] as HTMLCanvasElement, x - 64 * sc, y - 256 * sc, 128 * sc, 256 * sc);
  }
  ctx.restore();
}
/** build everything that is expensive to create now, behind the loader, so nothing hitches while the animation plays */
export async function warmAsync(): Promise<void> {
  if (!wisps) { wisps = []; for (let k = 1; k <= 5; k++) { (wisps as HTMLCanvasElement[]).push(makeWisp(k)); await tick(); } }
  for (let q = 1; q <= 30; q++) { beanSource(0, q / 30); if (q % 6 === 0) await tick(); }
}
export function drawSteam(t: number, p: Pose): void {
  const open = smooth(prog(t, [D.hit + .5, D.hit + 1.5])) * (1 - smooth(prog(t, [T.lidIn[0] + .3, T.lidPress[1]])));
  if (open > 0) { const m = toWorld(p, RIM.cx, RIM.cy - 6); steamAt(t, m.x, m.y, 150, open, 0); }
  const hole = smooth(prog(t, [T.lidPress[1] + .1, T.lidPress[1] + 1.2]));
  if (hole > 0 && dyn.dockE < .98) { const h = toWorld(p, HOLE_IMG.x, HOLE_IMG.y); steamAt(t, h.x, h.y, 14, hole * (1 - dyn.dockE), .4); }
  // a fresh puff from the sip hole when the cup is tapped
  for (const tp of taps) {
    const a = t - tp;
    if (a < 0 || a > FX.tapPuff || dyn.dockE > .5) continue;
    if (!wisps) wisps = [1, 2, 3, 4, 5].map(makeWisp);
    const h = toWorld(p, HOLE_IMG.x, HOLE_IMG.y), SS = V.SS;
    ctx.save();
    for (let j = 0; j < 7; j++) {
      const k = clamp((a - j * .07) / (FX.tapPuff * .72));
      if (k <= 0 || k >= 1) continue;
      const sc = (.55 + .6 * k) * SS, lane = (j - 3) / 3;
      const x = h.x + (lane * 16 + Math.sin(k * 5 + j * 2.1) * 12 * k) * SS, y = h.y - (6 + k * 120) * SS;
      ctx.globalAlpha = Math.pow(Math.sin(Math.PI * k), 1.2) * .95;
      ctx.drawImage((wisps as HTMLCanvasElement[])[j % 5] as HTMLCanvasElement, x - 64 * sc, y - 256 * sc, 128 * sc, 256 * sc);
    }
    ctx.restore();
  }
}
