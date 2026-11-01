import { expect, test } from "vitest";
import {
  type AreaPicture,
  type CheckedExample,
  type ExamplePart,
  exampleOf,
  exampleTemplate,
  onSheet,
  sameExample,
  type WorkedExample,
} from "./example.js";
import type { PicturePart } from "./task.js";
import { DEMO, pathOf, refusal, under, workedExample } from "./tasks.fixture.js";

// Copies of the worked examples of the lesson examples and vectors of the module format at spec
// v0.4.1 (spec/format/examples/lesson/, spec/format/vectors/open-view/lesson/ and
// spec/format/vectors/rules/lesson.areas/): code and tests read nothing of spec/, so a move to a
// new tag compares them with `git -C spec diff <old> <new> -- format/` (R32). The element takes one
// segment of a lesson, its worked example (R42): the rest of a lesson is app's, and so are the
// faults of the invalid examples that lie outside a worked example.

/** The worked example the lesson examples of gaps and posts share. */
const LAMPS = {
  statement: [
    {
      text: "A path is 20 m long, with a lamp at each end and one every 5 m between them. How many lamps are there?",
    },
  ],
  canvas: { kind: "handwriting_sheet" },
} as const;
const DRAW = { text: "Draw the path, and mark a lamp at each end." };
const PATH = {
  picture: "pictures/path-in-gaps.png",
  alt: "A line for the path, cut into 4 equal gaps of 5 m, with a lamp at every mark.",
  area: { left: 100, top: 150, width: 800, height: 200 },
};

/** The worked examples of the valid lesson examples and of the open-view vector, by name. */
const VALID: Readonly<Record<string, WorkedExample>> = {
  "gaps-and-posts": {
    ...LAMPS,
    canvas: { kind: "handwriting_sheet", grid: "squares" },
    demo: [
      DRAW,
      PATH,
      {
        text: "20 ÷ 5 = 4 gaps. With a lamp at each end, there is one lamp more than gaps, so 5 lamps.",
      },
    ],
  },
  "worked-example-open": {
    ...LAMPS,
    canvas: { kind: "handwriting_sheet", grid: "lines", grid_step: 40 },
    demo: [DRAW, { picture: "pictures/lamp.png", alt: "A lamp.", width: 60, height: 120 }, PATH],
  },
};

/** The valid lesson examples with no worked example: an explanation and a task are app's. */
const PLAIN = ["essays-for-adults", "first-sentences", "reading-model-essays", "table-of-seven"];

/** A picture of the path, the second part of the demo, changed as an invalid example changes it. */
const path = (change: object) => ({ ...LAMPS, demo: [DRAW, { ...PATH, ...change }] });

/**
 * The invalid lesson examples whose fault is in a worked example: the name, the place their first
 * line names, from the worked example, and the worked example.
 */
const INVALID: readonly (readonly [string, string, object])[] = [
  [
    "area-off-the-sheet",
    "#/demo/1/area/left",
    path({
      alt: "A line for the path, cut into 4 equal gaps of 5 m.",
      area: { ...PATH.area, left: 1000 },
    }),
  ],
  [
    "picture-with-an-area-and-a-width",
    "#/demo/1",
    path({ alt: "A line for the path, cut into 4 equal gaps of 5 m.", width: 480 }),
  ],
  [
    "picture-without-a-size",
    "#/demo/1",
    path({ alt: "A line for the path, cut into 4 equal gaps of 5 m.", area: undefined }),
  ],
  [
    "worked-example-on-a-workbook",
    "#/canvas/kind",
    { ...LAMPS, canvas: { kind: "workbook" }, demo: [DRAW] },
  ],
];

/** The invalid lesson examples whose fault is the lesson's, outside any worked example: app's. */
const LESSONS = [
  "anchor-skill",
  "empty-segment",
  "no-segments",
  "no-skills",
  "task-twice",
  "two-kinds-in-a-segment",
  "unknown-segment-kind",
];

