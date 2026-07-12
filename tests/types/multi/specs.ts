/**
 * Type-level specs — multi-entry Register (D13 per-entry isolation).
 * Design (finalized here from the spike evidence + docs contract):
 * - plain `RoutePath` = union across ALL entries (keys carry the mount
 *   prefix, so every literal is a real URL; cross-entry jumps still need
 *   `buildPath` + plain anchor/`window.location` — docs §Cross-entry);
 * - `EntryRoutePath<'admin'>` & `EntryRouteParams<…>` give the isolation
 *   promised in docs/guide/route-conventions.md §Multi-entry apps.
 */
import { expectTypeOf } from 'expect-type';
import type {
  EntryRouteParams,
  EntryRoutePath,
  NavigateArgs,
  RegisterEntryName,
  RouteParams,
  RoutePath,
  StaticRoutePath,
} from 'modernjs-typed-routes';

// --- entry names ------------------------------------------------------------

expectTypeOf<RegisterEntryName>().toEqualTypeOf<'admin' | 'index'>();

// --- plain RoutePath = union across entries (prefixed, unambiguous) ---------

expectTypeOf<RoutePath>().toEqualTypeOf<
  | '/admin'
  | '/admin/users/[userId]'
  | '/'
  | '/$'
  | '/about'
  | '/blog'
  | '/blog/[id]'
  | '/docs/$'
  | '/login'
  | '/promo/[code]'
  | '/user/profile/[id]/edit'
  | '/users/[id$]'
>();

// --- params resolve across entries ------------------------------------------

expectTypeOf<RouteParams<'/admin/users/[userId]'>>().toEqualTypeOf<{
  userId: string | number;
}>();
expectTypeOf<RouteParams<'/blog/[id]'>>().toEqualTypeOf<{
  id: string | number;
}>();

// --- StaticRoutePath spans entries -------------------------------------------

expectTypeOf<StaticRoutePath>().toEqualTypeOf<
  '/admin' | '/' | '/about' | '/blog' | '/login' | '/users/[id$]'
>();

// --- entry-scoped isolation (D13) ---------------------------------------------

expectTypeOf<EntryRoutePath<'admin'>>().toEqualTypeOf<
  '/admin' | '/admin/users/[userId]'
>();
expectTypeOf<
  EntryRouteParams<'admin', '/admin/users/[userId]'>
>().toEqualTypeOf<{
  userId: string | number;
}>();

// @ts-expect-error — an index-entry route never leaks into the admin scope
const leaked: EntryRoutePath<'admin'> = '/blog/[id]';
// @ts-expect-error — unknown entry name
type Bad = EntryRoutePath<'nope'>;

// --- conditional params still hold across entries ------------------------------

declare function navigateTo<P extends RoutePath>(
  to: P,
  ...args: NavigateArgs<P>
): void;

navigateTo('/admin');
navigateTo('/admin/users/[userId]', { params: { userId: 3 } });
// @ts-expect-error — params required
navigateTo('/admin/users/[userId]');
