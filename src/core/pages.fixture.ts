// The pages of the workbook's tests and of the sweep of its layout (R35): lines a code writes, each
// page with what it is to show set before the layout ever ran on it. A module of the tests alone,
// which the build leaves out (tsconfig.build.json): `pageOf` takes the items, and these are made up.

import type { LinePart, WorkbookItem } from "./task.js";

/**
 * A line written as on paper, "[]" a box with a space on either side of it, if any: "7 × [] = 56"
 * is "7 ×", a box and "= 56".
 */
export function line(written: string): WorkbookItem {
  const parts: LinePart[] = [];
  written.split(/ ?\[\] ?/).forEach((text, n) => {
    if (n > 0) parts.push({ binding: "box" });
    if (text !== "") parts.push({ text });
  });
  return { line: parts };
}

/** A page of the corpus: its items, and what it is to show. */
export interface CorpusPage {
  readonly name: string;
  readonly about: string;
  readonly items: readonly WorkbookItem[];
  /** The fonts of the image have every character of it: the fitting is measured on it. */
  readonly fonts: boolean;
  /** The first item with no room, or none: the page fits. */
  readonly refused?: number;
}

/** The short lines of a school page that each stand in a column, two to a row (R35). */
export const SHORT = [
  "7 × [] = 56",
  "[] ÷ 8 = 4",
  "56 [] 65",
  "47 ÷ 6 = [] r []",
  "347 ÷ 6 = [] r []",
  "2 ч 15 мин = [] мин",
  "3 км 200 м = [] м",
  "1000 − 365 = []",
  "3/4 + 1/4 = []",
  "[] + 27 = 64",
].map(line);

/** A line too long for a column at any type size with a box of 100: it takes the page's width. */
export const LONG = line("47 : 6 = [] (ост. [])");

const TIMES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1].map((n) => line(`7 × ${n} = []`));

const FRACTIONS = [
  "1/2 + 1/4 = []",
  "3/4 − 1/4 = []",
  "2/3 + 1/3 = []",
  "3/5 + 1/5 = []",
  "5/8 − 3/8 = []",
  "1/3 + 1/6 = []",
  "2/5 [] 3/5",
  "1/4 + 1/4 = []",
  "7/10 − 3/10 = []",
  "1/2 [] 2/4",
].map(line);

const RUSSIAN = [
  "56 : 8 = []",
  "7 · 6 = []",
  "2 ч 15 мин = [] мин",
  "3 км 200 м = [] м",
  "1000 − 365 = []",
  "[] + 27 = 64",
  "8 · [] = 72",
  "90 : [] = 9",
  "1 м = [] см",
  "47 : 6 = [] (ост. [])",
].map(line);

const ENGLISH_PROBLEMS = [
  "Tom has 3 bags of 4 apples. He has [] apples.",
  "A pen costs 7 dollars. Five pens cost [] dollars.",
  "There are 47 children and 6 benches. [] sit on each bench, and [] are left over.",
  "Ann read 24 pages on Monday and twice as many on Tuesday. On Tuesday she read [] pages, and in the two days [] pages.",
  "A rope 96 m long is cut into 8 equal parts. Each part is [] m long.",
].map(line);

const RUSSIAN_PROBLEMS = [
  "У Тани 3 пакета по 4 яблока. У неё [] яблок.",
  "Карандаш стоит 7 рублей. Пять карандашей стоят [] рублей.",
  "На 6 скамеек сели 47 детей поровну: по [] на каждую, и [] осталось.",
  "В книге 96 страниц. Маша прочитала в понедельник 24 страницы, во вторник — в два раза больше, а в среду — остальные. Во вторник она прочитала [] страниц, а в среду — [] страниц.",
  "Поезд шёл 3 часа со скоростью 80 км в час. Он прошёл [] км.",
].map(line);

/** `n` short lines: 7 × 1 = [], 7 × 2 = [] and on. */
export function shortLines(n: number): WorkbookItem[] {
  return Array.from({ length: n }, (_, k) => line(`7 × ${k + 1} = []`));
}

/** `n` lines across the page, one line each. */
function longLines(n: number): WorkbookItem[] {
  return Array.from({ length: n }, (_, k) =>
    line(`Tom has ${k + 3} bags of 4 apples. He has [] apples.`),
  );
}

