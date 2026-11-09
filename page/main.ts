// The samples page (T19, T81 in RUN.md; R55, R56 in docs/decisions.md): a build of its own of the
// element <novatrail-canvas>, one HTML file that opens from a file on the device and goes to no
// network (R25 spec; R07, R11). scripts/page.ts builds it and puts the tasks in: their open views
// and the sample's reference to each, worked out at the build from tutor's file of open tasks in
// tasks/ (R49). The page takes the element as a consumer does, through its properties and events
// (the 2026-11-02 amendment to R07), and saves a sample of the author's own measurement, the one
// purpose open while the texts are a draft (R11), as a file on the device.
//
// The writer writes, then marks the writing up (T81): on a sheet, the parts of the solution — the
// element's groups of strokes, which the writer joins — with their texts and flags, the final
// answer and the first error; on a workbook, every box. The element frames on the sheet what is
// being marked, and the page shows the crops the model would see. A sample is saved only once its
// markup is whole (page/markup.ts). The page remembers nothing: not a sheet half written either.
// The steps of the page — purpose, codes, notices — are T20's; every text is page/texts.ts's.

import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { cellsOf } from "../src/core/boxes.js";
import { NO_MANIFEST } from "../src/core/manifest.js";
import { pageOf } from "../src/core/page.js";
import {
  type ExportedWork,
  type Mark,
  type NovatrailCanvas,
  TAG,
  type Task,
} from "../src/element/index.js";
import { personId, type Surface, sampleOf, sampleText, writerCode } from "../src/eval/sample.js";
import type { OpenTask } from "../src/eval/tasks.js";
import {
  type BoxForm,
  changed,
  type Group,
  joined,
  type Made,
  moved,
  type Part,
  parted,
  partsOf,
  type SheetForm,
  sheetMarkup,
  workbookMarkup,
} from "./markup.js";
import { TEXTS } from "./texts.js";

/** A task the build put in: what the picker calls it, its open view, and the sample's view of it. */
interface PageTask {
  readonly title: string;
  readonly task: Task;
  readonly open: OpenTask;
}

/** What scripts/page.ts puts into the build. */
declare const SAMPLES_PAGE: { readonly version: string; readonly tasks: readonly PageTask[] };

const data = SAMPLES_PAGE;

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

/** The version of the page's texts: a draft until the lawyer has read them (R11), and never
 * `none`, which spec keeps for files no samples page wrote. T20 brings the set of texts. */
const TEXT_SET = "draft-0";
/** The writer's code of this opening: one for every sample saved until the page is closed, shown
 * so that the adult writes it down (R09, R11). The page remembers it nowhere. T20 asks for it. */
const CODE = writerCode(crypto.getRandomValues(new Uint8Array(8)));

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
  | { readonly kind: "workbook"; readonly at: number; boxes: BoxForm[] };
let marking: Marking | undefined;
/** The work the markup is of, which the frames on the sheet hold on to. */
let work: ExportedWork | null = null;
/** The blobs of the crops shown, let go when the form goes. */
let crops: string[] = [];

/** The page's texts that change, put in: the template holds the few that never do. */
function words(): void {
  byId("version").textContent = TEXTS.version(data.version);
  byId("code-label").textContent = TEXTS.code;
  byId("code").textContent = CODE;
  byId("code-after").textContent = TEXTS.codeAfter;
  byId("offline").textContent = TEXTS.offline;
  markupButton.textContent = TEXTS.markup;
  saveButton.textContent = TEXTS.save;
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
  });
  holder.append(element);
  sheet = element;
  status.textContent = "";
  changedNote.textContent = "";
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
  return marking.kind === "sheet"
    ? sheetMarkup(marking.groups, marking.form)
    : workbookMarkup(marking.boxes);
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
      checkbox(TEXTS.illegible, part.illegible, (on) => update({ illegible: on }), "illegible"),
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

/** The form of a workbook's markup: every box of the page, each filled one with its crop. */
function workbookForm(mark: Extract<Marking, { kind: "workbook" }>): void {
  form.replaceChildren();
  const cells = work && "cells" in work ? work.cells : [];
  const list = make("ol", "", { class: "boxes" });
  mark.boxes.forEach((box, at) => {
    const place = `${box.item}.${box.slot}`;
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
  const { open } = chosen();
  if ("workbook" in open.canvas) {
    const filled = new Set(
      work && "cells" in work ? work.cells.map(({ item, slot }) => `${item}.${slot}`) : [],
    );
    const boxes = cellsOf(pageOf(open.canvas.workbook)).map(
      ({ item, slot }): BoxForm => ({
        item,
        slot,
        filled: filled.has(`${item}.${slot}`),
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

/** Who wrote, as the page asks it of each sample. */
function writer(): Writer {
  const checked = document.querySelector<HTMLInputElement>('input[name="writer"]:checked');
  return checked?.value === "child" ? Writer.ADULT_AS_CHILD : Writer.ADULT;
}

/** The sample of what is on the sheet, with its markup: the author's own measurement (R09). */
function current(): { id: string; text: string } | undefined {
  const now = made();
  if (!now || !("markup" in now)) return undefined;
  const { open } = chosen();
  const history = sheet?.history ?? [];
  const digit = NO_MANIFEST.digit;
  const surface: Surface =
    "workbook" in open.canvas
      ? { workbook: { history, cells: cellsOf(pageOf(open.canvas.workbook)), digit } }
      : { sheet: { history, digit } };
  const sample = sampleOf({
    id: personId(random(12)),
    purpose: Purpose.MEASUREMENT,
    writer: writer(),
    origin: { person: { textSetVersion: TEXT_SET, canvasVersion: data.version } },
    writerCode: CODE,
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
  fresh();
  refresh();
}

words();
for (const [index, { title }] of data.tasks.entries()) {
  picker.append(new Option(title, String(index)));
}
picker.addEventListener("change", mount);
markupButton.addEventListener("click", () => void markUp());
personal.addEventListener("change", refresh);
saveButton.addEventListener("click", save);
mount();
