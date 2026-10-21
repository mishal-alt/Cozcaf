import { $, qa, reveals } from './dom';

/**
 * Menu tabs with a sliding underline. All four category panels are in the HTML; the tabs only swap which one is shown
 * (with the same fade-out and staggered fade-up as the approved design).
 */
export function initMenuTabs(): void {
  const panel = $('panel');
  const ind = $('tab-ind');
  const tabs = qa<HTMLButtonElement>('.tab');
  const groups = panel ? qa('.menu-cols', panel) : [];
  const first = tabs[0];
  if (!panel || !ind || !first || !groups.length) return;

  const animate = reveals();
  let current: HTMLButtonElement = first;
  let swapTimer = 0;

  const group = (cat: string): HTMLElement | undefined => groups.find((g) => g.dataset.cat === cat);
  const visible = (): HTMLElement | undefined => groups.find((g) => !g.hidden);

  function moveInd(withTransition: boolean): void {
    if (!ind) return;
    if (!withTransition) ind.style.transition = 'none';
    ind.style.width = current.offsetWidth + 'px';
    ind.style.transform = 'translate(' + current.offsetLeft + 'px,' + (current.offsetTop + current.offsetHeight - 2) + 'px)';
    if (!withTransition) {
      ind.getBoundingClientRect();
      ind.style.transition = '';
    }
  }

  function show(cat: string): void {
    for (const g of groups) {
      g.hidden = g.dataset.cat !== cat;
      g.classList.remove('fade', 'swap');
    }
  }

  function select(t: HTMLButtonElement): void {
    if (t === current) return;
    current = t;
    for (const x of tabs) {
      x.setAttribute('aria-selected', x === t ? 'true' : 'false');
      x.tabIndex = x === t ? 0 : -1;
    }
    panel?.setAttribute('aria-labelledby', t.id);
    moveInd(true);
    clearTimeout(swapTimer);
    const cat = t.dataset.cat ?? '';
    if (!animate) {
      show(cat);
      return;
    }
    visible()?.classList.add('fade');
    swapTimer = window.setTimeout(() => {
      show(cat);
      const next = group(cat);
      if (!next) return;
      void next.offsetWidth;
      next.classList.add('swap');
    }, 300);
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      let n: HTMLButtonElement | undefined;
      if (d) n = tabs[(i + d + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (!n) return;
      e.preventDefault();
      n.focus();
      select(n);
    });
  });

  moveInd(false);
  const again = (): void => moveInd(false);
  if (document.fonts) {
    void document.fonts.ready.then(again);
    document.fonts.addEventListener('loadingdone', again);
  }
  window.addEventListener('resize', again);
}
