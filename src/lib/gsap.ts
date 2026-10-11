import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeLenis } from "@/lib/smooth-scroll";

let initialised = false;

/**
 * One-time GSAP setup for the marketing site. Registers ScrollTrigger and keeps it in step with
 * Lenis, so pinned and scrubbed sections track the smooth-scrolled position exactly.
 */
export function setupGsap(): typeof gsap {
  if (initialised) return gsap;
  initialised = true;
  gsap.registerPlugin(ScrollTrigger);

  let detach: (() => void) | undefined;
  subscribeLenis((lenis) => {
    detach?.();
    detach = undefined;
    if (!lenis) return;
    const sync = () => ScrollTrigger.update();
    lenis.on("scroll", sync);
    detach = () => lenis.off("scroll", sync);
  });
  return gsap;
}

export { gsap, ScrollTrigger };
