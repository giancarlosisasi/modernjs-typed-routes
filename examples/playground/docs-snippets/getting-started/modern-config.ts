// Mirrors docs/guide/getting-started.md §2 "Register the plugin" (verbatim).
import { appTools, defineConfig } from '@modern-js/app-tools';
import { routeTypesPlugin } from 'modernjs-typed-routes/plugin';

export default defineConfig({
  plugins: [
    appTools(),
    routeTypesPlugin(), // zero config
  ],
});
