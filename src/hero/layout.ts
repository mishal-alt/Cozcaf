import { $, stage } from './canvas';
import { BIG, IMG_H, IMG_W, SC0 } from './constants';
import { FX, LAY } from './config';
import { clamp } from './math';
import { derive } from './timeline';
import { V } from './state';

interface BigMetrics { w: number; cap: number; fa: number; fd: number }
let bigMet: BigMetrics | null = null;
/** forget the measured lettering (called when fonts change the layout) */
export const resetBigMetrics = (): void => { bigMet = null; };
function measureBig(): void {
  const run = (ws: number[], g: number): number => ws.reduce((a, b) => a + b, 0) + g * BIG.trkTall * (ws.length - 1);
  bigMet = { w: Math.max(run(BIG.wCOZ, BIG.gCOZ), run(BIG.wCAF, BIG.gCAF)), cap: 1, fa: 1, fd: 0 };   // w = widest word / capital height (phone tracking)
}

/* ---------- compute the layout for the current window ---------- */
export function applyLayout(): void {
  const vw = innerWidth, vh = innerHeight;
  V.vw = vw; V.vh = vh;
  V.tall = vw < LAY.portraitBelow || vw / vh < LAY.portraitAspect;
  stage.classList.toggle('tall', V.tall);
  $('hdr').classList.toggle('tall', V.tall);
  document.body.classList.toggle('is-tall', V.tall);
  if (!bigMet) measureBig();

  if (!V.tall) {
    V.W = 1440; V.H = 900; V.s = Math.min(vw / V.W, vh / V.H);
    V.ox = (vw - V.W * V.s) / 2; V.oy = (vh - V.H * V.s) / 2;
    V.DRAW_H = 520; V.cup = { x: V.W / 2, y: 453 };
    V.hdrH = 88;
    V.big.F = 184;
  } else {
    const wd = vw <= 480 ? LAY.tallDesignWidth : 480;
    V.W = wd; V.s = vw / wd; V.H = vh / V.s; V.ox = 0; V.oy = 0; V.hdrH = 60;
    stage.style.width = V.W + 'px'; stage.style.height = V.H + 'px';
    document.documentElement.style.setProperty('--W', String(V.W));
    solveTall(bigMet as BigMetrics);
  }
  if (!V.tall) { stage.style.width = '1440px'; stage.style.height = '900px'; document.documentElement.style.setProperty('--W', '1440'); }
  V.SC = V.DRAW_H / IMG_H; V.DRAW_W = IMG_W * V.SC; V.SS = V.SC / SC0;
  V.navY = -(V.oy / V.s) - 40;
  V.viewBottom = (vh - V.oy) / V.s;
  const SS = V.SS;
  V.beanStart = { x: V.W * (V.tall ? .9 : .868), y: V.navY - 110 };
  V.lid = { x: 600 * SS, y: -430 * SS, rot: .55, scale: 1.15, hoverY: -78 * SS, hookRot: .09 };

  const root = document.documentElement.style;
  root.setProperty('--s', String(V.s)); root.setProperty('--hh', String(V.hdrH));
  stage.style.transform = `translate(${V.ox}px,${V.oy}px) scale(${V.s})`;
  const hin = $('hdrIn'); hin.style.width = V.W + 'px'; hin.style.transform = `translate(${V.ox}px,0) scale(${V.s})`;

  // dock target = centre of the header's cup button, in stage coordinates
  placeUi();
  const cr = $('dock').getBoundingClientRect();
  V.dock = { x: (cr.left + cr.width / 2 - V.ox) / V.s, y: (cr.top + cr.height / 2 - V.oy) / V.s, scale: ((FX.dockSize / V.s) / V.DRAW_H) };
  derive();
}

/* portrait phones: the Skip button borrows the strip of space above the ticker while the intro plays */
function placeUi(): void {
  const r = document.documentElement.style;
  if (V.tall) { r.setProperty('--ctaBottom', `calc(58px + ${parseFloat(getComputedStyle($('probe')).paddingBottom) || 0}px)`); r.setProperty('--ctaH', '46px'); }
  else { r.removeProperty('--ctaBottom'); r.removeProperty('--ctaH'); }
}

/* portrait: stack COZ above the cup and CAF below it */
function solveTall(bm: BigMetrics): void {
  const W = V.W, H = V.H, m = 16, hh = V.hdrH;
  const safeB = (parseFloat(getComputedStyle($('probe')).paddingBottom) || 0) / V.s;
  document.documentElement.style.setProperty('--safeB', String(safeB));
  const bs = $('bstack').offsetHeight;                          // design px
  const marqH = 46 + safeB;                                     // the cream ticker strip pinned to the bottom edge
  const cafBase = H - marqH - 12 - bs - 22;                     // where CAF's baseline sits (22 px clear above the kicker)
  let top = hh + 18;                                            // top of COZ's capitals (18 px clear below the header)
  const cupMax = Math.min(H * .56, W * 1.5), cupMin = 250;
  let cupH = clamp(H * (H < 760 ? .43 : .50), cupMin, cupMax);   // short phones: a slightly smaller cup leaves the lettering room
  const VIS = .91, TOP = .08;                                   // the cup artwork fills 91 % of its height, 8 % blank above
  const ovT = 0;                                                // COZ meets the lid exactly (no overlap) ...
  const ovB = -.016 * cupH;                                     // ... and CAF sits a hair below the cup's tilted base, so all six letters stay fully readable
  const { w, cap } = bm;
  let capH = (cafBase - top - VIS * cupH + ovT + ovB) / 2;
  let F = capH / cap;
  const Fw = (W - 2 * m) / w;                                   // keep "COZ" inside the margins
  if (F > Fw) {
    F = Fw; capH = F * cap;
    cupH = clamp((cafBase - top - 2 * capH + ovT - .016 * cupH) / VIS, cupMin, cupMax);
    const used = 2 * capH + VIS * cupH - ovT + .016 * cupH, extra = (cafBase - top) - used;
    if (extra > 0) top += extra / 2;
  }
  const cupY0 = top + capH - ovT - TOP * cupH;
  V.DRAW_H = cupH; V.cup = { x: W / 2, y: cupY0 + cupH / 2 };
  V.big.F = F;
  const lineTop = (capTop: number): number => capTop + cap * F - ((F - (bm.fa + bm.fd) * F) / 2 + bm.fa * F);
  const cafCapTop = cupY0 + (TOP + VIS) * cupH - ovB;
  const st = stage.style;
  st.setProperty('--F', F + 'px'); st.setProperty('--trk', String(BIG.trkTall));
  st.setProperty('--cozTop', lineTop(top) + 'px');
  st.setProperty('--cafTop', lineTop(cafCapTop) + 'px');
  const bsz = 84;
  st.setProperty('--bsz', bsz + 'px');
  st.setProperty('--badgeX', (W - m - bsz + 6) + 'px');
  st.setProperty('--badgeY', (cupY0 + cupH * .30) + 'px');
  st.setProperty('--glowD', (cupH * 1.9) + 'px');
}
