import type {
  NormalizeOptions,
  RouteInfo,
  RouteNode,
  RouteParam,
} from './types';

/** Thrown when the tree is not the v3 nested-routes shape (e.g. legacy `pages/`). */
export class UnsupportedLegacyRoutesError extends Error {
  constructor(entryName: string) {
    super(
      `Entry "${entryName}" does not use nested file-based routes. ` +
        'modernjs-typed-routes supports Modern.js v3 conventional routing ' +
        '(the routes/ directory) only — legacy pages/ routing is out of scope.',
    );
    this.name = 'UnsupportedLegacyRoutesError';
  }
}

/** `:id` → `[id]`, `:id?` → `[id$]`, `*` → `$`; static segments pass through. */
function toLiteralSegment(segment: string): string {
  if (segment === '*') return '$';
  if (segment.startsWith(':')) {
    return segment.endsWith('?')
      ? `[${segment.slice(1, -1)}$]`
      : `[${segment.slice(1)}]`;
  }
  return segment;
}

function toParam(segment: string): RouteParam | null {
  if (segment === '*') return { name: '*', optional: false, splat: true };
  if (segment.startsWith(':')) {
    const optional = segment.endsWith('?');
    return {
      name: optional ? segment.slice(1, -1) : segment.slice(1),
      optional,
      splat: false,
    };
  }
  return null;
}

const segmentsOf = (path: string): string[] => path.split('/').filter(Boolean);

/**
 * Walks one entry's parsed route tree into a flat `RouteInfo[]`:
 * - only `routeType: 'page'` nodes become routes (layouts contribute segments;
 *   pathless `__x` layouts contribute nothing);
 * - node paths are parent-relative and may span several segments;
 * - index routes (`index: true`) resolve to the accumulated parent path;
 * - `options.basename` (the entry's mount prefix) is prepended to every path;
 * - duplicate paths dedupe last-wins (reported via `options.onWarn`);
 * - output is sorted by `literalPath` for determinism.
 *
 * See 02-architecture.md §Normalization rules and spike-findings.md §Q3.
 */
export function normalize(
  routes: RouteNode[],
  entryName: string,
  options: NormalizeOptions = {},
): RouteInfo[] {
  const { basename = '/', onWarn } = options;

  if (routes.some((node) => node.type !== 'nested')) {
    throw new UnsupportedLegacyRoutesError(entryName);
  }

  const baseSegments = segmentsOf(basename);
  const byLiteralPath = new Map<string, RouteInfo>();

  const addRoute = (segments: string[], origin: RouteInfo['origin']) => {
    const all = [...baseSegments, ...segments];
    const literalPath = `/${all.map(toLiteralSegment).join('/')}`;
    const routerPath = `/${all.join('/')}`;
    const params = all
      .map(toParam)
      .filter((param): param is RouteParam => param !== null);

    if (byLiteralPath.has(literalPath)) {
      onWarn?.(
        `Duplicate route path "${literalPath}" in entry "${entryName}" — ` +
          `keeping the last definition (origin: ${origin}).`,
      );
    }
    byLiteralPath.set(literalPath, {
      literalPath,
      routerPath,
      params,
      entryName,
      origin,
    });
  };

  const walk = (node: RouteNode, parentSegments: string[]) => {
    const segments = node.path
      ? [...parentSegments, ...segmentsOf(node.path)]
      : parentSegments;

    if (node.routeType === 'page') {
      addRoute(segments, node.origin);
      return;
    }
    for (const child of node.children ?? []) {
      walk(child, segments);
    }
  };

  for (const node of routes) {
    walk(node, []);
  }

  return [...byLiteralPath.values()].sort((a, b) =>
    a.literalPath < b.literalPath ? -1 : a.literalPath > b.literalPath ? 1 : 0,
  );
}
