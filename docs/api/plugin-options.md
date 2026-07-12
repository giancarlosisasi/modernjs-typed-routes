# Plugin options

```ts title="modern.config.ts"
import { routeTypesPlugin } from 'modernjs-typed-routes/plugin';

routeTypesPlugin({
  outFile: 'src/routes.gen.d.ts',
  trailingSlash: false,
  banner: undefined,
});
```

## `outFile`

- **Type:** `string`
- **Default:** `'src/routes.gen.d.ts'`

Where the generated declaration file is written, relative to the app root. Keep it inside a folder
covered by your `tsconfig.json` `include` — the default `src/` location needs no extra setup.

```ts
routeTypesPlugin({ outFile: 'src/shared/router/routes.gen.d.ts' });
```

## `trailingSlash`

- **Type:** `boolean`
- **Default:** `false`

When `true`, every generated route key and every URL built by `Link` / `navigateTo` / `buildPath`
ends with `/` (`'/blog/[id]/'` → `/blog/42/`). Use it when your CDN/server canonicalizes to
trailing-slash URLs.

## `banner`

- **Type:** `string`
- **Default:** `undefined`

Extra text appended to the generated file's header comment — e.g. a lint directive your setup needs:

```ts
routeTypesPlugin({ banner: '/* biome-ignore-all lint: generated file */' });
```

## The `typegen` command

Registering the plugin also adds a Modern.js CLI command:

```bash
npx modern typegen
```

Generates the types once, without a dev server or build. Exits non-zero on failure — designed for
CI pipelines (`modern typegen && tsc --noEmit`).

## Behavior notes

- Generation runs on `modern dev` startup, once during `modern build`, and — while the dev server
  runs — whenever the routes change: a route file is added, removed or renamed, or a
  `modern.routes.ts` is edited. Content edits to an existing page don't trigger regeneration
  (the route set didn't change).
- The file is only rewritten when its content actually changed (no watcher churn, stable mtimes).
- Output is deterministic: route keys are sorted, formatting is stable, line endings are `\n`.
- Errors never crash your dev server — they're logged with a `[modernjs-typed-routes]` prefix and
  the previous generated file is left in place.
