import { $, qa } from './dom';

let sheet: HTMLElement | null = null;
let burger: HTMLElement | null = null;

export function openSheet(): void {
  if (!sheet || !burger) return;
  sheet.hidden = false;
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  sheet.querySelector('a')?.focus();
}

/** back = send focus to the burger button (used for Esc and a second tap on it) */
export function closeSheet(back: boolean): void {
  if (!sheet || !burger || sheet.hidden) return;
  sheet.hidden = true;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  if (back) burger.focus();
}

/** The phone menu sheet: opens from the burger, closes on a link, an outside tap or Esc, and keeps Tab inside while open. */
export function initMobileNav(): void {
  sheet = $('sheet');
  burger = $('burger');
  const s = sheet;
  const b = burger;
  if (!s || !b) return;

  b.addEventListener('click', () => (s.hidden ? openSheet() : closeSheet(true)));
  s.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) closeSheet(false);
  });

  /* keep Tab inside the open sheet: burger -> links -> burger */
  const trap = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || s.hidden) return;
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
    if (!s.hidden && !target.closest('#sheet, #burger')) closeSheet(false);
  });

  // Esc closes the sheet first; marking the event handled keeps the intro's Skip from also firing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !s.hidden) {
      e.preventDefault();
      closeSheet(true);
    }
  });
}
