// Mirrors docs/guide/getting-started.md §4 "Navigate with types" (verbatim).
import { Link, useNavigate } from 'modernjs-typed-routes';

export default function BlogPage() {
  const { navigateTo } = useNavigate();

  return (
    <div>
      {/* Paramless route: just a string — autocompleted */}
      <Link to="/about">About</Link>

      {/* Dynamic route: `params` is required and typed */}
      <Link to="/blog/[id]" params={{ id: 42 }}>
        Read post 42
      </Link>

      <button onClick={() => navigateTo('/blog/[id]', { params: { id: 42 } })}>
        Or imperatively
      </button>
    </div>
  );
}
