/**
 * Every line of page copy, exactly as approved. Headings are lists of segments:
 * a plain string, or { em } for the emphasised (muted / sage) part.
 */
import type { ImageName } from './images';

export type Seg = string | { readonly em: string };

export interface Photo {
  name: ImageName;
  alt: string;
}

export const nav = [
  { id: 'menu', label: 'Menu' },
  { id: 'visit', label: 'Visit' },
  { id: 'gallery', label: 'Gallery' },
] as const;

export const hero = {
  lines: ['Seriously good coffee.', 'Not-so-serious people.', 'Your daily dose of something good.'],
  right: ['Your cozy corner.', 'Every day.'],
  cue: 'Good things below',
  /** the four tables the opening page's camera visits, in order (the menu's own categories) */
  scenes: ['Coffee', 'Cold Drinks', 'Burgers & Wraps', 'Pasta'],
  scenesLabel: 'Opening scenes',
  /** the opening film in public/video/hero: one loop through the four scenes. Each dish holds `dish` seconds, then the camera moves for `move` seconds. */
  film: { src: '/video/hero/cozcaf-opening.mp4', srcHd: '/video/hero/cozcaf-opening-1080.mp4', smoke: ['/video/hero/smoke1.webp', '/video/hero/smoke2.webp'], poster: '/video/hero/cozcaf-opening.webp', dish: 8, move: 16 / 3 },
  badge: 'FRESHLY BREWED ✱ HAPPILY SIPPED ✱',
  ctaMenu: 'View menu',
  ctaVisit: 'Visit us',
  marquee: [
    'GOOD COFFEE',
    'GREAT COMPANY',
    'DESSERTS & CAKES',
    'DAILY RITUALS',
    'COZY VIBE',
    'CAREFULLY CHOSEN BEANS',
    'KODAPPALI, PARAPPANANGADI',
  ],
} as const;

export const ticker = ['Good Coffee', 'Comfort Food', 'Hand-Poured Latte Art', 'Desserts & Cakes', 'Evenings under the Lights'] as const;

export const craft = {
  eyebrow: 'Our Craft',
  heading: ['From bean to cup, ', { em: 'nothing is hurried.' }],
  lead: 'Our story begins with the bean. We choose characterful coffees with care and pack them in our signature boxes. They are the same beans you taste in every cup we pour.',
  body: 'Behind the bar, every shot is dialled in by hand, milk is steamed to a silky microfoam, and each cup is finished with art worth pausing for.',
  ticks: ['Carefully chosen beans', 'Hand-poured latte art', 'Take-home beans & gift boxes'],
  /** labels for the fact strip; the values come from src/data/site.ts */
  stats: { since: 'Brewing since', close: 'Open daily till', days: 'Days a week' },
  link: 'See the menu',
  caption: 'The bar · hand-crafted daily',
  reel: { name: 'craft-reel', label: 'Behind the COZCAF bar: milk being steamed, a barista at work and an iced coffee being poured' },
  small: { name: 'beans', alt: 'Freshly roasted coffee beans spilling from a wooden scoop onto a worn table' },
} as const;

export const signatures = {
  eyebrow: 'Signatures',
  heading: ['Our most ', { em: 'loved' }, ' pours'],
  aside: 'A small, curated selection of the drinks and plates our guests return for. Seasonal favourites rotate throughout the year.',
  link: 'Explore the menu',
  groupLabel: 'Signature pours and plates',
  cards: [
    {
      num: 'No. 01',
      kind: 'Iced Coffee',
      title: 'Rose Latte',
      text: 'Pretty in pink and tastes amazing. Floral, fresh and finished with rose petals.',
      photo: { name: 'sig-rose-latte', alt: 'A tall glass of pink rose latte with dried rose petals, raspberries and a striped straw' },
    },
    {
      num: 'No. 02',
      kind: 'Hot Coffee',
      title: 'Piccolo',
      text: 'Small but strong. Made for true coffee lovers, with art worth pausing for.',
      photo: { name: 'sig-piccolo', alt: 'A glass cup of piccolo with a latte art leaf on a green saucer beside coffee beans' },
    },
    {
      num: 'No. 03',
      kind: 'Pasta',
      title: 'Alfredo Pasta',
      text: 'Silky white sauce blended with tender chicken and Italian herbs.',
      photo: { name: 'sig-alfredo', alt: 'A green bowl of creamy chicken Alfredo pasta with herbs, next to a linen napkin' },
    },
  ],
} as const;

