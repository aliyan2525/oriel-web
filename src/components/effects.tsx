"use client";

import { useEffect } from "react";

/**
 * Site-wide polish: a scroll progress line, and a soft light that follows the pointer across cards.
 * Both update CSS variables directly, so they never trigger React renders. Fine pointers only.
 */
export function Effects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        document.documentElement.style.setProperty("--scroll", ratio.toFixed(4));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const fine = window.matchMedia("(pointer: fine)").matches && !reduce;
    let moveFrame = 0;
    const onMove = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(".spot");
      if (!target || moveFrame) return;
      moveFrame = requestAnimationFrame(() => {
        moveFrame = 0;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        target.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };
    if (fine) document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (fine) document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(moveFrame);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
