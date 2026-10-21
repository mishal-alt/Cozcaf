import { initLightbox } from './lightbox';
import { initMenuTabs } from './menu-tabs';
import { initMobileNav } from './mobile-nav';
import { initNavActive } from './nav-active';
import { initOpenNow } from './open-now';
import { initParallax } from './parallax';
import { initReveal } from './reveal';
import { initScrollerFocus } from './scroller-focus';

initOpenNow();
initMobileNav();
initReveal();
initParallax();
initNavActive();
initMenuTabs();
initScrollerFocus();
initLightbox();

const year = document.getElementById('yr');
if (year) year.textContent = String(new Date().getFullYear());

/* The hero engine is a separate chunk. It starts after the first frame has painted (the loader is plain HTML/CSS),
   and does its heavy set-up in small slices behind the loader, so the page stays responsive. */
const startHero = (): void => {
  import('../hero')
    .then((m) => m.bootHero())
    .catch((err: unknown) => {
      console.error(err);
      document.getElementById('loader')?.classList.add('out');
    });
};
requestAnimationFrame(() => setTimeout(startHero, 0));
