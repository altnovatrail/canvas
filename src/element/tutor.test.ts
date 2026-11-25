import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { toCrop } from "../core/tutor.js";
import type { ExportedPaper, HistoryChange, HistoryEvent, TutorAct } from "./index.js";
import { at, buttonOf, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { inkAt, lines, offFromWhole, paper, written } from "./tutor.fixture.js";

// The tutor's act in grown-up mode on a task from paper, in a browser: one event of the history
// told at once, its strokes drawn one after another within 3 s, where the crop's pixels put them,
// an undo that takes it back whole and cuts the drawing short, and the acts it takes as
// TypeErrors, which change nothing. That reduced motion draws it at once is motion.test.ts's.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

test("sends one event of the tutor's act at once, its strokes on the shown tracing paper that holds them, and resolves once they are drawn", async () => {
  const { element, submission } = await paper(made);
  const told: HistoryChange[] = [];
  element.addEventListener("historychange", (event) => told.push(event.detail));
  const done = element.drawTutor(submission, { ...lines(submission, 150, 2), erase: [1] });
  expect(told).toHaveLength(1);
  const [event] = told[0]?.events ?? [];
  if (event?.kind !== "tutor") throw new Error("no act of the tutor");
  expect(told[0]?.from).toBe(1);
  expect(event.on).toBe("tracing");
  expect(event.ids).toEqual([1]);
  expect(event.strokes.map(({ id }) => id)).toEqual([2, 3]);
  expect(event.strokes[0]?.style).toMatchObject({ pen: "liner", color: "#ff3b30", opacity: 100 });
  // On the tracing paper from its corner, at [180, 60].
  expect(event.strokes[0]?.points[0]?.x).toBeCloseTo(220 - 180, 1);
  expect(event.strokes[0]?.points[0]?.y).toBeCloseTo(150 - 60, 1);
  expect(element.history.at(-1)).toBe(event);
  await done;
  await settle();
  expect(inkAt(element, 350, 150)).toBe(true);
  expect(inkAt(element, 320, 850)).toBe(false);
  // The strokes the crop shows now are the tutor's, where the act put them.
  const seen = element.cropStrokes(submission);
  expect(seen.map(({ id }) => id)).toEqual([2, 3]);
  const first = lines(submission, 150, 1).strokes[0]?.points ?? [];
  for (const [k, value] of first.entries()) expect(seen[0]?.points[k]).toBeCloseTo(value, 1);
  // The work for checking holds them, as any stroke the sheet shows.
  const again = (await element.exportWork()) as ExportedPaper | null;
  expect(again?.submission.groups.flatMap(({ ids }) => ids).sort()).toEqual([2, 3]);
  // An undo takes the act back whole.
  expect(element.undo()).toBe(true);
  expect(told.at(-1)?.events).toEqual([
    { kind: "undo", t: expect.any(Number), removed: [2, 3], restored: [1] },
  ]);
  await settle();
  expect(inkAt(element, 350, 150)).toBe(false);
  expect(inkAt(element, 320, 850)).toBe(true);
});

test("puts the act on the sheet when the context's tracing paper was hidden", async () => {
  const { element, submission } = await paper(made);
  const hidden = { ...submission, tracing: { ...submission.tracing, hidden: true } };
  await element.drawTutor(hidden, lines(submission, 1000, 1));
  const event = element.history.at(-1);
  if (event?.kind !== "tutor") throw new Error("no act of the tutor");
  expect(event.on).toBeUndefined();
  expect(event.strokes[0]?.points[0]?.y).toBeCloseTo(1000, 1);
});

test("draws a long act one stroke after another, all of it within 3 s, and leaves the canvas as a sheet drawn at once shows it", async () => {
  const { element, submission } = await paper(made);
  const start = performance.now();
  const done = element.drawTutor(submission, lines(submission, 120, 60));
  let resolved = false;
  void done.then(() => {
    resolved = true;
  });
  await new Promise((resolve) => setTimeout(resolve, 600));
  // The first strokes are drawn, the last not yet.
  expect(resolved).toBe(false);
  expect(inkAt(element, 350, 120)).toBe(true);
  expect(inkAt(element, 350, 120 + 59 * 6)).toBe(false);
  await done;
  const took = performance.now() - start;
  expect(took).toBeGreaterThan(2000);
  expect(took).toBeLessThan(3000 + 500);
  await settle();
  expect(inkAt(element, 350, 120 + 59 * 6)).toBe(true);

  expect(await offFromWhole(made, element)).toBe(0);
});

test("a stroke the learner writes while the act is drawn lands, and the canvas ends as a sheet drawn at once shows it", async () => {
  const { element, submission } = await paper(made);
  const canvas = element.shadowRoot?.querySelector("canvas");
  if (!canvas) throw new Error("no canvas");
  const done = element.drawTutor(submission, lines(submission, 120, 40));
  await settle();
  const view = () => {
    const { view: shown } = probe(element);
    if (shown === undefined) throw new Error("the element is not laid out");
    return shown;
  };
  const send = (type: string, y: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, {
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        bubbles: true,
        ...at(canvas, view(), 350, y),
        ...init,
      }),
    );
  // Down through the lines on the tracing paper, from the sheet below it.
  send("pointerdown", 450, { button: 0, buttons: 1, pressure: 0.5 });
  for (let y = 430; y >= 100; y -= 30) {
    send("pointermove", y, { buttons: 1, pressure: 0.5 });
    await settle();
  }
  send("pointerup", 100, { button: 0, buttons: 0 });
  await done;
  await settle();
  expect(element.history.map(({ kind }) => kind)).toEqual(["write", "tutor", "write"]);
  expect(await offFromWhole(made, element)).toBe(0);
});

