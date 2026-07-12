import { Outlet } from '@modern-js/runtime/router';

export default function AuthPathlessLayout() {
  return (
    <section>
      <h2>auth-pathless-layout</h2>
      <Outlet />
    </section>
  );
}
