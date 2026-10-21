import { ctx, resetView } from './canvas';
import { IMG_H, IMG_W, RI, RIM, G } from './constants';
import { MOTION, T } from './config';
import { clamp, easeInOut, lerp, prog, smooth } from './math';
import { splash } from './scatter';
import { D, V } from './state';
import { flowAt, landingAt } from './timeline';
import type { Pose } from './types';

/* ---------- the pour ---------- */
function clipAboveLip(p: Pose, pad: number, extra: number): void {
  ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.sx * V.SC, p.sy * V.SC); ctx.translate(-IMG_W/2, -IMG_H/2);
  const ai = RI.a + pad, bi = RI.b + (pad ? 1 : 0), c = Math.cos(RIM.phi), s2 = Math.sin(RIM.phi);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const th = Math.PI * i / 24, u = ai * Math.cos(th), v = bi * Math.sin(th);
    const X = RIM.cx + u * c - v * s2, Y = RIM.cy + .6 + u * s2 + v * c;
    i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
  }
  ctx.lineTo(RIM.cx - ai - 300, RIM.cy + .6 - ai * .134 + extra); ctx.lineTo(RIM.cx - ai - 300, -3000); ctx.lineTo(RIM.cx + ai + 300, -3000); ctx.lineTo(RIM.cx + ai + 300, RIM.cy + .6 + ai * .134 + extra);
  ctx.closePath(); ctx.clip();
  resetView();
}
export function drawStream(t: number, p: Pose): void {
  if (t < D.drip || t > D.tailEnd) return;
  const land = landingAt(p, t);
  const y0 = V.navY, yEnd = land.y, sx = D.landX;
  const hang = 0, HW = MOTION.streamHalfWidth * V.SS, v0 = MOTION.startSpeed;
  const dp = easeInOut(prog(t, [D.drip, T.fall]));
  let yh;
  if (t < T.fall) yh = y0 + 6 + (hang - 6) * dp;
  else { const tau = t - T.fall; yh = Math.min(yEnd, y0 + hang + v0 * tau + .5 * G * tau * tau); }
  let yt = y0 - 8, attached = true;
  if (t >= T.release) { const tau = t - T.release; yt = y0 + .5 * G * tau * tau; attached = false; }
  if (yt >= yEnd) return;
  const fl = t < T.fall ? .12 + .2 * dp : Math.max(flowAt(t), .06);
  const bulbR = t < T.fall ? 30 * (.3 + .7 * dp) : 26;
  const capped = yh >= yEnd;
  const yStop = Math.min(yh, yEnd);
  const neck = t < T.fall ? lerp(.2, .38, dp) : 1;       // thin neck while the first drop swells

  const pts: [number, number, number][] = [];
  for (let y = yt; ; y += 3) {
    if (y > yStop) y = yStop;
    const s = Math.max(0, y - y0);
    const ratio = Math.sqrt(v0 / Math.sqrt(v0 * v0 + 2 * G * s));       // a falling stream narrows
    let w = HW * fl * ratio * neck;
    w *= 1 + .07 * Math.sin(y * .05 - t * 12) + .035 * Math.sin(y * .11 - t * 21);
    if (!capped) {
      const g = bulbR * Math.exp(-Math.pow(y - (yh - bulbR * 1.25), 2) / (2 * Math.pow(bulbR * .95, 2)));
      w = Math.max(w, g);
      const d = yh - y;
      if (d < bulbR) w *= Math.sqrt(Math.max(0, 1 - Math.pow((bulbR - d) / bulbR, 2)));
    }
    if (attached) w += 15 * Math.exp(-s / 16) * Math.min(1, fl + .1) * V.SS;
    else {
      const u = smooth(Math.min(1, (y - yt) / 46));
      w *= Math.pow(u, .6);
      w = Math.max(w, 15 * V.SS * Math.exp(-Math.pow(y - (yt + 34), 2) / (2 * 15 * 15)) * Math.min(1, (y - yt) / 14));
    }
    const k = clamp((y - y0) / Math.max(1, yEnd - y0));
    const x = sx + (land.x - sx) * k * k + 1.2 * Math.sin(y * .03 - t * 6) * k;
    pts.push([x, y, Math.max(w, 0)]);
    if (y >= yStop) break;
  }
  const path = (kL: number, kR: number): void => {
    ctx.beginPath();
    pts.forEach(([x, y, w], i) => { const px = x + kL * w; i ? ctx.lineTo(px, y) : ctx.moveTo(px, y); });
    for (let i = pts.length - 1; i >= 0; i--) { const [x, y, w] = pts[i]; ctx.lineTo(x + kR * w, y); }
    ctx.closePath();
  };
  ctx.save();
  clipAboveLip(p, 0, 40);                                  // keep the stream behind the near lip of the cup
  // body of the pour: amber where it is thin at the edges, near-black in the core
  path(-1, 1); ctx.fillStyle = '#7f4719'; ctx.fill();
  path(-.93, .93); ctx.fillStyle = '#5a2f11'; ctx.fill();
  path(-.8, .8); ctx.fillStyle = '#3a1c09'; ctx.fill();
  path(-.56, .52); ctx.fillStyle = '#1f0e04'; ctx.fill();
  path(.52, .9); ctx.fillStyle = 'rgba(214,138,66,.5)'; ctx.fill();               // light coming through the far side
  path(-.97, -.86); ctx.fillStyle = 'rgba(255,208,140,.45)'; ctx.fill();          // thin bright edge
  path(-.66, -.46); ctx.fillStyle = 'rgba(255,238,206,.55)'; ctx.fill();          // main specular streak
  path(-.6, -.54); ctx.fillStyle = 'rgba(255,252,244,.8)'; ctx.fill();
  // moving flow lines inside the pour
  path(-1, 1); ctx.clip();
  for (let k = 0; k < 6; k++) {
    const f = -.75 + k * .3, ph = k * 1.7;
    ctx.beginPath();
    pts.forEach(([x, y, w], i) => { const px = x + f * w + 1.6 * Math.sin(y * .045 - t * (11 + k * 2) + ph) * Math.min(1, w / 8); i ? ctx.lineTo(px, y) : ctx.moveTo(px, y); });
    ctx.strokeStyle = k % 2 ? 'rgba(255,224,178,.2)' : 'rgba(22,10,4,.28)'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  // tiny drops thrown off the sides of the pour
  if (fl > .25 && t > T.fall + .15) {
    const span = Math.max(40, yStop - y0 - 30);
    for (let i = 0; i < 9; i++) {
      const y = y0 + 40 + ((t * (260 + i * 23) + i * 131) % span);
      if (y > yStop - 6 || y < yt + 4) continue;
      const idx = Math.min(pts.length - 1, Math.max(0, Math.round((y - yt) / 3)));
      const [px, , pw] = pts[idx], side = i % 2 ? 1 : -1, r = (1.2 + (i % 3) * .8) * Math.min(1, fl + .3) * V.SS;
      const x = px + side * (pw + 5 + (i * 7) % 9);
      ctx.fillStyle = '#4a2810'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.5, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(255,226,180,.8)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .5, r * .32, 0, 6.2832); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawSplash(t: number, p: Pose): void {
  if (t < D.hit - .1 || t > D.tailEnd + 1.5) return;
  const SS = V.SS;
  ctx.save();
  clipAboveLip(p, 3, 30);
  for (const q of splash) {
    const tau = t - q.b;
    if (tau < 0 || tau > q.life) continue;
    const f = q.f;
    if (f < .2) continue;
    const o = q.o;
    const sp = q.sp * (.5 + .5 * f) * SS, vx = Math.cos(q.ang) * sp, vy0 = Math.sin(q.ang) * sp;
    const x = o.x + q.ox * f * SS + vx * tau;
    const y = Math.min(o.y, D.rimY + 8) + vy0 * tau + .5 * 1500 * SS * tau * tau;
    const r = q.r * (.6 + .6 * f) * SS;
    const vy = vy0 + 1500 * SS * tau;
    const el = 1 + Math.min(1.3, Math.hypot(vx, vy) / (650 * SS)), rot = Math.atan2(vy, vx);
    ctx.globalAlpha = (1 - tau / q.life) * .95;
    ctx.fillStyle = '#4a2a14'; ctx.beginPath(); ctx.ellipse(x, y, r * el, r, rot, 0, 6.2832); ctx.fill();
    if (q.big || r > 2.2 * SS) { ctx.fillStyle = 'rgba(236,194,140,.7)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .35, r * .34, 0, 6.2832); ctx.fill(); }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
