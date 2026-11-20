// The labels of the element's own buttons, of a workbook's boxes and of the parts of a worked
// example's demo, in the languages of the interface, English and Russian (R92 spec), by the shared
// rules of the packages' translations (R91 spec; R28, R29, R33, R36, R37, R42):
// - the language is the element's own `lang`, looked up as RFC 4647 does it, and English stands for
//   any other, under a `lang` of its own;
// - a label with a number or a word in it is one string with named places, «Часть {n} из {total}.»,
//   never pieces glued together: languages put their words in other orders;
// - no label counts a thing, so none has forms of number yet. The first that does takes CLDR's
//   categories, `other` always among them, chosen by `Intl.PluralRules` of the label's language;
// - no label tells the learner's gender (R70 spec) or speaks as the AI in the first person (П-15);
// - the buttons' words are those of spec's table of words, the two of the page's zoom among them
//   (R91 spec; R73); no button scrolls the sheet, so no label says a direction (R84).
// This module is no entry point of the package.

/**
 * What the element says: its scroll container the canvas kind's name, or a worked example's, and
 * the row of buttons a name of its own, that of the kind's buttons (R28), the name of the group of
 * tools and each button, a workbook's box its name, and the number of a part of a demo the element
 * tells of. A label with places names them in braces.
 */
export interface Labels {
  readonly sheet: string;
  readonly workbook: string;
  /** A task from the learner's paper, its crop as tracing paper over a dotted sheet (R87). */
  readonly paper: string;
  /** A lesson's worked example, whose row has no tools of writing (R42). */
  readonly example: string;
  /** The row of buttons of each: not the name of the container, which a screen reader shows too. */
  readonly sheetButtons: string;
  readonly workbookButtons: string;
  readonly paperButtons: string;
  readonly exampleButtons: string;
  /** The buttons of a worked example's demo: the next part, and the whole demo, shown or hidden. */
  readonly next: string;
  readonly demo: string;
  readonly tool: string;
  readonly pen: string;
  readonly eraser: string;
  readonly undo: string;
  readonly clear: string;
  /** The buttons of the page's zoom, a step larger and a step smaller (R73). */
  readonly zoomIn: string;
  readonly zoomOut: string;
  /** The button that lets a finger write again, in pen mode (R29). */
  readonly finger: string;
  /** The tracing paper's grip, and the button atop the tools that hides it or shows it (R87). */
  readonly moveTask: string;
  readonly hideTask: string;
  readonly showTask: string;
  /** A box of a workbook's line, alone in it (R36). */
  readonly box: string;
  /** A box among several of its line, by its slot: {slot} (R36). */
  readonly boxAt: string;
  /** A box a demo fills, by its line and its slot in it: {line} and {slot} (R42). */
  readonly boxIn: string;
  /** A box's {name} when the box is filled (R37). */
  readonly filled: string;
  /** A box's {name} and the {value} a demo wrote in it (R42). */
  readonly valued: string;
  /** The part of a demo the element tells of, {n}, of so many, {total} (R42). */
  readonly part: string;
}

/** The labels in English, the code's own language: those of any language the table has not. */
const ENGLISH: Labels = Object.freeze({
  sheet: "Sheet",
  workbook: "Workbook",
  paper: "Task from paper",
  example: "Worked example",
  sheetButtons: "Sheet buttons",
  workbookButtons: "Workbook buttons",
  paperButtons: "Task from paper buttons",
  exampleButtons: "Worked example buttons",
  next: "Next",
  demo: "Demo",
  tool: "Tool",
  pen: "Pen",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  finger: "Draw with finger",
  moveTask: "Move the task",
  hideTask: "Hide the task",
  showTask: "Show the task",
  box: "Box",
  boxAt: "Box {slot}",
  boxIn: "Box {line}.{slot}",
  filled: "{name}, filled",
  valued: "{name}: {value}",
  part: "Part {n} of {total}.",
});

/**
 * The labels by language, each a language tag in lower case. A map, not an object: a tag such as
 * "constructor" finds nothing of an object's prototype in it.
 */
