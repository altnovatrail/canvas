import { describe, expect, test } from "vitest";
import { bundlesOf, CROP, type Crop, cropOf, medianOf, tokensOf } from "./crop.js";
import { type Group, groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import {
  answer,
  apart,
  atFloor,
  CROP_SHEETS,
  type CropSheet,
  crowd,
  dashes,
  dot,
  fraction,
  ladder,
  limit,
  overCeiling,
  random,
  SHEETS,
  staircase,
  stroke,
  touching,
  underCeiling,
  underFloor,
  whole,
} from "./sheets.fixture.js";

// The crop's rule (R25) on strokes code draws, as every test's strokes are (CLAUDE.md): the
// synthetic sheets, each with the median a teacher sees on it, set down before any run; crowded
// sheets of a seeded generator, places to hundredths, which the rule rounds; and a few strokes of a
// test's own. The rule's numbers are checked against the rule written out once more in BigInt,
// every pair of strokes against every other, where nothing rounds that the rule does not round.

const SHEETS_OF_THE_CROP: readonly (() => CropSheet)[] = [...SHEETS, ...CROP_SHEETS];

const DIGITS = CROP.heights;

/** The crop of the strokes on a sheet, with their groups by the sheet's rule (R24). */
function cropAt(strokes: readonly Stroke[], digit?: number): Crop {
  const crop = cropOf(strokes, groupsOf(strokes), digit);
  if (crop === null) throw new Error("the sheet has no crop");
  return crop;
}

/** A stroke straight from (x1, y1) to (x2, y2), written 10 s after the one before it. */
function line(id: number, x1: number, y1: number, x2: number, y2: number): Stroke {
  return stroke(id, [x1, y1, 10000 * id], [x2, y2, 10000 * id + 100]);
}

/** The same sheet in another hand: other IDs, the strokes in another order, each one backwards. */
function otherwise(strokes: readonly Stroke[]): Stroke[] {
  return strokes
    .map((each) => ({ ...each, id: 1000 - each.id, points: [...each.points].reverse() }))
    .sort((a, b) => ((a.id * 13) % 23) - ((b.id * 13) % 23));
}

describe("bundles", () => {
  test("are strokes whose boxes touch or overlap, by a chain, whenever each was written", () => {
    const strokes = [
      line(1, 100, 100, 110, 136),
      // At a corner of the first's box, then over the second's.
      line(2, 110, 136, 120, 172),
      line(3, 115, 150, 115, 200),
      line(4, 300, 100, 300, 136),
    ];
    expect(bundlesOf(strokes)).toEqual([[1, 2, 3], [4]]);
    const atOnce = strokes.map((each) => ({
      ...each,
      points: each.points.map((point) => ({ ...point, t: 0 })),
    }));
    expect(bundlesOf(atOnce)).toEqual([[1, 2, 3], [4]]);
  });

  test("touch no tenth of a unit apart, and not one tenth apart", () => {
    expect(bundlesOf(touching().work.strokes)).toEqual([[1, 2]]);
    expect(bundlesOf(apart().work.strokes)).toEqual([[1], [2]]);
  });

  test("leave out lines, the strokes lower than 15 units: they count for nothing and join nothing", () => {
    expect(bundlesOf(underFloor().work.strokes)).toEqual([[1]]);
    expect(bundlesOf(atFloor().work.strokes)).toEqual([[1], [2]]);
    // The bars of «3/4 = 6/8» touch both their digits, which are 2 units apart: four bundles,
    // the 4 of two strokes, and no bar in any.
    const strokes = fraction().work.strokes;
    const bundles = bundlesOf(strokes);
    const lines = strokes
      .filter(({ points }) => {
        const ys = points.map(({ y }) => y);
        return Math.max(...ys) - Math.min(...ys) < CROP.flat;
      })
      .map(({ id }) => id);
    expect(bundles).toHaveLength(4);
    expect(lines.length).toBeGreaterThan(0);
    for (const id of lines) expect(bundles.flat()).not.toContain(id);
  });
});

describe("the median", () => {
  test("is the height of the bundle in the lower middle, the ⌊(n − 1) / 2⌋-th from the lowest", () => {
    const heights = (...tall: number[]) =>
      tall.map((h, n) => line(n + 1, 100 + 100 * n, 100, 100 + 100 * n, 100 + h));
    expect(medianOf(heights(20, 36, 36, 300))).toBe(36);
    expect(medianOf(heights(36, 300))).toBe(36);
    expect(medianOf(heights(300, 20, 36))).toBe(36);
    expect(medianOf(heights(50))).toBe(50);
  });

  test("is the floor, 15 units, where there is no bundle", () => {
    expect(medianOf(dashes().work.strokes)).toBe(15);
    expect(medianOf(dot().work.strokes)).toBe(15);
    expect(medianOf([])).toBe(15);
  });

  test("is what a teacher sees on each synthetic sheet, set down before any run", () => {
    for (const make of SHEETS_OF_THE_CROP) {
      const sheet = make();
      expect(medianOf(sheet.work.strokes), sheet.name).toBe(sheet.median);
    }
  });

  test("is the same whatever the IDs and the order of the strokes and the way each went", () => {
    const strokes = staircase().work.strokes;
    expect(medianOf(otherwise(strokes))).toBe(medianOf(strokes));
    expect(bundlesOf(otherwise(strokes))).toHaveLength(bundlesOf(strokes).length);
  });
});

describe("the crop", () => {
  test("draws the median at the height asked for, or the ceiling if the median is over it", () => {
    for (const make of SHEETS_OF_THE_CROP) {
      const { name, work } = make();
      for (const digit of DIGITS) {
        const crop = cropAt(work.strokes, digit);
        expect(crop.digit, name).toBe(digit);
        expect(crop.scale * Math.min(crop.median, CROP.ceiling), name).toBeCloseTo(crop.drawn, 9);
      }
    }
    expect(cropAt(ladder().work.strokes).scale).toBe(320 / 1000);
    expect(cropAt(overCeiling().work.strokes).scale).toBe(320 / 1000);
    expect(cropAt(underCeiling().work.strokes).scale).toBe(320 / 999);
  });

  test("has a margin of 12 px round the work, and is 200 px each way at least, the work in its middle", () => {
    const strokes = staircase().work.strokes;
    const crop = cropAt(strokes, 32);
    const { box } = crop.exact;
    expect(crop.margins).toEqual([12, 12]);
    expect(crop.width).toBe(Math.ceil(((box.maxX - box.minX) * 32) / 360) + 24);
    expect(crop.height).toBe(Math.ceil(((box.maxY - box.minY) * 32) / 360) + 24);
    // A digit 18 by 36 units: 16 by 32 px, in a crop of the least size.
    const single = cropAt(answer().work.strokes, 32);
    expect([single.width, single.height, ...single.margins]).toEqual([200, 200, 84, 92]);
    const alone = cropAt(dot().work.strokes, 24);
    expect([alone.width, alone.height, ...alone.margins]).toEqual([200, 200, 100, 100]);
  });

  test("fits Claude's standard tier, drawing its digits smaller, by whole px, where it would not", () => {
    // The whole sheet fits at 32 px, at 1518 tokens, so it is drawn at 32 px when 48 are asked for.
    const sheet = whole().work.strokes;
    const at32 = cropAt(sheet, 32);
    expect([at32.drawn, at32.width, at32.height, tokensOf(at32)]).toEqual([32, 913, 1269, 1518]);
    expect(cropAt(sheet, 48).drawn).toBe(32);
    // At 17 px at both limits at once; from 18 px up, drawn at 17.
    const dots = limit().work.strokes;
    const at17 = cropAt(dots, 17);
    expect([at17.drawn, at17.width, at17.height, tokensOf(at17)]).toEqual([17, 772, 1568, 1568]);
    expect(cropAt(dots, 18).drawn).toBe(17);
    expect(cropAt(dots, 256).drawn).toBe(17);
    for (const make of SHEETS_OF_THE_CROP) {
      const { name, work } = make();
      for (const digit of DIGITS) {
        const crop = cropAt(work.strokes, digit);
        expect(Math.max(crop.width, crop.height), name).toBeLessThanOrEqual(CROP.edge);
        expect(tokensOf(crop), name).toBeLessThanOrEqual(CROP.tokens);
        // Drawn at the largest height that fits.
        if (crop.drawn < digit)
          expect(cropAt(work.strokes, crop.drawn + 1).drawn, name).toBe(crop.drawn);
      }
    }
  });

  test("lies on the sheet where its box says, with its margins", () => {
    for (const make of SHEETS_OF_THE_CROP) {
      const { name, work } = make();
      for (const digit of DIGITS) {
        const crop = cropAt(work.strokes, digit);
        const [ymin, xmin, ymax, xmax] = crop.sheetBox;
        const [top, left] = crop.margins;
        expect((ymax - ymin) * crop.scale, name).toBeCloseTo(crop.height, 6);
        expect((xmax - xmin) * crop.scale, name).toBeCloseTo(crop.width, 6);
        expect((crop.exact.box.minY / 10 - ymin) * crop.scale, name).toBeCloseTo(top, 6);
        expect((crop.exact.box.minX / 10 - xmin) * crop.scale, name).toBeCloseTo(left, 6);
      }
    }
  });

  test("frames each group's ink in fractions of the crop, outward: min below max, a dot's too", () => {
    // A dot at 24 px in the middle of 200: its ink 2 px across and the pixel at each edge, from
    // 490 to 510 thousandths.
    expect(cropAt(dot().work.strokes, 24).frames).toEqual([
      { label: "A", box: [490, 490, 510, 510] },
    ]);
    for (const make of SHEETS_OF_THE_CROP) {
      const { name, work } = make();
      const groups = groupsOf(work.strokes);
      for (const digit of DIGITS) {
        const crop = cropAt(work.strokes, digit);
        const [top, left] = crop.margins;
        // Half the line, and the pixel at its edge that the raster still shades.
        const reach = crop.line / 2 + 1;
        expect(
          crop.frames.map(({ label }) => label),
          name,
        ).toEqual(groups.map(({ label }) => label));
        for (const [n, { box }] of crop.frames.entries()) {
          const [y0, x0, y1, x1] = box;
          expect(0 <= y0 && y0 < y1 && y1 <= 1000 && 0 <= x0 && x0 < x1 && x1 <= 1000, name).toBe(
            true,
          );
          // Every point of the group, widened by half the line and a pixel, lies within its frame.
          for (const id of groups[n]?.ids ?? []) {
            for (const { x, y } of work.strokes.find((each) => each.id === id)?.points ?? []) {
              const px = ((Math.round(x * 10) - crop.exact.box.minX) * crop.scale) / 10 + left;
              const py = ((Math.round(y * 10) - crop.exact.box.minY) * crop.scale) / 10 + top;
              expect((x0 * crop.width) / 1000, name).toBeLessThanOrEqual(px - reach + 1e-9);
              expect((x1 * crop.width) / 1000, name).toBeGreaterThanOrEqual(px + reach - 1e-9);
              expect((y0 * crop.height) / 1000, name).toBeLessThanOrEqual(py - reach + 1e-9);
              expect((y1 * crop.height) / 1000, name).toBeGreaterThanOrEqual(py + reach - 1e-9);
            }
          }
        }
      }
    }
  });

  test("of a sheet without strokes is none", () => {
    expect(cropOf([], [])).toBeNull();
  });

  test("is the same whatever the IDs and the order of the strokes, the way each went, and a trip through JSON", () => {
    for (const make of [staircase, fraction, whole]) {
      const strokes = make().work.strokes;
      const moved = otherwise(strokes);
      const read: Stroke[] = JSON.parse(JSON.stringify(strokes));
      for (const digit of DIGITS) {
        const crop = cropAt(strokes, digit);
        // Labels go by place (R24), so the same frames come under the same labels.
        expect(cropAt(moved, digit)).toEqual(crop);
        expect(cropAt(read, digit)).toEqual(crop);
      }
    }
  });

  test("takes a digit of whole px from 1 to 256, and nothing else", () => {
    const strokes = staircase().work.strokes;
    const groups = groupsOf(strokes);
    for (const digit of [0, 257, 32.5, Number.NaN, Number.POSITIVE_INFINITY, -32]) {
      expect(() => cropOf(strokes, groups, digit), String(digit)).toThrow(RangeError);
    }
    expect(cropOf(strokes, groups, 1)?.drawn).toBe(1);
    expect(cropOf(strokes, groups, 256)?.drawn).toBeLessThanOrEqual(256);
  });

  test("takes no point off the sheet, no stroke without points and no ID twice", () => {
    const off = [
      [-0.1, 100],
      [1000.1, 100],
      [100, 1400.1],
      [Number.NaN, 100],
      [100, Number.POSITIVE_INFINITY],
    ] as const;
    for (const [x, y] of off) {
      const strokes = [stroke(1, [x, y, 0])];
      expect(() => cropOf(strokes, [{ label: "A", ids: [1] }]), `${x}, ${y}`).toThrow(RangeError);
    }
    expect(
      cropOf([stroke(1, [0, 0, 0], [1000, 1400, 10])], [{ label: "A", ids: [1] }]),
    ).not.toBeNull();
    expect(() => cropOf([{ id: 1, kind: "pen", points: [] }], [{ label: "A", ids: [1] }])).toThrow(
      TypeError,
    );
    const twice = [stroke(1, [100, 100, 0]), stroke(1, [200, 100, 0])];
    expect(() => cropOf(twice, [{ label: "A", ids: [1] }])).toThrow(TypeError);
  });

  test("takes groups that hold each stroke of the sheet once, and nothing else", () => {
    const strokes = [line(1, 100, 100, 100, 136), line(2, 200, 100, 200, 136)];
    const wrong: Group[][] = [
      [{ label: "A", ids: [1] }],
      [
        { label: "A", ids: [1, 2] },
        { label: "B", ids: [2] },
      ],
      [{ label: "A", ids: [1, 2, 3] }],
      [
        { label: "A", ids: [1, 2] },
        { label: "B", ids: [] },
      ],
    ];
    for (const groups of wrong) expect(() => cropOf(strokes, groups)).toThrow(TypeError);
    expect(() => cropOf([], [{ label: "A", ids: [1] }])).toThrow(TypeError);
    expect(cropOf(strokes, [{ label: "A", ids: [2, 1] }])).not.toBeNull();
  });
});

// The rule written out once more, from its own words (R25), in BigInt: every pair of strokes
// against every other for the bundles, and a division only where the rule divides.

const big = (values: readonly bigint[], pick: (a: bigint, b: bigint) => boolean): bigint =>
  values.reduce((best, value) => (pick(value, best) ? value : best));
const least = (values: readonly bigint[]) => big(values, (a, b) => a < b);
const most = (values: readonly bigint[]) => big(values, (a, b) => a > b);

interface Span {
  readonly minX: bigint;
  readonly minY: bigint;
  readonly maxX: bigint;
  readonly maxY: bigint;
}

function spanOf(spans: readonly Span[]): Span {
  return {
    minX: least(spans.map(({ minX }) => minX)),
    minY: least(spans.map(({ minY }) => minY)),
    maxX: most(spans.map(({ maxX }) => maxX)),
    maxY: most(spans.map(({ maxY }) => maxY)),
  };
}

/** The crop's numbers by the rule's own words. */
function reference(strokes: readonly Stroke[], groups: readonly Group[], digit: number) {
  const tenth = (value: number) => BigInt(Math.round(value * 10));
  const spans = new Map(
    strokes.map(({ id, points }) => {
      const xs = points.map(({ x }) => tenth(x));
      const ys = points.map(({ y }) => tenth(y));
      return [id, { minX: least(xs), minY: least(ys), maxX: most(xs), maxY: most(ys) }] as const;
    }),
  );
  const box = spanOf([...spans.values()]);
  // Bundles: the strokes 150 tenths high or more, joined pair by pair where their boxes meet.
  const tall = [...spans.values()].filter(({ minY, maxY }) => maxY - minY >= 150n);
  const meet = (a: Span, b: Span) =>
    a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;
  const seen = new Set<number>();
  const heights: bigint[] = [];
  for (const [start] of tall.entries()) {
    if (seen.has(start)) continue;
    const bundle: Span[] = [];
    const queue = [start];
    seen.add(start);
    while (queue.length > 0) {
      const at = queue.pop() ?? start;
      const span = tall[at];
      if (span === undefined) continue;
      bundle.push(span);
      for (const [other, each] of tall.entries()) {
        if (!seen.has(other) && meet(span, each)) {
          seen.add(other);
          queue.push(other);
        }
      }
    }
    const { minY, maxY } = spanOf(bundle);
    heights.push(maxY - minY);
  }
  heights.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const median = heights[Math.floor((heights.length - 1) / 2)] ?? 150n;
  const unit = median < 1000n ? median : 1000n;
  // BigInt divides whole numbers toward 0: the floor of what is not below 0.
  const ceil = (a: bigint, b: bigint) => (a + b - 1n) / b;
  const max = (a: bigint, b: bigint) => (a > b ? a : b);
  for (let drawn = BigInt(digit); ; drawn--) {
    const w0 = ceil((box.maxX - box.minX) * drawn, unit) + 24n;
    const h0 = ceil((box.maxY - box.minY) * drawn, unit) + 24n;
    const width = max(w0, 200n);
    const height = max(h0, 200n);
    const left = 12n + (width - w0) / 2n;
    const top = 12n + (height - h0) / 2n;
    if (max(width, height) > 1568n || ceil(width, 28n) * ceil(height, 28n) > 1568n) {
      if (drawn > 1n) continue;
    }
    const reach = (max(drawn, 12n) + 24n) * unit;
    const across = (x: bigint) => 24n * ((x - box.minX) * drawn + left * unit);
    const down = (y: bigint) => 24n * ((y - box.minY) * drawn + top * unit);
    const over = (a: bigint, b: bigint) => Number(a) / Number(b);
    return {
      drawn: Number(drawn),
      scale: over(10n * drawn, unit),
      line: over(max(drawn, 12n), 12n),
      width: Number(width),
      height: Number(height),
      margins: [Number(top), Number(left)],
      sheetBox: [
        over(box.minY * drawn - top * unit, 10n * drawn),
        over(box.minX * drawn - left * unit, 10n * drawn),
        over(box.minY * drawn - top * unit + height * unit, 10n * drawn),
        over(box.minX * drawn - left * unit + width * unit, 10n * drawn),
      ],
      frames: groups.map(({ label, ids }) => {
        const frame = spanOf(ids.map((id) => spans.get(id) ?? box));
        return {
          label,
          box: [
            Number((1000n * (down(frame.minY) - reach)) / (24n * unit * height)),
            Number((1000n * (across(frame.minX) - reach)) / (24n * unit * width)),
            Number(ceil(1000n * (down(frame.maxY) + reach), 24n * unit * height)),
            Number(ceil(1000n * (across(frame.maxX) + reach), 24n * unit * width)),
          ],
        };
      }),
      exact: {
        box: {
          minX: Number(box.minX),
          minY: Number(box.minY),
          maxX: Number(box.maxX),
          maxY: Number(box.maxY),
        },
        median: Number(unit),
      },
    };
  }
}

describe("the rule written out once more", () => {
  test("gives the numbers the crop gives, on crowded sheets, at every height of digit", () => {
    for (const seed of Array.from({ length: 200 }, (_, n) => n + 1)) {
      const strokes = crowd(seed);
      const groups = groupsOf(strokes);
      const next = random(seed + 1000);
      for (const digit of [...DIGITS, 1 + Math.floor(next() * 256)]) {
        const { digit: asked, median, ...rest } = cropAt(strokes, digit);
        expect(asked).toBe(digit);
        expect(median).toBe(medianOf(strokes));
        expect(rest, `seed ${seed}, ${digit} px`).toEqual(reference(strokes, groups, digit));
      }
    }
  });

  test("gives them on the synthetic sheets", () => {
    for (const make of SHEETS_OF_THE_CROP) {
      const { name, work } = make();
      const groups = groupsOf(work.strokes);
      for (const digit of DIGITS) {
        const { digit: _, median, ...rest } = cropAt(work.strokes, digit);
        expect(median, name).toBe(make().median);
        expect(rest, `${name}, ${digit} px`).toEqual(reference(work.strokes, groups, digit));
      }
    }
  });
});

/** What the test vectors say of themselves (R25). */
const ABOUT =
  "Test vectors of canvas's crop for checking, R25 in docs/decisions.md: from the strokes a sheet shows and their groups (R24; vectors/groups.json) to the crop's numbers at each height of digits — the median, the height the digits are drawn at, the scale, the line, the size, the margins, where the crop lies on the sheet and the frames of the groups. Not its pixels: two implementations may draw them a level of grey apart. A proposal for the eval protocol, epic E3 in spec's RUN.md: the protocol's own vectors come in spec's releases, and canvas will test against those.";

/** The rule in words, for a runner to follow: every number it names is a whole one. */
const FORMULAS = {
  tenths:
    "every place is taken in whole tenths of a unit, t(v) = round(10 × v), half up: 100.05 units are 1001 tenths (R24). B is the box of all the points, in tenths",
  bundles:
    "the strokes whose points span flat × 10 tenths or more from top to bottom, joined by a chain of boxes that touch or overlap, 0 tenths apart or less both across and down; a lower stroke is a line and joins nothing",
  median:
    "m, the lower median of the heights of the bundles, the ⌊(n − 1) / 2⌋-th from the lowest, in tenths, or flat × 10 if there is no bundle; the scale takes H = min(m, ceiling × 10). The case's median is m / 10 units",
  size: "for D′ from the digit asked for down to 1: w₀ = ⌈(B.xmax − B.xmin) × D′ / H⌉ + 2 × margin and h₀ = ⌈(B.ymax − B.ymin) × D′ / H⌉ + 2 × margin; width = max(w₀, side), left = margin + ⌊(width − w₀) / 2⌋, and height and top alike. D′ is drawn, the first for which max(width, height) ≤ edge and ⌈width / patch⌉ × ⌈height / patch⌉ ≤ tokens",
  scale: "10 × D′ / H px to a unit; the line is max(D′, 12) / 12 px wide",
  sheetBox:
    "[(B.ymin × D′ − top × H) / (10 × D′), (B.xmin × D′ − left × H) / (10 × D′), (B.ymin × D′ − top × H + height × H) / (10 × D′), (B.xmin × D′ − left × H + width × H) / (10 × D′)] units: each one division of two whole numbers",
  frames:
    "for each group, g the box of its points in tenths, r = (max(D′, 12) + 24) × H, X(x) = 24 × ((x − B.xmin) × D′ + left × H) and Y(y) = 24 × ((y − B.ymin) × D′ + top × H): [⌊1000 × (Y(g.ymin) − r) / (24 × H × height)⌋, ⌊1000 × (X(g.xmin) − r) / (24 × H × width)⌋, ⌈1000 × (Y(g.ymax) + r) / (24 × H × height)⌉, ⌈1000 × (X(g.xmax) + r) / (24 × H × width)⌉] — the group's ink, its points widened by half the line and the pixel at its edge, rounded outward: every pixel the ink touches lies within, and min < max",
  numbers:
    "every whole number above stays below 2^53, so a double holds it exactly, and an int64 does too; the numbers that are not whole are each one division of two whole numbers",
};

/** The test vectors, one line to a stroke and to a crop, so that a reader can follow them. */
function vectors(): string {
  const { digit: _, tallest: __, ...rule } = CROP;
  const formulas = Object.entries(FORMULAS).map(
    ([key, text], k, all) =>
      `    ${JSON.stringify(key)}: ${JSON.stringify(text)}${k < all.length - 1 ? "," : ""}`,
  );
  const lines = [
    "{",
    `  "about": ${JSON.stringify(ABOUT)},`,
    `  "rule": ${JSON.stringify(rule)},`,
    '  "formulas": {',
    ...formulas,
    "  },",
    '  "cases": [',
  ];
  SHEETS_OF_THE_CROP.forEach((make, n) => {
    const sheet = make();
    const strokes = sheet.work.strokes;
    const groups = groupsOf(strokes);
    const crops = DIGITS.map((digit) => {
      const crop = cropOf(strokes, groups, digit);
      if (crop === null) throw new Error(`${sheet.name} has no crop`);
      return crop;
    });
    const first = crops[0];
    if (first === undefined) throw new Error("no heights of digits");
    const { box, median: unit } = first.exact;
    const listed = <T>(items: readonly T[], show: (item: T) => unknown) =>
      items.map(
        (item, k) => `        ${JSON.stringify(show(item))}${k < items.length - 1 ? "," : ""}`,
      );
    lines.push(
      "    {",
      `      "name": ${JSON.stringify(sheet.name)},`,
      `      "about": ${JSON.stringify(sheet.about)},`,
      '      "strokes": [',
      ...listed(strokes, ({ id, points }) => ({ id, points: points.map(({ x, y }) => [x, y]) })),
      "      ],",
      `      "groups": ${JSON.stringify(groups)},`,
      `      "bundles": ${JSON.stringify(bundlesOf(strokes))},`,
      `      "median": ${JSON.stringify(first.median)},`,
      `      "exact": ${JSON.stringify({ box: [box.minY, box.minX, box.maxY, box.maxX], median: unit })},`,
      '      "crops": [',
      ...listed(
        crops,
        ({ digit, drawn, scale, line, width, height, margins, sheetBox, frames }) => ({
          digit,
          drawn,
          scale,
          line,
          width,
          height,
          margins,
          sheetBox,
          frames,
        }),
      ),
      "      ]",
      n < SHEETS_OF_THE_CROP.length - 1 ? "    }," : "    }",
    );
  });
  lines.push("  ]", "}", "");
  return lines.join("\n");
}

test("the test vectors are what the rule gives on the synthetic sheets", async () => {
  await expect(vectors()).toMatchFileSnapshot("../../vectors/crops.json");
});
