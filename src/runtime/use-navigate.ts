/**
 * `useNavigate()` — returns an object of helpers, not a bare function
 * (docs/api/runtime.md §Hooks, docs/guide/navigation.md).
 *
 * The documented `navigateTo(to, options?)` surface is implemented with the
 * `NavigateArgs<P>` rest-tuple so the options object is REQUIRED exactly when
 * the route has required params (D8) — same public ergonomics.
 */
import { useNavigate as useRouterNavigate } from '@modern-js/runtime/router';
import { useCallback, useMemo } from 'react';
import { toRealUrl, toRouterPath, useBasename } from './basename';
import { buildPath } from './build-path';
import type {
  BuildArgs,
  NavigateArgs,
  RoutePath,
  SearchParamsInit,
} from './register';

type LooseNavigateOptions = {
  params?: Record<string, string | number>;
  searchParams?: SearchParamsInit;
  hash?: string;
  replace?: boolean;
  state?: unknown;
};

export function useNavigate() {
  const originalNavigate = useRouterNavigate();
  const basename = useBasename();

  const navigateTo = useCallback(
    <P extends RoutePath>(to: P, ...args: NavigateArgs<P>): void => {
      const { replace, state, ...build } = (args[0] ??
        {}) as LooseNavigateOptions;
      const url = buildPath(to, ...([build] as BuildArgs<RoutePath>));
      originalNavigate(toRouterPath(url, basename), { replace, state });
    },
    [originalNavigate, basename],
  );

  const createUrl = useCallback(
    <P extends RoutePath>(to: P, ...args: BuildArgs<P>): string =>
      toRealUrl(buildPath(to, ...args), basename),
    [basename],
  );

  const goBack = useCallback((): void => {
    originalNavigate(-1);
  }, [originalNavigate]);

  return useMemo(
    () => ({ navigateTo, createUrl, goBack, originalNavigate }),
    [navigateTo, createUrl, goBack, originalNavigate],
  );
}
