import { imgs } from './assets';
import { ctx } from './canvas';
import { BEAN, MORPH } from './constants';
import { T } from './config';
import { clamp, lerp, prog, smooth, TAU } from './math';
import { cupPose } from './pose';
import { V } from './state';
import { toWorld } from './timeline';
import type { Point } from './types';

/* ---------- a real coffee bean: tumbles in, settles on the cup, and turns into the logo ---------- */
const soakCache = new Map<number, HTMLCanvasElement>();
const quadBez = (a: Point, c: Point, b: Point, e: number): Point => ({ x: (1-e)*(1-e)*a.x + 2*(1-e)*e*c.x + e*e*b.x, y: (1-e)*(1-e)*a.y + 2*(1-e)*e*c.y + e*e*b.y });
interface BeanPose { x: number; y: number; k: number; roll: number; phi: number; hs: number; flat: number; alpha: number }
function beanPose(t: number): BeanPose | null {
  const m = prog(t, T.morph), SS = V.SS;
  if (t < T.beanIn[0] || m > .66) return null;
  const cp = cupPose(t), logo = toWorld(cp, MORPH.cx, MORPH.cy), kL = (MORPH.len * V.SC) / BEAN.len, rollEnd = cp.rot + MORPH.rot;
  let x, y, k, roll, phi, hs = 0;
  if (t < T.beanIn[1]) {
    const s = prog(t, T.beanIn), e = 1 - Math.pow(1 - s, 2.0);
    const S = V.beanStart, C = { x: logo.x + 330 * SS, y: logo.y - 380 * SS };
    const b = quadBez(S, C, logo, e); x = b.x; y = b.y;
    k = kL * lerp(2.0, 1, e); roll = rollEnd + (1 - e) * 1.25; phi = TAU * 2 * Math.pow(1 - e, 1.5); hs = 1 - e;
  } else {
    const s = prog(t, T.beanPress);
    x = logo.x; y = logo.y + 1.2 * SS * Math.sin(Math.PI * s); k = kL * (1 - .045 * Math.sin(Math.PI * s)); roll = rollEnd; phi = 0;
  }
  return { x, y, k, roll, phi, hs, flat: smooth(clamp(m / .45)), alpha: 1 - smooth(clamp((m - .38) / .27)) };
}
/* the seed soaks into ink: dark parts first, highlights last (cached - the soaking bean never moves) */
export function beanSource(f: number, flat: number): { c: CanvasImageSource; sx: number; sy: number } {
  const fw = BEAN.fw, fh = BEAN.fh, sx = (f % BEAN.cols) * fw, sy = Math.floor(f / BEAN.cols) * fh;
  if (flat <= 0.004) return { c: imgs.bean, sx, sy };
  const q = Math.round(flat * 30), key = f * 100 + q;
  let c = soakCache.get(key);
  if (!c) {
    c = document.createElement('canvas'); c.width = fw; c.height = fh;
    const g = c.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D; g.drawImage(imgs.bean, sx, sy, fw, fh, 0, 0, fw, fh);
    const id = g.getImageData(0, 0, fw, fh), d = id.data, fl = q / 30;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const lum = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, w = Math.min(1, Math.max(0, fl * 2.2 - lum * 1.1));
      d[i] += (3 - d[i]) * w; d[i + 1] += (3 - d[i + 1]) * w; d[i + 2] += (3 - d[i + 2]) * w;
    }
    g.putImageData(id, 0, 0); soakCache.set(key, c);
  }
  return { c, sx: 0, sy: 0 };
}
function paintBean(b: BeanPose, alpha: number, ghost?: boolean): void {
  const f = Math.round((((b.phi / TAU) % 1) + 1) % 1 * BEAN.NF) % BEAN.NF, fw = BEAN.fw, fh = BEAN.fh;
  const src = beanSource(f, b.flat);
  ctx.save();
  ctx.globalAlpha = alpha * b.alpha;
  if (!ghost) { const K = V.K; ctx.shadowColor = `rgba(10,14,8,${(.5 - .22 * b.hs) * (1 - b.flat)})`; ctx.shadowBlur = (5 + 24 * b.hs) * K; ctx.shadowOffsetX = (3 + 10 * b.hs) * K; ctx.shadowOffsetY = (5 + 22 * b.hs) * K; }
  ctx.translate(b.x, b.y); ctx.rotate(b.roll); ctx.scale(b.k * MORPH.wx, b.k);
  ctx.drawImage(src.c, src.sx, src.sy, fw, fh, -fw / 2, -fh / 2, fw, fh);
  ctx.restore();
}
export function drawBean(t: number): void {
  const b = beanPose(t);
  if (!b) return;
  const b1 = beanPose(t - .012), b2 = beanPose(t - .024);      // a little motion blur while it is moving fast
  if (b1 && b2 && Math.hypot(b.x - b1.x, b.y - b1.y) > 10) { paintBean({ ...b2, phi: b.phi, roll: b.roll, k: b.k }, .16, true); paintBean({ ...b1, phi: b.phi, roll: b.roll, k: b.k }, .26, true); }
  paintBean(b, 1);
}
