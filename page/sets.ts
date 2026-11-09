// A set of the samples page's texts (T20, T84 in RUN.md; R11, R58, R59 in docs/decisions.md): the
// notice of each purpose and of a child's session, the statements the adult makes before writing,
// and where the file goes after. Its
// version goes into every sample the page saves, and its status — a draft, or approved by the
// lawyer — says which purposes are open (docs/architecture.md, section 3.6). The build carries one
// set: the draft, page/sets/draft-0.json, or, given --texts, another; a test set, whose version
// begins with "test-", only into a page of version 0.0.0, which no release of canvas has. It has
// no imports, so that scripts/page.ts checks a set with the page's own rules.

/** What a set says of one purpose. */
export interface PurposeTexts {
  /** The notice, paragraph by paragraph: what the file holds, who sees it, for how long and how
   * consent is withdrawn, and that nothing personal goes on the sheet. */
  readonly notice: readonly string[];
  /** The statement besides the age: the form accepted, or, in a draft, the author's own samples. */
  readonly statement: string;
  /** Where the file goes once it is saved. */
  readonly handOver: string;
}

/** A set of texts, as page/sets/ holds it. */
export interface TextSet {
  /** The version the samples name: 1 to 32 Latin letters, digits, dots and hyphens, never none. */
  readonly version: string;
  readonly status: "draft" | "approved";
  /** The statement of age every purpose asks for (П-6). */
  readonly adult: string;
  readonly measurement: PurposeTexts;
  /** The eval set's texts: an approved set may have them; a draft keeps the eval set closed. */
  readonly evalSet?: PurposeTexts;
  /** The texts of a child's session: an approved set may have them; a draft keeps it closed. The
   * lawyer reads the adults' consent (П-16) and a child's (П-10) apart, so a set approved for one
   * may come before the other. */
  readonly child?: PurposeTexts;
}

/** The versions the sample file allows (contracts/README.md of spec, «The sample file»). */
const VERSION = /^[A-Za-z0-9.-]{1,32}$/;

/** Whether a set is one for tests, which no release carries. */
export function isTestSet(set: TextSet): boolean {
  return set.version.startsWith("test-");
}

/** Text that is there: a string with more than spaces in it. */
function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${where}: no text`);
  return value;
}

/** A purpose's texts, checked. */
function purposeOf(value: unknown, where: string): PurposeTexts {
  const raw = (value ?? {}) as Record<string, unknown>;
  const notice = raw.notice;
  if (!Array.isArray(notice) || notice.length === 0) throw new TypeError(`${where}: no notice`);
  return {
    notice: notice.map((paragraph, i) => text(paragraph, `${where}.notice[${i}]`)),
    statement: text(raw.statement, `${where}.statement`),
    handOver: text(raw.handOver, `${where}.handOver`),
  };
}

/** A set of texts from its JSON, checked: a TypeError says what is wrong. An approved set opens
 * the eval set and a child's session where it has their texts; a draft has neither, for both are
 * closed while it is. */
export function textSetOf(json: unknown): TextSet {
  const raw = (json ?? {}) as Record<string, unknown>;
  const version = raw.version;
  if (typeof version !== "string" || !VERSION.test(version) || version === "none") {
    throw new TypeError("the set's version is 1 to 32 Latin letters, digits, dots and hyphens");
  }
  const status = raw.status;
  if (status !== "draft" && status !== "approved") {
    throw new TypeError("the set's status is draft or approved");
  }
  if (status === "draft" && (raw.evalSet !== undefined || raw.child !== undefined)) {
    throw new TypeError("a draft has no texts of the eval set or of a child's session");
  }
  return {
    version,
    status,
    adult: text(raw.adult, "adult"),
    measurement: purposeOf(raw.measurement, "measurement"),
    ...(raw.evalSet === undefined ? {} : { evalSet: purposeOf(raw.evalSet, "evalSet") }),
    ...(raw.child === undefined ? {} : { child: purposeOf(raw.child, "child") }),
  };
}
