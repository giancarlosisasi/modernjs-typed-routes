import { appTools, defineConfig } from '@modern-js/app-tools';
import { routeTypesPlugin } from 'modernjs-typed-routes/plugin';

// BENCH_TYPED_ROUTES=off lets scripts/bench/bench-e2e.mjs time the exact
// same build WITHOUT the plugin registered (the with/without delta IS the
// plugin's end-to-end cost).
const pluginEnabled = process.env.BENCH_TYPED_ROUTES !== 'off';

export default defineConfig({
  plugins: [appTools(), ...(pluginEnabled ? [routeTypesPlugin()] : [])],
});
