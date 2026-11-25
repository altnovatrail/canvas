import { describe, expect, test } from "vitest";
import type { Stroke } from "./ink.js";
import { INK_REACH, PEN_WIDEST } from "./outline.js";
import {
  ERASER_SIZES,
  MARKER_WIDTHS,
  OTHER_COLOURS,
  PALETTE,
  PEN_SETTINGS,
  PEN_WIDTHS,
  penSettingsOf,
  reachOf,
  sameStyle,
  styleOf,
} from "./style.js";

describe("the settings", () => {
  test("offer five widths of the pen, the marker's four times as wide, five eraser sizes and the colours", () => {
    expect(PEN_WIDTHS).toEqual([1.2, 2, 3, 4.5, 7]);
    expect(MARKER_WIDTHS).toEqual(PEN_WIDTHS.map((width) => Math.round(40 * width) / 10));
    expect(ERASER_SIZES).toEqual([8, 16, 28, 44, 64]);
    expect(PALETTE).toHaveLength(5);
    expect(OTHER_COLOURS).toHaveLength(12);
    for (const colour of [...PALETTE, ...OTHER_COLOURS]) {
      expect(styleOf({ pen: "liner", color: colour, width: 2, opacity: 100 }, "s").color).toBe(
        colour,
      );
    }
  });

  test("an element starts with are canvas's, frozen through", () => {
    expect(PEN_SETTINGS).toEqual({
      pen: "pen",
      styles: {
        pen: { pen: "pen", color: "#1c1c1e", width: 3, opacity: 100 },
        liner: { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 },
        marker: { pen: "marker", color: "#ffcc00", width: 18, opacity: 40 },
      },
      eraser: "stroke",
      eraserSize: 16,
      select: "lasso",
    });
    expect(Object.isFrozen(PEN_SETTINGS)).toBe(true);
    expect(Object.isFrozen(PEN_SETTINGS.styles)).toBe(true);
    expect(Object.isFrozen(PEN_SETTINGS.styles.marker)).toBe(true);
  });

  test("given are copied with their own fields alone, frozen", () => {
    const given = {
      ...PEN_SETTINGS,
      pen: "marker",
      eraser: "part",
      eraserSize: 1,
      select: "rectangle",
      styles: {
        ...PEN_SETTINGS.styles,
        liner: { pen: "liner", color: "#ffffff", width: 0.1, opacity: 10, note: "the consumer's" },
      },
      note: "the consumer's",
    };
    const settings = penSettingsOf(given);
    expect(settings).toEqual({
      pen: "marker",
      styles: {
        ...PEN_SETTINGS.styles,
        liner: { pen: "liner", color: "#ffffff", width: 0.1, opacity: 10 },
      },
      eraser: "part",
      eraserSize: 1,
      select: "rectangle",
    });
    expect(settings).not.toBe(given);
    expect(Object.isFrozen(settings.styles.liner)).toBe(true);
    expect(penSettingsOf({ ...PEN_SETTINGS, eraserSize: 200 }).eraserSize).toBe(200);
    // Settings kept before Select had a shape take the lasso.
    const { select: _, ...older } = PEN_SETTINGS;
    expect(penSettingsOf(older).select).toBe("lasso");
  });

  test("not of PenSettings are a TypeError that names the field", () => {
    const style = (kind: string, over: Record<string, unknown>) => ({
      ...PEN_SETTINGS,
      styles: {
        ...PEN_SETTINGS.styles,
        [kind]: { ...PEN_SETTINGS.styles.pen, pen: kind, ...over },
      },
    });
    const cases: [unknown, RegExp][] = [
      [null, /^pens: an object/],
      [{ ...PEN_SETTINGS, pen: "brush" }, /^pens\.pen: "pen", "liner" or "marker", not "brush"$/],
      [{ ...PEN_SETTINGS, styles: [] }, /^pens\.styles: an object/],
      [
        { ...PEN_SETTINGS, styles: { pen: PEN_SETTINGS.styles.pen } },
        /^pens\.styles\.liner: an object/,
      ],
      [
        style("liner", { pen: "marker" }),
        /^pens\.styles\.liner\.pen: "liner", its kind's, not "marker"$/,
      ],
      [style("pen", { color: "#1C1C1E" }), /^pens\.styles\.pen\.color: a colour/],
      [style("pen", { color: "red" }), /^pens\.styles\.pen\.color: a colour/],
      [style("pen", { color: 0 }), /^pens\.styles\.pen\.color: a colour/],
      [
        style("pen", { width: 0.05 }),
        /^pens\.styles\.pen\.width: sheet units to a tenth, from 0\.1 to 50/,
      ],
      [style("pen", { width: 50.1 }), /^pens\.styles\.pen\.width:/],
      [style("pen", { width: 1.25 }), /^pens\.styles\.pen\.width:/],
      [style("pen", { width: Number.NaN }), /^pens\.styles\.pen\.width:/],
      [style("pen", { width: "3" }), /^pens\.styles\.pen\.width:/],
      [
        style("marker", { opacity: 9 }),
        /^pens\.styles\.marker\.opacity: whole percent from 10 to 100/,
      ],
      [style("marker", { opacity: 100.5 }), /^pens\.styles\.marker\.opacity:/],
      [style("marker", { opacity: 101 }), /^pens\.styles\.marker\.opacity:/],
      [
        style("marker", { pen: undefined }),
        /^pens\.styles\.marker\.pen: "pen", "liner" or "marker"/,
      ],
      [{ ...PEN_SETTINGS, eraser: "pixel" }, /^pens\.eraser: "stroke" or "part", not "pixel"$/],
      [
        { ...PEN_SETTINGS, eraserSize: 0.5 },
        /^pens\.eraserSize: the eraser's diameter in sheet units, from 1 to 200/,
      ],
      [{ ...PEN_SETTINGS, eraserSize: 201 }, /^pens\.eraserSize:/],
      [{ ...PEN_SETTINGS, eraserSize: Number.NaN }, /^pens\.eraserSize:/],
      [{ ...PEN_SETTINGS, eraserSize: undefined }, /^pens\.eraserSize:/],
      [
        { ...PEN_SETTINGS, select: "ellipse" },
        /^pens\.select: "lasso" or "rectangle", not "ellipse"$/,
      ],
    ];
    for (const [value, message] of cases) {
      expect(() => penSettingsOf(value), String(message)).toThrow(TypeError);
      expect(() => penSettingsOf(value), String(message)).toThrow(message);
    }
  });
});

