/**
 * `useTypedParams(path)` — the current match's params, typed by the route
 * you're in. Read-side values are always `string` (docs/api/runtime.md).
 * The path argument exists purely to select the type; it is not validated
 * against the live match at runtime.
 */
import { useParams } from '@modern-js/runtime/router';
import type { RoutePath, RouteReadParams } from './register';

export function useTypedParams<P extends RoutePath>(
  _path: P,
): RouteReadParams<P> {
  return useParams() as RouteReadParams<P>;
}
