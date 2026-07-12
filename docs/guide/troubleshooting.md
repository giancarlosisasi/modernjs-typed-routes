# Troubleshooting

## `to` accepts any string / no autocomplete

The `Register` interface is empty — types were never generated. Run:

```bash
npx modern typegen
```

and confirm the generated file (default `src/routes.gen.d.ts`) exists. If it exists and you still
get plain `string`, check the two causes below.

## The generated file is outside your tsconfig

The generated file only works if TypeScript actually loads it. The default `src/routes.gen.d.ts`
location is covered by any standard `include: ["src"]`. If you set a custom
[`outFile`](/api/plugin-options#outfile), make sure it's inside a folder your `tsconfig.json`
`include` covers — a file TypeScript never reads merges nothing.

## Types don't update in the editor

The file regenerated on disk but the editor's TS server cached the old version: run
**"TypeScript: Restart TS Server"** (VS Code) or its equivalent. This is rare — while `modern dev`
runs, route changes regenerate the file and the TS server usually picks it up on its own.

## Types are stale (routes changed, file didn't)

The plugin only writes when Modern.js runs. If routes changed while nothing was running — a
`git pull`, a branch switch, editing files with the dev server stopped — the generated file still
describes the old routes. Run `npx modern typegen` (or start `modern dev`). The
[CI recipe](/guide/getting-started#ci-recipe) (`modern typegen && tsc --noEmit`) makes stale types
impossible in CI.

## Monorepo: two copies of the package break the types

The generated file augments the module `'modernjs-typed-routes'` — the *specific copy* module
resolution finds. If your workspace resolves **two copies or two versions** (hoisting quirks, or
different versions across packages), the augmentation can land on one copy while your imports use
the other, and everything silently falls back to `string`.

Fix: make sure exactly one version exists —

```bash
pnpm why modernjs-typed-routes   # or: npm ls modernjs-typed-routes
pnpm dedupe
```

and align the version across workspace packages (a root-level override/resolution also works).

## Multi-entry apps

- The main entry is always named **`index`** (Modern.js normalizes it), not your package name —
  relevant for `EntryRoutePath<'index'>` and friends.
- Plain `RoutePath` is the union across **all** entries. For per-entry autocomplete, use the
  [entry-scoped types](/api/runtime#entry-scoped-types-multi-entry-apps).
- Typed navigation can't move **between entries** — each entry is its own SPA bundle. From a
  secondary entry the router prepends its basename to every target; from the main entry a
  client-side `navigateTo` lands on a route this bundle doesn't have. Cross-entry jumps need a
  real page load: typed `<Link reloadDocument>` from the main entry, or `buildPath` + a plain
  `<a>`/`window.location` from anywhere — see
  [Cross-entry navigation](/guide/route-conventions#multi-entry-apps).

## Custom `runtime.router.basename`

The wrappers reconcile the router basename automatically — pass route keys exactly as generated,
never with the basename manually prepended. `createUrl` returns the full browser URL (basename
included); `buildPath` is pure and **basename-unaware** — inside components prefer `createUrl`
when you need the real URL.

## Lint or format tools rewrite the generated file

The header already carries `/* eslint-disable */` and `/* prettier-ignore */`. For other tools
(e.g. Biome), exclude the file in the tool's config, or inject a directive with the
[`banner`](/api/plugin-options#banner) option:

```ts
routeTypesPlugin({ banner: '/* biome-ignore-all lint: generated file */' });
```

## Escape hatches

When the typed surface doesn't cover a case:

- `originalNavigate` from `useNavigate()` — the raw React Router `navigate`.
- Import the untyped originals directly from `@modern-js/runtime/router`.
- Type your own props as `RoutePathname | (string & {})` to keep autocomplete while accepting
  arbitrary strings.
