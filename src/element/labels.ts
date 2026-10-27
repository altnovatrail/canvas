// The labels of the element's own buttons and of a workbook's boxes, in the languages of its
// interface (R28, R29, R33, R36): English and Russian, as О-2 recommends, until app's T07 gives the
// shared scheme of translations of the packages of the interface. The language is the element's
// own `lang`, looked up as RFC 4647 does it. This module is no entry point of the package.

/**
 * What the element says: the row of buttons its own name — the canvas kind's — the name of the group
 * of tools and each button, and a workbook's box its name.
 */
export interface Labels {
  readonly sheet: string;
  readonly workbook: string;
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
  /** A box of a workbook's line, numbered when the line has more than one (R36). */
  readonly box: string;
}

/** The labels in English, the code's own language: those of any language the table has not. */
const ENGLISH: Labels = Object.freeze({
  sheet: "Sheet",
  workbook: "Workbook",
  tool: "Tool",
  pen: "Pen",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  up: "Up",
  down: "Down",
  finger: "Draw with finger",
  box: "Box",
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
      tool: "Инструмент",
      pen: "Перо",
      eraser: "Ластик",
      undo: "Отменить",
      clear: "Очистить",
      up: "Выше",
      down: "Ниже",
      finger: "Рисовать пальцем",
      box: "Окошко",
    }),
  ],
]);

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
