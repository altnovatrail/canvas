import { expect, test } from "vitest";
import type { GridKind } from "./grid.js";
import { pageOf } from "./page.js";
import { line, shortLines } from "./pages.fixture.js";
import {
  type AnswerSlot,
  isSheet,
  isWorkbook,
  NO_TASK,
  type SheetTask,
  type SheetTemplate,
  sameLayer,
  sameStatement,
  sameTemplate,
  sameTools,
  type Task,
  type Template,
  taskOf,
  templateOf,
} from "./task.js";
import { pathOf, refusal, sheetTask, under } from "./tasks.fixture.js";

/** A sheet's template, which has a grid: a workbook's here fails the test. */
function sheetOf(template: Template): SheetTemplate {
  if (isWorkbook(template)) throw new Error("a workbook's template, where a sheet's was due");
  return template;
}

// Copies of the task examples and the open-view vectors of the module format at spec v0.4.1
// (spec/format/examples/task/ and spec/format/vectors/open-view/task/): code and tests read nothing
// of spec/, so a move to a new tag compares them with `git -C spec diff <old> <new> -- format/`
// (R32). The format is version 0.1 since spec v0.3.0, no draft any more (R64 spec). Each is written
// as a change to what the examples share, with its keys in their order: a valid example as its
// open view, as app gets it, and an invalid one with its open fields and the closed field at fault,
// its other closed fields left as those the examples share.

/**
 * The closed fields of a task, of its items and of their answer slots and boxes (R51 spec, R56 spec,
 * R57 spec, R60 spec): the open view, which the element gets, has none of them.
 */
const CLOSED = [
  "skills",
  "band",
  "difficulty",
  "age_categories",
  "techniques",
  "traps",
  "solution",
  "leak_phrases",
  "template",
];
const CLOSED_IN_ITEMS = ["skills", "simpler_case"];
const CLOSED_IN_SLOTS = ["check"];

/** The closed fields most examples have. */
const RUNG_SKILLS = { skills: { primary: ["counting-gaps"] }, band: "grades-3-4", difficulty: 2 };

/** The check of most invalid examples' answer: the number of rungs, 7. */
const SEVEN = { kind: "number", key: "7" };

/** What most invalid examples share: a ladder's rungs to count, the answer anywhere, the solution. */
const RUNGS = {
  statement: [{ text: "How many rungs are there?" }],
  canvas: { kind: "handwriting_sheet" },
  items: [{ answer_slots: [{ binding: "anywhere", check: SEVEN }] }],
  solution: [{ text: "The ladder has one more rung than the gaps between its rungs: 7 rungs." }],
};

const ZONE = { left: 100, top: 1000, width: 400, height: 200 };
const CLOCK = {
  picture: "pictures/clock-quarter-past-three.png",
  alt: "A clock face whose hands show a quarter past three.",
  width: 240,
  height: 240,
};
const LEAVES = { text: "The clock shows when Anna leaves home." };
const WORKBOOK = { kind: "workbook" } as const;
const TIMES = { line: [{ text: "7 ×" }, { binding: "box" }, { text: "= 56" }] } as const;
const DIVISION = {
  line: [{ text: "47 ÷ 6 =" }, { binding: "box" }, { text: "r" }, { binding: "box" }],
} as const;
const COMPARISON = { line: [{ text: "56" }, { binding: "box" }, { text: "65" }] } as const;
const SIGNS = { text: "Write the missing numbers, and the sign <, > or = between two numbers." };
const FIRST_SENTENCES = [
  "It was a day like any other.",
  "The door was open, and nobody had opened it.",
  "I am going to write about a day.",
];
const LADDER =
  "The rungs of a ladder are 30 cm apart. From the lowest rung to the highest it is 180 cm. How many rungs are there?";
/** What the ladder's statement gives and asks: the chips app shows (R57 spec). */
const LADDER_CHIPS = {
  givens: ["The rungs are 30 cm apart.", "It is 180 cm from the lowest rung to the highest."],
  unknown: "How many rungs there are.",
};
const ANYWHERE = [{ answer_slots: [{ binding: "anywhere" }] }] as const;
const SQUARES = { kind: "handwriting_sheet", grid: "squares" } as const;

/** A valid example on a handwriting sheet with one item and one answer slot, as most are. */
function oneSlot(id: string, text: string, slot: AnswerSlot, grid?: GridKind): Task {
  const canvas: Task["canvas"] =
    grid === undefined ? { kind: "handwriting_sheet" } : { kind: "handwriting_sheet", grid };
  return { id, statement: [{ text }], canvas, items: [{ answer_slots: [slot] }] };
}

/** A template's line of the workbook to fill in, {first} × [ ] = {product} (R60 spec). */
const FACTOR_LINE = {
  line: [{ text: "{first} ×" }, { binding: "box" }, { text: "= {product}" }],
} as const;

/**
 * The open views of the valid examples: their closed fields left out, as app gets them. A template's
 * placeholders stand in them as written: app gets an instance's open view, numbers in their place
 * (R60 spec), and an open view of either is a task.
 */
