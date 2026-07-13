/**
 * Deterministic synthetic route fixtures for the benchmarks.
 *
 * One "spec" = one matchable route. The kind cycle covers every
 * file-convention route type (docs/guide/route-conventions.md): static, deep
 * static, dynamic `[id]`, multi-param, optional `[id$]`, catch-all `$`,
 * pathless `__group` layouts, section layouts with index pages, flat
 * `a.b.[c]` directories, and `page.data.ts` sidecars. Config routes
 * (`modern.routes.ts`) are not synthesized; per-node generation cost is
 * identical.
 *
 * The same specs drive both benches:
 * - `buildRouteTree()` — the parsed `RouteNode[]` shape the plugin receives
 *   from `modifyFileSystemRoutes` (bench-core, no Modern.js involved);
 * - `writeRouteFiles()` — real files on disk for the real CLI (bench-e2e).
 * Everything is derived from the index, so every run recreates the exact
 * same fixture.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const KINDS = 10;

/** `items-3/:id` → `['items-3', ':id']` etc. */
const segmentsOf = (routerPath) => routerPath.split('/').filter(Boolean);

const toLiteralSegment = (segment) => {
  if (segment === '*') return '$';
  if (segment.startsWith(':')) {
    return segment.endsWith('?')
      ? `[${segment.slice(1, -1)}$]`
      : `[${segment.slice(1)}]`;
  }
  return segment;
};

const literalPathOf = (routerPath) =>
  `/${segmentsOf(routerPath).map(toLiteralSegment).join('/')}`;

/**
 * Builds the deterministic spec list. `count` is the number of matchable
 * routes INCLUDING the root index page (so 500 → root `/` + 499 specs).
 */
export function makeRouteSpecs(count, variant = 0) {
  const specs = [];
  for (let i = 0; i < count - 1; i++) {
    specs.push(makeSpec(i, variant));
  }
  return specs;
}

function makeSpec(i, variant) {
  const kind = i % KINDS;
  switch (kind) {
    case 0: {
      // Static leaf. Variant salt lands here so the "cold" bench can flip
      // one route name between fires and force a real rewrite.
      const name = i === 0 && variant > 0 ? `s0-v${variant}` : `s${i}`;
      return leafSpec(kind, `static/${name}`, `static/${name}`, {
        typedLink: true,
      });
    }
    case 1:
      return leafSpec(kind, `deep/d${i}/x/y`, `deep/d${i}/x/y`, {
        typedNavigate: true,
      });
    case 2:
      return leafSpec(kind, `items-${i}/[id]`, `items-${i}/:id`);
    case 3:
      return leafSpec(
        kind,
        `catalog-${i}/[category]/[itemId]`,
        `catalog-${i}/:category/:itemId`,
      );
    case 4:
      return leafSpec(kind, `opt-${i}/[lang$]`, `opt-${i}/:lang?`);
    case 5:
      // Catch-all: a literal `$.tsx` file, not a directory.
      return {
        kind,
        routerPath: `files-${i}/*`,
        literalPath: `/files-${i}/$`,
        files: [
          { relPath: `files-${i}/$.tsx`, content: pageContent(`Splat${i}`) },
        ],
      };
    case 6:
      // Pathless layout group: contributes no URL segment.
      return {
        kind,
        routerPath: `inside-${i}`,
        literalPath: `/inside-${i}`,
        pathless: true,
        files: [
          { relPath: `__grp-${i}/layout.tsx`, content: layoutContent() },
          {
            relPath: `__grp-${i}/inside-${i}/page.tsx`,
            content: pageContent(`Grouped${i}`),
          },
        ],
      };
    case 7:
      // Section layout + index page under it.
      return {
        kind,
        routerPath: `sec-${i}`,
        literalPath: `/sec-${i}`,
        sectionIndex: true,
        files: [
          { relPath: `sec-${i}/layout.tsx`, content: layoutContent() },
          { relPath: `sec-${i}/page.tsx`, content: pageContent(`Section${i}`) },
        ],
      };
    case 8:
      // Flat directory naming: `flat.f8.[fid]` ≡ `flat/f8/[fid]`.
      return {
        kind,
        routerPath: `flat/f${i}/:fid`,
        literalPath: `/flat/f${i}/[fid]`,
        files: [
          {
            relPath: `flat.f${i}.[fid]/page.tsx`,
            content: pageContent(`Flat${i}`),
          },
        ],
      };
    default:
      // 9 — nested dynamic with a `page.data.ts` loader sidecar (the case
      // that makes Modern.js's own walker run SWC per file).
      return {
        kind,
        routerPath: `mix-${i}/:id/settings`,
        literalPath: `/mix-${i}/[id]/settings`,
        files: [
          {
            relPath: `mix-${i}/[id]/settings/page.tsx`,
            content: pageContent(`Mix${i}`),
          },
          {
            relPath: `mix-${i}/[id]/settings/page.data.ts`,
            content: 'export const loader = () => ({ ok: true });\n',
          },
        ],
      };
  }
}

