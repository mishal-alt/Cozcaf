import { CONFIG } from './config';

/* ---------- geometry of the real hero (cup.png is 341 x 512) ---------- */
export const IMG_W = 341;
export const IMG_H = 512;
export const SC0 = 520 / 512;
export const CUP_ROT = (-5 * Math.PI) / 180;
/** the open top of the cup, in cup.png pixels */
export const RIM = { cx: 170, cy: 137, a: 119, b: 24, phi: -0.134 };
/** outer edge of the rolled lip */
export const RO = { a: RIM.a + 2.4, b: RIM.b + 1.7 };
/** inner edge of the lip = the opening */
export const RI = { a: RIM.a - 5.4, b: RIM.b - 3.7 };
/** cup depth in cup.png pixels */
export const DEPTH = 330;
/** the lid's sip hole */
export const HOLE_IMG = { x: 65, y: 80 };
/** where lid.png sits on cup.png */
export const LID = { x: 34, y: 41, w: 270, h: 129 };
export const G = CONFIG.motion.gravity;

/** the printed COZCAF lettering (part of the cup) and the logo the seed turns into */
export const INK: { bean: [number, number, number, number]; letters: [number, number, number, number][] } = {
  bean: [138, 230, 220, 329],
  letters: [[104, 337, 129, 377], [131, 336, 159, 380], [160, 335, 188, 379], [189, 334, 217, 375], [220, 331, 247, 372], [247, 325, 269, 367]],
};
export const MORPH = {
  wx: 1.0337835470497452,
  cx: 180.59088134765625,
  cy: 277.9753112792969,
  rot: -0.025999642774116444,
  len: 89.82221221923828,
  x0: 124,
  y0: 216,
  w: 110,
  h: 127,
  S: 3,
  range: 10,
};

/** bean sprite sheet grid; len = the bean's long axis in the sprite (px) */
export const BEAN = { NF: 32, cols: 8, fw: 160, fh: 208, len: 192 };

/** the big lettering is the real logo lettering (vector), so its proportions are constants, in units of the capital height:
    letter widths, natural letter gaps, extra tracking used on phones */
export const BIG = { wCOZ: [0.514, 0.543, 0.528], wCAF: [0.514, 0.648, 0.453], gCOZ: 0.468, gCAF: 0.401, trkTall: 1.5 };
