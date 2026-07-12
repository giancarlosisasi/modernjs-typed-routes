import { useLoaderData, useNavigate } from 'modernjs-typed-routes';

/**
 * Dogfood: `useNavigate` helpers + loader data produced by `buildPath`
 * in the sidecar `page.data.ts` (single import source — no direct
 * `@modern-js/runtime/router` import).
 */
export default function BlogIndexPage() {
  const { navigateTo, createUrl } = useNavigate();
  const data = useLoaderData() as { message: string; loginUrl: string };

  return (
    <div>
      <h1>blog-index</h1>
      <p data-testid="loader-login-url">{data.loginUrl}</p>
      <p data-testid="create-url">
        {createUrl('/blog/[id]', {
          params: { id: 7 },
          searchParams: { ref: 'blog' },
        })}
      </p>
      <button
        type="button"
        onClick={() =>
          navigateTo('/blog/[id]', {
            params: { id: 99 },
            searchParams: { ref: 'button' },
          })
        }
      >
        open post 99
      </button>
      <button type="button" onClick={() => navigateTo('/users/[id$]')}>
        users
      </button>
    </div>
  );
}
