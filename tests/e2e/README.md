# E2E suite

Runs the **real Modern.js CLI** (`typegen`, `build`, `dev`) against the **real**
`examples/playground` app and asserts on the actually-generated
`src/routes.gen.d.ts`. This layer is what protects the plugin from upstream
Modern.js changes (testing-strategy L4).

```bash
pnpm build          # the playground consumes dist/ via workspace:* — build first!
pnpm test:e2e
```

## Quirks

- **Serial by design** (`maxConcurrency: 1` + single file): every test shares the
  playground working tree.
- **`pnpm build` first**: the playground resolves `modernjs-typed-routes/plugin`
  from `dist/`. Stale dist = confusing failures.
- **Ports**: the watch test starts `modern dev` but never touches HTTP — if 8080
  is busy Rsbuild picks the next port and the test still works.
- **Windows**: processes are killed with `taskkill /T /F` (the dev server spawns
  children); POSIX uses `SIGKILL`. Transient Modern.js-internal build errors
  during renames are expected and self-heal (see spike-findings).
- **Timeouts**: generous on purpose (180s per test, 30–60s polls). CI machines
  are slow; flake is worse than slow.

## Updating the snapshot

The committed snapshot lives at `tests/e2e/fixtures/playground-routes.gen.d.ts`
and must stay byte-identical to what the core suite expects
(`tests/core/generate.test.ts` has a lockstep spec). After an INTENDED change to
the generated format or the playground's routes:

```bash
pnpm test:e2e:update   # regenerates via `modern typegen` and copies it over
pnpm test              # confirm the lockstep spec agrees (update MULTI_ENTRY_ARTIFACT if not)
```

Never hand-edit the snapshot; biome is configured to leave it alone.
