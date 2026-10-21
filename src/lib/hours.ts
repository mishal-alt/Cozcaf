import type { OpeningHours } from '../data/site';

const toMin = (s: string): number => {
  const [h = 0, m = 0] = s.split(':').map(Number);
  return h * 60 + m;
};

/** "08:00" -> "8 AM", "23:30" -> "11:30 PM" */
export const fmt12 = (s: string): string => {
  const [h = 0, m = 0] = s.split(':').map(Number);
  return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h >= 12 && h < 24 ? ' PM' : ' AM');
};

/** minutes since midnight in the given IANA time zone */
export function nowMinutes(tz: string, now: Date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return (get('hour') % 24) * 60 + get('minute');
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

export interface OpenState {
  open: boolean;
  /** open, but closing within SOON_MIN minutes */
  soon: boolean;
  text: string;
  range: string;
}

const SOON_MIN = 45;

export function openState(h: OpeningHours, now: Date = new Date()): OpenState {
  const o = toMin(h.open);
  const c = toMin(h.close);
  const n = nowMinutes(h.tz, now);
  const open = o < c ? n >= o && n < c : n >= o || n < c;
  const soon = open && (c - n + 1440) % 1440 <= SOON_MIN;
  return {
    open,
    soon,
    text: (soon ? 'Closing soon · until ' : open ? 'Open now · until ' : 'Closed · opens ') + fmt12(open ? h.close : h.open),
    range: fmt12(h.open) + ' – ' + fmt12(h.close),
  };
}
