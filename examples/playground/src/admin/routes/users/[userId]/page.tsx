import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: entry-prefixed key in the SECOND entry (basename '/admin'). */
export default function AdminUserDetailPage() {
  const { userId } = useTypedParams('/admin/users/[userId]');
  return <h1>admin-user:{userId}</h1>;
}