test("two styles are the same by their four fields, and none only as none", () => {
  const { pen, liner } = PEN_SETTINGS.styles;
  expect(sameStyle(pen, { ...pen })).toBe(true);
  expect(sameStyle(undefined, undefined)).toBe(true);
  expect(sameStyle(pen, undefined)).toBe(false);
  expect(sameStyle(undefined, pen)).toBe(false);
  expect(sameStyle(pen, liner)).toBe(false);
  for (const over of [
    { color: "#000000" },
    { width: 2.9 },
    { opacity: 99 },
    { pen: "liner" as const },
  ]) {
    expect(sameStyle(pen, { ...pen, ...over })).toBe(false);
  }
});

test("a stroke's ink reaches as the pen drew it without a style, and as its style's width with one", () => {
  const stroke = (style?: Stroke["style"]): Stroke => ({
    id: 1,
    kind: "pen",
    points: [{ x: 1, y: 1, t: 0, p: 0.5 }],
    ...(style === undefined ? {} : { style }),
  });
  expect(reachOf(stroke())).toBe(INK_REACH);
  expect(reachOf(stroke({ pen: "pen", color: "#000000", width: 4.5, opacity: 100 }))).toBe(
    (4.5 * PEN_WIDEST) / 2,
  );
  expect(reachOf(stroke({ pen: "liner", color: "#000000", width: 4.5, opacity: 100 }))).toBe(2.25);
  expect(reachOf(stroke({ pen: "marker", color: "#000000", width: 28, opacity: 40 }))).toBe(14);
});
