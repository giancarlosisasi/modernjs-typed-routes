import { Navigate, useTypedParams } from 'modernjs-typed-routes';

/**
 * Dogfood: declarative `<Navigate>` redirect (task 3.4) — this flat-segment
 * route forwards to the blog detail page for the same id.
 */
export default function UserProfileEditPage() {
  const { id } = useTypedParams('/user/profile/[id]/edit');
  return <Navigate to="/blog/[id]" params={{ id }} replace />;
}
