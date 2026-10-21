/* ======================================================================
   COZCAF hero: ONE CONFIG FOR EVERYTHING YOU MAY WANT TO CHANGE
   Sections 1-5 tune the intro. All times are in SECONDS on the intro timeline
   (0 = the moment the loader hands off). Site facts and the menu live in src/data.
   ====================================================================== */

export type Range = readonly [number, number];

export interface TimeConfig {
  // beat 1: the cup arrives with the COZCAF lettering already printed on it
  cupEnter: Range;
  // beat 2: a real coffee bean tumbles in and settles where the logo belongs
  beanIn: Range;
  beanPress: Range;
  // beat 3: the seed soaks into ink and becomes the printed logo
  morph: Range;
  // beat 4: the page assembles WHILE the bean lands (big type + header readable by ~2.2 s)
  header: Range;
  coz: Range;
  caf: Range;
  marquee: Range;
  badge: Range;
  /** the three tagline lines (desktop) */
  textL: Range;
  /** location stamp + trust signals */
  textM: Range;
  /** "Your cozy corner." + scroll cue */
  textR: Range;
  // beat 5: coffee pours in from above the screen - it STARTS before the logo has finished morphing
  /** the pour leaves the top edge of the screen */
  fall: number;
  /** the pour starts to ease off */
  thin: number;
  /** the tail lets go */
  release: number;
  // beat 6: the lid swoops in while the pour is easing off, hooks one edge, presses on, steam rises
  lidIn: Range;
  lidPress: Range;
  // beat 7: the conversion layer and the kicker (right after the lid seats)
  /** "View menu" + "Visit us" fade in */
  cta: Range;
  /** per-word reveal window ... */
  kicker: Range;
  /** ... each following word starts this much later */
  kickerStagger: number;
  /** the rotating badge speeds up once, then calms */
  badgeBoost: Range;
  /** final state reached - cup idles / follows the pointer from here */
  end: number;
}

export interface MotionConfig {
  /** px/s^2 for falling coffee */
  gravity: number;
  /** half-width of the pour at the top of the screen (px, desktop size) */
  streamHalfWidth: number;
  /** px/s speed entering from the top (sets how much the pour narrows) */
  startSpeed: number;
  /** how full the cup gets (0-1), 1 = brim */
  fillMax: number;
}

export interface FollowConfig {
  x: number;
  y: number;
  tilt: number;
}

export interface FxConfig {
  /** film-grain opacity over the whole page (0.04 = 4 %) */
  grain: number;
  /** warm light behind the cup: opacity when empty -> when full */
  glowMin: number;
  glowMax: number;
  /** how much bigger the glow gets while the cup fills (0.16 = +16 %) */
  glowGrow: number;
  /** COZ / CAF move this fraction of the cup's movement, in the opposite direction */
  parallax: number;
  /** how far the cup follows the pointer (px, px, degrees) */
  pointerMove: FollowConfig;
  /** slow idle float used on touch screens (px, px, degrees) */
  floatMove: FollowConfig;
  /** one full turn of the rotating badge */
  badgeSpinSeconds: number;
  /** extra speed (x) at the peak of the one-time speed-up */
  badgeBoost: number;
  /** seconds a tapped steam puff lasts */
  tapPuff: number;
  /** scroll distance (x viewport height) over which the cup docks into the header */
  dockRange: number;
  /** docked cup height in the header (px) */
  dockSize: number;
}

export interface QualityConfig {
  /** canvas resolution cap on desktop (device pixel ratio) */
  dprDesktop: number;
  /** ... on phones / low-end devices */
  dprMobile: number;
  /** hard cap on canvas pixels (desktop) */
  pixelsDesktop: number;
  /** ... (mobile) */
  pixelsMobile: number;
  /** splash droplets */
  splashDesktop: number;
  splashMobile: number;
  /** pre-computed logo-morph frames (no per-pixel work while playing) */
  morphFrames: number;
  /** drop resolution automatically if the frame rate sags */
  adaptive: boolean;
}

export interface LayoutConfig {
  /** screens narrower than this (px) get the stacked portrait layout */
  portraitBelow: number;
  /** ... and so does anything taller than width/height < this */
  portraitAspect: number;
  /** portrait layout is designed on a 390 px wide canvas and scaled to the screen */
  tallDesignWidth: number;
}

export interface HeroConfig {
  time: TimeConfig;
  /** length of the quick version shown on return visits (s) */
  shortDuration: number;
  /** what a reload / return visit in the same session shows */
  returnVisit: 'short' | 'instant' | 'full';
  sessionKey: string;
  /** ms to wait for web fonts before starting with fallbacks */
  fontTimeout: number;
  motion: MotionConfig;
  fx: FxConfig;
  quality: QualityConfig;
  layout: LayoutConfig;
  /** true = client-ready: Replay is hidden. Press P on the page to toggle (pitch mode shows Replay). */
  production: boolean;
}

export const CONFIG: HeroConfig = {
  /* ---------- 1. TIMELINE (target: final state in about 5.6 s) ---------- */
  time: {
    cupEnter: [0.1, 0.85],
    beanIn: [0.8, 1.5],
    beanPress: [1.5, 1.8],
    morph: [1.65, 2.65],
    header: [1.25, 1.9],
    coz: [1.3, 2.2],
    caf: [1.3, 2.2],
    marquee: [1.75, 2.35],
    badge: [1.95, 2.55],
    textL: [2.05, 2.65],
    textM: [2.25, 2.75],
    textR: [2.35, 2.85],
    fall: 2.2,
    thin: 3.45,
    release: 3.85,
    lidIn: [3.95, 4.6],
    lidPress: [4.6, 4.82],
    cta: [4.78, 5.3],
    kicker: [4.9, 5.2],
    kickerStagger: 0.06,
    badgeBoost: [4.85, 6.45],
    end: 5.6,
  },
  shortDuration: 1.5,
  returnVisit: 'full',
  sessionKey: 'cozcaf.intro.seen',
  fontTimeout: 3000,

  /* ---------- 2. PHYSICS / LOOK OF THE POUR ---------- */
  motion: {
    gravity: 2300,
    streamHalfWidth: 30,
    startSpeed: 380,
    fillMax: 0.965,
  },

  /* ---------- 3. MICRO-MOMENTS ---------- */
  fx: {
    grain: 0.04,
    glowMin: 0.08,
    glowMax: 0.55,
    glowGrow: 0.16,
    parallax: 0.4,
    pointerMove: { x: 32, y: 12, tilt: 3.5 },
    floatMove: { x: 10, y: 6, tilt: 1.4 },
    badgeSpinSeconds: 28,
    badgeBoost: 14,
    tapPuff: 2.2,
    dockRange: 0.85,
    dockSize: 34,
  },

  /* ---------- 4. PERFORMANCE ---------- */
  quality: {
    dprDesktop: 2,
    dprMobile: 1.5,
    pixelsDesktop: 5.2e6,
    pixelsMobile: 2.3e6,
    splashDesktop: 460,
    splashMobile: 150,
    morphFrames: 26,
    adaptive: true,
  },

  /* ---------- 5. LAYOUT ---------- */
  layout: {
    portraitBelow: 768,
    portraitAspect: 0.8,
    tallDesignWidth: 390,
  },

  /* ---------- 6. PRODUCTION SWITCH ---------- */
  production: true,
};

/** short names used throughout the engine */
export const T = CONFIG.time;
export const MOTION = CONFIG.motion;
export const FX = CONFIG.fx;
export const Q = CONFIG.quality;
export const LAY = CONFIG.layout;
