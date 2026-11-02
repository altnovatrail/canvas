// A point of a stroke and a stroke (R06, R09, R18, R27): spec's types, of the contract of canvas
// and app (R74 spec; R07) — where a point lies on the sheet, in logical units, when it was written
// and how hard the pointer pressed, and a stroke's ID on its sheet, its pointer's type and its
// points. Only a pen's pressure changes the width of the line (R05, R18).

export type { InkPoint, Stroke } from "@altnovatrail/spec/canvas";