function leafSpec(kind, dirPath, routerPath, extras = {}) {
  const name = `K${kind}P${dirPath.replace(/[^a-zA-Z0-9]/g, '')}`;
  let content;
  if (extras.typedLink) {
    // Static routes exercise the typed runtime API (valid with an empty
    // AND a populated Register — no params needed).
    content = [
      "import { Link } from 'modernjs-typed-routes';",
      '',
      `export default function ${name}() {`,
      `  return <Link to="${literalPathOf(routerPath)}">self</Link>;`,
      '}',
      '',
    ].join('\n');
  } else if (extras.typedNavigate) {
    content = [
      "import { useNavigate } from 'modernjs-typed-routes';",
      '',
      `export default function ${name}() {`,
      '  const nav = useNavigate();',
      '  return (',
      '    <button',
      '      type="button"',
      `      onClick={() => nav.navigateTo('${literalPathOf(routerPath)}')}`,
      '    >',
      '      go',
      '    </button>',
      '  );',
      '}',
      '',
    ].join('\n');
  } else {
    content = pageContent(name);
  }
  return {
    kind,
    routerPath,
    literalPath: literalPathOf(routerPath),
    files: [{ relPath: `${dirPath}/page.tsx`, content }],
  };
}

const pageContent = (name) =>
  `export default function ${name}() {\n  return <div>${name}</div>;\n}\n`;

const layoutContent = () =>
  [
    "import { Outlet } from '@modern-js/runtime/router';",
    '',
    'export default function Layout() {',
    '  return <Outlet />;',
    '}',
    '',
  ].join('\n');

/**
 * The parsed-tree twin of the fixture: the exact `RouteNode[]` shape the
 * plugin's `modifyFileSystemRoutes` hook receives (root layout wrapping
 * pages, layouts, pathless groups, index routes; parent-relative,
 * possibly multi-segment `path`s in React Router syntax).
 */
export function buildRouteTree(count, variant = 0) {
  const children = [
    { type: 'nested', routeType: 'page', index: true, origin: 'file-system' },
  ];
  for (const spec of makeRouteSpecs(count, variant)) {
    if (spec.pathless) {
      children.push({
        type: 'nested',
        routeType: 'layout',
        origin: 'file-system',
        children: [
          {
            type: 'nested',
            routeType: 'page',
            path: spec.routerPath,
            origin: 'file-system',
          },
        ],
      });
    } else if (spec.sectionIndex) {
      children.push({
        type: 'nested',
        routeType: 'layout',
        path: spec.routerPath,
        origin: 'file-system',
        children: [
          {
            type: 'nested',
            routeType: 'page',
            index: true,
            origin: 'file-system',
          },
        ],
      });
    } else {
      children.push({
        type: 'nested',
        routeType: 'page',
        path: spec.routerPath,
        origin: 'file-system',
      });
    }
  }
  return [
    {
      type: 'nested',
      routeType: 'layout',
      path: '/',
      isRoot: true,
      origin: 'file-system',
      children,
    },
  ];
}

/**
 * Recreates `routesDir` from scratch with the fixture files (root layout +
 * root index page + every spec). Returns file/route counts.
 */
export function writeRouteFiles(count, routesDir) {
  rmSync(routesDir, { recursive: true, force: true });
  const specs = makeRouteSpecs(count);
  const files = [
    { relPath: 'layout.tsx', content: layoutContent() },
    { relPath: 'page.tsx', content: pageContent('Home') },
    ...specs.flatMap((spec) => spec.files),
  ];
  for (const file of files) {
    const filePath = path.join(routesDir, file.relPath);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, file.content, 'utf8');
  }
  return { fileCount: files.length, routeCount: specs.length + 1 };
}
