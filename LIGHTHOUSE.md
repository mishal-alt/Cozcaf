# Lighthouse results

Production build served with brotli and the cache headers from `public/_headers`, Lighthouse 13, Chrome, simulated throttling. Mobile uses the default mobile profile (slow 4G, 4x CPU slowdown). 5 runs each.

| | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile | 99 to 100 | 100 | 100 | 100 | 0.9 to 1.1 s | 1.5 to 2.0 s | 10 to 40 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.2 to 0.3 s | 0.4 to 0.5 s | 0 ms | 0 |

Targets were Performance >= 90, Accessibility 100, Best Practices >= 95, SEO 100.

Also checked (`npm run smoke`, 9 widths from 360 to 1920 px, with and without reduced motion): no horizontal scroll, no console errors, no failed requests, one h1, one main landmark, alt text on every image, touch targets >= 44 px on phones.
Safari engine (WebKit) smoke test passes on desktop and phone.

What mattered for the score: the loader, fonts and critical CSS are plain HTML; the hero engine is its own 37 KB chunk started after first paint and does its set-up in small slices behind the loader; the intro controls no longer shift; and the badge text no longer needs a first-paint layout of the whole stage.

Opening page redesign (live canvas scene, about 310 KB of dish images): Desktop 99 to 100, Mobile 74 to 87 (LCP about 3.7 s, TBT 110 ms typical). The old cup scene scored Mobile 90 on the same machine; the remaining gap is the larger first load.

Video opening page (four clips): Desktop 90 to 91, Mobile 71 to 77 (TBT 0 to 290 ms, Speed Index 1.3 to 1.7 s). Lighthouse's simulated mobile LCP reads 6.6 s every run, although in a real 4x-throttled trace the tagline paints at about 0.4 s; the simulator appears to tie it to the video start. Keep the 1.8 s video delay (`VIDEO_DELAY` in `src/hero/index.ts`): starting at load cost about 10 more points.

Reproduce:

```sh
npm run build
npm run lighthouse -- --runs=5          # add -- --only=mobile for one profile
```

Reports are written to `tools/compare/out/lh/` (ignored by git).

Opening film (one 6 MB Veo film, image first frame, film starts 0.6 s after load): Desktop 94 to 96, Mobile 75 to 91 (3 runs each). Keep the first frame as a real `<img>` and the film starting after `load`: with the video itself as the first paint, Lighthouse read LCP as the full film download (46 s).
