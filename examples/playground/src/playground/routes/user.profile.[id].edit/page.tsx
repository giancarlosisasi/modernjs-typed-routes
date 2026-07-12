import { useParams } from '@modern-js/runtime/router';

export default function UserProfileEditPage() {
  const params = useParams();
  return <h1>user-profile-edit:{params.id}</h1>;
}
