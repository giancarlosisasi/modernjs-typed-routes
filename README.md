# modernjs-typed-routes

[![npm version](https://img.shields.io/npm/v/modernjs-typed-routes)](https://www.npmjs.com/package/modernjs-typed-routes)
[![CI](https://github.com/giancarlosisasi/modernjs-typed-routes/actions/workflows/ci.yml/badge.svg)](https://github.com/giancarlosisasi/modernjs-typed-routes/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Type-safe routes for [Modern.js](https://modernjs.dev): a zero-config CLI plugin that generates
TypeScript types from your file-based `routes/` folders, plus typed `Link`, `Navigate` and
`useNavigate` wrappers — so path typos and missing route params become **compile errors** instead
of runtime 404s.

> **Status: pre-release.** Not yet published to npm — v0.1.0 is on its way.

![Demo: route autocomplete, typo'd path error, required params](./docs/public/demo.gif)

```tsx
import { Link, useNavigate } from 'modernjs-typed-routes';

<Link to="/about" />                                // ✅ autocompleted route union
<Link to="/blog/[id]" params={{ id: post.id }} />   // ✅ params required & typed
<Link to="/blgo/[id]" params={{ id: post.id }} />   // ❌ error: Did you mean '"/blog/[id]"'?

const { navigateTo } = useNavigate();
navigateTo('/blog/[id]');                           // ❌ error: `params` is required here
```

## Quickstart

**1. Install** (one package: build-time plugin + runtime wrappers):

```bash
pnpm add modernjs-typed-routes
```

**2. Register the plugin:**

```ts
// modern.config.ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { routeTypesPlugin } from 'modernjs-typed-routes/plugin';

export default defineConfig({
  plugins: [appTools(), routeTypesPlugin()],
});
```

**3. Run `modern dev`** (or `npx modern typegen` to generate without starting anything). A single
declaration file appears at `src/routes.gen.d.ts` and regenerates automatically whenever your
routes change.

**4. Import navigation from the package** instead of `@modern-js/runtime/router` — it re-exports
the full router surface with `Link`, `Navigate` and `useNavigate` swapped for typed versions:

```tsx
import { Link } from 'modernjs-typed-routes';

<Link to="/blog/[id]" params={{ id: 42 }}>Read post 42</Link>
```

That's the whole setup. See the docs for the full API: `buildPath`, `useTypedParams`,
`createUrl`, search params, hashes, multi-entry apps and more.

## Why this plugin

- **Derived from Modern.js's own route parser** — not a re-implementation of its conventions, so
  the types can't drift from what the framework serves. Covers dynamic `[id]`, optional `[id$]`,
  splat `$`, pathless `__auth` layouts, flat `a.b.c` segments, `modern.routes.ts` config routes
  and multi-entry apps.
- **Types only, zero bundle cost** — the generated file is a `.d.ts`; declaration merging does the
  rest. The wrappers are tiny static components.
- **Params are objects, required per route** — `<Link to="/blog/[id]" params={{ id }}>`
  autocompletes the path *and* the param names.
- **CI friendly** — `npx modern typegen && tsc --noEmit` catches broken links in pull requests.

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

| | Supported |
|---|---|
| Modern.js | v3 — `@modern-js/app-tools` / `@modern-js/runtime` `^3.6.0` |
| Node.js | ≥ 20 |
| TypeScript | ≥ 5.3 |
| React | ≥ 18 |

Routing must use conventional `routes/` entries. Modern.js v2, the legacy `pages/` convention and
self-controlled (`App.tsx`) entries are out of scope — there's no conventional route tree to type.

## Documentation

Full docs live in [`docs/`](./docs) (Rspress site — hosted version coming with the first release):
guides for [getting started](./docs/guide/getting-started.md),
[navigation](./docs/guide/navigation.md),
[route conventions](./docs/guide/route-conventions.md) and
[troubleshooting](./docs/guide/troubleshooting.md), plus the
[plugin options](./docs/api/plugin-options.md) and [runtime API](./docs/api/runtime.md) reference.

Related: [web-infra-dev/modern.js#6218](https://github.com/web-infra-dev/modern.js/issues/6218) —
the upstream feature request this plugin answers.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). Development at a glance:

```bash
pnpm install
pnpm build        # build the library (rslib)
pnpm test         # unit + type-level + docs-snippet + playground checks
pnpm test:e2e     # E2E against the real Modern.js CLI (examples/playground)
pnpm check        # biome
pnpm docs:dev     # rspress docs site
```

## License

[MIT](./LICENSE) © Giancarlos Isasi
