// The labels of the element's own buttons, of a workbook's boxes and of the parts of a worked
// example's demo, in the languages of its interface (R28, R29, R33, R36, R37, R42): English and
// Russian, as О-2 recommends, until app's T07 gives the shared scheme of translations of the packages
// of the interface. The language is the element's own `lang`, looked up as RFC 4647 does it. This
// module is no entry point of the package.

/**
 * What the element says: the row of buttons its own name — the canvas kind's, or a worked
 * example's — the name of the group of tools and each button, a workbook's box its name, and the
 * number of a part of a demo the element tells of.
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
  /** A box of a workbook's line, numbered when the line has more than one (R36). */
  readonly box: string;
  /** What a filled box's name adds (R37). */
  readonly filled: string;
  /** The number of a part of a demo the element tells of, of so many: «Part 2 of 4» (R42). */
  readonly part: string;
  readonly of: string;
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
  filled: "filled",
  part: "Part",
  of: "of",
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
      filled: "заполнено",
      part: "Часть",
      of: "из",
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
