// One-command snapshot update (tests/e2e/README.md): regenerates the
// playground's routes.gen.d.ts with the real CLI and copies it over the
// committed E2E snapshot. Run `pnpm test` afterwards — the lockstep spec in
// tests/core/generate.test.ts must agree with the new snapshot.
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const playground = join(root, 'examples/playground');

const modernBin = join(
  playground,
  'node_modules/@modern-js/app-tools/bin/modern.js',
);

const result = spawnSync('node', [modernBin, 'typegen'], {
  cwd: playground,
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);

const generated = join(playground, 'src/routes.gen.d.ts');
const snapshot = join(root, 'tests/e2e/fixtures/playground-routes.gen.d.ts');
copyFileSync(generated, snapshot);
console.log(
  `✓ snapshot updated (${readFileSync(snapshot, 'utf8').length} bytes)`,
);
console.log(
  '  now run `pnpm test` — the lockstep spec must agree with the new snapshot.',
);
