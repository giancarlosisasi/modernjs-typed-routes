import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: `useTypedParams` on a splat route — remainder under the `'*'` key. */
export default function DocsSplat() {
  const params = useTypedParams('/docs/$');
  return <h1>docs-splat:{params['*']}</h1>;
}
