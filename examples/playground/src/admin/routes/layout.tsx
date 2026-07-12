import { Outlet } from 'modernjs-typed-routes';

export default function AdminLayout() {
  return (
    <div>
      <header>admin entry</header>
      <Outlet />
    </div>
  );
}
