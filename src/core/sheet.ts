/**
 * The task's page on the handwriting sheet in logical units: 1000 wide and 1400 tall, at the
 * sheet's top left corner, the origin, with y pointing down, one scale on both axes. Every
 * layer of the sheet counts in these units, whatever the device's screen; the task's zones, the
 * workbook's lines and the areas of a worked example lie on the page.
 */
export const SHEET = Object.freeze({ width: 1000, height: 1400 } as const);

/**
 * How far the sheet goes from its origin, in units: ten pages across and ten down. The learner
 * writes past the page, to the right of it and below it, and a point beyond this is no point of a
 * history: the bound keeps the rules' whole numbers small and a history's numbers sane.
 */
export const REACH = Object.freeze({ width: 10000, height: 14000 } as const);

/** A size on the sheet, in units. */
export interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * The sheet as large as it is laid out: the page, and past it and past the furthest ink a
 * `room` more — the part of the sheet in sight, so that there is always somewhere to move it to and
 * write —, within `REACH`. `ink` is the right and the bottom of the furthest strokes, none for an
 * empty sheet.
 */
export function extentOf(
  ink: { readonly maxX: number; readonly maxY: number } | undefined,
  room: Size,
): Size {
  const right = Math.max(SHEET.width, ink?.maxX ?? 0);
  const bottom = Math.max(SHEET.height, ink?.maxY ?? 0);
  return {
    width: Math.min(REACH.width, Math.ceil(right + room.width)),
    height: Math.min(REACH.height, Math.ceil(bottom + room.height)),
  };
}

/**
 * The bytes of a work's picture at most, before its encoding: the page's rows at a pixel a unit,
 * each with its filter byte, which keep its PNG within the page's bound of bytes.
 */
export const PICTURE_BYTES = (SHEET.width + 1) * SHEET.height;

/**
 * The picture of a work: the page, and the ink past it, right and down, with no room past the
 * ink, at a pixel a unit while its rows hold no more than `PICTURE_BYTES`, and scaled down to hold
 * them otherwise. `scale` is pixels a unit.
 */
export function pictureOf(ink: { readonly maxX: number; readonly maxY: number } | undefined): {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
} {
  const { width, height } = extentOf(ink, { width: 0, height: 0 });
  // The scale s whose rows, (width s + 1) × height s, are PICTURE_BYTES: the root of a quadratic.
  const area = width * height;
  const fit = (Math.sqrt(height * height + 4 * area * PICTURE_BYTES) - height) / (2 * area);
  const scale = Math.min(1, fit);
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
    scale,
  };
}
