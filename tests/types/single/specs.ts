/**
 * Type-level specs — single-entry Register (05-testing-strategy.md §Type-level).
 * These COMPILE-or-fail; `pnpm test:types` runs tsc over this folder.
 */
import { expectTypeOf } from 'expect-type';
import type {
  NavigateArgs,
  NavigateToOptions,
  RouteParams,
  RoutePath,
  RoutePathname,
  StaticRoutePath,
} from 'modernjs-typed-routes';

// --- RoutePath is the EXACT literal union --------------------------------

expectTypeOf<RoutePath>().toEqualTypeOf<
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

expectTypeOf<RoutePathname>().toEqualTypeOf<RoutePath>();

// @ts-expect-error — not a route
const invalidPath: RoutePath = '/nope';

// --- RouteParams per convention -------------------------------------------

expectTypeOf<RouteParams<'/blog/[id]'>>().toEqualTypeOf<{
  id: string | number;
}>();
expectTypeOf<RouteParams<'/users/[id$]'>>().toEqualTypeOf<{
  id?: string | number;
}>();
expectTypeOf<RouteParams<'/docs/$'>>().toEqualTypeOf<{ '*': string }>();
expectTypeOf<RouteParams<'/about'>>().toEqualTypeOf<{}>();

// --- StaticRoutePath: no required params (optional-only routes INCLUDED) ---

expectTypeOf<StaticRoutePath>().toEqualTypeOf<
  '/' | '/about' | '/blog' | '/login' | '/users/[id$]'
>();

// --- NavigateToOptions / NavigateArgs: conditional params requirement ------

declare function navigateTo<P extends RoutePath>(
  to: P,
  ...args: NavigateArgs<P>
): void;

navigateTo('/about');
navigateTo('/about', { searchParams: { ref: 'nav' }, hash: 'top' });
navigateTo('/users/[id$]');
navigateTo('/users/[id$]', { params: { id: 7 } });
navigateTo('/blog/[id]', { params: { id: 'slug' } });
navigateTo('/blog/[id]', {
  params: { id: 42 },
  searchParams: { ref: 'rss', page: 2, draft: true },
  hash: 'comments',
  replace: true,
  state: { from: 'home' },
});

// @ts-expect-error — params are REQUIRED for /blog/[id]
navigateTo('/blog/[id]');
// @ts-expect-error — params key missing in options
navigateTo('/blog/[id]', {});
// @ts-expect-error — wrong param name
navigateTo('/blog/[id]', { params: { slug: 42 } });
// @ts-expect-error — param value must be string | number
navigateTo('/blog/[id]', { params: { id: true } });

// options object shape
expectTypeOf<NavigateToOptions<'/blog/[id]'>>().toMatchTypeOf<{
  params: { id: string | number };
}>();
