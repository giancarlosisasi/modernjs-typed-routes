## What & why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] Tests: behavior changes come with specs (unit / type-level / E2E as appropriate)
- [ ] Docs: `docs/` updated in the same PR (docs are the contract) and snippet mirrors under
      `examples/playground/docs-snippets/` still compile
- [ ] Snapshot: regenerated via `pnpm test:e2e:update` if the generated format or the
      playground's routes changed (never hand-edited)
- [ ] `pnpm test`, `pnpm check` and (if `src/` changed) `pnpm build && pnpm test:e2e` are green
- [ ] Changeset included if user-facing behavior changed (tooling arrives with v0.1.0 — until
      then the maintainer handles versioning, skip this)
