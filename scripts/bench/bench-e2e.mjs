/**
 * End-to-end benchmark: the REAL Modern.js CLI over examples/bench-app with
 * a synthetic N-route project (recreated from scratch on every run).
 *
 * Default: times `modern typegen` (Modern.js entry init + its own route
 * parsing + the plugin's generation) — the full standalone-generation cost.
 *
 * --build  also times `modern build` WITH vs WITHOUT the plugin
 *          (BENCH_TYPED_ROUTES=off): the delta is the plugin's true
 *          end-to-end overhead on a production build. Slow (~minutes).
 * --tsc    also times `tsc --noEmit` with the generated routes.gen.d.ts
 *          present vs absent: what the 500-route type surface costs the
 *          type-checker/IDE, not the build.
 *
 * Usage: node scripts/bench/bench-e2e.mjs [--routes 500] [--runs 3]
 *        [--build] [--tsc]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { writeRouteFiles } from './synthesize-routes.mjs';
import { fmtMs, parseArgs, stats } from './util.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'examples/bench-app');
const ROUTES_DIR = path.join(APP, 'src/routes');
const GEN_FILE = path.join(APP, 'src/routes.gen.d.ts');
const MODERN_BIN = path.join(
  APP,
  'node_modules/@modern-js/app-tools/bin/modern.js',
);
const TSC_BIN = path.join(APP, 'node_modules/typescript/bin/tsc');

const options = parseArgs(process.argv.slice(2), {
  routes: 500,
  runs: 3,
  build: false,
  tsc: false,
});

if (!existsSync(MODERN_BIN)) {
  console.error(
    'examples/bench-app has no node_modules — run `pnpm install` first.',
  );
  process.exit(1);
}

/** Runs a command in the bench app, returns wall-clock ms. Fails loudly. */
function timeCommand(bin, args, extraEnv = {}) {
  const start = performance.now();
  const result = spawnSync('node', [bin, ...args], {
    cwd: APP,
    encoding: 'utf8',
    timeout: 900_000,
    env: { ...process.env, ...extraEnv },
  });
  const elapsed = performance.now() - start;
  if (result.status !== 0) {
    console.error(`\ncommand failed: node ${bin} ${args.join(' ')}`);
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
  return { elapsed, stdout: result.stdout };
}

const report = (label, times) => {
  const s = stats(times);
  console.log(
    `${label.padEnd(34)} p50 ${fmtMs(s.p50).padStart(9)}  ` +
      `min ${fmtMs(s.min).padStart(9)}  max ${fmtMs(s.max).padStart(9)}  (n=${s.n})`,
  );
  return s;
};

console.log(
  `modernjs-typed-routes e2e bench — recreating ${options.routes} routes in examples/bench-app`,
);
const { fileCount, routeCount } = writeRouteFiles(options.routes, ROUTES_DIR);
console.log(`fixture: ${routeCount} routes, ${fileCount} files\n`);

// --- modern typegen -------------------------------------------------------
rmSync(GEN_FILE, { force: true });
const typegenTimes = [];
let typegenLine = '';
for (let i = 0; i < options.runs; i++) {
  const { elapsed, stdout } = timeCommand(MODERN_BIN, ['typegen']);
  typegenTimes.push(elapsed);
  typegenLine =
    stdout
      .split('\n')
      .find((line) => line.includes('[modernjs-typed-routes]')) ?? '';
}
console.log(typegenLine.trim());
report('modern typegen (parse + generate)', typegenTimes);
const generated = readFileSync(GEN_FILE, 'utf8');
const generatedRoutes = (generated.match(/': { params:/g) ?? []).length;
if (generatedRoutes !== routeCount) {
  console.error(
    `route count mismatch: fixture has ${routeCount}, generated file has ${generatedRoutes}`,
  );
  process.exit(1);
}

// --- tsc --noEmit: generated types present vs absent -----------------------
if (options.tsc) {
  console.log('');
  const withGen = [];
  for (let i = 0; i < options.runs; i++) {
    withGen.push(timeCommand(TSC_BIN, ['-p', '.', '--noEmit']).elapsed);
  }
  renameSync(GEN_FILE, `${GEN_FILE}.bak`);
  const withoutGen = [];
  try {
    for (let i = 0; i < options.runs; i++) {
      withoutGen.push(timeCommand(TSC_BIN, ['-p', '.', '--noEmit']).elapsed);
    }
  } finally {
    renameSync(`${GEN_FILE}.bak`, GEN_FILE);
  }
  const sWith = report('tsc --noEmit WITH routes.gen.d.ts', withGen);
  const sWithout = report('tsc --noEmit WITHOUT (empty types)', withoutGen);
  console.log(
    `type-surface cost at ${routeCount} routes: ${fmtMs(sWith.p50 - sWithout.p50)} (p50 delta)`,
  );
}

// --- modern build with vs without the plugin --------------------------------
if (options.build) {
  console.log('\nmodern build (alternating without/with plugin)…');
  const withPlugin = [];
  const withoutPlugin = [];
  for (let i = 0; i < options.runs; i++) {
    withoutPlugin.push(
      timeCommand(MODERN_BIN, ['build'], { BENCH_TYPED_ROUTES: 'off' }).elapsed,
    );
    withPlugin.push(timeCommand(MODERN_BIN, ['build']).elapsed);
  }
  const sOn = report('modern build WITH plugin', withPlugin);
  const sOff = report('modern build WITHOUT plugin', withoutPlugin);
  console.log(
    `plugin overhead per build at ${routeCount} routes: ${fmtMs(sOn.p50 - sOff.p50)} (p50 delta; ` +
      'expect noise of the same magnitude)',
  );
}
