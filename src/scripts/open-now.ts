import { openState } from '../lib/hours';
import { qa } from './dom';

/** Live Open / Closed chips, always computed in the cafe's own time zone (the hours come from the chip's data attributes). */
export function initOpenNow(): void {
  const chips = qa('[data-open-chip]');
  if (!chips.length) return;
  const update = (): void => {
    for (const chip of chips) {
      const { opens, closes, tz } = chip.dataset;
      if (!opens || !closes || !tz) continue;
      const st = openState({ open: opens, close: closes, tz, label: '' });
      const text = chip.querySelector('[data-open-text]');
      if (text && text.textContent !== st.text) text.textContent = st.text;
      chip.dataset.open = st.open ? 'true' : 'false';
    }
  };
  update();
  setInterval(update, 30000); // keeps the chips honest while the page stays open
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });
}
