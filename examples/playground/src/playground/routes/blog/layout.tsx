import { Outlet } from '@modern-js/runtime/router';

export default function BlogLayout() {
  return (
    <section>
      <h2>blog-layout</h2>
      <Outlet />
    </section>
  );
}
