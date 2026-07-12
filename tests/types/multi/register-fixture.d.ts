// Multi-entry fixture: EXACTLY what the plugin generates for the playground
// (see tests/e2e/fixtures/playground-routes.gen.d.ts).
import 'modernjs-typed-routes';

declare module 'modernjs-typed-routes' {
  interface Register {
    entries: {
      admin: {
        basename: '/admin';
        routes: {
          '/admin': { params: {} };
          '/admin/users/[userId]': { params: { userId: string | number } };
        };
      };
      index: {
        basename: '/';
        routes: {
          '/': { params: {} };
          '/$': { params: { '*': string } };
          '/about': { params: {} };
          '/blog': { params: {} };
          '/blog/[id]': { params: { id: string | number } };
          '/docs/$': { params: { '*': string } };
          '/login': { params: {} };
          '/promo/[code]': { params: { code: string | number } };
          '/user/profile/[id]/edit': { params: { id: string | number } };
          '/users/[id$]': { params: { id?: string | number } };
        };
      };
    };
  }
}
