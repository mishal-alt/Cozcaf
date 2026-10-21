import { imgs } from './assets';
import { ctx } from './canvas';
import { LID } from './constants';
import { lerp } from './math';
import { inImg } from './draw';
import { drawShadow, SH } from './sprites';
import { V } from './state';
import type { LidState, Pose } from './types';

export function drawLid(p: Pose, ls: LidState): void {
  inImg(p, () => {
    const C = { x: LID.x + LID.w / 2, y: LID.y + LID.h / 2 };
    const Hg = { x: LID.x + LID.w - 12, y: LID.y + LID.h - 14 };            // the flange edge it hinges on
    const P = { x: lerp(Hg.x, C.x, ls.m), y: lerp(Hg.y, C.y, ls.m) };
    ctx.translate(ls.x / V.SC, ls.y / V.SC);
    ctx.translate(P.x, P.y); ctx.rotate(ls.rot); ctx.translate(-P.x, -P.y);
    ctx.translate(C.x, C.y); ctx.scale(ls.scale, ls.scale); ctx.translate(-C.x, -C.y);
    if (ls.lift > 0) { ctx.globalAlpha = Math.min(1, ls.lift); drawShadow(SH.lid, LID.x, LID.y, (ls.lift - 1) * SH.lid.offY); ctx.globalAlpha = 1; }
    ctx.drawImage(imgs.lid, LID.x, LID.y);
  });
}
