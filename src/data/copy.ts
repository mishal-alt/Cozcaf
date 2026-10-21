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
  link: 'See the menu',
  caption: 'The bar · hand-crafted daily',
  big: { name: 'bar', alt: 'The COZCAF bar with the illuminated logo, wooden shelves of coffee and an espresso machine' },
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
} as const;

export const philosophy = {
  srHeading: 'Our philosophy',
  quote: '“Some moments are meant to be slow. We simply pour the coffee.”',
  eyebrow: 'The COZCAF Philosophy',
} as const;

export const visit = {
  eyebrow: 'Visit Us',
  heading: ['Evenings under ', { em: 'the fairy lights' }],
  photo: { name: 'night', alt: 'The COZCAF storefront at dusk, its sign lit up under strings of fairy lights' },
  directions: 'Get directions',
  reserve: 'Reserve a table',
  bookWhatsapp: 'Book on WhatsApp',
  walkIns: 'Walk-ins welcome',
  onInstagram: 'on Instagram',
  mapLabel: 'Open COZCAF on Google Maps',
  mapGo: 'Open in Google Maps',
  mapEmbedTitle: 'Map showing where COZCAF is in Kodappali, Parappanangadi',
  headings: { find: 'Find us', hours: 'Opening hours', call: 'Call us', reservations: 'Reservations', follow: 'Follow' },
} as const;

export const gallery = {
  eyebrow: 'Moments',
  heading: ['Follow the ', { em: 'ritual' }],
  aside: 'Plates to share, cups to go and long evenings with friends. Tag us to be featured.',
  tiles: [
    { photo: { name: 'g-latte', alt: 'A latte with tulip latte art in a black cup on a wooden table' }, delay: '' },
    { photo: { name: 'g-exterior', alt: 'A hand holding a COZCAF takeaway cup in front of the olive-green café' }, delay: '.1s' },
    { photo: { name: 'g-cup', alt: 'A COZCAF takeaway cup with a black lid, outdoors' }, delay: '.2s' },
  ],
} as const;

export const footer = {
  heading: ['Stay close to ', { em: 'the cafe' }],
  lead: 'New pours, seasonal plates and quiet evenings, shared as they happen.',
  whatsapp: 'Message us on WhatsApp',
  instagram: 'Follow on Instagram',
  socialsLabel: 'COZCAF on the web',
  exploreHeading: 'Explore',
  visitHeading: 'Visit',
  explore: [
    { href: '#menu', label: 'Menu' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#visit', label: 'Visit' },
  ],
  copyright: 'COZCAF · Made with care in Kodappali',
  toTop: 'Back to top',
} as const;

export const noscript = {
  line1: 'A little coffee. A lot of feeling.',
  line3: 'This site uses JavaScript for the intro, the menu and the gallery. Switch it on to see everything, or just drop by.',
} as const;
