# Contributing to modernjs-typed-routes

Thanks for helping out! This guide gets you from a fresh clone to running every test layer, and
explains the few rules that keep the project honest.

## The one rule that matters: docs are the contract

The Rspress site under [`docs/`](./docs) defines the public API. Code follows docs — never the
other way around:

- **Changing behavior?** Change the docs page and the code in the same PR.
- Code blocks in `docs/guide/getting-started.md` and `docs/guide/navigation.md` are **compiled in
  CI** (mirrored 1:1 under `examples/playground/docs-snippets/`). If you edit a snippet in the
  docs, update its mirror — `pnpm test` fails otherwise.
- If a change would alter the public API surface, open an issue first.

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io) ≥ 9 (`corepack enable` works)

## Setup

```bash
git clone https://github.com/giancarlosisasi/modernjs-typed-routes.git
cd modernjs-typed-routes
pnpm install
pnpm build     # build dist/ first — the playground consumes it via workspace:*
```

## Repo layout

```
src/
  core/       pure logic: route tree → normalized RouteInfo[] → emitted .d.ts text
  plugin/     the Modern.js CLI plugin (hook wiring, write-if-changed, typegen command)
  runtime/    typed Link / Navigate / useNavigate / useTypedParams / buildPath + Register machinery
  index.ts    runtime barrel — also DECLARES the `Register` interface (must stay an interface)
tests/
  core/ plugin/ runtime/   unit specs (Rstest)
  types/                   type-level suite: three tsc projects (single / multi / empty Register)
  e2e/                     real-CLI E2E against the playground (see tests/e2e/README.md)
examples/playground/       real Modern.js app exercising EVERY routing convention (fixture + dogfood)
examples/playground/docs-snippets/   1:1 mirrors of the docs' code blocks, typechecked in CI
docs/                      Rspress docs site — the API contract
scripts/                   snapshot update + playground typecheck helpers
```

## Test layers and how to run them

| Layer | What it proves | Command |
|---|---|---|
| Unit (Rstest) | normalize/emit/write/buildPath/options logic, incl. byte-exact generated-file snapshots | `pnpm rstest` (or watch: `pnpm test:watch`) |
| Type-level | the typed API itself: valid/invalid paths, params required/optional/forbidden, entry isolation, empty-Register fallback | `pnpm test:types` |
| Docs snippets | every docs code block compiles against the documented Register | `pnpm check:docs-snippets` |
| Playground typecheck | the dogfooding app typechecks against the real generated types | `pnpm check:playground` |
| **All of the above** | | **`pnpm test`** |
| E2E (real CLI) | `modern typegen` / `build` / `dev --watch` generate correct types in the real playground app | `pnpm build && pnpm test:e2e` |
| Lint/format (Biome) | style + correctness lints | `pnpm check` |
| Packaging | exports map / dual CJS+ESM types resolve everywhere (publint + attw) | `pnpm build && pnpm lint:package` |
| Docs build | the Rspress site builds, no dead links/images | `pnpm docs:build` |

Notes:

- **`pnpm build` before `test:e2e` or `lint:package`** — both consume `dist/`. Stale dist means
  confusing failures.
- The E2E suite is serial by design and generous with timeouts; quirks (Windows process kill,
  ports, transient Modern.js rebuild errors) are documented in
  [`tests/e2e/README.md`](./tests/e2e/README.md).
- We work **test-first**: a behavior change starts with a failing spec. PRs that change behavior
  without touching a spec will be asked to add one.

## Updating the generated-file snapshot

The committed snapshot (`tests/e2e/fixtures/playground-routes.gen.d.ts`) must stay byte-identical
to what the real CLI generates for the playground, and the core suite has a lockstep spec pinning
the same content. After an *intended* change to the generated format or the playground's routes:

```bash
pnpm build
pnpm test:e2e:update   # regenerates via the real `modern typegen` and copies it over
pnpm test              # the lockstep spec in tests/core/generate.test.ts must agree
```

Never hand-edit the snapshot (Biome is configured to leave it alone). Snapshot diffs are reviewed
like code.

## The playground

`examples/playground` is both the E2E fixture and the dogfooding app — every page imports **only**
`modernjs-typed-routes`, and each page states which routing convention it demonstrates. Run it:

```bash
pnpm --dir examples/playground dev    # main entry at /, second entry at /admin
```

If you add a route convention, add it here (it feeds the generated snapshot, the E2E oracle
comparison, and the docs' conventions table).

## Style

- Biome for lint + format: `pnpm check` (auto-fixes). CI runs it read-only.
- Conventional-commit style messages (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Generated artifacts and `\n` line endings are non-negotiable: output must be deterministic and
  Windows-safe (the project is developed on Windows).

## Releases

Releases are cut with changesets and published manually by the maintainer — contributors don't
publish. If your PR changes user-facing behavior, include a changeset when asked (the release
tooling lands with v0.1.0; until then the maintainer handles it).
