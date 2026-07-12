import { useParams } from '@modern-js/runtime/router';

export default function AdminUserDetailPage() {
  const params = useParams();
  return <h1>admin-user:{params.userId}</h1>;
}
