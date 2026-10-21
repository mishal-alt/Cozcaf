/* ======================================================================
   SOUND (optional, off by default, never autoplays)
   ====================================================================== */
import { $ } from './canvas';
import { T } from './config';
import { safe } from './math';
import { clock } from './state';
import { flowAt, levelAt } from './timeline';

type AudioCtor = typeof AudioContext;

export const sfx = {
  on: false,
  ctx: null as AudioContext | null,
  master: null as GainNode | null,
  bp: null as BiquadFilterNode | null,
  pg: null as GainNode | null,
  prev: 0,
};

function sfxInit(): boolean {
  const AC: AudioCtor | undefined = window.AudioContext || (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!AC) return false;
  const c = sfx.ctx = new AC(), master = c.createGain(); master.gain.value = .7; master.connect(c.destination); sfx.master = master;
  const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  let b0 = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = .985 * b0 + .015 * w; d[i] = w * .5 + b0 * 3.2; }
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = .9;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260;
  const pg = c.createGain(); pg.gain.value = 0;
  src.connect(bp); bp.connect(hp); hp.connect(pg); pg.connect(master); src.start();
  sfx.bp = bp; sfx.pg = pg; return true;
}

/** a soft wooden tap (lid pressing on, bean settling) */
export function thunk(strength: number, f0: number): void {
  const c = sfx.ctx as AudioContext, now = c.currentTime, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f0 * .45, now + .14);
  g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.55 * strength, now + .01); g.gain.exponentialRampToValueAtTime(.0001, now + .24);
  o.connect(g); g.connect(sfx.master as GainNode); o.start(now); o.stop(now + .26);
}

export function sfxReset(): void { sfx.prev = 0; if (sfx.pg) sfx.pg.gain.value = 0; }

export function sfxUpdate(): void {
  const tl = clock.tl;
  if (!sfx.on || !sfx.ctx || !sfx.pg || !sfx.bp) { sfx.prev = tl; return; }
  const c = sfx.ctx.currentTime, fl = flowAt(tl), lv = levelAt(tl), cross = (e: number): boolean => sfx.prev < e && tl >= e;
  sfx.pg.gain.setTargetAtTime(fl * .5, c, .06);
  sfx.bp.frequency.setTargetAtTime(420 + 1500 * lv, c, .08);        // the pitch climbs as the cup fills
  if (cross(T.beanPress[0])) thunk(.4, 230);
  if (cross(T.lidPress[1] - .02)) thunk(1, 150);
  sfx.prev = tl;
}

export function initSound(): void {
  const b = $('snd');
  b.addEventListener('click', () => {
    if (!sfx.on) { if (!sfx.ctx && !sfxInit()) return; safe(() => (sfx.ctx as AudioContext).resume()); sfx.on = true; }
    else { sfx.on = false; if (sfx.pg) sfx.pg.gain.value = 0; }
    b.setAttribute('aria-pressed', String(sfx.on));
    b.setAttribute('aria-label', sfx.on ? 'Sound on - turn sound off' : 'Sound off - turn sound on');
    $('sndIcon').innerHTML = sfx.on
      ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
      : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
  });
}
