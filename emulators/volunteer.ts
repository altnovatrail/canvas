// The volunteer's way through the samples page, the same on every device (T78 in RUN.md; R54 in
// docs/decisions.md): the page opened with the watch of emulators/watch.ts in it, a stroke on the
// sheet, its markup and its sample saved, the workbook's page, a stroke there, its markup and its
// sample saved, and what the page did all along (T81). A device — emulators/page-android.ts,
// emulators/page-ipad.ts — gives the ways of its own: how the page opens, how a stroke is drawn,
// how the save button is pressed. Its own steps are the device's, which earn the run one more pass
// when they fail; the steps here are the page's, which fail it.
//
// Two builds, two ways (T22; R65). The release's goes an adult's measurement with the moves of
// T22's checklist on the sheet — a stroke the browser cancels, the eraser and undo, two fingers that
// scroll — and the workbook written as an adult imitating a child; then the page is opened anew
// and the sheet's file opened in it (T87). The test build's goes its start, the eval set closed and
// a child's session begun with the form's code, and the child's sheet and workbook (R59).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Run } from "./run.ts";
import { type Clock, REAL, until } from "./wait.ts";
import {
  AS_CHILD,
  blobAt,
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
  type SheetNow,
  START,
  TASKS,
  TEST_START,
  UNDO,
  VIEWED,
  type Viewed,
  verdicts,
  WORKBOOK,
} from "./watch.ts";

/** Which build a pass goes through, and so its way: the release's or the test's (T22). */
export type Way = "release" | "test";

/** What a device does on the volunteer's way. A step it cannot do it records as the device's and
 * says so by its answer. */
export interface Device {
  /** Open the page with the watch in it; whether it opened. */
  open(): Promise<boolean>;
  /** What READ gives, or undefined while the page cannot be read. */
  read(): Promise<Seen | undefined>;
  /** Run an expression in the page, its value back. */
  evaluate(expression: string): Promise<unknown>;
  /** Draw a stroke on the element, the sheet's second apart from the first: how, or undefined
   * when the device could not. */
  draw(name: string, second?: boolean): Promise<string | undefined>;
  /** Draw a stroke that the browser cancels before it ends, by a pointercancel: how, or undefined
   * when the device could not. */
  cancel(name: string): Promise<string | undefined>;
  /** Move two fingers up the element together, as one scrolls the sheet: how, or undefined when
   * the device could not. */
  scroll(name: string): Promise<string | undefined>;
  /** Press a button of the element's row by its label; whether the device could. */
  button(label: string, name: string): Promise<boolean>;
  /** Give the section that opens a sample file the text of one: how, or undefined when the device
   * could not. */
  openFile(text: string): Promise<string | undefined>;
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
 * in the run's folder saved/: its text, "" when none came, or undefined when the page stopped
 * answering the driver — the device's failure, which this records, not the page's. */
async function handed(
  run: Run,
  device: Device,
  index: number,
  name: string,
  keep: boolean,
  clock: Clock,
): Promise<string | undefined> {
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
  if (text === undefined) return "";
  if (keep) {
    mkdirSync(join(run.folder, "saved"), { recursive: true });
    writeFileSync(join(run.folder, "saved", `${name}.json`), text);
  }
  device.shot(`${name}-saved`);
  return text;
}

/** Mark the writing up through the page's form, as the writer would after writing (T81): the
 * markup asked for, its form filled in. Whether the page will save the sample then; or undefined
 * when the driver could not reach the form — a page that no longer answers is the device's
 * failure, which this records. In a child's session the form's flag of a part written illegibly
 * is the adult's to say, and the page labels it so (R59). */
async function markUp(
  run: Run,
  device: Device,
  name: string,
  way: Way,
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
    if (way === "test" && name === "sheet") {
      run.record(
        "a child's form labels an illegible part unread by the child's words too",
        (await device.evaluate(CHILD_FLAG)) === true,
        "",
        "page",
      );
    }
    const ready = (await device.evaluate(MARK)) === true;
    device.shot(`${name}-marked`);
    return ready;
  } catch (error) {
    run.record(`reach the form of the markup of the ${name}`, false, String(error).slice(0, 200));
    return undefined;
  }
}

/** What an expression of the page gives as JSON. */
async function json<T>(device: Device, expression: string): Promise<T> {
  return JSON.parse(String(await device.evaluate(expression))) as T;
}

/** The start of the way: under the release's sets in force, an adult's measurement (T20, T102);
 * under the test set, every purpose open and a child's session begun with the form's code, a new
 * code beginning none (T84; R59). Whether the sheet is there then. */
