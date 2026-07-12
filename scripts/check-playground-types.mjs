// Byte-compares the playground's generated routes.gen.d.ts against the
// committed snapshot (tests/e2e/fixtures/playground-routes.gen.d.ts).
// Used by task 2.2 manual verification and the task 2.4 E2E suite.
// Exits non-zero on mismatch or when the generated file is missing.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const generatedPath = join(root, 'examples/playground/src/routes.gen.d.ts');
const snapshotPath = join(
  root,
  'tests/e2e/fixtures/playground-routes.gen.d.ts',
);

let generated;
try {
  generated = readFileSync(generatedPath, 'utf8');
} catch {
  console.error(`✗ generated file missing: ${generatedPath}`);
  process.exit(1);
}
const snapshot = readFileSync(snapshotPath, 'utf8');

if (generated !== snapshot) {
  console.error(
    '✗ generated routes.gen.d.ts differs from the committed snapshot',
  );
  const genLines = generated.split('\n');
  const snapLines = snapshot.split('\n');
  const max = Math.max(genLines.length, snapLines.length);
  for (let i = 0; i < max; i++) {
    if (genLines[i] !== snapLines[i]) {
      console.error(`  first diff at line ${i + 1}:`);
      console.error(`    generated: ${JSON.stringify(genLines[i])}`);
      console.error(`    snapshot:  ${JSON.stringify(snapLines[i])}`);
      break;
    }
  }
  process.exit(1);
}
console.log(
  '✓ playground routes.gen.d.ts matches the committed snapshot (byte-for-byte)',
);
