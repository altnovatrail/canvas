import { formulaic, type Piece, piecesOf } from "../core/notation.js";

// A statement read, drawn as the page prints it (R89): its text as text, a box an answer goes in
// as a dashed box, and a fraction or a power as MathML, which the browser lays out itself, a
// fraction full size on the line and those within it smaller, as a book sets them. In a statement
// with no word its lone letters are its unknowns, in italics as MathML sets a letter.

const MATHML = "http://www.w3.org/1998/Math/MathML";

/** The nodes of one statement's line. */
export function lineOf(statement: string): Node[] {
  const letters = formulaic(statement);
  const out: Node[] = [];
  for (const piece of piecesOf(statement)) {
    if (piece.kind === "text") out.push(...textOf(piece.text, letters));
    else if (piece.kind === "box") out.push(slot());
    else {
      const math = mathml("math");
      math.setAttribute("displaystyle", "true");
      math.append(mathOf(piece));
      out.push(math);
    }
  }
  return out;
}

/** Text of the line: in a formula, each lone letter in italics. */
function textOf(text: string, letters: boolean): Node[] {
  if (!letters) return [document.createTextNode(text)];
  return text
    .split(/(\p{L})/u)
    .filter((part) => part !== "")
    .map((part) => {
      if (!/^\p{L}$/u.test(part)) return document.createTextNode(part);
      const letter = document.createElement("i");
      letter.textContent = part;
      return letter;
    });
}

/** A dashed box an answer goes in. */
function slot(): HTMLElement {
  const box = document.createElement("span");
  box.className = "slot";
  return box;
}

/** A piece as MathML. */
function mathOf(piece: Piece): Element {
  switch (piece.kind) {
    case "text":
      return row(tokensOf(piece.text));
    case "box": {
      const box = mathml("mspace");
      box.setAttribute("class", "slot");
      // The box of the line's own, 1.08em square, its foot as far under the baseline.
      box.setAttribute("width", "1.08em");
      box.setAttribute("height", "0.86em");
      box.setAttribute("depth", "0.22em");
      return box;
    }
    case "fraction": {
      const fraction = mathml("mfrac");
      fraction.append(rowOf(piece.over), rowOf(piece.under));
      return fraction;
    }
    case "power": {
      const power = mathml("msup");
      power.append(rowOf(piece.base), rowOf(piece.exponent));
      return power;
    }
  }
}

/** Pieces as one row of MathML. */
function rowOf(pieces: readonly Piece[]): Element {
  return row(pieces.map(mathOf));
}

function row(children: Element[]): Element {
  const out = mathml("mrow");
  out.append(...children);
  return out;
}

/** Text as MathML's tokens: a number, a letter, and each other sign an operator; spaces dropped. */
function tokensOf(text: string): Element[] {
  const out: Element[] = [];
  for (const [token] of text.matchAll(/\d+(?:[.,]\d+)?|\p{L}|\S/gu)) {
    const kind = /^\d/.test(token) ? "mn" : /^\p{L}$/u.test(token) ? "mi" : "mo";
    const element = mathml(kind);
    element.textContent = token;
    out.push(element);
  }
  return out;
}

function mathml(name: string): Element {
  return document.createElementNS(MATHML, name);
}
