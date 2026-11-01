// Type-checked by ci-lint and never built: the task and the worked example the element's checks give
// are of spec's types (R73 spec; R41, R42), so a change of spec's shape that a check does not
// follow is a type error here rather than at app's junction with the element. The other way round
// does not hold: spec's types are flat, and only the check tells a sheet's task from a workbook's,
// and a part of the demo on the sheet from one beside it.

import type * as open from "@altnovatrail/spec/formatv0/open";
import type { CheckedExample, WorkedExample } from "./example.js";
import type { CheckedTask, Task } from "./task.js";

declare const checked: CheckedTask;
declare const given: open.Task;
declare const example: CheckedExample;
declare const lessons: open.WorkedExample;

/** What the check gives is a task as spec's type has it, and as a consumer gives it. */
export const asSpec: open.Task = checked;
export const asGiven: Task = checked;
/** A task of spec's type is one a consumer may give: only its canvas lacks the element's tools. */
export const fromSpec: Task = given;

// @ts-expect-error A task of spec's type is no task the element checked: its kinds are not apart.
export const unchecked: CheckedTask = given;

/** What the check of a worked example gives is a worked example of spec's type, as a consumer gives it. */
export const exampleAsSpec: WorkedExample = example;

// @ts-expect-error A worked example of spec's type is no example the element checked.
export const uncheckedExample: CheckedExample = lessons;
