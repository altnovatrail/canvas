// The layout of a workbook's page (R34, R35): where the template puts each item's number, the
// pieces of its line and its boxes, in whole page units, from the task's items alone. The page is
// the sheet's, 1000 × 1400 units (R06), and the boxes stay where the layout puts them on any
// device: the widths of the text come from the canvas's own table (widths.ts), and SVG fits the
// text to them. Short lines stand two to a row, in the task's order; a long line takes the page's
// width and wraps. A task whose lines do not fit is a TypeError: nothing shrinks. The core's entry
// point does not give the layout, and vectors/pages.json pins its numbers: once released, they
// change only by a decision, for histories know neither the task nor the layout (R34).

import { SHEET } from "./sheet.js";
import type { WorkbookItem } from "./task.js";
import { clustersOf, clusterWidth, SPACE, wordsOf, wordWidth } from "./widths.js";

/** The numbers of the layout (R35), in page units, the type size among them. */
export interface Layout {
  /** The type size of the line's text. */
  readonly size: number;
  /** A box, the same for the whole task (R34). */
  readonly boxWidth: number;
  readonly boxHeight: number;
  /** The height of a line of text without a box. */
  readonly line: number;
  /** Between a line with a box and one without, in an item that wraps. */
  readonly lead: number;
  /** Between a box and a word beside it, and between an item's number and its line. */
  readonly gap: number;
  /** Between two boxes side by side, and between two lines with boxes in an item that wraps. */
  readonly apart: number;
  /** Between two rows of items. */
  readonly items: number;
  /** Between the two columns of short lines. */
  readonly gutter: number;
  /** The margin of the page on its sides, its top and its bottom. */
  readonly margin: number;
}

/** The layout the workbook has (R35): the sweep of T47 chose it around the box the author chose. */
export const LAYOUT: Layout = Object.freeze({
  size: 30,
  boxWidth: 100,
  boxHeight: 100,
  line: 46,
  lead: 12,
  gap: 16,
  apart: 32,
  items: 32,
  gutter: 40,
  margin: 40,
});

/** A piece of a line's text, or its part on one line of the page: one `<text>` (R34, R35). */
export interface PageText {
  readonly text: string;
  /** Where it starts, and its alphabetic baseline, in page units. */
  readonly left: number;
  readonly baseline: number;
  /** The width SVG fits it to, `textLength`. */
  readonly width: number;
}

/** A box, an answer slot, in page units, in the names of the format's zone. */
export interface PageBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** An item on the page: its number, its line in the order it is read, and its boxes by slot. */
export interface PageItem {
  readonly number: PageText;
  readonly line: readonly (PageText | PageBox)[];
  /** The boxes of the line, the same objects as in `line`: slot 1 first. */
  readonly boxes: readonly PageBox[];
}

/** A workbook's page: its items in the task's order, and the bottom of the last row. */
export interface Page {
  readonly items: readonly PageItem[];
  readonly bottom: number;
}

/** Whether a part of a line is a box. */
export function isBox(part: PageText | PageBox): part is PageBox {
  return "top" in part;
}

/** A word of a piece of the line, its width in hundredths of the size; or a box. */
type Token =
  | { readonly piece: number; readonly word: string; readonly width: number }
  | { readonly piece: number; readonly box: true };

/**
 * What lies between two tokens: within a piece, a space the piece's `<text>` carries; between two
 * pieces, the layout's own room. A line may break there, or may not.
 */
interface Joint {
  readonly inner: boolean;
  readonly width: number;
  readonly breaks: boolean;
}

/** A token on a line, and what lies between it and the token before it on that line. */
interface Entry {
  readonly token: Token;
  readonly joint: Joint | undefined;
}

/** A text or a box of a line, its place from the line's start: before the line has its place. */
type Part =
  | { readonly box: false; readonly text: string; readonly left: number; readonly width: number }
  | { readonly box: true; readonly left: number; readonly width: number };

/** Marks a line does not start with: they close what came before. */
const CLOSING = ".,:;!?)]}»…";
/** Marks a line does not end with: they open what comes after. */
const OPENING = "([{«„";

/** The derived numbers of a layout. */
interface Measures {
  readonly layout: Layout;
  /** The width of the space between two pieces of text. */
  readonly space: number;
  /** The column of the numbers, "00." wide: the page holds 20 items, and the layout no more than 99. */
  readonly numbers: number;
  /** Where a line starts after its number, from the item's left. */
  readonly indent: number;
  /** The width of a column of short lines, and of a line across the page. */
  readonly column: number;
  readonly full: number;
  /** Where the second column starts. */
  readonly second: number;
  /** The lowest unit a row may reach. */
  readonly floor: number;
}

function measuresOf(layout: Layout): Measures {
  const numbers = textWidth(layout, wordWidth("00."));
  const indent = numbers + layout.gap;
  const content = SHEET.width - 2 * layout.margin;
  const column = Math.floor((content - layout.gutter) / 2);
  return {
    layout,
    space: textWidth(layout, SPACE),
    numbers,
    indent,
    column,
    full: content - indent,
    second: layout.margin + column + layout.gutter,
    floor: SHEET.height - layout.margin,
  };
}

