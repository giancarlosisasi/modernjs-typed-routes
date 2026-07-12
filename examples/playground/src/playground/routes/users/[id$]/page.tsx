import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: `useTypedParams` on an optional-param route (id may be absent). */
export default function UserOptionalPage() {
  const { id } = useTypedParams('/users/[id$]');
  return (
    <div>
      <h1>users-optional:{id ?? 'none'}</h1>
      <p>
        Convention: optional param (users/[id$]) — matches both /users and
        /users/:id.
      </p>
    </div>
  );
}
