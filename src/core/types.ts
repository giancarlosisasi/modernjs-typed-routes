/**
 * Internal model of the core generator.
 *
 * `core/` is PURE: no Modern.js imports, no fs access. The input node shape
 * is re-declared locally (instead of importing `@modern-js/types`) so any
 * producer that emits this shape can feed the generator — the D1 contingency.
 * Contract verified against @modern-js/app-tools 3.6.0 (spike, 2026-07-12).
 */

/** One dynamic parameter of a route, in order of appearance in the path. */
export type RouteParam = {
  name: string;
  /** `[id$]` / `:id?` — may be omitted when building a path. */
  optional: boolean;
  /** `$` / `*` — catch-all; its param key is literally `'*'`. */
  splat: boolean;
};

/** A single matchable route, fully resolved from the tree walk. */
export type RouteInfo = {
  /** Bracket-style key shown to users: `/blog/[id]`, `/docs/$`. */
  literalPath: string;
  /** React Router syntax: `/blog/:id`, `/docs/*`. */
  routerPath: string;
  params: RouteParam[];
  entryName: string;
  origin: 'file-system' | 'config';
};

/**
 * The subset of Modern.js's `NestedRouteForCli` the generator relies on.
 * Real nodes carry more fields (`_component`, sidecars, …) — they are
 * accepted and ignored. Notable facts (spike §Q3):
 * - `path` is RELATIVE to the parent and may span several segments
 *   (`users/:id?`, `user/profile/:id/edit`); absent on index routes and
 *   pathless layouts.
 * - `index: true` marks an index route; such nodes never have `path`.
 * - There is NO `params` field — params are derived from `path`.
 */
export type RouteNode = {
  type: 'nested';
  routeType: 'page' | 'layout';
  path?: string;
  index?: boolean;
  id?: string;
  isRoot?: boolean;
  origin: 'file-system' | 'config';
  children?: RouteNode[];
  _component?: string;
  data?: string;
  clientData?: string;
  error?: string;
  loading?: string;
  config?: string;
};

export type NormalizeOptions = {
  /**
   * Entry mount prefix (`serverRoutes[].urlPath`): `'/'` for the main entry,
   * `'/admin'` for a secondary entry. Prefixed onto every emitted path so
   * literals equal real URLs (D13).
   */
  basename?: string;
  /** Debug/diagnostic sink (e.g. duplicate-path dedupe notes). Pure core never touches the console. */
  onWarn?: (message: string) => void;
};

export type GeneratorOptions = {
  /** `true` emits `'/blog/[id]/'`-style keys. Default `false` (D10). */
  trailingSlash: boolean;
  /** Extra banner line(s) prepended to the generated file. */
  banner?: string;
};

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  trailingSlash: false,
};
