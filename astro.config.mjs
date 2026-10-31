// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://zl-scaletech.fr',
  // Non référencées : pages de retour du formulaire et aperçu interne des composants.
  integrations: [sitemap({ filter: (page) => !/\/(contact\/(merci|erreur)|components)\//.test(page) })],

  // CSS et JS toujours en fichiers externes : permet une CSP stricte
  // (sans 'unsafe-inline') dans public/.htaccess.
  build: {
    inlineStylesheets: 'never',
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 0,
    },
  },
});