/** The pages, in the order the test vectors give them. */
export const PAGES: readonly CorpusPage[] = [
  {
    name: "workbook-page",
    about:
      "The format's example of a workbook page (spec/format/examples/task/valid/workbook-page.yaml at v0.2.37), copied: two short lines to a row, a short line before a long one alone, and a line of two boxes.",
    items: [
      line("7 × [] = 56"),
      line("[] ÷ 8 = 4"),
      line("56 [] 65"),
      line("Tom has 3 bags of 4 apples. He has [] apples."),
      line("47 ÷ 6 = [] r []"),
    ],
    fonts: true,
  },
  {
    name: "tables-page",
    about:
      "The format's example of a module's workbook task (spec/format/examples/module/valid/with-tasks/tasks/tables-page.yaml at v0.2.37), copied.",
    items: [line("7 × [] = 56"), line("47 ÷ 6 = [] r []")],
    fonts: true,
  },
  {
    name: "times-ten",
    about: "Ten examples of the table of 7, as the prototype's page has them: five rows of two.",
    items: TIMES,
    fonts: true,
  },
  {
    name: "fractions-ten",
    about:
      "«Ten examples on fractions», the workbook's example in concepts 8 spec, two of them comparisons: five rows of two, and half the page left for the draft.",
    items: FRACTIONS,
    fonts: true,
  },
  {
    name: "russian-ten",
    about:
      "Ten Russian lines: «:» and «·», units, and a remainder in brackets, which takes the page's width.",
    items: RUSSIAN,
    fonts: true,
  },
  {
    name: "english-problems",
    about: "Five word problems in English, of one or two lines, two of them with two boxes.",
    items: ENGLISH_PROBLEMS,
    fonts: true,
  },
  {
    name: "russian-problems",
    about: "Five word problems in Russian, one of them three lines long, with two boxes.",
    items: RUSSIAN_PROBLEMS,
    fonts: true,
  },
  {
    name: "mixed",
    about:
      "Short lines and long ones in turn: a short line before a long one stands alone in the left column, and the order is the task's.",
    items: [
      line("7 × [] = 56"),
      ENGLISH_PROBLEMS[0] as WorkbookItem,
      line("[] ÷ 8 = 4"),
      line("56 [] 65"),
      line("3/4 + 1/4 = []"),
      RUSSIAN_PROBLEMS[0] as WorkbookItem,
      line("47 ÷ 6 = [] r []"),
      line("1000 − 365 = []"),
      LONG,
      line("2 ч 15 мин = [] мин"),
      line("90 : [] = 9"),
      line("[] apples"),
    ],
    fonts: true,
  },
  {
    name: "twenty-short",
    about: "Twenty short lines: ten rows of two, the most the page holds.",
    items: shortLines(20),
    fonts: true,
  },
  {
    name: "twenty-one-short",
    about: "Twenty-one short lines: the eleventh row has no room.",
    items: shortLines(21),
    fonts: true,
    refused: 20,
  },
  {
    name: "ten-long",
    about: "Ten lines across the page, one line each: ten rows.",
    items: longLines(10),
    fonts: true,
  },
  {
    name: "eleven-long",
    about: "Eleven lines across the page: the eleventh has no room.",
    items: longLines(11),
    fonts: true,
    refused: 10,
  },
  {
    name: "huge-piece",
    about:
      "A piece of 400 words before its box: the item has no room, and the layout stops at the page's foot.",
    items: [line(`${"many words ".repeat(200)}[]`)],
    fonts: true,
    refused: 0,
  },
  {
    name: "many-boxes",
    about:
      "Seven boxes in a row after a word: a line may break between two boxes, though never between a box and the word after it.",
    items: [line(`Fill in the boxes:${" []".repeat(7)}`)],
    fonts: true,
  },
  {
    name: "glued-run",
    about:
      "Words that each start with a closing mark hold on to the word before them: a run no line may break, wider than a line, goes word by word.",
    items: [line(`Marks:${" .x".repeat(48)} []`)],
    fonts: true,
  },
  {
    name: "long-word",
    about: "A word of 100 letters, wider than a line: it breaks between its letters.",
    items: [line(`The longest word: ${"supercalifragilistic".repeat(5)} and its box []`)],
    fonts: true,
  },
  {
    name: "white-space",
    about:
      "White space that breaks — tabs, a new line, runs of spaces — is one space between words and none at a piece's ends; a piece of white space alone draws nothing; a no-break space is a character of its word.",
    items: [
      { line: [{ text: "\t7  ×\n" }, { binding: "box" }, { text: " = 56 " }] },
      { line: [{ binding: "box" }, { text: " " }, { binding: "box" }] },
      line("2\u00a0км = [] м"),
    ],
    fonts: true,
  },
  {
    name: "punctuation",
    about:
      "A line does not start with a closing mark nor end with an opening one, and a box holds on to the word after it: «.» after a box, «(» before one, and a piece of «.» after a piece of text.",
    items: [
      { line: [{ text: "He has" }, { binding: "box" }, { text: "." }] },
      { line: [{ text: "(" }, { binding: "box" }, { text: ")" }] },
      { line: [{ text: "apples" }, { text: "." }, { binding: "box" }] },
    ],
    fonts: true,
  },
  {
    name: "scripts",
    about:
      "Characters the table knows by their ranges: е and a combining diaeresis as wide as ё, Chinese and an emoji a square each, a family of emoji joined by ZWJ and a flag one cluster each, Greek and Hebrew of the unknown width.",
    items: [
      line("е\u0308 = ё []"),
      line("三 + 四 = []"),
      line("🍎 × 3 = []"),
      line("👨\u200d👩\u200d👧 = []"),
      line("🇺🇦 []"),
      line("π ≈ []"),
      line("שלום []"),
    ],
    fonts: false,
  },
];
