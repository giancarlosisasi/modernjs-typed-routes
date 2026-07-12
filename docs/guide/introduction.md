# Introduction

:::warning Design preview
These docs are written **docs-first**: they define the API contract before the implementation ships.
The package is not published yet. Anything here may still change — feedback welcome on
[GitHub](https://github.com/giancarlosisasi/modernjs-typed-routes).
:::

## The problem

Modern.js gives you excellent file-based routing on top of React Router v7 — but navigation is
stringly-typed:

```tsx
// Compiles fine. 404s at runtime.
navigate('/blog/postz/42');

// Renamed routes/blog → routes/articles? Every <Link> silently breaks.
<Link to="/blog/42" />
```

Next.js has `typedRoutes`, React Router has `typegen`, SvelteKit has `$types`, TanStack Router is
typed end-to-end. Modern.js has… [an open feature request](https://github.com/web-infra-dev/modern.js/issues/6218).

## The solution

`modernjs-typed-routes` is a Modern.js CLI plugin that reads the **framework's own parsed route
tree** and generates a single declaration file. Combined with the typed wrappers it ships, you get:

```tsx
import { Link, useNavigate } from 'modernjs-typed-routes';

// ✅ Autocomplete for every route in your app
<Link to="/about" />

// ✅ `params` is REQUIRED here — and `id` is typechecked
<Link to="/blog/[id]" params={{ id: post.id }} />

// ❌ Compile error: route does not exist
<Link to="/blgo/[id]" params={{ id: post.id }} />

// ❌ Compile error: missing required param `id`
const { navigateTo } = useNavigate();
navigateTo('/blog/[id]');
```

## How it works

1. During `modern dev` / `modern build` (or `npx modern typegen`), the plugin taps Modern.js's route
   generation and receives the fully-parsed route tree — including config routes from
   `modern.routes.ts` and every entry of a multi-entry app.
2. It emits one file (default `src/routes.gen.d.ts`) containing **only types**: a map of every route
   path to its params, merged into the package's `Register` interface via declaration merging.
3. The wrappers you import (`Link`, `Navigate`, `useNavigate`, …) are static generic code that
   infers everything from `Register`. No runtime code is ever generated, and your bundle stays the same.

Because the types come from Modern.js's own parser — not a re-implementation of its conventions —
they can't drift from what the framework actually serves.

## Comparison

| | modernjs-typed-routes | Next.js `typedRoutes` | React Router `typegen` | TanStack Router |
|---|---|---|---|---|
| Framework | Modern.js | Next.js | RR framework mode | TanStack |
| Typed path union | ✅ | ✅ | ✅ (`href()`) | ✅ |
| Params required per route | ✅ objects | template strings only | ✅ (`href()`) | ✅ |
| Typed navigation components | ✅ ships wrappers | `next/link` built-in | partial | ✅ built-in |
| Search params | basic (validated planned) | ❌ | ❌ | ✅ validated |
| Bundle cost | none (types only) | none | none | runtime router |

## Requirements

- Modern.js **v3** (`@modern-js/app-tools` ^3) with conventional `routes/` entries
- TypeScript ≥ 5.0
- Not supported: the legacy `pages/` convention and self-controlled (`App.tsx`) entries
