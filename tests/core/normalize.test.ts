import { describe, expect, test } from '@rstest/core';
import { normalize } from '../../src/core/normalize';
import type { RouteInfo, RouteParam } from '../../src/core/types';
import { spikeIndexRoutes } from './fixtures/spike-trees';
import {
  configPage,
  indexPage,
  layout,
  page,
  rootLayout,
} from './helpers/tree';

const req = (name: string): RouteParam => ({
  name,
  optional: false,
  splat: false,
});
const opt = (name: string): RouteParam => ({
  name,
  optional: true,
  splat: false,
});
const splat: RouteParam = { name: '*', optional: false, splat: true };

// ---------------------------------------------------------------------------
// Anchor spec (task 1.1): the REAL playground index-entry tree, end to end.
// ---------------------------------------------------------------------------

test('normalize maps the real spike index-entry tree to the documented routes', () => {
  const result = normalize(spikeIndexRoutes, 'index');

  const expected: RouteInfo[] = [
    {
      literalPath: '/',
      routerPath: '/',
      params: [],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/$',
      routerPath: '/*',
      params: [splat],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/about',
      routerPath: '/about',
      params: [],
      entryName: 'index',
      origin: 'config',
    },
    {
      literalPath: '/blog',
      routerPath: '/blog',
      params: [],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/blog/[id]',
      routerPath: '/blog/:id',
      params: [req('id')],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/docs/$',
      routerPath: '/docs/*',
      params: [splat],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/login',
      routerPath: '/login',
      params: [],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/promo/[code]',
      routerPath: '/promo/:code',
      params: [req('code')],
      entryName: 'index',
      origin: 'config',
    },
    {
      literalPath: '/user/profile/[id]/edit',
      routerPath: '/user/profile/:id/edit',
      params: [req('id')],
      entryName: 'index',
      origin: 'file-system',
    },
    {
      literalPath: '/users/[id$]',
      routerPath: '/users/:id?',
      params: [opt('id')],
      entryName: 'index',
      origin: 'file-system',
    },
  ];

  expect(result).toStrictEqual(expected);
});

// ---------------------------------------------------------------------------
// One spec per convention (task 1.2) — docs/guide/route-conventions.md table.
// ---------------------------------------------------------------------------

