// Mirrors docs/guide/navigation.md §Accepting route paths in your own
// components (verbatim).
import type { RoutePathname, RouteParams } from 'modernjs-typed-routes';

type BreadcrumbItem = {
  label: string;
  href: RoutePathname | (string & {});
};

// Grab a specific route's params type:
type BlogPostParams = RouteParams<'/blog/[id]'>; // { id: string | number }
