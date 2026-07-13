# Performance & overhead

**TL;DR: the plugin adds negligible overhead to your dev server and build** — a few milliseconds
per route change even at 2000 routes — and nothing at all happens at runtime or in your bundle.

## What the plugin actually does

On changes under `routes/` — whether or not they reshape the route tree — Modern.js re-parses the
directory (it does this with or without this plugin) and fires the `modifyFileSystemRoutes` hook. The plugin's entire cost is what
happens inside that hook:

1. Walk the **already-parsed** route tree — no file system scanning, no AST parsing.
2. Emit one `.d.ts` string.
3. Compare it against the existing file and **write only if the content changed** — so saving a
   component, editing styles, or any change that doesn't reshape routes never touches the disk,
   and file watchers (including `tsserver`) see stable mtimes.

There is no bundler integration: no loaders, no transforms, nothing added to Rspack/webpack's
module graph. And since the output is a declaration file consumed via TypeScript declaration
merging, there is **zero runtime cost** — the plugin never touches the bundler, so your bundle is
identical with and without it by construction.

## Measured cost per hook fire

Benchmarked against the shipped `dist/plugin` artifact over a synthetic app covering every route
convention (dynamic, optional, splat, pathless layouts, flat segments, multi-entry). Two scenarios:

- **route changed** — a route was added/renamed, the file is regenerated and rewritten
  (the worst case);
- **no route change** — the hook re-fires but the output is identical, so nothing is written
  (the common case: most dev-loop edits).

Desktop CPU (Intel i9-14900K, Windows 11, Node 24), p50 of 40 iterations:

| routes | output size | route changed | no route change |
| ------ | ----------- | ------------- | --------------- |
| 500    | 28 KB       | 9.1ms         | 0.6ms           |
| 2000   | 113 KB      | 11.0ms        | 1.8ms           |

### On a slow machine

To make sure these numbers aren't an artifact of a fast desktop, the same bench was re-run with the
CPU frequency-capped to 1.6 GHz and turbo boost disabled — **~3.7× slower single-core** than the
numbers above, comparable to a budget laptop:

| routes | route changed | no route change |
| ------ | ------------- | --------------- |
| 500    | 34.6ms        | 2.3ms           |
| 2000   | 42.1ms        | 6.5ms           |

Even on hardware weaker than most CI runners, the worst case at 2000 routes stays around 40ms —
a fraction of what the HMR rebuild triggered by the same file change costs.

### The worst-case number is inflated (on purpose)

The "route changed" scenario is dominated by a measurement artifact that real usage doesn't hit:
the bench rewrites the file and immediately reads it back on the next iteration, which on Windows
blocks until Defender's real-time scan of the new content finishes — that stall accounts for most
of the 11ms. Isolated probes on the same machine:

| operation | cost |
| --- | --- |
| full hook fire without a write (generate 2000 routes + read + compare) | ~1.8ms |
| write + rename 113 KB | ~0.4ms |
| read back a **just-rewritten** file (Defender scan stall) | ~13ms |

In a real dev session, hook fires are seconds apart and the scan completes in the background, so
the practical cost of a route change at 2000 routes is **~2ms**. The published worst case errs on
the high side — and the stall is a Windows Defender artifact, so Linux/macOS shouldn't hit it.

## What about `tsc` and the IDE?

The generated file is a single flat interface — no conditional types to expand at every call site,
no deep recursion. At 2000 routes it's a 113 KB `.d.ts`, roughly the size of one mid-sized
dependency's types. Route autocomplete stays instant because the path union is a plain string
literal union, the cheapest construct for the language server to complete.

## Run the benchmarks yourself

Both benches live in the repo and take a `--sizes` / `--routes` flag, so you can measure your own
route counts on your own hardware:

```bash
pnpm build

# per-hook-fire cost against dist/plugin (fast, no Modern.js process)
pnpm bench:core --sizes 500,2000 --iterations 40

# the real CLI end-to-end: `modern typegen` over a synthetic N-route app
pnpm bench:e2e --routes 500

# optional: production build with vs without the plugin, and tsc cost
pnpm bench:e2e --routes 500 --build --tsc
```

`bench:core` isolates everything the plugin adds to a dev/build cycle. `bench:e2e` measures the
full `modern typegen` command — its time is dominated by Modern.js's own entry initialization and
route parsing, which happens with or without the plugin.
