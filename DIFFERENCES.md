# Where the build is not identical to the prototype, and why

Measured with `npm run compare` (Chrome, software canvas, same clock and time zone).

**Result:** all 158 hero frames are pixel-identical (14 timestamps and 3 scroll-dock states, at 1440x900, 1920x1080, 1366x768, 2560x1440, 1024x768, 768x1024, 390x844, 360x640 and 412x915), and all 56 scroll positions of the page are pixel-identical at 390, 768, 1440 and 1920 px. 25 of 25 interaction checks match (menu tabs, keyboard, lightbox, mobile sheet, Skip, short return visit, reduced motion).

The remaining differences:

1. **Dev handles are gone from production.** `window.COZ`, `window.__seek` and per-frame timing logs exist only in the test build (`PUBLIC_HERO_TEST=1`). Nothing a visitor sees changes.
2. **Intro controls (Skip, sound) appear once the layout is known** instead of being painted first in the wrong place and then moved. This removes the prototype's layout shift (CLS 0.025 became 0). Side effect: on fractional scales the rounded edges of those two 32 px buttons antialias by up to 12/255 differently (about 50 pixels). The harness masks that corner; everything else is exact.
3. **Menu panels are in the HTML.** The prototype built the active menu panel with JavaScript; the build ships all four panels (three hidden), so the menu is indexable and works for crawlers. Tabs, fade and stagger are the same.
4. **Empty optional links render nothing.** The prototype left hidden empty wrappers (e.g. an empty list item per missing social link), which added a stray gap while WhatsApp / phone are unset. The build omits them, so footer spacing is slightly tighter than the prototype until those values exist. The harness removes the prototype's empty wrappers before comparing.
5. **Heading spacing in standards mode.** The prototype had no doctype (quirks mode). Two "eyebrow above heading" blocks needed a one-line CSS rule to keep the same 24 px gap.
6. **Hero Instagram link tap area** is scale-compensated so it is 44 css px tall even at 360 px wide (invisible pseudo-element, no visual change).
7. **Motion mode, tiny antialiasing noise.** With scroll reveals running, a few elements that finish a transform transition (e.g. the footer ghost button) can differ by up to 7/255 on a few hundred rounded-edge pixels. The set changes from run to run, so it is compositing history, not layout or colour.
8. **Placeholders:** canonical / Open Graph URLs use `https://cozcaf.example` until the real domain is set; the four unused `menu-*` photo sets from the zip are not shipped.

Kept as in the prototype on purpose: single-key shortcuts `R` (replay) and `P` (pitch mode), the sound toggle, Skip / Replay behaviour, 32 px Skip and sound buttons on fine-pointer desktops (44 px on touch and at 760 px and below), and no menu prices (dishes only).
