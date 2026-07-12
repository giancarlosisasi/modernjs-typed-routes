import { describe, expect, test } from '@rstest/core';
import { buildPath } from '../../src/runtime/build-path';

// ---------------------------------------------------------------------------
// Required params
// ---------------------------------------------------------------------------

describe('required params', () => {
  test('substitutes a required param', () => {
    expect(buildPath('/blog/[id]', { params: { id: 42 } })).toBe('/blog/42');
  });

  test('accepts string values', () => {
    expect(buildPath('/blog/[id]', { params: { id: 'hello-world' } })).toBe(
      '/blog/hello-world',
    );
  });

  test('URL-encodes param values', () => {
    expect(buildPath('/blog/[id]', { params: { id: 'a b' } })).toBe(
      '/blog/a%20b',
    );
    expect(buildPath('/blog/[id]', { params: { id: 'a/b?c#d' } })).toBe(
      '/blog/a%2Fb%3Fc%23d',
    );
  });

  test('multiple params in one path', () => {
    expect(
      buildPath('/shop/[category]/[item]', {
        params: { category: 'books', item: 9 },
      }),
    ).toBe('/shop/books/9');
  });

  test('flat-segment-derived path', () => {
    expect(buildPath('/user/profile/[id]/edit', { params: { id: 7 } })).toBe(
      '/user/profile/7/edit',
    );
  });

  // NOTE: this file is not typechecked against a populated Register (unit
  // scope has an empty Register → RoutePath = string), so misuse calls below
  // compile by design — they exercise the RUNTIME guards for JS consumers.
  // The type-level guards live in tests/types/*/specs.ts.
  test('missing required param throws naming the param and the path', () => {
    expect(() => buildPath('/blog/[id]')).toThrow(
      /required param "id".*"\/blog\/\[id\]"/,
    );
    expect(() =>
      buildPath('/shop/[category]/[item]', {
        params: { category: 'books' },
      }),
    ).toThrow(/required param "item".*"\/shop\/\[category\]\/\[item\]"/);
  });

  test('null/undefined param values count as missing', () => {
    expect(() =>
      buildPath('/blog/[id]', {
        params: { id: undefined as unknown as string },
      }),
    ).toThrow(/required param "id"/);
  });

  test('empty-string required param throws — never a broken // URL', () => {
    expect(() => buildPath('/blog/[id]', { params: { id: '' } })).toThrow(
      /required param "id"/,
    );
    expect(() =>
      buildPath('/shop/[category]/[item]', {
        params: { category: '', item: 9 },
      }),
    ).toThrow(/required param "category"/);
  });

  test('falsy-but-valid values substitute (0 is a real value)', () => {
    expect(buildPath('/blog/[id]', { params: { id: 0 } })).toBe('/blog/0');
  });
});

// ---------------------------------------------------------------------------
// Optional params ([id$])
// ---------------------------------------------------------------------------

describe('optional params', () => {
  test('present → substituted', () => {
    expect(buildPath('/users/[id$]', { params: { id: 7 } })).toBe('/users/7');
  });

  test('absent → segment dropped, no double slash', () => {
    expect(buildPath('/users/[id$]')).toBe('/users');
    expect(buildPath('/users/[id$]', {})).toBe('/users');
    expect(buildPath('/users/[id$]', { params: {} })).toBe('/users');
  });

  test('optional param mid-path drops cleanly', () => {
    expect(buildPath('/a/[x$]/b', { params: {} })).toBe('/a/b');
    expect(buildPath('/a/[x$]/b', { params: { x: '1' } })).toBe('/a/1/b');
  });

  test('empty-string optional param drops the segment (consistent with splat)', () => {
    expect(buildPath('/users/[id$]', { params: { id: '' } })).toBe('/users');
    expect(buildPath('/a/[x$]/b', { params: { x: '' } })).toBe('/a/b');
  });

  test('0 is a real optional value', () => {
    expect(buildPath('/users/[id$]', { params: { id: 0 } })).toBe('/users/0');
  });
});

// ---------------------------------------------------------------------------
// Splat ($)
// ---------------------------------------------------------------------------

