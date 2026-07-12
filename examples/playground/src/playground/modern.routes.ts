import { defineRoutes } from '@modern-js/runtime/config-routes';

// Config-routes fixture: the generated types must derive from the FINAL merged
// tree, so this file adds one route and overrides one file-system route.
export default defineRoutes(({ page }, fileRoutes) => {
  const root = fileRoutes[0];

  // Override: replace the convention /about page with a config component.
  const aboutIndex = root.children?.findIndex(
    (route) => route.path === 'about',
  );
  if (aboutIndex !== undefined && aboutIndex >= 0) {
    root.children?.splice(aboutIndex, 1);
    root.children?.push(page('config-pages/about-override.tsx', 'about'));
  }

  // Added: a config-only route with a dynamic param.
  root.children?.push(page('config-pages/promo.tsx', 'promo/:code'));

  return fileRoutes;
});
