// The samples page (T19, T81 in RUN.md; R55, R56 in docs/decisions.md): a build of its own of the
// element <novatrail-canvas>, one HTML file that opens from a file on the device and goes to no
// network (R25 spec; R07, R11). scripts/page.ts builds it and puts the tasks in: every task of
// tutor's file of open tasks in tasks/, bank by bank (T21; R62), with its open view and the
// sample's reference to it, worked out at the build (R49). The page takes the element as a
// consumer does, through its properties and events (the 2026-11-02 amendment to R07), and saves a
// sample as a file on the device.
//
// First the start (T20; R58): the purpose — the measurement, or a module's eval set — as the set
// of texts the build carries opens them (R11), the writer's code for the measurement, typed or new
// and never remembered, the purpose's notice and the statements without which the person goes no
// further. Below the purposes, a child's session (T84; R59): the adult who leads it types the
// child's code from the form accepted, or asks a new one for a form, without the child. Once begun,
// they hold for this opening alone: another needs the page opened anew.
//
// The writer writes, then marks the writing up (T81): on a sheet, the parts of the solution — the
// element's groups of strokes, which the writer joins — with their texts and flags, the final
// answer and the first error; on an essay, its text as written; on a workbook, every box. The
// element frames on the sheet what is being marked, and the page shows the crops the model would
// see. A sample is saved only once its markup is whole (page/markup.ts). In a child's session the
// child writes and the adult marks up, from what the child says. The page remembers nothing: not a
// sheet half written either. Every text is page/texts.ts's or the set's.
//
// Below the start, a sample file opens to be looked at (T87; R64): its strokes, drawn from the file
// alone with what a history erased apart, its crops and its markup in words, for whoever looks in it
// for a name or a contact before it goes on (R110 spec). Nothing of it is changed, kept or sent, and
// back to the start is the page opened anew.

import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { cellsOf } from "../src/core/boxes.js";
import { NO_MANIFEST } from "../src/core/manifest.js";
import { INK_WIDTH } from "../src/core/outline.js";
import { pageOf } from "../src/core/page.js";
import {
  type ExportedWork,
  type Mark,
  type NovatrailCanvas,
  TAG,
  type Task,
} from "../src/element/index.js";
import {
  personId,
  readSample,
  type Surface,
  sampleOf,
  sampleText,
  writerCode,
} from "../src/eval/sample.js";
import type { OpenTask } from "../src/eval/tasks.js";
import {
  type BoxForm,
  changed,
  type EssayForm,
  essayMarkup,
  type Group,
  joined,
  type Made,
  moved,
  type Part,
  parted,
  partsOf,
  placeOf,
  type SheetForm,
  sheetMarkup,
  workbookMarkup,
} from "./markup.js";
import { type Field, type Line, type SampleView, viewOf } from "./open.js";
import type { TextSet } from "./sets.js";
import { codeOf, hasCode, lacks, type PurposeKey, purposes, statements, textsOf } from "./steps.js";
import { OPEN, type TaskKind, TEXTS } from "./texts.js";

/** A task the build put in: its kind, its bank, its open view, and the sample's view of it. */
interface PageTask {
  readonly kind: TaskKind;
  readonly bank: string;
  readonly task: Task;
  readonly open: OpenTask;
}

/** What scripts/page.ts puts into the build. */
declare const SAMPLES_PAGE: {
  readonly version: string;
  readonly texts: TextSet;
  readonly tasks: readonly PageTask[];
};

const data = SAMPLES_PAGE;
const set = data.texts;
/** Whether a task of the build is a module's: only such a task's sample goes into an eval set. */
const ofModule = ({ open }: PageTask) => open.reference.source?.case === "modules";
const moduleTasks = data.tasks.some(ofModule);

/** An element of the page's template, by its ID. */
function byId<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new TypeError(`the page has no #${id}`);
  return found as T;
}

/** A new element of HTML, with its text and attributes. */
function make<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = "",
  attributes: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

const picker = byId<HTMLSelectElement>("task");
const holder = byId("holder");
const form = byId("form");
const status = byId("saved");
const changedNote = byId("changed");
const lacksShown = byId("lacks");
const personal = byId<HTMLInputElement>("personal");
const saveButton = byId<HTMLButtonElement>("save");
const markupButton = byId<HTMLButtonElement>("markup");
const beginButton = byId<HTMLButtonElement>("begin");
const handOver = byId("hand-over");
const typed = byId<HTMLInputElement>("typed");

/** What the start settled: the purpose, and the writer's code where it has one. It holds for this
 * opening alone, and the page keeps it nowhere else (R11). */
let begun: { readonly purpose: PurposeKey; readonly code?: string } | undefined;
/** The new codes of this opening, made when the person first asks for one: an adult's and a
 * child's apart, for they are two people's. */
