import bean from '../assets/hero/bean.webp?url';
import body from '../assets/hero/body.webp?url';
import cup from '../assets/hero/cup.webp?url';
import halo from '../assets/hero/halo.png?url';
import ink from '../assets/hero/ink.png?url';
import lid from '../assets/hero/lid.webp?url';
import sdf from '../assets/hero/sdf.png?url';

export type ImgKey = 'cup' | 'body' | 'lid' | 'ink' | 'halo' | 'bean' | 'sdf';

/** the decoded hero textures (filled by loadImages) */
export const imgs = {} as Record<ImgKey, HTMLImageElement>;

const load = (k: ImgKey, src: string): Promise<void> =>
  new Promise((res) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => res();
    i.onerror = () => res();
    i.src = src;
    imgs[k] = i;
  });

export const loadImages = (): Promise<void[]> =>
  Promise.all([load('cup', cup), load('body', body), load('lid', lid), load('ink', ink), load('halo', halo), load('bean', bean), load('sdf', sdf)]);
