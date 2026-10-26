import { describe, expect, test } from "vitest";
import { CROP, type Crop, cropOf } from "./crop.js";
import { type Box, boxOf, tenths } from "./geometry.js";
import { groupsOf } from "./groups.js";
import type { HistoryEvent } from "./history.js";
import type { Stroke } from "./ink.js";
import {
  type Mark,
  type Marks,
  marksOf,
  placesOf,
  SNAP_RULE,
  type SnapRule,
  type Submission,
  shownOf,
  snapOf,
} from "./marks.js";
import {
  answer,
  CROP_SHEETS,
  crowd,
  Hand,
  limit,
  random,
  SHEETS,
  staircase,
  stroke,
  whole,
} from "./sheets.fixture.js";

// The tutor's marks on the sheet (R26), on strokes code draws, as every test's strokes are
// (CLAUDE.md): the synthetic sheets, crowded sheets of a seeded generator, and a few strokes of a
// test's own. A submission is what the element is to give with its crop (T15): the crop's numbers
// and the groups. The rule of snapping is checked against the rule written out once more in
// BigInt from its words — the box laid on the sheet by the crop's sheet_box — where nothing rounds.

const SHEETS_OF_THE_MARKS = [...SHEETS, ...CROP_SHEETS];

const DIGITS = CROP.heights;

type Fractions = readonly [number, number, number, number];

/** What the element is to give with its crop at `digit` (T15): the crop's numbers and the groups. */
function submissionOf(
  strokes: readonly Stroke[],
  digit: number = CROP.digit,
): Submission & { crop: Crop } {
  const groups = groupsOf(strokes);
  const crop = cropOf(strokes, groups, digit);
  if (crop === null) throw new Error("the sheet has no crop");
  return { crop, groups };
}

/** Every stroke a history wrote, erased or not: what the sheet has known. */
function knownOf(history: readonly HistoryEvent[]): Stroke[] {
  return history.flatMap((event) => (event.kind === "write" ? [event.stroke] : []));
}

/**
 * The box of a stroke's points by its ID while the sheet shows it: not erased, nor among the
 * `hidden`, which the eraser under way has taken from the screen.
 */
function onScreen(strokes: readonly Stroke[], hidden: ReadonlySet<number> = new Set()) {
  const shown = new Map(strokes.map((stroke) => [stroke.id, stroke]));
  return (id: number): Box | undefined => {
    const stroke = hidden.has(id) ? undefined : shown.get(id);
    return stroke && boxOf(stroke.points);
  };
}

/** A frame at a box of the crop. */
function frameAt(box: Fractions, name = "the place the model named"): Mark {
  return { kind: "frame", at: { box }, name };
}

/** The frame of the group `label` on the crop. */
function frameOf(crop: Crop, label: string): Fractions {
  const frame = crop.frames.find((each) => each.label === label);
  if (frame === undefined) throw new Error(`no group ${label}`);
  return frame.box;
}

/** The same sheet in another hand: other IDs, the strokes in another order, each one backwards. */
function otherwise(strokes: readonly Stroke[]): Stroke[] {
  return strokes
    .map((each) => ({ ...each, id: 1000 - each.id, points: [...each.points].reverse() }))
    .sort((a, b) => ((a.id * 13) % 23) - ((b.id * 13) % 23));
}

/** A box of whole thousandths from a seed's numbers: min < max, anywhere on the crop. */
function boxFrom(next: () => number): Fractions {
  const pair = (): [number, number] => {
    const a = Math.floor(next() * 1001);
    const b = Math.floor(next() * 1001);
    if (a !== b) return [Math.min(a, b), Math.max(a, b)];
    return a === 1000 ? [999, 1000] : [a, a + 1];
  };
  const [ymin, ymax] = pair();
  const [xmin, xmax] = pair();
  return [ymin, xmin, ymax, xmax];
}

/**
 * An edge of a box, in whole thousandths, where the widened edge falls on a whole tenth: the left
 * edge for −1, the right for 1. There 1000 × ((px − B.xmin) × D′ + mx × H) = (fx × w ± margin × D′)
 * × H.
 */
