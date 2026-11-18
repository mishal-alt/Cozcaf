// Builds the Signature "Alfredo Pasta" photo: the original scene (wall, napkin, sage bowl, light) is kept pixel for pixel,
// and only the spaghetti is swapped for the menu card's white Alfredo penne (tools/pasta-recolour.mjs), so both cards show one dish.
//   node tools/signature-alfredo.mjs   -> Signature/raw/close_c.png   (then: node tools/signature-images.mjs && node tools/gen-images.mjs)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/COZ Menu Images/', import.meta.url));
const SCENE = root + 'Signature/raw/old/close_c (spaghetti).png';
const PENNE = root + 'originals/Alfredo Pasta.png';
const WARM_SRC = root + 'originals/Spicy Arrabbiata Pasta.png'; // the pasta mask is found on the red original, where it is unambiguous
const OUT = root + 'Signature/raw/close_c.png';

// where the new mound sits in the scene (scene pixels): centre x, bottom y (hidden by the front rim), width
const PLACE = { cx: 965, bottom: 1660, width: 1360 };
const GRADE = [1.03, 1.0, 0.94]; // warm the cool studio penne into the scene's window light

const rawOf = async (f) => sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const hsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};

// 1. penne mask: warm pixels of the red original, closed so parsley flecks inside the mound are kept
const warm = await rawOf(WARM_SRC);
const { width: PW, height: PH } = warm.info;
let pm = Buffer.alloc(PW * PH);
for (let p = 0, i = 0; p < PW * PH; p++, i += 3) {
  const [h, s, l] = hsl(warm.data[i], warm.data[i + 1], warm.data[i + 2]);
  const hueIn = h <= 45 || h >= 335;
  const notBowl = h >= 335 || h < 24 || l > 0.25;
  pm[p] = hueIn && s > 0.3 && notBowl ? 255 : 0;
}
// close (dilate then erode) with blur + threshold, then feather the edge
const raw1 = { raw: { width: PW, height: PH, channels: 1 } };
const mono = (img) => img.extractChannel(0).raw().toBuffer(); // sharp turns 1-channel input into sRGB; keep masks single-channel
pm = await mono(sharp(await mono(sharp(pm, raw1).blur(10).threshold(40)), raw1).blur(10).threshold(215));
// fill every hole enclosed by the mound (parsley, pepper, deep shadows between penne): flood the outside from the border
{
  const out = new Uint8Array(PW * PH), stack = [];
  for (let x = 0; x < PW; x++) stack.push(x, (PH - 1) * PW + x);
  for (let y = 0; y < PH; y++) stack.push(y * PW, y * PW + PW - 1);
  while (stack.length) {
    const p = stack.pop(); if (out[p] || pm[p] > 128) continue; out[p] = 1;
    const x = p % PW;
    if (x > 0) stack.push(p - 1); if (x < PW - 1) stack.push(p + 1); if (p >= PW) stack.push(p - PW); if (p < PW * (PH - 1)) stack.push(p + PW);
  }
  for (let p = 0; p < PW * PH; p++) pm[p] = out[p] ? 0 : 255;
}
pm = await mono(sharp(pm, raw1).blur(1.5));
let x0 = PW, x1 = 0, y0 = PH, y1 = 0;
for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (pm[y * PW + x] > 128) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const bw = x1 - x0 + 1, bh = y1 - y0 + 1;

// penne RGBA cut, warm graded
const pen = await rawOf(PENNE);
const cut = Buffer.alloc(bw * bh * 4);
for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
  const s = ((y + y0) * PW + x + x0), d = (y * bw + x) * 4;
  for (let c = 0; c < 3; c++) cut[d + c] = Math.min(255, pen.data[s * 3 + c] * GRADE[c]);
  cut[d + 3] = pm[s];
}
const scale = PLACE.width / bw, tw = Math.round(bw * scale), th = Math.round(bh * scale);
const penne = await sharp(cut, { raw: { width: bw, height: bh, channels: 4 } }).resize(tw, th, { kernel: 'lanczos3' }).png().toBuffer();
const left = Math.round(PLACE.cx - tw / 2), top = PLACE.bottom - th;

