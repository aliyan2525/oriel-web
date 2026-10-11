"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setLenis } from "@/lib/smooth-scroll";

/**
 * Smooth wheel scrolling for the marketing site. Off for the signed-in app, which keeps native
 * scrolling, and off for visitors who ask for reduced motion. Touch scrolling stays native.
 */
export function SmoothScroll() {
  const isApp = usePathname().startsWith("/app");

  useEffect(() => {
    if (isApp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.1 });
    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, [isApp]);

  return null;
}
