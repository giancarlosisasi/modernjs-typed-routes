import { Outlet } from 'modernjs-typed-routes';

export default function RootLayout() {
  return (
    <div>
      <header>playground main entry</header>
      <Outlet />
    </div>
  );
}