const newCodes: { measurement?: string; child?: string } = {};
/** The purpose the code's step was last shown for: another clears what it holds. */
let codeFor: "measurement" | "child" | undefined;

let sheet: NovatrailCanvas | undefined;
let shown = 0;
/** How much of the sheet's history the last saved sample held. */
let savedAt = 0;

/** The markup under way: of the sheet as it was when it was asked for. */
type Marking =
  | {
      readonly kind: "sheet";
      readonly at: number;
      readonly groups: readonly Group[];
      /** The crop the model would see, one picture for every drawing of the form. */
      readonly crop?: HTMLImageElement;
      form: SheetForm;
    }
  | {
      readonly kind: "essay";
      readonly at: number;
      /** Whether the sheet shows a stroke: one that shows none is a blank essay. */
      readonly shows: boolean;
      readonly crop?: HTMLImageElement;
      form: EssayForm;
    }
  | { readonly kind: "workbook"; readonly at: number; boxes: BoxForm[] };
let marking: Marking | undefined;
/** The work the markup is of, which the frames on the sheet hold on to. */
let work: ExportedWork | null = null;
/** The blobs of the crops shown, let go when the form goes. */
let crops: string[] = [];

/** The page's texts that change, put in: the template holds the few that never do. */
function words(): void {
  byId("about").textContent = TEXTS.about;
  byId("version").textContent = TEXTS.version(data.version);
  byId("offline").textContent = TEXTS.offline;
  byId("github").textContent = TEXTS.github;
  markupButton.textContent = TEXTS.markup;
  saveButton.textContent = TEXTS.save;
  byId("child-writes").textContent = TEXTS.childWrites;
  byId("ipad-note").textContent = TEXTS.ipadDownloads;
  byId("open-about").textContent = OPEN.about;
  byId("open-back").textContent = OPEN.back;
  const writers = byId("writer");
  byId("writer-label").textContent = TEXTS.writer;
  for (const [value, text] of [
    ["adult", TEXTS.writerOwn],
    ["child", TEXTS.writerChild],
  ] as const) {
    const label = make("label");
    const radio = make("input", "", { type: "radio", name: "writer", value });
    radio.checked = value === "adult";
    label.append(radio, ` ${text}`);
    writers.append(label, " ");
  }
}

/** What the writer says of each sample asked again: their own hand, and nothing personal not yet
 * said. */
function fresh(): void {
  personal.checked = false;
  const own = document.querySelector<HTMLInputElement>('input[name="writer"][value="adult"]');
  if (own) own.checked = true;
}

/** The task the picker shows. */
function chosen(): PageTask {
  const task = data.tasks[Number(picker.value)];
  if (task === undefined) throw new RangeError("no task is chosen");
  return task;
}

/** The markup and its form taken away, and its frames off the sheet. */
function unmark(): void {
  marking = undefined;
  work = null;
  for (const url of crops) URL.revokeObjectURL(url);
  crops = [];
  form.replaceChildren();
  form.hidden = true;
  markupButton.textContent = TEXTS.markup;
  if (sheet) sheet.marks = undefined;
  refresh();
}

/** A new element for the chosen task: no stroke of another task stays on it. Strokes not saved
 * are lost only after the person says so; else the picker goes back. */
function mount(): void {
  if (sheet && sheet.history.length > savedAt && !confirm(TEXTS.leave)) {
    picker.value = String(shown);
    return;
  }
  shown = Number(picker.value);
  savedAt = 0;
  // The writer says it of each sample: who wrote, and nothing personal on this sheet.
  fresh();
  unmark();
  sheet?.remove();
  const element = document.createElement(TAG) as NovatrailCanvas;
  element.lang = "ru";
  element.task = chosen().task;
  // The tasks of this build have no media; a task that names one is a page's mistake to see.
  element.media = async (ref: string) => {
    throw new TypeError(`this build has no media ${ref}`);
  };
  // Writing after the markup was asked for changes what it is of: it is asked for again.
  element.addEventListener("historychange", () => {
    if (marking && element.history.length !== marking.at) {
      unmark();
      changedNote.textContent = TEXTS.changed;
    }
    // Where to hand a file over belongs to the one saved, not to writing not saved yet.
    if (element.history.length > savedAt) handOver.hidden = true;
  });
  holder.append(element);
  sheet = element;
  status.textContent = "";
  changedNote.textContent = "";
  handOver.hidden = true;
}

/** A crop's PNG as a picture of the page, by a blob URL, as its policy allows (R23). */
function picture(png: Blob, alt: string): HTMLImageElement {
  const url = URL.createObjectURL(png);
  crops.push(url);
  return make("img", "", { src: url, alt, class: "crop" });
}

/** The frames on the sheet of what is being marked: a part's groups, or a box. */
function frame(marks: readonly Mark[]): void {
  if (!sheet || !work) return;
  sheet.marks = { submission: work.submission, marks };
}

