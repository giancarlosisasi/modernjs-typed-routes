import { defineConfig } from '@rstest/core';

// E2E layer (05-testing-strategy.md L4): executes the REAL Modern.js CLI
// against examples/playground and asserts on actually-generated files.
// Run with `pnpm test:e2e`. Serial + generous timeouts by design.
export default defineConfig({
  include: ['tests/e2e/**/*.test.ts'],
  testTimeout: 180_000,
  // One CLI at a time — they share the playground working tree.
  maxConcurrency: 1,
});
