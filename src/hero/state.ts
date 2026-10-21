import type { ClockMode, CupPose, Phase, View } from './types';

/** timings that depend on where the cup sits (never edit; derive() fills them) */
export const D = { rimY: 0, landX: 0, drip: 0, hit: 0, tailEnd: 0 };

/** the live layout, rewritten by applyLayout */
export const V: View = {
  tall: false,
  vw: 1440,
  vh: 900,
  W: 1440,
  H: 900,
  s: 1,
  ox: 0,
  oy: 0,
  SC: 520 / 512,
  DRAW_H: 520,
  DRAW_W: 341 * (520 / 512),
  SS: 1,
  cup: { x: 720, y: 453 },
  navY: -40,
  viewBottom: 900,
  hdrH: 88,
  dpr: 1,
  K: 1,
  beanStart: { x: 1250, y: -150 },
  lid: { x: 600, y: -430, rot: 0.55, scale: 1.15, hoverY: -78, hookRot: 0.09 },
  dock: { x: 1380, y: 43, scale: 0.06 },
  big: { F: 201.6 },
};

/** stage -> canvas pixels */
export const view: { VT: [number, number, number, number, number, number] } = { VT: [1, 0, 0, 1, 0, 0] };

/** the intro clock: phase, mode, timeline position and the animation-frame bookkeeping */
export const clock = {
  phase: 'idle' as Phase,
  mode: 'full' as ClockMode,
  /** position on the intro timeline, seconds */
  tl: 0,
  /** real seconds since the intro started */
  real: 0,
  last: 0,
  raf: 0,
  frozen: false,
};

/** everything else that changes while the page is alive */
export const dyn = {
  /** 0..1, how far the cup has docked into the header (scroll) */
  dockE: 0,
  /** smoothed scroll progress */
  spS: 0,
  /** the docked cup has been drawn once and the loop stopped */
  docked: false,
  lastPose: null as CupPose | null,
  /** adaptive resolution cap, lowered when the frame rate sags */
  dprCap: 99,
};