/** What the markup makes now, or undefined before it is asked for. */
function made(): Made | undefined {
  if (!marking) return undefined;
  if (marking.kind === "sheet") return sheetMarkup(marking.groups, marking.form);
  if (marking.kind === "essay") return essayMarkup(marking.shows, marking.form);
  return workbookMarkup(marking.boxes);
}

/** The save button, and what the markup still lacks. */
function refresh(): void {
  const now = made();
  const lacks = now && "lacks" in now ? now.lacks : [];
  saveButton.disabled = !(now && "markup" in now && personal.checked);
  // The live region speaks only when what lacks changes, not at each key.
  const said = lacks.join("\n");
  if (said === lacksShown.dataset.said) return;
  lacksShown.dataset.said = said;
  lacksShown.replaceChildren();
  if (lacks.length > 0) {
    const list = make("ul");
    for (const lack of lacks) list.append(make("li", lack));
    lacksShown.append(make("p", TEXTS.lacks), list);
  }
}

/** A checkbox with its label, and what it changes. */
function checkbox(text: string, checked: boolean, change: (on: boolean) => void, flag = "") {
  const label = make("label");
  const box = make("input", "", { type: "checkbox", ...(flag ? { "data-flag": flag } : {}) });
  box.checked = checked;
  box.addEventListener("change", () => {
    change(box.checked);
    refresh();
  });
  label.append(box, ` ${text}`);
  return label;
}

/** A select with its label, its options and what it changes. */
function choice(
  text: string,
  options: readonly (readonly [string, string])[],
  value: string,
  change: (value: string) => void,
  attributes: Record<string, string> = {},
) {
  const label = make("label", `${text} `);
  const select = make("select", "", attributes);
  for (const [one, words] of options) select.append(new Option(words, one, false, one === value));
  select.addEventListener("change", () => {
    change(select.value);
    refresh();
  });
  label.append(select);
  return label;
}

/** The form of a sheet's markup, drawn anew after a part is joined, parted or moved; the part's
 * fieldset at `focus` takes the focus, so that the keyboard stays where it was. */
function sheetForm(mark: Extract<Marking, { kind: "sheet" }>, focus?: number): void {
  form.replaceChildren();
  if (mark.crop) form.append(make("p", TEXTS.crop), mark.crop);
  if (mark.groups.length === 0) form.append(make("p", TEXTS.noStrokes));
  const { parts } = mark.form;
  const restructure = (next: Part[], at: number) => {
    mark.form = { ...mark.form, parts: next, firstError: undefined };
    sheetForm(mark, at);
    refresh();
  };
  const list = make("ol", "", { class: "parts", "aria-label": TEXTS.parts });
  if (parts.length > 0) form.append(make("p", TEXTS.parts));
  parts.forEach((part, at) => {
    const item = make("li", "", { "data-part": String(at) });
    const set = make("fieldset", "", { tabindex: "-1" });
    set.append(make("legend", TEXTS.part(at + 1, part.groups)));
    const act = (text: string, name: string, enabled: boolean, run: () => void) => {
      const button = make("button", text, { type: "button", "data-act": name });
      button.disabled = !enabled;
      button.addEventListener("click", run);
      set.append(button);
    };
    act(TEXTS.show, "show", true, () =>
      frame(
        part.groups.map((group) => ({
          kind: "frame",
          at: { group },
          name: TEXTS.frame(at + 1, parts.length),
        })),
      ),
    );
    // From the parts as they are when pressed: what was typed since the form was drawn stays.
    const now = () => mark.form.parts;
    act(TEXTS.join, "join", at + 1 < parts.length, () => restructure(joined(now(), at), at));
    act(TEXTS.part_, "part", part.groups.length > 1, () => restructure(parted(now(), at), at));
    act(TEXTS.up, "up", at > 0, () => restructure(moved(now(), at, -1), at - 1));
    act(TEXTS.down, "down", at + 1 < parts.length, () => restructure(moved(now(), at, 1), at + 1));
    const update = (change: Partial<Part>) => {
      mark.form = { ...mark.form, parts: changed(mark.form.parts, at, change) };
    };
    set.append(
      make("br"),
      choice(
        TEXTS.kind,
        [
          ["text", TEXTS.kindText],
          ["drawing", TEXTS.kindDrawing],
        ],
        part.kind,
        (kind) => update({ kind: kind === "drawing" ? "drawing" : "text" }),
      ),
    );
    const label = make("label", TEXTS.partText);
    const text = make("textarea", "", { "data-field": "text" });
    text.value = part.text;
    text.addEventListener("input", () => {
      update({ text: text.value });
      refresh();
    });
    label.append(make("br"), text);
    const flags = make("div", "", { class: "flags" });
    flags.append(
      checkbox(TEXTS.crossedOut, part.crossedOut, (on) => update({ crossedOut: on }), "crossedOut"),
      // On purpose is the writer's to say: the adult marking a child's sheet up says it unread.
      checkbox(
        begun?.purpose === "child" ? TEXTS.illegibleChild : TEXTS.illegible,
        part.illegible,
        (on) => update({ illegible: on }),
        "illegible",
      ),
      checkbox(
        TEXTS.finalAnswer,
        part.finalAnswer,
        (on) => {
          update({ finalAnswer: on });
          // The answer as written starts as the part's text, which the writer then trims.
          const answer = form.querySelector<HTMLInputElement>("#answer");
          if (on && answer && !answer.value.trim()) {
            answer.value = mark.form.parts[at]?.text.trim() ?? "";
            mark.form = { ...mark.form, answer: answer.value };
          }
        },
        "finalAnswer",
      ),
    );
    set.append(label, flags);
    item.append(set);
    list.append(item);
  });
  form.append(list);
  if (parts.length > 0) {
    form.append(
      choice(
        TEXTS.firstError,
        [["", TEXTS.noError], ...parts.map((_, i) => [String(i + 1), String(i + 1)] as const)],
        mark.form.firstError === undefined ? "" : String(mark.form.firstError),
        (value) => {
          mark.form = { ...mark.form, firstError: value ? Number(value) : undefined };
        },
        { id: "first-error" },
      ),
    );
    const label = make("label", `${TEXTS.answer} `);
    const answer = make("input", "", { id: "answer", type: "text" });
    answer.value = mark.form.answer;
    answer.addEventListener("input", () => {
      mark.form = { ...mark.form, answer: answer.value };
      refresh();
    });
    label.append(answer);
    const notes = make("div", "", { class: "flags" });
    notes.append(
      checkbox(TEXTS.mirrored, mark.form.mirrored, (on) => {
        mark.form = { ...mark.form, mirrored: on };
      }),
      checkbox(TEXTS.rewritten, mark.form.rewritten, (on) => {
        mark.form = { ...mark.form, rewritten: on };
      }),
    );
    form.append(make("p"), label, notes);
  }
  form.hidden = false;
  if (focus !== undefined)
    list.querySelector<HTMLElement>(`[data-part="${focus}"] fieldset`)?.focus();
}

