// Mirrors docs/guide/navigation.md §useNavigate() — one file for the four
// code blocks of that section (destructure, navigateTo, createUrl,
// originalNavigate); call lines are verbatim. The component wrapper is
// scaffolding (hooks need a component context), and the `goBack()` call
// covers the prose-only §goBack() (docs show no code block for it).
import { useNavigate } from 'modernjs-typed-routes';

export function UseNavigateExamples() {
  const { navigateTo, createUrl, goBack, originalNavigate } = useNavigate();

  // §navigateTo(path, options?)
  navigateTo('/about');
  navigateTo('/blog/[id]', { params: { id: 42 } });
  navigateTo('/blog', { searchParams: { page: 2 }, replace: true });
  navigateTo('/checkout', { state: { from: 'cart' } });

  // §createUrl(path, options?)
  const url = createUrl('/blog/[id]', {
    params: { id: 42 },
    searchParams: { utm_source: 'newsletter' },
  });
  window.open(url, '_blank', 'noopener,noreferrer');

  // §goBack()
  goBack();

  // §originalNavigate
  originalNavigate('../sibling', { relative: 'path' });

  return null;
}
