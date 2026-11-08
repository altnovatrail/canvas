// What the driver of the Android emulator reads off the screen (T74 in RUN.md; R54 in
// docs/decisions.md): the nodes of a dump of uiautomator and where a tap on one lands. The run
// itself is the workflow's, on a runner with an emulator.

import { expect, test } from "vitest";
import { find, middle, nodes } from "./android.ts";

const DUMP = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation="0">
<node index="0" text="" resource-id="" class="android.widget.FrameLayout" content-desc="" bounds="[0,0][1600,2560]">
<node index="1" text="Write storage" class="android.widget.Button" content-desc="" bounds="[40,900][360,1000]" />
<node index="2" text="" class="android.widget.Button" content-desc="Open" bounds="[1200,2300][1500,2400]" />
<node index="3" text="Tom &amp; &quot;Jerry&quot;" content-desc="" bounds="[0,0][0,0]" />
<node index="4" text="no bounds" content-desc="" />
</node></hierarchy>`;

test("a dump gives each node with bounds its text, its description and its bounds, entities read", () => {
  const all = nodes(DUMP);
  expect(all.map(({ text }) => text)).toEqual(["", "Write storage", "", 'Tom & "Jerry"']);
  expect(all[2]).toEqual({ text: "", description: "Open", bounds: [1200, 2300, 1500, 2400] });
});

test("a node is found by its text or its description, and one with no area is never found", () => {
  const all = nodes(DUMP);
  expect(find(all, /^Write storage$/)?.bounds).toEqual([40, 900, 360, 1000]);
  expect(find(all, /^Open$/)?.description).toBe("Open");
  expect(find(all, /Jerry/)).toBeUndefined();
  expect(find(all, /^Save report$/)).toBeUndefined();
});

test("a tap lands in the middle of a node", () => {
  expect(middle({ text: "", description: "", bounds: [40, 900, 361, 1001] })).toEqual([201, 951]);
});