const VALID: Readonly<Record<string, Task>> = {
  "anchor-among-supporting-skills": oneSlot(
    "refraction-1",
    "Луч света переходит из воздуха в стекло с показателем преломления 1,5. В воздухе свет проходит 300 тысяч км/с. Сколько тысяч км/с он проходит в стекле?",
    { binding: "anywhere" },
  ),
  "best-first-sentence": oneSlot(
    "best-first-sentence-1",
    "Which first sentence makes a reader want to go on?",
    { binding: "choice", options: FIRST_SENTENCES },
    "lines",
  ),
  "divisible-by-3-and-4": {
    id: "divisible-by-3-and-4-1",
    statement: [{ text: "Write a number from 1 to 50 that divides by 3 and by 4." }],
    givens: ["The number is from 1 to 50.", "It divides by 3.", "It divides by 4."],
    unknown: "Such a number.",
    canvas: { kind: "handwriting_sheet" },
    items: ANYWHERE,
  },
  "division-with-remainder": {
    id: "division-with-remainder",
    statement: [{ text: "Divide, and write the quotient and the remainder." }],
    canvas: WORKBOOK,
    items: [
      {
        line: [
          { text: "{dividend} ÷ {divisor} =" },
          { binding: "box" },
          { text: "r" },
          { binding: "box" },
        ],
      },
    ],
  },
  "essay-about-yourself": oneSlot(
    "a-day-you-remember-1",
    "Write a short essay about a day of your life that you remember well.",
    { binding: "sheet" },
    "lines",
  ),
  essay: oneSlot(
    "undiscovered-island-1",
    "Imagine an island that nobody has found yet. Write a short essay about your first morning there.",
    { binding: "sheet" },
    "lines",
  ),
  "even-or-odd": oneSlot(
    "sum-even-or-odd-1",
    "Kate adds up the numbers from 1 to 9. Is the sum even or odd? Write even or odd.",
    { binding: "zone", zone: { left: 300, top: 1100, width: 400, height: 200 } },
  ),
  "fraction-in-lowest-terms": {
    id: "pizza-left-1",
    statement: [{ text: "Write the fraction in lowest terms." }],
    canvas: WORKBOOK,
    items: [
      {
        line: [
          { text: "2 of 8 slices of the pizza are left: that is" },
          { binding: "box" },
          { text: "of the pizza." },
        ],
      },
    ],
  },
  "fraction-template": {
    id: "fraction-template",
    statement: [{ text: "Write the fraction of the pizza." }],
    canvas: WORKBOOK,
    items: [
      {
        line: [
          { text: "{part} of {whole} slices of the pizza are left: that is" },
          { binding: "box" },
          { text: "of the pizza." },
        ],
      },
    ],
  },
  "heads-and-legs": {
    id: "heads-and-legs-1",
    statement: [
      {
        text: "A farmyard has chickens and rabbits, 6 heads and 16 legs in all. A chicken has 2 legs, and a rabbit has 4. How many rabbits are there?",
      },
    ],
    givens: ["6 heads in all", "16 legs in all", "A chicken has 2 legs.", "A rabbit has 4 legs."],
    unknown: "How many rabbits there are.",
    canvas: SQUARES,
    items: ANYWHERE,
  },
  "heads-and-legs-template": {
    id: "heads-and-legs-2",
    statement: [
      {
        text: "A farmyard has chickens and rabbits, {heads} heads and {legs} legs in all. A chicken has 2 legs, and a rabbit has 4. How many rabbits are there?",
      },
    ],
    givens: [
      "{heads} heads in all",
      "{legs} legs in all",
      "A chicken has 2 legs.",
      "A rabbit has 4 legs.",
    ],
    unknown: "How many rabbits there are.",
    canvas: SQUARES,
    items: ANYWHERE,
  },
  ladder: {
    id: "gaps-ladder-1",
    statement: [{ text: LADDER }],
    ...LADDER_CHIPS,
    canvas: SQUARES,
    items: ANYWHERE,
  },
  "missing-factor": {
    id: "missing-factor",
    statement: [{ text: "Write the missing number." }],
    canvas: WORKBOOK,
    items: [FACTOR_LINE],
  },
  "number-thought-of-template": {
    id: "number-thought-of",
    statement: [
      {
        text: "Masha had some sweets. She gave half of them to Ann, and then she gave {to_ben} sweets to Ben. Now she has {left} sweets. How many sweets did Masha have at first?",
      },
    ],
    givens: [
      "Masha gave half of her sweets to Ann.",
      "Then she gave {to_ben} sweets to Ben.",
      "Now she has {left} sweets.",
    ],
    unknown: "How many sweets Masha had at first.",
    canvas: SQUARES,
    items: ANYWHERE,
  },
  "workbook-page": {
    id: "tables-and-division-1",
    statement: [SIGNS],
    canvas: WORKBOOK,
    items: [
      TIMES,
      { line: [{ binding: "box" }, { text: "÷ 8 = 4" }] },
      COMPARISON,
      {
        line: [
          { text: "Tom has 3 bags of 4 apples. He has" },
          { binding: "box" },
          { text: "apples." },
        ],
      },
      DIVISION,
    ],
  },
  "zones-and-picture": {
    id: "clock-walk-1",
    statement: [
      LEAVES,
      CLOCK,
      {
        text: "a) How many minutes past three does Anna leave? b) She walks for 25 minutes. How many minutes past three does she arrive?",
      },
    ],
    canvas: { kind: "handwriting_sheet" },
    items: [
      { text: "a)", answer_slots: [{ binding: "zone", zone: ZONE }] },
      { text: "b)", answer_slots: [{ binding: "zone", zone: { ...ZONE, left: 500 } }] },
    ],
  },
};

/** The open views of the vectors, each a change to the example it varies. */
const zones = VALID["zones-and-picture"] as Task;
const OPEN_VIEWS: Readonly<Record<string, Task>> = {
  "answer-anywhere": oneSlot("gaps-ladder-1", LADDER, { binding: "anywhere" }, "squares"),
  "choice-for-adults": oneSlot(
    "a-day-you-remember-1",
    "Which first sentence makes a reader want to go on?",
    { binding: "choice", options: FIRST_SENTENCES.slice(0, 2) },
    "lines",
  ),
  "essay-rubric-closed": oneSlot(
    "undiscovered-island-1",
    "Imagine an island that nobody has found yet. Write a short essay about your first morning there, in paragraphs.",
    { binding: "sheet" },
    "lines",
  ),
  "hints-closed": {
    id: "gaps-ladder-1",
    statement: [{ text: LADDER }],
    ...LADDER_CHIPS,
    canvas: { kind: "handwriting_sheet" },
    items: ANYWHERE,
  },
  "template-closed": VALID["missing-factor"] as Task,
  "workbook-lines": {
    id: "tables-page",
    statement: [SIGNS],
    canvas: WORKBOOK,
    items: [TIMES, DIVISION, COMPARISON],
  },
  "zones-and-picture": { ...zones, statement: zones.statement.slice(0, 2) },
};

/** Every valid example and open-view vector by its name: a vector may have its example's. */
const EVERY: readonly (readonly [string, Task])[] = [
  ...Object.entries(VALID),
  ...Object.entries(OPEN_VIEWS),
];

/** An answer anywhere on the sheet with this check, where the example's fault is. */
function checked(check: object): object {
  return { items: [{ answer_slots: [{ binding: "anywhere", check }] }] };
}