test("an undo while the act is drawn takes it back whole and ends the drawing at once", async () => {
  const { element, submission } = await paper(made);
  const done = element.drawTutor(submission, lines(submission, 120, 40));
  await settle();
  const undone = performance.now();
  expect(element.undo()).toBe(true);
  await done;
  expect(performance.now() - undone).toBeLessThan(200);
  expect(element.history.at(-1)).toMatchObject({
    kind: "undo",
    removed: Array.from({ length: 40 }, (_, k) => k + 2),
  });
  await settle();
  expect(inkAt(element, 350, 120)).toBe(false);
});

test("a scroll, a new history or another act draw what is left at once", async () => {
  const { element, submission } = await paper(made);
  const first = element.drawTutor(submission, lines(submission, 120, 40));
  await settle();
  const second = element.drawTutor(submission, lines(submission, 500, 1));
  await first;
  await settle();
  expect(inkAt(element, 350, 120 + 39 * 6)).toBe(true);
  const viewport = element.shadowRoot?.querySelector<HTMLElement>(".viewport");
  await second;
  const third = element.drawTutor(submission, lines(submission, 600, 40));
  await settle();
  viewport?.scrollBy({ top: 40, behavior: "instant" });
  const scrolled = performance.now();
  await third;
  expect(performance.now() - scrolled).toBeLessThan(500);
  const fourth = element.drawTutor(submission, lines(submission, 700, 40));
  element.history = [];
  await fourth;
  expect(element.history).toHaveLength(0);
});

test("takes an act with an ID the sheet does not show, a point off the sheet, a bad colour or another context as a TypeError, and changes nothing", async () => {
  const { element, submission } = await paper(made);
  const history = element.history;
  const line = lines(submission, 300, 1).strokes[0];
  if (line === undefined) throw new Error("no line");
  const told: unknown[] = [];
  element.addEventListener("historychange", (event) => told.push(event.detail));
  const bad: TutorAct[] = [
    { strokes: [], erase: [7] },
    { strokes: [{ ...line, points: [-1e7, 0, 10, 10] }], erase: [] },
    { strokes: [{ ...line, color: "red" }], erase: [] },
  ];
  for (const act of bad) expect(() => element.drawTutor(submission, act)).toThrow(TypeError);
  const sheet = { crop: submission.crop, groups: submission.groups, digest: submission.digest };
  expect(() => element.drawTutor(sheet as never, lines(submission, 300, 1))).toThrow(TypeError);
  expect(() => element.cropStrokes(sheet as never)).toThrow(TypeError);
  expect(element.history).toBe(history);
  expect(told).toEqual([]);
  // An act of nothing is no action.
  await element.drawTutor(submission, { strokes: [], erase: [] });
  expect(element.history).toBe(history);
  // The task from paper stays while the history holds the tutor's act.
  await element.drawTutor(submission, { strokes: [], erase: [1] });
  expect(() => {
    element.paper = undefined;
  }).toThrow(TypeError);
});

