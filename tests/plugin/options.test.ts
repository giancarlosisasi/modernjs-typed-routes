import { describe, expect, test } from '@rstest/core';
import { resolveOptions } from '../../src/plugin/options';

describe('defaults (docs/api/plugin-options.md)', () => {
  test('no options → documented defaults', () => {
    expect(resolveOptions()).toStrictEqual({
      outFile: 'src/routes.gen.d.ts',
      trailingSlash: false,
      banner: undefined,
    });
  });

  test('empty object → documented defaults', () => {
    expect(resolveOptions({})).toStrictEqual({
      outFile: 'src/routes.gen.d.ts',
      trailingSlash: false,
      banner: undefined,
    });
  });

  test('provided values are kept', () => {
    expect(
      resolveOptions({
        outFile: 'src/shared/router/routes.gen.d.ts',
        trailingSlash: true,
        banner: '/* biome-ignore-all lint: generated file */',
      }),
    ).toStrictEqual({
      outFile: 'src/shared/router/routes.gen.d.ts',
      trailingSlash: true,
      banner: '/* biome-ignore-all lint: generated file */',
    });
  });
});

describe('validation errors are prefixed and helpful', () => {
  test('unknown keys name the key AND list the valid ones', () => {
    expect(() => resolveOptions({ outfile: 'x.d.ts' })).toThrow(
      /\[modernjs-typed-routes\].*Unknown option "outfile".*outFile, trailingSlash, banner/s,
    );
  });

  test('absolute outFile is rejected with guidance (posix)', () => {
    expect(() => resolveOptions({ outFile: '/etc/routes.gen.d.ts' })).toThrow(
      /outFile must be a path relative to the app root.*src\/routes\.gen\.d\.ts/s,
    );
  });

  test('absolute outFile is rejected with guidance (windows)', () => {
    expect(() =>
      resolveOptions({ outFile: 'C:\\app\\routes.gen.d.ts' }),
    ).toThrow(/outFile must be a path relative to the app root/);
  });

  test('outFile escaping the app root is rejected', () => {
    expect(() => resolveOptions({ outFile: '../outside.d.ts' })).toThrow(
      /outFile must stay inside the app root/,
    );
  });

  test('wrong types get a typed message', () => {
    expect(() => resolveOptions({ outFile: 42 })).toThrow(
      /outFile must be a string/,
    );
    expect(() => resolveOptions({ trailingSlash: 'yes' })).toThrow(
      /trailingSlash must be a boolean/,
    );
    expect(() => resolveOptions({ banner: 42 })).toThrow(
      /banner must be a string/,
    );
    expect(() => resolveOptions({ outFile: '' })).toThrow(
      /outFile must be a non-empty string/,
    );
  });

  test('non-object input is rejected', () => {
    expect(() => resolveOptions('src/x.d.ts')).toThrow(
      /options must be an object/,
    );
  });
});
