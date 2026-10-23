/* ======================================================================
   PAGE ELEMENTS: the COZCAF lettering that docks into the header, and the copy, badge and ticker around the scene
   ====================================================================== */
import { TALL, reduced } from './env';
import { clamp, easeInOut, easeOutBack, easeOutCubic, lerp, prog, smooth } from './math';

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
  chrome(t: number): void;
  /** the table in view and how far through its time it is (0..1): moves the category word and the dots */
  table(cur: number, progress: number): void;
  /** a dot was tapped */
  onPick(cb: (i: number) => void): void;
  /** hovering or focusing the category chip asks the camera to wait */
  onHold(cb: (hold: boolean) => void): void;
  /** re-read the layout (the lettering's resting place in the header, the heading's size) */
  measure(): void;
  /** scroll progress 0..1 of the dock; moves the lettering and fades the hero */
  scroll(): number;
}

export function initPage(): PageEls {
  const hero = $('hero'), wm = $<SVGSVGElement>('wm'), link = $<HTMLAnchorElement>('logoLink'), icon = $('wmIcon'), sheen = $('sheen');
  const letters = Array.from(wm.querySelectorAll<SVGPathElement>('path.wl'));
  const hdrBg = $('hdrBg'), nav = $('nav'), hr = $('hr'), kicker = $('kicker'), badge = $('badge'), bsvg = $('bsvg');
  const bl = document.getElementById('bl'), br = document.getElementById('br'), chip = $('chip'), marq = $('marq'), cat = $('cat');
  const words = Array.from(cat.querySelectorAll<HTMLElement>('.cat-w')), dots = Array.from(cat.querySelectorAll<HTMLButtonElement>('.cat-dot'));
  let shown = -1;

  // the tagline is real text, split into one span per word when the page is built (so the browser never repaints it); each word glides up into place
  const spans = Array.from(kicker.querySelectorAll<HTMLElement>('.w'));

  let tx0 = 0, ty0 = 0, ty1 = 0, kd = 1, vh = innerHeight, docked = false, menu = false;

  /** The lettering is drawn at the size of the big heading and scaled DOWN into the header: scaling a small drawing up would blur it. */
  function measure(): void {
    const W = innerWidth, tall = TALL.matches;
    vh = innerHeight;
    // phones: centred over the dark top of the film; wide screens: the left column, beside the film panel (as the reference site does)
    const hw = tall ? Math.min(W * 0.88, 520) : Math.min(W * 0.36, 520), hy = tall ? 78 : Math.round(vh * 0.3), hx = tall ? (W - hw) / 2 : Math.max(48, W * 0.055);
    hero.style.setProperty('--hw', hw + 'px');
    hero.style.setProperty('--hy', hy + 'px');
    hero.style.setProperty('--hx', hx + 'px');
    const ub = hw / LET_W, wb = 354 * ub, hb = VB_H * ub;                            // px per unit, and the lockup's big size
    wm.setAttribute('width', String(wb)); wm.setAttribute('height', String(hb));
    wm.style.width = wb + 'px'; wm.style.height = hb + 'px';
    const r = link.getBoundingClientRect(), logoH = parseFloat(getComputedStyle(document.getElementById('hdr') as HTMLElement).getPropertyValue('--logo-h')) || 22;
    kd = logoH / hb;
    tx0 = hx - r.left - (LET_X - VB_X) * ub;
    ty0 = hy - r.top - (LET_Y - VB_Y) * ub;
    ty1 = (r.height - logoH) / 2;
  }

  /** the first scroll: the lettering glides up and shrinks into the header while the page slides over the scene */
  function scroll(): number {
    const sp = clamp(scrollY / (vh * DOCK_RANGE));
    const e = menu ? 1 : reduced ? (sp > 0.5 ? 1 : 0) : easeInOut(sp);                  // with the menu sheet open the lettering is always in the header
    wm.style.transform = `translate3d(${lerp(tx0, 0, e).toFixed(2)}px,${lerp(ty0, ty1, e).toFixed(2)}px,0) scale(${lerp(1, kd, e).toFixed(5)})`;
    icon.style.opacity = String(menu ? 1 : smooth(clamp((sp - 0.55) / 0.3)));           // the bean mark appears as the word settles
    wm.style.filter = e > 0.98 ? 'none' : '';
    hero.style.opacity = String(1 - clamp((sp - 0.15) / 0.6));
    hdrBg.style.opacity = String(clamp((sp - 0.5) / 0.35));
    const d = e > 0.9;
    if (d !== docked) { docked = d; link.tabIndex = d ? 0 : -1; link.style.pointerEvents = d ? 'auto' : 'none'; link.toggleAttribute('data-docked', d); }
    return sp;
  }

  const put = (e: HTMLElement | null, o: number, y = 0): void => { if (e) { e.style.opacity = o.toFixed(3); e.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`; } };

  function chrome(t: number): void {
    const hp = easeOutCubic(prog(t, 1, 1.8));
    nav.style.opacity = hr.style.opacity = hp.toFixed(3);
    marq.style.transform = `translate3d(0,${((1 - easeOutCubic(prog(t, 1.4, 2.2))) * 46).toFixed(1)}px,0)`;
    // the lettering: one letter at a time, then a single warm glint across it
    letters.forEach((e, i) => { const q = easeOutCubic(prog(t, 1.2 + i * 0.07, 2 + i * 0.07)); e.style.opacity = q.toFixed(3); e.style.transform = `translateY(${((1 - q) * 9).toFixed(2)}px)`; });
    const sp = prog(t, 3.2, 4.7);
    sheen.setAttribute('transform', `translate(${(160 + sp * 330).toFixed(1)} 0) skewX(-22)`);
    sheen.style.opacity = String(Math.sin(Math.PI * sp));
    spans.forEach((w, i) => { const q = easeOutCubic(prog(t, 1.7 + i * 0.08, 2.2 + i * 0.08)); w.style.transform = `translateY(${(10 * (1 - q)).toFixed(2)}px)`; });
    // the badge sits at the right edge, clear of the lettering, and pops in once the first clip is playing
    const bp = prog(t, 2.5, 3.1), land = !TALL.matches, sz = land ? 124 : 80;
    badge.style.width = badge.style.height = sz + 'px';
    badge.style.left = (land ? innerWidth - sz - 80 : innerWidth - sz - 12) + 'px'; badge.style.top = (land ? innerHeight * 0.3 : innerHeight * 0.285) + 'px';
    badge.style.opacity = clamp(bp * 2).toFixed(3); badge.style.transform = `scale(${(0.55 + 0.45 * easeOutBack(bp, 1.2)).toFixed(4)})`;
    bsvg.style.transform = `rotate(${reduced ? 0 : ((t * 360) / 28).toFixed(2)}deg)`;
    const ex = easeOutCubic(prog(t, 2.4, 3.2));
    put(bl, ex, (1 - ex) * 14); put(br, ex, (1 - ex) * 14);
    chip.style.opacity = easeOutCubic(prog(t, 3.3, 4.1)).toFixed(3);
    cat.style.opacity = easeOutCubic(prog(t, 3.3, 4.1)).toFixed(3);
  }

  function table(cur: number, progress: number): void {
    if (cur !== shown) {
      words.forEach((w, i) => { w.classList.toggle('on', i === cur); w.classList.toggle('off', shown >= 0 && i === shown); if (i !== cur && i !== shown) w.classList.remove('off'); });
      dots.forEach((d, i) => { d.classList.toggle('on', i === cur); if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      shown = cur;
    }
    const d = dots[cur]; if (d) d.style.setProperty('--p', progress.toFixed(3));
  }
  const picks: ((i: number) => void)[] = [], holds: ((h: boolean) => void)[] = [];
  dots.forEach((d, i) => d.addEventListener('click', () => picks.forEach((f) => f(i))));
  for (const [on, off] of [['pointerenter', 'pointerleave'], ['focusin', 'focusout']] as const) { cat.addEventListener(on, () => holds.forEach((f) => f(true))); cat.addEventListener(off, () => holds.forEach((f) => f(false))); }

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
  return { chrome, table, measure, scroll, onPick: (cb) => { picks.push(cb); }, onHold: (cb) => { holds.push(cb); } };
}
