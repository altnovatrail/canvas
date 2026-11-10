// The samples page's sets of texts (T20, T84, T89 in RUN.md; R11, R58, R59, R69 in
// docs/decisions.md): what a purpose's notice says, and under which version. A purpose opens with a
// current set of spec's legal part alone — its notice and its form under one version — which the
// build takes from the release file legal-<n>.tar.gz (R130 spec; scripts/legal.ts). Its version,
// the set's ID and number joined by a hyphen, goes into every sample the page saves. While the
// measurement has no current set, the page's own draft, page/sets/draft-0.json, opens it to the
// author's own samples alone (R11). The statements and where the file goes are the page's own
// words, page/texts.ts's. It has no imports, so that scripts/page.ts checks the draft with the
// page's own rules and gives the page what this file names.

/** A run of text in a notice: plain, strong, emphasised, code, or a hard line break. */
export type Inline =
  | { readonly text: string }
  | { readonly strong: readonly Inline[] }
  | { readonly emphasis: readonly Inline[] }
  | { readonly code: string }
  | { readonly lineBreak: true };

/** A block of a notice, of the Markdown a legal text may hold: CommonMark with GitHub's tables, and
 * no HTML, image or link (README of spec's legal part, section 4). */
export type Block =
  | { readonly heading: number; readonly inline: readonly Inline[] }
  | { readonly paragraph: readonly Inline[] }
  | {
      readonly list: readonly (readonly Block[])[];
      readonly ordered: boolean;
      /** The number of an ordered list's first item, as the text writes it. */
      readonly start: number;
    }
  | { readonly table: readonly (readonly (readonly Inline[])[])[] }
  | { readonly quote: readonly Block[] }
  | { readonly code: string }
  | { readonly rule: true };

/** A current set of spec's legal part, as the page shows it. */
export interface LegalSet {
  /** The version the samples name: the set's ID and number joined by a hyphen, measure-1. */
  readonly version: string;
  /** The notice's text in English, the text in force, block by block (privacy 7 spec). */
  readonly notice: readonly Block[];
  /** The gist of the notice in the language of the screen, from the passport (R116 spec). */
  readonly gist: string;
}

/** The page's own draft, which opens the measurement to the author's own samples while it has no
 * current set: the author needs no form for samples of their own (R11). */
export interface AuthorDraft {
  readonly draft: true;
  /** The version the samples name: draft-0, which no set of the legal part has, its numbers
   * beginning at 1. */
  readonly version: string;
  /** The notice, paragraph by paragraph. */
  readonly notice: readonly string[];
  /** That the author writes their own samples. */
  readonly statement: string;
  /** Where the file goes once it is saved. */
  readonly handOver: string;
}

/** The texts a build carries: the measurement's set, or the draft while it has none, and the eval
 * set's and a child's session's where they have current sets. */
export interface PageTexts {
  readonly measurement: LegalSet | AuthorDraft;
  readonly evalSet?: LegalSet;
  readonly child?: LegalSet;
}

/** The versions the sample file allows (contracts/README.md of spec, «The sample file»). */
const VERSION = /^[A-Za-z0-9.-]{1,32}$/;

/** Text that is there: a string with more than spaces in it. */
function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${where}: no text`);
  return value;
}

/** The author's draft from its JSON, checked: a TypeError says what is wrong. */
export function draftOf(json: unknown): AuthorDraft {
  const raw = (json ?? {}) as Record<string, unknown>;
  const version = raw.version;
  if (typeof version !== "string" || !VERSION.test(version) || version === "none") {
    throw new TypeError("the draft's version is 1 to 32 Latin letters, digits, dots and hyphens");
  }
  const notice = raw.notice;
  if (!Array.isArray(notice) || notice.length === 0) throw new TypeError("the draft: no notice");
  return {
    draft: true,
    version,
    notice: notice.map((paragraph, i) => text(paragraph, `notice[${i}]`)),
    statement: text(raw.statement, "statement"),
    handOver: text(raw.handOver, "handOver"),
  };
}

/** Whether the measurement's texts are the author's draft. */
export function isDraft(texts: LegalSet | AuthorDraft): texts is AuthorDraft {
  return "draft" in texts;
}
