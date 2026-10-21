import { DEPTH, IMG_H, IMG_W, RIM, G, CUP_ROT } from './constants';
import { MOTION, T } from './config';
import { clamp, easeInOut, easeOutCubic, prog, smooth } from './math';
import { D, V } from './state';
import type { Point, Pose } from './types';

export const toWorld = (p: Pose, ix: number, iy: number): Point => {
  const lx = (ix - IMG_W/2) * V.SC * p.sx, ly = (iy - IMG_H/2) * V.SC * p.sy, c = Math.cos(p.rot), s = Math.sin(p.rot);
  return { x: p.x + lx*c - ly*s, y: p.y + lx*s + ly*c };
};

export const restPose = (): Pose => ({ x: V.cup.x, y: V.cup.y, rot: CUP_ROT, sx: 1, sy: 1 });

/* how full the cup is (0..1) */
export function levelAt(t: number): number {
  const p = prog(t, [D.hit, T.release + .15]);
  if (p <= 0) return 0;
  const hidden = easeOutCubic(clamp(p / .5)) * .80;                      // under the front wall
  const shown = smooth(clamp((p - .5) / .5)) * (MOTION.fillMax - .80);  // rising into view
  return hidden + shown;
}

export const landingAt = (p: Pose, t: number): Point => toWorld(p, RIM.cx, RIM.cy + (1 - levelAt(t)) * DEPTH);

/* timings that depend on where the cup sits */
export function derive(): void {
  const rim = toWorld(restPose(), RIM.cx, RIM.cy + 12);
  D.rimY = rim.y; D.landX = rim.x;
  const L0 = rim.y - V.navY, v0 = MOTION.startSpeed;
  D.drip = T.fall - .02;
  D.hit = T.fall + (-v0 + Math.sqrt(v0 * v0 + 2 * G * L0)) / G;
  D.tailEnd = T.release + Math.sqrt(2 * (L0 + 30) / G);
}

/* how strong the pour is (0..1) */
export function flowAt(t: number): number {
  if (t < T.fall || t > D.tailEnd) return 0;
  const fr = easeOutCubic(prog(t, [T.fall, T.fall + .55]));
  const th = 1 - .6 * easeInOut(prog(t, [T.thin, T.release]));
  return fr * th;
}