/** The line 7 × [ ] = 56 of a workbook to fill in, its box with this check, or none. */
function missing(check?: object): object {
  const box = check === undefined ? { binding: "box" } : { binding: "box", check };
  return {
    statement: [{ text: "Write the missing number." }],
    canvas: WORKBOOK,
    items: [{ line: [{ text: "7 ×" }, box, { text: "= 56" }] }],
  };
}

/** A template of the line {a} × [ ] = {product}, the key of its box this one (R60 spec). */
function templated(template: object, key = "{b}"): object {
  const box = { binding: "box", check: { kind: "number", key } };
  return {
    template,
    statement: [{ text: "Write the missing number." }],
    canvas: WORKBOOK,
    items: [{ line: [{ text: "{a} ×" }, box, { text: "= {product}" }] }],
  };
}

const DIGITS = { from: 2, to: 9 };
const FACTORS = { parameters: { a: DIGITS, b: DIGITS }, derived: { product: "a * b" } };
const EIGHT = { kind: "number", key: "8" };
/** A solver's program that finds the missing factor (R61 spec). */
const FACTOR = 'def solve(numbers):\n    return {"factor": numbers["product"] // numbers["a"]}\n';

/**
 * The invalid examples: the name, the place their first line names, `# error: <keyword> at
 * <place>`, and what they change in RUNGS and RUNG_SKILLS.
 */
