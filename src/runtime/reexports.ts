/**
 * Single-import-source surface (docs/api/runtime.md §Re-exports): the full
 * `@modern-js/runtime/router` surface, with our typed `Link`, `Navigate` and
 * `useNavigate` shadowing the originals (explicit exports take precedence
 * over `export *` per ES module semantics).
 */
export * from '@modern-js/runtime/router';
export { buildPath } from './build-path';
export type { LinkProps } from './link';
export { Link } from './link';
export type { NavigateProps } from './navigate';
export { Navigate } from './navigate';
export { useNavigate } from './use-navigate';
export { useTypedParams } from './use-typed-params';
