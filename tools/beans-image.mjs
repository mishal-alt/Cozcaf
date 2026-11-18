// Prints the real COZCAF mark on the plain bean-pouch photo (generated without text, since generated lettering is never right).
//   node tools/beans-image.mjs  -> originals/COZCAF Beans.png
// then cut it out and build the card like a dish:  swift tools/cutout.swift ... && node tools/menu-images.mjs <dir>
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { printedLogo } from './logo-print.mjs';

const dir = fileURLToPath(new URL('../public/COZ Menu Images/originals/', import.meta.url));
const src = dir + 'figma/COZCAF Beans.png';
const { width: w } = await sharp(src).metadata();
// the pouch front spans roughly x 30%-72% of the frame; the label sits centred on it, a little above the middle
const { img, W, H } = await printedLogo(Math.round(w * 0.22));
const lw = await sharp(img).ensureAlpha().linear([1, 1, 1, 0.94], [0, 0, 0, 0]).png().toBuffer(); // a hair of transparency so it reads as print on matte foil
await sharp(src).composite([{ input: lw, left: Math.round(w * 0.505 - W / 2), top: Math.round(w * 0.43 - H / 2) }]).png().toFile(dir + 'COZCAF Beans.png');
console.log('COZCAF Beans.png');