/** The form of an essay's markup: its crop, its text as written and whether it reads at all. */
function essayForm(mark: Extract<Marking, { kind: "essay" }>): void {
  form.replaceChildren();
  if (mark.crop) form.append(make("p", TEXTS.crop), mark.crop);
  if (!mark.shows) form.append(make("p", TEXTS.noStrokes));
  const label = make("label", TEXTS.essayText);
  const text = make("textarea", "", { "data-field": "essay", rows: "8" });
  text.value = mark.form.text;
  text.addEventListener("input", () => {
    mark.form = { ...mark.form, text: text.value };
    refresh();
  });
  label.append(make("br"), text);
  const flags = make("div", "", { class: "flags" });
  flags.append(
    checkbox(
      TEXTS.essayIllegible,
      mark.form.illegible,
      (on) => {
        mark.form = { ...mark.form, illegible: on };
      },
      "illegible",
    ),
  );
  form.append(label, flags, make("p", TEXTS.essayMarks));
  form.hidden = false;
}

/** The form of a workbook's markup: every box of the page, each filled one with its crop. */
function workbookForm(mark: Extract<Marking, { kind: "workbook" }>): void {
  form.replaceChildren();
  const cells = work && "cells" in work ? work.cells : [];
  const list = make("ol", "", { class: "boxes" });
  mark.boxes.forEach((box, at) => {
    const place = placeOf(box);
    const item = make("li", "", { "data-box": place });
    const set = make("fieldset");
    set.append(make("legend", TEXTS.box(place)));
    const update = (change: Partial<BoxForm>) => {
      const old = mark.boxes[at];
      if (old) mark.boxes[at] = { ...old, ...change };
    };
    if (!box.filled) {
      set.append(make("p", TEXTS.empty));
    } else {
      const cell = cells.find((one) => one.item === box.item && one.slot === box.slot);
      if (cell) set.append(picture(cell.png, TEXTS.cropBox(place)), make("br"));
      const show = make("button", TEXTS.show, { type: "button", "data-act": "show" });
      show.addEventListener("click", () =>
        frame([
          {
            kind: "frame",
            at: { cell: { item: box.item, slot: box.slot } },
            name: TEXTS.boxFrame(place),
          },
        ]),
      );
      set.append(
        show,
        make("br"),
        choice(
          TEXTS.read,
          [
            ["value", TEXTS.readValue],
            ["illegible", TEXTS.readIllegible],
            ["ambiguous", TEXTS.readAmbiguous],
          ],
          box.read,
          (read) => update({ read: read === "illegible" || read === "ambiguous" ? read : "value" }),
        ),
      );
      const label = make("label", `${TEXTS.value} `);
      const value = make("input", "", { type: "text", "data-field": "value" });
      value.value = box.value;
      value.addEventListener("input", () => {
        update({ value: value.value });
        refresh();
      });
      label.append(value);
      const notes = make("div", "", { class: "flags" });
      notes.append(
        checkbox(TEXTS.mirrored, box.mirrored, (on) => update({ mirrored: on })),
        checkbox(TEXTS.rewritten, box.rewritten, (on) => update({ rewritten: on })),
      );
      set.append(label, notes);
    }
    item.append(set);
    list.append(item);
  });
  form.append(list);
  form.hidden = false;
}