/** The width of a text of `hundredths` of the size, in whole units, rounded up. */
function textWidth(layout: Layout, hundredths: number): number {
  const product = layout.size * hundredths;
  return (product - (product % 100)) / 100 + (product % 100 > 0 ? 1 : 0);
}

/**
 * The page of a workbook's items (R35): a function of the items alone, in whole units, frozen. A
 * row that does not fit is a TypeError at the first item of it, `task.items[i]`.
 */
export function pageOf(items: readonly WorkbookItem[], layout: Layout = LAYOUT): Page {
  const measures = measuresOf(layout);
  // Each item's line as one line, worked out once: whether it is short, and its entries.
  const lines: (readonly Entry[] | undefined)[] = [];
  const lineOf = (n: number): readonly Entry[] => {
    lines[n] ??= entriesOf(tokensOf(items[n] as WorkbookItem), measures);
    return lines[n];
  };
  const short = (n: number): boolean =>
    n < items.length && partsOf(lineOf(n), measures).width <= measures.column - measures.indent;
  const placed: PageItem[] = [];
  let top = layout.margin;
  let bottom = layout.margin;
  let i = 0;
  while (i < items.length) {
    const room = measures.floor - top;
    // The column of the numbers is two digits wide.
    if (i >= MOST) throw new TypeError(noRoom(i, measures));
    if (short(i)) {
      const cells = short(i + 1) && i + 1 < MOST ? [i, i + 1] : [i];
      const laid = cells.map((n, c) =>
        itemOf([lineOf(n)], n, c === 0 ? layout.margin : measures.second, top, measures),
      );
      const height = Math.max(...laid.map(({ height }) => height));
      if (height > room) throw new TypeError(noRoom(i, measures));
      placed.push(...laid.map(({ item }) => item));
      bottom = top + height;
      i += cells.length;
    } else {
      const wrapped = linesOf(lineOf(i), measures, room);
      const laid =
        wrapped === undefined ? undefined : itemOf(wrapped, i, layout.margin, top, measures);
      if (laid === undefined || laid.height > room) throw new TypeError(noRoom(i, measures));
      placed.push(laid.item);
      bottom = top + laid.height;
      i += 1;
    }
    top = bottom + layout.items;
  }
  return deepFreeze({ items: placed, bottom });
}

/** The most items a page holds: the column of the numbers is "00." wide. */
const MOST = 99;

/** Whether two pages are the same, part by part. */
export function samePage(a: Page, b: Page): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function noRoom(i: number, { floor }: Measures): string {
  if (i >= MOST) {
    return `task.items[${i}]: no room for item ${i + 1} on the workbook's page: it holds no more than ${MOST} items, whose numbers have two digits at most`;
  }
  return `task.items[${i}]: no room for item ${i + 1} on the workbook's page, ${SHEET.width} × ${SHEET.height} units: its row would go below ${floor}, where the page's margin begins, and the text and the boxes never shrink`;
}

/** The tokens of an item's line: the words of its pieces of text, and its boxes, in order. */
function tokensOf(item: WorkbookItem): Token[] {
  return item.line.flatMap((part, piece): Token[] => {
    if ("binding" in part) return [{ piece, box: true }];
    return wordsOf(part.text).map((word) => ({ piece, word, width: wordWidth(word) }));
  });
}

function isWord(token: Token): token is Extract<Token, { word: string }> {
  return "word" in token;
}

/** What lies between two tokens next to each other in a line. */
function jointOf(a: Token, b: Token, measures: Measures): Joint {
  const { gap, apart } = measures.layout;
  if (isWord(a) && isWord(b)) {
    const glued = CLOSING.includes(b.word.slice(0, 1)) || OPENING.includes(a.word.slice(-1));
    if (a.piece === b.piece) return { inner: true, width: 0, breaks: !glued };
    return { inner: false, width: glued ? 0 : measures.space, breaks: !glued };
  }
  if (isWord(a)) return { inner: false, width: gap, breaks: !OPENING.includes(a.word.slice(-1)) };
  // A box holds on to the word after it, as a number holds on to its unit.
  if (isWord(b)) return { inner: false, width: gap, breaks: false };
  return { inner: false, width: apart, breaks: true };
}

/** Tokens as one line, each with what lies before it. */
function entriesOf(tokens: readonly Token[], measures: Measures): Entry[] {
  return tokens.map((token, n) => {
    const before = tokens[n - 1];
    return { token, joint: before === undefined ? undefined : jointOf(before, token, measures) };
  });
}

/**
 * The parts of a line of entries, from its start: the words of a piece that follow each other
 * within it make one text, and each text and box has its place and its width.
 */
