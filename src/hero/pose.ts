import { CUP_ROT } from './constants';
import { FX, T } from './config';
import { COARSE, reduced } from './env';
import { easeInOut, easeOutBack, easeOutCubic, easeInCubic, clamp, lerp, prog, smooth } from './math';
import { D, V, dyn } from './state';
import { flowAt } from './timeline';
import type { CupPose, LidState } from './types';

export const ptr = { x: 0, y: 0 };                  // smoothed pointer / tilt / float, -1..1 (set by the loop)
export const taps: number[] = [];                             // timeline times at which the cup was tapped

export function cupPose(t: number): CupPose {
  const SS = V.SS, p = prog(t, T.cupEnter);
  const enter = (V.viewBottom - V.cup.y) + V.DRAW_H * .5 + 30;
  let dy = (1 - easeOutBack(p, 1.15)) * enter;
  let rot = CUP_ROT + (1 - easeOutCubic(p)) * -.10;
  const th = t - D.hit;
  if (th > 0 && th < 1.6) dy += 4.2 * SS * Math.exp(-th * 6) * Math.sin(th * 24);
  dy += 2.4 * SS * Math.sin(Math.PI * prog(t, T.beanPress));                      // the bean settling dips it a little
  const pe = prog(t, [T.lidPress[1] - .21, T.lidPress[1]]);
  dy += 3.2 * SS * smooth(pe) * (1 - prog(t, [T.lidPress[1], T.lidPress[1] + .25]));   // the lid pressed on
  const fl = flowAt(t);
  dy += (Math.sin(t * 57) * .55 + Math.sin(t * 33 + 1) * .4) * fl;
  const c = prog(t, [T.lidPress[1], T.lidPress[1] + .24]);
  let sy = 1 - .022 * Math.sin(Math.PI * c), sx = 1 + .012 * Math.sin(Math.PI * c);
  // a tap on the cup: a small hop and a squash on landing
  for (const tp of taps) {
    const a = t - tp;
    if (a > 0 && a < 1.8) { const h = Math.exp(-3.4 * a) * Math.abs(Math.sin(a * 9.2)); dy -= 12 * SS * h; sy += .03 * Math.exp(-9 * a) * Math.sin(a * 40); sx -= .018 * Math.exp(-9 * a) * Math.sin(a * 40); }
  }
  const idle = reduced ? 0 : smooth(prog(t, [T.end, T.end + 1]));
  const mv = COARSE ? FX.floatMove : FX.pointerMove;
  const dxp = ptr.x * mv.x * SS * idle, dyp = ptr.y * mv.y * SS * idle;
  dy += Math.sin((t - T.end) * 1.3) * 3 * SS * idle + dyp;
  rot += ptr.x * mv.tilt * Math.PI / 180 * idle;
  let x = V.cup.x + dxp, y = V.cup.y + dy, sxx = sx, syy = sy;
  const par = { x: -dxp * FX.parallax, y: -dyp * FX.parallax };
  if (dyn.dockE > 0) {                                                                 // first scroll: the cup shrinks into the header
    const e = easeInOut(dyn.dockE), k = Math.exp(Math.log(V.dock.scale) * e);
    x = lerp(x, V.dock.x, e); y = lerp(y, V.dock.y, e) - Math.sin(Math.PI * e) * 26 * SS; rot = lerp(rot, 0, e);
    sxx *= k; syy *= k;
  }
  return { x, y, rot, sx: sxx, sy: syy, par };
}

/* ---------- the lid: swoops in from the side, tips, hooks one edge on the rim, presses on ---------- */
export function lidState(t: number): LidState {
  const L = V.lid, SS = V.SS;
  const a = prog(t, T.lidIn), q = prog(t, T.lidPress);
  const ex = easeInOut(a), ey = easeOutCubic(a);
  let x = lerp(L.x, 0, ex), y = lerp(L.y, L.hoverY, ey);
  let rot = lerp(L.rot, L.hookRot, smooth(a)), scale = lerp(L.scale, 1, smooth(a));
  y = lerp(y, 0, easeInCubic(q)); rot *= 1 - smooth(q);                          // pressing: sinks onto the rim
  const m = 1 - smooth(clamp((a - .55) / .45));                                  // turns about its middle in flight, about the hooked edge at the end
  const c = prog(t, [T.lidPress[1], T.lidPress[1] + .28]);
  const sway = (1 - q) * Math.min(1, a * 4);
  const u = clamp(Math.hypot(x, y) / (140 * SS));
  return {
    x: x + 4 * Math.sin(t * 2.3) * sway,
    y: y + 5 * Math.sin(t * 2.9) * sway + 1.6 * Math.sin(Math.PI * c) * Math.exp(-c * 2),
    rot: rot + .02 * Math.sin(t * 1.9) * sway, scale: scale - .012 * Math.sin(Math.PI * c),
    m, u, lift: Math.min(1, u * 1.4),
    visible: t >= T.lidIn[0], seated: t >= T.lidPress[1] + .12
  };
}
