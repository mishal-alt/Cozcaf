/* ======================================================================
   SCENE: hot dishes lit into a warm moss and walnut set, drawn live on one canvas.
   render(t) is a pure function of time (seconds since the scene started), so any frame can be reproduced exactly.
   ====================================================================== */
import { LOW_END } from './env';
import { TAU, clamp, easeOutCubic, easeOutExpo, prog, rng, smooth } from './math';
import { blurred, ctx2d, gradePlate, lit, makeSprites, mk, reflection, scaledTo, silhouette } from './sprites';
import type { Sprites } from './sprites';

export interface Images { plate: HTMLImageElement; chicken: HTMLImageElement; pasta: HTMLImageElement; fries: HTMLImageElement; coffee: HTMLImageElement }
type Key = 'chicken' | 'pasta' | 'fries' | 'coffee';

/** where the bucket is on screen (css px, its foot-centre and size), so the page can hang the badge beside it */
export interface Anchor { x: number; y: number; w: number; h: number; s: number; land: boolean }

/** the finished composition is reached at about this time (s): reduced motion shows this frame */
export const T_REST = 6.5;

const PLATE_W = 1536, PLATE_H = 2752, EDGE = 0.64;   // the set's size is defined at 1536 wide; the file is smaller and simply stretched (the wall and wood are soft)   // the set's size, and where the counter's back edge sits (fraction of its height)

interface Spec { cx: number; foot: number; w?: number; h?: number; depth: number; z: number; app: [number, number]; rise: number; dx: number; emit: [number, number]; shadow: number; lift: number; glints: [number, number, number][] }
interface Item extends Spec { key: Key; x: number; footY: number; wCss: number; hCss: number; a: HTMLCanvasElement; b: HTMLCanvasElement; sil: HTMLCanvasElement; refl: HTMLCanvasElement; hl?: HTMLCanvasElement }
interface Box { it: Item; x: number; y: number; s: number; u: number }
interface Mote { x: number; y: number; z: number; sp: number; ph: number; f: number; s: number; tw: number }
interface Bokeh { x: number; y: number; s: number; ph: number; a: number; v: number }
interface Puff { ph: number; w1: number; w2: number; rot: number; spr: number; life: number; sz: number }

export interface Scene {
  /** re-read the window size and rebuild everything that depends on it (in small steps, so the page stays responsive) */
  resize(): Promise<void>;
  /** draw one frame; returns where the bucket is (for the badge) */
  render(t: number): Anchor;
  /** the frame rate sagged: draw fewer pixels. False when it cannot go lower. */
  cheaper(): boolean;
}

/** let the browser paint and handle input between two heavy steps */
const tick = (): Promise<void> => new Promise((res) => setTimeout(res, 0));

