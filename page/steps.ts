// The adult's steps before writing on the samples page (T20 in RUN.md; R11, R58 in
// docs/decisions.md; docs/architecture.md, section 3.6): which purposes the set of texts and the
// build's tasks open and why the others are closed, the statements each asks for, the writer's
// code the person types, and what the start still lacks. No DOM: page/main.ts shows what this
// decides, and every word is page/texts.ts's or the set's.

import type { TextSet } from "./sets.js";
import { PURPOSE_NOTES, START_LACKS } from "./texts.js";

/** The purposes an adult writes for: the measurement and a module's eval set. A child's session
 * is T84's. */
export type PurposeKey = "measurement" | "evalSet";

/** A purpose as the start offers it: open or not, and a word on why. */
export interface Offered {
  readonly key: PurposeKey;
  readonly open: boolean;
  /** Why it is closed, or what an open one is limited to. */
  readonly note?: string;
}

/** The purposes under a set, for a build with or without tasks of modules. A draft opens the
 * measurement to the author's own samples alone and keeps the eval set closed. An approved set
 * opens the eval set only where the build has tasks of modules: a module's eval set takes samples
 * of its own module's tasks alone (contracts/README.md of spec, «Eval sets»), and a sample of a
 * task of tutor would be refused there. */
export function purposes(set: TextSet, moduleTasks: boolean): Offered[] {
  const draft = set.status === "draft";
  const evalSet: Offered = draft
    ? { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetDraft }
    : moduleTasks && set.evalSet !== undefined
      ? { key: "evalSet", open: true }
      : { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetNoModule };
  return [
    {
      key: "measurement",
      open: true,
      ...(draft ? { note: PURPOSE_NOTES.measurementDraft } : {}),
    },
    evalSet,
  ];
}

/** The texts of a purpose in a set, if the set has them. */
export function textsOf(set: TextSet, purpose: PurposeKey) {
  return purpose === "measurement" ? set.measurement : set.evalSet;
}

/** The statements without which the person goes no further: the age, and the form — or, under a
 * draft, that the author writes their own samples. */
export function statements(set: TextSet, purpose: PurposeKey): string[] {
  const texts = textsOf(set, purpose);
  return texts ? [set.adult, texts.statement] : [set.adult];
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
  /** The writer's code, when the purpose has one: new, or typed and in shape. */
  readonly code?: string;
  /** Whether something was typed for a code that is not one. */
  readonly typed: boolean;
  /** Each statement, ticked or not. */
  readonly agreed: readonly boolean[];
}

/** What the start still lacks before writing, in a build with or without tasks of modules; none
 * when the person may begin. */
export function lacks(set: TextSet, moduleTasks: boolean, start: Start): string[] {
  const found: string[] = [];
  const open = purposes(set, moduleTasks).find(({ key }) => key === start.purpose)?.open ?? false;
  if (!start.purpose || !open) return [START_LACKS.purpose];
  if (start.purpose === "measurement" && start.code === undefined) {
    found.push(start.typed ? START_LACKS.codeShape : START_LACKS.code);
  }
  const asked = statements(set, start.purpose).length;
  if (start.agreed.length !== asked || start.agreed.some((on) => !on)) {
    found.push(START_LACKS.statements);
  }
  return found;
}
