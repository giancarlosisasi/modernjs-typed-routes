import { Outlet } from '@modern-js/runtime/router';

export default function AdminLayout() {
  return (
    <div>
      <header>admin entry</header>
      <Outlet />
    </div>
  );
}
