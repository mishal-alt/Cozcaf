/* ======================================================================
   CLOCK: intro (full / short / instant), skip, replay, live
   ====================================================================== */
import { $, cv } from './canvas';
import { CONFIG, T } from './config';
import { reduced } from './env';
import { clamp } from './math';
import { taps } from './pose';
import { render } from './render';
import { sfxReset } from './sound';
import { clock, dyn } from './state';
import type { ClockMode } from './types';

export function startIntro(mode: ClockMode): void {
  clock.mode = mode; clock.real = 0; taps.length = 0; dyn.spS = 0; dyn.dockE = 0;
  if (mode === 'instant' || reduced && mode !== 'full') { clock.phase = 'live'; clock.tl = T.end + 1.0; } else { clock.phase = 'intro'; clock.tl = 0; }
  sfxReset();
}

export function advance(dt: number): void {
  if (clock.phase === 'intro') {
    clock.real += dt;
    if (clock.mode === 'short') { const u = clamp(clock.real / CONFIG.shortDuration); clock.tl = (.6 * u + .4 * u * (2 - u)) * T.end; }
    else clock.tl = clock.real;
    if (clock.tl >= T.end) clock.phase = 'live';
  } else clock.tl += dt;
}

const ghost = $<HTMLCanvasElement>('ghost'), ghostCtx = ghost.getContext('2d') as CanvasRenderingContext2D;

/** smooth jump to the final frame: the old frame dissolves into the finished page */
export function skip(): void {
  if (clock.phase !== 'intro') return;
  ghost.width = cv.width; ghost.height = cv.height; ghostCtx.drawImage(cv, 0, 0);
  ghost.classList.add('on'); void ghost.offsetWidth;
  document.body.classList.add('skipping');
  clock.phase = 'live'; clock.tl = T.end + 1.0;
  render(clock.tl);
  ghost.classList.remove('on');
  setTimeout(() => document.body.classList.remove('skipping'), 700);
}