/** The vectors of the rule lesson.areas: an area past an edge of the sheet, and where it is. */
const AREAS: readonly (readonly [string, string, object])[] = [
  [
    "area-past-the-bottom-edge",
    "#/demo/0/area",
    { ...LAMPS, demo: [{ ...PATH, area: { ...PATH.area, top: 1300 } }] },
  ],
  ["area-past-the-right-edge", "#/demo/1/area", path({ area: { ...PATH.area, left: 300 } })],
];

test("the worked example of every valid lesson example and open-view vector of the format is a worked example: a copy of it", () => {
  for (const [name, example] of Object.entries(VALID)) {
    expect(exampleOf(example), name).toStrictEqual(example);
    expect(exampleOf(example), name).not.toBe(example);
  }
  // gaps-and-posts and four lessons without a worked example: five valid lesson examples.
  expect(1 + PLAIN.length).toBe(5);
});

test("an invalid lesson example whose fault is in its worked example is a TypeError at its place, or under it, and the rest are the lesson's", () => {
  for (const [name, place, example] of [...INVALID, ...AREAS]) {
    const message = refusal(() => exampleOf(example));
    expect(under(message, pathOf(place, "workedExample")), `${name}: ${message}`).toBe(true);
  }
  expect(INVALID.length + LESSONS.length).toBe(11);
});

test("a value that is no worked example is a TypeError that names its field", () => {
  const example = workedExample();
  const at = (change: object) => ({ ...example, ...change });
  const part = (piece: object) => at({ demo: [piece] });
  const wrong: [unknown, RegExp][] = [
    [null, /^workedExample: an object, not null$/],
    [{}, /^workedExample\.statement: a list of parts, not undefined$/],
    [at({ statement: [] }), /^workedExample\.statement: a list of parts, one at least, not \[\]$/],
    [
      at({ statement: [{ alt: "A lamp." }] }),
      /^workedExample\.statement\[0\]\.alt: no field of a paragraph of the statement$/,
    ],
    [at({ id: "lamps-1" }), /^workedExample\.id: no field of a worked example$/],
    [at({ canvas: undefined }), /^workedExample\.canvas: an object, not undefined$/],
    [
      at({ canvas: { kind: "workbook" } }),
      /^workedExample\.canvas\.kind: "handwriting_sheet", for a worked example is shown on a handwriting sheet, not "workbook"$/,
    ],
    // The learner does not write on the sheet of a worked example: it has no tools.
    [
      at({ canvas: { kind: "handwriting_sheet", tools: ["pen"] } }),
      /^workedExample\.canvas\.tools: no field of a worked example's canvas$/,
    ],
    [
      at({ canvas: { kind: "handwriting_sheet", grid: "hexagons" } }),
      /^workedExample\.canvas\.grid: "squares", "lines" or "dots"/,
    ],
    [
      at({ canvas: { kind: "handwriting_sheet", grid_step: 10 } }),
      /^workedExample\.canvas\.grid_step: a whole number from 20 to 500, not 10$/,
    ],
    [
      at({ demo: [] }),
      /^workedExample\.demo: a list of parts of the demo, one at least, not \[\]$/,
    ],
    [at({ demo: undefined }), /^workedExample\.demo: a list of parts of the demo, not undefined$/],
    [part({}), /^workedExample\.demo\[0\]\.text: a paragraph, a string not empty, not undefined$/],
    [
      part({ text: "Draw.", alt: "A lamp." }),
      /^workedExample\.demo\[0\]\.alt: no field of a paragraph of the demo$/,
    ],
    [
      part({ text: "Draw.", area: PATH.area }),
      /^workedExample\.demo\[0\]\.area: no field of a paragraph of the demo$/,
    ],
    [
      part({ picture: "pictures/lamp.png", width: 60, height: 120 }),
      /^workedExample\.demo\[0\]\.alt: what the picture shows/,
    ],
    [
      part({ picture: "pictures/lamp.png", alt: "A lamp.", width: 60 }),
      /^workedExample\.demo\[0\]\.height: a whole number from 1, not undefined$/,
    ],
    [
      part({ ...PATH, height: 120 }),
      /^workedExample\.demo\[0\]\.height: no field of a picture on the sheet$/,
    ],
    [part({ ...PATH, alt: undefined }), /^workedExample\.demo\[0\]\.alt: what the picture shows/],
    [
      part({ ...PATH, picture: "sounds/bell.mp3" }),
      /^workedExample\.demo\[0\]\.picture: a picture's path from media\//,
    ],
    [
      part({ ...PATH, area: { ...PATH.area, top: 1400 } }),
      /^workedExample\.demo\[0\]\.area\.top: a whole number from 0 to 1399, not 1400$/,
    ],
    [
      part({ ...PATH, area: { ...PATH.area, cells: 8 } }),
      /^workedExample\.demo\[0\]\.area\.cells: no field of a zone$/,
    ],
    // An area on the sheet, to its right and bottom edges, and no further (lesson.areas).
    [
      part({ ...PATH, area: { ...PATH.area, left: 201 } }),
      /^workedExample\.demo\[0\]\.area: an area on the sheet, its right edge at most 1000 and its bottom at most 1400, not /,
    ],
    [
      part({ ...PATH, area: { left: 0, top: 1201, width: 1000, height: 200 } }),
      /^workedExample\.demo\[0\]\.area: an area on the sheet/,
    ],
    [part({ ...PATH, area: null }), /^workedExample\.demo\[0\]\.area: an object, not null$/],
  ];
  for (const [value, message] of wrong) {
    expect(() => exampleOf(value)).toThrow(TypeError);
    expect(() => exampleOf(value)).toThrow(message);
  }
  // An area may reach the sheet's edges, and an empty alt is a picture that only decorates.
  const edges = { left: 0, top: 0, width: 1000, height: 1400 };
  expect(exampleOf(part({ ...PATH, alt: "", area: edges })).demo).toEqual([
    { ...PATH, alt: "", area: edges },
  ]);
  expect(exampleOf(at({ canvas: { kind: "handwriting_sheet", grid: undefined } })).canvas).toEqual({
    kind: "handwriting_sheet",
  });
});