describe('splat routes', () => {
  test('splat value keeps its slashes, but each piece is encoded', () => {
    expect(buildPath('/docs/$', { params: { '*': 'guide/x' } })).toBe(
      '/docs/guide/x',
    );
    expect(buildPath('/docs/$', { params: { '*': 'a b/c d' } })).toBe(
      '/docs/a%20b/c%20d',
    );
  });

  test('absent splat → segment dropped', () => {
    expect(buildPath('/docs/$')).toBe('/docs');
    expect(buildPath('/docs/$', { params: {} })).toBe('/docs');
  });

  test("splat value '0' is a real value", () => {
    expect(buildPath('/docs/$', { params: { '*': '0' } })).toBe('/docs/0');
  });

  test('leading slashes on the splat value are normalized away', () => {
    expect(buildPath('/docs/$', { params: { '*': '/guide/x' } })).toBe(
      '/docs/guide/x',
    );
  });

  test('root splat', () => {
    expect(buildPath('/$', { params: { '*': 'not/found' } })).toBe(
      '/not/found',
    );
    expect(buildPath('/$')).toBe('/');
  });
});

// ---------------------------------------------------------------------------
// searchParams
// ---------------------------------------------------------------------------

describe('searchParams', () => {
  test('serialized via URLSearchParams with & joining', () => {
    expect(buildPath('/blog', { searchParams: { page: 2, tag: 'dx' } })).toBe(
      '/blog?page=2&tag=dx',
    );
  });

  test('number and boolean values are stringified (0 and false included)', () => {
    expect(
      buildPath('/blog', { searchParams: { page: 2, draft: false } }),
    ).toBe('/blog?page=2&draft=false');
    expect(buildPath('/blog', { searchParams: { page: 0 } })).toBe(
      '/blog?page=0',
    );
  });

  test('values are URL-encoded', () => {
    expect(buildPath('/blog', { searchParams: { q: 'a b&c' } })).toBe(
      '/blog?q=a+b%26c',
    );
  });

  test('empty object → no ?', () => {
    expect(buildPath('/blog', { searchParams: {} })).toBe('/blog');
  });
});

// ---------------------------------------------------------------------------
// hash
// ---------------------------------------------------------------------------

describe('hash', () => {
  test('appended last', () => {
    expect(buildPath('/about', { hash: 'team' })).toBe('/about#team');
  });

  test('leading # is not doubled', () => {
    expect(buildPath('/about', { hash: '#team' })).toBe('/about#team');
  });

  test('empty hash → no #', () => {
    expect(buildPath('/about', { hash: '' })).toBe('/about');
    expect(buildPath('/about', { hash: '#' })).toBe('/about');
  });

  test('params + searchParams + hash combined in order', () => {
    expect(
      buildPath('/blog/[id]', {
        params: { id: 42 },
        searchParams: { ref: 'rss' },
        hash: 'top',
      }),
    ).toBe('/blog/42?ref=rss#top');
  });
});

// ---------------------------------------------------------------------------
// trailingSlash-style keys ('/blog/[id]/')
// ---------------------------------------------------------------------------

describe('trailingSlash keys', () => {
  test('key ending in / builds a URL ending in / before ? and #', () => {
    expect(buildPath('/about/')).toBe('/about/');
    expect(buildPath('/blog/[id]/', { params: { id: 42 } })).toBe('/blog/42/');
    expect(
      buildPath('/blog/[id]/', {
        params: { id: 42 },
        searchParams: { ref: 'rss' },
        hash: 'top',
      }),
    ).toBe('/blog/42/?ref=rss#top');
  });

  test('optional-param drop keeps the trailing slash', () => {
    expect(buildPath('/users/[id$]/')).toBe('/users/');
  });

  test('root stays a single slash', () => {
    expect(buildPath('/')).toBe('/');
    expect(buildPath('/', { searchParams: { a: 1 } })).toBe('/?a=1');
  });
});

// ---------------------------------------------------------------------------
// Isomorphic purity — safe in loaders, tests, Node (no window/DOM/node builtins)
// ---------------------------------------------------------------------------

describe('isomorphic purity', () => {
  test('module source references no window/document/process/node builtins', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const source = readFileSync(
      join(__dirname, '../../src/runtime/build-path.ts'),
      'utf8',
    );
    for (const forbidden of [
      'window.',
      'document.',
      'process.',
      'globalThis',
      'Buffer.',
      '__dirname',
      "from 'node:",
      "from 'fs",
      "from 'path",
      'require(',
      'import(',
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
