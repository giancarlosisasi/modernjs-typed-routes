import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: `useTypedParams` on an optional-param route (id may be absent). */
export default function UserOptionalPage() {
  const { id } = useTypedParams('/users/[id$]');
  return <h1>users-optional:{id ?? 'none'}</h1>;
}
