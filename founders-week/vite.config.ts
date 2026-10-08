import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* PREVIEW=1 builds the GitHub Pages staging copy into ./preview, served at
   https://garyliusf.github.io/Enterprise/founders-week/preview/.
   The default build is for Bolt (served at the site root). */
const preview = process.env.PREVIEW === '1';
const base = preview ? '/Enterprise/founders-week/preview/' : '/';
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
  build: preview ? { outDir: 'preview', emptyOutDir: true } : {},
});
