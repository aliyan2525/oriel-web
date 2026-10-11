import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { ARCH, FRAME, archPoints, cameraDistance, revealCount } from "./scene-math";

describe("archPoints", () => {
  const pts = archPoints();

  it("starts and ends at the bottom corners of the card", () => {
    expect(pts[0].x).toBeCloseTo(-1);
    expect(pts[0].y).toBeCloseTo(ARCH.bottomY);
    const last = pts[pts.length - 1];
    expect(last.x).toBeCloseTo(1);
    expect(last.y).toBeCloseTo(ARCH.bottomY);
  });

  it("reaches the top of the card at the centre", () => {
    expect(Math.max(...pts.map((p) => p.y))).toBeCloseTo(ARCH.topY, 6);
  });

  it("keeps every point on or inside the card outline", () => {
    for (const p of pts) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(1 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(ARCH.bottomY - 1e-9);
      expect(p.y).toBeLessThanOrEqual(ARCH.topY + 1e-9);
    }
  });

  it("follows the curve: every point above the springline is one radius from its centre", () => {
    for (const p of pts) {
      if (p.y >= ARCH.springY - 1e-9) {
        expect(Math.hypot(p.x, p.y - ARCH.springY)).toBeCloseTo(1, 6);
      }
    }
  });
});

describe("revealCount", () => {
  const geometry = new THREE.TubeGeometry(
    new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)),
    FRAME.tubularSegments,
    0.01,
    FRAME.radialSegments,
    false,
  );
  const total = geometry.index!.count;

  it("matches the tube's index layout: six indices per quad", () => {
    expect(total).toBe(FRAME.tubularSegments * FRAME.radialSegments * 6);
  });

  it("is zero at the start and the full count at the end", () => {
    expect(revealCount(0, total)).toBe(0);
    expect(revealCount(1, total)).toBe(total);
  });

  it("always draws whole triangles", () => {
    for (const p of [0.01, 0.137, 0.5, 0.863, 0.99]) {
      expect(revealCount(p, total) % 3).toBe(0);
    }
  });

  it("clamps progress outside 0 to 1", () => {
    expect(revealCount(-0.4, total)).toBe(0);
    expect(revealCount(1.7, total)).toBe(total);
  });

  it("reveals along the path: the first half of the indices only touches the first half of the rings", () => {
    const index = geometry.index!.array as ArrayLike<number>;
    const half = revealCount(0.5, total);
    let maxVertex = 0;
    for (let i = 0; i < half; i++) maxVertex = Math.max(maxVertex, index[i]);
    const ringSize = FRAME.radialSegments + 1;
    expect(maxVertex).toBeLessThan(ringSize * (FRAME.tubularSegments / 2 + 2));
  });
});

describe("cameraDistance", () => {
  it("frames the canvas so its visible height matches the scaled card height", () => {
    expect(cameraDistance()).toBeCloseTo(6.5, 1);
  });
});
