/* ======================================================================
   SPRITES: every soft texture the scene uses, made once with the canvas (no extra downloads)
   ====================================================================== */
import { clamp, rng } from './math';

export function mk(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
export const ctx2d = (c: HTMLCanvasElement): CanvasRenderingContext2D => c.getContext('2d') as CanvasRenderingContext2D;

function radial(size: number, stops: [number, string][]): HTMLCanvasElement {
  const c = mk(size, size), g = ctx2d(c), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}

export interface Sprites {
  dot: HTMLCanvasElement;
  glow: HTMLCanvasElement;
  lamp: HTMLCanvasElement;
  bokeh: HTMLCanvasElement;
  shaft: HTMLCanvasElement;
  steam: HTMLCanvasElement[];
  grain: HTMLCanvasElement;
}

/** a soft cloud of steam: layered value noise under a round fall-off; luminance becomes alpha */
function steamSprite(seed: number, size: number): HTMLCanvasElement {
  const r = rng(seed), acc = new Float32Array(size * size);
  let amp = 1, tot = 0;
  for (const cells of [3, 6, 12, 24]) {
    const g = mk(cells, cells), gg = ctx2d(g), id = gg.createImageData(cells, cells);
    for (let i = 0; i < id.data.length; i += 4) { id.data[i] = id.data[i + 1] = id.data[i + 2] = r() * 255; id.data[i + 3] = 255; }
    gg.putImageData(id, 0, 0);
    const up = mk(size, size), ug = ctx2d(up);
    ug.imageSmoothingEnabled = true; ug.imageSmoothingQuality = 'high'; ug.drawImage(g, 0, 0, size, size);
    const d = ug.getImageData(0, 0, size, size).data;
    for (let i = 0; i < size * size; i++) acc[i] = (acc[i] ?? 0) + (d[i * 4] ?? 0) / 255 * amp;
    tot += amp; amp *= 0.55;
  }
  const c = mk(size, size), cg = ctx2d(c), out = cg.createImageData(size, size), half = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x, dx = (x - half) / half, dy = (y - half) / half, fall = Math.pow(clamp(1 - Math.sqrt(dx * dx + dy * dy)), 1.25);
    const v = clamp(((acc[i] ?? 0) / tot - 0.4) * 3);
    out.data[i * 4] = 255; out.data[i * 4 + 1] = 244; out.data[i * 4 + 2] = 230; out.data[i * 4 + 3] = Math.round(255 * v * v * fall * 1.3);
  }
  cg.putImageData(out, 0, 0);
  return c;
}

export function makeSprites(steamVariants: number): Sprites {
  const shaft = mk(64, 256), sg = ctx2d(shaft);
  let gr = sg.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, 'rgba(255,196,120,0)'); gr.addColorStop(0.5, 'rgba(255,200,130,.9)'); gr.addColorStop(1, 'rgba(255,196,120,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 64, 256);
  sg.globalCompositeOperation = 'destination-in';
  gr = sg.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 64, 256);

  const grain = mk(256, 256), gg = ctx2d(grain), id = gg.createImageData(256, 256), r = rng(9);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  gg.putImageData(id, 0, 0);

  return {
    dot: radial(64, [[0, 'rgba(255,226,170,1)'], [0.25, 'rgba(255,205,130,.55)'], [1, 'rgba(255,190,110,0)']]),
    glow: radial(256, [[0, 'rgba(255,178,88,.95)'], [0.18, 'rgba(255,160,70,.5)'], [0.55, 'rgba(255,140,60,.12)'], [1, 'rgba(255,130,50,0)']]),
    lamp: radial(512, [[0, 'rgba(255,170,90,.55)'], [0.35, 'rgba(255,140,70,.22)'], [1, 'rgba(255,120,50,0)']]),
    bokeh: radial(128, [[0, 'rgba(255,214,150,.55)'], [0.62, 'rgba(255,205,140,.5)'], [0.86, 'rgba(255,215,160,.62)'], [1, 'rgba(255,200,130,0)']]),
    shaft,
    steam: Array.from({ length: steamVariants }, (_, i) => steamSprite(100 + i * 17, 128)),
    grain,
  };
}

