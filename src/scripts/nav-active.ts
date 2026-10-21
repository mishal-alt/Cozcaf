import { $, qa, rafThrottle } from './dom';

/** Marks the header link of the section being read (aria-current), using a line 38% down the viewport. */
export function initNavActive(): void {
  const sections = ['story', 'menu', 'visit', 'gallery'].map((id) => ({ id, el: $(id) })).filter((s): s is { id: string; el: HTMLElement } => s.el !== null);
  const links = qa<HTMLAnchorElement>('#nav a[data-sec]');
  const update = (): void => {
    const y = window.innerHeight * 0.38;
    let current = '';
    for (const s of sections) if (s.el.getBoundingClientRect().top <= y) current = s.id;
    for (const a of links) {
      if (a.dataset.sec === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };
  const onScroll = rafThrottle(update);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
}
