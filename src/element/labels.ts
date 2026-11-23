// The labels of the element's own buttons, of a workbook's boxes and of the parts of a worked
// example's demo, in the languages of the interface, English and Russian, by the shared
// rules of the packages' translations:
// - the language is the element's own `lang`, looked up as RFC 4647 does it, and English stands for
//   any other, under a `lang` of its own;
// - a label with a number or a word in it is one string with named places, «Часть {n} из {total}.»,
//   never pieces glued together: languages put their words in other orders;
// - no label counts a thing, so none has forms of number yet. The first that does takes CLDR's
//   categories, `other` always among them, chosen by `Intl.PluralRules` of the label's language;
// - no label tells the learner's gender or speaks as the AI in the first person;
// - the buttons' words are those of spec's table of words, the two of the page's zoom among them;
//  no button scrolls the sheet, which the hand moves, so no label says a direction.
// This module is no entry point of the package.

/**
 * What the element says: its scroll container the canvas kind's name, or a worked example's, and
 * the row of buttons a name of its own, that of the kind's buttons, the name of the group of
 * tools and each button, a workbook's box its name, and the number of a part of a demo the element
 * tells of. A label with places names them in braces.
 */
export interface Labels {
  readonly sheet: string;
  readonly workbook: string;
  /** A task from the learner's paper, its crop as tracing paper over a sheet. */
  readonly paper: string;
  /** A lesson's worked example, whose row has no tools of writing. */
  readonly example: string;
  /** The row of buttons of each: not the name of the container, which a screen reader shows too. */
  readonly sheetButtons: string;
  readonly workbookButtons: string;
  readonly paperButtons: string;
  /** The buttons of a worked example's demo: the next part, and the whole demo, shown or hidden. */
  readonly next: string;
  readonly demo: string;
  readonly tool: string;
  readonly pen: string;
  readonly eraser: string;
  readonly undo: string;
  readonly clear: string;
  /** The tool that moves the sheet and writes nothing. */
  readonly hand: string;
  /** The buttons of the page's zoom of the sheet, a step larger and a step smaller. */
  readonly zoomIn: string;
  readonly zoomOut: string;
  /**
   * The button of a task from paper's grid, by the grid the sheet shows now: a press turns it to
   * the next.
   */
  readonly gridDots: string;
  readonly gridLines: string;
  readonly gridBlank: string;
  readonly gridSquares: string;
  /** The tracing paper's grip, and the button atop the tools that hides it or shows it. */
  readonly moveTask: string;
  readonly hideTask: string;
  readonly showTask: string;
  /**
   * The tracing paper's bar of scale: its name, smaller, larger, the scale as a percentage,
   * {percent}, which a press sets back to its own size, and fit to the window.
   */
  readonly scaleButtons: string;
  readonly smaller: string;
  readonly larger: string;
  readonly scaleReset: string;
  readonly fit: string;
  /**
   * The reading of the statement in clean print: its button, as it offers it, waits and
   * offers the photo back, and the sign above the paper of what it shows.
   */
  readonly recognise: string;
  readonly recognising: string;
  readonly original: string;
  readonly photoShown: string;
  readonly readingShown: string;
  /** A box of a workbook's line, alone in it. */
  readonly box: string;
  /** A box among several of its line, by its slot: {slot}. */
  readonly boxAt: string;
  /** A box a demo fills, by its line and its slot in it: {line} and {slot}. */
  readonly boxIn: string;
  /** A box's {name} when the box is filled. */
  readonly filled: string;
  /** A box's {name} and the {value} a demo wrote in it. */
  readonly valued: string;
  /** The part of a demo the element tells of, {n}, of so many, {total}. */
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
  next: "Next",
  demo: "Demo",
  tool: "Tool",
  pen: "Pen",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  hand: "Hand",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  gridDots: "Grid: dots",
  gridLines: "Grid: lines",
  gridBlank: "Grid: blank",
  gridSquares: "Grid: squares",
  moveTask: "Move the task",
  hideTask: "Hide the task",
  showTask: "Show the task",
  scaleButtons: "Task scale",
  smaller: "Smaller",
  larger: "Larger",
  scaleReset: "{percent}: back to 100%",
  fit: "Fit",
  recognise: "Recognise",
  recognising: "Recognising…",
  original: "Original",
  photoShown: "Photo of the task",
  readingShown: "Recognised by AI",
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
      next: "Дальше",
      demo: "Показ",
      tool: "Инструмент",
      pen: "Перо",
      eraser: "Ластик",
      undo: "Отменить",
      clear: "Очистить",
      hand: "Рука",
      zoomIn: "Крупнее",
      zoomOut: "Мельче",
      gridDots: "Сетка: точки",
      gridLines: "Сетка: строчки",
      gridBlank: "Сетка: пусто",
      gridSquares: "Сетка: клетки",
      moveTask: "Подвинуть задачу",
      hideTask: "Спрятать задачу",
      showTask: "Показать задачу",
      scaleButtons: "Масштаб задачи",
      smaller: "Уменьшить",
      larger: "Увеличить",
      scaleReset: "{percent}: вернуть 100 %",
      fit: "Вписать",
      recognise: "Распознать",
      recognising: "Распознаём…",
      original: "Оригинал",
      photoShown: "Фото задачи",
      readingShown: "Распознано ИИ",
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
 * that stands for a tag it has not is in no language of the tag's.
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
 * and what comes after it, for a node of its own to stand between them. A label that names
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
