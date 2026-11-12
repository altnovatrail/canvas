// The volunteer's way through the samples page (T78 in RUN.md; R54 in docs/decisions.md), on a
// device of the test's own: the steps the page owns and those the device owns, the files kept,
// a second pass only after the device failed, and the two builds' ways of T22 (R65).

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { Run } from "./run.ts";
import { build, checkAll, type Device, passes, volunteer } from "./volunteer.ts";
import type { Clock } from "./wait.ts";
import {
  AS_CHILD,
  CHILD_FLAG,
  CHILD_START,
  ERASER,
  MARK,
  MARKING,
  MARKUP,
  OPEN_SHOWN,
  PAINT,
  PAINTED,
  PEN,
  REOPEN,
  type Seen,
  SHEET,
  SHOW_HIDDEN,
  START,
  TASKS,
  TEST_START,
  UNDO,
  VIEWED,
  WORKBOOK,
} from "./watch.ts";

/** A clock that moves only by the waits' own pauses: a wait of thirty seconds takes none. */
function clock(): Clock {
  let at = 0;
  return {
    now: () => at,
    pause: async (ms: number) => {
      at += ms;
    },
  };
}

let folder: string;
let run: Run;

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), "canvas-volunteer-"));
  run = new Run(folder);
});

afterEach(() => {
  rmSync(folder, { recursive: true, force: true });
});

/** A page that does what it should, on a device that can do all it is asked, unless told not to;
 * what it cannot do it records in the journal of its run. */
function device(
  journal: Run,
  fails: {
    draw?: boolean;
    press?: boolean;
    save?: boolean;
    mark?: boolean;
    start?: boolean;
    paint?: boolean;
    answer?: boolean;
    cancel?: boolean;
    eraser?: boolean;
    scroll?: boolean;
    view?: boolean;
  } = {},
): Device & { closed: number } {
  const page = {
    strokes: 0,
    task: "0",
    blobs: [] as string[],
    last: "",
    tool: "pen",
    scrolled: 0,
  };
  /** An action on the sheet, as its history tells it. */
  const act = (kind: string) => {
    page.strokes += 1;
    page.last = kind;
  };
  const seen = (): Seen => ({
    watched: true,
    defined: true,
    tasks: TASKS,
    task: page.task,
    strokes: page.strokes,
    policy: "default-src 'none'; connect-src 'none'",
    resources: [],
    violations: [],
    errors: [],
    blobs: page.blobs.length,
    pointers: [],
  });
  const own = {
    closed: 0,
    open: async () => true,
    read: async () => seen(),
    evaluate: async (expression: string) => {
      const { strokes: events, last, tool, scrolled } = page;
      if (expression === SHEET) return JSON.stringify({ events, last, tool, scrolled });
      if (expression === TEST_START) {
        return JSON.stringify({ evalSetOpen: true, measurementOpen: true, childOpen: true });
      }
      if (expression === CHILD_START) {
        return JSON.stringify({
          newShown: true,
          newBlocks: true,
          begun: !fails.start,
          childWrites: true,
          ipadNote: true,
          writerAsked: false,
        });
      }
      if (expression === CHILD_FLAG || expression === OPEN_SHOWN) return true;
      if (expression === AS_CHILD) return true;
      if (expression === REOPEN) return 0;
      if (expression === SHOW_HIDDEN) return !fails.view;
      if (expression === VIEWED) {
        const hidden = fails.view ? 0 : 1;
        return JSON.stringify({
          shown: true,
          lines: 1,
          hidden,
          toggle: true,
          crops: 4,
          decoded: 4,
        });
      }
      // The page's markup: its form comes, and the writer's markup lets it save.
      if (expression === START) return !fails.start;
      if (expression === MARKUP) return 0;
      if (expression === MARKING || expression === MARK) return !fails.mark;
      // A frame comes at once, or never on a device that renders none.
      if (expression === PAINT) return 0;
      if (expression === PAINTED) return !fails.paint;
      if (fails.answer) throw new TypeError("execute/sync: TimeoutError");
      const at = /blobs\[(\d+)\]/.exec(expression)?.[1];
      return page.blobs[Number(at)] ?? null;
    },
    draw: async (name: string) => {
      if (fails.draw) {
        journal.record(`draw on the ${name}`, false);
        return undefined;
      }
      act(page.tool === "eraser" ? "erase" : "write");
      return "by the test";
    },
    // A page that kept a cancelled stroke would write it as any other.
    cancel: async () => {
      if (fails.cancel) act("write");
      return "by the test";
    },
    scroll: async () => {
      if (!fails.scroll) page.scrolled += 100;
      return "by the test";
    },
    button: async (label: string) => {
      if (label === ERASER && !fails.eraser) page.tool = "eraser";
      if (label === PEN) page.tool = "pen";
      if (label === UNDO) act("undo");
      return true;
    },
    openFile: async () => "by the test",
    press: async (name: string) => {
      if (fails.press) {
        journal.record(`press for the ${name}`, false);
        return false;
      }
      if (!fails.save) page.blobs.push(`{"surface":"${page.task}"}`);
      return true;
    },
    toWorkbook: async () => {
      page.task = WORKBOOK;
      page.strokes = 0;
      page.last = "";
    },
    requests: () => [],
    shot: () => {},
    close: async () => {
      own.closed += 1;
    },
  };
  return own;
}

