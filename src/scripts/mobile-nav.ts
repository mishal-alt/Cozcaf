import { $, qa } from './dom';

let sheet: HTMLElement | null = null;
let burger: HTMLElement | null = null;

let closing = 0;
const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function openSheet(): void {
  if (!sheet || !burger) return;
  clearTimeout(closing);
  const r = burger.getBoundingClientRect();                       // the reveal grows out of the burger
  sheet.style.setProperty('--ox', r.left + r.width / 2 + 'px');
  sheet.style.setProperty('--oy', r.top + r.height / 2 + 'px');
  sheet.hidden = false;
  void sheet.offsetWidth;                                         // commit the closed state so the open transition runs
  sheet.classList.add('open');
  document.documentElement.classList.add('nav-open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  sheet.focus({ preventScroll: true });
}

/** back = send focus to the burger button (used for Esc and a second tap on it) */
export function closeSheet(back: boolean): void {
  if (!sheet || !burger || sheet.hidden || !sheet.classList.contains('open')) return;
  const s = sheet;
  s.classList.remove('open');
  document.documentElement.classList.remove('nav-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  clearTimeout(closing);
  closing = window.setTimeout(() => { s.hidden = true; }, reduced() ? 0 : 480);   // let the circle shrink back before hiding it
  if (back) burger.focus();
}

/** The phone menu sheet: opens from the burger, closes on a link, an outside tap or Esc, and keeps Tab inside while open. */
export function initMobileNav(): void {
  sheet = $('sheet');
  burger = $('burger');
  const s = sheet;
  const b = burger;
  if (!s || !b) return;

  b.addEventListener('click', () => (s.classList.contains('open') ? closeSheet(true) : openSheet()));
  s.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) closeSheet(false);   // the unlock lands before the anchor scrolls
  });

  /* keep Tab inside the open sheet: burger -> links -> burger */
  const trap = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || !s.classList.contains('open')) return;
    const f: HTMLElement[] = [b, ...qa<HTMLAnchorElement>('a:not([hidden])', s)];
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1]?.focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0]?.focus();
    }
  };
  s.addEventListener('keydown', trap);
  b.addEventListener('keydown', trap);

  addEventListener('pointerdown', (e) => {
    const target = e.target as Element;
    if (target.closest('#ui')) return; // the intro controls never dismiss the sheet
    if (s.classList.contains('open') && !target.closest('#sheet, #burger')) closeSheet(false);
  });

  // a rotation or resize to the desktop layout hides the burger, so the sheet must not stay open (and the page locked)
  addEventListener('resize', () => {
    if (s.classList.contains('open') && getComputedStyle(b).display === 'none') closeSheet(false);
  });

  // Esc closes the sheet first; marking the event handled keeps the intro's Skip from also firing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && s.classList.contains('open')) {
      e.preventDefault();
      closeSheet(true);
    }
  });
}
