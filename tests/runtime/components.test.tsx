/**
 * Smoke specs for the typed wrappers (task 3.3) — Rstest + testing-library
 * over a memory router from `@modern-js/runtime/router`.
 *
 * Everything is imported from `src/index` (the public surface) so these
 * specs double as export-surface checks.
 */
import {
  createMemoryRouter,
  MemoryRouter,
  Link as RouterLink,
  RouterProvider,
} from '@modern-js/runtime/router';
import { afterEach, describe, expect, test } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import * as pkg from '../../src/index';
import { Link, Navigate, useNavigate, useTypedParams } from '../../src/index';

// rstest exposes no global afterEach, so testing-library's auto-cleanup
// never registers — do it explicitly or DOM piles up across tests.
afterEach(cleanup);

// ---------------------------------------------------------------------------
// <Link>
// ---------------------------------------------------------------------------

describe('<Link>', () => {
  test('builds href from params + searchParams + hash', () => {
    render(
      <MemoryRouter>
        <Link to="/blog/[id]" params={{ id: 42 }} searchParams={{ ref: 'x' }}>
          Post
        </Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveProperty('pathname', '/blog/42');
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/blog/42?ref=x',
    );
  });

  test('bare string for a static route', () => {
    render(
      <MemoryRouter>
        <Link to="/about">About</Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/about');
  });

  test('prefixed key under the matching entry basename is NOT doubled', () => {
    render(
      <MemoryRouter basename="/admin" initialEntries={['/admin']}>
        <Link to="/admin/users/[userId]" params={{ userId: 3 }}>
          User
        </Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/admin/users/3',
    );
  });

  test('custom runtime.router.basename (unprefixed keys) is applied by the router', () => {
    render(
      <MemoryRouter basename="/shop" initialEntries={['/shop']}>
        <Link to="/blog/[id]" params={{ id: 1 }}>
          Post
        </Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/shop/blog/1');
  });

  test('router props (reloadDocument, replace, state) pass through', () => {
    render(
      <MemoryRouter>
        <Link to="/about" reloadDocument>
          About
        </Link>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// <Navigate>
// ---------------------------------------------------------------------------

describe('<Navigate>', () => {
  test('declaratively redirects with params + replace', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Navigate to="/blog/[id]" params={{ id: 1 }} replace />,
      },
      { path: '/blog/:id', element: <div>post</div> },
    ]);
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe('/blog/1'));
  });

  test('searchParams and hash are carried', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Navigate to="/about" searchParams={{ r: 'x' }} hash="top" />,
      },
      { path: '/about', element: <div>about</div> },
    ]);
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/about');
      expect(router.state.location.search).toBe('?r=x');
      expect(router.state.location.hash).toBe('#top');
    });
  });
});

// ---------------------------------------------------------------------------
// useNavigate()
// ---------------------------------------------------------------------------

type HookBag = ReturnType<typeof useNavigate>;

function HookProbe({ onReady }: { onReady: (bag: HookBag) => void }) {
  onReady(useNavigate());
  return <div>probe</div>;
}

const probeRouter = (initialEntries: string[] = ['/'], initialIndex = 0) => {
  let bag: HookBag | undefined;
  const router = createMemoryRouter(
    [
      { path: '/', element: <HookProbe onReady={(b) => (bag = b)} /> },
      { path: '/start', element: <div>start</div> },
      { path: '/blog/:id', element: <div>post</div> },
    ],
    { initialEntries, initialIndex },
  );
  render(<RouterProvider router={router} />);
  if (!bag) throw new Error('hook probe did not render');
  return { router, bag };
};

describe('useNavigate()', () => {
  test('navigateTo builds the URL and navigates', async () => {
    const { router, bag } = probeRouter();
    bag.navigateTo('/blog/[id]', {
      params: { id: 1 },
      searchParams: { ref: 'btn' },
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/blog/1');
      expect(router.state.location.search).toBe('?ref=btn');
    });
  });

  test('navigateTo replace/state options reach the router', async () => {
    const { router, bag } = probeRouter();
    bag.navigateTo('/blog/[id]', {
      params: { id: 2 },
      replace: true,
      state: { from: 'spec' },
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/blog/2');
      expect(router.state.location.state).toEqual({ from: 'spec' });
    });
  });

  test('createUrl returns the URL without navigating', () => {
    const { router, bag } = probeRouter();
    expect(
      bag.createUrl('/blog/[id]', {
        params: { id: 5 },
        searchParams: { a: 1 },
      }),
    ).toBe('/blog/5?a=1');
    expect(router.state.location.pathname).toBe('/');
  });

  test('goBack() calls navigate(-1)', async () => {
    const { router, bag } = probeRouter(['/start', '/'], 1);
    bag.goBack();
    await waitFor(() => expect(router.state.location.pathname).toBe('/start'));
  });

  test('originalNavigate is the raw NavigateFunction (accepts deltas and raw strings)', async () => {
    const { router, bag } = probeRouter();
    bag.originalNavigate('/blog/7?raw=1');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/blog/7');
      expect(router.state.location.search).toBe('?raw=1');
    });
    bag.originalNavigate(-1);
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});

