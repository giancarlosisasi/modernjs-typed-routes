import { Link } from 'modernjs-typed-routes';

/** Dogfood: the typed-<Link> matrix (task 3.4). */
export default function HomePage() {
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
    </div>
  );
}
