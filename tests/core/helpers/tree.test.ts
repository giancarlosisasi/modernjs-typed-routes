import { expect, test } from '@rstest/core';
import { spikeAdminRoutes } from '../fixtures/spike-trees';
import { indexPage, page, rootLayout } from './tree';

// Anchors the builders to reality: their output must be structurally
// identical to the literal JSON captured from the 0.2 spike. `toStrictEqual`
// so an accidentally-added `undefined` field fails too.
test('builders reproduce the real spike admin-entry tree exactly', () => {
  const built = [
    rootLayout('admin_layout', '@_modern_js_src/admin/routes/layout', [
      indexPage('admin_page', '@_modern_js_src/admin/routes/page'),
      page(
        'admin_users/(userId)/page',
        '@_modern_js_src/admin/routes/users/[userId]/page',
        'users/:userId',
      ),
    ]),
  ];

  expect(built).toStrictEqual(spikeAdminRoutes);
});
