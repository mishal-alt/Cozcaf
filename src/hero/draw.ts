import { ctx } from './canvas';
import { IMG_H, IMG_W } from './constants';
import { TAU } from './math';
import { V } from './state';
import type { Pose } from './types';

/** draw in cup.png pixel coordinates, following the cup's pose */
export function inImg(p: Pose, fn: () => void): void {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.sx * V.SC, p.sy * V.SC); ctx.translate(-IMG_W/2, -IMG_H/2); fn(); ctx.restore();
}

export const ell = (cx: number, cy: number, a: number, b: number, phi: number, a0 = 0, a1 = TAU): void => { ctx.beginPath(); ctx.ellipse(cx, cy, a, b, phi, a0, a1); };
