import { useTypedParams } from 'modernjs-typed-routes';

/** Dogfood: config routes (modern.routes.ts) are typed like any other. */
export default function PromoPage() {
  const { code } = useTypedParams('/promo/[code]');
  return <h1>promo:{code}</h1>;
}
