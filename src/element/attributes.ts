// The attributes the element writes as its state changes — the row's and the template's — each
// only when its value changes, so that what has not changed tells no observer of a change, and the
// namespace of the SVG it writes them on. This module is no entry point of the package.

/** The namespace of the SVG elements the element makes: its layers, and the row's triangle. */
export const SVG = "http://www.w3.org/2000/svg";

/** An attribute set to a value, or taken off for null, and written only if it changes. */
export function write(element: Element, name: string, value: string | null): void {
  if (element.getAttribute(name) === value) return;
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