/** The colour of a PNG's pixel: red, green and blue. */
async function pixelOf(png: Blob, x: number, y: number): Promise<number[]> {
  const bitmap = await createImageBitmap(png);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("no 2D context");
  context.drawImage(bitmap, 0, 0);
  return [...context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data.slice(0, 3)];
}

/** The right edge of the element's bar of buttons, its panels', in CSS px from the element's left. */
function railRight(element: HTMLElement): number {
  const rail = element.shadowRoot?.querySelector<HTMLElement>(".rail");
  if (rail === null || rail === undefined) throw new Error("no bar of buttons");
  const right = Math.max(
    ...Array.from(rail.children, (panel) => panel.getBoundingClientRect())
      .filter((box) => box.width > 0)
      .map((box) => box.right),
  );
  return Math.max(right - element.getBoundingClientRect().left, 0);
}

test("leaves the host's cover out of the drawing's crop, with a margin, takes the whole part in sight when too little is left, and takes a bad side as a TypeError", async () => {
  const { element } = await paper(made, []);
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  const free = (await element.exportForDrawing()).submission.crop.sheetBox;
  const covered = (await element.exportForDrawing({ top: 40, right: 200, bottom: 50 })).submission
    .crop.sheetBox;
  expect(covered[1]).toBeCloseTo(free[1], 1);
  expect(covered[0] - free[0]).toBeCloseTo((40 + 16) / view.k, 0);
  expect(covered[3]).toBeCloseTo(view.vx + (600 - 200 - 16) / view.k, 0);
  expect(covered[2]).toBeCloseTo(view.vy + (600 - 50 - 16) / view.k, 0);
  // A cover that leaves too little: the whole part in sight, the bar of buttons too.
  const whole = (await element.exportForDrawing({ right: 500 })).submission.crop.sheetBox;
  expect(whole[1]).toBeCloseTo(Math.max(0, view.vx), 1);
  for (const cover of [{ right: -1 }, { top: Number.NaN }, { left: "8" }, 5]) {
    expect(() => element.exportForDrawing(cover as never)).toThrow(TypeError);
  }
});

test("gives the drawing's crop of a blank sheet in sight, and an act in its blank part lands where it was put", async () => {
  const { element } = await paper(made, []);
  expect(await element.exportWork()).toBeNull();
  const drawing = await element.exportForDrawing();
  const { submission } = drawing;
  expect(drawing.statement).toBe(element.paper?.statement);
  expect(drawing.png.type).toBe("image/png");
  expect(submission.groups).toEqual([]);
  expect(Math.max(submission.crop.width, submission.crop.height)).toBeLessThanOrEqual(1568);
  // The part of the sheet in sight, right of the bar of buttons by a margin of 16 px.
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  const [ymin, xmin] = submission.crop.sheetBox;
  expect(xmin).toBeCloseTo(view.vx + (railRight(element) + 16) / view.k, 0);
  expect(ymin).toBeCloseTo(Math.max(0, view.vy), 1);
  const bitmap = await createImageBitmap(drawing.png);
  expect([bitmap.width, bitmap.height]).toEqual([submission.crop.width, submission.crop.height]);
  expect(element.cropStrokes(submission)).toEqual([]);
  // Left of the tracing paper, which starts at x 180: on the sheet, where it was put, the paper
  // shown or not — not pressed to the paper's left edge.
  const from = toCrop({ x: 60, y: 900 }, submission);
  const to = toCrop({ x: 150, y: 900 }, submission);
  await element.drawTutor(submission, {
    strokes: [{ points: [from.x, from.y, to.x, to.y], color: "#000000", width: 3 }],
    erase: [],
  });
  const event = element.history.at(-1);
  if (event?.kind !== "tutor") throw new Error("no act of the tutor");
  expect(event.on).toBeUndefined();
  expect(event.strokes[0]?.points[0]?.x).toBeCloseTo(60, 1);
  await settle();
  expect(inkAt(element, 100, 900)).toBe(true);
  // The paper hidden, the act goes on the sheet, where it was put.
  element.tracing = { ...submission.tracing, hidden: true };
  const hidden = (await element.exportForDrawing()).submission;
  expect(hidden.tracing.hidden).toBe(true);
  await element.drawTutor(hidden, {
    strokes: [
      {
        points: [
          ...Object.values(toCrop({ x: 60, y: 900 }, hidden)),
          ...Object.values(toCrop({ x: 150, y: 900 }, hidden)),
        ],
        color: "#000000",
        width: 3,
      },
    ],
    erase: [],
  });
  const onSheet = element.history.at(-1);
  if (onSheet?.kind !== "tutor") throw new Error("no act of the tutor");
  expect(onSheet.on).toBeUndefined();
  expect(onSheet.strokes[0]?.points[0]?.x).toBeCloseTo(60, 1);
  expect(onSheet.strokes[0]?.points[0]?.y).toBeCloseTo(900, 1);
  await settle();
  expect(inkAt(element, 100, 900)).toBe(true);
});

