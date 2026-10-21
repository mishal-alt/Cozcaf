import { site } from '../data/site';

const digits = (v: string): string => v.replace(/\D/g, '');
const isUrl = (v: string): boolean => /^https?:\/\//i.test(v);

/** Which optional details exist. A component renders its element only when the matching flag is true. */
export const has = {
  wa: digits(site.whatsappNumber).length >= 10,
  phone: digits(site.phone).length >= 7,
  email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(site.email),
  pdf: isUrl(site.menuPdfUrl),
  maps: isUrl(site.mapsUrl),
  ig: isUrl(site.instagramUrl),
  embed: isUrl(site.mapEmbedUrl),
  parking: site.parking !== '',
  rating: site.rating.value !== '' && site.rating.count !== '' && isUrl(site.rating.url),
} as const;

export const waHref = (kind: 'order' | 'reserve'): string =>
  'https://wa.me/' + digits(site.whatsappNumber) + '?text=' + encodeURIComponent(kind === 'reserve' ? site.whatsappReserveText : site.whatsappOrderText);

export const telHref = 'tel:' + site.phone.replace(/[^\d+]/g, '');
export const mailHref = 'mailto:' + site.email;
