import { defineConfig } from 'astro/config';
import { site } from './src/data/site';

export default defineConfig({
  // the live domain is edited in one place: src/data/site.ts
  site: site.url,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  devToolbar: { enabled: false },
  build: {
    // one small page: inline the CSS so nothing blocks the first paint
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // never turn the hero textures or fonts into data: URIs; they are cached as separate hashed files
      assetsInlineLimit: 0,
      // NO_MINIFY=1 keeps function names readable for profiling (tools/perf/profile.mjs)
      ...(process.env.NO_MINIFY ? { minify: false } : {}),
    },
  },
});
