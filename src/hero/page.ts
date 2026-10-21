/* ======================================================================
   PAGE ELEMENTS: the COZCAF lettering that docks into the header, and the copy, badge and ticker around the scene
   ====================================================================== */
import { TALL, reduced } from './env';
import { clamp, easeInOut, easeOutBack, easeOutCubic, lerp, prog, smooth } from './math';
import type { Anchor } from './scene';

const $ = <T extends Element = HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`COZCAF hero: #${id} is missing from the page`);
  return e as unknown as T;
};

/** the lockup is viewBox 127 310 354 63; the six letters sit at 201.33 315.02 and are 278.67 wide */
const VB_X = 127, VB_Y = 310, VB_H = 63, LET_X = 201.33, LET_Y = 315.02, LET_W = 278.67;

/** scroll distance (x viewport height) over which the lettering travels into the header */
const DOCK_RANGE = 0.85;

export interface PageEls {
  /** call every frame of the scene with its clock */
  chrome(t: number, a: Anchor): void;
  /** re-read the layout (the lettering's resting place in the header, the heading's size) */
  measure(): void;
  /** scroll progress 0..1 of the dock; moves the lettering and fades the hero */
  scroll(): number;
}

export function initPage(): PageEls {
  const hero = $('hero'), wm = $<SVGSVGElement>('wm'), link = $<HTMLAnchorElement>('logoLink'), icon = $('wmIcon'), sheen = $('sheen');
  const letters = Array.from(wm.querySelectorAll<SVGPathElement>('path.wl'));
  const hdrBg = $('hdrBg'), nav = $('nav'), hr = $('hr'), kicker = $('kicker'), badge = $('badge'), bsvg = $('bsvg');
  const bl = document.getElementById('bl'), br = document.getElementById('br'), chip = $('chip'), marq = $('marq');

  // the tagline stays real text; each word gets its own span to reveal
  const words = (kicker.textContent ?? '').trim().split(/\s+/);
  kicker.textContent = '';
  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'w'; s.textContent = w; kicker.appendChild(s);
    if (i < words.length - 1) kicker.appendChild(document.createTextNode(' '));
    return s;
  });

  let tx0 = 0, ty0 = 0, k0 = 1, vh = innerHeight, docked = false, menu = false;

  /** where the lettering rests in the header, and the transform that lifts it to the big centred heading */
  function measure(): void {
    const W = innerWidth, tall = TALL.matches;
    vh = innerHeight;
    const hw = tall ? Math.min(W * 0.88, 520) : Math.min(W * 0.46, 660), hy = tall ? 78 : 96;
    document.documentElement.style.setProperty('--hw', hw + 'px');
    document.documentElement.style.setProperty('--hy', hy + 'px');
    const was = wm.style.transform;
    wm.style.transform = 'none';
    const r = wm.getBoundingClientRect(), u = r.height / VB_H;
    wm.style.transform = was;
    k0 = hw / (LET_W * u);
    tx0 = (W - hw) / 2 - r.left - k0 * (LET_X - VB_X) * u;
    ty0 = hy - r.top - k0 * (LET_Y - VB_Y) * u;
  }

  /** the first scroll: the lettering glides up and shrinks into the header while the page slides over the scene */
  function scroll(): number {
    const sp = clamp(scrollY / (vh * DOCK_RANGE));
    const e = menu ? 1 : reduced ? (sp > 0.5 ? 1 : 0) : easeInOut(sp);                  // with the menu sheet open the lettering is always in the header
    wm.style.transform = `translate3d(${lerp(tx0, 0, e).toFixed(2)}px,${lerp(ty0, 0, e).toFixed(2)}px,0) scale(${lerp(k0, 1, e).toFixed(4)})`;
    icon.style.opacity = String(menu ? 1 : smooth(clamp((sp - 0.55) / 0.3)));                   // the bean mark appears as the word settles
    wm.style.filter = e > 0.98 ? 'none' : '';
    hero.style.opacity = String(1 - clamp((sp - 0.15) / 0.6));
    hdrBg.style.opacity = String(clamp((sp - 0.5) / 0.35));
    const d = e > 0.9;
    if (d !== docked) { docked = d; link.tabIndex = d ? 0 : -1; link.style.pointerEvents = d ? 'auto' : 'none'; link.toggleAttribute('data-docked', d); }
    return sp;
  }

  const put = (e: HTMLElement | null, o: number, y = 0): void => { if (e) { e.style.opacity = o.toFixed(3); e.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`; } };

  function chrome(t: number, a: Anchor): void {
    const hp = easeOutCubic(prog(t, 1, 1.8));
    nav.style.opacity = hr.style.opacity = hp.toFixed(3);
    marq.style.opacity = easeOutCubic(prog(t, 1.4, 2.2)).toFixed(3); marq.style.transform = `translate3d(0,${((1 - easeOutCubic(prog(t, 1.4, 2.2))) * 46).toFixed(1)}px,0)`;
    // the lettering: one letter at a time, then a single warm glint across it
    letters.forEach((e, i) => { const q = easeOutCubic(prog(t, 2.2 + i * 0.08, 3.1 + i * 0.08)); e.style.opacity = q.toFixed(3); e.style.transform = `translateY(${((1 - q) * 9).toFixed(2)}px)`; });
    const sp = prog(t, 3.7, 5.2);
    sheen.setAttribute('transform', `translate(${(160 + sp * 330).toFixed(1)} 0) skewX(-22)`);
    sheen.style.opacity = String(Math.sin(Math.PI * sp));
    spans.forEach((w, i) => { const q = easeOutCubic(prog(t, 2.6 + i * 0.09, 3.1 + i * 0.09)); w.style.opacity = q.toFixed(3); w.style.transform = `translateY(${(8 * (1 - q)).toFixed(2)}px)`; });
    // the badge pops in beside the bucket and turns
    const bp = prog(t, 2.5, 3.1), sz = a.land ? 124 : 92, bx = innerWidth / 2 + (a.x + a.w * 0.52 - innerWidth / 2) * a.s, by = innerHeight * (a.land ? 0.62 : 0.64) + (a.y - a.h * 0.68 - innerHeight * (a.land ? 0.62 : 0.64)) * a.s;
    badge.style.width = badge.style.height = sz + 'px';
    badge.style.left = Math.min(innerWidth - sz - 14, bx) + 'px'; badge.style.top = Math.max(110, by) + 'px';
    badge.style.opacity = clamp(bp * 2).toFixed(3); badge.style.transform = `scale(${(0.55 + 0.45 * easeOutBack(bp, 1.2)).toFixed(4)})`;
    bsvg.style.transform = `rotate(${reduced ? 0 : ((t * 360) / 28).toFixed(2)}deg)`;
    const ex = easeOutCubic(prog(t, 2.4, 3.2));
    put(bl, ex, (1 - ex) * 14); put(br, ex, (1 - ex) * 14);
    chip.style.opacity = easeOutCubic(prog(t, 3.3, 4.1)).toFixed(3);
  }

  // opening the menu sheet at the top of the page sends the lettering up into the header, the same glide as scrolling; closing it brings it back
  new MutationObserver(() => {
    const open = document.documentElement.classList.contains('nav-open');
    if (open === menu) return;
    menu = open;
    const t = reduced ? '' : 'transform .7s cubic-bezier(.77,0,.18,1)';
    wm.style.transition = t; icon.style.transition = reduced ? '' : 'opacity .5s ease';
    scroll();
    setTimeout(() => { wm.style.transition = ''; icon.style.transition = ''; }, 760);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  measure();
  return { chrome, measure, scroll };
}
