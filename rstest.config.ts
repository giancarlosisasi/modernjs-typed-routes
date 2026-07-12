import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  // examples/playground contains a page.test.tsx that is a ROUTE-IGNORE
  // fixture (must not create a route), not a real spec — keep the root
  // runner scoped to this package's own tests. E2E lives in its own config
  // (rstest.e2e.config.ts) because it runs the real Modern.js CLI (slow).
  include: ['tests/{core,plugin,runtime}/**/*.test.{ts,tsx}'],
});
