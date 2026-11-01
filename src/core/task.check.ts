// Type-checked by ci-lint and never built: the task the element's check gives is a task of spec's
// type (R73 spec; R41), so a change of spec's shape that the check does not follow is a type error
// here rather than at app's junction with the element. The other way round does not hold: spec's
// types are flat, and only the check tells a sheet's task from a workbook's.

import type * as open from "@altnovatrail/spec/formatv0/open";
import type { CheckedTask, Task } from "./task.js";

declare const checked: CheckedTask;
declare const given: open.Task;

/** What the check gives is a task as spec's type has it, and as a consumer gives it. */
export const asSpec: open.Task = checked;
export const asGiven: Task = checked;
/** A task of spec's type is one a consumer may give: only its canvas lacks the element's tools. */
export const fromSpec: Task = given;

// @ts-expect-error A task of spec's type is no task the element checked: its kinds are not apart.
export const unchecked: CheckedTask = given;
