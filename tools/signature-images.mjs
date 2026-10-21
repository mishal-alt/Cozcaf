// Crops the three signature dish photos to one 4:5 framing and writes responsive jpg/webp/avif to public/img.
// Source: public/COZ Menu Images/Signature/raw/close_*.png   Run: node tools/signature-images.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/COZ Menu Images/Signature/raw/', import.meta.url));
const out = new URL('../public/img/', import.meta.url).pathname;
const WIDTHS = [480, 960, 1200];
// crop windows chosen so each dish rests on a similar baseline (~80-87% down) with room above; the corner crop also drops the small sparkle mark in the source files
const shots = [
  { name: 'sig-rose-latte', file: 'close_a.png', crop: { left: 148, top: 354, width: 1560, height: 1950 } },
  { name: 'sig-piccolo', file: 'close_b.png', crop: { left: 100, top: 420, width: 1500, height: 1875 } },
  { name: 'sig-alfredo', file: 'close_c.png', crop: { left: 0, top: 0, width: 1720, height: 2150 } },
];

for (const s of shots) {
  const base = sharp(dir + s.file).extract(s.crop);
  for (const w of WIDTHS) {
    const r = base.clone().resize(w, Math.round(w * 1.25), { kernel: 'lanczos3' });
    await r.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(`${out}${s.name}-${w}.jpg`);
    await r.clone().webp({ quality: 84 }).toFile(`${out}${s.name}-${w}.webp`);
    await r.clone().avif({ quality: 62 }).toFile(`${out}${s.name}-${w}.avif`);
  }
  console.log(s.name);
}