const INVALID: readonly (readonly [string, string, object])[] = [
  [
    "anchor-skill-as-primary",
    "#/skills/primary/0",
    { skills: { primary: ["core.multiplication-table"] } },
  ],
  [
    "answer-slots-on-the-workbook",
    "#/items/0",
    { canvas: WORKBOOK, items: [{ answer_slots: [{ binding: "zone", zone: ZONE }] }] },
  ],
  [
    "anywhere-and-a-zone",
    "#",
    { items: [{ answer_slots: [{ binding: "anywhere" }, { binding: "zone", zone: ZONE }] }] },
  ],
  [
    "box-on-the-sheet",
    "#/items/0/answer_slots/0/binding",
    { items: [{ answer_slots: [{ binding: "box" }] }] },
  ],
  ["box-without-a-key", "#/items/0/line/1", missing()],
  [
    "check-on-a-piece-of-text",
    "#/items/0/line/0",
    {
      ...missing(),
      items: [
        {
          line: [{ text: "7 ×", check: EIGHT }, { binding: "box", check: EIGHT }, { text: "= 56" }],
        },
      ],
    },
  ],
  [
    "choice-of-one",
    "#/items/0/answer_slots/0/options",
    { items: [{ answer_slots: [{ binding: "choice", options: ["7"] }] }] },
  ],
  ["difficulty-six", "#/difficulty", { difficulty: 6 }],
  [
    "domain-past-the-integers",
    "#/template/parameters/b/to",
    templated({ ...FACTORS, parameters: { a: DIGITS, b: { from: 2, to: 1e20 } } }),
  ],
  [
    "domain-without-to",
    "#/template/parameters/b",
    templated({ ...FACTORS, parameters: { a: DIGITS, b: { from: 2 } } }),
  ],
  ["empty-givens", "#/givens", { id: "gaps-ladder-1", givens: [] }],
  [
    "expression-too-long",
    "#/template/constraint",
    templated({ ...FACTORS, constraint: Array(111).fill("a < 9").join(" and ") }),
  ],
  ["form-on-a-number", "#/items/0/line/1/check", missing({ ...EIGHT, form: "reduced" })],
  [
    "fraction-key-as-a-decimal",
    "#/items/0/line/1/check/key",
    {
      statement: [{ text: "Write the fraction in lowest terms." }],
      canvas: WORKBOOK,
      items: [
        {
          line: [
            { text: "2/8 =" },
            { binding: "box", check: { kind: "fraction", key: "0.25", form: "reduced" } },
          ],
        },
      ],
    },
  ],
  [
    "full-id-as-supporting-skill",
    "#/skills/supporting/0",
    {
      skills: {
        primary: ["counting-gaps"],
        supporting: ["novatrail/olympiad-math/skill/time-calendar"],
      },
    },
  ],
  [
    "grid-on-the-workbook",
    "#/canvas",
    { canvas: { ...WORKBOOK, grid: "squares" }, items: [TIMES] },
  ],
  ["grid-step-ten", "#/canvas/grid_step", { canvas: { kind: "handwriting_sheet", grid_step: 10 } }],
  [
    "item-without-a-key",
    "#/items/1/answer_slots/0",
    {
      statement: [
        {
          text: "a) How many minutes past three does Anna leave? b) How many minutes past three does she arrive?",
        },
      ],
      items: [
        {
          text: "a)",
          answer_slots: [{ binding: "zone", zone: ZONE, check: { kind: "number", key: "15" } }],
        },
        { text: "b)", answer_slots: [{ binding: "zone", zone: { ...ZONE, left: 500 } }] },
      ],
    },
  ],
  ["key-as-a-number", "#/items/0/answer_slots/0/check/key", checked({ ...SEVEN, key: 7 })],
  [
    "key-with-a-leading-zero",
    "#/items/0/answer_slots/0/check/key",
    checked({ ...SEVEN, key: "07" }),
  ],
  [
    "key-with-a-unit-beside-a-placeholder",
    "#/items/0/line/1/check/key",
    templated(FACTORS, "{b} apples"),
  ],
  [
    "leak-phrase-twice",
    "#/leak_phrases",
    { id: "gaps-ladder-1", leak_phrases: ["seven rungs", "seven rungs"] },
  ],
  [
    "line-on-the-sheet",
    "#/items/0",
    {
      items: [
        { answer_slots: [{ binding: "anywhere" }], line: [{ text: "Rungs" }, { binding: "box" }] },
      ],
    },
  ],
  [
    "line-without-a-box",
    "#/items/0/line",
    { canvas: WORKBOOK, items: [{ line: [{ text: "7 × 8 = 56" }] }] },
  ],
  ["no-items", "#/items", { items: [], solution: undefined }],
  ["no-primary-skill", "#/skills", { skills: { supporting: ["time-calendar"] } }],
  ["no-solution", "#", { id: "gaps-ladder-1", solution: undefined }],
  [
    "number-on-the-whole-sheet",
    "#/items/0/answer_slots/0/check/kind",
    { items: [{ answer_slots: [{ binding: "sheet", check: SEVEN }] }], solution: undefined },
  ],
  [
    "options-in-a-chosen-check",
    "#/items/0/answer_slots/0/check",
    {
      statement: [{ text: "Which first sentence makes a reader want to go on?" }],
      canvas: { kind: "handwriting_sheet", grid: "lines" },
      items: [
        {
          answer_slots: [
            {
              binding: "choice",
              options: FIRST_SENTENCES.slice(0, 2),
              check: {
                kind: "choice",
                options: FIRST_SENTENCES.slice(0, 2),
                key: FIRST_SENTENCES[1],
              },
            },
          ],
        },
      ],
    },
  ],
  [
    "options-on-a-zone",
    "#/items/0/answer_slots/0",
    { items: [{ answer_slots: [{ binding: "zone", zone: ZONE, options: ["6", "7"] }] }] },
  ],
  [
    "parameter-named-if",
    "#/template/parameters",
    templated({
      parameters: { a: DIGITS, if: DIGITS },
      derived: { b: "a + 1", product: "a * (a + 1)" },
    }),
  ],
  [
    "picture-wider-than-the-integers",
    "#/statement/1/width",
    {
      statement: [
        LEAVES,
        { ...CLOCK, alt: "A clock whose hands show a quarter past three.", width: 1e16 },
      ],
    },
  ],
  [
    "picture-without-alt",
    "#/statement/1",
    { statement: [LEAVES, { picture: CLOCK.picture, width: 240, height: 240 }] },
  ],
  [
    "predicate-too-long",
    "#/items/0/answer_slots/0/check/predicate",
    {
      statement: [{ text: "Write a number from 1 to 50 that divides by 3 and by 4." }],
      ...checked({ kind: "predicate", predicate: Array(101).fill("value != 0").join(" and ") }),
    },
  ],
  ["provenance-by-author", "#", { provenance: "author" }],
  [
    "quantity-not-in-this-version",
    "#/items/0/answer_slots/0/check/kind",
    {
      statement: [{ text: "How fast does light go in glass?" }],
      ...checked({ kind: "quantity", key: "200000" }),
    },
  ],
  [
    "rubric-in-a-box",
    "#/items/0/line/1/check/kind",
    missing({ kind: "rubric", criteria: [{ text: "The number is written neatly." }] }),
  ],
  [
    "rubric-without-criteria",
    "#/items/0/answer_slots/0/check",
    {
      statement: [
        {
          text: "Write a short essay about your first morning on an island that nobody has found yet.",
        },
      ],
      canvas: { kind: "handwriting_sheet", grid: "lines" },
      items: [{ answer_slots: [{ binding: "sheet", check: { kind: "rubric" } }] }],
      solution: undefined,
    },
  ],
  [
    "solver-program-too-long",
    "#/template/solver/program",
    templated(
      {
        ...FACTORS,
        solver: { program: `# ${"x".repeat(70)}\n`.repeat(120) + FACTOR, results: ["factor"] },
      },
      "{factor}",
    ),
  ],
  [
    "solver-with-a-result-named-for",
    "#/template/solver/results/0",
    templated({
      ...FACTORS,
      solver: { program: FACTOR.replace("factor", "for"), results: ["for"] },
    }),
  ],
  [
    "solver-with-a-result-twice",
    "#/template/solver/results",
    templated(
      { ...FACTORS, solver: { program: FACTOR, results: ["factor", "factor"] } },
      "{factor}",
    ),
  ],
  [
    "solver-with-an-empty-program",
    "#/template/solver/program",
    templated({ ...FACTORS, solver: { program: "", results: ["factor"] } }, "{factor}"),
  ],
  [
    "solver-without-results",
    "#/template/solver",
    templated({ ...FACTORS, solver: { program: FACTOR } }),
  ],
  [
    "sound-in-the-statement",
    "#/statement/1/picture",
    {
      statement: [
        { text: "Listen, and count the rings of the bell." },
        { ...CLOCK, picture: "sounds/bell.mp3", alt: "A bell rings." },
      ],
    },
  ],
  [
    "technique-by-title",
    "#/techniques/0",
    { id: "gaps-ladder-1", techniques: ["Start with small numbers"] },
  ],
  ["template-without-parameters", "#/template/parameters", templated({ parameters: {} }, "7")],
  ["text-and-picture-in-one-part", "#/statement/0", { statement: [{ ...LEAVES, ...CLOCK }] }],
  ["tolerance-in-a-check", "#/items/0/answer_slots/0/check", checked({ ...SEVEN, tolerance: "1" })],
  [
    "trap-value-in-words",
    "#/items/0/answer_slots/0/check/trap_values/0/value",
    {
      id: "gaps-ladder-1",
      ...checked({ ...SEVEN, trap_values: [{ value: "six", trap: "off-by-one" }] }),
    },
  ],
  [
    "trap-value-without-a-trap",
    "#/items/0/answer_slots/0/check/trap_values/0",
    {
      id: "gaps-ladder-1",
      ...checked({
        ...SEVEN,
        trap_values: [{ value: "6", text: "That is how many gaps there are between the rungs." }],
      }),
    },
  ],
  [
    "trap-values-on-a-predicate",
    "#/items/1/answer_slots/0/check",
    {
      id: "multiples-1",
      statement: [
        { text: "a) What is 3 × 4? b) Write another number that divides by 3 and by 4." },
      ],
      items: [
        {
          text: "a)",
          answer_slots: [
            {
              binding: "zone",
              zone: { ...ZONE, top: 200, width: 300 },
              check: { kind: "number", key: "12" },
            },
          ],
        },
        {
          text: "b)",
          answer_slots: [
            {
              binding: "zone",
              zone: { ...ZONE, top: 600, width: 300 },
              check: {
                kind: "predicate",
                predicate: "value % 12 == 0 and value != 12",
                trap_values: [{ value: "6", trap: "ignored-condition" }],
              },
            },
          ],
        },
      ],
    },
  ],
  [
    "two-answers-anywhere",
    "#/items",
    {
      items: [
        { answer_slots: [{ binding: "anywhere" }] },
        { answer_slots: [{ binding: "anywhere" }] },
      ],
    },
  ],
  [
    "written-choice-without-options",
    "#/items/0/line/1/check",
    {
      statement: [{ text: "Write the sign <, > or = between the two numbers." }],
      canvas: WORKBOOK,
      items: [
        {
          line: [
            { text: "56" },
            { binding: "box", check: { kind: "choice", key: "<" } },
            { text: "65" },
          ],
        },
      ],
    },
  ],
  [
    "zone-in-cells",
    "#/items/0/answer_slots/0/zone",
    { items: [{ answer_slots: [{ binding: "zone", zone: { ...ZONE, cells: 8 } }] }] },
  ],
  [
    "zone-without-rectangle",
    "#/items/0/answer_slots/0",
    { items: [{ answer_slots: [{ binding: "zone" }] }] },
  ],
];

