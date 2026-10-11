import { Vector3 } from "three";

/*
 * Pure geometry and gating for the hero window. No DOM access, so it's unit-tested in node.
 *
 * Units: the glass card is 300 px wide and 380 px tall in CSS. It maps to 2 scene units wide,
 * so the card's outline is exact in scene space and the canvas can sit behind the card.
 */

export const CARD_ASPECT = 380 / 300;
const PX_TO_UNITS = 2 / 300;

const HALF_WIDTH = 1;
const TOP_Y = CARD_ASPECT; // half the card's height
const BOTTOM_Y = -TOP_Y;
const SPRING_Y = TOP_Y - HALF_WIDTH; // where the arch's curve begins (card radius = half width)
const SILL_HALF = HALF_WIDTH + 22 * PX_TO_UNITS; // the sill overhangs the card by 22 px

export const ARCH = {
  halfWidth: HALF_WIDTH,
  topY: TOP_Y,
  bottomY: BOTTOM_Y,
  springY: SPRING_Y,
  sillHalf: SILL_HALF,
} as const;

export const FRAME = {
  tubeRadius: 0.011,
  sillRadius: 0.016,
  tubularSegments: 240,
  radialSegments: 8,
  arcSteps: 72,
} as const;

/** The canvas is inset -14% on every side, so it covers 128% of the card. */
export const CANVAS_SCALE = 1.28;
export const CAMERA_FOV = 28;

/** Camera distance at which the canvas's visible height matches the card's scaled height. */
export function cameraDistance(): number {
  const visibleHeight = (TOP_Y - BOTTOM_Y) * CANVAS_SCALE;
  return visibleHeight / (2 * Math.tan((CAMERA_FOV * Math.PI) / 360));
}

/**
 * Points along the arch, from the bottom-left corner up the left side, over the top,
 * and down the right side to the bottom-right corner. Traversal order is what makes the
 * draw-on reveal work (see revealCount).
 */
export function archPoints(steps: number = FRAME.arcSteps): Vector3[] {
  const points: Vector3[] = [
    new Vector3(-HALF_WIDTH, BOTTOM_Y, 0),
    new Vector3(-HALF_WIDTH, SPRING_Y, 0),
  ];
  for (let i = 1; i < steps; i++) {
    const theta = Math.PI - (Math.PI * i) / steps;
    points.push(new Vector3(HALF_WIDTH * Math.cos(theta), SPRING_Y + HALF_WIDTH * Math.sin(theta), 0));
  }
  points.push(new Vector3(HALF_WIDTH, SPRING_Y, 0), new Vector3(HALF_WIDTH, BOTTOM_Y, 0));
  return points;
}

/**
 * How many indices of a TubeGeometry to draw for a given progress (0 to 1).
 * TubeGeometry emits its quads in path order, six indices each, so a prefix of the index
 * buffer is a prefix of the path. The count is always whole triangles.
 */
export function revealCount(progress: number, indexCount: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.floor((indexCount * p) / 3) * 3;
}
