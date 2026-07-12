/**
 * Runtime entry (`modernjs-typed-routes`). The typed wrappers
 * (`Link`, `Navigate`, `useNavigate`, …) land in Phase 3.
 *
 * `Register` MUST be an interface (never a `type`): the generated
 * `routes.gen.d.ts` fills it via declaration merging (D5), which only
 * works on interfaces.
 */
// biome-ignore lint/suspicious/noEmptyInterface: empty by design — populated by codegen via declaration merging
export interface Register {}
