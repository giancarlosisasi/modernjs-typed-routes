/**
 * LITERAL fixtures copied from the task 0.2 spike evidence
 * (roadmap/research/spike-output/node-shapes-{index,admin}.json), captured
 * from `modifyFileSystemRoutes` on @modern-js/app-tools 3.6.0 over
 * examples/playground. Do NOT idealize these — they anchor the test-helper
 * builders and the normalize specs to reality. If a Modern.js upgrade
 * changes the shape, re-run the spike and update BOTH the JSON evidence and
 * this file in the same change.
 */
import type { RouteNode } from '../../../src/core/types';

/** Main entry (`index`) — every convention in the playground. */
export const spikeIndexRoutes: RouteNode[] = [
  {
    path: '/',
    children: [
      {
        _component: '@_modern_js_src/playground/routes/page',
        index: true,
        routeType: 'page',
        id: 'page',
        type: 'nested',
        origin: 'file-system',
      },
      {
        _component: '@_modern_js_src/playground/routes/$',
        path: '*',
        origin: 'file-system',
        id: '$',
        type: 'nested',
        routeType: 'page',
      },
      {
        children: [
          {
            _component: '@_modern_js_src/playground/routes/__auth/login/page',
            routeType: 'page',
            id: '__auth/login/page',
            type: 'nested',
            origin: 'file-system',
            path: 'login',
          },
        ],
        isRoot: false,
        origin: 'file-system',
        _component: '@_modern_js_src/playground/routes/__auth/layout',
        id: '__auth/layout',
        type: 'nested',
        routeType: 'layout',
      },
      {
        path: 'blog',
        children: [
          {
            _component: '@_modern_js_src/playground/routes/blog/page',
            index: true,
            routeType: 'page',
            id: 'blog/page',
            type: 'nested',
            origin: 'file-system',
            data: '@_modern_js_src/playground/routes/blog/page.data',
          },
          {
            _component: '@_modern_js_src/playground/routes/blog/[id]/page',
            routeType: 'page',
            id: 'blog/(id)/page',
            type: 'nested',
            origin: 'file-system',
            path: ':id',
          },
        ],
        isRoot: false,
        origin: 'file-system',
        error: '@_modern_js_src/playground/routes/blog/error',
        _component: '@_modern_js_src/playground/routes/blog/layout',
        loading: '@_modern_js_src/playground/routes/blog/loading',
        id: 'blog/layout',
        type: 'nested',
        routeType: 'layout',
      },
      {
        path: 'docs',
        children: [
          {
            _component: '@_modern_js_src/playground/routes/docs/$',
            path: '*',
            origin: 'file-system',
            id: 'docs/$',
            type: 'nested',
            routeType: 'page',
          },
        ],
        isRoot: false,
        origin: 'file-system',
        _component: '@_modern_js_src/playground/routes/docs/layout',
        id: 'docs/layout',
        type: 'nested',
        routeType: 'layout',
      },
      {
        _component:
          '@_modern_js_src/playground/routes/user.profile.[id].edit/page',
        routeType: 'page',
        id: 'user.profile.(id).edit/page',
        type: 'nested',
        origin: 'file-system',
        path: 'user/profile/:id/edit',
      },
      {
        _component: '@_modern_js_src/playground/routes/users/[id$]/page',
        routeType: 'page',
        id: 'users/(id$)/page',
        type: 'nested',
        origin: 'file-system',
        path: 'users/:id?',
      },
      {
        path: 'about',
        routeType: 'page',
        origin: 'config',
        type: 'nested',
        id: 'config-pages/about-override',
        _component: '@_modern_js_src/playground/config-pages/about-override',
      },
      {
        path: 'promo/:code',
        routeType: 'page',
        origin: 'config',
        type: 'nested',
        id: 'config-pages/promo',
        _component: '@_modern_js_src/playground/config-pages/promo',
      },
    ],
    isRoot: true,
    origin: 'file-system',
    _component: '@_modern_js_src/playground/routes/layout',
    id: 'layout',
    type: 'nested',
    routeType: 'layout',
  },
];

/** Secondary entry (`admin`) — tree is rooted at `/`; the `/admin` mount prefix lives in serverRoutes, not here. */
export const spikeAdminRoutes: RouteNode[] = [
  {
    path: '/',
    children: [
      {
        _component: '@_modern_js_src/admin/routes/page',
        index: true,
        routeType: 'page',
        id: 'admin_page',
        type: 'nested',
        origin: 'file-system',
      },
      {
        _component: '@_modern_js_src/admin/routes/users/[userId]/page',
        routeType: 'page',
        id: 'admin_users/(userId)/page',
        type: 'nested',
        origin: 'file-system',
        path: 'users/:userId',
      },
    ],
    isRoot: true,
    origin: 'file-system',
    _component: '@_modern_js_src/admin/routes/layout',
    id: 'admin_layout',
    type: 'nested',
    routeType: 'layout',
  },
];
