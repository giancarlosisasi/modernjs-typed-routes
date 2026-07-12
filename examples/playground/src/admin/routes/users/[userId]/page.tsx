import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: entry-prefixed key in the SECOND entry (basename '/admin'). */
export default function AdminUserDetailPage() {
  const { userId } = useTypedParams('/admin/users/[userId]');
  return (
    <div>
      <h1>admin-user:{userId}</h1>
      <p>
        Convention: dynamic param in the second entry — typed keys are
        basename-prefixed (/admin/users/[userId]).
      </p>
    </div>
  );
}
