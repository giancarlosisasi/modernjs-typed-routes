/**
 * Type-level specs — EMPTY Register (fresh install, before first generation).
 * Everything must degrade to plain strings and COMPILE — never error.
 * NOTE: this folder has NO register-fixture.d.ts on purpose.
 */
import { expectTypeOf } from 'expect-type';
import type {
  NavigateArgs,
  RegisterEntryName,
  RouteParams,
  RoutePath,
  StaticRoutePath,
} from 'modernjs-typed-routes';

expectTypeOf<RoutePath>().toEqualTypeOf<string>();
expectTypeOf<StaticRoutePath>().toEqualTypeOf<string>();

// no generation yet → no entries → entry names are `never`
expectTypeOf<RegisterEntryName>().toEqualTypeOf<never>();

// params degrade to a permissive record
expectTypeOf<RouteParams<'/anything'>>().toEqualTypeOf<
  Record<string, string | number>
>();

declare function navigateTo<P extends RoutePath>(
  to: P,
  ...args: NavigateArgs<P>
): void;

// plain strings work, params optional, options optional
navigateTo('/whatever');
navigateTo('/whatever/deep/path', { params: { id: 1 } });
navigateTo('/x', { searchParams: { q: 'a' }, hash: 'h' });