export async function createScene(cv: HTMLCanvasElement, imgs: Images, isTall: () => boolean): Promise<Scene> {
  const ctx = ctx2d(cv), SPR: Sprites = makeSprites(3);
  await tick();
  const plateG = gradePlate(imgs.plate);
  await tick();
  let W = 0, H = 0, D = 1, land = false, dprCap = 2, F = { x: 0, y: 0 };
  let plate = { x: 0, y: 0, w: 0, h: 0 };
  let grainPat: CanvasPattern | string | null = null;
  let items: Item[] = [], motes: Mote[] = [], bokeh: Bokeh[] = [], near: Bokeh[] = [], steam: Puff[][] = [], bloom: HTMLCanvasElement | null = null;
  const haze = !LOW_END;   // heat shimmer reads the canvas back, which a modest phone does not enjoy

  let building = false, again = false;
  async function layout(): Promise<void> {
    if (building) { again = true; return; }                  // a resize arrived mid-build: go again once this one is done
    building = true;
    // everything is worked out on the side and swapped in at the end, so a frame drawn mid-build never mixes old and new sizes
    const nD = Math.min(window.devicePixelRatio || 1, LOW_END ? 1.25 : 2, dprCap), nW = innerWidth, nH = innerHeight, nLand = !isTall();
    const sc = Math.max(nW / PLATE_W, nH / PLATE_H) * (nLand ? 1.04 : 1), pw = PLATE_W * sc, ph = PLATE_H * sc;
    const nPlate = { x: -(pw - nW) * (nLand ? 0.5 : 0.62), y: nLand ? nH * 0.6 - EDGE * ph : 0, w: pw, h: ph };
    const L: Record<Key, { cx: number; foot: number; w?: number; h?: number }> = nLand
      ? { chicken: { cx: 0.5, foot: 0.735, h: 0.43 }, pasta: { cx: 0.31, foot: 0.86, w: 0.235 }, fries: { cx: 0.69, foot: 0.875, w: 0.23 }, coffee: { cx: 0.5, foot: 0.925, w: 0.195 } }
      : { chicken: { cx: 0.5, foot: 0.705, h: 0.365 }, pasta: { cx: 0.245, foot: 0.8, w: 0.5 }, fries: { cx: 0.755, foot: 0.82, w: 0.48 }, coffee: { cx: 0.5, foot: 0.905, w: 0.5 } };
    const spec: Record<Key, Spec> = {
      chicken: { ...L.chicken, depth: 0.6, z: 0.86, app: [0.55, 1.9], rise: 0.07, dx: 0, emit: [0.5, 0.1], shadow: 0.75, lift: 0.22, glints: [[0.3, 0.22, 4.9], [0.62, 0.14, 6.3], [0.48, 0.34, 7.4]] },
      pasta: { ...L.pasta, depth: 0.9, z: 1.04, app: [0.95, 2.3], rise: 0.05, dx: -0.1, emit: [0.5, 0.3], shadow: 0.8, lift: 0, glints: [[0.4, 0.3, 5.2], [0.6, 0.38, 4.4], [0.52, 0.22, 6.8], [0.7, 0.45, 7.7]] },
      fries: { ...L.fries, depth: 1, z: 1.08, app: [1.15, 2.5], rise: 0.05, dx: 0.1, emit: [0.5, 0.3], shadow: 0.85, lift: 0, glints: [[0.34, 0.32, 5.7], [0.62, 0.28, 4.9], [0.5, 0.4, 6.6], [0.72, 0.46, 7.1]] },
      coffee: { ...L.coffee, depth: 1.15, z: 1.14, app: [1.55, 2.9], rise: 0.06, dx: 0, emit: [0.43, 0.2], shadow: 0.9, lift: 0, glints: [[0.38, 0.16, 4.6], [0.5, 0.22, 6.1], [0.6, 0.14, 7.3], [0.3, 0.55, 5.4]] },
    };
    const built: Item[] = [];
    for (const key of ['chicken', 'pasta', 'fries', 'coffee'] as const) {
      const s = spec[key], img = imgs[key], asp = img.naturalWidth / img.naturalHeight;
      const wCss = s.w ? s.w * nW : (s.h ?? 0) * nH * asp, hCss = wCss / asp;
      const a = lit(scaledTo(img, Math.round(wCss * nD), Math.round(hCss * nD)), s.lift);
      await tick();
      const small = scaledTo(a, Math.max(8, a.width / 2), Math.max(8, a.height / 2));   // the blurry helpers are soft anyway: build them at half size
      built.push({ key, ...s, x: s.cx * nW, footY: s.foot * nH, wCss, hCss, a, b: blurred(small, 4), sil: silhouette(small, 3), refl: reflection(small, 0.2) });
      await tick();
    }
    const r = rng(21), many = LOW_END ? 0.65 : 1;
    const nMotes = Array.from({ length: Math.round((nLand ? 90 : 62) * many) }, () => ({ x: r(), y: r(), z: r(), sp: 0.005 + r() * 0.016, ph: r() * TAU, f: 0.2 + r() * 0.5, s: 1 + r() * 3, tw: 0.6 + r() * 1.4 }));
    const nBokeh = Array.from({ length: 9 }, () => ({ x: r(), y: 0.12 + r() * 0.42, s: 0.035 + r() * 0.07, ph: r() * TAU, a: 0.03 + r() * 0.05, v: 0.004 + r() * 0.01 }));
    const nNear = Array.from({ length: 5 }, (_, i) => ({ x: i % 2 ? 0.02 + r() * 0.1 : 0.88 + r() * 0.1, y: 0.2 + r() * 0.55, s: 0.16 + r() * 0.12, ph: r() * TAU, a: 0.035 + r() * 0.03, v: 0.003 + r() * 0.004 }));
    const puffs = LOW_END ? 14 : 22;
    const nSteam = built.map((_, k) => Array.from({ length: puffs }, (_, i) => ({ ph: (i / puffs + k * 0.13) % 1, w1: r() * TAU, w2: r() * TAU, rot: r() * TAU, spr: Math.floor(r() * 3), life: 5.2 + r() * 2.4, sz: 0.7 + r() * 0.6 })));
    D = nD; W = nW; H = nH; land = nLand; F = { x: nW * 0.5, y: nH * (nLand ? 0.62 : 0.64) }; plate = nPlate;
    items = built; motes = nMotes; bokeh = nBokeh; near = nNear; steam = nSteam;
    cv.width = Math.round(W * D); cv.height = Math.round(H * D);
    building = false;
    if (again) { again = false; await layout(); }
  }

  const cam = (t: number): { push: number; pan: number; bob: number } => ({ push: 1 + 0.034 * smooth(clamp(t / 5)) + 0.008 * Math.sin(TAU * t / 12), pan: Math.sin(TAU * t / 12 + 0.6) * 0.012 * W, bob: Math.sin(TAU * t / 6) * 0.0025 * H });

  function drawAbout(img: HTMLCanvasElement, w: number, h: number, cx: number, cy: number, s: number, alpha: number, op?: GlobalCompositeOperation): void {
    ctx.save(); ctx.globalAlpha = alpha; if (op) ctx.globalCompositeOperation = op;
    ctx.translate(F.x, F.y); ctx.scale(s, s); ctx.translate(-F.x, -F.y); ctx.drawImage(img, cx - w / 2, cy - h, w, h); ctx.restore();
  }

  function render(t: number): Anchor {
    const c = cam(t);
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#0b0d08'; ctx.fillRect(0, 0, W, H);

    // 1. the set
    const ps = 1 + (c.push - 1) * 0.5;
    ctx.save(); ctx.translate(F.x + c.pan * 0.2, F.y); ctx.scale(ps, ps); ctx.translate(-F.x, -F.y); ctx.drawImage(plateG, plate.x, plate.y, plate.w, plate.h); ctx.restore();
    const toScr = (u: number, v: number): { x: number; y: number } => ({ x: F.x + c.pan * 0.2 + (plate.x + u * plate.w - F.x) * ps, y: F.y + (plate.y + v * plate.h - F.y) * ps });

    // 2. warm light: the bulbs, light falling in from the upper left, and a lamp glow behind the food that breathes like a flame
    const on = easeOutCubic(prog(t, 0.15, 1.6)), fl = t < 1.2 ? 0.75 + 0.25 * Math.sin(t * 61) * Math.sin(t * 23) : 1;
    const flick = 1 + 0.035 * Math.sin(t * 7.3) * Math.sin(t * 3.1) + 0.02 * Math.sin(t * 17.7);
    ctx.globalCompositeOperation = 'lighter';
    if (!land) for (const [u, v, r] of [[0.8, 0.282, 0.17], [0.975, 0.262, 0.15]] as const) { const p = toScr(u, v), R = r * W * 1.5; ctx.globalAlpha = 0.55 * on * fl * flick; ctx.drawImage(SPR.glow, p.x - R, p.y - R, R * 2, R * 2); }
    else for (const [fx, fy, r] of [[0.8, 0.26, 0.11], [0.93, 0.22, 0.08], [0.08, 0.3, 0.07]] as const) { const R = r * W * 1.4; ctx.globalAlpha = 0.4 * on * fl * flick; ctx.drawImage(SPR.glow, fx * W - R, fy * H - R, R * 2, R * 2); }
    { const R = Math.max(W * 0.95, H * 0.75), cy = H * (land ? 0.55 : 0.5); ctx.globalAlpha = 0.55 * on * flick; ctx.drawImage(SPR.lamp, W / 2 - R / 2, cy - R / 2, R, R); }
    for (const [sx, wd, a] of [[0.16, 0.2, 1], [0.4, 0.11, 0.6]] as const) { ctx.save(); ctx.translate(W * sx, -H * 0.1); ctx.rotate(-0.42); ctx.globalAlpha = 0.075 * a * on * (0.85 + 0.15 * Math.sin(TAU * t / 9 + sx * 9)); ctx.drawImage(SPR.shaft, 0, 0, W * wd, H * 1.5); ctx.restore(); }
    for (const b of bokeh) {
      const x = ((b.x + Math.sin(t * b.v * 6 + b.ph) * 0.04) % 1) * W, y = (b.y + Math.sin(t * b.v * 5 + b.ph * 2) * 0.02) * H, R = b.s * Math.max(W, H * 0.55);
      ctx.globalAlpha = b.a * on * (0.7 + 0.3 * Math.sin(t * 0.7 + b.ph)); ctx.drawImage(SPR.bokeh, x - R / 2, y - R / 2, R, R);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // 3. the dishes, back to front: cast shadow, reflection, then the dish arriving out of blur
    const boxes: Box[] = [];
    for (const it of items) {
      const u = easeOutExpo(prog(t, it.app[0], it.app[1]));
      const settle = t > it.app[1] - 0.12 && t < it.app[1] + 0.38 ? Math.sin(Math.PI * clamp((t - it.app[1] + 0.12) / 0.5)) : 0;
      const x = it.x + it.dx * (1 - u) * W * 0.5 + c.pan * it.depth, y = it.footY + (1 - u) * it.rise * H + c.bob * it.depth + settle * H * 0.0035;
      const s = 1 + (c.push - 1) * it.z;
      ctx.save(); ctx.translate(F.x, F.y); ctx.scale(s, s); ctx.translate(-F.x, -F.y);
      ctx.save(); ctx.globalAlpha = 0.55 * u * it.shadow; ctx.translate(x, y); ctx.transform(1, 0, -0.75, 0.24, 0, 0); ctx.drawImage(it.sil, -it.wCss / 2, -it.hCss, it.wCss, it.hCss); ctx.restore();   // cast shadow, laid across the counter away from the light
      ctx.save(); ctx.translate(x, y - it.hCss * 0.01); ctx.scale(1, 0.16);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, it.wCss * 0.55); sg.addColorStop(0, `rgba(0,0,0,${0.85 * u})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, it.wCss * 0.55, 0, TAU); ctx.fill(); ctx.restore();                                                                                                       // tight contact shadow
      ctx.save(); ctx.translate(x, y - it.hCss * 0.004); ctx.scale(1, 0.06);
      const ag = ctx.createRadialGradient(0, 0, 0, 0, 0, it.wCss * 0.4); ag.addColorStop(0, `rgba(0,0,0,${0.95 * u})`); ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, 0, it.wCss * 0.4, 0, TAU); ctx.fill(); ctx.restore();                                                                                                       // the dark line where the dish meets the wood
      ctx.globalAlpha = u * u; ctx.drawImage(it.refl, x - it.wCss / 2, y - 1, it.wCss, it.hCss * 0.4); ctx.restore();
      if (u < 0.995) drawAbout(it.b, it.wCss, it.hCss, x, y, s, (1 - Math.pow(u, 0.6)) * clamp(u * 6));
      drawAbout(it.a, it.wCss, it.hCss, x, y, s, clamp(u * 2.4));
      boxes.push({ it, x, y, s, u });
    }

    // 4. glints on sauce and crust
    ctx.globalCompositeOperation = 'lighter';
    for (const { it, x, y, s, u } of boxes) {
      if (u < 0.5) continue;
      it.glints.forEach(([fx, fy, per], i) => {
        const tw = Math.pow(Math.max(0, Math.sin(TAU * (t / per + i * 0.27))), 18) * clamp((u - 0.5) * 2); if (tw < 0.03) return;
        const px = F.x + (x - it.wCss / 2 + fx * it.wCss - F.x) * s, py = F.y + (y - it.hCss + fy * it.hCss - F.y) * s, R = it.wCss * s * (0.008 + 0.018 * tw);
        ctx.globalAlpha = tw * 0.7; ctx.drawImage(SPR.dot, px - R, py - R, R * 2, R * 2);
        ctx.globalAlpha = tw * 0.5; ctx.fillStyle = '#fff0d6'; ctx.fillRect(px - R * 1.7, py - 0.5, R * 3.4, 1); ctx.fillRect(px - 0.5, py - R * 1.7, 1, R * 3.4);
      });
    }
    ctx.globalCompositeOperation = 'source-over';

    // 4b. a soft light travels across the glass and the bucket
    for (const { it, x, y, s, u } of boxes) {
      if (u < 0.9 || t < 3.2 || (it.key !== 'coffee' && it.key !== 'chicken')) continue;
      const q = ((t - 3.2 - (it.key === 'chicken' ? 2.2 : 0)) / 9) % 1; if (q < 0 || q > 0.45) continue;
      const a = smooth(Math.sin(Math.PI * q / 0.45)), pos = -0.25 + q / 0.45 * 1.5, w = it.a.width, h = it.a.height;
      const hl = (it.hl ??= mk(w, h)), hg = ctx2d(hl);
      hg.globalCompositeOperation = 'source-over'; hg.clearRect(0, 0, w, h);
      const cx = pos * w, cy = h * 0.5, dx = Math.cos(-0.4) * w * 0.18, dy = Math.sin(-0.4) * w * 0.18, gr = hg.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      gr.addColorStop(0, 'rgba(255,240,215,0)'); gr.addColorStop(0.5, 'rgba(255,246,230,.85)'); gr.addColorStop(1, 'rgba(255,240,215,0)');
      hg.fillStyle = gr; hg.fillRect(0, 0, w, h); hg.globalCompositeOperation = 'destination-in'; hg.drawImage(it.a, 0, 0);
      drawAbout(hl, it.wCss, it.hCss, x, y, s, (it.key === 'coffee' ? 0.42 : 0.2) * a, 'lighter');
    }

    // 5. steam: thin wisps that curl up, widen and fade, softly screened over the scene
    ctx.globalCompositeOperation = 'screen';
    boxes.forEach(({ it, x, y, s }, k) => {
      const env = smooth(prog(t, it.app[1] - 0.2, it.app[1] + 1.6)); if (env <= 0) return;
      const ex = x - it.wCss / 2 + it.emit[0] * it.wCss, ey = y - it.hCss + it.emit[1] * it.hCss, ch = it.key === 'chicken', cf = it.key === 'coffee';
      for (const q of steam[k] ?? []) {
        const v = (t / q.life + q.ph) % 1, rise = Math.pow(v, 0.82) * H * (land ? 0.36 : 0.3) * (ch ? 1 : cf ? 0.55 : 0.8);
        const out = it.key === 'pasta' ? -1 : it.key === 'fries' ? 1 : cf ? 0.5 : 0.25;
        const sway = (Math.sin(v * 4.2 + q.w1) * 0.6 + Math.sin(v * 9.5 + q.w2) * 0.25 + out * 0.9 * v + 0.15 * v) * it.wCss * (0.07 + 0.22 * v);
        const size = it.wCss * (0.2 + 0.55 * v) * q.sz * (ch ? 1 : cf ? 0.6 : 0.85);
        const px = F.x + (ex + sway - F.x) * s, py = F.y + (ey - rise - F.y) * s;
        const a = (ch ? 0.34 : cf ? 0.2 : 0.26) * env * Math.pow(Math.sin(Math.PI * v), 1.2) * Math.min(1, v * 6);
        ctx.save(); ctx.translate(px, py); ctx.rotate((q.rot % 0.5 - 0.25) + Math.sin(v * 3 + q.w1) * 0.25); ctx.globalAlpha = a;
        ctx.drawImage(SPR.steam[q.spr] ?? SPR.dot, -size / 2, -size * 0.8, size, size * 1.6); ctx.restore();
      }
    });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // 5b. the air shimmers above the hot food: thin strips of the picture slide sideways a pixel or two
    const hz = smooth(prog(t, 2.6, 4));
    if (haze && hz > 0) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (const { it, x, y, s } of boxes.slice(0, 3)) {
        const zx = F.x + (x - it.wCss / 2 - F.x) * s, zw = it.wCss * s, top = F.y + (y - it.hCss - F.y) * s, zh = H * (it.key === 'chicken' ? 0.2 : 0.12);
        for (let py = Math.floor((top - zh) * D); py < top * D; py += 3 * D) {
          const k2 = (py / D - (top - zh)) / zh, off = Math.sin(py * 0.06 / D + t * 3.3 + x * 0.01) * 1.2 * hz * Math.sin(Math.PI * k2) * D;
          ctx.drawImage(cv, zx * D, py, zw * D, 3 * D, zx * D + off, py, zw * D, 3 * D);
        }
      }
      ctx.restore();
    }

    // 6. dust in the warm light, then a few big soft lights close to the lens
    ctx.globalCompositeOperation = 'lighter';
    const env2 = smooth(prog(t, 0.6, 2.6));
    for (const m of motes) {
      const y = ((m.y - t * m.sp * (0.5 + m.z)) % 1 + 1) % 1, x = m.x + Math.sin(t * m.f + m.ph) * 0.012 * (0.4 + m.z) + c.pan / W * m.z * 0.6;
      const tw = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * m.tw + m.ph * 3), 2), R = m.s * (0.5 + m.z) * (land ? 1.2 : 1) * 2.1;
      ctx.globalAlpha = (0.14 + 0.3 * m.z) * tw * env2 * (y > 0.93 ? (1 - y) / 0.07 : 1);
      ctx.drawImage(SPR.dot, (x % 1) * W - R, y * H - R, R * 2, R * 2);
    }
    for (const b of near) { const x = (b.x + Math.sin(t * b.v * 6 + b.ph) * 0.03) * W, y = (b.y + Math.sin(t * b.v * 5 + b.ph * 2) * 0.02) * H, R = b.s * Math.max(W, H * 0.55); ctx.globalAlpha = b.a * env2 * (0.7 + 0.3 * Math.sin(t * 0.5 + b.ph)); ctx.drawImage(SPR.bokeh, x - R / 2, y - R / 2, R, R); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // 7. grade: moss in the shadows, gold in the highlights, a soft bloom, vignette, weight at the top and bottom for the page chrome, grain, fade from black
    if (!LOW_END) {                                                // the colour grade and bloom are full-screen passes: a modest phone skips them
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.28; ctx.fillStyle = 'rgb(40,72,44)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (!bloom || bloom.width !== Math.ceil(cv.width / 6)) bloom = mk(Math.ceil(cv.width / 6), Math.ceil(cv.height / 6));
      const bg = ctx2d(bloom); bg.imageSmoothingQuality = 'high'; bg.drawImage(cv, 0, 0, bloom.width, bloom.height); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.13; ctx.drawImage(bloom, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    let g = ctx.createRadialGradient(W / 2, H * 0.6, Math.min(W, H) * 0.32, W / 2, H * 0.6, Math.max(W, H) * 0.8); g.addColorStop(0, 'rgba(6,7,4,0)'); g.addColorStop(1, 'rgba(6,7,4,.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createLinearGradient(0, 0, 0, H * 0.3); g.addColorStop(0, 'rgba(8,10,6,.55)'); g.addColorStop(1, 'rgba(8,10,6,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.3);
    g = ctx.createLinearGradient(0, H * 0.85, 0, H); g.addColorStop(0, 'rgba(8,10,6,0)'); g.addColorStop(1, 'rgba(8,10,6,.5)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.85, W, H * 0.15);
    if (!LOW_END) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; ctx.translate((Math.floor(t * 24) * 53) % 256, (Math.floor(t * 24) * 91) % 256);
      ctx.fillStyle = grainPat ??= ctx.createPattern(SPR.grain, 'repeat') ?? '#000'; ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore(); }
    const k = 1 - easeOutCubic(prog(t, 0, 1.3)); if (k > 0) { ctx.globalAlpha = k; ctx.fillStyle = '#080a06'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

    const ch = boxes[0] as Box;
    return { x: ch.x, y: ch.y, w: ch.it.wCss, h: ch.it.hCss, s: ch.s, land };
  }

  await layout();
  return {
    resize: layout,
    render,
    cheaper(): boolean { if (dprCap <= 1) return false; dprCap = Math.max(1, dprCap - 0.25); void layout(); return true; },
  };
}
