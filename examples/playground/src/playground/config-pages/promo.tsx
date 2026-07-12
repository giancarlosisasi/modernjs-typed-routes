import { useParams } from '@modern-js/runtime/router';

export default function PromoPage() {
  const params = useParams();
  return <h1>promo:{params.code}</h1>;
}
