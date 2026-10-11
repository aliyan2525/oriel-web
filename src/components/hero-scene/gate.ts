/*
 * Gating helpers for the hero window. Kept free of three.js imports so the main page bundle
 * stays small: only the lazily loaded canvas pulls in three.
 */

/** Whether the 3D window should mount at all. Reduced motion and missing WebGL keep the 2D card. */
export function shouldRender3D(env: { reducedMotion: boolean; webgl: boolean; failed: boolean }): boolean {
  return !env.reducedMotion && env.webgl && !env.failed;
}

/** Device pixel ratio range: capped lower on touch screens to protect battery and frame rate. */
export function dprRange(coarsePointer: boolean): [number, number] {
  return coarsePointer ? [1, 1.5] : [1, 2];
}
