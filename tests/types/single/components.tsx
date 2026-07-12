/**
 * Type-level specs for the component/hook surfaces (task 3.3 step 4):
 * `params` conditionally required/optional per route kind, `buildPath`
 * rest-tuple, `useTypedParams` read-side types.
 */
import { expectTypeOf } from 'expect-type';
import {
  buildPath,
  Link,
  Navigate,
  type useNavigate,
  type useTypedParams,
} from 'modernjs-typed-routes';

// --- <Link>: params required / optional / forbidden-extra per route kind ---

<Link to="/about">About</Link>;
<Link to="/blog/[id]" params={{ id: 42 }}>
  Post
</Link>;
<Link to="/blog/[id]" params={{ id: 'slug' }}>
  Post
</Link>;
<Link to="/users/[id$]">Users</Link>;
<Link to="/users/[id$]" params={{ id: 7 }}>
  User 7
</Link>;
<Link to="/docs/$" params={{ '*': 'guide/advanced' }}>
  Docs
</Link>;
<Link to="/blog" searchParams={{ page: 2, tag: 'dx' }} hash="comments">
  P2
</Link>;

// Router props pass through untouched.
<Link to="/about" replace reloadDocument state={{ from: 'spec' }}>
  About
</Link>;

// @ts-expect-error — params are REQUIRED for /blog/[id]
<Link to="/blog/[id]">Post</Link>;
// @ts-expect-error — wrong param name
<Link to="/blog/[id]" params={{ slug: 42 }}>
  Post
</Link>;
// @ts-expect-error — extra params on a static route
<Link to="/about" params={{ id: 1 }}>
  About
</Link>;
// @ts-expect-error — not a route
<Link to="/nope">Nope</Link>;

// --- <Navigate>: same typing over the router's Navigate ---------------------

<Navigate to="/blog/[id]" params={{ id: 1 }} replace />;
<Navigate to="/about" searchParams={{ r: 'x' }} hash="top" />;
// @ts-expect-error — params are REQUIRED for /blog/[id]
<Navigate to="/blog/[id]" />;

// --- buildPath: BuildArgs conditional rest-tuple -----------------------------

buildPath('/about');
buildPath('/about', { searchParams: { ref: 'rss' }, hash: 'top' });
buildPath('/users/[id$]');
buildPath('/blog/[id]', { params: { id: 42 } });
expectTypeOf(buildPath('/blog/[id]', { params: { id: 42 } })).toBeString();

// @ts-expect-error — options REQUIRED when the route has required params
buildPath('/blog/[id]');
// @ts-expect-error — params key missing
buildPath('/blog/[id]', {});
// @ts-expect-error — not a route
buildPath('/nope');

// --- useNavigate: helpers keep the conditional params rule ------------------

declare const nav: ReturnType<typeof useNavigate>;
nav.navigateTo('/about');
nav.navigateTo('/blog/[id]', { params: { id: 1 }, replace: true });
expectTypeOf(nav.createUrl('/about')).toBeString();
nav.goBack();
// the raw escape hatch accepts anything React Router does
nav.originalNavigate(-1);
nav.originalNavigate('../sibling', { relative: 'path' });
// @ts-expect-error — params are REQUIRED for /blog/[id]
nav.navigateTo('/blog/[id]');
// @ts-expect-error — options object itself is REQUIRED
nav.createUrl('/blog/[id]');

// --- useTypedParams: read-side values are always string ----------------------

// instantiation expressions — no hook is actually called in this tsc-only file
expectTypeOf<ReturnType<typeof useTypedParams<'/blog/[id]'>>>().toEqualTypeOf<{
  id: string;
}>();
expectTypeOf<
  ReturnType<typeof useTypedParams<'/users/[id$]'>>
>().toEqualTypeOf<{ id?: string }>();
expectTypeOf<ReturnType<typeof useTypedParams<'/docs/$'>>>().toEqualTypeOf<{
  '*': string;
}>();
