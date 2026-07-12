// Single-entry fixture: the playground's index entry as a SINGLE-entry app
// would generate it (plain Register.routes — docs/guide/getting-started.md).
import 'modernjs-typed-routes';

declare module 'modernjs-typed-routes' {
  interface Register {
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
  }
}
