import { qa, reveals } from './dom';

/** Splits a heading into masked words; the text stays real DOM text. Every word is <span.w><span.wi style="--wi:n">word</span></span>. */
function splitWords(heading: Element): void {
  let n = 0;
  const walk = (node: Node): void => {
    for (const c of Array.from(node.childNodes)) {
      if (c.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (c.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); continue; }
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.style.setProperty('--wi', String(n++));
          wi.textContent = part;
          w.appendChild(wi);
          frag.appendChild(w);
        }
        c.parentNode?.replaceChild(frag, c);
      } else if (c.nodeType === Node.ELEMENT_NODE) {
        walk(c);
      }
    }
  };
  walk(heading);
}

/**
 * Scroll reveals. Elements marked .rv / .split get .in when they scroll into view;
 * clipped photos (.rv-img / .rv-wipe) have no visible area yet, so their unclipped parent is watched instead.
 */
export function initReveal(): void {
  if (!reveals()) return;
  qa('.split').forEach(splitWords);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.01, rootMargin: '0px 0px -9% 0px' },
  );
  qa('#site .rv, #site .split').forEach((el) => io.observe(el));

  const clipped = new Map<Element, Element[]>();
  const io2 = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        clipped.get(e.target)?.forEach((x) => x.classList.add('in'));
        io2.unobserve(e.target);
      }
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  qa('#site .rv-img, #site .rv-wipe').forEach((el) => {
    const holder = el.parentElement;
    if (!holder) return;
    const list = clipped.get(holder) ?? [];
    list.push(el);
    clipped.set(holder, list);
    io2.observe(holder);
  });
}
