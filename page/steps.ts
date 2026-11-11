// The steps before writing on the samples page (T20, T84, T89 in RUN.md; R11, R58, R59, R69 in
// docs/decisions.md; docs/architecture.md, section 3.6): which purposes the build's sets of texts
// and its tasks open — a child's session among them — and why the others are closed, the
// statements each asks for, the writer's code the person types, and what the start still lacks.
// No DOM: page/main.ts shows what this decides, and every word is page/texts.ts's or a set's.

import type { LegalSet, PageTexts } from "./sets.js";
import { HAND_OVER, PURPOSE_NOTES, START_LACKS, STATEMENTS } from "./texts.js";

/** What a start begins: the measurement or a module's eval set, which an adult writes for, or a
 * child's session, whose samples are of the measurement, written by the child (T84). */
export type PurposeKey = "measurement" | "evalSet" | "child";

/** A purpose as the start offers it: open or not, and a word on why. */
export interface Offered {
  readonly key: PurposeKey;
  readonly open: boolean;
  /** Why it is closed, or what an open one is limited to. */
  readonly note?: string;
}

/** The purposes under a build's texts, for a build with or without tasks of modules, a child's
 * session last. Each opens with a current set of its own (R130 spec): the author approves the
 * adults' and a child's consent apart, and one with none is closed (T102). The eval set opens only
 * where the build has tasks of modules too:
 * a module's eval set takes samples of its own module's tasks alone (contracts/README.md of spec,
 * «Eval sets»), and a sample of a task of tutor would be refused there. */
export function purposes(texts: PageTexts, moduleTasks: boolean): Offered[] {
  const closed = (key: PurposeKey, note: string): Offered => ({ key, open: false, note });
  let evalSet: Offered = { key: "evalSet", open: true };
  if (texts.evalSet === undefined) evalSet = closed("evalSet", PURPOSE_NOTES.evalSetNoSet);
  else if (!moduleTasks) evalSet = closed("evalSet", PURPOSE_NOTES.evalSetNoModule);
  const child: Offered =
    texts.child === undefined
      ? closed("child", PURPOSE_NOTES.childNoSet)
      : { key: "child", open: true };
  const measurement: Offered =
    texts.measurement === undefined
      ? closed("measurement", PURPOSE_NOTES.measurementNoSet)
      : { key: "measurement", open: true };
  return [measurement, evalSet, child];
}

/** The texts of a purpose, if the build has them: its set. */
export function textsOf(texts: PageTexts, purpose: PurposeKey): LegalSet | undefined {
  return { measurement: texts.measurement, evalSet: texts.evalSet, child: texts.child }[purpose];
}

/** The version of the texts a purpose's samples name: its set's, such as measure-2; undefined for
 * a purpose the build has no texts for. */
export function versionOf(texts: PageTexts, purpose: PurposeKey): string | undefined {
  return textsOf(texts, purpose)?.version;
}

/** Where a purpose's file goes once it is saved, in the page's words. */
export function handOverOf(texts: PageTexts, purpose: PurposeKey): string | undefined {
  return textsOf(texts, purpose) ? HAND_OVER[purpose] : undefined;
}

/** Whether a purpose's sample has a writer's code: the measurement's and a child's do, an eval
 * set's, which is published, does not (R09). */
export function hasCode(purpose: PurposeKey): purpose is "measurement" | "child" {
  return purpose !== "evalSet";
}

/** The statements without which the person goes no further: the age, and the form of the set's
 * version — a child's parent's or guardian's for a session. */
export function statements(texts: PageTexts, purpose: PurposeKey): string[] {
  const own = textsOf(texts, purpose);
  if (!own) return [STATEMENTS.adult];
  const form = purpose === "child" ? STATEMENTS.childForm : STATEMENTS.form;
  return [STATEMENTS.adult, form(own.version)];
}

/** A writer's code as the person typed it, in the protocol's shape — 6 to 16 digits and capital
 * Latin letters — with the case and the spaces forgiven; undefined when it is no code. The shape is
 * checked before the case is raised: a letter outside Latin may raise to Latin ones, «ß» to «SS»,
 * and a code the person never wrote down would pass. */
export function codeOf(typed: string): string | undefined {
  const code = typed.replace(/\s+/g, "");
  return /^[0-9A-Za-z]{6,16}$/.test(code) ? code.toUpperCase() : undefined;
}

/** The start as the person has filled it in. */
export interface Start {
  readonly purpose?: PurposeKey;
  /** How the code is given, once chosen: typed by the person, or a new one the page makes. */
  readonly way?: "own" | "new";
  /** The writer's code, when the purpose has one: new, or typed and in shape. */
  readonly code?: string;
  /** Whether something was typed for a code that is not one. */
  readonly typed: boolean;
  /** Each statement, ticked or not. */
  readonly agreed: readonly boolean[];
}

/** What the start still lacks before writing, in a build with or without tasks of modules; none
 * when the person may begin. */
export function lacks(texts: PageTexts, moduleTasks: boolean, start: Start): string[] {
  const found: string[] = [];
  const open = purposes(texts, moduleTasks).find(({ key }) => key === start.purpose)?.open ?? false;
  if (!start.purpose || !open) return [START_LACKS.purpose];
  if (start.purpose === "child" && start.way === "new") {
    // A new code goes into the form first: a session begins with the code of a form accepted (R11).
    found.push(START_LACKS.childNew);
  } else if (hasCode(start.purpose) && start.code === undefined) {
    const child = start.purpose === "child";
    if (start.typed) found.push(child ? START_LACKS.childCodeShape : START_LACKS.codeShape);
    else found.push(child ? START_LACKS.childCode : START_LACKS.code);
  }
  const asked = statements(texts, start.purpose).length;
  if (start.agreed.length !== asked || start.agreed.some((on) => !on)) {
    found.push(START_LACKS.statements);
  }
  return found;
}
