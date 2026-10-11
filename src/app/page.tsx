import Link from "next/link";
import { Bot, CircleCheck, KeyRound, ListOrdered, ShieldCheck, type LucideIcon } from "lucide-react";
import { HeroScene } from "@/components/hero-scene/hero-scene";
import { Marquee } from "@/components/magic/marquee";
import { Story } from "@/components/story";
import { FadeIn } from "@/components/fade-in";
import { LazyAurora, LazyBorderBeam } from "@/components/lazy";
import { WordReveal } from "@/components/word-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DISPLAY = "font-semibold leading-[1.05] tracking-[-0.035em] text-night";
const KICKER = "text-xs font-semibold uppercase tracking-[0.12em] text-indigo";

const PRINCIPLES = [
  "Plans, not messages",
  "Scoped sharing",
  "Your keys, your models",
  "Approval before action",
  "A record, not a summary",
];

const tiles: { title: string; body: string; span: 4 | 2; icon: LucideIcon }[] = [
  { title: "A personal agent", body: "It remembers only what you choose to share, and you can edit or delete any of it.", span: 4, icon: Bot },
  { title: "Scoped sharing", body: "Each friend sees only the level you set for them.", span: 2, icon: ShieldCheck },
  { title: "Approvals first", body: "Nothing leaves the room, and nothing is spent, without your tap.", span: 2, icon: CircleCheck },
  { title: "A searchable record", body: "Every agent message is logged with the scope that allowed it.", span: 2, icon: ListOrdered },
  { title: "Your own keys", body: "Bring your own model. Keys are encrypted and never shown again.", span: 2, icon: KeyRound },
];

const scopes = [
  { name: "Sara", scope: "Availability", on: true },
  { name: "Ali", scope: "Plans and interests", on: true },
  { name: "Zain", scope: "Nothing beyond the invite", on: false },
];

const decisions = [
  { title: "Book a table", state: "Waiting for you", tone: "waiting" },
  { title: "Send the invite", state: "Approved by you", tone: "approved" },
] as const;

