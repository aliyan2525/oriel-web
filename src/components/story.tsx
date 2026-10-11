"use client";

import { useEffect, useRef, useState } from "react";
import { StoryWindow, type StoryStep } from "./story-window";
import { WordReveal } from "./word-reveal";

const STEPS: { key: StoryStep; title: string; body: string }[] = [
  { key: "ask", title: "Ask", body: "Tell your agent what you need, in one sentence." },
  { key: "propose", title: "Propose", body: "It works with your friends' agents, inside the scopes you set." },
  { key: "approve", title: "Approve", body: "You see one proposal. Nothing happens until you say yes." },
  { key: "review", title: "Review", body: "Every step is recorded, so you always know what was agreed." },
];

/**
 * A pinned, scroll-scrubbed story on desktop (GSAP ScrollTrigger, pinned for one screen per step).
 * On smaller screens and for reduced motion, the steps stack and nothing pins.
 */
export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    // GSAP loads once the story is near the viewport, not on the first paint.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import("@/lib/gsap").then(({ setupGsap, ScrollTrigger }) => {
          if (cancelled) return;
          const gsap = setupGsap();
          const media = gsap.matchMedia();
          media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
            setPinned(true);
            const trigger = ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: `+=${STEPS.length * 100}%`,
              pin: true,
              scrub: 0.6,
              onUpdate: (self) => {
                // setActive bails out when the step is unchanged, so this re-renders at most four times.
                setActive(Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length)));
                if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
              },
            });
            return () => {
              trigger.kill();
              setPinned(false);
            };
          });
          teardown = () => media.revert();
        });
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      teardown?.();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="How Oriel works" className="relative overflow-hidden bg-white/50">
      <span
        ref={progressRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-linear-to-r from-indigo to-amber"
        style={{ transform: "scaleX(0)" }}
      />
      <div className="page-container grid min-h-svh items-center gap-12 py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex justify-center">
          <StoryWindow step={STEPS[active].key} />
        </div>
        <div>
          <p className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-night">
            <WordReveal
              text="Plans shouldn't take twenty messages. Your agent can coordinate them, and it asks before anything happens."
              mode="scroll"
            />
          </p>
          <ol className="mt-10 grid gap-3">
            {STEPS.map((step, i) => (
              <li
                key={step.key}
                data-active={!pinned || i === active}
                className="flex gap-4 rounded-2xl border border-transparent p-4 transition duration-300 data-[active=true]:border-lilac data-[active=true]:bg-white/85 data-[active=false]:opacity-55"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-mist font-semibold text-indigo"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-night">{step.title}</h3>
                  <p className="mt-1 text-graphite">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