const LABELS: ReadonlyMap<string, Labels> = new Map([
  ["en", ENGLISH],
  [
    "ru",
    Object.freeze({
      sheet: "Лист",
      workbook: "Тетрадь",
      paper: "Задача с бумаги",
      example: "Пример",
      sheetButtons: "Кнопки листа",
      workbookButtons: "Кнопки тетради",
      paperButtons: "Кнопки задачи с бумаги",
      exampleButtons: "Кнопки примера",
      next: "Дальше",
      demo: "Показ",
      tool: "Инструмент",
      pen: "Перо",
      eraser: "Ластик",
      undo: "Отменить",
      clear: "Очистить",
      zoomIn: "Крупнее",
      zoomOut: "Мельче",
      finger: "Рисовать пальцем",
      moveTask: "Подвинуть задачу",
      hideTask: "Спрятать задачу",
      showTask: "Показать задачу",
      box: "Окошко",
      boxAt: "Окошко {slot}",
      boxIn: "Окошко {line}.{slot}",
      filled: "{name}, заполнено",
      valued: "{name}: {value}",
      part: "Часть {n} из {total}.",
    }),
  ],
]);

/** Every language the table has, by its tag: the tests hold each to English's places. */
export const LANGUAGES: readonly string[] = [...LABELS.keys()];

/** Labels, and the language they are in. */
type Labelled = { readonly lang: string; readonly labels: Labels };

/**
 * The labels for a language tag, and the language they are in. The tag is looked up as RFC 4647's
 * Lookup does it: in lower case, cut subtag by subtag from its end until the table has what is
 * left, a single-letter subtag going with the subtag after it. English stands for any other tag,
 * and for none.
 */
export function labelsFor(tag: string | null): Labelled {
  return lookup(tag) ?? { lang: "en", labels: ENGLISH };
}

/**
 * Whether the table has labels in the language of a tag, as `labelsFor` looks it up: the English
 * that stands for a tag it has not is in no language of the tag's (R74).
 */
export function knows(tag: string | null): boolean {
  return lookup(tag) !== undefined;
}

/** The labels the table has for a tag, by RFC 4647's Lookup, or none. */
function lookup(tag: string | null): Labelled | undefined {
  let range = (tag ?? "").toLowerCase();
  while (range !== "") {
    const labels = LABELS.get(range);
    if (labels !== undefined) return { lang: range, labels };
    let cut = range.lastIndexOf("-");
    // "x" of "en-x-school", or the letter of an extension, means nothing without what follows it.
    if (cut >= 2 && range[cut - 2] === "-") cut -= 2;
    range = cut > 0 ? range.slice(0, cut) : "";
  }
  return undefined;
}

/** A place of a label: a name of Latin letters, digits and underscores in braces. */
const PLACE = /\{(\w+)\}/g;

/** The places a label names, each once, in the order it names them. */
export function placesOf(label: string): string[] {
  return [...new Set([...label.matchAll(PLACE)].map(([, name]) => String(name)))];
}

/**
 * A label with its places filled by name. A place the values do not give is a TypeError: a label
 * never shows its braces.
 */
export function say(label: string, values: Readonly<Record<string, string | number>>): string {
  return label.replace(PLACE, (_, name: string) => {
    const value = Object.hasOwn(values, name) ? values[name] : undefined;
    if (value === undefined) throw new TypeError(`the label "${label}" has no value for {${name}}`);
    return String(value);
  });
}

/**
 * A label with its places filled by name but one, which it is cut at: what comes before that place
 * and what comes after it, for a node of its own to stand between them (R61). A label that names
 * the place not once is a TypeError, and so is a place the values do not give, as with `say`.
 */
export function sayAround(
  label: string,
  place: string,
  values: Readonly<Record<string, string | number>>,
): readonly [string, string] {
  const parts = label.split(`{${place}}`);
  const [before, after] = parts;
  if (parts.length !== 2 || before === undefined || after === undefined) {
    throw new TypeError(`the label "${label}" names {${place}} not once`);
  }
  // The label whole first, so that a place with no value is named in it, not in a cut of it.
  say(label, { ...values, [place]: "" });
  return [say(before, values), say(after, values)];
}
