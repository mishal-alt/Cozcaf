// The COZCAF mark as a printed label (bean on top, lettering below), for putting the real logo on product photos.
import sharp from 'sharp';
import { ICON_PATH, WORD_PATH } from '../src/components/logo-paths.ts';

/** a transparent PNG of the mark, `width` px wide, in cream (like a printed cup) unless another fill is given */
export async function printedLogo(width, fill = '#F4EEDD') {
  const svg = (box, d, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${w}" height="${h}"><path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`);
  const iconH = Math.round(width * 0.34), iconW = Math.round(iconH * 48 / 63);
  const wordH = Math.round(width * 0.17), wordW = Math.round(wordH * 306 / 63);
  const icon = await sharp(svg('127 310 48 63', ICON_PATH, iconW, iconH), { density: 72 }).png().toBuffer();
  const word = await sharp(svg('175 310 306 63', WORD_PATH, wordW, wordH), { density: 72 }).png().toBuffer();
  const gap = Math.round(width * 0.07);
  const W = Math.max(iconW, wordW), H = iconH + gap + wordH;
  const img = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: icon, left: Math.round((W - iconW) / 2), top: 0 }, { input: word, left: Math.round((W - wordW) / 2), top: iconH + gap }]).png().toBuffer();
  return { img, W, H };
}