test("its crop shows the strokes in sight and the tracing paper while shown, and cropStrokes gives those that reach into it alone", async () => {
  const onPaper: HistoryEvent = {
    kind: "write",
    t: 300,
    on: "tracing",
    stroke: {
      id: 2,
      kind: "pen",
      points: [
        { x: 20, y: 20, t: 200, p: 0.5 },
        { x: 60, y: 30, t: 300, p: 0.5 },
      ],
    },
  };
  const far: HistoryEvent = {
    kind: "write",
    t: 500,
    stroke: {
      id: 3,
      kind: "pen",
      points: [
        { x: 300, y: 9000, t: 400, p: 0.5 },
        { x: 340, y: 9040, t: 500, p: 0.5 },
      ],
    },
  };
  const { element } = await paper(made, [written, onPaper, far]);
  const shown = await element.exportForDrawing();
  expect(element.cropStrokes(shown.submission).map(({ id }) => id)).toEqual([1, 2]);
  // The tracing paper's crop is grey #ddd in its picture, away from its black bar; the sheet white.
  const paperAt = toCrop({ x: 180 + 150, y: 60 + 80 }, shown.submission);
  const [grey] = await pixelOf(shown.png, paperAt.x, paperAt.y);
  expect(grey).toBeLessThan(240);
  const sheetAt = toCrop({ x: 600, y: 900 }, shown.submission);
  expect(await pixelOf(shown.png, sheetAt.x, sheetAt.y)).toEqual([255, 255, 255]);
  // The learner's stroke in sight is drawn on it.
  const inkOn = toCrop({ x: 320, y: 850 }, shown.submission);
  expect((await pixelOf(shown.png, inkOn.x, inkOn.y))[0]).toBeLessThan(128);
  // Hidden, the paper and its strokes are out of the crop and of the strokes it shows.
  element.tracing = { ...element.tracing, hidden: true } as never;
  const hidden = await element.exportForDrawing();
  expect(element.cropStrokes(hidden.submission).map(({ id }) => id)).toEqual([1]);
  const paperHidden = toCrop({ x: 180 + 150, y: 60 + 80 }, hidden.submission);
  expect(await pixelOf(hidden.png, paperHidden.x, paperHidden.y)).toEqual([255, 255, 255]);
});

test("a tooltip of the bar narrows no drawing's crop: the pointer may rest over a button as the grown-up asks", async () => {
  const onPaper: HistoryEvent = {
    kind: "write",
    t: 300,
    on: "tracing",
    stroke: {
      id: 2,
      kind: "pen",
      points: [
        { x: 20, y: 20, t: 200, p: 0.5 },
        { x: 60, y: 30, t: 300, p: 0.5 },
      ],
    },
  };
  const { element } = await paper(made, [written, onPaper]);
  const tip = element.shadowRoot?.querySelector<HTMLElement>(".tip");
  await userEvent.hover(buttonOf(element, "Select"));
  expect(tip?.hidden).toBe(false);
  const shown = await element.exportForDrawing();
  expect(element.cropStrokes(shown.submission).map(({ id }) => id)).toEqual([1, 2]);
});

test("gives no drawing's crop without a task from paper: a TypeError at once", () => {
  const bare = document.createElement("novatrail-canvas");
  document.body.append(bare);
  made.push(bare);
  expect(() => bare.exportForDrawing()).toThrow(TypeError);
  expect(() => bare.cropStrokes(written as never)).toThrow(TypeError);
});
