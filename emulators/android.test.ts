// What the drivers of the Android emulator read off the screen (T74, T78 in RUN.md; R54 in
// docs/decisions.md): the nodes of a dump of uiautomator, where a tap on one lands, and where a
// point of the page lies on the screen. The run itself is the workflow's, on a runner with an
// emulator.

import { expect, test } from "vitest";
import { calibrate, entities, find, focusedOn, inner, middle, nodes } from "./android.ts";

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

test("a swipe keeps to the middle half of a node, clear of the screen's edges", () => {
  expect(inner({ text: "", description: "", bounds: [32, 430, 2528, 950] })).toEqual([
    656, 560, 1904, 820,
  ]);
});

test("numeric entities are read too, as uiautomator writes a line break or a quote", () => {
  expect(entities("a&#10;b&#x27;c&amp;&#39;&bogus;")).toBe("a\nb'c&'&bogus;");
  expect(nodes('<node text="t29-probe-csp.html&#10;9.26 kB" bounds="[0,0][9,9]" />')[0]?.text).toBe(
    "t29-probe-csp.html\n9.26 kB",
  );
});

test("a text to find must be whole, where a pattern may match a part", () => {
  const all = nodes(DUMP);
  expect(find(all, "Write storage")?.bounds).toEqual([40, 900, 360, 1000]);
  expect(find(all, "Write")).toBeUndefined();
  expect(find(all, "Open")?.description).toBe("Open");
});

test("Chrome has the focus only when dumpsys window names its window as the current focus", () => {
  const chrome =
    "  mCurrentFocus=Window{9f2 u0 com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity}\n  mFocusedApp=ActivityRecord{1 u0 com.android.chrome/.Main}";
  const launcher =
    "  mCurrentFocus=Window{3a1 u0 com.google.android.apps.nexuslauncher/com.google.android.apps.nexuslauncher.NexusLauncherActivity}\n  mFocusedApp=ActivityRecord{2 u0 com.android.chrome/.Main}";
  expect(focusedOn(chrome, "com.android.chrome")).toBe(true);
  expect(focusedOn(launcher, "com.android.chrome")).toBe(false);
  expect(focusedOn("", "com.android.chrome")).toBe(false);
});

test("a point of the page lies on the screen as one element seen both ways says", () => {
  // A button of 100 CSS pixels at (20, 300) in the page, 200 pixels wide at (40, 840) on the screen.
  const toScreen = calibrate(
    { x: 20, y: 300, width: 100, height: 30 },
    { text: "", description: "", bounds: [40, 840, 240, 900] },
  );
  expect(toScreen(20, 300)).toEqual([40, 840]);
  expect(toScreen(70.4, 100)).toEqual([141, 440]);
});
