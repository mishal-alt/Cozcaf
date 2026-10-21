import type { Seg } from '../data/copy';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A heading as HTML: plain text, with the emphasised segments wrapped in <em>. */
export const headingHtml = (segs: readonly Seg[]): string => segs.map((s) => (typeof s === 'string' ? esc(s) : `<em>${esc(s.em)}</em>`)).join('');
