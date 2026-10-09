import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { type Block, getPage, pages } from "@/content/pages";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = getPage((await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.subhead };
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "cards":
      return (
        <section className="section">
          <div className="container">
            {block.title && (
              <div className="section-head">
                <h2>{block.title}</h2>
              </div>
            )}
            <div className="grid grid-3">
              {block.items.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    case "steps":
      return (
        <section className="section section-alt">
          <div className="container">
            {block.title && (
              <div className="section-head">
                <h2>{block.title}</h2>
              </div>
            )}
            <ol className="steps">
              {block.items.map((item, i) => (
                <li className="step" key={item.title}>
                  <span className="step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    case "prose":
      return (
        <section className="section">
          <div className="container prose">
            {block.title && <h2>{block.title}</h2>}
            {block.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </section>
      );
    case "tiers":
      return (
        <section className="section section-alt">
          <div className="container grid grid-3">
            {block.items.map((tier) => (
              <article className={tier.featured ? "card tier-featured" : "card"} key={tier.name}>
                <h3>{tier.name}</h3>
                <p className="price">{tier.price}</p>
                <p>{tier.body}</p>
                <ul>
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link className={tier.featured ? "button button-primary" : "button button-secondary"} href={tier.href}>
                  {tier.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="section">
          <div className="container prose">
            {block.title && <h2>{block.title}</h2>}
            {block.items.map((item) => (
              <details className="faq" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      );
  }
}

export default async function ContentPage({ params }: { params: Params }) {
  const page = getPage((await params).slug);
  if (!page) notFound();

  return (
    <>
      <section className="hero hero-compact">
        <div className="container">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.headline}</h1>
          <p className="lead">{page.subhead}</p>
        </div>
      </section>

      {page.blocks.map((block, i) => (
        <Reveal key={i}>
          <BlockView block={block} />
        </Reveal>
      ))}

      {page.cta && (
        <section className="section section-alt">
          <div className="container cta-band">
            <h2>{page.cta.headline}</h2>
            <Link className="button button-primary" href={page.cta.href}>
              {page.cta.label}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