test("the parts of a demo keep their kinds: a paragraph, a picture beside the sheet, and one on an area of it", () => {
  const { demo } = exampleOf(workedExample());
  expect(demo).toEqual(DEMO);
  expect(demo.map(onSheet)).toEqual([false, false, true, false]);
});

test("two worked examples are the same when they show the same, whatever objects they came from", () => {
  const one = exampleOf(workedExample());
  const same = exampleOf(structuredClone(workedExample({ grid: "squares", grid_step: 50 })));
  expect(sameExample(one, same)).toBe(true);
  const [draw, lamp, onTheSheet, count] = DEMO as [
    ExamplePart,
    PicturePart,
    AreaPicture,
    ExamplePart,
  ];
  const others: CheckedExample[] = [
    workedExample({ statement: [{ text: "Another question." }] }),
    workedExample({ grid: "dots" }),
    workedExample({ grid_step: 40 }),
    workedExample({ demo: [draw, lamp, onTheSheet] }),
    workedExample({ demo: [draw, lamp, onTheSheet, { text: "Five lamps." }] }),
    workedExample({ demo: [lamp, draw, onTheSheet, count] }),
    workedExample({ demo: [draw, { ...lamp, width: 61 }, onTheSheet, count] }),
    workedExample({ demo: [draw, lamp, { ...onTheSheet, alt: "A path." }, count] }),
    workedExample({
      demo: [draw, lamp, { ...onTheSheet, area: { ...onTheSheet.area, top: 151 } }, count],
    }),
    workedExample({ demo: [draw, { ...onTheSheet, area: onTheSheet.area }, onTheSheet, count] }),
  ];
  for (const other of others) expect(sameExample(one, exampleOf(other))).toBe(false);
});

test("the sheet makes a template of a worked example as of a task: its grid, its statement, and the pen alone", () => {
  const example = exampleOf(workedExample({ grid: "dots", grid_step: 40 }));
  const template = exampleTemplate(example);
  expect(template).toEqual({
    grid: { kind: "dots", step: 40 },
    statement: example.statement,
    tools: ["pen"],
  });
  expect(Object.isFrozen(template.tools)).toBe(true);
  expect(exampleTemplate(exampleOf(workedExample())).grid).toEqual({ kind: "squares", step: 50 });
});
