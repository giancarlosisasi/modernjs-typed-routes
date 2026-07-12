/**
 * Pure URL builder — the only nontrivial runtime logic. Isomorphic by
 * contract: safe in data loaders, tests and Node (docs/api/runtime.md).
 *
 * Interprets the generated route-key syntax:
 * - `[name]`  required param  → substituted, value URL-encoded
 * - `[name$]` optional param  → substituted when present, segment dropped when
 *   absent (no `//` is ever produced)
 * - `$`       splat           → the `'*'` param; slashes survive, each piece
 *   is URL-encoded individually; absent → segment dropped
 * - a trailing `/` on the key (trailingSlash mode) is preserved on the built
 *   URL, before `?`/`#`
 *
 * Runtime misuse (JS consumers): a missing required param THROWS naming the
 * param and the path — a broken URL in production is worse than an early,
 * precise error (documented in docs/api/runtime.md).
 */
import type { BuildArgs, RoutePath, SearchParamsInit } from './register';

type AnyParams = Record<string, string | number | undefined>;

type LooseBuildOptions = {
  params?: AnyParams;
  searchParams?: SearchParamsInit;
  hash?: string;
};

const OPTIONAL_TOKEN = /^\[(.+)\$\]$/;
const REQUIRED_TOKEN = /^\[(.+)\]$/;

/**
 * `''` counts as ABSENT everywhere (like `undefined`/`null`): substituting it
 * would produce a `//` URL that can never match — optional/splat segments
 * drop, required params throw instead.
 */
const isAbsent = (value: unknown): value is undefined | null | '' =>
  value === undefined || value === null || value === '';

function substituteSegment(
  segment: string,
  params: AnyParams,
  path: string,
): string | null {
  if (segment === '$') {
    const splat = params['*'];
    if (isAbsent(splat)) return null;
    // Leading slashes would also create `//` — normalize them away.
    const pieces = String(splat).split('/').filter(Boolean);
    return pieces.length === 0
      ? null
      : pieces.map(encodeURIComponent).join('/');
  }

  const optional = OPTIONAL_TOKEN.exec(segment);
  if (optional) {
    const value = params[optional[1] as string];
    if (isAbsent(value)) return null;
    return encodeURIComponent(String(value));
  }

  const required = REQUIRED_TOKEN.exec(segment);
  if (required) {
    const name = required[1] as string;
    const value = params[name];
    if (isAbsent(value)) {
      throw new Error(
        `[modernjs-typed-routes] Missing required param "${name}" for path "${path}".`,
      );
    }
    return encodeURIComponent(String(value));
  }

  return segment;
}

function serializeSearchParams(searchParams: SearchParamsInit): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null) continue;
    query.append(key, String(value));
  }
  return query.toString();
}

/**
 * `buildPath('/blog/[id]', { params: { id: 42 }, searchParams: { ref: 'rss' }, hash: 'top' })`
 * → `'/blog/42?ref=rss#top'`
 */
export function buildPath<P extends RoutePath>(
  path: P,
  ...args: BuildArgs<P>
): string {
  const {
    params = {},
    searchParams,
    hash,
  } = (args[0] ?? {}) as LooseBuildOptions;

  const wantsTrailingSlash = path.length > 1 && path.endsWith('/');
  const base = wantsTrailingSlash ? path.slice(0, -1) : path;

  const built = base
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => substituteSegment(segment, params, path))
    .filter((segment): segment is string => segment !== null)
    .join('/');

  let url = `/${built}`;
  if (wantsTrailingSlash && url !== '/') url += '/';

  if (searchParams) {
    const query = serializeSearchParams(searchParams);
    if (query !== '') url += `?${query}`;
  }

  if (hash !== undefined && hash !== '' && hash !== '#') {
    url += hash.startsWith('#') ? hash : `#${hash}`;
  }

  return url;
}