/** The checks of what the page did all along, at the end of a way. */
const VERDICTS = [
  "the watch saw the page from its start",
  "the page carries its policy of no network",
  "the policy saw no violation",
  "the page threw no error",
  "the page asked for nothing outside its file",
];

test("a page that does what it should passes each step, and its files are kept when asked", async () => {
  const quiet = device(run);
  await volunteer(run, quiet, { keep: true }, clock());
  expect(run.verdict()).toBe("ok");
  expect(quiet.closed).toBe(1);
  expect(run.steps.map(({ step }) => step)).toEqual([
    "the element stands and offers the build's tasks",
    "the start lets an adult begin the measurement",
    "read the page after the stroke on the sheet",
    "the sheet holds the stroke drawn",
    "a stroke the browser cancels leaves nothing on the sheet",
    "the row's eraser takes the presses after it",
    "the eraser takes the stroke off",
    "undo puts the stroke back",
    "the pen comes back",
    "a second stroke is written and erased",
    "the pen comes back after the second erasing",
    "two fingers scroll the sheet or the page, and write nothing",
    "the sheet is marked up, and the page will save it",
    "the sheet's sample is handed to a download",
    "the picker shows the workbook's page",
    "the writer says they imitate a child's hand",
    "read the page after the stroke on the workbook",
    "the workbook holds the stroke drawn",
    "the workbook is marked up, and the page will save it",
    "the workbook's sample is handed to a download",
    ...VERDICTS,
    "the page opened anew shows the start and the section that opens a file",
    "the file opened shows its strokes, those the history did not show apart, and its crops",
    "its checkbox draws the strokes the history did not show",
    ...VERDICTS.map((step) => `${step}, after the page was opened anew`),
  ]);
  expect(readdirSync(join(folder, "saved")).sort((a, b) => a.localeCompare(b))).toEqual([
    "sheet.json",
    "workbook.json",
  ]);
  expect(readFileSync(join(folder, "saved", "workbook.json"), "utf8")).toBe(
    `{"surface":"${WORKBOOK}"}`,
  );
  expect(JSON.parse(readFileSync(join(folder, "watch.json"), "utf8")).requests).toEqual([]);
});

test("a device that renders no frame before the stroke, or stops answering while a file is handed, fails, not the page (T21)", async () => {
  await volunteer(run, device(run, { paint: true }), { keep: false }, clock());
  expect(run.verdict()).toBe("device");
  expect(run.steps.at(-1)?.step).toBe("the page renders the sheet before the stroke");
  const other = new Run(mkdtempSync(join(folder, "answer-")));
  await volunteer(other, device(other, { answer: true }), { keep: false }, clock());
  expect(other.verdict()).toBe("device");
  expect(other.steps.at(-1)?.step).toBe("read the page while the sheet's sample is handed");
});

test("a device that cannot draw or press is the device's failure, and the pass stops there", async () => {
  await volunteer(run, device(run, { draw: true }), { keep: false }, clock());
  expect(run.verdict()).toBe("device");
  const other = new Run(mkdtempSync(join(folder, "press-")));
  await volunteer(other, device(other, { press: true }), { keep: false }, clock());
  expect(other.verdict()).toBe("device");
  expect(other.steps.at(-1)?.step).toBe("press for the sheet");
});

test("a page that no longer answers after the stroke is the device's failure", async () => {
  const hung = device(run);
  let reads = 0;
  const read = hung.read;
  // The first read finds the page ready; the one after the stroke finds no answer.
  hung.read = async () => (++reads > 1 ? undefined : read());
  await volunteer(run, hung, { keep: false }, clock());
  expect(run.verdict()).toBe("device");
  expect(run.steps.at(-1)?.step).toBe("read the page after the stroke on the sheet");
});

test("a form of the markup the driver cannot reach is the device's failure", async () => {
  const hung = device(run);
  const evaluate = hung.evaluate;
  hung.evaluate = async (expression: string) => {
    if (expression === MARKING) throw new Error("POST /execute/sync: TimeoutError");
    return evaluate(expression);
  };
  await volunteer(run, hung, { keep: false }, clock());
  expect(run.verdict()).toBe("device");
  expect(run.steps.at(-1)?.step).toBe("reach the form of the markup of the sheet");
});

test("a page whose start does not let the author begin is the page's failure, and nothing is drawn", async () => {
  const page = device(run, { start: true });
  await volunteer(run, page, { keep: false }, clock());
  expect(run.verdict()).toBe("page");
  expect(run.steps.at(-1)?.step).toBe("the start lets an adult begin the measurement");
  expect(page.closed).toBe(1);
});

