/**
 * Runtime entry (`modernjs-typed-routes`): the full router surface with the
 * typed wrappers shadowing `Link`/`Navigate`/`useNavigate` (docs contract).
 *
 * `Register` MUST be an interface (never a `type`): the generated
 * `routes.gen.d.ts` fills it via declaration merging (D5), which only
 * works on interfaces. It must also stay DECLARED here — module
 * augmentation does not merge through re-exports.
 */
// biome-ignore lint/suspicious/noEmptyInterface: empty by design — populated by codegen via declaration merging
export interface Register {}

export * from './runtime/reexports';
export type {
  BaseBuildOptions,
  BuildArgs,
  BuildOptions,
  EntryRouteParams,
  EntryRoutePath,
  NavigateArgs,
  NavigateToOptions,
  RegisterEntryName,
  RouteParams,
  RoutePath,
  RoutePathname,
  RouteReadParams,
  SearchParamsInit,
  StaticRoutePath,
  WithParams,
} from './runtime/register';
