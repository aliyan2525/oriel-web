"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

/**
 * A slow mesh gradient in brand colours, drawn with Paper Shaders (Apache-2.0).
 * It pauses while off-screen and holds still for visitors who ask for reduced motion.
 */
export function Aurora({ colors, className = "" }: { colors: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      <MeshGradient
        width="100%"
        height="100%"
        colors={colors}
        distortion={0.6}
        swirl={0.35}
        speed={still || !visible ? 0 : 0.35}
      />
    </div>
  );
}
