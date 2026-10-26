/**
 * What reads a value a consumer gives the element, such as a task or the tutor's marks: its fields,
 * and the value itself as an error message shows it. A value the element cannot take is a
 * TypeError that names the field by its path.
 */

/** The fields of an object; anything else is a TypeError at `path`. */
export function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${path}: an object, not ${shown(value)}`);
  }
  return value as Record<string, unknown>;
}

/** A value as an error message shows it. */
export function shown(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "a function";
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