describe('conventions', () => {
  test('static nested: layouts contribute segments, never routes', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        indexPage('page', 'c/page'),
        page('about/page', 'c/about/page', 'about'),
        layout(
          'blog/layout',
          'c/blog/layout',
          [indexPage('blog/page', 'c/blog/page')],
          {
            path: 'blog',
          },
        ),
      ]),
    ];
    expect(normalize(tree, 'index').map((r) => r.literalPath)).toStrictEqual([
      '/',
      '/about',
      '/blog',
    ]);
  });

  test('index route under a layout accumulates the layout path', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        layout(
          'blog/layout',
          'c/blog/layout',
          [indexPage('blog/page', 'c/blog/page')],
          {
            path: 'blog',
          },
        ),
      ]),
    ];
    const [route] = normalize(tree, 'index');
    expect(route).toStrictEqual({
      literalPath: '/blog',
      routerPath: '/blog',
      params: [],
      entryName: 'index',
      origin: 'file-system',
    });
  });

  test('[id] → required param, bracket literal', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        layout(
          'blog/layout',
          'c/blog/layout',
          [page('blog/(id)/page', 'c/blog/id/page', ':id')],
          {
            path: 'blog',
          },
        ),
      ]),
    ];
    const [route] = normalize(tree, 'index');
    expect(route).toStrictEqual({
      literalPath: '/blog/[id]',
      routerPath: '/blog/:id',
      params: [req('id')],
      entryName: 'index',
      origin: 'file-system',
    });
  });

  test('[id$] → ONE route with an optional param (not the two-route trick)', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        page('users/(id$)/page', 'c/users/id/page', 'users/:id?'),
      ]),
    ];
    const routes = normalize(tree, 'index');
    expect(routes).toStrictEqual([
      {
        literalPath: '/users/[id$]',
        routerPath: '/users/:id?',
        params: [opt('id')],
        entryName: 'index',
        origin: 'file-system',
      },
    ]);
  });

  test('root splat and nested splat → /$ and /docs/$, param key "*"', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        page('$', 'c/$', '*'),
        layout(
          'docs/layout',
          'c/docs/layout',
          [page('docs/$', 'c/docs/$', '*')],
          {
            path: 'docs',
          },
        ),
      ]),
    ];
    expect(normalize(tree, 'index')).toStrictEqual([
      {
        literalPath: '/$',
        routerPath: '/*',
        params: [splat],
        entryName: 'index',
        origin: 'file-system',
      },
      {
        literalPath: '/docs/$',
        routerPath: '/docs/*',
        params: [splat],
        entryName: 'index',
        origin: 'file-system',
      },
    ]);
  });

  test('__pathless layout segments are dropped; children keep working', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        layout('__auth/layout', 'c/__auth/layout', [
          page('__auth/login/page', 'c/login/page', 'login'),
        ]),
      ]),
    ];
    expect(normalize(tree, 'index').map((r) => r.literalPath)).toStrictEqual([
      '/login',
    ]);
  });

  test('flat segments arrive pre-split by Modern.js as one multi-segment path', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        page(
          'user.profile.(id).edit/page',
          'c/flat/page',
          'user/profile/:id/edit',
        ),
      ]),
    ];
    const [route] = normalize(tree, 'index');
    expect(route.literalPath).toBe('/user/profile/[id]/edit');
    expect(route.routerPath).toBe('/user/profile/:id/edit');
    expect(route.params).toStrictEqual([req('id')]);
  });

  test('config-added routes appear with origin "config"', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        configPage('config-pages/promo', 'c/promo', 'promo/:code'),
      ]),
    ];
    expect(normalize(tree, 'index')).toStrictEqual([
      {
        literalPath: '/promo/[code]',
        routerPath: '/promo/:code',
        params: [req('code')],
        entryName: 'index',
        origin: 'config',
      },
    ]);
  });

  test('duplicate paths dedupe last-wins with a debug note (defensive: real overrides are pre-merged)', () => {
    const tree = [
      rootLayout('layout', 'c/layout', [
        page('about/page', 'c/about/page', 'about'),
        configPage('config-pages/about', 'c/about-override', 'about'),
      ]),
    ];
    const warnings: string[] = [];
    const routes = normalize(tree, 'index', {
      onWarn: (m) => warnings.push(m),
    });
    expect(routes).toStrictEqual([
      {
        literalPath: '/about',
        routerPath: '/about',
        params: [],
        entryName: 'index',
        origin: 'config',
      },
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('/about');
  });

  test('sidecar files never create routes (real blog subtree carries data/error/loading)', () => {
    const blogSubtree = spikeIndexRoutes[0].children?.find(
      (n) => n.path === 'blog',
    );
    if (!blogSubtree) throw new Error('fixture drift: blog subtree missing');
    const tree = [rootLayout('layout', 'c/layout', [blogSubtree])];
    expect(normalize(tree, 'index').map((r) => r.literalPath)).toStrictEqual([
      '/blog',
      '/blog/[id]',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Output guarantees
// ---------------------------------------------------------------------------

describe('output guarantees', () => {
  test('sorted by literalPath regardless of input child order (shuffle stability)', () => {
    const children = [
      page('b/page', 'c/b', 'b'),
      page('a/page', 'c/a', 'a'),
      page('z/(id)/page', 'c/z', 'z/:id'),
      indexPage('page', 'c/page'),
    ];
    const paths = (nodes: typeof children) =>
      normalize([rootLayout('layout', 'c/layout', nodes)], 'index').map(
        (r) => r.literalPath,
      );

    const expected = ['/', '/a', '/b', '/z/[id]'];
    expect(paths(children)).toStrictEqual(expected);
    expect(paths([...children].reverse())).toStrictEqual(expected);
  });

  test('basename prefixes every path (multi-entry mount, D13)', () => {
    const tree = [
      rootLayout('admin_layout', 'c/admin/layout', [
        indexPage('admin_page', 'c/admin/page'),
        page('admin_users/(userId)/page', 'c/admin/users', 'users/:userId'),
      ]),
    ];
    expect(normalize(tree, 'admin', { basename: '/admin' })).toStrictEqual([
      {
        literalPath: '/admin',
        routerPath: '/admin',
        params: [],
        entryName: 'admin',
        origin: 'file-system',
      },
      {
        literalPath: '/admin/users/[userId]',
        routerPath: '/admin/users/:userId',
        params: [req('userId')],
        entryName: 'admin',
        origin: 'file-system',
      },
    ]);
  });

  test('legacy (RouteLegacy[]) input throws the typed v3-only error', () => {
    const legacy = [
      { path: '/old', component: 'pages/old', exact: true },
    ] as unknown as Parameters<typeof normalize>[0];
    expect(() => normalize(legacy, 'index')).toThrow(/Modern\.js v3/);
  });
});
