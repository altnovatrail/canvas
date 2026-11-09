import { expect, test } from "vitest";
import {
  type AreaPicture,
  type CheckedExample,
  DEMO_START,
  demoStateOf,
  type ExamplePart,
  exampleOf,
  exampleTemplate,
  filledBy,
  isFill,
  onSheet,
  sameExample,
  type WorkedExample,
} from "./example.js";
import { pageOf } from "./page.js";
import type { PicturePart } from "./task.js";
import { DEMO, pathOf, refusal, under, workedExample } from "./tasks.fixture.js";

// Copies of the worked examples of the lesson examples and vectors of the module format at spec
// v0.12.0 (spec/format/examples/lesson/, spec/format/vectors/open-view/lesson/ and
// spec/format/vectors/rules/: lesson.areas/, lesson.example-fills/ and lesson.workbook-page/): code and tests read nothing of spec/, so a move to a
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

/** The worked example on a workbook of the lesson of remainders: 23 ÷ 4 = [5] r [3]. */
const REMAINDERS = {
  statement: [{ text: "Share the apples into equal heaps, and say how many are left over." }],
  canvas: { kind: "workbook" },
  lines: [
    {
      line: [
        { text: "23 ÷ 4 =" },
        { binding: "box", value: "5" },
        { text: "r" },
        { binding: "box", value: "3" },
      ],
    },
  ],
  demo: [
    { text: "Take the largest number of heaps that fit, then count what is left." },
    { fill: { line: 1, box: 1 } },
    { fill: { line: 1, box: 2 } },
  ],
} as const satisfies WorkedExample;

/** The remainders' demo, its fills changed as a vector of lesson.example-fills changes them. */
const fills = (...boxes: readonly (readonly [number, number])[]) => ({
  ...REMAINDERS,
  demo: [REMAINDERS.demo[0], ...boxes.map(([line, box]) => ({ fill: { line, box } }))],
});

/** The line of a vector of lesson.workbook-page: n apples into heaps of four, what is left over. */
const share = (n: number) => ({
  line: [
    { text: `Share ${n} apples into heaps of four; the apples left over are` },
    { binding: "box", value: String(n % 4) },
  ],
});

/** The worked examples of the valid lesson examples and of the open-view vectors, by name. */
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
  "remainders-on-a-workbook": REMAINDERS,
  "workbook-example-open": REMAINDERS,
  "worked-example-open": {
    ...LAMPS,
    canvas: { kind: "handwriting_sheet", grid: "lines", grid_step: 40 },
    demo: [DRAW, { picture: "pictures/lamp.png", alt: "A lamp.", width: 60, height: 120 }, PATH],
  },
};

/** The valid lesson examples with no worked example: an explanation and a task are app's. */
const PLAIN = [
  "essays-for-adults",
  "first-sentences",
  "reading-model-essays",
  "table-of-seven",
  "the-worst-luck",
];

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
    "fill-on-a-handwriting-sheet",
    "#/demo/1",
    {
      statement: [{ text: "Share the apples into equal heaps." }],
      canvas: { kind: "handwriting_sheet" },
      demo: [{ text: "Take the largest number of heaps that fit." }, { fill: { line: 1, box: 1 } }],
    },
  ],
  [
    "picture-on-a-workbook",
    "#/demo/1",
    {
      ...REMAINDERS,
      demo: [
        REMAINDERS.demo[0],
        {
          picture: "pictures/apples.png",
          alt: "Apples in heaps of four.",
          area: { left: 100, top: 100, width: 400, height: 200 },
        },
        ...REMAINDERS.demo.slice(1),
      ],
    },
  ],
  [
    "workbook-example-without-lines",
    "#",
    {
      statement: [{ text: "Share the apples into equal heaps." }],
      canvas: { kind: "workbook" },
      demo: [{ text: "Take the largest number of heaps that fit." }],
    },
  ],
];

