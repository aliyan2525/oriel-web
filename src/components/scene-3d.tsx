import type { CSSProperties } from "react";

const ORBIT_ANGLES = [0, 120, 240];

/**
 * Decorative CSS 3D scene: a rotating cube, three agents orbiting it, and a tilted ring.
 * Pure CSS transforms, so it runs on the GPU and needs no JavaScript or WebGL.
 */
export function Scene3D() {
  return (
    <div className="scene" aria-hidden="true">
      <span className="scene-ring" />
      <div className="scene-orbit">
        {ORBIT_ANGLES.map((angle) => (
          <span key={angle} className="scene-orb" style={{ "--angle": `${angle}deg` } as CSSProperties} />
        ))}
      </div>
      <div className="scene-cube">
        <span className="cube-face cube-face--front" />
        <span className="cube-face cube-face--back" />
        <span className="cube-face cube-face--right" />
        <span className="cube-face cube-face--left" />
        <span className="cube-face cube-face--top" />
        <span className="cube-face cube-face--bottom" />
      </div>
    </div>
  );
}
