# COZCAF

Static front-end site for the COZCAF cafe (Kodappali, Parappanangadi). Astro (static output) + TypeScript (strict) + plain CSS.
The opening page is one looping film of the cafe's dishes (`public/video/hero`) under the COZCAF lettering, which docks into the header on scroll. No animation libraries, no backend.

## Run it

Needs Node 22.12 or newer.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
npm run check      # astro check (strict TypeScript)
```

## Editing content

Everything editable is typed data, no HTML to touch:

| File | What |
| --- | --- |
| `src/data/site.ts` | phone, WhatsApp, Instagram, address, hours, Maps link, PDF menu, rating, domain, SEO text |
| `src/data/menu.ts` | the four menu categories and their dishes |
| `src/data/copy.ts` | every other line of page copy and the photo alt texts |
| `hero.scenes` / `hero.film` in `src/data/copy.ts` | the four opening scenes' names, and the film's files and timing (seconds per table and per camera move) in `public/video/hero` |

If a value is empty (WhatsApp, phone, PDF, email, parking, rating, map embed), the element that depends on it is **not rendered at all**.
Fill it in, rebuild, and it appears everywhere it is used, including the structured data.

Photos live in `public/img` as AVIF / WebP / JPEG at two widths (`name-480.avif`, `name-960.avif` ...).
After adding or replacing photos run `npm run images` (macOS) to refresh `src/data/images.ts`, which holds the real pixel sizes.

## Project layout

```
src/
  components/   one .astro per section, its .css beside it (Header, Hero, Story, Craft, Signatures, Menu,
                Philosophy, Visit, Gallery, Footer, Lightbox, Ticker, Loader, IntroControls ...)
  data/         site.ts  menu.ts  copy.ts  images.ts
  hero/         the opening page: film controller (index), lettering, badge and copy (page), env and easing helpers
  scripts/      small interaction modules: reveal, parallax, nav-active, menu-tabs, lightbox, mobile-nav, open-now
  styles/       tokens, base, type, buttons, chip, reveal, fonts
  assets/       self-hosted WOFF2 fonts and the hero textures (hashed at build)
  layouts/      Base.astro: head, SEO, Open Graph, canonical, LocalBusiness JSON-LD
public/         photos, favicons, og.jpg, _headers, robots/sitemap come from src/pages
tools/          comparison harness and Lighthouse runner (dev only, never shipped)
reference/      the approved prototype, unzipped (used only by the comparison harness)
```

## Verifying against the prototype

```sh
npm run smoke      # no horizontal scroll 360-1920, no console errors, alt text, one h1, 44px touch targets
npm run build && npm run lighthouse -- --runs=3
```

`npm run build:test` produces `dist-test/` with `window.__seek(t, dock)` exposed so the harness can render the same hero frame in both pages.
That handle is compiled out of the normal build.

## Deploy

All three work with no setup beyond connecting the repo (build `npm run build`, output `dist`):

- **Netlify:** `netlify.toml` (headers come from `public/_headers`)
- **Cloudflare Pages:** `public/_headers`
- **Vercel:** `vercel.json`

Before going live set `site.url` in `src/data/site.ts` to the real domain: it feeds the canonical link, Open Graph URLs, sitemap, robots and JSON-LD.