/** The invalid lesson examples whose fault is the lesson's, outside any worked example: app's. */
const LESSONS = [
  "anchor-skill",
  "empty-segment",
  "no-segments",
  "no-skills",
  "numbered-list-of-one",
  "numbered-list-with-a-paragraph",
  "numbered-list-with-its-own-number",
  "placeholder-in-a-picture-path",
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

/**
 * The vectors of the rules of a worked example on a workbook (lesson.example-fills and
 * lesson.workbook-page): a box filled twice, a box never filled, a fill of no box, and eleven long
 * lines, of which the eleventh has no room, as on a task's page.
 */
const WORKBOOK_RULES: readonly (readonly [string, string, object])[] = [
  ["box-filled-twice", "#/demo/2/fill", fills([1, 1], [1, 1], [1, 2])],
  ["box-never-filled", "#/demo", fills([1, 1])],
  ["fill-of-no-box", "#/demo/3/fill", fills([1, 1], [1, 2], [1, 3])],
  [
    "eleven-long-lines",
    "#/lines/10",
    {
      ...REMAINDERS,
      lines: Array.from({ length: 11 }, (_, n) => share(23 + n)),
      demo: [
        REMAINDERS.demo[0],
        ...Array.from({ length: 11 }, (_, n) => ({ fill: { line: n + 1, box: 1 } })),
      ],
    },
  ],
];

test("the worked example of every valid lesson example and open-view vector of the format is a worked example: a copy of it", () => {
  for (const [name, example] of Object.entries(VALID)) {
    expect(exampleOf(example), name).toStrictEqual(example);
    expect(exampleOf(example), name).not.toBe(example);
  }
  // gaps-and-posts, remainders-on-a-workbook and five lessons without a worked example: seven valid
  // lesson examples.
  expect(2 + PLAIN.length).toBe(7);
});

test("an invalid lesson example whose fault is in its worked example is a TypeError at its place, or under it, and the rest are the lesson's", () => {
  for (const [name, place, example] of [...INVALID, ...AREAS, ...WORKBOOK_RULES]) {
    const message = refusal(() => exampleOf(example));
    expect(under(message, pathOf(place, "workedExample")), `${name}: ${message}`).toBe(true);
  }
  expect(INVALID.length + LESSONS.length).toBe(17);
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
      at({ canvas: { kind: "text" } }),
      /^workedExample\.canvas\.kind: "handwriting_sheet" or "workbook", what a worked example is shown on, not "text"$/,
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
  expect(exampleTemplate(exampleOf(workedExample()))).toMatchObject({
    grid: { kind: "squares", step: 50 },
  });
});

test("the workbook makes a template of a worked example as of a task: its lines on the page, their boxes empty, and the pen alone (T85)", () => {
  const example = exampleOf(REMAINDERS);
  const task = pageOf([
    { line: [{ text: "23 ÷ 4 =" }, { binding: "box" }, { text: "r" }, { binding: "box" }] },
  ]);
  expect(exampleTemplate(example)).toEqual({
    page: task,
    statement: example.statement,
    tools: ["pen"],
  });
  // The boxes the open parts have filled, with their values, and none while the demo is hidden.
  expect([...filledBy(example, { opened: 2, hidden: false })]).toEqual([["1.1", "5"]]);
  expect([...filledBy(example, { opened: 3, hidden: false })]).toEqual([
    ["1.1", "5"],
    ["1.2", "3"],
  ]);
  expect(filledBy(example, { opened: 3, hidden: true }).size).toBe(0);
  expect(example.demo.map(isFill)).toEqual([false, true, true]);
});

test("a worked example on a workbook is refused for lines on a sheet, a value wider than its box, a box without one, and a fill out of shape", () => {
  const box = (value: unknown) => ({
    ...REMAINDERS,
    lines: [{ line: [{ text: "23 ÷ 4 =" }, { binding: "box", value }] }],
    demo: [{ fill: { line: 1, box: 1 } }],
  });
  const wrong: [unknown, RegExp][] = [
    [
      { ...LAMPS, canvas: { kind: "handwriting_sheet" }, lines: REMAINDERS.lines, demo: [DRAW] },
      /^workedExample\.lines: no lines on a handwriting sheet/,
    ],
    [
      box("1234567"),
      /^workedExample\.lines\[0\]\.line\[1\]\.value: no wider than its box, 100 units, not /,
    ],
    [box(""), /^workedExample\.lines\[0\]\.line\[1\]\.value:/],
    [
      { ...REMAINDERS, lines: [{ line: [{ text: "23 ÷ 4" }] }] },
      /^workedExample\.lines\[0\]\.line: at least one box/,
    ],
    [
      { ...REMAINDERS, canvas: { kind: "workbook", grid: "lines" } },
      /^workedExample\.canvas\.grid: no field of a worked example's workbook$/,
    ],
    [
      { ...REMAINDERS, demo: [{ fill: { line: 0, box: 1 } }] },
      /^workedExample\.demo\[0\]\.fill\.line:/,
    ],
    [
      { ...REMAINDERS, demo: [{ fill: { line: 1, box: 1 }, text: "and" }] },
      /^workedExample\.demo\[0\]\.text: no field of a box the demo fills$/,
    ],
  ];
  for (const [value, message] of wrong) expect(() => exampleOf(value)).toThrow(message);
  // A value two digits wide fits a box: 2 × 53 hundredths of 30 units is 32.
  expect(exampleOf(box("12")).lines?.[0]?.line[1]).toEqual({ binding: "box", value: "12" });
});

test("two worked examples on a workbook are the same when they have the same lines and the same fills", () => {
  const one = exampleOf(REMAINDERS);
  expect(sameExample(one, exampleOf(structuredClone(REMAINDERS)))).toBe(true);
  const others = [
    {
      ...REMAINDERS,
      lines: [
        {
          line: [
            { text: "23 ÷ 4 =" },
            { binding: "box", value: "5" },
            { text: "r" },
            { binding: "box", value: "4" },
          ],
        },
      ],
    },
    fills([1, 2], [1, 1]),
    exampleOf(workedExample()),
  ];
  for (const other of others) expect(sameExample(one, exampleOf(other))).toBe(false);
});

test("the state of a demo is how many of its parts are open and whether it is hidden, a frozen copy of its own, and anything else is a TypeError that names its field", () => {
  const given = { opened: 2, hidden: true };
  const state = demoStateOf(given, 4);
  expect(state).toStrictEqual({ opened: 2, hidden: true });
  expect(state).not.toBe(given);
  expect(Object.isFrozen(state)).toBe(true);
  // A state equal to the start is a copy too: the element keeps the object it has.
  expect(demoStateOf({ opened: 0, hidden: false }, 4)).not.toBe(DEMO_START);
  expect(DEMO_START).toStrictEqual({ opened: 0, hidden: false });
  expect(Object.isFrozen(DEMO_START)).toBe(true);
  expect(demoStateOf({ opened: 4, hidden: false }, 4).opened).toBe(4);
  // A field left out by undefined is no field: both are wanted.
  expect(demoStateOf({ opened: 1, hidden: false, extra: undefined }, 4).opened).toBe(1);
  const wrong: [unknown, RegExp][] = [
    [null, /^demoState: an object, not null$/],
    [[1, false], /^demoState: an object, not \[1,false\]$/],
    [{ hidden: false }, /^demoState\.opened: a whole number from 0 to 4, not undefined$/],
    [{ opened: 1 }, /^demoState\.hidden: true or false, not undefined$/],
    [{ opened: 1.5, hidden: false }, /^demoState\.opened: a whole number from 0 to 4, not 1\.5$/],
    [{ opened: -1, hidden: false }, /^demoState\.opened: .* not -1$/],
    [{ opened: 5, hidden: false }, /^demoState\.opened: .* not 5$/],
    [{ opened: "1", hidden: false }, /^demoState\.opened: .* not "1"$/],
    [{ opened: Number.NaN, hidden: false }, /^demoState\.opened: .* not NaN$/],
    [{ opened: 1, hidden: 0 }, /^demoState\.hidden: true or false, not 0$/],
    [{ opened: 1, hidden: "false" }, /^demoState\.hidden: true or false, not "false"$/],
    [
      { opened: 1, hidden: false, shown: true },
      /^demoState\.shown: no field of the state of a demo$/,
    ],
  ];
  for (const [value, message] of wrong)
    expect(refusal(() => demoStateOf(value, 4))).toMatch(message);
});
