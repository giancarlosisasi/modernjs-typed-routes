# Route conventions → generated types

:::warning Design preview
API contract, pre-implementation.
:::

The plugin consumes the route tree Modern.js itself parses, so every conventional-routing feature is
supported. Path literals in the generated types use the **bracket style you see on disk** (`[id]`,
`[id$]`, `$`) — not React Router's `:id` syntax — so autocomplete matches your folder names.

## Mapping table

| Files on disk | Generated route key | Generated params |
|---|---|---|
| `routes/page.tsx` | `'/'` | `{}` |
| `routes/about/page.tsx` | `'/about'` | `{}` |
| `routes/blog/[id]/page.tsx` | `'/blog/[id]'` | `{ id: string \| number }` |
| `routes/users/[id$]/page.tsx` | `'/users/[id$]'` | `{ id?: string \| number }` |
| `routes/docs/$.tsx` | `'/docs/$'` | `{ '*': string }` |
| `routes/$.tsx` (root 404) | `'/$'` | `{ '*': string }` |
| `routes/__auth/login/page.tsx` | `'/login'` (pathless `__auth` dropped) | `{}` |
| `routes/user.profile.[id].edit/page.tsx` | `'/user/profile/[id]/edit'` | `{ id: string \| number }` |

Notes:

- **Only pages create routes.** `layout.tsx` shapes nesting but never produces a key by itself.
  Sidecar files (`page.data.ts`, `page.config.ts`, `loading.tsx`, `error.tsx`, `*.test.tsx`, …)
  never affect the generated types.
- **Optional params** stay one route key with an optional param — `buildPath`/`createUrl` drop the
  segment when the param is omitted (`/users/[id$]` without `id` → `/users`).
- **Splat params** use React Router's `'*'` key, matching what `useParams()` returns at runtime.

## Config routes (`modern.routes.ts`)

Routes defined or overridden with `defineRoutes` in `src/modern.routes.ts` are part of the tree the
plugin receives, so they're typed too — something a filesystem scanner could never see. Paths coming
from config routes keep bracket style in the generated keys (`:id` is normalized to `[id]`).

## Multi-entry apps

Every conventional-routing entry gets its **own isolated set of route types**, keyed by entry name.
Modern.js names the main entry `index` regardless of your package name; other entries keep their
directory name:

```ts
declare module 'modernjs-typed-routes' {
  interface Register {
    entries: {
      index: { basename: '/'; routes: { '/': { params: {} } /* … */ } };
      admin: { basename: '/admin';
               routes: { '/admin': { params: {} };
                         '/admin/users/[userId]': { params: { userId: string | number } } } };
    };
  }
}
```

- **Single-entry apps never see this layer** — `RoutePath` and all wrappers just work with your
  routes, as shown everywhere else in these docs.
- Multi-entry apps use entry-scoped types (`EntryRoutePath<'admin'>` and friends) so one entry's
  routes never pollute another's autocomplete. Route keys include the entry mount prefix
  (`/admin/…`), so literals always equal real URLs.

:::info Final shape in validation
The entry-scoped helper API is being finalized against a real multi-entry fixture app — the
isolation guarantee above is settled; helper names may still be refined.
:::

:::warning Cross-entry navigation
Each entry is its own SPA bundle. `<Link>` across entries works (it renders a real `<a>`, producing
a full page load), but imperative `navigateTo` across entries is not client-side routable — prefer
`<Link>` or `window.location` for cross-entry jumps.
:::

## Trailing slashes

By default generated keys have **no** trailing slash. If your infrastructure serves trailing-slash
URLs, flip one option and every key and built URL gets one:

```ts
routeTypesPlugin({ trailingSlash: true });
// keys become '/blog/[id]/', built URLs become '/blog/42/'
```

## Out of scope

- The legacy `pages/` flat-routing convention (deprecated in Modern.js v3 era).
- Self-controlled entries (`App.tsx` / custom `entry.tsx`) — there's no conventional route tree to type.
