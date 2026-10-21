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

Reproduce:

```sh
npm run build
npm run lighthouse -- --runs=5          # add -- --only=mobile for one profile
```

Reports are written to `tools/compare/out/lh/` (ignored by git).
