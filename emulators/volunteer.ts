// The volunteer's way through the samples page, the same on every device (T78 in RUN.md; R54 in
// docs/decisions.md): the page opened with the watch of emulators/watch.ts in it, a stroke on the
// sheet, its markup and its sample saved, the workbook's page, a stroke there, its markup and its
// sample saved, and what the page did all along (T81). A device — emulators/page-android.ts,
// emulators/page-ipad.ts — gives the ways of its own: how the page opens, how a stroke is drawn,
// how the save button is pressed. Its own steps are the device's, which earn the run one more pass
// when they fail; the steps here are the page's, which fail it.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Run } from "./run.ts";
import { type Clock, REAL, until } from "./wait.ts";
import {
  blobAt,
  MARK,
  MARKING,
  MARKUP,
  PAINT,
  PAINTED,
  type Seen,
  START,
  TASKS,
  verdicts,
  WORKBOOK,
} from "./watch.ts";

/** What a device does on the volunteer's way. A step it cannot do it records as the device's and
 * says so by its answer. */
export interface Device {
  /** Open the page with the watch in it; whether it opened. */
  open(): Promise<boolean>;
  /** What READ gives, or undefined while the page cannot be read. */
  read(): Promise<Seen | undefined>;
  /** Run an expression in the page, its value back. */
  evaluate(expression: string): Promise<unknown>;
  /** Draw a stroke on the element: how, or undefined when the device could not. */
  draw(name: string): Promise<string | undefined>;
  /** Press the save button; whether the device could. */
  press(name: string): Promise<boolean>;
  /** Show the workbook's page, answering the page's question as a person would: yes. */
  toWorkbook(): Promise<void>;
  /** The requests the page made, beyond the page itself. */
  requests(seen: Seen): string[];
  /** A picture of the screen. */
  shot(name: string): void;
  /** Close what open() opened. */
  close(): Promise<void>;
}

/** The surfaces of the way: the sheet first, then the workbook's page. */
const SURFACES = ["sheet", "workbook"] as const;

/** Wait until the page has its element and the watch has seen it from its start: a reload under
 * way would show the document before it, which the watch never saw. */
async function ready(device: Device, seconds: number, clock: Clock): Promise<Seen | undefined> {
  const shown = await until(
    seconds,
    async () => {
      const seen = await device.read();
      return seen?.watched && seen.defined && seen.tasks > 0 ? seen : undefined;
    },
    1000,
    clock,
  );
  return shown ?? device.read();
}

/** Wait for the page to render a frame: whether it did. A device that renders none is failing, not
 * the page: the element it was given is laid out only in a frame (PAINT). */
async function painted(device: Device, clock: Clock): Promise<boolean> {
  const asked = await device.evaluate(PAINT).then(
    () => true,
    () => false,
  );
  if (!asked) return false;
  const done = await until(
    20,
    async () => ((await device.evaluate(PAINTED).catch(() => false)) === true ? true : undefined),
    500,
    clock,
  );
  return done === true;
}

/** Wait for the page to hand the file at an index to a download, and keep its text, when asked to,
 * in the run's folder saved/; whether it came, or undefined when the page stopped answering the
 * driver — the device's failure, which this records, not the page's. */
async function handed(
  run: Run,
  device: Device,
  index: number,
  name: string,
  keep: boolean,
  clock: Clock,
): Promise<boolean | undefined> {
  // What the last read of the page threw, if it threw: then the page did not answer at all.
  let lost: unknown;
  const text = await until(
    30,
    async () => {
      try {
        const value = await device.evaluate(blobAt(index));
        lost = undefined;
        return typeof value === "string" ? value : undefined;
      } catch (error) {
        lost = error;
        return undefined;
      }
    },
    1000,
    clock,
  );
  if (text === undefined && lost !== undefined) {
    run.record(
      `read the page while the ${name}'s sample is handed`,
      false,
      String(lost).slice(0, 200),
    );
    return undefined;
  }
  if (text === undefined) return false;
  if (keep) {
    mkdirSync(join(run.folder, "saved"), { recursive: true });
    writeFileSync(join(run.folder, "saved", `${name}.json`), text);
  }
  device.shot(`${name}-saved`);
  return true;
}