function partsOf(
  entries: readonly Entry[],
  measures: Measures,
): { readonly parts: Part[]; readonly width: number } {
  const { layout } = measures;
  const parts: Part[] = [];
  let x = 0;
  let words: string[] = [];
  let hundredths = 0;
  let start = 0;
  const close = (): void => {
    if (words.length === 0) return;
    const width = textWidth(layout, hundredths + SPACE * (words.length - 1));
    parts.push({ box: false, text: words.join(" "), left: start, width });
    x = start + width;
    words = [];
    hundredths = 0;
  };
  for (const { token, joint } of entries) {
    if (isWord(token) && joint?.inner === true && words.length > 0) {
      words.push(token.word);
      hundredths += token.width;
      continue;
    }
    close();
    if (joint !== undefined) x += joint.width;
    if (isWord(token)) {
      start = x;
      words = [token.word];
      hundredths = token.width;
    } else {
      parts.push({ box: true, left: x, width: layout.boxWidth });
      x += layout.boxWidth;
    }
  }
  close();
  return { parts, width: x };
}

/**
 * The lines of a long item across the page: greedily, run by run, where a run is tokens no line may
 * break between. A run wider than a line goes token by token, and a word wider than a line is
 * broken between its clusters. Undefined once the lines could no longer fit the room left.
 */
function linesOf(
  entries: readonly Entry[],
  measures: Measures,
  room: number,
): Entry[][] | undefined {
  const { full } = measures;
  const { line } = measures.layout;
  // The lowest a line can be is a line of text: more lines than this cannot fit the room.
  const most = Math.floor(room / line) + 1;
  const lines: Entry[][] = [];
  let current: Entry[] = [];
  const fits = (candidate: readonly Entry[]): boolean => partsOf(candidate, measures).width <= full;
  const fresh = (entry: Entry): Entry => ({ token: entry.token, joint: undefined });
  const end = (): boolean => {
    if (current.length > 0) lines.push(current);
    current = [];
    return lines.length > most;
  };
  for (const run of runsOf(entries)) {
    if (current.length > 0 && fits([...current, ...run])) {
      current.push(...run);
      continue;
    }
    if (end()) return undefined;
    const alone = [fresh(run[0] as Entry), ...run.slice(1)];
    if (fits(alone)) {
      current = alone;
      continue;
    }
    for (const entry of run) {
      if (current.length > 0 && fits([...current, entry])) {
        current.push(entry);
        continue;
      }
      if (end()) return undefined;
      if (fits([fresh(entry)])) {
        current = [fresh(entry)];
        continue;
      }
      // A word wider than a line: its clusters, as many to a line as fit.
      const token = entry.token as Extract<Token, { word: string }>;
      let chunk = "";
      let width = 0;
      for (const cluster of clustersOf(token.word)) {
        const more = width + clusterWidth(cluster);
        if (chunk !== "" && textWidth(measures.layout, more) > full) {
          current = [{ token: { piece: token.piece, word: chunk, width }, joint: undefined }];
          if (end()) return undefined;
          chunk = "";
          width = 0;
        }
        chunk += cluster;
        width += clusterWidth(cluster);
      }
      current = [{ token: { piece: token.piece, word: chunk, width }, joint: undefined }];
    }
  }
  if (end()) return undefined;
  return lines;
}

/** Entries cut where a line may break: each run starts with what lies before it. */
function runsOf(entries: readonly Entry[]): Entry[][] {
  const runs: Entry[][] = [];
  for (const entry of entries) {
    const last = runs.at(-1);
    if (last === undefined || entry.joint === undefined || entry.joint.breaks) runs.push([entry]);
    else last.push(entry);
  }
  return runs;
}

/**
 * An item laid out from its lines at a place on the page: its parts in their places, its number on
 * the first line's baseline, right in the column of the numbers, and its height.
 */
function itemOf(
  lines: readonly (readonly Entry[])[],
  n: number,
  left: number,
  top: number,
  measures: Measures,
): { readonly item: PageItem; readonly height: number } {
  const { layout } = measures;
  const line: (PageText | PageBox)[] = [];
  const baselines: number[] = [];
  let y = top;
  let boxed: boolean | undefined;
  for (const entries of lines) {
    const { parts } = partsOf(entries, measures);
    const hasBox = parts.some((part) => part.box);
    if (boxed !== undefined)
      y += boxed && hasBox ? layout.apart : boxed || hasBox ? layout.lead : 0;
    const height = hasBox ? layout.boxHeight : layout.line;
    const baseline = y + Math.floor(height / 2) + Math.floor(layout.size / 3);
    baselines.push(baseline);
    const x = left + measures.indent;
    for (const part of parts) {
      line.push(
        part.box
          ? { left: x + part.left, top: y, width: part.width, height: layout.boxHeight }
          : { text: part.text, left: x + part.left, baseline, width: part.width },
      );
    }
    y += height;
    boxed = hasBox;
  }
  const label = `${n + 1}.`;
  const width = textWidth(layout, wordWidth(label));
  const number = {
    text: label,
    left: left + measures.numbers - width,
    baseline: baselines[0] ?? top + Math.floor(layout.line / 2) + Math.floor(layout.size / 3),
    width,
  };
  const height = Math.max(y - top, lines.length === 0 ? layout.line : 0);
  return { item: { number, line, boxes: line.filter(isBox) }, height };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const field of Object.values(value)) deepFreeze(field);
    Object.freeze(value);
  }
  return value;
}
