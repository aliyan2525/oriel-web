"use client";

import { useEffect, useRef } from "react";

type Props = { text: string; mode?: "load" | "scroll"; className?: string };

/**
 * A sentence whose words animate in.
 * - "load" is pure CSS: each word fades up in sequence on first paint. No JavaScript is needed.
 * - "scroll" scrubs with the page. GSAP loads only when the sentence nears the viewport.
 * Screen readers hear the full sentence once; the animated words are hidden from assistive tech.
 * Reduced-motion visitors see the sentence fully formed.
 */
export function WordReveal({ text, mode = "scroll", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const root = ref.current;
    if (mode !== "scroll" || !root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    let cancelled = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import("@/lib/gsap").then(({ setupGsap, ScrollTrigger }) => {
          if (cancelled) return;
          const gsap = setupGsap();
          const targets = root.querySelectorAll<HTMLElement>(".word");
          const ctx = gsap.context(() => {
            gsap.fromTo(
              targets,
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.15,
                scrollTrigger: { trigger: root, start: "top 85%", end: "bottom 45%", scrub: true },
              },
            );
          }, root);
          revert = () => {
            ctx.revert();
            ScrollTrigger.refresh();
          };
        });
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      revert?.();
    };
  }, [mode, text]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${i}-${word}`}>
            <span
              className={`word inline-block ${mode === "load" ? "animate-fade-up motion-reduce:animate-none" : ""}`}
              style={mode === "load" ? { animationDelay: `${0.1 + i * 0.07}s` } : undefined}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
