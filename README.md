# modernjs-typed-routes

> ⚠️ **Work in progress — design phase.** Not published yet.

Type-safe routes for [Modern.js](https://modernjs.dev): a zero-config plugin that generates
TypeScript types from your file-based `routes/` folders, plus typed `Link`, `Navigate` and
`useNavigate` wrappers — so invalid paths and missing route params become compile errors.

```tsx
import { Link, useNavigate } from 'modernjs-typed-routes';

<Link to="/about" />                                  // ✅ autocompleted
<Link to="/blog/[id]" params={{ id: post.id }} />     // ✅ params required & typed
<Link to="/blgo/[id]" params={{ id: post.id }} />     // ❌ compile error
```

- **Docs (design-first, defines the API):** `docs/` — run `pnpm docs:dev`
- **Planning / roadmap:** [`roadmap/`](./roadmap/README.md)
- Related: [modern.js#6218](https://github.com/web-infra-dev/modern.js/issues/6218)

## Development

```bash
pnpm install
pnpm build        # build the library (rslib)
pnpm dev          # rslib watch mode
pnpm test         # rstest
pnpm check        # biome
pnpm docs:dev     # rspress docs site
```

## License

MIT © Giancarlos Isasi
