"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { HeroArt } from "@/components/hero-art";
import { subscribeLenis } from "@/lib/smooth-scroll";
import { shouldRender3D } from "./gate";

// The 3D code loads only in the browser, after the 2D card has painted.
const HeroCanvas = dynamic(() => import("./hero-canvas").then((m) => m.HeroCanvas), { ssr: false });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero's glass window. It renders the 2D card first. When motion is allowed and WebGL
 * works, a 3D frame and glow mount behind the card, sharing its tilt and float.
 */
export function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(shouldRender3D({ reducedMotion, webgl: hasWebGL(), failed: false }));
  }, []);

  // Pause rendering while the hero is off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll: as the hero leaves the viewport, the window eases back and shrinks a little.
  // GSAP loads after the first paint, so it stays out of the initial JavaScript.
  // With smooth scrolling on, ScrollTrigger updates on every Lenis frame so the two stay in step.
  useEffect(() => {
    const el = rootRef.current;
    const section = el?.closest("section");
    if (!el || !section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let detachLenis: (() => void) | undefined;
    let teardown: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, stModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.default;
      const { ScrollTrigger } = stModule;
      gsap.registerPlugin(ScrollTrigger);

      const unsubscribe = subscribeLenis((lenis) => {
        detachLenis?.();
        detachLenis = undefined;
        if (!lenis) return;
        const sync = () => ScrollTrigger.update();
        lenis.on("scroll", sync);
        detachLenis = () => lenis.off("scroll", sync);
      });

      const ctx = gsap.context(() => {
        gsap.to(el, {
          yPercent: -6,
          scale: 0.97,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
        });
      }, el);

      teardown = () => {
        unsubscribe();
        detachLenis?.();
        ctx.revert();
      };
    });

    return () => {
      cancelled = true;
      detachLenis?.();
      teardown?.();
    };
  }, []);

  const canvas =
    enabled && !failed ? (
      <HeroCanvas
        active={visible}
        onReady={() => setReady(true)}
        onFail={() => {
          setFailed(true);
          setReady(false);
        }}
      />
    ) : null;

  return (
    <div ref={rootRef} className={`hero-scene${ready ? " is-3d" : ""}`}>
      <HeroArt scene={canvas} />
    </div>
  );
}
