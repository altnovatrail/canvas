// The labels of the element's own buttons, in the languages of its interface (R28, R29): English
// and Russian, as О-2 recommends, until app's T07 gives the shared scheme of translations of the
// packages of the interface. The language is the element's own `lang`, looked up as RFC 4647
// does it. This module is no entry point of the package.

/** What the row of buttons says: its own name, the name of the group of tools, each button. */
export interface Labels {
  readonly sheet: string;
  readonly tool: string;
  readonly pen: string;
  readonly eraser: string;
  readonly undo: string;
  readonly clear: string;
  /** The button that lets a finger write again, in pen mode (R29). */
  readonly finger: string;
}

/** The labels in English, the code's own language: those of any language the table has not. */
const ENGLISH: Labels = Object.freeze({
  sheet: "Sheet",
  tool: "Tool",
  pen: "Pen",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  finger: "Draw with finger",
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
      tool: "Инструмент",
      pen: "Перо",
      eraser: "Ластик",
      undo: "Отменить",
      clear: "Очистить",
      finger: "Рисовать пальцем",
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
