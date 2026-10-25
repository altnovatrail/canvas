import { expect, test } from "vitest";
import { NO_TASK, sameGrid, sameStatement, sameTemplate, templateOf } from "./task.js";

const sheet = { kind: "handwriting-sheet" };

test("a task that says only its canvas kind is ruled in squares of 50 units, without a statement", () => {
  expect(templateOf({ canvas: sheet })).toEqual(NO_TASK);
  expect(templateOf(undefined)).toBe(NO_TASK);
  expect(NO_TASK).toEqual({ grid: { kind: "squares", step: 50 }, statement: [], lang: undefined });
});

test("a task gives the grid's kind and step, and a statement of texts and pictures in its language", () => {
  const template = templateOf({
    canvas: { ...sheet, grid: "dots", step: 40 },
    statement: [
      { text: "Along a path 20 m long, a post stands every 4 m. How many posts are there?" },
      { picture: "path.svg", alt: "A path with posts along it", width: 320, height: 120 },
    ],
    lang: "en",
  });
  expect(template).toEqual({
    grid: { kind: "dots", step: 40 },
    statement: [
      { text: "Along a path 20 m long, a post stands every 4 m. How many posts are there?" },
      { picture: "path.svg", alt: "A path with posts along it", width: 320, height: 120 },
    ],
    lang: "en",
  });
  for (const grid of ["squares", "lines", "dots"]) {
    expect(templateOf({ canvas: { ...sheet, grid } }).grid.kind).toBe(grid);
  }
});

test("the fields the sheet does not read are passed over, at every level", () => {
  const template = templateOf({
    id: "posts-1",
    items: [{ cell: { zone: [100, 100, 300, 200] } }],
    canvas: { ...sheet, grid: "lines", tools: ["pen", "eraser"], digitHeight: 32 },
    statement: [{ text: "Count the posts.", emphasis: "none" }],
  });
  expect(template.grid).toEqual({ kind: "lines", step: 50 });
  expect(template.statement).toEqual([{ text: "Count the posts." }]);
});

test("a value the sheet cannot show is a TypeError that names its field", () => {
  const wrong: [unknown, RegExp][] = [
    [null, /^task: an object/],
    [[], /^task: an object/],
    [{}, /^task\.canvas: an object/],
    [{ canvas: { kind: "text" } }, /^task\.canvas\.kind: the element is the handwriting sheet/],
    [{ canvas: { ...sheet, grid: "hexagons" } }, /^task\.canvas\.grid:/],
    [{ canvas: { ...sheet, step: 19 } }, /^task\.canvas\.step: .* from 20 to 500, not 19$/],
    [{ canvas: { ...sheet, step: 501 } }, /^task\.canvas\.step:/],
    [{ canvas: { ...sheet, step: Number.NaN } }, /^task\.canvas\.step: .* not NaN$/],
    [{ canvas: { ...sheet, step: "50" } }, /^task\.canvas\.step: .* not "50"$/],
    // null leaves out no field: it is a value, and not one the field takes.
    [{ canvas: { ...sheet, grid: null } }, /^task\.canvas\.grid: .* not null$/],
    [{ canvas: { ...sheet, step: null } }, /^task\.canvas\.step: .* not null$/],
    [{ canvas: sheet, statement: null }, /^task\.statement: a list/],
    [{ canvas: sheet, lang: null }, /^task\.lang:/],
    [{ canvas: sheet, lang: "" }, /^task\.lang:/],
    [{ canvas: sheet, statement: "Count." }, /^task\.statement: a list/],
    [{ canvas: sheet, statement: [{}] }, /^task\.statement\[0\]: a part is a text or a picture$/],
    [{ canvas: sheet, statement: [{ text: "a", picture: "b" }] }, /^task\.statement\[0\]: a part/],
    [{ canvas: sheet, statement: [{ text: 7 }] }, /^task\.statement\[0\]\.text:/],
    [
      { canvas: sheet, statement: [{ picture: "", alt: "", width: 1, height: 1 }] },
      /^task\.statement\[0\]\.picture:/,
    ],
    [
      { canvas: sheet, statement: [{ picture: "a.png", width: 1, height: 1 }] },
      /^task\.statement\[0\]\.alt:/,
    ],
    [
      {
        canvas: sheet,
        statement: [{ text: "a" }, { picture: "a.png", alt: "", width: 0, height: 1 }],
      },
      /^task\.statement\[1\]\.width: a size in CSS pixels, more than 0, not 0$/,
    ],
    [
      { canvas: sheet, statement: [{ picture: "a.png", alt: "", width: 1, height: Infinity }] },
      /^task\.statement\[0\]\.height:/,
    ],
  ];
  for (const [value, message] of wrong) {
    expect(() => templateOf(value)).toThrow(TypeError);
    expect(() => templateOf(value)).toThrow(message);
  }
});

test("two templates are the same when they show the same, whatever objects they came from", () => {
  const one = { canvas: { ...sheet, grid: "squares", step: 50 }, statement: [{ text: "Count." }] };
  const same = { canvas: { kind: "handwriting-sheet" }, statement: [{ text: "Count." }], id: 2 };
  expect(sameTemplate(templateOf(one), templateOf(same))).toBe(true);
  const others: unknown[] = [
    { canvas: { ...sheet, grid: "lines" }, statement: [{ text: "Count." }] },
    { canvas: { ...sheet, step: 25 }, statement: [{ text: "Count." }] },
    { canvas: sheet, statement: [{ text: "Count!" }] },
    { canvas: sheet, statement: [{ text: "Count." }], lang: "ru" },
    { canvas: sheet, statement: [{ text: "Count." }, { text: "Then write." }] },
    { canvas: sheet, statement: [{ picture: "a.png", alt: "Count.", width: 10, height: 10 }] },
  ];
  for (const other of others) {
    expect(sameTemplate(templateOf(one), templateOf(other))).toBe(false);
  }
  const picture = (width: number) => ({
    canvas: sheet,
    statement: [{ picture: "a.png", alt: "Posts", width, height: 10 }],
  });
  expect(sameTemplate(templateOf(picture(10)), templateOf(picture(10)))).toBe(true);
  expect(sameTemplate(templateOf(picture(10)), templateOf(picture(11)))).toBe(false);

  // The grid and the statement apart: a new grid leaves the statement the same, and so on.
  const regridded = templateOf({ ...one, canvas: { ...sheet, grid: "dots" } });
  expect(sameGrid(templateOf(one), regridded)).toBe(false);
  expect(sameStatement(templateOf(one), regridded)).toBe(true);
  const reworded = templateOf({ ...one, statement: [{ text: "Count!" }] });
  expect(sameGrid(templateOf(one), reworded)).toBe(true);
  expect(sameStatement(templateOf(one), reworded)).toBe(false);
});
