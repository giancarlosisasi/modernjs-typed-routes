// Mirrors docs/guide/navigation.md §<Link> line-for-line; the only
// scaffolding is the `post` declaration and a `;` after each JSX statement
// (the docs block is an illustrative fragment, not a full module).
import { Link } from 'modernjs-typed-routes';

declare const post: { id: number };

// Static route
<Link to="/about">About</Link>;

// Dynamic route — `params` is required, keys and presence are checked
<Link to="/blog/[id]" params={{ id: post.id }}>Post</Link>;

// Optional param [id$] — `params.id` may be omitted
<Link to="/users/[id$]">Users</Link>;
<Link to="/users/[id$]" params={{ id: 7 }}>User 7</Link>;

// Splat route — the remainder goes in '*'
<Link to="/docs/$" params={{ '*': 'guide/advanced' }}>Docs</Link>;
// Link to the splat root itself with an empty remainder
<Link to="/docs/$" params={{ '*': '' }}>Docs home</Link>;

// Search params and hash
<Link to="/blog" searchParams={{ page: 2, tag: 'dx' }} hash="comments">
  Page 2
</Link>;
