/**
 * A statement read from a task from paper, as the element draws it: the text as printed,
 * "□" for each box an answer goes in, and what one line of text cannot hold written LaTeX's way —
 * a fraction with a bar as `\frac{3}{17}`, nested as printed, and a raised power as `^{2}`. Nothing
 * else of LaTeX is the reading's; a model that strays all the same gets its few common signs drawn
 * as signs, `\left` and `\right` dropped, and any other command shown as written, so a reading is
 * never lost to its notation.
 */
export type Piece =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "box" }
  | {
      readonly kind: "fraction";
      readonly over: readonly Piece[];
      readonly under: readonly Piece[];
    }
  | {
      readonly kind: "power";
      readonly base: readonly Piece[];
      readonly exponent: readonly Piece[];
    };

/** The signs a model may write as LaTeX's commands, drawn as the page prints them. */
const SIGNS: Readonly<Record<string, string>> = Object.freeze({
  cdot: "·",
  times: "×",
  div: "÷",
  pm: "±",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  ne: "≠",
  neq: "≠",
  approx: "≈",
  square: "□",
  Box: "□",
});

/** The commands that only size a bracket, dropped with the space after them. */
const DROPPED = new Set(["left", "right"]);

/** The pieces of a statement read, in order. */
export function piecesOf(statement: string): readonly Piece[] {
  return new Reader(statement).pieces(false);
}

/**
 * Whether a statement is a formula to the eye, its lone letters its unknowns: it holds no word of
 * two letters or more, outside LaTeX's commands. "3x + 5 = 20" is one, "Ann has 3 apples" is not.
 */
export function formulaic(statement: string): boolean {
  return !/\p{L}{2,}/u.test(statement.replace(/\\[A-Za-z]+/g, " "));
}

/** Whether a character is an ASCII digit. */
const digit = (c: string | undefined) => c !== undefined && c >= "0" && c <= "9";

/**
 * The atom a power raises: the number, with one decimal mark, the letter or the bracket at the
 * text's end. Read back from the end: a pattern anchored at the end alone tries every start, and
 * is quadratic on a long run of digits.
 */
function atomAtEnd(text: string): string | undefined {
  let start = text.length;
  while (digit(text[start - 1])) start--;
  if (start === text.length) {
    const last = [...text.slice(-2)].at(-1);
    return last !== undefined && /^(?:\p{L}|[)\]])$/u.test(last) ? last : undefined;
  }
  const mark = text[start - 1];
  if ((mark === "." || mark === ",") && digit(text[start - 2])) {
    start--;
    while (digit(text[start - 1])) start--;
  }
  return text.slice(start);
}

class Reader {
  #at = 0;
  readonly #text: string;

  constructor(text: string) {
    this.#text = text;
  }

  /** The pieces up to the end, or to the brace that closes a group when `inGroup`. */
  pieces(inGroup: boolean): Piece[] {
    const out: Piece[] = [];
    const text = this.#text;
    while (this.#at < text.length) {
      const c = text[this.#at] as string;
      if (c === "}" && inGroup) {
        this.#at++;
        return out;
      }
      if (c === "□") {
        this.#at++;
        out.push({ kind: "box" });
      } else if (c === "\\") {
        this.#command(out);
      } else if (c === "^") {
        this.#at++;
        out.push({ kind: "power", base: baseOf(out), exponent: this.#argument() });
      } else if (c === "{") {
        // A group of its own only groups: its pieces stand in the line.
        this.#at++;
        for (const piece of this.pieces(true)) {
          if (piece.kind === "text") push(out, piece.text);
          else out.push(piece);
        }
      } else if (c === "}") {
        // A brace that closes nothing is no part of the print.
        this.#at++;
      } else {
        this.#at++;
        push(out, c);
      }
    }
    return out;
  }

  /** A command after its backslash: a fraction, a sign, a bracket's size, or the text as written. */
  #command(out: Piece[]): void {
    const text = this.#text;
    const name = /^\\([A-Za-z]+|.)/.exec(text.slice(this.#at))?.[1] ?? "";
    this.#at += 1 + name.length;
    if (name === "frac" || name === "dfrac" || name === "tfrac") {
      const over = this.#argument();
      const under = this.#argument();
      out.push({ kind: "fraction", over, under });
    } else if (name in SIGNS) {
      const sign = SIGNS[name] as string;
      if (sign === "□") out.push({ kind: "box" });
      else push(out, sign);
    } else if (DROPPED.has(name)) {
      if (text[this.#at] === " ") this.#at++;
    } else if (name === "{" || name === "}" || name === " " || name === ",") {
      push(out, name === "," ? " " : name);
    } else {
      push(out, `\\${name}`);
    }
  }

  /** A command's argument: a group in braces, or the one character after it, spaces passed over. */
  #argument(): Piece[] {
    const text = this.#text;
    while (text[this.#at] === " ") this.#at++;
    if (text[this.#at] === "{") {
      this.#at++;
      return this.pieces(true);
    }
    const out: Piece[] = [];
    const c = text[this.#at];
    if (c === undefined) return out;
    if (c === "\\") {
      this.#command(out);
      return out;
    }
    this.#at++;
    if (c === "□") out.push({ kind: "box" });
    else push(out, c);
    return out;
  }
}

/** Text added to the pieces: joined to the text before it. */
function push(out: Piece[], text: string): void {
  const last = out.at(-1);
  if (last?.kind === "text") out[out.length - 1] = { kind: "text", text: last.text + text };
  else out.push({ kind: "text", text });
}

/** What a power raises, taken from the pieces before it: their last atom, or none. */
function baseOf(out: Piece[]): Piece[] {
  const last = out.at(-1);
  if (last === undefined) return [];
  if (last.kind !== "text") {
    out.pop();
    return [last];
  }
  const atom = atomAtEnd(last.text);
  if (atom === undefined) return [];
  const rest = last.text.slice(0, -atom.length);
  if (rest === "") out.pop();
  else out[out.length - 1] = { kind: "text", text: rest };
  return [{ kind: "text", text: atom }];
}
