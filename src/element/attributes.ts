// The attributes the element writes as its state changes — the row's and the template's — each
// only when its value changes, so that what has not changed tells no observer of a change. This
// module is no entry point of the package.

/** An attribute set to a value, or taken off for null, and written only if it changes. */
export function write(element: Element, name: string, value: string | null): void {
  if (element.getAttribute(name) === value) return;
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
