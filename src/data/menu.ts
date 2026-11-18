/**
 * The menu, a short teaser of the client's menu PDF (the four top-priced dishes per tab). Prices are intentionally not stored or shown (as in the
 * approved design); size / portion variants are collapsed into a single dish.
 * Dietary marks are only shown when added: diet: ['Veg'] (the green veg symbol), ['NonVeg'] (the brown non-veg symbol), ['Spicy'].
 * A dish served both ways gets both marks. Only dishes the client's PDF makes clear are marked; the rest wait for the client.
 */
export type Diet = 'Veg' | 'NonVeg' | 'Spicy';

export interface MenuItem {
  name: string;
  /** small label on the tile, e.g. "Signature"; empty = no label */
  tag: string;
  diet: readonly Diet[];
  desc: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  items: readonly MenuItem[];
}

export const menu = {
  categories: [
    {
      id: 'coffee',
      label: 'Coffee',
      items: [
        { name: 'Ice Toffee', tag: '', diet: [], desc: 'Toffee, coffee and ice: sweet happiness in every sip.' },
        { name: 'Ice Mocha', tag: '', diet: [], desc: 'Chocolatey, creamy and chilled to perfection.' },
        { name: 'Coffee Affogato', tag: '', diet: [], desc: 'Ice cream and hot espresso. Dessert or coffee? Why not both.' },
        { name: 'Spanish Iced Latte', tag: '', diet: [], desc: 'Sweet, creamy and oh-so-satisfying. You’ll love it.' },
      ],
    },
    {
      id: 'starter',
      label: 'Starter',
      items: [
        { name: 'Peri Peri Loaded Fries', tag: '', diet: ['NonVeg', 'Spicy'], desc: 'Spicy peri peri chicken over golden fries with a fiery kick.' },
        { name: 'Cheesy Chicken Loaded Fries', tag: '', diet: ['NonVeg'], desc: 'Crispy fries topped with succulent chicken, rich cheese and indulgent layers.' },
        { name: 'Salad', tag: '', diet: ['Veg', 'NonVeg'], desc: 'Fresh, crunchy and healthy. Veg or Non-Veg.' },
        { name: 'Chicken Strips', tag: '', diet: ['NonVeg'], desc: 'Premium chicken strips, crunchy outside, juicy inside.' },
      ],
    },
    {
      id: 'burgers',
      label: 'Burgers & Wraps',
      items: [
        { name: 'Chicken Double Patty Burger', tag: '', diet: ['NonVeg'], desc: 'Two juicy chicken patties, a fresh bun and indulgent layers.' },
        { name: 'Zinger Wrap', tag: '', diet: ['NonVeg'], desc: 'Crispy zinger chicken rolled in a soft wrap with bold flavours.' },
        { name: 'Mexican Spicy Zinger', tag: '', diet: ['NonVeg', 'Spicy'], desc: 'Crispy zinger fillet with a fiery Mexican kick.' },
        { name: 'Zinger Burger', tag: '', diet: ['NonVeg'], desc: 'Crunchy zinger fillet, fresh lettuce and creamy mayo in a soft bun.' },
      ],
    },
    {
      id: 'mains',
      label: 'Mains',
      items: [
        { name: 'Spicy Arrabbiata Pasta', tag: '', diet: ['Veg', 'NonVeg', 'Spicy'], desc: 'Classic arrabbiata sauce with rich spice. Veg or Non-Veg.' },
        { name: 'Alfredo Pasta', tag: 'Signature', diet: ['Veg', 'NonVeg'], desc: 'Rich, creamy white sauce with Italian herbs. Veg or Non-Veg.' },
        { name: 'Creamy Tomato Pasta', tag: '', diet: ['Veg', 'NonVeg'], desc: 'A smooth tomato cream sauce. Veg or Non-Veg.' },
        { name: 'Fried Chicken', tag: '', diet: ['NonVeg'], desc: 'Crispy, golden fried chicken served with kuboos, French fries, mayo and ketchup.' },
      ],
    },
  ],
} as const satisfies { categories: readonly MenuCategory[] };
