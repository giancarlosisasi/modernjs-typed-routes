# Navigation

The core rule everywhere in this API:

> **Routes without required params accept a plain string. Routes with required params require a
> typed `params` object.** Both are autocompleted.

## `<Link>`

A typed drop-in for the router's `Link` — same props, except `to` is the union of your route paths
and `params` / `searchParams` / `hash` are added:

```tsx
import { Link } from 'modernjs-typed-routes';

// Static route
<Link to="/about">About</Link>

// Dynamic route — `params` is required, keys and presence are checked
<Link to="/blog/[id]" params={{ id: post.id }}>Post</Link>

// Optional param [id$] — `params.id` may be omitted
<Link to="/users/[id$]">Users</Link>
<Link to="/users/[id$]" params={{ id: 7 }}>User 7</Link>

// Splat route — the remainder goes in '*'
<Link to="/docs/$" params={{ '*': 'guide/advanced' }}>Docs</Link>
// Link to the splat root itself with an empty remainder
<Link to="/docs/$" params={{ '*': '' }}>Docs home</Link>

// Search params and hash
<Link to="/blog" searchParams={{ page: 2, tag: 'dx' }} hash="comments">
  Page 2
</Link>
```

Param values may be `string | number` — they're stringified into the URL.

## `<Navigate>`

Typed drop-in for declarative redirects:

```tsx
import { Navigate } from 'modernjs-typed-routes';

export default function LegacyPage() {
  return <Navigate to="/blog/[id]" params={{ id: 1 }} replace />;
}
```

## `useNavigate()`

Returns an object of navigation helpers (not a bare function):

```tsx
import { useNavigate } from 'modernjs-typed-routes';

const { navigateTo, createUrl, goBack, originalNavigate } = useNavigate();
```

### `navigateTo(path, options?)`

```tsx
navigateTo('/about');
navigateTo('/blog/[id]', { params: { id: 42 } });
navigateTo('/blog', { searchParams: { page: 2 }, replace: true });
navigateTo('/checkout', { state: { from: 'cart' } });
```

Options: `params` (required iff the route has required params), `searchParams`, `hash`,
`replace`, `state`.

### `createUrl(path, options?)`

Builds the URL string without navigating — for `window.open`, sharing, analytics:

```tsx
const url = createUrl('/blog/[id]', {
  params: { id: 42 },
  searchParams: { utm_source: 'newsletter' },
});
window.open(url, '_blank', 'noopener,noreferrer');
```

### `goBack()`

Equivalent to `originalNavigate(-1)`.

### `originalNavigate`

The untouched React Router `navigate` — the escape hatch for anything the typed API doesn't cover
(relative navigation, `navigate(-2)`, external logic):

```tsx
originalNavigate('../sibling', { relative: 'path' });
```

## `buildPath(path, options?)`

The pure, hook-free version of `createUrl` — usable in data loaders, tests, or outside React:

```ts title="src/routes/blog/page.data.ts"
import { buildPath } from 'modernjs-typed-routes';
import { redirect } from '@modern-js/runtime/router';

export const loader = async () => {
  const authorized = await checkAuth();
  if (!authorized) {
    return redirect(buildPath('/login', { searchParams: { next: '/blog' } }));
  }
  // ...
};
```

## `useTypedParams(path)`

Reads the current route's params, typed by the route you're in. Read-side values are always
`string` (that's what the URL contains):

```tsx
import { useTypedParams } from 'modernjs-typed-routes';

// in src/routes/blog/[id]/page.tsx
const { id } = useTypedParams('/blog/[id]'); // id: string

// in a splat route
const { '*': rest } = useTypedParams('/docs/$'); // rest: string
```

## Accepting route paths in your own components

Use the exported unions to type your own props (e.g. breadcrumbs, menus). The
`RoutePathname | (string & {})` trick keeps autocomplete while still allowing arbitrary strings:

```tsx
import type { RoutePathname, RouteParams } from 'modernjs-typed-routes';

type BreadcrumbItem = {
  label: string;
  href: RoutePathname | (string & {});
};

// Grab a specific route's params type:
type BlogPostParams = RouteParams<'/blog/[id]'>; // { id: string | number }
```

## Everything else from the router

The package re-exports the full `@modern-js/runtime/router` surface (`Outlet`, `useParams`,
`useLocation`, `useSearchParams`, `useLoaderData`, `redirect`, `isRouteErrorResponse`, …), so your
app can use a single import source:

```tsx
import { Link, Outlet, useLoaderData, useLocation } from 'modernjs-typed-routes';
```

:::tip Enforce the single import source
Add a lint rule banning direct `@modern-js/runtime/router` imports so typed navigation is the only
path. With Biome: `noRestrictedImports` on `@modern-js/runtime/router` pointing users to
`modernjs-typed-routes`.
:::
