// Crops and resizes the client's gallery and visit photos into public/img (jpg + webp + avif).
// Originals live in public/COZ Menu Images/photos (git-ignored). Run, then: node tools/gen-images.mjs
import sharp from 'sharp';

const src = decodeURIComponent(new URL('../public/COZ Menu Images/photos/', import.meta.url).pathname);
const out = new URL('../public/img/', import.meta.url).pathname;

// crop = square (or free) region of the original, in original pixels
const jobs = [
  { name: 'g-takeaway', file: '649597320_17934100053195881_6552656890952823397_n.webp', crop: { left: 0, top: 330, width: 1440, height: 1440 }, widths: [480, 840] },
  { name: 'g-blackcup', file: '653524301_18071605868646581_1447449542523708313_n.webp', crop: { left: 0, top: 250, width: 1440, height: 1440 }, widths: [480, 840] },
  { name: 'g-balance', file: '683633066_17951065122149030_3301434630436671686_n.jpg', crop: { left: 20, top: 610, width: 960, height: 960 }, widths: [480, 840] },
  { name: 'visit-evening', file: '743261887_18108020905967472_3016709464221205987_n.jpg', crop: null, widths: [480, 960] },
];

for (const j of jobs) {
  for (const w of j.widths) {
    let img = sharp(src + j.file).rotate();
    if (j.crop) img = img.extract(j.crop);
    img = img.resize({ width: w, withoutEnlargement: true });
    const base = `${out}${j.name}-${w}`;
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(base + '.jpg');
    await img.clone().webp({ quality: 78 }).toFile(base + '.webp');
    await img.clone().avif({ quality: 55 }).toFile(base + '.avif');
  }
  console.log('done', j.name);
}
