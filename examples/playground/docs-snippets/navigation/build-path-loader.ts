// Mirrors docs/guide/navigation.md §buildPath(path, options?) — the loader is
// verbatim; `checkAuth` is declared as scaffolding (illustrative helper).
import { buildPath } from 'modernjs-typed-routes';
import { redirect } from '@modern-js/runtime/router';

declare function checkAuth(): Promise<boolean>;

export const loader = async () => {
  const authorized = await checkAuth();
  if (!authorized) {
    return redirect(buildPath('/login', { searchParams: { next: '/blog' } }));
  }
  // ...
};