/** The markup asked for: the work as the sheet is now, its groups or its boxes, and their form. */
async function markUp(): Promise<void> {
  if (!sheet) return;
  unmark();
  changedNote.textContent = "";
  const element = sheet;
  const task = picker.value;
  const at = element.history.length;
  const given = await element.exportWork();
  // A stroke, or another task, while the element gave its work: the work is of what is gone.
  if (sheet !== element || picker.value !== task || element.history.length !== at) {
    changedNote.textContent = TEXTS.changed;
    return;
  }
  work = given;
  const { open, kind } = chosen();
  if (kind === "essay") {
    const shows = work !== null && "png" in work && work.submission.groups.length > 0;
    const mark: Extract<Marking, { kind: "essay" }> = {
      kind: "essay",
      at,
      shows,
      ...(work && "png" in work ? { crop: picture(work.png, TEXTS.crop) } : {}),
      form: { illegible: false, text: "" },
    };
    marking = mark;
    essayForm(mark);
  } else if ("workbook" in open.canvas) {
    const filled = new Set(work && "cells" in work ? work.cells.map(placeOf) : []);
    const boxes = cellsOf(pageOf(open.canvas.workbook)).map(
      ({ item, slot }): BoxForm => ({
        item,
        slot,
        filled: filled.has(placeOf({ item, slot })),
        read: "value",
        value: "",
        mirrored: false,
        rewritten: false,
      }),
    );
    const mark: Extract<Marking, { kind: "workbook" }> = { kind: "workbook", at, boxes };
    marking = mark;
    workbookForm(mark);
  } else {
    const groups = work && "png" in work ? work.submission.groups : [];
    const mark: Extract<Marking, { kind: "sheet" }> = {
      kind: "sheet",
      at,
      groups,
      ...(work && "png" in work ? { crop: picture(work.png, TEXTS.crop) } : {}),
      form: { parts: partsOf(groups), answer: "", mirrored: false, rewritten: false },
    };
    marking = mark;
    sheetForm(mark);
  }
  markupButton.textContent = TEXTS.markupAgain;
  refresh();
}

/** Random bytes for a sample's ID, from the browser's own source. */
function random(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
}

/** Who wrote: in a child's session the child, else as the page asks it of each sample. */
function writer(): Writer {
  if (begun?.purpose === "child") return Writer.CHILD;
  const checked = document.querySelector<HTMLInputElement>('input[name="writer"]:checked');
  return checked?.value === "child" ? Writer.ADULT_AS_CHILD : Writer.ADULT;
}

/** The sample of what is on the sheet, with its markup, for the purpose begun (R09). */
function current(): { id: string; text: string } | undefined {
  const now = made();
  if (!now || !("markup" in now) || !begun) return undefined;
  // A child's sample is of the measurement too; begin() kept a code where the purpose has one.
  const evalSet = begun.purpose === "evalSet";
  const { open } = chosen();
  const history = sheet?.history ?? [];
  const digit = NO_MANIFEST.digit;
  const surface: Surface =
    "workbook" in open.canvas
      ? { workbook: { history, cells: cellsOf(pageOf(open.canvas.workbook)), digit } }
      : { sheet: { history, digit } };
  const sample = sampleOf({
    id: personId(random(12)),
    purpose: evalSet ? Purpose.EVAL_SET : Purpose.MEASUREMENT,
    writer: writer(),
    origin: { person: { textSetVersion: set.version, canvasVersion: data.version } },
    ...(begun.code ? { writerCode: begun.code } : {}),
    task: open.reference,
    surface,
    markup: now.markup,
  });
  return { id: sample.id, text: sampleText(sample) };
}

