---
'modernjs-typed-routes': patch
---

Fix `useNavigate()`'s `navigateTo` / `createUrl` losing their conditional `params` requirement in
the published types.

`useNavigate()` had an inferred return type, so TypeScript's declaration emit had to *synthesize*
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
