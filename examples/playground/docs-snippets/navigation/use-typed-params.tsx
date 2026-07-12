// Mirrors docs/guide/navigation.md §useTypedParams(path) — hook lines are
// verbatim; component wrappers are scaffolding.
import { useTypedParams } from 'modernjs-typed-routes';

// in src/routes/blog/[id]/page.tsx
export function BlogDetail() {
  const { id } = useTypedParams('/blog/[id]'); // id: string
  return id;
}

// in a splat route
export function DocsSplat() {
  const { '*': rest } = useTypedParams('/docs/$'); // rest: string
  return rest;
}
