/**
 * Typed drop-in for the router's `Navigate` (docs/api/runtime.md §Components):
 * same typing as `Link`; `replace`, `state`, `relative` pass through.
 */
import { Navigate as RouterNavigate } from '@modern-js/runtime/router';
import type { ComponentProps, ReactElement } from 'react';
import { toRouterPath, useBasename } from './basename';
import { buildPath } from './build-path';
import type {
  BaseBuildOptions,
  BuildArgs,
  RoutePath,
  WithParams,
} from './register';

type RouterNavigateProps = ComponentProps<typeof RouterNavigate>;

export type NavigateProps<P extends RoutePath> = Omit<
  RouterNavigateProps,
  'to'
> & {
  to: P;
} & BaseBuildOptions &
  WithParams<P>;

type LooseNavigateProps = Omit<RouterNavigateProps, 'to'> &
  BaseBuildOptions & {
    to: RoutePath;
    params?: Record<string, string | number>;
  };

export function Navigate<P extends RoutePath>(
  props: NavigateProps<P>,
): ReactElement {
  const { to, params, searchParams, hash, ...rest } =
    props as LooseNavigateProps;
  const basename = useBasename();
  const url = buildPath(
    to,
    ...([{ params, searchParams, hash }] as BuildArgs<RoutePath>),
  );
  return <RouterNavigate {...rest} to={toRouterPath(url, basename)} />;
}
Navigate.displayName = 'TypedNavigate';
