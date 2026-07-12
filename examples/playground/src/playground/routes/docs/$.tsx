import { useParams } from '@modern-js/runtime/router';

export default function DocsSplat() {
  const params = useParams();
  return <h1>docs-splat:{params['*']}</h1>;
}
