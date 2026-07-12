/**
 * Basename-aware URL massaging (D13 multi-entry + risk U3).
 *
 * Modern.js sets the client router basename to the entry's mount path for
 * secondary entries (`/admin`), or to the user's `runtime.router.basename`
 * when the entry is mounted at `/` (verified in
 * @modern-js/runtime router/runtime/plugin.js).
 *
 * Our generated keys carry the entry mount prefix, so:
 * - a built URL WITHIN the current basename must be stripped before handing
 *   it to the router (which joins the basename back on) — otherwise it
 *   doubles (`/admin/admin/users/3`);
 * - a built URL OUTSIDE the current basename is passed through unchanged, so
 *   custom-basename apps (unprefixed keys) get the router's own joining.
 *   Cross-entry jumps are full page loads by nature — same rule as vanilla
 *   Modern.js: use `reloadDocument` on `<Link>` or `window.location`.
 */
import { useHref } from '@modern-js/runtime/router';

const splitAtQueryOrHash = (url: string): [string, string] => {
  const at = url.search(/[?#]/);
  return at === -1 ? [url, ''] : [url.slice(0, at), url.slice(at)];
};

const normalizeBasename = (basename: string): string => {
  const trimmed = basename.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

export function isWithinBasename(url: string, basename: string): boolean {
  const base = normalizeBasename(basename);
  if (base === '/') return true;
  const [path] = splitAtQueryOrHash(url);
  return path === base || path.startsWith(`${base}/`);
}

/** URL to hand to the router (it joins the basename back on). */
export function toRouterPath(url: string, basename: string): string {
  const base = normalizeBasename(basename);
  if (base === '/' || !isWithinBasename(url, base)) return url;
  const [path, suffix] = splitAtQueryOrHash(url);
  return (path.slice(base.length) || '/') + suffix;
}

/** REAL browser URL (for `createUrl`): basename included exactly once. */
export function toRealUrl(url: string, basename: string): string {
  const base = normalizeBasename(basename);
  if (base === '/' || isWithinBasename(url, base)) return url;
  const [path, suffix] = splitAtQueryOrHash(url);
  return (path === '/' ? base : `${base}${path}`) + suffix;
}

/**
 * The active router basename. `useHref('/')` returns `basename` joined with
 * `'/'` — the same trick Modern.js's own PrefetchLink uses.
 */
export function useBasename(): string {
  return normalizeBasename(useHref('/'));
}
