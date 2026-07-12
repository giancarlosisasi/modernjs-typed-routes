import { Outlet } from 'modernjs-typed-routes';

export default function BlogLayout() {
  return (
    <section>
      <h2>blog-layout</h2>
      <Outlet />
    </section>
  );
}
