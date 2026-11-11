// The samples page's sets of texts (T20, T84, T89 in RUN.md; R11, R58, R59, R69 in
// docs/decisions.md): what a purpose's notice says, and under which version. A purpose opens with a
// current set of spec's legal part alone — its notice and its form under one version — which the
// build takes from the release file legal-<n>.tar.gz (R130 spec; scripts/legal.ts). Its version,
// the set's ID and number joined by a hyphen, goes into every sample the page saves. A purpose
// with no current set is closed: the author's draft of the measurement went once measure came into
// force (T102; R69). The statements and where the file goes are the page's own words,
// page/texts.ts's. It has no imports, so that scripts/page.ts gives the page what this file names.

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

/** The texts a build carries: the set of each purpose that has a current one. */
export interface PageTexts {
  readonly measurement?: LegalSet;
  readonly evalSet?: LegalSet;
  readonly child?: LegalSet;
}
