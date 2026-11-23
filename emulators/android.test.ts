// What the drivers of the Android emulator read off the screen: the nodes of a dump of
// uiautomator, where a tap on one lands, and where a point of the page lies on the screen; and how
// they ask adb for an emulator gone offline and bring it back, on a stand-in for adb. The run
// itself is the workflow's, on a runner with an emulator.

import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import {
  Android,
  calibrate,
  entities,
  find,
  focusedOn,
  inner,
  middle,
  nodes,
  PAGE_VIEW,
  pageView,
  placed,
} from "./android.ts";
import { Run } from "./run.ts";

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
  expect(all[2]).toEqual({
    text: "",
    description: "Open",
    bounds: [1200, 2300, 1500, 2400],
    className: "android.widget.Button",
  });
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
  // A button of 100 CSS pixels at (20, 300) in the page, 200 pixels wide at (40, 840) on the
  // screen.
  const toScreen = calibrate(
    { x: 20, y: 300, width: 100, height: 30 },
    { text: "", description: "", bounds: [40, 840, 240, 900] },
  );
  expect(toScreen(20, 300)).toEqual([40, 840]);
  expect(toScreen(70.4, 100)).toEqual([141, 440]);
});

test("the page's own view is found by its class, and a point of the page lies from its corner by the ratio", () => {
  // Chrome's toolbar above, the page's view below it, and in it the page's nodes, which may lag.
  const all = nodes(`<hierarchy>
<node text="" class="android.widget.FrameLayout" content-desc="" bounds="[0,0][2560,1600]">
<node text="" class="android.widget.ImageButton" content-desc="Close tab" bounds="[0,60][110,170]" />
<node text="" class="${PAGE_VIEW}" content-desc="" bounds="[0,180][2560,1550]">
<node text="Страница образцов" class="android.view.View" content-desc="" bounds="[30,200][900,260]" />
</node></node></hierarchy>`);
  const view = pageView(all);
  expect(view?.bounds).toEqual([0, 180, 2560, 1550]);
  if (!view) throw new Error("no view");
  // A ratio of 2: the page's (100, 50) is 200 and 100 device pixels from the view's corner.
  expect(placed(view, 2)(100, 50)).toEqual([200, 280]);
  expect(placed(view, 1.5)(10.3, 0)).toEqual([15, 180]);
  // A view with no area, or none at all, is no view.
  expect(
    pageView(nodes(`<node text="" class="${PAGE_VIEW}" content-desc="" bounds="[0,0][0,0]" />`)),
  ).toBeUndefined();
  expect(pageView([])).toBeUndefined();
});

/** A stand-in for the runner's adb: it writes each call's arguments to a file and answers
 * get-state with the state in another, failing as adb does for a device offline; a reconnection
 * brings the device back. */
function fakeAdb(state: string): {
  android: (adb?: string) => Android;
  calls: () => string[];
  done: () => void;
} {
  const folder = mkdtempSync(join(tmpdir(), "adb-"));
  const adb = join(folder, "adb");
  const log = join(folder, "calls.txt");
  const current = join(folder, "state");
  writeFileSync(current, state);
  writeFileSync(
    adb,
    [
      "#!/bin/sh",
      `echo "$*" >> "${log}"`,
      `if [ "$1" = reconnect ]; then echo device > "${current}"; fi`,
      'if [ "$1" = get-state ]; then',
      `  state=$(cat "${current}")`,
      '  [ "$state" = device ] || { echo "error: device $state" >&2; exit 1; }',
      "  echo device",
      "fi",
      "",
    ].join("\n"),
  );
  chmodSync(adb, 0o755);
  const run = new Run(join(folder, "run"));
  return {
    android: (other = adb) => new Android(run, other),
    calls: () => readFileSync(log, "utf8").trim().split("\n"),
    done: () => rmSync(folder, { recursive: true, force: true }),
  };
}

test("a device is online only when adb answers that it is one, and offline otherwise", () => {
  const up = fakeAdb("device");
  const down = fakeAdb("offline");
  try {
    expect(up.android().online()).toBe(true);
    expect(down.android().online()).toBe(false);
    expect(down.android(join(tmpdir(), "no-adb-here")).online()).toBe(false);
  } finally {
    up.done();
    down.done();
  }
});

const FORWARDS = [
  "forward tcp:9222 localabstract:chrome_devtools_remote",
  "reverse tcp:8080 tcp:8080",
  "reverse tcp:8081 tcp:8081",
];

test("a reset reconnects an emulator gone offline, waits for it, and sets the forwards before Chrome stops", async () => {
  const fake = fakeAdb("offline");
  try {
    const android = fake.android();
    await android.reset(["8080", "8081"], 0);
    expect(fake.calls()).toEqual([
      "get-state",
      "reconnect offline",
      "wait-for-device",
      ...FORWARDS,
      "shell am force-stop com.android.chrome",
    ]);
    expect(android.online()).toBe(true);
  } finally {
    fake.done();
  }
});

test("a reset of an emulator adb still has sets the forwards anew, which a lost connection took", async () => {
  const fake = fakeAdb("device");
  try {
    await fake.android().reset(["8080", "8081"], 0);
    expect(fake.calls()).toEqual([
      "get-state",
      ...FORWARDS,
      "shell am force-stop com.android.chrome",
    ]);
  } finally {
    fake.done();
  }
});
