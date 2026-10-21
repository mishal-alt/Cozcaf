// Grabs one still from each clip in public/video and saves it as a poster (jpg + webp) next to the video.
// Needs the dev server on :4321 and Chrome (no ffmpeg required). Run:  node tools/video-posters.mjs
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const clips = [
  { name: 'craft-reel', at: 0.7 },
  { name: 'iced-latte', at: 0.6 },
  { name: 'espresso-shot', at: 1.2 },
];
const out = decodeURIComponent(new URL('../public/video/', import.meta.url).pathname);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto('http://localhost:4321/');
for (const { name, at } of clips) {
  const dataUrl = await page.evaluate(async ({ name, at }) => {
    const v = document.createElement('video');
    v.muted = true; v.src = `/video/${name}.mp4`;
    await new Promise((ok, no) => { v.onloadeddata = ok; v.onerror = () => no(new Error('load')); });
    v.currentTime = at; await new Promise((ok) => (v.onseeked = ok));
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    return c.toDataURL('image/png');
  }, { name, at });
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  await sharp(buf).jpeg({ quality: 80, mozjpeg: true }).toFile(`${out}${name}.jpg`);
  await sharp(buf).webp({ quality: 78 }).toFile(`${out}${name}.webp`);
  console.log('poster', name);
}
await browser.close();
