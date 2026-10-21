import { ctx } from './canvas';
import { imgs } from './assets';
import { IMG_H, IMG_W } from './constants';
import { tick } from './math';
import { V } from './state';

export interface ShadowSprite { c: HTMLCanvasElement; pad: number; w: number; h: number; offY: number }
export interface ShadowSet { body: ShadowSprite; cup: ShadowSprite; lid: ShadowSprite }

function shadowSprite(img: HTMLImageElement, blur: number, offY: number, alpha: number): ShadowSprite {
  const q = .5, pad = Math.ceil(blur * 1.6 + offY + 12), nw = img.naturalWidth || IMG_W, nh = img.naturalHeight || IMG_H;
  const c = document.createElement('canvas'); c.width = Math.ceil((nw + pad * 2) * q); c.height = Math.ceil((nh + pad * 2) * q);
  const g = c.getContext('2d') as CanvasRenderingContext2D, OFFX = 6000;
  g.shadowColor = `rgba(20,28,16,${alpha})`; g.shadowBlur = blur * q; g.shadowOffsetX = OFFX; g.shadowOffsetY = offY * q;
  g.drawImage(img, pad * q - OFFX, pad * q, nw * q, nh * q);
  return { c, pad, w: c.width / q, h: c.height / q, offY };
}
export const halve = (src: CanvasImageSource, w: number, h: number): HTMLCanvasElement => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d') as CanvasRenderingContext2D; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, w, h); return c; };
export let SH: ShadowSet;
export let cupSm: HTMLCanvasElement;
export function buildSprites(): void {
  const SC = V.SC;
  SH = { body: shadowSprite(imgs.body, 35 / SC, 25 / SC, .7), cup: shadowSprite(imgs.cup, 35 / SC, 25 / SC, .7), lid: shadowSprite(imgs.lid, 30 / SC, 20 / SC, .5) };
  if (!cupSm) { const a = halve(imgs.cup, 171, 256); cupSm = halve(a, 86, 128); }
}
export async function buildSpritesAsync(): Promise<void> {                      // the same sprites, one per task, so no single task blocks the page
  const SC = V.SC; SH = {} as ShadowSet;
  SH.body = shadowSprite(imgs.body, 35 / SC, 25 / SC, .7); await tick();
  SH.cup = shadowSprite(imgs.cup, 35 / SC, 25 / SC, .7); await tick();
  SH.lid = shadowSprite(imgs.lid, 30 / SC, 20 / SC, .5); await tick();
  if (!cupSm) { const a = halve(imgs.cup, 171, 256); await tick(); cupSm = halve(a, 86, 128); }
}
export const drawShadow = (s: ShadowSprite, x = 0, y = 0, dy = 0): void => ctx.drawImage(s.c, x - s.pad, y - s.pad + dy, s.w, s.h);
