// Mirrors docs/guide/navigation.md §<Navigate> (verbatim).
import { Navigate } from 'modernjs-typed-routes';

export default function LegacyPage() {
  return <Navigate to="/blog/[id]" params={{ id: 1 }} replace />;
}
