import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: config routes (modern.routes.ts) are typed like any other. */
export default function PromoPage() {
  const { code } = useTypedParams('/promo/[code]');
  return (
    <div>
      <h1>promo:{code}</h1>
      <p>
        Convention: config route — added in modern.routes.ts (not a file-system
        route), typed like any other.
      </p>
    </div>
  );
}