/** Save the sample as a file on the device: a link to a blob of the page's own (T29, T74). */
function save(): void {
  const sample = current();
  if (!sample) return;
  savedAt = sheet?.history.length ?? 0;
  const link = make("a");
  link.href = URL.createObjectURL(new Blob([sample.text], { type: "application/json" }));
  link.download = `sample-${sample.id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  // The download has its own copy once it has begun.
  setTimeout(() => URL.revokeObjectURL(link.href), 60_000);
  status.textContent = TEXTS.saved(sample.id);
  handOver.textContent = (begun && textsOf(set, begun.purpose)?.handOver) ?? "";
  handOver.hidden = handOver.textContent === "";
  fresh();
  refresh();
}

/** The purpose chosen at the start, if one is. */
function purposeChosen(): PurposeKey | undefined {
  const checked = document.querySelector<HTMLInputElement>('input[name="purpose"]:checked');
  const value = checked?.value;
  return value === "measurement" || value === "evalSet" || value === "child" ? value : undefined;
}

/** How the code is given, once the person has chosen. */
function wayChosen(): "own" | "new" | undefined {
  const way = document.querySelector<HTMLInputElement>('input[name="code"]:checked')?.value;
  return way === "own" || way === "new" ? way : undefined;
}

/** The writer's code the start has now: the new one, or the one typed when it is in shape. */
function codeChosen(purpose: PurposeKey | undefined): {
  way?: "own" | "new";
  code?: string;
  typed: boolean;
} {
  const way = wayChosen();
  if (way === "new") {
    const made = purpose === "child" ? newCodes.child : newCodes.measurement;
    return made ? { way, code: made, typed: false } : { way, typed: false };
  }
  if (way !== "own" || typed.value.trim() === "")
    return way ? { way, typed: false } : { typed: false };
  const code = codeOf(typed.value);
  return code ? { way, code, typed: true } : { way, typed: true };
}

/** The purposes the set opens, each a choice, a child's session in its own group below the others;
 * a closed one shown with why, and not to be chosen. */
function purposeChoices(): void {
  const session = byId("session");
  for (const { key, open, note } of purposes(set, moduleTasks)) {
    const fieldset = key === "child" ? session : byId("purpose");
    const label = make("label");
    const radio = make("input", "", { type: "radio", name: "purpose", value: key });
    radio.disabled = !open;
    label.append(radio, ` ${TEXTS.purpose[key]}`);
    // The adults' purposes go before the session's group, which stays last.
    const place = (node: Node) =>
      key === "child" ? fieldset.append(node) : fieldset.insertBefore(node, session);
    place(label);
    if (note) {
      const id = `purpose-note-${key}`;
      place(make("small", note, { id, class: "note" }));
      radio.setAttribute("aria-describedby", id);
    }
  }
}

/** The statements of a purpose, asked anew: ticked for another purpose, they say nothing here. */
function statementsAsked(purpose: PurposeKey): void {
  const box = byId("statements");
  for (const label of box.querySelectorAll("label")) label.remove();
  for (const statement of statements(set, purpose)) {
    const label = make("label");
    label.append(make("input", "", { type: "checkbox", "data-statement": "" }), ` ${statement}`);
    box.append(label);
  }
}

/** What the start still lacks, said in its live region only when that changes. */
function startLacks(missing: readonly string[]): void {
  const lacking = byId("start-lacks");
  const said = missing.join("\n");
  if (said === lacking.dataset.said) return;
  lacking.dataset.said = said;
  lacking.replaceChildren();
  if (missing.length === 0) return;
  const list = make("ul");
  for (const lack of missing) list.append(make("li", lack));
  lacking.append(make("p", TEXTS.startLacks), list);
}

/** The start shown as it now stands: the code's step for the measurement or a child's session, in
 * its words and cleared between the two people's codes, the purpose's notice and statements, what
 * still lacks, and the button that begins. */
function startShown(changedPurpose: boolean): void {
  const purpose = purposeChosen();
  const coded = purpose && hasCode(purpose) ? purpose : undefined;
  byId("code-step").hidden = coded === undefined;
  if (coded && coded !== codeFor) codeStep(coded);
  const way = wayChosen();
  byId("own-code").hidden = way !== "own";
  const shownCode = byId("new-code");
  shownCode.hidden = way !== "new";
  shownCode.textContent = "";
  if (way === "new" && coded === "child") {
    newCodes.child ??= writerCode(random(8));
    shownCode.textContent = TEXTS.newChildCode(newCodes.child, set.version);
  } else if (way === "new" && coded === "measurement") {
    newCodes.measurement ??= writerCode(random(8));
    shownCode.textContent = TEXTS.newCode(newCodes.measurement);
  }
  const texts = purpose ? textsOf(set, purpose) : undefined;
  byId("notice").hidden = !texts;
  byId("statements").hidden = !texts;
  if (changedPurpose && purpose && texts) {
    byId("notice-title").textContent = TEXTS.notice(TEXTS.purpose[purpose], set.version);
    byId("notice-text").replaceChildren(...texts.notice.map((paragraph) => make("p", paragraph)));
    statementsAsked(purpose);
  }
  const agreed = [
    ...byId("statements").querySelectorAll<HTMLInputElement>("input[data-statement]"),
  ].map((tick) => tick.checked);
  const missing = lacks(set, moduleTasks, {
    ...(purpose ? { purpose } : {}),
    ...codeChosen(purpose),
    agreed,
  });
  beginButton.disabled = missing.length > 0;
  startLacks(missing);
}

/** The code's step for an adult's own code or a child's: its words, and nothing kept of the other's,
 * for the two codes are two people's. */
function codeStep(purpose: "measurement" | "child"): void {
  codeFor = purpose;
  const words = TEXTS.code[purpose];
  byId("code-legend").textContent = words.legend;
  byId("code-own").textContent = words.own;
  byId("code-new").textContent = words.new;
  byId("typed-label").textContent = words.typed;
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="code"]')) {
    radio.checked = false;
  }
  typed.value = "";
}

/** Begin writing for the purpose settled: the start folds into a line, and the sheet is mounted. */
function begin(): void {
  const purpose = purposeChosen();
  if (!purpose || beginButton.disabled) return;
  const { code } = codeChosen(purpose);
  begun = hasCode(purpose) && code ? { purpose, code } : { purpose };
  const child = purpose === "child";
  byId("start").hidden = true;
  // Writing has begun: a file is opened from the start alone (T87).
  byId("open").hidden = true;
  byId("summary-text").textContent = TEXTS.summary(
    TEXTS.purpose[purpose],
    begun.code,
    set.version,
    child,
  );
  // In a child's session the child writes: no adult's hand to ask of each sample.
  byId("writer").hidden = child;
  byId("child-writes").hidden = !child;
  byId("ipad-note").hidden = !child;
  byId("summary").hidden = false;
  byId("work").hidden = false;
  // An eval set takes its own module's tasks alone: the others leave the picker.
  if (purpose === "evalSet") {
    for (const option of [...picker.options]) {
      const task = data.tasks[Number(option.value)];
      if (!task || !ofModule(task)) option.remove();
    }
    for (const group of picker.querySelectorAll("optgroup")) {
      if (group.children.length === 0) group.remove();
    }
  }
  mount();
  picker.focus();
}

/** Another purpose, code or statement needs the page opened anew: it keeps none of them. Strokes
 * not saved are lost only after the person says so. */
function restart(): void {
  if (sheet && sheet.history.length > savedAt && !confirm(TEXTS.restart)) return;
  location.reload();
}

/** The namespace of SVG, whose elements the picture of an opened sample is made of. */
const SVG = "http://www.w3.org/2000/svg";

/** A new element of SVG with its attributes: presentation attributes, for the page's policy allows
 * no style attribute (R55). */
function drawn<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

/** The blobs of the opened file's crops, let go when another file is opened. */
let viewed: string[] = [];

/** Fields of the file, each its name and its value, as a list of terms. */
function fields(list: readonly Field[]): HTMLDListElement {
  const terms = make("dl");
  for (const { name, value } of list) terms.append(make("dt", name), make("dd", value));
  return terms;
}

/** A stroke as a line of the picture; a stroke of one point, a dot. */
function line({ points }: Line, attributes: Record<string, string>): SVGPolylineElement {
  const at = points.map(([x, y]) => `${x},${y}`);
  const first = at[0] ?? "";
  return drawn("polyline", {
    points: (at.length === 1 ? [first, first] : at).join(" "),
    fill: "none",
    "stroke-width": String(INK_WIDTH),
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...attributes,
  });
}

/** The picture of the sample from its file alone (R64): the sheet, a workbook's boxes with their
 * places, the strokes shown at the end, and those the history did not show, apart and hidden until
 * asked for. It takes in a stroke beyond the sheet too: none is cut off. */
function sketch(view: SampleView): SVGSVGElement {
  const { width, height, frame } = view;
  const svg = drawn("svg", {
    viewBox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`,
    role: "img",
    "aria-label": OPEN.picture(view.shown.length),
    class: "sketch",
  });
  const edge = { fill: "none", stroke: "GrayText", "stroke-width": "2" };
  svg.append(
    drawn("rect", { x: "0", y: "0", width: String(width), height: String(height), ...edge }),
  );
  for (const box of view.boxes) {
    const { left, top } = box;
    svg.append(
      drawn("rect", {
        x: String(left),
        y: String(top),
        width: String(box.width),
        height: String(box.height),
        "data-box": box.place,
        ...edge,
      }),
    );
    const label = drawn("text", {
      x: String(left + 4),
      y: String(top + 20),
      "font-size": "18",
      fill: "GrayText",
    });
    label.textContent = box.place;
    svg.append(label);
  }
  const hidden = drawn("g", { "data-hidden": "", display: "none" });
  for (const stroke of view.hidden) {
    hidden.append(line(stroke, { stroke: "GrayText", "stroke-dasharray": "6 6" }));
  }
  for (const stroke of view.shown) svg.append(line(stroke, { stroke: "currentColor" }));
  // Over what is shown: an erased stroke often lies where the writing went on.
  svg.append(hidden);
  return svg;
}

