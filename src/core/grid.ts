import { SHEET } from "./sheet.js";

/**
 * How a task rules the sheet (concepts 8 spec): in squares, in lines or in dots, as concepts 16.1
 * spec's illustration names them.
 */
export type GridKind = "squares" | "lines" | "dots";

/** The grid of a sheet: its kind and its step, in sheet units. */
export interface Grid {
  readonly kind: GridKind;
  readonly step: number;
}

export const GRID_KINDS: readonly GridKind[] = ["squares", "lines", "dots"];

/** The step of a grid whose task gives none, in units: canvas-api's square (R06). */
export const GRID_STEP = 50;
/**
 * The steps a task may give, in units. A finer grid would be thousands of dots, and one wider than
 * half the sheet rules nothing much.
 */
export const GRID_STEP_MIN = 20;
export const GRID_STEP_MAX = 500;

/**
 * The grid of a sheet whose task gives none, or that has no task: squares of 50 units. concepts 8
 * spec knows no sheet without a grid (R23).
 */
export const DEFAULT_GRID: Grid = Object.freeze({ kind: "squares", step: GRID_STEP });

/**
 * A grid's path in SVG, in sheet units: a line along every ruling, strictly inside the sheet, or,
 * for dots, a dot where two rulings cross — a subpath of no length, which a round cap draws as a
 * dot.
 */
export function gridPath(grid: Grid): string {
  const xs = rulings(grid.step, SHEET.width);
  const ys = rulings(grid.step, SHEET.height);
  const down = xs.map((x) => `M${x} 0V${SHEET.height}`);
  const across = ys.map((y) => `M0 ${y}H${SHEET.width}`);
  switch (grid.kind) {
    case "squares":
      return [...down, ...across].join("");
    case "lines":
      return across.join("");
    case "dots":
      return ys.flatMap((y) => xs.map((x) => `M${x} ${y}h0`)).join("");
  }
}

/**
 * Where the rulings of a step lie along a side of the sheet, inside it: each one i × step, worked
 * out apart rather than summed, so that no error builds up, and rounded to a thousandth of a unit.
 */
function rulings(step: number, length: number): number[] {
  const places: number[] = [];
  for (let i = 1; ; i++) {
    const place = Math.round(i * step * 1000) / 1000;
    if (place >= length) return places;
    places.push(place);
  }
}
