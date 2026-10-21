import { $ } from './dom';

/** The signature cards scroll sideways on phones, so they take a keyboard stop only then. */
export function initScrollerFocus(): void {
  const scroller = $('sig-cards');
  if (!scroller) return;
  const mq = matchMedia('(max-width: 900px)');
  const update = (): void => {
    if (mq.matches) scroller.setAttribute('tabindex', '0');
    else scroller.removeAttribute('tabindex');
  };
  update();
  window.addEventListener('resize', update);
}
