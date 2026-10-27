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

/**
 * The fields of an object closed as the module format closes its objects (R32), read once into a
 * record of their own: a field it does not name is a TypeError at that field's path. A field left
 * out by `undefined` is no field, and is not in the record.
 */
export function closed(
  value: unknown,
  path: string,
  names: readonly string[],
  what: string,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(record(value, path))) {
    if (field === undefined) continue;
    if (!names.includes(name)) throw new TypeError(`${path}.${name}: no field of ${what}`);
    fields[name] = field;
  }
  return fields;
}

/**
 * A list of at least `least` items, each read by `each` at its own path. Array.from visits every
 * index, a hole too, which map would pass over unchecked.
 */
export function listOf<T>(
  value: unknown,
  path: string,
  least: number,
  what: string,
  each: (item: unknown, path: string) => T,
): T[] {
  if (!Array.isArray(value)) throw new TypeError(`${path}: a list of ${what}, not ${shown(value)}`);
  if (value.length < least) {
    const count = ["one", "two"][least - 1] ?? String(least);
    throw new TypeError(`${path}: a list of ${what}, ${count} at least, not ${shown(value)}`);
  }
  return Array.from(value, (item: unknown, i) => each(item, `${path}[${i}]`));
}

/** A text for people to read: a string, not empty. */
export function text(value: unknown, path: string, what: string): string {
  if (typeof value !== "string" || value === "") {
    throw new TypeError(`${path}: ${what}, a string not empty, not ${shown(value)}`);
  }
  return value;
}

/**
 * A whole number from `least` to `most`, or from `least` up, short of 2^53, where a number stops
 * being exact.
 */
export function whole(
  value: unknown,
  path: string,
  least: number,
  most = Number.MAX_SAFE_INTEGER,
): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < least || value > most) {
    const range = most === Number.MAX_SAFE_INTEGER ? `from ${least}` : `from ${least} to ${most}`;
    throw new TypeError(`${path}: a whole number ${range}, not ${shown(value)}`);
  }
  return value;
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
