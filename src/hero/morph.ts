import { ctx } from './canvas';
import { imgs } from './assets';
import { INK, MORPH } from './constants';
import { Q, T } from './config';
import { LOW_END } from './env';
import { clamp, prog, smooth } from './math';
import { halve } from './sprites';

export const MF = { m0: .46, m1: .97, frames: [] as HTMLCanvasElement[], ready: false, inB: new Float32Array(0), dG: new Float32Array(0), dB: new Float32Array(0), n: 0, tw: 0, th: 0 };
const gc = document.createElement('canvas'), gctx = gc.getContext('2d') as CanvasRenderingContext2D;

/* The black seed keeps its outline; the steam curves and the cup open up inside it from their centre lines,
   and the handle and the logo's slightly different edge grow out from it. This runs once per frame of the morph,
   up front, while the loader is showing - never while the animation plays. */
function prepSdf(): void {
  const im = imgs.sdf, c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const cx = c.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D; cx.drawImage(im, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height).data, n = c.width * c.height, S = MORPH.S, R = MORPH.range;
  MF.n = n; MF.tw = c.width; MF.th = c.height;
  MF.inB = new Float32Array(n); MF.dG = new Float32Array(n); MF.dB = new Float32Array(n);
  for (let i = 0, k = 0; i < n; i++, k += 4) {
    MF.inB[i] = Math.min(1, Math.max(0, .5 - ((d[k] - 128) / R) * S));
    MF.dG[i] = d[k + 1] ? (d[k + 1] - 1) / 254 : -1;
    MF.dB[i] = d[k + 2] ? (d[k + 2] - 1) / 254 : -1;
  }
}
function makeMorphFrame(i: number, N: number): HTMLCanvasElement {
  const m = MF.m0 + (MF.m1 - MF.m0) * i / (N - 1);
  const eh = smooth(clamp((m - .52) / .43)), ee = smooth(clamp((m - .46) / .45));
  const th = 1.05 - 1.05 * eh, te = 1.05 - 1.05 * ee, n = MF.n;
  const id = new ImageData(MF.tw, MF.th), o = id.data;
  for (let p = 0, k = 0; p < n; p++, k += 4) {
    const g = MF.dG[p], b = MF.dB[p], inB = MF.inB[p];
    let hole = 0, add = 0;
    if (g >= 0) { hole = (g - th) * 10; hole = hole < 0 ? 0 : hole > 1 ? 1 : hole; }
    if (b >= 0) { add = (b - te) * 10; add = add < 0 ? 0 : add > 1 ? 1 : add; }
    o[k] = 3; o[k + 1] = 3; o[k + 2] = 3; o[k + 3] = (inB * (1 - hole) + add * (1 - inB)) * 255;
  }
  const full = document.createElement('canvas'); full.width = MF.tw; full.height = MF.th; (full.getContext('2d') as CanvasRenderingContext2D).putImageData(id, 0, 0);
  if (!LOW_END) return full;                                 // desktop keeps the full 3x texture
  const q = .62; return halve(full, Math.round(MF.tw * q), Math.round(MF.th * q));
}
export function buildMorphFrames(done: () => void): void {
  if (MF.ready) return done();
  prepSdf();
  const N = Q.morphFrames; let i = 0;
  const step = () => {
    const t0 = performance.now();
    while (i < N && performance.now() - t0 < 8) { MF.frames[i] = makeMorphFrame(i, N); i++; }
    if (i < N) setTimeout(step, 0); else { MF.ready = true; done(); }
  };
  step();
}

export function drawStaticPrint(t: number): void {
  const L = INK.letters, x0 = L[0][0], y0 = Math.min(...L.map(c => c[1])), x1 = L[L.length - 1][2], y1 = Math.max(...L.map(c => c[3]));
  ctx.drawImage(imgs.ink, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  const m = prog(t, T.morph), [bx0, by0, bx1, by1] = INK.bean, bw = bx1 - bx0, bh = by1 - by0;
  if (m <= 0) return;
  if (m >= .97 || !MF.ready) { ctx.drawImage(imgs.ink, bx0, by0, bw, bh, bx0, by0, bw, bh); return; }
  const N = MF.frames.length, fi = clamp(Math.round((m - MF.m0) / (MF.m1 - MF.m0) * (N - 1)), 0, N - 1), frame = MF.frames[fi];
  ctx.save(); ctx.imageSmoothingQuality = 'high';
  // ink spreading into the fibres as it settles
  const halo = Math.sin(Math.PI * clamp((m - .3) / .65)) * .5;
  if (halo > .01) { ctx.globalAlpha = halo; ctx.drawImage(imgs.halo, bx0, by0, bw, bh, bx0, by0, bw, bh); ctx.globalAlpha = 1; }
  ctx.drawImage(frame, MORPH.x0, MORPH.y0, MORPH.w, MORPH.h);
  // wet ink catches the light while it sets: a faint sheen and a glint that slides across
  const g = clamp((m - .5) / .47);
  if (g > 0 && g < 1) {
    const W_ = MORPH.w, H_ = MORPH.h;
    if (gc.width !== W_ * 2) { gc.width = W_ * 2; gc.height = H_ * 2; }
    gctx.globalCompositeOperation = 'source-over'; gctx.clearRect(0, 0, gc.width, gc.height);
    gctx.drawImage(frame, 0, 0, gc.width, gc.height); gctx.globalCompositeOperation = 'source-in';
    gctx.fillStyle = `rgba(255,255,255,${.12 * (1 - g)})`; gctx.fillRect(0, 0, gc.width, gc.height);
    const gx = (-14 + (W_ + 28) * g) * 2, gg = gctx.createLinearGradient(gx - 32, 0, gx + 32, H_);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, `rgba(255,255,255,${.5 * Math.sin(Math.PI * g)})`); gg.addColorStop(1, 'rgba(255,255,255,0)');
    gctx.fillStyle = gg; gctx.fillRect(0, 0, gc.width, gc.height); gctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(gc, MORPH.x0, MORPH.y0, W_, H_);
  }
  ctx.restore();
}
