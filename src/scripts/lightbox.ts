import { $, qa } from './dom';

/** Gallery lightbox: soft veil, arrows, swipe, Esc, focus trapped inside, page behind made inert. */
export function initLightbox(): void {
  const tiles = qa<HTMLButtonElement>('.g-tile');
  const lb = $('lb');
  const img = $<HTMLImageElement>('lb-img');
  const cap = $('lb-cap');
  const count = $('lb-count');
  const closeBtn = lb?.querySelector<HTMLButtonElement>('.lb-close');
  const prevBtn = lb?.querySelector<HTMLButtonElement>('.lb-prev');
  const nextBtn = lb?.querySelector<HTMLButtonElement>('.lb-next');
  if (!lb || !img || !cap || !count || !closeBtn || !prevBtn || !nextBtn || !tiles.length) return;

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behind = ['page', 'hdr', 'ui'].map((id) => $(id)).filter((e): e is HTMLElement => e !== null);
  let index = 0;
  let opener: HTMLElement | null = null;
  let isOpen = false;
  let hideTimer = 0;

  /** the largest WebP of a tile (falls back to the img's own srcset) */
  function bigSrc(tile: HTMLElement): { url: string; alt: string } {
    const im = tile.querySelector('img');
    const so = tile.querySelector('source[type="image/webp"]');
    const list = (so?.getAttribute('srcset') ?? im?.getAttribute('srcset') ?? '')
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .filter((a) => a[0])
      .sort((a, b) => parseInt(a[1] ?? '0', 10) - parseInt(b[1] ?? '0', 10));
    const largest = list[list.length - 1];
    return { url: largest?.[0] ?? im?.currentSrc ?? im?.src ?? '', alt: im?.alt ?? '' };
  }

  function show(i: number): void {
    index = (i + tiles.length) % tiles.length;
    const tile = tiles[index];
    if (!tile || !img || !cap || !count) return;
    const b = bigSrc(tile);
    img.src = b.url;
    img.alt = b.alt;
    cap.textContent = b.alt;
    count.textContent = index + 1 + ' / ' + tiles.length;
  }

  function open(i: number, from: HTMLElement): void {
    if (isOpen || !lb) return;
    opener = from;
    isOpen = true;
    clearTimeout(hideTimer);
    show(i);
    lb.hidden = false;
    root.classList.add('lb-open');
    behind.forEach((e) => (e.inert = true));
    void lb.offsetWidth;
    lb.classList.add('on');
    closeBtn?.focus();
  }

  function close(): void {
    if (!isOpen || !lb) return;
    isOpen = false;
    lb.classList.remove('on');
    root.classList.remove('lb-open');
    behind.forEach((e) => (e.inert = false));
    hideTimer = window.setTimeout(() => {
      lb.hidden = true;
      img?.removeAttribute('src');
    }, reduce ? 0 : 260);
    opener?.focus();
  }

  tiles.forEach((t, i) => t.addEventListener('click', () => open(i, t)));
  qa('[data-close]', lb).forEach((b) => b.addEventListener('click', close));
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  document.addEventListener(
    'keydown',
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        show(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        show(index + 1);
      } else if (e.key === 'Tab') {
        const f = qa<HTMLElement>('.lb-btn', lb);
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!f.includes(document.activeElement as HTMLElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    true,
  );

  let startX = 0;
  lb.addEventListener('touchstart', (e) => (startX = e.changedTouches[0]?.clientX ?? 0), { passive: true });
  lb.addEventListener(
    'touchend',
    (e) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - startX;
      if (Math.abs(dx) > 56) show(index + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );
}
