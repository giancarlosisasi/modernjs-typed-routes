import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: `useTypedParams` on a splat route — remainder under the `'*'` key. */
export default function DocsSplat() {
  const params = useTypedParams('/docs/$');
  return (
    <div>
      <h1>docs-splat:{params['*']}</h1>
      <p>
        Convention: nested splat (docs/$.tsx) — the URL remainder arrives in the
        '*' param.
      </p>
    </div>
  );
}
