import type { AppTools, CliPlugin } from '@modern-js/app-tools';
import { type RouteTypesPluginOptions, resolveOptions } from './options';

export type { ResolvedPluginOptions, RouteTypesPluginOptions } from './options';
export { resolveOptions } from './options';

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
    setup() {
      // Generation pipeline (modifyFileSystemRoutes → core → write) lands in
      // task 2.2; the skeleton only proves loading + packaging.
      void resolved;
    },
  };
}
