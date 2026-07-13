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
  type NavigateHelpers,
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
//
// The hook's helpers are the ONLY surface whose signature declaration emit has
// to synthesize rather than copy, so they are the ones that silently lost the
// `NavigateArgs`/`BuildArgs` rest-tuple in the shipped `.d.ts` (0.1.0). Every
// assertion here therefore matters twice: once against `src` (the machinery),
// once against `dist/index.d.ts` via `tsconfig.dist.json` (the artifact users
// actually resolve). Keep the whole matrix mirrored between the two helpers.

declare const nav: ReturnType<typeof useNavigate>;

// the hook's return type is the exported, explicitly-written alias — the
// annotation is what keeps the conditional alive through declaration emit
expectTypeOf<ReturnType<typeof useNavigate>>().toEqualTypeOf<NavigateHelpers>();

// navigateTo — static / optional-param routes need no options at all
nav.navigateTo('/about');
nav.navigateTo('/users/[id$]');
nav.navigateTo('/about', { searchParams: { ref: 'nav' }, hash: 'top' });
// navigateTo — required params, plus the router-only options
nav.navigateTo('/blog/[id]', { params: { id: 1 }, replace: true });
nav.navigateTo('/blog/[id]', { params: { id: 'slug' } });
nav.navigateTo('/users/[id$]', { params: { id: 7 } });
nav.navigateTo('/docs/$', { params: { '*': 'guide/advanced' } });
nav.navigateTo('/blog', { searchParams: { page: 2 }, state: { from: 'home' } });

// @ts-expect-error — the whole options object is REQUIRED for /blog/[id]
nav.navigateTo('/blog/[id]');
// @ts-expect-error — options present but `params` key missing
nav.navigateTo('/blog/[id]', {});
// @ts-expect-error — splat routes require their '*' param too
nav.navigateTo('/docs/$');
// @ts-expect-error — wrong param name
nav.navigateTo('/blog/[id]', { params: { slug: 42 } });
// @ts-expect-error — param values are string | number
nav.navigateTo('/blog/[id]', { params: { id: true } });
// @ts-expect-error — no params on a static route
nav.navigateTo('/about', { params: { id: 1 } });
// @ts-expect-error — not a route
nav.navigateTo('/nope');

// createUrl — same conditional rule, returns the built string
expectTypeOf(nav.createUrl('/about')).toBeString();
expectTypeOf(nav.createUrl('/blog/[id]', { params: { id: 42 } })).toBeString();
nav.createUrl('/users/[id$]');
nav.createUrl('/blog', { searchParams: { page: 2 }, hash: 'top' });

// @ts-expect-error — options object itself is REQUIRED
nav.createUrl('/blog/[id]');
// @ts-expect-error — options present but `params` key missing
nav.createUrl('/blog/[id]', {});
// @ts-expect-error — splat param required
nav.createUrl('/docs/$');
// @ts-expect-error — no params on a static route
nav.createUrl('/about', { params: { id: 1 } });
// @ts-expect-error — not a route
nav.createUrl('/nope');
// @ts-expect-error — createUrl has no router-only options (that's navigateTo)
nav.createUrl('/about', { replace: true });

nav.goBack();
// the raw escape hatch accepts anything React Router does
nav.originalNavigate(-1);
nav.originalNavigate('../sibling', { relative: 'path' });

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
