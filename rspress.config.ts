import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: 'docs',
  title: 'modernjs-typed-routes',
  description:
    'Type-safe routes for Modern.js — generated route types with typed Link, Navigate and useNavigate.',
  themeConfig: {
    enableContentAnimation: true,
    lastUpdated: true,
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/giancarlosisasi/modernjs-typed-routes',
      },
    ],
    footer: {
      message: 'MIT Licensed | Made by Giancarlos Isasi',
    },
  },
});
