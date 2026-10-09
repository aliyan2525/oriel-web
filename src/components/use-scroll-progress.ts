import { useEffect, useRef, type RefObject } from "react";

type Options = {
  /** Element whose position drives progress. */
  measure: RefObject<HTMLElement | null>;
  /** Element that receives the --p custom property. */
  write: RefObject<HTMLElement | null>;
  /** "reveal": progress as the element enters the viewport. "pin": progress through a tall section. */
  mode: "reveal" | "pin";
  onChange?: (progress: number) => void;
};

/**
 * Writes scroll progress (0 to 1) into a CSS custom property. Updates go straight to the
 * DOM through requestAnimationFrame, so scrolling never triggers React re-renders.
 * Under reduced motion the progress is fixed at 1, so all content shows in its final state.
 */
export function useScrollProgress({ measure, write, mode, onChange }: Options) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const target = measure.current;
    const out = write.current;
    if (!target || !out) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      out.style.setProperty("--p", "1");
      onChangeRef.current?.(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw =
        mode === "reveal"
          ? (0.9 * vh - rect.top) / (0.55 * vh)
          : -rect.top / Math.max(1, rect.height - vh);
      const p = Math.min(1, Math.max(0, raw));
      out.style.setProperty("--p", p.toFixed(3));
      onChangeRef.current?.(p);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [measure, write, mode]);
}
