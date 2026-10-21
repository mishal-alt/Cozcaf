/** Small DOM helpers shared by the interaction modules. */

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

export const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll<T>(sel));

/** reveal-on-scroll (and the parallax) are only switched on when the page script set js-rv: motion allowed, IntersectionObserver present */
export const reveals = (): boolean => document.documentElement.classList.contains('js-rv');

/** run fn at most once per animation frame */
export function rafThrottle(fn: () => void): () => void {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn();
    });
  };
}
