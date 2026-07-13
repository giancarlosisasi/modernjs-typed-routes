/** Shared timing/stat helpers for the bench scripts. */

export function quantile(sorted, q) {
  if (sorted.length === 0) return Number.NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function stats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted[0],
    p50: quantile(sorted, 0.5),
    p95: quantile(sorted, 0.95),
    max: sorted[sorted.length - 1],
  };
}

export const fmtMs = (ms) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(2)}ms`;

export const fmtKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/** Minimal `--flag value` / `--flag=value` / boolean `--flag` parser. */
export function parseArgs(argv, defaults) {
  const options = { ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    const key = (eq === -1 ? arg.slice(2) : arg.slice(2, eq)).replace(
      /-([a-z])/g,
      (_, c) => c.toUpperCase(),
    );
    if (!(key in options)) {
      console.error(`unknown option: ${arg}`);
      process.exit(1);
    }
    if (typeof options[key] === 'boolean') {
      options[key] = eq === -1 ? true : argv[i].slice(eq + 1) !== 'false';
    } else {
      const raw = eq === -1 ? argv[++i] : arg.slice(eq + 1);
      if (typeof options[key] === 'number') {
        const value = Number(raw);
        if (!Number.isFinite(value)) {
          console.error(`--${key} needs a numeric value, got: ${raw}`);
          process.exit(1);
        }
        options[key] = value;
      } else {
        options[key] = raw;
      }
    }
  }
  return options;
}
