// The legal texts of the samples page (T89 in RUN.md; R69 in docs/decisions.md): spec's release
// file legal-<n>.tar.gz, which ci-licenses verifies by release-verify (R77 spec) and the build
// holds to its sum, read as section 5 of the legal part's README gives — the passport's schema
// first, then the rules in the order of its table (R130 spec). The archive is git archive's of spec's legal/ at
// the tag, so it carries the schema and the vectors of reading too: the build reads the part
// against that schema, and the tests read the vectors through this same reader. A third reader,
// beside spec's own check and api's; spec's text, not its code, is what it follows, for canvas's
// code reads nothing of spec/. What the page takes of a part is the current set of each purpose —
// the notice in English as blocks, its gist in Russian, and the set's version — or nothing for a
// purpose whose set has no version in force.
//
// The build reads the part with no release before it, as legal-check-dir reads a copy's folder:
// legal.in-force-unchanged is spec's own history, which its CI checked against the release before
// when it made the file the signature binds. The reader still knows the rule, and its vectors
// with it.
//
// From version 3 of the part a version in force applies from its day, in_force_since, and a reader
// reads the part on a day of its own, a date in UTC: the build of the samples page on the day of its
// build (section 2). The current version is the newest in force whose day has come, and the next
// one the version that becomes current on the nearest day still to come; a set applies from the day
// it was approved, so the page takes the current set alone.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import type { Legal, TextPlace } from "@altnovatrail/spec/legalv3";
import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import type { PhrasingContent, RootContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { gfm } from "micromark-extension-gfm";
import { gfmTable } from "micromark-extension-gfm-table";
import { parseDocument } from "yaml";
import type { Block, Inline, LegalSet } from "../page/sets.ts";

/**
 * The legal texts the build carries: spec's release, the file's name in it, and the SHA-256 of its
 * bytes, which release-verify accepted. The release is the tag spec/ stands on, whose npm package
 * @altnovatrail/spec is a dependency too (R41): a move to a new tag of spec raises the three and
 * the file together.
 */
export const LEGAL_FILE = Object.freeze({
  tag: "v0.18.6",
  name: "legal-3.tar.gz",
  sha256: "12e7c773eacb217a31beb647104c4bb98fda543559f22dec735a585a1d926c75",
});

/** Where the file lies in the tree: a folder of its tag, for release-verify knows a file of spec by
 * its name alone. */
export const LEGAL_PATH = join("tasks", `spec-${LEGAL_FILE.tag}`, LEGAL_FILE.name);

/** The set of spec's legal part each purpose of the page takes (R130 spec, R133 spec). */
export const PURPOSE_SETS = Object.freeze({
  measurement: "measure",
  evalSet: "eval-set",
  child: "child-sample",
});

/** A part as section 5 reads it: the passport as YAML reads it, and the files under texts/ by their
 * paths from the part, each its text or its bytes. */
export interface Part {
  readonly passport: unknown;
  readonly files: Readonly<Record<string, string | Uint8Array>>;
}

/** Versions of texts and of sets, each by its ID. */
export interface Versions {
  readonly texts: Readonly<Record<string, number>>;
  readonly sets: Readonly<Record<string, number>>;
}

/** What a reader gives a part on its day: the current and the next version of every text and set
 * that has one, by its ID; or the step that refuses it and the names it gives, in the order of code
 * units. */
export type Reading =
  | { readonly current: Versions; readonly next: Versions }
  | { readonly refused_by: string; readonly names: readonly string[] };

/** The step of the schema, and the rules of section 5 in the order of its table. */
export const SCHEMA = "schema";
export const RULES = [
  "legal.files",
  "legal.versions",
  "legal.set-texts",
  "legal.markdown",
  "legal.operator",
  "legal.in-force-unchanged",
] as const;

const IN_FORCE = "in_force";
/** The privacy policy, whose section "Who we are" names the operator, and that section's heading,
 * of the second level (R115 spec; section 5). */
export const POLICY = "privacy-policy";
const WHO_WE_ARE = "Who we are";
/** A day as a reader reads the part on it. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** Where the notice and the form of a set stand (section 4). */
const SET_PLACES: readonly (readonly ["notice" | "form", TextPlace])[] = [
  ["notice", "samples_page"],
  ["form", "form"],
];
/** What a version of a text never holds: HTML, an image, and a link of any form — an autolink of
 * GitHub's flavour and one in <…> among them, which mdast gives as links (section 4). */
const FORBIDDEN = new Set([
  "html",
  "image",
  "imageReference",
  "link",
  "linkReference",
  "definition",
]);
/** The system's tar, by a fixed path rather than by PATH, as spec's tools name it: /usr/bin where
 * /usr is merged with /, and on macOS, where the iPad's job builds the page; /bin elsewhere. */
const TAR = ["/usr/bin/tar", "/bin/tar"].find((path) => existsSync(path)) ?? "/usr/bin/tar";
/** The part's version in VERSION: an integer from 1 and a newline. */
const VERSION = /^([1-9]\d*)\n$/;

/** Two strings in the order of their code units. */
function byCodeUnits(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/** The validator of the passport's schema, with the options spec's check names: every error, and
 * format an annotation alone (JSON Schema 2020-12 validation, 7.2.1). */
export function validatorOf(schema: unknown): ValidateFunction {
  const ajv = new Ajv2020({
    allErrors: true,
    validateFormats: false,
    strictTypes: false,
    strictTuples: false,
  });
  return ajv.compile(schema as object);
}

/** The paths ajv's errors name, each once, in the order of code units (section 5): the fields from
 * the root joined by ".", a missing or unknown field at the path it would have, a key a map refuses
 * as it stands; an error of if is left out, since its then or its else names the place. */
export function namesOf(errors: readonly ErrorObject[]): string[] {
  const paths = new Set<string>();
  for (const error of errors) {
    if (error.keyword === "if") continue;
    const names = error.instancePath
      .split("/")
      .slice(1)
      .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
    const params = error.params as Record<string, string | undefined>;
    if (error.propertyName !== undefined) names.push(error.propertyName);
    else if (error.keyword === "propertyNames") names.push(params.propertyName ?? "");
    else if (error.keyword === "required") names.push(params.missingProperty ?? "");
    else if (error.keyword === "unevaluatedProperties") {
      names.push(params.unevaluatedProperty ?? "");
    }
    paths.add(names.join("."));
  }
  return [...paths].sort(byCodeUnits);
}

/** The file of a version of a text, by its path from the part, or of its translation into the
 * language of a tag (section 2 of the part's README, from the part's version 2). */
export function fileOf(id: string, version: number, tag?: string): string {
  return tag === undefined ? `texts/${id}/${version}.md` : `texts/${id}/${version}.${tag}.md`;
}

/** The files of a version of a text, as its entry names them: its own, then each translation's —
 * every tag the entry gives, as spec's reader takes them, for an entry of the release before need
 * not pass the schema. */
function filesOf(id: string, version: number, translations: unknown): string[] {
  const tags: readonly unknown[] = Array.isArray(translations) ? translations : [];
  return [fileOf(id, version), ...tags.map((tag) => fileOf(id, version, String(tag)))];
}

/** A file's text: its bytes read as UTF-8, a byte order mark kept, as micromark reads one. */
function textOf(file: string | Uint8Array): string {
  return typeof file === "string"
    ? file
    : new TextDecoder("utf-8", { ignoreBOM: true }).decode(file);
}

/** Whether two files are the same, byte for byte; a file that is not there is none. */
function sameBytes(a: string | Uint8Array | undefined, b: string | Uint8Array | undefined) {
  if (a === undefined || b === undefined) return a === b;
  const bytes = (file: string | Uint8Array) =>
    typeof file === "string" ? Buffer.from(file, "utf8") : Buffer.from(file);
  return bytes(a).equals(bytes(b));
}

/** A text's Markdown tree with all of GitHub's flavour, as legal.markdown reads it: so a literal
 * autolink is a link, which the rule refuses, as spec's own check reads the same text. */
function treeOf(text: string) {
  return fromMarkdown(text, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
}

/** A text's Markdown tree as a version of a text is written — CommonMark with GitHub's tables and
 * nothing else of its flavour (section 4) —, as the page shows it: a ~word~ or a [ ] is text. */
function shownTreeOf(text: string) {
  return fromMarkdown(text, {
    extensions: [gfmTable()],
    mdastExtensions: [gfmTableFromMarkdown()],
  });
}

/** Why a text breaks legal.markdown, in a phrase, or null when it does not. */
export function markdownProblem(source: string | Uint8Array): string | null {
  const tree = treeOf(textOf(source));
  const first = tree.children[0];
  if (first?.type !== "heading" || first.depth !== 1) {
    return "it begins with no heading of the first level";
  }
  const found: string[] = [];
  const visit = (node: { type: string; children?: unknown[]; position?: unknown }) => {
    if (FORBIDDEN.has(node.type)) {
      const line = (node.position as { start: { line: number } } | undefined)?.start.line;
      found.push(`${node.type} at line ${line}`);
    }
    for (const child of node.children ?? []) visit(child as typeof node);
  };
  visit(tree);
  return found.length ? `it holds ${found.join(", ")}` : null;
}

/** legal.files: every version has its file, and each translation it names its own, and every file
 * is a version's or a translation's. */
function fileBreaches({ files }: Part, passport: Legal): string[] {
  const wanted = new Set<string>();
  for (const [id, { versions }] of Object.entries(passport.texts)) {
    for (const { version, translations } of versions) {
      for (const file of filesOf(id, version, translations)) wanted.add(file);
    }
  }
  return [
    ...[...wanted].filter((file) => !Object.hasOwn(files, file)),
    ...Object.keys(files).filter((file) => !wanted.has(file)),
  ];
}

/** A version of a text or of a set, as its number, status and date stand in the passport. */
interface Versioned {
  readonly version: number;
  readonly status: string;
  readonly in_force_since?: string;
}

/** legal.versions: 1, 2, 3… in order, every draft after every version in force, and the dates of
 * the versions in force never going back. */
function versionBreaches(passport: Legal): string[] {
  const names: string[] = [];
  const maps: readonly (readonly [
    string,
    Readonly<Record<string, { readonly versions: readonly Versioned[] }>>,
  ])[] = [
    ["texts", passport.texts],
    ["sets", passport.sets],
  ];
  for (const [kind, map] of maps) {
    for (const [id, { versions }] of Object.entries(map)) {
      let draft = false;
      let since = "";
      const broken = versions.some(({ version, status, in_force_since: date }, index) => {
        if (version !== index + 1) return true;
        if (status !== IN_FORCE) {
          draft = true;
          return false;
        }
        // YYYY-MM-DD compares as text.
        const back = draft || (date ?? "") < since;
        since = date ?? "";
        return back;
      });
      if (broken) names.push(`${kind}.${id}`);
    }
  }
  return names;
}

/** legal.set-texts: a version of a set names versions that exist, of texts of the places of its
 * notice and its form, and a version in force names versions in force that apply by its own day. */
function setTextBreaches(passport: Legal): string[] {
  const names: string[] = [];
  for (const [id, { versions }] of Object.entries(passport.sets)) {
    const broken = versions.some((set) =>
      SET_PLACES.some(([field, place]) => {
        const { text: textId, version } = set[field];
        const text = Object.hasOwn(passport.texts, textId) ? passport.texts[textId] : undefined;
        const named = text?.versions.find((each) => each.version === version);
        // YYYY-MM-DD compares as text.
        const later = (named?.in_force_since ?? "") > (set.in_force_since ?? "");
        return (
          !named ||
          text?.place !== place ||
          (set.status === IN_FORCE && (named.status !== IN_FORCE || later))
        );
      }),
    );
    if (broken) names.push(`sets.${id}`);
  }
  return names;
}

/** legal.markdown: each version, and each of its translations, begins with a heading of the first
 * level and holds no HTML, image or link. legal.files has held, so every one has its file. */
function markdownBreaches({ files }: Part, passport: Legal): string[] {
  const names: string[] = [];
  for (const [id, { versions }] of Object.entries(passport.texts)) {
    for (const { version, translations } of versions) {
      for (const file of filesOf(id, version, translations)) {
        const source = files[file];
        if (source !== undefined && markdownProblem(source)) names.push(file);
      }
    }
  }
  return names;
}

/** Whether a text has a heading of the second level that reads "Who we are", its text alone, as
 * CommonMark reads it. */
export function hasWhoWeAre(source: string | Uint8Array): boolean {
  return treeOf(textOf(source)).children.some(
    (node) =>
      node.type === "heading" &&
      node.depth === 2 &&
      node.children.length === 1 &&
      node.children[0]?.type === "text" &&
      node.children[0].value === WHO_WE_ARE,
  );
}

/** legal.operator: the part has the privacy policy, at the place app, with a version whose day has
 * come, and every version of it, a draft too, has the section "Who we are" (R115 spec). The policy
 * is named by its ID when it is missing, elsewhere or not yet in force, and a version without the
 * section by its file; a translation needs no such heading. legal.files has held, so every version
 * has its file. */
function operatorBreaches({ files }: Part, passport: Legal, today: string): string[] {
  const policy = Object.hasOwn(passport.texts, POLICY) ? passport.texts[POLICY] : undefined;
  const versions = policy?.versions ?? [];
  const names: string[] = [];
  if (policy?.place !== "app" || currentOf(inForceOf(versions), today) === undefined) {
    names.push(`texts.${POLICY}`);
  }
  for (const { version } of versions) {
    const source = files[fileOf(POLICY, version)];
    if (source !== undefined && !hasWhoWeAre(source)) names.push(fileOf(POLICY, version));
  }
  return names;
}

/** Whether a value is an object that is no list. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** legal.in-force-unchanged: every version in force in the release before is here, its entry the
 * same — and, for a text, its place — and its file the same, byte for byte, and so is the file of
 * each translation its entry before named. The passport before is read as it stands, for it need
 * not pass this schema. */
function changedBreaches(part: Part, passport: Legal, previous: Part): string[] {
  const names: string[] = [];
  const before = isObject(previous.passport) ? previous.passport : {};
  for (const kind of ["texts", "sets"] as const) {
    const then = isObject(before[kind]) ? before[kind] : {};
    const map: Readonly<Record<string, { versions: readonly unknown[]; place?: unknown }>> =
      passport[kind];
    for (const [id, was] of Object.entries(then)) {
      const now = Object.hasOwn(map, id) ? map[id] : undefined;
      const entries = isObject(was) && Array.isArray(was.versions) ? was.versions : [];
      for (const entry of entries) {
        if (!isObject(entry) || entry.status !== IN_FORCE) continue;
        const kept = now?.versions.find((each) => isObject(each) && each.version === entry.version);
        const place = isObject(was) ? was.place : undefined;
        if (
          !kept ||
          !isDeepStrictEqual(kept, entry) ||
          (kind === "texts" && now?.place !== place)
        ) {
          names.push(`${kind}.${id}`);
        }
        if (kind !== "texts" || !kept || typeof entry.version !== "number") continue;
        for (const file of filesOf(id, entry.version, entry.translations)) {
          if (!sameBytes(part.files[file], previous.files[file])) names.push(file);
        }
      }
    }
  }
  return names;
}

/** The versions in force of a text or a set. */
function inForceOf(versions: readonly Versioned[]): Versioned[] {
  return versions.filter(({ status }) => status === IN_FORCE);
}

/** The highest number of some versions, or undefined when there are none. */
function highest(versions: readonly Versioned[]): number | undefined {
  return versions.length ? Math.max(...versions.map(({ version }) => version)) : undefined;
}

/** The current version of a text or a set on a day, of its versions in force: the one with the
 * highest number whose day has come. legal.versions has held, so the higher the number, the later
 * or the same its day. YYYY-MM-DD compares as text. */
function currentOf(inForce: readonly Versioned[], today: string): number | undefined {
  return highest(inForce.filter(({ in_force_since: day }) => (day ?? "") <= today));
}

/** The next version of a text or a set on a day, of its versions in force: the one that becomes
 * current on the nearest day still to come, the highest number among those of that day. */
function nextOf(inForce: readonly Versioned[], today: string): number | undefined {
  const ahead = inForce.filter(({ in_force_since: day }) => (day ?? "") > today);
  const nearest = ahead.reduce<string | undefined>(
    (least, { in_force_since: day = "" }) => (least === undefined || day < least ? day : least),
    undefined,
  );
  return highest(ahead.filter(({ in_force_since: day }) => day === nearest));
}

/** The version pick gives of each text or set on a day, by ID in the order of code units; one with
 * no such version has none. */
function versionsOf(
  map: Readonly<Record<string, { readonly versions: readonly Versioned[] }>>,
  today: string,
  pick: (inForce: readonly Versioned[], today: string) => number | undefined,
): Record<string, number> {
  const found: Record<string, number> = {};
  for (const id of Object.keys(map).sort(byCodeUnits)) {
    const number = pick(inForceOf(map[id]?.versions ?? []), today);
    if (number !== undefined) found[id] = number;
  }
  return found;
}

/** Whether a text is a day of the calendar, YYYY-MM-DD. */
function isDay(text: string): boolean {
  if (!DAY.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number) as [number, number, number];
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** The day in UTC, YYYY-MM-DD, that a build reads the part on (section 2). */
export function todayInUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** A part read as section 5 gives on the day today, YYYY-MM-DD, with validate the passport's schema
 * and previous the part of the release before, or null when there is none to read. */
export function readingOf(
  validate: ValidateFunction,
  part: Part,
  previous: Part | null,
  today: string,
): Reading {
  if (!isDay(today)) {
    throw new RangeError(`a part is read on a day, YYYY-MM-DD, and ${today} is none`);
  }
  if (!validate(part.passport)) {
    return { refused_by: SCHEMA, names: namesOf(validate.errors ?? []) };
  }
  const passport = part.passport as Legal;
  const steps: readonly (readonly [string, () => string[]])[] = [
    ["legal.files", () => fileBreaches(part, passport)],
    ["legal.versions", () => versionBreaches(passport)],
    ["legal.set-texts", () => setTextBreaches(passport)],
    ["legal.markdown", () => markdownBreaches(part, passport)],
    ["legal.operator", () => operatorBreaches(part, passport, today)],
    ["legal.in-force-unchanged", () => (previous ? changedBreaches(part, passport, previous) : [])],
  ];
  for (const [rule, breaches] of steps) {
    const names = breaches();
    if (names.length) return { refused_by: rule, names: [...new Set(names)].sort(byCodeUnits) };
  }
  const { texts, sets } = passport;
  return {
    current: {
      texts: versionsOf(texts, today, currentOf),
      sets: versionsOf(sets, today, currentOf),
    },
    next: { texts: versionsOf(texts, today, nextOf), sets: versionsOf(sets, today, nextOf) },
  };
}

/** A YAML file's value, by YAML 1.2 under its Core schema, as the module format reads its files
 * (README of spec's format, §4): one document, no repeated key and no alias; a TypeError
 * otherwise. */
export function yamlOf(text: string, where: string): unknown {
  const document = parseDocument(text, { version: "1.2", schema: "core", uniqueKeys: true });
  const [error] = document.errors;
  if (error) throw new TypeError(`${where} is not YAML: ${error.message}`);
  return document.toJS({ maxAliasCount: 0 });
}

/** Every file under a folder, by its path from it with forward slashes. */
function filesUnder(root: string, at: string): string[] {
  return readdirSync(join(root, at), { withFileTypes: true }).flatMap((entry) => {
    const file = `${at}/${entry.name}`;
    return entry.isDirectory() ? filesUnder(root, file) : [file];
  });
}

/** The part in a folder of the layout of section 3 — VERSION, legal.yaml and texts/ — as its
 * reader takes it; a part with no texts/ has no files. The passport's format is the version in
 * VERSION, which the schema holds to the one it knows (section 2). */
export function partIn(folder: string): Part {
  const version = readFileSync(join(folder, "VERSION"), "utf8");
  if (!VERSION.test(version))
    throw new TypeError(`${folder}/VERSION is no integer from 1 and a newline`);
  const passport = yamlOf(readFileSync(join(folder, "legal.yaml"), "utf8"), `${folder}/legal.yaml`);
  if (isObject(passport) && passport.format !== Number(version)) {
    throw new TypeError(
      `${folder}/legal.yaml is of format ${passport.format}, and VERSION says ${version.trim()}`,
    );
  }
  const files: Record<string, Uint8Array> = {};
  const texts = existsSync(join(folder, "texts")) ? filesUnder(folder, "texts") : [];
  for (const file of texts) files[file] = readFileSync(join(folder, file));
  return { passport, files };
}

/** Inline content of mdast as the page's runs of text; a node the page does not show is an
 * Error. */
function inlineOf(nodes: readonly PhrasingContent[]): Inline[] {
  return nodes.map((node): Inline => {
    switch (node.type) {
      case "text":
        return { text: node.value };
      case "strong":
        return { strong: inlineOf(node.children) };
      case "emphasis":
        return { emphasis: inlineOf(node.children) };
      case "inlineCode":
        return { code: node.value };
      case "break":
        return { lineBreak: true };
      default:
        throw new Error(
          `${node.type} at line ${node.position?.start.line} is no text the page shows`,
        );
    }
  });
}

/** A block of mdast as the page's block; a node the page does not show is an Error. */
function blockOf(node: RootContent): Block {
  switch (node.type) {
    case "heading":
      return { heading: node.depth, inline: inlineOf(node.children) };
    case "paragraph":
      return { paragraph: inlineOf(node.children) };
    case "list":
      return {
        ordered: node.ordered === true,
        start: node.start ?? 1,
        list: node.children.map((item) => item.children.map(blockOf)),
      };
    case "table":
      return {
        table: node.children.map((row) => row.children.map((cell) => inlineOf(cell.children))),
      };
    case "blockquote":
      return { quote: node.children.map(blockOf) };
    case "code":
      return { code: node.value };
    case "thematicBreak":
      return { rule: true };
    default:
      throw new Error(
        `${node.type} at line ${node.position?.start.line} is no text the page shows`,
      );
  }
}

/** The blocks of a text of Markdown, as the page shows them. */
export function blocksOf(markdown: string): Block[] {
  return shownTreeOf(markdown).children.map(blockOf);
}

/** The current set of each purpose in a part that its reader accepts on the day today, under the
 * IDs of PURPOSE_SETS with prefix before each: a purpose whose set has no current version has none.
 * A part that the reader refuses stops the build. */
export function pageSetsOf(
  folder: string,
  schema: unknown,
  prefix = "",
  today = todayInUtc(),
): { -readonly [K in keyof typeof PURPOSE_SETS]?: LegalSet } {
  const part = partIn(folder);
  const reading = readingOf(validatorOf(schema), part, null, today);
  if ("refused_by" in reading) {
    throw new Error(`${folder} is refused by ${reading.refused_by}: ${reading.names.join(", ")}`);
  }
  const passport = part.passport as Legal;
  const sets: { -readonly [K in keyof typeof PURPOSE_SETS]?: LegalSet } = {};
  for (const [purpose, id] of Object.entries(PURPOSE_SETS) as [
    keyof typeof PURPOSE_SETS,
    string,
  ][]) {
    const number = reading.current.sets[prefix + id];
    if (number === undefined) continue;
    const set = passport.sets[prefix + id]?.versions[number - 1];
    if (!set) throw new Error(`${folder}: no version ${number} of the set ${prefix + id}`);
    const { text, version } = set.notice;
    const gist = passport.texts[text]?.versions[version - 1]?.summary.ru;
    const source = part.files[fileOf(text, version)];
    if (gist === undefined || source === undefined) {
      throw new Error(`${folder}: no ${fileOf(text, version)} with its gist`);
    }
    sets[purpose] = { version: `${prefix + id}-${number}`, notice: blocksOf(textOf(source)), gist };
  }
  return sets;
}

/** What use gives the part of the release file at path, unpacked into a folder of its own, and the
 * passport's schema it carries; the file is held to its sum first, and the folder goes after. */
export function withLegalFile<T>(
  use: (folder: string, schema: unknown) => T,
  path = LEGAL_PATH,
  sha256 = LEGAL_FILE.sha256,
): T {
  const bytes = readFileSync(path);
  if (createHash("sha256").update(bytes).digest("hex") !== sha256) {
    throw new Error(`${path} is not the file of its sum`);
  }
  const name = /^legal-([1-9]\d*)\.tar\.gz$/.exec(path.split("/").at(-1) ?? "");
  if (!name) throw new Error(`${path} is named as no file of the legal texts, legal-<n>.tar.gz`);
  const dir = mkdtempSync(join(tmpdir(), "canvas-legal-"));
  try {
    // The bytes held to the sum, not the path read again.
    const unpacked = spawnSync(TAR, ["-xzf", "-", "-C", dir], { input: bytes, encoding: "utf8" });
    if (unpacked.status !== 0) throw new Error(`${path} cannot be unpacked: ${unpacked.stderr}`);
    const folder = join(dir, `legal-${name[1]}`, "legal");
    const schema = JSON.parse(readFileSync(join(folder, "schemas", "legal.schema.json"), "utf8"));
    return use(folder, schema);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
