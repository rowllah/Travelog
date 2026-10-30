import { defineConfig } from 'astro/config';

// Published as a GitHub Pages project site: https://rowllah.github.io/Travelog/
// If you later add a custom domain, set `site` to it and `base` to '/'.
export default defineConfig({
  site: 'https://rowllah.github.io',
  base: '/Travelog',
  trailingSlash: 'ignore',
});
