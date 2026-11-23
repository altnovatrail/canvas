import { SHEET, type Size } from "./sheet.js";

/** How a task rules the sheet: in squares, in lines or in dots. */
export type GridKind = "squares" | "lines" | "dots";

/** The grid of a sheet: its kind and its step, in sheet units. */
export interface Grid {
  readonly kind: GridKind;
  readonly step: number;
}

export const GRID_KINDS: readonly GridKind[] = ["squares", "lines", "dots"];

/** The step of a grid whose task gives none, in units: canvas-api's square. */
export const GRID_STEP = 50;
/**
 * The steps a task may give, in units. A finer grid would be thousands of dots, and one wider than
 * half the sheet rules nothing much.
 */
export const GRID_STEP_MIN = 20;
export const GRID_STEP_MAX = 500;

/**
 * The grid of a sheet whose task gives none, or that has no task: squares of 50 units. spec knows
 * no sheet without a grid.
 */
export const DEFAULT_GRID: Grid = Object.freeze({ kind: "squares", step: GRID_STEP });

/**
 * A grid's path in SVG, in sheet units: a line along every ruling, strictly inside the sheet as
 * large as `size` — the page, unless the sheet is laid out larger —, or, for dots, a dot where two
 * rulings cross — a subpath of no length, which a round cap draws as a dot.
 */
export function gridPath(grid: Grid, size: Size = SHEET): string {
  const xs = rulings(grid.step, size.width);
  const ys = rulings(grid.step, size.height);
  const down = xs.map((x) => `M${x} 0V${size.height}`);
  const across = ys.map((y) => `M0 ${y}H${size.width}`);
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

/**
 * A grid's path on a band of the sheet across its whole width, from `top` to `bottom` in units,
 * either of them past the sheet: its rulings at the step's multiples within the band, both ends
 * taken, so that they go on from the sheet's own above or below it.
 */
export function gridBand(grid: Grid, width: number, top: number, bottom: number): string {
  const xs = rulings(grid.step, width);
  const ys: number[] = [];
  for (let i = Math.ceil(top / grid.step - 1e-9); ; i++) {
    const place = Math.round(i * grid.step * 1000) / 1000;
    if (place > bottom) break;
    ys.push(place);
  }
  const down = xs.map((x) => `M${x} ${top}V${bottom}`);
  const across = ys.map((y) => `M0 ${y}H${width}`);
  switch (grid.kind) {
    case "squares":
      return [...down, ...across].join("");
    case "lines":
      return across.join("");
    case "dots":
      return ys.flatMap((y) => xs.map((x) => `M${x} ${y}h0`)).join("");
  }
}
