import { defineConfig } from 'astro/config';

// No guessed remote or repository name. Actions supplies these at deployment.
const base = process.env.BASE_PATH || '/';
if (!base.startsWith('/') || !base.endsWith('/')) throw Error('BASE_PATH must start and end with /');
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  base,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { theme: 'github-light', langAlias: { jsp: 'html' } } },
});
