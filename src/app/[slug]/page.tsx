import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { LazyFlowDiagram, LazyBorderBeam } from "@/components/lazy";
import { FadeIn } from "@/components/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Block, getPage, pages } from "@/content/pages";

type Params = Promise<{ slug: string }>;

const DISPLAY = "font-semibold leading-[1.05] tracking-[-0.035em] text-night";
const SECTION = "container py-20 md:py-28";
const H2 = `text-[clamp(1.9rem,3.6vw,2.75rem)] ${DISPLAY}`;

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
        <section className={SECTION}>
          {block.title && <h2 className={`mb-10 ${H2}`}>{block.title}</h2>}
          <ul className="grid gap-5 md:grid-cols-3">
            {block.items.map((item, i) => (
              <li key={item.title}>
                <FadeIn inView delay={i * 0.08} className="h-full">
                  <Card className="spot h-full rounded-3xl border-lilac/70 bg-white/80 py-0 shadow-[0_24px_48px_-36px_rgba(38,33,92,0.45)] backdrop-blur-xl">
                    <CardHeader className="gap-3 px-7 pt-7">
                      <h3 className="text-lg font-semibold text-night">{item.title}</h3>
                    </CardHeader>
                    <CardContent className="px-7 pb-7">
                      <p className="leading-relaxed text-graphite">{item.body}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              </li>
            ))}
          </ul>
        </section>
      );

    case "steps":
      return (
        <section className={`${SECTION} border-y border-lilac/60 bg-white/60`}>
          {block.title && <h2 className={`mb-12 ${H2}`}>{block.title}</h2>}
          <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {block.items.map((item, i) => (
              <li key={item.title}>
                <FadeIn inView delay={i * 0.1}>
                  <span className="grid size-11 place-items-center rounded-full bg-indigo font-semibold text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-night">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-graphite">{item.body}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </section>
      );

    case "prose":
      return (
        <section className={SECTION}>
          <div className="mx-auto max-w-[68ch] space-y-5 text-[1.0625rem] leading-relaxed text-graphite">
            {block.title && <h2 className={`${H2} mb-2`}>{block.title}</h2>}
            {block.paragraphs.map((text) => (
              <FadeIn inView key={text}>
                <p>{text}</p>
              </FadeIn>
            ))}
          </div>
        </section>
      );

    case "tiers":
      return (
        <section className={`${SECTION} border-y border-lilac/60 bg-white/60`}>
          <ul className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {block.items.map((tier, i) => (
              <li key={tier.name} className="relative">
                <FadeIn inView delay={i * 0.1} className="h-full">
                  <div className={`relative h-full overflow-hidden rounded-3xl ${tier.featured ? "ring-1 ring-indigo/30" : ""}`}>
                    {tier.featured && <LazyBorderBeam size={200} duration={8} colorFrom="#534AB7" colorTo="#EF9F27" />}
                    <Card className="h-full rounded-3xl border-lilac/70 bg-white/85 py-0 shadow-[0_24px_48px_-36px_rgba(38,33,92,0.45)]">
                      <CardHeader className="gap-2 px-8 pt-8">
                        <h3 className="text-xl font-semibold text-night">{tier.name}</h3>
                        <p className="text-4xl font-semibold tracking-[-0.03em] text-night">{tier.price}</p>
                        <p className="text-graphite">{tier.body}</p>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-7 px-8 pb-8">
                        <ul className="grid gap-3">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex gap-3 text-graphite">
                              <Check className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden="true" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button asChild size="lg" variant={tier.featured ? "default" : "outline"} className="mt-auto">
                          <Link href={tier.href}>{tier.cta}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ul>
        </section>
      );

    case "faq":
      return (
        <section className={SECTION}>
          <div className="mx-auto max-w-[68ch]">
            {block.title && <h2 className={`mb-8 ${H2}`}>{block.title}</h2>}
            <div className="grid gap-3">
              {block.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-lilac/70 bg-white/80 p-5 transition-colors open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-night">
                    {item.q}
                    <ChevronDown className="size-5 shrink-0 text-indigo transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-graphite">{item.a}</p>
                </details>
              ))}
            </div>
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
      <section className="page-container pb-12 pt-20 md:pt-28">
        <FadeIn>
          <Badge variant="outline" className="rounded-full border-lilac bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo">
            {page.eyebrow}
          </Badge>
          <h1 className={`mt-6 max-w-3xl text-[clamp(2.5rem,5.6vw,4.25rem)] ${DISPLAY}`}>{page.headline}</h1>
          <p className="mt-6 max-w-[42ch] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-graphite">{page.subhead}</p>
        </FadeIn>
        {page.slug === "how-it-works" && (
          <div className="mt-14">
            <LazyFlowDiagram />
          </div>
        )}
      </section>

      {page.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}

      {page.cta && (
        <section className="page-container pb-24 md:pb-32">
          <div className="flex flex-col items-start gap-6 rounded-[32px] border border-lilac/70 bg-white/80 p-8 shadow-[0_24px_48px_-36px_rgba(38,33,92,0.45)] md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className={`max-w-xl text-[clamp(1.6rem,3vw,2.25rem)] ${DISPLAY}`}>{page.cta.headline}</h2>
            <Button asChild size="lg">
              <Link href={page.cta.href}>{page.cta.label}</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
