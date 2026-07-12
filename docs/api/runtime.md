# Runtime API

:::warning Design preview
API contract, pre-implementation.
:::

Everything below is imported from the package root:

```ts
import { Link, Navigate, useNavigate, useTypedParams, buildPath } from 'modernjs-typed-routes';
import type { RoutePath, RoutePathname, RouteParams, Register } from 'modernjs-typed-routes';
```

## Components

### `Link<P extends RoutePath>`

All props of the router's `Link` except `to`, plus:

| Prop | Type | Notes |
|---|---|---|
| `to` | `P` (route-path union) | autocompleted literal |
| `params` | `RouteParams<P>` | **required** iff the route has required params |
| `searchParams` | `Record<string, string \| number \| boolean>` | optional |
| `hash` | `string` | optional |

### `Navigate<P extends RoutePath>`

Same typing as `Link` over the router's `Navigate` (`replace`, `state`, … pass through).

## Hooks

### `useNavigate()`

```ts
const { navigateTo, createUrl, goBack, originalNavigate } = useNavigate();
```

| Member | Signature |
|---|---|
| `navigateTo` | `<P extends RoutePath>(to: P, options?: NavigateToOptions<P>) => void` |
| `createUrl` | `<P extends RoutePath>(to: P, options?: BuildOptions<P>) => string` |
| `goBack` | `() => void` |
| `originalNavigate` | React Router's raw `NavigateFunction` (escape hatch) |

`NavigateToOptions<P>` = `BuildOptions<P> & { replace?: boolean; state?: unknown }`.
`BuildOptions<P>` = `{ params: RouteParams<P>; searchParams?; hash? }` with `params` conditionally
required/optional depending on the route.

### `useTypedParams(path)`

```ts
const params = useTypedParams('/blog/[id]');
// { id: string }          — read-side values are always strings
// optional params: { id?: string } ; splat: { '*': string }
```

## Functions

### `buildPath(path, options?)`

Pure URL builder (no hooks — safe in loaders, tests, Node):

```ts
buildPath('/blog/[id]', { params: { id: 42 }, searchParams: { ref: 'rss' }, hash: 'top' });
// => '/blog/42?ref=rss#top'
```

## Types

| Type | Meaning |
|---|---|
| `Register` | The empty interface your generated file merges `routes` into |
| `RoutePath` | Union of all route keys (falls back to `string` before first generation) |
| `RoutePathname` | Alias of `RoutePath`, for app-level props (`RoutePathname \| (string & {})`) |
| `RouteParams<P>` | Write-side params for route `P` (values `string \| number`) |
| `StaticRoutePath` | Only the routes callable without `params` |
| `SearchParamsInit` | `Record<string, string \| number \| boolean>` |

## Re-exports

The full `@modern-js/runtime/router` surface is re-exported (`Outlet`, `useParams`, `useLocation`,
`useSearchParams`, `useLoaderData`, `useMatches`, `redirect`, `defer`, `isRouteErrorResponse`,
`NavLink`, …). Our typed `Link`, `Navigate` and `useNavigate` shadow the originals; reach the raw
versions via `originalNavigate` or a direct `@modern-js/runtime/router` import if you truly need them.