/** The markup of the file in words: the truth, the notes, the parts or the marks. */
function markupShown(view: SampleView): Node[] {
  const { markup } = view;
  if (!markup) return [make("p", OPEN.noMarkup)];
  const nodes: Node[] = [make("h4", OPEN.truthTitle), fields(markup.truth)];
  if (markup.notes.length > 0) nodes.push(make("h4", OPEN.notesTitle), fields(markup.notes));
  if (markup.parts.length > 0) {
    const list = make("ol", "", { class: "parts" });
    for (const part of markup.parts) {
      const item = make("li");
      item.append(make("strong", part.title), make("p", part.text, { class: "as-written" }));
      if (part.flags.length > 0) item.append(make("p", part.flags.join("; ")));
      list.append(item);
    }
    nodes.push(make("h4", OPEN.partsTitle), list);
  }
  if (markup.firstError) nodes.push(make("p", `${OPEN.firstError} ${markup.firstError}`));
  if (markup.marks.length > 0) nodes.push(make("h4", OPEN.marksTitle), fields(markup.marks));
  return nodes;
}

/** The sample the person chose, read and shown: nothing of it is changed, kept or sent (R64). A file
 * that is no sample is said so, and nothing is drawn. */
async function opened(): Promise<void> {
  const chosen = byId<HTMLInputElement>("open-file");
  const file = chosen.files?.[0];
  const view = byId("view");
  const error = byId("open-error");
  for (const url of viewed) URL.revokeObjectURL(url);
  viewed = [];
  view.replaceChildren();
  view.hidden = true;
  error.textContent = "";
  if (!file) return;
  let shown: SampleView;
  try {
    const text = await file.text();
    // Another file chosen while this one was read: that one is shown, not this.
    if (chosen.files?.[0] !== file) return;
    shown = viewOf(readSample(text));
  } catch (failure) {
    if (chosen.files?.[0] === file) error.textContent = OPEN.notRead((failure as Error).message);
    return;
  }
  byId("start").hidden = true;
  byId("open-back").hidden = false;
  view.append(make("h3", OPEN.fileTitle), fields(shown.about));
  view.append(make("h3", OPEN.taskTitle), fields(shown.task));
  view.append(make("h3", OPEN.pictureTitle));
  const picture = sketch(shown);
  if (shown.hidden.length > 0) {
    const toggle = checkbox(OPEN.hidden(shown.hidden.length), false, (on) => {
      picture.querySelector("[data-hidden]")?.setAttribute("display", on ? "inline" : "none");
    });
    toggle.querySelector("input")?.setAttribute("id", "show-hidden");
    const paragraph = make("p");
    paragraph.append(toggle);
    view.append(paragraph);
  }
  view.append(picture);
  if (shown.crops.length > 0) view.append(make("h3", OPEN.cropsTitle));
  for (const { title, crops: set } of shown.crops) {
    view.append(make("h4", title));
    for (const { label, png } of set) {
      const url = URL.createObjectURL(new Blob([new Uint8Array(png)], { type: "image/png" }));
      viewed.push(url);
      const figure = make("figure");
      figure.append(
        make("img", "", { src: url, alt: `${title}, ${label}`, class: "crop" }),
        make("figcaption", label),
      );
      view.append(figure);
    }
  }
  view.append(make("h3", OPEN.markupTitle), ...markupShown(shown));
  view.hidden = false;
}

