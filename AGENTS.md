# AGENTS.md

You are an expert in JavaScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Project

**modernjs-typed-routes** — an open-source Modern.js CLI plugin that generates TypeScript types
from file-based routes, plus typed `Link`/`Navigate`/`useNavigate` runtime wrappers.

- Read `roadmap/README.md` FIRST: it indexes the brief, PRD, architecture, decision log, and
  execution phases. Decisions in `roadmap/03-decisions.md` are settled — don't re-litigate.
- The Rspress site under `docs/` is the API contract (docs-first development). Keep code, docs,
  and roadmap in sync.
- HARD RULE: never mention Crehana or any `@crehana/*` package anywhere (code, docs, commits).

## Commands

- `pnpm run build` - Build the library for production
- `pnpm run dev` - Turn on watch mode, watch for changes and rebuild the library
- `pnpm run test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt

## Tools

### Biome

- Run `pnpm run lint` to lint your code
- Run `pnpm run format` to format your code
