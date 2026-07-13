# Performance benchmarks

Answers: **how much time does modernjs-typed-routes add to a big project?**
Every run recreates its fixture from scratch (deterministic synthetic routes
covering every file-convention route type: static, deep static, `[id]`,
multi-param, `[id$]`, `$` catch-all, `__group` pathless layouts, section
layouts + index pages, flat `a.b.[c]` dirs, `page.data.ts` sidecars.
Config routes (`modern.routes.ts`) are not synthesized — their per-node
generation cost is identical).

## `pnpm bench:core`

Times ONE hook-fire of the shipped `dist/plugin` (normalize + emit +
write-if-changed) against synthetic parsed trees at 50…2000 routes — this is
*everything* the plugin adds per route change in dev and per build, because
Modern.js parses routes anyway. Requires `pnpm build` first.

- **changed** — a route was added/renamed, the file is rewritten (worst case).
- **unchanged** — the hook re-fired but output is identical (common case).

```
pnpm bench:core [--sizes 50,500,2000] [--iterations 25]
```

## `pnpm bench:e2e`

Drives the REAL Modern.js CLI over `examples/bench-app` (a workspace app; run
`pnpm install` once). Recreates `src/routes/` with N routes every run.

```
pnpm bench:e2e [--routes 500] [--runs 3] [--tsc] [--build]
```

- default: times `modern typegen` — Modern.js CLI init + its own route
  parsing + plugin generation.
- `--tsc`: times `tsc --noEmit` with the generated `routes.gen.d.ts` present
  vs absent — the cost of the type surface for the type-checker/IDE.
- `--build`: times `modern build` with vs without the plugin
  (`BENCH_TYPED_ROUTES=off`) — the true end-to-end overhead. Slow.

## Reading the numbers

The plugin runs *outside* the bundler pipeline: its per-fire cost (bench:core)
is the added latency per route-shaping change in dev and the added time per
build. `modern typegen` total time is dominated by Modern.js CLI startup and
its own `routes/` directory walk, which happen regardless of this plugin.
