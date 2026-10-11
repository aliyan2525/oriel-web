import type Lenis from "lenis";

/*
 * A tiny publish/subscribe for the one Lenis instance. The smooth-scroll component owns the
 * instance. Scroll-linked code (the hero's ScrollTrigger) subscribes so it can stay in step.
 */
type Listener = (lenis: Lenis | null) => void;

let current: Lenis | null = null;
const listeners = new Set<Listener>();

export function setLenis(lenis: Lenis | null) {
  current = lenis;
  listeners.forEach((listener) => listener(lenis));
}

/** Calls the listener now with the current instance, then again whenever it changes. */
export function subscribeLenis(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
