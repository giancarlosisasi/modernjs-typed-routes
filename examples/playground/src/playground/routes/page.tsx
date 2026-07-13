import { Link, useNavigate } from 'modernjs-typed-routes';

/** Dogfood: the typed-<Link> matrix (task 3.4) + the useNavigate helpers. */
export default function HomePage() {
  // Dogfoods the hook against the BUILT dist types (the playground resolves the
  // package through node_modules), so `params` is required here exactly like it
  // is on <Link to="/blog/[id]">. This file only makes VALID calls — a
  // too-permissive signature would still pass `check:playground`, so the
  // negative cases (omitting required params) live in tests/types/*.
  const { navigateTo, createUrl } = useNavigate();

  const goToBlogPost = (id: string) => {
    navigateTo('/blog/[id]', { params: { id }, searchParams: { ref: 'home' } });
  };

  return (
    <div>
      <h1>home</h1>
      <p>
        Playground: every Modern.js routing convention, navigated exclusively
        through typed wrappers. Each page says which convention it shows.
      </p>
      <nav>
        <ul>
          <li>
            {/* bare-string Link (static route) */}
            <Link to="/about">about</Link>
          </li>
          <li>
            {/* params Link (required param) */}
            <Link to="/blog/[id]" params={{ id: 42 }}>
              blog 42
            </Link>
          </li>
          <li>
            {/* optional param present / absent */}
            <Link to="/users/[id$]" params={{ id: 7 }}>
              user 7
            </Link>{' '}
            <Link to="/users/[id$]">users (no id)</Link>
          </li>
          <li>
            {/* splat */}
            <Link to="/docs/$" params={{ '*': 'deep/path' }}>
              docs deep/path
            </Link>
          </li>
          <li>
            {/* searchParams + hash */}
            <Link to="/blog" searchParams={{ page: 2, tag: 'dx' }} hash="top">
              blog page 2
            </Link>
          </li>
          <li>
            {/* config route (modern.routes.ts) is typed too */}
            <Link to="/promo/[code]" params={{ code: 'SAVE10' }}>
              promo SAVE10
            </Link>
          </li>
          <li>
            {/* flat-segment route */}
            <Link to="/user/profile/[id]/edit" params={{ id: 1 }}>
              edit profile 1
            </Link>
          </li>
        </ul>
      </nav>
      <section>
        {/* imperative navigation through the hook */}
        <button type="button" onClick={() => goToBlogPost('7')}>
          navigateTo blog 7
        </button>
        <p>createUrl: {createUrl('/blog/[id]', { params: { id: 7 } })}</p>
      </section>
    </div>
  );
}
