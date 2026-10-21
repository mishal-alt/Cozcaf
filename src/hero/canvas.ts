import { view } from './state';

const must = <T extends HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`COZCAF hero: #${id} is missing from the page`);
  return e as T;
};

export const $ = must;
export const stage = must('stage');
export const cv = must<HTMLCanvasElement>('fx');
export const ctx = cv.getContext('2d') as CanvasRenderingContext2D;

export const resetView = (): void => {
  const t = view.VT;
  ctx.setTransform(t[0], 0, 0, t[3], t[4], t[5]);
};
