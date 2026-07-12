/**
 * Empty-Register fallback for the component surfaces: everything must
 * COMPILE with plain strings and permissive optional params.
 */
import {
  buildPath,
  Link,
  Navigate,
  type useNavigate,
} from 'modernjs-typed-routes';

<Link to="/anything">Anywhere</Link>;
<Link to="/anything" params={{ id: 1 }}>
  Anywhere
</Link>;
<Navigate to="/wherever" />;

buildPath('/whatever');
buildPath('/whatever', { params: { x: 'y' }, searchParams: { a: 1 } });

declare const nav: ReturnType<typeof useNavigate>;
nav.navigateTo('/free-form');
nav.navigateTo('/free-form', { params: { anything: 'goes' }, replace: true });