function edgeOn(crop: Crop, side: -1 | 1): { fx: number; px: number } {
  const {
    drawn,
    width,
    margins: [, left],
    exact: { box, median: unit },
  } = crop;
  for (let fx = 1; fx < 1000; fx++) {
    const across = (fx * width + side * SNAP_RULE.margin * drawn) * unit - 1000 * left * unit;
    const px = box.minX + across / (1000 * drawn);
    if (across > 0 && across % (1000 * drawn) === 0 && px <= 10 * 1000) return { fx, px };
  }
  throw new Error("no edge falls on a whole tenth");
}

describe("the snapping", () => {
  test("takes a point on the edge of the widened box, and not one a tenth of a unit past it", () => {
    const { crop } = submissionOf(staircase().work.strokes);
    const y = (crop.exact.box.minY + crop.exact.box.maxY) / 20;
    const west = edgeOn(crop, -1);
    const east = edgeOn(crop, 1);
    for (const px of [west.px, east.px]) expect(tenths(px / 10)).toBe(px);
    const at = (id: number, px: number) => stroke(id, [px / 10, y, 0]);
    expect(snapOf([0, west.fx, 1000, 1000], crop, [at(1, west.px), at(2, west.px - 1)])).toEqual([
      1,
    ]);
    expect(snapOf([0, 0, 1000, east.fx], crop, [at(1, east.px), at(2, east.px + 1)])).toEqual([1]);
  });

  test("takes a stroke with two thirds of its points in the box, not one with less, nor one with none at a share of 0", () => {
    const { crop } = submissionOf(staircase().work.strokes);
    const frame = frameOf(crop, "A");
    const [ymin, xmin, ymax, xmax] = frame;
    const [top, left, bottom, right] = crop.sheetBox;
    // A place in the middle of the frame of A, and one far off the crop.
    const x = left + ((xmin + xmax) / 2000) * (right - left);
    const y = top + ((ymin + ymax) / 2000) * (bottom - top);
    const twoOfThree = stroke(1, [x, y, 0], [x, y, 10], [990, 1390, 20]);
    const half = stroke(2, [x, y, 0], [990, 1390, 10]);
    const none = stroke(3, [990, 1390, 0]);
    const strokes = [twoOfThree, half, none];
    expect(snapOf(frame, crop, strokes)).toEqual([1]);
    expect(snapOf(frame, crop, strokes, { margin: 250, share: [1, 2] })).toEqual([1, 2]);
    expect(snapOf(frame, crop, strokes, { margin: 250, share: [0, 1] })).toEqual([1, 2]);
    expect(snapOf(frame, crop, strokes, { margin: 250, share: [1, 1] })).toEqual([]);
  });

  test("with the frame of a group takes at least its strokes, at every height and margin", () => {
    for (const make of SHEETS_OF_THE_MARKS) {
      const { name, work } = make();
      for (const digit of DIGITS) {
        const { crop, groups } = submissionOf(work.strokes, digit);
        for (const margin of [0, 125, 250, 500]) {
          for (const { label, ids } of groups) {
            const taken = snapOf(frameOf(crop, label), crop, work.strokes, {
              margin,
              share: [1, 1],
            });
            expect(taken, `${name}, ${digit} px, ${margin}, ${label}`).toEqual(
              expect.arrayContaining([...ids]),
            );
          }
        }
      }
    }
  });

  test("with a larger box takes no fewer strokes", () => {
    for (const seed of Array.from({ length: 60 }, (_, n) => n + 1)) {
      const strokes = crowd(seed);
      const { crop } = submissionOf(strokes);
      const next = random(seed + 500);
      for (let n = 0; n < 10; n++) {
        const [ymin, xmin, ymax, xmax] = boxFrom(next);
        const grown: Fractions = [
          Math.max(ymin - Math.floor(next() * 100), 0),
          Math.max(xmin - Math.floor(next() * 100), 0),
          Math.min(ymax + Math.floor(next() * 100), 1000),
          Math.min(xmax + Math.floor(next() * 100), 1000),
        ];
        const rule: SnapRule = { margin: 250, share: [0, 1] };
        const small = snapOf([ymin, xmin, ymax, xmax], crop, strokes, rule);
        expect(snapOf(grown, crop, strokes, rule), `seed ${seed}`).toEqual(
          expect.arrayContaining(small),
        );
      }
    }
  });

  test("takes the same wherever the work lies on the sheet, at its edge too", () => {
    const strokes = staircase().work.strokes;
    const { crop } = submissionOf(strokes);
    const points = strokes.flatMap(({ points }) => points);
    const minX = Math.min(...points.map(({ x }) => x));
    const minY = Math.min(...points.map(({ y }) => y));
    const maxY = Math.max(...points.map(({ y }) => y));
    const lower = Math.floor(1400 - maxY);
    for (const [dx, dy] of [
      [-minX, -minY],
      [3.7, 0],
      [0, lower],
      [-minX, lower - 0.1],
    ] as const) {
      const moved = strokes.map((each) => ({
        ...each,
        points: each.points.map((point) => ({
          ...point,
          x: (tenths(point.x) + tenths(dx)) / 10,
          y: (tenths(point.y) + tenths(dy)) / 10,
        })),
      }));
      const there = submissionOf(moved).crop;
      expect(there.frames).toEqual(crop.frames);
      expect([there.width, there.height, there.margins]).toEqual([
        crop.width,
        crop.height,
        crop.margins,
      ]);
      const next = random(7);
      for (let n = 0; n < 40; n++) {
        const box = boxFrom(next);
        expect(snapOf(box, there, moved), `${dx}, ${dy}`).toEqual(snapOf(box, crop, strokes));
      }
    }
  });

  test("widens a box in the margin past the sheet's edge first, so it takes the ink at the edge", () => {
    // A line at the sheet's left edge: the crop's margin lies past the edge, off the sheet.
    const hand = new Hand();
    hand.line(0, 100, 0, 136);
    const { crop } = submissionOf(hand.work.strokes);
    expect(crop.sheetBox[1]).toBeLessThan(0);
    // A box in the margin, a px short of the ink.
    const box: Fractions = [0, 0, 1000, Math.floor((1000 * (crop.margins[1] - 1)) / crop.width)];
    expect(snapOf(box, crop, hand.work.strokes)).toEqual([1]);
    expect(snapOf(box, crop, hand.work.strokes, { margin: 0, share: [2, 3] })).toEqual([]);
  });

  test("is checked: a margin of whole thousandths from 0 to 1000, and a share no more than 1", () => {
    const { crop } = submissionOf(staircase().work.strokes);
    const bad: SnapRule[] = [
      { margin: -1, share: [2, 3] },
      { margin: 1001, share: [2, 3] },
      { margin: 0.5, share: [2, 3] },
      { margin: 250, share: [-1, 3] },
      { margin: 250, share: [4, 3] },
      { margin: 250, share: [1, 0] },
      { margin: 250, share: [1, 1001] },
      { margin: 250, share: [0.5, 2] },
      { margin: 250, share: [Number.NaN, 2] },
    ];
    for (const rule of bad) {
      expect(() => snapOf([0, 0, 1000, 1000], crop, [], rule), JSON.stringify(rule)).toThrow(
        RangeError,
      );
    }
    expect(Object.isFrozen(SNAP_RULE)).toBe(true);
  });
});

