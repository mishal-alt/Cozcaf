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

const waText = { order: site.whatsappOrderText, reserve: site.whatsappReserveText, partner: site.whatsappPartnerText } as const;

export const waHref = (kind: keyof typeof waText): string =>
  'https://wa.me/' + digits(site.whatsappNumber) + '?text=' + encodeURIComponent(waText[kind]);

export const telHref = 'tel:' + site.phone.replace(/[^\d+]/g, '');
export const mailHref = 'mailto:' + site.email;

const partnerWa = digits(site.partnerWhatsapp).length >= 10;

/** partnership enquiries go to the best channel that exists: the owner's WhatsApp, the cafe's WhatsApp, email, then Instagram */
export const partnerHref: string = partnerWa
  ? 'https://wa.me/' + digits(site.partnerWhatsapp) + '?text=' + encodeURIComponent(site.whatsappPartnerText)
  : has.wa
    ? waHref('partner')
    : has.email
      ? mailHref + '?subject=' + encodeURIComponent('Partnership enquiry') + '&body=' + encodeURIComponent(site.whatsappPartnerText)
      : site.instagramUrl;
export const partnerExternal = partnerWa || has.wa || !has.email;
