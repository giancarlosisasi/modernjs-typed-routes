import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { writeFileIfChanged } from '../../src/plugin/write';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'mtr-write-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('writeFileIfChanged', () => {
  test('creates missing parent directories and writes the content', () => {
    const target = path.join(dir, 'deep', 'nested', 'routes.gen.d.ts');
    const written = writeFileIfChanged(target, 'export {};\n');
    expect(written).toBe(true);
    expect(readFileSync(target, 'utf8')).toBe('export {};\n');
  });

  test('writes \\n endings verbatim (no \\r\\n translation)', () => {
    const target = path.join(dir, 'routes.gen.d.ts');
    writeFileIfChanged(target, 'a\nb\n');
    const bytes = readFileSync(target);
    expect(bytes.includes('\r')).toBe(false);
  });

  test('identical content → no write, mtime unchanged', async () => {
    const target = path.join(dir, 'routes.gen.d.ts');
    writeFileIfChanged(target, 'same\n');
    const before = statSync(target).mtimeMs;
    await new Promise((resolve) => setTimeout(resolve, 20));
    const written = writeFileIfChanged(target, 'same\n');
    expect(written).toBe(false);
    expect(statSync(target).mtimeMs).toBe(before);
  });

  test('changed content → rewritten', () => {
    const target = path.join(dir, 'routes.gen.d.ts');
    writeFileIfChanged(target, 'old\n');
    const written = writeFileIfChanged(target, 'new\n');
    expect(written).toBe(true);
    expect(readFileSync(target, 'utf8')).toBe('new\n');
  });

  test('atomic: no temp file left behind next to the target', () => {
    const target = path.join(dir, 'routes.gen.d.ts');
    writeFileIfChanged(target, 'content\n');
    const siblings = require('node:fs').readdirSync(dir) as string[];
    expect(siblings).toStrictEqual(['routes.gen.d.ts']);
  });

  test('overwrites a pre-existing file written by other means', () => {
    const target = path.join(dir, 'routes.gen.d.ts');
    writeFileSync(target, 'manual edit');
    const written = writeFileIfChanged(target, 'generated\n');
    expect(written).toBe(true);
    expect(readFileSync(target, 'utf8')).toBe('generated\n');
  });
});
