import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

// E2E layer (05-testing-strategy.md L4): executes the REAL Modern.js CLI
// against examples/playground and asserts on actually-generated files —
// plus the dist runtime smoke (renders the BUILT bundles, not src/).
// Run with `pnpm test:e2e`. Serial + generous timeouts by design.
export default defineConfig({
  include: ['tests/e2e/**/*.test.{ts,tsx}'],
  plugins: [pluginReact()],
  testTimeout: 180_000,
  // One CLI at a time — they share the playground working tree.
  maxConcurrency: 1,
  // CI machines are slow and the watch test is timing-sensitive; one retry
  // there. Locally, flake must surface (flake policy in 05-testing-strategy).
  retry: process.env.CI ? 1 : 0,
});
