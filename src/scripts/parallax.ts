import { qa, rafThrottle, reveals } from './dom';

/** Light parallax on a few photos (data-px = how far they drift against the scroll). Off for reduced motion. */
export function initParallax(): void {
  if (!reveals()) return;
  const els = qa('[data-px]');
  const update = (): void => {
    const vh = window.innerHeight;
    for (const el of els) {
      const holder = el.parentElement;
      if (!holder) continue;
      const r = holder.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) continue;
      const c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (-c * parseFloat(el.dataset.px ?? '0')).toFixed(1) + 'px,0)';
    }
  };
  const onScroll = rafThrottle(update);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(update));
  update();
}
