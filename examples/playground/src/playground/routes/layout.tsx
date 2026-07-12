import { Outlet } from '@modern-js/runtime/router';

export default function RootLayout() {
  return (
    <div>
      <header>playground main entry</header>
      <Outlet />
    </div>
  );
}