// The page's script runs: the words for where it does not — an iPad's Files, which shows the page
// without its script (В64; the 2026-11-08 amendment to R25 spec; T85) — go.
byId("no-script").remove();
words();
// A group of the picker for each bank, in the build's order (T21).
const banks = new Map<string, HTMLOptGroupElement>();
for (const [index, { kind, bank, task }] of data.tasks.entries()) {
  let group = banks.get(bank);
  if (!group) {
    group = make("optgroup", "", { label: TEXTS.bank(bank) });
    banks.set(bank, group);
    picker.append(group);
  }
  group.append(new Option(TEXTS.task(TEXTS.taskKind[kind], task.id), String(index)));
}
picker.addEventListener("change", mount);
markupButton.addEventListener("click", () => void markUp());
personal.addEventListener("change", refresh);
saveButton.addEventListener("click", save);
purposeChoices();
byId("start").addEventListener("change", (event) =>
  startShown((event.target as HTMLInputElement | null)?.name === "purpose"),
);
typed.addEventListener("input", () => startShown(false));
beginButton.addEventListener("click", begin);
byId("restart").addEventListener("click", restart);
byId("open-file").addEventListener("change", () => void opened());
// Back to the start is the page opened anew: it keeps nothing of the file (R11).
byId("open-back").addEventListener("click", () => location.reload());
startShown(false);
