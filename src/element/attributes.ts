// The attributes the element writes as its state changes — the row's and the template's — each
// only when its value changes, so that what has not changed tells no observer of a change, the
// namespace of the SVG it writes them on, and the place of an SVG shape of a box. This module is
// no entry point of the package.

/** The namespace of the SVG elements the element makes: its layers, and the row's triangle. */
export const SVG = "http://www.w3.org/2000/svg";

/** An SVG shape — a workbook's box, a demo's picture — set over a box in its layer's units. */
export function placeOver(
  shape: SVGElement,
  { left, top, width, height }: { left: number; top: number; width: number; height: number },
): void {
  shape.setAttribute("x", String(left));
  shape.setAttribute("y", String(top));
  shape.setAttribute("width", String(width));
  shape.setAttribute("height", String(height));
}

/** An attribute set to a value, or taken off for null, and written only if it changes. */
export function write(element: Element, name: string, value: string | null): void {
  if (element.getAttribute(name) === value) return;
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
