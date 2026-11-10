import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* PREVIEW=1 builds the GitHub Pages staging copy into ../builders-week (repo
   root), served at https://garyliusf.github.io/Enterprise/builders-week/.
   founders-week/preview/ is now only a redirect to it.
   The default build is for Bolt (served at the site root). */
const preview = process.env.PREVIEW === '1';
const base = preview ? '/Enterprise/builders-week/' : '/';
const origin = preview ? 'https://garyliusf.github.io' : '';

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'abs-base',
      transformIndexHtml: (html) => html.replaceAll('%BASE_ABS%', origin + base),
    },
  ],
  build: preview ? { outDir: '../builders-week', emptyOutDir: true } : {},
});
