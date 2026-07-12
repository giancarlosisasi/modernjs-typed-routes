import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

// Two subpath exports (02-architecture.md §Build & packaging):
// - '.'        → runtime (React, browser-safe). Peers stay external.
// - './plugin' → Modern.js CLI plugin (Node). app-tools is types-only/peer.
const runtimeEntry = { index: './src/index.ts' };
const pluginEntry = { 'plugin/index': './src/plugin/index.ts' };

const runtimeExternals = [/^react($|\/)/, /^@modern-js\/runtime($|\/)/];
const pluginExternals = [/^@modern-js\/app-tools($|\/)/];

export default defineConfig({
  // Automatic JSX runtime for the .tsx runtime modules — WITHOUT this the
  // bundles emit bare `React.createElement` with no import and every
  // `<Link>` render throws `React is not defined` (caught by adversary
  // review 3.3; dist smoke test in the E2E suite pins it).
  plugins: [pluginReact()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: { bundle: true, autoExtension: true },
      source: { entry: runtimeEntry },
      output: { externals: runtimeExternals },
    },
    {
      format: 'cjs',
      syntax: 'es2022',
      dts: { bundle: true, autoExtension: true },
      source: { entry: runtimeEntry },
      output: { externals: runtimeExternals },
    },
    {
      format: 'esm',
      syntax: ['node 20'],
      dts: { bundle: true, autoExtension: true },
      source: { entry: pluginEntry },
      output: { externals: pluginExternals },
    },
    {
      format: 'cjs',
      syntax: ['node 20'],
      dts: { bundle: true, autoExtension: true },
      source: { entry: pluginEntry },
      output: { externals: pluginExternals },
    },
  ],
});
