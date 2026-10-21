import { ctx } from './canvas';
import { imgs } from './assets';
import { DEPTH, IMG_H, IMG_W, RI, RIM, RO } from './constants';
import { clamp, smooth, TAU } from './math';
import { ell, inImg } from './draw';
import { drawStaticPrint } from './morph';
import { bubbles, drips, foam, specks } from './scatter';
import { cupSm, drawShadow, SH } from './sprites';
import { D, V } from './state';
import { flowAt, levelAt } from './timeline';
import type { LidState, Pose } from './types';

const ringPath = (): void => {
  ctx.beginPath();
  ctx.ellipse(RIM.cx, RIM.cy, RO.a, RO.b, RIM.phi, 0, TAU);
  ctx.moveTo(RIM.cx + RI.a * Math.cos(RIM.phi), RIM.cy + .3 + RI.a * Math.sin(RIM.phi));
  ctx.ellipse(RIM.cx, RIM.cy + .3, RI.a, RI.b, RIM.phi, 0, TAU, true);
};

export function drawOpenCup(t: number, p: Pose, ls: LidState): void {
  const L = levelAt(t);
  const fl = flowAt(t);
  const cx = RIM.cx, cy = RIM.cy, phi = RIM.phi;
  const occ = Math.max(0, 1 - ls.u * 2.2) * .62;                       // dark in there while the lid is on
  const wet = clamp((t - D.hit) / .9);
  inImg(p, () => {
    drawShadow(SH.body);                                              // the cup's soft contact shadow
    ctx.drawImage(imgs.body, 0, 0);
    drawStaticPrint(t);
    // the rolled lip throws a thin shadow on the wall below it
    ell(cx, cy + 1.6, RO.a - .5, RO.b + .4, phi, .05, Math.PI - .05);
    ctx.strokeStyle = 'rgba(70,56,40,.30)'; ctx.lineWidth = 3.4; ctx.stroke();

    /* rolled paper lip (a ring with real thickness) */
    ringPath();
    const rg = ctx.createLinearGradient(cx - RO.a, 0, cx + RO.a, 0);
    rg.addColorStop(0, '#ebe6dc'); rg.addColorStop(.45, '#f6f2ea'); rg.addColorStop(1, '#d6d0c3');
    ctx.fillStyle = rg; ctx.fill('evenodd');
    ringPath();
    const rv = ctx.createLinearGradient(0, cy - RO.b, 0, cy + RO.b);
    rv.addColorStop(0, 'rgba(255,255,255,.38)'); rv.addColorStop(.5, 'rgba(255,255,255,0)'); rv.addColorStop(1, 'rgba(96,82,62,.26)');
    ctx.fillStyle = rv; ctx.fill('evenodd');
    ctx.save(); ringPath(); ctx.clip('evenodd');                           // paper grain
    ctx.fillStyle = 'rgba(110,98,80,.30)';
    for (const q of specks) { ctx.beginPath(); ctx.arc(cx + Math.cos(q.a) * RO.a * q.r, cy + Math.sin(q.a) * RO.b * q.r, q.s, 0, TAU); ctx.fill(); }
    ctx.restore();
    ell(cx, cy, RO.a, RO.b, phi); ctx.strokeStyle = 'rgba(80,68,52,.38)'; ctx.lineWidth = .9; ctx.stroke();

    /* inside the cup */
    ctx.save(); ell(cx, cy + .3, RI.a, RI.b, phi); ctx.clip();
    const wg = ctx.createLinearGradient(0, cy - RI.b, 0, cy + RI.b);
    wg.addColorStop(0, '#aca594'); wg.addColorStop(.16, '#e3ddd0'); wg.addColorStop(.55, '#b9b1a1'); wg.addColorStop(1, '#5d5547');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, IMG_W, 260);
    const sg = ctx.createLinearGradient(cx - RI.a, 0, cx + RI.a, 0);
    sg.addColorStop(0, 'rgba(0,0,0,.34)'); sg.addColorStop(.2, 'rgba(0,0,0,0)'); sg.addColorStop(.8, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.36)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, IMG_W, 260);
    // paper seam running down the inside
    ctx.fillStyle = 'rgba(40,30,20,.06)'; ctx.fillRect(cx + 47, cy - RI.b, 1.1, RI.b * 2);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(cx + 48.1, cy - RI.b, 1, RI.b * 2);
    // coffee thrown on the far wall: a stain and runs that trickle down
    if (wet > 0) {
      ctx.globalAlpha = .42 * wet * Math.min(1, fl + .4);
      const wgd = ctx.createRadialGradient(cx - 2, cy - 5, 2, cx - 2, cy - 5, 50);
      wgd.addColorStop(0, '#4a2a14'); wgd.addColorStop(1, 'rgba(74,42,20,0)');
      ctx.fillStyle = wgd; ctx.fillRect(cx - 62, cy - RI.b, 124, RI.b * 1.5);
      ctx.globalAlpha = 1;
      for (const d of drips) {
        const g = clamp((t - D.hit - d.d - .15) / .9) * (.5 + .5 * Math.min(1, fl + .5));
        if (g <= 0) continue;
        const len = d.len * g * .8, x = cx + d.x * RI.a * .72, y0 = cy - RI.b * (.72 - Math.abs(d.x) * .25);
        const gr = ctx.createLinearGradient(0, y0, 0, y0 + len);
        gr.addColorStop(0, `rgba(78,44,20,${.05 * wet})`); gr.addColorStop(.35, `rgba(78,44,20,${.32 * wet})`); gr.addColorStop(1, `rgba(60,32,14,${.5 * wet})`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - d.w * .5, y0); ctx.lineTo(x + d.w * .5, y0);
        ctx.quadraticCurveTo(x + d.w * .9, y0 + len * .7, x + d.w * .25, y0 + len); ctx.quadraticCurveTo(x - d.w * .6, y0 + len * .6, x - d.w * .5, y0); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + d.w * .25, y0 + len, d.w * .75, d.w * 1.0, 0, 0, TAU); ctx.fill();
      }
    }
    // the coffee surface
    const kx = 1 - .36 * (1 - L), d = (1 - L) * DEPTH;
    const slosh = Math.sin(t * 9) * 1.4 * Math.min(1, fl + .3) * (L > .5 ? 1 : 0);
    const sy0 = cy + d + slosh, sa = RI.a * kx, sb = RI.b * kx;
    if (L > .05) drawCoffeeSurface(t, L, fl, cx, sy0, sa, sb, phi);
    // light falls into the cup once the lid is gone
    if (occ > 0) { ctx.fillStyle = `rgba(10,7,4,${occ})`; ctx.fillRect(0, 0, IMG_W, 260); }
    ctx.restore();
    if (occ > 0) { ringPath(); ctx.fillStyle = `rgba(12,9,6,${occ * .55})`; ctx.fill('evenodd'); }
    // where the lip meets the inside: shaded on the far side, bright on the near side
    ell(cx, cy + .3, RI.a, RI.b, phi, Math.PI, TAU); ctx.strokeStyle = 'rgba(58,46,32,.5)'; ctx.lineWidth = 1.3; ctx.stroke();
    ell(cx, cy + .3, RI.a - .3, RI.b - .2, phi, .1, Math.PI - .1); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    ell(cx, cy, RO.a - 1.4, RO.b - .9, phi, .14, Math.PI - .14); ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - occ)})`; ctx.lineWidth = 1.2; ctx.stroke();
    // a few drops that landed on the lip
    if (wet > 0) {
      ctx.fillStyle = `rgba(86,50,24,${.7 * wet})`;
      [[-96, 8, 2.2], [-70, 17, 1.4], [78, 14, 1.7], [104, 3, 1.1], [30, 22, 1.2]].forEach(([dx, dy, r], i) => {
        if (t - D.hit > .12 + i * .09) { ctx.beginPath(); ctx.ellipse(cx + dx, cy + dy * (RO.b / 24) * .6 - 2, r * 1.2, r * .8, phi, 0, TAU); ctx.fill(); }
      });
    }
  });
}

function drawCoffeeSurface(t: number, L: number, fl: number, cx: number, sy0: number, sa: number, sb: number, phi: number): void {
  const crema = smooth(clamp((L - .74) / .22));
  const sw = t * .5;
  ctx.save(); ctx.translate(cx, sy0); ctx.rotate(phi);
  const E = (a: number, b: number, a0 = 0, a1 = TAU): void => { ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, a0, a1); };
  // the paper wall above the liquid is stained where the coffee touches it
  E(sa + 3.2, sb + 1.8, Math.PI, TAU); ctx.strokeStyle = 'rgba(66,36,16,.55)'; ctx.lineWidth = 3.2; ctx.stroke();
  // the liquid: dark and deep, amber where it is thin against the wall
  E(sa, sb);
  const cg = ctx.createRadialGradient(-sa * .22, -sb * .2, 2, 0, 0, sa);
  cg.addColorStop(0, '#2c150a'); cg.addColorStop(.5, '#1f0f06'); cg.addColorStop(.8, '#37190a'); cg.addColorStop(1, '#6e3c17');
  ctx.fillStyle = cg; ctx.fill();
  ctx.save(); E(sa, sb); ctx.clip();
  // crema: a tan film that gathers toward the wall and marbles in the middle
  const fg = ctx.createRadialGradient(0, 0, sa * .25, 0, 0, sa);
  fg.addColorStop(0, 'rgba(196,138,78,0)'); fg.addColorStop(.62, `rgba(186,128,70,${.16 * crema})`); fg.addColorStop(1, `rgba(214,160,100,${.62 * crema})`);
  ctx.fillStyle = fg; ctx.fillRect(-sa, -sb, sa * 2, sb * 2);
  ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    const rr = .22 + .1 * k, a0 = sw * (1 - rr * .6) + k * 1.9;
    ctx.beginPath(); ctx.ellipse(5 * Math.cos(sw + k), 1.2 * Math.sin(sw + k), sa * rr, sb * rr, 0, a0, a0 + 1.5 + .5 * (k % 3));
    ctx.strokeStyle = k % 2 ? `rgba(222,172,112,${.2 * crema + .05})` : `rgba(16,7,3,.32)`; ctx.lineWidth = 1.6 + (k % 3) * 1.1; ctx.stroke();
  }
  // bubbles gathered at the wall
  for (const q of bubbles) {
    if (q.k > crema * 1.05 + .08) continue;
    const ang = q.a + sw * q.v * (1 - q.r * .5);
    const x = Math.cos(ang) * q.r * sa, y = Math.sin(ang) * q.r * sb, s = q.s * (.7 + .3 * (sa / RI.a));
    ctx.beginPath(); ctx.ellipse(x, y, s, s * .8, 0, 0, TAU);
    ctx.fillStyle = 'rgba(168,108,54,.30)'; ctx.fill();
    ctx.strokeStyle = 'rgba(244,206,152,.6)'; ctx.lineWidth = .7; ctx.stroke();
    ctx.fillStyle = 'rgba(255,244,226,.85)'; ctx.beginPath(); ctx.arc(x - s * .32, y - s * .3, Math.max(.35, s * .26), 0, TAU); ctx.fill();
  }
  // soft window reflection and a crisp one along the far wall
  ctx.save(); ctx.rotate(-.1);
  const rf = ctx.createLinearGradient(-sa * .62, 0, sa * .1, 0);
  rf.addColorStop(0, 'rgba(255,244,226,0)'); rf.addColorStop(.35, 'rgba(255,244,226,.34)'); rf.addColorStop(1, 'rgba(255,244,226,0)');
  ctx.beginPath(); ctx.ellipse(-sa * .26, -sb * .34 + Math.sin(t * 2) * .4, sa * .36, sb * .17, 0, 0, TAU); ctx.fillStyle = rf; ctx.fill();
  ctx.restore();
  E(sa * .84, sb * .84, Math.PI * 1.1, Math.PI * 1.62); ctx.strokeStyle = 'rgba(255,238,210,.5)'; ctx.lineWidth = 1.3; ctx.stroke();
  // churned foam and ripples where the pour lands
  if (t > D.hit && t < D.tailEnd + 1.4) {
    const live = t < D.tailEnd ? 1 : Math.max(0, 1 - (t - D.tailEnd) / 1.4);
    for (let k = 0; k < 4; k++) {
      const per = .36, f = (((t - D.hit - k * per / 4) % per) + per) % per / per, r = 8 + f * sa * .85;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * (sb / sa), 0, 0, TAU);
      ctx.strokeStyle = `rgba(232,190,140,${(1 - f) * .34 * live})`; ctx.lineWidth = 1.8; ctx.stroke();
    }
    const fw = (9 + 26 * Math.max(fl, .18 * live)) * (sa / RI.a);
    ctx.beginPath(); ctx.ellipse(0, 0, fw, fw * (sb / sa), 0, 0, TAU);
    const fo = ctx.createRadialGradient(0, 0, 0, 0, 0, fw); fo.addColorStop(0, `rgba(120,70,32,${.7 * live})`); fo.addColorStop(1, 'rgba(160,104,56,0)');
    ctx.fillStyle = fo; ctx.fill();
    for (const q of foam) {
      const ang = q.a + t * q.v * 1.6, rr = q.r * fw * (1 + .15 * Math.sin(t * 7 + q.a * 3));
      const x = Math.cos(ang) * rr, y = Math.sin(ang) * rr * (sb / sa), s = q.s * (.6 + .6 * live);
      ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fillStyle = `rgba(190,134,76,${.45 * live})`; ctx.fill();
      ctx.strokeStyle = `rgba(250,220,174,${.65 * live})`; ctx.lineWidth = .6; ctx.stroke();
    }
  }
  ctx.restore();
  // thin bright meniscus where the liquid climbs the wall
  E(sa - .6, sb - .4, .08, Math.PI - .08); ctx.strokeStyle = 'rgba(232,176,112,.5)'; ctx.lineWidth = 1.4; ctx.stroke();
  E(sa - .6, sb - .4, Math.PI, TAU); ctx.strokeStyle = 'rgba(210,150,90,.42)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

export function drawClosedCup(p: Pose): void {
  inImg(p, () => {
    drawShadow(SH.cup);
    if (p.sx * V.SC * V.K < .34) ctx.drawImage(cupSm, 0, 0, IMG_W, IMG_H); else ctx.drawImage(imgs.cup, 0, 0);
  });
}
