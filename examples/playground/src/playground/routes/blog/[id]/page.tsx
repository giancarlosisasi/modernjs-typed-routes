import { Link, useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: `useTypedParams` on a required-param route. */
export default function BlogDetailPage() {
  const { id } = useTypedParams('/blog/[id]');
  return (
    <div>
      <h1>blog-detail:{id}</h1>
      <p>Convention: dynamic param — blog/[id]/page.tsx → /blog/:id.</p>
      <Link to="/blog">back to blog</Link>
    </div>
  );
}
