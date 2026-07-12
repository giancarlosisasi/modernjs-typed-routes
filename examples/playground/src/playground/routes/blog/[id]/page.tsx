import { useParams } from '@modern-js/runtime/router';

export default function BlogDetailPage() {
  const params = useParams();
  return <h1>blog-detail:{params.id}</h1>;
}
