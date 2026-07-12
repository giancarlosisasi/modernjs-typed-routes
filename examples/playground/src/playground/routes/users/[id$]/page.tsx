import { useParams } from '@modern-js/runtime/router';

export default function UserOptionalPage() {
  const params = useParams();
  return <h1>users-optional:{params.id ?? 'none'}</h1>;
}