// ---------------------------------------------------------------------------
// Basename behavior of navigateTo/createUrl (multi-entry D13 + U3)
// ---------------------------------------------------------------------------

describe('basename handling', () => {
  const probeUnder = (basename: string, routePath: string) => {
    let bag: HookBag | undefined;
    const router = createMemoryRouter(
      [
        { path: '/', element: <HookProbe onReady={(b) => (bag = b)} /> },
        { path: routePath, element: <div>target</div> },
      ],
      { basename, initialEntries: [basename] },
    );
    render(<RouterProvider router={router} />);
    if (!bag) throw new Error('hook probe did not render');
    return { router, bag };
  };

  test('navigateTo strips the entry prefix so the router does not double it', async () => {
    const { router, bag } = probeUnder('/admin', '/users/:userId');
    bag.navigateTo('/admin/users/[userId]', { params: { userId: 9 } });
    // location.pathname includes the basename — doubling would read
    // /admin/admin/users/9
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/admin/users/9'),
    );
  });

  test('createUrl returns the REAL URL: prefixed keys as-is, custom basename joined', () => {
    const admin = probeUnder('/admin', '/users/:userId');
    expect(
      admin.bag.createUrl('/admin/users/[userId]', { params: { userId: 9 } }),
    ).toBe('/admin/users/9');

    const shop = probeUnder('/shop', '/blog/:id');
    expect(shop.bag.createUrl('/blog/[id]', { params: { id: 3 } })).toBe(
      '/shop/blog/3',
    );
  });
});

// ---------------------------------------------------------------------------
// useTypedParams()
// ---------------------------------------------------------------------------

describe('useTypedParams()', () => {
  test('returns the current match params', () => {
    function Probe() {
      const { id } = useTypedParams('/blog/[id]');
      return <div data-testid="id">{id}</div>;
    }
    const router = createMemoryRouter(
      [{ path: '/blog/:id', element: <Probe /> }],
      { initialEntries: ['/blog/42'] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('id').textContent).toBe('42');
  });

  test('splat params come back under the * key', () => {
    function Probe() {
      const params = useTypedParams('/docs/$');
      return <div data-testid="rest">{params['*']}</div>;
    }
    const router = createMemoryRouter(
      [{ path: '/docs/*', element: <Probe /> }],
      { initialEntries: ['/docs/deep/path'] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('rest').textContent).toBe('deep/path');
  });
});

// ---------------------------------------------------------------------------
// Export surface (reexports.ts) + SSR sanity
// ---------------------------------------------------------------------------

describe('export surface', () => {
  test('full router surface is re-exported from the package root', () => {
    for (const name of [
      'Outlet',
      'useParams',
      'useLocation',
      'useSearchParams',
      'useLoaderData',
      'useMatches',
      'redirect',
      'defer',
      'isRouteErrorResponse',
      'NavLink',
    ]) {
      expect(
        (pkg as Record<string, unknown>)[name],
        `missing export: ${name}`,
      ).toBeDefined();
    }
  });

  test('our typed Link/Navigate/useNavigate SHADOW the router originals', () => {
    expect(pkg.Link).not.toBe(RouterLink);
    // Link is a forwardRef exotic component (an object), not a plain function
    expect(pkg.Link).toBeDefined();
    expect(typeof pkg.Navigate).toBe('function');
    expect(typeof pkg.useNavigate).toBe('function');
    expect(typeof pkg.useTypedParams).toBe('function');
    expect(typeof pkg.buildPath).toBe('function');
  });
});

describe('SSR sanity', () => {
  test('renderToString renders <Link> without a DOM', () => {
    const html = renderToString(
      <MemoryRouter>
        <Link to="/blog/[id]" params={{ id: 42 }} searchParams={{ ref: 'x' }}>
          Post
        </Link>
      </MemoryRouter>,
    );
    expect(html).toContain('href="/blog/42?ref=x"');
  });
});
