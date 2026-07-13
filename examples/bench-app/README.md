# bench-app

Synthetic Modern.js app used by the performance benchmarks. `src/routes/`
does not exist in git — `pnpm bench:e2e` recreates it (default: 500 routes
covering every supported route type) on every run.

See `scripts/bench/README.md` for what gets measured.
