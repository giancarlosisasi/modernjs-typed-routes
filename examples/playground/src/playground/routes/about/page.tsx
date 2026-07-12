export default function AboutPage() {
  return (
    <div>
      <h1>about</h1>
      <p>
        Convention: static route (about/page.tsx) — but modern.routes.ts
        overrides it, so this component never renders.
      </p>
    </div>
  );
}
