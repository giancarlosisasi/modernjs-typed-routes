/**
 * E2E: the REAL Modern.js CLI over the REAL playground app (no mocks).
 * See tests/e2e/README.md for quirks and the snapshot-update flow.
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test } from '@rstest/core';

const ROOT = path.resolve(__dirname, '../..');
const PLAYGROUND = path.join(ROOT, 'examples/playground');
const GEN_FILE = path.join(PLAYGROUND, 'src/routes.gen.d.ts');
const SNAPSHOT = readFileSync(
  path.join(__dirname, 'fixtures/playground-routes.gen.d.ts'),
  'utf8',
);

// The playground's own app-tools copy (pnpm symlink), run with plain `node` —
// cross-platform, no shell, no .cmd. (`require.resolve` can't be used: the
// package's `exports` map does not expose ./package.json or ./bin.)
const MODERN_BIN = path.join(
  PLAYGROUND,
  'node_modules/@modern-js/app-tools/bin/modern.js',
);

const runModern = (...args: string[]) =>
  spawnSync('node', [MODERN_BIN, ...args], {
    cwd: PLAYGROUND,
    encoding: 'utf8',
    timeout: 150_000,
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollFor(
  predicate: () => boolean,
  what: string,
  timeoutMs = 30_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await sleep(500);
  }
  throw new Error(`timed out after ${timeoutMs}ms waiting for ${what}`);
}

function killTree(child: ChildProcess): void {
  if (child.pid === undefined) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  } else {
    child.kill('SIGKILL');
  }
}

/** `:id` → `[id]`, `:id?` → `[id$]`, `*` → `$` — re-derived independently from the docs mapping. */
const toLiteral = (routerPath: string): string =>
  routerPath
    .split('/')
    .map((segment) => {
      if (segment === '*') return '$';
      if (segment.startsWith(':')) {
        return segment.endsWith('?')
          ? `[${segment.slice(1, -1)}$]`
          : `[${segment.slice(1)}]`;
      }
      return segment;
    })
    .join('/');

afterEach(() => {
  // Every test must leave the playground pristine.
  rmSync(path.join(PLAYGROUND, 'src/playground/routes/e2e-tmp'), {
    recursive: true,
    force: true,
  });
});

describe('typegen E2E', () => {
  test('regenerates the committed snapshot byte-for-byte from a clean slate', () => {
    rmSync(GEN_FILE, { force: true });
    const result = runModern('typegen');
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/\[modernjs-typed-routes\] \d+ routes → /);
    expect(readFileSync(GEN_FILE, 'utf8')).toBe(SNAPSHOT);
  });

  test('second run is a no-op write', () => {
    const result = runModern('typegen');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('(unchanged)');
  });

  test('generated keys ⊇ the live routes-inspect oracle', () => {
    const inspect = runModern('routes');
    expect(inspect.status).toBe(0);
    const oracle = JSON.parse(
      readFileSync(path.join(PLAYGROUND, 'dist/routes-inspect.json'), 'utf8'),
    ) as Record<string, { routes: OracleNode[] }>;

    type OracleNode = { path?: string; children?: OracleNode[] };
    const collect = (
      nodes: OracleNode[],
      prefix: string,
      into: string[],
    ): void => {
      for (const node of nodes) {
        const segments = (node.path ?? '').split('/').filter(Boolean);
        const routerPath = segments.length
          ? `${prefix === '/' ? '' : prefix}/${segments.join('/')}`
          : prefix;
        if (node.children?.length) {
          collect(node.children, routerPath, into);
        } else {
          into.push(routerPath);
        }
      }
    };

    const generated = readFileSync(GEN_FILE, 'utf8');
    for (const [entryName, entry] of Object.entries(oracle)) {
      const mount = entryName === 'index' ? '/' : `/${entryName}`;
      const paths: string[] = [];
      collect(entry.routes, mount, paths);
      for (const routerPath of paths) {
        expect(generated).toContain(`'${toLiteral(routerPath)}'`);
      }
    }
  });

  test('exits non-zero with the documented message when the output is unwritable', () => {
    renameSync(GEN_FILE, `${GEN_FILE}.bak`);
    mkdirSync(GEN_FILE); // a DIRECTORY at the outFile path → rename must fail
    try {
      const result = runModern('typegen');
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain(
        '[modernjs-typed-routes] typegen failed:',
      );
      expect(result.stderr).toContain('fallback');
    } finally {
      rmSync(GEN_FILE, { recursive: true, force: true });
      renameSync(`${GEN_FILE}.bak`, GEN_FILE);
    }
  });
});

describe('build E2E', () => {
  test('modern build regenerates the snapshot byte-for-byte', () => {
    rmSync(GEN_FILE, { force: true });
    const result = runModern('build');
    expect(result.status).toBe(0);
    expect(readFileSync(GEN_FILE, 'utf8')).toBe(SNAPSHOT);
  });
});

describe('watch E2E', () => {
  test('dev server regenerates on page add and remove', async () => {
    rmSync(GEN_FILE, { force: true });
    const dev = spawn('node', [MODERN_BIN, 'dev'], {
      cwd: PLAYGROUND,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let devOutput = '';
    dev.stdout?.on('data', (chunk) => {
      devOutput += String(chunk);
    });
    dev.stderr?.on('data', (chunk) => {
      devOutput += String(chunk);
    });
    const tmpDir = path.join(PLAYGROUND, 'src/playground/routes/e2e-tmp');
    try {
      await pollFor(
        () =>
          existsSync(GEN_FILE) && readFileSync(GEN_FILE, 'utf8') === SNAPSHOT,
        'startup generation',
        60_000,
      );
      // Startup generation happens during prepare, BEFORE the dev server's
      // file watchers attach — a page added in that window is silently
      // missed. Wait for the serve-ready banner, then give chokidar a beat.
      await pollFor(
        () => devOutput.includes('Local:'),
        'the dev server ready banner',
        60_000,
      );
      await sleep(3_000);

      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(
        path.join(tmpDir, 'page.tsx'),
        'export default function E2ETmpPage() {\n  return <h1>e2e-tmp</h1>;\n}\n',
      );
      await pollFor(
        () => readFileSync(GEN_FILE, 'utf8').includes("'/e2e-tmp'"),
        "the '/e2e-tmp' key",
      );

      rmSync(tmpDir, { recursive: true, force: true });
      await pollFor(
        () => !readFileSync(GEN_FILE, 'utf8').includes("'/e2e-tmp'"),
        "removal of the '/e2e-tmp' key",
      );
      expect(readFileSync(GEN_FILE, 'utf8')).toBe(SNAPSHOT);
    } finally {
      killTree(dev);
    }
  });
});
