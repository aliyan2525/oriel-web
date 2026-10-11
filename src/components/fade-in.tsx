"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A fade-and-rise reveal in pure CSS, with no animation runtime. With `inView`, it waits until the
 * element is near the viewport. Reduced-motion visitors see the content immediately.
 */
export function FadeIn({
  children,
  delay = 0,
  inView = false,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  inView?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!inView);

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}s` }}
      className={`${className} ${shown ? "animate-fade-up" : "opacity-0"} motion-reduce:animate-none motion-reduce:opacity-100`}
    >
      {children}
    </div>
  );
}
