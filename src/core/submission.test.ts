import { describe, expect, test } from "vitest";
import { type Cell, tableOf } from "./boxes.js";
import { CROP, cropOf } from "./crop.js";
import { groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import { digestOf, marksOf, placesOf, workbookDigestOf } from "./marks.js";
import { adler32, crc32 } from "./png.js";
import { pictureOf } from "./raster.js";
import { SHEETS, staircase, stroke } from "./sheets.fixture.js";
import { cellsForCheck, workForCheck } from "./submission.js";
import { DENSITIES, WORKBOOKS } from "./workbooks.fixture.js";

// The work for checking that exportWork() gives (R27, R38), on the synthetic sheets and workbooks:
// the crop's PNG, or each filled box's, and the context of the submission, as the rules of the
// groups, the boxes, the crop and the marks make them.

/** Whether a value is frozen through, as the context of a submission is. */
function frozen(value: unknown): boolean {
  return (
    typeof value !== "object" ||
    value === null ||
    (Object.isFrozen(value) && Object.values(value).every(frozen))
  );
}

/** The value as a store that keeps JSON gives it back. */
function stored<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

test("is the crop's PNG and the context of its submission, as the rules make them", () => {
  for (const make of SHEETS) {
    const { name, work } = make();
    const strokes = work.strokes;
    for (const digit of CROP.heights) {
      const checked = workForCheck(strokes, digit);
      if (checked === null) throw new Error(`${name} has no crop`);
      const groups = groupsOf(strokes);
      const crop = cropOf(strokes, groups, digit);
      if (crop === null) throw new Error(`${name} has no crop`);
      expect(checked.png, name).toEqual(pictureOf(strokes, crop));
      const { submission } = checked;
      expect(submission.groups, name).toEqual(groups);
      // Of the crop, only the numbers the marks are placed by: its heights and line are not.
      expect(Object.keys(submission.crop).sort(), name).toEqual(
        ["drawn", "exact", "frames", "height", "margins", "sheetBox", "width"].sort(),
      );
      const { drawn, width, height, margins, sheetBox, frames, exact } = crop;
      expect(submission.crop, name).toEqual({
        drawn,
        width,
        height,
        margins,
        sheetBox,
        frames,
        exact,
      });
      expect(submission.digest, name).toBe(digestOf(strokes, crop, groups));
    }
  }
});

test("is frozen through, and comes back to the sheet through JSON", () => {
  const { work } = staircase();
  const checked = workForCheck(work.strokes, CROP.digit);
  if (checked === null) throw new Error("no crop");
  expect(Object.isFrozen(checked)).toBe(true);
  expect(frozen(checked.submission)).toBe(true);
  const marks = marksOf(
    stored({
      submission: checked.submission,
      marks: [{ kind: "frame", at: { group: "A" }, name: "here" }],
    }),
  );
  const [placed] = placesOf(marks, work.strokes);
  expect(placed?.ids).toEqual(checked.submission.groups[0]?.ids);
});

test("is null on an empty sheet: it goes to no check", () => {
  expect(workForCheck([], CROP.digit)).toBeNull();
});

describe("the work of a workbook", () => {
  /** A box of a page of its own, 100 × 100 units at `left`, `top`. */
  const cell = (item: number, slot: number, left: number, top: number): Cell => ({
    item,
    slot,
    box: { left, top, width: 100, height: 100 },
  });
  /** A line down a box: a «1» 60 units high, its middle at (x, y). */
  const one = (id: number, x: number, y: number, t = 1000 * id): Stroke =>
    stroke(id, [x, y - 30, t], [x, y + 30, t + 200]);
  const CELLS = [cell(1, 1, 100, 100), cell(1, 2, 300, 100), cell(2, 1, 100, 300)];
  // Box 1.2 written before box 1.1, and a stroke of draft far from every box.
  const STROKES = [one(1, 350, 150), one(2, 140, 150), one(3, 160, 150), one(4, 700, 900)];

  test("is the crop of each filled box and the context of its submission, as the rules make them", () => {
    for (const make of WORKBOOKS) {
      for (const density of [DENSITIES[0], DENSITIES[2]]) {
        const { name, work, cells } = make(density);
        const strokes = work.strokes;
        const table = tableOf(strokes, cells);
        for (const digit of CROP.heights) {
          const checked = cellsForCheck(strokes, cells, digit);
          if (checked === null) throw new Error(`${name} has no box filled`);
          expect(
            checked.cells.map(({ item, slot }) => [item, slot]),
            name,
          ).toEqual(table.map(({ item, slot }) => [item, slot]));
          for (const [n, { ids }] of table.entries()) {
            // The box's strokes alone, one group of them, drawn by the crop's rule (R25).
            const own = strokes.filter(({ id }) => ids.includes(id));
            const crop = cropOf(own, [{ label: "A", ids }], digit);
            if (crop === null) throw new Error(`${name}: a filled box has no crop`);
            expect(checked.cells[n]?.png, name).toEqual(pictureOf(own, crop));
          }
          expect(Object.keys(checked.submission).sort(), name).toEqual(["boxes", "digest"]);
          expect(checked.submission.boxes, name).toEqual(table);
          const sent = strokes.filter(({ id }) => table.some(({ ids }) => ids.includes(id)));
          expect(checked.submission.digest, name).toBe(workbookDigestOf(sent, table, cells));
        }
      }
    }
  });

  test("goes in the task's order, whatever order the boxes were written in, and leaves the draft", () => {
    const checked = cellsForCheck(STROKES, CELLS, CROP.digit);
    expect(checked?.cells.map(({ item, slot }) => [item, slot])).toEqual([
      [1, 1],
      [1, 2],
    ]);
    expect(checked?.submission.boxes).toEqual([
      { item: 1, slot: 1, ids: [2, 3] },
      { item: 1, slot: 2, ids: [1] },
    ]);
    // A box's crop is its strokes' alone: the lower bound of R25, 200 px a side.
    const own = STROKES.slice(0, 1);
    const crop = cropOf(own, [{ label: "A", ids: [1] }]);
    if (crop === null) throw new Error("the box has no crop");
    expect([crop.width, crop.height]).toEqual([200, 200]);
    expect(checked?.cells[1]?.png).toEqual(pictureOf(own, crop));
  });

  test("is null when no box is filled, though the page holds draft: it goes to no check", () => {
    expect(cellsForCheck([], CELLS, CROP.digit)).toBeNull();
    expect(cellsForCheck(STROKES.slice(3), CELLS, CROP.digit)).toBeNull();
  });

  test("is frozen — the crops, not their bytes, and the context through — and its context keeps through JSON", () => {
    const checked = cellsForCheck(STROKES, CELLS, CROP.digit);
    if (checked === null) throw new Error("no box filled");
    expect(Object.isFrozen(checked)).toBe(true);
    expect(Object.isFrozen(checked.cells)).toBe(true);
    expect(checked.cells.every((each) => Object.isFrozen(each))).toBe(true);
    expect(frozen(checked.submission)).toBe(true);
    expect(stored(checked.submission)).toEqual(checked.submission);
  });

  test("has a digest of the table's strokes, every box of the page and the table", () => {
    const digestOf = (strokes: readonly Stroke[], cells: readonly Cell[] = CELLS) =>
      cellsForCheck(strokes, cells, CROP.digit)?.submission.digest;
    const digest = digestOf(STROKES);
    // The text of R38: the table's strokes by ID, in tenths and milliseconds, every box of the
    // page, and the table's rows; the CRC-32 and the Adler-32 of its UTF-8.
    const text = [
      "1;3500,1200,1000;3500,1800,1200",
      "2;1400,1200,2000;1400,1800,2200",
      "3;1600,1200,3000;1600,1800,3200",
      "cell 1 1 100 100 100 100",
      "cell 1 2 300 100 100 100",
      "cell 2 1 100 300 100 100",
      "box 1 1 2,3",
      "box 1 2 1",
    ].join("\n");
    const bytes = new TextEncoder().encode(text);
    const hex = (sum: number) => sum.toString(16).padStart(8, "0");
    expect(digest).toBe(hex(crc32(bytes)) + hex(adler32(bytes)));
    expect(digest).toBe("1296483d107b261e");
    // Draft is not in it, nor the height of a digit: no number of a crop is.
    expect(digestOf(STROKES.slice(0, 3))).toBe(digest);
    expect(cellsForCheck(STROKES, CELLS, 48)?.submission.digest).toBe(digest);
    // A point a tenth away, a stroke in another box, a box of another layout: another digest.
    const moved = [one(1, 350.1, 150, 1000), ...STROKES.slice(1)];
    const across = [one(1, 150, 350), ...STROKES.slice(1)];
    const another = [...CELLS, cell(3, 1, 100, 500)];
    const shifted = [...CELLS.slice(0, 2), cell(2, 1, 100, 301)];
    for (const [strokes, cells] of [
      [moved, CELLS],
      [across, CELLS],
      [STROKES, another],
      [STROKES, shifted],
    ] as const) {
      expect(digestOf(strokes, cells)).not.toBe(digest);
    }
  });
});