// 2. scene: paint the old spaghetti out with the bowl's own interior tone (mask-weighted local average of non-pasta pixels)
const scene = await rawOf(SCENE);
const { width: W, height: H } = scene.info;
const inBowl = (x, y) => ((x - 935) / 830) ** 2 + ((y - 1230) / 330) ** 2 < 1; // the bowl's opening
const isPasta = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3, r = scene.data[i], g = scene.data[i + 1], b = scene.data[i + 2];
  isPasta[y * W + x] = inBowl(x, y) && r > 150 && r - g > 4 && !(g > r) ? 1 : 0;
}
// the front rim: for each column, the lowest pasta pixel is where the pasta met the rim; below it is bowl, kept from the original
const rimY = new Int32Array(W).fill(-1);
for (let x = 0; x < W; x++) for (let y = 1750; y > 950; y--) if (isPasta[y * W + x]) { rimY[x] = y; break; }
// smooth the rim line (median then mean) so stray strands do not notch it
const sm = new Int32Array(W).fill(-1);
for (let x = 0; x < W; x++) {
  const win = []; for (let k = -40; k <= 40; k++) { const v = rimY[x + k]; if (v > 0) win.push(v); }
  if (win.length > 20) { win.sort((a, b) => a - b); sm[x] = win[Math.floor(win.length * 0.6)]; }
}
const F = 8, w8 = Math.ceil(W / F), h8 = Math.ceil(H / F);
const acc = new Float64Array(w8 * h8 * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (isPasta[y * W + x] || !inBowl(x, y)) continue;
  const i = (y * W + x) * 3, j = (Math.floor(y / F) * w8 + Math.floor(x / F)) * 4;
  acc[j] += scene.data[i]; acc[j + 1] += scene.data[i + 1]; acc[j + 2] += scene.data[i + 2]; acc[j + 3]++;
}
// spread the averages outward until every cell inside the bowl has a colour
const fill = new Float64Array(w8 * h8 * 3), has = new Uint8Array(w8 * h8);
for (let j = 0; j < w8 * h8; j++) if (acc[j * 4 + 3] > 4) { for (let c = 0; c < 3; c++) fill[j * 3 + c] = acc[j * 4 + c] / acc[j * 4 + 3]; has[j] = 1; }
for (let pass = 0; pass < 80; pass++) {
  let changed = false;
  for (let y = 0; y < h8; y++) for (let x = 0; x < w8; x++) {
    const j = y * w8 + x; if (has[j]) continue;
    let n = 0, s = [0, 0, 0];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (y + dy) * w8 + x + dx; if (x + dx >= 0 && x + dx < w8 && y + dy >= 0 && y + dy < h8 && has[k] === 1) { n++; for (let c = 0; c < 3; c++) s[c] += fill[k * 3 + c]; } }
    if (n) { for (let c = 0; c < 3; c++) fill[j * 3 + c] = s[c] / n; has[j] = 2; changed = true; }
  }
  for (let j = 0; j < has.length; j++) if (has[j] === 2) has[j] = 1;
  if (!changed) break;
}
const fillImg = await sharp(Buffer.from(fill.map((v) => Math.round(v))), { raw: { width: w8, height: h8, channels: 3 } })
  .blur(3).resize(W, H, { kernel: 'cubic' }).raw().toBuffer();
// soften the painted-out mask so its edge does not show, then blend
let pmask = Buffer.alloc(W * H);
for (let p = 0; p < W * H; p++) pmask[p] = isPasta[p] ? 255 : 0;
const rawW = { raw: { width: W, height: H, channels: 1 } };
pmask = await mono(sharp(await mono(sharp(pmask, rawW).blur(6).threshold(20)), rawW).blur(4));
const base = Buffer.from(scene.data);
for (let p = 0, i = 0; p < W * H; p++, i += 3) {
  const a = pmask[p] / 255; if (!a) continue;
  for (let c = 0; c < 3; c++) base[i + c] = base[i + c] * (1 - a) + fillImg[i + c] * a;
}

// 3. soft shadow under the mound, the penne itself, then the original front rim back on top
const shadowA = await mono(sharp(await sharp(penne).extractChannel(3).raw().toBuffer(), { raw: { width: tw, height: th, channels: 1 } }).blur(26).linear(0.5, 0));
const shadow = Buffer.alloc(tw * th * 4);
for (let p = 0; p < tw * th; p++) { shadow[p * 4] = 40; shadow[p * 4 + 1] = 42; shadow[p * 4 + 2] = 30; shadow[p * 4 + 3] = shadowA[p]; }
const shadowPng = await sharp(shadow, { raw: { width: tw, height: th, channels: 4 } }).png().toBuffer();
let comp = await sharp(base, { raw: { width: W, height: H, channels: 3 } })
  .composite([{ input: shadowPng, left: left + 18, top: top + 22 }, { input: penne, left, top }]).removeAlpha().raw().toBuffer();

const rim = Buffer.alloc(W * H * 4);
for (let x = 0; x < W; x++) {
  const ry = sm[x]; if (ry < 0) continue;
  for (let y = ry - 6; y < H; y++) {
    const i = (y * W + x) * 3, o = (y * W + x) * 4, a = Math.min(1, (y - (ry - 6)) / 12);
    rim[o] = scene.data[i]; rim[o + 1] = scene.data[i + 1]; rim[o + 2] = scene.data[i + 2]; rim[o + 3] = Math.round(a * 255);
  }
}
const rimPng = await sharp(rim, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
await sharp(comp, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: rimPng }]).png().toFile(OUT);
console.log('penne', tw, 'x', th, 'at', left, top, '-> close_c.png');
