/** Where the cup is, in stage pixels. rot in radians, sx / sy are squash-and-stretch scales. */
export interface Pose {
  x: number;
  y: number;
  rot: number;
  sx: number;
  sy: number;
}

/** The cup's pose plus how far the big lettering drifts against it (parallax). */
export interface CupPose extends Pose {
  par: { x: number; y: number };
}

export interface Point {
  x: number;
  y: number;
}

export type Phase = 'idle' | 'intro' | 'live';
export type ClockMode = 'full' | 'short' | 'instant';

/** The live layout, rewritten by applyLayout for the current window. */
export interface View {
  tall: boolean;
  /** viewport (css px) */
  vw: number;
  vh: number;
  /** stage size (design px) */
  W: number;
  H: number;
  /** stage scale and offset (css px) */
  s: number;
  ox: number;
  oy: number;
  SC: number;
  DRAW_H: number;
  DRAW_W: number;
  SS: number;
  cup: Point;
  navY: number;
  viewBottom: number;
  hdrH: number;
  dpr: number;
  K: number;
  beanStart: Point;
  lid: { x: number; y: number; rot: number; scale: number; hoverY: number; hookRot: number };
  dock: { x: number; y: number; scale: number };
  big: { F: number };
}

/** An element whose last written style values are remembered, so unchanged frames cost nothing. */
export interface Cached extends HTMLElement {
  _o?: string;
  _t?: string;
  _v?: string;
}

export interface LidState {
  x: number;
  y: number;
  rot: number;
  scale: number;
  m: number;
  u: number;
  lift: number;
  visible: boolean;
  seated: boolean;
}
