import { type EmitEntry, emitRegister } from './emit';
import { normalize } from './normalize';
import type { GeneratorOptions, RouteNode } from './types';

/** One entry's raw input, exactly as the plugin layer collects it from Modern.js. */
export type EntryRoutesInput = {
  entryName: string;
  /** Entry mount prefix (`serverRoutes[].urlPath`): `'/'` for the main entry. */
  basename: string;
  /** The tree delivered by `modifyFileSystemRoutes` for this entry. */
  routes: RouteNode[];
};

export type GenerateRouteTypesOptions = Partial<GeneratorOptions> & {
  /** Diagnostic sink for normalize notes (duplicate-path dedupe, …). */
  onWarn?: (message: string) => void;
};

/**
 * The single core entrypoint Phase 2 (the CLI plugin) calls:
 * raw per-entry trees in → complete `.d.ts` source string out.
 */
export function generateRouteTypes(
  entries: EntryRoutesInput[],
  options: GenerateRouteTypesOptions = {},
): string {
  const { onWarn, ...generatorOptions } = options;

  const emitted: EmitEntry[] = entries.map((entry) => ({
    entryName: entry.entryName,
    basename: entry.basename,
    routes: normalize(entry.routes, entry.entryName, {
      basename: entry.basename,
      onWarn,
    }),
  }));

  return emitRegister(emitted, generatorOptions);
}

export { type EmitEntry, emit, emitRegister } from './emit';
export { normalize, UnsupportedLegacyRoutesError } from './normalize';
export * from './types';
