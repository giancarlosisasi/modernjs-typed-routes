import { createRequire } from 'node:module';
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

      /**
       * Regenerates the output from the accumulated trees. Returns stats on
       * success, `undefined` when skipped (incomplete set) or failed.
       * `throwOnError` is used by the `typegen` command (CI wants exit 1);
       * dev/build NEVER crash (docs §Behavior notes).
       */
      const generate = (throwOnError = false) => {
        try {
          const ctx = api.getAppContext();
          const expected = (ctx.entrypoints ?? []).filter(
            (entrypoint) => entrypoint.nestedRoutesEntry,
          );
          if (expected.length === 0) return undefined;
          const complete = expected.every((entrypoint) =>
            treesByEntry.has(entrypoint.entryName),
          );
          if (!complete) return undefined; // wait for the remaining entries' hook calls

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
          const written = writeFileIfChanged(outFile, source);
          const routeCount = (source.match(/': { params:/g) ?? []).length;
          return { written, routeCount, outFile };
        } catch (error) {
          if (throwOnError) throw error;
          // Never crash dev/build: log and leave the previous file in place
          // (docs/api/plugin-options.md §Behavior notes).
          console.error(
            `${LOG_PREFIX} failed to generate route types:`,
            error instanceof Error ? error.message : error,
          );
          return undefined;
        }
      };

      // Watch strategy (spike-findings §Watch): the hook re-fires by itself
      // on every route-shaping change — no addWatchFiles/onFileChanged
      // needed. Bursts (save-all, git checkout) cause repeated cheap
      // regenerations; only content changes reach the disk.
      api.modifyFileSystemRoutes(({ entrypoint, routes }) => {
        if (Array.isArray(routes)) {
          treesByEntry.set(entrypoint.entryName, routes as RouteNode[]);
          generate();
        }
        return { entrypoint, routes };
      });

      // `npx modern typegen` — generate once, no dev server/build (CI).
      // Custom commands never get routes parsed automatically (spike §Q5),
      // so parse each entry exactly like `modern routes` does, through the
      // app's own @modern-js/runtime copy (deep import — the only internal
      // touchpoint; guarded, with `modern build` as the documented fallback).
      api.addCommand(({ program }) => {
        program
          .command('typegen')
          .description(
            'generate typed-route declarations (modernjs-typed-routes)',
          )
          .action(async () => {
            try {
              const ctx = api.getAppContext();
              const requireFromApp = createRequire(
                path.join(ctx.appDirectory, 'noop.js'),
              );
              const runtimePkg = requireFromApp.resolve(
                '@modern-js/runtime/package.json',
              );
              const routerCli = requireFromApp(
                path.join(
                  path.dirname(runtimePkg),
                  'dist/cjs/router/cli/code/index.js',
                ),
              ) as {
                generateRoutesForEntry: (
                  entrypoint: unknown,
                  appContext: unknown,
                ) => Promise<RouteNode[]>;
              };

              const expected = (ctx.entrypoints ?? []).filter(
                (entrypoint) => entrypoint.nestedRoutesEntry,
              );
              for (const entrypoint of expected) {
                const routes = await routerCli.generateRoutesForEntry(
                  entrypoint,
                  ctx,
                );
                treesByEntry.set(entrypoint.entryName, routes);
              }

              const stats = generate(true);
              if (!stats) {
                throw new Error(
                  'no conventional-routing entries found (routes/ directory).',
                );
              }
              console.log(
                `${LOG_PREFIX} ${stats.routeCount} routes → ${path.relative(
                  ctx.appDirectory,
                  stats.outFile,
                )}${stats.written ? '' : ' (unchanged)'}`,
              );
            } catch (error) {
              console.error(
                `${LOG_PREFIX} typegen failed:`,
                error instanceof Error ? error.message : error,
              );
              console.error(
                `${LOG_PREFIX} fallback: run \`modern build\` (or \`modern dev\`) to regenerate types.`,
              );
              process.exit(1);
            }
          });
      });
    },
  };
}