/**
 * The invalid examples whose place is open but whose fault is not: the check of a box or an answer
 * slot left out, or one on a piece of a line's text, and the solution left out. The open view leaves
 * all of them out, and what the element gets is a task.
 */
const CLOSED_FAULTS = [
  "box-without-a-key",
  "check-on-a-piece-of-text",
  "item-without-a-key",
  "no-solution",
];

/** Whether an example's fault is in a closed field: at its place, under it, or among CLOSED_FAULTS. */
function closedFault(name: string, place: string): boolean {
  const closed = [...CLOSED, ...CLOSED_IN_ITEMS, ...CLOSED_IN_SLOTS];
  return CLOSED_FAULTS.includes(name) || place.split("/").some((step) => closed.includes(step));
}

/** An object without these fields. */
function without(value: object, names: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !names.includes(key)));
}

/** A task without its closed fields, its items', answer slots' and boxes' too: its open view. */
function openOf(task: object): Record<string, unknown> {
  const open = without(task, CLOSED);
  if (Array.isArray(open.items)) {
    open.items = open.items.map((item: object) => {
      const fields = without(item, CLOSED_IN_ITEMS);
      for (const key of ["answer_slots", "line"]) {
        const slots = fields[key];
        if (Array.isArray(slots)) fields[key] = slots.map((slot) => without(slot, CLOSED_IN_SLOTS));
      }
      return fields;
    });
  }
  return open;
}

test("the open view of every valid example and open-view vector of the format is a task: a copy of it", () => {
  expect(EVERY).toHaveLength(16 + 7);
  for (const [name, task] of EVERY) {
    expect(taskOf(task), name).toStrictEqual(task);
    expect(taskOf(task), name).not.toBe(task);
  }
});

test("the element reads each field of a task once: what it shows is what it checked", () => {
  let reads = 0;
  const task = {
    ...sheetTask(),
    get canvas() {
      reads++;
      return { kind: "handwriting_sheet", grid_step: reads === 1 ? 40 : 5 };
    },
  };
  expect(sheetOf(templateOf(taskOf(task))).grid.step).toBe(40);
  expect(reads).toBe(1);
});

test("an invalid example of the format is a TypeError at the place its first line names, or under it, unless its fault is closed", () => {
  let refused = 0;
  for (const [name, place, change] of INVALID) {
    const open = openOf({ id: name, ...RUNGS, ...RUNG_SKILLS, ...change });
    if (closedFault(name, place)) {
      // Its fault is in a field the open view has not: what the element gets is a task.
      expect(taskOf(open), name).toEqual(open);
      continue;
    }
    const message = refusal(() => taskOf(open));
    expect(under(message, pathOf(place, "task")), `${name}: ${message}`).toBe(true);
    refused++;
  }
  expect(INVALID).toHaveLength(55);
  expect(refused).toBe(19);
});

test("a task with its closed fields is no open view: a TypeError at the first of them", () => {
  for (const [name, task] of EVERY) {
    expect(() => taskOf({ ...task, ...RUNG_SKILLS }), name).toThrow(
      /^task\.skills: no field of a task's open view$/,
    );
  }
  expect(() => taskOf({ ...sheetTask(), age_categories: ["adult"] })).toThrow(
    /^task\.age_categories:/,
  );
  const item = { answer_slots: [{ binding: "anywhere" }], skills: { primary: ["counting-gaps"] } };
  expect(() => taskOf({ ...sheetTask(), items: [item] })).toThrow(
    /^task\.items\[0\]\.skills: no field of an item of a handwriting sheet$/,
  );
  const line = { ...TIMES, skills: { primary: ["times-tables"] } };
  expect(() => taskOf({ ...OPEN_VIEWS["workbook-lines"], items: [line] })).toThrow(
    /^task\.items\[0\]\.skills: no field of an item of a workbook$/,
  );
  // What the format has closed since: the solution, what helps on the way, the template (R56 spec,
  // R57 spec, R60 spec), the simpler case of an item and the check of each answer slot and box.
  const later: [string, unknown][] = [
    ["solution", RUNGS.solution],
    ["techniques", ["draw", "small-numbers"]],
    ["traps", ["ignored-condition"]],
    ["leak_phrases", ["seven rungs"]],
    ["template", FACTORS],
  ];
  for (const [field, value] of later) {
    expect(() => taskOf({ ...sheetTask(), [field]: value }), field).toThrow(
      new RegExp(`^task\\.${field}: no field of a task's open view$`),
    );
  }
  const slot = { binding: "anywhere", check: SEVEN };
  expect(() => taskOf({ ...sheetTask(), items: [{ answer_slots: [slot] }] })).toThrow(
    /^task\.items\[0\]\.answer_slots\[0\]\.check: no field of an answer slot$/,
  );
  const simpler = { answer_slots: [{ binding: "anywhere" }], simpler_case: "Try 60 cm first." };
  expect(() => taskOf({ ...sheetTask(), items: [simpler] })).toThrow(
    /^task\.items\[0\]\.simpler_case: no field of an item of a handwriting sheet$/,
  );
  expect(() => taskOf({ ...OPEN_VIEWS["workbook-lines"], ...missing(EIGHT) })).toThrow(
    /^task\.items\[0\]\.line\[1\]\.check: no field of a piece of a line$/,
  );
});

