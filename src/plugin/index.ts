import path from 'node:path';
import type { AppTools, CliPlugin } from '@modern-js/app-tools';
import {
  type EntryRoutesInput,
  generateRouteTypes,
  type RouteNode,
} from '../core';
import { type RouteTypesPluginOptions, resolveOptions } from './options';
import { writeFileIfChanged } from './write';

export type { ResolvedPluginOptions, RouteTypesPluginOptions } from './options';
export { resolveOptions } from './options';

const LOG_PREFIX = '[modernjs-typed-routes]';

/**
 * Modern.js CLI plugin generating TypeScript route types from the parsed
 * file-system route tree. Options contract: docs/api/plugin-options.md.
 *
 * Options are validated eagerly (at config-evaluation time) so a typo fails
 * fast with a helpful message instead of silently generating to the wrong
 * place mid-build.
 */
export function routeTypesPlugin(
  options?: RouteTypesPluginOptions,
): CliPlugin<AppTools> {
  const resolved = resolveOptions(options);

  return {
    name: 'modernjs-typed-routes',
    setup(api) {
      // Latest tree per entry. The hook re-fires for ALL entries on any
      // route-shaping change (spike-findings §Q2), so treating each call as
      // "refresh this entry, then regenerate once the set is complete" is
      // idempotent — writeFileIfChanged makes redundant regenerations free.
      const treesByEntry = new Map<string, RouteNode[]>();

      const generate = () => {
        try {
          const ctx = api.getAppContext();
          const expected = (ctx.entrypoints ?? []).filter(
            (entrypoint) => entrypoint.nestedRoutesEntry,
          );
          if (expected.length === 0) return;
          const complete = expected.every((entrypoint) =>
            treesByEntry.has(entrypoint.entryName),
          );
          if (!complete) return; // wait for the remaining entries' hook calls

          const entries: EntryRoutesInput[] = expected.map((entrypoint) => {
            const serverRoute = ctx.serverRoutes?.find(
              (route) => route.entryName === entrypoint.entryName,
            );
            // serverRoutes is populated during prepare; fall back to the
            // documented mount convention if we ever run before it.
            const basename =
              serverRoute?.urlPath ??
              (entrypoint.isMainEntry ? '/' : `/${entrypoint.entryName}`);
            const routes = treesByEntry.get(entrypoint.entryName);
            return {
              entryName: entrypoint.entryName,
              basename,
              routes: routes ?? [],
            };
          });

          const source = generateRouteTypes(entries, {
            trailingSlash: resolved.trailingSlash,
            banner: resolved.banner,
            onWarn: (message) => console.warn(`${LOG_PREFIX} ${message}`),
          });

          const outFile = path.resolve(ctx.appDirectory, resolved.outFile);
          writeFileIfChanged(outFile, source);
        } catch (error) {
          // Never crash dev/build: log and leave the previous file in place
          // (docs/api/plugin-options.md §Behavior notes).
          console.error(
            `${LOG_PREFIX} failed to generate route types:`,
            error instanceof Error ? error.message : error,
          );
        }
      };

      api.modifyFileSystemRoutes(({ entrypoint, routes }) => {
        if (Array.isArray(routes)) {
          treesByEntry.set(entrypoint.entryName, routes as RouteNode[]);
          generate();
        }
        return { entrypoint, routes };
      });
    },
  };
}
