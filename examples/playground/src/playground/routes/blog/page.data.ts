import { buildPath } from 'modernjs-typed-routes';

/** Dogfood: pure `buildPath` in a data loader (no hooks, runs on the server in SSR). */
export const loader = () => {
  return {
    message: 'blog-data',
    loginUrl: buildPath('/login', { searchParams: { next: '/blog' } }),
  };
};
