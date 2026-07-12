import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

/**
 * Atomically writes `content` to `filePath`, skipping the write entirely when
 * the file already holds identical bytes (stable mtimes → no watcher churn,
 * per docs/api/plugin-options.md §Behavior notes).
 *
 * Returns `true` when the file was (re)written.
 */
export function writeFileIfChanged(filePath: string, content: string): boolean {
  let existing: string | undefined;
  try {
    existing = readFileSync(filePath, 'utf8');
  } catch {
    // missing file → write
  }
  if (existing === content) return false;

  mkdirSync(path.dirname(filePath), { recursive: true });

  // tmp + rename in the SAME directory so the rename is atomic on the volume.
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  try {
    writeFileSync(tmpPath, content, 'utf8');
    renameSync(tmpPath, filePath);
  } catch (error) {
    rmSync(tmpPath, { force: true });
    throw error;
  }
  return true;
}
