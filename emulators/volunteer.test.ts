// The volunteer's way through the samples page (T78 in RUN.md; R54 in docs/decisions.md), on a
// device of the test's own: the steps the page owns and those the device owns, the files kept,
// and a second pass only after the device failed.

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { Run } from "./run.ts";
import { type Device, passes, volunteer } from "./volunteer.ts";
import type { Clock } from "./wait.ts";
import { MARK, MARKING, MARKUP, type Seen, START } from "./watch.ts";

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
  fails: { draw?: boolean; press?: boolean; save?: boolean; mark?: boolean; start?: boolean } = {},
): Device & { closed: number } {
  const page = { strokes: 0, task: "0", blobs: [] as string[] };
  const seen = (): Seen => ({
    watched: true,
    defined: true,
    tasks: 3,
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
      // The page's markup: its form comes, and the writer's markup lets it save.
      if (expression === START) return !fails.start;
      if (expression === MARKUP) return 0;
      if (expression === MARKING || expression === MARK) return !fails.mark;
      const at = /blobs\[(\d+)\]/.exec(expression)?.[1];
      return page.blobs[Number(at)] ?? null;
    },
    draw: async (name: string) => {
      if (fails.draw) {
        journal.record(`draw on the ${name}`, false);
        return undefined;
      }
      page.strokes += 1;
      return "by the test";
    },
    press: async (name: string) => {
      if (fails.press) {
        journal.record(`press for the ${name}`, false);
        return false;
      }
      if (!fails.save) page.blobs.push(`{"surface":"${page.task}"}`);
      return true;
    },
    toWorkbook: async () => {
      page.task = "2";
      page.strokes = 0;
    },
    requests: () => [],
    shot: () => {},
    close: async () => {
      own.closed += 1;
    },
  };
  return own;
}

test("a page that does what it should passes each step, and its files are kept when asked", async () => {
  const quiet = device(run);
  await volunteer(run, quiet, true, clock());
  expect(run.verdict()).toBe("ok");
  expect(quiet.closed).toBe(1);
  expect(run.steps.map(({ step }) => step)).toEqual([
    "the element stands and offers the build's tasks",
    "the start lets the author begin the measurement",
    "read the page after the stroke on the sheet",
    "the sheet holds the stroke drawn",
    "the sheet is marked up, and the page will save it",
    "the sheet's sample is handed to a download",
    "the picker shows the workbook's page",
    "read the page after the stroke on the workbook",
    "the workbook holds the stroke drawn",
    "the workbook is marked up, and the page will save it",
    "the workbook's sample is handed to a download",
    "the watch saw the page from its start",
    "the page carries its policy of no network",
    "the policy saw no violation",
    "the page threw no error",
    "the page asked for nothing outside its file",
  ]);
  expect(readdirSync(join(folder, "saved")).sort((a, b) => a.localeCompare(b))).toEqual([
    "sheet.json",
    "workbook.json",
  ]);
  expect(readFileSync(join(folder, "saved", "workbook.json"), "utf8")).toBe('{"surface":"2"}');
  expect(JSON.parse(readFileSync(join(folder, "watch.json"), "utf8")).requests).toEqual([]);
});

test("a device that cannot draw or press is the device's failure, and the pass stops there", async () => {
  await volunteer(run, device(run, { draw: true }), false, clock());
  expect(run.verdict()).toBe("device");
  const other = new Run(mkdtempSync(join(folder, "press-")));
  await volunteer(other, device(other, { press: true }), false, clock());
  expect(other.verdict()).toBe("device");
  expect(other.steps.at(-1)?.step).toBe("press for the sheet");
});

test("a page that no longer answers after the stroke is the device's failure", async () => {
  const hung = device(run);
  let reads = 0;
  const read = hung.read;
  // The first read finds the page ready; the one after the stroke finds no answer.
  hung.read = async () => (++reads > 1 ? undefined : read());
  await volunteer(run, hung, false, clock());
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
  await volunteer(run, hung, false, clock());
  expect(run.verdict()).toBe("device");
  expect(run.steps.at(-1)?.step).toBe("reach the form of the markup of the sheet");
});

test("a page whose start does not let the author begin is the page's failure, and nothing is drawn", async () => {
  const page = device(run, { start: true });
  await volunteer(run, page, false, clock());
  expect(run.verdict()).toBe("page");
  expect(run.steps.at(-1)?.step).toBe("the start lets the author begin the measurement");
  expect(page.closed).toBe(1);
});

test("a page whose markup does not let it save is the page's failure", {
  timeout: 40_000,
}, async () => {
  await volunteer(run, device(run, { mark: true }), false, clock());
  expect(run.verdict()).toBe("page");
  expect(
    run.steps.find(({ step }) => step.endsWith("marked up, and the page will save it"))?.ok,
  ).toBe(false);
});

test("a page that hands no file over is the page's failure", { timeout: 40_000 }, async () => {
  await volunteer(run, device(run, { save: true }), false, clock());
  expect(run.verdict()).toBe("page");
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
