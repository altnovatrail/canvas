import { expect, test } from "vitest";
import { CROP, cropOf } from "./crop.js";
import { groupsOf } from "./groups.js";
import { digestOf, marksOf, placesOf } from "./marks.js";
import { pictureOf } from "./raster.js";
import { SHEETS, staircase } from "./sheets.fixture.js";
import { workForCheck } from "./submission.js";

// The work for checking that exportWork() gives (R27), on the synthetic sheets: the crop's PNG and
// the context of the submission, as the rules of the groups, the crop and the marks make them.

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
  const frozen = (value: unknown): boolean =>
    typeof value !== "object" ||
    value === null ||
    (Object.isFrozen(value) && Object.values(value).every(frozen));
  expect(Object.isFrozen(checked)).toBe(true);
  expect(frozen(checked.submission)).toBe(true);
  const marks = marksOf(
    JSON.parse(
      JSON.stringify({
        submission: checked.submission,
        marks: [{ kind: "frame", at: { group: "A" }, name: "here" }],
      }),
    ),
  );
  const [placed] = placesOf(marks, work.strokes);
  expect(placed?.ids).toEqual(checked.submission.groups[0]?.ids);
});

test("is null on an empty sheet: it goes to no check", () => {
  expect(workForCheck([], CROP.digit)).toBeNull();
});
