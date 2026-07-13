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

// Before the first generation NOTHING may error — the helpers degrade to plain
// string paths with permissive optional params (never a required options arg).
declare const nav: ReturnType<typeof useNavigate>;
nav.navigateTo('/free-form');
nav.navigateTo('/free-form', { params: { anything: 'goes' }, replace: true });
nav.createUrl('/free-form');
nav.createUrl('/free-form', { params: { anything: 'goes' }, hash: 'top' });
nav.goBack();
