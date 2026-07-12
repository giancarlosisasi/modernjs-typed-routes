/**
 * Multi-entry component type specs: JSX generic inference over the
 * cross-entry union, conditional `params`, entry-scoped helper usage.
 */
import type { EntryRoutePath, useNavigate } from 'modernjs-typed-routes';
import { buildPath, Link, Navigate } from 'modernjs-typed-routes';

// --- Link infers literals across the whole entries union --------------------

<Link to="/admin">Admin home</Link>;
<Link to="/admin/users/[userId]" params={{ userId: 3 }}>
  User
</Link>;
<Link to="/blog/[id]" params={{ id: 42 }}>
  Post
</Link>;

// @ts-expect-error — params are REQUIRED for /admin/users/[userId]
<Link to="/admin/users/[userId]">User</Link>;
// @ts-expect-error — extra params on a static admin route
<Link to="/admin" params={{ x: 1 }}>
  Admin
</Link>;
// @ts-expect-error — not a route in ANY entry
<Link to="/nowhere">Nope</Link>;

<Navigate to="/admin/users/[userId]" params={{ userId: 1 }} replace />;

// --- buildPath / navigateTo across the union --------------------------------

buildPath('/admin/users/[userId]', { params: { userId: 9 } });
// @ts-expect-error — options REQUIRED
buildPath('/admin/users/[userId]');

declare const nav: ReturnType<typeof useNavigate>;
nav.navigateTo('/admin');
nav.navigateTo('/admin/users/[userId]', { params: { userId: 2 } });

// --- entry-scoped props for strict teams -------------------------------------

type AdminLinkTarget = EntryRoutePath<'admin'>;
declare const adminOnly: AdminLinkTarget;
<Link to={adminOnly}>scoped</Link>;
