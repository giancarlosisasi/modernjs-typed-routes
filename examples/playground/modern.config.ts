import fs from 'node:fs';
import path from 'node:path';
import {
  type AppTools,
  appTools,
  type CliPlugin,
  defineConfig,
} from '@modern-js/app-tools';
import { routeTypesPlugin } from 'modernjs-typed-routes/plugin';

// ---------------------------------------------------------------------------
// SPIKE plugin (roadmap task 0.2, 2026-07-12) — kept as REFERENCE, not
// registered below. It logs every relevant hook call to
// spike-output/spike-log.jsonl; the captured evidence lives in
// roadmap/research/spike-output/ and roadmap/research/spike-findings.md.
// Re-add `spikePlugin()` to `plugins` to reproduce. Phase 2 replaces this
// with the real modernjs-typed-routes plugin.
// ---------------------------------------------------------------------------

const OUT_DIR = path.resolve(process.cwd(), 'spike-output');

function dump(event: string, data: unknown) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let payload: string;
  try {
    payload = JSON.stringify(data);
  } catch (err) {
    payload = JSON.stringify({ serializationError: String(err) });
  }
  const line = `{"ts":"${new Date().toISOString()}","cmd":"${process.argv
    .slice(2)
    .join(' ')}","event":"${event}","data":${payload}}\n`;
  fs.appendFileSync(path.join(OUT_DIR, 'spike-log.jsonl'), line);
}

// biome-ignore lint/correctness/noUnusedVariables: kept as spike reference (see note above)
const spikePlugin = (): CliPlugin<AppTools> => ({
  name: 'spike-route-types',
  setup(api) {
    dump('setup', null);

    api.onPrepare(() => {
      const ctx = api.getAppContext();
      dump('onPrepare', {
        entrypoints: ctx.entrypoints?.map(e => ({
          entryName: e.entryName,
          isMainEntry: e.isMainEntry,
          entry: e.entry,
          nestedRoutesEntry: e.nestedRoutesEntry,
          isAutoMount: e.isAutoMount,
        })),
        serverRoutes: ctx.serverRoutes?.map(r => ({
          entryName: r.entryName,
          urlPath: r.urlPath,
          entryPath: r.entryPath,
        })),
      });
    });

    api.onAfterPrepare(() => dump('onAfterPrepare', null));

    api.modifyEntrypoints(({ entrypoints }) => {
      dump('modifyEntrypoints', entrypoints);
      return { entrypoints };
    });

    api.modifyFileSystemRoutes(({ entrypoint, routes }) => {
      dump('modifyFileSystemRoutes', { entrypoint, routes });
      return { entrypoint, routes };
    });

    api.onBeforeGenerateRoutes(({ entrypoint, code }) => {
      dump('onBeforeGenerateRoutes', {
        entryName: entrypoint.entryName,
        codeLength: code.length,
      });
      return { entrypoint, code };
    });

    api.onFileChanged(e => {
      dump('onFileChanged', { filename: e.filename, eventType: e.eventType });
    });

    // Q5: can a custom command reach the parsed tree without dev/build?
    api.addCommand(({ program }) => {
      program
        .command('typegen')
        .description('spike: inspect what a standalone command can reach')
        .action(async () => {
          const ctx = api.getAppContext();
          dump('typegen-command', {
            hasGetHooks: typeof api.getHooks === 'function',
            hookKeys: api.getHooks ? Object.keys(api.getHooks()) : null,
            entrypoints: ctx.entrypoints?.map(e => ({
              entryName: e.entryName,
              isMainEntry: e.isMainEntry,
              nestedRoutesEntry: e.nestedRoutesEntry,
              isAutoMount: e.isAutoMount,
            })),
            serverRoutes: ctx.serverRoutes?.map(r => ({
              entryName: r.entryName,
              urlPath: r.urlPath,
            })),
          });
          console.log('[spike] typegen command ran — see spike-output/');
        });
    });
  },
});

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), routeTypesPlugin()],
});
