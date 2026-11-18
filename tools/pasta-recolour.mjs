// Recolours the Spicy Arrabbiata photo into the other penne dishes, so all pasta cards share one bowl, angle and light.
// Only the warm (red / orange) pasta and sauce pixels change; the green bowl, the parsley and the white background stay identical.
//   node tools/pasta-recolour.mjs            -> writes originals/Alfredo Pasta.png and originals/Creamy Tomato Pasta.png
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/COZ Menu Images/originals/', import.meta.url));
const SRC = dir + 'Spicy Arrabbiata Pasta.png';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** how strongly a pixel belongs to the pasta / sauce: warm hue and enough colour (the bowl is green, the backdrop grey-white) */
function warmth(h, s, l) {
  const hueIn = h <= 52 ? 1 - smooth(40, 52, h) : h >= 335 ? smooth(335, 350, h) : 0;
  // the shaded inside of the green bowl reads as dark olive (hue 30-50, lightness < .22): pasta that colour is always lighter
  const notBowl = h >= 335 || h < 24 ? 1 : smooth(0.2, 0.28, l);
  return hueIn * smooth(0.22, 0.42, s) * notBowl;
}

const looks = {
  // Alfredo: creamy ivory sauce, the darker tomato bits read as folds of sauce
  'Alfredo Pasta': (h, s, l) => {
    // keep the original light and shade (lifted), so penne ridges and folds of sauce stay visible
    const nl = Math.min(0.92, 0.35 + l * 0.8);
    return hsl2rgb(36 + nl * 6, 0.34 + 0.22 * (1 - nl), nl);
  },
  // Creamy tomato: the same sauce softened with cream, orange-pink rather than deep red
  'Creamy Tomato Pasta': (h, s, l) => {
    const nh = 14 + (Math.min(h, 52) / 52) * 16; // keep some variation between pasta (lighter, yellower) and sauce
    return hsl2rgb(h > 300 ? 12 : nh, Math.min(0.75, s * 0.72), Math.min(0.82, l * 0.82 + 0.2));
  },
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (const [name, look] of Object.entries(looks)) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const [h, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
    const w = warmth(h, s, l);
    if (w <= 0) continue;
    const [r, g, b] = look(h, s, l);
    out[i] = data[i] + (r - data[i]) * w;
    out[i + 1] = data[i + 1] + (g - data[i + 1]) * w;
    out[i + 2] = data[i + 2] + (b - data[i + 2]) * w;
  }
  await sharp(out, { raw: info }).png().toFile(`${dir}${name}.png`);
  console.log(name);
}