export const menuIntro = {
  eyebrow: 'The Menu',
  heading: ['A ', { em: 'curated' }, ' selection'],
  lead: 'A glimpse of the pours and plates we are known for.',
  tabsLabel: 'Menu categories',
  note: 'Our full menu is best discovered in person.',
  whatsapp: 'Order on WhatsApp',
  pdf: 'Download full menu (PDF)',
  diet: { Veg: 'Vegetarian', NonVeg: 'Non-vegetarian', Spicy: 'Spicy' },
} as const;

export const philosophy = {
  srHeading: 'Our philosophy',
  quote: '“Some moments are meant to be slow. We simply pour the coffee.”',
  eyebrow: 'The COZCAF Philosophy',
  clips: [
    { name: 'espresso-shot', label: 'An espresso shot pulling into a small glass beneath the machine' },
    { name: 'iced-latte', label: 'A layered iced latte with ice cubes, ready to serve', zoom: 1.7, origin: '8% 100%' },
  ],
} as const;

/** the Kerala map: one pin today, drawn on the whole state (the reference site's network map, told honestly for a single cafe) */
export const kerala = {
  eyebrow: 'Our Kerala',
  heading: ['One cozy corner today. ', { em: 'A whole state in mind.' }],
  body: 'COZCAF began with a single cafe in Kodappali, Parappanangadi. Every recipe, every cup and every corner is made to travel. This pin is where the story starts.',
  stats: [
    { label: 'Cafes', value: '1', note: 'and counting' },
    { label: 'Districts', value: '1 of 14', note: 'Malappuram first' },
  ],
  next: { label: 'Next stop', value: 'Your town?', aria: 'Bring COZCAF to your town: start a partnership conversation' },
  partner: {
    eyebrow: 'Partner with COZCAF',
    line: "Love what we pour? We're looking for the right people to bring COZCAF to their town.",
    cta: 'Start a conversation',
  },
  mapAlt: 'Map of Kerala with COZCAF marked at Parappanangadi, on the Malappuram coast',
} as const;

export const visit = {
  eyebrow: 'Visit Us',
  heading: ['Evenings under ', { em: 'the fairy lights' }],
  photo: { name: 'visit-evening', alt: 'A COZCAF latte with leaf latte art beside a white-chocolate cookie, lit by a single beam of evening light' },
  directions: 'Get directions',
  reserve: 'Reserve a table',
  bookWhatsapp: 'Book on WhatsApp',
  walkIns: 'Walk-ins welcome',
  mapLabel: 'Open COZCAF on Google Maps',
  mapGo: 'Open in Google Maps',
  mapEmbedTitle: 'Map showing where COZCAF is in Kodappali, Parappanangadi',
  headings: { find: 'Find us', hours: 'Hours', reservations: 'Reservations' },
} as const;

export const gallery = {
  eyebrow: 'Moments',
  heading: ['Follow the ', { em: 'ritual' }],
  aside: 'Plates to share, cups to go and long evenings with friends. Tag us to be featured.',
  tiles: [
    { photo: { name: 'g-blackcup', alt: 'A latte in a black COZCAF cup and saucer on a glossy counter' }, delay: '' },
    { photo: { name: 'g-takeaway', alt: 'A gloved hand holding a COZCAF takeaway cup in front of the espresso machine' }, delay: '.1s' },
    { photo: { name: 'g-balance', alt: 'A leaf latte art cup next to the COZCAF sign: balance a coin on the lemon for a free coffee' }, delay: '.2s' },
  ],
} as const;

export const footer = {
  heading: ['Stay close to ', { em: 'the cafe' }],
  lead: 'New pours, seasonal plates and quiet evenings, shared as they happen.',
  whatsapp: 'Message us on WhatsApp',
  socialsLabel: 'COZCAF on the web',
  visitHeading: 'Visit',
  partner: 'Partnerships',
  rights: 'All rights reserved.',
  developedBy: 'Developed by',
  developer: 'Zetron Tech',
  developerUrl: 'https://www.zetron.in/',
} as const;

export const noscript = {
  line1: 'A little coffee. A lot of feeling.',
  line3: 'This site uses JavaScript for the intro, the menu and the gallery. Switch it on to see everything, or just drop by.',
} as const;
