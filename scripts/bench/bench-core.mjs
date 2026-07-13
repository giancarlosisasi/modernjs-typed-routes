/**
 * Core benchmark: what does ONE plugin hook-fire cost at N routes?
 *
 * Benches the SHIPPED artifact (`dist/plugin`) — the exact code apps run —
 * by driving `modifyFileSystemRoutes` with synthetic parsed trees, no
 * Modern.js process involved. This isolates everything the plugin ADDS to a
 * build/dev cycle: normalize + emit + write-if-changed. Modern.js's own
 * route parsing happens with or without the plugin and is measured by
 * bench-e2e instead.
 *
 * Two scenarios per size:
 * - "changed": every fire regenerates AND rewrites the file (a route was
 *   added/renamed — the dev-loop worst case);
 * - "unchanged": every fire regenerates and compares, no write (the common
 *   case: the hook re-fires for edits that don't reshape routes).
 *
 * Usage: node scripts/bench/bench-core.mjs [--sizes 50,100,250,500,1000,2000]
 *        [--iterations 25]
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildRouteTree } from './synthesize-routes.mjs';
import { fmtKb, fmtMs, parseArgs, stats } from './util.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const PLUGIN_DIST = path.join(ROOT, 'dist/plugin/index.js');

const options = parseArgs(process.argv.slice(2), {
  sizes: '50,100,250,500,1000,2000',
  iterations: 25,
});

if (!existsSync(PLUGIN_DIST)) {
  console.error('dist/plugin/index.js not found — run `pnpm build` first.');
  process.exit(1);
}
const { routeTypesPlugin } = await import(pathToFileURL(PLUGIN_DIST).href);

/**
 * Instantiates the real plugin against a minimal mock of the Modern.js
 * plugin API and returns a `fire(entryName, tree)` that invokes the captured
 * `modifyFileSystemRoutes` callback exactly like the CLI does.
 */
function createHarness(appDirectory, entrypoints, serverRoutes) {
  let hook;
  const api = {
    getAppContext: () => ({ appDirectory, entrypoints, serverRoutes }),
    modifyFileSystemRoutes: (callback) => {
      hook = callback;
    },
    addCommand: () => {},
  };
  routeTypesPlugin().setup(api);
  if (!hook) throw new Error('plugin did not register modifyFileSystemRoutes');
  return (entryName, routes) => hook({ entrypoint: { entryName }, routes });
}

const appDir = mkdtempSync(path.join(os.tmpdir(), 'typed-routes-bench-'));
const outFile = path.join(appDir, 'src/routes.gen.d.ts');

function benchSize(size, iterations) {
  const fire = createHarness(
    appDir,
    [{ entryName: 'index', isMainEntry: true, nestedRoutesEntry: 'routes' }],
    [{ entryName: 'index', urlPath: '/' }],
  );
  const trees = [buildRouteTree(size, 0), buildRouteTree(size, 1)];

  // Warmup (JIT + first cold write).
  for (let i = 0; i < 5; i++) fire('index', trees[i % 2]);

  // "unchanged": same tree every time → compare, no write.
  const unchanged = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fire('index', trees[0]);
    unchanged.push(performance.now() - start);
  }

  // "changed": alternate variants → every fire rewrites the file.
  const changed = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fire('index', trees[(i + 1) % 2]);
    changed.push(performance.now() - start);
  }

  const generated = readFileSync(outFile, 'utf8');
  return {
    size,
    routes: (generated.match(/': { params:/g) ?? []).length,
    bytes: Buffer.byteLength(generated),
    changed: stats(changed),
    unchanged: stats(unchanged),
  };
}

function benchMultiEntry(mainSize, adminSize, iterations) {
  const fire = createHarness(
    appDir,
    [
      { entryName: 'index', isMainEntry: true, nestedRoutesEntry: 'routes' },
      { entryName: 'admin', isMainEntry: false, nestedRoutesEntry: 'routes' },
    ],
    [
      { entryName: 'index', urlPath: '/' },
      { entryName: 'admin', urlPath: '/admin' },
    ],
  );
  const mainTrees = [buildRouteTree(mainSize, 0), buildRouteTree(mainSize, 1)];
  const adminTree = buildRouteTree(adminSize, 0);

  for (let i = 0; i < 5; i++) {
    fire('admin', adminTree);
    fire('index', mainTrees[i % 2]);
  }
  // A route change re-fires the hook for ALL entries; measure the full burst.
  const changed = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fire('admin', adminTree);
    fire('index', mainTrees[(i + 1) % 2]);
    changed.push(performance.now() - start);
  }
  const generated = readFileSync(outFile, 'utf8');
  return {
    size: mainSize + adminSize,
    routes: (generated.match(/': { params:/g) ?? []).length,
    bytes: Buffer.byteLength(generated),
    changed: stats(changed),
  };
}

const sizes = options.sizes.split(',').map(Number);
console.log(
  `modernjs-typed-routes core bench — dist/plugin, node ${process.version}, ` +
    `${os.platform()} ${os.arch()}, ${options.iterations} iterations/scenario\n`,
);
console.log('routes | output   | changed p50 (p95)      | unchanged p50 (p95)');
console.log(
  '------ | -------- | ---------------------- | ----------------------',
);
for (const size of sizes) {
  const r = benchSize(size, options.iterations);
  console.log(
    `${String(r.routes).padStart(6)} | ${fmtKb(r.bytes).padStart(8)} | ` +
      `${`${fmtMs(r.changed.p50)} (${fmtMs(r.changed.p95)})`.padEnd(22)} | ` +
      `${fmtMs(r.unchanged.p50)} (${fmtMs(r.unchanged.p95)})`,
  );
}

const multi = benchMultiEntry(400, 100, options.iterations);
console.log(
  `\nmulti-entry ${multi.routes} routes (400 + 100, hook burst for both ` +
    `entries): p50 ${fmtMs(multi.changed.p50)} (p95 ${fmtMs(multi.changed.p95)}), ` +
    `output ${fmtKb(multi.bytes)}`,
);

rmSync(appDir, { recursive: true, force: true });