async function begin(run: Run, device: Device, way: Way): Promise<boolean> {
  if (way === "release") {
    const started = (await device.evaluate(START)) === true;
    run.record("the start lets an adult begin the measurement", started, "", "page");
    return started;
  }
  const start = await json<{
    evalSetOpen: boolean;
    measurementOpen: boolean;
    childOpen: boolean;
  }>(device, TEST_START);
  run.record(
    "the test build's start opens the eval set, the measurement and a child's session",
    start.evalSetOpen && start.measurementOpen && start.childOpen,
    JSON.stringify(start),
    "page",
  );
  device.shot("start");
  const child = await json<{
    newShown: boolean;
    newBlocks: boolean;
    begun: boolean;
    childWrites: boolean;
    ipadNote: boolean;
    writerAsked: boolean;
  }>(device, CHILD_START);
  run.record(
    "a new child's code is shown for the form, and begins no session",
    child.newShown && child.newBlocks,
    "",
    "page",
  );
  run.record(
    "the start lets the adult begin a child's session with the form's code",
    child.begun,
    "",
    "page",
  );
  if (!child.begun) return false;
  run.record(
    "in a child's session the child writes, no adult's hand is asked, and the iPad's downloads are named",
    child.childWrites && child.ipadNote && !child.writerAsked,
    "",
    "page",
  );
  device.shot("child-begun");
  return true;
}

/** The moves of T22's checklist on the sheet, after its first stroke (R65): a stroke the browser
 * cancels leaves nothing; the row's eraser takes the stroke off, and undo puts it back; a second
 * stroke, erased, stays in the history apart; the pen comes back; two fingers scroll and write
 * nothing. Whether the way goes on: a move the device could not make stops it, as its failure. */
async function moves(run: Run, device: Device, name: string): Promise<boolean> {
  const sheet = () => json<SheetNow>(device, SHEET);
  const before = await sheet();
  const cancelled = await device.cancel(name);
  if (cancelled === undefined) return false;
  const kept = await sheet();
  run.record(
    "a stroke the browser cancels leaves nothing on the sheet",
    kept.events === before.events,
    `${before.events} → ${kept.events} event(s), ${cancelled}`,
    "page",
  );
  device.shot(`${name}-cancelled`);
  // A press of a row's button that changed nothing on the sheet did not reach it: a tap of the
  // device that missed, as a tap of the save button that made no file (T78), not the page's.
  const tap = async (label: string): Promise<SheetNow | undefined> => {
    const was = await sheet();
    if (!(await device.button(label, name))) return undefined;
    const now = await sheet();
    if (now.tool === was.tool && now.events === was.events) {
      run.record(`the press of the row's ${label} reached it`, false, "the sheet is as it was");
      return undefined;
    }
    return now;
  };
  const press = async (label: string, tool: string, step: string): Promise<boolean> => {
    const now = await tap(label);
    if (!now) return false;
    run.record(step, now.tool === tool, now.tool, "page");
    return true;
  };
  if (!(await press(ERASER, "eraser", "the row's eraser takes the presses after it"))) return false;
  if ((await device.draw(name)) === undefined) return false;
  const erased = await sheet();
  run.record("the eraser takes the stroke off", erased.last === "erase", erased.last, "page");
  device.shot(`${name}-erased`);
  const undone = await tap(UNDO);
  if (!undone) return false;
  run.record("undo puts the stroke back", undone.last === "undo", undone.last, "page");
  device.shot(`${name}-undone`);
  // A second stroke, erased: the file keeps it, and the page that opens the file shows it apart.
  if (!(await press(PEN, "pen", "the pen comes back"))) return false;
  if ((await device.draw(name, true)) === undefined) return false;
  if (!(await tap(ERASER))) return false;
  if ((await device.draw(name, true)) === undefined) return false;
  const second = await sheet();
  run.record(
    "a second stroke is written and erased",
    second.last === "erase" && second.events === undone.events + 2,
    `${undone.events} → ${second.events} event(s)`,
    "page",
  );
  if (!(await press(PEN, "pen", "the pen comes back after the second erasing"))) return false;
  const still = await sheet();
  const scrolled = await device.scroll(name);
  if (scrolled === undefined) return false;
  const after = await sheet();
  run.record(
    "two fingers scroll the sheet or the page, and write nothing",
    after.scrolled !== still.scrolled && after.events === still.events,
    `${still.scrolled} → ${after.scrolled} px, ${scrolled}`,
    "page",
  );
  device.shot(`${name}-scrolled`);
  return true;
}

/** The page's checks of what it did, each a step of the page's own, named after when they ran. */
async function checked(run: Run, device: Device, when: string): Promise<void> {
  const last = await device.read();
  const requests = last ? device.requests(last) : [];
  writeFileSync(
    join(run.folder, when ? "watch-opened.json" : "watch.json"),
    `${JSON.stringify({ seen: last, requests }, null, 2)}\n`,
  );
  if (!last) {
    run.record(`read the page at the end${when}`, false);
    return;
  }
  for (const { step, ok, note } of verdicts(last, requests))
    run.record(`${step}${when}`, ok, note, "page");
}

/** The page opened anew, as a person does to begin again, and the sheet's file opened in it, as the
 * organizer of an eval set looks in a sample before it goes on (T87; R64): its strokes, those the
 * history did not show apart, its crops; then what the page did since it opened anew. */
