import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>This page isn&apos;t in anyone&apos;s calendar.</h1>
        <p className="lead">The link may be old, or the page may have moved.</p>
        <div className="cta-row">
          <Link className="button button-primary" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
