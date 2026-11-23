import { expect, test } from "vitest";
import { formulaic, type Piece, piecesOf } from "./notation.js";

const text = (t: string): Piece => ({ kind: "text", text: t });
const box: Piece = { kind: "box" };

test("a statement with no notation is its text, each box a box", () => {
  expect(piecesOf("□ − 3 = 7")).toEqual([box, text(" − 3 = 7")]);
  expect(piecesOf("Ann has 3 apples.")).toEqual([text("Ann has 3 apples.")]);
  expect(piecesOf("")).toEqual([]);
});

test("a fraction is its numerator over its denominator, nested as printed", () => {
  expect(piecesOf("\\frac{3}{17} + \\frac{1}{17}")).toEqual([
    { kind: "fraction", over: [text("3")], under: [text("17")] },
    text(" + "),
    { kind: "fraction", over: [text("1")], under: [text("17")] },
  ]);
  expect(piecesOf("\\frac{1 + \\frac{1}{2}}{□}")).toEqual([
    {
      kind: "fraction",
      over: [text("1 + "), { kind: "fraction", over: [text("1")], under: [text("2")] }],
      under: [box],
    },
  ]);
  // A one-character argument needs no braces, and \dfrac is a fraction too.
  expect(piecesOf("\\dfrac 34")).toEqual([
    { kind: "fraction", over: [text("3")], under: [text("4")] },
  ]);
});

test("a power raises the atom before it: a number, a letter, a bracket or a fraction", () => {
  expect(piecesOf("x^{2} = 49")).toEqual([
    { kind: "power", base: [text("x")], exponent: [text("2")] },
    text(" = 49"),
  ]);
  expect(piecesOf("2 + 10^3")).toEqual([
    text("2 + "),
    { kind: "power", base: [text("10")], exponent: [text("3")] },
  ]);
  expect(piecesOf("(a + b)^{2}")).toEqual([
    text("(a + b"),
    { kind: "power", base: [text(")")], exponent: [text("2")] },
  ]);
  const half = { kind: "fraction", over: [text("1")], under: [text("2")] } as const;
  expect(piecesOf("\\frac{1}{2}^{3}")).toEqual([
    { kind: "power", base: [half], exponent: [text("3")] },
  ]);
  expect(piecesOf("^2")).toEqual([{ kind: "power", base: [], exponent: [text("2")] }]);
});

test("a stray command is drawn as its sign, a bracket's size dropped, any other as written", () => {
  expect(piecesOf("3 \\cdot 4 \\div 2 \\times \\square")).toEqual([text("3 · 4 ÷ 2 × "), box]);
  expect(piecesOf("\\left(1 + 2\\right) \\ne 4")).toEqual([text("(1 + 2) ≠ 4")]);
  expect(piecesOf("\\sqrt{9}")).toEqual([text("\\sqrt9")]);
  expect(piecesOf("\\{1\\} a}b")).toEqual([text("{1} ab")]);
  // An unclosed group ends with the statement.
  expect(piecesOf("\\frac{1}{2")).toEqual([
    { kind: "fraction", over: [text("1")], under: [text("2")] },
  ]);
  expect(piecesOf("\\frac")).toEqual([{ kind: "fraction", over: [], under: [] }]);
});

test("a statement is a formula to the eye when it holds no word", () => {
  expect(formulaic("3x + 5 = 20")).toBe(true);
  expect(formulaic("\\frac{x}{3} + 2 = 6")).toBe(true);
  expect(formulaic("Ann has 3 apples")).toBe(false);
  expect(formulaic("Решите: x + 1 = 2")).toBe(false);
});
