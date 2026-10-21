/**
 * COZCAF: every editable fact about the cafe lives here.
 *
 * Anything marked TO SUPPLY is not known yet. While it is empty, the element that depends on it
 * (button, link, line of text) is not rendered at all, so nobody ever sees a fake number or a dead link.
 * Fill the value in, rebuild, and it appears everywhere it is used (page, footer, structured data).
 */

export interface OpeningHours {
  /** 24-hour "HH:MM" */
  open: string;
  close: string;
  /** IANA time zone the cafe lives in; the live Open / Closed chip is always computed in it */
  tz: string;
  /** shown as the days line, e.g. "Monday – Sunday" */
  label: string;
}

export interface Rating {
  value: string;
  count: string;
  url: string;
}

export interface SiteConfig {
  name: string;
  /** TO SUPPLY: the live https domain, no trailing slash. Used for canonical, Open Graph and the sitemap. */
  url: string;
  lang: string;
  locale: string;
  title: string;
  description: string;
  tagline: string;
  /** shown in the no-JavaScript fallback and as the page's single h1 */
  h1: string;
  themeColor: string;

  // contact and links
  /** TO SUPPLY: country code + number, digits only, e.g. "91XXXXXXXXXX". Empty hides every WhatsApp button. */
  whatsappNumber: string;
  whatsappOrderText: string;
  whatsappReserveText: string;
  /** TO SUPPLY: e.g. "+91 98XXX XXXXX". Empty hides the tap-to-call line. */
  phone: string;
  /** TO SUPPLY (optional): shown in the footer when filled. */
  email: string;
  /** CONFIRM: taken from the shared site design */
  instagramHandle: string;
  instagramUrl: string;
  /** Works as a Maps search today. TO SUPPLY: the exact Google Maps place link (Share, Copy link). */
  mapsUrl: string;
  /** OPTIONAL: Google Maps "Embed a map" URL (the iframe src). Adds a live, lazy-loaded map above the link card. */
  mapEmbedUrl: string;
  /** TO SUPPLY: link to the full menu PDF. Empty hides the "Download full menu" button. */
  menuPdfUrl: string;
  /** TO SUPPLY: coordinates of the Maps pin. Empty = left out of the structured data. */
  geo: { lat: number; lng: number } | null;

  // facts
  landmark: string;
  locality: string;
  region: string;
  country: string;
  /** TO SUPPLY: e.g. "Parking available beside the cafe". Shown only when filled. */
  parking: string;
  hours: OpeningHours;
  since: string;
  /** TO SUPPLY: e.g. "₹₹". Left out of the structured data until filled. */
  priceRange: string;
  /** Shown only when value, count and url are all real. */
  rating: Rating;

  // sharing
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: number;
  ogImageHeight: number;
}

export const site: SiteConfig = {
  name: 'COZCAF',
  url: 'https://cozcaf.example',
  lang: 'en',
  locale: 'en_IN',
  title: 'COZCAF | Specialty coffee and kitchen in Kodappali, Parappanangadi',
  description:
    'COZCAF is a cozy specialty coffee cafe and kitchen in Kodappali, Parappanangadi: hand-poured latte art, coolers, comfort food and desserts. Open daily 8 AM to 11 PM, opposite Jio Petrol Pump.',
  tagline: 'A little coffee. A lot of feeling.',
  h1: 'COZCAF, a cozy specialty coffee cafe in Parappanangadi',
  themeColor: '#3B4833',

  whatsappNumber: '',
  whatsappOrderText: "Hi COZCAF, I'd like to order",
  whatsappReserveText: "Hi COZCAF, I'd like to reserve a table",
  phone: '',
  email: '',
  instagramHandle: '@coz_caf',
  instagramUrl: 'https://www.instagram.com/coz_caf/',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=COZCAF%20Kodappali%20Parappanangadi',
  mapEmbedUrl: '',
  menuPdfUrl: '',
  geo: null,

  landmark: 'Opposite Jio Petrol Pump',
  locality: 'Kodappali, Parappanangadi',
  region: 'Kerala',
  country: 'IN',
  parking: '',
  hours: { open: '08:00', close: '23:00', tz: 'Asia/Kolkata', label: 'Monday – Sunday' },
  since: 'Est. 2021',
  priceRange: '',
  rating: { value: '', count: '', url: '' },

  ogImage: '/og.jpg',
  ogImageAlt: 'A COZCAF takeaway cup beside the COZCAF logo on a moss-green background',
  ogImageWidth: 1200,
  ogImageHeight: 630,
};
