/**
 * The menu teaser. PLACEHOLDER PRICES: every price below is a stand-in so the layout can be judged.
 * The page does not show prices yet (as in the approved design); replace each one with the real price
 * (whole rupees) and set pricesConfirmed to true before any price is printed anywhere.
 * Dietary marks are only shown when added: diet: ['V'] (vegetarian), ['VG'] (vegan), ['Spicy'].
 */
export type Diet = 'V' | 'VG' | 'Spicy';

export interface MenuItem {
  name: string;
  price: number;
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
  currency: '₹',
  pricesConfirmed: false,
  categories: [
    {
      id: 'coffee',
      label: 'Coffee',
      items: [
        { name: 'Spanish Latte', price: 180, tag: 'Signature', diet: [], desc: 'Double espresso, velvety milk and a whisper of condensed sweetness, served over ice.' },
        { name: 'The Caramel Web', price: 190, tag: '', diet: [], desc: 'Our signature caramel latte art, poured to order.' },
        { name: 'Velvet Flat White', price: 160, tag: '', diet: [], desc: 'A short, strong ristretto under glossy microfoam.' },
        { name: 'Classic Cappuccino', price: 150, tag: '', diet: [], desc: 'Equal parts espresso, steamed milk and soft foam, dusted with cocoa.' },
      ],
    },
    {
      id: 'coolers',
      label: 'Coolers & Shakes',
      items: [
        { name: 'Blue Lagoon Mojito', price: 140, tag: 'Signature', diet: [], desc: 'Fresh mint, citrus and sparkle in an ocean-blue cooler.' },
        { name: 'Watermelon Cooler', price: 120, tag: '', diet: [], desc: 'Chilled watermelon, lime and a salted rim.' },
        { name: 'Iced Mocha Shake', price: 180, tag: '', diet: [], desc: 'Dark chocolate, cold espresso and whipped cream, served tall.' },
        { name: 'Cold Coffee Frappé', price: 160, tag: '', diet: [], desc: 'Our house espresso blended thick and frosty.' },
      ],
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      items: [
        { name: 'Peri Peri Loaded Fries', price: 220, tag: 'Signature', diet: [], desc: 'Crisp fries, spiced chicken, peppers and our house sauce.' },
        { name: 'Creamy Alfredo Penne', price: 260, tag: '', diet: [], desc: 'Penne folded through a rich, herbed white sauce.' },
        { name: 'Crispy Fried Chicken', price: 280, tag: '', diet: [], desc: 'Golden and juicy, served with house dips.' },
        { name: 'Chicken Box', price: 320, tag: 'Takeaway', diet: [], desc: 'Our signature fried chicken, boxed to take home.' },
      ],
    },
    {
      id: 'desserts',
      label: 'Desserts',
      items: [
        { name: 'House Cream Cake', price: 150, tag: 'Signature', diet: [], desc: 'Light sponge, whipped cream and a caramel finish.' },
        { name: 'Lotus Biscoff Delight', price: 190, tag: '', diet: [], desc: 'Caramelised biscuit, cream and a crunchy crumb.' },
        { name: 'Chocolate Ganache Slice', price: 170, tag: '', diet: [], desc: 'Rich dark chocolate, glossy and indulgent.' },
        { name: 'Affogato', price: 180, tag: '', diet: [], desc: 'Vanilla ice cream drowned in a fresh shot.' },
      ],
    },
  ],
} as const satisfies { currency: string; pricesConfirmed: boolean; categories: readonly MenuCategory[] };