async function opening(run: Run, device: Device, text: string, clock: Clock): Promise<void> {
  await device.evaluate(REOPEN);
  // A page that reloads answers nothing for a moment: a read that throws is no answer yet.
  const reopened = await until(
    30,
    async () =>
      (await device.evaluate(OPEN_SHOWN).catch(() => false)) === true ? true : undefined,
    1000,
    clock,
  );
  run.record(
    "the page opened anew shows the start and the section that opens a file",
    reopened === true,
    "",
    "page",
  );
  if (!reopened) return;
  const how = await device.openFile(text);
  if (how === undefined) return;
  const view = async () => json<Viewed>(device, VIEWED).catch(() => undefined);
  const whole = (seen: Viewed | undefined) =>
    seen?.shown && seen.crops > 0 && seen.decoded === seen.crops ? seen : undefined;
  const shown = (await until(20, async () => whole(await view()), 1000, clock)) ?? (await view());
  run.record(
    "the file opened shows its strokes, those the history did not show apart, and its crops",
    Boolean(whole(shown) && shown && shown.lines > 0 && shown.hidden > 0 && shown.toggle),
    shown
      ? `${shown.lines} line(s), ${shown.hidden} apart, ${shown.decoded} of ${shown.crops} crop(s) decoded, ${how}`
      : how,
    "page",
  );
  // A frame or two for the browser to draw what the page shows, before the picture of the screen.
  await clock.pause(1500);
  device.shot("opened-file");
  run.record(
    "its checkbox draws the strokes the history did not show",
    (await device.evaluate(SHOW_HIDDEN)) === true,
    "",
    "page",
  );
  await clock.pause(1500);
  device.shot("opened-hidden");
  await checked(run, device, ", after the page was opened anew");
}

/** One pass of the volunteer's way through a build. The files the page saves are kept from the
 * watch's copies when keep is set; a device that takes them off itself leaves it unset. Its waits
 * run on the clock given: the real one, or a test's. */
export async function volunteer(
  run: Run,
  device: Device,
  { keep, way = "release" }: { readonly keep: boolean; readonly way?: Way },
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
    if (!(await begin(run, device, way))) return;
    const texts: string[] = [];
    for (const [index, name] of SURFACES.entries()) {
      if (name === "workbook") {
        await device.toWorkbook();
        run.record(
          "the picker shows the workbook's page",
          (await device.read())?.task === WORKBOOK,
          "",
          "page",
        );
        // The release's workbook is an adult's imitating a child's hand (R09): the page asks it of
        // each sample, and a child's session asks it of none.
        if (way === "release") {
          run.record(
            "the writer says they imitate a child's hand",
            (await device.evaluate(AS_CHILD)) === true,
            "",
            "page",
          );
        }
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
      if (way === "release" && name === "sheet" && !(await moves(run, device, name))) return;
      const marked = await markUp(run, device, name, way, clock);
      if (marked === undefined) return;
      run.record(`the ${name} is marked up, and the page will save it`, marked, "", "page");
      if (!(await device.press(name))) return;
      const came = await handed(run, device, index, name, keep, clock);
      if (came === undefined) return;
      run.record(`the ${name}'s sample is handed to a download`, came !== "", "", "page");
      texts.push(came);
    }
    await checked(run, device, "");
    const [sheet] = texts;
    if (way === "release" && sheet) await opening(run, device, sheet, clock);
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

/** What a device gives a build's run: a pass, its recovery, what it checks after a pass that went
 * right, and what it keeps when the run broke off. */
export interface Ways {
  readonly pass: () => Promise<void>;
  readonly recover: () => Promise<void>;
  readonly after?: () => void;
  readonly broken?: () => void;
}

/** A build's run (T22; R65): its passes, what the device checks after a pass that went right, and
 * its journal closed and its verdict written whatever came — a build's file the device could not
 * find too, which prepare finds inside. */
export async function build(run: Run, title: string, prepare: () => Ways): Promise<void> {
  try {
    const ways = prepare();
    try {
      await passes(run, ways.pass, ways.recover);
      if (run.verdict() === "ok") ways.after?.();
    } catch (error) {
      ways.broken?.();
      throw error;
    }
  } catch (error) {
    run.log(`error: ${String(error)}`);
    run.record("the run went to its end", false, String(error).slice(0, 200));
  } finally {
    run.close(title);
    writeFileSync(join(run.folder, "verdict.txt"), `${run.verdict()}\n`);
  }
}

/** Throw if a step of the last pass of any of the runs failed, naming every run's: a job of two
 * builds fails when either did, and says of both. */
export function checkAll(runs: readonly Run[]): void {
  const failed = runs.flatMap((run) => {
    try {
      run.check();
      return [];
    } catch (error) {
      return [`${run.folder}: ${(error as Error).message}`];
    }
  });
  if (failed.length > 0) throw new Error(failed.join("; "));
}
