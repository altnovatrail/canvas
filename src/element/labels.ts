// The labels of the element's own buttons, of a workbook's boxes and of the parts of a worked
// example's demo, in the languages of the interface, English and Russian (R92 spec), by the shared
// rules of the packages' translations (R91 spec; R28, R29, R33, R36, R37, R42; T91 in RUN.md):
// - the language is the element's own `lang`, looked up as RFC 4647 does it, and English stands for
//   any other, under a `lang` of its own;
// - a label with a number or a word in it is one string with named places, «Часть {n} из {total}.»,
//   never pieces glued together: languages put their words in other orders;
// - no label counts a thing, so none has forms of number yet. The first that does takes CLDR's
//   categories, `other` always among them, chosen by `Intl.PluralRules` of the label's language;
// - no label tells the learner's gender (R70 spec) or speaks as the AI in the first person (П-15);
// - the buttons' words are those of the table of words of architecture 6 spec.
// This module is no entry point of the package.

/**
 * What the element says: the row of buttons its own name — the canvas kind's, or a worked
 * example's — the name of the group of tools and each button, a workbook's box its name, and the
 * number of a part of a demo the element tells of. A label with places names them in braces.
 */
export interface Labels {
  readonly sheet: string;
  readonly workbook: string;
  /** The row of a lesson's worked example, which has no tools of writing (R42). */
  readonly example: string;
  /** The buttons of a worked example's demo: the next part, and the whole demo, shown or hidden. */
  readonly next: string;
  readonly demo: string;
  readonly tool: string;
  readonly pen: string;
  readonly eraser: string;
  readonly undo: string;
  readonly clear: string;
  /** The buttons that scroll the sheet back up and on down, with a single pointer (R33). */
  readonly up: string;
  readonly down: string;
  /** The button that lets a finger write again, in pen mode (R29). */
  readonly finger: string;
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
  example: "Worked example",
  next: "Next",
  demo: "Demo",
  tool: "Tool",
  pen: "Pen",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  up: "Up",
  down: "Down",
  finger: "Draw with finger",
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
      example: "Пример",
      next: "Дальше",
      demo: "Показ",
      tool: "Инструмент",
      pen: "Перо",
      eraser: "Ластик",
      undo: "Отменить",
      clear: "Очистить",
      up: "Выше",
      down: "Ниже",
      finger: "Рисовать пальцем",
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

/**
 * The labels for a language tag, and the language they are in. The tag is looked up as RFC 4647,
 * section 3.4, does it: in lower case, cut subtag by subtag from its end until the table has what
 * is left, a single-letter subtag going with the subtag after it. English stands for any other
 * tag, and for none.
 */
export function labelsFor(tag: string | null): { readonly lang: string; readonly labels: Labels } {
  let range = (tag ?? "").toLowerCase();
  while (range !== "") {
    const labels = LABELS.get(range);
    if (labels !== undefined) return { lang: range, labels };
    let cut = range.lastIndexOf("-");
    // "x" of "en-x-school", or the letter of an extension, means nothing without what follows it.
    if (cut >= 2 && range[cut - 2] === "-") cut -= 2;
    range = cut > 0 ? range.slice(0, cut) : "";
  }
  return { lang: "en", labels: ENGLISH };
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
