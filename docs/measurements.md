# canvas — measurements and probes

> The results of `canvas`'s measurements and probes — what was measured or tried, how, on what and what came out, with the numbers. The documents that describe how things are built cite them by number, as a section: `measurements 1.1`, and [architecture.md](architecture.md) does not hold them. External facts with their quotes are in [sources.md](sources.md).
>
> A subsection's number does not change: a new one goes at the end of its section, a new section at the end of the file.

## 1. Probes of browsers and devices

### 1.1. The probe of a page from a file on a computer, 2026-11-08

A run on 2026-11-08 of the pre-release `t29-probe` (the files' sha256 checked against the ones built: `t29-probe-csp.html` — a4278f1e…a235547, `t29-probe-open.html` — 89acda13…a8bb95):

- **Firefox 159.0 on Linux**, by the author's hand, the files from `~/Downloads`: the script ran, `isSecureContext` is yes, `getCoalescedEvents` is there, the `blob:` picture was shown, IndexedDB opened. Under the policy all four requests are `blocked`, with two events each from `connect-src` and `img-src`; without the policy, `failed`, with no events. The mouse's pressure is 0.5 with the button pressed and 0 without it, the width 1. Storage: `t29-probe-open.html` in the same folder has its own, the copy of `t29-probe-csp.html` in `~/Documents` an empty one, and after a restart of Firefox the original's turned out empty too. The reports went straight to `~/Downloads`, with no question, and the folder does not sync with a cloud;
- **Chromium**: the image's Chrome Headless Shell 156.0.8078.4, with a profile on disk: four steps, each a new launch of the browser with the same profile, and the files the same, downloaded from the pre-release. The script, the secure context, the picture, IndexedDB and the requests are as in Firefox. The record of `t29-probe-csp.html` is seen by `t29-probe-open.html` of the same folder and by a copy in another folder, and it survives a restart. The author did not run the ordinary Chrome on the host: storage and policy are the engine's code, shared with Chrome Headless Shell, and the sources name the default folder of downloads;
- **Firefox's sources**: the tag [FIREFOX_159_0_RELEASE](https://github.com/mozilla-firefox/firefox/tree/FIREFOX_159_0_RELEASE), read 2026-11-08:
  - a file's origin is its whole URL: if there is no host, `rv = aURI->GetAsciiSpec(aOriginNoSuffix);` (`caps/ContentPrincipal.cpp`, `GenerateOriginNoSuffixFromURI`), as long as `security.fileuri.strict_origin_policy` is `true` (`StaticPrefList.yaml`); otherwise "`file://UNIVERSAL_FILE_URI_ORIGIN`" for all files;
  - only the private mode and the partitioned storage of trackers keep `localStorage` in memory: "In private-browsing, LocalStorage keeps data in memory", "For Partitioned Trackers, we expose a partitioned LocalStorage, which doesn't share data with other contexts, and it's just in memory" (`dom/base/nsGlobalWindowInner.cpp`, `GetLocalStorage`);
  - clearing on shutdown: `privacy.sanitize.sanitizeOnShutdown` is `false`, `browser.privatebrowsing.autostart` is `false` (`StaticPrefList.yaml`). If clearing is on, it erases `file:` too: "We consider just permissions set for http, https and file URLs" (`browser/modules/Sanitizer.sys.mjs`). Why the author's record vanished was not checked: the probe does not read the settings of his Firefox;
  - downloads go to the downloads folder with no question: `pref("browser.download.useDownloadDir", true);` (`browser/app/profile/firefox.js`);
- **Chromium's sources**: the tag [156.0.8078.47](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/), read 2026-11-08: `registry->RegisterBooleanPref(prefs::kPromptForDownload, false, …)` (`chrome/browser/download/download_prefs.cc`): by default Chrome does not ask for the folder;
- **port 9** Chromium refuses by itself, `net::ERR_UNSAFE_PORT`, even without the policy: so the probe requests port 4.

### 1.2. The probe of a page from a file on the Android emulator, 2026-11-08

The run [42506098435](https://github.com/altnovatrail/canvas/actions/runs/42506098435) of the workflow `emulators.yml` on 2026-11-08 on pull request #92, emulator 37.2.13, the image `system-images;android-36;google_apis;x86_64` of revision 7, Android 16, Chrome 133.0.6943.137, `pixel_tablet` 2560 × 1600:

- Chrome downloaded both files from the server on the runner, `http://10.0.2.2:8080`, with the headers of a GitHub release, with no question about the file's type or about HTTP; it asked only about notifications, at the first launch, and the driver answered "No thanks". The downloads went to `/sdcard/Download`;
- the file opened from Chrome's list of downloads, by its name, and in the run 42503595244 also by "Open" in the message about the download, in a tab over Chrome's window, with the URL `content://media/external/downloads/19`. The URL does not carry the file's name, and the probe writes the download's number in its place;
- the script ran, `isSecureContext` is yes, `getCoalescedEvents` is there, the `blob:` picture was shown, IndexedDB opened. Under the policy all four requests are `blocked`, with two events each from `connect-src` and `img-src`; without the policy, `failed`, with no events;
- pointers: a touch, `input touchscreen swipe`, is `touch`, 19 events and 68 intermediate ones; `input stylus swipe` is `pen`, 16 and 25. The pressure of both is 1, the width 1: the emulator gives no pen pressure (Д7);
- storage: the record of the page with the number 19 is seen by the page with the number 21, and it stayed after `am force-stop` of Chrome. "Save report" put `report-19.json` in `/sdcard/Download`, with no question;
- the browser's string in the report is "Linux; Android 10; K", though the system is Android 16;
- the run [42507671065](https://github.com/altnovatrail/canvas/actions/runs/42507671065), after the review, gave the same: all 15 steps ok in 5 minutes of the job, the pages with the numbers 17 and 21, the touch 16 events and 62 intermediate ones, the pen 14 and 29. The counts of events differ from run to run, and the rest is the same.

### 1.3. The probe of a page from a file on the iPad Simulator and Safari on macOS, 2026-11-08

Runs of the workflow `emulators.yml` on 2026-11-08 on pull request #93, iPad Pro 13-inch (M5), WebDriverAgent v16.15.3; the findings are by the run [42516361224](https://github.com/altnovatrail/canvas/actions/runs/42516361224) and the ones after it:

- **iPadOS 27.2** — the image `xcode-27`, Xcode 27.1, the runtime `iOS-27-2` — and **iPadOS 26.5** — `macos-26`, Xcode 26.6, the runtime `iOS-26-5` — alike:
  - Safari, on the file's URL from the server, asks "Do you want to download “t29-probe-csp.html”?", with "Download" and "Close", and no "View";
  - "Files" → "Browse" → "On My iPad" → "Downloads" → the file: Quick Look opens, with the file's name without `.html`. The page's markup and style are visible, and the first line is "The page's script did not run.": the script does not run. There is no `blob:` picture, only an empty frame. The buttons are visible, but do nothing;
  - a download pressed through WebDriverAgent reached Files once in eight; in the other runs the driver put the files in "Downloads", through the group container `group.com.apple.FileProvider.LocalStorage`, as it does whenever the downloads are not in place, and writes so in the findings. The Quick Look is the same one that opens a download, so the answer is about a download;
- **Safari 27.2 on macOS 26.7.2**, the image `macos-26`: `safaridriver` downloads both files to `~/Downloads` with no question, and `open -a Safari` opens them by `file:///Users/runner/Downloads/…` — the tabs are called "canvas file probe", that is, the markup was read — but the window on the runner does not render the page, neither from `~/Downloads` nor from a folder of its own. Whether the script runs, the runner does not show; AppleScript asks for consent: "hosted-compute-agent" wants access to control "Safari".

### 1.4. The workbook's template layer

Probes in the container on 2026-10-27, Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. The image has no other browsers: Playwright installs only `chromium_headless_shell` there, and WebKit was not tried.

- The box's border is 1 CSS px, `#111` on white, `vector-effect: non-scaling-stroke`. The conditions:
  - 24 boxes;
  - sheet widths of 414, 700 and 1000 CSS px;
  - a `viewBox` with offsets of 0, 0.37, 13.5 and 101.73 units;
  - 1152 edges per density.

  The result:
  - with `shape-rendering: crispEdges` the lightest edge is 18.9:1 at the densities 1, 1.25, 1.5 and 2. The thickness is 1 device pixel at 1, 1–2 at 1.25 and 1.5, 2 at 2;
  - the antialiased border is 3.59:1 at 1, 5.41 at 1.25, 8.59 at 1.5 and 18.9 at 2.
- The reset of what is inherited: a copy of the layer in an open shadow root. The ancestor's hostile styles:
  - spacing, bold, italic, `text-transform`, `font-size` and `font-size-adjust`;
  - `direction: rtl` and `dir=rtl` on the page;
  - `text-anchor`, `dominant-baseline` and `baseline-shift`;
  - `fill`, `stroke`, `paint-order` and `-webkit-text-stroke`;
  - `font-feature-settings`, `font-kerning`, `white-space` and `text-size-adjust: 300%`.

  The result:
  - `all: initial` and five restorations leave the default computed values on `<text>`;
  - the start of the first character and the end of the last, `getStartPositionOfChar` and `getEndPositionOfChar`, are where the layout puts them. So in Liberation Sans, Serif and Mono, at `k` 0.414 and 1, at the densities 1 and 2. In the element's test a lone «м» in Serif ends 0.04 of a unit farther;
  - the width of `getBBox` at `k` 0.414 in Serif departs from the one set by up to 2.08 units.
- In the forced colors mode, without an explicit `fill` and `stroke`, the printed text keeps the theme's ink color: SVG keeps its parent's color, `svg|svg { forced-color-adjust: preserve-parent-color; }` (above).
- `scrollIntoView` of an item below the visible part, on a copy of the scene: a sticky visible part with `overflow: clip` and a `viewBox` that follows the scrolling. The container scrolls at once, and the item comes into the visible part two frames later, when the new `viewBox` is set. So for `<g>`, `<text>` and `<rect>`, and with `focus()`.
- An inherited `writing-mode: vertical-rl` lays the scene on its side, and `scrollIntoView` scrolls nothing. `:host { writing-mode: horizontal-tb }` returns everything to how it is without it, and `writing-mode` in the host's own style is stronger than `:host`.
- `Accessibility.getFullAXTree` with the `frameId` of a frame from `Page.getFrameTree` gives the tree of an iframe of the same origin through the session of the whole page. So the test takes the tree of the frame `vitest-iframe` through `cdp()`. The tree's nodes have no language.

### 1.5. The element in WebKit and Firefox

The element's tests and probes of their own in the container on 2026-11-14, through Playwright 1.65.0 and Vitest 5.1.0: WebKit 2388 and Firefox 159.0 (revision 1572), downloaded by `npx playwright install` into the scratchpad, with the libraries of the `toolchain` stage of v0.17.4 from the Ubuntu snapshot `20261021T000000Z`, beside Chrome Headless Shell 1254 of the image. The image of CI brings the same revisions ([`browsers.json` of Playwright v1.65.0](https://github.com/microsoft/playwright/blob/v1.65.0/packages/playwright-core/browsers.json)).

- **The first run**: 549 tests of the projects `browser` and `forced colors`, 89 failed. 78 failed on `browserContext.newCDPSession: CDP session is only available in Chromium`: real input — a mouse, a pen, touches — through `Input.dispatchMouseEvent` and `Input.dispatchTouchEvent`, Chromium's own accessibility tree and `Emulation.setEmulatedMedia`. The other 11 are the findings below. After the element's changes for WebKit and Firefox: 483 passed and 66 skipped — those that need the protocol — in two full runs in a row.
- **The language in a shadow tree.** A host with `lang="ru"` and a shadow tree without `lang`: in Chromium a span of the tree matches `:lang(ru)`, and after `host.lang = "en-GB"` it matches `:lang(en)`. In WebKit it matches `:lang(ru)`, and after the change still not `:lang(en)`. In Firefox it matches neither. A node of the tree with a `lang` of its own matches it in all three. HTML has a node whose parent is a shadow root take the language of its host, so the two are the engines' faults, and the element answers them by a `lang` of its own on each labelled node of its shadow tree.
- **The system's colours in forced colours.** In a context with `forcedColors: "active"`, Firefox gives `Highlight` and `HighlightText` as `rgb(51, 153, 255)` and white, 2.94:1, and `SelectedItem` and `SelectedItemText` the same; `ButtonText` on `ButtonFace` 17.34:1, `CanvasText` on `Canvas` 21:1, `AccentColor` and `AccentColorText` 5.62:1. axe's `color-contrast` finds the selected tool of the row, in `Highlight` and `HighlightText`, below 4.5:1 in Firefox and not in Chromium. WebKit has no forced colours to emulate.
- **The scroll offset after a zoom.** At 400 CSS px, `scrollTop` 300 and then a zoom to 1.5, the top of the visible part is 748.75 units in WebKit instead of 750: WebKit scrolls by whole pixels, 0.75 CSS px off at `k` 0.6. Chromium and Firefox keep it within 0.5 of a unit.
- **The glyphs' box.** `getBBox().width` of a `<text>` of the print departs from the advance the layout sets by up to 3.66 units in a long run of ".x" and by 4.19 in a "(" alone, in Liberation Sans at a size of 30 units, in Firefox; in Chromium and WebKit by less than 3. The start and the end of the characters, `getStartPositionOfChar` and `getEndPositionOfChar`, are within 0.05 of a unit in all three.
- **`scrollIntoView` of an SVG group.** A `<g>` with `transform="translate(0 900)"` in an SVG 200 px high inside a container scrolled by `overflow: auto` is brought into view by all three engines, in a sticky box with `overflow: clip` too; `position: sticky` with `overflow: hidden` is brought by none. An item of the workbook's list — a `<g>` with no transform, its `<text>` and `<rect>` placed by their own coordinates — Firefox brings into view not at all, `scrollTop` 0, while its `<text>` and `<rect>` it brings, 191 and 203 px; Chromium and WebKit scroll by 200 for the group.
- **The keys.** Once in the first full run, under the load of both engines at once, a step of the test of Page Down, End, Home, the arrow down, Page Up and space came before Firefox's smooth scroll of the step before had ended: the test waited for `scrollend` or a second. In seven runs after, alone and in full, it did not come back.

### 1.6. `scrollIntoView` of a workbook item placed by `transform` or as an `<svg>`

A probe of its own in the container on 2026-11-16, through Playwright 1.65.0 and Vitest 5.1.0, in the image's Chrome Headless Shell 1254, WebKit 2388 and Firefox 159.0 (revision 1572): a workbook of 20 short lines in an element 414 × 500 CSS px, its last item `<g role="listitem" transform="translate(520 1228)">`, the number, the text and the box placed from the item's origin, brought by `scrollIntoView({ block: "nearest" })` from below the visible part, which ends at 500 px.

- **Chromium and WebKit** scroll by 200 and 203 px, and the item's bottom stands at 499.8 px, the whole item in sight; its `<rect>` brings the same.
- **Firefox** scrolls by 161.4 px: the item's top, 660.9 px before, stands at 499.5, and its bottom at 541.9, below the edge. `block: "end"` scrolls by the same 161.4, and a transparent `<rect>` of the item's size as the group's first child changes nothing: Firefox brings a group into view as a point at its origin, which measurements 1.5 saw as no scroll at all while the origin was the layer's: placed by `transform`, the item comes only to the edge, 0.5 px of it in sight. The item's `<text>` it brings by 191.3 px, its `<rect>` by 203.3.
- **A nested `<svg>`** in the group's place — `x="520" y="1228" width="440" height="100" overflow="visible"`, the parts in it — Firefox scrolls by 202.8 px, the whole item; with no `width` and `height` by 232.6. Chromium and WebKit scroll by 200 and 203 for both. Firefox's `getBoundingClientRect()` of that `<svg>` is not the item's box: 152.5 to 702.8 px before the scroll, where the group's is 660.9 to 703.3. With every item of the list so, the parts' own boxes are where the group put them in all three — a box's `<rect>` 660.9 px from the top in Firefox, as in the group —, the box comes whole into Firefox's visible part, 458.1 to 500.5 px, and axe-core finds nothing on the element by the tags of `axe.fixture.ts` in any of the three. Firefox's own accessibility tree of it was not read: Playwright gives no protocol session there.
- **In the element**, with every item an `<svg>` of the place and size `PageItem` gives, as the element now draws its items: the test of `workbook.test.ts` brings the last item and its text into view, in a page written horizontally and vertically, and in Chromium, WebKit and Firefox the item's parts stand whole within the visible part, under the row; the element's tests, axe-core's among them, pass in all three engines.

### 1.7. The tool bar against the interface mockup

A probe of its own in the container on 2026-11-17, through Playwright 1.65.0, in the image's Chrome Headless Shell 1254, WebKit 2388 and Firefox 159.0 (revision 1572): `node spec/tools/mockup/serve.mjs` of `spec` v0.18.6, and beside it a page of `demo/`'s Vite with one element as tall as the window, a squared sheet or a workbook with the pen and the eraser, the page put in pen mode by a pen's `pointerdown` and `navigator.maxTouchPoints` 5. The states where the mockup shows the bar — `task-pill`, `task-empty`, `workbook-not-yet` and `essay-feedback` on `phone` and `ipad`, and `task`, `choice`, `workbook` and `essay` on `ipad` —, 390 × 844 and 1194 × 834 CSS px, `reducedMotion: "reduce"`.

- **The mockup's runtime**: every state reaches `data-ready="true"` in all three engines, with no error or warning in the console and no failed request. The bar of the three engines is the same box — 16, 242, 52 × 350 on the iPad, 16, 247 on the phone, radius 26, `rgba(255, 255, 255, 0.76)` with `blur(22px) saturate(1.8)` — and of the whole `#frame` 0.6–2.9 % of the pixels differ by more than 16 of 255 between Chromium and WebKit and 1.3–6.3 % between Chromium and Firefox: the system font's lines and the text's metrics, which move the cards by up to 4 px; the bar and its buttons are the same pixels. No failure of the runtime and no difference of the engines' bars, so no row «в реестр spec».
- **The element against the mockup**, in 36 pairs: the bar's box, its radius and its fill are the mockup's to the pixel in every engine and size, and so are the seven buttons, each 44 × 44 at the mockup's offsets from the bar's top — 4, 50, 96, 142, the line, 199, 245, the line, 302. The tool in use is the accent at 12 % in both. The page is as wide as the window. What differs is by the documents: the icons are Material Symbols, by `spec`'s choice of icons for UI packages, not the mockup's inline SVG, and «Clear» is `delete-sweep` by `spec`'s table of which icon each button's value shows; «Draw with finger» is the pen mode's button, there while the finger does not draw, where the mockup draws a switch pressed. The side-by-side crops stayed in the session's scratchpad, as the snapshots the mockup's look was approved by did.
- **A worked example's row against the mockup's**, the state `example` on the phone and the iPad, in the three engines, the same day, with a `<button slot="actions">` styled as the mockup's «Continue»: the row's middle is the element's, 0 px off — 0.2 in WebKit, in both —, its bottom 16 px above the window's, 56 high, radius 28, padding 6, the same glass, and a line before the slot's button, as the iPad's mockup has. Next is 77 px wide where the mockup's is 76, and Demo 86 where it is 82: the element's icons are 20 px, the mockup's 17. On the phone the mockup stretches its row to the screen less 24 px; the element's is as wide as its buttons. The zoom's pair stands on the vertical bar, 52 × 98, where the mockup has no bar on an example. The earlier 36 pairs, run again after the rail's measuring, were the mockup's still. After the merge the tooltip's fill is opaque, `#1d1d1f`, where the mockup's is `rgba(29,29,31,0.92)`: seen through over the canvas, it left axe's contrast «incomplete»; the pairs compared no tooltip.

### 1.8. Apple Pencil Pro on an iPad: its pressure, and a selection that took the pen, 2026-11-24

The author's iPad with Apple Pencil Pro, Chrome (WebKit), on a page of `spec`'s coordinator that reads the `pressure` of every pen event, the coalesced ones too, as the table of `demo/` does. Ordinary writing, a hard press and a light one came one after another, with no reset between them: the series are not apart, and only these summary numbers were kept, no stroke.

- **All 62 strokes**: the median 0.09, the tenth 0.02, the ninetieth 0.14, the highest 0.20; 60 % of the points below 0.1.
- **The last stroke, a light one**: the median 0.01, the tenth 0.00, the ninetieth 0.02, the highest 0.08; every point below 0.1.

So the pen's pressure in WebKit lies in about 0–0.2, not 0–1.

- **A selection that took the pen**, by the author on the same iPad, writing on a task from a photo in `app` with the element as it was then: now and then a small blue rectangle of the system's selection came up by the bar, beside the grid's button, with a dot in it, and the selection's menu of WebKit — Copy, Writing Tools, Search with Google and the like —, with Scribble off in the settings too, after a quick double tap or a long press of the pen, the way a dot or an equals sign is written. While Scribble was on, the stroke before the rectangle went; once the menu had been opened, the sheet wrote nothing until another task and back. By the element's code then, that is a sheet waiting for the lift of a pen of which neither `pointerup`, `pointercancel` nor a loss of capture came, while the pen's next touch came under another ID.

## 2. The tokens Claude Code's sessions spend

A row is `just -f spec/justfile tokens-report --since <start> --until <end> --row` over the transcripts of this machine's sessions, after the pattern of measurements 1.9 spec; when an epic is archived, over the epic's window. The first row is "before" the epic E13: all of `canvas`'s sessions until 2026-11-12T14:27, as `spec` measured them in measurements 1.9 spec; the next ones are E13's sessions.

| Window, UTC | What | Sessions | Calls, main / subagents | Context of a call, k, main / subagents | Compactions | Cost at API prices |
|---|---|---|---|---|---|---|
| 2026-10-13T00:00 … 2026-11-12T14:27 | before E13 — measurements 1.9 spec | 37 | 12,565 / 7,897 | 369.1 / 114.8 | 99 | $2,040.66 |
| 2026-11-12T20:15 … 2026-11-12T22:00 | E13: the session of the move to `spec`'s line 0.16 — the move, the rebuild and the translation of `docs/` by 17 subagents and its blind reading by 4 —, until its pull request | 1 | 286 / 635 | 222.8 / 98.1 | 1 | $66.94 |

## 3. The speed of CI

### 3.1. The emulators' iPad jobs before and after the cache of WebDriverAgent, 2026-11-12 and 2026-11-16

The times GitHub gives each job and step, `gh api repos/altnovatrail/canvas/actions/runs/<run>/jobs`, and the artifacts' `phases.txt`, `versions.txt` and WebDriverAgent's log, 2026-11-12 and 2026-11-16.

| Run | What | iPad 27, s | iPad 26.5, s | Of them |
|---|---|---|---|---|
| `emulators.yml` [43316532085](https://github.com/altnovatrail/canvas/actions/runs/43316532085) | before, the run of measurements 3.1 spec | 712 | 411 | iPad 27: 177 s of WebDriverAgent's log silent after Safari's session |
| `emulators.yml` [43798027512](https://github.com/altnovatrail/canvas/actions/runs/43798027512) | before, `main`'s code (pull request #131) | 811 | 874 | the build of WebDriverAgent 157 s and 242 s; the upload of the artifact 150 s and 73 s; the job's end 37 s and 23 s |
| `emulators.yml` [43810305338](https://github.com/altnovatrail/canvas/actions/runs/43810305338) | with the cache of WebDriverAgent, a miss | 1082 | 767 | the build 513 s and 305 s; the stop 5 s and 8 s; the save 43 s and 3 s; the upload 4 s and 2 s; the job's end 3 s and 2 s |
| `emulators.yml` [43812391731](https://github.com/altnovatrail/canvas/actions/runs/43812391731), attempt 1 | the cache with the review's fixes, a miss | 837 | 698 | the stop 10 s and 8 s; the save 7 s and 2 s |
| `emulators.yml` [43812391731](https://github.com/altnovatrail/canvas/actions/runs/43812391731), attempt 2 | the same, a hit | 444 | 590 | no clone and no build; the stop 17 s and 7 s; the upload 2 s and 1 s |
| `page.yml` [43799577739](https://github.com/altnovatrail/canvas/actions/runs/43799577739) | before, a push to `main` | — | 552 | the pages' copies 16 s after the boot |
| `page.yml` [43810310421](https://github.com/altnovatrail/canvas/actions/runs/43810310421), [43812398914](https://github.com/altnovatrail/canvas/actions/runs/43812398914) | with the copies before the boot, by hand on the branch | — | 575, 529 | the copies and servers 1 s, before the boot; `safaridriver --enable` and its start 69 s and 71 s in the first |

- **The detection of the active app.** WebDriverAgent's log has "Cannot precisely detect the current application" 3 times in run 43316532085 and 2 times in each iPad job of run 43798027512; in no job of the runs with the cache. The silence after Safari's session, before the first "Find the Application": 177 s, then 57 s and 75 s before; 65 s and 30 s on the miss and 42 s on iOS 27 on the hit after.
- **The entries** of the cache are 5.7–6.3 MB each.
- **Not measured apart:** the runners' own spread is as large as a gain of tens of seconds — the boot of the simulator took 95–179 s in these runs, the build of WebDriverAgent 157–513 s, and the samples page's iPad job came out no faster within it. The Android job of `emulators.yml` failed in the first two attempts of run 43812391731 on "System UI isn't responding" in the emulator and passed in the third, 352 s; neither it nor its files changed with the cache.
- **A loaded runner.** In run [43816134598](https://github.com/altnovatrail/canvas/actions/runs/43816134598), on the code with the cache, a hit, iPad 27 failed in 1112 s: the simulator booted in 179 s, `xcodebuild -xctestrun` wrote its first line 8 min after it — 83 s in the hit before —, and `simctl io screenshot` failed in the probe. Hence the start's wait is ten minutes by the clock, not 120 tries.
