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
  { id: 'story', label: 'Our story' },
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

export const story = {
  eyebrow: 'The COZCAF Way',
  heading: ['We believe coffee should ', { em: 'never be rushed.' }],
  lead: 'Every bean is chosen with care, every shot is pulled with intention, and every guest is welcomed like an old friend.',
  pillars: [
    {
      num: 'I.',
      title: 'Origin',
      text: 'Carefully chosen beans, picked for depth, sweetness and balance.',
      photo: { name: 'pillar-origin', alt: 'Roasted coffee beans in a COZCAF gift box' },
    },
    {
      num: 'II.',
      title: 'Craft',
      text: 'Every cup is made by hand: espresso pulled to order, milk steamed to a silky finish.',
      photo: { name: 'pillar-craft', alt: 'Hands steadying a teal cup of cappuccino with a caramel spider-web pattern' },
    },
    {
      num: 'III.',
      title: 'Comfort',
      text: 'Warm wood, soft light and quiet corners. A space made for slow conversations.',
      photo: { name: 'pillar-comfort', alt: 'The COZCAF sign glowing at dusk under strings of fairy lights' },
    },
  ],
} as const;

export const craft = {
  eyebrow: 'Our Craft',
  heading: ['From bean to cup, ', { em: 'nothing is hurried.' }],
  lead: 'Our story begins with the bean. We choose characterful coffees with care and pack them in our signature boxes. They are the same beans you taste in every cup we pour.',
  body: 'Behind the bar, every shot is dialled in by hand, milk is steamed to a silky microfoam, and each cup is finished with art worth pausing for.',
  ticks: ['Carefully chosen beans', 'Hand-poured latte art', 'Take-home beans & gift boxes'],
  link: 'See the menu',
  caption: 'The bar · hand-crafted daily',
  big: { name: 'bar', alt: 'The COZCAF bar with the illuminated logo, wooden shelves of coffee and an espresso machine' },
  small: { name: 'beans', alt: 'Roasted coffee beans in a COZCAF gift box' },
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
      kind: 'Coffee',
      title: 'The Caramel Web',
      text: 'Velvet microfoam over a double shot, finished with a hand-drawn caramel web.',
      photo: { name: 'caramel', alt: 'A cappuccino with a caramel spider-web pattern in a teal cup' },
    },
    {
      num: 'No. 02',
      kind: 'Dessert',
      title: 'Coffee & Cake',
      text: 'A silky latte paired with our chilled house cream cake. The perfect pause.',
      photo: { name: 'cake', alt: 'A latte and a slice of cream cake with chocolate sauce, with the COZCAF counter behind' },
    },
    {
      num: 'No. 03',
      kind: 'Takeaway',
      title: 'COZCAF To-Go',
      text: 'Your favourite pour in our signature cup, made for the road ahead.',
      photo: { name: 'cup', alt: 'A COZCAF takeaway cup with a black lid' },
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
    { photo: { name: 'g-exterior', alt: 'A hand holding a COZCAF takeaway cup in front of the olive-green café' }, delay: '' },
    { photo: { name: 'g-food', alt: 'A blue mint cooler beside a plate of spiced chicken and peppers' }, delay: '.1s' },
    { photo: { name: 'g-bar', alt: 'The COZCAF bar with its round teal logo, shelves of coffee boxes and glassware' }, delay: '.2s' },
    { photo: { name: 'g-latte', alt: 'A latte with tulip latte art in a black cup on a wooden table' }, delay: '' },
    { photo: { name: 'g-beans', alt: 'Roasted beans spilling from a COZCAF gift box' }, delay: '.1s' },
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
    { href: '#story', label: 'Our story' },
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