const timeline = [
  { time: "09:12", text: "Your agent proposed Thursday, 8:00 pm." },
  { time: "09:13", text: "Sara's agent confirmed availability within its scope." },
  { time: "09:14", text: "Zain's agent shared nothing beyond the invite." },
  { time: "09:20", text: "You approved the plan." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <LazyAurora
          colors={["#CECBF6", "#EF9F27", "#534AB7", "#F6F5F0"]}
          className="absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
        />
        <div className="page-container grid items-center gap-12 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <FadeIn delay={0.05}>
              <Badge variant="outline" className="gap-2 rounded-full border-lilac bg-white/70 px-3 py-1 text-xs font-semibold text-indigo">
                <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
                Personal AI, shared with your people
              </Badge>
            </FadeIn>
            <h1 className={`mt-6 text-[clamp(2.75rem,6.4vw,5rem)] ${DISPLAY}`}>
              <WordReveal text="Your AI, meeting your friends' AI." mode="load" />
            </h1>
            <FadeIn delay={0.45}>
              <p className="mt-6 max-w-[40ch] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-graphite">
                Oriel makes plans with the people you trust, and asks you before anything happens.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">Sign up free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} className="w-full">
            <HeroScene />
          </FadeIn>
        </div>
      </section>

      <div role="region" aria-label="Oriel principles" className="border-y border-lilac/60 bg-white/50 py-5">
        <ul className="sr-only">
          {PRINCIPLES.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <Marquee pauseOnHover className="[--duration:42s]">
          {PRINCIPLES.map((text) => (
            <span key={text} className="mx-8 flex items-center gap-8 whitespace-nowrap text-xl font-semibold text-night md:text-2xl">
              {text}
              <span aria-hidden="true" className="text-amber">
                ✦
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      <section className="page-container py-24 md:py-32">
        <FadeIn inView>
          <p className={KICKER}>Built around control</p>
        </FadeIn>
        <FadeIn inView delay={0.05}>
          <h2 className={`mt-3 text-[clamp(2rem,4.2vw,3.25rem)] ${DISPLAY}`}>Everything, in one calm place.</h2>
        </FadeIn>
        <ul className="mt-14 grid gap-4 md:grid-cols-6">
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <li key={tile.title} className={tile.span === 4 ? "md:col-span-4" : "md:col-span-2"}>
                <FadeIn inView delay={i * 0.08} className="h-full">
                  <article className="spot relative h-full overflow-hidden rounded-3xl border border-lilac/70 bg-white/75 p-7 shadow-[0_24px_48px_-36px_rgba(38,33,92,0.45)] backdrop-blur-xl transition duration-500 hover:-translate-y-1">
                    <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-mist text-indigo">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold text-night">{tile.title}</h3>
                    <p className="mt-2 leading-relaxed text-graphite">{tile.body}</p>
                  </article>
                </FadeIn>
              </li>
            );
          })}
        </ul>
      </section>

      <Story />

      <section className="page-container py-24 md:py-32">
        <h2 className={`max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] ${DISPLAY}`}>
          <WordReveal text="Scopes, not secrets." mode="scroll" />
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite">
          <WordReveal text="Each friend sees only what you allow: availability, plans, or nothing at all, one category at a time." mode="scroll" />
        </p>
        <ul className="mt-12 grid max-w-2xl gap-4">
          {scopes.map((row, i) => (
            <li key={row.name}>
              <FadeIn inView delay={i * 0.1}>
                <div className="spot flex items-center gap-4 rounded-2xl border border-lilac/70 bg-white/80 p-4 md:p-5">
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-mist font-semibold text-indigo">
                    {row.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-night">{row.name}</p>
                    <p className="text-sm text-graphite">{row.scope}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={row.on ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-stone-50 text-stone-600"}
                  >
                    {row.on ? "Shared" : "Off"}
                  </Badge>
                </div>
              </FadeIn>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-lilac/60 bg-white/60 py-24 md:py-32">
        <div className="page-container">
          <h2 className={`max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] ${DISPLAY}`}>
            <WordReveal text="Approvals, not surprises." mode="scroll" />
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite">
            <WordReveal text="Sending, booking, and accepting always wait for you. Requests time out, so nothing fires late." mode="scroll" />
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {decisions.map((d, i) => (
              <FadeIn inView key={d.title} delay={i * 0.12}>
                <article
                  className={`spot rounded-3xl border p-7 ${
                    d.tone === "waiting" ? "border-amber/50 bg-amber-50" : "border-emerald-300 bg-emerald-50/70"
                  }`}
                >
                  <p className="text-lg font-semibold text-night">{d.title}</p>
                  <p className={`mt-2 text-sm font-semibold ${d.tone === "waiting" ? "text-[#854f0b]" : "text-emerald-800"}`}>
                    {d.state}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-24 md:py-32">
        <h2 className={`max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] ${DISPLAY}`}>
          <WordReveal text="A record, not a summary." mode="scroll" />
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite">
          <WordReveal text="Ask what your agent told a friend's agent, and get the exact record with the scope that allowed it." mode="scroll" />
        </p>
        <ol className="relative mt-14 max-w-2xl space-y-7 border-l border-lilac pl-8">
          {timeline.map((entry, i) => (
            <li key={entry.time} className="relative">
              <FadeIn inView delay={i * 0.1}>
                <span aria-hidden="true" className="absolute -left-[37px] top-2 size-2.5 rounded-full bg-indigo ring-4 ring-paper" />
                <span className="font-mono text-sm text-indigo">{entry.time}</span>
                <p className="mt-1 text-lg text-night">{entry.text}</p>
              </FadeIn>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-container pb-24 md:pb-32">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-night px-8 py-16 text-center text-white md:px-16 md:py-20">
          <LazyAurora
            colors={["#26215C", "#534AB7", "#EF9F27", "#26215C"]}
            className="absolute inset-0 -z-10 opacity-50"
          />
          <LazyBorderBeam size={260} duration={9} colorFrom="#EF9F27" colorTo="#CECBF6" />
          <h2 className={`mx-auto max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)] text-white ${DISPLAY}`}>
            <WordReveal text="Plans, not messages." mode="scroll" />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Create an account, then invite your friends with a link.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">Sign up free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
