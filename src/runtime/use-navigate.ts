/**
 * `useNavigate()` — returns an object of helpers, not a bare function
 * (docs/api/runtime.md §Hooks, docs/guide/navigation.md).
 *
 * The documented `navigateTo(to, options?)` surface is implemented with the
 * `NavigateArgs<P>` rest-tuple so the options object is REQUIRED exactly when
 * the route has required params (D8) — same public ergonomics.
 */
import type { NavigateFunction } from '@modern-js/runtime/router';
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

/**
 * Return type of {@link useNavigate} — written out EXPLICITLY on purpose.
 *
 * With an inferred return type, declaration emit has to synthesize these
 * signatures, and synthesizing expands a rest parameter whose type is a
 * concrete tuple. Inside this package `Register` is empty, so `NavigateArgs<P>`
 * is no longer deferred (its check type holds no `P`) and eagerly resolves to
 * the permissive `[options?: …]` branch — which the emitter then flattens into
 * `options?: NavigateToOptions<P>` in the `.d.ts`. That silently drops the
 * conditional forever: consumers augment `Register` too late, because the
 * shipped declaration no longer HAS a conditional to re-evaluate, and
 * `navigateTo('/blog/[id]')` compiles with no params (bug found via the
 * playground, 2026-07-13).
 *
 * Annotating the return type makes declaration emit COPY this alias by name and
 * emit `...args: NavigateArgs<P>` verbatim, so the conditional survives into the
 * `.d.ts` and re-runs against the consumer's `Register`. `tests/types/*` run the
 * same specs against BOTH `src` and the built `dist/index.d.ts` to pin this.
 */
export type NavigateHelpers = {
  navigateTo: <P extends RoutePath>(to: P, ...args: NavigateArgs<P>) => void;
  createUrl: <P extends RoutePath>(to: P, ...args: BuildArgs<P>) => string;
  goBack: () => void;
  originalNavigate: NavigateFunction;
};

export function useNavigate(): NavigateHelpers {
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
