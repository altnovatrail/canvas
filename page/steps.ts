// The steps before writing on the samples page (T20, T84 in RUN.md; R11, R58, R59 in
// docs/decisions.md; docs/architecture.md, section 3.6): which purposes the set of texts and the
// build's tasks open — a child's session among them — and why the others are closed, the
// statements each asks for, the writer's code the person types, and what the start still lacks.
// No DOM: page/main.ts shows what this decides, and every word is page/texts.ts's or the set's.

import type { TextSet } from "./sets.js";
import { PURPOSE_NOTES, START_LACKS } from "./texts.js";

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

/** The purposes under a set, for a build with or without tasks of modules, a child's session last.
 * A draft opens the measurement to the author's own samples alone and keeps the eval set and the
 * session closed. An approved set opens the eval set and the session where it has their texts —
 * the lawyer approves the adults' and a child's consent apart —, and the eval set only where the
 * build has tasks of modules too: a module's eval set takes samples of its own module's tasks
 * alone (contracts/README.md of spec, «Eval sets»), and a sample of a task of tutor would be
 * refused there. */
export function purposes(set: TextSet, moduleTasks: boolean): Offered[] {
  const draft = set.status === "draft";
  const closed = (key: PurposeKey, note: string): Offered => ({ key, open: false, note });
  let evalSet: Offered = { key: "evalSet", open: true };
  if (draft) evalSet = closed("evalSet", PURPOSE_NOTES.evalSetDraft);
  else if (set.evalSet === undefined) evalSet = closed("evalSet", PURPOSE_NOTES.noTexts);
  else if (!moduleTasks) evalSet = closed("evalSet", PURPOSE_NOTES.evalSetNoModule);
  let child: Offered = { key: "child", open: true };
  if (draft) child = closed("child", PURPOSE_NOTES.childDraft);
  else if (set.child === undefined) child = closed("child", PURPOSE_NOTES.noTexts);
  return [
    {
      key: "measurement",
      open: true,
      ...(draft ? { note: PURPOSE_NOTES.measurementDraft } : {}),
    },
    evalSet,
    child,
  ];
}

/** The texts of a purpose in a set, if the set has them. */
export function textsOf(set: TextSet, purpose: PurposeKey) {
  return { measurement: set.measurement, evalSet: set.evalSet, child: set.child }[purpose];
}

/** Whether a purpose's sample has a writer's code: the measurement's and a child's do, an eval
 * set's, which is published, does not (R09). */
export function hasCode(purpose: PurposeKey): purpose is "measurement" | "child" {
  return purpose !== "evalSet";
}

/** The statements without which the person goes no further: the age, and the form — a child's
 * parent's or guardian's for a session — or, under a draft, that the author writes their own
 * samples. */
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
export function lacks(set: TextSet, moduleTasks: boolean, start: Start): string[] {
  const found: string[] = [];
  const open = purposes(set, moduleTasks).find(({ key }) => key === start.purpose)?.open ?? false;
  if (!start.purpose || !open) return [START_LACKS.purpose];
  if (start.purpose === "child" && start.way === "new") {
    // A new code goes into the form first: a session begins with the code of a form accepted (R11).
    found.push(START_LACKS.childNew);
  } else if (hasCode(start.purpose) && start.code === undefined) {
    const child = start.purpose === "child";
    if (start.typed) found.push(child ? START_LACKS.childCodeShape : START_LACKS.codeShape);
    else found.push(child ? START_LACKS.childCode : START_LACKS.code);
  }
  const asked = statements(set, start.purpose).length;
  if (start.agreed.length !== asked || start.agreed.some((on) => !on)) {
    found.push(START_LACKS.statements);
  }
  return found;
}
