/**
 * Fluent builders for `RouteNode` trees. They produce nodes structurally
 * identical to what `modifyFileSystemRoutes` delivers at 3.6.0 (anchored by
 * tree.test.ts comparing builder output against the literal spike fixture) —
 * only the fields a real node carries, nothing idealized.
 */
import type { RouteNode } from '../../../src/core/types';

type LayoutExtras = Partial<
  Pick<RouteNode, 'error' | 'loading' | 'config' | 'origin'>
>;

/** The entry's root layout: `path: '/'`, `isRoot: true`. */
export function rootLayout(
  id: string,
  component: string,
  children: RouteNode[],
): RouteNode {
  return {
    path: '/',
    children,
    isRoot: true,
    origin: 'file-system',
    _component: component,
    id,
    type: 'nested',
    routeType: 'layout',
  };
}

/** A nested layout. Omit `path` for pathless (`__x`) layouts. */
export function layout(
  id: string,
  component: string,
  children: RouteNode[],
  opts: { path?: string } & LayoutExtras = {},
): RouteNode {
  const { path, ...extras } = opts;
  return {
    ...(path !== undefined && { path }),
    children,
    isRoot: false,
    origin: 'file-system',
    _component: component,
    id,
    type: 'nested',
    routeType: 'layout',
    ...extras,
  };
}

/** An index route (`page.tsx` beside its layout): `index: true`, never a `path`. */
export function indexPage(
  id: string,
  component: string,
  opts: Partial<Pick<RouteNode, 'data' | 'clientData'>> = {},
): RouteNode {
  return {
    _component: component,
    index: true,
    routeType: 'page',
    id,
    type: 'nested',
    origin: 'file-system',
    ...opts,
  };
}

/** A page with a (parent-relative, possibly multi-segment) path — includes splats (`path: '*'`). */
export function page(id: string, component: string, path: string): RouteNode {
  return {
    _component: component,
    routeType: 'page',
    id,
    type: 'nested',
    origin: 'file-system',
    path,
  };
}

/** A page contributed by `modern.routes.ts` (`origin: 'config'`). */
export function configPage(
  id: string,
  component: string,
  path: string,
): RouteNode {
  return {
    path,
    routeType: 'page',
    origin: 'config',
    type: 'nested',
    id,
    _component: component,
  };
}
