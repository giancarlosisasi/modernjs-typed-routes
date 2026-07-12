/**
 * Options parsing/validation for `routeTypesPlugin()` — pure and unit-tested
 * apart from the Modern.js wiring. Contract: docs/api/plugin-options.md.
 */

export type RouteTypesPluginOptions = {
  /** Output path relative to the app root. Default `'src/routes.gen.d.ts'`. */
  outFile?: string;
  /** Emit `'/blog/[id]/'`-style keys and URLs. Default `false`. */
  trailingSlash?: boolean;
  /** Extra text appended to the generated file's header comment. */
  banner?: string;
};

export type ResolvedPluginOptions = {
  outFile: string;
  trailingSlash: boolean;
  banner: string | undefined;
};

const VALID_KEYS = ['outFile', 'trailingSlash', 'banner'] as const;

const fail = (message: string): never => {
  throw new Error(`[modernjs-typed-routes] ${message}`);
};

/** `path.isAbsolute` covering both posix and Windows, without importing node:path. */
const isAbsolutePath = (value: string): boolean =>
  value.startsWith('/') ||
  /^[A-Za-z]:[\\/]/.test(value) ||
  value.startsWith('\\\\');

export function resolveOptions(options: unknown = {}): ResolvedPluginOptions {
  if (
    typeof options !== 'object' ||
    options === null ||
    Array.isArray(options)
  ) {
    fail(
      `options must be an object, got ${Array.isArray(options) ? 'an array' : typeof options}.`,
    );
  }
  const record = options as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!(VALID_KEYS as readonly string[]).includes(key)) {
      fail(`Unknown option "${key}". Valid options: ${VALID_KEYS.join(', ')}.`);
    }
  }

  const {
    outFile = 'src/routes.gen.d.ts',
    trailingSlash = false,
    banner,
  } = record;

  if (typeof outFile !== 'string') fail('outFile must be a string.');
  if ((outFile as string).length === 0)
    fail('outFile must be a non-empty string.');
  if (isAbsolutePath(outFile as string)) {
    fail(
      `outFile must be a path relative to the app root, got "${outFile}". ` +
        `Example: 'src/routes.gen.d.ts'.`,
    );
  }
  if ((outFile as string).split(/[\\/]/)[0] === '..') {
    fail(`outFile must stay inside the app root, got "${outFile}".`);
  }
  if (typeof trailingSlash !== 'boolean')
    fail('trailingSlash must be a boolean.');
  if (banner !== undefined && typeof banner !== 'string')
    fail('banner must be a string.');

  return {
    outFile: outFile as string,
    trailingSlash: trailingSlash as boolean,
    banner: banner as string | undefined,
  };
}
