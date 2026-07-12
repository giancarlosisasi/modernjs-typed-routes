/**
 * Dist runtime smoke — renders components from the BUILT bundles (ESM and
 * CJS), not from src/. Exists because the unit suite compiles src/ with its
 * own JSX config and once masked a dist-only crash: rslib emitted classic
 * `React.createElement` with no React import ("React is not defined" on the
 * first <Link> render). Requires `pnpm build` first (test:e2e implies a
 * fresh workspace build in CI; locally run `pnpm build` before).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryRouter } from '@modern-js/runtime/router';
import { describe, expect, test } from '@rstest/core';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const DIST = join(__dirname, '../../dist');

describe('dist runtime smoke', () => {
  test('dist exists (run `pnpm build` before test:e2e)', () => {
    expect(existsSync(join(DIST, 'index.js'))).toBe(true);
    expect(existsSync(join(DIST, 'index.cjs'))).toBe(true);
  });

  test('ESM bundle renders <Link> and builds URLs', async () => {
    const esm = await import(
      /* webpackIgnore: true */ new URL(
        `file:///${join(DIST, 'index.js').replace(/\\/g, '/')}`,
      ).href
    );
    expect(esm.buildPath('/blog/[id]', { params: { id: 7 } })).toBe('/blog/7');
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(esm.Link, { to: '/blog/[id]', params: { id: 7 } }, 'x'),
      ),
    );
    expect(html).toContain('href="/blog/7"');
  });

  test('CJS bundle renders <Link> and shadows the router original', async () => {
    const { createRequire } = await import('node:module');
    const requireCjs = createRequire(__filename);
    const cjs = requireCjs(join(DIST, 'index.cjs'));
    const router = requireCjs.call(
      null,
      '@modern-js/runtime/router',
    ) as typeof import('@modern-js/runtime/router');
    expect(cjs.Link).not.toBe(router.Link);
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(cjs.Link, { to: '/about' }, 'About'),
      ),
    );
    expect(html).toContain('href="/about"');
  });
});