/** Mark the writing up through the page's form, as the writer would after writing (T81): the
 * markup asked for, its form filled in. Whether the page will save the sample then; or undefined
 * when the driver could not reach the form — a page that no longer answers is the device's
 * failure, which this records. */
async function markUp(
  run: Run,
  device: Device,
  name: string,
  clock: Clock,
): Promise<boolean | undefined> {
  try {
    await device.evaluate(MARKUP);
    const shown = await until(
      30,
      async () => (await device.evaluate(MARKING)) === true,
      1000,
      clock,
    );
    if (!shown) return false;
    const ready = (await device.evaluate(MARK)) === true;
    device.shot(`${name}-marked`);
    return ready;
  } catch (error) {
    run.record(`reach the form of the markup of the ${name}`, false, String(error).slice(0, 200));
    return undefined;
  }
}

/** One pass of the volunteer's way. The files the page saves are kept from the watch's copies
 * when keep is set; a device that takes them off itself leaves it unset. Its waits run on the
 * clock given: the real one, or a test's. */
export async function volunteer(
  run: Run,
  device: Device,
  keep: boolean,
  clock: Clock = REAL,
): Promise<void> {
  try {
    // Inside the try: a device that opened a session and then failed to open the page closes it.
    if (!(await device.open())) return;
    const shown = await ready(device, 45, clock);
    device.shot("opened");
    run.record(
      "the element stands and offers the build's tasks",
      Boolean(shown?.watched && shown.defined && shown.tasks === TASKS),
      `${shown?.tasks ?? 0} task(s)`,
      "page",
    );
    if (!shown?.defined) return;
    // The start, before the sheet is there: the purpose, the code and the statements (T20).
    const started = (await device.evaluate(START)) === true;
    run.record("the start lets the author begin the measurement", started, "", "page");
    if (!started) return;
    for (const [index, name] of SURFACES.entries()) {
      if (name === "workbook") {
        await device.toWorkbook();
        run.record(
          "the picker shows the workbook's page",
          (await device.read())?.task === WORKBOOK,
          "",
          "page",
        );
      }
      if (!(await painted(device, clock))) {
        run.record(`the page renders the ${name} before the stroke`, false, "no frame in 20 s");
        return;
      }
      const how = await device.draw(name);
      if (how === undefined) return;
      // A page that no longer answers is the driver's way into it gone, not the page's failure:
      // safaridriver has hung on an action once, and every command after it timed out (T81).
      const after = await device.read();
      run.record(`read the page after the stroke on the ${name}`, after !== undefined);
      if (!after) return;
      const strokes = after.strokes;
      run.record(`the ${name} holds the stroke drawn`, strokes > 0, `${strokes}, ${how}`, "page");
      const marked = await markUp(run, device, name, clock);
      if (marked === undefined) return;
      run.record(`the ${name} is marked up, and the page will save it`, marked, "", "page");
      if (!(await device.press(name))) return;
      const came = await handed(run, device, index, name, keep, clock);
      if (came === undefined) return;
      run.record(`the ${name}'s sample is handed to a download`, came, "", "page");
    }
    const last = await device.read();
    const requests = last ? device.requests(last) : [];
    writeFileSync(
      join(run.folder, "watch.json"),
      `${JSON.stringify({ seen: last, requests }, null, 2)}\n`,
    );
    if (!last) run.record("read the page at the end", false);
    else
      for (const { step, ok, note } of verdicts(last, requests)) run.record(step, ok, note, "page");
  } finally {
    await device.close();
  }
}

/** Passes of a run: one, and one more when the device failed it, after the device's recovery. A
 * pass that throws is the device's failure: the page's own are steps it records. */
export async function passes(
  run: Run,
  pass: () => Promise<void>,
  recover: () => Promise<void>,
): Promise<void> {
  for (;;) {
    try {
      await pass();
    } catch (error) {
      run.record("the pass went to its end", false, String(error).slice(0, 200));
    }
    if (run.verdict() !== "device" || run.pass >= 2) return;
    run.log("the device failed: one more pass");
    await recover();
    run.pass += 1;
  }
}