test("the names of the provisional type are no fields of the format's: a TypeError, not a default", () => {
  const sheet = sheetTask();
  const wrong: [unknown, RegExp][] = [
    [
      { ...sheet, canvas: { kind: "handwriting-sheet" } },
      /^task\.canvas\.kind: "handwriting_sheet" or "workbook", not "handwriting-sheet"$/,
    ],
    [
      { ...sheet, canvas: { ...sheet.canvas, step: 40 } },
      /^task\.canvas\.step: no field of a task's canvas$/,
    ],
    [
      { ...sheet, canvas: { ...sheet.canvas, digit: 48 } },
      /^task\.canvas\.digit: no field of a task's canvas$/,
    ],
    [{ ...sheet, lang: "en" }, /^task\.lang: no field of a task's open view$/],
  ];
  for (const [value, message] of wrong) expect(() => taskOf(value)).toThrow(message);
});

test("what the sheet shows of a task: its grid, its statement and its tools; a choice and an item's text pass", () => {
  expect(templateOf(taskOf(VALID.ladder))).toEqual({
    grid: { kind: "squares", step: 50 },
    statement: [
      {
        text: "The rungs of a ladder are 30 cm apart. From the lowest rung to the highest it is 180 cm. How many rungs are there?",
      },
    ],
    tools: ["pen", "eraser"],
  });
  for (const name of [
    "anchor-among-supporting-skills",
    "best-first-sentence",
    "essay",
    "essay-about-yourself",
  ]) {
    expect(() => templateOf(taskOf(VALID[name])), name).not.toThrow();
  }
  expect(sheetOf(templateOf(taskOf(VALID["best-first-sentence"]))).grid).toEqual({
    kind: "lines",
    step: 50,
  });
  const asked = sheetTask({
    items: [{ text: "a)", answer_slots: [{ binding: "choice", options: ["6", "7"] }] }],
  });
  expect(templateOf(taskOf(asked)).statement).toEqual([{ text: "How many posts are there?" }]);
});

test("a workbook's template is the layout of its lines on the page, its statement and its tools (R35)", () => {
  for (const name of ["workbook-page", "workbook-lines"]) {
    const task = taskOf({ ...VALID, ...OPEN_VIEWS }[name]);
    if (isSheet(task)) throw new Error(`${name} is a workbook's task`);
    expect(templateOf(task), name).toEqual({
      page: pageOf(task.items),
      statement: task.statement,
      tools: ["pen", "eraser"],
    });
  }
  const pen = taskOf({
    ...OPEN_VIEWS["workbook-lines"],
    canvas: { ...WORKBOOK, tools: ["ruler", "pen"] },
  });
  expect(templateOf(pen).tools).toEqual(["pen"]);
});

test("a workbook whose lines do not fit on the page is a TypeError at the first item that does not", () => {
  const items = shortLines(21);
  const task = taskOf({ ...OPEN_VIEWS["workbook-lines"], items });
  const message = refusal(() => templateOf(task));
  expect(under(message, "task.items[20]"), message).toBe(true);
  expect(() =>
    templateOf(taskOf({ ...OPEN_VIEWS["workbook-lines"], items: items.slice(0, 20) })),
  ).not.toThrow();
});

test("a zone is a TypeError of this version of the sheet, though the task is valid", () => {
  expect(() => templateOf(taskOf(VALID["zones-and-picture"]))).toThrow(
    /^task\.items\[0\]\.answer_slots\[0\]\.binding: the handwriting sheet takes no "zone" yet/,
  );
  const later = sheetTask({
    items: [
      { answer_slots: [{ binding: "choice", options: ["6", "7"] }] },
      { answer_slots: [{ binding: "zone", zone: ZONE }] },
    ],
  });
  expect(() => templateOf(taskOf(later))).toThrow(/^task\.items\[1\]\.answer_slots\[0\]\.binding:/);
});

test("without a task the sheet is ruled in squares of 50 units, without a statement, with the pen and the eraser", () => {
  expect(templateOf(undefined)).toBe(NO_TASK);
  expect(NO_TASK).toEqual({
    grid: { kind: "squares", step: 50 },
    statement: [],
    tools: ["pen", "eraser"],
  });
  expect(sheetOf(templateOf(taskOf(sheetTask()))).grid).toEqual(NO_TASK.grid);
});

test("a task gives the grid's kind and step, and a statement of texts and pictures", () => {
  const statement = [
    { text: "Along a path 20 m long, a post stands every 4 m. How many posts are there?" },
    { picture: "pictures/path.png", alt: "A path with posts along it", width: 320, height: 120 },
  ];
  const template = templateOf(taskOf(sheetTask({ grid: "dots", grid_step: 40, statement })));
  expect(template).toEqual({
    grid: { kind: "dots", step: 40 },
    statement,
    tools: ["pen", "eraser"],
  });
  // The template keeps parts of its own, with their fields alone.
  expect(template.statement[1]).not.toBe(statement[1]);
  for (const grid of ["squares", "lines", "dots"] as const) {
    expect(sheetOf(templateOf(taskOf(sheetTask({ grid })))).grid.kind).toBe(grid);
  }
  expect(sheetOf(templateOf(taskOf(sheetTask({ grid_step: 20 })))).grid.step).toBe(20);
  expect(sheetOf(templateOf(taskOf(sheetTask({ grid_step: 500 })))).grid.step).toBe(500);
});

test("a task gives the tools it allows of the sheet's, in the sheet's order, and passes over the names the sheet does not know", () => {
  const tools = (list: readonly string[]) => templateOf(taskOf(sheetTask({ tools: list }))).tools;
  expect(templateOf(taskOf(sheetTask())).tools).toEqual(["pen", "eraser"]);
  expect(tools(["pen"])).toEqual(["pen"]);
  expect(tools(["eraser", "pen"])).toEqual(["pen", "eraser"]);
  // A ruler, a calculator: app's to show, or the sheet's in a version to come.
  expect(tools(["pen", "ruler", "calculator", "pen"])).toEqual(["pen"]);
  expect(tools(["protractor", "eraser", "pen", "microphone"])).toEqual(["pen", "eraser"]);
  // The workbook's canvas has the field too.
  expect(
    taskOf({ ...OPEN_VIEWS["workbook-lines"], canvas: { ...WORKBOOK, tools: ["pen"] } }),
  ).toBeDefined();
});

test("a field left out by undefined is no field; null is a value, and a wrong one", () => {
  const sheet = sheetTask();
  expect(() =>
    taskOf({ ...sheet, lang: undefined, canvas: { ...sheet.canvas, grid: undefined } }),
  ).not.toThrow();
  expect(taskOf({ ...sheet, givens: undefined, unknown: undefined })).toStrictEqual(sheet);
  expect(
    sheetOf(templateOf(taskOf({ ...sheet, canvas: { ...sheet.canvas, grid_step: undefined } })))
      .grid.step,
  ).toBe(50);
  const picture = { picture: "pictures/a.png", alt: "", width: 1, height: 1, text: undefined };
  expect(templateOf(taskOf(sheetTask({ statement: [picture] }))).statement).toEqual([
    { picture: "pictures/a.png", alt: "", width: 1, height: 1 },
  ]);
  expect(() => taskOf({ ...sheet, canvas: { ...sheet.canvas, grid: null } })).toThrow(
    /^task\.canvas\.grid: .* not null$/,
  );
  expect(() => taskOf({ ...sheet, canvas: { ...sheet.canvas, grid_step: null } })).toThrow(
    /^task\.canvas\.grid_step: .* not null$/,
  );
  expect(() => taskOf({ ...sheet, canvas: { ...sheet.canvas, tools: null } })).toThrow(
    /^task\.canvas\.tools: a list of tools, not null$/,
  );
});

test("a value that is no open view of a task is a TypeError that names its field", () => {
  const sheet = sheetTask();
  const at = (change: object) => ({ ...sheet, ...change });
  const slot = (answer: object) => at({ items: [{ answer_slots: [answer] }] });
  const part = (piece: object) => at({ statement: [piece] });
  const lineOf = (...pieces: object[]) => ({
    ...OPEN_VIEWS["workbook-lines"],
    items: [{ line: pieces }],
  });
  // Lists with a hole, which a list made by hand may have: the hole is checked too.
  const holed: string[] = ["pen"];
  holed[2] = "eraser";
  const parts: object[] = [{ text: "Count." }];
  parts[2] = { text: "Then write." };
  const wrong: [unknown, RegExp][] = [
    [null, /^task: an object, not null$/],
    [[], /^task: an object/],
    [{}, /^task\.id: the task's local ID/],
    // IDs in kebab-case from a letter, at most 64 characters, none a Windows device.
    ...["Posts", "posts_1", "1-posts", "posts-", "posts--1", "con", "lpt1", "a".repeat(65), 7].map(
      (id): [unknown, RegExp] => [at({ id }), /^task\.id:/],
    ),
    [at({ statement: [] }), /^task\.statement: a list of parts, one at least, not \[\]$/],
    [at({ statement: "Count." }), /^task\.statement: a list of parts/],
    [at({ statement: parts }), /^task\.statement\[1\]: an object, not undefined$/],
    [part({}), /^task\.statement\[0\]\.text: a paragraph, a string not empty, not undefined$/],
    [part({ text: "" }), /^task\.statement\[0\]\.text:/],
    [part({ text: 7 }), /^task\.statement\[0\]\.text:/],
    [
      part({ alt: "Posts" }),
      /^task\.statement\[0\]\.alt: no field of a paragraph of the statement$/,
    ],
    // What the statement gives and asks: texts not empty, the givens all different (R57 spec).
    [at({ givens: [] }), /^task\.givens: a list of givens, one at least, not \[\]$/],
    [at({ givens: "The path is 20 m long." }), /^task\.givens: a list of givens, not "The/],
    [at({ givens: null }), /^task\.givens: a list of givens, not null$/],
    [
      at({ givens: ["The path is 20 m long.", ""] }),
      /^task\.givens\[1\]: a given, a string not empty, not ""$/,
    ],
    [
      at({ givens: ["A post every 4 m.", "A post every 4 m."] }),
      /^task\.givens: givens all different, not \["A post every 4 m\.","A post every 4 m\."\]$/,
    ],
    [
      at({ unknown: "" }),
      /^task\.unknown: what the task asks to find, a string not empty, not ""$/,
    ],
    [at({ unknown: ["How many posts."] }), /^task\.unknown: what the task asks to find/],
    [at({ unknown: null }), /^task\.unknown: .* not null$/],
    // A picture's path from media/, to a PNG, JPEG or WebP file.
    ...[
      "",
      "posts.svg",
      "posts",
      ".png",
      "Pictures/a.png",
      "pictures//a.png",
      "/a.png",
      "pictures/con.png",
      "con/a.png",
      `${"a".repeat(125)}.png`,
    ].map((picture): [unknown, RegExp] => [
      part({ picture, alt: "", width: 1, height: 1 }),
      /^task\.statement\[0\]\.picture:/,
    ]),
    [part({ picture: "a.png", width: 1, height: 1 }), /^task\.statement\[0\]\.alt:/],
    [
      part({ picture: "a.png", alt: "", width: 0, height: 1 }),
      /^task\.statement\[0\]\.width: a whole number from 1, not 0$/,
    ],
    [part({ picture: "a.png", alt: "", width: 1.5, height: 1 }), /^task\.statement\[0\]\.width:/],
    [
      part({ picture: "a.png", alt: "", width: 1, height: Infinity }),
      /^task\.statement\[0\]\.height:/,
    ],
    [at({ canvas: null }), /^task\.canvas: an object, not null$/],
    [at({ canvas: { kind: "text" } }), /^task\.canvas\.kind:/],
    [
      at({ canvas: { kind: "handwriting_sheet", grid: "hexagons" } }),
      /^task\.canvas\.grid: "squares", "lines" or "dots", not "hexagons"$/,
    ],
    ...[19, 501, 40.5, "50", Number.NaN].map((grid_step): [unknown, RegExp] => [
      at({ canvas: { kind: "handwriting_sheet", grid_step } }),
      /^task\.canvas\.grid_step: a whole number from 20 to 500, not /,
    ]),
    [
      at({ canvas: { kind: "handwriting_sheet", tools: "pen" } }),
      /^task\.canvas\.tools: a list of tools, not "pen"$/,
    ],
    // The canvas writes with the pen: a list without it is no task the element can show.
    [
      at({ canvas: { kind: "handwriting_sheet", tools: [] } }),
      /^task\.canvas\.tools: the canvas writes with "pen", which \[\] lacks$/,
    ],
    [
      at({ canvas: { kind: "handwriting_sheet", tools: ["eraser"] } }),
      /^task\.canvas\.tools: .* "pen"/,
    ],
    [
      at({ canvas: { kind: "handwriting_sheet", tools: ["pen", 7] } }),
      /^task\.canvas\.tools\[1\]: a tool's name, a string, not 7$/,
    ],
    [
      at({ canvas: { kind: "handwriting_sheet", tools: holed } }),
      /^task\.canvas\.tools\[1\]: .* not undefined$/,
    ],
    [at({ items: {} }), /^task\.items: a list of items, not \{\}$/],
    [
      at({ items: [{}] }),
      /^task\.items\[0\]\.answer_slots: a list of answer slots, not undefined$/,
    ],
    [
      at({ items: [{ text: "", answer_slots: [{ binding: "anywhere" }] }] }),
      /^task\.items\[0\]\.text: what the item asks/,
    ],
    [
      slot({ binding: "anywhere", zone: ZONE }),
      /^task\.items\[0\]\.answer_slots\[0\]\.zone: no field of an answer slot bound "anywhere"$/,
    ],
    [
      slot({ binding: "zone", zone: { ...ZONE, left: 1000 } }),
      /^task\.items\[0\]\.answer_slots\[0\]\.zone\.left: a whole number from 0 to 999, not 1000$/,
    ],
    [
      slot({ binding: "zone", zone: { ...ZONE, top: -1 } }),
      /\.zone\.top: a whole number from 0 to 1399/,
    ],
    [
      slot({ binding: "zone", zone: { ...ZONE, width: 0 } }),
      /\.zone\.width: a whole number from 1 to 1000/,
    ],
    [
      slot({ binding: "zone", zone: { ...ZONE, height: 1401 } }),
      /\.zone\.height: a whole number from 1 to 1400/,
    ],
    [
      slot({ binding: "choice", options: ["6", "6"] }),
      /\.answer_slots\[0\]\.options: options all different, not \["6","6"\]$/,
    ],
    [
      slot({ binding: "choice", options: ["6", ""] }),
      /\.answer_slots\[0\]\.options\[1\]: an option, a string not empty/,
    ],
    [
      slot({ binding: "choice" }),
      /\.answer_slots\[0\]\.options: a list of options, not undefined$/,
    ],
    [
      lineOf(),
      /^task\.items\[0\]\.line: a list of pieces of text and boxes, one at least, not \[\]$/,
    ],
    [lineOf({ text: "7 × 8 = 56" }), /^task\.items\[0\]\.line: at least one box/],
    [
      lineOf({ binding: "zone" }),
      /^task\.items\[0\]\.line\[0\]\.binding: "box", a box of a workbook, not "zone"$/,
    ],
    [
      lineOf({ binding: "box", text: "7" }),
      /^task\.items\[0\]\.line\[0\]\.text: no field of a box of a line$/,
    ],
    [
      lineOf({ text: "" }, { binding: "box" }),
      /^task\.items\[0\]\.line\[0\]\.text: a piece of the line's text/,
    ],
  ];
  for (const [value, message] of wrong) {
    expect(() => taskOf(value)).toThrow(TypeError);
    expect(() => taskOf(value)).toThrow(message);
  }
  expect(taskOf(at({ id: "a".repeat(64) }))).toBeDefined();
  expect(
    taskOf(part({ picture: `pictures/${"a".repeat(114)}.webp`, alt: "", width: 1, height: 1 })),
  ).toBeDefined();
});

test("two templates are the same when they show the same, whatever objects they came from", () => {
  const one: SheetTask = sheetTask({
    grid: "squares",
    grid_step: 50,
    statement: [{ text: "Count." }],
  });
  const same: SheetTask = sheetTask({ id: "posts-2", statement: [{ text: "Count." }] });
  expect(sameTemplate(templateOf(one), templateOf(same))).toBe(true);
  const others: SheetTask[] = [
    sheetTask({ grid: "lines", statement: [{ text: "Count." }] }),
    sheetTask({ grid_step: 25, statement: [{ text: "Count." }] }),
    sheetTask({ statement: [{ text: "Count!" }] }),
    sheetTask({ statement: [{ text: "Count." }, { text: "Then write." }] }),
    sheetTask({ statement: [{ picture: "a.png", alt: "Count.", width: 10, height: 10 }] }),
    sheetTask({ statement: [{ text: "Count." }], tools: ["pen"] }),
  ];
  for (const other of others) {
    expect(sameTemplate(templateOf(one), templateOf(other))).toBe(false);
  }
  const picture = (width: number) =>
    sheetTask({ statement: [{ picture: "a.png", alt: "Posts", width, height: 10 }] });
  expect(sameTemplate(templateOf(picture(10)), templateOf(picture(10)))).toBe(true);
  expect(sameTemplate(templateOf(picture(10)), templateOf(picture(11)))).toBe(false);

  // The grid and the statement apart: a new grid leaves the statement the same, and so on.
  const regridded = templateOf(sheetTask({ grid: "dots", statement: [{ text: "Count." }] }));
  expect(sameLayer(templateOf(one), regridded)).toBe(false);
  expect(sameStatement(templateOf(one), regridded)).toBe(true);
  const reworded = templateOf(sheetTask({ statement: [{ text: "Count!" }] }));
  expect(sameLayer(templateOf(one), reworded)).toBe(true);
  expect(sameStatement(templateOf(one), reworded)).toBe(false);
  // The tools apart too, and in the sheet's order whatever the list's.
  const penOnly = templateOf(sheetTask({ statement: [{ text: "Count." }], tools: ["pen"] }));
  expect(sameTools(templateOf(one), penOnly)).toBe(false);
  expect(sameStatement(templateOf(one), penOnly)).toBe(true);
  const turned = templateOf(
    sheetTask({ statement: [{ text: "Count." }], tools: ["eraser", "pen"] }),
  );
  expect(sameTemplate(templateOf(one), turned)).toBe(true);
});

test("two workbooks' templates draw the same when their lines are the same, and never what a sheet draws", () => {
  const page = taskOf(OPEN_VIEWS["workbook-lines"]);
  const renamed = taskOf({
    ...OPEN_VIEWS["workbook-lines"],
    id: "tables-page-2",
    statement: [{ text: "Fill in." }],
  });
  expect(sameLayer(templateOf(page), templateOf(renamed))).toBe(true);
  expect(sameStatement(templateOf(page), templateOf(renamed))).toBe(false);
  const other = taskOf({ ...OPEN_VIEWS["workbook-lines"], items: [line("7 × [] = 63")] });
  expect(sameLayer(templateOf(page), templateOf(other))).toBe(false);
  expect(sameLayer(templateOf(page), NO_TASK)).toBe(false);
  expect(sameLayer(NO_TASK, templateOf(page))).toBe(false);
});
