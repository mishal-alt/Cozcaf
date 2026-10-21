import { D, V } from './state';
import { LOW_END } from './env';
import { Q } from './config';
import { TAU, rng } from './math';
import { flowAt, landingAt, restPose } from './timeline';
import type { Point } from './types';

export interface Splash { b: number; life: number; ang: number; sp: number; r: number; ox: number; big: boolean; f: number; o: Point }
export let splash: Splash[] = [];
export function buildSplash(): void {
  const n = LOW_END || V.tall ? Q.splashMobile : Q.splashDesktop, R = rng(11), rest = restPose();
  const t0 = D.hit - .05, span = Math.max(.5, D.tailEnd - .15 - t0);
  splash = Array.from({ length: n }, (_, i): Splash => {
    const q = { b: t0 + i * span / n, life: .5 + R() * .55, ang: -Math.PI / 2 + (R() - .5) * 1.9, sp: 140 + R() * 330, r: .8 + R() * 2.3, ox: (R() - .5) * 26, big: R() > .8 };
    return { ...q, f: flowAt(q.b), o: landingAt(rest, q.b) };
  });
}
const Rb = rng(5);
export const bubbles = Array.from({ length: 84 }, () => {
  const edge = Rb() < .62;
  return { r: edge ? .72 + .26 * Rb() : Math.sqrt(Rb()) * .7, a: Rb() * TAU, s: .8 + Rb() * 2.5, k: Rb(), v: (Rb() - .5) * .5 };
});
const Rf = rng(9);
export const foam = Array.from({ length: 22 }, () => ({ a: Rf() * TAU, r: .15 + .85 * Rf(), s: 1 + Rf() * 2.6, v: (Rf() < .5 ? -1 : 1) * (.6 + Rf()) }));
const Rw = rng(21);
export const drips = Array.from({ length: 11 }, (_, i) => ({ x: -.8 + 1.6 * (i + Rw() * .7) / 11, len: 5 + Rw() * 16, w: .8 + Rw() * 1.6, d: Rw() * .5 }));
export const specks = Array.from({ length: 46 }, () => ({ a: Rw() * TAU, r: .55 + .45 * Rw(), s: .3 + Rw() * .5 }));
