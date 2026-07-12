/**
 * Typed drop-in for the router's `Link` (docs/api/runtime.md §Components).
 * Delegates to `@modern-js/runtime/router`'s Link — Modern.js's PrefetchLink —
 * so `prefetch`, `replace`, `state`, `reloadDocument`, … all pass through.
 */
import { Link as RouterLink } from '@modern-js/runtime/router';
import {
  type ComponentProps,
  forwardRef,
  type ReactElement,
  type Ref,
} from 'react';
import { toRouterPath, useBasename } from './basename';
import { buildPath } from './build-path';
import type {
  BaseBuildOptions,
  BuildArgs,
  RoutePath,
  WithParams,
} from './register';

type RouterLinkProps = ComponentProps<typeof RouterLink>;

export type LinkProps<P extends RoutePath> = Omit<RouterLinkProps, 'to'> & {
  to: P;
} & BaseBuildOptions &
  WithParams<P>;

type LooseLinkProps = Omit<RouterLinkProps, 'to'> &
  BaseBuildOptions & {
    to: RoutePath;
    params?: Record<string, string | number>;
  };

function LinkImpl(props: LooseLinkProps, ref: Ref<HTMLAnchorElement>) {
  const { to, params, searchParams, hash, ...rest } = props;
  // biome-ignore lint/correctness/useHookAtTopLevel: this IS a component — the (props, ref) signature (forwardRef render fn) just hides it from biome
  const basename = useBasename();
  const url = buildPath(
    to,
    ...([{ params, searchParams, hash }] as BuildArgs<RoutePath>),
  );
  return <RouterLink {...rest} ref={ref} to={toRouterPath(url, basename)} />;
}
LinkImpl.displayName = 'TypedLink';

// forwardRef erases generics — restore them with the standard cast so `to`
// keeps inferring the literal route (refs work on React 18, the peer floor).
export const Link = forwardRef(LinkImpl) as <P extends RoutePath>(
  props: LinkProps<P> & { ref?: Ref<HTMLAnchorElement> },
) => ReactElement;
