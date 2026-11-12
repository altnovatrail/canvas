# canvas — measurements and probes

> The results of `canvas`'s measurements and probes — what was measured or tried, how, on what and what came out, with the numbers (RULES.md, How we work; R143 spec). The documents that describe how things are built cite them by number, as a section: `measurements 1.1`, and [architecture.md](architecture.md) does not hold them. External facts with their quotes are in [sources.md](sources.md).
>
> A subsection's number does not change: a new one goes at the end of its section, a new section at the end of the file. Until T110 the probes of section 1 stood in architecture 4, under the same headings (RUN.md, T110).

## 1. Probes of browsers and devices

### 1.1. T29's probe

(architecture 2.4 and 3.6; R52; T29 in [RUN.md](../RUN.md)) — a run on 2026-11-08 of the pre-release `t29-probe` (the files' sha256 checked against the ones built: `t29-probe-csp.html` — a4278f1e…a235547, `t29-probe-open.html` — 89acda13…a8bb95):

- **Firefox 159.0 on Linux**, by the author's hand, the files from `~/Downloads`: the script ran, `isSecureContext` is yes, `getCoalescedEvents` is there, the `blob:` picture was shown, IndexedDB opened. Under the policy all four requests are `blocked`, with two events each from `connect-src` and `img-src`; without the policy, `failed`, with no events. The mouse's pressure is 0.5 with the button pressed and 0 without it, the width 1. Storage: `t29-probe-open.html` in the same folder has its own, the copy of `t29-probe-csp.html` in `~/Documents` an empty one, and after a restart of Firefox the original's turned out empty too. The reports went straight to `~/Downloads`, with no question, and the folder does not sync with a cloud;
- **Chromium**: the image's Chrome Headless Shell 156.0.8078.4, with a profile on disk: four steps, each a new launch of the browser with the same profile, and the files the same, downloaded from the pre-release. The script, the secure context, the picture, IndexedDB and the requests are as in Firefox. The record of `t29-probe-csp.html` is seen by `t29-probe-open.html` of the same folder and by a copy in another folder, and it survives a restart. The author did not run the ordinary Chrome on the host: storage and policy are the engine's code, shared with Chrome Headless Shell, and the sources name the default folder of downloads;
- **Firefox's sources**: the tag [FIREFOX_159_0_RELEASE](https://github.com/mozilla-firefox/firefox/tree/FIREFOX_159_0_RELEASE), read 2026-11-08:
  - a file's origin is its whole URL: if there is no host, `rv = aURI->GetAsciiSpec(aOriginNoSuffix);` (`caps/ContentPrincipal.cpp`, `GenerateOriginNoSuffixFromURI`), as long as `security.fileuri.strict_origin_policy` is `true` (`StaticPrefList.yaml`); otherwise "`file://UNIVERSAL_FILE_URI_ORIGIN`" for all files;
  - only the private mode and the partitioned storage of trackers keep `localStorage` in memory: "In private-browsing, LocalStorage keeps data in memory", "For Partitioned Trackers, we expose a partitioned LocalStorage, which doesn't share data with other contexts, and it's just in memory" (`dom/base/nsGlobalWindowInner.cpp`, `GetLocalStorage`);
  - clearing on shutdown: `privacy.sanitize.sanitizeOnShutdown` is `false`, `browser.privatebrowsing.autostart` is `false` (`StaticPrefList.yaml`). If clearing is on, it erases `file:` too: "We consider just permissions set for http, https and file URLs" (`browser/modules/Sanitizer.sys.mjs`). Why the author's record vanished was not checked: the probe does not read the settings of his Firefox;
  - downloads go to the downloads folder with no question: `pref("browser.download.useDownloadDir", true);` (`browser/app/profile/firefox.js`);
- **Chromium's sources**: the tag [156.0.8078.47](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/), read 2026-11-08: `registry->RegisterBooleanPref(prefs::kPromptForDownload, false, …)` (`chrome/browser/download/download_prefs.cc`): by default Chrome does not ask for the folder;
- **port 9** Chromium refuses by itself, `net::ERR_UNSAFE_PORT`, even without the policy: so the probe requests port 4 (R52).

### 1.2. T74's probe

(architecture 2.4 and 3.6; R54; T74 in [RUN.md](../RUN.md)) — the run [42506098435](https://github.com/altnovatrail/canvas/actions/runs/42506098435) of the workflow `emulators.yml` on 2026-11-08 on pull request #92, emulator 37.2.13, the image `system-images;android-36;google_apis;x86_64` of revision 7, Android 16, Chrome 133.0.6943.137, `pixel_tablet` 2560 × 1600:

- Chrome downloaded both files from the server on the runner, `http://10.0.2.2:8080`, with the headers of a GitHub release, with no question about the file's type or about HTTP; it asked only about notifications, at the first launch, and the driver answered "No thanks". The downloads went to `/sdcard/Download`;
- the file opened from Chrome's list of downloads, by its name, and in the run 42503595244 also by "Open" in the message about the download, in a tab over Chrome's window, with the URL `content://media/external/downloads/19`. The URL does not carry the file's name, and the probe writes the download's number in its place;
- the script ran, `isSecureContext` is yes, `getCoalescedEvents` is there, the `blob:` picture was shown, IndexedDB opened. Under the policy all four requests are `blocked`, with two events each from `connect-src` and `img-src`; without the policy, `failed`, with no events;
- pointers: a touch, `input touchscreen swipe`, is `touch`, 19 events and 68 intermediate ones; `input stylus swipe` is `pen`, 16 and 25. The pressure of both is 1, the width 1: the emulator gives no pen pressure (Д7);
- storage: the record of the page with the number 19 is seen by the page with the number 21, and it stayed after `am force-stop` of Chrome. "Save report" put `report-19.json` in `/sdcard/Download`, with no question;
- the browser's string in the report is "Linux; Android 10; K", though the system is Android 16;
- the run [42507671065](https://github.com/altnovatrail/canvas/actions/runs/42507671065), after the review, gave the same: all 15 steps ok in 5 minutes of the job, the pages with the numbers 17 and 21, the touch 16 events and 62 intermediate ones, the pen 14 and 29. The counts of events differ from run to run, and the rest is the same.

### 1.3. T80's probe

(architecture 2.4 and 3.6; R54; T80 in [RUN.md](../RUN.md)) — runs of the workflow `emulators.yml` on 2026-11-08 on pull request #93, iPad Pro 13-inch (M5), WebDriverAgent v16.15.3; the findings are by the run [42516361224](https://github.com/altnovatrail/canvas/actions/runs/42516361224) and the ones after it:

- **iPadOS 27.2** — the image `xcode-27`, Xcode 27.1, the runtime `iOS-27-2` — and **iPadOS 26.5** — `macos-26`, Xcode 26.6, the runtime `iOS-26-5` — alike:
  - Safari, on the file's URL from the server, asks "Do you want to download “t29-probe-csp.html”?", with "Download" and "Close", and no "View";
  - "Files" → "Browse" → "On My iPad" → "Downloads" → the file: Quick Look opens, with the file's name without `.html`. The page's markup and style are visible, and the first line is "The page's script did not run.": the script does not run. There is no `blob:` picture, only an empty frame. The buttons are visible, but do nothing;
  - a download pressed through WebDriverAgent reached Files once in eight; in the other runs the driver put the files in "Downloads", through the group container `group.com.apple.FileProvider.LocalStorage` (an amendment to R54). The Quick Look is the same one that opens a download, so the answer is about a download;
- **Safari 27.2 on macOS 26.7.2**, the image `macos-26`: `safaridriver` downloads both files to `~/Downloads` with no question, and `open -a Safari` opens them by `file:///Users/runner/Downloads/…` — the tabs are called "canvas file probe", that is, the markup was read — but the window on the runner does not render the page, neither from `~/Downloads` nor from a folder of its own. Whether the script runs, the runner does not show; AppleScript asks for consent: "hosted-compute-agent" wants access to control "Safari".

### 1.4. The workbook's template layer

(R36) — probes in the container on 2026-10-27, Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. The image has no other browsers: Playwright installs only `chromium_headless_shell` there, and WebKit was not tried.

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

## 2. The tokens Claude Code's sessions spend

A row is `just -f spec/justfile tokens-report --since <start> --until <end> --row` over the transcripts of this machine's sessions, after the pattern of measurements 1.9 spec; when an epic is archived, over the epic's window (RUN.md, «Как устроен план: эпики»; R145 spec). The first row is "before" the epic E13: all of `canvas`'s sessions until 2026-11-12T14:27, as `spec` measured them in measurements 1.9 spec; the next ones are E13's sessions (R77).

| Window, UTC | What | Sessions | Calls, main / subagents | Context of a call, k, main / subagents | Compactions | Cost at API prices |
|---|---|---|---|---|---|---|
| 2026-10-13T00:00 … 2026-11-12T14:27 | before E13 — measurements 1.9 spec | 37 | 12,565 / 7,897 | 369.1 / 114.8 | 99 | $2,040.66 |