describe("a mark", () => {
  /** A sheet of «12» and «3» apart, sent for checking. */
  function sent() {
    const hand = new Hand();
    const twelve = hand.write("12", 100, 100);
    hand.wait(3000);
    const three = hand.write("3", 400, 100);
    return { hand, twelve, three, submission: submissionOf(hand.work.strokes) };
  }

  test("holds the strokes its box takes, as the model saw them; what is written after is none of it", () => {
    const { hand, twelve, submission } = sent();
    hand.wait(3000);
    // Written after the submission, over «12».
    const later = hand.write("1", 120, 104);
    const [first, ...rest] = twelve;
    hand.erase([first ?? 0]);
    const known = knownOf(hand.work.history);
    const [placed] = placesOf(
      { submission, marks: [frameAt(frameOf(submission.crop, "A"))] },
      known,
    );
    if (placed === null || placed === undefined) throw new Error("no place");
    expect(placed.ids).toEqual(twelve);
    expect(placed.ids.some((id) => later.includes(id))).toBe(false);
    const points = known.filter(({ id }) => twelve.includes(id)).flatMap(({ points }) => points);
    expect(placed.box).toEqual(boxOf(points));
    // On the sheet it shows what is left of «12».
    const left = hand.work.strokes.filter(({ id }) => rest.includes(id));
    expect(shownOf(placed, onScreen(hand.work.strokes))).toEqual(
      boxOf(left.flatMap(({ points }) => points)),
    );
  });

  test("of a group holds its strokes by the table, and one of an answer cell holds none yet", () => {
    const { hand, twelve, submission } = sent();
    const places = placesOf(
      {
        submission,
        marks: [
          { kind: "frame", at: { group: "A" }, name: "this" },
          { kind: "frame", at: { cell: "answer" }, name: "the answer" },
        ],
      },
      knownOf(hand.work.history),
    );
    expect(places[0]?.ids).toEqual(twelve);
    expect(places[1]).toBeNull();
  });

  test("of a box over empty paper has no place", () => {
    const { hand, submission } = sent();
    const marks: Marks = { submission, marks: [frameAt([0, 0, 1, 1])] };
    expect(placesOf(marks, knownOf(hand.work.history))).toEqual([null]);
  });

  test("shows its strokes as they are now: fewer as they are erased, none when all are, all again with undo", () => {
    const { hand, twelve, submission } = sent();
    const [placed] = placesOf(
      { submission, marks: [{ kind: "frame", at: { group: "A" }, name: "this" }] },
      knownOf(hand.work.history),
    );
    if (placed === null || placed === undefined) throw new Error("no place");
    const all = shownOf(placed, onScreen(hand.work.strokes));
    expect(all).toEqual(placed.box);
    hand.wait(3000);
    hand.write("4", 104, 102);
    expect(shownOf(placed, onScreen(hand.work.strokes))).toEqual(all);
    // The eraser under way has them off the screen already.
    expect(shownOf(placed, onScreen(hand.work.strokes, new Set(twelve)))).toBeNull();
    hand.erase(twelve);
    expect(shownOf(placed, onScreen(hand.work.strokes))).toBeNull();
    hand.undo();
    expect(shownOf(placed, onScreen(hand.work.strokes))).toEqual(all);
    hand.clear();
    expect(shownOf(placed, onScreen(hand.work.strokes))).toBeNull();
    hand.undo();
    expect(shownOf(placed, onScreen(hand.work.strokes))).toEqual(all);
  });

  test("comes the same whatever the IDs and the order of the strokes, the way each went, and a trip through JSON", () => {
    for (const make of SHEETS) {
      const { name, work } = make();
      const strokes = work.strokes;
      const other = otherwise(strokes);
      const submission = submissionOf(strokes);
      const theirs = submissionOf(other);
      expect(theirs.crop.frames, name).toEqual(submission.crop.frames);
      const next = random(11);
      const marks = Array.from({ length: 20 }, () => frameAt(boxFrom(next)));
      const mine = placesOf({ submission, marks }, strokes);
      const given = marksOf(JSON.parse(JSON.stringify({ submission: theirs, marks })));
      const back = placesOf(given, other).map(
        (placed) =>
          placed && { ...placed, ids: placed.ids.map((id) => 1000 - id).sort((a, b) => a - b) },
      );
      expect(back, name).toEqual(mine);
    }
  });

  test("comes back to its own sheet after erasing, undo and clearing, and to no other", () => {
    const { hand, twelve, three, submission } = sent();
    hand.erase(twelve);
    hand.clear();
    hand.undo();
    hand.undo();
    hand.clear();
    const marks: Marks = { submission, marks: [frameAt(frameOf(submission.crop, "B"))] };
    expect(placesOf(marks, knownOf(hand.work.history))[0]?.ids).toEqual(three);
    // Another element's sheet: strokes of the same IDs, elsewhere.
    const other = new Hand();
    other.write("12", 600, 900);
    other.wait(3000);
    other.write("3", 100, 400);
    expect(() => placesOf(marks, knownOf(other.work.history))).toThrow(TypeError);
    expect(() => placesOf(marks, knownOf(other.work.history))).toThrow(/not this sheet's/);
    // A sheet that has known none of them.
    expect(() => placesOf(marks, [])).toThrow(/not this sheet's/);
  });
});

describe("the marks given", () => {
  const hand = new Hand();
  hand.write("12", 100, 100);
  hand.wait(3000);
  hand.write("3", 400, 100);
  const submission = submissionOf(hand.work.strokes);
  const good: Marks = {
    submission,
    marks: [
      { kind: "frame", at: { group: "A" }, name: "this" },
      { kind: "frame", at: { box: [100, 100, 900, 900] }, name: "that" },
      { kind: "frame", at: { cell: "answer" }, name: "the answer" },
    ],
  };

  /** A copy of the good marks through JSON, with values set at paths of fields: undefined takes one out. */
  function changed(...changes: [readonly (string | number)[], unknown][]): unknown {
    const copy: unknown = JSON.parse(JSON.stringify(good));
    for (const [path, value] of changes) {
      let at = copy as Record<string | number, unknown>;
      for (const key of path.slice(0, -1)) at = at[key] as Record<string | number, unknown>;
      const last = path.at(-1) ?? "";
      if (value === undefined) Reflect.deleteProperty(at, last);
      else at[last] = value;
    }
    return copy;
  }

  test("are taken as they are, fields the sheet does not read passed over", () => {
    const given = marksOf(
      changed(
        [["extra"], 1],
        [["marks", 0, "colour"], "blue"],
        [["submission", "crop", "extra"], true],
      ),
    );
    expect(given.marks).toEqual(good.marks);
    expect(given.submission.groups).toEqual(submission.groups);
    expect(given.submission.crop.sheetBox).toEqual(submission.crop.sheetBox);
    expect(given.submission.crop.frames).toEqual(submission.crop.frames);
    // A sheet_box a store kept to fewer digits than JSON: the crop's whole numbers stand.
    const rounded = marksOf(
      changed([
        ["submission", "crop", "sheetBox"],
        submission.crop.sheetBox.map((v) => Number(v.toFixed(7))),
      ]),
    );
    expect(rounded.submission.crop.sheetBox).toEqual(submission.crop.sheetBox);
  });

  test("are a TypeError, which names the field, when they are not the marks of a submission", () => {
    const [a, b] = submission.groups;
    const sheetBox = submission.crop.sheetBox;
    const cases: [unknown, RegExp][] = [
      [null, /^marks: an object/],
      [undefined, /^marks: an object/],
      [changed([["marks"], "all"]), /^marks\.marks: a list/],
      [changed([["marks", 0, "kind"], "underline"]), /^marks\.marks\[0\]\.kind/],
      [changed([["marks", 0, "name"], " "]), /^marks\.marks\[0\]\.name/],
      [changed([["marks", 1, "name"], undefined]), /^marks\.marks\[1\]\.name/],
      [changed([["marks", 0, "at", "cell"], "x"]), /^marks\.marks\[0\]\.at: one of/],
      [changed([["marks", 0, "at"], {}]), /^marks\.marks\[0\]\.at: one of/],
      [changed([["marks", 0, "at", "group"], "Z"]), /^marks\.marks\[0\]\.at\.group/],
      [changed([["marks", 2, "at", "cell"], ""]), /^marks\.marks\[2\]\.at\.cell/],
      [
        changed([
          ["marks", 1, "at", "box"],
          [100, 100, 100, 900],
        ]),
        /^marks\.marks\[1\]\.at\.box/,
      ],
      [
        changed([
          ["marks", 1, "at", "box"],
          [100, 100, 900.5, 900],
        ]),
        /^marks\.marks\[1\]\.at\.box/,
      ],
      [
        changed([
          ["marks", 1, "at", "box"],
          [100, 100, 900, 1001],
        ]),
        /^marks\.marks\[1\]\.at\.box/,
      ],
      [
        changed([
          ["marks", 1, "at", "box"],
          [100, 100, 900],
        ]),
        /^marks\.marks\[1\]\.at\.box/,
      ],
      [changed([["submission", "groups"], []]), /^marks\.submission\.groups:/],
      [
        changed([["submission", "groups", 1, "label"], "A"]),
        /^marks\.submission\.groups\[1\]\.label/,
      ],
      [
        changed([
          ["submission", "groups", 1, "ids"],
          [...(b?.ids ?? []), a?.ids[0]],
        ]),
        /^marks\.submission\.groups\[1\]\.ids/,
      ],
      [changed([["submission", "groups", 0, "ids"], []]), /^marks\.submission\.groups\[0\]\.ids/],
      [changed([["submission", "crop", "drawn"], 0]), /^marks\.submission\.crop\.drawn/],
      [changed([["submission", "crop", "width"], 199]), /^marks\.submission\.crop\.width/],
      [changed([["submission", "crop", "margins"], [12]]), /^marks\.submission\.crop\.margins/],
      [
        changed([["submission", "crop", "exact", "median"], 149]),
        /^marks\.submission\.crop\.exact\.median/,
      ],
      [
        changed([["submission", "crop", "exact", "box", "minX"], -1]),
        /^marks\.submission\.crop\.exact\.box\.minX/,
      ],
      [
        changed([["submission", "crop", "sheetBox", 0], sheetBox[0] + 1e-3]),
        /^marks\.submission\.crop\.sheetBox/,
      ],
      [
        changed([["submission", "crop", "frames"], submission.crop.frames.slice(0, -1)]),
        /^marks\.submission\.crop\.frames:/,
      ],
      [
        changed([["submission", "crop", "frames", 0, "label"], "B"]),
        /^marks\.submission\.crop\.frames\[0\]\.label/,
      ],
      [
        changed([
          ["submission", "crop", "frames", 0, "box"],
          [0, 0, 0, 0],
        ]),
        /^marks\.submission\.crop\.frames\[0\]\.box/,
      ],
    ];
    for (const [value, message] of cases) {
      expect(() => marksOf(value), String(message)).toThrow(TypeError);
      expect(() => marksOf(value), String(message)).toThrow(message);
    }
  });
});

const big = (value: number): bigint => BigInt(value);

/**
 * The rule written out once more, from its words (R26): the box laid on the sheet by the crop's
 * `sheet_box` and widened there by H × margin / 1000 tenths, in exact fractions over 1000 × D′
 * tenths; a stroke taken with the share of its points in it, and one at least.
 */
function reference(
  box: Fractions,
  crop: Crop,
  strokes: readonly Stroke[],
  rule: SnapRule,
): number[] {
  const d = big(crop.drawn);
  const unit = big(crop.exact.median);
  const [top, left] = crop.margins.map(big) as [bigint, bigint];
  const bx = big(crop.exact.box.minX);
  const by = big(crop.exact.box.minY);
  // sheet_box in tenths: its xmin is (B.xmin × D′ − left × H) / D′, and the crop spans w × H / D′.
  expect(Number(bx * d - left * unit) / Number(10n * d)).toBe(crop.sheetBox[1]);
  expect(Number(by * d - top * unit) / Number(10n * d)).toBe(crop.sheetBox[0]);
  const xmin = 1000n * (bx * d - left * unit);
  const ymin = 1000n * (by * d - top * unit);
  const reach = big(rule.margin) * unit * d;
  const [fy0, fx0, fy1, fx1] = box.map(big) as [bigint, bigint, bigint, bigint];
  const west = xmin + fx0 * big(crop.width) * unit - reach;
  const east = xmin + fx1 * big(crop.width) * unit + reach;
  const north = ymin + fy0 * big(crop.height) * unit - reach;
  const south = ymin + fy1 * big(crop.height) * unit + reach;
  return strokes
    .filter(({ points }) => {
      const inside = points.filter(({ x, y }) => {
        const px = big(tenths(x)) * 1000n * d;
        const py = big(tenths(y)) * 1000n * d;
        return px >= west && px <= east && py >= north && py <= south;
      }).length;
      const [above, below] = rule.share.map(big) as [bigint, bigint];
      return inside > 0 && below * big(inside) >= above * big(points.length);
    })
    .map(({ id }) => id)
    .sort((a, b) => a - b);
}

const RULES: readonly SnapRule[] = [
  SNAP_RULE,
  { margin: 250, share: [1, 2] },
  { margin: 0, share: [1, 1] },
  { margin: 500, share: [0, 1] },
  { margin: 1000, share: [667, 1000] },
];

/**
 * Boxes about a crop's groups, as a model might give them: each frame, the frame shrunk by a
 * quarter of its size on every side, and moved by half its width; a box in the margin left of the
 * first group, past the sheet's edge where the work touches it; and a corner of empty paper.
 */
function boxesAbout(crop: Crop): Fractions[] {
  const boxes: Fractions[] = [];
  for (const { box } of crop.frames) {
    const [ymin, xmin, ymax, xmax] = box;
    const dy = Math.floor((ymax - ymin) / 4);
    const dx = Math.floor((xmax - xmin) / 4);
    const half = Math.floor((xmax - xmin) / 2);
    boxes.push(box, [ymin + dy, xmin + dx, ymax - dy, xmax - dx]);
    if (xmax + half <= 1000) boxes.push([ymin, xmin + half, ymax, xmax + half]);
  }
  const first = crop.frames[0];
  const margin = Math.floor((1000 * (crop.margins[1] - 1)) / crop.width);
  if (first !== undefined && margin > 0) boxes.push([first.box[0], 0, first.box[2], margin]);
  boxes.push([0, 0, 1, 1]);
  return boxes.filter(([ymin, xmin, ymax, xmax]) => ymin < ymax && xmin < xmax);
}

describe("the rule written out once more", () => {
  test("takes the strokes the snapping takes, on crowded sheets, at every height of digit", () => {
    for (const seed of Array.from({ length: 200 }, (_, n) => n + 1)) {
      const strokes = crowd(seed);
      const next = random(seed + 2000);
      for (const digit of [...DIGITS, 1 + Math.floor(next() * 256)]) {
        const { crop } = submissionOf(strokes, digit);
        for (const rule of RULES) {
          for (let n = 0; n < 3; n++) {
            const box = boxFrom(next);
            expect(snapOf(box, crop, strokes, rule), `seed ${seed}, ${digit} px`).toEqual(
              reference(box, crop, strokes, rule),
            );
          }
        }
      }
    }
  });

  test("takes them on the synthetic sheets, by the frames of their groups and boxes about them", () => {
    for (const make of [...SHEETS_OF_THE_MARKS, whole, answer, limit]) {
      const { name, work } = make();
      for (const digit of DIGITS) {
        const { crop } = submissionOf(work.strokes, digit);
        for (const box of boxesAbout(crop)) {
          for (const rule of RULES) {
            expect(snapOf(box, crop, work.strokes, rule), `${name}, ${digit} px`).toEqual(
              reference(box, crop, work.strokes, rule),
            );
          }
        }
      }
    }
  });
});

/** What the test vectors say of themselves (R26). */
const ABOUT =
  "Test vectors of canvas's snapping of a model's box to the strokes, R26 in docs/decisions.md: from a submission — the strokes a sheet showed when its work went for checking, their groups (R24; vectors/groups.json) and the numbers of its crop (R25; vectors/crops.json) — and a box in whole thousandths of the crop to the strokes the box takes. A proposal for the eval protocol, epic E3 in spec's RUN.md: the margin and the share are parameters of eval (C2 of the research «Рукопись ребёнка на канве и ИИ-наставник»), and the protocol's own vectors come in spec's releases.";

/** The rule in words, for a runner to follow: every number it names is a whole one. */
const FORMULAS = {
  tenths:
    "every place is taken in whole tenths of a unit, t(v) = round(10 × v), half up, as the groups and the crop take them (R24, R25)",
  crop: "the crop's numbers, as vectors/crops.json has them: D′ the height its digits are drawn at, its width w and height h in px, its margins [top, left] = [my, mx] in px, B the box of the points in tenths, [ymin, xmin, ymax, xmax], and H the height the scale takes, in tenths",
  place:
    "a point (x, y) in tenths lies on the crop at X = 1000 × ((x − B.xmin) × D′ + mx × H) and Y = 1000 × ((y − B.ymin) × D′ + my × H): its place in px, times 1000 × H",
  inside:
    "a box [ymin, xmin, ymax, xmax] in whole thousandths of the crop's height and width, widened by margin × D′ / 1000 px on every side, holds a point if (xmin × w − margin × D′) × H ≤ X ≤ (xmax × w + margin × D′) × H and (ymin × h − margin × D′) × H ≤ Y ≤ (ymax × h + margin × D′) × H, its edges too",
  taken:
    "a stroke with k of its n points in the box is taken if k ≥ 1 and below × k ≥ above × n, for the rule's share [above, below]: two thirds of its points at least; the strokes taken are listed by ID, ascending",
  sheet:
    "the same as the box laid on the sheet by the crop's sheetBox — x = sheetBox.xmin + xmin / 1000 × (sheetBox.xmax − sheetBox.xmin) — and widened there by H × margin / 1000 tenths, H / 4 at the rule's margin. The box widens first: clipped to the sheet after, it takes the same, for every point lies on the sheet",
  strokes:
    "the strokes are those of the submission, of its groups: a stroke written after it is in none of them, and no box takes it",
  snapped:
    "snapped is the rectangle of the points of the strokes taken, [ymin, xmin, ymax, xmax] in units, or null when the box takes none: the mark has no place on the sheet then",
  numbers:
    "for a stroke of the submission every whole number above stays below 2^31; an int64 holds every one",
};

/** The sheets of the vectors: those of the groups, and a crop at the sheet's corners, one at the least size and one at the limit. */
const VECTOR_SHEETS = [...SHEETS, whole, answer, limit];

/** The test vectors, one line to a stroke and to a box, so that a reader can follow them. */
function vectors(): string {
  const formulas = Object.entries(FORMULAS).map(
    ([key, text], k, all) =>
      `    ${JSON.stringify(key)}: ${JSON.stringify(text)}${k < all.length - 1 ? "," : ""}`,
  );
  const lines = [
    "{",
    `  "about": ${JSON.stringify(ABOUT)},`,
    `  "rule": ${JSON.stringify(SNAP_RULE)},`,
    '  "formulas": {',
    ...formulas,
    "  },",
    '  "cases": [',
  ];
  const listed = <T>(items: readonly T[], show: (item: T) => unknown, indent: string) =>
    items.map(
      (item, k) => `${indent}${JSON.stringify(show(item))}${k < items.length - 1 ? "," : ""}`,
    );
  const asList = (box: Box | null) => box && [box.minY, box.minX, box.maxY, box.maxX];
  VECTOR_SHEETS.forEach((make, n) => {
    const sheet = make();
    const strokes = sheet.work.strokes;
    lines.push(
      "    {",
      `      "name": ${JSON.stringify(sheet.name)},`,
      `      "about": ${JSON.stringify(sheet.about)},`,
      '      "strokes": [',
      ...listed(
        strokes,
        ({ id, points }) => ({ id, points: points.map(({ x, y }) => [x, y]) }),
        "        ",
      ),
      "      ],",
      `      "groups": ${JSON.stringify(groupsOf(strokes))},`,
      '      "crops": [',
    );
    DIGITS.forEach((digit, k) => {
      const submission = submissionOf(strokes, digit);
      const { crop } = submission;
      const { box, median: unit } = crop.exact;
      const boxes = boxesAbout(crop).map((at) => {
        const [placed] = placesOf({ submission, marks: [frameAt(at)] }, strokes);
        return { box: at, ids: placed?.ids ?? [], snapped: asList(placed?.box ?? null) };
      });
      lines.push(
        "        {",
        `          "crop": ${JSON.stringify({
          digit: crop.digit,
          drawn: crop.drawn,
          width: crop.width,
          height: crop.height,
          margins: crop.margins,
          exact: { box: [box.minY, box.minX, box.maxY, box.maxX], median: unit },
          sheetBox: crop.sheetBox,
        })},`,
        '          "boxes": [',
        ...listed(boxes, (each) => each, "            "),
        "          ]",
        k < DIGITS.length - 1 ? "        }," : "        }",
      );
    });
    lines.push("      ]", n < VECTOR_SHEETS.length - 1 ? "    }," : "    }");
  });
  lines.push("  ]", "}", "");
  return lines.join("\n");
}

test("the test vectors are what the rule gives on the synthetic sheets", async () => {
  await expect(vectors()).toMatchFileSnapshot("../../vectors/snaps.json");
});
