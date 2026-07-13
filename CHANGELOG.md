# modernjs-typed-routes

## 0.1.2

### Patch Changes

- de63432: Fix `useNavigate()`'s `navigateTo` / `createUrl` losing their conditional `params` requirement in
  the published types.

  `useNavigate()` had an inferred return type, so TypeScript's declaration emit had to _synthesize_
  its signatures — and synthesizing flattens a rest parameter whose type is a concrete tuple. Inside
  the package `Register` is empty, so `NavigateArgs<P>` was no longer deferred and eagerly resolved to
  its permissive branch, which the emitter then wrote out as `options?: NavigateToOptions<P>`. The
  shipped `.d.ts` therefore had no conditional left to re-evaluate against a consumer's augmented
  `Register`, and `navigateTo('/blog/[id]')` compiled with no params (`<Link to="/blog/[id]">`
  correctly errored, which is what exposed the asymmetry). `createUrl` was affected identically.

  `useNavigate()` now declares an explicit, exported return type (`NavigateHelpers`), so declaration
  emit copies `...args: NavigateArgs<P>` verbatim and the conditional survives into the `.d.ts`.

  Type-only fix; no runtime behavior changed. Call sites that were accidentally allowed to omit
  required `params` will now — correctly — fail to compile.

  The type-level test suite now runs its specs against the built `dist/index.d.ts` as well as `src`,
  so a declaration-emit regression like this fails CI instead of shipping.

## 0.1.1

### Patch Changes

- dade9c8: Docs: replace the placeholder demo GIF with the real recording (route autocomplete,
  typo'd-path compile error, required params) — shown on the README, the npm page and
  the docs home.

## 0.1.0

### Minor Changes

- 45fe1a3: First public release 🎉

  - **Build-time plugin** (`modernjs-typed-routes/plugin`): generates `src/routes.gen.d.ts` from
    Modern.js's own parsed route tree during `modern dev` / `modern build`, plus a standalone
    `npx modern typegen` command for CI. Covers dynamic `[id]`, optional `[id$]`, splat `$`,
    pathless `__layout` groups, flat `a.b.c` segments, `modern.routes.ts` config routes and
    multi-entry apps (entry-scoped types with basename-prefixed keys).
  - **Typed runtime** (`modernjs-typed-routes`): `Link`, `Navigate`, `useNavigate`
    (`navigateTo` / `createUrl` / `goBack` / `originalNavigate`), `useTypedParams` and the pure
    `buildPath` — routes with required params demand a typed `params` object; paramless routes
    accept a plain string. Full re-export of `@modern-js/runtime/router` so one import source
    works everywhere.
  - Zero runtime cost: the generated file contains only types (declaration merging into
    `Register`); deterministic output with `\n` line endings, atomic write-if-changed.

  Requires Modern.js `^3.6.0`, Node ≥ 20, TypeScript ≥ 5.3, React ≥ 18.
  Docs: https://modernjs-typed-routes.gio-labs.com
