/**
 * Type machinery derived from the `Register` interface (declared in
 * `src/index.ts` — the module the generated file augments; it must live
 * there because module augmentation does not merge through re-exports).
 *
 * Two generated shapes exist (docs contract):
 * - single entry  → `Register.routes` (getting-started.md)
 * - multi-entry   → `Register.entries` keyed by entry name (route keys carry
 *   the mount prefix — route-conventions.md, decision D13)
 *
 * Multi-entry design (finalized in phase 3 from the spike evidence):
 * plain `RoutePath` is the union across ALL entries — every literal equals a
 * real URL, so `<Link>` (a real `<a>`) works cross-entry. The entry-scoped
 * lookups (`EntryRoutePath`, `EntryRouteParams`) provide the per-entry
 * isolation for teams that want scope-strict autocomplete.
 *
 * With an EMPTY `Register` (fresh install, nothing generated yet) everything
 * degrades to plain `string` paths with optional permissive params — it must
 * compile, never error.
 */
import type { Register } from '../index';

type ParamsShape = Record<string, unknown>;
type RoutesShape = Record<string, { params: ParamsShape }>;
type EntriesShape = Record<string, { basename: string; routes: RoutesShape }>;

type SingleRoutes = Register extends { routes: infer R extends RoutesShape }
  ? R
  : never;
type EntriesMap = Register extends { entries: infer E extends EntriesShape }
  ? E
  : never;

type HasSingle = [SingleRoutes] extends [never] ? false : true;
type HasEntries = [EntriesMap] extends [never] ? false : true;

/** Entry names of a multi-entry Register (`never` for single-entry/empty). */
export type RegisterEntryName = keyof EntriesMap & string;

type RoutesOf<E extends RegisterEntryName> = EntriesMap[E]['routes'];

type AllEntryRouteKeys = {
  [E in RegisterEntryName]: keyof RoutesOf<E> & string;
}[RegisterEntryName];

/** Union of all route-path literals; `string` before the first generation. */
export type RoutePath = HasSingle extends true
  ? keyof SingleRoutes & string
  : HasEntries extends true
    ? AllEntryRouteKeys
    : string;

/** Alias of {@link RoutePath} for app-level props (`RoutePathname | (string & {})`). */
export type RoutePathname = RoutePath;

/** Fallback write-side params when nothing is generated yet. */
type FallbackParams = Record<string, string | number>;

/** Write-side params for route `P` (values `string | number`, splat `string`). */
export type RouteParams<P extends RoutePath> = HasSingle extends true
  ? P extends keyof SingleRoutes
    ? SingleRoutes[P]['params']
    : never
  : HasEntries extends true
    ? {
        [E in RegisterEntryName]: P extends keyof RoutesOf<E>
          ? ParamsLookup<RoutesOf<E>[P]>
          : never;
      }[RegisterEntryName]
    : FallbackParams;

/** `infer`-based lookup — TS cannot index `['params']` on a generic entry lookup directly. */
type ParamsLookup<R> = R extends { params: infer P extends ParamsShape }
  ? P
  : never;

type StaticKeysOf<R extends RoutesShape> = {
  [K in keyof R]: Record<string, never> extends R[K]['params'] ? K : never;
}[keyof R] &
  string;

/** Only the routes callable without a `params` argument (optional-only included). */
export type StaticRoutePath = HasSingle extends true
  ? StaticKeysOf<SingleRoutes>
  : HasEntries extends true
    ? { [E in RegisterEntryName]: StaticKeysOf<RoutesOf<E>> }[RegisterEntryName]
    : string;

// --- entry-scoped lookups (D13 isolation) ----------------------------------

/** Route-path literals belonging to ONE entry of a multi-entry app. */
export type EntryRoutePath<E extends RegisterEntryName> = keyof RoutesOf<E> &
  string;

/** Write-side params scoped to one entry. */
export type EntryRouteParams<
  E extends RegisterEntryName,
  P extends EntryRoutePath<E>,
> = P extends keyof RoutesOf<E> ? ParamsLookup<RoutesOf<E>[P]> : never;

// --- navigation option shapes (docs/api/runtime.md) -------------------------

export type SearchParamsInit = Record<string, string | number | boolean>;

type BaseBuildOptions = {
  searchParams?: SearchParamsInit;
  hash?: string;
};

type WithParams<P extends RoutePath> =
  Record<string, never> extends RouteParams<P>
    ? { params?: RouteParams<P> }
    : { params: RouteParams<P> };

/** Options for `buildPath` / `createUrl` — `params` conditionally required (D8). */
export type BuildOptions<P extends RoutePath> = BaseBuildOptions &
  WithParams<P>;

/** Options for `navigateTo` / `<Navigate>`. */
export type NavigateToOptions<P extends RoutePath> = BuildOptions<P> & {
  replace?: boolean;
  state?: unknown;
};

/**
 * Argument tuple making the whole options object required exactly when the
 * route has required params: `navigateTo('/blog/[id]')` must not compile.
 */
export type NavigateArgs<P extends RoutePath> =
  Record<string, never> extends RouteParams<P>
    ? [options?: NavigateToOptions<P>]
    : [options: NavigateToOptions<P>];

/** Same conditional tuple for `buildPath` / `createUrl`. */
export type BuildArgs<P extends RoutePath> =
  Record<string, never> extends RouteParams<P>
    ? [options?: BuildOptions<P>]
    : [options: BuildOptions<P>];
