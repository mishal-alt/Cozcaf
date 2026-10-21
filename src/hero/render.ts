import { cv, ctx, resetView } from './canvas';
import { Q } from './config';
import { LOW_END } from './env';
import { drawClosedCup, drawOpenCup } from './cup';
import { drawBean } from './bean';
import { drawLid } from './lid';
import { arrive } from './page';
import { cupPose, lidState } from './pose';
import { drawSplash, drawStream } from './pour';
import { V, dyn, view } from './state';
import { drawSteam } from './steam';

/* ---------- one frame = one pure function of time ---------- */
export function render(t: number): void {
  const p = cupPose(t); dyn.lastPose = p;
  arrive(t, p.par);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); resetView();
  ctx.imageSmoothingQuality = 'high';
  const ls = lidState(t);
  if (ls.seated) drawClosedCup(p); else drawOpenCup(t, p, ls);
  drawStream(t, p);
  drawSplash(t, p);
  drawBean(t);
  if (ls.visible && !ls.seated) drawLid(p, ls);
  drawSteam(t, p);
}

/* ---------- canvas size: capped resolution, adaptive if the frame rate sags ---------- */
export function sizeCanvas(): void {
  const maxPx = LOW_END ? Q.pixelsMobile : Q.pixelsDesktop;
  let dpr = Math.min(window.devicePixelRatio || 1, LOW_END ? Q.dprMobile : Q.dprDesktop, dyn.dprCap);
  if (V.vw * V.vh * dpr * dpr > maxPx) dpr = Math.sqrt(maxPx / (V.vw * V.vh));
  V.dpr = dpr; V.K = dpr * V.s;
  cv.width = Math.round(V.vw * dpr); cv.height = Math.round(V.vh * dpr);
  view.VT = [dpr * V.s, 0, 0, dpr * V.s, dpr * V.ox, dpr * V.oy];
}