/** blur without ctx.filter (Safari-safe): shrink in halves, then grow back in halves, so there are no blocky edges */
export function blurred(src: HTMLCanvasElement, k: number): HTMLCanvasElement {
  if (k <= 1) return src;
  let cur = src;
  const steps = Math.max(1, Math.round(Math.log2(k))), sizes: [number, number][] = [[src.width, src.height]];
  for (let i = 0; i < steps; i++) {
    const w = Math.max(2, Math.round(cur.width / 2)), h = Math.max(2, Math.round(cur.height / 2)), n = mk(w, h), g = ctx2d(n);
    g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, h); sizes.push([w, h]); cur = n;
  }
  for (let i = steps - 1; i >= 0; i--) {
    const [w = 2, h = 2] = sizes[i] ?? [], n = mk(w, h), g = ctx2d(n);
    g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, h); cur = n;
  }
  return cur;
}

export function scaledTo(img: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const c = mk(w, h), g = ctx2d(c);
  g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** The cutouts are studio shots; light them as if they stood in this room: warm key light from the upper left, shade and contact
 *  darkness toward the lower right, warm light bouncing up off the wood, and a thin warm rim on the lit edges. */
export function lit(src: HTMLCanvasElement, lift: number): HTMLCanvasElement {
  const w = src.width, h = src.height, c = mk(w, h), g = ctx2d(c);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(255,150,70,.07)'; g.fillRect(0, 0, w, h);
  let gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(255,205,140,.20)'); gr.addColorStop(0.5, 'rgba(255,190,120,0)'); gr.addColorStop(1, 'rgba(8,4,1,.40)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  gr = g.createLinearGradient(0, h * 0.72, 0, h); gr.addColorStop(0, 'rgba(8,4,1,0)'); gr.addColorStop(1, 'rgba(8,4,1,.42)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  gr = g.createLinearGradient(0, h * 0.84, 0, h); gr.addColorStop(0, 'rgba(255,130,50,0)'); gr.addColorStop(1, 'rgba(255,125,45,.20)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  const d = Math.max(1.5, h * 0.0035), rim = mk(w, h), rg = ctx2d(rim);
  rg.drawImage(src, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(src, d, d * 1.2);   // what is left is a thin band on the upper-left edges
  rg.globalCompositeOperation = 'source-atop'; rg.fillStyle = 'rgb(255,214,160)'; rg.fillRect(0, 0, w, h);
  g.globalAlpha = 0.5; g.drawImage(rim, 0, 0); g.globalAlpha = 1;
  if (lift) {
    const cp = mk(w, h);
    ctx2d(cp).drawImage(c, 0, 0);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = lift; g.drawImage(cp, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  return c;
}

export function silhouette(src: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const c = mk(src.width, src.height), g = ctx2d(c);
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#050302'; g.fillRect(0, 0, c.width, c.height);
  return blurred(c, k);
}

export function reflection(src: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const rh = Math.round(src.height * 0.4), c = mk(src.width, rh), g = ctx2d(c);
  g.save(); g.translate(0, src.height); g.scale(1, -1); g.drawImage(src, 0, 0); g.restore();
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, 0, 0, rh); gr.addColorStop(0, `rgba(0,0,0,${strength})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, src.width, rh);
  return blurred(c, 2);
}

/** the moss set, pushed warmer: candle-lit rather than cool */
export function gradePlate(img: HTMLImageElement): HTMLCanvasElement {
  const c = mk(img.naturalWidth, img.naturalHeight), g = ctx2d(c);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(255,226,190)'; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'soft-light';
  const gr = g.createRadialGradient(c.width * 0.5, c.height * 0.62, 0, c.width * 0.5, c.height * 0.62, c.width * 0.9);
  gr.addColorStop(0, 'rgba(255,150,60,.55)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  return c;
}