test("a page whose markup does not let it save is the page's failure", async () => {
  await volunteer(run, device(run, { mark: true }), { keep: false }, clock());
  expect(run.verdict()).toBe("page");
  expect(
    run.steps.find(({ step }) => step.endsWith("marked up, and the page will save it"))?.ok,
  ).toBe(false);
});

test("a page that hands no file over is the page's failure", async () => {
  await volunteer(run, device(run, { save: true }), { keep: false }, clock());
  expect(run.verdict()).toBe("page");
});

test.each([
  ["cancel", "a stroke the browser cancels leaves nothing on the sheet"],
  ["scroll", "two fingers scroll the sheet or the page, and write nothing"],
  [
    "view",
    "the file opened shows its strokes, those the history did not show apart, and its crops",
  ],
] as const)(
  "a page whose %s does not do as T22's checklist says fails, as the page (R65)",
  async (fail, step) => {
    await volunteer(run, device(run, { [fail]: true }), { keep: false }, clock());
    expect(run.verdict()).toBe("page");
    expect(run.steps.find((one) => one.step === step)).toMatchObject({ ok: false, kind: "page" });
  },
);

test("a press of a row's button that changes nothing on the sheet missed it: the device's failure, which earns one more pass", async () => {
  await volunteer(run, device(run, { eraser: true }), { keep: false }, clock());
  expect(run.verdict()).toBe("device");
  expect(run.steps.at(-1)).toMatchObject({
    step: "the press of the row's Ластик reached it",
    ok: false,
    kind: "device",
  });
});

test("a build's run closes its journal whatever came, and the job fails naming every run that failed", async () => {
  // A build whose file the device cannot find: the run records it, and still closes.
  await build(run, "a build", () => {
    throw new Error("the build holds not one page");
  });
  expect(run.steps.at(-1)).toMatchObject({ step: "the run went to its end", ok: false });
  expect(readFileSync(join(folder, "verdict.txt"), "utf8")).toBe("device\n");
  expect(readdirSync(folder)).toContain("steps.json");
  const fine = new Run(mkdtempSync(join(folder, "fine-")));
  const checked: string[] = [];
  await build(fine, "a fine build", () => ({
    pass: async () => fine.record("a step", true),
    recover: async () => {},
    after: () => checked.push("after"),
  }));
  expect(checked).toEqual(["after"]);
  expect(() => checkAll([fine])).not.toThrow();
  const other = new Run(mkdtempSync(join(folder, "other-")));
  other.record("a step", false, "", "page");
  expect(() => checkAll([run, fine, other])).toThrow(/run.*went to its end.*other-.*a step/s);
});

test("the test build's way: its start, a child's session begun with the form's code, a child's sheet and workbook (T22)", async () => {
  const child = device(run);
  await volunteer(run, child, { keep: true, way: "test" }, clock());
  expect(run.verdict()).toBe("ok");
  expect(run.steps.map(({ step }) => step)).toEqual([
    "the element stands and offers the build's tasks",
    "the test build's start opens the eval set, the measurement and a child's session",
    "a new child's code is shown for the form, and begins no session",
    "the start lets the adult begin a child's session with the form's code",
    "in a child's session the child writes, no adult's hand is asked, and the iPad's downloads are named",
    "read the page after the stroke on the sheet",
    "the sheet holds the stroke drawn",
    "a child's form labels an illegible part unread by the child's words too",
    "the sheet is marked up, and the page will save it",
    "the sheet's sample is handed to a download",
    "the picker shows the workbook's page",
    "read the page after the stroke on the workbook",
    "the workbook holds the stroke drawn",
    "the workbook is marked up, and the page will save it",
    "the workbook's sample is handed to a download",
    ...VERDICTS,
  ]);
  const shut = new Run(mkdtempSync(join(folder, "shut-")));
  await volunteer(shut, device(shut, { start: true }), { keep: false, way: "test" }, clock());
  expect(shut.verdict()).toBe("page");
  expect(shut.steps.at(-1)?.step).toBe(
    "the start lets the adult begin a child's session with the form's code",
  );
});

test("one more pass follows a device's failure only, and none follows the last", async () => {
  const recovered: number[] = [];
  let tries = 0;
  await passes(
    run,
    async () => {
      tries += 1;
      run.record("open", false);
    },
    async () => {
      recovered.push(run.pass);
    },
  );
  expect(tries).toBe(2);
  expect(recovered).toEqual([1]);
  expect(run.pass).toBe(2);

  const page = new Run(mkdtempSync(join(folder, "page-")));
  let pageTries = 0;
  await passes(
    page,
    async () => {
      pageTries += 1;
      page.record("draw", false, "", "page");
    },
    async () => {},
  );
  expect(pageTries).toBe(1);

  const thrown = new Run(mkdtempSync(join(folder, "thrown-")));
  await passes(
    thrown,
    async () => {
      throw new Error("the socket closed");
    },
    async () => {},
  );
  expect(thrown.steps.map(({ step, pass }) => `${pass} ${step}`)).toEqual([
    "1 the pass went to its end",
    "2 the pass went to its end",
  ]);
});
