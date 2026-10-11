import { describe, expect, it } from "vitest";
import { dprRange, shouldRender3D } from "./gate";

describe("shouldRender3D", () => {
  it("renders the 3D window only when motion is allowed, WebGL exists, and nothing has failed", () => {
    expect(shouldRender3D({ reducedMotion: false, webgl: true, failed: false })).toBe(true);
    expect(shouldRender3D({ reducedMotion: true, webgl: true, failed: false })).toBe(false);
    expect(shouldRender3D({ reducedMotion: false, webgl: false, failed: false })).toBe(false);
    expect(shouldRender3D({ reducedMotion: false, webgl: true, failed: true })).toBe(false);
  });
});

describe("dprRange", () => {
  it("caps the pixel ratio lower on touch screens", () => {
    expect(dprRange(true)).toEqual([1, 1.5]);
    expect(dprRange(false)).toEqual([1, 2]);
  });
});
