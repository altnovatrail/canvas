/**
 * A point of a stroke: where it lies on the sheet, in logical units (R06), when it was written and
 * how hard the pointer pressed (R09).
 */
export interface InkPoint {
  /** Across the sheet: 0 at its left edge, `SHEET.width` at its right. */
  readonly x: number;
  /** Down the sheet: 0 at its top edge, `SHEET.height` at its bottom. */
  readonly y: number;
  /** Milliseconds since the sheet's first event: the time of a sample has no date (R09). */
  readonly t: number;
  /** The pressure, 0 to 1, as the pointer reported it (R18). */
  readonly p: number;
}

/** A stroke: one press of a pointer, from going down to coming up (R06, R18). */
export interface Stroke {
  /** The stroke's ID on its sheet: 1, 2, … in the order the strokes began, never reused. */
  readonly id: number;
  /**
   * The pointer's type as the browser reported it — "pen", "touch", "mouse" or whatever else it
   * says (R09). Only a pen's pressure changes the width of the line (R05, R18).
   */
  readonly kind: string;
  /** The points in the order they were written, the first where the pointer went down. */
  readonly points: readonly InkPoint[];
}
