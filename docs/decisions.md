# canvas decision log

> Why canvas is built the way it is. Each entry: what was decided, why, what was rejected, and in its tail "— *Consequence:*" the files, by their paths, that a change of it edits.
>
> **Rule:** do not propose again what was rejected without new facts. If a decision has to change, ask the author and rewrite its entry in its place, and every entry the change touches: an entry is its text in force — what was decided, why, what was rejected and what a change of it edits —, git keeps the old text, and the commit says why. An entry's number stands in its heading alone: an entry cites no other entry and no section, says in words what it rests on, and carries no date of who decided it and no amendment; a claim about the outside world cites its one record of [sources.md](sources.md).
>
> The repository was set up 2026-10-19 from the template of `spec` v0.1.0. How it comes to differ from the template — tools in the devcontainer, rules in RUN.md — is recorded here as a decision. Next number — R91.
>
> Open questions that concern several repositories — О-, П-, Т- — are in the registers of `spec`, in `spec/docs/product.md`, `spec/docs/privacy.md` and `spec/docs/repositories.md`. What is still to decide in the component itself is in [architecture.md](architecture.md).

## `spec` tag

**R01. `canvas` is on `spec` v0.2.9: the submodule `spec/` is at this tag, the links to `spec` pinned to a tag name it, and what came from the template is as in the template v0.2.9. The documents are checked by `just -f spec/justfile docs-check-repo`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.1.0 v0.2.9`, read 2026-10-20; `spec`'s row Д6):
  - `spec`'s decision on the samples page for the first measurement; `canvas`'s card in `spec/docs/architecture.md` says the same. By their recommendations, it settled all three rows «в реестр spec» that the setting up of the repository opened — В1–В3, which are В15–В17 in `spec`'s plan:
    - there is no hosting: the build is downloaded from the release of `canvas` and opened on the volunteer's device. So nobody's logs see the volunteer's IP address, and they open the pull request on GitHub anyway; GitHub sees the download itself too, and this refinement of `spec`'s decision is В4. The page will move to the hosting of the build of `app` when that appears (Т-17);
    - children's samples are made with the same page, but without a pull request; where the file goes and who has access to it, П-10 and П-12 decide;
    - the tasks and media files the page's build takes from the release of `modules` through the CLI of `module-kit`. The CI of `canvas` takes them by exact tag — a CI tool's link to a release, not a dependency at build time — and the package still knows no subjects.

    [architecture.md](architecture.md) holds the detail. The decision does not diverge from what the detailing of `canvas` was going to decide: the detailing of the sample file still decides what the page asks and what it writes to the file, and also how a child sample differs from an adult's. One thing `spec`'s decision does not say: a child sample has no pull request, and the argument about the IP address does not fit it — this is В4, «в реестр spec». Children's samples do not go to the AI provider until П-3 has given an agreement that admits children: the detailing of the sample file and [architecture.md](architecture.md) name this;
  - `spec` closed Т-7 in its part about the API: the contract `app` ↔ `api` and the observation are on protobuf and buf, and what stays open in Т-7 is the module format. The contracts themselves are written by `spec`'s epic E3. So the detailing of the sheet's coordinates and [architecture.md](architecture.md) give the contract and the observation as decided by `spec` and its E3, not as Т-7. Where the code takes the types of `spec` from the generated packages of its releases, Т-7 stays: the open view of a task is part of the module format;
  - the term "accessibility" of `spec`'s glossary: it is not the unlocking of a skill and not access to content. [architecture.md](architecture.md) uses it, and so does the detailing of the drawing engine;
  - the repository's documents are checked by the `docs-check` of the `spec` its submodule is on: the links, its own sections and log, the tables «В» and «Д», and the citations of `spec` against the submodule at its tag. An example of a citation is written in inline code, so that the check does not take it for a citation;
  - the CI checks are the same in all repositories, and `canvas` has them even before its code: secret scanning, DCO, CodeQL, Scorecard and the documents check — the shared checks from `.github`. All the checks but Scorecard hold the merge, the quality gate of SonarCloud among them, and merging is by merge commit only. A session of `spec`, not a task of this repository, connects them: it writes the CI files here — the calls of the shared workflows, `dependabot.yml`, `.sonarcloud.properties` with the exclusion `spec/**` (`spec`'s row Д7) — and sets the ruleset of the branch `main`. Until then `canvas` has no shared checks;
  - before a new task, close the findings of SonarCloud, CodeQL and Scorecard on the last one — `spec`'s decision and a new rule of RUN.md. A finding that a change cannot close stays open, and its reason is recorded: one common to all repositories in `spec`'s log, one of its own in this log;
  - the release of `spec` comes out by itself, after green CI on `main`: the next patch of the line, immutable, with GitHub's attestation. The repository still moves to a new tag by a task of its own;
  - the shared rules: an example of a citation is written in code, and a development or CI tool that ships nowhere and puts none of its own code into what ships may also carry another OSI-approved license, or free terms for open source, but only as a named exception: in the license check or in the decision that brings it in. This concerns the tools of the future code of `canvas`;
  - the shared release workflow with a signature comes with the first code of `module-kit`, and what checks its signature of a package or of a build, Т-27 decides. This is an input of the detailing of the package's interface and release: it decides whether that workflow signs the releases of the `canvas` package;
  - `spec`'s decisions about other components, Т-28 and П-17: the success corridor, the key for eval and where it lies, one account for an adult and their children, the generator of randomness, the types of the graph, the reason codes. They change no documents of `canvas` beyond those named above: the samples from the samples page are run to the AI provider by `tutor`, with a separate key of the platform for eval;
  - devcontainer — the base image `devcontainers/base` 3.0.10 by its digest; Claude Code is installed without the packages' scripts, its `install.cjs` is run by name, and `claude --version` stops the build on the stub; `git.alwaysSignOff` — a commit from Source Control is signed off, as the DCO check needs. The comment on the installation of Claude Code in the Dockerfile of `spec` is inexact: without `install.cjs`, what stays in place of the CLI is not a Node wrapper but a stub of 500 bytes, which writes "Error: claude native binary not installed." and exits with code 1 (`bin/claude.exe` of the package `@anthropic-ai/claude-code@2.1.280` from the npm registry, read 2026-10-20). The Dockerfile here is a copy of that of `spec`, so the fix goes there — В5, the same question as `module-kit`'s В2.
- **What is changed here:**
  - `spec/` — at v0.2.9, commit 5eafb1a. The links to `spec` in README.md and the tag in CLAUDE.md and RUN.md — v0.2.9. That the repository was set up from the template v0.1.0, the start of the log still says: it is history;
  - the five examples of citations of the old template — in inline code: two in CLAUDE.md's list of the documents, two in «Ссылки» of RUN.md and one at the start of the log. RUN.md's rule of checks and CLAUDE.md's environment name `docs-check-repo`, and RUN.md's rule of closing the findings is new. These places are as in the template v0.2.9;
  - `.devcontainer/` — the one that the recipe of `spec` v0.2.9 (`editDevcontainer`) builds for `canvas` of the kind `typescript`. The names of the container and of the network and `postStartCommand` are its own, as on v0.1.0, and the kind `typescript` has no extensions of its own. The move introduces no differences from the template;
  - what the tag decided for `canvas` is named in its documents: RUN.md — its questions without В1–В3, its opening saying what closed them, the new rows В4 and В5, and the order, scope and task bodies of the epic E1; CLAUDE.md, where it describes the component; [architecture.md](architecture.md).

— *Why now:* a session of `spec` connects the shared checks from `.github` here, and among them the required "Documents / docs-check-repo". The shared `documents.yml` builds the stage `toolchain` from the `.devcontainer/Dockerfile` of whoever called it and runs `just -f spec/justfile docs-check-repo` in it ([`documents.yml`](https://github.com/altnovatrail/.github/blob/ff2a359/.github/workflows/documents.yml), release v0.1.0 of `.github` — the latest as of 2026-10-20, commit ff2a359, read 2026-10-20). And `spec` has this recipe only since v0.2.3: on v0.1.0 the required check would be red and would hold any merge. v0.2.9 is the latest release of `spec` as of 2026-10-20, and immutable (`gh release view -R altnovatrail/spec`); `gh release verify v0.2.9 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit 5eafb1a. `spec`'s row Д6 also says to take the latest release at the time of the task.

— *Rejected:*
- to stay on v0.1.0 until the first code: the required documents check would hold any merge, the detailing of the sample file would go by the questions В1–В3, which are already decided, and a citation of a section of `spec` that is not at the tag, or a gap in the log, would pass unnoticed (`spec`'s row Д6);
- v0.2.3–v0.2.8: they have `docs-check-repo`, but the template's RUN.md has no rule of closing the findings until v0.2.7 and `spec` no decision on it until v0.2.8, and Д6 says to take the latest release at the time of the task;
- to move without the devcontainer, or to carry over its changes selectively: the container of `canvas` is the container of `spec`, and a difference would have to be recorded as a decision, and there is no reason for one;
- examples of citations in guillemets, as before: `docs-check-repo` checks a number in guillemets against the log, and `spec` rejected not checking them.

— *Consequence:* RUN.md — its questions, with the new rows В4 and В5, both «в реестр spec», and the epic E1; CLAUDE.md; README.md; `.devcontainer/`, whose image is not built here until Rebuild Container — Д1; [architecture.md](architecture.md).

## The work plan

**R02. The handwriting sheet and the samples page — the epic E2 beside E1: the work plan holds two current epics.**
- E1 stays a detailing without code. A task of E2 waits not for all of E1 but for those of its tasks whose decisions it needs: the skeleton — the drawing engine and the docking with `app`, the input — the sheet's logical coordinates, the sample file and the samples page — the sample file's contents.
- The detailing's summary checks the tasks of E2 against how [architecture.md](architecture.md) says the component is built, edits their bodies where the detailing's decisions changed them, and proposes the epic after E2.
- E2 is planned for the MVP: first the handwriting sheet as the check board of `tutor` takes it — input, undo of a stroke, clearing and the PNG of the work —, and the license check by `spec`'s recipe once the wrapper of `.github` comes out; the rest of E2 is deferred.

— *Why:*
- The dependency is the tasks', not the epic's. After the detailing's summary the first code would wait for the most tied task of E1 too, the sample file's contents: the sample format of `tutor` is still being designed (`tutor`'s В7), the eval protocol is `spec`'s epic E3, still among its epics for later, and the volunteers' consent is П-16.
- The measurement of AI reading in `tutor` has already begun — by its epic E2 beside its E1 —, and the samples for it will be written by a temporary recording page of `tutor`; it does not exist yet. The samples page will replace it (`tutor`'s В7): the sooner it comes, the fewer samples gather in the format of the recording page, which would later have to be converted, and the sooner the measurement runs on the same canvas as the learners'.
- `tutor` is built the same way: the two repositories of the first code of stage 2 plan alike. The template has one current epic, so the difference is recorded here.

— *Rejected:*
- E2 after the detailing's summary: the first code would wait for the sample file's contents and the summary, though the skeleton and the sheet need only the drawing engine, the coordinates and the docking;
- code tasks in E1: E1 would stop being a detailing without code, and its result and its list of what it leaves out would have to be edited.

— *Consequence:* RUN.md — table 1 with E1 and E2, its start and its description of the plan on two current epics, the epics E1 and E2, the detailing's summary. The rows В6–В10 are «в реестр spec».

## `spec` tag v0.2.12

**R03. `canvas` is on `spec` v0.2.12: the submodule `spec/` is at this tag, the links to `spec` pinned to a tag name it, and the devcontainer is the one that the recipe of `spec` of the new tag builds for `canvas`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.9 v0.2.12`, read 2026-10-21; `spec`'s rows Д11 and Д12):
  - the answers of `spec` to two rows «в реестр spec» of this repository, both by their recommendations:
    - В4 — `spec`'s decision on the samples page and П-10 add: the build for a child sample is downloaded from the release of `canvas` by the adult who runs the session, like any visitor of GitHub, and GitHub sees their IP address. The build's file holds neither a sample nor a child's data, and the sample file goes nowhere by this path; the text of the separate consent to children's samples says so (П-10), and it is finally decided together with П-10 and П-12 in `spec`'s epic E4;
    - В5 — the comment on the installation of Claude Code in `.devcontainer/Dockerfile` of `spec` is corrected: without `install.cjs`, `claude` is a stub that writes that the native binary is not installed and exits with code 1;
  - from stage 2 the CI of `canvas` also takes the release of `modules` by exact tag: the build of the samples page puts tasks and media into it through the CLI of `module-kit`, as `modules`'s card in `spec/docs/architecture.md` says, and [architecture.md](architecture.md) says the same. The temporary source of the measurement's tasks, while `modules` has no code, is В6: if `spec` accepts it, both this row and `canvas`'s card in `spec/docs/architecture.md` are edited;
  - the shared rule of exact versions: an archive that the Dockerfile downloads is checked against its sha256 sum before it is unpacked — an `ARG` for each architecture beside the version. The versions of the tools in the Dockerfile of `spec` are the same as on v0.2.9: Node 24.21.0, just 1.58.0, gh 2.101.0, just-lsp 0.10.0, Claude Code 2.1.280;
  - `spec` connected the shared checks and the ruleset of `main` in all eleven component repositories, and the documents check is required in all of them. Here this is pull request #2, merged 2026-10-20 (commit ec8a228), and the ruleset 25506234;
  - the release of another repository calls the recipes of `spec` — `release-version <commit> <workflow>` and `release-refusal` — not copies of them. This is an input of the release of the `canvas` package: `canvas` has no release of its own yet;
  - the TypeScript wrapper of `.github` comes with the first code in TypeScript — that of `canvas`. The epic E2 and [architecture.md](architecture.md) already say so;
  - the plan of the epic E2 of `spec`, «Формат модуля v0»: the detailing of the sheet's coordinates takes its task on a task's items, answer cells and canvas as an input — this is already there and in [architecture.md](architecture.md). The epic E1 of `spec` went to its archive;
  - the measurement of `tutor`, begun before its turn in `spec`'s order of the repositories' first code, is recorded there with a mark — the answer to `tutor`'s В4. About the same early start of the code of `canvas` — В10;
  - whether `engine` needs randomness at all, which `spec`'s one generator of randomness leaves to `engine`, and Т-29 — about `engine` and `infra`: they change no documents of `canvas`;
  - the template `repo-template/` and the recipes `tools/new-repo/` did not change between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.12, commit b721be9. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md — v0.2.12. What was before, the start of the log and its earlier tag still say: it is history;
  - `.devcontainer/Dockerfile` matches byte for byte what `editDevcontainer` from `spec/tools/new-repo/devcontainer.mjs` v0.2.12 builds for `canvas` of the kind `typescript`: the sha256 sums and the new comment on the installation of Claude Code. The sums were checked 2026-10-21 against the publishers' lists of sums — `SHASUMS256.txt` of Node, `SHA256SUMS` of just and just-lsp, `gh_2.101.0_checksums.txt` — and all eight matched. `devcontainer.json` and `host-network.sh` did not change. The move introduces no differences from the template;
  - RUN.md — its questions without В4 and В5, its opening saying what closed them; the detailing of the sample file and [architecture.md](architecture.md) name the answer to В4;
  - the debt: Д1 is closed — the container was rebuilt; Д2 — the image by the new Dockerfile has not yet been built here.

— *Why now:* the answers of `spec` to В4 and В5 exist only since v0.2.11, and each repository closes its rows by its own move to the latest release that came out with them (`spec`'s row Д12). The detailing reads the latest `spec`: it holds the plan of the module format v0, which the detailing of the sheet's coordinates takes as an input. v0.2.12 is the latest release of `spec` as of 2026-10-21, and immutable (`gh release view -R altnovatrail/spec`); `gh release verify v0.2.12 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit b721be9.

— *Rejected:*
- v0.2.10 — it has neither the answer to В4 nor the sums in the Dockerfile;
- v0.2.11 — it has the answers already, but Д12 says to take the latest release, and v0.2.12 also brings the plan of the module format v0, which the detailing reads as an input;
- to carry only the sums into the Dockerfile, or to edit it by hand: the devcontainer of `canvas` is the container of `spec`, and a difference would have to be recorded as a decision, and there is no reason for one.

— *Consequence:* RUN.md; CLAUDE.md; README.md; `.devcontainer/`, whose image is not built here until Rebuild Container — Д2; [architecture.md](architecture.md).

## `spec` tag v0.2.13

**R04. `canvas` is on `spec` v0.2.13: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.12 v0.2.13`, read 2026-10-21): the review of a task goes in one round of `/code-review high`, and the executor may hand in a small change without review; the report says whether there was a review, and if not, why. The template's RUN.md says so in its rules of review and of the report, and so does AGENTS.md. The tag changes nothing else: `tools/new-repo/`, `.devcontainer/` and `spec/docs/`, but for the log, are the same between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.13, commit ba6ac67. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md — v0.2.13. What was before, the start of the log and its earlier tags still say: it is history;
  - the move does not change RUN.md's rules of review and of the report, nor AGENTS.md: the session of `.github` already made that change here (pull request #4, commit 5c43ca4);
  - the devcontainer does not change: the recipe `editDevcontainer` and the Dockerfile of `spec` at v0.2.13 are the same as at v0.2.12.

— *Why now:* the detailing reads the latest `spec`. v0.2.13 is the latest release of `spec` as of 2026-10-21, and immutable (`gh release list`, `gh release view v0.2.13 -R altnovatrail/spec`); `gh release verify v0.2.13 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit ba6ac67.

— *Rejected:* to stay on v0.2.12 — RUN.md's rules of review and of the report and AGENTS.md here already follow `spec`'s review in one round, and `spec/` at v0.2.12 does not know it.

— *Consequence:* RUN.md, CLAUDE.md and README.md name the tag; Д2 stays as it was: the move does not change the devcontainer image.

## The detailing

**R05. The drawing engine is code of our own on the browser's API. The canvas is a stack of layers of page elements. The learner's ink on the screen is Canvas 2D with the outline of perfect-freehand and the index of strokes rbush, and the template and the tutor's layer are HTML and SVG. The strokes, the history, the stroke groups, the crop and its PNG are DOM-free code of our own.**
- **Layers.** Each layer is a page element of its own: all of one size, in the units of the sheet and in `spec`'s order of a canvas's layers — the template, the widget, the demo, the learner's work and the tutor's layer, from the bottom up. They stand in the scene — the visible part of the sheet — and shift in the frame in which the ink is drawn. The template holds the grid, and the statement stands above the sheet, in the same scrolling. The tutor's layer is in two elements: the sketch under the learner's work, the boxes and marks above it. What draws what — [architecture.md](architecture.md), where it describes the drawing engine and the layers.
- **The widget layer** — a place of its own in the stack, empty until stage 4, when a module's widget runs there in an iframe sandbox. The chosen tool distributes the input through `pointer-events`: an inactive layer gets `none`, and the active one drops its `none` but does not get `auto`, so the consumer's `none` on the element, which keeps writing off during the check, still reaches the drawing surface.
- **Input** — code of our own on Pointer Events, one pointer at a time, and `pointercancel` cancels a stroke. Palm rejection is canvas-api's, pen mode in the session and a threshold of the touch's size (sources 1.1), with `canvas`'s own numbers: pen mode for the whole page till it reloads, and a palm is a touch wider or taller than 100 CSS px.
- **DOM-free** — the strokes, the writing history, the index, the groups and boxes, the snapping of marks, the raster of the crop and its PNG: plain TypeScript, the same in the browser and in Node. The raster and the PNG encoder are our own, and the bytes are the same in any JavaScript engine.
- **The browser's drawing surface** draws the ink on the screen and the picture of a work: a `<canvas>` out of the document fills each stroke's outline the screen fills, and the crop's encoder writes its pixels. The crop for checking is never drawn by it.
- **Versions** — perfect-freehand and rbush at the exact versions of `package.json`.
- `canvas` builds no text canvas: the engine and the stack serve the sheet and the kinds built on it.

— *Why:* the sources — sources 1.1, 1.2, 1.4, 2.1–2.7 and 3.1.
- **A place of its own for the iframe.** The widget's iframe sandbox, the only thing the interface loads at run time, needs a place of its own between the layers. A stack of page elements has one, and Konva puts no HTML between its layers: "It can't render DOM elements directly".
- **Accessibility.** The argument of MathTrail standalone — a screen reader does not read the drawing surface — weighs for the statement, the tools and the marks, not for the ink. Handwriting stays a picture in any technology, and the learner sees what was read as text — «Я прочитал 6». So the statement and the tools are HTML, the marks are SVG, and the drawing surface is only for the ink.
- **The eraser and the marks.** An eraser of whole strokes and marks tied to strokes, as `spec`'s canvas and the study have them, are code of our own in any option. Of the libraries whose eraser was checked, only Excalidraw and drauu delete a stroke whole; in the others the eraser erases pixels or there is none.
- **The crop.** The browser's drawing surface cannot give the crop for checking and for samples:
  - the HTML Standard does not define the bytes of a PNG;
  - in Node — for the tests and the synthetic samples — the drawing surface needs a native package with pixels of its own;
  - browsers add noise to what is read from a drawing surface: Brave by default, Firefox on the desktop in standard protection too, Safari in Private Browsing and possibly in all browsing. The noise is small, but the same strokes would give different bytes.
  The picture of a work needs none of this — no repeated bytes, no Node —, so the browser draws it.
- **Size:** perfect-freehand and rbush together — ≈4 KB gzip, Konva — ≈58 KB.
- **No framework.** The part on the page holds on to none, so it fits whatever `app` is built with.

— *Rejected:*
- **Konva**, which canvas-api planned:
  - it has two drawing surfaces of its own for each layer, and HTML and an iframe go only on top of its scene;
  - it gives no accessibility; the eraser in its example erases pixels; export goes by the browser's drawing surface, and in Node it needs `canvas` or `skia-canvas`;
  - its strength — the scene graph, the events of shapes, dragging — the sheet does not need: the learner writes and erases, and the marks are not moved;
  - MathTrail has no experience with Konva: canvas-api's client never had it;
- **Fabric.js, Paper.js, PixiJS and Two.js.** Fabric and Paper have no pressure, and Two.js has no input at all. In Fabric and PixiJS the eraser erases pixels, and Paper has no eraser — only the blend `destination-out`. In Node, Fabric, Paper and Two.js need node-canvas, and PixiJS has no ready adapter for Node; besides, PixiJS draws with WebGL and weighs ≈237 KB;
- **Excalidraw** is an application for React, not a drawing engine. A web component would carry React inside, beside the framework of `app` — a duplicate of the framework, which an interface built from packages at build time avoids;
- **tldraw:**
  - its license forbids work in production without a key, and the code checks the key and may send usage data; the package needs React;
  - its Agent starter kit goes to AI providers itself and changes the board — while only `tutor` calls the models, and the tutor never touches the learner's work;
  - the terms of its other licenses were not read: React and the data collection reject it anyway, and the bindings by ID, for which the study cites it, carry over without it;
- **signature_pad and Atrament** — they draw on one drawing surface, and their eraser erases pixels; Atrament besides keeps no strokes: "draws directly onto the canvas bitmap";
- **drauu** deletes a stroke whole, but everything else — the writing history, the IDs of strokes for marks, the crop — would be code of our own, and in Node it needs a DOM;
- **ink in SVG.** Theme and scaling are simpler, but each stroke is a DOM element, and SVG has no low-latency mode `desynchronized`;
- **one drawing surface for all layers** — an iframe will not fit between the layers, and a screen reader will not read the statement on a drawing surface;
- **the crop by the browser's drawing surface** — OffscreenCanvas and `convertToBlob`: the bytes depend on the browser and its noise, and Node needs a native package.

— *Revisit* — when tools come that move and rotate — the ruler and the protractor —, or the creative canvas: they may need a scene graph. The DOM-free part does not change from this.

— [architecture.md](architecture.md), the drawing engine, the layers and the code; `package.json`, `src/core/`, `src/element/`.

**R06. The handwriting sheet counts in logical units: the task's page is 1000 × 1400 of them, as canvas-api's sheet, at the sheet's top left, its origin, and the sheet goes on past it to the right and down, within a reach of 10000 × 14000. The crop by A3 goes for checking. The place in the observation is in fractions 0–1000 of the crop, and `canvas` on the device turns it into units of the sheet. Stroke groups are by space and time, as in `tutor`, and a mark holds on to its strokes.**
- **The units.** The origin is the page's top left corner, the y axis points down, and the scale is the same on both axes. In units of the sheet are the strokes, the grid, the zone of an answer slot, the areas of a worked example, the tracing paper of a task from the learner's paper and all the layers, and all the layers have one transform to the screen.
- **The page** — `SHEET` in `src/core/sheet.ts` — is a constant of the canvas kind, not a setting of the module, and there is one. The task's zones, the workbook's lines and boxes and a worked example's areas lie on it; a worked example's sheet is the page alone. The page fits the width of its area, up to 1000 CSS px, and what does not fit scrolls. The picture of the work for `PutWork` is the page and the ink past it, a pixel a unit while it holds no more bytes than the page's.
- **The reach** — `REACH`, ten pages across and ten down. The sheet goes past the page as far as the page, the ink and the tracing paper go and one view more to the right, two views more down (`extentOf`), never beyond the reach. A point of a writing history (`src/core/history.ts`), a stroke's extent (`src/core/geometry.ts`), the box of a crop and of a mark (`src/core/marks.ts`) and the place of the tracing paper (`src/core/tracing.ts`) are valid within the reach, not within the page: a history with a point beyond it is a `TypeError`, and input beyond it presses to its edge (`toSheet` in `src/core/screen.ts`). spec's contract `InkPoint` names these bounds.
- **The crop** — by A3 of the study: the visible strokes, wherever they lie on the sheet, a margin, and a scale such that the lower median of the heights of the strokes' bundles becomes the digit height D, 32 px by default. `sheet_box` — where the crop with its margin lies on the sheet. Its rules and formulas — [architecture.md](architecture.md), where it describes the sheet's logical coordinates. On the workbook a crop of each filled box goes, and the place is the answer slot.
- **The place from the model.** The adapter of `tutor` turns the provider's convention into fractions 0–1000 of the crop, and `canvas` turns the fractions into units of the sheet by `sheet_box`, in whole numbers. `sheet_box` and the table "group → strokes" do not leave the device.
- **Stroke groups** — by space and time, as in the measurement of `tutor`; the rule and its thresholds are `canvas`'s own, `src/core/groups.ts`.
- **Marks** — `{stroke_ids, snapped_box}`, as in the study: the model's box takes the strokes of its submission by a rule in integers, and stands around those of them that are visible now. There is no text canvas, and so no mark by words.

— *Why:* the sources — sources 1.1, 1.4, 4.1 and 5.2.
- **The units of the sheet** do not depend on the screen, as in canvas-api. One constant page gives the same zones of slots and the same samples on any device, and the format v0 needs no parameter for it.
- **The page at the origin.** The sheet grows right and down, so whatever lies on the page keeps its units however far the learner writes.
- **The reach.** The rules of the groups, the crop and the marks count in whole tenths of a unit, and a bound keeps their numbers small and a history's numbers sane, whatever a history from outside holds.
- **The crop by A3** evens out handwriting: the model sees digits ≈32 px high, however large or small the learner wrote and whatever the screen. Empty margins and large digits would give extra pixels, and at Anthropic and OpenAI the tokens of an image grow with its size.
- **The fractions of the crop:**
  - the providers name the place differently: Claude in pixels of the image after its own downscaling, Gemini in fractions 0–1000, and OpenAI has no box format. Only the adapter of `tutor` can recompute the place after the downscaling: only it sees that downscaling;
  - fractions mean the same for any image — for the crop of the sheet, and for that of a task from paper. So the observation — the shared type of `tutor`, `module-kit` and eval — does not depend on the canvas kind;
  - only `canvas` knows where the crop lies on the sheet. The server does not need `sheet_box`, and less data goes out, as `spec` keeps data to a minimum;
  - the study's example is built the same way: the fractions are «внутреннее соглашение», and by `sheet_box` «устройство возвращает рамки на лист».
- **Groups by space and time** — as in `tutor`: a stroke added later beside an old entry becomes a group of its own and does not merge with it. The labels in the samples of `canvas` and in the measurement of `tutor` are built by one rule. The price accepted: the same strokes written in another order give other groups, and the partition carries a rough sign of the process — by the study's scale of risk, the group boxes are then nearer to (b) than to (a). The crop's scale does not depend on the groups: it is set by the stroke bundles.
- **Marks by strokes** — a mark holds on to its content, not to a place on the screen.

— *Rejected:*
- **the whole page on the screen** — on a screen wider than it is tall, the page would be fitted by height, and the grid's cell would shrink;
- **the page's size as a setting of the module** — an extra parameter of the format v0, on which the zones of slots would depend;
- **several pages** — the crop and the groups would know about pages, and canvas-api managed with one sheet;
- **a sheet with no bound** — the rules' whole numbers and a history's would have none;
- **the whole sheet as the picture for checking**, as in canvas-api, — the scale of the digits would depend on the handwriting, and empty margins would cost tokens;
- **a crop without scaling** — the same dependence on handwriting;
- **units of the sheet in the observation**, with the transform in the adapter of `tutor`, — `tutor` would get `sheet_box` with the work, and the observation would depend on the canvas kind;
- **fractions, but `api` turns them into units of the sheet** — `api` would get `sheet_box` and would know the sheet's geometry;
- **groups without time** (the study; the recommendation of В12) — the bounding boxes can be derived from the picture itself, but the groups of `canvas` would diverge from the groups of the measurement of `tutor`, and what was added later would merge with the earlier writing;
- **rules of groups of their own for the device and for the runner** — the labels in the samples and in the measurement would diverge.

— *Revisit:*
- the groups — by the findings of the measurement of `tutor`, which compares labels and a bounding box, so far only on Claude's models;
- the page — if a task's zones need more than one page: a workbook task that does not fit is a `TypeError`.

— [architecture.md](architecture.md), the sheet's logical coordinates; `src/core/sheet.ts`, `screen.ts`, `history.ts`, `geometry.ts`, `crop.ts`, `groups.ts`, `marks.ts`, `tracing.ts`.

**R07. The canvas enters its consumer as a web component — one element `<novatrail-canvas>` for all canvas kinds, without a framework and with an open Shadow DOM. It gets data by properties, gives the work for checking and the picture of the work by methods, and the writing history by a property and an event. The types of the agreement with `app` are `spec`'s, and the package declares only its own.**
- **The element.** It takes the canvas kind from the task's open view, and a new kind comes with a new version of the package, released before the module that takes it. It registers when its entry point is imported, and the DOM-free part is a separate entry point, `@altnovatrail/canvas/core`, which is imported in Node too and gives the types of data and `replay`.
- **It gets:**
  - `task` — the task's open view, in the format's names, in snake_case; the element shows the statement above the sheet, and the task's field `canvas.tools` says which tools to show;
  - `manifest` — the open view of the module manifest, from which it reads the module format version, the digit height on the crop and the explanation language in which the statement is;
  - `media` — a function that gives a promise of a media file `Blob`; a picture is named by its path from `media/`, and a task by its full ID;
  - `history` — the writing history;
  - `marks` — the tutor's marks of one submission together with its context, the numbers of the crop and the groups;
  - `tool`, `"pen"` or `"eraser"` — what the primary button does; the pen's eraser erases with any `tool`.

  The language comes from the attribute `lang` on the element itself: the element watches it and labels its own buttons by it, and the row of buttons sets itself the language of its labels, since a screen reader reads English labels under another language in English. The theme is the CSS variables `--novatrail-canvas-paper`, `--novatrail-canvas-ink` and `--novatrail-canvas-grid`.
- **It gives:**
  - `history` — the writing history, by the same property;
  - the event `historychange` — a `CustomEvent` after each stroke, erasure, clearing and undo, whose `detail` is the new events of the history and the number of the first of them;
  - the asynchronous method `exportWork()` — the PNG of the crop and the context of the submission with a digest, and `null` for an empty sheet;
  - the method `exportPicture(): Promise<Blob>` — the PNG of the strokes its surface shows, with no condition, for `StoredWork.picture`;
  - the event `toolchange` — the learner changed the tool by a button of the element;
  - the commands `undo()` and `clear()`, which its own buttons call.

  The element sends the events from itself, and they bubble. It sends no event `speak`: there is no text canvas and no "listen" on the canvas, and `spec`'s agreement leaves `speak` until a text canvas, which the first slice does not have.
- **The context of the submission** — `sheet_box`, the group boxes and the table "label → stroke IDs" — is held by `app`, not by the canvas, and is returned only to the element that gave it: another's is a `TypeError`. `sheet_box` and the table do not go to the server, which works in fractions of the crop, and the group boxes go only if Т-31 so decides.
- **The types.** The agreement with `app` is `CanvasElement` of `@altnovatrail/spec/canvas`, which `spec` writes by hand from the line 0.5: the properties, `exportWork()` and `exportPicture()` — named there from `spec` v0.18.27 (sources 6.19) —, the events, the writing history, the work, the context of the submission with its parts, `media` with `Media`, and the marks `Marks`, `Mark` and `Anchor`, which `spec` checked against the message `Mark` of the contract `novatrail.api.v1`. The element's class is `implements CanvasElement`, and the package adds the element to `HTMLElementTagNameMap` and its events to `GlobalEventHandlersEventMap`, by `extends CanvasEventMap`. The package has no declarations of its own of the agreement's types: both entry points give `spec`'s types under their names — the same types, as they give `Manifest` and `WorkedExample` —, the types of data, the writing history and the context of the submission with its parts, and the element's entry point also `CanvasElement`, `CanvasEventMap`, the types of the events and of the work, `Filled`, `Tool` and `Media`. A consumer takes them from either package, and [README.md](README.md) shows `spec`'s path, which is how `app` takes them. The package's own are only what the agreement does not name: `undo()` and `clear()`, the task and the canvas with the temporary `canvas.tools` (Д5), `Crop` and `GridKind`. Through `CanvasElement` there is no field `canvas.tools`, so a task literal with it is a type error there, and through `NovatrailCanvas` it is not.

The design is in [architecture.md](architecture.md).

— *Why:*
- **A web component:**
  - the package has several consumers — `app`, the samples page, the site, the card of the MCP channel —, and the framework of each is decided by its repository;
  - `app`'s framework is `app`'s to choose, and the part of the canvas on the page needs no framework: the drawing engine is code of our own on the browser's API;
  - React 19 and Preact take the element by themselves. React 19 "passes all tests on Custom Elements Everywhere", and Preact: "Preact fully supports Web Components" (sources 3.3).
- **One element.** The module chooses the canvas kind for each task, and a new kind is code of the platform, not of a module. A new version of `canvas` brings such a kind without an edit of `app`.
- **Shadow DOM.** The styles of the page and of the element do not touch each other. The price: ARIA references by ID do not leave the shadow root, so everything they refer to lives inside the element.
- **Properties, methods and events.** `app` saves the history after each stroke, so it comes by an event. `app` asks for the crop on "Check" and for the picture when it stores the work, so they are given by methods. `app` holds the context of the submission: the canvas has no data of its own.
- **Media files are `Blob`:** the canvas calls no one over the network.
- **The types are `spec`'s.** These data travel between repositories, and the formats and the agreements that repositories share live in `spec`, from whose releases the code takes them. `interface.check.ts` and `entry.check.ts` hold the types of the entry points identical to `spec`'s, with `readonly` and optional fields, and the trial consumer takes the agreement's types from `spec`.

— *Rejected:*
- **a component of the framework of `app`** — it would decide for `app`, which chooses its framework itself, and would carry the framework into the samples page and into the second build, though the canvas does not need it. Were the second consumer's framework another, `app`'s build would carry two frameworks;
- **a mount function** — every consumer would write the mounting, unmounting and cleanup itself, and each framework would need a binding of its own. A web component gives this by the browser's means;
- **a Preact component in the wrapper `preact-custom-element`** — it would carry Preact inside the canvas, which needs no framework;
- **an element of its own for each canvas kind** — `app` would choose the element itself and would be edited with each new kind;
- **the page's shared DOM** — the styles of `app` could shift the canvas's layers, and the canvas's styles would touch `app`;
- **media files by URL** — the canvas would go to the network itself;
- **the context of the submission in the canvas's memory** — the canvas would hold data of its own;
- **one entry point, and the element registers when it is imported** — the DOM-free part could not be imported in Node, where there is no DOM to register the element in;
- **entry points without the agreement's types**, so that a consumer would take them only from `spec` — there would be one path, but the tests, `demo/` and the consumer of `core` would have to import the same type in a new way, and the entry points already give `Manifest` and `WorkedExample`.

— *Revisit* — if one page needs two versions of the package: the element's name is one for the whole page, and registries of names for shadow trees were not checked here.

— *Consequence:*
- `package.json` — two entry points, the element and `core`;
- `src/element/index.ts` — the element, its properties, methods and events, `implements CanvasElement`, and the additions to `HTMLElementTagNameMap` and `GlobalEventHandlersEventMap`;
- `src/core/index.ts` and `src/core/marks.ts` — the types of `spec` under their names, and `replay`;
- `src/element/interface.check.ts` and `src/core/entry.check.ts` — the identity of the types with `spec`'s; `src/element/consumer.test.ts` — the trial consumer;
- `src/element/labels.ts` — the labels and names are inside the element;
- `src/eval/` — the sample takes the writing history and the crop in the same form in which the element gives them;
- `page/` — the samples page is a build of its own of the same element;
- [README.md](README.md) — the path of the types from `spec`;
- [architecture.md](architecture.md) — the design of the element and what `app` has to do: it holds the context of the submission itself.

**R08. The package comes out on npm — `@altnovatrail/canvas`, in the scope of the organization `altnovatrail`. Everything that `canvas` puts out is the files of one GitHub release with the signature of the shared `release.yml` of `.github`: the package, the synthetic samples and their list, the build of the samples page, the generator of a module's eval set, the license and the sums. The same file of the package goes to npm — by a step of the same shared release, through trusted publishing, without a long-lived token.**
- **The release** comes out by itself, after CI on `main` and by the button. The `release.yml` of `canvas` calls the shared one by the SHA of its release, and the shared one gives a release only if the paths it is built from have changed. The line is `RELEASE_LINE` in `.github/workflows/release.yml`, and the comment beside it says which module format the element reads. The line is raised when a release stops accepting what the release before it accepted — a format version or another input of the contract —, and a new line's first release is `v<line>.0`: the recipe `release-version` takes the line's next patch.
- **The files** are written by `release-files <version>` in the stage `toolchain`, six and `SHA256SUMS`:
  - `altnovatrail-canvas-<X.Y.Z>.tgz` — `npm pack` packs it from a copy of what it takes — `lib/`, `package.json`, README and LICENSE —, and the tree's `package.json` stays `0.0.0`. `scripts/release.ts` checks the very archive released, by the output of `npm pack --json`: the package's name, the version, the file's name — what the shared `release.yml` looks for —, and that it holds only the build; the recipe takes the file's name from this check;
  - `synthetic-samples_v<X.Y.Z>.tar.gz` — flat, one JSON per sample —, and its list `synthetic-samples_v<X.Y.Z>.tsv`, what each sample shows;
  - `samples-page_v<X.Y.Z>.html` — built by `node scripts/page.ts dist <number>`, with the draft of texts and the license notices inside. It takes the measurement's tasks from the copy of `tutor`'s file of open tasks in `tasks/`, which `ci-licenses` checks by the recipe `release-verify` on every pull request and whose sum `TUTOR_FILE` holds: `release-files` downloads nothing, the synthetic samples and the page take one path of the file, and a pull request builds the same page as a release;
  - `synthetic-module_v<X.Y.Z>.mjs` — the generator of a module's eval set, written after the page;
  - `LICENSE`.

  The recipe takes a number of the form `v0.1.0`, as the recipe of `module-kit` does — strictly `v<major>.<minor>.<patch>`, without leading zeros and without a suffix —, and writes it without `v` as the package's version. Each file has a cosign signature, with its bundle beside it. `dist/` is given to these files only. The same commit gives the same sums — `npm pack` pins the time and the order of the files —, and the recipe prints `SHA256SUMS` to the log, so that the build can be repeated and checked. The release's description begins with a paragraph about the page and about the IP address, which the job `notes` of `canvas`'s own `release.yml` puts there.
- **The paths** are what the consumer gets, by the rule of the template of `.github`'s calling `release.yml`: «в перечне то, что получит потребитель». They are the package's code, `src/*.ts` without `*.test.ts`, `*.fixture.ts` and `*.check.ts`; `package.json`, `tsconfig.base.json` and `tsconfig.build.json`; `justfile`; README and LICENSE, which `npm pack` always puts into the archive; the whole `.devcontainer/Dockerfile`, whose stage `toolchain` holds Node and the npm that packs the archive; `release.yml` itself, so that a change of `RELEASE_LINE` gives a release; and what the synthetic samples, the page and the generator are built from: the page's sources, its builder and the programs of `tsconfig` whose options Vite reads, the generator's code, its entry point, its builder, the shared helpers of the notices and `tsconfig.node.json`, `tutor`'s file of open tasks and the lock file, whose packages write each synthetic sample's JSON. The package alone needs no lock file in the list: it does not go into the archive, and the compiler is pinned by an exact version in `package.json`.
- **The probe.** Our own `release.yml` runs on each pull request too, with `publish: false` — `publish` is `true` everywhere but `pull_request`. The shared `release.yml` then builds the files, signs them and checks the signatures, and the npm step checks the archive and makes a trial publication; nothing goes out either to a GitHub release or to npm. So each change of the paths is tried before it is released. After CI on `main` our own `release.yml` runs only if CI passed: with `publish: false` the shared job does not ask this. The key `permissions` raises the write permissions in a Dependabot pull request too: "You can use the `permissions` key in your workflow to increase the access for the token" (sources 5.4).
- **npm** gets the same `.tgz` by the same run, from the npm step of the shared release, which the input `npm-package: "@altnovatrail/canvas"` turns on for every event. The trusted publisher is `canvas`'s `release.yml`, and tokens that bypass 2FA are forbidden. The registry takes the archive by OIDC from a reusable workflow of another repository, and npm creates the provenance itself: the certificate names `.github`'s shared `release.yml` at the SHA of its release, and the SLSA predicate names `canvas`'s `release.yml` on `main`. The trusted publisher's setting allows staged publishing — npm creates every new setting so — and direct publication too, `--allow-publish`, and the step publishes directly. The npm step waits for the registry up to 20 minutes (Д91 of `spec`). The bug npm/cli#9969 — the registry refuses the exchange for repositories with an immutable subject of GitHub's OIDC token — is open, and `canvas` has such a subject, but the exchange goes through for it (sources 7.2).
- **How they are taken:**
  - `app` — an exact version from npm, and during development a working copy by a link;
  - the samples page's build — the same package, with the contract's types from `spec`: the page is a consumer, as `app` is;
  - the CI of `tutor` — the archive of the synthetic samples by tag and sum, with its bundle;
  - an adult — the build of the page from the release's page.
- **Signature.** The signature of the file itself ties the version on npm to the signed release: the archive from the registry is the same bytes as the release file `altnovatrail-canvas-<X.Y.Z>.tgz`. The consumer checks it by `spec`'s recipe `release-verify-npm` in the CI of the pull request that changes its lock file: the signature by the bundle of this file in the release, and `integrity` by the checked bytes. The recipe accepts the files of `canvas` only if the shared `release.yml` of `.github` no lower than v0.1.7 signed them, on a call of the `release.yml` of `canvas` from `main` at the tag's commit, with immutable releases and the ruleset of the tags `v*` turned on. In `canvas` both are on: the ruleset `v-tags` (26336827) — `refs/tags/v*`, the rules `update`, `deletion` and `non_fast_forward`, without bypass — is the same as in `module-kit`. `SHA256SUMS` is not needed for this check, but it stays a release file: by it the build is repeated and checked.

The design — [architecture.md](architecture.md).

— *Why:* the comparison of the registries is in [architecture.md](architecture.md) (sources 7.1 and 7.2).
- **npm** passes the criterion of Т-26 — by an exact version and without a token, for the authors of widgets too:
  - anyone installs a public package in a scope — "Scoped public packages can be downloaded and installed by anyone";
  - a version does not change — "Registry data is immutable" —, and its number is not reused;
  - an organization for public packages is free;
  - trusted publishing does without a token and gives provenance.
- **The same file.** npm checks the registry's signature and the provenance, but not which workflow built the package. So the file itself holds the tie of the package to the signed release, and the lock file's sha512 is checked against the signed bytes.
- **A step of the shared release:**
  - publication is the same for all repositories with packages on the shared release, and `.github` holds what they share;
  - OIDC needs no secret, and the shared workflow takes none;
  - from a reusable workflow, npm checks the name of the calling workflow. The provenance certificate, by Fulcio's rule, names the shared `release.yml` in its SAN, as the cosign signatures do.
- **One release.** `app`, the CI of `tutor` and an adult take one version by one tag, and each release carries all the files `canvas` has. The page and the synthetic samples are not packages: they are downloaded as files, as `tutor`'s CI asks. So a release for the page alone is a new version on npm too, by the same step.
- **A release is irreversible.** An immutable release cannot be replaced, and a number that npm has once taken cannot be returned: "Once package@version has been used, you can never use it again" (sources 7.2). The shared `release.yml` allows the probe itself: "A run that publishes nothing may run anywhere: a pull request tries a change that way" (sources 5.4). With `npm-package` it checks the archive by the same code that later publishes — `package.json`, the registry and a trial publication —, and the own check of `canvas` is the one that the local build sees too.
- **The paths** are by the rule of the template: for Go the list holds the whole Dockerfile, because Go is pinned there, and in `canvas` npm packs the archive from the same stage.
- **The line.** In versions 0.y.z, y carries a change of behaviour — that is how `spec` compares module versions too —, and the number tells a consumer that what the release before took is no longer accepted.
- **A package's first version** goes to npm by hand, with the same release file, checked: a trusted publisher is set up only for a package that is in the registry, and the shared `release.yml` checks the registry before the GitHub release, so for a package that is not there a run with `npm-package` stops and the release does not come out at all.

— *Rejected:*
- **GitHub Packages** — a token is needed even to install a public package, and only a personal access token (classic);
- **GitHub releases only** — npm 12 closes installation by a link by default:
  - a project would need `allow-remote=root`;
  - a package that itself depends on a NovaTrail package by a link would need `all`;
  - in npm 11, which comes with Node 24, installation by a link is still open, but it is already being closed;
- **a publication job of our own in the `release.yml` of `canvas`** — a copy in every repository with packages. It too needs an edit of `.github`: the shared `release.yml` has no outputs — neither the version nor a sign that the release came out;
- **staged publishing** — the author with 2FA approves each version, and the release waits for a person again, while it must come out by itself;
- **publication of each version by hand** — the release waits for a person the same way, and the step can be forgotten;
- **a long-lived npm token in the secrets** — the shared workflow takes no secrets, and npm will remove direct publication by a granular token in January 2027;
- **`npm publish` from the tree** — npm would build its own archive, not the one signed in the release;
- **the page and the synthetic samples as npm packages** — they are taken as files: an adult without npm, the CI of `tutor` by tag and sum;
- **separate releases for the page and the synthetic samples** — one version of `canvas` would have several tags;
- **paths without README and the Dockerfile** — the README in the npm archive would lag behind until a version with code, and a new npm in the image may build the archive otherwise: the template's rule would be broken;
- **the lock file in the paths for the package** — each raise of a development tool would give a version, and the lock file does not go into the archive;
- **the filter `paths` on `pull_request`** — it would repeat the list in another syntax, and a run of a change outside the list ends as soon as the number is computed;
- **the probe only on `main`, as in the template** — the first probe would come with the merge, and `main` would be the first to see an error of the recipe;
- **a trial pull request without a merge, like the probes of `.github`** — nobody would check between releases that the recipe has not broken;
- **checking an archive built from the root instead of the one released** — `scripts/package.ts` looks at `npm pack --dry-run` of the tree with the version `0.0.0`, and what goes out is a copy with another version;
- **keeping the line when a release stops accepting a format** — nothing might break, but the number would not say that the older manifest is no longer accepted.

— *Revisit:*
- if `spec` decides Т-26 otherwise;
- when `app` begins to take the package: a raise of a tool changes `package.json`, tasks edit README, and Dependabot the image, and each time a version comes out without edits of the code — noise for it;
- if `canvas` gets pull requests from forks: they have no write permissions and no OIDC, and the probe does not start there. It is not in the ruleset and does not hold the merge;
- when the samples page moves to the hosting of the build of `app` (Т-17).

— *Consequence:*
- `package.json` — the name `@altnovatrail/canvas`, the field `repository`, which npm checks, and the folder of the package's build, `lib/`, outside `dist/`; `.npmrc` and the stage `toolchain` of `.devcontainer/Dockerfile` follow the agreement of `.github`'s TypeScript wrapper;
- `.github/workflows/ci.yml` — the calling job of the TypeScript wrapper, by its release's SHA, and the ruleset of `main` requires its four checks "TypeScript / …";
- `.github/workflows/release.yml` — `RELEASE_LINE`, the paths, `publish`, `npm-package` and the job `notes`;
- `justfile` — `release-files`; `scripts/release.ts` — the check of the released archive;
- README.md — the Release badge and the badge of the release number; [docs/README.md](README.md) — the installation by exact version and the check by `release-verify-npm`;
- [architecture.md](architecture.md) — the design of the release;
- `tasks/` — the copy of `tutor`'s file of open tasks, and its move to `modules` is Д4.

**R09. The sample file is the eval protocol's message `Sample`: what it holds is set by the purpose and by who wrote, and the provenance — a person or synthetic — does not change the composition. The writing history, with no pressure, is only in a measurement sample by an adult, and eval-set samples and child samples hold the final geometry of the visible strokes, with no time, pressure or order of writing. Synthetic samples come out in every composition. All of them hold crops at the eval's heights and at the module's, which `canvas` draws, the stroke groups — on a workbook the table of boxes —, the markup and a reference to the task with no key. About the person — the purpose, who wrote, the consent's text version and, except in the eval set, a random writer code.**
- **Three fields** set the file's composition and where it may go:
  - **purpose** — the measurement or the eval set. An eval-set sample goes by a pull request into `modules` and is published under Apache-2.0, and what is published in a module cannot be withdrawn. A measurement sample by an adult stays outside git, with `tutor`;
  - **who wrote** — an adult in their own hand, an adult imitating a child's, or a child. A child only with the purpose "measurement", but their sample does not go to `tutor` together with the adults' samples. It lies outside the repositories, with no pull request, and where the file goes and who has access to it is for П-10 and П-12 to decide. It goes to no AI until П-3 has given a contract that admits children, and `tutor`'s runner checks this by the field (В20);
  - **provenance** — a person or synthetic. A synthetic sample has a seed, and its ID is `synthetic-<seed>`, while a person's sample has an ID of 12 random characters. Synthetic samples come out in every composition, and `tutor`'s CI checks them all (В7).
- **Composition:**
  - **a measurement sample by an adult** — the writing history as the element gives it, with no pressure. A stroke is an ID, a pointer type and points: x, y and time, in the order of writing. Erasures, clearings and undos come with their time. Time is whole milliseconds from the sample's first event, with no date, and coordinates are units of the sheet to a precision of 0.1, rounded as `round(10 × v)`, a half up;
  - **an eval-set sample and a child sample** — the final geometry of the visible strokes. Points go along the stroke's length, a stroke's direction is canonical, and strokes are numbered by place. It holds no time, no pressure, no order of writing and nothing erased. On the scale of A4 of the study "A child's handwriting on the canvas and the AI tutor" («Рукопись ребёнка на канве и ИИ-наставник») this is class (b): the division into strokes and the split into groups remain;
  - **in all of them** — the crops, each with its own parameters; the stroke groups — boxes in fractions of each crop and a table "label → stroke IDs"; the markup; the reference to the task; the versions; the consent's text version.
- **The order of computation**, in the module `src/eval/`:
  1. the groups and the table of boxes are built on the raw history, by space and time, and the labels are given by place: by the top of the group's rectangle, then by its left edge. The rule computes in tenths of a unit and whole milliseconds, as the sample rounds, so on the recorded history it gives the same groups;
  2. in eval-set samples and child samples the strokes are numbered anew, by place, and the table of groups and the markup move to the new numbers;
  3. the points are rounded, and in eval-set samples and child samples also resampled: in the canonical direction, along the stroke's length every 0.25 unit, keeping the ends and the points the stroke's box rests on;
  4. `h_med` is computed from the recorded geometry, the boxes from the groups, and for each crop D, `s`, `sheet_box`, the width and the height. All of it goes into the file, and the runner will repeat the boxes from what is recorded.

  The crop computes in tenths of a unit, as the sample writes, so a measurement sample's crop matches the crop that `app` sends byte for byte. In eval-set samples and child samples the crop's numbers are the same as from the history, since the resampling keeps the stroke's extreme points, and the step is taken such that no difference shows on the crop.
- **The crops** are drawn by `canvas` on saving — at each digit height that the eval protocol names, 16, 24, 32 and 48 px (A6 of the study), and at the module's digit height, the working one, at which `app` sends the crop. The set's shared numbers are the box of the points and `h_med` in tenths. Each writer of the file draws the crops from the strokes the file holds, and `spec`'s check computes them again. The states — after a line and a pause in a line — are drawn by the runner, from the writing history. So only measurement samples by adults have them.
- **A workbook's sample** carries the crops of the boxes at the eval's heights, a table "box → stroke IDs", which the device built on the raw strokes, and the boxes' rectangles in units of the page, and it has no groups. In its eval-set samples and child samples there are only the boxes' strokes, and the table moves to the new stroke numbers, as the table of groups does; a measurement sample by an adult carries the whole writing history.
- **The markup** is the protocol's field `markup`: the truth of each answer slot that AI reads — the value as written, or why there is none —, the notes of the slots, and on a sheet the writing parts with their kind, text, strokes, "crossed out", "illegible" and "final answer" and the number of the first error, for an essay the marks of the criteria. It holds no scenario of the sheet, no intended text of a line and no expected outcome. After saving the markup does not change. A child sample is marked up by an adult — from the child's words, after writing —, and the file names how the markup was obtained. In synthetic samples the first error and the marks are the code's choice by the seed.
- **The reference to the task** is without the key: the source — the release's tag and the file's sha256; the module or the task bank and the digest of the package or of the bank; the task's ID and, for a templated one, the seed; the digest of the open view, the `sha256:` of its canonical text. The key is with the runner.
- **The versions** are `canvas_version` and `text_set_version`, and in a file that the page did not write, synthetic samples' too, `0.0.0` and `none`. An eval-set sample also has `license: "Apache-2.0"`.
- **About the person** — the purpose, who wrote, the consent's text version and, except in eval-set samples, a random writer code of 8 characters, which the page makes. No name, email or GitHub account, no device, browser, screen or language, no date, age or grade.
- **The container** is the message `Sample` of the package `novatrail.eval.v1`, one JSON per sample by the JSON mapping of proto3; the crops are PNG in base64. The code of `@altnovatrail/contracts` writes and reads it, and `spec`'s recipe `sample-check` checks the file.
- **Outside this entry** are the page's steps — age, consent, the child sample session — and whether a build opened from a file works, which a probe checks: it is code, if only a probe.

How it is built — the sample file in [architecture.md](architecture.md).

— *Why:*
- **The history where it is read.** The measurement needs it: the model must see the course of reasoning, and `tutor`'s runner builds the states by the strokes' time. The submitted work carries one crop, and a module's eval set measures what goes in the work. What is published in a module is not withdrawn, and raw strokes with time and pressure are the riskiest class on the scale of A4 of the study. Data — a minimum.
- **No pressure.** No kind of a model's input takes it.
- **The final geometry, not a single crop.** The parts of the markup are sets of strokes, and `tutor`'s runner counts the model's box as a hit on the line of the first error by points: "within the box with a margin of 8 px, most of the visible points are of this very line". Without strokes there is none. The canonical direction and the numbers by place remove the order of writing from the geometry.
- **Groups by time for a child too.** The boxes and the table of groups in a sample must be those `app` sends.
- **`canvas` draws the crops.** The runner compares digit heights "in pairs with 32 px on the same lines". So the comparison runs on one render, and it is the same as `app`'s.
- **The protocol's markup.** The runner reads the samples of the samples page and of `tutor`'s recording page with one code (В7 tutor), and it gets the outcome by the key.
- **The writer code.** In `tutor`'s measurement the lines of one sheet are "linked by the writer", and by the code the runner will also account for the link between the sheets of one writer. Child samples are withdrawn by the code and deleted on schedule (П-10): the adult writes the code down beside the consent. The eval set needs no code, and it would link the published samples to each other.
- **A reference without the key.** The canvas gets no task's key; the key lies in the task bank or in the module package, with the runner. The digest of the open view stays the same when the source changes by В6.
- **JSON of proto3.** `spec`'s contracts are protobuf, and in proto3's JSON mapping bytes are a base64 string.

— *Rejected:*
- **the history in all adults' samples**: the open eval set would forever hold the dynamics of the pen, which the eval set does not read;
- **the history for a child** — class (c) on the scale of A4;
- **only a crop for a child** — without strokes the runner cannot count a hit on a line by its points;
- **groups without time for a child** — the crop would not be the one `app` sends;
- **one field "kind of sample"** — it would mix the purpose, who wrote and the provenance, and synthetic samples are needed in every composition;
- **a random ID for synthetic samples** — one seed must give the same file byte for byte;
- **one crop, with the runner drawing the other heights** — the comparison of heights would have two renders;
- **pressure in a measurement sample**, as the element records it and as `tutor`'s recording page does — no kind of a model's input takes it;
- **date, age, grade, device** — no check reads them. Whether a child's grade is needed is for П-10 to decide (В21);
- **a writer code in the eval set**.

— *Revisit:*
- if `spec`'s rule of checking, В8 or О-8 adds the history, the states or the group boxes to the check: eval-set samples are then recorded anew, they cannot be supplemented;
- when the eval protocol changes `Sample`: the file follows it, and `canvas` proposes its own change as a row «в реестр spec»;
- the groups — by the measurement's findings: eval-set samples keep the groups of their own version of `canvas`.

— *Consequence:*
- `src/core/history.ts` and `src/core/recorder.ts` — undo and the clearing of the sheet are written into the history;
- `src/core/groups.ts` and `src/core/boxes.ts` — the groups and the table of boxes on the raw history, labels by place;
- `src/core/crop.ts` — a crop at any digit height, with its parameters;
- `src/eval/sample.ts` and `src/eval/resample.ts` — the sample file of each composition; `src/eval/synthetic.ts` — synthetic samples in every composition, the ID from the seed;
- `page/markup.ts` and `page/steps.ts` — the markup and the writer code;
- [architecture.md](architecture.md) — the sample file;
- `tutor` takes the crops and the groups from the sample, and `modules` checks the purpose and "who wrote"; rows В20 and В21 «в реестр spec», additions to В7, В9 and В12.

## `spec` tag v0.2.14

**R10. `canvas` is on `spec` v0.2.14: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.13 v0.2.14`, read 2026-10-21). All that is new in it comes from the analysis "The base canvas and the contract 'canvas ↔ agent'" («Базовая канва и контракт „канва ↔ агент“», sources 1.5), which `spec` takes into its product's description and its architecture:
  - what the widget protocol has to decide beyond the widgets' iframe sandbox: a channel through a `MessageChannel` port, a version of the state in each message of the widget, the widget's parts for the tutor's marks, "state, not verdict" and conformance tests in `spec` with a test host in `widget-template`. From stage 4 this is an input of the widget host — the protocol's side in the app, which `canvas` holds by its card in `spec/docs/architecture.md`. This does not depart from the widget layer in [architecture.md](architecture.md): it waited for the protocol's detailing, and now it names what of it the host needs. One thing is unclear — В22: `spec` gives the protocol's side in the app to "`app`", but does not say whether the host passes the conformance tests. `spec`'s epic E5 decides the protocol;
  - О-21 — a hint at the learner's request. It touches `canvas` at the edge. Before the first submission the recommendation gives what the module gives to the solving steps, and a sketch "how to begin", if the module gives one. The sketch is drawn by `canvas`'s tutor's layer, and before the first submission there is no crop, so the sketch's place is not addressed by it: it is decided with the first slice of `app` and `api`. Unsubmitted work does not go to reading, and the request button is `app`'s, so О-21 does not change the element's interface;
  - О-8 is supplemented with the option of a "live" mode — the tutor reads the work by itself, by the canvas's events —, and it is to be decided by the data of `tutor`'s measurement. The recommendation is as before: a check only by the button. The element's event `historychange` carries the writing history for `app`, not for reading, and `canvas`'s epic E2 puts off the "live display" until the measurement's findings anyway;
  - Т-30 — the withdrawal of a version of a module or of a widget. It touches `canvas` in two places. From stage 4 — the widget host, which will not learn of a withdrawal by itself: it knows neither `api` nor the index, and this is decided at `app`, as the widget layer in [architecture.md](architecture.md) says. And already now — the samples page's build: `canvas`'s CI puts a module's tasks into it from a release of `modules`, and Т-30 says nothing of it — В23;
  - `spec`'s plan takes as its input the recommendation of [architecture.md](architecture.md) to give the answer of the text canvas as it was typed. The source is named the same there and here: the same analysis;
  - the sample file's composition, decided on v0.2.13, does not change with the tag: none of these points touches it. And О-8 now bids deciding by the data of `tutor`'s measurement on reading at a pause, and these come from the measurement samples with the writing history, which the composition kept;
  - the rest is about other components: О-21 in the format of hints, withdrawal in the module index, attempts on a withdrawn version in `api`, the module registry, `spec`'s epic E5, its glossary and the prototype `draft/`. It changes no other document of `canvas`;
  - `repo-template/`, `tools/new-repo/` and `.devcontainer/` did not change between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.14, commit f5f438e. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md are v0.2.14. The log's opening and the earlier entries still say what was before: it is history;
  - [architecture.md](architecture.md): the widget layer from stage 4 — what the host needs of the widget protocol, with a link to it in `spec`; the text canvas's input — that `spec`'s plan takes it; the publication — a withdrawn version of a module in a released build of the page (В23); the sources — where the same analysis is in `spec`;
  - the devcontainer does not change: the Dockerfile and the recipe `editDevcontainer` at v0.2.14 are the same as at v0.2.13.

— *Why now:* `canvas` moves to `spec`'s latest release, and the detailing reads the latest `spec`. And v0.2.14 brings the widget protocol, which `canvas` implements as the host from stage 4: what in it is unclear for `canvas` is better named while `spec`'s epic E5 has not begun. v0.2.14 is `spec`'s latest release as of 2026-10-21, and immutable (`gh release list -R altnovatrail/spec`); `gh release verify v0.2.14 -R altnovatrail/spec` confirmed it by its attestation, and the tag is on the commit f5f438e.

— *Rejected:*
- staying on v0.2.13 until the detailing's summary: the detailing would read `spec` without О-21, Т-30 and what the widget protocol has to decide, and В22 and В23 would wait for the next move;
- deciding О-21, Т-30 or the widget protocol here: these are questions of `spec`'s registers and of its epic E5, and a question of more than one repository belongs in `spec`. Here — only what they mean for `canvas`, and what is unclear — as rows «в реестр spec»;
- rewriting the decision on the drawing engine for the widget protocol: it did not decide the protocol — only the widget's place in the stack of layers and how the tool distributes input, and the protocol's new points do not change that.

— *Consequence:* Д2 stays as it was: the move does not change the devcontainer's image. The new rows are В22 and В23, both «в реестр spec». The files: `spec/`; CLAUDE.md, RUN.md and README.md — the tag and the links; [architecture.md](architecture.md) — the widget layer, the text canvas's input, the publication and the sources.

## Detailing — continued

**R11. The samples page: the purpose is chosen on the page itself, and the page takes no consent. It shows the notice of the purpose and writes into the file the version of the purpose's text set, and the written consent is a signed form, which the organizer accepts before the first sample or session. A purpose is open only with a text set in force: until then only the author's measurement is open, and the eval set and the child sample session are closed. The age is a declaration «мне 18 лет или больше, и по законам места, где я живу, я вправе заключить этот договор», and the writer code is one per person.**
- **The purpose** — the measurement or the eval set — is chosen on the page, at each opening and before writing, and the page does not remember it. There is one build, the release's file, for adults' and children's samples alike. It opens a purpose and the child sample session only if it carries a text set in force for them.
- **The text set** — a set of the part `legal` from `spec`'s release file `legal-1.tar.gz`: the samples page notice and the consent form. Each purpose has its own — `measure`, `eval-set` and `child-sample` —, with its own version, which does not depend on the language. The file gets the version of the purpose's set as the "consent's text version": the ID and the number joined by a hyphen, `measure-1`. A version is a draft or in force, and the author puts it in force. The legal texts are in English, the English text is the one in force, and a screen in another language says that the text is in English.
- **Consent — as in MathTrail's canvas-api:**
  - the page takes no consent: it shows the notice of the purpose;
  - the written consent is a signed form outside the page. The organizer accepts it before the first sample or session, and the person declares on the page that this is done;
  - what holds this is not the page but the acceptance of files and the checks by the fields. The measurement's organizer, `tutor`'s runner and `modules`'s CI check the version of the text set and "who wrote". The page is a barrier of the interface, not a boundary, like the PIN in П-17.
- **While the purpose's set has no version in force:**
  - the measurement — only the author's own samples, by `canvas`'s draft `draft-0`. The author declares that the samples are their own and needs no form. The page says so, and the acceptance of files holds it (`tutor`'s В9);
  - the eval set is closed in every build until there is a text in force by П-16;
  - the child sample session is closed until its text is in force. The texts are written by `spec`'s epic E4, «Приватность до первого ребёнка»; `canvas`'s own epic E4 opens nothing here;
  - a test set in force exists only in the tests and in a page of version `0.0.0`: the release's paths do not take it, and it does not go into a release.
- **The age** is a declaration «мне 18 лет или больше, и по законам места, где я живу, я вправе заключить этот договор», with no year of birth (П-6), in the draft set and in the test one; it does not change the sample file's composition. "Adult" in `spec` is the category "18 and over". Whether this is enough for consent and for a license to one's own work in every country is a legal question, which the author decides on Claude's analysis (В21).
- **The writer code** is one per person, and only in the measurement and the child's session. The page makes it but does not remember it: the person enters their code or asks for a new one. The adult gets the child's code in advance, without the child, and writes it into the consent form, and the organizer accepts the form with the code already in it. In each session the adult enters this code. The code is a pseudonym, not anonymity.
- **What the page remembers** about people — nothing: no codes, no purpose, no declarations. It asks for all of this at each opening.
- **The texts.** The documents set the meaning of the screens; the strings and the languages are the page's code, and the texts of the notice and of the consent are `spec`'s epic E4's. The platform has no lawyer: legal questions are decided by the author on Claude's analysis. Where the text sets lie and who approves them is В24.

How it is built — the samples page's steps in [architecture.md](architecture.md).

— *Why:*
- **The purpose on the page.** The measurement will run on `modules`'s tasks too, once they have content (В6), so the source of the tasks does not set the purpose. A second build for a second purpose is what `spec` rejected for children's samples, which are made with the same page. And a choice at each opening keeps one from publishing out of habit what was written for the measurement.
- **The notice and the form.** A mark on a page that anyone can download can be set by anyone. canvas-api decided the same: «`POST /v1/me/consent` только отмечает, что уведомление прочитано», and the operator confirms the consent by a signed form (sources 1.1). The version in the file links the sample to the text the person saw.
- **The form before the first sample.** In canvas-api «до `verified` профили детей и холсты не создаются» (sources 1.1): data appear after the consent, not before it.
- **The eval set is closed until П-16.** A pull request publishes a sample at once, and it cannot be removed afterwards. Even after the history is rewritten, the commits stay accessible "through any pull requests that reference them", and GitHub Support does not delete data that are not secret (sources 8.3). Samples for eval sets are not accepted anyway until П-16 is decided (`.github`'s CONTRIBUTING, sources 5.7).
- **The child's session is closed until its text is in force.** Where a child sample's file goes and who has access to it is for П-10 and П-12 to decide. Until they are decided, there is no one to accept a child's data.
- **A declaration, not a year of birth.** П-6 advises so, and so it was in canvas-api: «отметка 18+ при согласии» (sources 1.1). A year of birth is superfluous data, and the page cannot check it anyway.
- **The code per person, not per device.** By the code the runner accounts for the link between the sheets of one writer, and by a child's code the consent is withdrawn and the samples are deleted on schedule. On a shared tablet a device's code would be shared, and a consent withdrawal by it would touch other people's samples, and a person with two devices would have two codes. The page remembers no codes, so on a shared tablet no one will see or choose someone else's code. The child's code comes before the form: the form is accepted before the session, and the code must be in it by then.

— *Rejected:*
- **the build sets the purpose** — by the source of the tasks or by a parameter: the first breaks when the measurement moves to `modules`'s tasks, the second means two builds, where the release carries one;
- **a mark on the page as the consent itself** — anyone can set it, and П-16 and П-10 speak of a written consent;
- **the page says nothing of consent** — the person would not learn what is in the file and where it will go;
- **the eval set with a draft text** — a pull request publishes at once;
- **the child sample session with a draft** — until П-10 and П-12 are decided, there is nowhere to pass the file;
- **a year of birth** — superfluous data;
- **a code per device** — it mixes people on a shared device;
- **the page remembers codes and offers "this is me"** — on a shared tablet someone else's code is visible, and it can be chosen;
- **the page makes the child's code in the first session** — by then the form has already been accepted, and it has no code;
- **a code from the organizer** on the form — the page makes the code, as the sample file holds it.

— *Revisit:*
- when a release of `spec` puts a purpose's set in force — the move to its tag opens the purpose, with no change of the code;
- if the page moves to hosting (Т-17) — what it says about the IP address.

— *Consequence:*
- `page/` — the choice of the purpose, the writers' codes, "who wrote" for each sample, the barriers by the text sets and the test set, with the screens by the samples page's steps in [architecture.md](architecture.md); the age declaration in the draft set and in the test one, and no "lawyer" in the draft set or in the page's code comments;
- `probe/` — the probe on devices: where downloads land and whether that folder syncs with a cloud; whether the storage of a page from a file is kept when the file's name is new;
- the checks on devices — both the release's build and a test build with the test set, to check the screens closed in the release;
- `.github/workflows/release.yml` — its job `notes` puts at the start of the release's description, once the shared `release.yml` has written it, a paragraph that GitHub sees the IP address of whoever downloads: the shared one takes no text of the caller's;
- `canvas`'s card in `spec/docs/architecture.md`, as a row «в реестр spec» — the samples page has the purpose "measurement", and a measurement's file goes to the organizer, not into `modules`;
- **`tutor`** — the runner checks the version of the text set and "who wrote"; **`modules`** — its CI too, and who opens the pull request is for `modules` to decide;
- RUN.md — В24 «в реестр spec», additions to В9 and В21;
- [architecture.md](architecture.md) — the format of the samples, the samples page's steps and the sources.

## The first code

**R12. The first code of `canvas` is the package `@altnovatrail/canvas` at the root of the repository, on npm, which comes with Node. It has two entry points: `@altnovatrail/canvas` — the element, `@altnovatrail/canvas/core` — the DOM-free part. The build is `tsc` of TypeScript 7.0.2 into `lib/`, formatting and linting are Biome 2.6.6, the tests are Vitest 5.1.0 in Node and in Chromium, WebKit and Firefox. The recipes `ci-lint`, `ci-test`, `ci-engines`, `ci-vuln` and `ci-licenses` follow the contract of the TypeScript wrapper, the licenses are checked by `spec`'s recipe, and the versions are the latest of those released no later than three days before the installation, but for those that `spec` or another package sets. The shared workflows of `.github` are on one release.**
- **The package** — `package.json` and the lock file at the root, and `.npmrc` sets `ignore-scripts=true` and `save-exact=true`, as the contract of `.github`'s TypeScript wrapper asks:
  - `exports`: `"."` leads to `lib/element/index.js`, which registers `<novatrail-canvas>` on import, and `"./core"` to `lib/core/index.js`, with no DOM. Each entry point has its own declarations. `sideEffects` names only the element's entry point: otherwise the consumer's bundler would drop the registration;
  - `name` is `@altnovatrail/canvas`, and `version` is `0.0.0`: the release's recipe `release-files` writes in the number. `repository` is `git+https://github.com/altnovatrail/canvas.git`, which trusted publishing checks. `files` is `lib` and `NOTICE`;
  - `dependencies` — perfect-freehand 1.2.3 and rbush 4.0.1, the outline of the ink and the index of strokes of the drawing engine, and `@altnovatrail/spec`, the types of the module format: declarations only, and the package's declarations refer to them. `devDependencies` — typescript 7.0.2, @biomejs/biome 2.6.6, vitest, @vitest/browser-playwright and @vitest/coverage-v8 5.1.0, vite 8.3.6, playwright 1.65.0, @types/node 24.19.2 and @types/rbush 4.0.0; `@iconify-json/material-symbols` 1.2.99 and `@iconify/utils` 3.1.7, with which `scripts/icons.ts` writes the icons of the row's buttons into `src/element/icons.ts` and writes `NOTICE`; `@altnovatrail/contracts`, the code of `spec`'s contracts and the test vectors of the rules the device and the runner share, which the tests and the sample file take; and `@bufbuild/protobuf` 2.17.0, with which the sample file's module `src/eval/` writes and reads the message `Sample` of that code. The module is outside the package: `tsconfig.build.json` does not build it, and the package is without these two dependencies.
- **Versions.** Each is the latest of those released no later than three days before the installation, like Dependabot's pause `cooldown`. The lock file was built by `npm install --before=2026-11-09T00:00:00Z`, and the date applies to the transitive packages too. So it holds Biome 2.6.6, not 2.6.7 of 2026-11-11, and Vite 8.3.6, not 8.3.7 and 8.3.8 of 2026-11-09 and 2026-11-11. Four packages are taken without the pause, at the version that something else sets, and Dependabot does not touch them:
  - `@altnovatrail/spec` and `@altnovatrail/contracts` — at the version of the tag of the submodule `spec/`, and a move to a tag moves them with it: the tag sets the version, `release-verify-npm` checks the signature, and `@altnovatrail/spec` has no dependencies of its own;
  - `@bufbuild/protobuf` — at the version that `@altnovatrail/contracts` pins exactly (sources 6.10): with another one the lock file would hold two copies, and the sample file's module writes and reads the contracts package's messages with the one that package installs. It moves with `@altnovatrail/contracts`, by a move to a tag of `spec`;
  - `@iconify-json/material-symbols` — at the version a row of spec's COORDINATION.md names, not the latest past the pause: `app` builds in `canvas`, `skill-map` and its own icons at one version of the set, and a raise by each one's Dependabot would let the three drift apart (sources 5.10). `just icons` then writes the icons and `NOTICE` by the new set.
- **The build** — `tsc -p tsconfig.build.json` into `lib/`: JavaScript and declarations, and `lib/` is cleaned before the build. The package has no bundler: the consumer's bundler resolves the dependencies. `dist/` stays for the release's files, and the samples page is built into one file by a builder of its own.
- **Types** — three programs of `tsc --noEmit`, each with `lib` and `types` set explicitly. Since TypeScript 6 `types` is empty by default, and `rootDir` is the config's folder.
  - the DOM-free part sees only ES2022 — neither DOM nor Node. This holds the promise of the drawing engine and of the element's docking: the DOM-free part is the same in a browser and in Node;
  - the element sees ES2022 and DOM, and so does `demo/main.ts`;
  - the scripts, configs and tests see Node too, and so does `demo/vite.config.ts`.

  The negative checks are the files `*.check.ts`, which the build does not take. `document` and `process` in the DOM-free part and `process` in the element must be errors, or else the unused `@ts-expect-error` becomes an error. The root `tsconfig.json` refers to the three programs, and the editor takes a file's own program for it. Imports in `src/` are with `.js`: `rewriteRelativeImportExtensions` rewrites `.ts` only in JavaScript, and would leave `./sheet.ts` in the build's declarations. Node itself runs the scripts, by type stripping, and they import `.ts`.
- **Formatting and linting** — Biome, the set `recommended`, an indent of two spaces, a line of 100 characters, as in the Dockerfile and `spec/tools`. Biome looks only at the code and its configs, `demo/**/*.ts` among them: not `spec/`, not `.devcontainer/`, not the lock file.
- **Tests** — Vitest, two projects, each with its own `include`: `spec/tools` has tests of its own.
  - `node` — the DOM-free part and the scripts;
  - `browser` — the element, through `@vitest/browser-playwright`, in Chromium twice — with a pixel density of 1 and of 2 — and in WebKit and Firefox. The second Chromium is the same Chromium with `deviceScaleFactor: 2` in Playwright's context: a density that the DevTools protocol sets in the middle of a test tells the test's frame nothing. `headless: true` is set explicitly. This departs from the contract, by which `CI` turns headless on: there is no display either in the container or on the runner, and without it `just ci` would fail in the container. In CI `CI` still keeps `test.only` out.

  After the build `scripts/package.ts` checks the package as a consumer takes it: the DOM-free part imports in bare Node by the package's name, both entry points and their declarations are in place, and `npm pack` takes only `lib/`, `NOTICE`, `package.json`, README and LICENSE. In `.gitignore` `/.vitest/` stands beside `__screenshots__/`: Vitest 5 puts the screenshots of failed tests there.
- **The recipes** — the `justfile` at the root:
  - `ci-lint` — `biome ci`, the three programs of `tsc`, and the check that the icons and `NOTICE` are what `scripts/icons.ts` writes;
  - `ci-test` — the build, `vitest run` in Node and in Chromium, and the check of the package;
  - `ci-engines` — `vitest run` in WebKit and Firefox;
  - `ci-vuln` — `npm audit --omit=dev --audit-level=high`, as the wrapper's contract recommends and as MathTrail's `canvas-api` does;
  - `ci-licenses` — `just -f spec/justfile licenses-check-repo package-lock.json licenses.json`, then `spec`'s recipe `release-verify-npm package-lock.json`;
  - `ci` — all five, for the developer; also `build`, `fmt` and `demo` — the page `demo/`, on which the author tries the element by hand, on Vite's development server.

  `ci-lint`, `ci-test` and `ci-engines` install the packages themselves, `npm ci --ignore-scripts`, with a stamp from the sums of `package.json` and the lock file, like `spec`'s `_tools`. In CI they always install, in the container when something has changed. Binaries are taken only from `node_modules/.bin`.
- **The license check** — `spec`'s recipe `licenses-check-repo`, and `canvas` has no script of its own:
  - **what is `spec`'s:** the list of category A, the parsing of SPDX expressions and the rule of exceptions, at the submodule's tag. An exception for a license off the list holds only a package the lock file marks `dev`, and it covers too the builds for platforms that the tool itself names in `optionalDependencies`, while they are `dev` and under the same license. A lock file without `packages` is refused: an old lock file would pass with nothing checked. The list follows `canvas`'s tag of `spec`, not a release of `.github`, and the check reads no `ALLOWED_LICENSES`;
  - **what is `canvas`'s:** the exceptions — `licenses.json` at the root, the name that `.github` and `spec/justfile` recommend. The format is JSON, as `spec` set it: a package has `license` — what the lock file says — and `reason`, and the reason itself names the decision. There are no other fields, and a file of the wrong shape stops the check. There is one exception — `lightningcss`, a tool under MPL-2.0 that the lock file marks `dev`, with its builds;
  - **the signatures:** after `licenses-check-repo`, `release-verify-npm` holds every package of `@altnovatrail` in the lock file to the signed file of its release, as the signature rule of RULES.md bids. The recipe installs `spec/tools` from `spec`'s lock file and goes to Sigstore, the npm registry and GitHub, and when one of them does not answer, the package is refused.
- **Dependabot** — an entry `npm` in `/` by `.github`'s template of `dependabot.yml`, with a pause of three days, and under `github-actions` the group `shared-workflows`, `altnovatrail/.github/*`, as that template has it: every reference to a shared workflow in one pull request, to one release, where Dependabot opened one per file and once left two of the seven untouched. The entry `npm` has three additions:
  - the group `vitest` — `vitest`, `@vitest/*` and `vite`: `@vitest/browser-playwright` and `@vitest/coverage-v8` require `vitest` exactly at their own version, and Vite, which Vitest runs on and `just demo` serves with, moves with them;
  - `ignore` of the major versions of `@types/node`: they follow Node in the Dockerfile, which is raised by hand;
  - `ignore` of `@altnovatrail/spec`, `@altnovatrail/contracts`, `@bufbuild/protobuf` and `@iconify-json/material-symbols`: their versions are set elsewhere, as "Versions" says.

  `playwright` comes in a pull request of its own. It is red until the image and the browser's revision are raised by hand in `.devcontainer/Dockerfile` in that same pull request.
- **CI.** All seven references to `.github`'s shared workflows — `secrets.yml`, `dco.yml`, `documents.yml` and `typescript.yml` in `ci.yml`, `codeql.yml`, `scorecard.yml` and `release.yml` — are at one release, v0.1.33, by the SHA f1c7e9e, and `gh release verify` accepted it. `canvas` does not call `go.yml`.
  - The job "TypeScript" in `ci.yml` gives `typescript.yml` `id-token: write`: its job `coverage` sends the coverage report of `ci-test` to Codecov by OIDC, as the check "TypeScript / coverage", which the ruleset `main` does not have, and the merge is held by `codecov/patch`. It gives the input `engines` too: WebKit and Firefox are the check "TypeScript / engines", by `ci-engines`, beside `ci-test`, and the ruleset `main` requires it. Until a check is in the ruleset, a red one still holds the merge through `codecov/patch`: the job `coverage` waits for every check, and without its upload `codecov/patch` does not come.
  - In `typescript.yml` the job `toolchain` alone builds the image on a miss and hands it to the checks by an artifact of the run; it and `documents.yml` save the cache only on a push to `main`, by the path of `spec`'s `toolchain.sh`, `novatrail-toolchain.tar` (sources 6.14). The release builds the stage `toolchain-core`, and "TypeScript / lint", "vuln" and "licenses" and `documents.yml` run in it (sources 6.16). The job `licenses` takes the submodule `spec` — all of the caller's submodules, and `canvas` has one —, and the other jobs run without `spec/`. Only `CI` goes from the step's environment into the container, and the wrapper passes no `ALLOWED_LICENSES` (Д6 in `.github`'s RUN.md), which the license check does not read.
  - `codeql.yml` calls the shared `codeql.yml` with the input `languages: javascript-typescript` (Д9 in table 4 of `spec`'s RUN.md) and sets no `paths-ignore`. `release.yml` sets no `previous-file`; the shared one checks a number npm has held by `time.unpublished.versions` too, and signs the files eight at once, held to one attestation.
  - The composite action `toolchain` of `.github` is not taken: it gives a job of the caller's own the image and the caches of Go by the keys of `go.yml`, and the jobs of `page.yml` and `emulators.yml` take the image of `typescript.yml`, by its key, and run no Go (sources 6.19).
  - `canvas`'s own session writes its CI files, and a raise of the references is recorded in this entry, as `spec` decided for a repository with code.
- **README.md** has no section of installing and no command: it holds only what the component is and its place in NovaTrail, and the commands are run by agents, not people. The two installs at exact versions, the check of the lock file by `release-verify-npm` and why a consumer's version of `@altnovatrail/spec` goes by the tag of the consumer's own submodule `spec`, not by `canvas`'s `dependencies`, are in [docs/README.md](README.md): the contract's types are structural, and `tsc` catches a mismatch of shape at the seam (Д186 in `spec`'s RUN.md).
- **The code's skeleton** — the sheet's size 1000 × 1400 in the DOM-free part and the class `NovatrailCanvas` with an open Shadow DOM. The element is registered once: a second copy of the module finds the name taken, changes nothing and writes a warning about it to the console — the page's elements are then built by the other copy, whatever its version.

The design — [architecture.md](architecture.md).

— *Why:*
- **npm** comes with Node 24.21.0 — that is npm 11.19.0 —, and the wrapper's contract requires no other. The repository has one package, and the root is the folder where the wrapper calls `just`.
- **Biome, not ESLint.** TypeScript 7.0.2 is a compiler in Go, without the classic API of `typescript`, and typescript-eslint 8.72.0 requires `typescript` below 6.1. With ESLint, TypeScript 6.0.3 would have to be kept beside it only for linting. Biome alone does formatting and linting and does without TypeScript, as in MathTrail's `canvas-api`.
- **A pause in choosing versions** — the same protection as Dependabot's `cooldown`: a version that is withdrawn a day later does not get into the lock file.
- **Three programs** — as in MathTrail's `canvas-api`, where the scripts' program does not see the DOM. Here, in addition, the DOM-free part sees neither DOM nor Node.
- **`spec`'s recipe for the licenses.** Repositories take the list and the check of npm's lock file by `spec`'s recipes, so the rule lives in one copy, and Д16 in `spec`'s RUN.md bids `canvas` move. The job `licenses` of the wrapper takes the submodule, which CI would otherwise not have. **Checked** on `main` abd723a with the move's edits: the recipe with `licenses.json` answers "ok — 115 packages, 1 exceptions". Without the exception — 12 refusals, and if `lightningcss` is not `dev` — 12 too: itself and its 11 builds. A package under GPL-3.0-only is refused too, and so is an exception that has nothing to accept, and a file with the field `decision` stops the check with code 2. Each `ci-*` ran in a copy of the tree, through `env -i` — only `PATH`, the path to the browsers, a temporary `HOME` and `CI=true`, with no `ALLOWED_LICENSES`. `ci-lint`, `ci-test` and `ci-vuln` ran without `spec/`, `ci-licenses` with it. All four are green, and without `spec/` `ci-licenses` refuses and names `spec/justfile`.
- **`--omit=dev`.** An advisory on a tool that ships nowhere would hold up every merge, as `canvas-api` found. Advisories on tools come with Dependabot's alerts, and `canvas` has them on: `vulnerability-alerts` in GitHub's API answers 204, 2026-10-21. So Scorecard's alert #35, Vulnerabilities, stays open: GHSA-fc5q-39xc-vjpf, a ReDoS in `picomatch` up to 4.0.7, which only Vite and Vitest bring in, `dev` in the lock file, and no version past 4.0.7 is out (sources 7.13). `picomatch` matches the globs of the tests and of the dev server, written in this repository, not input from outside, and nothing that ships holds it, so `ci-vuln` rightly passes.
- **One release of `.github` for all seven references**, the latest: references at different releases would force reading each release separately, and the group `shared-workflows` raises the next release as it did this one (sources 6.13, 6.16).

— *Rejected:*
- ESLint 10 with typescript-eslint and Prettier — for the reason above;
- the entry points `/element` and `/core` with no root — `app` would write an extra path, and registration on the package's import is the usual way of a web component. A single entry point is rejected too: the DOM-free part could not be imported in Node;
- a bundler for the package — Vite, tsdown, esbuild: `tsc` is enough for a library, and the consumer's bundler will resolve the dependencies. Vite only serves the page `demo/`, which is not built;
- the latest versions on the day of installation — Biome 2.6.0–2.6.2 came out hours before it, three releases in a row;
- `headless` by `CI`, as in `.github`'s probe — in a container with no display `just ci` would fail;
- a full `npm audit` in `ci-vuln` — for the reason above;
- keeping `scripts/licenses.ts` beside `spec`'s recipe — the rule would again live in two copies, which is what `spec` rejected in giving the recipes;
- taking only the list from `spec`, `licenses-allowed`, and checking with a script of its own — the bound `dev` and the builds would stay in `canvas`'s copy;
- a Dependabot group across several ecosystems for the pair of `playwright` and the image — GitHub's documentation does not say what then happens to the entry's other packages;
- `.ts` imports in `src/` with `rewriteRelativeImportExtensions` — the build's declarations would refer to `.ts` files, which the package does not have;
- waiting for Dependabot's pull requests to raise the references — without the group they come a pull request per file, each a round of checks (Д88 spec), and the pause of three days checks nothing here: only `canvas` calls `typescript.yml`, and the pull request with the raise checks the wrapper;
- a raise of the references apart from the change that needs it — the job `licenses` of a release without `spec/` would turn "TypeScript / licenses" red, and a release without the input `engines` rejects it, while without the input `ci-engines` would run nowhere in CI;
- `overrides` of `picomatch` to a version that does not exist; dismissing its alert as a false positive — the package is affected.

— *Revisit:*
- `target` and `lib` ES2022 — when the devices' browsers are known;
- the TypeScript 7 extension for the editor: the TypeScript built into VS Code is of another version, and the judge is `ci-lint`;
- Scorecard's alert on `picomatch` — once Vite and Vitest take a fixed `picomatch` and Dependabot raises them.

— *Consequence:*
- `src/core/` and `src/element/` hold the code, and the tests `*.test.ts` beside it; the element's tests run in the project `browser`, and the synthetic samples are drawn with the DOM-free part;
- the release takes `lib/` and `NOTICE` through `npm pack`, and `release-files` writes in `version`;
- if the package's declarations begin to refer to rbush's types, `@types/rbush` moves to `dependencies`: otherwise for `app` they will be `any` or an error;
- `package.json`, `package-lock.json`, `.npmrc`, `.gitignore`, `tsconfig*.json`, `biome.json`, `vitest.config.ts`, `justfile`, `licenses.json`, `NOTICE`, `src/`, `scripts/`, `demo/`, `.github/workflows/`, `.github/dependabot.yml`, `.claude/rules/ci.md`, CLAUDE.md, README.md, [docs/README.md](README.md); [architecture.md](architecture.md) — the design of the package, its tools and its CI.

**R13. `canvas`'s container is the output of `spec`'s template for the kind `typescript`, byte for byte, in three stages. `toolchain-core` holds the base image, Node, just, Go and buf; `toolchain` over it adds Chrome Headless Shell 1254, WebKit 2388 and Firefox 1572 from the Playwright image v1.65.0, pinned by tag and digest, and their system libraries from the snapshot 20261021T000000Z of the Ubuntu archive; `devcontainer` over that adds the Biome extension 3.8.1. Chrome Headless Shell is a build of Google Chrome for Testing under Google's free terms, WebKit and Firefox are under open licenses, and each is a named exception for a tool that ships nowhere.**
- **The stages.** `toolchain-core` — the base image, Node, just, Go and buf 1.75.0, with its sums for both architectures: with buf `spec`'s recipe `sample-check` checks the sample files by the image of the contracts in the submodule. The release and the checks that start no browser run in it. `toolchain` adds the three browsers and their system packages, which the tests and the emulators need, and `devcontainer` the Biome extension. `devcontainer.json` names the container in its network, `--network-alias=canvas`. `.devcontainer/` is what the template's recipe `new-repo-draft` writes for `canvas` of the kind `typescript` (sources 6.11, 6.15).
- **The browsers.** `COPY --from=mcr.microsoft.com/playwright:v1.65.0-noble@sha256:9beb546099e11f52d62e505537914870e01a67e0e6b00ae41da4775324e73dbe`, with amd64 and arm64, takes only `/ms-playwright/chromium_headless_shell-1254`, `webkit-2388` and `firefox-1572` — the builds Playwright runs in headless mode. The revisions are `ARG`s by `browsers.json` of `playwright-core` 1.65.0, the digest is the tag's index in MCR, read 2026-11-12, and `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` lies outside `HOME`. FFmpeg and the full Chromium with `WidevineCdm` are not copied: the tests do not run them. The folder of Chrome Headless Shell took 273 MB at revision 1248 (sources 7.7).
- **The libraries** — the lists `chromium`, `webkit` and `firefox` for Ubuntu 24.04 in Playwright 1.65.0's `nativeDeps.ts`, each package once — Chromium's 21 first, the same as in 1.64.1, then what WebKit and Firefox add —, and Playwright's fonts, `libfontconfig1`, `libfreetype6` and `fonts-liberation` among them, as in `.github`'s probe. apt reads the snapshot alone, `ARG UBUNTU_SNAPSHOT=20261021T000000Z`, by a source of its own in a folder of its own, not the base image's sources with `--snapshot`.
  - So each package has an exact version — the one the archive had on that date —, and `apt` checks the archive's signature itself. This is the recommendation of В21 in `.github`'s RUN.md, and `spec` makes the snapshot a rule of every repository.
  - In the container, on empty lists, the snapshot worked for Chromium's libraries: 61 new packages, with no conflicts.
- **Integrity** — by the rules: the image is pinned by tag and digest, as the hard rule of exact versions asks, and Playwright publishes no sums of its downloads, as `.github`'s TypeScript wrapper records for its browser.
- **How it is raised.**
  - The image's tag is the version of the package `playwright` in the lock file, and each revision is the one `browsers.json` of that version names. Otherwise Playwright finds no browser, and `ci-test` fails: "Executable doesn't exist at /ms-playwright/chromium_headless_shell-<revision>/…"; a missing WebKit or Firefox fails `ci-engines` too, though the Dockerfile's comment, the template's, names `ci-test` alone.
  - Dependabot reads only the `FROM` lines in the Dockerfile, and the image stands in `COPY --from`. So the tag, the digest and the three revisions are raised by hand, together. `spec` raises them in the template, and `canvas` gets them by its move to the tag; if a new `playwright` is needed sooner, all are raised here first, in the Dependabot pull request that raises the package, and a row «в реестр spec» asks the template for the same.
  - The same edit raises the snapshot. It is also raised if the build fails after a new digest of the base image.
- **The browsers' terms.**
  - `ABOUT` in the folder of Chrome Headless Shell: "Google Chrome … Copyright 2026 Google LLC. All rights reserved … See the Terms of Service at chrome://terms". At revision 1248 the binary called itself "Google Chrome for Testing 156.0.8078.4" (sources 7.7).
  - Playwright v1.64.1 downloads it from `cdn.playwright.dev/builds/cft/…`: this is a build of Chrome for Testing, not Chromium from source, though Playwright's `docs/src/browsers.md` writes of "open source Chromium builds". For arm64 the source is the same, `linux-arm64/chrome-headless-shell-linux-arm64.zip`, but that binary was not opened here: the image was built only on amd64.
  - Chrome's terms are the Google Terms of Service and Chrome's Additional Terms of Service: "These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS" and "Most source code for Chrome is available free of charge under open source software license agreements". The list of these licenses is `LICENSE.headless_shell` in the folder, and Chromium's BSD-3-Clause comes first in it.
  - The browser ships nowhere and puts nothing of its own into what ships: it only runs the tests. So it is a named exception of the shared rule of licenses, which accepts free terms for a CI tool, for open source or for everyone, within two bounds, and names Chrome Headless Shell as the first such tool. `canvas` keeps both: NovaTrail does not distribute the browser — the image of the stage `toolchain` with it is published nowhere —, and the package is built, run and deployed without it. Google's terms for CI are accepted by the author as the organization's representative, and by a contributor who runs the tests in their own container, themselves.
  - WebKit is under LGPL-2.0-or-later and BSD-2-Clause, Firefox under MPL-2.0: CI tools that ship nowhere, which `spec`'s rule of licenses names too.
- **The Biome extension** 3.8.1, as the template has it — MIT and Apache-2.0. The extension runs Biome from the project's `node_modules`, and Biome is the default TypeScript formatter.
- **The cost.** The stage `toolchain` is built by the checks that start a browser, the tests of "TypeScript / …"; the release and the checks that start none — "TypeScript / lint", "vuln" and "licenses" and Documents — run in `toolchain-core`, and Secrets, DCO, CodeQL and SonarCloud build no stage. The four "TypeScript / …" checks are required in the ruleset `main` beside Documents, so without MCR and `snapshot.ubuntu.com` the merge does not pass. With Chrome Headless Shell alone, on pull request #18, the step "Toolchain image" took 57–67 seconds in each of the five jobs that then built the stage; without the browser the same step takes 18 seconds: Documents on `main` 7756744. In `.github`'s probe the stage with the browsers built in 46–56 seconds against 21 without them (sources 5.4). The recipes themselves ran 1–6 seconds.

— *Why:* the probes and the build are in [plan/E2.md](plan/E2.md), and the browsers' terms are quoted above (sources 7.7).
- The browsers' path is the one `.github`'s probe went through and the contract of its TypeScript wrapper recommends, but only with the builds that run.
- The snapshot gives each package an exact version without a change of the base image, by one `ARG` line, as for Node and just (В21 in `.github`'s RUN.md).
- Chrome Headless Shell is the engine of Chrome on Android and the desktop. Playwright's builds under open licenses require more: Firefox under MPL-2.0 — 25 system packages, WebKit under LGPL-2.0-or-later and BSD-2-Clause — 52. They stand beside it: the element's tests run in all three engines, but for those that need the DevTools protocol, which run in Chromium.
- Playwright's WebKit is not Safari: it is built from WebKit's branch main, and Playwright "doesn't work with the branded version of Safari since it relies on patches" (sources 9.10). It will not show the behavior of Safari on iPadOS — WebKit's bug 269535 —, and Safari on the iPad stays with the emulators of `page.yml`.
- The stages come from the template's kind `typescript`, which `spec` keeps for every repository of the kind: a move to a tag of `spec` brings `.devcontainer/` as the recipe writes it, and `canvas` keeps no lines of its own there. The browsers are what `toolchain` adds to the core, and the release and the checks that start no browser build without them.

— *Rejected:*
- the whole folder `/ms-playwright`, as in the probe — FFmpeg and the full Chromium with the proprietary `WidevineCdm` would lie idle, and the terms of each would have to be named;
- the image in a `FROM` line, visible to Dependabot — it would come in a pull request of its own, red without its pair `playwright`, and with no pause `cooldown`: MCR's images have no release date;
- a sum of the browsers computed by `canvas` itself — a departure from `spec`'s rule that a download is checked against the sum its publisher lists, which `.github`'s wrapper keeps too;
- `apt` without versions, as in the probe — the hard rules require exact versions;
- the stage `toolchain` from the Playwright image — it has the user `pwuser` and a base image of its own (В21 in `.github`'s RUN.md);
- WebKit or Firefox instead of Chromium — they stand beside it, and the tests that need the DevTools protocol run in Chromium;
- `--shm-size` or `--ipc=host` in `devcontainer.json` — Playwright itself runs Chromium with `--disable-dev-shm-usage`, and the tests in the container pass without them.

— *Revisit* — if the stage's build in a pull request turns out noticeably dearer than in `.github`'s probe.

— *Consequence:* `.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`; CLAUDE.md, Environment; [architecture.md](architecture.md), publication and release and the code and tools; [sources.md](sources.md).

**R14. `lightningcss` under MPL-2.0 is a named exception of the license check, together with its builds for the platforms, as long as the lock file marks them `dev`.**
- It is Vite's CSS minifier: Vite 8 depends on it directly. Vite comes as a required peer of Vitest 5.0.5 and is a direct development dependency too, for the development server `just demo`. The lock file has `lightningcss` 1.33.0 and 11 builds that it names itself in `optionalDependencies`, all under MPL-2.0 and `dev`.
- It puts nothing of its own into what ships: `tsc` builds the package `canvas`, and Vite runs only inside Vitest and as the development server. There `lightningcss` does nothing either: the development server's CSS is processed by postcss, and Vite calls `lightningcss` only for minifying in a build, which the demo page does not have. The page is not in the package, and the check answers "ok — 115 packages, 1 exceptions". MPL-2.0 is OSI-approved and binds only the files of `lightningcss` itself.
- The exception lies in `licenses.json`, the file of exceptions of `spec`'s recipe `licenses-check-repo`: `"lightningcss": {"license": "MPL-2.0", "reason": …}`. The recipe holds the mechanism: by name and license, only for `dev`, and with the builds that `lightningcss` itself names — if they are `dev` and under MPL-2.0. The exception does not cover a package of a similar name that it does not name, and an exception that is not needed is an error.

— *Why:* an exception is by name only, for a tool that does not ship, and each comes with its own decision, as the shared rule of licenses and `.github`'s TypeScript wrapper say; MathTrail's canvas-api named the same. Without it "TypeScript / licenses" is red: 12 packages off the list, as in the probe of `.github` (sources 5.4), and as many here.

— *Rejected* — the recipe takes neither of these either:
- Vitest without Vite — it has the required peer `vite`;
- the builds by a pattern of the name, as in the probe of `.github` — the pattern would also cover someone else's package of a similar name;
- all 12 names as a list — each new build for a platform would need an edit of the exception, and `lightningcss` names them itself anyway.

— *Revisit* — if Vite builds the samples page that ships, `lightningcss` starts minifying its CSS. Even then it puts in no code of its own, but the decision is read again.

— *Consequence:* `licenses.json`.

**R15. `samples/` is closed to agents: a rule in CLAUDE.md, `/samples/` in `.gitignore` and the `deny` rules of Claude Code — on reading and writing the folder, the repository's own and that of each clone in `.epics`, and on shell commands that name it as a word of its own or as part of a path.**
- These are the three bans that `tutor` keeps on its folder of samples (sources 7.7), with one difference. The Bash rule of `tutor` is `*samples*`, and those of `canvas` are patterns of the folder's name, not of the word. The name is closed:
  - at the start of a command — `samples`, `samples *`, `samples/*`;
  - after a space or `/` — `* samples`, `* samples *`, `* samples/*` and the same with `/`;
  - in quotes — `*"samples"*`, `*"samples/*` and the same with `'`;
  - after `=` — `*=samples`, `*=samples *`, `*=samples/*`;
  - after `<` and `>` — `*<samples*`, `*>samples*`.
- The rules on reading and writing are `/samples` and `/samples/**`, from the working folder, and `//workspaces/.epics/*/*/samples` and `//workspaces/.epics/*/*/samples/**`, from the root of the file system: the container mounts the host's `.epics`, where a task across repositories keeps its clones, `.epics/<epic>/<repo>`, and the folder of a clone of `canvas` there is closed as this one is.
- `samples/` holds the samples with handwriting, which do not get into the repository: the file the author saves while trying the samples page on a device, and everything with handwriting in it. The synthetic samples are not there.
- `spec`'s documents check reads only the files that git tracks or that the repository's `.gitignore` files do not keep out of git, and does not go into `samples/`. Other walks of the tree — `grep -r`, `find .` — go there, and the rule of CLAUDE.md on them stands.

— *Why:* the bans are in place before the first sample, as `tutor`'s are. П-12 recommends not letting development agents near eval samples outside the repositories.
- The Bash rule is narrower than that of `tutor`: in `canvas` the word stands in the names of the release's files — `samples-page_v<X.Y.Z>.html` and `synthetic-samples_v<X.Y.Z>.<…>`. The patterns were checked on 16 commands with the folder — among them a path at the start of the command, in quotes, after `=` and in a redirection — and on 8 commands with these names and with recipes.
- `*` in a Bash rule matches any text; in a rule on reading or writing, `/samples` counts from the working folder and `//` from the root of the file system, and `*` is one level of folders (Claude Code's documentation, sources 7.7). A rule takes effect in the running session: the rule of `.epics` was checked on a folder of the same depth under `/tmp`, whose file it refused.
- The rule of `.epics` names the root of each clone, `*/*/samples`, not `**/samples`: a folder of that name deeper in another repository's clone is that repository's to close.

— *Rejected:*
- `Bash(*samples*)`, as in `tutor` — it would close `samples-page_v…` and `synthetic-samples_v…`;
- only the rule in CLAUDE.md — Claude Code would hold it by memory, not by a setting.

— *Consequence:*
- nobody names a folder of the code `samples`, at any depth: `*/samples/*` would close it too. The synthetic samples' folder is named otherwise;
- the rules are not an access boundary: a Bash rule, by Claude Code's documentation, "isn't a security boundary". So whatever needs the samples is run by the author;
- CLAUDE.md, `samples/`; `.gitignore`; `.claude/settings.json`.

## `spec` tag v0.2.18

**R16. `canvas` is on `spec` v0.2.18: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it. `spec` has recorded the rows «в реестр spec» В6–В28, and they are closed: the plan names its numbers instead of them, and the documents say what it decided.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.14 v0.2.18`, read 2026-10-22). The releases v0.2.15–v0.2.18 recorded the answers to the rows В6–В28 of `canvas` — by their recommendations, and В27 with two bounds (Д13 and Д17 in RUN.md of `spec`) —, the answers to the rows В17–В22 of `.github` (Д15 there) and a change about the files of CI (Д14 there). Where each row of `canvas` went, the opening of table 3 of RUN.md names. What changes the work of `canvas`:
  - **the source of the samples page's tasks** (В6, В25). `spec`'s decision on the samples page now says: as long as `modules` has no first content, the CI of `canvas` puts into the page's build the file of open views of the measurement's tasks from a release of `tutor` — by exact tag and sum, without keys, solutions and traps. With the first content of `modules` the source is again its release, through the CLI of `module-kit`. `tutor` puts out the file by a task of its own, when it moves to a tag that holds this. The same decision has the build opened from a file checked by the probe of a page opened from a file on devices, not by the detailing of the sample file. Hence the source and the dependencies of the task that puts the measurement's tasks into the page's build, and the table of the sources of tasks in [architecture.md](architecture.md), where the sample file is built;
  - **the element** (В15): `spec` decided that UI packages enter their consumer as web components — for `canvas` the one element `<novatrail-canvas>` for every canvas kind —, that the data types come from the releases of `spec`, that «прослушать» is voiced by `app` on the event `speak`, and that `app` holds the context of the submission. This is what this log decided on the docking with the consumer, and Т-21 is closed;
  - **npm** (В17, В18): `spec` decided that UI packages go to npm, `@altnovatrail/canvas` for `canvas`, as the same file that is signed in the GitHub release, by a step of the shared `release.yml` through trusted publishing. This is what this log decided on the publication, and Т-26 is closed. `.github` writes the step into its release workflow, and the release of `canvas` waits for it;
  - **the synthetic samples** (В7): `spec` decided that the CI of `tutor` takes them from a release of `canvas` by tag and sum. The release of `tutor` with the file of the measurement's tasks comes out first, and the synthetic samples of `canvas` come out in the same release as the page's build;
  - **free terms for a CI tool** (В27): `spec`'s decision on licenses and the shared rule of licenses accept free terms — for open source or for everyone — if NovaTrail does not distribute the tool and the platform can be built, run and deployed without it. Chrome Headless Shell, which the decision on the container brings in, is the first such tool;
  - the other answers are questions and plans of `spec` that `canvas` waits for, as it waited for the rows: Т-31 (В8), Т-32 (В13), П-18 (В21), the eval protocol in epic E3 of RUN.md of `spec` (В12, В20), the input of its tasks on the task's canvas in the module format v0 and on the TypeScript types the canvas's interface awaits (В14, В16), the additions to Т-27 and Т-30 (В19, В23), epic E4 (В24), the widget protocol's side in the app in `spec`'s architecture and epic E5 (В22), the terms of the crop and the stroke groups in `spec`'s glossary (В9), the mark in `spec`'s order of the first code that the code of `canvas` begins early (В10), Д12 (В26) and Д17 (В28 and the addition to В11).
- **Rules for all repositories** that `canvas` gets with the same tag:
  - what code adds to the calling files of CI is written by the session of the repository itself, and the checks in the ruleset are set by the author, or by the executor with the author's confirmation. The task that built the package's frame did just that, and for `canvas` the risk Д14 is lifted;
  - an `apt` package comes from a snapshot of the Ubuntu archive, with an `ARG` beside the list, and the snapshot is raised by hand — `spec`'s decision on system packages and its hard rules. The decision on the container already sets it so, and `spec`'s decision quotes the build of `canvas` in CI;
  - the list of licenses and the check of npm's lock file are `spec`'s recipes `licenses-allowed` and `licenses-check-repo`, with the bound `dev` and the builds for platforms, as in the license check of `canvas` and its exception for `lightningcss`. `canvas` moves to them by a task of its own: the wrapper of `.github` v0.1.5 runs the job `licenses` without the submodule `spec`, and the recipe cannot be found in CI until `.github` puts out a wrapper with it (Д15 in RUN.md of `spec`);
  - the runner calls the release recipes of another repository by the script `spec/tools/toolchain/toolchain.sh` from its submodule, at its tag. This is for the release of `canvas`;
  - `.github` and hyphenated names are a citation's suffix wherever a word boundary follows them. The wordings of `canvas` written around the former rule stay correct.
- **Devcontainer.** The `.devcontainer/` of `spec` did not change between the tags. The recipe `editDevcontainer` now appends the suffix `spec` to each decision that the copy's Dockerfile cites (Д15 in RUN.md of `spec`), and the template names the browser for the tests a decision of the repository itself, as the decision on the container does (Д17 there). In the Dockerfile of `canvas` the only such reference already has the suffix `spec`, and the other references in the comments of `.devcontainer/` are to this log's own decisions, so there is nothing to carry over.
- **What is changed here:**
  - `spec/` is at v0.2.18, commit 04ab0d2; the tag is in README.md, CLAUDE.md and at the top of RUN.md. CLAUDE.md also names the source of the tasks for the page's build, by `spec`'s decision on the samples page, and E1 is in the archive;
  - RUN.md: table 3 — the rows В6–В28 are removed, and its opening names where each went; the description of E2 — «Результат», «Основа», «Нужно», «Не входит», «Риски» and the order of the tasks; the tasks of E2 that leaned on the rows name the numbers of `spec`; in table 1 — the task of this move and the task of the license recipe, and the tasks of the move to the eval protocol, of the measurement's tasks in the page's build and of the release depend on this move; in table 4 — Д4: the source of the measurement's tasks is temporary, and the plan has no task yet for the move to `modules`;
  - [architecture.md](architecture.md): the purpose and bounds, the docking and the publication still to decide, the samples' format and how the component is built — what `spec` decided instead of rows of table 3; the sample file — the table of the sources of tasks; the publication and the code and tools — the recipes of the license check and the snapshot of the Ubuntu archive;
  - the decision on the first code — the license check moves to `spec`'s recipes —, and the decision on the container — the browser is taken by `spec`'s rule of free terms.

  The entries of history name the rows as they were: the body of the task that built the package's frame, «Решено автором» of E2, "What is known" in [architecture.md](architecture.md), and the entries of this log. The numbers of the rows are not reused.

— *Why now:* the rows «в реестр spec» hung open, and the sessions of `canvas` would plan without knowing the answers (Д13, Д16 in RUN.md of `spec`). The probe of a page opened from a file is planned next, and it reads `spec`'s decision on the samples page, which names that probe. v0.2.18 is the latest release of `spec` on 2026-10-22 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.18 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 04ab0d2.

— *Rejected:*
- staying on v0.2.14 until the move to the eval protocol: the rows would hang, and the measurement's tasks in the page's build and the release would wait for the move, though their answers were already out;
- moving to the license recipe in this same task: the job `licenses` of the wrapper v0.1.5 runs without `spec/`, and "TypeScript / licenses" would turn red on every pull request;
- leaving the rows in table 3 with the mark «записано»: a row «в реестр spec» goes, by the rules of the plan, once the question is recorded in `spec`.

— *Consequence:*
- RUN.md, tables 1, 3 and 4 and E2 — the move to the license recipe waits for a release of `.github` whose wrapper takes the submodule `spec`, in «Нужно» of E2; the move of the source of tasks to `modules` is Д4; table 3 has no rows «в реестр spec», and the next number is В29;
- `.devcontainer/Dockerfile` — each move to a tag still carries the edits of `editDevcontainer` by hand (Д17 in RUN.md of `spec`);
- CLAUDE.md and README.md — the tag;
- [architecture.md](architecture.md) — the purpose and bounds, what is still to decide, and how the component is built.

## E2 for the MVP

**R17. E2 is replanned for the MVP: first the handwriting sheet as the element `<novatrail-canvas>`, which the check board of `tutor` can take — input, undo of a stroke, clearing and the PNG of the work. The rest of E2 is deferred until the author decides, and goes to two epics for later: E4, the sheet for the product, and E5, the samples page and the big measurement.**
- **What is built for the MVP** — input by pen, finger and mouse, undo of a stroke and clearing, and the element with the PNG of the work and a trial consumer that does what the board does. The license check by the recipe of `spec` goes when the wrapper of `.github` comes out, and does not hold up the MVP. E2 is called «Лист для рукописи»: the samples page went to E5. The epic ends with the demo of the sheet: the author tries the element by hand and takes the measurements that the page for trials shows.
- **What is deferred** is the execution, not the decisions: the decisions of the detailing — the drawing engine, the sheet's coordinates, the element, the release, the sample file and the samples page — stay in force and wait for their work. The deferred tasks leave table 1 and become epics of table 2, after E2:
  - **E4, the sheet for the product** — the eraser and the writing history, the layers and the grid, the groups, the crop by A3, the marks, the full interface and input on tablets — the palm, pen mode, scrolling with two fingers and several touches at once: the MVP does not need them. The eraser and the full interface then complete undo, clearing and the element. Return — when the author decides what to build after the MVP; input on tablets waits for tablets too, not for that decision, and goes before the check on devices;
  - **E5, the samples page and the big measurement** — the sample file, the synthetic samples, the samples page and everything for it, the probe of a page from a file on devices, the release and the handover to the measurement: the big measurement is deferred (`tutor`'s В20). E5 goes after E4: the sample file needs the eraser and the crop, the build needs the interface, the devices need input on tablets. Return — when the author decides on the big measurement.
- **The archive.** The done tasks of E2 and the canceled task of the TypeScript wrapper in CI are in [docs/plan/E2.md](plan/E2.md), together with the description of the epic as of 2026-10-22, without waiting for its end, and the bodies of the deferred tasks went there too, word for word. An epic that is taken returns its tasks to table 1 with the same numbers: a task's body moves from the archive back into RUN.md, its item «Отложена» becomes «Возвращена», and in the archive a line stays in its place, about where and when it went. The author took both. In E4 the body of the package's interface names one canvas kind, as there is no text canvas. In E5 the item «Читать вместе с» of each returned body names the "Consequences" of the decisions of E4, E6, E7 and E8 that change it, and the return of the probe of a page from a file started the probe in the Android emulator, as the probe's planning decided.
- **Numbers.** E4 and E5 in this log are epics of `canvas`. `spec`'s epics of the same numbers, «Приватность до первого ребёнка» and «Виджеты и сторонние авторы», are named as `spec`'s: only `spec`'s epic opens a child's session.
- **The picture and the interface for the MVP** were the PNG of the work, as the board has it — the whole sheet 1000 × 1400, one pixel per unit, with an even line on white, drawn by the browser's drawing surface —, by the method `exportPNG()`, with undo, clearing and the event of change `workchange`. Not the crop by A3: the crop is scaled by the median height of the stroke groups, and the MVP has no groups; the board needs no crop, as the PNG of its whole sheet goes to the model. The board did not take the element, and the package had not come out, so the MVP's interface is no more: `exportPNG()` and `workchange` are removed, and the interface is the product's — the properties `task`, `media`, `history` and `marks`, the event `historychange` and `exportWork()`.
- **The board and the release.** The board of `tutor` does not take the element (В31): it stays on its own sheet 1000 × 600, as `tutor` records. There is no release for the board, and the release of the synthetic samples returns only with the big measurement. E2 for the MVP came out as its risk «доска может так и не взять элемент» assumed: the sheet is ready for `app` and the samples page. A return to the board — only by a new decision of the author.

— *Why:* the author's decisions. The message of `tutor` about the check board quoted the author's words: «на этапе MVP мне всего лишь нужно чтобы ты на канве показывал 5 статичных задач. Я сам буду их решать. Иногда специально ошибаться или писать неразборчиво. ИИ будет пытаться понять что я написал и выдавать свою оценку — решил правильно или с ошибкой. Далее я жму кнопку ИИ был прав или нет. Всё. Никаких проверок с твоей стороны не нужно вообще». In the planning of the probe of a page from a file on devices the author answered «Перепланировать E2 под MVP»; the sheet «как у доски»; the deferred tasks «отложена», with their bodies; the MVP ends with the element and a trial consumer. The last three answers follow the executor's recommendation.
- The board of `tutor` needs nothing from `canvas`, as `tutor` decided for it. And the big measurement, for which E2 built the samples page, is deferred together with the work of `tutor` that `canvas` waited for: the file of the measurement's tasks, the CI that reads the synthetic samples and the recording page.
- The sheet is what `app` takes from `canvas` first. So it is not deferred.
- **Epics for later.** The MVP is done, and the board did not take the element. The tasks that wait for the author's decision are work for later epics, not for the current one. The bodies are not written anew: they lie in the archive and come back with the tasks.

— *Rejected:*
- keeping E2 as it is: the samples page, the synthetic samples and the build from a file would be built for a measurement that does not exist yet;
- deferring the measurement's tasks without replanning the epic: E2 would have no result left that is needed now;
- the eraser and the grid, or the crop by A3, in the MVP: the board needs none of them, the crop also needs the groups, and the epic would take longer;
- a release for the board in E2: the author had not yet decided whether the board takes the element;
- keeping the deferred tasks in table 1 — the current epic would consist of tasks that nobody runs;
- one epic for everything deferred — the sheet for the product and the samples page wait for different decisions: E5 also waits for the big measurement;
- writing the tasks of E4 and E5 anew when they are planned — what was decided and found in planning the probe of a page from a file and other tasks would have to be found again.

— *Consequence:*
- RUN.md: the opening; E2 — its name, «Результат», «Нужно», «Риски» and its order, for the MVP; table 1 — the tasks for the MVP, then the returned tasks of E4 and E5; table 2 — the epics E4 and E5; the body of the probe of a page from a file keeps what was decided and found in its planning;
- table 3 — two rows «в реестр spec», which `spec` has closed. В29: the sheet, the element `<novatrail-canvas>`, comes as the first code of `canvas`, and the samples page, the synthetic samples and the build from a file wait until the measurement needs samples of volunteers or of children — that is E5. В30: Safari's downloads on an iPad may land in iCloud Drive, and then the sample file, a child's too, goes to Apple's cloud; where the page proposes to put the file on an iPad, the planning of E5 chooses, and whether that is enough, the lawyer decides in `spec`'s epic E4 (П-10, П-12);
- [docs/plan/E2.md](plan/E2.md) — the done and the canceled tasks, the description of the epic, and a line in place of each returned body;
- the decision on the plan's two current epics — E2 is planned for the MVP;
- [architecture.md](architecture.md) — the purpose and bounds, the format of the samples, the samples page's steps and the sources; README.md.

**R18. The sheet's input is one pointer at a time: its primary button writes or erases, and the pen's eraser erases. A stroke keeps every intermediate point except those closer than 0.1 unit to the last one recorded, and always the place and time of the lift. For the mouse and the finger a stroke with no style is even, and only the pen changes its thickness by pressure; a stroke with a style is drawn by its kind of pen. The drawing surface stands in the visible part of the sheet, and the sheet scrolls by the native scrolling of its container, and on the drawing surface by two fingers, by code of its own.**
- **Pointer.** One pointer at a time writes or erases: the one that went down first, until it lifts — but the pen cancels a touch's stroke in progress and writes itself, and a second finger that touched soon after the first cancels the first one's stroke, and both scroll. A second pointer and any button but the primary one — the pen's button, the mouse's right and middle buttons — do not write, and the pen's eraser, `button` 5, erases. A stroke ends on `pointerup`, on a move whose primary button is no longer pressed, on the loss of capture and when the element leaves the page, and `pointercancel` throws it away, as the drawing engine's input does. The pointer's type is written as it came, as the sample file holds it. There is no context menu over the drawing surface — neither by a long press of the pen or the finger, nor by the right button —, and no text of the element is selected, as input on tablets has it.
- **Points** come from `getCoalescedEvents`, and where it is missing or the list is empty, from the event itself:
  - a point closer than 0.1 unit to the last one recorded is not written: the sample file would not keep such a difference. In memory the fractional numbers stay as they are;
  - the last point is always written, even closer than 0.1: the place and time of the lift, with the pressure of the previous move. A touch without movement is two points at one place, of the touch and of the lift;
  - the time is the `timeStamp` of each point, by the sheet's clock `Clock`, by which the time of erasing, clearing and undo runs too: milliseconds from the sheet's first event, as in the sample, and it does not decrease;
  - the pressure is clamped to 0–1: an event that a script makes may give more, and the sheet would write a history that it would not accept itself;
  - the stroke's ID is 1, 2, … in the order of the starts. It is not reused, and neither is the number of a stroke thrown away. When the sheet gets another history, the recorder drops the stroke under the pen and numbers the next one from the history's greatest ID + 1.
- **Line** — the outline of perfect-freehand 1.2.3, every parameter set explicitly: `size` 3 units — like the board's `lineWidth` 3 on a sheet 1000 wide (sources 9.1) —, `smoothing` and `streamline` 0.5, round ends, no tapering, and `last` for a finished stroke. The pressure is the pointer's own, as the third number of a point, with `simulatePressure: false`. The pen's line is half a finger's at no pressure and twice it at full, `0.5 + 1.5 × p^0.8` of it, the pressure kept to 0–1 (`penWidth`), by `easing` with `thinning` 1, which hands it the pressure itself; each point's pressure is 0.65 its own and 0.35 the eased one of the point before it. The others have `thinning` 0, with which the library calls no `easing`: their line is even. A stroke of two points gets three between them at the pressures between, since the library would put its own there, and at the second, at 0.5. The ink reaches `INK_REACH`, 3 units, half the widest line, from a stroke's points. A stroke of one point goes into the library twice and is drawn as a circle with the line's diameter. The ink is `#111`, as on the board.
- **drawing surface** — one, as high as the visible part of the sheet, and its pixels are its size on the screen times `devicePixelRatio`. A media query tells the element of a new density. The `Path2D` path of a finished stroke is built once, and on each frame only the path of the stroke being written is built anew. Strokes outside the visible part are not drawn, and a new size of the drawing surface, which wipes it, is drawn again at once — in the same frame, before the frame is painted.
- **Scrolling** is native, of the container in the shadow root: the wheel, the scroll bar and the keyboard are the browser's. The drawing surface stands in the visible part (`position: sticky`) in a scene of layers, all of them shifted by a matrix in the ink's frame, and `vy` is the drawing surface's offset from the top of the sheet, divided by `k`. Above the sheet, in the same scrolling, is the task statement. By default the element is as high as the statement and the sheet; if the consumer gave it a smaller height, they scroll inside it. At a new width `vy` stays the same. On the statement, the sheet and the page above it scroll by finger: `touch-action: none` is only on the drawing surface, and on it two fingers scroll the sheet by code of its own.
- **Code.** The DOM-free part — the stroke, the screen transform, the input recorder and the outline, `src/core/` — with its tests in Node. Its public entry point does not change: the element takes these modules by a relative path. The input recorder hands a finished stroke to a handler, and the finished strokes are held by the work on the sheet. The module `src/element/probe.ts`, which the package does not export, shows the element's state to the tests. The element's tests run in Chromium twice, with density 1 and 2, and real input of the mouse and of the pen with pressure goes through `Input.dispatchMouseEvent` of the DevTools protocol.

— *Why:* the author's answers in the planning of the sheet's input: split input on tablets off into a task of its own, an even line for the mouse and the finger, all points without repeats. The last point, the touch, native scrolling and this entry are a «да» to the plan with the recommendations of its review. The pixels of the drawing surface and the two instances of Chromium were decided in the course of the work, not as in the plan — why, below. The sources — sources 9.1.
- **One pointer.** The MVP's board is a computer: a mouse and sometimes a tablet's pen. The palm, pen mode and two fingers are needed by tablets, and there were none to check on: they came with input on tablets.
- **Primary button.** The pen's button and eraser come with `button` 2 and 5, and the mouse's right button with 2. If they wrote, the pen's eraser would leave ink.
- **Last point.** `pointerup` has no intermediate points, and thinning would drop the place of the lift. The pressure at `pointerup` is 0 because the buttons are no longer pressed, not because it was measured. The groups are built by space and time, and the pause before the lift is part of the stroke's time.
- **The pen's curve.** Apple Pencil Pro in WebKit gives writing a pressure of about 0–0.2, its median about 0.1 (measurements 1.8): a straight width from half a line to one and a half left the pen's line thinner than a finger's almost always, and a press told little. The power 0.8 widens the line more in that low range, a hard press shows, a light one is thin, and the ease of the pressure from point to point keeps the pointer's noise out of the line. The author tried the curve on the iPad against the straight one and a finger, and took it.
- **Even line.** That is how the board's sheet draws. And the mouse's pressure is 0.5 while the button is pressed, by definition, not by measurement; so is the finger's where the hardware does not measure pressure.
- **`size` 3, without a multiplier.** perfect-freehand has one absolute threshold: the outline does not go around the last 3 units of a stroke. A measurement on straight strokes: at 0.5–1 unit the outline is wider by 0.1–0.3 unit because of it, and from 2 units on there is no difference.
- **The pixels of the drawing surface are its size on the screen times the density,** not `device-pixel-content-box`, as the plan had it. When the density is emulated — both by the DevTools protocol and by Playwright's context — Chrome Headless Shell 156 gives this size at density 1, though `devicePixelRatio` is 2. So there would be nothing to check the buffer at density 2 with, and WebKit does not give this size at all. The cost is no more than a device pixel per edge, when the drawing surface's size on the screen is fractional.
- **Two instances of Chromium,** not emulation in the middle of a test, as the plan had it: the test's frame does not notice such emulation — neither a ResizeObserver entry nor the media query's event arrives.
- **Native scrolling.** The wheel and the touchpad with their inertia, the scroll bar, the keyboard and the handover of scrolling to the page at the sheet's edge come for free and the same as everywhere on the page. Our own code for the wheel would have to write all this anew.

— *Rejected:*
- several pointers and palm rejection in the first input — there was nothing to check them on; they came with input on tablets;
- pressure for the mouse and the finger — the thickness would come from a number that the browser put in place of a measurement;
- an even line for the pen too, with no pressure — the pen's press, which a learner sees on paper, would be lost, and the crop for checking is even anyway;
- a tool of its own, a brush, whose line follows the pressure beside an even pen — one more button on the bar for what the pen's curve gives;
- the straight width from half a line to one and a half — for the reason above;
- all points without thinning — places that the sample file does not tell apart; thinning without the last point — the place and time of the lift would be lost;
- computing the outline in "sheet × 10", `size` 30 on points × 10 — a multiplier for the sake of the threshold of 3 units, while the difference is fractions of a unit on strokes shorter than 2 units;
- `device-pixel-content-box` — for the reason above. Return to it if the ink grows blurry on screens with a fractional density;
- our own code for the wheel with our own `vy` — for the reason above;
- the outline's path by the helper `getSvgPathFromStroke` from the README — the `Path2D` path is built by our own code, with curves through the midpoints of the edges;
- public methods of the element for the sake of the tests — the element's methods are those of its interface: `undo()` and `clear()`, and what the element for the board decides.

— *Revisit:* a limit on a stroke's length. In canvas-api it is 2000 points (sources 1.1); here there is no limit. Return to it if a long stroke being written starts to lag.

— *Consequence:*
- RUN.md: the sheet's input is split, and input on tablets, «Ввод на планшетах: ладонь, режим пера и два пальца», is a task of its own, deferred, before the check on devices, which depends on it; for the layers and the grid the path of scrolling is decided, and what is left to them is how the other layers fit into this scrolling; the element for the board has a step for the author: a mouse on a computer;
- the drawing engine's palm rejection goes with input on tablets; the sheet's coordinates take the path of scrolling; the package's tests run in Chromium twice, with `/.vitest/` in `.gitignore`, and WebKit is needed by input on tablets and the check on devices; the plan for the MVP splits input on tablets off;
- `src/core/`, `src/element/`, `vitest.config.ts`, `.gitignore`; [architecture.md](architecture.md) — the drawing engine and the layers, the sheet's logical coordinates, code and tools, and the sources.

**R19. Undo and clearing are a stack of actions in the DOM-free part. Undo removes the last action — a stroke written, an erasing or a clearing —, and clearing is an action too, and undo brings its strokes back. There is no redo. The element opens the methods `undo()` and `clear()`, and its own buttons «Отменить» and «Очистить» call them.**
- **The work on the sheet** — `Work` in `src/core/work.ts`: the strokes that are visible, in the order in which they went down, and the stack of actions. An action is `write`, a stroke is written, `erase`, strokes are erased, or `clear`, the sheet is cleared, together with the strokes that were on it.
  - undo removes the last action: for `write` its stroke goes, for `erase` the erased strokes come back to their places on the sheet, and for `clear` its strokes come back — the same array. On a sheet with no actions it changes nothing and returns `false`;
  - clearing removes all the strokes in one action, and on an empty sheet it is not an action: `false`, and nothing goes onto the stack;
  - the methods take the page's time — `undo(time)`, `clear(time)`, `erase(ids, time)` —, and each action that changed something writes an event of the writing history. The order of the history is the order of the actions: a stroke finished after an undo or a clearing comes after it in the history, though the time of its points is earlier;
  - another writing history replaces both the strokes and the stack, and the stack is built by the same rules that built it during writing: `undo()` after it removes its last action;
  - there is no redo of what was undone.
- **The input recorder** does not hold a finished stroke. It first finishes it, then hands it to the handler it gets at creation — and the element puts the stroke into the work. The ID is still the recorder's, and undo does not give the ID back. The time of the strokes and of the actions is one clock of the sheet, the time from its first event.
- **The stroke being written** is touched by neither undo nor clearing: it is the recorder's and goes onto the sheet when it ends — after that action.
- **Element.** The methods `undo(): boolean` and `clear(): boolean` return `true` if the sheet changed, and the sheet is redrawn on the next frame; `historychange` comes after them only then. A finished stroke's path is built once, after an undone clearing too.
  - The element's own buttons «Отменить» and «Очистить» call `undo()` and `clear()`, and the methods stay: the consumer may call them too.
  - «Отменить», while there is nothing to undo, and «Очистить» on an empty sheet are disabled, and whether the stack is empty, `Work.undoable` tells.
- **The next task** — not by `clear()`: undo would bring back the strokes of the previous task. The element has no reset that cannot be undone: the consumer puts a new element in its place or gives it another writing history.

— *Why:*
- **Clearing can be undone.** A child who pressed «Очистить» by accident does not lose the work. On the board clearing cannot be undone, but the board is the author's sheet, while the sheet of `canvas` is also the learner's.
- **No redo.** The board has none either, and the clearing that can be undone already guards the work against an accidental loss. Redo is one more stack and one more button.
- **Stack of actions.** Erasing goes onto the same stack, its action keeping the erased strokes with their places, and the writing history records the actions as events with their time.
- **Methods beside the buttons.** The buttons and the consumer call the same operations, and that the sheet is redrawn after each of them is checked on the element itself.
- **First finish, then hand over.** Otherwise in the handler the stroke would be both live and on the sheet, and the event of change would see it twice.

— *Rejected:*
- clearing without undo, as on the board — an accidental clearing would wipe the work for good;
- redo of what was undone — for the reason above;
- an access for the tests instead of the methods — the tests would call the operations around the interface;
- undo and clearing also removing the stroke being written — the ink would vanish from under a pen that is still on the sheet;
- the input recorder holding the finished strokes and the stack itself — it records input, and the work on the sheet is another thing: erasing goes into it too;
- a snapshot of the sheet for each action instead of a stack of actions — memory would grow by the whole sheet with each stroke, and erasing and the writing history fit actions, not snapshots.

— *Revisit:* redo — if someone asks for it; a limit on the stack — if the stack becomes noticeable in memory: the cleared and erased strokes live in it for the sheet's whole life, and with them the paths the element built for them.

— *Consequence:*
- `src/core/work.ts` — the work on the sheet: the strokes, the stack with `undoable`, and the actions with the page's time;
- `src/core/recorder.ts` — a finished stroke goes to the handler;
- `src/element/` — `undo()` and `clear()`, the buttons that call them, and `historychange` after them;
- [architecture.md](architecture.md) — the work on the sheet and the element's methods.

**R20. The element for a check: the consumer keeps writing off during the check by the style `pointer-events: none` on the element, and moves on to the next task with a new element or another writing history — the element has no reset that cannot be undone. `tutor`'s check board does not take the element, and the element has no picture or event of its own for it: the check takes the crop of `exportWork()`, a change of the work is told by `historychange`, and the PNG of the whole sheet is `exportPicture()`, for the stored work.**
- **The board** stays on its own sheet of 1000 × 600, and only a new decision of the author changes that. This entry's decisions are the element's interface for `app` and the samples page. What the board would need, [architecture.md](architecture.md) lists: among it, a height for the element, its own sheet's 600 px, in which the sheet of 1000 × 1400 scrolls, and a route on its server or a place in its page for the element's module — `go:embed` embeds the board's page, and the server answers only `/` and `/api/*`.
- **The picture of the whole sheet** is `exportPicture()`, for the stored work, not for the board: every stroke by the path the screen fills, a pen's with its pressure, black on white, by the crop's encoder rather than `toBlob`, and a white sheet rather than `null` when it is empty. What goes to the check is the crop of `exportWork()` alone: a PNG of the whole sheet beside it would invite sending the wrong picture.
- **The event of change** is `historychange`, from the host, which bubbles. It is also `composed`: if the element stands in the consumer's shadow tree, the event comes out of there too, and outside, the target becomes the host of that tree. It comes synchronously, when the work has already changed.
  - It comes on each stroke that went onto the sheet, on each press of the eraser that erased something — one, when it is lifted —, and on `undo()` and `clear()` that returned `true`.
  - It does not come on a stroke that `pointercancel` threw away, on a press of the eraser without hits, on `undo()` and `clear()` that changed nothing, and while a stroke is being written.
  - A stroke that ended because the element was removed from the page gives the event too. Only the listeners of the element itself hear it: it does not reach the ancestors.
  - Whether there is something to undo, the element does not say.
- **Next task** — a new element in place of the former one, or another `history`, which replaces the sheet in place. The element has no reset that cannot be undone, and `clear()` will not do for this: undo would bring back the strokes of the previous task.
- **During the check** — `pointer-events: none` on the element. CSS inherits it into the shadow tree, and a new stroke cannot begin.
  - The cost: during this time the sheet does not scroll by the pointer either. The wheel and the scroll bar do not reach it, scrolling with two fingers does not start, and scrolling already started goes on until the lift: the drawing surface holds the fingers by capture.
  - The element's own buttons stop too, but only for the pointer: from the keyboard they work during the check too. By that time the work has already been taken by `exportWork()`, an undo or a clearing after it is an ordinary action with its own `historychange`, and the marks hold on to their strokes.
  - This holds as long as the element sets no `pointer-events` on the drawing surface and its ancestors: the other layers get `none`, and the consumer's `none` on the element still reaches the drawing surface. Tests hold this.
  - A stroke already being written is not stopped by the style: the drawing surface holds its pointer by capture, and the stroke goes to its end, goes onto the sheet and gives `historychange`. It is not in a work taken before that. On the board "Check" is pressed with the same mouse that writes, so there is no stroke under it at that moment.
- **Trial consumer** — `src/element/consumer.test.ts`: `app`'s path, only through the element's interface — the properties, the methods and the events, without `probe.ts`.
- **The page for trials by hand** — `demo/` and the recipe `just demo`.
  - It is the development server of Vite 8.3.4 on `127.0.0.1:5173`, and VS Code forwards it to a browser outside the container.
  - It serves only the page, the element's sources and the packages they take. Without its own list `server.fs.allow` Vite would serve the whole repository, the folder closed to agents too.
  - The page has no build, and it is not in the package.
  - Vite is a direct development dependency, of the same version that Vitest already installed.

— *Why:*
- **One sheet.** One sheet for the board, `app` and the samples page — without a second sheet and without a setting of the height.
  - A picture of it is taller than the board's: for Claude ≈1800 tokens instead of ≈790, for OpenAI 1408 patches instead of 608.
  - At `tutor`'s prices of a check, 10–20 cents, the extra ≈1000 tokens of Claude are ≈0.4 cent per check, and 800 patches of OpenAI ≈0.8 cent, if a patch counts as a token: together about a cent more.
  - The board's budget for input, 4000 tokens, is enough.
- **No undo state.** The board does not need to know whether there is something to undo: its buttons are disabled only during the check, and `undo()` returns `false` anyway. The event says that the sheet changed — for example, that the answers of the previous check no longer apply to it.
- **New element.** The canvas holds no data of its own, and replacing the sheet in place is what another `history` gives. A reset without undo would be a third command with the same meaning.
- **`pointer-events`, not `inert`.** HTML Standard: "Authors should not specify elements as inert unless the content they represent are also visually obscured in some way", and the sheet is visible during the check.

— *Rejected:*
- a sheet 1000 × 600 for the board — by a change of the sheet's size or by the sheet's height in the element's settings: the canvas would have two sheets of different heights, and the DOM-free part and the element would compute by it, not by a constant;
- for the board's picture, the ink's box instead of the whole sheet — that is already a crop without scaling, which the decision on the sheet's coordinates rejected for the product, not the board's PNG of its whole sheet;
- a data URL — a string a third longer than the bytes, and `app` would turn it back;
- a PNG of the whole sheet beside `exportWork()` for the check, and a plain event of change beside `historychange` — the wrong picture invited, and two events per action;
- the properties `canUndo` and `empty` — the consumer does not need them;
- the event without `composed` — a consumer that has the element in its own shadow tree would not hear it from outside;
- a reset of the sheet without undo, the move through `clear()` and `inert` — for the reasons above.

— *Revisit:*
- the board — if the author decides that it takes the element: a task of its own then gives it what [architecture.md](architecture.md) lists, and by the board's data, whether the models read a picture of 1000 × 1400 worse than one of 1000 × 600;
- stopping the writing — by a property of the element that stops only the writing, if a consumer needs to scroll the sheet during the check;
- the keyboard during the check — by a property, if `app` asks for it.

— *Consequence:*
- `src/element/` — the layers set no `pointer-events` on the drawing surface and its ancestors, and tests hold that the consumer's `none` stops the writing, the buttons' pointer and the scrolling with two fingers;
- `src/element/consumer.test.ts` — the trial consumer;
- `demo/`, `justfile` — the page for trials by hand and its recipe; `package.json`, `package-lock.json` and `.github/dependabot.yml` — Vite beside Vitest; `biome.json`, `tsconfig.element.json`, `tsconfig.node.json` — the page's sources in the checks;
- [architecture.md](architecture.md) — what the board would need, and the check's `pointer-events` for `app`.

## The work plan — continued

**R21. `canvas` does not build a text canvas: epic E3 «Текстовая канва» is removed. The canvas kinds are the handwriting sheet and the workbook, the canvases of the first slice, and a return to the text canvas is possible only by a new decision of the author.**
- **What is removed** — what was decided only for the text canvas: words and sentences in HTML, edits as their state and input from the keyboard in the drawing engine, marks by words — `{word_ids}` — in the sheet's coordinates, edits as the work from `exportWork()` and the event `speak` for «прослушать» in the docking with the consumer. E3 had no tasks, and there is no code of the text canvas, so only the plan's row and these decisions are removed.
- **Input "as typed"** — the subsection of [architecture.md](architecture.md) on the text canvas's input — is no longer for `canvas` to decide: the sheet has no field to type into. The subsection stays as a record, because `spec`'s plan takes it as an input. Its finding concerns any typed answer, including an answer slot with keyboard input in `app`.
- **What stays.** The element `<novatrail-canvas>` is still one for every canvas kind and takes the kind from the task's open view. A new kind, if the author decides on one, comes with a new version of the package, without an edit of `app`: a subject comes as a module's data, not as code. The sheet and the epics E4 and E5 do not change; they only go after E2 now.
- **`spec`.** `spec`'s decision on the first slice — three modules, none on a text canvas — makes the handwriting sheet and the workbook the slice's canvases, and `canvas`'s card in `spec` gives `canvas` the detailing of the workbook: the page, the answer slots, the crop of a slot and the template layer. This is epic E6, the first of table 2 of RUN.md. It answered В32 «в реестр spec» otherwise than `canvas` advised: the second module is not Spanish A1 on a text canvas, and the modules became three. What `spec` says of a text canvas — the event `speak`, by which `app` voices «прослушать», and the statement's words with IDs in its plan of the module format — concerns no canvas kind that `canvas` builds.

— *Why:* the author's word «второй тип канвы делать не будем», with the epic to be removed. The author gave no reason.

— *Rejected:*
- keeping E3 in table 2 or deferring it — the author decided to remove the epic;
- removing the epic but keeping the decisions on the text canvas in force until a return to it — the documents would describe `{word_ids}` and `speak`, which nobody builds, and `app` would wait for an event that will not come.

— *Consequence:*
- RUN.md: table 2 has no row of E3, and the table's opening says when and why it went; E6, the workbook, is its first epic, and E4 and E5 go after E2;
- [architecture.md](architecture.md): the purpose and bounds, the drawing engine and the layers, the sheet's coordinates and the docking with the app — without the text canvas. What the parts still to decide — the drawing engine, the coordinates, the docking and the input on the text canvas — say of it stays as a record of what was known and what was chosen from;
- README.md: the canvas kinds;
- the decisions on the drawing engine, the sheet's coordinates, the docking with the consumer and the replanning of E2 — without what was only for the text canvas.

## E4. The sheet for the product

**R22. The eraser erases along the path of the press, whole strokes or, chosen in its popover, a part of them: everything its path came near leaves the sheet in one action when it is lifted, and one undo brings it all back. It is turned on by the element's property `tool` and by the pen's eraser. The writing history is the events "stroke", "erasing", "cut", "clearing" and "undo" with the sheet's time, and each names the IDs it removed or brought back. The sheet's clock is one for the strokes and the actions.**
- **Eraser — along the path.** A press takes each stroke whose line comes no farther than the reach from the eraser's path; a touch is a path of one point.
  - The strokes under the eraser vanish from the screen at once, and leave the sheet when it is lifted — in one action of erasing on the stack of undo and clearing. One undo returns them all, to their former places.
  - `pointercancel` throws the press away, and the strokes come back. A press without hits is not an action.
  - On the lift, those of the taken strokes that are on the sheet then leave: for what was removed during the press by undo or clearing and did not come back, there is nothing left to erase.
  - A tutor's mark is not seen when all its strokes are erased, and it comes back with them after an undo. The strokes under a press of the eraser remove it from the screen at once, and `pointercancel` brings it back.
  - In pen mode a finger does not erase. Without pen mode, a press of the eraser by a finger is canceled by a second finger that touched soon after: scrolling begins, and nothing is erased.
  - Outside the drawing surface, clipped to the visible part of the container — where a captured pointer goes — the eraser takes nothing, and the path goes on from its last place on the screen. While the statement is visible above the sheet, the drawing surface goes below it. Otherwise a pointer beyond the edge of the drawing surface would lead the eraser along the sheet's border, to which the coordinate transform pins it, and over the invisible part of the sheet.
- **Reach** — taking whole strokes, the eraser's radius, at least `ERASER_RADIUS_PX / k`, 10 CSS px on the screen, whatever the sheet's zoom, plus half the stroke's widest line, `INK_REACH`, 3 units, for a stroke with no style (sources 9.3); taking a part, its radius alone, and the cut is the pen's settings' own. `k` is taken at the moment of the press. A hit is computed on the polyline of the stroke's raw points: the index of rbush 4.0.1 finds the strokes by their boxes, and our own code computes the exact distance from a segment of the path to the segments of the stroke. The index is rebuilt when the sheet's array of strokes has changed, and only when it is accessed.
- **Turning on.** The property `tool` — `"pen"` or `"eraser"`, `"pen"` by default: the primary button writes or erases.
  - The element's buttons «Перо» and «Ластик» switch it, and the element announces the learner's change of the tool by the event `toolchange`; the consumer may switch it too. Another value is a `TypeError`. A value assigned before the element is registered, the element takes at creation, and an invalid one leaves the pen and writes a warning to the console: an exception in the constructor would leave the element not working.
  - The pen's eraser — `button` 5, and bit 32 in `buttons` (Pointer Events Level 3; sources 9.3) — erases with any `tool`, if the task allows the eraser. In a task without it the pen's back end does nothing, `tool = "eraser"` is a `TypeError`, and a new task without the eraser brings back the pen.
  - A press goes on as it began: a change of `tool` does not change it. One pointer at a time writes or erases.
- **Sheet** — the strokes in the order in which they went down, not by ID. The action of erasing keeps the erased strokes with their places, and undo returns them to the same places: there is no snapshot of the whole sheet.
- **The writing history** — events in the order in which the actions went down, with the sheet's time:
  - "stroke" — the time when it went down, and the stroke itself: the ID, the pointer type and the points with time and pressure. Usually it goes down with its last point. If the stroke ended without `pointerup`, and another action went down while it was being written, then no earlier than that action;
  - "erasing" — the time of the lift and the IDs of the erased strokes, in the sheet's order;
  - "clearing" — the time and the IDs of everything that was on the sheet;
  - "undo" — the time, the IDs it removed and the IDs it brought back.

  The time when an action went down does not decrease along the history. Folding the history gives the sheet without the rules of the stack: it only adds and removes IDs. The events are plain data, in JSON as they are, and `spec`'s eval protocol takes them as they are. The history goes out by the property `history` and the event `historychange`, and comes in by the same property. The next ID after an assigned history is the greatest in it + 1. An assigned history passes through the actions of the work on the sheet, each recorded action must match the given one, and its time is checked only for its order.
- **The sheet's clock** — milliseconds from the first access to it, not decreasing. The input recorder takes the time of the points from it, and the work on the sheet the time of erasing, clearing and undo, and only when the action went down: an empty undo does not touch the clock. An assigned history continues it by `resume`: from its last event plus the pause of the groups and 1 ms more, and the sheet's time is the time of its history. The page's time — the `timeStamp` of a pointer event and `performance.now()` at the methods — is counted from one origin (sources 9.3).
- **Code:** in the DOM-free part — `clock.ts`, `geometry.ts`, `history.ts`, `eraser.ts` and `work.ts`, with tests in Node; in the element — `tool`, the routing of input between the recorder and the eraser, drawing without the strokes under the eraser, and one helper for the upgrade of properties, through which `tool`, `task`, `media` and `history` go, `history` before `marks`. On the page for trials — the button "Eraser".

— *Why:* the author's answers in the planning of the eraser: one task, not split, against the recommendation; the eraser along the path, undo and clearing with their own IDs, `tool` and the pen's eraser — by the recommendations. Before the work a separate agent checked the plan: the sheet's order, the lazy index and the reach in CSS px are its corrections. The sources — sources 9.3.
- **A path, not a touch.** Going over several strokes with the eraser is one action and one undo. A touch stays a particular case.
- **Under the eraser — at once, off the sheet — on the lift.** So erasing goes down as a stroke does: one action, one event `workchange`, one event of the history. `pointercancel` throws it away, and `exportPNG()` during the press gives the sheet as it still is.
- **Events with their own IDs.** Whoever reads the history — the runner of `tutor` or of eval — does not need to repeat the stack rules of `canvas`: it folds the history only adding and removing IDs, and reads clearing as erasing from the format of `tutor`: «стирание — время и ID стёртых штрихов» (sources 9.3). IDs are not data about a person, and they add no information about the writing.
- **One time for erasing — the lift's.** The format of `tutor` gives erasing one time, and the work changes when the eraser is lifted.
- **The order in which they went down.** If several touches at once are ever allowed, stroke 3 may go down before stroke 2, and an order by ID would differ from the order of writing.
- **Index by the change of the array.** Each action gives a new array of strokes, and an index built for its own array does not diverge from it. Editing the index on each action is six places for it to go out of sync: writing, erasing, clearing and the undo of each of the three.
- **Reach in CSS px.** In the sheet's units the eraser on a phone 360 px wide would be three times smaller than on a screen of 1000 px. Erasing is written by ID, so the history does not depend on the screen.
- **The pen's eraser.** A pen turned over erases, as on paper, and nothing needs switching. It cannot be passed through the DevTools protocol: the tests give it by synthetic events, and on devices the probe on hardware checks it (sources 9.3).
- **One clock.** By the DOM Standard `timeStamp` is a "relative high resolution coarse time", and by High Resolution Time `now()` is the "current high resolution time", and both are counted from the time origin of the global object (sources 9.3). The cost: `undo()` gets the time of `performance.now()`, which is later than the click, and the next points of a stroke being written may be pulled up to it by a few milliseconds.

— *Rejected:*
- an eraser by touch — several strokes would be erased by several presses and undone by several undos;
- each hit as an action of its own — going over five strokes would mean five undos;
- undo and clearing with the time only — everyone who reads the history would have to repeat the stack rules;
- a time for each erased stroke — the format of `tutor` does not know it, and the work changes on the lift;
- splitting the work into the DOM-free part and the eraser on the element — the author's answer: as one task;
- only `tool` — a pen turned over would not erase; only the pen's eraser — the mouse and the finger would not erase at all;
- the sheet in the order of the IDs, an index edited on each action and the reach in the sheet's units — for the reasons above;
- a snapshot of the sheet for each erasing — memory would grow by the whole sheet with each action, and erasing fits an action, not a snapshot.

— *Revisit:*
- the reach — by the probe on devices (Д7); the pen's eraser — if on devices it comes otherwise than in Pointer Events Level 3;
- a hit by the raw points — if on fast strokes the eraser misses the ink. perfect-freehand smooths the path (`streamline` 0.5), and at a sharp corner with sparse points the ink may move away from the polyline farther than `INK_REACH`. Then — compute by perfect-freehand's middle line, `getStrokePoints`.

— *Consequence:*
- `src/core/eraser.ts`, `src/core/geometry.ts` — the reach and the hits on the stroke's segments;
- `src/core/work.ts` — the sheet's order, the action of erasing and the index of strokes;
- `src/core/history.ts` — the events of the history, their fold and the check of an assigned history;
- `src/core/clock.ts` — the sheet's clock and its continuation of an assigned history;
- `src/core/groups.ts` — the groups built from the history with its time;
- `src/element/` — `tool`, the pen's eraser, the routing of input, the marks under the eraser, `history` and `historychange`;
- `src/eval/` — the history in a sample file;
- `demo/` — the page for trials;
- [architecture.md](architecture.md) — the eraser, the writing history and the clock, the element's `tool` and `history`, the sample file, and the code by files;
- [sources.md](sources.md) — the record of the eraser and the writing history;
- README.md.

**R23. The sheet is a stack of layers in its visible part, in the platform's order of the layers, and all the layers move in the frame in which the ink is drawn. The task's page fits the width of its area, up to 1000 CSS px, and stands at the sheet's left, the sheet going on past it. On the template is the task's grid, and the element shows the task statement above the sheet, as wide as the page, in the same scrolling. The element gets the task and the media files by the properties `task` and `media`, and the theme by CSS variables.**
- **The layers** stand in the stage, from bottom to top:
  - the author's template — an SVG with the grid, `aria-hidden`; on the workbook, its lines and boxes, which a screen reader reads: its root is `role="none"`, the lines a list;
  - the place of the module's widget — empty;
  - the place of the demo of a worked example;
  - the tracing paper of a task from paper;
  - the tutor's sketch — an empty SVG;
  - the ink — the drawing surface;
  - the tutor's marks — `role="none"`, each visible mark `role="img"` with an `aria-label`;
  - over them, the tracing paper's grip and its tooltip.

  All the layers are of one size and `position: absolute`. The `viewBox` of each SVG is the visible part of the sheet in its units, `vx vy W/k H/k`, for a stage W × H CSS px. One layout sets it, in the same frame in which the ink is drawn: on scrolling and on a new size.
- **The view** is `k`, `vx` and `vy` (`View` in `src/core/screen.ts`): k = min(A / 1000, 1) for a container A CSS px wide as laid out — `fitScale`, the cap `K_MAX` —, and `vx`, `vy` the left and the top of the visible part, in units. The cap is the layout's alone: the `k` of input, of the eraser's reach and of drawing comes from the sheet's rectangle on the screen, `scaleFor`, with no cap.
- **The page and the sheet.** The page stands at the sheet's left, with no margins, and the sheet goes on past the page, the ink and the tracing paper, a view to the right and two down, within its reach, `#reach`. The column is as wide as the sheet × k, and the container is `overflow: auto` and runs left to right whatever the page's direction: it scrolls across too. The element is as tall as the statement and the sheet unless it is given a height; then they scroll in it. The consumer's `--novatrail-canvas-pad-top` and `--novatrail-canvas-pad-bottom` pad the column: the statement starts below the first, and the sheet scrolls up past the second.
- **The stage** is the visible part on both axes: it sticks to the container's top and left, as wide and as tall as the container, or as the sheet × k where that is less. The drawing surface takes a pixel of its buffer for each device pixel, and a new density — the window on another screen, the browser's zoom — lays it out anew. In an element with a height the buffer is no larger than the container however far the sheet goes; in one without, it is as tall as the sheet.
- **The visible part** follows the scrolling, `#scrolled`, from where the sheet's top and left stand in the container's content, `#sheetEdge`. While the statement is in view, the drawing surface goes on below the visible part of the container, and the eraser takes nothing there, nor anything out of sight. A new width, or a statement of a new height, keeps the top left corner of the visible part at the same place of the sheet, unless the sheet's top, or its left, is in sight. A new height of the container alone touches no scrolling: a scroll in progress is not cut off.
- **Input** is taken by the drawing surface, the bar's buttons and the tracing paper's grip. The other layers have `pointer-events: none`, and no `pointer-events` is set on the drawing surface and its ancestors, so the consumer's `none` on the element reaches the drawing surface. The one exception is a worked example's sheet: its drawing surface has `pointer-events: none` by a rule on the sheet's class, and a finger on it scrolls as the browser does. The stage bans the context menu and selection.
- **The grid** is squares, lines or dots: `squares`, `lines` and `dots`, as spec names them.
  - The step is from 20 to 500 units, 50 by default.
  - The lines lie strictly inside the sheet, at `i × step`, over the whole sheet as far as it goes, and their thickness is in CSS px at any `k`. The dots stand where the lines would cross.
  - A sheet without a task is in squares of 50: spec knows no sheet without a grid. A task from paper has the grid the learner chooses, and the workbook has its lines and no grid.
  - The grid's path is built by the DOM-free part, `gridPath` in `grid.ts`.
- **The statement** is above the sheet, in the element itself and in the same scrolling; so is the workbook's, and a worked example's parts stand between it and the sheet.
  - It is as wide as the page, `--page`, and sticks to the container's left: it scrolls down alone. It keeps the element's own direction, `--direction`, while the container runs left to right.
  - Paragraphs are text, through `textContent`, and pictures are an `<img>` from a `Blob` that the function `media` gives. The statement inherits its font and color from the consumer, and its language is the module manifest's, the property `manifest`, and without one the element's own.
  - A picture stands in a frame of its own size, and the size is given by the task. While the picture has not come, or if it never comes, the frame shows its description, and a screen reader reads it as a picture. A picture with an empty description is decoration, and it has no frame.
- **The pictures' files** are held by the element's one loader. A reference is one file and one call of `media`, however many pictures show it — the task statement, the example's statement, the demo's parts and the sheet's areas. A file is held while what the element shows names its reference, and the element asks for all of an example's pictures when the example comes. The `blob:` URL is one per reference while the element is on the page, and the loader decodes it, once, before a picture shows it. It is revoked when nothing names the reference any more, when the file did not decode and when the element has left the page. A reference without a file is asked for again with every new task and example, when the element returns to the page and at a new function `media`, which does not cancel the loads already begun.
- **No formulas**: the tasks do not need them.
- **Properties:**
  - `task` — the open view of format v0, checked as strictly as the schema: a field the open view does not have is a `TypeError` with its name. Only `undefined` omits a field, and `null` is a value, and a wrong one. The same task, or one equal to it by its template, changes nothing, and another changes only the template, and in it only what has changed: the grid or the statement. The work stays, since a new task is a new element;
  - `media` — a function that returns a `Promise<Blob>`;
  - `tool`, `task` and `media`, assigned before the element is registered, go through one shared helper: an invalid value leaves the property as the element starts it, and gives a warning.
- **The theme** is the variables `--novatrail-canvas-paper`, `--novatrail-canvas-ink` and `--novatrail-canvas-grid`, with light defaults at every `var()`; the bar and the marks have variables of their own.
  - In forced colors mode the system ones stand in their place: Canvas, CanvasText and GrayText.
  - The ink is drawn in the drawing surface's color as its style computed it, and is redrawn on a change of the theme. The workbook's print is in the ink's color.
  - The picture of the work is black on white.
  - The element is horizontal at any writing mode of the page, `:host { writing-mode: horizontal-tb }`.
- **Code:**
  - in the DOM-free part — `grid.ts`, `task.ts`, `fitScale` and `scaleFor` in `screen.ts`, `SHEET`, `REACH` and `extentOf` in `sheet.ts`;
  - in the element — the scene of layers, `#layout`, `#reach`, `#sheetEdge`, `#place` and `STYLE` in `index.ts`, and the statement in `statement.ts`;
  - tests in the browsers — `layers.test.ts`, `statement.test.ts` and `wide.test.ts`, the sheet past the page; forced colors mode is two Vitest instances, `forced colors chromium` and `forced colors firefox`, each with `forcedColors: "active"` in Playwright's context, `forced-colors.test.ts` — WebKit has no forced colours to emulate (measurements 1.5);
  - on the page for probes, `demo/` — the grid's kind and step, a statement with a picture and the dark theme.

— *Why:* the author's answers: the statement above the sheet and only an upper cap of `k`, as recommended. The page stands at the left with the sheet past it: a sheet that grows with the ink gives room wherever the learner writes. The sources — sources 9.4.
- **The layers move in the ink's frame.** The browser takes the scrolling step before the frame callbacks (HTML Standard), and Chrome's compositor thread assembles frames even without the main thread. A layer that scrolls by itself would get a frame or two ahead of the ink on scrolling: the ink is redrawn by the scroll event. Moved in one frame, the layers lag all together and do not drift from one another.
- **`viewBox`, not a shift of an SVG the size of the whole sheet.** The browser rasterizes only the visible part, and a fractional shift does not blur the lines in CSS px. The thickness at `non-scaling-stroke` the browser computes from the viewport of the outermost SVG (SVG 2), so a transform of the page does not change it either.
- **The statement above the sheet:**
  - so it is at canvas-api — «текст над листом, а не часть листа», — on `tutor`'s board and in `spec`'s prototype;
  - HTML text grows with the browser's zoom and wraps by the width, while the page, and the workbook's print on it, grow with the browser's zoom only until the page fills the element's width, and past it with the bar's zoom;
  - the statement's place on the sheet would depend on the device's fonts, while the strokes lie in the sheet's units. On another device the text would end up under the ink, and the answer slots could run onto it.

  spec has it so: the statement is part of the author's template, and the canvas kind decides whether it stands above the canvas or on it.
- **The statement as wide as the page**, at its left: it stays in sight and wraps as it would on the page alone while the sheet goes by under it.
- **Formulas.** Neither `tutor`'s tasks nor the 603 tasks of MathTrail standalone have any: there it is text with the signs ×, :, − and fractions of the form a/b. Nor are there libraries of formulas: neither KaTeX, nor MathJax, nor MathML is at `tutor`, at canvas-api or at standalone.
- **The picture's frame.** The task gives the picture a size, and the place for the picture is held until it comes: neither the text nor the sheet moves under the pen. A screen reader will read the description, and while the picture is not there, the learner will see it too.
- **The files' URLs:**
  - MDN advises revoking the URL when the picture has left the document, not on load;
  - moving the element on the page is a disconnection and a connection in one task, so the URL is revoked after a microtask if the element has not come back;
  - otherwise the pictures of every task would be held in memory while `app` is open, since the consumer moves to a new task with a new element.
- **The cap of `k`:**
  - a drawing surface as tall as the sheet, in an element without a height, grows with the square of `k`. At a width of 2560 px and a density of 2, the page alone would take a buffer of 5120 × 7168 pixels, ≈147 MB, without the cap, and of 2000 × 2800, ≈22 MB, with it;
  - a square of 50 px and a line of 3 px stay on a wide screen as they are on paper, a pixel a unit as on the picture of the work.
- **The cap at the layout, not at the input.** An element 800 px wide in an ancestor with `transform: scale(1.5)` is wider than 1000 px on the screen. With the cap at the input the points would land 20 % off.
- **A variable's default at every `var()`.** A declaration in `:host` would set the variable on the host itself, and the value the element inherits from the page would not reach the shadow tree.

— *Rejected:*
- layers that scroll together with the content, and a shift of an SVG the size of the whole sheet instead of `viewBox` — for the reasons above;
- the statement on the sheet — for the reasons above; the statement at the consumer — spec gives the canvas the display of the module's content: the statement and media;
- the page in the middle of a wide screen, with margins at its sides — the sheet grows to the right, and nothing would fill the room at the page's left;
- `k` with no cap — the drawing surface's buffer and the square would grow with the screen, and each consumer would guard against it by itself;
- `k` with a lower limit too — the page would not fit the width of a narrow screen;
- the cap at `scaleFor` — for the reason above;
- formulas now — KaTeX 0.19.1 with its own CSS and 60 font files, Temml 0.14.0 or MathML from the open view: the tasks do not need them;
- a picture that has not come silently disappearing, as in standalone — the learner would lose what is on it;
- an event to the consumer about a picture that has not come — `app` knows anyway that its function gave no file;
- a theme without variables — `app` could not set a dark theme.

— *Revisit:*
- the cap of `k` — by the probe on devices;
- a drawing surface the size of the whole sheet with the native scrolling, without lag, — to measure there too;
- formulas — when a task needs them: with no dependencies — MathML Core, and from LaTeX — Temml;
- the statement on the sheet — if format v0 puts on the sheet pictures that one writes over.

— *Consequence:*
- `src/core/` — the grid, the task, the view, the reach;
- `src/element/` — the layers, the layout, the statement, the theme and their tests;
- `demo/` — the grid, a statement with a picture, the dark theme;
- `vitest.config.ts` — the instances of forced colors mode;
- [architecture.md](architecture.md) — the bounds, the layers, the coordinates, the docking, the code, accessibility.

**R24. The stroke groups are by nearness in space and in time. Two strokes are neighbors if there are no more than 2 s between them, and the boxes of their points come closer than a square — 50 units horizontally and vertically. A group is the strokes that a chain of neighbors joins. The rule takes the visible strokes and counts in integers: in tenths of a unit and in milliseconds. The labels are A, B, C… by place, top to bottom. The group's rectangle is in the sheet's units, and the group box in fractions of the crop is computed by the crop. The workbook has no groups.**
- **The input** is the visible strokes of the final sheet with the time of their points: the fold of the writing history, which is also the strokes on the sheet. What is erased and what is removed by undo does not enter the groups, and what is brought back by undo enters with the time when it was written. Erasing and undo do not split groups. A stroke without points or one ID on two strokes is a `TypeError`, and a rule whose limit is not a finite number from 0 is a `RangeError`.
- **Integers.** Places are in tenths of a unit, `round(10 × v)`, and time is in whole milliseconds, `round(t)`: so the sample records them. A half is rounded up: 100.05 units is 1001 tenths. A stroke's span is from the earliest time of its points to the latest. Further on the rule only subtracts and compares.
- **Neighbors** — both conditions at once, and in both the boundary is included:
  - the pause between the strokes — from the end of the earlier one to the start of the later one, and for strokes that overlap in time it is 0 — is no more than 2000 ms;
  - the gap between the boxes of their points is no more than 500 tenths, 50 units, horizontally, and as much vertically.
- **A group** is the strokes linked by a chain of neighbors. The candidates for neighbors are found by an rbush index over the boxes in tenths, widened by the threshold: on integers this is exactly the condition of place. Time is checked separately.
- **The labels** are by place, top to bottom:
  - the order is by the group's rectangle in tenths: top, left, bottom, right. Then by the earliest start, and only if that too is the same — by the smaller ID;
  - the labels are A…Z, then AA…AZ, BA…ZZ, AAA…;
  - in the table "label → strokes' IDs" the IDs go in ascending order;
  - the sample sets the labels before it renumbers the strokes by place.
- **The group's rectangle** is the common rectangle of the points of its strokes in the sheet's units, `[ymin, xmin, ymax, xmax]`, by the geometry it was given: on the device by the raw strokes, in the sample by the recorded ones. The "group box" is already fractions of the crop: the crop computes it, and its `h_med` is over stroke bundles, without time. The groups give the crop the boxes and the table "label → strokes' IDs".
- **The workbook** has no groups: its boxes take their place, and the table "box → strokes' IDs" stands in the submission's context instead of the table of labels.
- **What follows from it:**
  - what is written later next to older writing is a group of its own;
  - a stroke that touches two groups joins them only if it is no farther than 2 s from the strokes of both. Otherwise it enters the one that is nearer in time, or stands alone;
  - lines written one after another do not merge: under a stroke of a line lies a stroke written a line later. The exception is short lines of one or two signs;
  - a drawing holds together while its neighboring parts are written without a pause for thought;
  - a tutor's mark with a group label holds on to the strokes of its group's row of the table of its submission;
  - the clock after an assigned history runs from its last event plus 2001 ms, so the first stroke of a new session is no neighbor of the strokes of the past one. `exportWork()` takes the groups from `groupsOf`.
- **The eval protocol** holds this rule as it is written here, and assigns an erased stroke to the groups of the visible strokes that would have been its neighbors: without visible neighbors — to none, with neighbors in two groups — to both. Its test vectors are `vectors/eval/v1/groups.json` of the package `@altnovatrail/contracts`. The rule changes only in `spec`, and `canvas` brings a change as a row «в реестр spec».
- **Code** — `groups.ts` in the DOM-free part, with tests in Node:
  - the rule `GROUP_RULE`;
  - the groups `groupsOf`;
  - the pairs of neighbors `neighboursOf`;
  - the rectangle `rectOf`;
  - the label `labelOf`.

  The synthetic sheets are in the tests, and the groups test checks the sheet's code against the eval protocol's vectors. On the page for probes, `demo/`, — the groups under the sheet and the rule's fields.

— *Why:* the author's answers, by the recommendations: the rule of pairs, the pause of 2 s, nearness by the boxes, the fractions of the crop in the crop's rule and the groups on the page for probes. The thresholds 50 × 25, chosen first, the sweep over synthetic sheets did not confirm: the "ladder" fell apart, and 50 × 50 took their place. Before the work a separate agent checked the design. Its corrections are the counting in integers, labels without IDs, the clock of the synthetic samples, the file of vectors from the test and the rectangle as a function of its own. The sources — sources 9.5.
- **Nobody had the rule.** `tutor` builds the groups «так, как их построит устройство, — по пространству и времени, без разметки», and neither the algorithm nor the thresholds were at `tutor`, at `spec` or at MathTrail (sources 9.5). So the rule is `canvas`'s own, and the eval protocol took it from here.
- **Pairs, not series.** Time is compared between two neighbors, not over the whole sheet. So a return to older writing amid fast work elsewhere still gives a group of its own.
- **2 seconds.** The mean pause of writing in children of grades 3 and 5 is about 400 ms, and 2000 ms is the threshold below which studies of writing count a pause as part of the writing itself (sources 9.5). A longer pause is thought, and what is written after it is already another thought.
- **A square in both directions.** Digits in neighboring squares of the default grid are one group, and across an empty square they are different ones. Vertically the same square holds dots, fraction bars, underlines and the crossbars of a drawing. Lines are kept apart by time: under a stroke lies a stroke written a line later.
- **The sweep.** Ten synthetic sheets, and the groups on them were written down before the run, through a teacher's eyes: the "ladder" from the study, something written later, two lines in a row, fractions with signs, words in cursive letters, lines like `tutor`'s synthetic samples, something crossed out, a stroke under two writings, an undo of erasing and the rule's boundaries. The probes beyond them are short lines, a column and an answer a line below. What breaks under each rule (the groups on the "boundaries" answer only to their own thresholds and do not count):

  | Rule | What breaks |
  |---|---|
  | pairs, 2 s, 50 × 50 — accepted | nothing; on the probes two short lines of two signs each merge |
  | pairs, 2 s, 50 × 25 | the "ladder": the drawing has three groups, the late crossbars touch only the uprights drawn more than 2 s before; the short lines |
  | pairs, 2 s, 25 × 10 | all the sheets but the words, the stroke under two writings and the undo: digits and signs go apart into groups of their own |
  | pairs, 1 s, 50 × 50 | in the "ladder" the left upright moves away from the drawing; the stroke under two writings takes only the second one |
  | pairs, 4 s, 50 × 50 | the drawing, the caption "30" and the expression are one group; the words of two lines are one; what is crossed out later goes with its own line; the stroke under two writings after 4 s goes with the second of them; the answer a line below and the short lines merge |
  | pairs, 6 s, 50 × 50 | almost everything: the "ladder" has one group |
  | an open group, 2 s, 50 × 12 | nothing, and the short lines neither, but dots and bars farther than 12 units move away into groups of their own |

  A column whose answer digits are written with a thought of 2.5 s each splits under all the rules with a pause of up to 2 s: this is the price of the pause. The median height of the groups on the "ladder" is 46 units at a digit of 36: the groups of the drawing and of the answer in a circle are taller than a digit.
- **Integers and subtraction.** `tutor`'s runner repeats the rule in Go, and the Go specification allows several floating-point operations to be fused into one and to give a different result. In JavaScript `Math.hypot` is an approximate function (sources 9.5). So the distances along the lines of strokes in the two implementations could diverge at the boundary. Here only the conversion to integers rounds — one multiplication by 10 and the rounding of a half up —, and further on the rule subtracts and compares integers and rounds nothing.
- **Labels by place.** Labels in the order of writing would give away the course of the work, which a sample of the eval set holds no longer. The ID is also the order of writing, so it decides only when two groups coincide both in place and in start.

— *Rejected:*
- **series by pauses:** a pause longer than 2 s over the whole sheet starts a new series, and a group is only inside a series. A fast return to older writing would merge with it, and what is written later next to older writing would be no group of its own;
- **a group is open while it is being written:** a stroke enters the group next to it if its last stroke landed no earlier than 2 s before. Lines would then be kept apart only by a vertical threshold smaller than the gap between lines, 12 units, and dots and bars farther than 12 would move away into groups of their own. Besides, the rule depends on the order of traversal, and it is harder for the runner to repeat;
- **place alone:** what is added later would merge with the earlier writing, and the groups would diverge from those of `tutor`'s measurement;
- **the thresholds 50 × 25**, which the author chose first, — by the sweep above;
- **the distance along the lines of strokes:** a circle around the answer would not take everything inside it, but the root and the fused operations would set the device and the runner apart at the boundary;
- **thresholds from the grid step or from the size of the handwriting:** the rule would need the task's step or an estimate of the handwriting of its own — the device, the runner and the sample alike;
- **a pause of 4–6 s**, like the long pause in `tutor`'s action log and at canvas-api's line (sources 9.5), — by the sweep above;
- **labels in the order of writing**, as in the study's example, — they give away the course of the work; **labels by reading lines** — they need a rule of lines of their own;
- **erasing and undo as a boundary of groups:** a correction in place would tear a digit off its number;
- **groups over the whole history, with the erased strokes:** an erased stroke would glue visible ones together, and it is not in the picture;
- **boxes in fractions of the crop in the rule of groups:** they need `sheet_box`, the crop's width and height, and that is the crop's;
- **`h_med` over the groups:** a median over groups is fragile: a sheet with one drawing and one number gives the median of two numbers, (300 + 32) / 2 = 166 units, and the digits on the crop come out ≈ 6 px.

— *Revisit:*
- by `tutor`'s measurement, which compares the labels with the model's box, only on the models of Claude (sources 9.5). The reference for the groups is the markup by lines: a group must not go beyond a marked-up line;
- when a task's grid step is not 50 — the thresholds, maybe, from the step;
- if the measurement shows that the merging of short lines in a row gets in the way.

— *Consequence:*
- `src/core/groups.ts` and `groups.test.ts` — the rule, its functions, the synthetic sheets and the test against the eval protocol's vectors;
- `src/core/crop.ts` — the group boxes in fractions of the crop;
- `src/element/` — the clock after an assigned history and `exportWork()`;
- `demo/` — the groups under the sheet and the rule's fields;
- [architecture.md](architecture.md) — the units, the groups and their boxes, the crop and the context of the submission;
- table 3, `run/QUESTIONS.md` — a row «в реестр spec»: the rule changes only in the eval protocol.

**R25. The crop for checking is by stroke bundles: the scale is such that the lower median of the bundles' heights, but no higher than 100 units, becomes the digit height D. The crop fits into Claude's standard level — no longer than 1568 px and no more than 1568 tokens —, and a side smaller than 200 px gets a wider margin. The line is D / 12, and the group boxes are by the ink, outward. The crop's numbers are computed in integers, and the raster and the PNG are code of its own, the same in any JavaScript engine.**
- **The input:**
  - the visible strokes of the final sheet, their stroke groups and the digit height D — an integer number of px from 1 to 256;
  - places are in tenths of a unit, `round(10 × v)`, a half up, as for the groups. So both the numbers and the raster are computed;
  - errors:
    - a point that is not finite or is outside the sheet, a D not from the range — `RangeError`;
    - a stroke without points, an ID twice, groups that do not cover the visible strokes exactly once each — `TypeError`;
  - an empty sheet gives no crop, and in its place is `null`: it is cut off before the AI call.
- **Bundles and `h_med`:**
  - a stroke lower than 15 units is a bar: a dot, a minus, a fraction bar, an underline. It does not count and links nothing;
  - the other strokes whose boxes touch or overlap are one bundle. A gap of no more than 0 horizontally and vertically, the link is by a chain, and time does not matter;
  - `h_med` is the lower median of the bundles' heights: the ⌊(n − 1) / 2⌋-th from the lowest. If there are no bundles, `h_med` equals 15 units;
  - the scale takes it no higher than 100 units: H = min(`h_med`, 100).
- **The scale and the limit:**
  - D′ is the largest integer no greater than D at which the crop fits into the limit; s = D′ / H;
  - w₀ = ⌈(B.xmax − B.xmin) × s⌉ + 2m, where m = 12 px, and B is the box of the visible points; h₀ — the same way;
  - the width is max(w₀, 200), the left margin is m + ⌊(width − w₀) / 2⌋, and the work stands in the middle. The height and the top margin — the same way;
  - the limit is Claude's standard level: max(width, height) ≤ 1568 and ⌈width / 28⌉ × ⌈height / 28⌉ ≤ 1568 tokens. At D′ = 1 the crop always fits.
- **`sheet_box`** is where the crop together with its margins lies on the sheet, in the sheet's units: xmin = B.xmin − left margin / s, xmax = xmin + width / s, y — the same way. Its formula is `sheetBoxOf`. By the `sheet_box` of its submission, with its margins, the model's box in fractions lands on the sheet — in integers, on the crop itself, with the same numbers as its raster —, and by it the element checks the context that came back with the marks.
- **The line** of a stroke with a style is its width at the crop's scale, 1 px at least, and the margin and the group boxes widen by the widest; of one with no style, max(D′, 12) / 12 px: at 32 px — 2.67, at 16 — 1.33, at 48 — 4, and no thinner than 1 px. At any D up to 256 its half is smaller than the margin.
- **The group boxes** are the group's ink: the rectangle of its points, widened by half the line and by the pixel of its edge, in fractions 0–1000 of the crop, `[ymin, xmin, ymax, xmax]`. The raster also paints this pixel, so every pixel of the group's ink lies in its box. The minimum is rounded down and the maximum up, so min < max for any group, a dot's too, as a box of the observation must be.
- **Integers:**
  - the tenths of the points, H, D′, the margins and the sizes are integers smaller than 2^53. JavaScript computes them exactly, and Go in `int64`;
  - `s`, `sheet_box` and the line are each one division of two integers, and IEEE 754 rounds it the same way in both languages;
  - the formulas in integers are in the header of the test vectors.
- **The raster:**
  - gray, 8 bits: white is 255, ink is 0;
  - a stroke's segment is a line of one width with round ends, and a stroke of one point is a dot as wide as the line;
  - a pixel takes the fraction that the line covers, by a slope of one pixel at the edge, and the darkest of what covers it. The segment's ends are taken in one order, however it was written;
  - only +, −, ×, ÷ and `Math.sqrt` go into a pixel: ECMAScript rounds them the same way, and the bytes are the same in any engine.
- **PNG** — an encoder of its own:
  - the signature, IHDR, one IDAT and IEND, with no ancillary chunks;
  - inside — a zlib stream of one block of fixed Huffman. Each row is without a filter, and a repeat is searched for in two places: the byte before and the row above;
  - the worst case is 9 bits per pixel, at 1568 tokens ≈ 1.4 MB, and in base64 less than 2 MB. The crop of a sheet of lines weighs a few KB, and that of the whole sheet about 10 KB.
- **On the workbook** this rule draws the crop of each filled box — by its strokes, as one group, at the manifest's digit height. There are no crop numbers in the workbook's context: there is no snapping there. At the heights of eval the crop of a box is the lower limit, 200 × 200 px, that is, 64 tokens.
- **What follows from it:**
  - a drawing, a fraction, a column and a circle around the answer do not throw the scale off;
  - the scale depends neither on the groups nor on the order of writing: the same final sheet gives the same crop;
  - the crop of a measurement sample matches `app`'s crop byte for byte: both compute in tenths. For the eval-set samples and the child samples the numbers are the same: the resampling keeps the extreme points of a stroke, so `h_med` is by the recorded geometry and the boxes by the groups. The synthetic samples are drawn by the same code;
  - the weak spots are lines that touch, a cross through the whole writing and a frame around everything. They glue the bundles together, and the digits come out smaller than D;
  - long work is drawn smaller than D, and D′ says so.
- **The rule is `spec`'s eval protocol**, as written here: the device and `tutor`'s runner draw by it, and the runner converts the strokes to the crop's pixels with the same integers. The term "stroke bundle" is in `spec/docs/concepts.md`'s glossary. The protocol's `bundle_median` is h_med itself, and the crop's `exact.median` is H in tenths, min(h_med, 1000), the height the scale takes. The rule changes only in `spec`.
- **Code** — the DOM-free part, with tests in Node:
  - `crop.ts` — the constants `CROP`, the bundles `bundlesOf`, the median `medianOf`, the crop's numbers `cropOf` and `sheetBoxOf`;
  - `raster.ts` — the pixels `rasterOf` and the crop's PNG `pictureOf`;
  - `png.ts` — the encoder `encodePNG`;
  - `sets.ts` — the union-find of the bundles and of the groups, and `geometry.ts` — the conversion to tenths, shared with the groups;
  - `exportWork()` calls `groupsOf`, `cropOf` and `pictureOf` through `workForCheck`, and takes D from the module manifest, `canvas.digit_height` — from 1 to 256 px, 32 by default. Of `crop.ts`, `raster.ts` and `png.ts` the entry point `core` exports none of the rules: the eval protocol has them.

  The synthetic sheets are `sheets.fixture.ts`, outside the build and the package, and the crop test checks the code against `vectors/eval/v1/crops.json` of the package `@altnovatrail/contracts`. A test in Chromium checks that the browser reads the PNG into the same grays. On the demo page — the crop at the chosen digit height and its size at the heights of eval.

— *Why:* the author's answers: the bundles, the limit of the standard level with a lower limit of 200 px and the line D / 12 — by the recommendations. Before the work a separate agent checked the design. Its corrections:
- a budget of tokens instead of one long side;
- bars do not link bundles;
- the boxes are by the ink, outward;
- the vectors carry integers, and the numbers are checked against a reference on BigInt;
- the groups and the points are checked at the input;
- the raster is protected from approximate functions;
- LZ77 — with two candidates;
- the module of the synthetic data — outside the build.

The sources — sources 9.6.
- **Nobody had the rule.** `tutor` says only «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px; основная — 32 px». `tutor` has no code of rendering, and `spec` puts «правила вырезки» into the eval protocol: «они одни у устройства и раннера».
- **The median of the groups is fragile.** A stroke group is the whole writing: a fraction, a column, lines in a row. On the "ladder" the ordinary median of the groups is 46 units at a digit of 36, and a drawing with a number gives the mean of the drawing and the digit, 168. Bundles take a sign on its own, and a drawing as one bundle.
- **The sweep.** Twenty-six synthetic sheets — the eleven sheets of the groups' sweep and fifteen sheets of the crop. The median of each was written down before the run. "Breaks" means that the digits at D = 32 come out smaller than 31 px or larger than 48:

  | Rule | What breaks |
  |---|---|
  | bundles, bars outside the count, the lower median, 15 and 100 units — accepted | lines that touch: digits of 16 px |
  | the same, bars link | also a fraction whose bars touch the digits: 16 px |
  | the same, a bar is lower than 10 units | also a "5" with a slanted underline: 110 px |
  | the same, without a ceiling or with a ceiling of 200 | a drawing alone shrinks to 32 or 48 px; lines — 11 px |
  | the same, the ordinary median | a drawing with a number and a house with a number — 12 px; fractions — 29 px |
  | the heights of strokes, the lower median | a house with a number — 14 px; at a "4" and a "+" of two strokes the digits are larger, up to 46 px |
  | the stroke groups, the lower median | a fraction — 16, a column — 12, a circle around the answer — 21, words — 21 px |
  | the stroke groups, the ordinary median | also the "ladder" — 25, fractions — 17, a drawing with a number — 12 px |

  There is no rule without failures: bundles break on lines that touch, the heights of strokes on a drawing next to a number.
- **The standard level.**
  - Claude has two levels: "Standard | All other models | 1,568 px | 1,568" and "High-resolution | Claude 4.7 and later models | 2,576 px | 4,784". A picture costs "⌈width / 28⌉ × ⌈height / 28⌉ visual tokens", and "Images larger than either limit are downscaled before processing".
  - `tutor`'s Claude adapter tells the API to reject a picture that the API would downscale. A crop larger than the model's limit would fail the call.
  - The standard level is taken by any model of Claude, and by OpenAI at `high` — up to 2,500 patches of 32 px and 2048 px — too.
  - A sheet filled with digits of 36 units fits at D = 32: 913 × 1269 px, 1518 tokens.
- **No smaller than 200 px.** "Claude might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels". An answer of one digit at 32 px is 16 × 32 px of work: the margin around it grows, and the scale does not.
- **The line D / 12.** `tutor`'s board draws 3 px at one unit per pixel, and the digit of its synthetic samples is 36: that is 1/12. Crops at different D are one drawing at different scales. At canvas-api the line was 4 units at one pixel per unit.
- **Boxes by the ink.** In `spec` a box of the observation is valid only if «целые 0–1000 и min < max», and the adapter checks it. For a group of a dot or of a bar a box by the points degenerates. The pixel of the edge was added to the box by the review: the raster paints pixels another half pixel beyond the edge of the line, and without it the light edge of the ink went outside the box.
- **Integers and one division.** Go may fuse "x*y + z" into one operation (sources 9.5), while a division of two integers is one operation, and IEEE 754 rounds it the same way. Computing `sheet_box` by its formulas in floating-point numbers diverges from the exact result in the last bit in about a third of cases — 948.4499999999999 instead of 948.45 on a probe of 100,000 random sheets —, so the vectors carry integers.
- **A raster and a PNG of its own**, in the DOM-free code: the HTML Standard does not set the bytes of a PNG (sources 3.1), and the browser's drawing surface brings in noise. In ECMAScript `Math.sqrt` is "Return 𝔽(the square root of ℝ(n))", and `hypot` and trigonometry are "implementation-approximated". So perfect-freehand does not go into the crop.

— *Rejected:*
- **the median of the stroke groups** — by the sweep: a fraction, a column and lines in a row are one tall group;
- **the heights of strokes** — by the sweep: a drawing of many tall strokes next to one number throws the scale off;
- **bundles by the touching of lines, not of boxes** — the sample's resampling would change the touching, and the median would jump;
- **the ordinary median** — with two bundles, a drawing and a number, it is their mean;
- **bars that link** — a fraction whose bar touches the digits becomes one bundle;
- **perfect-freehand and the browser's drawing surface on the crop** — approximate functions and the browser's noise would change the bytes;
- **deflate without compression** — 1.2 MB for the crop of the whole sheet;
- **dynamic Huffman** — it would compress better, but it needs code trees of its own and their own recording, and the crop of a sheet of lines weighs a few KB anyway;
- **LZ77 hash chains** — the repeats of strokes on white are runs of white and the row above;
- **alpha** — the crop is on white; **colour without a style** — a crop of strokes with no style stays gray;
- **Claude's high level** — a model of the standard level would downscale such a crop, and `tutor`'s adapter rejects such a one;
- **a crop without a lower limit** — it can be smaller than 200 px;
- **a line as on the screen, 3 units × s,** — thin for large handwriting, bold for small;
- **a constant line, 3 px,** — bold at 16 px and thin at 48;
- **boxes by the points with the rounding of a half** — for a dot and a bar min = max, and the observation does not accept such a box;
- **boxes by the edge of the line, without the pixel of the edge,** — the light edge of the ink goes outside the box;
- **the crop's numbers and its picture as two tasks** — the author kept them one.

— *Revisit:*
- by `tutor`'s measurement of the AI's reading: the median, the heights D and the line — when it shows at which heights the model reads better;
- when the list of admitted models is fixed: if they are all of the high level, the limit can be raised;
- if lines that touch or crosses through the writing turn up in the samples — the rule of bundles.

— *Consequence:*
- `src/core/crop.ts`, `raster.ts`, `png.ts`, `sets.ts` and `geometry.ts` — the bundles, the crop's numbers with `sheetBoxOf`, the raster and the PNG; `sheets.fixture.ts` and `contracts.fixture.ts` — the synthetic sheets and spec's vectors of the crop;
- `src/core/marks.ts` — the model's box landing by `sheet_box`; `src/core/submission.ts` — `workForCheck`; `src/core/index.ts` — what the entry point `core` exports;
- `src/element/` — `exportWork()`, `probe.ts` and `picture.test.ts`, the grays in Chromium;
- `src/eval/` — the samples' crops, the resampling and the synthetic samples;
- `scripts/package.ts` and `tsconfig.build.json` — the fixtures outside the build and the package;
- `demo/` — the crop at the chosen digit height and its sizes;
- [architecture.md](architecture.md) — the crop and its formulas, the work for checking and the DOM-free code;
- [README.md](README.md) — the code by folders.

**R26. The tutor's marks hold on to the learner's strokes: a mark of the sheet is `{stroke_ids, snapped_box}`, and its box stands around those of its strokes that are visible now. The model's box in fractions of the crop is snapped to the strokes by a rule in integers: the box is wider by a quarter of the digit height, and a stroke is taken if no fewer than two thirds of its points are in it. The marks come by the property `marks`, together with the context of their submission, and for now one kind is drawn — the frame.**
- **The input is the property `marks`:** the marks of one submission together with its context. The types are its own, temporary, until the contract `app` ↔ `api` holds the mark:
  - the context is the crop's numbers, as `cropOf` gives them, with `sheet_box` and the group boxes, the groups of `groupsOf` — the table "label → strokes' IDs" —, and the digest of the table's strokes and of the crop's integers. The context goes to any sheet whose history holds its strokes: the element that gave it out, and the same sheet after a reload;
  - a mark is the kind `frame`, a place and a name. The place is a group label, an answer slot or a box `[ymin, xmin, ymax, xmax]` in integer fractions 0–1000 of the crop, and the name is what a screen reader reads, in the consumer's words. The marks in `api`'s answer come in the same fractions, and `canvas` converts them into the sheet's units;
  - `undefined` removes the marks. Each value is checked anew, even the same object, and marks of the same names on the same strokes write nothing;
  - `task` and `history` are given before `marks`: marks before their history are a `TypeError`. A new history sets the marks anew, wholly: if they do not land, `marks` = `undefined`.
- **The check** — a `TypeError` with the field's path:
  - the kind is not `frame`, the name is empty, the place has not exactly one key, the box is not four integers 0–1000 with min < max, the label is not in the table, IDs repeat in the groups;
  - the group boxes are not the right ones or not in the right order, or `sheet_box` is farther than a millionth of a unit from what the crop's integers yield. Snapping computes on integers, and a millionth can be lost by a store that keeps numbers shorter than JSON;
  - the context is someone else's: a stroke of the table that the sheet did not know, or the digest of the strokes the sheet knows, erased ones too, with the given integers, if it is not the right one;
  - the fields the sheet does not read, it skips. A value assigned before registration goes through the shared helper, so the errors are only `TypeError`, and `null` is an error too, as with `task`.
- **Where a mark is** is decided on assignment — by all the strokes the sheet has known, the erased ones too, but only from the submission's table:
  - a group label — the strokes of its row of the table;
  - a box — snapping, below;
  - a slot, by place — `{ item, slot }`, from 1 — no strokes and no box: the sheet takes no zones.

  `stroke_ids` are the strokes taken, and `snapped_box` is the rectangle of their points, what the model saw. What is written after the submission is not in the table, and no mark takes it. Not a single stroke — there is no mark, and the question sounds without it (sources 1.4; sources 9.7).
- **On a workbook** a mark stands only on an answer slot, by place, and a group label or a model's box is a `TypeError`. It holds on to the strokes of its slot's row of the submission's table, and its box stands around the slot's box and the visible ink of its strokes together, with a margin of 10 units. A slot not from the table has no box.
- **Snapping** — on the crop, in integers:
  - D′, the width w and the height h, the margins my and mx, B — the box of the points in tenths, H — the height by which the scale is taken, in tenths;
  - a point in tenths (px, py) stands on the crop at X = 1000 × ((px − B.xmin) × D′ + mx × H), and Y — the same way, with py, B.ymin and my: the place in px multiplied by 1000 × H;
  - a box holds a point if (xmin × w − μ × D′) × H ≤ X ≤ (xmax × w + μ × D′) × H, and the same by y, with h. The edges are inclusive, μ = 250 thousandths of D′;
  - a stroke is taken if k of its n points are in the box, k ≥ 1 and 3k ≥ 2n — no fewer than two thirds;
  - this is the same as laying the box on the sheet by `sheet_box` and widening it by H / 4. The box is first widened, then clipped by the sheet's bounds, and the clipping changes nothing: the points lie on the sheet;
  - for the submission's strokes every number is smaller than 2^31. The margin and the threshold are parameters of eval (sources 1.4): the function takes the rule, as `groupsOf` does, and an invalid rule is a `RangeError`.
- **In `spec`:** the mark, its kind and its place are in the contract `app` ↔ `api`, with one kind so far, a box; what comes from `api` for the name, the contract decides. The snapping rule is the eval protocol, as written here, with the margin and the share as parameters of eval, and it changes only in `spec`. The term «пометка наставника — mark» is in spec's glossary, and the crop's integers and the digest in the submission context are spec's agreement of `canvas` and `app`.
- **The box on the sheet:**
  - around the points of those strokes of the mark that are visible now and not under the eraser's press, 10 units from them, as in canvas-api, and within the sheet;
  - the corners are rounded, and the line is 2 CSS px at any zoom;
  - the color is the variable `--novatrail-canvas-mark`, blue `#2563eb` by default, temporarily and not red, until the first slice of `app` and `api`. In forced colors — `Highlight`;
  - new strokes do not move it. If all its strokes are erased, it is not seen, and undo brings it back.
- **Over a mark.** While the new points of the stroke being written, with the ink's reach, enter a mark's box, the mark fades to a quarter, and so until the stroke has landed or has been undone. A box that has appeared or moved in the middle of a stroke is checked against the whole stroke. The other marks do not change, and there is no transition.
- **Accessibility:**
  - the marks layer has a constant `role="none"`, and no `aria-hidden`;
  - a visible mark is `<rect role="img" aria-label="name">`, and a hidden one is `display="none"`;
  - the layer takes no input: `pointer-events: none`, as on all the layers but the drawing surface.
- **Code:**
  - the DOM-free part: `marks.ts` — the rule `SNAP_RULE`, the check `marksOf`, the snapping `snapOf`, the marks' places `placesOf`, the current box `shownOf` and the digest `digestOf`. The check's helper shared with the task is `fields.ts`, the box around boxes `around`, shared with the crop, is in `geometry.ts`, and the crop's private `Mark` and `marksOf` became `Extent` and `extentsOf`;
  - the element — the property `marks` and the marks layer; `probe.ts` gives the tests the marks and their boxes;
  - a test checks the code against `vectors/eval/v1/snaps.json` of the package `@altnovatrail/contracts`, and the generator of sheets with a seed is in `sheets.fixture.ts`, shared with the crop test. On the page for probes — the marks by a frozen submission.

— *Why:* the author's answers in the planning of the marks. Fading while one writes over a mark, the property `marks` with the marks themselves and a slot that the type accepts but does not draw — by the recommendations. The margin and the threshold — too, but in two steps: first a quarter of a digit and half of the points, as in canvas-api, and the sweep did not confirm the half, and the author took two thirds. Before the work a separate agent checked the design. Its corrections:
- the margin is a parameter of the rule, and at a threshold of 0 a stroke is taken only if at least one point is inside;
- the box is first widened, then clipped;
- the reference in BigInt is derived from `sheet_box`, and does not repeat the formula;
- where a mark is is decided by all the strokes the sheet has known, and what is seen — on drawing;
- the check of someone else's context;
- the marks layer has `role="none"`;
- fading — by the new points of the stroke;
- the submission on the page for probes is frozen.

The sources — sources 9.7.
- **Nobody has the rule in code.** canvas-api takes the strokes «у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц», but has no code of it. The study says «штрихи, точки которых в основном внутри (поля и порог — параметры eval)» (sources 1.4). `tutor` rejected snapping: the board draws the model's box as it is, and the measurement credits it by the line — «в рамке с полем 8 px больше всего видимых точек именно этой строки».
- **The margin is from the digit height.** The model's error is measured in the pixels of the picture it saw, and the digits on the crop are D′ px at any handwriting. 10 units of the sheet on the crop are from 3 px for large handwriting to 21 px for small. A quarter of a digit at D = 32 is 8 px, as much as the margin of `tutor`'s measurement.
- **The sweep.** Thirty-four synthetic sheets — the sheets of the stroke groups and of the crop — at the heights 16, 32 and 48 px. The target is a group, a bundle or a bar, and the model's box is the ink box of the target with each edge shifted at random by up to ⅛, ¼ or ½ of the digit height, 40 boxes per target. The strokes' points go every 2 units, as with input. The shares — at shifts of up to ⅛, ¼ and ½ of a digit:

  | Margin and threshold | Exact | Extra strokes | No box |
  |---|---|---|---|
  | a quarter of a digit, two thirds — accepted | 81, 77, 61 % | 19, 23, 26 % | 0, 0, 8 % |
  | a quarter of a digit, half — at first | 80, 74, 59 % | 21, 26, 31 % | 0, 0, 6 % |
  | an eighth of a digit, half | 88, 80, 55 % | 12, 14, 18 % | 0, 4, 19 % |
  | an eighth of a digit, two thirds | 89, 81, 49 % | 11, 12, 13 % | 0, 5, 28 % |
  | 10 units, half — canvas-api's | 75, 70, 59 % | 25, 29, 34 % | 0, 0, 4 % |
  | no margin, half | 76, 61, 38 % | 6, 6, 8 % | 17, 29, 45 % |
  | half a digit, half | 48, 49, 49 % | 52, 52, 51 % | 0, 0, 0 % |

  Two thirds at the same margin are better than half at any shift and take a neighbor less often. An eighth of a digit is more exact at small shifts, but at large ones there is no box one time in five, and the models' boxes on handwriting are inexact: the best model's F1 on the answer boxes is no higher than 55 %. On the polylines of the synthetic samples, where a stroke has from two to seven points, half took a neighbor with one end in the box, and exact came out 70, 65 and 50 %.
- **By all the strokes the sheet has known.** A mark holds on to what the model saw. Were it decided by the visible ones only, the marks that came after a clearing would not come back with undo, and a stroke erased before the mark came would not come back into its box.
- **Someone else's context.** Each element numbers the strokes from 1, and a new task is a new element. Another element's context would land on foreign strokes with the same IDs, and a check by place would let it through wherever the same thing was written in the same places on two sheets. The digest knows the strokes to a tenth and a millisecond, as the rules see them, and the crop's integers: another sheet's context or a changed one is a `TypeError`, and the same history after a reload gives the same digest.
- **Fading over a mark.** A mark does not cover the learner's work, and the box's line over the ink would cover what the learner writes across it. Only the mark that is being written into fades, and only while the writing goes on.
- **`role="none"`.** A root `<svg>` without `aria-hidden` the locators engine of Vitest counts as a picture: `SVG:()=>'img'` (sources 9.7), and in Chromium it is a node of its own. A layer without a role would be read as an extra picture without a name, and `aria-hidden` would hide the marks too.

— *Rejected:*
- **10 units of the sheet, as in canvas-api,** — the margin depends on the handwriting, and by the sweep there are fewer exact ones at any shift;
- **half the points** — by the sweep: at the same margin there are fewer exact ones, and more neighbors;
- **no margin** — a model's box slightly narrower than the writing loses strokes: at a shift of up to ¼ of a digit there is no box almost every third time;
- **clipping first, widening then** — a box in the crop's margin beyond the sheet's edge would not take the ink at the edge;
- **deciding by the visible ones on assignment** — the marks after a clearing would not come back with undo;
- **the check by place**, the table's strokes lying wholly in their group boxes, — it lets through another sheet with the same work in the same places;
- **a limit on the box's area, as in canvas-api,** — the validity of a box is checked by `tutor`'s adapter, and the crop is cut to the work, and a large box on it is legitimate — for a column, for example;
- **removing a mark when any of its strokes is erased,** as in canvas-api, — the study removes it when all of them are erased (sources 1.4), and so does the sheet;
- **removing `aria-hidden` when there are marks** — the layer would be read as a picture with no name;
- **a mark that does not fade** — the box's line would lie on what the learner writes across it; **all the marks fade for the time of any stroke** — they would blink on every stroke;
- **`marks` only with the package's interface, later,** — the tests and the page for probes would set the marks through `probe.ts`;
- **a slot is a `TypeError`** — one such mark would break the whole assignment; **slots in the task now** — format v0 may name them otherwise.

— *Revisit:*
- the margin and the threshold — in `spec`'s eval protocol, by `tutor`'s measurement, if it measures the place on the device;
- snapping on a sample's final geometry: eval-set samples and child samples take the points along the stroke's length, every 0.25 units, so the share of points is another for them than for the sheet that wrote them. A sample holds no snapping and `tutor`'s runner does none, so nothing drifts apart until someone snaps a box to the strokes of the geometry (В61 «в реестр spec»);
- when the answer slots come — format v0;
- the color and the look of the box — with the first slice of `app` and `api`.

— *Consequence:*
- `src/core/marks.ts` — the rule, the check, the snapping, the places, the current box and the digest; `src/core/fields.ts` and `src/core/geometry.ts` — the shared check helper and `around`;
- `src/core/marks.test.ts`, `src/core/sheets.fixture.ts` and `src/core/contracts.fixture.ts` — the tests, the sheets by seed and `spec`'s vectors;
- `src/element/` — the property `marks`, the marks layer, `probe.ts`, `marks.test.ts` and the trial consumer, which gives marks with a context;
- `demo/` — the marks by a frozen submission;
- [architecture.md](architecture.md) — the layers, the marks' place and snapping, the docking with `app`, the sample file and the code and tools; README.md and [docs/README.md](README.md) — the marks.

**R27. The package's interface: the writing history comes in by the property `history` and goes out by it and by the event `historychange`, and the work for checking by `exportWork()`: the PNG of the crop, or on a workbook the crop of each filled box, and the submission context with its digest. The same history changes nothing, and another one, once checked, replaces the sheet and places the marks anew. `exportPNG()` and `workchange` are removed, the entry point `core` gives the data types and `replay`, and the element's own buttons are apart from this interface.**
- **`history` in:**
  - the same history changes nothing. It is the sheet's own array, or a history equal to it event by event — by the fields the sheet keeps, with extra fields skipped. `undefined` is an empty history. The stroke under the pen still lands, the marks stay, there is no event. So `app` can give its history at every re-render, and an array already found equal is not walked again while its length and the sheet's history stay the same;
  - another history is checked, and an error is a `TypeError` with the field's path, for example `history[3].stroke.points[0].x`:
    - the structure: the kind of the event, finite numbers, points on the sheet, pressure from 0 to 1, at least one point in a stroke, IDs integers from 1 to 2^53 − 2, so that the next one is an integer too, and not repeated, the pointer type a string. A hole in the array is an error too;
    - time only for order: from 0 and not decreasing along the history, not decreasing within a stroke, and a record no earlier than its last point;
    - the stack rules exactly: the history passes through the actions of the sheet's work, each with its own time, and each one recorded must match the one given. Erasing takes strokes on the sheet, in the sheet's order, clearing applies to a non-empty sheet, and undo takes the last action in force, and `removed` and `restored` follow the stack exactly.

    On an error, the sheet and the stroke under the pen stay as they were;
  - another history replaces the sheet:
    - the strokes, the undo stack — the same rules build it — and the history, in the sheet's own frozen objects;
    - the next ID is the largest in the history + 1, and 1 for an empty history;
    - the clock runs from the last event + the groups' pause of 2 s + 1 ms, 2001 ms, and from 0 for an empty history. The sheet's time is its history's time;
    - the stroke and the eraser's press under the pen are reset: their IDs and time are from the previous sheet;
    - the marks are placed anew, below;
    - there is no event: the assignment is the consumer's own action;
  - a history that is a beginning of the sheet's history replaces it too, with a warning in the console: the actions after it are lost. An empty history is a new sheet, with no warning;
  - `null` is a `TypeError`. A value set before registration goes through the shared helper, before `marks`;
  - `task` and `history` do not depend on each other: neither resets the other, the order does not matter, and `exportWork()` takes the digit height at the moment of the call. A history does not know its own task: a history of another task under this one is the consumer's error.
- **`history` out:**
  - a read gives a frozen array, the same until the next action, with frozen events and strokes;
  - `historychange` is a `CustomEvent` from the host, `bubbles` and `composed`, synchronous after every action, where `workchange` was;
  - `detail` is `{ events, from }`, frozen: the new events of the history and the number of the first of them. A store whose length `from` does not equal has missed events and reads `history` again;
  - a listener's action during the event is announced by the next event, once the current one has gone round all the listeners: each hears the events in the history's order. An assignment resets the count of what has been announced;
  - a stroke that landed when the element had left the page is heard only by the element's own listeners. So `app` listens to the element, not to an ancestor.
- **`filled`**, read-only beside `history`: which boxes of the workbook are filled, and `null` on a sheet. An action changes it before `historychange`, and an assignment of `task` or `history` changes it with no event.
- **`exportWork(): Promise<{ png, submission } | { cells, submission } | null>`:**
  - the sheet at the moment of the call: the stroke under the pen is not on it, and the strokes under an eraser not yet lifted are;
  - on a sheet, the groups by `groupsOf`, the crop by `cropOf` at the digit height and the PNG by `pictureOf`, and the context `{ crop, groups, digest }`, frozen: `crop` holds only the numbers by which the marks are placed (`CropNumbers`);
  - on a workbook, `cells` is `{ item, slot, png }`, the crop of each filled box, and `submission` is `{ boxes, digest }`;
  - the digit height is `canvas.digit_height` of the property `manifest`, integer px from 1 to 256, 32 without a manifest or the field, taken at the moment of the call: `task` and `manifest` do not depend on each other;
  - for an empty sheet, and for a workbook with no box filled, `null`: an empty work is cut off before the AI call;
  - the DOM-free part, `workForCheck`, computes all of it, and the element only puts the bytes into a `Blob`.
- **The submission digest** is CRC-32 and Adler-32 from the PNG encoder, 16 hexadecimal digits, of a text in UTF-8:
  - the strokes of the table in ascending order of ID: the ID and the points in tenths of a unit and whole milliseconds, as the rules of the groups and the crop see them;
  - the context's integers: D′, width, height, margins, `exact`, groups and boxes. `sheet_box` is not in the text: it is derived from these numbers and checked against them with a tolerance.

  The digest catches an accidental divergence, not a forgery: CRC-32 sees any change within 32 consecutive bits, and any other passes both sums with a chance no greater than about 2⁻³². `marksOf` checks the digest's form, and `placesOf` the digest itself: a stroke of the table that the sheet did not know is a `TypeError`, and so is a digest of strokes the sheet knows, erased ones too, with the integers given, if it is not the right one. The marks are no longer checked by place, and the matching of the boxes' labels against the groups stays. The same history after a reload gives the same digest, and a sheet with other work or a changed context gives a `TypeError`. `app` keeps the history and the context as they are, through JSON: a store that rounds changes the digest.
- **Marks under a new history or a new page** are placed anew, whole: the digest holds the whole table. If they fit, they stay, and what has not changed is not written to the DOM. If they do not, `marks` = `undefined`, there are no boxes and no event; the same page writes nothing. Marks before their history are a `TypeError`, and a workbook's context is checked against the page's boxes, so the consumer gives `task` and `history` before `marks`.
- **The agreement** of `canvas` and `app` is in `spec`'s contract of the element: the property `history`, the event `historychange` with its frozen `detail` `{ events, from }`, and the asynchronous `exportWork()` with its work and its context, which carries the crop's integers and the digest; `app` keeps the history and the context as they are, without rounding.
- **Removed** are `exportPNG()` and `workchange`, and with them the path of the pen without pressure for the picture of the sheet. The package had not come out then: it had no GitHub releases, and npm gave 404 (sources 9.8). The picture of the whole sheet is `exportPicture()`, the PNG of the strokes the sheet or the workbook's page shows, with no condition, for the stored work, which `app` sends to be stored, not checked; `exportWork()` stays the one picture for the check.
- **`core`** gives `SHEET` and `replay`, and as types `Stroke`, `InkPoint`, `HistoryEvent`, `Task` with its parts and `GridKind`, `Marks`, `Mark`, `Anchor`, `SheetSubmission`, `WorkbookSubmission` and their union `Submission`, `CropNumbers`, `Crop`, `Frame`, `Group` and `Box`. `Media` stays with the element: it holds a `Blob`. The data types come from `spec`: the writing history, the submission context with its parts, `Filling` and `DemoState` from `@altnovatrail/spec/canvas`, and the task, the example and the manifest from `formatv0/open`. The code of `core` runs without the DOM, and `boundary.check.ts` holds it to that, but the file of `spec` the types come from names DOM types too — `Blob`, `CustomEvent` and `HTMLElement` —, and `core`'s declarations lead to it: a consumer of `/core` in Node without the DOM library and with `skipLibCheck: false` gets 6 errors TS2304, with `@types/node` one, on `HTMLElement`, and with `skipLibCheck` or the DOM none. No consumer is like that: `app`, the samples page, the tests and the synthetic samples have the DOM or `skipLibCheck`.
- **In passing:**
  - the input recorder clamps pressure to 0–1: an event that a script makes may give more, and the sheet would write a history it would not itself accept;
  - a stroke whose points are far outside the visible part is not drawn until it comes into it: an assigned history can hold thousands of strokes;
  - a stroke's ID does not repeat within one history.
- **The element's types** are `HistoryChange`, `HistoryChangeEvent`, and of the work `ExportedSheet`, `ExportedWorkbook` with `ExportedCell` and their union `ExportedWork`, and `historychange` is in `GlobalEventHandlersEventMap`, with no code: the type holds on the element, on its ancestors and on `document`.
- **Code:**
  - in the DOM-free part: `resume` of the clock, `restart` of the input recorder, the check of the history and its comparison (`history.ts`), the restoring of the work, `Work.restore`, with actions that take the event's time, `nextIdOf` and `resumeOf` (`work.ts`), the digest `digestOf` (`marks.ts`), the work for checking `workForCheck` (`submission.ts`) and the manifest's digit height (`manifest.ts`);
  - in the element: `history`, `historychange`, `filled`, `exportWork()` and the new placing of marks;
  - the type checks: `entry.check.ts` and `interface.check.ts`;
  - the trial consumer: `app`'s path; the page for trials: by `exportWork()` and with the button "Reopen".

— *Why:* the author's answers, all by the recommendations: the buttons apart; remove `exportPNG()` and `workchange`; the submission's sign is a digest; a new history places the marks anew; `core` is the types and `replay`. Before the work a separate agent checked the design. Its corrections:
- the check of the history goes through the actions of the sheet's work with the event's time, without the clock;
- there is no comparison with the last value assigned;
- time only for order;
- the event is reliable when a listener itself acts or assigns a history;
- the history's arrays are frozen too;
- the digest holds the context's integers too;
- pressure is clamped to 0–1, and only visible strokes are drawn.

The sources — sources 9.8.
- **The buttons apart.** The buttons needed a shared scheme of translations for UI packages, which `app` was to hand over and had no code for, and `app`, the samples page and the measurement needed the interface of the history and of the check before the buttons.
- **One event.** `historychange` comes at the same moments as `workchange`: one history event per action. Two events per action would double the listeners, and `detail` gives `app` what it has to append on the device.
- **One picture for the check.** What goes to the check is the crop by A3. The PNG of the whole sheet was for the board, the board did not take the element, and beside `exportWork()` it would invite sending the wrong picture: the picture of the whole sheet is `exportPicture()`, for the stored work alone.
- **The same history, by content.** `app` keeps its copy — appended to, or read from the device — and gives it at every re-render. A comparison with the last array assigned would miss a copy appended to in place, and by identity alone the sheet would be rebuilt at every re-render.
- **A strict check.** The sheet takes only a history it could have written itself. The undo stack is built by the same rules that built it in writing, and `undo()` after opening takes back the previous action. Time only for order: the input keeps one writer at a time, so IDs grow in the order the strokes begin and strokes do not overlap in time, but the check does not rest on that: several touches at once would break the exact time of a record and growing IDs.
- **The digest.** Every sheet numbers its strokes from 1, and a check of the marks by place let through another sheet with the same work in the same places. The digest knows the strokes to a tenth and a millisecond, as the rules see them, and the context's integers: changed numbers of the crop would otherwise place the marks by numbers that are not theirs. It is synchronous, since the setter of `marks` is synchronous. It catches no forgery, and there is no need to catch one: the context is `app`'s own data, and an error of `app` — another's context or a changed one — it does see, but for a case with a chance of about 2⁻³².
- **The digit height in the manifest.** It is a setting of the module's canvas, and `spec` puts it into the module manifest, not into each task.
- **A pause after the history.** Without it, the first stroke of a new session would become a neighbor of the previous session's strokes and join their group.
- **Reset what is under the pen.** The ID of the stroke under the pen may coincide with a stroke of the new history, and its time may turn out earlier than the history's last event. The IDs an eraser's press has taken are from the previous sheet too: keep it, and lifting it would erase the strokes of the new history with the same IDs.
- **`core`.** A consumer without the DOM needs to read a saved history: the types and `replay`. The rules of the groups, of the crop and of snapping are proposals to the eval protocol, and in `core` their signatures would become the package's interface before the protocol.

— *Rejected:*
- **the buttons with this interface**: they waited for the shared scheme of translations;
- **`exportPNG()` and `workchange` beside the new interface**: two events per action and a picture that does not go to the check; **removing only `workchange`**: the PNG of the whole sheet would be left with no consumer;
- **the check of the marks by place**: it lets through another sheet with the same work;
- **marks that a new history always removes**: the same history after a reload would lose them; **marks that wait for their history**: another's context would then silently show nothing, without a `TypeError`;
- **comparison with the last array assigned** and **by identity only**: for the reasons above;
- **the exact time of a record and growing IDs**: several touches at once would break them;
- **a digit height for each task**, in the task's own field: it is the module canvas's setting;
- **`core` with the rules**: before the eval protocol; **`core` with `SHEET` only**: a consumer without the DOM could not read the history;
- **`core`'s own copies of the data types, with a check for identity**: the declarations would stay without the DOM, but the seam would again rest on copies, which the task's types from `spec` left behind; **a row «в реестр spec» about a DOM-free subpath at once**: a question to `spec` with no consumer;
- **SHA-256**: in the browser it is asynchronous; **one CRC-32**: it alone would be enough, and Adler-32 is a second sum for free, from the same PNG code;
- **an event on an assignment of `history`**: the assignment is the consumer's own action.

— *Revisit:*
- the composition of the event and of the context, with `spec`'s contract of the element and the eval protocol;
- the check of the history, if other code starts to give one: the stack rules are then a format;
- the warning about the beginning of a history, if a consumer rolls the sheet back that way on purpose;
- the data types of `core`, when a consumer of it without the DOM and without `skipLibCheck` appears: then a row «в реестр spec» about a subpath of `@altnovatrail/spec/canvas` with data types without the DOM.

— *Consequence:*
- `src/core/` — the check and comparison of the history, the restoring of the work, the digest, the work for checking, the clock, the recorder, and the exports of `index.ts` with `entry.check.ts`;
- `src/element/` — `history`, `historychange`, `filled`, `exportWork()`, the placing of marks anew, and `interface.check.ts`;
- `scripts/package.ts` — the entry points as a consumer takes them;
- `demo/` — the trials by `exportWork()` and "Reopen";
- `page/` and `src/eval/` — `historychange` heard on the element itself, and the measurement sample's history from `history`;
- [architecture.md](architecture.md) — the element's data, events and methods and the entry point `core`;
- README.md.

**R28. The sheet's own buttons are a vertical toolbar by the APG on the element's bar of glass: one Tab stop, the radio group «Инструмент» of the tools the task allows and the hand, «Отменить» and «Очистить». The labels come from a table of the element's own in `en` and `ru`, by the element's own `lang`; the tools from the task's field `canvas.tools`, the element's own; and the element announces a change of tool by the learner, and only by the learner, with the event `toolchange`.**
- **The bar** is `role="toolbar"`, `aria-orientation="vertical"`, first in the shadow tree, before the sheet's region; the mockup's bar of glass, and `tools-hidden` hides it. Its buttons, top to bottom:
  - on a task from paper only, the button atop the tools — "Hide the task" or "Show the task" — and a line;
  - the group `radiogroup` «Инструмент» of `<button role="radio" aria-checked>`: «Перо», «Ластик» if the task allows it, «Рука». The tool in use shows its icon filled;
  - «Отменить» and «Очистить», `<button>` elements that call `undo()` and `clear()`;
  - on a task from paper only, a line and the button that turns the grid round.
  A worked example has no bar: the learner does not write on its sheet, and its Next and Demo stand in a row of the same glass at the bottom.
- **The keyboard**, by APG Toolbar (sources 9.9):
  - one Tab stop, a roving `tabindex`: the first entry is on the first button shown — «Перо», or a task from paper's button atop the tools —, later ones on the button that had the focus last;
  - ArrowDown and ArrowUp go to the next and the previous button shown, round the bar, and Home and End to the first and the last; the arrows move the focus and choose nothing; ArrowLeft and ArrowRight do nothing;
  - Space and Enter press the button; the bar takes no key with Alt, Ctrl or Meta;
  - a button that goes — «Ластик» with a task without the eraser, a task from paper's two — gives its stop of Tab, and the focus if it had it, to the first button shown;
  - the glass is no Tab stop, and a press on it between buttons takes the focus nowhere.
- **Unavailable buttons:** «Отменить» while there is nothing to undo and «Очистить» on an empty sheet are `aria-disabled="true"`: paler, still focusable, and a press does nothing.
- **The labels** are a table of the element's own, `src/element/labels.ts`, in the platform's interface languages `en` and `ru`, by the rules of translations the UI packages share. The table holds the buttons, the group «Инструмент» (Tool), the bar's names, the kinds' names, a workbook's boxes, a demo's parts and the tracing paper's grip:
  - the language is the element's own attribute `lang`, which it watches (`observedAttributes`); it does not read an ancestor's language;
  - the tag is looked up as RFC 4647's lookup does (sources 9.9): in lower case, the tail cut off subtag by subtag, a singleton subtag together with the next one; none found, English;
  - the bar, its tooltip and each other labelled node have their own `lang`, the language of the labels they show: a screen reader reads English labels under `lang="de"` in English; for a `lang` outside the table the region too;
  - the constructor labels in English and reads no attribute: one that was there before registration comes right after it;
  - a label with a number or a word inside is one string with placeholders by name — «Часть {n} из {total}.», «Окошко {slot}», «{name}, заполнено», «{name}: {value}» —, never pieces glued together; a place with no value is a `TypeError`, not braces on the screen;
  - no label counts things, so none has plural forms; the first that does takes the CLDR categories, `other` among them, by `Intl.PluralRules` of the label's language;
  - the buttons' labels are the words of the packages' shared table in `spec/docs/architecture.md`; no label tells the learner's gender or speaks as the AI in the first person (П-15). The phrases only `canvas` shows are in [architecture.md](architecture.md), with the docking with the app.
- **The names:** the bar is named by the kind's buttons — «Кнопки листа», «Кнопки тетради», «Кнопки задачи с бумаги»; "Sheet buttons", "Workbook buttons", "Task from paper buttons" —, and the kind's own name — «Лист», «Тетрадь», «Задача с бумаги», «Пример» — is the scroll container's region, so that a screen reader does not show the toolbar and the region under one name.
- **The task's tools** are the field `task.canvas.tools` of both canvas kinds, the element's own: format 0.4 has no field of tools — every task has the pen and the eraser, and a field for other tools is a minor version of the format (`spec/format/README.md`) —, and the element's strict check of the task lets this one field through. Its type is the element's `Task`, not `CanvasElement`'s (Д5 in [run/DEBT.md](../run/DEBT.md)):
  - a list of strings, as in spec's illustrations of a task; without the field the pen and the eraser. The sheet takes `"pen"` and `"eraser"` and skips unknown ones — a ruler, a calculator —: `app` shows some, others come with new versions of the element;
  - without `"pen"`, a `TypeError`: the sheet writes with the pen. Not a list, a hole or not a string: a `TypeError` with the field's path;
  - without `"eraser"` there is no eraser at all: no «Ластик»; the back end of the pen neither erases nor writes; `tool = "eraser"` is a `TypeError`;
  - the hand is no tool of the format: every sheet the learner writes on has it, a worked example none. A task from paper has the pen and the eraser;
  - undo and clearing are not tools: spec's list of the tools does not name them, and they always have buttons.
- **`tool` and the buttons are one** (`Tool` = `"pen" | "eraser" | "hand"`, spec's contract):
  - a button chooses `tool`, and an assignment of `tool` checks its button; a tool the sheet shown has not — the eraser without the task's, the hand on a worked example — is a `TypeError`;
  - a sheet shown anew without the tool in use puts the pen back, with no event; a press under way goes on as it began;
  - `toolchange` is a `CustomEvent` from the host, `bubbles` and `composed`, with a frozen `detail` `{ tool }`, on the learner's choice of another tool by a button. An assignment of `tool`, a second press of the chosen one and the pen put back give none;
  - a consumer that gives `tool` itself listens to `toolchange`, or its re-render brings back the previous tool; after a new task it takes `tool` from the element.
- **The theme:** the bar's text the ink; the chosen tool and the focus ring (`:focus-visible`, 2 px) the accent; an unavailable button paler by colour, `color-mix` of 40 % ink on paper, not by opacity, which would pale the ring too (WCAG 2.4.7, 1.4.11; sources 9.19) — by opacity only where `color-mix` is not supported. In forced colours: the bar Canvas and CanvasText; the buttons ButtonFace, ButtonText and ButtonBorder; the chosen one Highlight and HighlightText; an unavailable one GrayText; the ring Highlight.
- **The pointer:** the rail is as wide as nothing and has no `pointer-events` of its own, so a consumer's `pointer-events: none` on the element during a check stops the buttons' pointer too, but not their keys.

— *Why:* the author's answers — unavailable buttons pale and keep the focus, labels of the element's own, «нет в списке — нет на листе» ("not in the list, not on the sheet"), `toolchange` from the learner, no plural forms until a label counts, the bar named by its buttons and the region by the kind. The sources — sources 9.9.
- **`aria-disabled`, not `disabled`.** `disabled` takes a button out of the focus: the last undo from the keyboard would drop the focus off the bar. APG allows unavailable items of a toolbar to stay focusable, so that they are found.
- **Radio buttons, not toggles.** The tools are a choice of one, as APG's toolbar example describes it. A toggle `aria-pressed` would switch the tool off with a second press, into nothing. Buttons, not `<input type="radio">`: with native radios the arrows choose, and in a toolbar they only move the focus.
- **The element's own `lang`.** `app` sets the language, on the element itself. `HTMLElement.lang` does not reflect an ancestor's, and the element cannot watch all its ancestors.
- **A table of its own.** The UI packages share the rules of translations and each keeps its own tables; two rows of a table are easier to change than translations in every consumer.
- **The task allows.** "The tools are allowed by the task", says spec's description of the canvas: an eraser the task did not give erases neither by the button nor by the pen. Unknown tools are skipped: the task names `app`'s tools too, and the element's new tools come with new versions of the package.
- **`toolchange` only from the learner.** web.dev: "Do not dispatch events in response to the host setting a property (downward data flow)". The consumer made the assignment and knows of it.
- **Placeholders by name.** Languages put their words in other orders; a glued label could not be translated.
- **The bar named by its buttons.** In the screen reader's list of landmarks stands the sheet itself, under its kind's name.

— *Rejected:*
- **`disabled`** and **always available buttons**: for the reason above, and then nobody sees that there is nothing to undo;
- **`aria-pressed` on the tools** and **native radios**: for the reasons above;
- **an ancestor's language** and **`Intl.Collator.supportedLocalesOf`**, which looks up by the engine's languages, not by the table;
- **labels from the consumer**: every consumer, the samples page too, would translate them; **English only**: a Russian interface would read English;
- **a list that hides only the buttons**: the eraser would erase by the pen where the task did not give it; **an unknown tool is a `TypeError`**: the sheet would not show a task of `app` with a ruler or a calculator;
- **an event on an assignment of `tool`** and **an element with no event**: for the reasons above;
- **`delegatesFocus`**: a press on the drawing surface would give the focus to the pen's button;
- **plural forms in code now**: code the package does not call;
- **the bar named by the kind, the region «Лист с задачей»**: the pair «Лист» and «Лист с задачей» confuses; «Лист с условием» neither — «условие» in spec's glossary is a check's predicate, not the statement.

— *Revisit:* the field of tools, with the minor version of the format that has one (Д5 in [run/DEBT.md](../run/DEBT.md)); the keyboard during a check, by a property that stops it too, if `app` asks for one.

— *Consequence:*
- `src/element/tools.ts`, `src/element/labels.ts`, `src/element/index.ts` — the bar, the labels, `tool` and `lang`;
- `src/core/task.ts` — the check of `canvas.tools`;
- `src/element/tools.test.ts`, `src/element/labels.test.ts`;
- [architecture.md](architecture.md) — the language and the labels, the code, accessibility.

**R29. Input on tablets: pen mode is one for the whole page, from a pen's touch on any sheet till the page reloads, and nothing turns it off; in it a finger neither writes nor erases, one finger past the slop drags the sheet, and two fingers scroll it always. A palm is a touch wider or taller than 100 CSS px. One pointer writes at a time, and the pen removes a touch's stroke under way. Scrolling by fingers is code of its own, across as well as down.**
- **Pen mode** is one for the whole page, in its memory (`PEN_MODE`):
  - a pen's `pointerdown` on the drawing surface of any sheet the learner writes on turns it on, by either button — the tip or the pen's eraser. A hovering pen does not, nor a press under the hand, the tool that moves the sheet;
  - nothing turns it off: the next task is a new element, and the mode stays till the page reloads. Nothing is stored or sent;
  - in pen mode a finger neither writes nor erases. The mouse does not touch the mode;
  - a worked example's sheet neither turns it on nor off: its drawing surface takes no input and has the browser's `touch-action`, so a finger and a pen scroll it natively, as they scroll the statement;
  - the mode knows whether any sheet of the page is written on: each sheet enlists whether a pointer writes or erases on it (`enlist`, `writing`), and no single finger drags while one does.
- **A palm** is a touch whose `width` or `height` is greater than 100 CSS px, on `pointerdown` or on any coalesced `pointermove`:
  - it neither writes nor scrolls until it lifts;
  - the stroke it was already writing is removed, as on `pointercancel`: there is no history event, and its ID stays taken;
  - the palm ends the scrolling it was in.
- **Who writes:**
  - one pointer at a time. Several touches at once never write;
  - the pen removes a touch's stroke that is under way — that was a palm —, ends a gesture under way, and writes itself. While a pen or a mouse writes, a touch does nothing, and a touch that was on the screen when the pen came does nothing until it lifts;
  - without pen mode the first touch writes or erases by `tool`. A second touch that came no later than 150 ms after the first, while that one has moved no more than 8 px, removes its stroke or eraser's press, and both fingers scroll. A later second touch does nothing, and the stroke goes on;
  - in pen mode a touch waits. A second that comes within 150 ms of it makes the two a scroll; one that goes past 8 px with no second drags the sheet alone, by its own travel, and every other finger down then, and every one that comes while it drags, does nothing until it lifts. No single finger drags while a sheet of the page is written on, and a pen never drags;
  - a third touch does nothing. When one finger of a pair lifts, the gesture ends, and the other does nothing until it lifts;
  - a mouse and a pointer without a type write when nobody else writes;
  - a finger's press that was under way on another sheet when the pen turned the mode on goes to its end as it began;
  - the drawing surface holds by capture every pointer that came down on it, until it lifts, whether it writes or not. A pointer that comes down again under the same ID has lost its `pointerup`, and the stroke it was writing lands where it was — as on a loss of capture;
  - a pen that comes down while another pen is down writes: the other one's stroke or erasing lands where it was, as on a loss of capture, and the hands forget it (`HandsSheet.end`). A screen has one pen, and on an iPad the system's selection took a pen's touch and the page heard neither `pointerup` nor `pointercancel` nor a loss of capture; the next touch came under another ID, and the sheet, which waited for the old pen's lift, wrote nothing until the next task (measurements 1.8). With the hand, a pen that moves the sheet lets it go the same way. A finger still writes nothing in pen mode.
- **Scrolling by fingers** is code of its own, because `touch-action` acts on the pen too:
  - two fingers move the sheet with their midpoint, a dragging finger with itself. The threshold is that point's travel, 8 px; the first step has no jump: it is the share of the travel along each axis that lies beyond the threshold;
  - across counts only while the sheet is wider than its container (`HandsSheet.across()`, the container's overflow across); otherwise only the travel down counts. The rail: if, crossing the threshold, the point has gone twice as far along one axis as along the other, the gesture goes only along it until its end (`RAIL`): a scroll down does not wander sideways;
  - a step is a whole pixel, the remainder goes into the next step, and it is `behavior: "instant"`;
  - what to scroll along each axis, the gesture's first step along it chooses, and the choice holds until the gesture's end (the latch). It is the sheet's container if it can move that way, otherwise the host's nearest scrollable ancestor — across shadow boundaries, up to an `overscroll-behavior` of `contain` or `none` —, otherwise the page. A page with hidden overflow, as under a modal window, is not scrolled: a finger would not scroll it either. The page's overflow is the root's, and if the root's is `visible`, then `body`'s (CSS Overflow 3). A container at its edge passes the scrolling on with the next gesture;
  - the shift is divided by the target's own scale: an ancestor with `transform` changes the fingers' path on the screen;
  - there is no inertia, and the sheet stops with the fingers;
  - for the time of a check, with `pointer-events: none` on the element, a new gesture does not start, and one already started goes on until the lift;
  - outside the drawing surface — the statement and the bar — a finger scrolls by native scrolling;
  - the hand moves the sheet through the same steps and latches, by its pointer's travel.
- **The thresholds** are `PALM_PX` 100 CSS px, `PAIR_MS` 150 ms, `SLOP_PX` 8 CSS px and `RAIL` 2, in pixels of the screen, not of the sheet.
- **No selection and no menu of the system** on the whole element, the bar, the statement, the parts and the sheet: `user-select: none` and `-webkit-touch-callout: none` on the host, and on the workbook's print, which `all: initial` takes them off; `selectstart` stopped on the shadow root; a pen's `touchstart` and `touchmove` on the drawing surface cancelled, by `touchType` "stylus", and a finger's left as they are.
- **What the canvas will not fix:**
  - WebKit 269535: on an iPad the Apple Pencil gives no pointer events while a finger or the edge of a palm touches the screen;
  - Chrome on Android, when a pen touches, releases the touches under way by a `pointerup` event. A palm that was writing before the page's first pen leaves a stroke, and «Отменить» removes it;
  - a palm on the bar is not cut off.
- **Code:** `src/core/hands.ts` — the rule `Hands`, the mode `PenMode`, the types `Contact` and `HandsSheet`, the thresholds; `src/element/session.ts` — the page's `PEN_MODE`; `src/element/index.ts` — the field `#hands`, `#scroll`, `#flush`, `#scrollerFor`, the latches `#latch` and `#latchAcross`, and `#lifted`, where a lift, a cancel and a lost capture release the latches. Tests: `src/core/hands.test.ts`, `src/element/hands.test.ts`, `src/element/selection.test.ts`.

— *Why:* the author's answers, all by the recommendations: build it without a tablet, devices check it later; pen mode for the whole page; a palm wider than 100 px; the second finger soon after the first; no inertia. The sources — sources 1.1 and 9.10.
- **A mode for the whole page.** A new task is a new element. A mode on the element would be reset at every task, and each task's first palm would write. canvas-api turns the mode on «в сессии» ("in the session").
- **No way out but a reload.** The author's word: «Непонял зачем инструмент draw with finger. Удали его». In pen mode the finger has a job — it moves the sheet —, and a learner whose pen is gone reloads the page.
- **One finger drags in pen mode**: it is the single pointer's way to scroll that WCAG 2.2's 2.5.1 asks for (sources 9.10), on the two fingers' code and slop. A palm does not move the sheet by it: a touch wider than 100 px does nothing, a smaller one drags only past the slop with no second finger, and the pen, when it touches, ends the gesture.
- **No selection on the whole element.** On an iPad with Apple Pencil a pen's double tap or long press, the way a dot or an equals sign is written, selected text by the bar and brought up the system's menu of the selection over the sheet, with Scribble off too (measurements 1.8), while the styles kept only the scene from a selection. A selection is no part of what a screen reader reads, so the labels and names stay as they were; what reads a selection aloud, and the copy of the statement, go with it. A pen's touch events come after its pointer events, which write: cancelling them takes nothing from the stroke, and the system's gestures do not start.
- **No drag by one finger while a sheet is written on.** A drag may scroll an ancestor or the page, which moves every sheet of it: nothing moves under the pen.
- **100 px, not 30.** WebKit on iPadOS gives a touch a width of double the radius, and, by another project's report, at a fingertip that is 40–60 px. canvas-api's 30 px had no code behind it, and on the main device with a pen it would take drawing away from the finger. A high threshold lets a small touch of a palm through, but in pen mode a touch does not write anyway.
- **A palm by `pointerdown` and `pointermove`.** On `pointerup` Chromium gives `width` and `height` 1, and a palm grows as it lands.
- **The pen removes a touch's stroke.** A touch that writes when the pen touches is a palm that landed earlier. Pointer Events Level 3 allows the device itself, too, to ignore touches while the pen writes.
- **A window of 150 ms and a tolerance of 8 px.** Android waits 100 ms to tell a tap from a scroll (`TAP_TIMEOUT`) and counts as a scroll a path longer than 8 dp (`TOUCH_SLOP`). The 50 ms on top are a margin for children's fingers. The window works in pen mode too: a thumb that holds the tablet will not make a pair.
- **Scrolling by code of its own.** `touch-action` "does in fact apply to all forms of pointer inputs that allow direct manipulation", that is, to the pen too. The open W3C issue pointerevents #203 is about the same: a pen that writes beside a finger that scrolls cannot be expressed by `touch-action`.
- **A container for the whole gesture.** Within a gesture the sheet's container and the page do not compete, and at the edge the scrolling goes further with the next gesture. How the browsers themselves hold a gesture has not been checked against a source: this is a decision of our own.

— *Rejected:*
- **a mode on each element**: it would be reset at every task; **a property and an event** for `app`: more interface for what the page remembers anyway;
- **keeping the button «Рисовать пальцем»**, which turned pen mode off: the author's word above — an unexplained control on the bar; **a toggle with `aria-pressed`** would besides hold the choice when the pen is in the hand again, and a palm would write;
- **a switch to draw with the finger instead of pen mode**: an extra action for the learner on every device with a pen;
- **the mode by the pen's hovering**: a pen brought near the screen would take drawing from the finger before it writes;
- **the threshold of 30 px**: for the reason above;
- **several writing touches at once**: a palm would write beside a finger, and the order of the strokes by ID would diverge from the order of writing;
- **`touch-action: pan-y` on the drawing surface in pen mode**: `touch-action` acts on the pen too, and by WebKit 238543 Safari scrolls with two fingers even where `touch-action` forbids zooming;
- **handing the scrolling to the page in the middle of a gesture**: the container and the page would compete within one gesture;
- **delaying a finger's stroke**, so that the pen has time to remove it: a finger would draw with a lag;
- **touch events against WebKit 269535**: by Apple's forum, they behave the same;
- **inertia**: the author's answer: on iPad and Android it is tuned on the devices;
- **the selection forbidden on the scene alone**: the bar, the statement and the parts were selected, and the system's menu came up over the sheet; **a pen's touch events cancelled over the bar too**: the pen would press no button there, whose click follows the touch events; **a finger's on the drawing surface**: they start nothing of the system's that the styles let through, and fingers scroll by pointer events;
- **a new pen waiting for the old one's lift**: when iPadOS took a pen's touch, the sheet wrote nothing until the next task; **a timeout on a pen that is down and still**: a pen held still while thinking would lose its stroke.

— *Revisit:*
- the thresholds, the window, the slop, the rail, inertia, WebKit 269535 and 238543, and a palm before the first pen on Android — on devices, Д7 in [run/DEBT.md](../run/DEBT.md);
- the mode across a reload, by a property for `app`, if it asks;
- a way out of pen mode without a reload, if learners on devices need one.

— *Consequence:*
- the files and tests of **Code** above;
- [architecture.md](architecture.md) — scrolling with one pointer, the input and the palm rejection, scrolling on the drawing surface, the bar, what `app` does for pen mode, the table of accessibility;
- [sources.md](sources.md) — the record of input on tablets.

## `spec` tag v0.2.35

**R30. `canvas` is on `spec` v0.2.35: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it. `spec` has decided the rows «в реестр spec» В29, В30, В32, В34 and В39, and they are closed: the documents name its decisions instead of them. The second canvas kind of the first slice is the workbook, and `canvas` details it: epic E6. The temporary task type moves to `spec`'s task schema of format v0 by a task of its own.**
- **What the tag brings to `canvas`** (`git -C spec diff v0.2.18 v0.2.35`, read 2026-10-26). The releases v0.2.19–v0.2.35 answered five rows of `canvas` and the questions it was waiting for. What `canvas` gets with the tag, Д18–Д22, Д25, Д27–Д29 and Д32–Д34 in RUN.md of `spec` name:
  - **the first slice** (В32): it is three modules of two subjects, and the slice's canvases are the handwriting sheet and the workbook; it has no text canvas.
    - The sheet serves olympiad mathematics and short essays in English, and the workbook the school mathematics of grade 3: the task's items stand on the non-erasable template layer, and the answer to each is a number or a fraction by hand in its answer slot.
    - В32 is closed otherwise than `canvas` advised: the second module is not Spanish A1, and the modules became three.
    - `spec`'s card of `canvas` gives `canvas` the detailing of the workbook: the page, the answer slots, the crop of a slot and the template layer.
    - `speak`, of `spec`'s decision that UI packages enter their consumer as web components and of `app`'s card, is left until the text canvas, "later";
  - **the task** of format v0, the schema `task.schema.json`:
    - the canvas kind is `handwriting_sheet` or `workbook`. For a sheet the task gives the grid `grid` and its step `grid_step`, from 20 to 500 units, 50 without the field;
    - **the task statement** (В34): paragraphs and pictures with a description and a size. It is part of the author's template, and whether it is above the canvas or on it, the canvas kind decides: a sheet shows it above the sheet. So В34 is closed, by `canvas`'s recommendation, and `spec`'s glossary is amended on the task and on the canvas;
    - **each task has a pen and an eraser** (В39), and there is no field of tools in v0: it will come with a minor version, with the first module that needs a ruler or a calculator. So В39 is closed, not by `canvas`'s recommendation: `spec`'s decision on the task rejected "a field of tools of the pen and the eraser";
    - **the digit height on the crop** is `canvas.digit_height` in the module manifest: integer px from 1 to 256, 32 without the field. The same decision rejected a height for each task, as the temporary type's `canvas.digit`. That answers В38 as to the digit height, and how the app gets it with the task, a task of `spec`'s plan decides;
    - the task's items with answer slots and the slot bindings of v0: on a sheet `anywhere`, `sheet`, `zone` and `choice`, on a workbook the line's box, `box`. A zone is `left`, `top`, `width` and `height` in units of the sheet;
  - **the first code of stage 2 and `spec`'s order of the first code by repositories** (В29): the first code of `canvas` is the sheet, the element `<novatrail-canvas>`. The samples page, the synthetic samples and the build from a file wait until the measurement needs volunteers' or children's samples: that is epic E5;
  - **the addition to П-10** (В30): where the page offers to put a sample file on an iPad, the planning of E5 chooses, and whether that is enough, a lawyer decides in epic E4 of RUN.md of `spec`;
  - **the place on the canvas**: in an observation and in the contract `app` ↔ `api` it is fractions 0–1000 of the crop, `[ymin, xmin, ymax, xmax]`, integers. `canvas` converts it into units of the sheet, and `sheet_box` does not leave the device. So Т-32 is closed — by what `canvas` decided for itself on the sheet's units and the place from the model — and with it the mark's place from В37;
  - **the writing history and the AI**: nothing goes from the writing history to the AI, and П-21 is closed. This log's decision on the sample file does not change: the writing history does not go to the check anyway;
  - **the module format, its conventions and the module's folder**:
    - the module format has a version of its own, MAJOR.MINOR, and a window of versions. `canvas` releases a new canvas kind before the module that takes it, by `spec`'s flows between repositories;
    - the names of fields and the values are in snake_case;
    - a picture is named by its path from `media/`, and a task by its full ID;
  - **`spec`'s decisions on the samples page and on the synthetic samples in `tutor`'s CI:**
    - the measurement of the course of writing is done on the sheets of `tutor`'s board and on synthetic samples, without `canvas`'s page;
    - `tutor`'s release with the measurement's tasks and the check of `canvas`'s synthetic samples in `tutor`'s CI wait for epic E3 of `tutor`;
    - `canvas`'s page writes the volunteers' and the children's samples, when it comes to them;
    - `tutor`'s temporary file of the measurement's tasks moves to `spec`'s task schema.

    This goes to E5 and Д4;
  - **the calling `release.yml`**: the template of its `paths` lists what the release is built from, by the kind of repository. `.github` writes the list for the kind `typescript` with the first release in TypeScript, `canvas`'s. This goes to the task of `canvas`'s first release;
  - **the rest** `canvas` waited for, as it waited for the rows; `spec` recorded those rows in v0.2.36 and v0.2.37, which the move to v0.2.37 took:
    - the eval protocol and the contract `app` ↔ `api`: they still wait for epic E3 in RUN.md of `spec` (В33, В35–В37);
    - the types for TypeScript: a task of the same plan (В38, В40);
    - the standard of accessibility of UI packages: a task of `app`'s plan (В41, О-24);
    - the group boxes at the check: Т-31.
- **The rules for all repositories** that `canvas` gets with the same tag:
  - **the shared rules of work** (`spec/RULES.md`): code comes with its tests, and where coverage goes to Codecov, a merge waits for `codecov/patch`, as `spec`'s decision on README's badges and coverage sets. `canvas`'s tests have come with every change of code since the task that built the package's frame, and it has no coverage in Codecov: that waits for the upload in `.github`'s wrapper (Д29 in RUN.md of `spec`);
  - **the shared rule of language:** the normative texts for authors are in English, as `spec`'s decision on the module format's folder says. Rule 10 of RUN.md names them, as the template does;
  - **`spec`'s rule of README's badges**: the status badges at the beginning of README:
    - from day one: CI, CodeQL, Scorecard, the license and five measures of SonarCloud;
    - with the first code: the TypeScript version;
    - Release and the release number will come with the first release, coverage with Codecov, and OpenSSF Best Practices with the project that the author will set up (Д34 in RUN.md of `spec`);
  - **`spec`'s decision on licenses:** npm is a tool of development and CI under Artistic-2.0, and this exception is named. `canvas`'s license check does not see it: npm is not in the lock file;
  - **`spec`'s documents check:** it reads only the files that git tracks or does not ignore, and does not go into `samples/`, as the entry of this log that closes `samples/` to agents says.
- **Devcontainer.** `spec`'s `.devcontainer/` did not change between the tags, and in `tools/new-repo/` only the tests changed. The template changed in two places: the badges in README and rule 10 of RUN.md.
- **What is changed here:**
  - `spec/` is at v0.2.35, commit 15459d4; the tag is in README.md, CLAUDE.md and at the beginning of RUN.md. CLAUDE.md also names the order of the first code by `spec`'s order of the first code of the repositories;
  - README.md: the badges by `spec`'s rule of README's badges;
  - RUN.md:
    - rule 10, as in the template;
    - table 1: the task of this move;
    - table 2: epic E6 «Рабочая тетрадь», first;
    - table 3: the rows В29, В30, В32, В34 and В39 are removed, and its opening names where each went. В37 and В38 are without what `spec` decided on the place on the canvas and on the task;
    - table 4: Д5;
  - [architecture.md](architecture.md): the purpose and bounds, the drawing engine and its layers, the sheet's logical coordinates, the docking with the app and the samples page's steps — `spec`'s decisions instead of the rows of table 3 and instead of Т-32;
  - the comments in `src/core/marks.ts` and `demo/main.ts`: `spec`'s decision on the place on the canvas instead of Т-32;
  - the entries of this log on the element, on `samples/` closed to agents, on E2 for the MVP, on the text canvas, on the sheet's layers, on the crop, on the marks, on the package's interface and on the toolbar.

  The entries of the history name the rows as they were. The numbers «В» of the rows are not reused.

— *Why now:* the author's word, once E4 was done: to make the move in one branch with E4's archive and the review of tables 3 and 4. `spec`'s answers to five rows would hang open, and the next epic would be chosen by v0.2.18, whose card has no workbook. v0.2.35 is `spec`'s latest release as of 2026-10-26 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.35 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 15459d4.

— *Rejected:*
- making the move in the first task of the next epic, or with `spec`'s types, a task of `spec`'s plan: the rows would hang, and the epic would be chosen by a card without the workbook;
- moving the temporary task type to `spec`'s task schema in this same task: the author kept the move here and the type a task of its own (Д5);
- leaving the rows in table 3 with the mark «записано» ("recorded"): a row «в реестр spec» goes, by the rules of the plan, once the question is recorded in `spec`.

— *Consequence:*
- **the workbook** is epic E6 of table 2 of RUN.md, first by the author's decision: detailing by the card, then the code. The canvas kind that is built is still one, the sheet, as the entry that removes the text canvas says;
- **the temporary task type against `spec`'s task schema** is Д5: `canvas`'s own temporary types instead of `spec`'s types, and the temporary field `canvas.tools`, which v0 does not have. The canvas kind, the grid step, `id` and `items` follow the format's draft, and the digit height and the language come from the module manifest, the property `manifest`;
- the badges Release, the release number, coverage and Best Practices, with what they tell of;
- В33, В35–В38, В40 and В41 were recorded by `spec` in v0.2.36 and v0.2.37, and the move to v0.2.37 closed them.

## `spec` tag v0.2.37

**R31. `canvas` is on `spec` v0.2.37: the submodule `spec/` is at this tag. `spec` has recorded the «в реестр spec» rows В33, В35–В38, В40 and В41, and table 3 of RUN.md is empty: instead of the rows, the documents name spec's entries.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.35 v0.2.37`, read 2026-10-26). v0.2.36 and v0.2.37 recorded the author's answers to `canvas`'s rows: all by `canvas`'s recommendations, and В41 as an open question. What `canvas` gets with the tag is named by Д35 and Д36 in `spec`'s RUN.md:
  - **the eval protocol** — epic E3 there, «Правила `canvas` в протоколе eval». The protocol takes as they are the writing history of this log's entry on the eraser (В33), its rule of groups and `vectors/groups.json` (В35), its rules of the crop and `vectors/crops.json` (В36) and its rule of snapping and `vectors/snaps.json` (В37). An erased stroke belongs to the groups of those visible strokes that would have been its neighbors. `canvas`'s test vectors come out in `spec`'s releases, by a task of that plan, and `canvas` takes them from there;
  - **the contract `app` ↔ `api`** — the same epic: the tutor's mark, its kind and its place. There is one kind so far, the box, and `app` writes the name for the screen reader in its own words (В37);
  - **`spec`'s glossary** — the terms «пометка наставника» (tutor's mark, mark) and «связка штрихов» (stroke bundle); the writing history names the events of erasing, clearing and undo with their IDs, and the tutor's layer names the tutor's marks: boxes, numbers and short captions;
  - **`spec`'s decision that UI packages enter their consumer as web components, on the tools and the language** (В40): `toolchange` and `lang` are an agreement between `canvas` and `app`, the labels are the package's own table, and the row's accessibility is as this log's entry on the toolbar sets it. A task of `app`'s plan takes the table of labels and the row's accessibility as an input to the shared schema of translations and standard of accessibility;
  - **the same decision, on the writing history and the work** (В38 and the context from В37): `history`, `historychange` with `{ events, from }` and `exportWork()` with `{ png, submission }` are an agreement between `canvas` and `app`. The submission's context carries the crop's integers and the digest, and `app` keeps it as it is, without rounding. A task of `spec`'s plan releases the types;
  - **О-24** (В41) — the level of the interface's accessibility and the sheet's scrolling with one pointer, together with the accessibility standard that a task of `app`'s plan writes. The options and the recommendation come from [architecture.md](architecture.md), its question of scrolling the sheet with one pointer. `spec`'s addition: the element's own scrolling with two fingers falls under 2.5.1 of level A too, and for an element with a set height on a narrow tablet, the sheet without a replacement no longer meets it;
  - **`spec`'s decision on the task** — on В39, which the move to v0.2.35 closed: the row's composition is an input to the minor version with the field of tools, and `canvas.tools` lives until the move to `spec`'s types (Д5);
  - `spec`'s cards of `app` and `canvas` name the element's interface, `spec`'s account of the kinds of data the crop's integers and the digest in the submission's context, and Т-31 the bundles.
- **RULES.md, the devcontainer and the template** did not change between the tags: `git -C spec diff --stat v0.2.35 v0.2.37 -- RULES.md .devcontainer repo-template tools` is empty.
- **What is changed here:**
  - `spec/` is at v0.2.37, commit 591979b; the tag is in README.md, CLAUDE.md and at the start of RUN.md;
  - RUN.md: table 3 is empty, and its opening names the decisions that closed the rows. In table 4, Д5 names the format's draft, by `spec`'s decision on the format's version, and Д6 the badges of README that the move to v0.2.35 waited for. The tasks of that move and of this one are in E4's archive, [plan/E4.md](plan/E4.md);
  - [architecture.md](architecture.md): the opening of what is still to decide, the scrolling of the sheet with one pointer, the sample file and the code and tools — `spec`'s entries instead of the rows, and in the scrolling also the addition to О-24;
  - the comment of `src/core/index.ts` — the eval protocol instead of the rows;
  - the entries of this log on the eraser, on the stroke groups, on the crop, on the marks, on the package's interface, on the toolbar, on input on tablets and on the move to v0.2.35.

  The entries of history name the rows as they were.

— *Why now:* the author's word — to decide all that can be decided in tables 3 and 4. Only a move closes the rows of table 3: a row «в реестр spec» goes once the repository stands on a tag of `spec` that records it. v0.2.37 is `spec`'s latest release as of 2026-10-26 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.37 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 591979b.

— *Rejected:*
- making the move in the first task of E6: the rows would hang, though the answers are recorded;
- leaving the rows in table 3 with the mark «записано» ("recorded"): a row «в реестр spec» goes, by the rules of the plan, once the question is recorded in `spec`.

— *Consequence:*
- the rules of groups, of the crop, of snapping and of boxes stay inside `core`, and since the eval protocol came out, `spec`'s vectors from the package `@altnovatrail/contracts` hold them; `canvas` keeps only the vectors of the layout, `vectors/pages.json`;
- the sheet scrolls with one pointer, by the buttons «Выше» and «Ниже». The level of accessibility still waits for the accessibility standard that a task of `app`'s plan writes (О-24), and `canvas`'s answer to О-24 is row В44 «в реестр spec» in table 3 of RUN.md;
- Д5 stays: the temporary task type moves to `spec`'s task schema in the first task of E6. `canvas` will take the schema and the types from the release of `spec`'s types, because the code of other repositories does not take the format's draft, by `spec`'s decision on the format's version.

## E6. The workbook

**R32. The element takes the task's open view in the names of the module format, by `spec`'s types, and checks it strictly, as the schema does: a field the open view does not have is a `TypeError`, but for the element's own temporary `canvas.tools`. It takes the module manifest by the property `manifest` and reads from it the module format version — 0.3, and only it —, the digit height and the explanation language. It shows both canvas kinds: on the sheet `zone` is a `TypeError`, and `app` shows the options of `choice` and the item's text; on the workbook the item line is a part of the template, and the element shows it.**
- **The task is the property `task`:** the task's open view by the format's `task.schema.json`.
  - Fields: `id`, the task's local ID; `statement`, the statement's parts; `givens` and `unknown`, the givens and the unknown, where the task has them; `canvas`, the canvas kind; and `items`, the items. The canvas kind is `handwriting_sheet` with the grid `grid` and the step `grid_step`, or `workbook`.
  - A sheet's item is the answer slots `answer_slots` and, where needed, `text`. The slot bindings are `anywhere`, `sheet`, `zone` and `choice`.
  - A workbook's item is a line `line` of pieces of text and boxes `binding: box`.
  - The types of the task and of the manifest are `spec`'s, from the package `@altnovatrail/spec`, and `Task` adds to `spec`'s only the element's own `canvas.tools`. canvas's own types are only the narrowed ones, for the check: `SheetTask` or `WorkbookTask` and their parts. Both entry points export the types, and at run time `core` still exports only `SHEET` and `replay`.
  - `canvas.tools` is a temporary field of both kinds, by the rules of the sheet's buttons, until the minor version of the format with a field of tools: in v0 every task has a pen and an eraser.
- **The check is as the schema's**, in the DOM-free part:
  - `id`, `statement`, `canvas` and `items` are required;
  - as in `task.schema.json`, the check covers the types, the enumerations, the integers and their bounds, the lengths of lists, the distinctness of options and the patterns — of the task's ID (`local_id`) and of the picture's path (`picture_path`);
  - the rules between fields are checked the same way: a workbook's item is only a line, a line has at least one box, a workbook has no grid, and an answer slot `anywhere` or `sheet` is the only one in its task;
  - `givens` is a list of texts, from one, non-empty and distinct, and `unknown` is a non-empty text. The check only checks them: `app` shows the chips, and they do not go into the author's template;
  - every object is closed: a field the schema does not name is a `TypeError` with the field's path. So is an old name of the temporary type — `step`, `digit`, `lang` — and a closed field: `skills`, `band`, `difficulty`, `age_categories` and an item's `skills`. There is no open view with them: the open view that `spec` builds for the learner's device leaves them out;
  - only `undefined` omits a field, and `null` is a wrong value, as the sheet's property `task` had it before;
  - the path names the field as a place in the format examples does: `#/items/0/answer_slots/0` is `task.items[0].answer_slots[0]`;
  - the format rules beyond the schema — `task.zones`, `task.known-pictures` and others — are checked by `module-kit`.
- **What the sheet shows** — still the grid, the statement above the sheet and the tools, as the sheet's layers and its buttons have them:
  - `zone` is a `TypeError` on its `binding`, until its own epic;
  - the sheet skips `choice`: `app` shows the options;
  - the sheet skips the item's text too, and `app` shows it, together with the options. For `zone` the text's place is by the zone, and for `anywhere` and `sheet` the answer slot is the whole sheet, and the question stands in the statement.
- **What the workbook shows** — the lines of its items on the page, by the decisions on the workbook, on the layout of its page and on its template layer: the item line is a part of the template, and `templateOf` gives the layout of the lines on the page. A task whose lines do not fit is a `TypeError` on `task.items[i]`.
- **The manifest is the property `manifest`:** the open view of the module manifest, as `app` has it. The element reads three fields of it and skips the rest:
  - `module_format_version` is `"0.3"`, otherwise a `TypeError`, and the previous version, `"0.2"`, too: while the format is v0, "the platform reads only the current version", and a module of a version the reader does not read it "MUST refuse, with a reason" (sources 6.7);
  - `canvas.digit_height` is the digit height on the crop: whole px from 1 to 256, and 24 without the field, as `spec` sets it from format 0.2. `exportWork()` takes it at the moment of the call, as the package's interface has it;
  - `languages.explanation` is the statement's language, a tag by the pattern `language_tag`. A new language changes only the statement's attribute, and its pictures stay.

  The canvas settings in the manifest are the canvas's own: a setting the element does not know is a `TypeError`, as a task's field is, since without it the element would draw the module's canvas wrong. The element reads the same object of the manifest again: the consumer could have changed it in place.

  Without a manifest the digits are 24 px too: the default is one for both cases, `CROP.digit`, since `app` does not have two defaults, and without a manifest the element draws the crop as for a module without the field. That is how `spec` expects it: «`canvas` — 24 px без паспорта, с форматом 0.2» (Д47 in `spec`'s RUN.md). Without a manifest the statement is in the element's own language, as before without `task.lang`. There is no manifest only with `undefined`, and `null` is a `TypeError`. `task` and `manifest` do not depend on each other, and a value assigned before registration goes through the shared helper, as `task`'s does.
- **The rest of the format** the element does not need:
  - the rules of version comparison are held by `module-kit` and `api`: the element compares no module versions and takes nothing from them. Nor does it need Starlark, the module index and the places of the package that each version holds;
  - the SHOULD on a picture's opaque light background is in the decision on the worked example, and the guideline on a workbook's page in the decision on its layout. "An opaque picture hides the grid under its area" the element already carries out: the demo layer stands above the template with the grid;
  - the type `ModuleFormatVersion` of the package `@altnovatrail/spec` is `string`, and the check `FORMAT` holds the version.
- **The tests** run on copies of the format examples of the tag v0.9.8 and of its open-view vectors, as rows of tables: the code and the tests do not read `spec/`.
  - **valid examples of a task** — 16, and with them 7 open-view vectors. The open view of each is a task, and of a task template too: the placeholders stand in it as written. With its closed fields, an example is a `TypeError` on `task.skills`;
  - **invalid** — 55. 19 have their error in the open view, and they are a `TypeError` at their place or deeper. 36 have a closed error, and their open view is a task: the place lies under a closed field — `check`, `skills`, `template` and others —, or a closed field is missing, a box's `check` or `solution`, or `check` stands on a piece of text of a line;
  - **the manifest** — 4 valid examples and the open-view vector `every-field-open`, and 22 invalid, of which 4 fail at their place: their error is in one of the element's three fields. The version is `"0.3"`, `format-version-as-number` has `0.3` as a number, and three valid examples without `canvas` give 24. The vectors of the rule `manifest.format-version` are three, `next-minor` with `"0.4"`, `previous-minor` with `"0.2"` and `unknown-version`, and all three fail;
  - the refused version in the test of assignment before registration is `"0.2"`, the previous one;
  - the copies of tasks and lessons, `workbook-page.yaml` and `tables-page.yaml` among them, carry the tag in their comments, and `vectors/pages.json` in the text of `about`. Since v0.4.1 the format changed on their paths only in what the tests do not touch: in `workbook-page.yaml` `trap_values`, a closed field the open view does not carry, and in `essays-for-adults.yaml` `skills`, of which the test takes only the name;
  - the test of the submission's digest holds the crop at 32 px explicitly, since it holds the digest's record, not the height's default. The manifest of the tests of `app`'s path sets 16 px: at 24 it would not differ from the default, and at 32 the crop of its sheet no longer fits within the crop's limit.
- **The code:**
  - in the DOM-free part, `task.ts`: the types, the check `taskOf` and the template `templateOf`; `manifest.ts`: the settings `settingsOf` and the version `FORMAT`; the check's helpers are in `fields.ts`;
  - the helper of tasks and manifests for the tests and the trial page is `tasks.fixture.ts`;
  - in the element, the property `manifest`, and the statement's language is set apart from its parts (`statement.ts`).

— *Why:* the author's answers, all by the recommendations:
- the digit height and the language from the manifest, by the property `manifest`. `spec`'s decision on the task file puts them in the manifest, and `app` has the manifest: by it `app` asks for the learner's grade. How `app` gets the manifest with the task is `spec`'s to decide, and this is В42;
- the check is strict, by the schema. Every object of the format is closed. Without strictness the old `step` would silently give a cell of 50, and `digit` a crop at the default height. `spec`'s window of the format versions names `canvas` among the readers of modules;
- in one task, though it is more than one check: the author kept the task whole;
- `app` shows the item's text on the sheet, since `app`'s task screen is, as `spec` describes `app`, "the canvas, answer slots, the choice of an option". This is В43;
- a manifest of any version but the current one is a `TypeError`, the previous one too: the element reads the versions the format text and `module-kit` read.

  Decided in the epic's planning: `zone` on the sheet is a `TypeError`, and the sheet skips `choice`. Decided with the format's versions, by the documents: the element does not read the previous version beside the current one.

— *Rejected:*
- the element's own properties, the digit height and the statement's language: the names are not the format's, and `app` would parse the manifest itself;
- fields in the task, `canvas.digit_height` and `lang`, like `canvas.tools`: `spec`'s decision on the task file rejected a height on each task, and the strict check would have two more exceptions;
- skipping extra fields, as the sheet's first property `task` did: a typo and an old name would silently give the default;
- checking only what the element reads: the TypeScript type and the check would part from the schema;
- checking the manifest whole: that is the work of `module-kit`, and the element needs three fields;
- `spec`'s schemas through a JSON Schema validator: by `spec`'s rule of the format versions the code of other repositories did not take the draft, and the types for code are `spec`'s to give;
- a blank sheet for a workbook's task: what is written on it would not be the workbook's history, and `app` could start to rely on it;
- the items' texts as paragraphs under the statement: the text of an item with a choice would stand apart from the options, which `app` shows;
- splitting the task into the task type and the property `manifest` — the author's answer;
- reading the previous version of the format beside the current one — 0.1 beside 0.2, with 32 px for 0.1 without the field, or 0.2 beside 0.3: the element would part from the format text and from `module-kit`, which rejects a module of the previous version (Д59 in `spec`'s RUN.md), and the rule "only the current version" would have to be changed by a new decision. Nor would it gain anything: a module 0.2 moved to 0.3 has the same open view and numbers, and the three modules of `modules` v0.1.0 all have `module_format_version: "0.3"` (sources 6.7);
- reading 0.1 as 0.2: a module 0.1 without the field would silently get another height than the one its author wrote it with, and the format text calls moving a module to 0.2 a new version of the module.

— *Revisit:*
- with the epic of zones — `zone` on the sheet;
- by `spec`'s answers to В42 and В43.

— *Consequence:*
- `src/core/task.ts`, `manifest.ts` and `fields.ts` — the task's types, its check and its template, a workbook's being the layout of its lines; the manifest's settings and the format version; the check's helpers;
- `src/core/tasks.fixture.ts`, `src/core/pages.fixture.ts` and `vectors/pages.json` — the copies of the format examples and vectors, and the helper of tasks and manifests;
- `src/element/` — the property `manifest`, the statement's language in `statement.ts`, and the workbook shown;
- `src/eval/tasks.ts` — the file of tasks of the version of the format the element reads;
- `page/` — the samples page gives the element the module manifest of the task too;
- `demo/` — the trial page with a manifest;
- RUN.md — **Д5** is narrowed, and **В42** and **В43** are rows «в реестр spec» in table 3 of RUN.md;
- a move to a new tag of `spec` compares the copies of the examples: `git -C spec diff <old> <new> -- format/`;
- the entries of this log on the element as a web component, on the sheet's layers, on the package's interface, on the sheet's buttons and on the move to `spec` v0.2.35 — the property `manifest`, the strict check of the task and the digit height from the manifest;
- [architecture.md](architecture.md) — the status, the purpose and bounds, the docking with the app, the code and tools and the task's fields; [sources.md](sources.md) — the module format 0.3; README.md.

**R33. The keyboard goes into the sheet and out of it: the element's scroll container, while its content overflows it, down or across, is a region — `role="region"`, `tabindex="0"` and the name of the canvas kind (the platform's standard of accessibility for UI packages; WCAG 2.1.1, 2.1.2, 2.4.7). Tab enters it after the bar and leaves it for what follows the element, the browser's own keys scroll it, a ring inside its edge shows the keyboard's focus, and every scroll of the element is instant.**
- **When.** The three attributes come together, and only while the container's content overflows it by more than 0.5 px: down, `scrollHeight` over `clientHeight`, or across, `scrollWidth` over `clientWidth`. A sheet the learner writes on reaches one view of the container past the task's page, so it overflows across whatever the element's height, and the element without a height of its own has a region too, which the arrows left and right scroll; down, such an element does not overflow — the page scrolls it. A worked example's sheet is the page alone: a region only while it overflows. The check, `#region()`, runs on a new layout — a new size of the container, of the statement, of the list of parts, of the screen's density —, of the page, of the bar and of the window, not on scrolling, which changes no overflow. A container that holds the focus keeps the attributes until the focus leaves it (`blur`), not when the window loses it.
- **The keys.** The arrows, Page Up and Page Down, Home, End and Space scroll the focused container as the browser scrolls one: the element has no `keydown` of its own for them. No button scrolls the sheet; a pointer drags it — the hand with any pointer, one finger in pen mode, two fingers always.
- **The name** is by the kind — «Лист», «Тетрадь» or «Пример», "Sheet", "Workbook", "Worked example" — in the labels' language, as the bar's name is, from `labels.ts`. The languages of the container and of the column, its only node, are set with the name, as the declared nonconformance of 3.1.2 for the region's name describes.
- **The focus ring** is 2 px of the ink's colour inside the edge of the visible part, Highlight in forced colours, as for the bar's buttons. It is the container's empty sibling `.ring` in the wrapper `.frame`, which does not scroll: the `outline` of the container itself is drawn under its positioned descendants, the paper `.sheet` and the scene, and a probe in Chromium showed it only above the statement. The bar of glass stands over it, `z-index: 1`. A pointer's press focuses the container without the ring and scrolls neither it nor the page, and `-webkit-tap-highlight-color: transparent` keeps a touch from flashing the whole sheet.
- **Motion (WCAG 2.3.3, which the platform's standard of UI packages takes beyond level AA).** Nothing moves but the scrolling itself, and it jumps, `behavior: "instant"`, even when the page asks for `scroll-behavior: smooth`: two fingers, the hand, a finger in pen mode, a part of a worked example and a picture on a sheet's area brought into sight. The style has no animation but the wait of the tracing paper's reading, its band and spinner, which move only under `prefers-reduced-motion: no-preference`.
- **The check.** `pointer-events: none`, which the consumer sets for the time of the check, stops the pointer, not the keys: the region scrolls from the keyboard, and scrolling changes neither the work, nor the history, nor the crop.

— *Why:* the author's answers, by the recommendations:
- the platform's standard of UI packages bids every package "an own scroll container — only with `tabindex="0"`, the role `region` and a name": in Safari a scroll container without focusable content scrolls by no key — WebKit bug 277290, open since 2024-07-29 —, and the sheet's container holds only the statement, the demo's parts and the drawing surface (sources 9.11). 2.1.2 bids the keyboard be let out;
- the overflow, not the element's height: the consumer's height cannot be read from the style — `getComputedStyle` gives px already computed —, and without overflow there is nothing to scroll. Chrome's "Keyboard focusable scrollers" and axe's rule `scrollable-region-focusable` decide it so too (sources 9.11);
- instant scrolling: a smooth one would need `prefers-reduced-motion` and a rule for a scroll begun in the middle of a run, and two fingers scroll instantly anyway; scrolling is the one motion Understanding 2.3.3 counts essential (sources 9.19).

— *Rejected:*
- **a Tab stop always on an element with a height** — with nothing to scroll it is a stop that does nothing;
- **an own `keydown` for the keys** — the browser scrolls a focused container itself;
- **`outline` or `box-shadow: inset` of the container itself** — both stand under the sheet, and forced colours remove the shadow;
- **`:has()` or a class set on `focus`** — the sibling selector `+` does the same without them;
- **smooth scrolling** — for the reason above.

— *Revisit:* the keyboard in Safari, on a device: the image has no Safari, and that the region scrolls from the keyboard there rests on bug 277290 and the platform's standard of UI packages, not on a probe; [architecture.md](architecture.md) lists it among what is not checked.

— *Consequence:*
- `src/element/index.ts` — the region `#region`, its name and languages `#nameRegion`, the ring `.ring` and the instant scrolling; `src/element/labels.ts` — the names of the canvas kinds;
- `src/element/keyboard.test.ts`, `src/element/wide.test.ts`, `src/element/motion.test.ts`, `src/element/a11y.test.ts` and `src/element/forced-colors.test.ts` — the keys, the region across, the motion, axe and the ring in forced colours;
- [architecture.md](architecture.md) — scrolling the sheet with one pointer, the layers and the ring, the docking with `app`, and accessibility, with Safari's keyboard among what is not checked.

**R34. The workbook is the task's page of 1000 × 1400 units at the sheet's left, as on the sheet, with the statement above it; the sheet goes on past the page, and the learner writes there too. The layout in the DOM-free part puts the items' lines on the template layer by `spec`'s page rule and its table of widths, not by the device's font; a task that does not fit is a `TypeError`. The box is one and the same for the whole task, each stroke is in one box or in none, and the rest is scratch work. A crop of each filled box goes to the check, on the workbook the boxes replace the groups, and the property `filled` tells which boxes are filled.**
- **The page** is the sheet's page, `SHEET`, 1000 × 1400 units, a constant of the kind, at the sheet's top left corner, without a grid:
  - the statement is above it, HTML, as wide as the page and in the same scrolling, as on the sheet;
  - the items go as lines in order, each with its number on the left. Short lines stand in two columns, a long one wraps by words, and a word longer than the line by characters;
  - what the lines do not take is scratch work, and so is the sheet past the page, to its right and below it, which goes on as on a sheet and has no grid either. A stroke there is in no box;
  - the tools are the pen, the eraser if the task allows it, and the hand; pen mode is the one of input on tablets, one for the whole page.
- **The layout** is `pageOf`, a function of one task, in the DOM-free part and in integers. Its numbers, its rule of lines and its table of widths are the format's, `format/page.yaml` and its test vectors `format/vectors/pages/` of `spec`, and the tests hold the layout to them:
  - the characters' widths are a table in hundredths of the font size: a class for the digits and one for the operation and comparison signs, a width of its own for each letter and punctuation mark;
  - a piece of text is the part of a piece on one line of the page: one `<text>` at one point, without `tspan`, fitted to its computed width by `textLength` with `lengthAdjust="spacingAndGlyphs"` in any font, by less than ⅛ in the image's fonts. The code does not read the SVG's text sizes;
  - the boxes and the numbers stand where the layout put them, on any device;
  - the entry point `core` does not export the layout.
- **A task that does not fit** is a `TypeError` on `task.items[i]`, the item from 0 in the path and from 1 in the text, at the first item that did not fit, as for a zone on the sheet. The font size and the boxes do not shrink. The format refuses such a task by the rule `task.workbook-page`, so a valid module never meets the error.
- **The box** is one and the same for the whole task:
  - it holds a two-level fraction, a three-digit number and a comparison sign;
  - its frame is thin and solid, of one thickness at any scale, with a contrast of at least 3:1;
  - the line's characters stand at the middle of its height;
  - the frame does not clip the ink.
- **The boxes' strokes** — each visible stroke is in one box or in none, by the box rule:
  - the rule is in integers, without the DOM and without time, for each stroke separately: other strokes do not change it;
  - it decides a contested case itself: more points, then the earlier by (item, box) in the task's order, from 1, which on any page of the layout is also top to bottom, left to right;
  - its parameters are in thousandths of the box: of its width across and of its height down;
  - it takes the same strokes as `exportWork()`: the stroke under the pen is not there, and the strokes under an eraser not yet lifted are, as on the sheet;
  - what is in no box is scratch work. It is the learner's work: it is on the sheet and in the writing history, but does not go to the check.
- **There are no groups on the workbook** — the boxes take their place:
  - the submission's context is `{ boxes, digest }`: the table "box → stroke IDs", a box named by the numbers of its item and its slot, from 1, and the digest of its strokes, of the rectangles of all the page's boxes and of the table's rows. A context given under another layout is a `TypeError`. It has no crop numbers: there is no snapping on the workbook;
  - a tutor's mark comes with an answer slot by place, `{ item, slot }`, since the format gives answer slots no IDs, and holds to the strokes of its row of the table by the rules of the sheet's marks: when all of them are erased it is not seen, and an undo brings it back. A group label and the model's box in fractions of the crop are a `TypeError` on the workbook.
- **`filled`** is a read-only property, a member of the element's agreement with `app` in `spec`:
  - per item, per box, whether it is filled, in the task's order. The value is frozen and stays the same object until it changes;
  - a box is filled if it holds at least one of the strokes that would go into `exportWork()`: exactly such boxes have a crop;
  - the value changes with an action on the sheet, before `historychange`, and on an assignment of `task` or `history` without an event: an assignment is the consumer's own action;
  - being filled shows on the box itself too, not only by color, and sounds in its name.
- **To the check** the whole page goes at once:
  - `exportWork()` gives `{ cells, submission }`. `cells` are the crops of the filled boxes, `{ item, slot, png }` in the task's order: the sheet's crop rule by stroke bundles over the box's strokes, at the manifest's digit height, only the ink, without the frame and the text. `submission` is one submission context. Its key names the kind of the work: `png` for the sheet, `cells` for the workbook;
  - an empty box gives no crop and is not read: the format's check gives it the verdict "unreadable" with the reason `blank`, and `filled` names it. If no box is filled, `null`, even with scratch work;
  - the place in an observation on the workbook is the answer slot by place.
- **Accessibility:** a screen reader reads the lines, in the task's order:
  - the SVG of the template has no `aria-hidden`, its root is `role="none"`, the lines are a list `<g role="list">` of items `<svg role="listitem">`, the text is `<text>`. A box is `<rect role="img">` with a name from the table of labels and with whether it is filled;
  - the lines' language is the manifest's `languages.explanation`, as for the statement, and a box's name has its own `lang`, as the bar of buttons has;
  - the text and the frames are in the ink's color on the paper, and CanvasText in forced colors; a filled box there is Highlight;
  - the scroll container is named «Тетрадь», and the bar «Кнопки тетради».
- **1.4.4 of the lines' print.** The print is SVG on the page and scales with it, by k = min(A / 1000, 1) × z, the page's zoom: Zoom in on the bar takes it to twice its fit, which 1.4.4 asks, so the element meets it and does not declare it. The statement, the demo's parts and the bar's labels are HTML and grow and reflow with the browser's zoom. The page is not laid out anew at any zoom: a new layout would move the boxes under the ink, and 1.4.10 allows the page a layout in two dimensions, which the sheet scrolls in both.
- **The workbook's sample**, in the sample file:
  - the crops of the filled boxes at eval's heights, by the same `cellsForCheck`, with the item and the box;
  - the table "box → stroke IDs" that the device built from the raw strokes: the runner does not recompute it, as it does not recompute the groups. In eval-set samples and child samples it moves to the new numbers of the strokes, as the table of groups does;
  - the rectangles of all the page's boxes in page units, so that the runner does not need the layout;
  - no groups and no group boxes; eval-set samples and child samples hold only the boxes' strokes, and a measurement sample from an adult the whole writing history;
  - the eval protocol takes the box rule and its test vectors as they are.

— *Why:* the author's answers, all by the recommendations: the page 1000 × 1400 and a `TypeError` for a task that does not fit, a table of widths of its own, a crop of each box, boxes instead of groups, the property `filled`, a sample with the device's table. The page at the sheet's left with the sheet past it, and no zoom, are the author's later choice for every sheet. The sources — sources 9.12.
- **A page like the sheet.** A constant page keeps the check of an assigned history, the crop, the marks and the screen apart from the task: `task` and `history` are assigned in any order. Ten short items — the workbook's example in `spec`'s glossary, ten examples on fractions — stand in two columns and leave room for scratch work.
- **The statement above the page**, by the same arguments as on the sheet: HTML grows with the browser's zoom and wraps, its place does not depend on fonts, and the format sets the sizes of its pictures in CSS px.
- **A `TypeError`, not shrinking:**
  - a child does not write smaller because the box is smaller: the answer would go past the frame, and the box would count as empty and not be read;
  - the box rule was chosen at one scale.
- **A table of widths, not a font:**
  - a box stands where the task's layout put it, and strokes in page units fall into it on any device — as on the sheet, where a place by the device's fonts would end up under the ink on another device. The synthetic samples and `module-kit` repeat the layout without a browser; the runner does not need it, the boxes' rectangles lie in the sample;
  - the SVG itself fits the text to the width. A font in the package would have to be waited for, and its license and weight are one more dependency;
  - in WebKit only the simple case is reliable — one `<text>`, one point.
- **The box's crop:**
  - the card gives `canvas` «вырезку ячейки» (the crop of an answer slot), and the sheet's crop rule makes it;
  - `tutor` reads answer slots so, and the reading of digits on the device takes the same picture;
  - the model need not search for what is in which box, and the crop rule is the one the eval protocol has taken;
  - the crop has no fonts on it, and its bytes are the same in any browser engine;
  - the scratch work does not go: of the forms that give the same use, this is the poorest in data, as the rule of recommendation of П-21 requires, by which `spec` decided that nothing of the writing history goes to AI.
- **Boxes instead of groups.** A stroke group joins strokes closer than 50 units and 2 s to each other, and "47 ÷ 6 = [ ] r [ ]" is written in a row: one group would take both boxes. A mark on the workbook is about the answer in a box, and the table of boxes names exactly that. The digest holds all the page's boxes, so that a context of another layout differs even where the filled boxes stayed in place.
- **A property, not an event:** the package's interface rejected two events for one action.
- **A sample with the device's table:** the share of points that snapping counts depends on how densely they stand, and the points of eval-set samples and child samples are resampled. The device's table and the boxes' rectangles spare the runner the layout and the recount, and neither the check nor eval reads the scratch work.

— *Rejected:*
- **a width of 1000 and a height by the lines** — `SHEET` would become a function of the task, and a history given before the task would be checked against a page not its own;
- **the height as a setting of the module** — on the workbook that is a task that did not fit, and its answer is the format's rule and a `TypeError`; a height from the module would make the check of the history depend on the task;
- **the statement on the page** — its place would depend on the font, and the pictures' sizes are CSS px;
- **shrinking, down to a limit or without one** — for the reasons above;
- **a font of its own in the package** and **a layout by the device's font** — for the reasons above;
- **a box sized by the answer** — the key is closed, and the open view does not know it; **a box that grows** — the lines under it would shift under the pen;
- **a stroke by its bundle** — a fraction bar does not join bundles in the crop's rule; **clipping the ink by the frame** — a digit beyond the edge would be lost;
- **forbidding writing outside the boxes** — working in the margins is usual for a school workbook;
- **one crop of the strokes of all the boxes** — the model would search for what is in which box; **a crop of the whole page** — the scratch work would go to the provider;
- **the stroke groups over the whole page** and **inside the boxes** — for the reasons above;
- **an event of its own** and **the filled state in `detail`** — for the reasons above;
- **a hidden copy of the lines in HTML** — two sources of one text, and the screen reader would show the wrong place;
- **a sample as for the sheet** — the child sample would hold the scratch work.

— *Revisit:*
- the layout's numbers: a change is a change of `format/page.yaml` by the format's versions, which `canvas` asks for by a row «в реестр spec». The histories know neither the task nor the layout: under new numbers old answers would fall into other boxes or into the scratch work, and `filled` and the crops would change with them, so the change names how `app` opens the histories written before it. An edit of a task's text is another task and a new version of the module, and a history does not know its own task: the history of another task under this one is the consumer's error;
- on devices, the debt Д7: the lines' font size and fonts on children's tablets, the text and the frames in Safari, VoiceOver and TalkBack by lines and by touch, and a copy of the lines in HTML if VoiceOver on the iPad does not read the SVG.

— *Consequence:*
- `src/core/page.ts` — the layout `pageOf` by `spec`'s page rule and its table of widths;
- `src/core/boxes.ts` — the boxes' strokes and `filled`; `src/core/submission.ts` — the crops of the filled boxes, `cellsForCheck`, and the workbook's context;
- `src/element/index.ts` — the workbook's template layer, `filled` and `exportWork()` on the workbook;
- [architecture.md](architecture.md) — the workbook, the sample file and accessibility;
- the layout, the template layer, the box rule, the work for checking and the marks on boxes are decided in detail by the entries that follow this one.

**R35. The layout of a workbook's page: font size 30 units, box 100 × 100, rows 32 apart, margins 40 and two columns of 440: up to 10 rows, that is up to 20 short items or up to 10 long ones of one line. Short items stand two in a row, row by row, and a long one takes the whole width and wraps. The characters' widths are canvas's own numbers in hundredths of the font size, by a measurement of the image's fonts, and characters are told apart only by explicit code ranges. These numbers, the table of widths and the rules of lines are the format's — `format/page.yaml` and its test vectors in `spec` —, and the tests hold the element's layout to them.**
- **The numbers** are in page units, 1000 × 1400, the sheet's page:
  - font size 30, box 100 × 100;
  - a line without a box is 46. Between a line with a box and a line without one, 12, and between two lines with boxes and between boxes side by side, 32;
  - between a box and a word and between a number and a line, 16; between rows, 32;
  - margins 40 on all sides, 40 between the columns.

  Hence: the number column is the width of "00.", 40; a line starts 56 from the item's left edge; a column is 440, a full-width line 864; a row goes no lower than 1360.
- **The table of widths** is in whole hundredths of the font size (`src/core/widths.ts`):
  - digits — 53 for all; the operation and comparison signs `+−×÷=<>≤≥≠±≈` — 56 for all;
  - printable ASCII, the Russian alphabet with «Ё» and the signs of a school page `«»„“”‘’–—…№°²³½¼¾⅓⅔⅛·` — a width of its own for each, from 19 for «'» to 102 for «Ю». ⋅ and ∶, which the fonts do not have, are as · and :;
  - non-breaking spaces: U+00A0 — 26, as a space, U+2007 — 53, as a digit, U+202F — 20;
  - without a width — control characters, the soft hyphen, combining marks, the zero-width space and joiners, direction marks, variation selectors, skin tone modifiers and tags: each attaches to the character before it;
  - wide — 100: Hangul, CJK, fullwidth forms and emoji. An unknown character is 60, and Greek, Hebrew and Latin with diacritics are among them;
  - a number is the mean of Liberation Sans and Liberation Serif, rounded to a hundredth: canvas's own numbers, not a font's table.
- **Only explicit code ranges.** Neither `\p{…}`, nor `\s`, nor `trim()`, nor `Intl.Segmenter`, nor `normalize()`: they follow their engine's Unicode tables, and the layout is one in any engine and in Node, as the crop's raster is. Words are what lies between runs of the whitespace U+0009–000D, 0020, 0085, 2028 and 2029; a run is one space, and at the edges of a piece none. A cluster is the walk of `for…of`: a character without a width, a character after the joiner U+200D and the second regional indicator of a flag go to the character before them.
- **The lines:**
  - the words of one piece that stand side by side in a line are one text, one `<text>`, of the width ⌈30 × (Σ hundredths + 26 × (words − 1)) / 100⌉. The places are sums of integers in order;
  - a box holds to the word after it, and a line may wrap between two boxes. A line does not start with a character of `.,:;!?)]}»…` and does not end with one of `([{«„`. Two pieces of text in a row are joined with a space, and before a closing character and after an opening one, without a gap;
  - an item is short if its line, laid in one line, is no wider than 384 — a column without the number's indent. Two short ones in a row stand in one row — at 40 and at 520 —, and a short one before a long one stands alone, on the left;
  - a long item takes the whole width, 864, greedily: by pieces inside which the line cannot wrap; a piece wider than the line, by one word or box; and a word wider than the line, by clusters. Wrapped lines start under the first;
  - a line with a box is 100 high, without a box 46. The baseline is the middle of the line + ⌊font size / 3⌋: so the middle of digits and signs falls on the middle of the box without `dominant-baseline`. The top of a box is the top of its line;
  - the number "n." stands on the right of its column, on the baseline of the item's first line.
- **Did not fit**: a row that would go lower than 1360 is a `TypeError` on `task.items[i]`, the first item of this row. The number in the path is from 0, as in the format's path `#/items/0`, and in the error's text from 1. The layout stops on it, and a huge task costs no more than its check. There are no more than 99 items on a page, whatever numbers the sweep gave: the number column is two digits.
- **The layout** is `pageOf` in `src/core/page.ts`:
  - `Page` is the items in order, each with its number, its line in reading order and its boxes by place, from 1, and the bottom of the last row. All in integers and frozen;
  - `templateOf` gives it as the workbook's template together with the statement and the tools of the task the element takes, and `sameLayer` compares templates: the same grid or the same lines;
  - the entry point `core` does not export the layout, and `entry.check.ts` holds this;
  - the numbers, the table of widths and the rules of lines are the format's: `format/page.yaml` and the test vectors `format/vectors/pages/` of `spec`, which the package `@altnovatrail/spec` carries as JSON, and the format's rule `task.workbook-page` holds every task on a workbook to them. They are this entry's numbers and the cases of its set, and the element's layout gives each of the 19 vectors of `spec` with no changes. The tests hold the layout to the package's vectors, and the table of widths and the numbers to the package's `page.json`. A change of them is a version of the format, and `canvas` brings one to `spec` as a row «в реестр spec»;
  - [vectors/pages.json](../vectors/pages.json) is the record of what this entry chose — the set's pages, the table of widths and the rules of lines, and for each page the layout or the error —, which the archive of E6 names too. No test reads or writes it, and it stays as it was.
- **The element** lays the workbook's template layer out by this layout, a decision of its own: the start and the end of each text are where the layout puts them, in the three fonts of the image, under an ancestor's hostile styles. A task whose lines do not fit is a `TypeError` on its item.

— *Why:* the author's answers, all by the recommendation:
- the layout and the template layer as two tasks;
- the box 100 × 100;
- two columns — row by row;
- `exportWork()` on the workbook — a refusal with `DOMException` "NotSupportedError" until the workbook's work for checking had a decision of its own.

Before the questions, two separate agents checked the design — from the side of the layout and from the side of the element. The sources are sources 9.12 and 9.13.
- **The box 100 × 100** is two cells of the sheet's default grid, 50 units each: the author's answer, not a consequence of the fraction. The set's synthetic two-level fraction — `fraction()` in `src/core/sheets.fixture.ts`, its digits at 300→336 and 338→374 — is 74 high, and in the box it has 13 above and below. Three digits are 72 wide, 14 on each side. With a box of 104 there are already only 9 rows, and 125 and 150 give 8 and 7.
- **The sweep** — the numbers around the box, on the set of pages `src/core/pages.fixture.ts`: ten exercises in multiplication and in fractions, Russian lines with units and a remainder, tasks of 1–3 lines, capacity and edges. The measures:
  - how many rows fit;
  - whether the short lines of a school page fit in a column, from "7 × [ ] = 56" to "347 ÷ 6 = [ ] r [ ]";
  - the font size in CSS px on screens;
  - the box's headroom;
  - the room for scratch work on the page of ten exercises;
  - the gap between boxes;
  - the distortion of the fitting.

  With the chosen numbers all the short lines fit in a column, 52 % of the page of ten exercises is left for scratch work, and the boxes are nowhere closer than 32. What breaks with the neighboring ones:

  | Numbers | What breaks |
  |---|---|
  | font size 32 or 34 | "347 ÷ 6 = [ ] r [ ]" goes to the whole width |
  | font size 36 | also "47 ÷ 6 = [ ] r [ ]" and «2 ч 15 мин = [ ] мин» |
  | font size 26 or 28 | everything fits, but the text is 18.5–21 CSS px at k 0.71–0.75 |
  | box 104 or rows 40 apart | 9 rows |
  | box 96 | nothing: a fraction in the box has 11 above and below |
  | gap 20, margins 50 or 60 between columns | "347 ÷ 6 = [ ] r [ ]" goes to the whole width |
  | rows 24 apart | the boxes of neighboring rows are closer than 32 |

  Font size 30 is 24.6 CSS px on a tablet at k 0.82, 21.3 at 0.71, and on a phone at 0.39, 11.7. «47 : 6 = [ ] (ост. [ ])» with a box of 100 is long at any font size: this is the row for authors, В49.
- **A width per character for letters, not classes.** Coarse classes would stretch "r" by 41 % and squeeze "mm" by 44 %. The hundredths are canvas's own rounded numbers, and the rounding error is under 0.5 % against ±10 % between fonts.
- **The distortion** on the set — 252 parts of text in the image's Chromium. The fitting to the table stretches or squeezes text in Liberation Sans by a factor of 0.975–1.085 (median 1.043), and in Liberation Serif by 0.910–1.000 (median 0.938). Liberation Mono it squeezes: the median is 1.42, and a lone "." 2.25. The devices' own fonts are not measured here: they are for children's tablets, the debt Д7.
- **Canvas's own numbers, not a font's metrics.** The fonts' license is SIL OFL 1.1: it allows to "use, study" the font and requires the font itself and its parts to be distributed only under it. What goes into the package is not the fonts' files or tables, but the means of the two fonts, rounded to a hundredth. This is an argument of the decision, not a legal opinion.
- **Row by row** — the author's answer: on a tablet the page goes only down, and the order for the eye, for the DOM and for the task is one.
- **A box holds to the word after it** — as a number to its unit: «[ ] рублей», not "[ ]" at the end of a line and «рублей» at the start of the next.
- **The number column is one for all tasks** — "00.": a page holds no more than 20 items, and the lines' indent does not change with the tenth item.

— *Rejected:*
- **classes for letters, thousandths, the numbers of one font** — for the reasons above;
- **`\p{…}`, `\s` and `Intl.Segmenter`** — for the reasons above;
- **by columns** — the author's answer: back up to the top for the sixth item, and a long item breaks the columns;
- **a short item pulled up beside another,** so that no cell is left empty, — the task's order would change;
- **one height for all lines** — a task of three lines would take three times as much;
- **`dominant-baseline` and `text-anchor: end`** — in WebKit only the simple case of SVG text is reliable, one `<text>` at one point;
- **a number column sized by the count of items** — the indent would change with the tenth item;
- **a place set aside for scratch work,** — scratch work keeps what the lines did not take, and the task does not need it;
- **a line break after a box** — the box would be torn from the word after it;
- **one task** — the author's answer: the layout and the template layer are two.

— *Revisit:*
- the font size and the fonts — on children's tablets, by the debt Д7. A change of the numbers is a version of the format, in `spec`;
- the box and the gap between boxes — on children's tablets, if a fraction written with a finger does not fit. With a box of 100 and a gap of 32 the box rule loses not one answer of its set;
- right-to-left writing — with the first module in such a language: the line runs left to right, and a piece as the browser lays it out;
- Greek and Latin with diacritics — with widths of their own, if they come into the modules of the first slice.

— *Consequence:*
- `src/core/page.ts` — `pageOf`; `src/core/widths.ts` — the table of widths; `src/core/pages.fixture.ts` — the set of pages; `src/core/entry.check.ts` — `core` does not export the layout; `src/core/page.test.ts` — the layout against `spec`'s page and vectors;
- `src/element/fonts.test.ts` — the fitting in the image's fonts;
- [vectors/pages.json](../vectors/pages.json) — the record of the numbers and the cases this entry chose;
- `src/element/` — the workbook's template layer, a decision of its own, and the box rule after it: whether a box is filled is seen on the box itself;
- the entries on the task the element takes and on the workbook — the workbook is checked and shown by this layout;
- table 3 of RUN.md — В49 «в реестр spec»: a limit of lines for authors, which `spec` answered with the format's rule that a task on a workbook fits its page;
- [architecture.md](architecture.md) — the workbook, the sheet's coordinates, the docking with the app, and the code and tools.

**R36. The workbook's template layer: the element shows the lines of its items on the page — the numbers and the pieces of text as SVG, fitted to the layout of the workbook's page, and the boxes with a frame of 1 CSS px on whole device pixels. The printing is in the ink's color and the consumer's font, and it takes nothing else inherited. A screen reader reads the lines as a list, and the boxes by the names from the table of labels. The element is horizontal whatever the page's writing mode.**
- **The layer by canvas kind** — the same SVG of the template layer, with the same `viewBox` as the other layers:
  - a sheet has the grid, over the whole sheet as far as it goes past the page, and the layer is `aria-hidden`;
  - a workbook has the lines and no grid, on the page and past it; its root is `role="none"`, without `aria-hidden`;
  - a task of another kind rebuilds the layer, a task with the same lines (`sameLayer`) writes nothing, and the work stays: only a new element or another writing history replaces it;
  - a workbook that does not fit is a `TypeError` at `task.items[i]`, by the layout.
- **The lines:**
  - `<g class="print">`, in it `<g role="list">`, and in that an item per line of the task, in its order: an `<svg role="listitem" x y width height overflow="visible">` of the place and size `PageItem` gives — its column's left edge, its row's top, its column's width or the page's within its margins, and the height of its lines;
  - in the item, the number and each part of a piece on a line of the page are a `<text x y textLength lengthAdjust="spacingAndGlyphs">` by `PageText`, without `tspan`, and a box is a `<rect role="img">` by `PageBox`, each with its `x` and `y` from the item's origin. The code reads no sizes of the text;
  - a value a worked example's demo writes in a box is a print node of its own right after the box.
- **The printing takes nothing inherited.** The printing group has `all: initial`, and after it `font-family: inherit`, `visibility: inherit`, `pointer-events: none`, `direction: ltr`, `font-variant-numeric: tabular-nums`, font size 30 and `color: var(--novatrail-canvas-ink, #111)`. The text is `fill: currentColor`, the frame `stroke: currentColor`.
- **The box's frame** is 1 CSS px, `vector-effect: non-scaling-stroke` and `shape-rendering: crispEdges`; a filled box's is 3 CSS px, and its name «Окошко, заполнено», by the box rule.
- **Color:**
  - the printing and the frames are in the ink's color, and they have no theme variable of their own;
  - an invalid value of the variable gives them, as it gives the ink of the drawing surface, the color of the page's text, not the black of `all: initial`;
  - in forced colors, an explicit `fill` and `stroke` of CanvasText, and Highlight for a filled box's frame: SVG keeps the parent's color there (measurements 1.4), and the theme's ink would stay.
- **Accessibility:**
  - the numbers are text, and a screen reader reads them, like the markers of an `<ol>`;
  - a box's name is «Окошко», and among several in a line «Окошко 1», «Окошко 2», by place, with whether it is filled, by the box rule;
  - the language of the lines is the manifest's `languages.explanation`, as an attribute `lang` on `<g role="list">`. Without a manifest there is no attribute, and the lines are in the element's language, like the statement the element shows;
  - a box has a `lang` of its own, the language of the labels, by the element's `lang`, like the bar of buttons. A new `lang` of the element changes the boxes' names together with the buttons' labels;
  - the element's table of labels names the scroll container by the canvas kind, Workbook or «Тетрадь», and the bar Workbook buttons or «Кнопки тетради»; a box is Box or «Окошко».
- **1.4.4 of the printing.** The printing scales with the page, its font size on the screen 30 × k CSS px, k = min(A / 1000, 1) × z, z the page's zoom, 9.6 at 320 CSS px and 100 %: Zoom in on the bar takes it to twice that, which 1.4.4 asks, by the technique G178 (sources 9.18).
- **The page's writing mode.** `:host { writing-mode: horizontal-tb }`: the element — sheet, workbook and task from paper — is horizontal under an ancestor's vertical writing. A `writing-mode` on the element itself is stronger: that is the consumer's choice.
- **Scrolling to an item.** `scrollIntoView` of an item that is not seen scrolls the container at once. The item comes into the visible part when the layout sets a new `viewBox`, after two animation frames.
- **Tests:**
  - `src/element/workbook.test.ts`, in Chromium, at densities 1 and 2:
    - the start and the end of each text are where the layout puts them, in the three fonts of the image, under an ancestor's hostile styles and `dir=rtl`;
    - the boxes lie over the ink at any width and scroll;
    - the eraser does not take the template;
    - the frame, on a screenshot;
    - the list, the order and the names, in the DOM and in Chromium's own tree, through `cdp()` by the `frameId` of the test's iframe;
    - `:lang()`, `scrollIntoView` under any writing mode of the page, the switch between canvas kinds, the theme and `exportWork()`;
    - the parts are read in the print's units, through the matrix from the part to the print, the frames' pixels through the print's matrix, and an item on the screen by its parts: Firefox's `getBoundingClientRect()` of an inner `<svg>` is not its item's box;
  - forced colors, in `forced-colors.test.ts`.

— *Why:* the author's answer, by the recommendation — fix the page's vertical writing —, the decision on the workbook and the layout of its page, and the probes of the template layer (measurements 1.4). The sources are sources 9.4, 9.12 and 9.13.
- **A frame on whole pixels.** With `crispEdges` each edge is the full ink color, 18.9:1 for `#111`, at densities 1, 1.25, 1.5 and 2, and its width is 1–2 device pixels. An antialiased frame at density 1 falls to 3.59:1, and with `#555` to 2.41:1, below 3:1 (WCAG 2.2, 1.4.11).
- **The reset** was checked under an ancestor's hostile styles in three fonts: the start of the first character and the end of the last are where the layout puts them, to 0.05 of a unit or closer. `all: initial` alone is not enough: it does not reset `direction`, and it resets `visibility` and `pointer-events` the wrong way.
- **Color through `color`** — this way an invalid value of the variable behaves for the printing as for the ink: CSS computes it as `unset`.
- **The numbers are read**, as in a numbered list of HTML: the tutor and `app` name an item by its number.
- **An item as an `<svg>` with a size**, the author's answer to В80, by the recommendation: Firefox brings an SVG group into view as a point at its origin — a `<g>` of no transform not at all, one placed by `transform` only to the edge of the visible part —, while a nested `<svg>` with a size it brings whole, as Chromium and WebKit bring all three (measurements 1.5 and 1.6).
- **`:host`, not the printing:** vertical writing lays the whole scene on its side, and scrolling to an item scrolls nothing. `:host` overrides an inherited writing mode, but not the consumer's own.
- **The tree through the test's `cdp()`:** the Playwright provider gives a session of the page, and the tree of the test's iframe is taken by its `frameId`. The CDP tree has no `lang`, and `:lang()` checks the language.

— *Rejected:*
- **an antialiased frame** — for the reason above;
- **a theme variable of its own for the printing** — the printing goes in the ink's color, as the statement goes in the consumer's color;
- **the grid's color for the frame** — 1.4:1 on white;
- **`aria-hidden` on the numbers** — an item without a number cannot be found by the tutor's words;
- **text on the drawing surface** — a screen reader does not read it;
- **HTML text in `foreignObject`** — the browser's layout lays it out, not the layout of the page;
- **an item as a `<g>` placed by `transform`** — Firefox shows 0.5 px of the item; **a `<g>` without a place, waiting for Firefox's own fix** — Firefox does not bring it into view at all;
- **a Vitest command of its own for the tree** — the test's `cdp()` already gives a session;
- **resetting the writing mode only on the printing** — vertical writing breaks the whole element.

— *Revisit:*
- on devices, the debt Д7: the reset in WebKit, `-webkit-text-size-adjust`, the frame and the text in Safari; VoiceOver on the iPad, and a copy of the lines in HTML if it does not read the SVG; exploring by touch with VoiceOver and TalkBack — over the lines lies the drawing surface, which takes input, and a finger may land on it rather than on an item: only reading in order is checked, the tree and the roles.

— *Consequence:*
- `src/element/index.ts` — the template layer: the lines, the reset of the printing, its colors and the writing mode of `:host`;
- `src/element/labels.ts` — the names of a box, of the workbook's scroll container and of its bar;
- `src/element/workbook.test.ts` and `src/element/forced-colors.test.ts` — the tests;
- [architecture.md](architecture.md) — the layers, the docking with the app, the code and tools, the workbook and accessibility.

**R37. The box rule: a stroke belongs to a box if the middle of the frame of its points lies in the box widened by 120 thousandths of its size, and the frame itself is no wider and no taller than 1600 thousandths of the box. Otherwise the stroke is scratch work. Of two boxes the rule takes the one with more of the stroke's points, then the earlier by (item, box). The rule is `spec`'s eval protocol, as written here. Which boxes are filled, the property `filled` says. A filled box's frame is 3 CSS px, and its name says «заполнено».**
- **The rule** is `cellOf` in `src/core/boxes.ts`, in integers:
  - the points are in tenths of a unit, `round(10 × v)`, half up, as for the stroke groups. The box is in tenths: L, T, W and H;
  - x0, x1, y0 and y1 are the least and the greatest coordinates of the stroke's points;
  - the size: 1000 × (x1 − x0) ≤ 1600 × W and 1000 × (y1 − y0) ≤ 1600 × H;
  - the middle: 1000 × (x0 + x1) ≥ 2 × (1000 × L − 120 × W) and 1000 × (x0 + x1) ≤ 2 × (1000 × (L + W) + 120 × W), and the same vertically;
  - of the boxes where both the size and the middle hold, the one with more of the stroke's points in the widened box, and on a tie the earlier in the task's order: by item, then by box, from 1. None — scratch work;
  - all the integers are below 2^31;
  - a stroke without points is a `TypeError`, and a point outside the page a `RangeError`, as for the crop. The rule and the crop take the stroke's frame in tenths from one function, `extentOf` in `src/core/geometry.ts`.

  With a box of 100 the margin is 12 units, and the limit 160: the box and 30 on each side. Boxes stand 32 apart on the workbook's page, so the widened ones do not overlap, and a workbook's page has no disputed case. It is needed for rectangles that others will give.
- **The module** gives:
  - `cellsOf(page)` — the boxes in the task's order;
  - `cellOf`, and with it `tableOf` — the table "box → stroke IDs", for the workbook's work for checking — and `filledOf`.

  The `core` entry point does not give the rule, and `entry.check.ts` holds that.
- **The rule is `spec`'s eval protocol**, as written here (В47): the device and `tutor`'s runner take a stroke into a box by it, and the rule changes only in `spec`.
- **Test vectors** — `vectors/eval/v1/boxes.json` of the package `@altnovatrail/contracts`, and a test checks the code against them. `canvas` wrote them first as [vectors/boxes.json](https://github.com/altnovatrail/canvas/blob/602945b/vectors/boxes.json), at the commit where the file still was, 20 cases:
  - 13 sheets of the set with points at the corners, and 4 of them also with points every 2 units;
  - the rule's edges;
  - 2 pages by seed.

  Each case has the boxes, the strokes, the verdict of each stroke, the table and which boxes are filled.
- **`filled`** — in the element:
  - the type is `readonly (readonly boolean[])[] | null`, `Filled` in the element's entry point and in `interface.check.ts`;
  - it is recomputed:
    - in `#changed()`, before `historychange`;
    - after a new layout;
    - after an assigned history, without an event;
  - each stroke's verdict is computed once and kept in a `WeakMap`, a new one at a new layout. The value stays the same frozen one until a box changes;
  - the stroke under the pen is not in it, and a stroke under the eraser before lift-off is, as for `exportWork()`;
  - on a sheet, `filled` for a slot `anywhere` or `sheet` is `[[has a stroke]]`, by the same rule "the stroke that `exportWork()` would take", and a sheet with only `choice`, a sheet without a task and an example are `null`. The type and the time of change are the same.
- **Look and name:**
  - a filled box's frame is 3 CSS px of the same ink color, on whole device pixels, and in forced colors Highlight. An empty one's frame is 1 CSS px;
  - a filled one's name is «Окошко, заполнено», «Окошко 1, заполнено» / "Box, filled". An empty one's name is «Окошко». The label `filled` is in the element's table of labels.
- **The trial page** shows in the counter's row how many boxes are filled.

— *Why:*

The author's answers:
- the rule and `filled` as one task — not by the recommendation, which was to split them;
- the 3 px frame — by the recommendation;
- «заполнено» only on a filled box — by the recommendation.

The design was checked by three reading agents and an architect agent. From the architect came the family "the middle of the frame", "the earlier place" as (item, box) and the count of split signs.

- **The sweep** — on the set `src/core/workbooks.fixture.ts`:
  - **13 sheets "by hand"** on the layout's pages:
    - digits past the edge; "4", "5", "+", "×" and "=" at the edge;
    - numbers of two and three digits;
    - fractions on two levels, with a bar up to 140, and a fraction in a line;
    - "<", ">" and "=";
    - neighbors beside and a line below; a stroke across two boxes;
    - scratch work and dots; circles;
    - something crossed out and the new beside it;
    - writing after erasing;
  - **100 pages by seed** on four pages of the layout:
    - in each box an answer of one to three digits, a fraction or a sign 28–60 high, its middle within 20 of the box's middle;
    - on a page 3–6 pieces of scratch work 8–48 from the boxes;
  - **the expectations** were written down with the set, before the run:
    - a sign belongs to a box if its middle is in the box and it goes past the edge by no more than three tenths of its size;
    - scratch work is no closer than 8 to a box;
    - the rest is "any" and does not count;
  - **3478 strokes of answers and 896 of scratch work** at each density. The points stand at the corners of the polyline or every 1, 2 and 3 units, with a jitter of up to 0.5;
  - **the measures, in order:**
    - answers lost with dense points — every 1, 2 and 3 units, as from input, — with empty boxes and split signs;
    - scratch work taken into a box;
    - strokes whose verdict changes with density.

  | Rule | Lost: corners / 1 / 2 / 3 | Scratch work | Changed by density | What breaks |
  |---|---|---|---|---|
  | middle, margin 120, limit 1600 — accepted | 0 / 0 / 0 / 0 | 2 | 0 | — |
  | middle, margin 140 | 0 / 0 / 0 / 0 | 2 | 0 | nothing on the set, but the margin is nearer to half the gap, 16 |
  | middle, margin 100 | 0 / 0 / 0 / 0 | 2, at 3 units 1 | 1 | a dot's verdict depends on density |
  | middle, margin 80 | 0 / 0 / 1 / 1 | 1 | 1 | "=" past the top edge splits |
  | middle, margin 40 and 0 | 1 and 2 | 0 | 0 and 3 | signs at the edge split |
  | middle, margin 160 | 0 | 6–7 | 1 | scratch work 12–16 from the box |
  | middle, limit 1200 and 1000 | 1 and 3 | 2 | 0 | a fraction bar of 140, and at 1000 also of 120 — the box is empty |
  | middle, limit 2000 | 0 | 3 | 0 | one more stroke of scratch work |
  | share of points, margin 140, two thirds — the best of the family | 1 / 0 / 0 / 0 | 2 | 3 | the bar of 140 with points at the corners; the verdict depends on density |
  | share of points, margin 160, three quarters | 1 / 0 / 0 / 0 | 5–6 | 4 | scratch work |
  | share of points, margin 200, four fifths | 0 | 11–15 | 4 | the widened boxes overlap; scratch work |
  | the frame of the points wholly in the box, margin 160, limit 1200 — the best of the family | 1 / 1 / 1 / 1 | 5–6 | 1 | the bar of 140; scratch work |

  The accepted rule takes two strokes of scratch work:
  - a dot 8 from a box — on the border of what the set counts as scratch work;
  - the top bar of a scratch digit 10 below a box. The rule takes a stroke alone, without its sign, as the workbook puts each stroke in one box or in none.

  There are 113 "any" strokes, and the rule takes 112 of them into boxes, a circle around a box among them.
- **The middle of the frame, not the share of points.** A stroke's frame changes with density by less than the step of the points, and the share of points changes a lot, as it does for the snapping of the tutor's marks. A runner that takes a sample's points by the stroke's length will get the same verdict, unless the stroke stands at the very edge.
- **The margin 120** is the middle of the window 100–140 where nothing is lost. At 100 one dot changes its verdict with density, and 12 is less than 16, half the gap between boxes.
- **The limit 1600, not 1400.** On the set they are equal, but 1400 is exactly the length of the set's longest bar. 160 is the box and 30 on each side, and 32 further on is already the next box.
- **Split signs.** The rule takes a stroke alone, as the workbook does, and a sign at the edge could come apart: one bar into the box, the other into scratch work. The accepted rule has none such on the set, and at a margin of 80 and less there are some.
- **The 3 px frame.** It is seen not only by color but by its width. The contrast is that of ink on paper, 18.9:1 for `#111`. It is on whole pixels, like the empty box's frame on the template layer, and does not look like a verdict.
- **«Заполнено» only on a filled one.** «Пусто» on each line of a new page is noise, and without «заполнено» a box is empty.
- **The set's fraction** — `fraction()` in `src/core/sheets.fixture.ts` — is 74 high, not 86.

— *Rejected:*
- **the share of points, as for snapping the tutor's marks,** — by the table: at any margin it loses a bar with points at the corners or takes scratch work, and the verdict depends on density;
- **the frame of the points wholly in the box** — it loses a bar wider than the box and a sign at the edge;
- **a margin wider than 160** — the widened boxes overlap, and scratch work goes into a box;
- **«пусто» in an empty box's name**, **a 2 px frame with a tint** and **a mark in the corner** — the author's answers;
- **splitting the task into the rule and `filled`** — the author's answer.

— *Revisit:*
- the margin and the limit — in `spec`'s eval protocol, with new vectors, by the check of the pen on tablets, by `tutor`'s measurement of the AI's reading and by children's samples: the set is synthetic;
- if a fraction written with a finger does not fit into a box — together with the numbers of the workbook's page layout.

— *Consequence:*
- `src/core/boxes.ts` — the rule, `cellsOf`, `tableOf` and `filledOf`; `src/core/geometry.ts` — `extentOf`, shared with the crop; `src/core/workbooks.fixture.ts` — the sweep's set;
- `src/core/submission.ts` — `cellsForCheck`, the workbook's work for checking, takes `tableOf` for the boxes' crops and for the context `{ boxes, digest }`, and "no box is filled" is an empty table and `null`;
- `src/element/` — `filled`, the frame and the name of a filled box;
- the entries of this log on the package's interface, the sheet's buttons and their table of labels, the workbook, the layout of its page and its template layer;
- **В47** — the rule and its vectors, which `spec`'s eval protocol took as written here;
- [architecture.md](architecture.md) — the workbook, the layers, the sheet's coordinates, the docking with the app and the code and tools.

**R38. A workbook's work for checking is a crop of each filled box by its strokes, with the numbers of the item and the box, and the context `{ boxes, digest }`: the table "box → stroke IDs" and the digest of its strokes, of all the page's boxes and of the table's rows. If no box is filled, `null`. The work's kind is named by its key — `png` for a sheet, `cells` for a workbook —, and only the crops with their places leave the device. Marks on boxes are a decision of their own.**
- **The work** is `cellsForCheck` in `src/core/submission.ts`, beside the sheet's `workForCheck`:
  - the table is `tableOf` by the box rule, on the same strokes as `filled`: the stroke under the pen is not there, and strokes under the eraser before lift-off are;
  - `cells` is the `{ item, slot, png }` of each filled box, in the task's order. The PNG is the sheet's crop by stroke bundles, by the strokes of one box, as one group, at the manifest's digit height at the moment of the call. The scratch work goes nowhere;
  - `submission` is `{ boxes, digest }`, where `boxes` are the table's rows `{ item, slot, ids }`, the IDs ascending;
  - not one filled box — `null`, even with scratch work;
  - the crops are frozen on the outside — the bytes of a PNG cannot be frozen —, and the context deeply.
- **The digest** is `workbookDigestOf` in `src/core/marks.ts`: the same CRC-32 and Adler-32 as the sheet's, from the PNG encoder, of the text in UTF-8. The lines of the text:
  - the table's strokes by ascending ID — as for the sheet: the ID and the points in tenths of a unit and whole milliseconds;
  - `cell item slot left top width height` — for each box of the page, in the task's order, in whole units of the page;
  - `box item slot ID,…` — for each row of the table.

  It holds no numbers of the crop, and no digit height either. The text of the sheet's digest did not change: a pinned literal of a test still holds it.
- **Types:**
  - in the DOM-free part, `SheetSubmission`, the former `Submission`, and `WorkbookSubmission`, and `Submission` is their union. Also the table's row `Filling`. The `core` entry point gives these types, but not the rules;
  - in the element, `ExportedSheet { png, submission }` and `ExportedWorkbook { cells, submission }` with `ExportedCell { item, slot, png }`, and `ExportedWork` is their union. The work's kind is by its key: `"png" in work` or `"cells" in work`;
  - `Marks.submission` takes a workbook's context with marks on boxes, which a decision of their own makes.
- **Leaving the device** are only the crops with their places, the item and the box. The table and the digest stay with `app`, like the sheet's context: the platform keeps data to a minimum.
- **Size** — a measurement on the box rule's synthetic pages, `seeded()` in `src/core/workbooks.fixture.ts`, 540 boxes:
  - **a box's crop:** at D = 16, 32 and 48 each is the crop's lower limit, 200 × 200 px, that is 64 tokens;
  - **PNG at 32 px:** 0.6–1.9 KB, median 1.1 KB;
  - **at 256 px:** the largest is 726 × 664 px, 624 tokens.

  | Items, one box each | Crops | Tokens | PNG, median (min–max) | base64, median |
  |---|---|---|---|---|
  | 5 | 5 | 320 | 5.6 KB (4.1–6.9) | 7.5 KB |
  | 10 | 10 | 640 | 10.9 KB (9.1–14.2) | 14.5 KB |
  | 15 | 15 | 960 | 16.1 KB (14.0–20.5) | 21.4 KB |

  A crop of the whole sheet is no more than 1568 tokens, by the crop's limit.
- **An empty box** gives no crop: in `spec`'s format an empty slot's verdict is "unreadable" with the reason `blank`. An empty box's value is `null`, it need not be read, and which boxes are empty, `filled` says.
- **One crop of all the boxes** (В45) is the same private helper `croppedOf` in `src/core/submission.ts`, only with the strokes of the whole table and with its rows instead of groups. The context does not change by that.
- **Tests:**
  - `submission.test.ts` — the composition on the set's 13 sheets at all the eval heights, the task's order, `null`, freezing, JSON and the digest, pinned both by a literal and by the text of this entry;
  - `workbook.test.ts`:
    - `cells` — exactly for the boxes that are filled by `filled`;
    - the eraser before lift-off;
    - the manifest's digit height;
    - the switch to a sheet;
  - `consumer.test.ts` — `app`'s path on a workbook:
    - the boxes, by role and name;
    - writing in the boxes and beside them, `filled`;
    - «Проверить» and the reading of each PNG;
    - opening again from storage;
  - the helper `sheetWork()` in `pointer.fixture.ts` narrows the work to a sheet in the old tests.
- **The trial page** on a workbook shows, at «Проверить», the crop of each box: its place, size, tokens and bytes.

— *Why:*

The author's answers, by the recommendations:
- the work for checking and marks on boxes as two tasks. A reason beyond the length: В45 and В46 with the sizes go to `spec` without waiting for the marks;
- the frame of a mark on a box goes around the box and its ink together. The decision on marks on boxes makes it.

The design was checked by an architect agent. Its corrections:
- the digest holds all the page's boxes;
- the crops are frozen only on the outside;
- the table is computed anew;
- the work is narrowed by a helper, not by a copy;
- for marks on boxes, the order "`task` and `history` before `marks`", one shared re-placing of the marks at a new history and a new layout, and a slot not from the table gets no frame.

More reasons:
- **A crop per box**, as the workbook decides: the model need not look for what is in which box, and `tutor`'s measurement of the AI's reading reads the slots the same way.
- **A digest over all the boxes.** A workbook's context given at another layout is a `TypeError`. If the digest held only the filled boxes, a context of another layout would pass whenever those boxes stayed in place: items added at the end, an empty box moved.
- **No numbers of the crop** — there is no snapping on a workbook, a mark comes with a slot. So the digit height does not change the digest either.
- **The table anew, not from the cache of `filled`.** `cellOf` is a pure function, so `cells` and `filled` agree anyway. Pulling the element's cache into the DOM-free part is an interface for the sake of one call per «Проверить». A test holds the agreement.
- **`Submission` is a union,** like `Task = SheetTask | WorkbookTask`. A sheet-only type under the shared name would read as shared, and a union in the promise of `exportWork()` breaks the same places whatever the names.
- **Size.** 64 tokens per box at the usual heights is the crop's lower limit, "no less than 200 px", for which the crop is wider than its work. A page of 10 items, one box each, is 640 tokens, less than the limit of a crop of the whole sheet.

— *Rejected:*
- **a digest of only the filled boxes** — for the reason above;
- **`png: null` for empty boxes** — `filled` already says which are empty, and an empty record in `cells` would invite sending an empty box;
- **the table from the element's cache** and **a sheet-only `Submission`** — for the reasons above;
- **as one task** — the author's answer.

— *Revisit:*
- the form and the types — by the answer of `spec` to В45 and В46 and with the types that `spec`'s releases carry;
- how many crops per call and whether the item's text is needed — by `tutor`'s measurement of the AI's reading. That measurement sends empty slots too, asking "is it empty" (`tutor` at f55b3b8, read 2026-10-27). If the product needs it, empty boxes will go into `cells`;
- one crop — if `spec` chooses it in В45.

— *Consequence:*
- `src/core/submission.ts` and `src/core/marks.ts` — `cellsForCheck`, the types of the submission and `workbookDigestOf`;
- `src/element/` — `exportWork()` with `cells`, the element's types of the work, and the tests;
- marks on boxes — `Anchor.cell` by place, the workbook's context in `marks`, `task` and `history` before `marks`, and the frame around the box and its ink: the decision on marks on boxes, a later entry of this log, makes them;
- `src/eval/` — the workbook's sample (E5): the boxes' crops by the same `cellsForCheck` at the eval heights, the table and the boxes' rectangles;
- `demo/` — the crop of each box at «Проверить»;
- the entries of this log on the crop, the tutor's marks, the package's interface, the workbook, its template layer and the box rule;
- **table 3 of RUN.md** — В45 and В46 made more precise;
- [architecture.md](architecture.md) — the workbook in the component's purpose and bounds and in how it is built, its whole design in a section of its own; the layers, the sheet's coordinates, the docking with the app, the sample file and the code and tools.

**R39. Marks on boxes: on a workbook a mark comes with an answer slot by place — `{ item, slot }`, from 1 — and holds to the strokes of its submission's table row, and its frame stands around the box and the visible ink of its strokes together; a mark of an empty box circles the box itself. The context's kind is named by its keys, and `task` and `history` are given before `marks`. A new page places the marks anew or takes them off, without an event.**
- **The place** — `Anchor.cell` is `{ item, slot }` (`CellPlace`), not an ID string, for both canvas kinds: slots have no ID in `spec`'s task format. On a sheet a slot still gives no frame: a sheet takes no zones, by the element's check of the task.
- **The check is `marksOf`** in `src/core/marks.ts`:
  - the context's kind is by its keys: `crop` and `groups` for a sheet, `boxes` for a workbook. Both at once is a `TypeError`, and a key with the value `null` is the same as one left out: some storages write so;
  - the table's rows are checked like groups: a place (item, box) and a stroke ID once each, the IDs whole numbers from 1. The digest holds the order of the rows and of the IDs in them;
  - with a workbook's context a mark stands only on a slot: a group label and the model's frame are a `TypeError` at `marks.marks[n].at`.
- **The mark's place is `placesOf(marks, known, cells)`:**
  - `cells` are the boxes of the workbook's page in the task's order, and `null` on a sheet;
  - a context of another canvas kind is a `TypeError`, and it says that the task is given before the marks;
  - an ID of the table that the sheet did not know is a `TypeError`;
  - the digest is computed anew, over the known strokes, the erased ones too, and over the boxes of the current page, as for the workbook's work for checking. A page of another layout is a `TypeError`;
  - a slot is the strokes of its row and the page's box. An empty box, which is not in the table, gets its rectangle without stroke IDs. A box that is not on the page gets no frame, not a `TypeError`.
- **The frame** — by the author's answer: around the box and the visible ink of its strokes together, `shownOf` with the box. The margin is 10 units, the line 2 CSS px, it pales under a stroke, and in forced colors it is Highlight, as on a sheet. When all its strokes are erased it is not seen, and undo brings it back. A mark of an empty box circles the box itself, without strokes, however one writes in it later: `shownOf` gives the rectangle itself. The next box stands 32 units away, and a frame with a margin of 10 does not touch it.
- **The order of assignment:** `task` and `history` before `marks`. Before a task the element has a sheet's template, and a workbook's context would be of another kind. At registration the element takes the properties in this order anyway.
- **A new page:**
  - there is one re-placing of the marks, `#replace()`, for the setters `history` and `task`;
  - for `task`, only when the layer changes: the same page writes nothing;
  - marks that did not take their place on the new page or in the new history are taken off: `marks` is `undefined`, without an event.
- **Types:** `CellPlace` is in both entry points, and `Marks.submission` is the union `Submission`, a sheet or a workbook, as the workbook's work for checking gives it.
- **Tests:**
  - `marks.test.ts` — four new ones:
    - the check of a workbook's context and its errors;
    - the place of a slot, of an empty box and of a box not from the page;
    - the frame around the box and the ink;
    - a context of another kind, of another layout and of foreign strokes;
  - the old tests with a slot as a string — moved to a slot by place;
  - `workbook.test.ts`:
    - the frame on a box, the name, the paling, erasing and undo;
    - the same page, another page, a sheet and `history = []`;
  - `forced-colors.test.ts` — Highlight for the frame on a box;
  - `consumer.test.ts` — a mark on a box through JSON and after opening again.
- **The trial page** has a mark button at each row of the table. The mark stays after "Reopen" and goes with a change of page.

— *Why:*

The frame is the author's answer in the planning of the workbook's work for checking, by the recommendation:
- it does not cross the box's frame;
- it does not jump with the handwriting;
- it takes the ink that went past the edge;
- it does not touch the neighbor.

So it is in the prototype too — a circle around the box. The author asked, in one phrase, for the task to be done and brought to its merge into `main`.

The rest are the architect agent's corrections in the same planning, as for the work for checking:
- **A box not from the page gets no frame.** A `TypeError` of one mark would break the whole assignment — the sheet's marks reject it for a slot for the same reason.
- **An empty box is circled by itself.** The verdict "unreadable" for the reason `blank` calls for a frame around the box, and `spec`'s types of the marks and its contract of `app` and `api` give such a mark.
- **`task` before `marks`.** A workbook's context is checked by the page's boxes, and before a task the element has a sheet's template. The history is before the marks anyway, by the package's interface.
- **Re-placing only at a new layer.** `app` gives the task at every redraw, and the same page does not change the marks.
- **Rows like groups.** A place and an ID once each. The digest checks the order, as for groups.

— *Rejected:*
- **a frame only around the ink**, as on a sheet, and **only around the box** — the author's answer;
- **a slot not from the table is a `TypeError`** and **re-placing at every task** — for the reasons above;
- **an empty box without a frame**, since it gives no answer and the frame has nothing to hold to — the verdict "unreadable" for the reason `blank` calls for a frame around the box;
- **a slot as a string ID** — slots have no ID in `spec`'s task format.

— *Revisit:*
- the place and the kind of a slot's field — with the contract of the epic E3 in RUN.md of `spec`;
- the color and the look of the frame — with the first slice of `app` and `api`, as for the sheet's marks.

— *Consequence:*
- `src/core/marks.ts` — the check of a workbook's context, the place of a mark on a box, of an empty box without strokes, and the frame;
- `src/element/` — the marks on the workbook, the order of assignment, the re-placing at a new page and the tests;
- `demo/` — a mark button at each row of the table;
- [architecture.md](architecture.md) — the workbook, what is still to decide on it and its design, the marks' place, the docking with `app` and the code and tools;
- the entries on the sheet's marks, the package's interface, the workbook and its work for checking — the mark on a box;
- **table 3 of RUN.md** — В46 made more precise.

## `spec` tag v0.2.42

**R40. `canvas` is on `spec` v0.2.42: the submodule `spec/` is at this tag. `spec` has not yet recorded the rows «в реестр spec» В42–В49, and they stay. The tag brings `canvas` new open fields of the task, the exit condition "something in each slot" and the demo of a lesson's worked example — that is the epic E7, and this move leaves the temporary types and the copies of the format examples in the tests at v0.2.37.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.37 v0.2.42`, read 2026-10-27). The tags v0.2.39–v0.2.42 recorded the format of the epic E2 of `spec`: slot checks, traps, techniques and solving steps, lessons and the generator. v0.2.38 is the OpenSSF Best Practices badge of `spec` itself:
  - **the slot check** — each answer slot has its own, `check`, closed whole. It does not go into the open view, and the element does not get it. An empty slot is "unreadable" for the reason `blank`. This answers what the entries on the workbook and on its work for checking left to revisit on the empty box: it needs no crop, `filled` names the empty boxes;
  - **"givens" and "unknown"** — the open fields of the task `givens` and `unknown`. At this tag the element's strict check of the task rejects them: a task with them is a `TypeError` "task.givens: no field of a task's open view". The rest of the task's open view is as before: the parts of the statement, the canvas, the items and the slots. The new fields `check`, `simpler_case`, `techniques`, `traps`, `solution` and `leak_phrases` are closed;
  - **the step's exit condition** `answer_slots_filled` — each answer slot has something in it: a stroke in its zone or box, a chosen option, and for `anywhere` and `sheet` a stroke on the sheet, by the format's text in `spec/format/README.md`. What it is for `anywhere` and `sheet`, `spec`'s card of `app` leaves to `app` and `canvas` to decide. On a workbook it is `filled`, by the box rule, and on a sheet `filled` is `null` at this tag, until a later entry of this log decides it;
  - **the example's demo** — a lesson carries worked examples, and the demo layer shows the example's parts one at a time and images on sheet areas at their size. The whole demo can be hidden, and the learner does not write on an example's sheet. By `spec`'s card of `canvas`, the element will take the lesson's open view with temporary types of its own;
  - **the manifest** — a new open field `rung_templates`. The element reads three fields of the manifest and skips the others, so it takes the tag's manifest;
  - **the randomness generator** the element does not need now: the numbers of a templated task come in its open view. A widget's seed is its own, not the attempt's seed, and how the widget gets it, the widget protocol decides, by `spec`'s architecture. The app's side of the protocol is the widget host of `canvas`, from stage 4.
- **RULES.md, the devcontainer, the template and the documents check** did not change between the tags: `git -C spec diff --stat v0.2.37 v0.2.42 -- RULES.md .devcontainer repo-template` is empty, and in `tools/` only the format check `format-check` and the test `new-repo` changed. The recipe `licenses-check-repo` is as before.
- **The rows of table 3:** `spec` recorded none of В42–В49 — not in the log, not in RUN.md, not in the card. В45 now names `spec`'s decision on the slot check, and В50 is closed by the author's answer: the next epic is E7.
- **What the move does not do** — as in the move to v0.2.37:
  - the temporary task type and its check stay as before, and the copies of the format examples in the tests stay copies of v0.2.37 (Д5). The new fields, the exit condition and the example's demo are the epic E7;
  - the `core` entry point and the vectors — as they were.
- **What is changed here:**
  - `spec/` is at v0.2.42, commit 69b5b3c; the tag is in README.md, CLAUDE.md and at the top of RUN.md;
  - RUN.md: E6 is in the archive [plan/E6.md](plan/E6.md), and the task of this move is there too. Table 1 has no rows, E7 in table 2 names the decisions of `spec`, В45 names `spec`'s decision on the slot check, В50 is closed, and Д4–Д6 are checked;
  - [architecture.md](architecture.md): the status, the purpose and bounds, the docking with `app` and the workbook name `spec`'s slot check and the task's new fields, and a new subsection of what is still to decide names what the tag left `canvas` to decide. A later entry of this log decided it: `filled` on a sheet, the property `workedExample` and the example mode, the demo's buttons with `demoState` and `demochange`, the parts above the sheet and their accessibility, with the rows «в реестр spec» В52–В54;
  - the entries on the task's check, on the workbook and on its work for checking.

— *Why now:* the author's instruction — move to the new `spec` in one branch with the archive of E6 and a review of tables 3 and 4. What the move holds is the author's answer, by the recommendation: the submodule and the documents, and the task's new fields are E7. v0.2.42 is the latest release of `spec` on 2026-10-27 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.42 -R altnovatrail/spec` confirmed it by its attestation.

— *Rejected:*
- **the move together with the fields `givens` and `unknown`** — that is code, tests and a code review, more than one check. Their place is E7, together with the exit condition and the example's demo, which are decided by one agreement with `app`;
- **v0.2.41** — v0.2.42 came out before the move began.

— *Consequence:*
- **E7** names `spec`'s decisions on the slot check, on the task's new fields and on lessons. It is taken, by the author's answer to В50, and planned in table 1 of RUN.md: its first task takes the task's fields and the copies of the format examples of the task, of the manifest and of the vectors of the open view, and a later one the copies of the lessons;
- the entries on the task's check, on the workbook and on its work for checking;
- **В45** names `spec`'s decision on the slot check, **В50** is closed;
- **Д5** — the copies at v0.2.37, the new fields are E7. The move to v0.4.1 takes the copies to that tag, and the task's and the manifest's types from `spec`;
- RUN.md, tables 1–4, and [plan/E6.md](plan/E6.md) — the archive of E6 and the task of this move;
- [architecture.md](architecture.md) — the status, the purpose and bounds, what is still to decide on the task's fields and the demo, the docking with `app` and the workbook;
- README.md and CLAUDE.md — the tag.

## `spec` tag v0.4.1

**R41. `canvas` is on `spec` v0.4.1: the submodule `spec/` is at this tag, and the types of the task and the manifest come from the npm package `@altnovatrail/spec` of the same version, in `dependencies`. `spec` has recorded the rows «в реестр spec» В42–В49, and table 3 of RUN.md names its decisions in their place. The element's own task types are only narrowed ones, for the check, and outward it gives the types of `spec` and the temporary field `canvas.tools`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.42 v0.4.1`, read 2026-11-01). Between the tags are v0.2.43–v0.2.46, the line 0.3 (v0.3.0–v0.3.4) and the line 0.4 (v0.4.0, v0.4.1), and fourteen new decisions in `spec`'s log:
  - **the answers to В42–В49** were recorded, all by the recommendations of `canvas`. What went where, Д41 in RUN.md of `spec` names:
    - В42 and В46 — `spec`'s decision on UI packages as web components, whose members are the agreement of `canvas` and `app`;
    - В43 — `spec`'s cards of `app` and `canvas` and the format's text;
    - В44 — an addition to О-24;
    - В45 — `spec`'s decision on a place on the canvas in fractions of the crop, and the epic E3 in RUN.md of `spec`;
    - В47 — the eval protocol of the same epic;
    - В48 — `spec`'s card of `canvas`, its glossary and the format's text;
    - В49 — «Вход» of `spec`'s task on a workbook's page in its RUN.md: its planning will decide the rule.

    The part of В42 on how `app` gets the manifest was decided by a task there. `api` gives the manifest's open view by the package digest of the attempt, once per package, and `app` caches it and gives it to the element through the property `manifest`. The element is ready for this: it reads the same object again;
  - **the format is version 0.1, not a draft.** It came out with v0.3.0, and code takes the format from the signed release file `format-0.1.tar.gz`, not from the submodule. Any change to the format is now version 0.2 in a new line of `spec`. `module_format_version` is still `"0.1"`, and the element's check of the manifest takes it;
  - **TypeScript types** — the npm package `@altnovatrail/spec`: declarations only, flat, like the Go types, with `exports` `./formatv0` and `./formatv0/open`, under Apache-2.0. A release of `spec` from the line 0.4 carries it as the file `altnovatrail-spec-<version>.tgz`, with a signature and an attestation. `canvas` takes it in `dependencies` at an exact version, the same as the submodule's tag, moves them together and excludes the package from Dependabot's `npm` (Д46 and Д49 in RUN.md of `spec`). The types of the element itself — events, `exportWork()`, `filled`, marks — `spec` has not released at this tag: it releases them later, and a later move takes them;
  - **task templates** — the closed field `template`. `app` and the element get the open view of an instance: numbers in place of the placeholders, without `template`. The instances of one template share one ID (Д42 there), and the element keeps nothing by a task's ID: it compares the author's template by content (`sameTemplate`). Only `module-kit` runs the templates' solvers;
  - **the size of the statement's image** is an integer no greater than 2^53 − 1 (`common.schema.json`). The element's check already knew this: `whole` takes no integers beyond `Number.MAX_SAFE_INTEGER`;
  - **the module package and the index** — for the epic E5. The samples page's build takes the open views and the media from the packages of a release of `modules` through the CLI of `module-kit`. Before the build CI reads the withdrawal marks in the index of the newest release of `modules` and does not build a withdrawn version of a module, and a child sample session is run by the build of the latest release of `canvas`. So Т-30 is closed, by `spec`'s decision on the samples page (Д44 and Д45 in RUN.md of `spec`);
  - **the digit height without a manifest is 24 px with the format 0.2** (Д47 in RUN.md of `spec`). There is no format 0.2 at this tag: `spec` gives it in a later line, and a later move of `canvas` takes it. Until then the element without a manifest draws a digit at 32 px;
  - **`spec`'s glossary** — the term «шаблон задачи», task template: «не шаблон ступени и не шаблон автора на канве». In the documents of `canvas` "template" is the author's template and its layer, and the type `Template` in the code is it too;
  - `spec`'s decisions for `tutor` — on the reading of work and on hints — do not touch `canvas`. Who will run the reading model on the device, `app` or `canvas`, `spec` leaves for later;
  - the rest — the release files, the Go module and the checks of `spec` — does not concern `canvas`.
- **RULES.md** did not change between the tags. **The template** — one change, in CLAUDE.md: "The container is spec's: Node.js, Go and just". **The devcontainer** — Go 1.27.3 in the stage `toolchain`, with sums per architecture and `GOTOOLCHAIN=local`. Go comes with the Dockerfile into the copy of any repository, by `spec`'s template, so the move carries it over by hand, though the code of `canvas` takes no Go. The sums were checked against the list of go.dev 2026-11-01. The recipes `docs-check-repo` and `licenses-check-repo` in the `justfile` of `spec` are as before, and `_tools` now installs TypeScript 7.0.2 too.
- **What is changed here** — in one branch with the task that took the task's new fields, at the author's instruction:
  - `spec/` is at v0.4.1, commit 23000f3. `gh release verify v0.4.1 -R altnovatrail/spec` — "Release v0.4.1 verified!", and the release is the latest;
  - **the package of types** — `@altnovatrail/spec` 0.4.1 in `dependencies`:
    - the archive from npm is the same as the release file: the sha256 `5ea7321e…` matches;
    - at the move `gh release verify-asset v0.4.1 altnovatrail-spec-0.4.1.tgz -R altnovatrail/spec` — "Verification succeeded!". The archive is checked since then not once at the move but in CI, in the step `ci-licenses`, by `spec`'s recipe `release-verify-npm` on the lock file, against the release of its own version; the link of the package's version to the submodule's tag is still held by the move;
    - `integrity` in the lock file is the sha512 of this archive;
    - in `.github/dependabot.yml` the package is excluded from the updates of `npm`;
  - **types** (Д5; Д49 in RUN.md of `spec`):
    - `Task`, which the element takes through the property `task`, is the type `Task` from `@altnovatrail/spec/formatv0/open`, and its canvas is `Canvas` from there too with the temporary `tools` of the element's toolbar. `Manifest` is the type of `spec` whole. `app`'s task and manifest of these types go into the element as they are;
    - the narrowed types `SheetTask`, `WorkbookTask` and their parts stay our own: the check `taskOf` gives them, and the rest of the element reads by them. The types of `spec` are flat, and only the check tells the canvas kinds apart. The entry points no longer give them: outward go `Task`, `Canvas` and `Manifest`;
    - `src/core/task.check.ts` holds that a checked task is a task by the type of `spec`. If `spec` changes the form and the check does not, the type error will be here, not at the seam of `app` and the element;
    - the line of `interface.check.ts` "an item line on a sheet is a type error" went: flat types do not catch it, and only the check refuses;
    - the trial consumer gives a task and a manifest of the types of `spec`, like `app`;
  - Go in `.devcontainer/Dockerfile`, Go in CLAUDE.md; the tag is in README.md, CLAUDE.md and at the top of RUN.md;
  - RUN.md: table 3 — В42–В49 closed, В51 opened; table 4 — Д4–Д6 checked, Д5 narrowed; the body of the task of the worked example's type — the lesson's types from the package, and for E7 — «Нужно» and the risks;
  - [architecture.md](architecture.md): the status, the purpose and bounds, what is still to decide on the task's fields and the demo, the layers, the docking with `app`, the publication, the code and tools and the sources;
  - the entries on the first code, on the task's check and on the move to v0.2.42.

  The entries of the history name the rows as they were.

— *Why now:* the author's instruction — to do the task that takes the task's new fields and, in the same branch, move to the new `spec`. v0.4.1 is the latest release of `spec` on 2026-11-01 (`gh release list -R altnovatrail/spec`). The types are in the move, not in a separate task: the author's answer, not by the recommendation. Д49 in RUN.md of `spec` indeed names, for `canvas`, «своей задачей перехода на тег линии 0.4».

— *Rejected:*
- **the types as a separate task after the move** — the executor's recommendation: the decisions on the narrowed types would go through plan mode. The author took the types into the move;
- **flat types inside the element too**: each place where the element reads an item of a sheet or a line of a workbook would narrow the type itself, by a field — `slot.zone !== undefined` —, though the check has already told the kind;
- **narrowed types in the entry points further on**: a consumer would take the task types of `canvas` instead of the types of `spec`, and the seam with `app` would again rest on copies (Д49 in RUN.md of `spec`);
- **`peerDependencies`** — `spec`'s decision on the TypeScript types has a package take them as a copy of its own by exact version;
- **not carrying Go over**: the changes of the container of `spec` come here by hand, and `spec`'s template carries Go into the copy of any repository;
- **v0.4.0** — its version in npm has no provenance, and v0.4.1 came out before the move.

— *Revisit:*
- with a minor version of the format with a field of tools — `canvas.tools`;
- the copies of the format examples in the tests — by reading the release file `format-0.1.tar.gz`, if the copies become dearer.

— *Consequence:*
- **the task that takes the task's new fields** — the copies of the format examples in the tests at v0.4.1, in the entry on the task's check;
- **the task of the worked example's type** — the types of the lesson, the segment, the worked example and the demo's part from the package of `spec`, and our own only narrowed ones, for the check;
- **E5** — the samples page's build from the packages of `modules` and without withdrawn versions;
- **Д5** is narrowed: our own are only the check's narrowed types, `canvas.tools` and the copies of the examples. **В51** — «в реестр spec»: `spec`'s card of `canvas` still says that `canvas` has temporary types of its own;
- the entries on the first code, on the task's check and on the move to v0.2.42;
- RUN.md, tables 1, 3 and 4 — this move and the task it shares a branch with;
- [architecture.md](architecture.md) — the status, the purpose and bounds, what is still to decide on the task's fields and the demo, the layers, the docking with `app`, the publication, the code and tools and the sources;
- README.md and CLAUDE.md — the tag; `.devcontainer/Dockerfile` — Go;
- `.github/dependabot.yml` and `package.json` — the package of `spec`'s types;
- `src/core/` and `src/element/` — the types of `spec` outward and the narrowed types of the check.

## E7. The new `spec`: the task's fields and the example's demo

**R42. On a sheet `filled` for a slot `anywhere` or `sheet` is `[[has a stroke]]`, otherwise `null`. The element takes a lesson's worked example through the property `workedExample`, and then it is not a task: the learner does not write, its canvas takes no pointer, and the demo's parts are opened by the element's Next and Demo, in a row of glass at the band's bottom with the slot `actions` after them. For `app` there are the property `demoState` and the event `demochange`. The demo's paragraphs and pictures stand above the sheet, under the statement, a picture on an area of the sheet on the demo layer, and a polite region `status` announces the opened part.**
- **`filled` on a sheet:**
  - for a slot `anywhere` or `sheet`, `[[true]]` if the sheet has a stroke that `exportWork()` would take, otherwise `[[false]]`. "Has a stroke" is the bar's «Очистить» enabled: the stroke under the pen does not count yet, and a stroke under the eraser before lift-off still does, as for a workbook's filled box;
  - a sheet with only `choice` slots, a sheet without a task and a worked example are `null`: the element has nothing to say, and only `app` sees the choice of an option. The format gives no mixed task — a slot `anywhere` or `sheet` is the only one of its task — and the element's check rejects a slot in a zone on a sheet, so the type is `readonly (readonly boolean[])[] | null`, one for both canvas kinds;
  - it changes as on a workbook: an action changes it before `historychange`, an assignment of `task` or `history` without an event, and it is the same frozen array until it changes;
  - `app` reads the exit condition `answer_slots_filled` by the slot's binding: for `choice` its own choice of an option, for the others `filled[item − 1][slot − 1]`.
- **The example** is the open view of the segment `worked_example`, spec's type `WorkedExample` from the package `@altnovatrail/spec`: its statement, its canvas — a sheet with a grid, or a workbook with the example's lines — and the demo's parts — a paragraph, a picture beside the sheet with its size, a picture on an area of the sheet, which has no size of its own, and on a workbook a box it fills. `exampleOf` (`src/core/example.ts`) checks it as strictly as a task is checked, each field named by its path from `workedExample`, with the format's rules `lesson.areas` (an area lies on the page, 1000 × 1400), `lesson.example-fills` and `lesson.workbook-page`; `tools` on its canvas is a `TypeError`. `sameExample` is equality by content, the default grid filled in.
- **A task or an example, not both.** An example while `task` or a task from paper (`paper`) is shown, while the history is not empty, or while a stroke or an erasing is under way is a `TypeError`, checked before its shape; so are a task and a task from paper while an example is shown. `undefined` removes each property's own alone. An equal example changes nothing; another one replaces it and returns the demo to its start, with no event. Whatever the hands held when the example came — a palm, two scrolling fingers — goes, and captured pointers run to their lift doing nothing. One lesson segment is one element: `app` gives each its own, as it gives each task, for the element has no reset.
- **Example mode:**
  - `task` is `undefined`; `history` is empty, a non-empty one is a `TypeError`, and there is no `historychange`; assigning marks is a `TypeError` (nothing to mark), `undefined` may be assigned and they read `undefined`; `exportWork()` gives `null` and `filled` is `null`; `undo()` and `clear()` do nothing;
  - `tool` is `"pen"`, the template's tools are the pen alone, and `"eraser"` and `"hand"` are a `TypeError`, the hand being a tool of a sheet the learner writes on; there is no `toolchange`;
  - `manifest` is checked as always and gives the language of the statement and the parts; `media` gives every picture of the example;
  - **the canvas takes no pointer:** the CSS rule `.sheet.example canvas { pointer-events: none; touch-action: auto; }` — on the sheet's class, not the element's style, so that without the class the canvas inherits the consumer's `none` again, by which it keeps writing off during a check. A press reaches the stage: a finger or a pen scrolls the container or the page by native scrolling and a pinch zooms the page, as over the statement; nothing in the element zooms the sheet. The sheet neither turns the page's pen mode on nor off. The stage bans the context menu and selection, so a long press or a right click opens no menu over the sheet, and `#down` ignores an event a script sends the canvas;
  - **the sheet is the task's page alone**, 1000 × 1400 units fitted to the width: nothing past it to scroll across (`#reach` returns `SHEET`, where a sheet the learner writes on goes past the page). On a workbook the example's lines stand on it in the task's layout with empty boxes, and an opened `fill` writes its value in its box;
  - **no bar**: the vertical bar of glass of the interface mockup is hidden, for it holds only the tools of writing. The scroll container, while it scrolls, is the keyboard's region named by the canvas kind, «Пример», "Worked example".
- **The row:** Next («Дальше», an arrow forward) and Demo («Показ», a disclosure button with `aria-expanded`, its icon an arrow down while the demo is shown and along the row while hidden; APG, Disclosure), both mirrored in right to left, stand in a row of the bar's glass at the bottom of the band, in its middle, each with its label beside its icon and each a stop of Tab of its own, no arrow keys between them; after a line, shown only while something is slotted, the named slot `actions`, where `app` puts its «Continue», as the mockup has one row. Next opens the next part; Demo hides and shows the whole demo. A row narrower than its buttons scrolls across inside its glass, and focus brings a button wholly into it. A removed example hands the focus from Next or Demo to the pen's button.
- **`demoState`** is a frozen `{ opened, hidden }`, spec's `DemoState`: `opened` how many parts are open, from the first, 0 to all; `hidden` whether the whole demo is hidden. It starts `{ opened: 0, hidden: false }` (`DEMO_START`, one object for all elements): the learner opens each part themself. Without an example it is `undefined`: assigning a state is then a `TypeError`, before its shape is checked, and `undefined` changes nothing. A state is an object of `opened`, a whole number from 0 to the number of parts, and `hidden`, `true` or `false`, else a `TypeError` that names the field (`demoStateOf`); it is copied and frozen, and one equal by content leaves the same object. Parts do not close one at a time for the learner; `app` may give fewer.
- **`demochange`** is a `CustomEvent` with the same `detail`, bubbling and `composed`, only when the learner changed the state with Next or Demo. Assigning `demoState` gives no event, announces nothing and scrolls nothing, as `tool` and `toolchange`. `app` keeps the state on the device and gives it back, and may lead the parts itself.
- **Next** is `aria-disabled` while the demo is hidden or all its parts are open, and keeps the focus, as the bar's buttons do. A press opens the part, lays the list out at once — so the sheet's new place is set before the container's scroll is heard and `ResizeObserver` does not bring the scroll back, and a sheet scrolled into sight stays where it was —, brings the part into sight, tells the region, and sends `demochange`. Demo changes `hidden` alone: the open parts stay, out of sight, a sheet in sight stays where it was, and nothing scrolls.
- **Into sight:** one target — for a picture on an area its area, for the other parts their list item —, by `scrollIntoView({ block: "nearest", behavior: "instant" })`, with a `scroll-margin-bottom` of the row's height and 32 px, so that what comes from below stops 16 px above the row. Then, while the consumer's band (`--novatrail-canvas-top`) covers its top, the scroller of the chain scrolls back by the cover, a scroller at its start handing the rest to the next, and each again only while its step leaves less covered than the last. A scroll margin at the top would hold for every scroller of the chain alike — the container and the page —, while the band stands over the top of what the rail sticks in and the scrollers within it, not over the page when the rail sticks in a scroller of its own. An area taller than what is in sight comes by its top: from below `nearest` places it so, and from above the band's loop brings its top back. The target of an area is the spot, a box of the area in the sheet's own flow, in shares of the page, with `visibility: hidden` — so it paints nothing and takes no pointer from the stage —, not the picture on the sticky stage, which moves only at the next frame; `clear()` takes the spot's place off.
- **Paragraphs and pictures beside the sheet** — above the sheet, under the statement: a numbered list of the open parts in the statement's column and scrolling, as wide as the page and at its left. A paragraph is its text, never markup: a module is data, not code; a picture beside the sheet is a frame of its own size, as in the statement, showing its description until its file is decoded, standing in its item's line from its top, so the item's number stays at the top.
- **Pictures on areas** stand on the demo layer, an SVG with the `viewBox` of the other layers, in the frame of the ink, in which every layer moves: an `<image>` at the area's `x`, `y`, `width` and `height`, stretched over it, `preserveAspectRatio="none"` — its corners at the area's (SVG 2), as the format bids a picture "at the size of its area" —, later parts on top by document order, placed by `placeOver` as a workbook's box is. Until its file is decoded the sheet is empty there and the description is in the item. A hidden demo is `display="none"` on the layer's group, which SVG has no `hidden` for. In forced colours a picture keeps its file's colours (CSS Color Adjust changes properties only).
- **Loading** is the element's one `Pictures` (`src/element/pictures.ts`): it asks for all the example's pictures when the example comes — the statement's and every part's —, holds each file and URL while the example names it, and decodes the URL before showing, so a part Next opens shows its picture in the same press; a hidden demo or a smaller `opened` asks for nothing again. The references are named at one place, the template's change: a file both the old and the new name stays, the gone ones go with their frames, and a loading under way goes to its reference only if named again. Chromium shows a new `<img>` or `<image>` with a decoded URL in the nearest frame (the HTML Standard's list of available images); where a browser does not, the frame shows the description until it decodes.
- **Accessibility:**
  - the reading order is the row — Next, Demo, the slot `actions` —, the statement, the list of parts. Unopened parts are not in the DOM; a hidden demo is the attribute `hidden` on the list, its parts and their pictures kept;
  - a picture on an area is read in its item: a `role="img"` inside the item with its description, the item keeping its own role; a decorative one is an empty item, and a decorative picture beside the sheet an unnamed frame. The demo layer is `aria-hidden`, as the marks' layer names its frames in words;
  - an opened part is announced by a polite region `role="status"`, empty in the shadow root from the start, out of sight but not hidden (a hidden region announces nothing): «Часть 2 из 4.» or "Part 2 of 4." in the labels' language, marked with its `lang`, then the part's text, the picture's description or the filled box in the manifest's language, with no `lang` of its own without a manifest; for a decorative picture the number alone. The region empties on an assigned state, on Demo, and on a new or removed example, so the same words can be announced again. Focus stays on Next, so the next press opens the next part. Next points to the region by `aria-controls` and Demo to the list (WAI-ARIA 1.2, `status`, `aria-expanded`);
  - the buttons are 44 × 44 targets, `aria-disabled` keeps the focus, system colours in forced colours, as on the bar; the level is WCAG 2.2 AA, the platform's one standard of accessibility for UI packages.
- **For `app`:** React assigns properties in JSX order, so `app` writes `workedExample` before `demoState`, as `history` before `marks`, listens to `ondemochange`, and gives back the state `demochange` told or none at all — a new literal on every render would return the demo to its start. It gives each segment a new element, in React by a new `key`, and imports the entry point before the first render, or React writes an attribute. React assigns `undefined` to a removed property, so `null` comes only if the consumer writes it.

— *Why:* the author's answers, each as recommended; sources 9.14, 9.15 and 9.16.
- `filled` on a sheet as `[[has a stroke]]`: the platform has `app` read the exit condition from the canvas's `filled`, `app` reads one type for both canvas kinds with one piece of code, and a stroke counts by the rule of a workbook's filled box.
- The element opens the parts and `app` knows and sets the state: the format lets the learner open and hide, and the example is tried without `app`'s player, on the demo page and in the test consumer. A property and an event are the contract of `tool` and `toolchange`.
- Above the sheet, where the statement stands, one column at any width: the sheet shifts when a part opens, but nobody writes on it.
- The canvas taking no pointer, not filtering events: the browser's own scrolling and pinch over the sheet, as over the statement, with nothing to write.
- Next and Demo in one row with `app`'s «Continue», as the mockup draws it; no bar, for nothing on it would serve a sheet nobody writes on. The label Demo is the glossary's term demo, «показ автора»; «из 4» tells how many are left.
- All pictures at once: an opened part shows its picture in the same press, at the price of the files of parts the learner will not open, within one example.
- Stretched over the area: where the drawing falls on the sheet's cells does not depend on the file; the price is distortion where the author did not give the area the picture's proportions, as the format bids. The later part on top: what was just opened is seen whole.

— *Rejected:*
- **`filled` per slot with `null` for a `choice`** — the type would change for a form the format does not allow; **`false` for a `choice`** — it says "empty" of what the element does not see; **`app` folding the `replay` history itself** — not the element the condition asks, and `app` would repeat the eraser's rule up to the lift;
- **the example through `task`** — the types and the check's errors would mix, and `app` would sort out what came; **an element of its own** — a second tag and a second copy of the buttons;
- **the names `example`, `demo`, `hidden`** — in `spec` "examples" are the format's example files; `demo` is `workedExample.demo` and the demo page's folder; `hidden` is an HTML attribute that would hide the element;
- **`touch-action: pan-y` on the canvas** — the events would come, each handler would filter them, and a pinch over the sheet would not zoom;
- **an event on an assignment of `demoState`** — `app` would hear its own action; **the element keeping a state given before the example to check later** — the error would surface away from where it was made;
- **closing parts one at a time** — the format opens them one at a time and hides the whole demo; **a Next that also shows a hidden demo** — two changes by one press, undoing the learner's choice to hide;
- **a number without the total** — the learner would learn of the end only by a paler Next; **Demo filled like the chosen tool** — it reads as a toggle and draws the eye from Next; **a line «Показ спрятан» in place of the list** — it repeats the icon;
- **the parts beside the sheet on a wide screen** — two layouts, and above the sheet on a narrow tablet all the same;
- **focus on the opened part** — it breaks repeated presses of Next and leads out of the row; **`aria-live="assertive"`** — a part does not call for interrupting the learner (WAI-ARIA 1.2, `status`);
- **loading a picture when its part opens** — each part would first show its description, perhaps for seconds over the network, and fewer `opened` from `app` would drop files to ask for again; **the files at once, the URL and decoding on showing** — a frame or two of description on every Next, and `SVGImageElement` has no `decode()` in SVG 2;
- **the demo layer as an HTML block with a matrix** — a second way of shifting beside `viewBox`, where every layer moves in the frame of the ink; **fitting the picture, `xMidYMid meet`** — the drawing slides off the cells the author set it on; **the earlier part on top** — a new part would go under the old, and Next might show nothing;
- **scrolling to the picture on the stage** — it stands at its old place until the next frame;
- **Next and Demo on a bar with «Continue» in a row of its own** — two rows where the mockup has one; **Next and Demo drawn by `app`** — the demo's accessibility would move to `app`.

— *Revisit:*
- Next and Demo made ones that can be switched off, if `app`'s lesson player wants one Next for parts and segments alike;
- `filled` for a slot in a zone — with the epic of zones, while the element's check rejects a zone on a sheet;
- a learner's writing on an example's sheet, and a demo above a lesson's task — with the format's minor versions;
- on devices (Д7 in [run/DEBT.md](../run/DEBT.md)): VoiceOver on the `status` region in a shadow root and on the hidden demo layer; scrolling and pinch over the example's sheet by finger and pen on iPad; the sheet's place in an element without a height as the list grows; a picture in the same press, the frame's fallback and a picture on an area by a `blob:` URL in Safari; the scroll to the `visibility: hidden` spot.

— *Consequence:*
- `src/core/example.ts` — the example's types, its check `exampleOf`, `sameExample`, `DEMO_START` and `demoStateOf`;
- `src/element/index.ts` — `filled` on a sheet, the properties `workedExample` and `demoState`, the event `demochange`, the example mode and the spot of an area;
- `src/element/parts.ts` — the list of the open parts, the demo layer and the region `status`; `src/element/pictures.ts` — the loading of the example's pictures; `src/element/tools.ts` — the row of Next and Demo and the slot `actions`;
- [architecture.md](architecture.md) — the task's fields, the filled slots and the example's demo, the layers, the docking with `app`, and accessibility.

**R43. The test coverage of `canvas` goes to Codecov from `.github`'s TypeScript wrapper. `ci-test` writes it, by the flag `--coverage`, as one lcov report, `coverage/lcov.info`, with the v8 provider over all three Vitest projects, in Node and Chromium; `ci-engines`, WebKit and Firefox, writes none. The report holds only the package's code — every module of `src/` but the tests, fixtures and type checks, and also one that no test loads, with zeros. The references to `.github`'s shared workflows are at v0.1.30, and a merge is held by `codecov/patch`, at least 90 % of the changed lines, which stands in the ruleset of `main`.**
- **The contract** — `.github`'s contract of the wrapper's coverage: the report is exactly `coverage/lcov.info`; a module without tests is in the report with zeros, through `coverage.include`; Vitest cleans `coverage/` itself; the caller has no artifact `typescript-coverage` of its own; its job gives `contents: read` and `id-token: write`; `.github/codecov.yml` follows `.github`'s template: patch 90 %, project only for information, a comment only when the coverage changes. The wrapper's job `coverage` waits for every check, `engines` too.
- **The provider** — `@vitest/coverage-v8` 5.0.5 under MIT, in `devDependencies`: the version of Vitest itself, out on 2026-10-15, more than three days before installation, the pause the entry on the first code sets for npm packages. With it 11 packages came into the lock file, all `dev` and under MIT, and `ci-licenses` passes without a new exception. Dependabot keeps it in the group `vitest`.
- **The scope** — `coverage.include` is `src/**/*.ts`, and `coverage.exclude` is `*.test.ts`, `*.fixture.ts` and `*.check.ts`: on 2026-11-01 that is 36 modules. The report is `lcovonly`, and `text-summary` prints the total into the run's log. The element's modules run three times — in Chromium at density 1 and 2 and in forced colors —, and those of the DOM-free part in Node as well, and V8 adds up their hits into one line of the report. A line's coverage — whether it is covered or not — does not change by this; only the number of hits grows.
- **Where it is on** — only in `ci-test`, by the flag: `vitest` in development writes no report, and `just ci` writes it, as CI does. `ci-engines` runs the tests in WebKit and Firefox and writes no report: V8 counts nothing there, so the report covers the same lines as without them.
- **The permissions** — the job "TypeScript" in `ci.yml` has `contents: read` and `id-token: write`: the wrapper's nested job `coverage` gets no more than the caller gives, and without the permission the run does not start at all.
- **The references** — all seven, to the shared workflows, `release.yml` with them — are at v0.1.30, the one release of `.github` the entry on the first code keeps them on; the contract of the report and the permissions are the same at it (sources 6.13).

— *Why:* where the coverage goes to Codecov, a merge waits for `codecov/patch`, by the shared rules and `spec`'s decision on the README's badges. `.github`'s TypeScript wrapper uploads the report since v0.1.12. The report, the permissions and `codecov.yml` go before the raise of the references or together with it: a raise without them is red, one's own or Dependabot's. V8 counts the coverage itself, without instrumenting, and the tests of the report run in Node and in Chromium, where it works. The package's code is what goes out to npm and what `app` takes.

— *Rejected:*
- istanbul — it instruments the sources before the run, and the tests are slower, while the timed tests — a workbook's crops, a statement's pictures — are at the limit of a CI runner already;
- `scripts/` and `demo/` in the report — `scripts/package.ts` checks the package after the tests, and `demo/` is a page for trying by hand: both would stand with zeros, and their edits would require 90 % coverage of the new lines;
- coverage always, by the setting `coverage.enabled` — `vitest` in development would write a report on every run;
- the reporter `lcov` — it also writes HTML pages, which the wrapper does not take.

— *Revisit:* if code that only the tests in WebKit or Firefox reach has to count in the report: the v8 provider does not work there.

— *Consequence:*
- `codecov/patch` stands in the ruleset of `main`, with `integration_id` 254 — Codecov, a step of the author's: a merge of a pull request with code waits for it, and on a pull request that edits no code it comes as "Coverage not affected";
- the coverage badge in the README, which `spec`'s list of repositories names, comes with the first upload on `main` (Д6);
- every pull request with code covers at least 90 % of the changed lines with tests;
- `package.json`, `package-lock.json`, `vitest.config.ts`, `justfile`, `.gitignore`, `.github/codecov.yml`, `.github/workflows/ci.yml`, `codeql.yml`, `scorecard.yml`, `release.yml`; the entry on the first code; [architecture.md](architecture.md) — the publication and release, the code and tools and the sources.

## `spec` tag v0.6.2

**R44. `canvas` is on `spec` v0.6.2: the submodule `spec/` and the package `@altnovatrail/spec` are at this tag, and the package 0.6.2 is taken without the pause of three days for npm packages, since its version is set by the tag. `ci-licenses` checks every package of `@altnovatrail` in the lock file by `spec`'s recipe `release-verify-npm`, on every pull request and on `main`: so `canvas` carries out the signature rule of RULES.md. `spec` recorded the rows «в реестр spec» В51–В55, all as `canvas` recommended, and no rows are left in table 3 of RUN.md. The format 0.2 in the element and the element's types from `spec` are taken by tasks of their own.**
- **What the tag brings `canvas`** (`git -C spec diff v0.4.1 v0.6.2`, read 2026-11-02). Between the tags lie the line 0.5 (v0.5.0–v0.5.8) and the line 0.6 (v0.6.0–v0.6.2), and in `spec`'s log four new decisions and changes to nineteen of its entries:
  - **the answers to В51–В55** were recorded on 2026-11-01, all as `canvas` recommended. What went where:
    - В51 — `spec`'s card of `canvas`: `canvas`'s types of the task and of the manifest come from the `spec` package, and its own are the narrowed types of the check and `canvas.tools`. The rows of `spec`'s plan it answered are marked done too;
    - В52 — `spec`'s decision on UI packages as web components and its card of `app`: `filled` on a sheet, and `app` reads the exit condition `answer_slots_filled` by the slot binding;
    - В53 — the same decision: the property `workedExample` and the example's mode;
    - В54 — the same decision, and `spec`'s cards of `app` and `canvas`: the demo's buttons are the element's, and `demoState` and `demochange` are for `app`;
    - В55 — `spec`'s decision on the task file, the format's text in `spec/format/README.md` and `spec`'s card of `module-kit`: a module's picture SHOULD have an opaque light background, and `module-kit` warns of a transparent one but does not refuse it.

    `canvas` has already decided and built all this, in the entry on the task's fields and the example's demo, and the move does not touch the code;
  - **the element's types** — `@altnovatrail/spec/canvas` since the line 0.5, written by hand, by `spec`'s decision on the element's types. They hold `CanvasElement` and its events in `CanvasEventMap`, the writing history, the work and the context of a submission, `Filling`, `CellPlace`, `Filled` and `Tool`, and with the answers to В53 and В54 also `workedExample`, `demoState`, `DemoState`, `DemoChangeEvent` and `demochange`. They hold no marks until the contract of epic E3, and the element in `HTMLElementTagNameMap` and its events in `GlobalEventHandlersEventMap` are set by the `canvas` package. That decision does not name `media`, `undo()` and `clear()`: if they are a contract with `app`, a row «в реестр spec» brings them. A task of its own takes these types;
  - **the signature rule** is `spec`'s decision on the signatures of release files, carried out by its recipes `release-verify` and `release-verify-npm`. RULES.md has a new hard rule, "Release files are verified": a file of a NovaTrail release enters code or CI only once `release-verify` has accepted it, and a package of `@altnovatrail` from npm once `release-verify-npm` has accepted the lock file in CI of the pull request that changes it. From then on the file is held by the digest the check pinned, and nobody checks its signature again. Т-27 is closed. For `canvas` the rule stands in three places:
    - the npm packages in its lock file — here, in `ci-licenses`;
    - the CLI of `module-kit` and the release of `modules` in the CI of the samples page — from E5;
    - its own files are checked by its consumers: `app` the package from npm, `tutor`'s CI the archive of the synthetic samples. The recipe accepts them if they were signed by `.github`'s shared `release.yml` no lower than v0.1.7 — `canvas` has it at v0.1.12 — on a call from `canvas`'s `release.yml` on `main`, at the tag's commit. The condition of the check is immutable releases and a ruleset of the tags `v*` at `canvas`: that is a step of the author's, before the first release.

    By `spec`'s decision on publishing UI packages to npm, the version in npm is tied to the release by the signature of the file itself, and `SHA256SUMS` is not needed for that, but stays a file of `canvas`'s release, by the entry on the release. By `spec`'s decision on the TypeScript types, the archive of the `spec` package is checked by the recipe, not by `gh release verify-asset`;
  - **the format 0.2** — since v0.6.0, by `spec`'s decision on the format's versions. It has one change: without `canvas.digit_height` a digit on the crop is 24 px, not 32. The second version's vectors pin that a 0.2 reader rejects a 0.1 module — the case `previous-minor` of the rule `manifest.format-version` —, and that the build takes a past index of another version — the vector `earlier-format-version`. The examples of tasks and lessons did not change, and in the examples and vectors of the manifest, the inventory, the index and the packages the version and the digests did. The format's README has two more texts without a rule: a SHOULD about a picture's background (В55) and a guide for authors on a workbook's page (В49). The types `formatv0` and `formatv0/open` changed only in comments. The format 0.2 in the element is a task of its own;
  - **a workbook's page** — `spec`'s decision on the task file, the answer to В49: the rule will enter the format with the 0.y version that the modules' requests bring after their first content, by a task of `spec`'s plan put off into its epic E6, and 0.2 has only a guide. What this means for the layout's numbers is in the entry on the layout of a workbook's page;
  - **the cross-repository plan** — COORDINATION.md at the root of `spec`, by `spec`'s decision on coordinating the other repositories' work. By `spec`'s order of the repositories, `canvas` and `tutor` go side by side, before items 3 and 4 of that order. Row 5.3 of COORDINATION.md is `canvas`'s move to the line 0.6, this entry, and 5.5 is the first release of `@altnovatrail/canvas` to npm: «решает `canvas`, где ему быть», and at `canvas` that is the release task of E8, as the entry on the task's fields and the example's demo names. The epic of `app`'s code, row 6.6, waits for row 5.5. `spec`'s coordinator keeps the rows of the other repositories by their RUN.md, and `canvas` edits nothing in the file;
  - the rest does not concern `canvas`: the path of assessment by a rubric, the coverage of `spec`'s Go in Codecov, the templates of issues and pull requests in `.github` — a repository sets up no templates of its own, by `spec`'s decision on the community files, and `canvas` has none —, and the illustrations of `spec`'s glossary, `docs/concepts.md`.
- **RULES.md** — the new hard rule on the signature, and COORDINATION.md in Russian. The **devcontainer** and the **template** did not change: `git -C spec diff --stat v0.4.1 v0.6.2 -- .devcontainer repo-template` is empty. The recipes `licenses-check-repo` and `docs-check-repo` are as before, and `_tools` also installs the Sigstore packages for `release-verify` — `@sigstore/verify` 4.1.2 and its neighbors, under Apache-2.0 and MIT.
- **What is changed here:**
  - `spec/` — at v0.6.2, commit 49d0fb6: that is `spec`'s last release and its `main`. `gh release verify v0.6.2 -R altnovatrail/spec` — "Release v0.6.2 verified!";
  - **the package** `@altnovatrail/spec` 0.6.2 in `dependencies`, installed by `npm install --save-exact`, and the lock file changed only in its entry. It came out in npm on 2026-11-01 at 23:55Z, less than three days before installation — an exception to the pause, which the entry on the first code names. The archive from the registry is the same as the release file: the sha256 `95e4e7c2…` matches. `just -f spec/justfile release-verify-npm package-lock.json` — "spec v0.6.2, signed by spec's release.yml, and its integrity is the verified bytes'". The code did not change: `just ci` on the package 0.6.2 is green;
  - **`ci-licenses`** calls `release-verify-npm package-lock.json` after `licenses-check-repo`. The licenses job of the TypeScript wrapper already takes the submodule `spec` and goes to the network, and runs the container as the runner's user with `HOME=/tmp`: `_tools` installs `spec/tools` into the checkout's submodule, as for `docs-check-repo`. The check runs on every pull request and on `main` inside "TypeScript / licenses", which the ruleset of `main` already requires: there is no new required check and no step of the author's. A lock file without packages of `@altnovatrail` the recipe accepts without going either to Sigstore or to GitHub, but before the check its `_tools` installs `spec/tools` from the registry, if they are not there yet: in CI, on every run, 233 packages, ≈ 270 MB;
  - the comments of `justfile`, `ci.yml` and `.github/dependabot.yml`; the tag in README.md, CLAUDE.md and at the start of RUN.md;
  - RUN.md: table 3 — В51–В55 closed; table 4 — Д4–Д6 checked; the bodies of E8's tasks, the introduction, «Нужно» and the risks of E8;
  - [architecture.md](architecture.md): the status, the purpose and bounds, what is still to decide on the task's fields and the demo, the docking with the app, the publication and release, the sample file, the code and tools, the workbook, the task's fields and the worked example, and the sources;
  - the entries on the release, on the first code, on the layout of a workbook's page, on the move to v0.4.1 and on the task's fields and the example's demo.

  The entries of the history name the rows as they were.
- **What the move does not do:**
  - the format 0.2 in the element — `FORMAT` in `src/core/manifest.ts`, 24 px without a manifest and the copies of the examples in the tests — is a task of its own. Until it, the package's types speak of the format 0.2, while the check of the manifest takes only 0.1, and the copies in the tests are of the tag v0.4.1. There is no release between the move and that task: the first release comes after it and the task of the element's types, so no consumer will see such a `canvas`;
  - the element's types from `@altnovatrail/spec/canvas` — a task of its own;
  - the check of the CLI of `module-kit` and of the release of `modules` in the CI of the samples page — E5.

— *Why now:* the line 0.6 of `spec` came out on 2026-11-01, and the cross-repository plan puts the move as the first task of `canvas`'s course, before the first release. v0.6.2 is `spec`'s last release and its `main` on 2026-11-02 (`gh release list -R altnovatrail/spec`).

— *Rejected:*
- **a job of its own in `ci.yml`, only in a pull request that changes the lock file:** a checkout with `fetch-depth: 2`, `git diff HEAD^1`, its own build of the stage `toolchain` and a skip that GitHub counts as a success. It is more exact by `spec`'s decision on signatures, but it is `canvas`'s first job outside `.github`'s shared CI files, which `.github` itself decides, with its own copy of how the wrapper calls the recipe, and one more required check in the ruleset. The price of the chosen way is ≈ 10–20 s per run, and a failure of Sigstore, the registry or GitHub holds up any pull request and CI on `main`, and with it the release;
- **a check in `.github`'s wrapper:** `typescript.yml` has no inputs, and what the recipes check the repository decides — "What the checks do is the repository's";
- **waiting for the pause of three days** — until 2026-11-05: no version 0.6.x is three days old yet, and the pause adds nothing to the check of the signature;
- **v0.6.0 or v0.6.1:** their format is the same, and v0.6.1 and v0.6.2 edited only `spec`'s documents — COORDINATION.md, RUN.md and the glossary's illustrations.

— *Revisit:*
- if a failure of Sigstore starts holding up pull requests that do not change the lock file — a job of its own only for those that do;
- when `canvas` gets a second lock file — the samples page's in E5, for example: the same recipe checks it.

— *Consequence:*
- **the task of the format 0.2** — `FORMAT`, 24 px without a manifest and the copies of the examples by `git -C spec diff v0.4.1 v0.6.2 -- format/`, and its planning decides the fate of the manifest 0.1: the vector `previous-minor` says that a 0.2 reader rejects it;
- **the task of the element's types** — the types from `@altnovatrail/spec/canvas` with `workedExample`, `DemoState`, `DemoChangeEvent` and `demochange`, and the marks and `Media` stay canvas's own;
- **the first release** — the author checks its archive with the recipe `release-verify`, which is already there, and before it `canvas` must have immutable releases and a ruleset of the tags `v*`, by `spec`'s decision on signatures;
- **E5** — the CI of the samples page checks the CLI of `module-kit` and the release of `modules` with the recipe `release-verify` before the first run, by the same decision;
- the entries on the release, on the first code, on the layout of a workbook's page, on the move to v0.4.1 and on the task's fields and the example's demo.

## `spec` tag v0.6.5

**R45. `canvas` is on `spec` v0.6.5: the submodule `spec/` and the package `@altnovatrail/spec` are at this tag, and the package 0.6.5 is taken without the three-day pause on new versions, since the tag sets its version, as 0.6.2 was. `spec` recorded the rows «в реестр spec» В57 and В58, both as `canvas` recommended: `media` and its type `Media` are a contract with `app`, and the element takes them from `@altnovatrail/spec/canvas`, while `undo()` and `clear()` stay its own. The stage with the browser and the Biome extension came from the kind `typescript` of `spec`'s template, and the devcontainer is again the output of its recipe. The icons of the row's buttons, which `spec`'s decision on the icons of the UI packages bids `canvas` set by this move, are the entry on the icons of the element's buttons. The next epic is E5 (В59).**
- **What the tag brings `canvas`** (`git -C spec diff v0.6.2 v0.6.5`, read 2026-11-02). Between the tags lie v0.6.3–v0.6.5, and in `spec`'s log six new decisions and changes to eighteen of its decisions:
  - **the answers to В57 and В58**, both as `canvas` recommended; what went where is named by Д65 and Д72 in `spec`'s RUN.md:
    - В57 — since v0.6.3: the README of the npm package `@altnovatrail/spec`, `tools/types/npm/README.md`, teaches the recipe `release-verify-npm` in "Checking the archive", and calls `gh release verify-asset` a check of the attestation, a separate one;
    - В58 — since v0.6.4: the changes to `spec`'s decisions on UI packages as web components and on the types of the element. `media` and `Media` are in `CanvasElement` and in `@altnovatrail/spec/canvas`, and `undo()` and `clear()` are members of `canvas` outside the contract, and `tools/types/canvas.check.ts` holds that the contract does not know them. No new line of `spec` was needed;
  - **the icons** — `spec`'s decision on the icons of the UI packages and its table of which icon each button's value shows, since v0.6.3: one set, Material Symbols in the Rounded style, for all UI packages, the set's package in `canvas`'s `devDependencies`, embedded at build, with no requests at run time, and a line about the set in `NOTICE`. What `canvas` does by its move is named by Д61 in `spec`'s RUN.md: icons on the row's buttons, the embedding by a script on `@iconify/utils` with a check in CI, `NOTICE` in `files`, the triangle of «Показ» by icons of the table, and the icons, «значки», in "Rejected" of the entries on the sheet's toolbar and on the keyboard's way into the sheet to be revisited. That is the entry on the icons of the element's buttons;
  - **the template's kind `typescript`** — `spec`'s decision on the template's kind `typescript`, the answer to В4 `app`, since v0.6.3: the stage with the browser — the lines `canvas`'s container already had — and the extension `biomejs.biome` 3.8.1, with Biome as the default formatter. The comments of the stage `toolchain` are rewritten so that they hold in a copy of any kind (Д75 in `spec`'s RUN.md). Д63 there too bids `canvas` take the stage from the recipe by its move;
  - **the inbox** — `spec`'s decision on its inbox and the edit of the shared rules on work across repositories, since v0.6.4: `spec`'s session finds the rows «в реестр spec» itself, by the recipe `just inbox`, on `main` of each repository, and a row's question opens with the mark «В реестр spec» — the recipe does not tell the case apart. The author carries rows no more, and the template of RUN.md rewrote rule 2 so;
  - **the format** — the same version 0.2: in `format/` only the README changed: the exit of the last solving step, the hint ladder and the showing of the solution by `spec`'s decision on showing the solution, and when a skill graph is a chain. That does not concern the canvas. The schemas, examples and vectors are the same, so the copies in the tests (Д5) do not change;
  - **for E5:** the file name of a package of `modules` is derived from the index's entry, and the CI of the samples page finds the package by it too (`spec`'s decision on the module index; Д70 in `spec`'s RUN.md). The eval protocol — tasks of epic E3 there — has not come out yet;
  - **the contracts** — `spec`'s decision on its contracts, since v0.6.5: protobuf and buf in `spec`'s `contracts/`, and `spec` writes the mark's type in `@altnovatrail/spec/canvas` by hand and checks it against the contract's type. That is the basis of E9 in table 2 of RUN.md;
  - the rest does not concern `canvas`: the learner model on the server, the showing of the solution and the hint on request — that is `api`, `app` and `tutor`.
- **RULES.md** — the mark «В реестр spec» and the recipe `just inbox`. The **template** — the kind `typescript` and rule 2 of RUN.md. `spec`'s **devcontainer** changed only in comments.
- **What is changed here:**
  - `spec/` — at v0.6.5, commit 1a99391: `spec`'s last release and its `main`. `gh release verify v0.6.5 -R altnovatrail/spec` — "Release v0.6.5 verified!";
  - **the package** `@altnovatrail/spec` 0.6.5 in `dependencies`, installed by `npm install --save-exact`, and the lock file changed only in its entry. It came out in npm on 2026-11-02 at 05:45Z, less than three days before installation, which the entry on the first code allows for a version that `spec` sets. The archive from the registry is the same as the release file: the sha256 `57c399c0…` matches. `just -f spec/justfile release-verify-npm package-lock.json` — "spec v0.6.5, signed by spec's release.yml, and its integrity is the verified bytes'". The package's types between 0.6.2 and 0.6.5 changed in `Media` and `media`, and otherwise only in comments;
  - **`media`** — `Media` from `@altnovatrail/spec/canvas`: `src/element/pictures.ts` and the element's entry point give `spec`'s type, `interface.check.ts` checks it for identity and holds `media` through `CanvasElement`, and the test consumer gives `media` through `CanvasElement`, as `app` does (in the entry on the element's agreement with `app`);
  - **the devcontainer** — the output of the recipe `new-repo-draft canvas typescript 3.2 v0.6.5`, built in a temporary clone of `spec`, outside the repository: the Dockerfile and `devcontainer.json` match it byte for byte, but for the base image. `canvas`'s is `3.0.12` — Dependabot raises it —, and the template's `3.0.10`. The Biome extension is 3.8.1, and `host-network.sh` did not change (in the entry on the container);
  - `.github/dependabot.yml` — a comment on raising Playwright and the icon set;
  - RUN.md: rule 2 and «Как устроен план» by the template; table 3 — В57–В59 closed; table 4 — Д4–Д6; the archive of E8 and epic E5 (in the entry on the replanning of E2 for the MVP);
  - the tag in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status, the format of the samples by the eval protocol, the docking with the app, the publication and release, the samples page's steps, the code and tools, the task's fields and the worked example, and the sources;
  - the entries on the element's agreement with `app`, on the first code, on the container and on the replanning of E2 for the MVP.

  The entries of the history name the rows as they were.
- **The next epic is E5**, by В59: the move to `spec`'s last tag — option 1 — and E5 at once — option 2. E5's tasks are those of the samples page from E2's archive and a new probe on tablets (in the entry on the replanning of E2 for the MVP). There is no eval protocol yet, so E5 starts with probes and the build of the page.

— *Why now:* v0.6.5 is `spec`'s last release and its `main` on 2026-11-02 (`gh release list -R altnovatrail/spec`). It holds the answers to both of `canvas`'s rows and `spec`'s decision on the icons, which bids `canvas` set the icons by its move to the tag (Д61 in `spec`'s RUN.md). The icons are in this same task, by the author's answer in planning, against the recommendation: the executor proposed them as a task of their own, as E8 split its move into three tasks.

— *Rejected:*
- **the icons as a task of their own after the move** — the executor's recommendation, since a task larger than one review is proposed for a split; the author's answer is one branch;
- **v0.6.4** — the answers to both of `canvas`'s rows, the icons and the template's kind `typescript` are already in it, but v0.6.5 is the last release, and its decision on the contracts is the basis of E9;
- **the template's base image 3.0.10** — Dependabot would raise it again at once, and the line `FROM` is Dependabot's;
- **waiting for the three-day pause** — the pause adds nothing to the check of the signature, and the version is set by the tag, as for the move to v0.6.2.

— *Revisit:*
- if `canvas` needs a new `playwright` before the template — raise the image, the revision and the snapshot here, in the package's pull request, and ask the template for the same by a row «в реестр spec»;
- if `spec` raises them in the template — the next move brings them.

— *Consequence:*
- E5 is in table 1 of RUN.md, and E8 with this move's task in the archive [plan/E8.md](plan/E8.md) (in the entry on the replanning of E2 for the MVP);
- the entry on the icons of the element's buttons;
- the entries on the element's agreement with `app`, on the first code, on the container and on the replanning of E2 for the MVP.

— RUN.md, tables 1–4; this move's task in [plan/E8.md](plan/E8.md); [architecture.md](architecture.md), the status, the format of the samples by the eval protocol, the docking with the app, the publication and release, the samples page's steps, the code and tools, the task's fields and the worked example, and the sources; README.md; CLAUDE.md; `.devcontainer/`; `.github/dependabot.yml`; `package.json`; `package-lock.json`; `src/element/pictures.ts`, `src/element/index.ts`, `src/element/interface.check.ts`, `src/element/consumer.test.ts`.

## The icons of the element's buttons

**R46. Each button of the element shows an icon of the set Material Symbols, style Rounded, by `spec`'s table of which icon each button's value shows. The script `scripts/icons.ts` writes them into the module `src/element/icons.ts` from the set's package `@iconify-json/material-symbols`, with `@iconify/utils` — both in `devDependencies` —, and writes `NOTICE`, which goes into the package's archive; `ci-lint` fails if either is not what the script writes. An icon is an SVG with no name for a screen reader, in the colour of its button's text; the chosen tool's and the shown task's are filled, and those of «Отменить», «Дальше» and a hidden «Показ» are mirrored right to left.**
- **The values**, `TABLE` of `scripts/icons.ts`, by their buttons' keys in `labels.ts`:
  - the bar of glass: «Перо» `ink-pen`, «Ластик» `ink-eraser` and «Рука» `pan-tool`, each filled while it is the tool in use; «Отменить» `undo`, mirrored; «Очистить» `delete-sweep`;
  - a task from the learner's paper: "Hide the task" and "Show the task" `article`, filled while the tracing paper is shown; the grid's button, by the grid it shows: dots `background-dot-small`, lines `view-headline`, blank `crop-square`, squares `grid-on`;
  - a worked example's row: «Дальше» `arrow-forward`, mirrored; «Показ» `keyboard-arrow-down` while the demo is shown and `keyboard-arrow-right`, mirrored, while it is hidden — the state is still told by `aria-expanded`;
  - a value without a fill takes the outline in both states. A button that `canvas` brings in and the table lacks gets its icon by a row «в реестр spec» for `spec`'s table, and stands in `TABLE` meanwhile.
- **How an icon gets into the build:**
  - the script takes from the set the outline `<base>-outline-rounded`, and, where there is a fill, `<base>-rounded` too. A name the set does not have, or an icon made of anything but filled `path` contours, stops it. For the line icons, such as «Отменить», the outline in the set is an alias of the fill, as `spec`'s decision on the icons says;
  - the module is data: each icon its name, `viewBox` and contours `d`, and each value of `ROW` its two icons and its mirroring. The element builds the SVG through `createElementNS`, without `innerHTML`, so a page's Trusted Types policy does not touch it, and the SVG has its own size of one letter, should the element's style not come. The script formats the module by the Biome `ci-lint` checks with, run by this Node from `node_modules`, not from `PATH`, and its header names the set, its version and its license. `.sonarcloud.properties` excludes the module from the search for duplicates, `sonar.cpd.exclusions`: SonarCloud reads records of one shape as copies of each other (in pull request #72, 72 lines, 10.8 % of the new ones, against a threshold of 3 %);
  - at run time not one request: the contours are in the build, as `spec`'s decision on the icons bids, and the element calls nothing over the network. `canvas` has no bundler, only `tsc`;
  - `just icons` writes the module and `NOTICE` anew, and `node scripts/icons.ts --check` in `ci-lint` checks them, as `spec`'s `just types-check` checks its types.
- **The set's version** is the one a row of spec's COORDINATION.md names for `canvas`, `skill-map` and `app` together, which build in the same set, and it moves only by such a row: Dependabot ignores the package in `.github/dependabot.yml`, and the change that raises it runs `just icons` in its own branch ([sources 5.10](sources.md)). `@iconify/utils` moves like the other packages: the latest version released no later than three days before installation. The version is set in `package.json` and its lock file.
- **`NOTICE`** names the set, its author, its license and the address `google/material-design-icons`, and the set package's version. It is in `files` of `package.json`, `scripts/package.ts` requires it in the archive, `release-files` puts it there, and `release.yml` lists it among the release's paths. The license text is the package's own `LICENSE`, the same Apache-2.0.
- **Licenses.** `@iconify-json/material-symbols` is Apache-2.0, `@iconify/utils` and its dependencies MIT, all from `spec`'s list without exceptions. The icons ship though the set's package is in `devDependencies` — `spec`'s license check tells what ships by what goes into a deliverable, not by `dev` —; the code of `@iconify/utils` does not, only the set's data gets into the module.
- **The look:**
  - on the bar a button shows its icon alone, 20 px in a target of 44 × 44 CSS px, its label in the button out of sight and in its tooltip; «Дальше» and «Показ» show their label beside the icon, 20 px too;
  - the colour is `currentColor`: the tool in use is the accent, the others the ink's colour; in forced colours an icon is ButtonText, HighlightText for the chosen tool and GrayText for an unavailable button. The choice of a tool is still told by `aria-checked`;
  - right to left, the bar's `:dir(rtl)` mirrors the icons of `mirrored` values: their direction runs along the reading. The bar itself stays at the element's left.

— *Why:* `spec`'s decision on the icons bids every UI package draw the one set and build its icons in without a request at run time; for a package without a bundler its way is a script on `@iconify/utils` with a check in CI. The contours are data, not SVG text, since the element builds its SVGs through the DOM anyway. One version by a row of COORDINATION.md, as the same decision sets it for a question of `app`, by the option «Одна версия по строке плана»: `app` builds in `canvas`, `skill-map` and its own icons at one version of the set, and Dependabot's raises a week apart would split it.

— *Rejected:*
- **unplugin-icons and other bundler plugins** — there is no bundler, only `tsc`;
- **SVGs copied into the repository, and Iconify components that fetch icons over the network** — `spec`'s decision on the icons rejected them;
- **an icon's body as an SVG string through `innerHTML`** — on a page with Trusted Types it would fail;
- **a module without a check in CI** — a hand edit or a new version of the set would silently drift from `NOTICE` and from the table;
- **the set raised by Dependabot** — each package would move on its own, and `app` would build in two versions.

— `scripts/icons.ts`, `scripts/icons.test.ts`, `src/element/icons.ts`, `src/element/tools.ts`, `src/element/index.ts`, `NOTICE`, `package.json`, `justfile`, `scripts/package.ts`, `.github/workflows/release.yml`, `.github/dependabot.yml`, `.sonarcloud.properties`; `src/element/tools.test.ts`, `src/element/forced-colors.test.ts`; [architecture.md](architecture.md), the docking with the app, the publication and release, and the code and tools.

## `spec` tag v0.9.8

**R47. `canvas` is on `spec` v0.9.8: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The sample file, its markup and the rules the device and the runner share are `spec`'s eval protocol, the package `novatrail.eval.v1`. The tests of the groups, the crop, the snapping and the boxes check `canvas`'s code against `spec`'s vectors, and its own vectors, but for `pages.json`, are removed. The types of the marks come from `@altnovatrail/spec/canvas`, and the mark of an empty box frames the box itself. `spec` recorded В60 by option (a). The styles under CSP, the format 0.3 and the standard of accessibility and translations, which the tag also bids to take, are two tasks of their own after the release of the synthetic samples, and epic E10.**
- **What the tag brings `canvas`** (`git -C spec diff v0.6.5 v0.9.8`, read 2026-11-08). Between the tags lie v0.6.6–v0.9.8, with twenty-four new decisions in `spec`'s log, and what `canvas` gets with the tag is named by Д50, Д68, Д79, Д80, Д87, Д91, Д92, Д94–Д97, Д107, Д108 and Д115 in `spec`'s RUN.md:
  - **the eval protocol** — `spec`'s decisions on the sample file, on the rules the device and the runner share, and on the markup and the eval set. The sample file is the message `Sample` of the package `novatrail.eval.v1`, one JSON per sample, without pressure, an eval-set sample's with the license in the file; the reader is strict, and the file is checked by `spec`'s recipe `sample-check` (Д94, Д95). The markup is the field `markup`: the slot truth, the marks of the answer slots, and on a sheet the writing parts with the first error or the scores of an essay's criteria (Д97). The protocol wrote down the rules of the groups, the crop, the snapping and the boxes as `canvas` wrote them, and their vectors came out in the npm package `@altnovatrail/contracts` (Д96). Where the protocol parted from this log's entry on the sample file, that entry takes the protocol's rule;
  - **the answer to В60** — `spec`'s decision on the markup, since v0.9.8, by option (a) of the row: `first_error` of a sheet's parts and an essay's scores in a synthetic sample are a choice of the code by the seed, like the slots' values, and say nothing about the solution. Measures on these fields measure nothing on synthetic samples, and the admission rule does not count them (Д115);
  - **the synthetic samples** write `canvas_version` `0.0.0` and `text_set_version` `none`: the file was not written by the samples page, by `spec`'s decision on the sample file;
  - **the marks** — `spec`'s contract `app` ↔ `api` and its decision on the types of the element: the property `marks` and the types `Marks`, `Mark` and `Anchor` are in `@altnovatrail/spec/canvas`, in the shape of `canvas`'s temporary types, and a mark frames a workbook's empty box itself (Д50). That is epic E9 of table 2 of RUN.md, and this move did it;
  - **the styles under CSP** — `spec`'s decision on UI packages as web components: the element sets the styles of its Shadow DOM by `adoptedStyleSheets`, without an inline `<style>`, requires of the consumer's CSP only `img-src blob:`, and the element's test runs under the CSP `default-src 'none'; style-src 'self'; img-src blob:` (Д79). That is a task of its own, the element's styles under the consumer's CSP;
  - **the format 0.3** — `spec`'s decisions on the format 0.3, since v0.9.0: the rules of version comparison. The task's schema changed only in `$id`, and the manifest's in four lines. `canvas` reads 0.3 by the tag's types, and takes the format 0.3 manifest into the element as a task of its own, as the row В34 of `module-kit` asks (Д107, Д108). That is the task of the format 0.3 manifest in the element;
  - **the standard of UI packages** — `spec`'s accessibility standard and rules of translations of the UI packages: WCAG 2.2 level AA and two criteria of AAA; a zoom of the sheet up to 200 % with scrolling in two directions, a workbook's lines and boxes in the accessibility tree, the keyboard into the sheet and out of it, a row of buttons that does not stick in a low window, the frames of `exportWork()` without the theme and forced colors, an axe-core of its own; placeholders, CLDR's number forms and labels by the table of words (Д87). That is epic E10 in table 2 of RUN.md;
  - **the artifact** — by `spec`'s glossary of the artifact and the attempt: a work that is itself the result, while the work on a task with a key — strokes, answers, the context of a submission — is not an artifact, and the device erases it with the end of the attempt (Д68). [architecture.md](architecture.md) says so in the purpose and bounds;
  - **the samples page** — "hand the file to the eval-set organizer" and the author's statement for the purpose "eval set" (Д80). That is the task of the samples page's steps for an adult;
  - **the npm step of the shared release** waits 20 minutes for the version to appear, by `spec`'s decision on publishing UI packages to npm (Д91): `canvas` will get it with the release of `.github` that has it;
  - the rest does not concern `canvas`: the own key on the device, the deployment configuration, the observation, a submission with a rubric, the Starlark dialect, the interface languages, the admission to AI by age, the contract `app` ↔ `api` beyond the mark, the gate `sim`, the engine, the production images and the rollout of `infra`.
- **RULES.md** — the rule on production images: `canvas` has none. The **template** — buf in the stage `toolchain` and in CLAUDE.md.
- **What is changed here:**
  - `spec/` — at v0.9.8, commit b1fbc61: `spec`'s last release and its `main`. `gh release verify v0.9.8 -R altnovatrail/spec` — "Release v0.9.8 verified!";
  - **the packages** — `@altnovatrail/spec` 0.9.8 in `dependencies` and `@altnovatrail/contracts` 0.9.8 in `devDependencies`, both by `npm install --save-exact`, without the pause of three days that the entry on the first code sets for choosing versions, as in the moves to v0.6.2 and v0.6.5: the tag sets their version. The archives from the registry are the release files of `spec` v0.9.8: `release-verify-npm` accepted both. The types of `@altnovatrail/spec` between 0.6.5 and 0.9.8 changed in the marks and in comments, as the entry on the first code says;
  - **the marks** — `src/core/marks.ts` gives `spec`'s types, and so do the entry points, `interface.check.ts` and `entry.check.ts` check them for identity, and the directive `@ts-expect-error` on `marks` is removed, as the entry on the web component says. The mark of an empty box frames the box, as the entry on marks on boxes says;
  - **the vectors** — the tests of the groups, the crop, the snapping and the boxes read `spec`'s vectors: `src/core/contracts.fixture.ts` translates the protocol's messages into the sheet's types, and 16, 34, 14 and 20 cases agree with `canvas`'s code without a single edit of the rules. `vectors/groups.json`, `crops.json`, `snaps.json` and `boxes.json` are removed, and `pages.json` stays, as the entries on the stroke groups, the crop, the marks, the move to v0.2.37 and the box rule say;
  - **the devcontainer** — the output of the recipe `new-repo-draft canvas typescript 3.2 v0.9.8`, built in a temporary clone of `spec`, outside the repository: the Dockerfile matches it byte for byte, buf 1.75.0 with its sums, as the entry on the container says. `devcontainer.json` and `host-network.sh` did not change;
  - `.github/dependabot.yml` — `@altnovatrail/contracts` in `ignore`, like `@altnovatrail/spec`;
  - RUN.md: the task of this move done; the tasks of the sample file, the synthetic samples and the samples page's steps for an adult supplemented with what the tag bids them; the new tasks of the styles under CSP and of the format 0.3 manifest, and epic E10; table 2 without E9; table 3 — В60 closed; table 4 — Д4 and Д5;
  - the tag in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status, the purpose and bounds, the sheet's logical coordinates, the docking with the app, the sample file, the code and tools and the workbook.
- **Found:** the `exact.median` of `canvas`'s crop is H, the height the scaling takes, min(h_med, 1000), and the protocol's `bundle_median` is h_med itself. `spec`'s vectors tell them apart on three sheets, and the task of the sample file writes h_med into `CropSet`.

— *Why now:* the author's instruction, «выпущена новая версия spec — перейди на неё», and Д115 in `spec`'s RUN.md: `canvas` moves to a release with the answer to В60, and v0.9.8 is the first such release, the last one on 2026-11-08 and `spec`'s `main` (`gh release list -R altnovatrail/spec`). The synthetic samples' path to `tutor` — this move, the sample file, the synthetic samples and their release — starts with it.

— *Rejected:*
- **v0.9.7** — the first release with the protocol, but without the answer to В60 (Д115 in `spec`'s RUN.md);
- **the move without the types of the marks** — the executor's recommendation at the first estimate, to split a task too large for one session; the author's answer is the move whole;
- **CSP, the format 0.3 and the standard of accessibility and translations by this same move** — the synthetic samples' path to `tutor` would wait several days for them. The author's answer on the split is as recommended: the move, and those tasks after the release of the synthetic samples;
- **vectors of its own beside `spec`'s vectors** — two copies of the same rules would silently drift apart, and `spec`'s vectors are the one copy;
- **the vectors from the submodule `spec/`** — the code and the tests take `spec`'s files from the package of the same version, checked by its signature, not from the submodule;
- **`@altnovatrail/contracts` in `dependencies` now** — the `canvas` package would carry a dependency that its code does not call yet. Where the code of the sample file goes, the task of the sample file decides.

— *Revisit:*
- if the code of the sample file goes into the package — `@altnovatrail/contracts` moves to `dependencies`;
- if `spec` changes a rule or the vectors — the next move brings them, and the test checks the code against the new ones.

— *Consequence:*
- the tasks of the styles under CSP and of the format 0.3 manifest in table 1 of RUN.md, after the release of the synthetic samples, and epic E10 in table 2;
- the tasks of the sample file, the synthetic samples and the samples page's steps for an adult — a supplement «Дополнено» each, with what the tag bids them;
- the entries on the web component, the sample file, the first code, the container, the stroke groups, the crop, the marks, the move to v0.2.37, the box rule and marks on boxes.

— RUN.md, tables 1–4 and the tasks named above; [architecture.md](architecture.md), the status, the purpose and bounds, the sheet's logical coordinates, the docking with the app, the sample file, the code and tools and the workbook; README.md; CLAUDE.md; `.devcontainer/Dockerfile`; `.github/dependabot.yml`; `package.json`; `package-lock.json`; `tsconfig.core.json`, `tsconfig.node.json`; `src/core/marks.ts`, `src/core/contracts.fixture.ts`, `src/core/*.test.ts`, `src/core/entry.check.ts`, `src/core/index.ts`, `src/element/index.ts`, `src/element/interface.check.ts`, `src/element/workbook.test.ts`; `vectors/`.

## The sample file

**R48. The sample file is built, written and read by the module `src/eval/`, outside the package, by the code of `@altnovatrail/contracts`: the message `Sample` of the package `novatrail.eval.v1` of each composition — a measurement by an adult with the writing history, an eval set's, and a child's with the final geometry, on a sheet and on a workbook. The final geometry is strokes in the canonical direction, with points along the stroke's length every 0.25 units and with the points the stroke's box rests on, numbered by place. The crops are drawn from the strokes the file holds, and their numbers are the same as from the history. The examples of each composition are written by a test into `examples/`, and `ci-licenses` checks them by `spec`'s recipe `sample-check`.**
- **The module** — `src/eval/sample.ts` and `src/eval/resample.ts`, without the DOM, in Node and in the browser. The samples page and the generator of the synthetic samples will take it:
  - `sampleOf` assembles a sample from the purpose, "who wrote", the provenance, the writer code, the reference to the task, the sheet or the workbook with the writing history, and the markup in the sheet's stroke numbers. A child's sample for an eval set, a writer code for an eval set and a measurement without a code are a `TypeError`; the rest is held by `sample-check`;
  - `sampleText` writes the file with every field, zeros too, by the proto names, and `readSample` reads strictly: an unknown field and another protocol are a `TypeError`;
  - `personId` and `writerCode` make the sample's ID — 12 characters `[a-z2-7]`, 60 bits — and the writer code — 8 characters `[0-9A-Z]` without I, L, O and U, 40 bits — from the caller's random bytes: for the page that is `crypto.getRandomValues`. `syntheticId` is `synthetic-<seed>`, as in `spec`'s examples.
- **The order of the computation** — by the entry on the sample file:
  1. the device builds the sheet's groups and the table of boxes from the raw history, by the stroke groups and the box rule;
  2. the sample's history — time in whole milliseconds, places to a tenth, without pressure: the rounding keeps the order of the times, and a stroke lies no earlier than its last point, as the writing history of the entry on the eraser has it;
  3. the final geometry — the visible strokes, on a workbook only the strokes of the boxes. The points go along the stroke's length by a step, and the ends and the first points that reach each edge of the stroke's box stay: a point on a segment lies in the stroke's box and does not leave it when rounded to a tenth. The step is counted from one end and from the other, each series is taken in the canonical direction — the one of the two that comes first by the points in tenths, each compared top first, then left —, and of the two series the one that comes first goes. So the direction is canonical by the file's own points, and a stroke written the other way gives the same points. A stroke that the file does not hold — an erased one, or a workbook's draft — is a `TypeError` in the markup, and `sampleOf` does not change the caller's markup. The numbers are by place: the top of the stroke's box, its left edge, its bottom, its right edge, then the points in the canonical direction, and the former ID;
  4. the groups, the table and the markup move to the new numbers;
  5. the crops — from the file's strokes, by the eval protocol, at 16, 24, 32 and 48 px and at the module's height, without repeats, in ascending order. A workbook has a set for each filled box, from its strokes, as one group of the rule, but without crop boxes. `bundle_median` is h_med, not the crop's `exact.median`.
- **The step of 0.25 units** is the largest of 0.25, 0.5 and 1 at which no pixel of the crop at any height moves by more than a quarter of the gray scale on the tests' synthetic sheets. At 0.5 a line's edge on lowercase letters at 48 px moves by up to 136 of 255, at 1 by up to 254. The crop's numbers are the same at all three: the strokes' boxes do not change. `src/eval/resample.test.ts` holds this by enumeration.
- **The examples** — `examples/sheet-measurement.json`, `sheet-eval-set.json`, `workbook-child.json` and `workbook-measurement.json`, synthetic, on the tasks of `tutor`'s file of open tasks v0.1.1, as in `spec`'s examples. `src/eval/sample.test.ts` writes them through `toMatchFileSnapshot`, as the vectors were written before: in CI the file is not rewritten, and a divergence from the code is a failure. `ci-licenses` calls `just -f spec/justfile sample-check examples/*.json`: in CI only the licenses job has the submodule `spec/`, and buf is in the stage `toolchain`, by the move to v0.9.8.
- **Snapping does not take the final geometry** — the eval protocol, since v0.9.9, by the answer to В61: snapping takes the strokes as they came — on the device the strokes of the submission, in eval those that the writing history shows —, and a sample's final geometry does not serve as its input. Eval chooses the margin and the threshold of snapping and measures snapping only on samples with a history. So a runner that snaps a box to the final geometry departs from the protocol, not from this entry.

How it is built: [architecture.md](architecture.md), the sample file and the code and tools.

— *Why:* the author's answers in planning: the place of the code and the check in CI as recommended, and the task whole, against the recommendation to split it into the sheet and the workbook.
- **Outside the package** — only the samples page and the generator write the sample file, both in this repository; `app` does not write it, and the package needs neither `@altnovatrail/contracts` nor `@bufbuild/protobuf`, as the move to v0.9.8 left to revisit. The boundary is held by the package's check `scripts/package.ts`: a build file outside `lib/core` and `lib/element` is a failure, so a module that `core` imported by mistake will not get into the archive.
- **The examples in git** — `.github`'s shared wrapper does not give the submodule `spec/` to the tests: the code takes `spec`'s files from releases, not from the submodule. The licenses job gets it, and the files it checks are held by the test.
- **Along the length and with the box** — points along the stroke's length do not tell how fast it was written, nor the canonical direction from where; the stroke's box holds the stroke bundles, h_med and the group boxes, so the runner will repeat the crop's numbers from the file, as the eval protocol has it.
- **A step by pixels, not by eye** — "no difference is seen on the crop", as the entry on the sample file asks, a test holds only by a number, and a quarter of the gray scale at a line's edge is its measure.

— *Rejected:*
- **the code in the package, in `core`** — every consumer, `app` too, would pull in the code of the contracts, which it does not call;
- **a row for `.github`, so that the tests get `spec/`** — the check in CI would wait for an answer;
- **the workbook as a task of its own** — the executor's recommendation, to split a task too large for one session; the author's answer is one task;
- **the step 0.5** — a line's edge moves by up to half the gray scale;
- **the points as they came, without time** — their density gives away the speed of writing;
- **thinning without inserting points** — the sparse places of a fast stroke would stay sparse.

— *Revisit:*
- when a measurement of snapping takes its place on the device, as the entry on the marks leaves to revisit — the share by the length of the stroke is then proposed by a row «в реестр spec» of its own, as the eval protocol says;
- if the size of the eval set's files becomes a concern of `modules` — the step and the form of the record; an example of a sheet's geometry is now about 550 KB.

— *Consequence:*
- **the synthetic samples** — the generator calls `sampleOf` and `syntheticId`, and each of its files passes `sample-check` too;
- **the samples page's steps for an adult** — the page calls `sampleOf`, `personId` and `writerCode` with `crypto.getRandomValues`, and gives the markup in the sheet's stroke numbers;
- the entries on the sample file, the first code and the marks.

— RUN.md, the tasks of the sample file, the synthetic samples and the samples page's steps for an adult, table 3; [architecture.md](architecture.md), the sample file and the code and tools; README.md; `src/eval/`, `examples/`, `justfile`, `package.json`, `package-lock.json`, `tsconfig.core.json`, `tsconfig.build.json`, `vitest.config.ts`.

**R49. The synthetic samples are drawn by the generator `src/eval/synthetic.ts`: 16 samples from the seeds 101–116 on the tasks of `tutor`'s file of open views v0.1.22 — the sheets of the banks `eval/bank.json` and `eval/free-bank.json` and the pages of `eval/workbook.json`, without essays. No set is in git: the recipe `just synthetic <folder>` writes it — in `ci-licenses`, where `sample-check` checks each file, and in `release-files` for the release's archive of the synthetic samples. `tutor`'s file lies in `tasks/` as a copy of the release, the samples page's build takes the same file, and `ci-licenses` checks its signature by the recipe `release-verify` on every pull request. The same generator also writes the synthetic samples of a module's eval set, on the module package that the call names, by the recipe `just synthetic-module`: the drawing is shared, and the choice of a task from the bank by the seed is this set's.**
- **The generator** — without DOM, like the whole of `src/eval/`:
  - `SET` — 16 entries: the seed, the scenario, the purpose, who wrote and the bank. `syntheticSample` takes a task from the bank by the seed, draws the scenario's strokes with the hand on a sheet or on a page of a workbook, writes the markup in the numbers of the sheet's strokes and gives it all to `sampleOf`, which builds the sample file, with `syntheticId`. The writer code is `writerCode` from the bytes of the same generator of the seed;
  - the hand — `src/eval/hand.ts`: `Hand`, its own outlines of digits and signs `GLYPHS` and the fonts, moved from the synthetic sheets of the tests, which now take them from here. The hand writes through `Recorder` into `Work`, on the sheet's clock, with the erasures, clearing and undo of the writing history, and the points between a stroke's corners stand 2 units apart and shift by the seed by up to 0.4 units. The hand has pressure, but it does not go into the file: `spec`'s eval protocol keeps no pressure in a sample;
  - the scenarios and what they give the markup — `SCENARIOS`: a correct solution without `first_error`; a solution with an error in a line that the seed chose, and with `first_error` on it; an answer erased and written again; a sheet cleared before the solution, and an extra stroke undone; a crossed-out answer written again below, with the note `crossed_out` at the answer's place; a mirrored digit of the answer — `UNREADABLE_AMBIGUOUS` and the note `mirrored`; an illegible answer — `UNREADABLE_ILLEGIBLE`; two final answers; a solution without an answer; an empty sheet; a number line with jumps — a drawing part, a line of the sum and the answer, and `first_error` is chosen by the seed; a page with all its boxes, with empty boxes and a crossed-out answer, with a mirrored digit and an erased answer, and an empty page;
  - the numbers of the lines — arithmetic from the seed's number: there is one line with an error, only in the error scenario, and the lines after it carry it. Whether the sum is right the markup does not say: by `spec`'s eval protocol the `first_error` of a synthetic sample is the seed's choice and says nothing about the solution;
  - the set holds each composition on a sheet and on a workbook, each writer and each event of the history — writing, erasure, clearing and undo.
- **The tasks** — `src/eval/tasks.ts`. `openTasksOf` reads `tutor`'s file and gives, by bank, references to the tasks: the tag, the file's sha256, the bank and the bank's digest as the file gives it, the task's ID and the digest of the open view — the sha256 of the canonical text of the task's object by RFC 8785, as the module format takes the digest of a package's object. For `equation-1` and `workbook-01` it is the same as in the examples of `spec`. The hash is given by the caller: the DOM-free part has none of its own, and Node has it. A task with a field outside the format's open view is rejected, and the file with it, so the synthetic samples take no file with a closed field. Of a task only the ID, the canvas kind and the workbook's items are taken: the file is of format 0.4, and the element reads 0.2.
- **`tutor`'s file** — `tasks/tutor_v0.1.22_open-tasks.json` with its Sigstore bundle, byte for byte from the release. The tag, the name and the sha256 are `TUTOR_FILE`, and the tag is also the variable `tutor_tag` of the `justfile`, and a test holds them equal. `ci-licenses` calls `release-verify tutor v0.1.22` on the file from the tree, and the generator's script refuses a file with another sha256. A new release of `tutor` comes as a replacement of the file and of the three values together. A release that changes only `module_format_version` changes in the samples' references to tasks only the tag and the file's digest: the digests of the banks and of the open views stay.
- **The run in Node** — `scripts/synthetic.ts`: writes each sample as a file `<ID>.json` and prints a line per sample — the ID, the purpose, the writer and the scenario. The code of `src/` names its modules `.js`, and Node does not take such names for `.ts`, so `just synthetic` first builds the generator with `tsc` by `tsconfig.synthetic.json` into `build/`, and Node runs the build. It needs neither `spec/` nor `git`, and the network only for `npm ci`, when the packages are not installed yet, as the whole build does. Of the folder the recipe removes only the files of the previous set, `synthetic-*.json`. The set is about 6 MB of JSON; two runs give the same bytes.

How it is built — publication and release, the sample file, and code and tools in [architecture.md](architecture.md).

— *Why:* the author's answers in planning, all by the recommendations.
- **The set not in git** — 6 MB that every change of the raster or of the points alters would clutter the history, and the generator repeats them byte for byte. `sample-check` checks the files in the tree, and `ci-licenses` writes them there itself.
- **`tutor`'s file in the tree** — `release-files` runs without the network, and a release file enters CI only after `release-verify`; the samples page's build takes the same file — all its tasks, the essays too.
- **16 samples** — each composition, writer, event and kind of markup at least once; `tutor`'s CI only checks that its eval runner reads the synthetic samples of a `canvas` release, with no AI calls: the runner needs to read the samples, not to measure AI on them.
- **Without essays** — the task's goal is digits, expressions and drawings, the hand has no Latin letters, and there is no rubric of an essay in the open view, so the generator cannot choose marks that the runner, by `spec`'s eval protocol of eval sets, would not reject.
- **A build by `tsc`, not a module loader of its own** — the compiler already checks this code in `ci-lint`, and a loader would be one more piece of code that the other repositories do not have.

— *Rejected:*
- **the set in git**, like `examples/`;
- **downloading `tutor`'s file by tag** in `release-files` and in CI — `release-files` would have to go to the network;
- **a sample for each task of the banks** — about 36 samples and 12 MB, and the scenarios are the same;
- **essays with a Latin alphabet of its own** — by the author's answer;
- **an SHA-256 of its own in the DOM-free part** — Node gives it, and the generator runs only in Node.

— *Revisit:*
- if `tutor`'s runner needs essays — an alphabet of its own and the choice of marks, once the rubric can be seen;
- when the measurement's tasks come from `modules` (Д4) — the generator's source too.

— *Consequence:*
- **the release of the synthetic samples** — `release-files` calls `just synthetic`, packs the folder into the archive `synthetic-samples_v<X.Y.Z>.tar.gz` and puts the lines "ID — purpose — writer — scenario" where the entry on that release decides;
- **the samples page's build** — takes the same file from `tasks/`, all its tasks, the essays too;
- **a module's synthetic samples** — take the same generator and its drawing;
- [architecture.md](architecture.md) — publication and release, the sample file, and code and tools; README.md;
- `src/eval/`, `src/core/sheets.fixture.ts`, `src/core/workbooks.fixture.ts`, `scripts/synthetic.ts`, `tasks/`, `justfile`, `tsconfig.synthetic.json`, `.gitignore`.

**R50. The release carries the synthetic samples as two files: the archive `synthetic-samples_v<X.Y.Z>.tar.gz` — a flat tar, one file `<ID>.json` per sample — and the list `synthetic-samples_v<X.Y.Z>.tsv`: a line per sample, the ID, the purpose, who wrote and the scenario. The archive is written by code of its own, `scripts/archive.ts`, with no machine and no time in its bytes, and one commit gives the same archive. Both files are signed and stand in `SHA256SUMS`, and the release's paths take everything the synthetic samples are built from.**
- **The archive** — ustar: the names in ascending order, each file with a header with its name, size and checksum, mode `0644`, owner `0` with no name, time `0`, type "regular file"; no directories, a name of 1 to 100 bytes without `/`; at the end two empty blocks. Compression — gzip from `node:zlib`, level 9, with no file name and no time in the header. Deflate is the zlib of Node itself, whose version `.devcontainer/Dockerfile` pins, so the bytes are the same in the `toolchain` stage, not on any machine; a test holds the sha256 of a small archive, and a Node with another deflate fails it before the release. The repeat byte for byte, the headers, the empty folder, the refusals and the reading of the archive by GNU `tar` are held by `scripts/archive.test.ts` in `ci-test`. The archive is about 770 KB, and the set itself 5.2 MB of JSON: the entry on the generator names about 6 MB — that is what it takes on disk, in blocks.
- **`release-files`** writes the set by the recipe `just synthetic` into a temporary folder outside `dist/` — the shared release takes only files and fails on a subfolder —, packs it with `node scripts/archive.ts` and puts the list beside it: a line with the names of the columns `id`, `purpose`, `writer`, `scenario`, then a line per sample. The list is written by the generator itself, not by catching the recipe's output: nothing that `npm ci` or `tsc` would print gets into it. The archiver does not pack an empty folder. `SHA256SUMS` — the package, the archive, the list and `LICENSE`.
- **The release's paths** in `.github/workflows/release.yml` — added to the earlier ones are `scripts/synthetic.ts`, `scripts/archive.ts`, `tsconfig.synthetic.json`, `tasks/*` and `package-lock.json`: the sample's JSON is written by the packages from it; the generator `src/eval/` is already taken by the mask `src/*.ts`. So new synthetic samples come out as a release even if the package did not change.

How it is built — publication and release in [architecture.md](architecture.md).

— *Why:* the author's answers in planning, all by the recommendations.
- **An archiver of its own** — `tutor`'s CI pins the archive's sum by tag, and the bytes must not depend on the versions of `tar` and `gzip` of the image and on their flags; code of its own is held by tests in `ci-test`, and a recipe is not.
- **The list as a separate file** — the release's description is written by the shared `release.yml` itself (`gh release create --generate-notes`), and no text can be passed into it; and a README inside the archive would make it not only the JSON that `tutor` asked for.

— *Rejected:*
- **GNU `tar` and `gzip` in the recipe** — only a run of the recipe would hold the repeat, and the bytes would be held by the versions of the image's tools;
- **the lines in the release's description** — the shared `release.yml` does not take it;
- **a README in the archive** — the archive would stop being only samples;
- **no list** — `tutor` will read the samples without it too, but matching the scenarios against its run is simpler by the list.

— *Revisit:* if `tutor` wants the set otherwise — by directories, with a manifest — `tutor` asks for it in its own plan, from the work of its CI that reads this archive.

— *Consequence:*
- **the samples page's build** comes out in the same release, by the same recipe;
- **the hand-over of the samples page to the measurement** waits for a release of `tutor` whose runner reads this archive;
- [architecture.md](architecture.md) — publication and release; README.md;
- `scripts/archive.ts`, `scripts/archive.test.ts`, `justfile`, `.github/workflows/release.yml`.

**R51. The element sets the styles of its Shadow DOM by `adoptedStyleSheets`, not by a `<style>` element in the shadow tree: one `CSSStyleSheet` per document, built by the window of that document and filled by `replaceSync()`. Under the CSP of `app` — `default-src 'none'; style-src 'self'; img-src blob:` — the element works and asks of the consumer's policy only `img-src blob:`. A test of the element under this policy, with `script-src 'self'` added for the test runner, holds this.**
- **The sheet** — the same text of styles that stood in `<style>`, rule for rule. The first element of a document builds the sheet by the constructor `CSSStyleSheet` of that document's window and fills it by `replaceSync()`, and the other elements of the document take the same object: the rules are parsed once per document, not for each element.
- **A move into another document.** A root can be given only a sheet of its own document: otherwise CSSOM throws `NotAllowedError`. Chromium, when it moves an element into another document — for instance, into an iframe of the same origin —, clears the `adoptedStyleSheets` of its root, and without a fix of its own the element would be left without styles both there and after its return. So `adoptedCallback()` gives the root the sheet of the new document. A document without a window cannot build a sheet: there the element is without styles until it gets into a document with a window. With `<style>` a move did not lose the styles, and the test `index.test.ts` holds that it does not lose them now either.
- **The attribute `style`** the element does not write in the markup. The sizes it sets itself — to the frame of a picture in the statement and in the list of the demo's parts, to the visible part of the sheet, to the demo's area on the sheet — it assigns through CSSOM, by the properties of `style`. The policy of `app` does not block them in Chromium: the test compares the width of the frame of the statement's picture, and the height of the visible part of the sheet only indirectly, by a sheet that took its place and took strokes.
- **What else concerns the CSP:**
  - the pictures of the statement and of the demo — beside the sheet and on the sheet — are `blob:` addresses: `img-src blob:`;
  - the element loads no fonts: the font is the consumer's, and the package has no `@font-face`, so it needs no `font-src`;
  - media files come as a `Blob` from `media`, and the element does not go to the network: no `connect-src` is needed either;
  - the crop for the check is its own raster and its own PNG, without loads.
- **The test** — `src/element/csp.test.ts` in the project `browser`, in both instances of Chromium. The policy is that of `app` plus `script-src 'self'`: `default-src 'none'; style-src 'self'; img-src blob:; script-src 'self'`. It holds the styles and the pictures word for word by the policy of `app`, and lets scripts in from the origin of the tests' server, for the runner. It is set by a `<meta http-equiv="Content-Security-Policy">` element in the `<head>` of the test's frame, when the file's modules are already loaded: after that the frame loads nothing but `blob:` pictures, like the page of `app`, and the runner, already loaded, works. Each file of tests has its own frame, and the other files do not fall under the policy.
  - The first test holds that the policy acts: a `<style>` in the shadow root is blocked, and the page hears the event `securitypolicyviolation`.
  - Then — a sheet with a picture of the statement, a grid, strokes and a tutor's mark, a workbook, and a worked example with pictures beside the sheet and on it. The styles are in place, the sizes through CSSOM too, the pictures came by `blob:` addresses and are decoded, and there are no violation events.
  - With a `<style>` in the shadow tree the last three tests fail: the host has `display: inline`, the workbook's print is the browser's `rgb(0, 0, 0)`, not the ink's color `rgb(17, 17, 17)`, and the violation event is `style-src-elem`.

How it is built — the docking with the app in [architecture.md](architecture.md).

— *Why:* `spec`'s decision on UI packages as web components has this as a requirement of the contract: the CSP of `app` does not change with the canvas's version, and the other consumers need not allow inline styles. The tag v0.9.8 bids to take it (Д79 in RUN.md of `spec`).
- **A sheet per document, not per element** — a lesson of `app` has many elements, and the rules are parsed once.
- **`adoptedCallback()`** — without it an element moved into another document would lose its styles, which did not happen with `<style>`. A probe in the image's Chrome Headless Shell showed this: after a move the root has zero sheets, and the host has `display: inline` — both in an iframe and after the return.
- **`<meta>` in the test's frame** — Vitest serves the frame's page with its own scripts, and `default-src 'none'` as a header of the response would stop the runner itself. A `<meta>` after the modules are loaded gives the same policy word for word.
- **`script-src 'self'` in the test's policy** — in Chrome Headless Shell 158, of Playwright 1.65.0, the runner imports again, after a file's tests, the module that takes the coverage, `/@id/@vitest/coverage-v8/browser`, and `default-src 'none'` blocks this import: "Failed to fetch dynamically imported module", four unhandled errors on the two instances of Chromium, and `ci-test` fails, though all eight tests of the file passed. Without the policy there are no errors, and with Playwright 1.64.1 and the browser 1248 there are none either. Sources with a path — this module's, `/@id/`, `/@fs/`, `/node_modules/`, all three together and a path with `%40` — did not let the import in, and the whole origin did: so `'self'`, the same thing, shorter. The test does not catch a script that the element would load from its own origin; the element imports none after loading (`git grep "import("` in `src/core` and `src/element` outside the tests is empty), and its promise about the consumer's policy — only `img-src blob:` — holds.

— *Rejected:*
- **a hash of the styles in the `style-src` of `app`, and `'unsafe-inline'`** — `spec`'s decision itself rejected them;
- **one sheet per module, with no regard to the document** — an element moved into an iframe would be left without styles;
- **a CSS file of the package through `<link rel="stylesheet">`** — the package has no bundler, only `tsc`: the file's address would be set by the consumer's bundler, and `style-src 'self'` would let the file in only from the consumer's origin;
- **a policy as a header of the server for the test's page** — it would stop the runner, and one that lets the runner in is no longer the policy of `app`;
- **a check only by hand, on `demo/`** — without CI a regression would pass unnoticed;
- **keeping Playwright at 1.64.1, or putting its raise off until a task of its own about the test's frame** — what `script-src 'self'` stops catching, a script the element loads from its own origin, the element never does, so the raise costs the test nothing.

— *Revisit* — if WebKit or Gecko blocks `replaceSync()` or the assignments through CSSOM under such a policy. CSP3 names the parsing of a declaration block and `insertRule` among the CSS algorithms that the absence of `'unsafe-eval'` closes, but writes at once that this "needs to be better explained" (sources 9.17). Chromium does not close them, and there are no other engines in the image. In WebKit and Firefox `app` will check this: its Д9 in RUN.md names «что `style-src` не блокирует `adoptedStyleSheets` и `element.style` канвы» (sources 9.17).

— *Consequence:*
- `app` changes nothing: its policy is already such;
- **table 3 of RUN.md** — the row В62 tells `spec` that `canvas`'s part in Д79 is done;
- [architecture.md](architecture.md) — the docking with the app, code and tools, and the sources;
- `src/element/index.ts`, `src/element/csp.test.ts`, `src/element/index.test.ts`.

## The probe of a page from a file

**R52. The probe of a page opened from a file is code in the repository, in `probe/`: one source — `page.html` and `probe.js` — and the script `probe/build.ts`, which writes two files from it, `t29-probe-csp.html` with the candidate policy of the page's build and `t29-probe-open.html` without it. The test `probe/probe.test.ts` opens both by `file://` in the image's Chrome Headless Shell. Neither the package nor the release's paths carry the probe: it comes out as a pre-release with a tag that does not begin with `v`, one tag per run.**
- **What the probe checks** — what the page's build will meet on the device: whether the scripts ran, `isSecureContext` and the protocol, whether there is `getCoalescedEvents`, the pointers by type — the number of events, the greatest pressure and the width of the touch, the number of intermediate events —, requests to `127.0.0.1:4` and `probe.invalid` through `fetch` and `<img>`, a `blob:` picture, `localStorage` by the file's name, and whether IndexedDB opens. The report is seen on the page and is saved as a file through `<a download>` with a blob — the way the page will save a sample.
- **The report** — only the fields of the list: numbers, flags, the browser's string, the file's name without folders and the probe's version. No paths, no messages of errors, no points of strokes: the report goes to the author in the chat and does not get into the repository. The name is cut after decoding, at the slash and the colon: an Android `content://` address hides the whole path in its last segment, `raw%3A%2Fstorage%2F…`. While the pointer moves, the report is written once a frame, so that the writing does not take time from the counting of events.
- **Blocked or failed.** A request that the policy stopped the page learns of by the event `securitypolicyviolation` with its address, and without the event the request failed in the network. An event that came later than the result corrects the result. Port 4 is not one of the ports that Chromium refuses by itself: on port 9 it answered `ERR_UNSAFE_PORT` even without the policy, and the probe would not tell the network from the browser (measurements 1.1).
- **The candidate policy** — `default-src 'none'; script-src` and `style-src` by hashes, `img-src blob:` for the pictures, `connect-src 'none'; base-uri 'none'; form-action 'none'`, by a `<meta>` element: a page from a file gets no headers of a response. The hashes are computed by `build.ts`. The code is ASCII without a carriage return: the parser drops it before the browser computes the hash; and the script has no `</script` and no `<!--`, which would close it earlier. Otherwise the build stops, and `<meta charset="utf-8">` stands first.
- **The test** — in the project `node`: Vitest in the browser serves pages by `http:`, and the probe needs `file:`. Under the policy each request beyond the file and its blob ends with the cause `csp`, and the events are two each for `connect-src` and `img-src`; without the policy the same requests fail with `ERR_CONNECTION_REFUSED` and `ERR_NAME_NOT_RESOLVED`. Also — the storage after a reload, the mouse pointer, the file's name from an Android address and the saved report with the fields of the list. A spoiled hash brings down six tests of eight, `connect-src *` two.

— *Why:* the probe is kept here, by the recommendation: there are no tablets, and the emulators' CI workflows, the probe's in the Android emulator and the page's build's, take the same probe into the emulators. A probe outside the repository would vanish with its pre-release: `canvas` has immutable releases turned on, and the tag name of a deleted release can no longer be taken. Code in the repository comes with its tests.
- **One source and a script** — SonarCloud would count two files with almost the same code as duplicated lines, and hashes computed by hand would drift from the code silently.
- **`node probe/build.ts`, without a recipe** — the `justfile` is among the release's paths, and a recipe of the probe would release a new version of the package without a single change in it.

— *Rejected:*
- **the probe outside the repository** — the emulators' probe would write it anew, and the results of the two probes would compare poorly;
- **two files by hand** — duplicated lines, and hashes computed by hand;
- **a test in the project `browser`** — Vitest's frame comes by `http:`, not from a file, and the secure context, the storage and the policy are different there;
- **the probe inside the package or `demo/`** — the package carries nothing but `lib/` and NOTICE, and `demo/` is a page for trying by hand, on Vite, by `http:`.

— *Revisit:* when the samples page has a build of its own — its test will open the build itself from a file, and the probe is needed only for the devices that the test does not reach.

— *Consequence:*
- **the probe on devices** — the pre-release `t29-probe` from `node probe/build.ts build/probe`, a run in Chrome and Firefox on Linux;
- **the probe in the Android emulator** — the same probe, with a tag of its own; **the page's build in the emulators** — the same scaffold;
- **the samples page's build** — the candidate policy checked in Chromium from a file;
- [architecture.md](architecture.md) — code and tools;
- `probe/`, `biome.json`, `tsconfig.node.json`, `vitest.config.ts`, `.gitignore`.

## `spec` tag v0.9.9

**R53. `canvas` is on `spec` v0.9.9: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The tag carries the answers to В61 and В62, both by the recommendations of `canvas`, and `canvas`'s code has nothing to change.**
- **What the tag brings `canvas`** (`git -C spec diff v0.9.8 v0.9.9`, read 2026-11-08). Between the tags there is one entry of `spec`'s inbox triage, `main` fa5da0b, and what `canvas` gets with the tag is named by Д116 and Д117 in RUN.md of `spec`:
  - **В61** — `spec`'s decision on the rules the device and the runner share, and [the contracts text](../spec/contracts/README.md) on snapping: snapping takes the strokes as they came, a sample's final geometry does not serve as its input, and eval chooses the margin and the threshold only by samples with a history. The protocol's package is the same. The entry on the sample file takes this rule;
  - **В62** — `canvas`'s part in Д79 of `spec` is done by the entry on the element's styles under CSP, and `app` gets the element under its CSP with `@altnovatrail/canvas` 0.1.7, and format 0.3 from 0.2.0, by `spec`'s plan across repositories;
  - **a sheet without strokes** — `spec`'s decision on the markup and the eval set: such a sheet does not go to the model, and the runner's report measures it without slots. For an empty sheet `exportWork()` already gives `null`, and the synthetic samples v0.1.6 already carry one, `synthetic-110`: `canvas` has nothing to change;
  - **citations** — `spec`'s decision on checking the documents of the other repositories: the name of a NovaTrail repository after a number or a section is a suffix wherever a word boundary follows it. The documents check of `canvas` at this tag is green, without a single change;
  - the rest does not concern `canvas`: the port of `modules` from standalone, by `spec`'s decision on carrying MathTrail over selectively, `module-kit`'s warning about a number in a module's text and the format's example of traps, by `spec`'s decision on the trap and technique catalogs, the cards of `engine` and `.github`.
- **What is changed here:**
  - `spec/` — at v0.9.9, commit fa5da0b: `spec`'s latest release and its `main`. `gh release verify v0.9.9 -R altnovatrail/spec` accepted the release;
  - **the packages** — `@altnovatrail/spec` 0.9.9 in `dependencies` and `@altnovatrail/contracts` 0.9.9 in `devDependencies`, both by `npm install --save-exact`, without the pause of three days that the entry on the first code sets for choosing versions, as in the moves to v0.6.2, v0.6.5 and v0.9.8: the tag sets their version. `release-verify-npm` accepted both. The archives 0.9.8 and 0.9.9 differ only in the version in `package.json`: neither the types, nor the schemas, nor the vectors changed;
  - **the copies of the format in the tests** — the same: between the tags `format/` changed the format's README and the example of traps `traps/valid/olympiad-math.yaml`, which the tests do not copy (Д5);
  - **devcontainer** — `spec`'s template did not change between the tags: the Dockerfile and `devcontainer.json` are the same;
  - RUN.md: the task of this move is done; table 3 — В61 and В62 are closed; Д5 is reconciled; the tag — in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status.

— *Why now:* the author asked to move to the newest `spec` first, before the next task of E5. v0.9.9 is `spec`'s latest release on 2026-11-08 and its `main` (`gh release list -R altnovatrail/spec`), and it closes both open rows of table 3.

— *Rejected:* **staying on v0.9.8** until a task that needs the tag — the rows В61 and В62 would hang open, though the answer is already out, and RULES.md says to remove a row when `canvas` is on a tag with the answer.

— *Consequence:* the entry on the sample file takes the rule of snapping; the merge releases `canvas` — the next patch of the line 0.2, and the same version in npm: `package.json` and the lock file are among the release's paths, as the entry on the package and its release says.

— RUN.md, the task of this move, tables 3 and 4; [architecture.md](architecture.md), the status; README.md; CLAUDE.md; `package.json`; `package-lock.json`.

## The emulators in CI

**R54. The probe of a page from a file and the samples page's build are opened by emulated devices on GitHub's runners, as a volunteer opens them, in two workflows of their own. The probe's, `.github/workflows/emulators.yml`, runs by `workflow_dispatch` and on a pull request with changes to `probe/` or to the workflow itself: the job `android` — the Android emulator on `ubuntu-24.04`, the job `ipad` — the iPad Simulator on two images, `xcode-27` with iPadOS 27 and `macos-26` with iPadOS 26.5, and the job `safari` — Safari on `macos-26`. It builds the probe's files itself and serves them from the runner by the server `probe/serve.ts` with the headers of a GitHub release, and the device's browser downloads and opens them. The driver `probe/android.ts` taps by the bounds of the nodes of `uiautomator dump` and reads the page's report by Chrome's DevTools; on an iPad the driver `probe/ipad.ts` clicks on elements by WebDriverAgent — `appium/WebDriverAgent` v16.15.3, commit 02cb92f, BSD, built by the runner's Xcode —; Safari on macOS downloads the files through `safaridriver` and opens them as Finder does, `open -a Safari`. The samples page's, `.github/workflows/page.yml`, opens the page's build by the Android emulator on every pull request that changes it, and by the iPad Simulator too on a push to `main` and by hand. Android — the same emulator and versions as the probe's, and the page from Chrome's download, by `content://`; iPad — iPadOS 26.5 on `macos-26`, Safari through the system's `safaridriver`, and the page from the runner's server, as from hosting: from a file it does not work on an iPad. Each device goes through two builds, each by a run of its own with its own folder and artifact: the release — with the items of the checklist on devices on the sheet and a file opened on a page opened anew —, and the test build — with a child sample session. Both drivers go through the page's «Начало», draw a stroke on the sheet and on a page of the workbook, save both samples and see that the page asked for nothing and did not break its policy; the sample files are read by `readSample`. The drivers' common parts are in `emulators/`, and the probe runs on them. The drivers wait for a sign until a deadline in seconds, not by a number of attempts; a WebDriver command waits 30 s for an answer, and a new session 120. A failure of the device gets a second pass, a failure of the page none. The required check is one, the summary job "Samples page". The screenshots and the reports are the runs' artifacts.**
- **The emulator** — the action `reactivecircus/android-emulator-runner` v2.38.0 by SHA a421e43, Apache-2.0; the emulator's build is pinned by the input `emulator-build`, 16740729 — 37.2.13 of the stable channel; the image is `system-images;android-36;google_apis;x86_64`, the tablet `pixel_tablet` 2560 × 1600. The image `google_apis` is a debug one, `ro.debuggable=1`, and Chrome reads flags from `/data/local/tmp/chrome-command-line`; the Chrome in it is 133.0.6943.137.
- **The image's revision** is what `sdkmanager` installs: it gives no way to pin it. `spec`'s rule for a CI tool that a GitHub action or the runner image puts on the runner, with nothing to pin it with, holds it: it is pinned as narrowly as its installer allows, and the run writes the exact version into its artifact — the revision into `sdk-installed.txt`, on 2026-11-08 revision 7. Likewise `emulators/simulator.sh` writes into the iPad's `versions.txt` the image of the macOS runner — `ImageOS` and `ImageVersion` — and the version of macOS beside Xcode and the simulator's runtime, and so does the probe of Safari on macOS. The version of Xcode is `CFBundleShortVersionString` and `ProductBuildVersion` from `version.plist` of the Xcode that `xcode-select` chose, in the same form as `xcodebuild -version`: that one ran 57 s for the sake of two lines of `versions.txt`.
- **The server** serves the folder's files, and only them, with `Content-Type: application/octet-stream` and `Content-Disposition: attachment` — those of a GitHub release (sources 3.6). So the device's browser downloads them, and neither a pre-release nor the author's confirmation of each step outside the repository is needed. The Android emulator takes the server on its own `localhost`: `adb reverse` leads the server's port to the runner — the probe and the page alike. The host alias `10.0.2.2` SonarCloud flags as a hard-coded address (S1313).
- **The container and the tools.** The probe, the server and the driver run in a container of the `toolchain` stage, like the shared workflows of `.github`, on the runner's network; `adb` is given to the driver by the runner as a volume — the one that the action installed. The action runs each line of `script` by its own `sh -c`, so the run is one script, `probe/android.sh`. Node on the macOS runners is `actions/setup-node` v7.1.0, commit 949feb2, with the version `NODE_VERSION` of the Dockerfile, 24.21.0: there is no Docker there.
- **The Android probe's driver:** a warm-up of Chrome on an empty page, with answers to its first-run offers; the download of each file by a `VIEW` intent; the opening — the file's name in Chrome's list of downloads, and without it, "Open" in the message about the download, which does not name the file; if Chrome showed neither, the list through the menu. Each step looks for a page of the probe that it has not found yet, and the driver knows that Chrome is in focus by `mCurrentFocus` from `dumpsys window`; the report; "Write storage"; swipes by touch and, through `input stylus`, by pen — in the middle of the field, away from the edge of the screen, where a swipe is the "back" gesture; "Save report"; the second file; a restart of Chrome and the first file again. Drawing counts only if the page counted events, and any failed step brings down the run. The pure functions — the parsing of the dump with its entities, finding a node, the points of a tap and of a swipe, the window's focus — are held by `probe/android.test.ts`.
- **A click on the iPad, not a tap by the bounds.** A tap in the middle of the bounds from the tree hit what was under the dialog: Safari's dialog about the download is in the tree earlier than on the screen. WebDriverAgent clicks an element found by an NSPredicate where it can be hit, and waits for that.
- **One session of WebDriverAgent.** A new session on `bundleId` launches the app anew, and a new launch of Safari breaks the download; the apps are switched by `/wda/apps/activate`. The driver reads the tree by its session and names the app in front by the setting `defaultActiveApplication`.
- **WebDriverAgent's build** for testing the probe's iPad job takes from the cache, and builds it only on a miss or when the cached one does not start.
- **The files in "On My iPad".** Pressing "Download" in Safari's dialog through WebDriverAgent does not put the file there: of eight downloads in four runs, one ended up in "Files". So the driver, having found the downloads not in place, puts the files into the folder "Downloads" of the local storage of "Files" itself — through the container of the group `group.com.apple.FileProvider.LocalStorage` from `simctl get_app_container` — and writes this into the findings. The main question — whether "Files" runs the page's script — stays the same for this: the file is the same, and the same Quick Look opens it.
- **Safari on macOS.** `safaridriver` does not open a `file://` page — it stays empty —, and AppleScript, the only way into Safari's window without WebDriver, asks the runner's user for a consent that nobody gives. So the job takes the screen by `screencapture`, and only the picture answers what Safari did with the page.
- **When the page's check runs.** The workflow starts on every pull request, and the job `changes` decides by `git diff` whether anything that goes into the build or checks it is touched: `src/`, `page/`, `scripts/page.ts`, `scripts/csp.ts`, `tasks/`, `package.json`, the lock file, `.devcontainer/Dockerfile`, `emulators/` and the workflow itself. If not, the other jobs are skipped. GitHub counts a skipped job as a success, so the summary job "Samples page" stands on every pull request and can be required. One check is required, not each: for a job with a matrix skipped by `if` GitHub does not expand the name, and a check with the version's name would hang forever. On a pull request only the Android emulator runs; the iPad Simulator runs on a push to `main` and by hand.
- **The build** — `node scripts/page.ts build/page 0.0.0` in the `toolchain` stage, as the release builds it, and an artifact for the other jobs. There is no recipe: the `justfile` is a path of the release, and the recipe and `release-files` belong to the page's release.
- **Two builds.** Each device goes through the release build and the test build, each by a run of its own with its own folder and artifact. On the release build the drivers go through the items of the checklist on devices on the sheet, and open a file on a page opened anew; on the test build — a child sample session. On Android the movements of the checklist are Chrome's touches through DevTools, on the iPad the page's events.
- **The watcher** — `emulators/watch.ts`, the driver's script in the page: a listener of `securitypolicyviolation` with the directive and the address of each violation, listeners of errors with their text, and a copy of the text of each blob that the page gives to a link — taken when the page makes the blob: Safari did not let a blob be read back while it was downloading it itself ("NotReadableError"). It runs before the page's script. On Android DevTools sets it and reloads the page, recording the `Network` requests; the driver's script is not subject to the page's policy. In Safari no WebDriver lets a script be set before the page's script, and `ReportingObserver` does not give out the violations from before the watcher came — though WebKit's sources have its buffer (`Source/WebCore/Modules/reporting/ReportingObserver.cpp`): a red run with a request at the page's start on an iPad would have passed green. So Safari opens a copy of the build where the watcher is written in before the page's script, and its hash stands beside the script's hash in the policy (`watched()`); nothing else changes in the copy. The requests in Safari — by `performance.getEntriesByType("resource")`, and on both — by the server's log, where there must be only the GET of the page. The watcher's test opens the real build in Chrome Headless Shell — and a copy, with the watcher written in, of a build whose script asks for the network at start: the watcher sees its `connect-src`.
- **`safaridriver` and Simulator** — a session with `platformName: iOS`, `safari:useSimulator` and `safari:deviceUDID`, as Flutter (`packages/flutter_tools/lib/src/drive/web_driver_service.dart`) and browsertime call it; Apple's pages are silent about iOS (read 2026-11-08). The recipe that works on GitHub's runners is a new Simulator, the keys of remote automation in it and a reboot, Safari before `safaridriver`, and the image's Xcode: after `xcode-select` `safaridriver` loses Simulator.app (`Laticent/lattice`, `docs/scripts/ios-safari/run.sh`, commit 3687a60, read 2026-11-08). On iPadOS 26.5 it passed the first time.
- **Not iPadOS 27.** On the image `xcode-27` `safaridriver` does not create a session with Simulator — "Could not find any session hosts that match the requested capabilities", in two runs of two; the same recipe says that Xcode 27 replaced Simulator.app. iPadOS 27 stays out of the page's check until this is fixed, and the iPad probe runs it, through WebDriverAgent.
- **Touch and click in Safari.** The stroke is WebDriver actions with a `touch` pointer, and where it gave no stroke — `mouse`: on the workbook's page a touch gave no stroke once in six runs, and the mouse did. A WebDriver click on the save button on iOS scrolled it into the window and tapped the sheet under it — a point of a stroke —, so the iPad driver saves by a `click()` of the button itself: what is checked is the page's path of saving, not where WebDriver lands.
- **The page's point on Android** — from the bounds of the node of the page's own view, `android.webkit.WebView`, and the page's `devicePixelRatio`; by the save button only if there is no such node. The node of the page's view is a node of Chrome itself, and its bounds are right even when the page's tree inside it lags behind. The press of the save button is a tap on the screen by `input` at the same point, in the middle of its bounds in the page. The step writes into the log how the point was found, and on a failure a dump of the screen goes into the artifact.
- **Chrome's hints** — none over a page from a download. In Chrome 133 the hints `IPH_CCTMinimized` and `IPH_CCTHistory` are on by default (`components/feature_engagement/public/feature_constants.cc` of Chromium, tag 133.0.6943.137, read 2026-11-09). The bubble "Minimize tab to return to it later" stood over the page from the download, `uiautomator` read only its window, and did not find the save button. The flag `--disable-features` in Chrome's file of flags turns them off. When there is no button, the driver writes the screen's words into the log. Even without the bubble Chrome's accessibility tree, which `uiautomator` reads, lags behind the page's scrolling and shows its top, so each attempt to find the button scrolls the page a pixel up and back to it: scrolling updates the tree.
- **One path for both devices** — `emulators/volunteer.ts`: open the page with the watcher, wait until it has seen the page from its start, «Начало», a stroke and the saving of the sheet, the workbook's page, a stroke and the saving, the result. A device gives only its own ways — how the page opens, how a stroke is drawn, how a button is pressed —, and each of them, when it fails, is a step of the device.
- **Waiting by a deadline** — `until` in `emulators/wait.ts`: it tries the sign at least once and repeats until the deadline, however long each attempt takes. All the loops of `emulators/android.ts`, `emulators/page-android.ts` and `emulators/volunteer.ts` wait by it, and so does the Android probe, which takes the same functions. The deadlines are set by how long a step takes on a slow device: the page's steps — the sample file and the markup form — wait 30 s, since on an iPad 27 s at times passed between the markup and the file, and their failure is a failure of the page, without a second pass; the opening of a download — 120 s, with Chrome's menu at the 45th and the 90th second. After «Сохранить» on Android the driver waits for the file itself in the downloads, up to 10 s, and answers Chrome's question if it asked one: the file comes in a second or two.
- **The WebDriver timeouts** — `timeoutOf` in `emulators/webdriver.ts`: `POST /session` — 120 s, the rest — 30 s; the opening of a page, `POST …/url`, waits 60 s: WebDriver answers it when the page has loaded. A command longer than 5 s writes a line `slow:` into the job's log, and through it into `phases.txt`; a timeout error names the command and how long it waited.
- **The iPad's phases** — the copy with the watcher, the server, `safaridriver --enable`, its launch and answer, each attempt at a session, and on a failure of the device — the closing and the launch of Safari. The page's iPad job writes the pages' copies and starts their servers before Simulator boots, and both iPad jobs stop the simulator and the servers before their files are kept.
- **Whose failure.** A step of the driver is the device's or the page's (`emulators/run.ts`). A failure of the device — the emulator, the browser, the download, the session, a button that Chrome covered with its offer to translate the page — gives one more pass, a failure of the page brings down the run at once, and the job's result names whose it is. A recovery between the passes that throws does not end the build's run: `passes` of `emulators/volunteer.ts` logs it and makes the second pass all the same. On the iPad the recovery launches Safari anew even when there is no Safari left to terminate; on Android, before Chrome is stopped — between the passes and before the test build —, an emulator that adb reports offline is reconnected and waited for up to 60 s, and the forward and the reverses of `emulators/android.sh` are set again either way, each adb command of it within 15 s, since a forward goes with the connection it was set on (sources 7.11).
- **A frame before each stroke.** A failure of Safari in the iPad Simulator to render is the device's, not the page's. Before each stroke the driver asks the page for two frames (`PAINT`) and waits for the second up to 20 s (`PAINTED`): the element that the choice of a task gave is laid out only in a frame. No frame — the device's step "the page renders … before the stroke", and the run goes to a second pass. Likewise, if the page stops answering the driver while it waits for the file, this is a step of the device, not "the file was not passed". `emulators/volunteer.test.ts` holds it — a device without frames and a device that is silent while the file is passed give the verdict `device` —, and `emulators/watch.test.ts` runs both scripts in Chromium after a change of task.
- **The policy in the page itself.** The drivers read the `<meta>` of the page's policy and require `default-src 'none'` and `connect-src 'none'`. Under it any request of the page is a violation that the watcher sees. Without it the request goes out, and Safari does not count a failed request in `performance`, so on an iPad only this check would see it.
- **The site icon.** Safari itself asks the server for `/favicon.ico`, and the policy stops it as a picture not from a blob: this is neither a request nor a violation of the page, and the drivers name it separately.
- **Checked red**, by two temporary commits:
  - the page asks for `https://probe.invalid/leak` at start under its policy — the run is red with "a failure of the page": both devices saw `connect-src` to this address. The first run showed that the watcher in Safari does not see this after loading — hence the copy with the watcher written in;
  - the builder does not set the policy — Android saw the request itself in DevTools, and the iPad the absence of the policy.
- **The sample files** are read by `emulators/saved.ts` in the `toolchain` stage: the author's measurement, an adult, a person, the page's version, `draft-0`, the task, the writing history, a sheet and a workbook with one writer code. `sample-check` waits for the page's markup: without the markup it does not accept a file. The strokes are drawn by the code, there is no handwriting in the run; the screenshots, the reports and the files are artifacts for seven days.
- **The emulator's download.** `curl` exit 92, "HTTP/2 stream 1 was not closed cleanly", in run 43918725520, is the download of the emulator from `dl.google.com` by `reactivecircus/android-emulator-runner`, before the driver runs: the action does not retry it, and a rerun of the job is the remedy. The iPad job with no runner is GitHub's.
- **Licenses.** The emulator, the system image and `platform-tools` are under `android-sdk-license`, and Chrome in the image is on Google's terms. Xcode, Simulator, Safari and `safaridriver` are on Apple's terms, free ones. These are tools of CI on free terms: NovaTrail does not distribute them — the action installs the Android ones on the runner, the Apple ones are on the runner's image, and they go into neither the image nor the release —, and it builds without them, like Chrome Headless Shell in the container, under `spec`'s rule for a CI tool that never ships. This is the named exception — here. WebDriverAgent is BSD, OSI, and is shipped nowhere either; `actions/download-artifact` v8.0.2 by SHA 9000827 is MIT.
- **The CodeQL findings** `js/http-to-file-access` — #10 in `probe/android.ts`, #20 and #21 in `probe/ipad.ts` — are closed as "used in tests": the drivers are tools of CI, and what they read — the probe's report from the emulator by `JSON.parse`, what WebDriverAgent shows on the screen and the probe's report on the iPad — they write into files with constant names in the artifact's folder. Nothing of this ships.

— *Why:*
- **The emulators** — the author has no tablets, and the emulators answer the software part of the probe's checklist on devices; the iPad Simulator and Safari on macOS, by the author's choice, beside Android.
- **The local server** — a pre-release for each version of the probe would burn the tag's name forever: `canvas`'s releases are immutable, and the tag name of a deleted release can no longer be taken; and the check of the page's build on every pull request needs a path without a release.
- **The iPad by http from the runner** — from a file the page's script does not run there, and there would be nothing to check.
- **The workflow on every pull request with the job `changes`** — so that the one required check stands on every pull request.
- **Not the iPad on a pull request.** The iPad job takes 7–10 minutes even with the waiting by deadline — the queue of macOS runners and the spread of Simulator's boot and of Safari's launch, from 15 s to over two minutes —, and waits about five more for a macOS runner, while its driver's work takes about two. A pull request waits only for Android, and what only Safari sees is checked by the run on `main` — after the merge, but before the release; the tablets themselves are the check on devices.
- **Waiting by a deadline** — by the phases the runs record, the check of the page on a device takes about a minute, and the run 10–11. A loop "for 3 s" of `uiautomator` dumps of 2–3 s each and a second of pause ran 10 s — after each «Сохранить» on Android —, and the search for a button "for 10 s" waited about 50 before giving the pass to the second round. In a run of pull request #97 `POST /url` hung for 90 s, and the other commands answer in a second or two.
- **The page's point from the page's view** — on `main` two runs failed alike: the first pass of Android did not find the save button — the `uiautomator` tree showed the top of the page even after the repeated scrolling —, and in the recovery `am force-stop` went into "device offline", and there was no second pass.
- **A frame before each stroke** — the iPad run on `main` (42704340066) failed twice. The first time the choice already showed the workbook, the file named `workbook-01`, but Safari drew no frames for a few seconds — the screenshots still showed the sheet —, and the stroke did not find a laid-out element: "0 strokes", a step of the page, no second pass. The second time the page stopped answering `execute/sync`, and the wait for the file recorded this as the page's refusal. The runs by hand on the code with three tasks and with a choice without groups both passed, and in both a failure of the device cut the first pass short: the simulator is unstable without the choice too, and the choice's groups do not look like the cause. Checked by a run of `page.yml` by hand.
- **A recovery that throws** — the failures of `page.yml` on their own (Д14) were the device's, and the second pass that such a failure gets never came. On Android, in runs 43822399771 and 43969547401 of 2026-11-16, adb lost the emulator — "adb: device offline" — and the recovery's `am force-stop` threw; on the iPad, in run 44004991840 on `main` of 2026-11-17, Safari drew no frame in 20 s and the recovery's `simctl terminate` threw, Safari no longer running. Either throw went past the passes and failed the build's run, while on the iPad the test build's run after it passed.

— *Rejected:*
- **a pre-release per run** — the tag names of immutable releases do not come back, and each change of the probe would wait for a confirmation;
- **`adb push` of the file into the downloads** — that way neither the download nor how Chrome opens it can be checked;
- **Playwright `_android`** — the driver would need the Playwright package, and one DevTools message `Runtime.evaluate` through `adb forward` reads the report anyway, by Node's built-in `WebSocket`, without a single dependency;
- **the image `google_apis_playstore`** — Chrome is in `google_apis` too, and that one is a debug image, `ro.debuggable=1` by the run, and Chrome reads flags from the file; whether the image with Play is a debug one the run did not check;
- **an emulator in the development container** — it has no `/dev/kvm`, and the container's template is `spec`'s;
- **Appium** — it would add a tree of npm packages on the runner, and WebDriverAgent answers over HTTP by itself;
- **an XCUITest of its own** — an Xcode project written without Xcode at hand;
- **the files through `simctl` from the start** — that way neither the download nor the question it asks can be checked, and with the download both were checked where it landed;
- **the iPad from a file through WebDriverAgent** — the page does not run its script there, as the iPad probe showed, and there would be nothing to check;
- **the watcher in Safari after loading, through `safaridriver`** — it does not see the violations of the page's first instant;
- **WebDriverAgent for iPadOS 27** — the page's scripts are not visible to it: no violations, no requests, no sample file — and ten more minutes of build in every run;
- **iPadOS 27 as a red job, not counted in the summary** — a red cross on every pull request and eleven minutes of macOS for nothing;
- **a filter of paths in `on:`** — the workflow would not start at all, and the required check would hang;
- **the check of each job required** — the name of a job with a matrix skipped by `if` is not expanded;
- **the iPad on every pull request** — 12–15 minutes of waiting with the queue;
- **a larger macOS runner** — it is paid, and nothing that costs money goes in without the author's confirmation;
- **a cache of the Android emulator and system image** — `reactivecircus/android-emulator-runner` v2.38.0 always calls `sdkmanager --install` and downloads the emulator's zip by `curl` (`src/sdk-installer.ts`, lines 52–78), so a cache will not remove a break of dl.google.com, and the Android job, about six minutes without it, is not on the longest path anyway;
- **booting Simulator in the background** — before it run only Node and the page's build, about 15 s;
- **shorter WebDriver timeouts** — Safari's session in Simulator took 23 s at one time and about two minutes at another, and a failure by timeout gives a second pass anyway;
- **repeating the recovery until it succeeds** — the second pass already tells whether the device came back.

— *Revisit:*
- when tablets appear — a step on hardware by the checklist on devices (Д7);
- if the image's Chrome grows so old that it parts from the volunteers' tablets: in image 36 it is 133, and there is nothing to update it with in CI;
- if a way appears to press "Download" reliably in the simulator's Safari — remove the files that the driver puts in;
- if macOS on the runner lets Safari's window render or gives a consent to AppleScript — read Safari's report on macOS, as on the others;
- when `safaridriver` on the image with Xcode 27 finds a session in Simulator — bring back iPadOS 27;
- when the page gives the markup — `sample-check` in the job `saved`;
- when В64 is answered — open the page on the iPad as the answer decides.

— *Consequence:* the probe's jobs and the page's check share the drivers' common parts of `emulators/`.

— RUN.md, the tasks of the probe in the Android emulator, of the probe in the iPad Simulator and Safari on macOS, of the page's build in the emulators, of the page's steps for an adult and of the devices, and table 3; [architecture.md](architecture.md), the format of the samples by the eval protocol, the samples page's steps, the code and tools, and the sources; `.github/workflows/emulators.yml`, `.github/workflows/page.yml`, `emulators/`, `probe/serve.ts`, `probe/serve.test.ts`, `probe/android.ts`, `probe/android.test.ts`, `probe/android.sh`, `probe/probe.js`, `probe/page.html`, `probe/ipad.ts`, `probe/ipad.test.ts`, `probe/ipad.sh`, `probe/simulator.ts`, `probe/simulator.test.ts`, `probe/safari.ts`, `probe/safari.test.ts`.

## The samples page

**R55. The samples page is built by `node scripts/page.ts <folder> <version>` into one file `samples-page_v<version>.html`: Vite's JS API bundles `page/main.ts` with the element and the sample file's module `src/eval/` into one script, and the builder embeds it and the style of `page/index.html` into the page with a policy without network by their hashes — the same as that of the probe of a page opened from a file (`scripts/csp.ts`). The builder puts into the bundle all the tasks of `tutor`'s file in `tasks/` with the references to them, and the text sets of `spec`'s release file `legal-1.tar.gz`. The license notices of all the code the file carries are in the file itself, and a package with a license off the list stops the build. `release-files` puts the page into the release.**
- **The builder** — Vite 8.3.6 from the lock file: its JS API in library mode, `format: "iife"`, without writing to disk, `target: "es2022"` and `minify`. There are no new dependencies. Vite and Rolldown, with which it bundles, are MIT; `lightningcss` takes no part in the build: the bundle has no CSS — the element's styles are `adoptedStyleSheets` —, and the page's style is embedded as it is. So the named exception of the license check for `lightningcss`, which is read again if Vite minifies the CSS of the page that ships, is not read again.
- **In the release** — `release-files` builds the page with this builder. Two builds of one tree give the same bytes, the builder's test holds this, so the page's sum in `SHA256SUMS` can be repeated. Vite takes the options of TypeScript from the file's program through `tsconfig.json`: a change of an option in `tsconfig.element.json` changes the page's bytes, so it and `tsconfig.core.json` — the programs of what the bundle carries — stand among the release's paths, and `tsconfig.node.json` does not.
- **One file.** `<meta charset="utf-8">` at the start, the policy in a `<meta>`: `default-src 'none'`, the script and the style by hashes, `img-src blob:`, `connect-src 'none'`, `base-uri 'none'`, `form-action 'none'`. Not a single address: no `src`, no `href`. The build refuses if the template or the bundle has a control character other than a tab and a line feed — the parser would change it before the hash —, if the bundle carries `</script` or `<!--`, and if the template does not have exactly one place for the policy, the script and the notices.
- **The tasks.** `openTasksOf` requires a synchronous SHA-256, which the page does not have, so the builder loads `src/eval/tasks.ts` through Vite's `ssrLoadModule`, checks `tutor`'s file against its sum, as the synthetic samples do, and puts into the bundle the open views of all its tasks — 56, bank after bank, and in the choice a group per bank — with the sample's references to them. A field outside the open view at any depth and a picture in the statement stop the build.
- **The text sets.** The builder takes `spec`'s release file `legal-1.tar.gz` from `tasks/spec-<tag>/`, by its sum, reads it by its own reader `scripts/legal.ts` and puts into the bundle the current set of each purpose, the notice in blocks, and, while the measurement has no set, the draft `draft-0`. The reader's packages — ajv, yaml and mdast — work only in the builder, and the bundle does not carry them: the file has no license notices of theirs.
- **The notices** — a `<details>` block at the bottom of the page: the license of `canvas`, each package of the bundle — by the folders of its modules in Vite's output, one nested in another's `node_modules` too —, `@altnovatrail/contracts` (Apache-2.0), `@bufbuild/protobuf` (Apache-2.0 AND BSD-3-Clause), `perfect-freehand` and `rbush` (MIT), `quickselect` (ISC) — with the text of its license, and the NOTICE of the set Material Symbols, from which the element's icons come. A package's license must be in the builder's list, and its text in its folder or, if the npm package does not carry it, as a copy in `page/notices/` by name and version: so for `@bufbuild/protobuf` 2.17.0, whose text `page/notices/bufbuild-protobuf-2.17.0.txt` is taken from its repository at the tag v2.17.0, commit 01a8c3b — LICENSE and the BSD-3-Clause header of `varint.ts` (sources 6.10). A new version without its own text stops the build. This is the check of what the build carries — in the builder and its test, not in `ci-licenses`. The helpers of the notices — the list of licenses, the bundle's packages, the kept texts and the check `carried` — are in `scripts/notices.ts`, which the builder of the generator of a module's eval set takes too.
- **The page** — a choice of task, the element with it, the button «Сохранить образец (без разметки)»: a sample file of the author's measurement by the protocol, through `sampleOf` with the writing history, an ID from `crypto.getRandomValues`, a writer code — one per opening of the page, shown so that it gets written down —, the version of the texts and the page's version, and `<a download>` with a blob, as the probes on a computer and on Android checked (measurements 1.1, 1.2). There is no markup in the file: the protocol requires it — `sample-check` answers "the markup has no truth" —, and the markup on the screen comes with the page's steps. `readSample` reads the file.
- **The version of the texts** — the draft `draft-0` while the measurement has no set, not `none`: the text of `spec`'s contracts on the sample file, [spec/contracts/README.md](../spec/contracts/README.md), leaves `none` to the files that the page did not write, and "the page MUST NOT name a set of texts `none`".
- **A change of task** with unsaved writing asks for confirmation: otherwise the strokes would vanish silently.
- **Where it works** — a computer and Android (measurements 1.1, 1.2); on an iPad — no: "Files" shows the page in Quick Look without its script (measurements 1.3), so only the page's HTML itself can say so: the template has a paragraph `#no-script` — «Если на странице только этот текст, она здесь не работает…» —, and the page's script, where it runs, removes it first of all. By `spec`'s decision on the samples page, the first measurement is on computers and Android, and the page opened on an iPad says that it cannot be opened here; the page goes to no hosting yet, and it will go as a separate site with its own origin.

— *Why:* the recommendations of the page's planning, which the author took: Vite and a script of its own; a sheet and a workbook with a real file of tasks; the page in the release through `release-files`; a file without markup, which `sample-check` does not accept, until the page gives the markup.

— *Rejected:*
- **`vite-plugin-singlefile`** — a new dependency, and the policy's hashes would still have to be computed by ourselves;
- **a recipe in the `justfile` before the page goes into the release** — the `justfile` is among the release's paths, and the merge would release a new version of the package with no page in it;
- **synthetic tasks, from fixtures** — the sample's reference to a task would not be real, and `sampleOf` requires it;
- **`openTasksOf` in the page** — the page has no synchronous hash, and an asynchronous one would change the module's API for the sake of one place;
- **the raw history instead of a sample file** — what was saved would not be a sample.

— *Revisit:* when the page gives the markup — the file passes `sample-check`, and the test checks it; when the build carries the media of the measurement's tasks — the notices name the media too.

— *Consequence:* the steps and the markup on this page; the measurement's tasks and their media in the same build; `release-files` calls the builder, and the release's paths take `page/`, `scripts/page.ts`, `scripts/csp.ts`, `tsconfig.element.json` and `tsconfig.core.json`; the emulators run this build.

— [architecture.md](architecture.md), publication and release, the samples page's steps, and code and tools; `page/`, `page/notices/`, `scripts/page.ts`, `scripts/page.test.ts`, `scripts/notices.ts`, `scripts/legal.ts`, `scripts/csp.ts`, `probe/build.ts`, `biome.json`, `tsconfig.element.json`, `tsconfig.core.json`.

## The markup of a sample on the page

**R56. The samples page marks up a sample after writing and saves it only when the markup is enough: a sheet — by the parts of the solution from the device's groups, which the writer merges, with the kind, the text, the flags, the first error and the final answer, as written; an essay — by its text, as written; a workbook — by each box of the page. `page/markup.ts` builds the markup from the form by the eval protocol and names what it lacks, by the same rules by which `sample-check` holds the file. The page remembers nothing, and its screens are only in Russian: the texts that the script writes are in `page/texts.ts`, and the few constant words — a heading and two labels — are in the template `page/index.html`, where both a screen reader before the script and the check of SonarCloud see them.**
- **The order on the screen.** Writing, «Разметить», the form, «Сохранить образец». «Разметить» takes the element's work — `exportWork()`: the crop of the sheet with the groups or the crops of the filled boxes — and shows the crop that the model will see. A new stroke after that changes the groups, and the form goes away: the markup is asked for anew. «Кто писал» — in one's own handwriting or imitating a child's — is set for each sample, and «на листе нет ничего личного» is confirmed for each.
- **A sheet.** The parts at first — a group per part, by the labels A, B, … by place, by the same rule of groups as the device's and `tutor`'s measurement. The writer merges a part with the next one, splits it into groups and rearranges the parts into the order in which the solution is read. A part has a kind, text or drawing; the text as written, or the drawing in words; «зачёркнута», «написана неразборчиво нарочно» and «итоговый ответ задачи». «Показать на листе» draws the group boxes of the part as marks of the element with the anchor `{ group }`. A group in which two parts mixed the writer erases and writes anew: there is no selection layer of its own.
- **The truth of a sheet** — of its one answer place, `anywhere` — is derived from the parts: without strokes — `UNREADABLE_BLANK`; without a final answer — `UNREADABLE_NO_FINAL_ANSWER`; two final answers or more — `UNREADABLE_SEVERAL_FINAL_ANSWERS`; one, written illegibly, — `UNREADABLE_ILLEGIBLE`; one with a mirrored digit — `UNREADABLE_AMBIGUOUS`; otherwise — the final answer as written, which the page offers as the part's text. The place's notes are «зеркальная цифра» and «зачёркнуто и написано заново».
- **An essay** — by its text, as written, or «не прочесть целиком», and a sheet without strokes as empty. It has no parts and no marks, and the page sets no criteria's marks: `marks` are empty, the organizer adds them.
- **A workbook** — each box of the page by place, in the task's order: an empty one — `UNREADABLE_BLANK`, a filled one — the value as written, «неразборчиво» or «можно прочесть по-разному», with the box's crop and a frame `{ cell }` on the page.
- **What is lacking** the page names before saving, and the save button is disabled until then: the text of a part, a final answer in a part not crossed out, the first error of a part not crossed out, the final answer, the value of a box; each group in exactly one part. So the page does not save a file that `sample-check` will reject.
- **The page's examples** — `examples/page-sheet-measurement.json` and `examples/page-workbook-measurement.json`: the test `page/markup.test.ts` writes them by a synthetic sheet and a synthetic page of a workbook, and `ci-licenses` holds them by the recipe `sample-check`, like the examples of the sample file. In the emulators the drivers mark up through the page's form, and the job `saved` of the page's check runs `sample-check` on the saved files.
- **The code** — in `page/`, not in `src/eval/`: `src/*.ts` is a path of the release, and the merge would release a version of the package with no page in it.
- **The page is not translated:** `translate="no"` and `<meta name="google" content="notranslate">`. Automatic translation would distort the form's texts, and Chrome's offer to translate the Russian page in the Android emulator covered the save button and cost the run a second pass.
- **The emulators faster and without random failures** — the check of the page's build in the emulators goes thus:
  - each device builds the page itself, and Android's files are checked by its own job — no job waits for the build, and only the iPad's files wait for a short check where the `buf` of the `toolchain` stage is;
  - the probe of a page from a file — on a computer, on Android and on an iPad — runs on its own changes and by hand, not on every change of the drivers' common parts: its question is closed, and the common parts are checked by `page.yml`. Its job on WebDriverAgent ran up to 13.5 minutes and failed most often;
  - the warm-up of Chrome waits for Chrome on the screen, not for words, which an empty page does not have: the wait for words ate two minutes of each run;
  - the settings of Safari's automation are written into Simulator before its only boot, and Safari is launched before `safaridriver`: without this the sessions do not find Safari. Its own window beside the session's window took WebDriver's touches, and the strokes are drawn otherwise (below);
  - a stroke on the iPad is drawn by the pointer events of the page itself — `strokeBy()`, like a finger's touch: WebDriver's actions in Safari Simulator three times went into a window other than the session's or did not reach the page, and the mouse hung after them. The element takes such events as a finger — this is checked in Chrome Headless Shell; the native input of pen and palm is hardware (Д7).

— *Why:* without the markup `sample-check` does not accept the page's file — "the markup has no truth" —, and `tutor`'s runner has nothing to measure on it. How the markup looks on the screen was left open with the page's steps, and the steps together with the markup are more than one check: so the markup comes first, as a step of its own, and everything here is by the recommendations of its planning.

— *Rejected:*
- **selecting strokes with a lasso** — more flexible, but it needs a selection layer of its own over the element;
- **a button «следующая часть» while writing** — the strokes that cross out the earlier part would get into the new one;
- **an unfinished sheet in the storage** — the storage of a page from a file cannot be trusted, and in Chromium any local HTML file will read it (sources 3.6, measurements 1.2);
- **the screens in English too** — nobody will check these texts until a lawyer reads them;
- **the criteria's marks of an essay on the page** — they are set by the organizer, not by the page.

— *Revisit:* when the markup of parts from groups is not enough for the volunteers — the selection of strokes.

— *Consequence:* the page's steps around this markup; their check on devices.

— RUN.md; [architecture.md](architecture.md), the sample file, the samples page's steps and the code and tools; `page/markup.ts`, `page/markup.test.ts`, `page/texts.ts`, `page/main.ts`, `page/index.html`, `scripts/page.test.ts`, `examples/`, `emulators/volunteer.ts`, `emulators/watch.ts`, `.github/workflows/page.yml`, `vitest.config.ts`.

## The cache of the `toolchain` image in the emulators' CI

**R57. The jobs of the emulators' workflows that run in a container of the `toolchain` stage — `android` and `ipad-check` in `page.yml`, `android` in `emulators.yml` — take its image from the cache of GitHub Actions as `.github`'s shared workflows do: the file `${{ runner.temp }}/novatrail-toolchain.tar` and the image `novatrail-toolchain`, which `spec`'s `toolchain.sh build` loads from the file named by `TOOLCHAIN_IMAGE_FILE`, and without the file builds from `.devcontainer/Dockerfile` and saves into it, as `documents.yml` does; the canvas repository keeps no script of its own for it. `actions/cache` puts the file into the cache and takes it out by a key of the runner's OS and architecture and the Dockerfile's sha256. Only a push to `main` saves the entry, which every pull request reads; the run of `page.yml` on a push to `main` by the paths of the job `changes` fills it, unless CI's job `toolchain` or `documents.yml` has saved it first. The checks that run no browser — CI's "TypeScript / lint", "vuln" and "licenses", and `documents.yml` — take the image of the stage `toolchain-core` by a file and a key of their own; the emulators' jobs keep that of `toolchain`. The scripts of the iPad Simulator write the start time of each phase.**
- **The key and the rule of exact versions.** The Dockerfile pins everything it installs: the image by tag and digest, the archives by sha256, the apt packages by the ID of a snapshot of the Ubuntu archive. So the image from the cache is the one that this Dockerfile would build, and the key is its content, `toolchain-<OS>-<architecture>-<sha256>`, the key of the shared workflows (sources 6.14). A change of the Dockerfile gives a new key, and the image is built anew whole; Dependabot raises the base image rarely, once a week at the most often. The key takes the whole Dockerfile, the stage `devcontainer` too: a change of it will build the same image anew, and a key by one stage would require a step of its own that cuts it out.
- **The core's image.** CI's "TypeScript / lint", "vuln" and "licenses" and `documents.yml` take the image of the stage `toolchain-core` from `${{ runner.temp }}/novatrail-toolchain-core.tar` by the key `toolchain-core-<OS>-<architecture>-<sha256 of the Dockerfile>`, which only a push to `main` saves, as the shared workflows read the Dockerfile (sources 6.16). `page.yml` and `emulators.yml` keep the image of `toolchain`, by the path and key above: their jobs `android` run the browsers. A Dockerfile keeps two entries on `main`, `toolchain` and the core.
- **Without the network.** On a hit the Dockerfile is not executed: nodejs.org, the snapshot of the Ubuntu archive and Playwright's image are not needed. On 2026-11-09 nodejs.org twice answered 504, and the Android job failed.
- **The saving** — by the step `actions/cache/save` right after the build, not at the end of the job: the built image is good even if the emulator fails later, and such a run will fill the cache too. The step runs only on a miss and only on a push to `main` — CI's job `toolchain`, `documents.yml` or `page.yml`, whichever is first, and the others find the entry saved —, and takes the key from the output `cache-primary-key` of the restore step. A run that saves nothing is not handed `TOOLCHAIN_IMAGE_FILE` without a file from the cache, so it only builds. `emulators.yml`, which runs on no push, saves nothing. After `docker load` the script holds that the file gave the image `novatrail-toolchain`; a file that did not load or gave another image is deleted, and the stage is built with a GitHub warning and writes no file — the cache entry already exists, and a save would not replace it —: a spoiled entry in the cache brings down not the run but only its speed. A failed `docker save` is a warning with no file, and the script succeeds: the image is there. The loaded file is deleted at once, and the saved one by the next step: the emulator needs disk.
- **The cache's scopes.** A cache saved in a pull request is seen only by that pull request, and the cache of `main` by all pull requests; a pull request writes no entry. Into the scope of `main` only the jobs that run on `main` write — code merged into `main`, and actions pinned by SHA: a pull request, someone else's from a fork too, will not substitute the cache of `main`. The image from the cache is checked against nothing — the build is not reproducible byte for byte —, so the entry of `main` is held by the same as all the code on `main`: review and pinned actions. GitHub erases a cache after a week without access, and then the pull requests build the image until a push to `main` saves it again.
- **The warm-up** — `on.push` of `page.yml` on `main` with the paths of the job `changes`, the same list in the syntax of a filter; a comment at each of the two lists says to change them together. `spec` is in these paths: its `toolchain.sh` builds the stage. On a push the job `changes` answers "check", and the run is full: along the way the emulators check `main` itself after the merge. For a public repository the runners are free.
- **The steps — right in the workflow**, three times, not as a composite action of its own: Dependabot `github-actions` with `directory: /` looks at `.github/workflows`, and an action in another folder would require a change of `dependabot.yml`. The probe's job `android` checks the submodule out too, for the script.
- **WebDriverAgent's build** — the probe's iPad job takes it from the cache of GitHub Actions, by the entry on the speed of the emulators' CI: a build from the cache that is of another commit or does not start is built anew, so such an entry costs a run its time, not its result; one that starts and then fails is deleted by hand. The scopes are those above; `emulators.yml` runs on no push to `main`, so a run by hand there fills the entry every pull request reads.
- **The iPad's phases.** `emulators/simulator.sh` and `emulators/page-ipad.sh` write the start time of each phase — the choice of the device and the runtime, the creation of Simulator, the boot, the wait for its end, the launch of Safari, the server and `safaridriver`, the driver — into the job's log and into `phases.txt` of the artifact, and after them each line of the driver with its time: the attempts at a session and the steps. In the first run with them (pull request #97) the wait for the end of the boot took 1 min 42 s, `xcodebuild -version` for `versions.txt` 57 s, Safari, the server, `safaridriver` and the session 65 s, and the pass that failed by a device timeout, with a new session, 4 min 4 s more. In the run before it the iPad job waited 6 min 51 s of 9 min 13 s for the first session of `safaridriver`, and where these minutes went the log did not show.
- **The license.** `actions/cache` v6.1.0, commit 55cc834, is MIT: an action of CI, it ships nowhere.

— *Why:* the measurement of the run "Samples page" of pull request #96 showed: the longest path is the iPad job, 9 min 13 s, and after it `ipad-check`, 1 min 33 s, of which the image was being built 77 s; the Android job 5 min 39 s, of them the image 80 s. One path and one image's name with the shared workflows, and `main` alone saving, give a Dockerfile one entry of each stage: the same key saved under three paths, `toolchain.tar`, `novatrail-toolchain.tar` and `build/toolchain.tar`, and by pull requests too, kept `canvas` at the limit of the cache, 12 entries and 10 781 MiB (measurements 3.1 spec).

— *Rejected:*
- **a cache of the AVD with a quick-boot snapshot** — the Android job runs in parallel with the iPad's and is 3.5 minutes shorter, so it will not shorten the run, and a spoiled snapshot would hang the emulator's boot;
- **the caches of `npm`** — `npm ci` with the page's build takes 5–6 s on both Linux and macOS;
- **buildx with the cache `type=gha`** — `docker/setup-buildx-action` and `docker/build-push-action`, Apache-2.0, cache the layers one by one, and a change of the Dockerfile would rebuild only the tail. But these are two actions instead of one, and the image is still exported into Docker by a load;
- **a light warm-up job of its own** — only the image and its saving on a push to `main` with a change of the Dockerfile: cheaper than a full run, but one more branch of conditions in the workflow, and the emulators would then not check `main` after the merge. A full run accesses the cache along the way and keeps it from the weekly erasure;
- **`emulators/toolchain.sh`, a script of its own with the shared path and name** — a second copy of `spec`'s `toolchain.sh`, kept in step by hand; its own path and image's name were all that set it apart, and with those of `spec`'s script nothing of its own is left in it;
- **saving from a pull request** — its entry is read within that pull request alone, and such entries, 928 MiB each, kept the cache at its limit (measurements 3.1 spec); the shared workflows save from `main` alone. The cost: a pull request that changes the Dockerfile builds the image in each workflow, on each push — CI once, by its job `toolchain`, which builds the core too, `documents.yml`, and `android` of `page.yml` and of `emulators.yml`; the Dockerfile changes by Dependabot's base image or Playwright, about once a week at most;
- **`ipad-check` in the core** — it runs `sample-check` alone, which the core holds, but in a run that changed the Dockerfile it would build a second image for one job, while the entry of `toolchain` that `android` reads serves it on a hit;
- **a change of the shared workflows of `.github` from here** — another repository is not changed from here; `spec` took the question, and the shared workflows and `spec`'s `toolchain.sh` take the cache of the `toolchain` stage's image by the sha256 of the Dockerfile.

— *Revisit:* when the iPad's phases show where the minutes before the session go — speed them up by a task of its own; if the Android job becomes the longest path — the AVD cache; if the download of the emulator and of the system image from dl.google.com brings down runs — their cache by a pinned build: on 2026-11-09 a break of this download already brought down one job.

— RUN.md, table 3; the entries on the probe on Android, on the samples page's markup and on the speed of the emulators' CI; [architecture.md](architecture.md), code and tools; `.github/workflows/page.yml`, `.github/workflows/emulators.yml`, `emulators/android.sh`, `emulators/simulator.sh`, `emulators/page-ipad.sh`, `.claude/rules/page.md`.

## An adult's steps on the samples page

**R58. Before writing, the samples page takes an adult through «Начало»: the purpose — a measurement or a module's eval set —, the writer code for a measurement, the notice of the purpose with the version of its text set, and the declarations without which one cannot go on. Which purposes are open is decided by the text sets the build carries: each purpose has its own set from a release file of `spec`, a purpose is open with its current set, and the measurement, while it has none, by the author's draft `draft-0`. The builder puts the test part of sets only into a page of version `0.0.0`. What was started holds until the page is opened anew, and the page keeps it nowhere. The child sample session runs from the same «Начало» by an entry of its own.**
- **Text sets** — each purpose has its own set from a release file of `spec`, in the part `legal`, as the entry on the page's text sets has it: the measurement's, the eval set's and the child sample session's. A set gives its purpose the notice and the version; a set of the page carries no status `draft` or `approved` of its own. The declarations and "where to hand over the file" are words of `page/texts.ts`.
  - `page/sets/` holds only the author's draft `draft-0`, for the measurement alone: it has neither the eval set's texts nor the session's. `page/sets.ts` holds its format, the builder checks it by the same rules, and its version is one the sample file allows: 1–32 Latin letters, digits, dots and hyphens, but not `none`.
- **Purposes** — by the table of purposes in [architecture.md](architecture.md) and by the build's tasks, `page/steps.ts`:
  - a purpose is open with its current set; one without it is closed and named with the reason. While the measurement has no current set, it is open only for the author's samples, by the draft — as is said beside it;
  - the eval set takes only modules' tasks: a module's eval set takes samples only of its own module's tasks, with the source `modules`, as `spec`'s contract of eval sets has it, and a sample of a `tutor` task would be rejected there. The build carries modules' tasks, so the eval set has one reason left to be closed — the set `eval-set` with no version in force;
  - the choice of task after «Начать» picks tasks by purpose: for the eval set only modules' tasks, for the measurement and the child sample session only the tasks of the file of `tutor`. A module's group of tasks is named «Модуль <ID> <версия>», and an instance of a template is named with its seed: «Лист: <ID>, зерно N».
- **Declarations** — «мне 18 лет или больше» and a second one: by the author's draft, «я автор проекта и пишу свои образцы», with a current set, one about the consent form of its version. Choosing another purpose asks them anew.
- **Writer code** — for a measurement only: «ввести свой код» or «новый писавший». The page accepts an entered code regardless of case and spaces if it is of 6–16 digits and capital Latin letters. A new one it shows and asks to be written down. The eval set has no code: its sample is published, and a code would link the samples.
- **«Начать»** is disabled while something is missing, and the page names what. After it, «Начало» folds into a line — the purpose, the code, the version of the set —, and they can be changed only by opening the page anew, with a question if what was written is not saved. The page touches no browser storage: after a reload it remembers neither the purpose, nor the code, nor the declarations, and the storages are empty — so the page's test checks.
- **«Открыть образец»** — a block of its own below «Начало»: it opens a sample file for viewing, with no purpose, code or declarations, as the entry on viewing a sample file has it, and goes away together with «Начало» once writing has begun.
- **After saving**, the page says where to hand over the file: a measurement sample to the organizer; an eval-set sample to the organizer by an upload link, and the organizer adds it to `modules`, by `spec`'s decision on the volunteer's form of an eval set and its route — the writer opens no pull request. The sample file of any purpose is named `<id>.json`, not `sample-<id>.json`: that is how it lies in a module's `eval/`, and the organizer renames nothing.
- **The test part.** The builder takes `--texts <folder>`, the folder of the test part `page/sets/test/`, in the layout of `legal`, with the sets `test-measure`, `test-eval-set` and `test-child-sample` in force. It puts the part only into a page of version `0.0.0`: `canvas` never has such a release, by `spec`'s contract of the sample file, so the release does not carry the test part. The page's test builds both builds: with the test part the measurement asks for the declaration about the form.
- **The texts** of the sets are drafts until the author approves them in epic E4 of `spec`: the platform has no lawyer, and legal questions are decided by the author on Claude's analysis; the author proofreads the page's texts after the merge. The screen's texts are in `page/texts.ts`, and the fixed words of «Начала» are in the template.

— *Why:* the adult's steps and the child sample session are decided apart, the child's in an entry of its own; the test part comes by a flag of the builder; both as recommended. Each purpose has its own set, because the author approves the adults' consent (П-16) and the consent to a child's samples (П-10) separately, and a set approved for one may come before the other.

— *Rejected:*
- **a second entry point of the page with the test part** — two builds would drift apart more easily, and a flag with a refusal outside `0.0.0` holds the same with one;
- **changing the purpose or the code in the middle of writing** — the samples of one opening would mix purposes; opening the page anew is cheaper and more honest;
- **a code in the header for the whole opening** — anyone at a shared tablet would see it, and the entry on the samples page's purposes and consent has one enter one's own code or ask for a new one.

— *Revisit:* when the author approves the texts of epic E4 of `spec` — a set in force instead of the draft; when the eval set opens — test its path end to end, as the measurement's is.

— RUN.md; [architecture.md](architecture.md), the samples page's steps and the code and tools; `page/sets.ts`, `page/sets/`, `page/steps.ts`, `page/steps.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `emulators/page-android.ts`.

## The child sample session on the page

**R59. The page runs the child sample session from the same «Начала»: as the last choice, a group of its own below the adult's purposes. It is open only with the current set `child-sample` of the part `legal`, which carries the session's texts. The adult enters the child's code — the one written into the accepted form —, and a new code the page gives only for the form and starts no session with it. In the session the child writes and the adult does the markup; the file is a measurement, `WRITER_CHILD`, the final geometry and the code. Before saving, the page asks to check on an iPad that Safari's downloads land «На iPad», not in iCloud Drive; after saving, it says that the file goes to the organizer by the session's upload link, which works for 12 hours at most, and then off the device. The test build, with the test part of the legal texts, is built by `emulators/builds.sh` before the emulator; both jobs of the workflow `page.yml` go through the session on it, and it is kept as an artifact.**
- **Where on the screen.** The samples page's steps in [architecture.md](architecture.md) give the session "as a separate button, below". It is a radio button of the same group `purpose`, but in a nested group «Сеанс образца ребёнка», the last inside the choice of purpose, with the reason for closing beside it. A separate neighboring group with the same name would confuse the arrows, Tab and the count «3 из 3» of a screen reader. `page/steps.ts` holds the logic: `purposes()` gives a third entry, `child`.
- **The text set** — the current set `child-sample` of the part `legal` from `spec`'s release file, as every purpose has its own: the notice is `child-sample-notice`, and the version in the file and in the declaration about the form is `child-sample-<n>`.
- **The code.** The code step is shared with the measurement, but with its own words: «Код ребёнка», «ввести код из формы согласия», «новый код для формы — без ребёнка». The page shows a new code with the version of the text set — the form names it — and does not enable «Начать»: the session begins with the code of a form the organizer has already accepted, for the written consent is a form accepted before the first session. On a switch between the measurement and the session the code step is cleared, and the adult's and the child's new codes differ: they are the codes of two people. The session, like the measurement, always has a code (`hasCode`).
- **Declarations** — «мне 18 лет или больше» and «отдельная письменная форма родителя или опекуна этого ребёнка версии … с кодом, введённым выше, подписана и принята организатором» (П-10), the version being `child-sample-<n>`. The code is not put into the declaration's text: the declarations are redrawn on a change of purpose, not of code.
- **Writing and markup.** «Кто писал» is not asked in the session — the child writes —, and the page says: «Пишет ребёнок. Размечаете вы — со слов ребёнка, после письма». The eval protocol of `spec` defines a writing part's flag `illegible` as "written illegibly on purpose", and whether on purpose only the writer knows. Without the flag the adult could not mark a part of the child's that cannot be read, and the sheet's truth would be wrong: `UNREADABLE_ILLEGIBLE` is derived from the flag of a part with a result. So in the session the flag is there: on a child sample the protocol gives it the meaning «не прочесть и со слов ребёнка», as `canvas` recommended, and the page's label says the same, «написана неразборчиво — не прочесть и со слов ребёнка».
- **The file** — a measurement, `WRITER_CHILD`, the final geometry with no time and pressure, the child's code, no license, by the eval protocol's sample file; `sampleOf` writes it, as before. After saving, the page says where to hand over the file: to the organizer, with no pull request, by the upload link the organizer gave for the session, which works for 12 hours at most from the session, and once the organizer has received it, the adult erases the file from the device. `HAND_OVER.child` of `page/texts.ts` says so.
- **iPad and iCloud (В30; П-10).** The page does not see Safari's setting, and the adult who runs the session checks it: "Choose where to save downloads… Go to the Settings app on your iPad. Tap Apps, then tap Safari. Tap Downloads, then choose… On My iPad: Select this option to save downloads to the Downloads folder on your iPad" ([Customize your Safari settings on iPad](https://support.apple.com/guide/ipad/customize-your-safari-settings-ipad54f3cde6/27/ipados/27), the iPadOS 27 guide, read 2026-11-09). The guide's Russian page did not show this paragraph, so the page names the menu items both in Russian and in English. The phrase is in `page/texts.ts` and only in the session. By `spec`'s answer on child samples, the phrase before saving is enough if the notice and the form speak of Apple's cloud and of erasing the file; the platform has no lawyer, and the author decides such a question on Claude's analysis.
- **The test build** — `node scripts/page.ts build/page-test 0.0.0 --texts page/sets/test`, which `emulators/builds.sh` runs beside the release build, before the emulator, and the artifact `samples-page-test` for 7 days. The file in it is named as the release build is, `samples-page_v0.0.0.html`, and the artifact's name tells them apart. Both jobs of `page.yml` go through the child sample session on it, in a run of its own, after the release build, and `emulators/saved.ts` reads the child's files — `WRITER_CHILD`, the final geometry, the version `test-child-sample-1` and the entered code.
- **Who sees it.** Anyone signed in to GitHub can download an artifact of a public repository — for 7 days, from the run's page, not from the releases page. The barrier is not the build's secrecy but that its samples will reach no one: the texts say «тестовый набор, не для образцов», every file carries a version of the test part — the session's `test-child-sample-1` — and the page version `0.0.0`, which no release has, and the intake of files checks both.

— *Why:* the build is an artifact of CI, which stays inside the repository and lives 7 days; the phrase about the iPad stands in the child's session, for there the file is a child's data. The emulators go through the session on the test build, at about a minute per device. The place on the screen, the code only from the form and the session's own texts follow from the samples page's rule that the organizer accepts the written form before the first session and from the page's steps; a separate agent checked the design before the work.

— *Rejected:*
- **a pre-release of `canvas` with the test build**, as `t29-probe` was, — an action outside the repository, which waits for the author's confirmation, which moreover would have to be put up and deleted by hand for every run of the devices' checklist, and on the releases page, beside the real builds, it is easier to take for one of them. It differs from an artifact not in who can download it, but in where the build stands and how long it lives;
- **a session with a new code in the same opening** — the organizer has not yet accepted a form with this code, and the form comes before the session;
- **the phrase about the iPad in every purpose** and **no phrase while the iPad has no hosting (В64)** — the author chose the child's session: there the file is a child's data;
- **a separate radio group beside the purposes** — the same group in two neighboring sets confuses the keyboard and the screen reader.

— *Revisit:* when the author, on Claude's analysis, has decided the session's texts — a current version of the set `child-sample` — and whether its notice and form speak of Apple's cloud and of erasing the file, on which the phrase about the iPad is enough; when the iPad has hosting (Т-17; В64) — where the phrase stands.

— the tasks of the child sample session and of the devices in [plan/E5.md](plan/E5.md); [architecture.md](architecture.md), the samples page's steps and the code and tools; `page/sets.ts`, `page/sets/test/`, `page/steps.ts`, `page/steps.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.test.ts`, `.github/workflows/page.yml`, `emulators/builds.sh`, `emulators/saved.ts`.

## `spec` tag v0.12.0 and format 0.4

**R60. `canvas` is on `spec` v0.12.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, and the move takes the shared workflows of `.github` at v0.1.21, which later moves raise. The element reads module format 0.4 and only it, the workbook's layout follows the page and the vectors of `spec`, and a worked example goes onto the workbook too, by the entry on a worked example on a workbook. The page's build and the synthetic samples read the tasks file of `tutor`, the temporary source of Д4, by the element's format alone. What the tags v0.9.10–v0.12.0 require of `canvas` beyond the format is taken, and the two tasks of Д128 are in the plan.**
- **The submodule and the packages.** `spec/` is v0.12.0, commit 5b4640a, the latest release of `spec`; `gh release verify` accepted it. `@altnovatrail/spec` and `@altnovatrail/contracts` are 0.12.0, at exact versions, and `ci-licenses` checks their signatures, as it checks every package of `@altnovatrail` in the lock file. The types of 0.12.0 build with the code without edits: the fields of 0.4 are optional, none is removed or renamed, and `types/canvas` did not change. The devcontainer template of the kind `typescript` and RULES.md did not change between the tags.
- **`.github` v0.1.21** after v0.1.15, by the author's decision, — for the npm step that waits for the registry 20 minutes, not 5 (Д91 in the RUN.md of `spec`; sources 6.6); `gh release verify` accepted the release. `documents.yml` builds the image by the `toolchain.sh` of `spec`, and it is in `spec/`. v0.1.22 came with the move to `spec` v0.14.0, and v0.1.24 with the entry on the first code's versions (sources 6.13).
- **Format 0.4 in the element** (Д121, Д135 in the RUN.md of `spec`; `spec`'s COORDINATION.md names the format for `canvas`):
  - `FORMAT` is `"0.4"`: while the format is v0, the platform reads only its current version, "the platform reads only the current version", and a 0.3 manifest is a `TypeError` (sources 6.5);
  - the workbook's layout follows `format/page.yaml` and the test vectors of `format/vectors/pages/`, which the package `@altnovatrail/spec` carries as JSON, by the format's rules on the page and its vectors: the element's layout gives all 19 vectors, the refusals on the same item, and the numbers and the table of widths match `page.json`. The tests hold it to them, and `vectors/pages.json` is not written: the entry on the workbook's layout keeps it as its record;
  - the worked example on a workbook — by the entry of its own;
  - the format puts a numbered list (`numbered_list`) only into a lesson's `explanation` (sources 6.5), and `app` draws the explanations: the element shows a task and a worked example, but not an explanation. The numbered list is a part of `app` (Д121 in the RUN.md of `spec` and its COORDINATION.md; В69);
  - the copies of the format's examples and vectors in the tests are of the tag v0.12.0: a manifest of version `"0.4"`; for a task, a closed `leading_question` and the new examples `minutes-past-the-hour`, `who-is-shorter` and four invalid ones with an error in a closed `check`; for a lesson, an example on a workbook, its vectors and the rules `lesson.example-fills` and `lesson.workbook-page`.
- **The tasks file of `tutor`** is of format 0.4 from v0.1.22 of 2026-11-10, a file of open views (Д158 in the RUN.md of `spec`), and `openTasksOf` accepts only the element's format, `FORMAT`. At this move even v0.1.21 was of format 0.3 (sources 6.5), and `openTasksOf` accepted it with 0.4 and 0.3, `TUTOR_FORMATS`, as a named exception for the source of Д4, not a window of the element's versions: by the format's rule on moving a module, a 0.3 module moved to 0.4 keeps its open view, and 0.4 removed no fields. `spec` learned of it by row В70 of table 3 of RUN.md, and the exception went with `tutor`'s 0.4 file.
- **What the tags require beyond the format:**
  - В63 — the entry on the emulated devices (Д122): the image of the macOS runner goes into the iPad's `versions.txt`;
  - В64 — the entry on the samples page's build (Д130, Д132): a paragraph for an iPad where the page's script does not run;
  - В65 — the entry on the toolchain image of the emulators' jobs (Д146): `emulators/toolchain.sh` is compared with `spec`'s `toolchain.sh` once `spec`'s task that releases the shared toolchain script comes out, and the move to `spec` v0.14.0 compared it;
  - `spec`'s decision that the platform has no lawyer, which the entry on the samples page takes: the author decides by Claude's analysis; RUN.md and [architecture.md](architecture.md) are edited where "lawyer" read as a rule in force, and the log's entries and the archives are not. The texts of the notice and of the consent came out of `spec`'s E4 as the file `legal-1.tar.gz`, and the page's text set stands on them, by the task in [plan/E10.md](plan/E10.md);
  - Д128 — two tasks in E5 after the task of the measurement's tasks in the page's build, by the author's decision: the synthetic samples on a module's package with the source `modules` and the tag of the newest release, and the samples page's mode "open a file", by `spec`'s decision on synthetic data for a module's tasks.
- **The release.** The line is 0.3, by the entry on the package's releases: the merge releases 0.3.0 and the same version to npm.

— *Why:* the author asked to move to the newest `spec` first, «сначала перейди на последнюю версию spec», and chose one task, with format 0.4, over the recommended format 0.4 as a task of its own; Д128 after the measurement's tasks in the page's build, `.github` here too, and the exception for the file of `tutor`, as recommended.

— *Rejected:*
- **a window of versions 0.3 and 0.4 in the element** — against the format's rule that the platform reads only its current version, and the 0.4 manifest of `modules` is read anyway;
- **waiting for a 0.4 file from `tutor`** — format 0.4 in the element would wait for another repository's release, and the open view of 0.3 and 0.4 is the same;
- **numbers of the layout of our own beside the numbers of `spec`** — two sources of one rule; the element's numbers stay in the code, and a test holds them equal to `page.json`;
- **deleting `vectors/pages.json`** — the entry on the workbook's layout and E6's archive name the file, and they are not rewritten;
- **format 0.4 as a separate task after the move** — the executor recommended so, and the author decided on one.

— RUN.md, table 3; the tasks of this move and of the synthetic samples and the mode "open a file" in [plan/E5.md](plan/E5.md), of the move to `spec` v0.14.0 and of the page's text sets in [plan/E10.md](plan/E10.md), of `tutor`'s file of format 0.4 in [plan/E11.md](plan/E11.md), and of `.github` v0.1.24 in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the status and the sections on docking with the app, the samples page's steps, code and tools, and the workbook; README.md, CLAUDE.md; `src/core/manifest.ts`, `src/core/page.ts`, `src/core/example.ts`, `src/eval/tasks.ts`, `src/element/index.ts`, `src/element/parts.ts`, `page/index.html`, `page/main.ts`, `emulators/simulator.sh`, `.github/workflows/`.

## A worked example on a workbook

**R61. The element shows a lesson's worked example on a workbook (format 0.4) as a task on a workbook on which nobody writes: the example's lines are on the page in the task's layout, the boxes empty, and a demo step `fill` writes its value into its box when the learner opens the step. The values stand in the middle of the boxes, on the line, at the width of their text by the table of widths, as the lines' texts do. A value is a node of its own in the lines' language, right after its box, and to a screen reader the box names itself without it: «Окошко 1», then «5». A hidden demo hides the values too. The check is by the schema and the rules `lesson.example-fills` and `lesson.workbook-page`.**
- **The check** (`src/core/example.ts`): the canvas is a `handwriting_sheet` with a grid or a `workbook` with no fields; a workbook has `lines`, a sheet has none. A line is pieces of text and boxes, at least one box, and a box has a `value`, no wider than the box as a line's text: `pieceWidth` measures it as the layout measures a piece, and 100 units is the `box_width` of `page.yaml`. The lines lie on the page as a task's lines do, and a refusal of the layout names the line: `workedExample.lines[10]`. A demo step on a workbook is a paragraph, a picture beside the sheet or `fill`, and there is no picture on the sheet; a sheet has no `fill`. Every `fill` names a box of the lines, none is filled twice, and each is filled.
- **A copy, not a new shape.** The check returns a copy of the example, as before: the step `fill` does not carry the box's value, `fillValue` finds it by the lines.
- **The display** (`src/element/index.ts`, `src/element/parts.ts`): the template is `pageOf` the lines without values, the pen is the only tool, there is no input, as for a worked example on a sheet. The open steps give `filledBy`: the box and its value; a hidden demo gives nothing. The value is a `<text>` right after the box's frame, not `aria-hidden`, and inherits the lines' `lang` from their layer; the frame names the box without the value, «Окошко 1». The entry of the list of steps and the announcement of the polite live region `status` are the same label "{name}: {value}", «Окошко 1.1: 5», but the label's words are a `<span>` in the labels' language, and the value is a `<span>` of its own between them: in the entry it inherits the list's language, and in the announcement it takes the list's `lang`, if there is one. `sayAround` cuts the label at the place of `{value}` (`src/element/labels.ts`), and in each language of the table of labels `valued` names `{value}` once. The entry has no `lang` of its own: a new module language reaches the value in the box and in the entry by itself, and an announcement made before stays as it was, as with a paragraph.

— *Why:* the format of `spec` v0.12.0: "on a workbook, a box filled, `fill` … The demo fills the box with its `value` as the learner opens the part" (sources 6.5); `spec`'s COORDINATION.md names «показ примера на тетради» for `canvas`. The value goes by the table of widths, not by the device's font, for the same reason as the lines' texts in the workbook's layout: the boxes and the text stand the same on any device. The value is a node of its own in the lines' language, so a value that is a word sounds in its own language when the interface language is not the module's language (WCAG's 3.1.2, sources 9.20; the entry on what the element does not yet meet of the standard of UI packages takes it). The box's name carries no value, so a screen reader reads the value once — as the node after the box, in the order of the line, as a probe in Chromium showed — and `aria-hidden` on it is not needed.

— *Rejected:*
- **the value in the demo step after the check** — the check would stop returning a copy of the example;
- **the value in the box's name, «Окошко 1: 5», with its `<text>` `aria-hidden`** — the browser computes a name as a string with no language, so a value that is a word does not sound in its own language; and without `aria-hidden` the screen reader would read the value twice, as text and as the box's name;
- **the value as the box's description, `aria-describedby` on the value's node** — the browser computes a description, like a name, as a string with no language, and the node's `lang` does not reach the screen reader;
- **a box with a value as a `role="group"` with the box's name and the value inside** — a workbook's boxes would get two roles, `img` when empty and `group` with a value, and how VoiceOver and TalkBack read a group in SVG cannot be checked before Д7;
- **a `lang` of its own for the value in the entry, as in the announcement** — a new module language changes the list's `lang`, and the value's explicit `lang` would stay the old one;
- **the values even with a hidden demo** — the demo is hidden whole, as the pictures on a sheet are.

— The tasks of the move to `spec` v0.12.0 in [plan/E5.md](plan/E5.md) and of the value's own node in [plan/E12.md](plan/E12.md); [architecture.md](architecture.md), the sections on docking with the app, the workbook, the worked example and accessibility; `src/core/example.ts`, `src/core/example.test.ts`, `src/core/page.ts`, `src/element/index.ts`, `src/element/parts.ts`, `src/element/parts.test.ts`, `src/element/labels.ts`, `src/element/labels.test.ts`.

## The measurement's tasks in the page's build

**R62. The samples page's build puts in all the tasks of the file of open views of `tutor` from `tasks/` — 56 tasks of four banks, in the choice a group per bank —, and takes the file from the tree, as the synthetic samples do: there is nothing to download. The measurement and the child sample session are on this file; modules' tasks for an eval set come from a copy of the output of `module-kit open` in `tasks/modules-v0.2.7/`, as the entry on modules' tasks in the page sets it. A task carries only the fields of the format's open view, which the types `@altnovatrail/spec/formatv0/open` name. A field outside them, at any depth, stops both the build and the synthetic samples, and a picture in the statement of a `tutor` task stops the build: the file of `tutor` carries no media. The page marks up an essay by its text as written, or by the reason why there is none, and gives no scores of the criteria. `canvas` does not match the samples of tasks of `tutor` and of `modules`.**
- **The source.** The copy `tasks/tutor_v0.1.22_open-tasks.json`, of format 0.4, which `ci-licenses` checks by the recipe `release-verify` on every pull request, and whose sum `TUTOR_FILE` holds, as the entry on the synthetic samples sets it. The build of a pull request and the build of a release are one and the same, and it needs no network. Its `banks` are those of v0.1.10 byte for byte — 10 + 6 + 20 + 20 tasks, with no media —, and the build does not change them; the references to them in samples name the tag v0.1.22 and the digest of its file.
- **The open fields** (`src/eval/tasks.ts`). Each type of a task's open view — `Task`, `StatementPart`, `Canvas`, `Item`, `AnswerSlot`, `SheetRectangle` and `LinePart` — has its own table of fields, written `satisfies Record<keyof open.X, Field>`. A field that `spec` opens fails `tsc` until it is named, and a closed field does not get into the table: the type does not have it. `openTasksOf` walks each task by the tables. A field of another name and a field of the wrong kind — an object instead of a text, a text instead of a list — is a `TypeError` with the path: `eval/workbook.json workbook-01: items[0] line[1] check is no field of the open view`. The check stands where the references are computed, so it runs in the very build that writes the release file, and in the synthetic samples too.
- **Media and the task's kind.** `pageTasksOf` in `scripts/page.ts` stops the build on a `tutor` task whose statement names a picture: the file of `tutor` carries no media. The media of modules' tasks are the files of `media/` that the statements of the taken tasks name, compared with the output of `module-kit` in `ci-licenses`, and `module-kit open` itself skips the withdrawn versions, by the index. A sheet that does not have one answer place `anywhere` or `sheet` — a zone, a choice, several places — stops the build the same way: the page cannot mark up such a sheet. `openTasksOf` rejects a bank that occurs twice in the file: the reference names the bank by its path, and the tasks of one would get the references of the other.
- **The choice of task.** A group `<optgroup>` «Банк …» for each bank, in the file's order. An entry is «Лист: …», «Сочинение: …» or «Тетрадь: …» with the task's ID, and the entry's value is its number in the build: number 0 is `equation-1`, as the emulators expect. An essay is a sheet whose only answer place is bound to `sheet`.
- **The essay** (`essayMarkup` in `page/markup.ts`). It has no parts, no first error and no tags. The truth of its answer place is the text as written, with its errors and line breaks; `UNREADABLE_ILLEGIBLE` when the essay cannot be read as a whole; `UNREADABLE_BLANK` for a sheet with no strokes. `writing` is `marks` with no scores, as [the contracts text](../spec/contracts/README.md) says of the markup of a sample file: "The marks come after the writing: the organizer of the eval set or of the measurement adds them". The flag «сочинение не прочесть целиком» is the same in the child's session: it does not say "on purpose", as the flag of a part of a sheet does (В68). `sample-check` accepts such a file — the example `examples/page-essay-measurement.json`, which `ci-licenses` checks with the rest.
- **Two sources.** A reference to a task names its source — `tutor` or `modules` —, as the sample file does. Whether to match the samples of one task from two sources, and by what, is the business of the runner of `tutor`, not of `canvas`. `spec`'s answer to В71 (Д164 in the RUN.md of `spec`): the runner of `tutor` keeps samples separate by source, and a sample counts toward the task of its own source. A sample's reference names the source anyway, and `canvas` changes nothing.

— *Why:* the author took every recommendation of the planning. One path of the file for the synthetic samples and the page is one check of the signature. The fields go by the types of `spec`, not by a list of closed names of our own: by the format, all that is not open becomes closed. The copy is of v0.1.22, the file of format 0.4 that `tutor` released, so that every reader has one version of the format. The measurement and the child sample session stay on the file of `tutor`, as the author decided: the tasks by which `tutor` measures do not change in the middle of the measurement.

— *Rejected:*
- **downloading the file in `release-files`** by tag and sum, as the entry on the release files supposed: a second path of the same file beside the synthetic samples' copy, and a pull request would check a build other than the one that comes out;
- **a raise to `tutor` v0.1.21** — the same tasks, and the archive of the synthetic samples would come out different;
- **the packages of `modules` for the measurement** — they came in a task of their own by Д4, for an eval set alone, with the withdrawn versions skipped by the index of `modules`, and the tasks by which `tutor` measures would change in the middle of the measurement;
- **a search for closed names in the build's HTML** — the page's code itself carries such words as `key`, and the minified bundle writes field names without quotes;
- **a label of its own for the essay's flag for a child** — so the plan proposed, but the flag «не прочесть целиком» says nothing of any "on purpose".

— *Revisit:* when the measurement moves to the packages of `modules` (Д4); when `tutor` releases a file with other banks or of another format — a raise of the copy together with the synthetic samples.

— the tasks of the measurement's tasks in [plan/E5.md](plan/E5.md), of the move to `spec` v0.14.0 and of modules' tasks on the page in [plan/E10.md](plan/E10.md), of the file of `tutor` of format 0.4 in [plan/E11.md](plan/E11.md) and of the board module's tasks in [plan/E13.md](plan/E13.md); RUN.md, table 3, Д4; [architecture.md](architecture.md), the sections on publication and release, the sample file and the samples page's steps; `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `page/main.ts`, `page/markup.ts`, `page/markup.test.ts`, `page/texts.ts`, `examples/page-essay-measurement.json`, `tasks/modules-v0.2.7/`.

## Synthetic samples on a module's package

**R63. The synthetic samples of a module's eval set are written by the generator of `canvas` on a module's package — the folder that `module-kit build` wrote on the commit into which the samples go: `just synthetic-module <package> <tag> <folder> <task>:<seed>...`. `canvas` builds a task's open view from the package's canonical view with the same tables of open fields that hold the file of `tutor`, and checks the package against its inventory. A sample is an eval set's, by an adult, under Apache-2.0, with the source `modules` and the tag the call named. A sheet with one place `anywhere` and a workbook's page are drawn; a template, a choice, an essay and a zone are a refusal, and their samples are people's. A seed whose file is already in the folder is written anew only if it is a sample of the same task.**
- **The package** (`moduleTasksOf` in `src/eval/tasks.ts`). `inventory.json` and `server.json` are taken from the folder; a sample does not need `device/`. The inventory is of format 0.4, which the element reads, with the module ID `<publisher>/<name>`, a version and a `server_part` whose digest and size are those of the text of `server.json`. The package digest is the sha256 of the inventory, by the module format. The tag is `vX.Y.Z`: the eval protocol does not check it.
- **The open view.** The walk by the tables of open fields is one for both inputs: in the file of `tutor` a field outside the open view is a refusal, and in a package it is dropped, as the server drops it, by the format. A field of the wrong kind is a refusal in both. For a task that the generator does not draw — a choice, an essay, a zone —, `moduleTasksOf` keeps the digest of its open view too, beside the reason, and a template has none: a template has no open view. A task with the place `anywhere` on a canvas of another kind, neither a sheet nor a workbook, is a refusal with a reason too, not a `TypeError` of the whole package. On all 773 tasks other than templates of the release `modules` v0.2.0 the view and its digest matched `module-kit open` v0.3.0 byte for byte, and so they did on format 0.4: on the packages of the release `modules` v0.2.1 — `grade-3-math` 0.3.0 and `olympiad-math` 0.3.0 — and `english-essays` 0.2.0, which its index names from v0.2.0, after `release-verify` accepted the release files, the package and the binary of `module-kit` v0.3.0. `module-kit open` gave 795 open views, and for all 773 tasks other than templates the digest `--digest` of the generator's file is the same byte for byte as that of `module-kit` — for the 122 choices too, and for the essays, which the generator does not draw; `canvas` does not compute the 22 instances of templates. The generator drew 12 of the 12 tasks of `grade-3-math` and 631 of the 775 tasks of `olympiad-math` — the choices and templates were rejected —, and all 643 samples passed `sample-check --eval-set`; 631 files in one call crash its Node process, and it ran in batches of 50. The new fields of format 0.4 — `leading_question`, the check `time`, `notation: word` — did not get into the open views of these packages' tasks. With the templates' seeds 1–5 on the same packages, `canonicalText` gave the digest of each of the 883 open views, byte for byte the one `module-kit` writes — of the templates' instances too; `openViewsOf` holds this on every build of the page. The comparison is a one-off, and CI holds a part of it: a test holds the digests of the 12 tasks of grade-3-math, and of the five essays and three choices of `english-essays`, equal to those that `module-kit` gave.
- **The sample** (`moduleSample` in `src/eval/synthetic.ts`). The seed picks a scenario from the scenarios of a sheet or a workbook, and the writer — an adult in their own hand or imitating a child's. There is no writer code, the license is Apache-2.0, the ID is `synthetic-<seed>`. A seed is from 0 to 2^32 − 1: the generator takes 32 bits from it, and two seeds above that would draw one sample. A workbook is drawn only if all its items are lines with boxes, with no other answer places. The set of `tutor` is the same, byte for byte: the choice of a task from a bank stayed with it, and the drawing became shared.
- **The call** (`scripts/synthetic-module.ts`, `--module`). First everything is checked — the package, each call, each drawing, each file of the same seed, read by `readSample` —, and only then written. The errors are all named at once, a page that does not lay out too, code 1; a call not in form is code 2. A person's sample under the same name is never overwritten. The recipe hands the arguments to Node as they are (`[positional-arguments]`), bypassing the shell's text. The generator comes out as a file of every release, `synthetic-module_v<X.Y.Z>.mjs`, as the entry on the generator's release file sets it, and `just synthetic-module` and `ci-licenses` run the same file, built as version 0.0.0; `scripts/synthetic.ts` writes only the set of `tutor`.
- **A specimen module in the tree.** `tasks/modules-v0.2.0/` is `module-index.json` with its Sigstore bundle and the `inventory.json` and `server.json` of the packages grade-3-math 0.2.0 and `english-essays` 0.2.0 (15 KB), byte for byte from the signed release. The open views of `grade-3-math` 0.3.0 are the same as those of 0.2.0, so the 0.2.0 package stays. `ci-licenses` checks the index's signature with `release-verify`, compares the sha256 of each inventory with the package digest in the index — then `moduleTasksOf` compares `server.json` with the inventory —, writes a sample for each of the 12 tasks of grade-3-math into `build/synthetic-module` and holds them with `sample-check --eval-set novatrail/grade-3-math`. The example of a module's sheet `examples/module-sheet-eval-set.json` — on a package that a test writes from the same one with a sheet task and the ID `example/sheets` — is held by `sample-check --eval-set example/sheets`.

— *Why:* `spec`'s decision that a module's synthetic data is the generator of `canvas` on the package of the commit where the samples go, and Д128 in the RUN.md of `spec`; the author took every recommendation of the planning. A projection of the open view of our own instead of `module-kit` — because `module-kit open` takes a package only by an entry of a release's index, and a commit's package is in no index; the comparison with it on all the tasks of a release showed that the tables give the same view. The author's answer to В72 (Д128 in the RUN.md of `spec`) keeps the generator as it is — synthetic samples of `anywhere` sheets without templates and of workbooks —, and templates, choices and essays get people's samples.

— *Rejected:*
- **the input `open-views.json` from `module-kit open`** for the generator — a commit's package would need a temporary index built for it. The page's build takes that input, for its packages are a release's, and a release has an index;
- **templates now** — only `module-kit` computes an instance by its seed, by the format's generator of instances;
- **a refusal on every known seed** — a pull request that changes a task's open view redoes its samples, and the call must overwrite them;
- **a copy of the whole package olympiad-math** — 1.3 MB for the sake of sheets; an example on a package that a test writes holds the sheet, and the generator went through the real package olympiad-math by hand when this entry was made.

— *Revisit:* when a module needs synthetic samples of templates, choices or essays — in a task of its own; when `modules` releases a package of a format newer than 0.4 — together with the element's move; when `spec` opens a new field of a task — the tables of open fields fail `tsc` until it is named.

— the tasks of the synthetic samples on a module's package in [plan/E5.md](plan/E5.md), of the move to `spec` v0.14.0 and of modules' tasks on the page in [plan/E10.md](plan/E10.md), and of the generator's release file, the digest command and the projection on format 0.4 in [plan/E11.md](plan/E11.md); RUN.md, table 3; [architecture.md](architecture.md), the sections on the sample file and on code and tools; README.md; `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `src/eval/synthetic.ts`, `src/eval/synthetic.test.ts`, `scripts/synthetic.ts`, `scripts/synthetic.test.ts`, `scripts/synthetic-module.ts`, `justfile`, `tasks/modules-v0.2.0/`, `examples/module-sheet-eval-set.json`.

## The samples page's mode "open a file"

**R64. The samples page opens a sample file for viewing — by a section of its own, «Открыть образец», under «Началом», in the same build and with no network. It shows the strokes, drawn from the file alone, the crops from the file and the markup in words, changing nothing, saving nothing and calling no AI. A sample of any purpose opens — an eval set's, a measurement's and a child's. For the writing history the end result is shown, and the checkbox «показать стёртое» adds, in another style, all that was written and is not visible at the end — erased, cleared and taken back by undo: that is in the file too.**
- **Where.** A section under «Началом»: the choice of a file, a note that the file goes nowhere, and a line for a reading error. A chosen file hides «Начало» and shows the sample; another file is chosen in the same field. «К началу» is a new opening of the page: like the rest of the page, it remembers neither the file nor its content. Once writing has begun, the section is gone: viewing does not touch an unfinished sheet.
- **Reading.** Only `readSample`, the sample file's reader of `src/eval/`: a field outside the message or another protocol is an error text, and nothing is drawn. Beyond reading the page does not check the file — that is the `sample-check` of `spec`, and other repositories may not write a check of their own, by `spec`'s decision on the sample file.
- **The drawing** (`page/open.ts`, `page/main.ts`) — an SVG from the file, with no task: a sheet by its width and height, and the drawing's frame takes in a stroke beyond the sheet's edge too, so that none is cut off; for a workbook, each box as a rectangle with its place `item.place`; the strokes as lines of the sheet's pen width (`INK_WIDTH`). For a history, the sheet's own `replay` (`src/core/history.ts`) computes what is visible at the end from the file's events: writing, erasing, clearing, undo. What was written and is not visible at the end is drawn dashed in the color `GrayText`, on top, only with the checkbox, and the checkbox names how many such strokes there are. The SVG's attributes are presentation attributes: the page's policy does not let in the attribute `style`.
- **Crops** — PNG from the file, by blob URL, as the markup's crops, by digit height; for a workbook, by a filled box.
- **Words.** The purpose, who wrote, the provenance, the writer code, the license, the versions, the task's source with the digests of the file and of the bank, its ID and the digest of its open view; the markup — the truth by places, the tags, the parts with their text as written, flags and number of strokes, the first error, the scores of the criteria. A value of an enumeration that the page does not know is shown by its name in the protocol. The purpose, «кто писал» and the box are named with the same words as in «Начале» and the markup. Two files chosen in a row do not mix: the last is shown. The file's texts go into the page only as text, not as HTML.
- **Nothing leaves:** no requests, no downloads, no storage — the page's test holds this by `file://` on a sample of each composition from `examples/`.

— *Why:* `spec`'s decision that a module's sample is viewed before a push on this page, in the mode "open a file", and Д128 in the RUN.md of `spec`; the author took all of the plan's recommendations. `modules` publishes an eval-set sample forever together with the texts of the markup, and a measurement sample goes to the organizer and to AI providers: only a person sees a name or a contact in it before the push, and the file is shown neither to an AI nor to an agent (П-12). The build has no modules' tasks, and the file itself carries the sheet, the boxes, the strokes and the crops. What was erased stays in the file's history, and without it a name written and erased would go unnoticed.

— *Rejected:*
- **strokes on the element** — the build has no module's task, and a module's workbook would lie without lines and boxes; the element has no mode "view only", and one could write on it;
- **eval-set samples only** — a measurement sample goes further too, to the organizer and AI providers, and a child's file already lies on the device where it is opened;
- **only the history's end result** — what was erased stays in the file; **a replay of the history in time** — more code, and it finds a name no better than the checkbox;
- **a choice "write or open" before «Началом»** — an extra step for every volunteer for the sake of the organizer's mode; **viewing during writing too** — the unfinished sheet would have to be kept safe;
- **a build of its own for viewing** — `spec`'s decision on viewing a sample before a push requires the same build.

— *Revisit:* when modules' tasks come into the build (Д4) — whether to show the task's statement beside it; when the protocol gives a new field of a sample — its words here; on tablets — the checks on devices check the choice of a file in the iPad's «Файлах» and in Android's downloads.

— the tasks of the mode "open a file" and of the devices in [plan/E5.md](plan/E5.md); [architecture.md](architecture.md), the samples page's steps; `page/open.ts`, `page/open.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.test.ts`, `tsconfig.element.json`, `tsconfig.node.json`.

## Devices in the emulators

**R65. The emulators of `page.yml` go through the checklist on devices: there are no tablets, and the hardware is debt Д7. Each device goes through two builds, each in a run of its own. On the release build, after the sheet's first stroke — a stroke that the browser cancels, the row's eraser and undo, a second stroke written and erased, and two fingers that scroll; the workbook «подражая детскому почерку»; then the page is opened anew, and the sheet's file is opened in it. On the test build — its «Начало» and the child sample session. On Android the gestures are touches of Chrome itself through DevTools, on the iPad the page's pointer events. The executor looks at the screenshots, and the result item by item is in the task.**
- **Gestures** (`emulators/volunteer.ts`, `emulators/watch.ts`). After the first stroke:
  - a stroke cut off by `pointercancel` does not change the history;
  - the row's «Ластик» takes the next presses, and a stroke along the same path writes `erase`;
  - «Отменить» writes `undo` and brings the stroke back;
  - «Перо» comes back, a second stroke to the right of the first is written and erased — the file carries it as erased;
  - two fingers moving up shift the sheet's view or the window and write nothing — the sum of their scrolling serves as the measure.

  The driver finds the row's buttons by their label in the element's shadow tree.
- **How on the devices.** Android — the DevTools `Input.dispatchTouchEvent`: Chrome's touches, several fingers and `touchCancel`, in the page's CSS pixels, and the first stroke still by the emulator's `input touchscreen swipe`. iPad — the page's own `PointerEvent`, `pointersBy` with one or two pointers, as the stroke of the page's markup on the iPad was, and `click()` on the buttons: WebDriver's touches in Simulator missed. The run's report names the way of each step.
- **A file opened on the page** (the mode "open a file"). The page is opened anew — it remembers nothing —, and the section «Открыть образец» gets the sheet's file. On Android, the very file from Chrome's downloads, `DOM.setFileInputFiles`, and if Chrome does not read it, the text. On the iPad, the text of the saved blob as a file of the page. The page's step holds: the view is shown, there is no fewer than one line, the erased stroke apart, the checkbox is there, all the crops are decoded. The emulators do not go through the system's file picker.
- **The test build** of the child sample session — `emulators/builds.sh` builds it beside the release, and the server serves it on a port of its own, 8081, under the name `samples-page_v0.0.0-test.html`: Chrome keeps both downloads in one list and opens them by name. The steps:
  - the eval set is closed with a reason, and the measurement and the session are open;
  - a new child's code is shown for the form and starts no session;
  - the form's code, `T22CHILD`, starts the session;
  - the child writes, «Кто писал» is not asked, the phrase about the iPad is there;
  - a part's flag is labeled «не прочесть и со слов ребёнка»;
  - the sheet and the workbook are saved.
- **Files** (`emulators/saved.ts`). The expectation goes by folder: for the release, a history, `draft-0`, one sample in one's own hand and one imitating a child's; for the test build, `-test`, `WRITER_CHILD`, the final geometry, `test-approved-0` and the code `T22CHILD`. A child's workbook may have no strokes in its geometry: the driver's stroke lands outside the boxes, in the scratch area. `sample-check` holds the files of both folders.
- **What is left to the hardware** — the list in Д7: the pen's pressure and tilt, the palm and the thresholds of input on tablets, a touch's `width` and `height`, WebKit bug 269535, the button «Рисовать пальцем», the pen's eraser and the eraser's reach, the share ⅘ and fast presses of «Выше» and «Ниже», VoiceOver and TalkBack on the workbook and a worked example, a lesson example's sheet on a tablet, the system's file picker, iCloud.

— *Why:* the author kept the checks in one task, against the plan's recommendation, and took the rest as recommended. Chrome's touches go the browser's real input path up to the pointer events, and on the iPad the driver has no such path: the page's events check the sheet's code in WebKit, but not the touch stack. The runs go where they went (В66): Android on every pull request with the page, the iPad on `main` and by hand.

— *Rejected:*
- **WebDriverAgent touches on the iPad** — in the probe of a page from a file a download through it reached Files once in eight (measurements 1.3), and at the stroke of the page's markup its touches missed;
- **synthetic events on Android too** — there the DevTools already open gives real touches;
- **the new steps only on `main`** — a failure of the eraser, undo or the child's session would be found only by a run after the merge;
- **the test build as a task of its own** — the executor proposed to split the checks on devices so, and the author kept them whole;
- **the file's text on Android too** — then the step would not go through the file that Chrome really saved.

— *Revisit:* when there are tablets — the list of Д7 in a task of its own; when modules' tasks come into the build (Д4) — the eval set's path as a second case of the test build; when the element gives the workbook's lines and boxes in the accessibility tree (epic E10) — a stroke into a box by its frame, not at random.

— the task of the devices in [plan/E5.md](plan/E5.md); [architecture.md](architecture.md), on the drawing engine and on code and tools; `emulators/volunteer.ts`, `emulators/watch.ts`, `emulators/page-android.ts`, `emulators/page-ipad.ts`, `emulators/page-ipad.sh`, `emulators/android.sh`, `emulators/builds.sh`, `emulators/saved.ts` and their tests, `.github/workflows/page.yml`.

## The page in the release

**R66. Every release of `canvas` since v0.3.4 carries the samples page's build `samples-page_v<X.Y.Z>.html` — with the draft of the texts and the release's version without `v` — signed and in `SHA256SUMS`, as the other files are. `release-files` builds it with the same builder as the emulators do, and the release's paths take in everything it is built from. The release's description begins with a paragraph about the page: it opens from a file on a computer or Android, does not work on an iPad, goes to no network, and GitHub sees the IP address of whoever downloads the release file. A job of its own, `notes`, puts the paragraph in after the shared `release.yml`. The released file is checked by `release-verify`, by a rebuild of the tag's commit and by opening it from `file://`.**
- **The build** — `node scripts/page.ts dist <number>` in `release-files`, after the synthetic samples: the builder writes one file into the folder, and the recipe checks that it is named by the tag. The builder puts the test text set only into version `0.0.0`, and it does not go into a release. The release builds its files, the page's build among them, in the stage `toolchain-core` of the commit's Dockerfile, as the move to `spec` v0.18.4 sets: Node, npm and Vite, which are all the builder needs, are those of `toolchain`, so the page, the synthetic samples and the generator are the same bytes as the stage `toolchain` builds.
- **Paths** — added to the earlier ones: `page/*.ts` without tests, `page/index.html`, `page/notices/*`, `page/sets/draft-0.json`, `scripts/page.ts`, `scripts/csp.ts`, `tsconfig.json`, `tsconfig.core.json`, `tsconfig.element.json` and `tsconfig.node.json`. The element's code and `src/eval/`, the file of `tutor`, the lock file, `LICENSE` and `NOTICE` were already among them. The `tsconfig` programs, because Vite takes the transform options from them: `useDefineForClassFields: false` in `tsconfig.element.json` changes the page's bytes, and `tsconfig.node.json` gives the options for the `scripts/` that the generator of a module's eval set carries.
- **Repeatability.** The test `scripts/page.test.ts` builds version `1.2.3` twice — the second time in a process of its own, `node scripts/page.ts`, as `release-files` calls it — and expects the same bytes; `scripts/archive.test.ts` holds the repeat of the synthetic samples. The generator of a module's eval set is a second file of the same make: `scripts/generator.ts` builds it with the same Vite, and `scripts/generator.test.ts` holds its repeat. Repeatability on another machine is checked by comparing the released file with a rebuild. The emulators of a pull request build the same page from the same tree as version `0.0.0`, so they have checked the code that comes out: the version string and the script's hash in the policy differ.
- **The paragraph.** The shared `release.yml` writes the description itself, `gh release create … --generate-notes`, and takes no text of ours. The description of an immutable release can be changed: "Only the assets and tag are locked. You can still edit the title and release notes of a published immutable release" (GitHub Docs, "Immutable releases", read 2026-11-10; sources 7.6). The job `notes` runs after the shared one, with `contents: write`, however the shared one ended, if it ran: a release that came out while the npm step after it failed gets the paragraph too.
  - It finds the commit's release by `target_commitish` among all the pages of the list — the shared one creates the release with `--target` on the SHA —, and if there is no release, it writes nothing.
  - The paragraph with the release's tag goes first, between two HTML comment markers, `gh release edit --notes-file`. It removes the earlier paragraph between the markers, and the `\r` of an edit on the site does not break the markers: a rerun by the button, a new wording and a manual edit of the description leave one paragraph, and it does not touch a description that would not change.
  - On a pull request it takes the newest release and prints the description it would write, changing nothing: the script runs on every pull request, not only on `main`.

  The paragraph is in English, as RULES.md sets for everything outside `docs/`.
- **The documents.** README.md has no section on the samples page and no command: what is said of the page — opened from the file, no network, the iPad, the IP address in the release's notes, the bundle beside the file — and the page's `release-verify` command are in [docs/README.md](README.md), among the release files. The release's notes carry the paragraph on the IP address, as the entry on the samples page asks.
- **The check of the released file** — by the executor after the merge of the task that brought the page into the release: `release-verify` accepts the file and its bundle, the sum is the same as that of `node scripts/page.ts` on the tag's commit, and the file opened from `file://` in the container's Chromium shows the version, goes to no network, keeps the policy and saves a sample that `sample-check` accepts. From then on every release is held by the repeat of the bytes and by the Release probe on a pull request, which runs `release-files` and checks the signatures.

— *Why:* the author chose every option as recommended. The entry on the samples page asks for the release's description to speak of the IP address — where the file is downloaded —, and the page says it only after the download. A job of our own writes the paragraph by itself on every release and does not wait for `.github`. The repeat of the bytes carries the check by the emulators of a pull request over to the released file with no new mode in the workflow and the drivers. The stage `toolchain-core` holds everything the builder needs, so building there changes no byte. The README holds only what the component is and its place in the architecture, and no commands: the author asked so for the README of every repository.

— *Rejected:*
- **an input for a text of our own in the shared `release.yml`** — a row for `.github` and waiting for its release for the sake of what only `canvas` needs;
- **the paragraph only in the repository's documents and on the page** — the entry on the samples page asks for the release's description, and neither README.md nor [docs/README.md](README.md) is visible from the release's page;
- **the emulators on the release file** — the repeat of the bytes makes this superfluous, and an input `release` in `page.yml` and the drivers is new code;
- **the release after "Samples page"** — the release would wait for the iPad, which does not run on a pull request, and `spec`'s decision on the samples page does not have the first measurement written on an iPad. Android holds every pull request with the page.

— *Revisit:* if the shared `release.yml` gives an input for a text of our own — remove the job `notes`; if the page moves to hosting (Т-17) — what the paragraph says about the IP address; if Vite stops giving the same bytes — the test holds the repeat.

— the tasks of the page's release in [plan/E5.md](plan/E5.md), of the generator in [plan/E11.md](plan/E11.md), and of the release in `toolchain-core` and of the README in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), on publication and release, the samples page's steps and the code and tools; `justfile`, `.github/workflows/release.yml`, `scripts/page.test.ts`, `scripts/archive.test.ts`, `scripts/generator.ts`, `scripts/generator.test.ts`, README.md, [docs/README.md](README.md).

## `spec` tag v0.14.0

**R67. `canvas` is on `spec` v0.14.0, by way of v0.13.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, and the shared workflows of `.github` at v0.1.24, with the cache of the `toolchain` stage's image. What the tags v0.13.0 and v0.14.0 require of `canvas` is taken, but for two things: the task of the text sets from `spec`'s release takes them from `legal-1.tar.gz`, and the exception of format 0.3 waits for a 0.4 file of `tutor`. The questions В67–В73 are closed.**
- **The submodule and the packages.** `spec/` is v0.14.0, commit c318cb4, the latest release of `spec` (2026-11-10); `gh release verify` accepted it. `@altnovatrail/spec` and `@altnovatrail/contracts` are 0.14.0, by `npm install --save-exact`, and the lock file changed only in their entries, and `ci-licenses` checks the signatures. The 0.14.0 packages only added the exports `legalv1`, `consentagev1` and `exportv1`: `types/canvas`, `formatv0`, `page`, the observation protocol and the contracts' vectors did not change, and in `sample_pb` only the comment on `text_set_version` changed. The devcontainer template of the kind `typescript`, RULES.md and the license check did not change between the tags, and the recipes of `spec` that `canvas` calls are the same.
- **The copies of the format in the tests** are the same bytes, and the tag in their comments is v0.14.0: between the tags `format/` changed only the trap catalog `traps/valid/olympiad-math.yaml`, which the tests do not copy.
- **`.github` v0.1.24.** The cache came with v0.1.22, by Д146 in the RUN.md of `spec`: `typescript.yml` and `documents.yml` take the stage's image from the cache of GitHub Actions and build it only on a miss. v0.1.24 changed only comments of the workflows `canvas` calls (sources 6.13). `gh release verify` accepted both releases, and the calls gained no inputs.
- **What the tags require:**
  - Д151 in the RUN.md of `spec`, by `spec`'s decisions on the writing history and on child samples — the adult's declaration, which the entry on the samples page sets, and the phrase after saving in the child's session, which the entry on the child sample session sets (В67);
  - Д146 — `emulators/toolchain.sh` by the `toolchain.sh` of `spec`, as the entry on the image of the emulators' jobs says;
  - Д186 — the README's section Install, as the entry on the first code says;
  - В68 — `spec`'s eval protocol on a child sample's flag `illegible`: the page's label of the flag is the same, as the entry on the child sample session says;
  - В69 and В70 — Д121 and Д158, as the entry on the move to `spec` v0.12.0 says; В71 — Д164, as the entry on the tasks of `tutor`'s file says; В72 — Д128, option (a), as the entry on the synthetic samples of a module's eval set says; В73 — `spec`'s cards of `canvas` and of `modules`;
  - Д161 — the text sets from `legal-1.tar.gz`, `spec`'s part of the legal texts: the task of the text sets from `spec`'s release. In `legal-1` of v0.14.0 all texts and sets are drafts, and a purpose without a current set does not open: that task decides what is open before approval;
  - `spec`'s decision that the platform has no lawyer — "lawyer" is removed both from the draft text set and from the comments of the page's code, which the move to v0.12.0 did not edit, as the entry on the samples page says.
- **The entries of `spec` that diverged from `canvas`** — `spec`'s COORDINATION.md has not yet marked `canvas`'s row on format 0.4 at the element, though the move to v0.12.0 did it, the status of `canvas` there is v0.9.9, and the table of incoming items of the RUN.md of `spec` puts the answer to В73 into the card of `canvas` and the flows, though it went into the cards of `canvas` and of `modules` — `spec` will learn of them by row В75 of table 3 of RUN.md.
- **The release.** The line is 0.3: the merge releases the next patch and the same version to npm, because `package.json`, the lock file, the README and `page/sets/draft-0.json` are in the release's paths. With it the README tells of the finished E5 (Д8).

— *Why:* the author asked to move to the newest `spec`, where the plan went to v0.13.0, and chose, as recommended, the phrases of Д151 and Install in this move too and the divergences of the entries of `spec` by row В75. The shared workflows at v0.1.24 keep the same cache, and their release changed only comments.

— *Rejected:*
- **v0.13.0, as the plan had it** — v0.14.0 came out the same day and carries the samples page's texts, which the task of the text sets moves to;
- **the phrases of Д151 in the task of the text sets** — that task moves the sets to the file of `spec`, and the declaration is needed by the draft set too, which comes out in every release;
- **a copy of the `toolchain.sh` of `spec` instead of our own script** — it has the image `novatrail-toolchain` and the path from a variable, and the emulators' jobs call the image `toolchain`;
- **waiting for a 0.4 file of `tutor`** — the move would wait for another repository's release, and the exception breaks nothing.

— *Revisit:* when `tutor` releases a file of open views of format 0.4 — remove `TUTOR_FORMATS` in a task of its own, together with the copy in `tasks/` (Д158 in the RUN.md of `spec`); when the sets of `legal` come into force — what the page opens.

— the tasks of this move and of the text sets in [plan/E10.md](plan/E10.md), and of `.github` v0.1.24 in [plan/E13.md](plan/E13.md); RUN.md, tables 3 and 4; [architecture.md](architecture.md), the status; README.md, CLAUDE.md; `emulators/toolchain.sh`, `page/sets/`, `page/sets.ts`, `page/steps.ts`, `page/texts.ts`, `.github/workflows/`, `package.json`, the copies of the format in `src/core/`.

## The generator of a module's eval set as a release file

**R68. Every release of `canvas` carries the generator of a module's eval set as one file `synthetic-module_v<X.Y.Z>.mjs` — an ES module for Node 24 with no npm packages beside it, signed by the shared `release.yml` and in `SHA256SUMS`. `node <file> --module <package> <tag> <folder> <task>:<seed>...` writes the same as `just synthetic-module` wrote, byte for byte, `node <file> --digest <package> <task>...` gives the digest of each task's open view, and `modules` checks the file with `release-verify` and holds it by tag and digest. The same file, built as version 0.0.0, is run by `just synthetic-module` and `ci-licenses`.**
- **The code.** The module mode is a module of its own, `scripts/synthetic-module.ts`, without `import.meta.main`: `moduleMain` returns the exit code — 0, 1 on a refusal, 2 on a call not in form —, and the file's entry point, `scripts/synthetic-module.main.ts`, calls it on the first argument `--module`. `scripts/synthetic.ts` kept the set of `tutor`, which `tsc` still builds into `build/`, as the entry on the synthetic samples sets. The file writes the usage line with its own name.
- **The second mode** — `--digest <package> <task>...`, point 2 of the request of `modules`: a line per task, its ID and the digest of its open view separated by a tab, in the call's order — by the same projection as the reference to a task in a sample, without a second walk (`moduleDigests` in `scripts/synthetic-module.ts`). A task that is not in the package and a template are all named at once after the lines of the other tasks, and the code is 1: the CI of `modules` takes the lines of the others even then; a call without a package or tasks is code 2 and the usage line of both modes. The release's tag does not change the digest, and the call does not take it. By this command the CI of `modules` compares people's samples with the commit's package, as `modules`' decision on its eval sets and `spec`'s eval protocol, by which the runner rejects a sample whose task is not the one, require.
- **The build** — `node scripts/generator.ts <folder> <version>`: an SSR build of Vite 8.3.6, by the same builder as the page — all packages inside (`ssr.noExternal`), the modules `node:*` outside, the target `node24`, the format `es`, without minification and into one module. The file opens with a comment `/*! … */`: what it is, Node 24, the call, the check by `release-verify`, the `LICENSE` of `canvas` — its `NOTICE` speaks of icons, which the file does not carry —, and the license notice of each package — `@altnovatrail/contracts`, `@bufbuild/protobuf`, `rbush` and `quickselect`; a comment's end inside the notices is broken up. A package with a license off the list stops the build: the page and the generator take the helpers of the notices from the shared `scripts/notices.ts`.
- **Repeatability and equality.** Two builds of one tree give the same bytes, and the file on the package `grade-3-math` 0.2.0 and seeds 201–212 writes the same 12 files and lines as `writeModuleSamples`; `scripts/generator.test.ts` holds this, and it also runs the file from a folder without `node_modules`. On the commit that brought the file, it and the earlier path by `tsc` gave the same bytes, and the page after the move of the helpers the same bytes as before it.
- **The release's paths** — `scripts/synthetic-module.ts`, `scripts/synthetic-module.main.ts`, `scripts/generator.ts`, `scripts/notices.ts` and `tsconfig.node.json`: Vite takes the transform options of the files of `scripts/` from it — an edit of `useDefineForClassFields` there changes the bytes of a class in `scripts/`.
- **The release files** — six and `SHA256SUMS`: `release-files` writes the generator's file into `dist/` after the page. `release-verify` does not restrict the name: it checks the signature, the repository, the tag and the release of `.github`.
- **The description and the commands** are in [docs/README.md](README.md), beside the release files: Node 24 with no package beside it, the arguments of `just synthetic-module`, the modes `--module` and `--digest` with its exit codes, the comment with the license notices, no minifying. README.md has no section on the generator and no command.

— *Why:* the request of `modules` (the row В36 of `modules`; E11) and the author's answers: the name with `.mjs`, the file for the recipe of `canvas` too, the code without minification; the rest as recommended. A release file enters the CI of `modules` only once `release-verify` has accepted it, as the shared rules require, and a clone of `canvas` built by `npm ci` and `tsc` is code with no check of a signature. One file for `just synthetic-module` and for `modules` makes "byte for byte" true by construction: `ci-licenses` tries the very form that comes out. The README holds only what the component is and its place in the architecture, and no commands: the author's word for the README of every repository.

— *Rejected:*
- **esbuild** — a new dependency for what Vite, the first code's builder and the page's, already does;
- **a clone of `canvas` at the tag in the CI of `modules`** — code with no signature and a build by `npm ci` and `tsc` in another repository's CI;
- **`.js`** — with no `package.json` beside it Node recognizes an ES module by its syntax, and beside a `package.json` without `"type": "module"` it does not;
- **minified code, as the page's** — a reader of `modules` could not read what goes into its CI, and the size of a CLI affects nothing;
- **the `tutor` mode in the file** — it reads the repository's `tasks/`, and the set of `tutor` comes out as an archive anyway;
- **a second path by `tsc` beside the file** — two codes of one generator, and only a test would hold them equal.

— *Revisit:* when `spec` raises Node in the devcontainer — the build's target and the header; if Vite stops giving the same bytes — the test holds the repeat.

— E11 and the tasks of the file and of its mode `--digest` in [plan/E11.md](plan/E11.md), the README's task in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), publication and release, the sample file, and code and tools; README.md; [docs/README.md](README.md); `scripts/synthetic-module.ts`, `scripts/synthetic-module.main.ts`, `scripts/generator.ts`, `scripts/notices.ts`, `scripts/synthetic.ts`, `justfile`, `.github/workflows/release.yml`.

## The page's text sets from a release of `spec`

**R69. The samples page's text sets come from the file of a `spec` release `legal-3.tar.gz`, the part `legal` of version 3: a copy `tasks/spec-<tag>/legal-3.tar.gz` of the same tag as the submodule `spec/` and the package `@altnovatrail/spec`, which `ci-licenses` checks by the recipe `release-verify` and the builder holds by its sum. The build reads the part on the day of its build, a day in UTC, as the README of the part `legal` says to read it — the passport's schema from the same archive, then six rules in order —, and each purpose has its own current set: the measurement's is `measure`, the eval set's is `eval-set`, the child sample session's is `child-sample`. A purpose opens with a set whose day has come, never ahead; a purpose with no current set is closed, the measurement too, each with a reason of its own. A sample's `text_set_version` is the set's ID and number joined by a hyphen, `measure-1`. The page shows the notice as its gist in Russian from the passport and as the full English text, which is the one in force.**
- **The copy and the signature.** `release-verify spec <tag> <file>` recognizes a file of `spec` by its name, `legal-<n>.tar.gz`, and checks it against `git archive` of the folder `legal/` at the tag. So the copy lies in the folder of its tag, with its `legal-3.tar.gz.sigstore.json` beside it. The tag, the name and the sum are held by `LEGAL_FILE` in `scripts/legal.ts`, and a test checks the tag against `spec_tag` in `justfile` and against the version of `@altnovatrail/spec`: a move to a new tag of `spec` raises them together with the file. The release's paths take the copy through `tasks/*`, and `scripts/legal.ts` by a line of its own; so does `page.yml`.
- **The reader** is `scripts/legal.ts`, only in the builder and the tests, on Node, of the types `@altnovatrail/spec/legalv3`: ajv 8.20.0 by the 2020-12 schema, yaml 2.9.1 by YAML 1.2 with the Core schema, with no repeated keys and no anchors, and mdast-util-from-markdown 2.1.0 with GFM — the same versions as `spec/tools` has. The part's `VERSION` equals the passport's field `format`, and `tar` unpacks exactly the bytes checked against the sum. It reads the part on a day in UTC — the builder on the day of its build, `todayInUtc()` —, goes through the translations as well, and gives the current version of each text and set and the next one. The code of `canvas` and its tests do not read `spec/`, so the reader is its own — a third beside the checks of `spec` and `api` —, and a test runs all 27 reading vectors from the same archive through it: each rule, `legal.operator` too, and the schema reject, and the part is accepted. The build reads the part without the release before, as `legal-check-dir` reads the folder of a copy: the rule `legal.in-force-unchanged` is the history of `spec` itself, and `spec`'s CI checked against the release before the part it then signed. A part the reader rejects stops the build.
- **The display.** The builder turns the notice's Markdown into blocks — headings, paragraphs, lists with the number of the first item, tables, quotes, code and the thematic break, and within a line bold, italics, code and the line break —, and the page builds elements from them as text, with no HTML (`page/notice.ts`): its policy needs nothing. A node of another kind stops the build. For display the text is read as it is written — CommonMark with GitHub's tables and nothing more of GFM, as the part's README says —, so `~30 days~` and `[ ]` stay text; the rule `legal.markdown` reads the same text with all of GFM, as `spec`'s check does, so that a bare address is a link and is rejected. On the page, headings deeper than the third level merge into the sixth: HTML has six, and the part's notices have two levels. Above the English text with `lang="en"` stand the gist of the notice in Russian from the passport and a sentence that the English text is the one in force, as `spec`'s privacy text and its decision on the lawful basis require: the English text is in force, and what is mandatory in a consent is shown briefly in the screen's language. The text's headings stand below the notice's heading: the first level is the fourth.
- **The statements and «куда передать файл»** are the page's words, `page/texts.ts`. The statement of age, which `spec`'s decision on the writing history as biometric data rests on, is in every purpose, and the second one is «форма согласия версии … подписана и принята организатором»; in a child's session it is the parent's or guardian's form of the same version. The file goes to the organizer by an upload link, and is then erased from the device, as every notice says, by `spec`'s decisions on child samples and on the volunteer's form and its route; the link works 12 hours at most from the session, and the page's words, `HAND_OVER` of `page/texts.ts`, say «она работает не дольше 12 часов», not «сутки», in all three purposes. For an eval set in `modules`, the organizer enters the sample.
- **The test part** is `page/sets/test/`, in the layout of `legal` of version 3: the sets `test-measure`, `test-eval-set` and `test-child-sample` in force, texts in English — with headings, a list and a table —, the gist «тестовый набор, не для образцов», and a stub of the policy, `texts/privacy-policy/1.md`, which `legal.operator` wants of every part, "for tests alone". The flag `--texts <folder>` takes it only into a page of version 0.0.0, and the builder looks in it for sets with the prefix `test-` and reads it with the same reader by the release's schema. It is not among the release's paths.
- **The sets in force.** On `spec` v0.18.3 the page takes, from 2026-11-16, `measure-3` and `eval-set-2`, whose notices give the upload link 12 hours at most from the session (sources 6.12); `child-sample` is a draft, so the child sample session is closed: «пока текст согласия на него не утверждён». When the author puts a set in force, a move to a new tag of `spec` opens its purpose, with no change of code. The build carries the modules' tasks, so the eval set opens under its current set; the test build, where `test-eval-set` is in force, opens it too, and the page's test saves in it a sample on an instance of a template.

— *Why:* `spec`'s answer while it planned its part `legal` (Д161 in the RUN.md of `spec`): the legal texts are a normative part of `spec`, each version a file of its own forever, `canvas` takes its sets from the release file, and a sample names the version of its set. The author kept the work whole, against the recommendation, and chose a full reader by the vectors and a test part of its own, as recommended. The copy in the tree is as with `tutor`'s file of open views: a pull request checks the same build that will come out, and the build needs no network. Each purpose has its own set, because the author approves the adults' and the child's consents separately, and the part gives each its own version. The part's version 3 is read on a day because a set applies from the day it was approved: "no screen shows it ahead", says the part's README.

— *Rejected:*
- **downloading the file in CI** — a second path beside the copy, and a pull request would check a build other than the one that will come out;
- **a reader without the schema and the rules**, trusting the signature, — the part's README says not to accept a part that even one step rejects;
- **the reader's code from `spec/tools`** — the code of `canvas` and its tests do not read `spec/`, and the release's build runs without the submodule;
- **the part's drafts in the test build, as if they were in force**, — the devices would have real texts, but a draft "is shown to nobody", and a sample would name a version that looks like a real one;
- **HTML from Markdown in the builder** — it would have to be inserted as HTML, and blocks keep text as text;
- **display with all of GFM** — by the part's README the text is CommonMark with tables, and GFM would strike through `~30 days, ~90 days~` and make `[ ]` a task checkbox;
- **reading the part on the tag's day** — a set whose day comes after the tag would never open.

— *Revisit:* when the version of the part `legal` changes — the file's name, the layout and the reader's types; when the page gets languages by `spec`'s shared rules of translations — the gist in `en` for an English screen.

— the tasks of the text sets, of the modules' tasks and of the move to `spec` v0.15.0 in [plan/E10.md](plan/E10.md), of the moves to v0.17.4 and v0.18.3 in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the samples page's steps, and code and tools; the README of the part `legal` in `spec`; `scripts/legal.ts`, `scripts/legal.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `page/sets.ts`, `page/sets/test/`, `page/notice.ts`, `page/steps.ts`, `page/steps.test.ts`, `page/texts.ts`, `page/main.ts`, `page/index.html`, `justfile`, `.github/workflows/release.yml`, `.github/workflows/page.yml`, `emulators/`.

## axe-core in the tests

**R70. In the tests, axe-core 4.14.0 checks the shadow tree of `<novatrail-canvas>` — by the rules of WCAG 2.2 level AA, with the root at the element itself, on every canvas kind, in Chromium, WebKit and Firefox, and in forced colors in Chromium and Firefox. A test fails on every violation and on an "incomplete" that is not in the kind's named list; a `color-contrast` between two colours of the system's palette is the user's, not the element's, and does not fail it. The contrast of the workbook's lines, which axe does not determine, the test computes itself. The samples page goes through the same axe whole. axe-core is under MPL-2.0, a named exception of the license check, as `lightningcss` is.**
- **Why its own.** `app`'s CI does not check the subtree of the canvas element, by `app`'s own decision on its accessibility checks, so `canvas`'s CI holds it: "its own axe-core in CI" is what `spec`'s decision on one accessibility standard for the UI packages tells `canvas` to do.
- **The rules** are the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`: by the tag `wcag22aa` axe marks only what is new in 2.2, so all five are needed. The rule `target-size` measures 2.5.8, "at least 24 by 24 CSS pixels", and `spec`'s standard requires 2.5.5 too, 44 × 44: the test of the sheet's toolbar holds that measure. What axe does not measure at all — the keyboard inside the sheet, zoom, the layout in a low window — is for the tasks of E10 on the row in a low window, the sheet from the keyboard and zoom, and their result is the declared nonconformities.
- **How.** `axe-core` right in the tests of Vitest browser: a test runs inside the page, and `axe.run(element)` goes through the open shadow root. The helper `axeOf` and the canvas kinds — a sheet with a task and a stroke, a statement with pictures, a workbook, marks on a sheet, a worked example on a sheet, with a picture beside it and in a sheet area, all parts open, and an example on a workbook — are in `src/element/axe.fixture.ts`, which `src/element/a11y.test.ts` in the project `browser`, at both densities and in all three engines, and `src/element/forced-colors.test.ts`, in Chromium and Firefox, take. The tags are in `src/element/wcag.fixture.ts`, with no DOM: both the element's tests and the page's test take them. The helper's error names the rule, the node and `failureSummary`; a test also holds that the helper fails on a button without a name put into the shadow root.
- **"Incomplete".** What axe cannot determine it leaves "incomplete", not as a violation. In the workbook this is `color-contrast` of its lines: "Element's background color could not be determined because it is overlapped by another element" — the input layer `.stage` lies over the SVG of the lines. So the kind names its "incomplete" ones, a new one does not pass silently, and the test computes the contrast of the lines' text against the paper itself, by WCAG's relative luminance, on the task's workbook and on the example's workbook: no less than 4.5:1 (1.4.3). For the default colors, `#111` on `#fff`, it is about 18.9:1. The test refuses to measure a color with transparency: it has no contrast of its own.
- **The system's palette in forced colours.** In Firefox's forced colours `Highlight` on `HighlightText` is 2.94:1, which `color-contrast` finds on the row's selected tool: `axeOf` takes the pairs of the system's palette that the test reads from the engine, and drops a `color-contrast` whose two colours are such a pair — they are the user's palette, not the element's colours (measurements 1.5). A pair is taken only when both colours are opaque: Chromium's `Highlight` is translucent, which axe blends with what lies under it, so there it takes none.
- **The samples page.** `scripts/page.test.ts` puts `axe.source` into the page through `page.evaluate` — the page's policy does not let in a script it did not bring —, and goes through «Начало» of both builds, the notice of each open purpose, the writing, the markup form and «Открыть образец» with each file of the examples; a button without a name put into the page gives `button-name`. "Incomplete" ones are named there too: for the workbook's file, `color-contrast` of the labels of the boxes in the sample's sketch, text inside a picture under strokes, which 1.4.3 exempts: "part of a picture that contains significant other visual content". The test found one violation — `color-contrast` of the reason notes, the class `.note` with `GrayText` —, and the color became `#595959`, 7.0:1 on white.
- **The license.** axe-core is under MPL-2.0, approved by OSI, with no dependencies, only in the tests: it puts nothing of its own into the package or the page, and NovaTrail does not distribute it. So it is a named exception in `licenses.json` (RULES.md, Licenses, and the entry on the first code), and the check answers "2 exceptions". The version came out on 2026-10-05 — more than three days before it was installed, as the entry on the first code asks of a version.
- **On 2026-11-10** the element has no violations on any kind, in any color mode.

— *Why:* the author chose a test of its own for the contrast of the workbook's lines and "incomplete" by the kind's list, and the samples page in the same task, both by the recommendation; `axe-core` right in the tests — by the plan's recommendation. The plan's probe on the page's build found zero violations in the element, and one in the page. The kinds run in WebKit and Firefox, and forced colours in Firefox, as all the element's tests do by the entry on `spec` v0.17.4.

— *Rejected:*
- **`@axe-core/playwright`** — it needs Playwright's `Page` object, and a test of Vitest browser runs inside the page; one more package under MPL-2.0 for what `axe.run` does itself;
- **exceptions of rules for known violations until their tasks** — there are no such violations; a future one is fixed, or gets an exception with a task's number, when it appears;
- **accepting "incomplete"** — nothing would hold the contrast of the workbook's lines;
- **only the tag `wcag22aa`** — it carries only what is new in 2.2.

— *Revisit:* when axe learns to determine the background under the input layer — remove the workbook's "incomplete"; when the row, the sheet or zoom change — their kinds in `KINDS`; with a new version of axe — the list of "incomplete" and the rules.

— RUN.md; the tasks of axe-core in the element's tests in [plan/E10.md](plan/E10.md) and of the move to `spec` v0.17.4 in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), on code and tools; `src/element/axe.fixture.ts`, `src/element/a11y.test.ts`, `src/element/forced-colors.test.ts`, `scripts/page.test.ts`, `page/index.html`, `licenses.json`, `package.json`.

## Modules' tasks on the samples page

**R71. The samples page's build carries modules' tasks for an eval set — a copy of what `module-kit` v0.3.0 writes by its command `open` about the release `modules` v0.2.7 with the templates' seeds 1–5. The copy lies in `tasks/modules-v0.2.7/`, and `ci-licenses` writes the output anew from the files that `release-verify` accepted and checks it against the copy byte for byte. The page takes sheets with one answer place `anywhere` or `sheet` and workbook pages, with the media of their statements and the module manifest, and leaves to `app` the choice that is marked by a tap. A sample's reference names the release that issued the package, the module, its version and the package digest, the task, for an instance its seed, and the digest of the open view that `module-kit` gives.**

- **Why a copy, and not `module-kit` in the build.** The release's build runs with no network, no token and no `spec/`: "The recipe runs with no network, token or spec/" (`.github`'s shared `release.yml` v0.1.22, the step of the previous release's file). So the build takes a file of the tree, as it takes `tutor`'s file of open views, and `ci-licenses` has the network and `spec/`. The recipe `just modules-open`:
  - downloads the `module-kit` binary for its machine, `linux_amd64` or `linux_arm64`, and the archives of the packages that `module-kit open` will take from the copy's index — for each module the newest version of format 0.4 that the index has not withdrawn (`scripts/modules.ts packages`). The archive's name is `sha256-<hex>.tar.gz` from the package digest, in the release of its entry, by `spec`'s decision on the module index;
  - has `release-verify` accept the binary, the copy's index and each archive, unpacks the packages and runs `module-kit open` with `--index` and `--latest` — the copy's index, the newest on the day of the copy —, and with the seeds from `justfile`;
  - checks the output against the copy (`check`, in `ci-licenses`) or writes the copy anew (`copy`, on a move to another release or to other seeds).
- **The versions.** The release `modules` v0.2.7 issues the board module `novatrail/check-board` 0.1.0: the eleven tasks of `tutor`'s check board, whose eval set the author writes on the page, as `spec`'s cross-repository plan asks. Its index holds the versions of v0.2.4 and adds the board module, of module format 0.4 and released by v0.2.7 itself (sources 5.6). `module-kit` is v0.3.0: v0.3.1 and v0.3.2 changed none of its code of `cmd/` and `internal/` — their releases only moved `module-kit` to new tags of `spec` (sources 5.5).
- **What is in the copy.** The release's `module-index.json` with its signature, `open-views.json` as it is, and for each module `modules/<ID>/<version>/` — `LICENSE`, `NOTICE` if there is one, and only those files of `media/` that the statements of the tasks the page takes name: 164 pictures, 1.89 MB of the package's 12.3 MB of media, — without the media of lessons and solutions. The copy is about 2.8 MB, and the page's file about 3.6 MB. `MODULES_FILE` in `src/eval/tasks.ts` holds the tag, the seeds and the sum of `open-views.json`, and a test holds their agreement with `justfile`.
- **What the page takes.** `kindOf` in `scripts/page.ts` is one for the build and for the selection of the copy's media: a workbook page, a sheet with one place `anywhere` — among them a choice written by hand too, the check `choice` with the place `anywhere`, by the module format's rule on a choice written by hand —, and an essay, a sheet with one place `sheet`. Tapped choice (`binding: choice`) is shown and marked by `app`, and the element skips it, so the page does not take it and it does not stop the build. On v0.2.7 this is 769 views of 894: 741 sheets of `olympiad-math` — of them 110 instances of 22 templates —, 12 workbook pages of `grade-3-math`, 5 essays of `english-essays` and the 11 sheets of `check-board`, with no template and no picture; 125 tapped choices are outside it.
- **What the build checks.** `openViewsOf` reads `open-views.json` of the format `module-kit-open-views` version 0 and of module format 0.4: each view is only the fields of the open view, the same walk as for `tutor`'s file, and its `canonicalText` gives the very digest that `module-kit` wrote, otherwise `TypeError`. So the sample's digest is the one that the `just eval-match` of `modules` checks it against. A picture is PNG or WebP, otherwise the build stops.
- **The sample's reference.** The source `modules` is `tag`, `module`, `version`, `package_digest`. By the contract `tag` is "the release of `modules` whose index holds the package", and this is the entry's `release` — the release that issued the package: v0.2.1 for `olympiad-math` and `grade-3-math`, v0.2.0 for `english-essays`, v0.2.7 for `check-board`. The tag does not change when `canvas` moves to a new release of `modules` with the same package. `task` is the task's ID, for an instance the template's ID, and `seed` is its seed in decimal digits.
- **The page.** The module manifest gives the element the digit height, and the media are a `Blob` from the build's data by the statement's reference. The license notices of the file name each module: Apache-2.0, `LICENSE` — the same text as `canvas`'s, otherwise its own —, and its `NOTICE`: for `olympiad-math` this is the MIT of `mathtrail-standalone`; `check-board` has a `LICENSE` of Apache-2.0 and no `NOTICE`. The choice of a task, the file's name and the purposes are those of the entry on «Начало».
- **The measurement is on `tutor`'s file.** The author chose so: the tasks by which `tutor` measures do not change in the middle of the measurement. Д4 stays open for the measurement.

— *Why:* `modules`' request for the author's first samples in the eval sets of modules, above all of templates, of choice by hand and of essays, which `canvas`'s generator of synthetic samples does not draw; the author chose the measurement on `tutor`, seeds 1–5 and `<id>.json` by the recommendation, and the task whole against it. A copy, not a download: the release's build has no network, and a pull request checks the very build that will come out, as with `tutor`'s file. The release v0.2.7, for the board module's eval set, is a new copy with its tag and sum, as this entry's *Revisit* says of a new version of a module; nothing else changes, and `release-verify` accepted the index and the package's archive.

— *Rejected:*
- **`module-kit` in the build** — the release's build has no network, so the binary and the packages would have to be put in the tree;
- **a copy of the packages' archives with a choice of a template's instance of our own** — the choice of an instance by seed is the format's generator, the code of `module-kit`, and 11 MB of the archive of `olympiad-math` in the tree;
- **a copy of the whole output of `open`** — 15 MB, of them 12 MB of media of lessons and solutions that the page does not show;
- **the measurement on `modules`** — the tasks by which `tutor` measures would change in the middle of the measurement;
- **`--latest` from the newest release of `modules` on every run** — the copy would stop matching with no change in the tree; a new release comes by a change of the copy of its own, as `tutor`'s file does;
- **seeds for each template as a list of its own** — `module-kit open` takes one shared list, and `module-kit`'s own decision rejected `--seeds <file>`.

— *Revisit:* when `modules` issues new versions of modules or withdraws one — the copy anew, `just modules-open copy`, with the tag and the sum; when `module-kit` comes out with a new projection or output format — the same; when `spec` gives `eval-set` in force — the move to the tag opens the eval set with no work on the page; when the measurement asks for modules' tasks — Д4.

— RUN.md, Д4; the tasks of modules' tasks in the page's build in [plan/E10.md](plan/E10.md) and of the board module's tasks in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), on the sample file and the samples page's steps; `justfile`, `scripts/modules.ts`, `scripts/modules.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `page/main.ts`, `page/texts.ts`, `emulators/watch.ts`, `emulators/page-android.ts`, `tasks/modules-v0.2.7/`.

## The move to `spec` v0.15.0

**R72. `canvas` is on `spec` v0.15.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The page takes the text sets from `legal-2.tar.gz` — the part `legal` of version 2, where a text version has translations —, and on it `measure-2` and `eval-set-1` are in force: the release opens the measurement and the eval set, and the child sample session is closed until a set `child-sample` is in force. The author's draft `draft-0` is gone.**

- **What the tag tells** — Д193, Д202, Д205 and Д207 in `spec`'s RUN.md: `measure` in force, version 2 current, `eval-set` of version 1 in force, the release's file `legal-2.tar.gz` with the field `translations`, and `child-sample` a draft. Д189 — the generator and the digest command — was done by E11. `spec` recorded В75 by option (a).
- **The part at version 2.** A text version's translations are the files `texts/<ID>/<n>.<tag>.md` that the `translations` of the version's entry name; they have no force, the English text is the one in force, by the README of the part `legal`. The reader `scripts/legal.ts` goes through them with the rules `legal.files`, `legal.markdown` and `legal.in-force-unchanged`, and for the last one through the translations of the entry of the release before too, as `spec`'s reader does. The page does not show translations. The types are `@altnovatrail/spec/legalv2`: the package 0.15.0 gives it instead of `legalv1`.
- **The draft is removed.** The page's text sets kept `draft-0` only until `measure` was in force. The author writes their own samples as a volunteer — with a form that the author accepts as the organizer. A purpose with no current set is closed, and the measurement too — with a reason of its own —, so the page will not open the measurement without a consent text if the set goes out of force.
- **What did not change.** The devcontainer template, RULES.md, the sample's contracts, `format-0.4`, `release-verify`, `sample-check`, `docs-check` and the license check are the same (`git -C spec diff v0.14.0 v0.15.0`). `.github` has released nothing newer than v0.1.22.

— *Why:* the author asked to move to the newest `spec` — «переходи на spec последней версии» —, and the tag itself opens the purposes that the page was waiting for: the eval set of the tasks of `modules` and the volunteers' measurement.

— *Rejected:*
- **keeping `draft-0` as a fallback path** — the draft was to go once a set was in force, and a measurement without a set in force would open samples without a consent text;
- **showing the notice's translation into Russian** — a translation has no force, and the page already shows the gist in Russian from the passport.

— *Consequence:* the task of this move in [plan/E10.md](plan/E10.md); [architecture.md](architecture.md), the samples page's steps; the README of the part `legal` in `spec`; `scripts/legal.ts`, `scripts/legal.test.ts`, `page/sets.ts`, `page/steps.ts`, `page/texts.ts`, `page/main.ts`, `scripts/page.ts`, `justfile`, `tasks/`.

## The sheet past the page

**R73. The sheet goes past the page, and the page's zoom scales it from half its fit to twice it. The task's page, 1000 × 1400 units, stands at the sheet's left, fitted to the width of its area up to a CSS px a unit, times the zoom; the sheet goes on to the right as far as the page, the ink and the tracing paper go and one view more, and down as far and two views more, within the reach of 10000 × 14000 units. Zoom in and Zoom out on the bar step the zoom by quarters, and a pinch of two fingers sets it between. The container scrolls the sheet across as well as down; the statement and a demo's parts keep the page's fit at its left.**
- **The scale** `k = min(A / 1000, 1) × z`, A the container's width in CSS px and z the page's zoom: at 100 % the page fits the width, and on a wide screen it is 1000 CSS px, a pixel a unit as on the picture (`fitScale` and `K_MAX` in `src/core/screen.ts`). Nothing else changes `k` but the width.
- **The zoom** (`PageZoom` in `src/core/zoom.ts`, `PAGE_ZOOM` in `src/element/session.ts`): one for every sheet of the page, from 100 % when the page is loaded, till it is loaded again, in memory alone, as the pen mode is; a new element takes it. From 50 % to 200 %: Zoom in and Zoom out, after a line below Clear, go to the next quarter up or down — 50, 75, … 200 % —, each `aria-disabled` at its end, and do nothing while a pointer writes or erases on a sheet of the page. Two fingers whose span has changed by more than the slop pinch (`Hands` in `src/core/hands.ts`): the zoom goes by the span's ratio from there, read once both fingers have moved, or one twice while the other stands, since a browser tells their moves one by one. A press keeps the point of the sheet in the middle of the part in sight where it was on the screen, and a pinch the point under the fingers' middle (`#zoomed`); the next press keeps the same point while nothing has scrolled or moved the container since (`#held`), so that a zoom out at the sheet's edge, where the scroll stops short, and back in comes back where it was. A worked example's sheet is its page at the fit, whatever the zoom: it has no bar.
- **The extent** (`extentOf` in `src/core/sheet.ts`, `#reach` in `src/element/index.ts`): right and bottom are the furthest of the page, the strokes of the sheet and the tracing paper's rectangle where it lies (its own strokes count with it), plus one view of the window in units across and two down, at the window's own fit, `innerWidth / fitScale(innerWidth)` across and twice `innerHeight / fitScale(innerWidth)` down, divided by the zoom's quarter below it while the zoom is under 100 %, so that a pinch lays the sheet out anew only as it crosses a quarter — the window, not the container, for a container as tall as its content would grow the sheet by itself, and a room that the container's size set would change inside the observer's report, which the browser tells the window as a loop —, each rounded up and kept within `REACH`. A stroke, an undo, a clearing, a new history, the tracing paper moved or given, a zoom and a resize of the window lay the sheet out anew when the extent or the zoom changes (`#regrow`), and the sheet takes its size from the stylesheet, by the zoom and the extent's ratio to the page (`--zoom`, `--across`, `aspect-ratio`), so that a resize of the container sizes it with no script; there is always somewhere to move it to and write, and an undo or a clearing takes the room back. A worked example's sheet is its page alone: the learner does not write on it.
- **The layout.** The column is as wide as the extent times `k`, the sheet's box in its proportions; the stage, the visible part on both axes, is no larger than the container, and the canvas's buffer does not grow with the extent or the zoom. The container scrolls both ways, `overflow: auto`, with no scrollbars, `scrollbar-width: none` — they took a strip of the sheet at its right and bottom, and it is moved as "Moving it" below says —, and runs left to right whatever the page's direction: the column is the page's fit times `--zoom` and `--across`, the extent's width over the page's; the statement and a demo's parts are as wide as the page's fit, stick to the container's left, and keep the element's own direction, as its style computes it — by `dir` or by `direction`. The grid's path rules the whole extent and is drawn anew when the extent or the grid changes (`gridPath`). A dot is 3 CSS px across at the fit and above it, and smaller by the zoom below it: a sheet zoomed out is no field of dots. The anchor is the top left corner of the visible part: a new width keeps it where it was on the sheet, unless the sheet's top, or its left, is in sight.
- **The padding** `--novatrail-canvas-pad-top` and `--novatrail-canvas-pad-bottom`, which the consumer sets when its own bars float over the element's top and bottom (the mockup's glass bars): the column takes them as its padding, so the statement starts below the first and the sheet scrolls up past the second, and the bar's band ends above the second. The padding is the sheet's paper, not the page's background: its grid goes on above the sheet, where no statement stands, and below it, a ruling on each step as the sheet's own, the one on the sheet's edge too (`gridBand`), for under floating bars a white strip cut the sheet off. Both are 0 by default, and with 0 no band shows.
- **Moving it:** the hand, two fingers, one finger in pen mode, the wheel, the trackpad and the keys of the scroll container's region, across too once the sheet is wider than the container. What a drag scrolls on each axis its first step along that axis chooses — the container, the nearest ancestor that can, the page —, and a gesture of the fingers that at the slop has gone twice as far along one axis as the other goes along it alone to its end, `RAIL` in `src/core/hands.ts`.
- **What stays the page:** the task's zones, the workbook's lines and boxes and a worked example's areas lie on it; the work for checking is the crop of the strokes wherever they lie, and `exportPicture()` is the page with the ink past it, but not the room of the views: neither depends on the zoom.
- **WCAG.** 1.4.10: the sheet scrolls in two directions, which a two-dimensional layout is allowed. 1.4.4: Zoom in takes the page, and the workbook's print on it, to twice its fit, by the technique G178 (sources 9.18), and the browser's zoom enlarges and reflows the statement, a demo's parts and the labels. 2.5.1: the pinch is not the only way, the bar's buttons are single presses.
- **The tests** are `src/element/wide.test.ts` and `src/element/zoom.test.ts`: the extent past the ink and back, a history far past the page, the statement's width and direction, the anchor, a stroke and the eraser past the page, the region across without a height, one view of every layer, the grid over the extent, a worked example's page alone, and the hand; the zoom's sizes and ends, its steps from the keyboard, the middle in sight that stays, and the way back from the edge, a stroke and the work at any zoom, the page's zoom on every sheet, the grid's dots, and the pinch. The extent's arithmetic is `src/core/sheet.test.ts`, the zoom's `src/core/zoom.test.ts`, the rail and the pinch `src/core/hands.test.ts`, `vx` `src/core/screen.test.ts`.

— *Why:* the author's choice, by the interface mockup of `spec/draft/mockup/`: the drawing area fills what is in sight, as in Apple Notes — «Лист шире страницы», the page at the left and the sheet growing right, «Слева, лист растёт вправо». The zoom came back by the author's word — «раньше в панели инструментов слева также был инструмент масштабирования — 2 кнопки с увеличительным стеклом. Нужно вернуть этот функционал» —, from 50 % to 200 % and with a pinch, by the mockup's states `solve-zoom` and `solve-zoom-out`, and the room down twice a view by the same word, «увеличить размер холста вниз вдвое»; the dots smaller below the fit too, «при уменьшении сделать точки на сетке поменьше». A sheet that grows with the ink gives room wherever the learner writes, and the hand moves it with any pointer. The page stays 1000 × 1400 units: the zones, the lines, the crop's rule and the samples count in them. The reach bounds a history's numbers and the rules' whole numbers; ten pages each way is more than a task needs. The zoom is the page's, as the pen mode is, so that a learner who needs it asks once.

— *Rejected:*
- **no zoom of any kind** — on a tablet the print and the ink were too small to read, and a whole task could not be seen at once;
- **a zoom of the sheet alone, its own for each element** — the next task is a new element, and a learner who needs it larger would ask again at each;
- **a zoom stored with the profile** — a state of the interface, not data, as the pen mode; nothing is stored or sent;
- **a sheet of a fixed width of three screens**, as the mockup draws it — the mockup's `SW = 3W` is a drawing convenience: a fixed width runs out where the learner writes, and a wide empty sheet scrolls for nothing;
- **centring the page on a wide screen** — the sheet grows to the right, and a page in its middle would leave room at its left that nothing fills;
- **a sheet without a bound** — a history with points of any size would reach the rules' whole numbers and the stage's arithmetic;
- **the span read at each finger's move** — a browser tells the two fingers' moves one by one, and the span between one moved and one not yet makes a scroll of two fingers a pinch;
- **a drawing surface as large as the sheet** — at ten pages it would be many times the container; the stage stays the visible part.

— *Revisit:* the room of the views, the reach, the rail and the pinch on devices (Д7 in [run/DEBT.md](../run/DEBT.md)).

— *Consequence:* [architecture.md](architecture.md), the drawing engine and the layers, the sheet's logical coordinates, docking with the app and accessibility; `src/core/sheet.ts`, `src/core/screen.ts`, `src/core/zoom.ts`, `src/core/hands.ts`, `src/core/grid.ts`, `src/element/session.ts`, `src/element/index.ts`, `src/element/wide.test.ts`, `src/element/zoom.test.ts`.

## Declared nonconformances

**R74. What the element does not yet meet of `spec`'s standard of UI packages is named in [architecture.md](architecture.md), on accessibility — the criterion, what stands instead and when it goes —, and `app` takes it onto its page «Доступность». Three are declared: 1.4.12 — the workbook's print does not take the user's text spacing —; 2.5.7 — the sheet and the tracing paper are moved with a single pointer by dragging alone —; 3.1.2 — the name of the sheet's region in an element without an attribute `lang`. The answer in handwriting `app` declares (О-25).**
- **1.4.12 Text Spacing.** The print of the workbook's lines — the numbers, the pieces of text, the demo's values in the boxes — drops the inherited spacing, `all: initial`, and each piece keeps the layout's width, `textLength` with `lengthAdjust="spacingAndGlyphs"`: the user's spacing, set even inside the shadow tree, does not change it (sources 9.20, the probe). Instead: the consumer's font, and the browser's zoom on an area wider than the page; the statement, the demo's parts and the bar's labels take the spacing, and no label is clipped. No term: the place of a piece and of a box is set by `spec`'s page rule, `format/page.yaml`, by the table of widths, and this goes only if the rule gives the lines room for spacing.
- **2.5.7 Dragging Movements.** The sheet is moved with a single pointer by dragging alone: the hand under any pointer, one finger in pen mode, two fingers always; and the tracing paper of a task from paper by dragging its grip. The sheet's scrolling is the element's own, which Understanding 2.5.7 counts, and the keyboard is no substitute (sources 9.10). Instead: the wheel, the trackpad and the keys of the scroll container's region, the arrow keys on the grip, and in an element without a height the page's own scrolling down, which 2.5.7 does not count. No term: a single-pointer way without dragging comes back only by a change of `spec`'s standard, which took away the buttons that scrolled.
- **3.1.2 Language of Parts, the region's name.** The region's name is a label, and the scroll container holds the statement, the parts and the sheet in one column:
  - with an attribute `lang` the table of labels does not know — the RFC 4647 lookup finds nothing, as for `de`, `fr-CA` or an empty attribute, not for `ru-RU` or `en-GB` —, the container takes the labels' `lang`, English, and the column, its only node, the attribute's: the name is voiced in its own language, and the rest in the element's;
  - with an attribute the table knows, both take it: Firefox gives a shadow tree no language of its host, and WebKit takes no new one into it, though HTML has a node whose parent is a shadow root take its host's (measurements 1.5);
  - without the attribute neither has a `lang`, and the English name is voiced in the page's language, which the element inherits: the container cannot be given `lang="en"`, which would fall on the column too, and the column cannot be given the page's language, which the element does not read. This is the nonconformance. Instead: the English name. No term; `app` never has it — it always sets the attribute, in `en` or `ru`.
  - `#nameRegion` sets both languages with the region's name — on a new value of the attribute, its removal and a change of the canvas kind. The other fallback labels — the bar's buttons, the boxes' names, the parts' numbers — carry their own `lang="en"`, and a demo's value in a box is a node of its own in the lines' language.
- **Declared by `app`, not by `canvas`:** an answer in handwriting — 2.1.1, 2.5.1 and 2.5.7, until a second way of answering (О-25); a task from paper solved in handwriting — 2.1.1, with no term; submission on «Проверить» — 3.3.4, `app`'s button, since `exportWork()` submits nothing.
- **Limits, not nonconformances:** the handwriting of the samples page is the sample itself, the exception of 2.1.1 for a path, and the page is no screen of `app` (sources 9.20).
- **Not checked:** the keyboard in the region in Safari; VoiceOver and TalkBack, Д7; the accessibility trees of WebKit and Firefox, which the tests read only through the DOM and axe.
- **A new nonconformance** that a task or a review finds goes into [architecture.md](architecture.md), on accessibility, and into a row «в реестр spec» for `app`'s page, and one that is gone leaves both the same way.

— *Why:*
- `spec`'s standard of UI packages bids a package declare by itself, and `app` gather what is declared;
- 1.4.4 is met, not declared: Understanding 1.4.4 — "it should still be possible to get 200% text enlargement in some way compared to the default 100% zoom" —, and its technique G178 is controls on the page (sources 9.18). Zoom in takes the page, and the workbook's print on it, to twice its fit;
- 1.4.12: Understanding 1.4.12 exempts spacing that did not take effect only if the content is "not actively and purposely preventing" it (sources 9.20), and the print prevents it on purpose;
- 3.1.2: the path through the column keeps one node with the element's language, and the name is set in the step that sets the languages.

— *Rejected:*
- **a scale of the page beyond the fit by a setting of `app`**, given by a style property — the bar's Zoom in gives it on every sheet, where the learner is;
- **print with the user's spacing** — without `textLength` a piece wider than its place would run onto the box, and the box's place is `spec`'s page rule and the place of its crop. A margin for spacing is a matter of `spec`'s rule: 0.12 of the font size a character is more than a fifth of a digit's width, 0.53 of the font size by the table of widths, and the lines would shorten for every learner;
- **the region's name through `aria-labelledby` on a node with `lang="en"`** — the name the browser computes is a string without a language;
- **`lang` on the container and the column only while the container is a region** — a `lang` without a name falls on nothing, and the role and the language would part where the region comes and goes: on scrolling, focus and `blur`;
- **the column's language read from an ancestor without the attribute** — the element would watch the `lang` of every ancestor and of the document, whose changes give no events, and `app` sets the attribute.

— *Consequence:* [architecture.md](architecture.md), docking with the app and accessibility; `src/element/index.ts` (`#nameRegion`); `src/element/keyboard.test.ts`, `src/element/a11y.test.ts`, `src/element/labels.test.ts`.

## Tests under load

**R75. A test's time limit is its own: a test or a hook gets a timeout of twenty times its own time on a free runner of CI, rounded up to whole tens of seconds, when this is longer than its project's default limit, and one helper holds the rule, `budget()` in `src/core/budget.fixture.ts`. A test waits for the event it waits for, not for time. An enumeration checks each of its states once and gathers the violations under one `expect`, when these are the same checks for less work.**
- **The projects' default limits** — Vitest 5.1.0: in Node 5 s per test and 10 s per hook, in the browser 15 and 30 s. So a limit of its own goes to a Node test from 0.3 s — from this time on Vitest writes the test a line in the log —, to a Node hook longer than 0.5 s and to a browser test longer than 0.75 s. The rest stay on the default limits, and the rule removes their own literal from them too: so went the 40 s of two tests of `emulators/volunteer.test.ts`, which with fake clocks take milliseconds, and the 60 and 120 s of two tests and a hook of `scripts/generator.test.ts`.
- **A test's time** is its line in the log of a green run of "TypeScript / test": coverage is on there, and the browsers of the other projects run beside the project `node`. A hook has no line, and its time is the file's line minus the lines of its tests. A test writes only its time, `{ timeout: budget(1_450) }` as the second argument, and a hook `budget()` as the last one. The times were taken from the run of `main` 43118509970 of 2026-11-11. The enumeration of six steps of `work.test.ts`, rebuilt with the rule, has no line there, and its time is an estimate: 1.2 s on a free container, multiplied by 2.6 — the ratio of the runner to the container for the earlier enumeration, 19.2 s to 7.3 s. The CI line of its pull request will replace it.
- **Twenty times** is the margin for a loaded host, by measurements in the container, the branch and `main` by one recipe at the same time. At a load average of 42–85 on 20 cores, "app's path" of `consumer.test.ts` went past 15 s — eighteen of its own times on the runner —, and `scripts/synthetic.test.ts` and `scripts/generator.test.ts` past ten of their own. `main` failed there with 22 and 18 tests a run, and the branch with ten times with 4 and 5, the ones named. At a load average of about 100 both fail, 15–33 tests a run: there the tests need 20–30 of their times on the runner, and the limit does not hold such a load. The limit catches a hang and a twentyfold slowdown. A smaller one shows in the tests' times in the CI log.
- **Its own event, not time:** `pictured` in `src/element/axe.fixture.ts` waits for the media files and their parsing — `arrive()` from `pointer.fixture.ts` —, not for a one-second poll of the number of pictures by `expect.poll`. The media are a spy, and if the element did not ask for the files, the helper fails at once. The page's tests, `scripts/page.test.ts`, wait for a node, for visibility and for the form by Playwright's waits — `waitFor` and `waitForFunction` —, not by polls. The polls of `src/element/hands.test.ts` stay: their condition already holds at the first read — the row is updated by a microtask of the input event that the test waits for anyway.
- **The probe, storage:** the test `probe/probe.test.ts` closes the page that wrote and reads the record in a new page of the same file and context, not after a reload. Under load — a load average of 43–80 on 20 cores — the first document after a `reload()` of the file in Chrome Headless Shell read the storage as empty in 1–4 of 40 repeats and stayed so, although a new page of the same context and a second reload saw the record. Waiting for the record to reach the browser's storage before the reload did not change this: there is no event here that the test would have failed to wait for. The new page passed 160 repeats of 160 at a load average of 60–70. The reload on devices is held by the probe itself (measurements 1.1, 1.2).
- **The enumeration of six steps** of `work.test.ts`: a step's checks depend only on the steps before it, so each of the 19,530 states is checked in the first sequence with that beginning, and the end in all 15,625. The violations gather as a line with the steps, as in the enumeration of `hands.test.ts`, and the comparison is Node's `isDeepStrictEqual`, stricter than `toEqual`. Outside Vitest — 0.36 s instead of 4.67.

— *Why:* a timeout holds against a hang, not against slowness, and the tests' times under the host's load grow 2–30 times. A limit of its own for each test, not a shared one for the project, because a shared limit would hide a test that slowed down by a mistake. The helper holds the multiplier in one place, and the test keeps what was learned about it — its time. Ten times came first — by the "seven times of app's path" at a load average of 101, counted from a limit of 5 s. The browser's default limit is 15 s, so there were about eighteen of them, and the measurements at load 42–85 left five failures a run with ten times: so twenty.

— *Rejected:*
- **ten times** — at load 42–85 they do not hold "app's path", the synthetic samples and the generator (the measurements above);
- **thirty times** — they hold a load of about 100 too, but the limits reach 3–6 minutes, and a hung test holds CI that long;
- **a shared `testTimeout`, `hookTimeout` or limit of `expect.poll` in `vitest.config.ts`** — it would hide a test slowed by a mistake, and for every test at once;
- **a project of its own for heavy tests** — its `testTimeout` is the same shared limit, only for a group, and the heavy tests are single tests of light files;
- **`--maxWorkers`** — four threads in the container did not help, and the host's load does not depend on the number of Vitest's threads;
- **`sequence.groupOrder`, the browsers after Node** — CI is longer, and it does not save from load from outside;
- **`retry`** — hides a race instead of waiting for its event;
- **fewer cases** — the test catches less (the risk of epic E12); rebuilding the enumeration of `hands.test.ts` and the comparison of `marks.test.ts` — a gain of less than twofold: the time there is in the code under test;
- **waiting before the reload until the record reaches the browser's storage** — checked under load: the reloaded document still read it empty.

— *Consequence:* a new test gets `budget()` with its own time when twenty of its times are longer than the project's limit, and a test whose time on the runner has grown gets a new time. A wait in a test is the event it waits for. A change of the rule edits `src/core/budget.fixture.ts` and the tests that call it, and [architecture.md](architecture.md), code and tools; the task of it is in [plan/E12.md](plan/E12.md).

## The move to `spec` v0.15.1

**R76. `canvas` is on `spec` v0.15.1: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, the copy of the part `legal` is `tasks/spec-v0.15.1/legal-2.tar.gz`, and the devcontainer is the output of the template's recipe, with Go 1.27.4. One task is one session: `.claude/settings.json` takes from the template the hook `UserPromptSubmit`, `spec/tools/session/`, compaction at 400 thousand tokens and the claude.ai connectors turned off, beside the deny rules on `samples/`, and RUN.md takes the template's paragraph on the session.**
- **What the tag brings `canvas`** (`git -C spec diff v0.15.0 v0.15.1`):
  - RULES.md — the rule "one task is one session" and the hook that holds it. `canvas`'s CLAUDE.md imports RULES.md, so the rule applies with the submodule;
  - the template: `.claude/settings.json` — the keys `autoCompactWindow`, `disableClaudeAiConnectors` and `hooks`, and RUN.md — the paragraph «Одна задача — одна сессия» in «Как пользоваться». `canvas` takes both changes as they are: the settings by the template's keys beside its own `permissions`, the deny rules on `samples/`, RUN.md by the same paragraph after the line that starts a task;
  - `.devcontainer/Dockerfile` — Go 1.27.4 instead of 1.27.3 because of GO-2026-6859. The recipe `just new-repo-draft canvas typescript 3.2 v0.15.1` in a temporary clone of `spec` gave a `.devcontainer/` with which `canvas`'s Dockerfile now matches byte for byte, and `devcontainer.json` and `host-network.sh` did not change. `canvas` does not need Go: it comes with the stage `toolchain` into every repository;
  - the part `legal` did not change between the tags, and `legal-2.tar.gz` of v0.15.1 is a new archive of the same content: the files are the same, the dates inside are 2026-11-11 21:52 instead of 03:30, and the sum is different. The copy moves to `tasks/spec-v0.15.1/`: CI checks it by the recipe `release-verify spec` of the tag that `spec/` is on. `measure-2` and `eval-set-1` are still in force, and `child-sample` is a draft;
  - the packages 0.15.1: the types of `tools/types` did not change, and `@altnovatrail/contracts` has a new field `teaching_modules` in `novatrail.api.v1`, which `canvas` does not read: it takes from the package `novatrail.eval.v1` and the vectors `vectors/eval/v1/`, and they are the same;
  - the format, `format-0.4`, `release-verify`, `sample-check`, `docs-check` and the license check did not change. `canvas` does not call the new recipes `tokens-report` and `session-test`.
- **What the next tag brought.** The rest of `spec`'s line on saving tokens — a thin CLAUDE.md, the bodies of done tasks to the archive at once, the "Sources" of `docs/architecture.md` into a file of their own, the translation of `docs/` into English — was not in v0.15.1. `canvas` took it with v0.16.3, by the entry on `spec`'s line 0.16, not by this move.

— *Why:* the author asked to move to the newest `spec` — «переходи на spec последней версии» —, and the newest tag was v0.15.1 (`gh release list -R altnovatrail/spec`, `npm view @altnovatrail/spec version` — 0.15.1). The hook came with the move, not with the later rebuilding of the documents: RULES.md, which `canvas` imports with this tag, already says that the hook of `.claude/settings.json` holds the rule, and without the hook the rule's words about it would be untrue.

— *Rejected:*
- **keeping the copy of `legal` of the tag v0.15.0**, since the content is the same, — `release-verify` checks the file by the release's signature by the tag of `spec/`, and `ci-licenses` takes the tag from `spec_tag` of `justfile`: a copy of another tag would set them apart, as it would the test `scripts/legal.test.ts`, which holds the copy's tag to the package `@altnovatrail/spec`;
- **taking the template's `.claude/settings.json` whole** — the template does not know the deny rules on `samples/`, which keep agents out of the handwriting there.

— *Consequence:* the task of this move in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), publication and release; `.devcontainer/Dockerfile`, `.claude/settings.json`, `justfile`, `scripts/legal.ts`, `tasks/`.

## `spec`'s line 0.16: saving tokens

**R77. `canvas` is on `spec` v0.16.3 and takes `spec`'s rebuilding of a repository's documents for line 0.16 whole, by epic E13: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, the copy of the part `legal` is `tasks/spec-v0.16.3/legal-2.tar.gz`; RUN.md has the template's rules of v0.16.3, and table 4 is a file of its own, now `run/DEBT.md`; CLAUDE.md is thin, and the checks of the parts are the rules `.claude/rules/<part>.md`; the "Sources" of `docs/architecture.md` are records in `docs/sources.md`, and `canvas`'s probes are in `docs/measurements.md`; the documents of `docs/`, but for the archives `docs/plan/`, are in English, and the size limits beyond the block `repository` of `spec`'s budgets are named by `docs-budgets.json`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.15.1 v0.16.3`; the release, the packages and the archive — sources 6.10):
  - RULES.md — the bar: the documents of `docs/`, but for the epic archives, are read by a session of Claude Code and are written for it, to be read in parts; an external fact is a record of `docs/sources.md`, and a claim cites it, `sources 1.1`; the results of measurements are in `docs/measurements.md`; `docs/` is in English, and a translation is a task of its own, by `spec/tools/translation/README.md`. `canvas`'s CLAUDE.md imports RULES.md, so the rules apply with the submodule;
  - the template: `.claude/settings.json` — the line `"**/canvas/spec/.claude/rules/**"` in `claudeMdExcludes`, otherwise a rule of a part of `spec` would get into a session of `canvas` as soon as the session reads a file of `spec/`; RUN.md — the body of a done task to the epic's archive at once, a task outside an epic to the current epic's archive, table 4 in a file of its own, a measurement of tokens at an epic's archive; CLAUDE.md — thin, with the rules of the parts by `paths`; `docs/sources.md`, the table of debt and `docs-budgets.json`; AGENTS.md — a point on the rules by paths. The kind `typescript` adds no keys to `.claude/settings.json`;
  - `.devcontainer/` is the same as `canvas`'s: the template's kind `typescript` took the Playwright image v1.65.0 and revision 1254 — `spec`'s answer to В79 —, and the recipe `just new-repo-draft canvas typescript 3.2 v0.16.3` in a temporary clone of `spec` gave `.devcontainer/` byte for byte;
  - the part `legal` and `format/` did not change between the tags, and `legal-2.tar.gz` of v0.16.3 is a new archive of the same content: the files are the same (`diff -r`), the dates inside are 2026-11-12 20:06, and the sum is different. The copy moves to `tasks/spec-v0.16.3/`: `release-verify spec` checks it by the tag of `spec/`;
  - the packages 0.16.3: in the types only `admissionv0` changed, which `canvas` does not read; `@altnovatrail/contracts` 0.16.3 pins `@bufbuild/protobuf` 2.17.0 at an exact version, and `canvas` raises its own to it, so that the lock file has one copy;
  - the answers to the rows «в реестр spec» В76–В79 — all by `canvas`'s recommendations, in `spec`'s standard of UI packages, the card of `canvas`, its table of icons and its template's browsers. So the notes that waited for В76 leave `src/element/labels.ts` and `scripts/icons.ts`.
- **What the task does beyond the tag** — by `spec`'s shared text of the rebuilding:
  - table 4 goes to a file of its own; the tables are now files of `run/`, in English — `run/EPICS.md`, `run/QUESTIONS.md` and `run/DEBT.md` —, RUN.md's rules are in English and the bodies of tasks in Russian, by the entry on the move to v0.18.3. The rows Д4, Д5 and Д7 went over the row limit of 4 KB and were condensed to their gist and their last check, once in Russian and once more in English, and their earlier wordings, with the old openings of the tables, are in E13's archive word for word, `docs/plan/E13.md`;
  - the body of the move to v0.15.1 goes to E13's archive: the plan sends a done task outside an epic to the current epic's archive;
  - the section of sources of `docs/architecture.md` — 218 KB, 73 sources — moves word for word: 69 sources as the records of `docs/sources.md` in nine topics, and four probes of `canvas` — of a page from a file, its runs on the emulated Android tablet and iPad, and the workbook's template layer — as the first four records of `docs/measurements.md`. In the section's place stands a pointer. In the rest of `docs/architecture.md`, its 105 citations of the section now go to their own records, and each record names at its beginning the parts of the architecture that rest on it;
  - the translation of `docs/architecture.md`, `docs/decisions.md`, `docs/sources.md` and `docs/measurements.md` into English — by `spec/tools/translation/README.md`: pieces, subagents, `translation-check` with a commit before the translation, and a blind reading of a selection;
  - `docs-budgets.json` — the limits that remain beyond the block `repository` after the rebuilding and the translation;
  - the measurement of token use — "before", `canvas`'s row of measurements 1.9 spec, and "after", the session of this rebuilding — in the table of epics' tokens of `docs/measurements.md`.

— *Why:* the author asked to move to the newest `spec` — «переходи на spec последней версии» —, and the newest tag was v0.16.3 (`gh release list -R altnovatrail/spec`, `npm view @altnovatrail/spec version` — 0.16.3). Line 0.16 comes with `spec`'s shared task of the rebuilding, and the author took all of it at once, without waiting for its pilot in `module-kit`, and as one task. An epic, not a task outside the epics: the body of a done task goes to the current epic's archive, and only an epic has an archive. The "Sources" move out before the translation: the records and the citations of them are translated together with the claims, and the check of the translation sees them in place.

— *Rejected:*
- **only the move, with the rebuilding and the translation as a task after the pilot of `module-kit`** — the executor's recommendation: `spec`'s plan has the rebuilding wait for the pilot, and the pilot would find a mistake in the shared text. The author chose everything at once;
- **five tasks or three** — the executor's recommendation: the move with the working rules, the "Sources", the translation of architecture, and the log in two halves, ≈ 60–90 minutes of review each. The author chose one task: one branch and one merge;
- **a task outside the epics** — the bodies of this task and of the move to v0.15.1 would wait for the next epic's archive in RUN.md, against the plan's rules;
- **raising the limits of the rows Д4, Д5 and Д7 in `docs-budgets.json`** — the shared text raises a limit only for what stays beyond it after the rebuilding and the translation, and the table of debt did not shrink by translation;
- **rewriting the archives' citations of the section of sources** — an archive is moved word for word, and the pointer leads to the records just as well.

— *Consequence:* the task of this line in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), publication and release; [sources.md](sources.md); [measurements.md](measurements.md); `run/DEBT.md`, `docs-budgets.json`, `.claude/settings.json`, `.claude/rules/`, `CLAUDE.md`, `AGENTS.md`, `justfile`, `scripts/legal.ts`, `tasks/`, `page/notices/`.

## The move to `spec` v0.17.4

**R78. `canvas` is on `spec` v0.17.4: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, and the copy of the part `legal` is `tasks/spec-v0.17.4/legal-3.tar.gz`, of the part's version 3, which the builder reads on the day of its build; `.devcontainer/` is the template's of the tag, with WebKit and Firefox beside Chrome Headless Shell, and the element's tests run in all three engines, but for those that need the DevTools protocol, which run in Chromium alone; RUN.md has the template's rules of v0.17.4.**
- **What the tag brings `canvas`** (`git -C spec diff v0.16.3 v0.17.4`; the release, the packages, the archive and the template — sources 6.11):
  - the part `legal` of version 3: `in_force_since` is the day from which a version applies, a date in UTC from 00:00, and a reader reads the part on a day and gives the current version of each text and set and the next one; the rule `legal.operator` wants the text `privacy-policy` at the place `app`, with a version whose day has come, and the section "Who we are" in every version of it. The types are `@altnovatrail/spec/legalv3`. The README: "the build of the samples page" reads the part "on the day of its build", and "A set, and a text shown on the samples page or on a form, applies from the day it was approved: no screen shows it ahead". On the day of the move the page opened what it opened on v0.16.3: `measure-2` and `eval-set-1` were current, and `child-sample` a draft;
  - the template's kind `typescript` carries three browsers, one for each engine CI checks — WebKit 2388 and Firefox 1572 beside Chrome Headless Shell 1254, from the same image by the same digest, with their libraries and Playwright's fonts from the same snapshot —, and every devcontainer names itself in its network, `--network-alias=<repository>`. The two builds are under LGPL-2.0-or-later and BSD-2-Clause, and MPL-2.0, named in `spec`'s list of the license check's exceptions;
  - RUN.md of the template: rule 4 gets the exception for the executor's checks — the executor runs a task's checks without the author, and on devices nothing: "движки проверяют Chromium, WebKit и Firefox в CI", and what only a device shows stays a debt of table 4; rule 9 and «Как устроен план: эпики» — where a task outside an epic goes when there is no current epic; CLAUDE.md of the template — a part whose files `.gitignore` keeps out of git has no rule, and what holds for it stays in CLAUDE.md, as `canvas`'s rule on `samples/` already does;
  - the packages 0.17.4: of what `canvas` reads, only the comments of `SheetSubmission` and `WorkbookSubmission` changed — `app` sends the context "only within a stored work, while the storage of the profile's works is on"; `@altnovatrail/contracts` still pins `@bufbuild/protobuf` 2.17.0;
  - no answers to rows «в реестр spec»: table 3 of `canvas` has none open.
- **The reader of version 3**, `scripts/legal.ts`: `readingOf(…, today)` gives `{ current, next }`, each the texts and sets by their versions, and refuses a day that is not `YYYY-MM-DD`; `pageSetsOf` reads on `todayInUtc()` unless given a day. The builder's day is `buildDay()` of `scripts/page.ts`: the day of `SOURCE_DATE_EPOCH` when it is set, the convention of reproducible builds, or else today. So the page stays repeatable: two builds of one tree on one day are the same bytes, and a rebuild of a release's tree on a later day, after a set's day has come, repeats the release's bytes with `SOURCE_DATE_EPOCH` at the release's time. `release-files` sets nothing: the release builds on its own day. The rule `legal.operator` stands before `legal.in-force-unchanged`, by the part's order, and a set's text version must apply by the set's own day, `legal.set-texts`. The tests run the reading vectors of the archive each on its own day, and read the part of the tag on the days around version 3 of the policy, 2026-11-27: on 2026-11-26 it is the next, on 2026-11-27 the current, and on 2026-11-09, before any policy applies, `legal.operator` refuses the part. The test part `page/sets/test/` is of version 3 and has a stub of the policy, `texts/privacy-policy/1.md`, with "Who we are" and "for tests alone".
- **The three engines.** `vitest.config.ts` has the instances `browser chromium`, `browser 2x chromium`, `browser webkit` and `browser firefox`, and `forced colors chromium` and `forced colors firefox`: WebKit has no forced colours to emulate. Playwright opens a CDP session in Chromium alone, so `devtools` of `pointer.fixture.ts` — `server.browser === "chromium"` — marks the 33 tests of real input, of Chromium's own accessibility tree and of emulated media `test.runIf(devtools)`, and a test that also reads the tree reads it `if (devtools)`. V8's coverage runs in Chromium alone, so Vitest runs twice, side by side in two jobs rather than one after the other in one (measurements 3.1 spec): `ci-test` — Node and Chromium with coverage —, and `ci-engines` — WebKit and Firefox without, the check "TypeScript / engines" of the input `engines` of `typescript.yml`; `just ci` runs both. The first run in WebKit and Firefox failed 89 tests: 78 on the protocol and 11 on six findings (measurements 1.5), each fixed:
  - the language of the shadow tree — Firefox gives it no language of its host, and WebKit takes no new one into it: with an attribute `lang` from the table of labels the scroll container and the column take it too, by the entry on declared nonconformances;
  - Firefox's `Highlight` and `HighlightText` in forced colours, 2.94:1 — a pair of the system's own palette, not of the element's colours: `axeOf` drops a `color-contrast` of the system's pair that the test reads from the engine;
  - WebKit's whole pixels of scrolling, Firefox's wider box of a glyph and its `scrollIntoView` — the tests compare to within a device pixel in WebKit and to a fifth of the size in Firefox, and a workbook item, a nested `<svg>` of its place and size, comes into view whole in all three engines (measurements 1.6); the keys' test waits for the scroll to stand, frame by frame, not for a second.
- **The budget** of the section on code and tools in `docs-budgets.json` grew: the three engines add ≈ 0.3 KB to a section already at its limit, and splitting the section is no part of a move to a tag.

— *Why:* the author asked to move to the newest `spec` — «перейди на spec последней версии» —, and the newest tag was v0.17.4 (`gh release list -R altnovatrail/spec`; `npm view @altnovatrail/spec version` — 0.17.4). The author chose one task, and to fix every finding in it. The engines run in CI because `spec` makes them the check of what the executor no longer checks on devices, and the template brings their browsers for it.

— *Rejected:*
- **the move and the engines as two tasks** — the executor's recommendation: the move alone is small, and the engines' findings were not known. The author chose one task;
- **marking the six findings `skip` in WebKit and Firefox until a task of their own** — the executor's recommendation: two of them, the language and the contrast, are of the element, not of the tests. The author chose to fix all;
- **reading the part on the tag's day, not the build's** — the README names the day of the build, and a version whose day comes after the tag would never open on the page;
- **the day of the commit, by `git` in `release-files`** — the builder builds from the tree alone, with no `git`, and the README names the day of the build, not of the commit;
- **density 2 in WebKit and Firefox too** — one instance per engine: density 2 holds the element's arithmetic of device pixels, which Chromium's instance already checks, and it would double the time of two engines;
- **leaving the CDP files out of WebKit and Firefox by `exclude`** — a file holds tests that need the protocol beside tests that do not, and these would go unchecked in two engines;
- **`userEvent` of `vitest/browser` instead of the protocol, so that the input tests run in all three** — it gives no pen's pressure and no touches of several fingers, which the tests of tablet input rest on.

— *Consequence:* the task of this move in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the sheet's logical coordinates, publication and release, the samples page's steps, code and tools, and accessibility; `.devcontainer/`, `justfile`, `.github/workflows/ci.yml`, `.claude/rules/ci.md`, `vitest.config.ts`, `scripts/legal.ts`, `scripts/legal.test.ts`, `page/sets/test/`, `tasks/`, `src/element/index.ts`, `src/element/pointer.fixture.ts`, `src/element/axe.fixture.ts`, `.github/dependabot.yml`, `docs-budgets.json`, `scripts/page.ts`.

## The move to `spec` v0.18.3

**R79. `canvas` is on `spec` v0.18.3: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, which later moves raise, and the copy of the part `legal` is `tasks/spec-v0.18.3/legal-3.tar.gz`, from which the page takes `measure-3` and `eval-set-2` on and after 2026-11-16, with the upload link of 12 hours at most; `.devcontainer/` is the template's of the tag; the work plan has `spec`'s layout: RUN.md holds the rules, in English, and table 1, and tables 2, 3 and 4 and the open tasks outside an epic are files of `run/`.**
- **What the tag brings `canvas`** (`git -C spec log v0.17.4..v0.18.3`, 50 commits, and `git -C spec diff v0.17.4 v0.18.3`; the release, the packages, the archive and the template — sources 6.12):
  - the part `legal`: the sets `measure` 3 and `eval-set` 2 and their texts apply from 2026-11-16, and their notices give the upload link "12 hours at most" where they said "one-day": row Д238 in `spec`'s `run/DEBT.md` asked `canvas` to fix its "valid a day" with a move to such a tag. Version 4 of the privacy policy applies from 2026-11-28;
  - the plan's layout: tables 2, 3 and 4 in `run/EPICS.md`, `run/QUESTIONS.md` and `run/DEBT.md`, which replaces `DEBT.md` at the root; RUN.md keeps its rules, the current epic and nothing else, in English, terse, for the session, while the bodies of tasks and the archives stay in Russian; a done task's gist sentence goes to the archive with its body; the open tasks outside an epic are `run/TASKS.md`; with no current epic table 1 names the last done one, and the list of done epics is gone. CLAUDE.md of the template names `run/` in «Documents»;
  - the orchestrator: RULES.md lets a run of «Сделай эпик E…» commit, push and open the pull request of each task it runs, and rule 7 of the template's RUN.md names its contract; table 3 of a repository is `run/QUESTIONS.md`;
  - the template's `.devcontainer/Dockerfile`: the base image `devcontainers/base` 3.0.13, after 3.0.12, and a comment on spec's own stage `orchestrator`, which a copy leaves out;
  - the packages 0.18.3: `format/` is unchanged; the types change `exportv2` into `exportv3` and a comment of `admissionv0`, and the contracts `novatrail/api/v1` — none of which `canvas` reads; `@altnovatrail/contracts` still pins `@bufbuild/protobuf` 2.17.0;
  - for `canvas` beyond this move, in `spec`'s COORDINATION.md: the interface by the mockup, and the speed of CI (measurements 3.1 spec) — neither with a task written; and `.github` v0.1.24, while the workflows called v0.1.22;
  - no answers to rows «в реестр spec»: table 3 of `canvas` has none open.
- **What the move takes:** the submodule, the packages, the archive and its sum in `LEGAL_FILE`, `spec_tag` of the justfile; the page's words of «куда передать файл» — «она работает не дольше 12 часов»; the tests of the reader on the days around 2026-11-16 and 2026-11-28; `.devcontainer/` as the recipe writes it; the plan's layout, with RUN.md's rules as the template's but for `canvas`'s own — two current epics, deferred tasks back to table 1, a row «в реестр spec» leaving once `canvas` is on the tag with the answer, and the token measurement into `docs/measurements.md`. Table 4 is translated and condensed; its Russian rows and the old openings of the tables, with their history, are in E13's archive word for word. The gist sentences of the move to v0.17.4 and of the board module's tasks move from RUN.md to that archive.
- **What it left to tasks of their own:** `.github` v0.1.24, which the workflows now call, with the Dependabot group `shared-workflows` that raises the references; the interface by the mockup, which the entry on the tool bar by the mockup took; and the speed of CI, which the entries on the emulators' CI, on the three engines and on the move to v0.18.4 took.

— *Why:* the orchestrator's first wave of an epic of `spec` moves every repository of the epic to the newest tag of `spec` first, and the author's «Сделай эпик E…» is their word on this task. The newest tag was v0.18.3 (`gh release list -R altnovatrail/spec`; `npm view @altnovatrail/spec version` — 0.18.3).

— *Rejected:*
- **the old layout until a task of its own** — the check `docs-check` still reads it, but `spec`'s row Д250 asks each repository to take the layout with its move to such a tag, and the orchestrator reads table 3 at `run/QUESTIONS.md`;
- **`.github` v0.1.24 in the same task** — the task's text puts it next, after the move, and its own checks are those of the shared workflows;
- **the interface by the mockup in the move** — it is a task outside an epic or an epic, by the author's word on where it goes, and it changes the element's bar and the sheet's scrolling;
- **translating the rows of table 4 word for word** — `spec`'s rule of language asks for terse English, and a row holds only what is open: the history of the checks went to the archive.

— *Consequence:* the task of this move in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the samples page's steps; `.devcontainer/Dockerfile`, `justfile`, `package.json`, `scripts/legal.ts`, `scripts/legal.test.ts`, `scripts/page.test.ts`, `page/texts.ts`, `page/steps.test.ts`, `emulators/saved.ts`, `tasks/`, RUN.md, `run/`, CLAUDE.md.

**R80. The emulators' CI goes faster by `spec`'s plan for the speed of CI, and what it proves stays: the probe's iPad job takes WebDriverAgent's build for testing from the cache of GitHub Actions, its driver reads the tree by its session and names the app in front to WebDriverAgent, the iPad jobs of `emulators.yml` and `page.yml` stop the simulator and the servers before their files are kept, and the samples page's iPad job writes the pages' copies and starts their servers before Simulator boots. The rest of that plan — the engines as a check of their own, the own workflows taking the image as the shared ones do, the release and the checks without a browser in the stage `toolchain-core`, and apt from the snapshot alone — the entries on the three engines, the image cache of the emulators' CI and the move to v0.18.4 took.**
- **Why now** — `spec`'s plan asks for the speed of CI now, in the orchestrator's run. Measurements 3.1 spec: Emulators 13.4 min, its longest job iPad 27, 712 s; WebDriverAgent built from source on each run, 170–270 s; a hang of about 170 s on iOS 27.
- **The cache of WebDriverAgent** — `build/wda/Build/Products`: the `.xctestrun` file and the apps it names, all that `xcodebuild -xctestrun … test-without-building` needs, so a hit clones and builds nothing, and `commit.txt`, the commit it was built from. The key is `wda-<commit>-xcode-<build>-<OS>-<architecture>-<sha256 of probe/ipad.sh>`: the commit the script pins, which the step holds to 40 hex digits, the build of the Xcode, `ProductBuildVersion` of its `version.plist`, as `emulators/simulator.sh` reads it, and the script's sha256, which holds how it builds. Not by the build's own sha256: it is not reproducible byte for byte. A build from the cache of another commit, or one that does not answer `/status` within ten minutes by the clock, is stopped, its runner on the simulator terminated, and built anew; its log is kept apart, `wda-cache.txt`, and a warning of GitHub asks for the entry to be deleted — `actions/cache` saves no second entry under a key, so until then every run pays the wait. A build of the run that started, `build/wda-started`, is saved after the probe whatever the probe found. A pull request's entry is its own, and a run by hand on `main` fills the one every pull request reads. A build from the cache is checked against nothing, as the image of the stage is, and so risks little: a cached build that does not start costs a run its time, not its result; one that starts and then fails fails the probe as a fresh build would, and its entry is deleted by hand.
- **The hang** — run 43316532085, iPad 27, 712 s: WebDriverAgent's log is silent 177 s after Safari's session, then "Cannot precisely detect the current application. Will use the system's recently active one". The first read of the tree was `GET /source` without a session, and WebDriverAgent then asks the accessibility service for the active apps (sources 7.10); in run 43798027512 the same gap took 56 s on iOS 27 and 75 s on 26.5. The driver now reads `/session/<id>/source`, which takes the session's app, and sets `defaultActiveApplication` to the app each `open` brings in front, so that a read in the Files app asks that app's state alone (sources 7.10).
- **The stop** — `emulators/stop.sh`, a step with `if: always()` right after the run's own: the servers of `emulators/serve.ts`, `safaridriver`, `xcodebuild` and `xcrun simctl shutdown all`, none of it failing the job. Left running, the simulator and WebDriverAgent's `xcodebuild` kept the runner busy through the upload of the probe's artifact, 73 s and 150 s for 1.3 MB in run 43798027512, and through the runner's cleanup of orphan processes, 23–37 s.
- **The pages before the boot** — `emulators/page-ipad.sh` writes the copies with the watcher and starts both servers before `emulators/simulator.sh`: after the boot the copies took 16 s of run 43799577739, while the simulator held the runner.

— *Rejected:*
- **the build for a generic simulator, `generic/platform=iOS Simulator`, before the boot** — it would let the build go beside the boot, but it is untried here, and with the cache a run builds rarely;
- **a run of `emulators.yml` on a push to `main`, to fill the cache** — the probe has answered its question and runs on its own changes and by hand; a run by hand on `main` fills the entry when it is wanted;
- **the stop at the very end of the job** — the upload is what the running simulator slowed, so the stop goes before it.

— *Revisit:* if the hang comes back in a run with the session's tree — the next AX call of WebDriverAgent, by its log.

— *Consequence:* the task of it in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), code and tools; `.github/workflows/emulators.yml`, `.github/workflows/page.yml`, `probe/ipad.sh`, `probe/ipad.ts`, `emulators/stop.sh`, `emulators/page-ipad.sh`.

**R81. `canvas` is on `spec` v0.18.4 and its workflows on `.github` v0.1.31: the submodule `spec/`, the packages `@altnovatrail/spec` and `@altnovatrail/contracts` and the copy of the part `legal`, `tasks/spec-v0.18.4/legal-3.tar.gz`, are at the tag, which later moves raise; `.devcontainer/` is the template's of the tag, with the stage `toolchain-core` — Node, just, Go and buf — under `toolchain` and its browsers, and apt reading the snapshot alone; the shared release builds `toolchain-core`, and "TypeScript / lint", "vuln" and "licenses" and `documents.yml` run in it.**
- **What the tag brings `canvas`** (`git -C spec log v0.18.3..v0.18.4`, four commits; sources 6.15): the stage `toolchain-core`, which a release builds alone, and apt from a source of the snapshot's own — both in the template's Dockerfile; `toolchain.sh build` takes the stage from `TOOLCHAIN_STAGE`. The tests of `spec`'s `tools/` in parts are `spec`'s own CI. `format/`, the types, the contracts and the part `legal` are unchanged: the archive `legal-3.tar.gz` of v0.18.4 has the files of v0.18.3, under another sum, and a new release is a new copy (`.claude/rules/tasks.md`). `@altnovatrail/contracts` 0.18.4 still pins `@bufbuild/protobuf` 2.17.0.
- **What `.github` v0.1.31 brings** (sources 6.16): the workflows read the stages in the caller's Dockerfile, with no new input: the release builds `toolchain-core` where the Dockerfile has it, and `lint`, `vuln`, `licenses` and `documents.yml` run in it where `toolchain` holds more than the core, as it does here. So the references alone move. Later moves raise the release, and the shared workflows `canvas` calls did not change from v0.1.31 to v0.1.33 (sources 6.19).
- **What the core holds for `canvas`** — what the release and the three checks run. `release-files` runs Node, npm, `tsc` and Vite; `ci-lint` Biome, `tsc` and `scripts/icons.ts`; `ci-vuln` `npm audit`; `ci-licenses` `spec`'s recipes, which run Node and `buf`, `curl` of the base image, and the binary of `module-kit` that `modules-open` downloads and checks. None starts a browser: the browsers are for Vitest's browser projects, the probe and the emulators, which run in `toolchain`. So nothing moves between the stages.
- **What changes in the files:** the submodule, `package.json` and the lock file, `spec_tag` and `LEGAL_FILE` with the archive's sum, the comments of the tests that name the tag; `.devcontainer/Dockerfile` by the recipe; the seven `uses:` by the SHA of v0.1.31; the comments of the justfile, `scripts/page.ts`, `scripts/archive.ts`, `ci.yml` and `release.yml` that named the stage; the entries on the first code, the container, the image cache of the emulators' CI, the page in the release, the move to v0.18.3 and the emulators' CI; `.claude/rules/ci.md`; [architecture.md](architecture.md), publication and release, the samples page's steps and code and tools, whose budget in `docs-budgets.json` the stages raised by ≈ 0.2 KB: splitting a section at its limit is no part of a move to a tag.

— *Why:* `spec`'s plan for the speed of CI — «релиз — в `toolchain-core`; apt — только снимок» —, which the orchestrator gave with the tag of `spec` and the release of `.github` it waits on. The release built all of `toolchain` for its version and files: the build of the stage took 826 s in a release of `canvas` (measurements 3.1 spec), and "Work out the version" 458 s on `main` before this move, run 43893987585. The tag was the newest, v0.18.4, and so was the release, v0.1.31.

— *Rejected:*
- **an input or a setting of `canvas`'s own for the stage** — the shared workflows read it in the Dockerfile, and the Dockerfile is the template's;
- **moving the page's build or the synthetic samples to `toolchain`** — they need no browser, and the release builds `toolchain-core` whatever `canvas` wants; the tests that open the page in a browser are `ci-test`'s;
- **the template's comment that a missing browser fails `ci-test`, edited to name `ci-engines`** — the Dockerfile is the recipe's output byte for byte;
- **the core for `page.yml`'s `ipad-check`** — in a run that changed the Dockerfile it would build a second image for one job, while the entry of `toolchain` that `android` reads serves it on a hit.

— *Consequence:* a change of the stages changes the image: the container is rebuilt («Rebuild Container»), and until the first push to `main` with the new Dockerfile saves both entries, `toolchain` and `toolchain-core`, every pull request builds both. The task of this move is in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), publication and release, the samples page's steps and code and tools; `.devcontainer/Dockerfile`, `.github/workflows/`, `justfile`, `package.json`, `scripts/legal.ts`, `tasks/`, `.claude/rules/ci.md`, `docs-budgets.json`.

**R82. `canvas` is on `spec` v0.18.6: the submodule `spec/`, the packages `@altnovatrail/spec` and `@altnovatrail/contracts` and the copy of the part `legal`, `tasks/spec-v0.18.6/legal-3.tar.gz`, are at the tag, which later moves raise; `.devcontainer/` is the template's of the tag, whose `devcontainer.json` leaves the container running when its window is closed, `"shutdownAction": "none"`. README.md names no tag of `spec` and no status.**
- **What the tags bring `canvas`** (`git -C spec log v0.18.4..v0.18.6`, 14 commits; sources 6.17):
  - the template's `.devcontainer/`: `shutdownAction` in `devcontainer.json` — the orchestrator's executor runs in the container by `docker exec`, with no window —, and two comments of the Dockerfile; the base image, the versions and the steps are unchanged, and so are `repo-template/files/` and `.claude/settings.json`;
  - the hook `spec/tools/session/`: a run of the orchestrator gives its task numbers in `NOVATRAIL_RUN_TASKS`, and the hook counts them as one task — `.claude/settings.json` calls the hook as before, so it comes with the submodule;
  - `docs-check` reads the plan's tables in `run/` alone, under their English headings, as `canvas` keeps them;
  - RULES.md: «Exact versions only» words apt as the snapshot's own source — `spec`'s answer to row В81, option (a) —, and «Across repositories» names table 3 as `run/QUESTIONS.md` alone;
  - the packages 0.18.6: `format/`, the types, the contracts and the part `legal` are unchanged; the archive `legal-3.tar.gz` of v0.18.6 has the files of v0.18.4, under another sum, and a new release is a new copy (`.claude/rules/tasks.md`); `@altnovatrail/contracts` still pins `@bufbuild/protobuf` 2.17.0;
  - for `canvas` beyond this move: the card of `canvas` in `spec` names a method of the element for the picture of a work, `StoredWork.picture` of `PutWork`, which the entry on the picture of a work built; row Д257 in `spec`'s `run/DEBT.md` names three failures of the Samples page workflow that passed on a rerun — Д14; `spec`'s decision on the adult's correction of a module's level names nothing of `canvas`.
- **What the move takes:** the submodule, the packages, the archive and its sum in `LEGAL_FILE`, `spec_tag` of the justfile, the comments of the tests that name the tag; `.devcontainer/` as the recipe writes it; the tag in CLAUDE.md, RUN.md, `.claude/rules/tasks.md` and [architecture.md](architecture.md), its status and the samples page's steps. Row В81 is closed.
- **README.md** names no tag of `spec` and has no sections Status and License: its links lead to `https://github.com/altnovatrail/spec`, the submodule is named without its tag, and neither a move to a tag nor a task edits it for that. A status and a tag there go stale with each task and each move; the tag stays where a session reads it, and the license is named by LICENSE, NOTICE and README's badge.
- **What it leaves to tasks of their own:** the picture of a work, which the entry on it built; Д14 — the Samples page's failures on their own.

— *Why:* the orchestrator's first wave of a run of `spec`'s COORDINATION.md moves every repository to the newest tag of `spec` first, and the author's «Сделай эпик E…» is their word on this task. The newest tag was v0.18.6 (`gh release list -R altnovatrail/spec`; `npm view @altnovatrail/spec version` — 0.18.6). README's sections went by the author's word for the README of every repository.

— *Rejected:*
- **the picture of a work in the move** — it adds a method to the element's agreement and wants a release to npm, a review of its own; the orchestrator gives its text as a task of its own;
- **leaving `shutdownAction` out of `canvas`'s `devcontainer.json`** — `.devcontainer/` is the recipe's output, and the orchestrator's executor needs the container to outlive its window.

— *Consequence:* a change of `devcontainer.json` takes a rebuilt container («Rebuild Container»): until then closing VS Code's window still stops it. The tasks of this move and of README in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the samples page's steps; README.md; `.devcontainer/devcontainer.json`, `.devcontainer/Dockerfile`, `justfile`, `package.json`, `scripts/legal.ts`, `tasks/`, `run/DEBT.md`, `run/QUESTIONS.md`.

## The picture of a work

**R83. The picture of a work is the element's method `exportPicture(): Promise<Blob>` of the agreement's `CanvasElement`: the PNG of the strokes the surface shows, with no condition — the sheet's page, or the workbook's whole page with its draft, and the ink past the page, right and down —, for `StoredWork.picture` of `PutWork`. Each stroke is the outline the screen fills, in its style on white, at a pixel a unit while the picture's rows hold no more bytes than the page's and scaled down past that, and the pixels go through the crop's encoder, grey, 8 bits, when every stroke is black or grey, RGB otherwise: 1,576,640 bytes at most.**
- **What it gives:**
  - always a `Blob` of the type `image/png`, never `null`: an empty sheet, a workbook with no box filled and a worked example give the white page, and the picture is the same before the first `exportWork()` and after it. `app` puts the work when it writes it to the device, at each submission and when the attempt closes, and `api` checks the picture's PNG signature alone, by the contracts text `spec/contracts/README.md` on the stored work, so the size changes nothing there;
  - **the extent** (`pictureOf` in `src/core/sheet.ts`, `#inkReach` in `src/element/index.ts`): the page whole, whatever the element's size, scroll and density of the screen — the task's page, and on a workbook its page, which is the sheet's —, and the ink past it, right and down: the strokes of the sheet and the tracing paper's rectangle where it lies, counted whole with its strokes, `INK_REACH` added to their right and bottom, with no room past the ink, within `REACH`. The room of one view that the sheet adds past the ink is for writing, not the work. A worked example's picture is its page: it has no ink;
  - **the scale:** a pixel a unit while the rows, (width + 1) × height bytes with their filter bytes, hold no more than the page's, `PICTURE_BYTES = (1000 + 1) × 1400`; past that, the scale at which they hold just that, the width and the height rounded down. The size is in the PNG's header, and `app` shows the picture as an image;
  - the strokes as `exportWork()` and `filled` take them at the call, and as the history has them: not the stroke under way, but the strokes under an eraser not yet lifted, which the screen already hides. No template, grid, demo or tutor's marks, no theme and no forced colours: the contract names the strokes alone. On a task from paper, the strokes of both layers, the tracing paper's where it lies, hidden or not, with the crop's picture laid in grey and multiplied, at the picture's scale;
  - each stroke by its path the screen fills, built once (`#finished`): a pen's line widens with its pressure as on the screen, and the picture looks as the sheet does;
  - the pixels: a `<canvas>` of its own, out of the document, filled white, the paths in their styles at the picture's scale, with no theme, read back by `getImageData` — when every stroke is the palette's black or a grey, the red of a pixel its grey; otherwise its three channels, at the scale at which (3 × width + 1) × height holds within `PICTURE_BYTES` —, and `encodePNG` of the crop. The canvas gives its memory back at once, set to 0 × 0: WebKit caps what all canvases hold.
- **Size:** the encoder spends at most 9 bits on a byte of a row and on its filter byte, so rows within `PICTURE_BYTES` with their chunks are 1,576,640 bytes at most, 1.5 MiB of the 4 MiB a stored work holds with its history and contexts, however far the ink goes. Handwriting leaves most rows white, which the encoder takes as repeats. `png.test.ts` holds the bound on noise of the page's size, and `sheet.test.ts` that `pictureOf` keeps the rows within `PICTURE_BYTES` and as large as they can be within it.
- **The agreement:** `CanvasElement` of `@altnovatrail/spec/canvas` names `exportPicture(): Promise<Blob>`, with the comment of "What it gives" above, and `interface.check.ts` holds it through `CanvasElement`, as `exportWork()`.
- **Tests:** `src/element/surface.test.ts`, in the three engines — a PNG of 1000 × 1400 by its signature and header on a sheet and on a workbook with ink on the page, before the first submission and after it, the same bytes; the draft of a workbook on it; undo takes a stroke off it; a worked example's is white; and against the surface's own canvas, every dark pixel of the picture over ink of the screen, and the screen's full ink over ink of the picture. `src/element/wide.test.ts` holds that a stroke past the page is on it, at the size `pictureOf` gives, and `src/core/sheet.test.ts` the arithmetic of `pictureOf`.

— *Why:* the author's answer to `app`'s В66 — whoever draws the sheet and the crop draws the picture too, and they look the same —, and the card of `canvas` in `spec` describes the method: «the PNG of the strokes its sheet's or workbook's surface shows, with no condition, drawn as it draws the sheet and the crop». The picture past the page is the author's choice among the options that the sheet past the page opened.
- **The screen's outline.** The picture is the work as the learner saw it. An even line is for what a model reads, and the stored work goes to no model: the server keeps its bytes and reads none of them, by the contracts text on the stored work.
- **The ink past the page.** The sheet goes past the page, and the stored work is all that was written: a picture of the page alone would cut off ink to its right and below it, with nothing to tell the learner. Scaling down past the page's bytes keeps the bound of a picture of a fixed size, so the limit of a stored work holds at any reach, and the PNG names its own size.
- **The crop's encoder.** One form of PNG for both pictures of the element, grey and with no ancillary chunk, and a bound under the limit that no browser's encoder gives. The noise some browsers add to what `getImageData` reads, or the white a fingerprinting guard gives, is accepted: nothing outside the tests compares the picture's bytes, and the test engines add none.
- **A pixel a unit:** the ink is 3 px, as on a screen of a pixel a unit. Two pixels a unit would be four times the pixels and a bound of 6.3 MB, over the limit; half a pixel would thin the ink to 1.5 px.
- **A promise**, as `exportWork()` gives: one form for the two methods, and room to draw off the main thread later.

— *Rejected:*
- **`app` drawing it by `replay(history)`** and **the crop of the last submission** — options (b) and (c) of `app`'s В66, which the author did not take: a second drawing of the same work, and on a workbook no single picture, and nothing before the first submission;
- **the crop's raster at a pixel a unit** — the same bytes in every engine and in Node, but an even line: the pen's widths would be gone, and the picture would not look as the sheet does;
- **`toBlob` of the canvas** — the browser's encoder, its colour type and size its own, with no bound under the limit;
- **`null` on an empty surface**, as `exportWork()` — the picture has no condition, and `app` puts the work before the first submission too;
- **the template, the grid and the marks on the picture** — the contract names the strokes;
- **the page alone, with a warning on the bar when ink goes past it** — the stored work would be short of what was written;
- **the sheet stopping at the page for a task that is checked** — it takes back the sheet past the page the author chose;
- **the ink's extent at a pixel a unit, unscaled** — ten pages each way would have no bound under the limit.

— *Consequence:* the task of the method in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), docking with the app, whose budget in `docs-budgets.json` the method raised; `spec`'s agreement of the element, which names the picture past the page; `src/core/sheet.ts`, `src/element/index.ts`, `src/element/interface.check.ts`, `src/element/surface.test.ts`, `src/element/wide.test.ts`, `src/core/sheet.test.ts`, `src/core/png.test.ts`.

## The tool bar by the interface mockup

**R84. The element's buttons are the interface mockup's vertical bar of glass, drawn by `canvas` with the style properties the consumer sets: 52 CSS px wide, radius 26, 16 px from the element's left edge, in the middle of the part in sight, over the sheet; its buttons icons alone in 44 × 44 targets, each with a tooltip that Escape dismisses; the tool in use filled with the accent. No button scrolls the sheet: the hand moves it with any pointer, in pen mode one finger drags it, two always, and 2.5.7 is a declared nonconformance. A worked example has no bar: its Next and Demo stand in a row of the same glass at the bottom.**
- **The look** is the mockup's, `spec/draft/mockup/` and its README: `.glass` — `rgba(255,255,255,0.76)`, `blur(22px) saturate(180%)` and its shadow —, the paper alone where `backdrop-filter` is not supported; the selected tool the accent at 12 % with the accent's icon, `#0071E3`, whose contrast to its fill holds 1.4.11 for an icon; icons of Material Symbols, Rounded, by `spec`'s table of which icon each button's value shows. The mockup's highlighter is not taken: a new tool is behaviour, which the mockup does not decide.
- **The layout:** the shadow root's `.frame` is a grid of one cell, the rail and the scroll container in it. The rail sticks to the top of what scrolls the element, `--novatrail-canvas-top` below it, as tall as the element's part in sight — the frame, or the scroller's or the window's height below the offset, which the element measures, a percentage and `auto` with it —, less `--novatrail-canvas-pad-bottom`, and as wide as nothing, so that a consumer's `pointer-events: none` stops the bar too; it centres the bar, which takes no room of the layout. A bar taller than the rail less 32 px scrolls inside its glass (1.4.10; the mockup: "its height of 390 holds the tool bar, which scrolls inside its glass when it does not fit"). At 320 CSS px the bar of a task from paper, its seven buttons, fits, and the page does not scroll sideways.
- **The buttons**, top to bottom: on a task from paper "Hide the task" or "Show the task" and a line; the radio group «Инструмент» — «Перо», «Ластик» where the task allows it, «Рука»; «Отменить» and «Очистить»; on a task from paper a line and the grid's button last. A worked example's Next and Demo — actions, which keep their labels by `spec`'s standard, each a stop of Tab of its own — stand in a row of the same glass at the rail's bottom, in its middle, and after a line the named slot `actions`, where `app` puts its «Continue», as the mockup has one row (`Main.dc.html:888`), by `spec`'s answer (a) to В85.
- **The tooltip** is the element's own (WCAG 1.4.13): the button's label, on a mouse's or a pen's hover and on keyboard focus, not on a touch; Escape dismisses it, heard on `document` while it shows; the pointer can move onto it, and it goes 200 ms after the pointer has left both. It is `aria-hidden`, for the button's name says the same. Its fill is opaque, white on `#1d1d1f`, as the mockup's: over the canvas, which axe takes for an image, a fill seen through leaves color-contrast «incomplete», and opaque it is what axe measures the white against, 16.8:1. The tests check the tooltip's contrast by axe on a hover too, and `tools.test.ts` moves the mouse to a corner after each test, so that no file inherits a tooltip. The example's row of glass stays seen through, its contrast the test's own.
- **The style properties** the consumer sets beside `--novatrail-canvas-*`: `--novatrail-canvas-accent` and `--novatrail-canvas-glass`, defaults the mockup's, `--novatrail-canvas-top`, the offset of the band the bar centres in, and `--novatrail-canvas-pad-top` and `--novatrail-canvas-pad-bottom`, how far its own bars float over the element's top and bottom; and the boolean attribute `tools-hidden`, which takes the rail out of sight and of the accessibility tree, as `app` does on a phone while its tutor's sheet is open. They are the agreement of `canvas` and `app`, in the comment of `CanvasElement` in `types/canvas/` of `spec`.
- **No buttons that scroll:** `spec`'s standard of UI packages took them away, and its table of icons has no rows up, down, left and right. The sheet is moved by the hand with any pointer, by one finger in pen mode — once it has gone past the slop with no second finger — and by two always — a pen only under the hand —, and scrolled by the wheel, the trackpad and the keys of its region. 2.5.1 holds: it "does not apply to gestures that involve dragging in any direction". 2.5.7 does not, and [architecture.md](architecture.md), on accessibility, declares it, with no term, for `app`'s page «Доступность».
- **What stays of the sheet's own toolbar:** a toolbar by the APG, one Tab stop, the radio group of the tools, `aria-disabled` that keeps the focus, 44 × 44 targets, the theme's ink and paper, forced colours, no motion but the scrolling, and `pointer-events: none` stopping the pointer alone.

— *Why:* `spec`'s decision on the interface mockup has `canvas` draw the panel by it, and rejected `app` drawing it, which would move the panel's accessibility; `spec`'s standard of UI packages took the buttons that scrolled away. The rail keeps the bar where the mockup has it, in the middle of the screen, in an element with a height as `app` gives it and in one the page scrolls, with no script on scrolling; a tooltip the element draws itself can be dismissed, which the mockup's CSS tooltip cannot. The finger's drag reuses the two fingers' code and the slop. A worked example's sheet takes no tool, so it has no bar.

— *Rejected:*
- **the bar fixed to the window** — the element is any box of a page, and a bar fixed to the window would leave it;
- **placing the bar by a script on every scroll** — it would lag behind the page's scrolling on a phone; the sticky rail moves with it;
- **a tooltip by CSS alone**, as the mockup's `.tip` — Escape cannot dismiss it (WCAG 1.4.13);
- **the tooltip as the button's description** — a screen reader would read the same words twice;
- **a tooltip seen through**, as the mockup had it — axe leaves its contrast «incomplete», and skips the rule for the whole tree when told to ignore it; **moving the mouse away alone** — the next test that leaves a tooltip would fail `main`, and a learner's tooltip would go unchecked;
- **the arrows behind one button "Move"** — `spec`'s standard rejected it;
- **new properties without asking `spec`** — they are the element's agreement in `spec`;
- **Next and Demo on a bar, with `app`'s «Continue» in a row of its own** (option (b) of В85) — two rows where the mockup has one; and **`app` drawing Next and Demo** (option (c)) — the demo's accessibility would move to `app`.

— *Consequence:* the task of the bar in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), the open point on scrolling the sheet with one pointer, the drawing engine and the layers, the sheet's logical coordinates, docking with the app, whose budget in `docs-budgets.json` the bar, its tooltip and what the consumer sets raised, and accessibility; measurements 1.7; `src/element/tools.ts`, `src/element/index.ts`, `src/core/hands.ts`, `src/element/labels.ts`, `scripts/icons.ts`.

## The move to `spec` v0.18.14

**R85. `canvas` is on `spec` v0.18.14: the submodule `spec/`, the packages `@altnovatrail/spec` and `@altnovatrail/contracts` and the copy of the part `legal`, `tasks/spec-v0.18.14/legal-3.tar.gz`, are at the tag, which later moves raise; `.devcontainer/` and `.claude/` are unchanged, and rule 10 of RUN.md has the template's sentence on commit messages and pull requests.**
- **What the tags bring `canvas`** (`git -C spec log v0.18.6..v0.18.14`, 25 commits; sources 6.18):
  - the author's answers (a) to В83–В85: `spec`'s agreement of the element, its standard of UI packages, its decision on the mockup, the card of `canvas` and the comment of `CanvasElement` name the bar's style properties, `tools-hidden` and the slot `actions` as the element built them, and the rows up, down, left and right have left `spec`'s table of icons. The rows leave table 3, by its rules;
  - RULES.md, «Language», and rule 10 of the template's RUN.md: commit messages and a pull request's title and description are in English and terse, for the session;
  - the template's README, without a status, a license section, the sentence of the languages and spec's version: `canvas`'s README already was;
  - the packages 0.18.14: `format/` and the part `legal` are unchanged, and the archive `legal-3.tar.gz` has the files of v0.18.6 under another sum; `types/canvas/` changes only the comment of `CanvasElement`, so `interface.check.ts` holds; the contracts add `SetModuleLevel` to `progress` and change `cause`, which `canvas` does not read; `@altnovatrail/contracts` still pins `@bufbuild/protobuf` 2.17.0;
  - the rest names nothing of `canvas`: the reading modes, the suspension of the eval at the rung "author", the tutor's words only while its panel is open, and row Д261 of `spec`. Of `spec`'s table of debt, the rows that name `canvas` are those of v0.18.6; Д242 there now reads that the four rows are gone, closed once `canvas` releases the tool bar by the mockup, which v0.3.26 did.
- **What the move takes:** the submodule, the packages, the archive and its sum in `LEGAL_FILE`, `spec_tag` of the justfile, the comments of the tests that name the tag; the tag in CLAUDE.md, RUN.md, `.claude/rules/tasks.md` and [architecture.md](architecture.md), its status and the samples page's steps; rule 10 of RUN.md; rows В83–В85 leave table 3, and `src/element/index.ts`, `src/element/tools.ts` and [architecture.md](architecture.md) stop waiting on them.
- **What it leaves:** nothing to tasks of their own. Rows В82 and В86 stayed until `spec` recorded the author's answers, in v0.18.27, and left with the move to it.

— *Why:* while `app` ran its epic, the orchestrator moved the other repositories to the newest tag of `spec`. The newest tag was v0.18.14 (`gh release list -R altnovatrail/spec`; `npm view @altnovatrail/spec version` — 0.18.14).

— *Rejected:* **keeping В83–В85 until `app` takes the release** — the rows leave once `spec` has recorded them and `canvas` is on the tag with the answer, by the rules of [run/QUESTIONS.md](../run/QUESTIONS.md); what `app` takes is its own row of `spec`'s plan.

— *Consequence:* the task of this move in [plan/E13.md](plan/E13.md); [architecture.md](architecture.md), docking with the app, the samples page's steps and accessibility; `justfile`, `package.json`, `scripts/legal.ts`, `tasks/`, `run/QUESTIONS.md`, `run/DEBT.md`.

## Moves to a tag of `spec`

**R86. `canvas` stands on the tag of its submodule `spec/`, and a move to a new tag is its commit, which says why, and no entry of this log: the packages `@altnovatrail/spec` and `@altnovatrail/contracts` at its version (`package.json`), the copy of the part `legal` in `tasks/spec-<tag>/` that `LEGAL_FILE` of `scripts/legal.ts` and `spec_tag` of the justfile name, and the lines of CLAUDE.md and RUN.md that name the tag move with it. The shared workflows of `.github` are on one release, by the SHA of its tag, in `.github/workflows/`. `exportPicture()` is a method of the agreement, which `interface.check.ts` holds through `CanvasElement`. `.devcontainer/` takes a change of the template only when it is more than a comment, or when its comments break the rule of citations.**
- **What a move checks:** `git -C spec log <old>..<new>` for what the tags bring `canvas`; `git -C spec diff <old> <new> -- format types contracts legal repo-template .devcontainer` for the copies of the format's examples and vectors (Д5 in [run/DEBT.md](../run/DEBT.md)), the package's types and the template, whose `.devcontainer/` is a link to spec's own, which a diff of `repo-template` alone does not show; `release-verify` on the new copy of `legal`, which a new release gives another sum even when its files are the same (`.claude/rules/tasks.md`; sources 6.19, 6.20); `just ci` and `docs-check-repo` on the new tag.
- **Why the template's comment alone is not taken:** the template's Dockerfile has a comment on the stage `orchestrator` that the copies do not have (sources 6.19), and a change of the Dockerfile misses CI's cache of the image `toolchain`, held by the Dockerfile's sha256, for every job, which then builds it from the network again; the next move that changes `.devcontainer/` otherwise takes it with the rest. A comment that cites a decision is taken at once, the template's whole, since the documents check stops on it and the miss of the cache comes once.

— *Why:* the current state lives where it is set, and a session takes the tag from the submodule and the lines of CLAUDE.md and RUN.md; the moves' chronicle is git and the archives `docs/plan/`. The entries of earlier moves keep their text until a task touches them.

— *Rejected:*
- **an entry for each move**, as the earlier moves had: a chronicle that every move had to amend;
- **the composite action `toolchain` in `page.yml` and `emulators.yml`** — it is for a job that runs Go, by the keys of `go.yml`.

— *Consequence:* `justfile`, `package.json`, `scripts/legal.ts`, `tasks/`, `src/element/interface.check.ts`, `.github/workflows/`, `.devcontainer/`, CLAUDE.md, RUN.md.

## A task from paper

**R87. A task from the learner's paper is its crop, `paper.statement`, laid as tracing paper over a sheet of the learner's grid, dots as it comes, on a layer of SVG of its own in sheet units: as large as fits within 800 × 700 units in its proportions, at [180, 60] and shown at first, multiplied over the sheet. Its grip "Move the task" moves it by a drag and by the arrow keys, kept wholly on the sheet; the first button of the bar hides and shows it. A stroke begun on the shown paper is the paper's, `on: "tracing"`, from its corner; the work's crop takes in the paper's rectangle with the strokes, by the crop's rule, and the crop's picture is laid into it, grey, by our own code.**
- **The layers:** the paper lies between the demo's layer and the learner's work, in `spec`'s order of the layers, `mix-blend-mode: multiply`: the white of the paper lets the dots and the sheet's strokes show, the print stays dark. A thin edge outlines it. Its strokes are drawn over it, moved by its corner, and not at all while it is hidden; they stay in the history and in the work. The sheet's dots stand 25 units apart (`TRACING.dots`); the other grids' rulings are those of the grid's button.
- **The size and the place:** the paper shows, and takes strokes, once its picture is decoded: before it a stroke would be kept to the wrong size and the crop drawn stretched. Till then the `tracing` given is checked against the largest paper, 800 × 700, and its place does not hang on its size; once it is read, a place that leaves the paper wholly off the sheet moves to the nearest one wholly on it, with no event. A `paper` of the same `statement` Blob changes nothing. A `tracing` the consumer gives is a TypeError when it leaves the paper wholly off the sheet; the grip and the keys keep it wholly on it. The property sends no event; the grip sends `tracingchange` once a drag is let go and after each key, the button after each press.
- **The grip** is a button of 68 × 44 CSS px above the paper's top edge, with pointer capture; ← → ↑ ↓ move the paper 20 units, with Shift 100; its tooltip is the bar's. **The button** "Hide the task" / "Show the task" changes its name by the state, with no `aria-pressed`: the mockup's state was told twice. Its icon is `article`, filled while the task shows: the mockup's page is `description`, which `app` gives the solution shown, and in `spec`'s table of icons one icon is one value. The region and the bar are "Task from paper" and "Task from paper buttons", «Задача с бумаги» and «Кнопки задачи с бумаги».
- **The strokes:** a press begun on the shown paper writes on it, its points from the paper's corner, kept to it; an erasing begun on it takes only its strokes, and one begun elsewhere only the sheet's. Hiding the paper ends a stroke or an erasing under way on it, as a lost capture does; taking the paper off or giving another drops it, as a new history does. Undo and Clear act on both. `historyOf` and `Work.restore` keep `on` only with a paper, and a history with `on` given to a sheet is a TypeError.
- **The work:** `exportWork()` gives `ExportedPaper` — the crop as given, and the PNG of the strokes of both layers on the sheet with the paper's rectangle kept to the sheet, cropped and scaled by the crop's rule —, null without a stroke. The picture is read once, decoded by the browser, to grey by BT.601's luma in whole numbers over white, and laid into the ink's pixels by the mean of the picture's pixels whose centres fall in each, or the nearest when it grows, multiplied: the PNG is the same in every engine. The context's digest gains the line `tracing x y ids`, and marks whose context lay the paper elsewhere are a TypeError.
- **The verdict mark**, `VerdictMark`, a task from paper's alone: a tick or a cross by each answer of a frame of several tasks, `correct` whether it is right. Its place is the box of the answer its reading gave, laid on the sheet by the crop's `sheetBox`, and a model's box may be off by half a line, as Haiku's was in a check of the reading: the verdict stands by the group of the learner's strokes nearest that box, the pairs of a verdict and a group nearest each other first — the gap between their boxes, then the distance of their centres —, one group a verdict, and none farther than the taller of the two boxes. With no group in reach it stands by the box itself, for the answer may be the photo's ink. It holds none of the strokes: a change of the work puts the marks away. It stands 4 CSS px off that box's right edge, at the middle of its height, 28 CSS px on every screen, kept to the sheet: a tick of `#15803d` or a cross of `#b45309`, an amber, for «not yet» is no failure, on a white circle with a hairline, each above 3:1 on white, so the halo holds them over any page; in forced colours `Highlight` on `Canvas`. It is a `<g>` of `role="img"` named as `app` names it, and fades as a frame does while a stroke comes over it. A verdict at a group or a cell, without `correct`, or on another kind of sheet is a TypeError.
- **The wavy line**, `WavyLineMark`, a task from paper's alone, which `app` gives with the words of a rung in the hint mode "Show where": it holds on to the strokes its box takes by the rule of a frame's box, so it goes with them when they are erased, and with none stands under the box itself laid on the sheet, for the mistake may be the photo's ink. It runs 12 units under their box and 10 past each side, kept to the sheet, half a wave half a square of the sheet long (`GRID_STEP` / 4), its crests 3.5 units off its middle, as the mockup draws it: a line of 2.4 CSS px of `--novatrail-canvas-wavy`, `#e8590c` by default, 3.58:1 on white, over a white line of 6.4 px, its halo, which holds it over any page; in forced colours `Highlight` on `Canvas`. It is a `<g>` of `role="img"` named as `app` names it, and fades as a frame does while a stroke comes over it. A wavy line at a group or a cell, or on another kind of sheet, is a TypeError.

— *Why:* `spec`'s contract of a task from paper, `types/canvas/index.d.ts`, and the author's answers to its open points: `canvas` declares 2.5.7 of the paper's drag with the sheet's, the arrow keys beside it (В79 of `spec`, option (a)); the PNG is scaled by the handwriting, as the crop is, and `drawn` of the contract is unchanged. Sheet units let the paper move with the sheet as it scrolls, and each task keep its own place (`TracingState.at`).

— *Rejected:*
- **the verdict mark at the reading's box alone** — a model's box drifts by up to half a line, and a tick by the next answer misleads;
- **the verdict snapped by the rule of a frame's box**, the strokes with two thirds of their points in the box — a box off by half a line takes none of the answer's strokes;
- **the paper fixed on the screen, one place for every task**, as the mockup's — the contract places it on the sheet, and `spec`'s documents win over the mockup;
- **the picture scaled by the browser's `drawImage`** — its resampling differs between engines, and the crop's bytes would with it;
- **the crop scaled to the paper's size**, not by the crop's rule — the readers are tuned to its height of the handwriting;
- **a switch with `aria-pressed`** — its name and its state would say the same twice;
- **the wavy line at the model's box alone** — a box drifts as the verdict's does, and a line under the strokes it took stays under the mistake; the box is kept only where no stroke is.

— *Consequence:* [architecture.md](architecture.md), the drawing engine and the layers, docking with the app and accessibility; `src/core/tracing.ts`, `src/core/submission.ts`, `src/core/marks.ts`, `src/core/history.ts`, `src/core/work.ts`, `src/element/tracing.ts`, `src/element/index.ts`, `src/element/tools.ts`, `src/element/labels.ts`, `scripts/icons.ts`; `src/core/tracing.test.ts` and `src/element/paper.test.ts` the verdict mark's and the wavy line's.

## The hand and a task from paper's grid

**R88. The hand is a tool of the element, «Рука», on every sheet the learner writes on: with it a press of any pointer — a pen, a finger, a mouse — moves the sheet and writes nothing. A task from paper's sheet has a grid the learner chooses, `grid`, dots as the task comes, which the bar's last button turns round — dots, lines, blank, squares — and `gridchange` tells.**
- **The hand** is `"hand"` of spec's `Tool`, `"pen" | "eraser" | "hand"` (`types/canvas/` of `spec`), and no tool of the module format: `canvas.tools` names the pen and the eraser alone (`TOOLS` in `src/core/task.ts`), and the element gives the hand besides to a sheet, a workbook and a task from paper (`HAND`, `#allows`). A worked example has no hand: `tool = "hand"` there is a `TypeError`, as the eraser is in a task without it.
- **What it does:** a press with the hand — of a pen, a finger or a mouse, by any button — takes the pointer by capture and moves the sheet with it, both ways, through the same scrolling as two fingers, `#scroll` and `#flush`: what each axis scrolls, the container, the nearest ancestor that can or the page, its first step along it chooses, for the whole drag. It writes nothing, erases nothing — a pen's eraser neither — and gives no event. One pointer at a time: the first that comes down drags, and another while it does does nothing; the drag ends when its pointer lifts, is cancelled or loses its capture, or the element leaves the page. The touch rule of pen mode is not asked: a pen's touch under the hand does not put the page in pen mode, and a palm, like any first pointer, drags. A press under way when the tool changes goes on as it began. The canvas shows the cursor `grab`, and `grabbing` while it drags.
- **The button** «Рука», "Hand", is a radio button of the group «Инструмент», after the eraser, its icon `pan-tool` of Material Symbols, filled while it is the tool; the learner's choice is told by `toolchange` as any tool's.
- **The grid of a task from paper:** the property `grid` of spec's `PaperGrid`, `"dots" | "lines" | "blank" | "squares"` — `undefined` without a task from paper, `"dots"` as one comes, and kept when another crop replaces the task. A grid given before the task from paper, or one not of `PaperGrid`, is a `TypeError`; `undefined` changes nothing; the property tells nothing. The learner turns it by the bar's last button, after a line below «Очистить»: dots → lines → blank → squares → dots, and the element sends `gridchange` from the host, `bubbles` and `composed`, with a frozen `detail` `{ grid }`. The grid is a choice of the view, not of the work: `app` keeps it in its solving screen's state across the tasks of one visit and gives it back to a new element, and a reload or a new visit starts with dots — no field of the device's task, the export or the server holds it.
- **The rulings** (`PAPER_GRIDS`, `rulingsOf` and `nextGrid` in `src/core/tracing.ts`): dots 25 units apart, as the tracing paper's (`TRACING.dots`), lines 40, squares 25, and a blank sheet none, as the mockup draws them. The path covers the whole extent of the sheet. The grid lies under the tracing paper and the learner's work and goes into no crop.
- **The button's look:** its icon and its name say the grid shown — "Grid: dots", "Grid: lines", "Grid: blank", "Grid: squares"; «Сетка: точки», «Сетка: строчки», «Сетка: пусто», «Сетка: клетки» —, with the icons `background-dot-small`, `view-headline`, `crop-square` and `grid-on`, none filled. Its name, not `aria-pressed`, says the state, as the task from paper's button atop the tools does. Only a task from paper has the button: a module task's grid is its author's.

— *Why:* the author's answers on the interface mockup of `spec/draft/mockup/`: a hand to move about the sheet, «рука чтобы можно было бы перемещаться по канве в стороны», which a mouse needs, having no two fingers, now that the sheet goes past the page; and a button of the grid as in the notes of an iPad, four modes that turn its icon round — «клетки, точки, строчки, пустота», «при нажатии меняется иконка и тип сетки по кругу» —, on the bar where the zoom stood. The hand is the element's because the sheet's extent is: a module author has nothing to decide about moving it. A task from paper has no author's grid, so the learner chooses the paper it is solved on.

— *Rejected:*
- **the hand as a tool of the module format** — an author has nothing to decide about it, and every sheet needs it;
- **a pan by the space bar alone**, as drawing programs have — no touch has a space bar;
- **a pop-over of the four grids** — the author asked for a button that turns them round;
- **the grid's button on a module task** — a task's grid is its author's;
- **the grid stored by `canvas`** — it holds no data of its own; the consumer keeps it, as `tracing`;
- **the grid stored by `app`, by task or by profile** — a field of the device's task and of the export for a setting of the view, which changes nothing of the work or its check.

— *Consequence:* [architecture.md](architecture.md), the drawing engine and the layers, docking with the app and accessibility; `src/core/task.ts`, `src/core/tracing.ts`, `src/element/index.ts`, `src/element/tools.ts`, `src/element/labels.ts`, `src/element/icons.ts`, `scripts/icons.ts`; the tests `src/element/wide.test.ts`, `src/element/tools.test.ts`, `src/element/paper.test.ts`, `src/core/tracing.test.ts`.

## The scale of the tracing paper and its reading

**R89. The tracing paper of a task from paper has a scale, `tracing.scale`, from 0.4 to 4 in hundredths, 1 as it comes: the learner sets it by its corners, by the buttons of its bar — Smaller, the percent, Larger and Fit — and by Ctrl or ⌘ with the wheel over it. The bar's last button, Recognise, asks the consumer to read the statement by AI, `tracingread`, and the consumer gives the reading back, `reading`: the paper then shows the statement's text in place of the photo, Original takes it back, and a sign above the paper says which it shows.**
- **Choosing the paper:** a press on its grip, or the grip focused from the keyboard, chooses it: its frame with four corners, and its bar under it, come into sight; a press on the sheet, or Escape in the bar, lets it go, the focus back on the grip. The corners are 44 × 44 CSS px to hit, 18 to see; the bar is a toolbar, «Масштаб задачи», "Task scale", its buttons the tool bar's look, kept within the stage.
- **The scale:** Smaller and Larger divide and multiply it by 1.2, the wheel's notch by 1.08, both about the paper's centre; the percent, its name «{percent}: вернуть 100 %», "{percent}: back to 100%", puts it back to 1. A corner dragged scales the paper by the farther of its two moves, the opposite corner standing. Fit lays the paper across the visible part of the sheet, 180 units from its left edge and 60 from its right, and down at least 60 units from its top, centred when it is short. Each keeps the paper wholly on the sheet, and `tracingchange` tells it once the move is over: the wheel's, once it rests 300 ms.
- **The strokes on the paper** keep its own units, from its corner: on the sheet they lie at `at + point × scale`, their width scaled with it, so the writing grows and shrinks with the print. A press on the paper takes its point by the scale, and the eraser's reach on it is divided by it. The work's crop takes the paper's rectangle at its scale, and the submission's context names `tracing.scale`; the digest of the marks' paper names the scale only when it is not 1, so a digest of before stays the same.
- **The reading:** `reading` is spec's `TracingReading` — `"ready"`, `"busy"`, or `"done"` with `statements`, from none to 20 strings, "□" for each answer box —, `undefined` without a paper, and dropped with a new paper or none. Recognise is in sight only while a reading is given: on `"ready"` its press sends `tracingread`, with no detail, and the consumer gives `"busy"` and then `"done"`, or `"ready"` again when none came. A reading done shows its text once the learner asked for it; Original and Recognise turn it round with no call. The text is the statements, a line each, the answer boxes dashed, and the reading's notation drawn as the page prints it: a fraction `\frac{…}{…}` built up and a power `^{…}` raised, by the browser's MathML, a fraction full size on the line and one within it smaller, as a book sets them (`src/core/notation.ts`, `src/element/notation.ts`); a sign a model may write as LaTeX's command, as `\cdot`, drawn as the sign, `\left` and `\right` dropped, any other command shown as written; in a statement with no word, its lone letters in italics. Its size is the largest at which every line, its fractions with it, fits the paper. The photo stays the work's: the crop and its picture laid into the work are the photo's, whatever the paper shows.
- **The sign** above the paper's top left corner: «Фото задачи», "Photo of the task", with the icon `image`; «Распознаём…», "Recognising…", with a spinner; «Распознано ИИ», "Recognised by AI", with `auto-awesome`. The icons of the bar are `remove`, `add`, `fit-screen`, `auto-awesome` and `image` of Material Symbols.
- **The wait:** while the reading is busy, a band runs across the paper and a spinner turns in the sign and in the button, only under `prefers-reduced-motion: no-preference`; otherwise the band stands still at a third of the paper and the spinner is a still ring.
- **What `canvas` keeps:** nothing. The consumer keeps the scale with `tracing`, which the work's context needs; which of the photo and the text the paper shows is the view's, and comes back as the photo with each mount.

— *Why:* the author's mockup `spec/draft/Zadacha-masshtab.html` and answers: the photo of a small task is hard to read on a tablet, and a clean text helps the learner; the scale is kept because the strokes on the paper lie by it, the mode is not because it changes nothing of the work. The reading is the consumer's, by `ReadStatement`: `canvas` calls no service.

— *Rejected:*
- **the sheet's zoom alone for the photo** — the learner's writing on the sheet changes size with the print, and the photo of a small task needs a scale of its own against the sheet;
- **the strokes on the paper kept in sheet units** — a scale would leave them where they were, off the print they answer;
- **the scale stored with no strokes scaled**, a picture alone — the work's context would lie;
- **the text drawn by `canvas` from the photo** — `canvas` reads nothing and calls no service;
- **a library to lay out LaTeX** — a dependency shipped in the element for two constructs the browser's MathML lays out itself; **a fraction guessed from a slash** — a fraction within a fraction is lost, and a word problem's «3/4 of a cake» would stand built up;
- **the mode stored by the consumer** — a setting of the view, as the grid's;
- **the wait's animation always** — WCAG 2.3.3, and the element moves nothing but the scrolling where motion is not wanted; **none at all** — the author's mockup shows the wait moving, and a still band with a still ring says it as well where motion is not wanted.

— *Consequence:* [architecture.md](architecture.md), the drawing engine and the layers, docking with the app and accessibility; `src/core/tracing.ts`, `src/core/marks.ts`, `src/core/submission.ts`, `src/core/notation.ts`, `src/element/notation.ts`, `src/element/tracing.ts`, `src/element/index.ts`, `src/element/tools.ts`, `src/element/labels.ts`, `src/element/icons.ts`, `scripts/icons.ts`; `src/core/tracing.test.ts`, `src/core/notation.test.ts`, `src/element/scale.test.ts`, `src/element/motion.test.ts`, `src/element/layers.test.ts`.

## The pen's settings and the partial eraser

**R90. The pen and the eraser have their settings as in Apple's Notes, by `spec`'s mockup `spec/draft/Pero-nastrojki.html`: a second press of the chosen pen opens its popover — the kind of pen, five widths, the opacity and the colour, each kind its own —, a second press of the chosen eraser its own — whole strokes or a part, five sizes —, and a pen's hover shows a circle of its size and colour. Every stroke the element writes has spec's `style`; the settings are the property `pens` and the event `penchange`; the eraser that takes a part writes the event `cut`. The crop for checking and the picture of a work draw each stroke in its style. The samples page writes no style for now.**
- **The kinds of pen**, «Ручка», «Линер» and «Маркер», "Pen", "Liner" and "Marker":
  - «Ручка» widens and narrows with a pen's pressure by the pen's curve of the sheet's line, and, under a finger or a mouse, with the speed: slow is wider. The speed is the drawing's own, by the times and places of the points, eased from point to point as the mockup eases it, and never goes into `p`, which stays what the pointer reported. Both ends are a little finer, as the mockup tapers them: from 0.45 of the width at the end to the whole width four widths in, the last end once the stroke is finished;
  - «Линер» is one width all along; «Маркер» one width, four times the pen's step, laid on the ink under it by `multiply`;
  - each kind keeps its own width, opacity and colour. The widths are five steps, 1.2, 2, 3, 4.5 and 7 units, a marker's four times as wide; the opacity whole percent from 10 to 100, a step of the slider each, so that any opacity `pens` gives is one it shows; the colours the palette's five — black, blue, green, yellow and red — and twelve behind «Другие цвета», all of `src/core/style.ts`. A new element starts with «Ручка», black, 3 units and opaque — the line the sheet drew before strokes had a style —, «Линер» blue at 2, «Маркер» yellow, 18 units — four times 4.5 — and 40 %, and the eraser taking whole strokes at 16 units.
- **On the screen** a stroke is filled once, in its colour at its opacity, so a translucent stroke is no darker where it crosses itself; a marker multiplies what the ink surface holds under it. The palette's black follows the theme's ink colour, and in forced colours every stroke is the ink colour: a colour of the learner's own would vanish on the system's background. A stroke with no style is drawn as before.
- **The eraser** has a size, a diameter in units, one of 8, 16, 28, 44 and 64:
  - taking whole strokes, it reaches its radius, but never less than the 10 CSS px it reached before, so that a finger on a phone still finds a stroke, and beyond that half the stroke's widest line;
  - taking a part, it cuts each stroke it crosses where the circle of its radius, widened by half the stroke's widest line, crosses the stroke's points' line, so that no ink of a piece is left under its path: each piece a new stroke with spec's `of`, the stroke's pointer and style, a run of its points and at most one point of its own at each end, at the place, time and pressure between its neighbours. The crossings are computed exactly, segment by segment, by the circles and strips of the eraser's path, not by samples. A stretch shorter than 0.1 unit, the least step of a stroke's points, leaves no piece. While it is down the strokes it crossed are drawn as the pieces they would leave; when it lifts, the pieces take the next IDs, in the order of the strokes and along each, and the cut is one action and one event `cut`: one undo takes the pieces off and puts the strokes back at their places;
  - a piece takes its stroke's place in the sheet's order, so the drawing order holds; the crop draws by IDs, as spec's rule has it. A piece of the tracing paper's stroke is the paper's. A mark holds on to the strokes the model saw and to the pieces cut of them, however many times.
- **The popovers** are dialogs beside the bar, at the button that opened them; in an element narrower than 600 CSS px, a sheet along its bottom. A press on the sheet closes one, and the press writes or erases as it would. Escape closes one and puts the focus back on its button; so do a press on another button of the bar and the focus leaving it. Enter or Space on the chosen tool opens its popover with the focus on its first choice. The choices are toggle buttons in named groups, the opacity a slider, «Другие цвета» a disclosure button; every target is 44 × 44 CSS px at least; the words are `canvas`'s own, in `src/element/labels.ts`, since no other package shows them.
- **`pens`** is spec's `PenSettings`, frozen, canvas's as the element comes; another value is checked as spec's type has it, a TypeError naming the field, `undefined` changes nothing, and setting it sends no event. `penchange` tells each change of the learner's, at once, the slider's each step too, with the new settings frozen. `app` keeps them for a visit and gives them to each new element, stored nowhere.
- **The hover** of a pen — a `pointermove` with no button held — shows a ring at its point: the pen's width on the screen, 4 CSS px at least, in its colour at its opacity, 35 % at least; for the eraser, its circle, white with a dark edge. It takes no pointer and is out of the accessibility tree, and goes when the pen touches or leaves.
- **The crop for checking** draws by spec's rules: each stroke at its style's width at the crop's scale, 1 px at least, the margin and a group's frame widened by the widest line, by IDs ascending, each laid as one layer — a pen or a liner over what lies under it, a marker multiplied with it —, in RGB when a stroke has a style and in grey, as before, when none has. `src/core/raster.ts` draws both, with its own arithmetic alone.
- **The picture of a work** draws each stroke in its style, in colour, as the screen does with no theme; it is grey, as before, when every stroke is the palette's black or a grey, and RGB otherwise, scaled down so that its rows, three bytes a pixel, hold no more than the page's grey rows: the bound of a stored work holds.
- **The samples page** writes no style: the attribute `unstyled`, the element's own, gives strokes no style, opens no popover and keeps the eraser taking whole strokes at its old reach. spec's texts of a measurement's notice and form do not yet name a stroke's style, and a sample holds only what its writer consented to (Д299 spec). The sample file writes a style and a cut when a history holds them, and the page opens such a file.

— *Why:* spec's decision on the pen's settings and the partial eraser, and the author's word on the mockup, tried on an iPad: «меня всё устраивает», with the words «Ручка», «Линер» and «Маркер».
- **The widths and colours are `canvas`'s:** spec keeps a width in units and any colour, so the steps and the palette are the mockup's and change no format.
- **The eraser's floor** keeps what the reach in CSS px was for: a phone's sheet is three times smaller on the screen. A part is cut by the size alone: what it cuts is what the learner chose and sees.
- **Half the line in the cut:** cutting at the points' line alone would leave a wide marker's band under the eraser, the piece's round end reaching into its path.
- **Exact crossings:** an own point lies where the edge crosses, on the stroke's line, and two engines cut alike, so a history replays as it was written.
- **The picture's grey:** a picture of black ink keeps its pixel a unit; RGB at that scale would pass the bound of a stored work.

— *Rejected:*
- **erasing by pixels**, as the mockup draws it, and **an event of the eraser's path** — spec rejected both: a mask with no strokes to group or mark, and every reader cutting by geometry of its own;
- **the eraser's size in CSS px** — spec keeps it in units, and the settings go from element to element;
- **a pressure made from the speed into `p`** — spec rejected it;
- **every crop and picture in RGB** — a crop of strokes without a style would change for no reason, and a picture of black ink would lose its scale;
- **the settings kept by `canvas`** — it keeps no data; `app` keeps them for a visit;
- **the popovers as menus of `role="menu"`** — their choices are toggles, a slider and a disclosure, which a menu does not hold;
- **styles on the samples page now** — its texts do not name them yet.

— *Consequence:* [architecture.md](architecture.md), the drawing engine and the layers, docking with the app, the sample file and accessibility; `src/core/style.ts`, `src/core/cut.ts`, `src/core/history.ts`, `src/core/work.ts`, `src/core/eraser.ts`, `src/core/outline.ts`, `src/core/crop.ts`, `src/core/raster.ts`, `src/core/png.ts`, `src/core/sheet.ts`, `src/core/contracts.fixture.ts`, `src/element/index.ts`, `src/element/pens.ts`, `src/element/tools.ts`, `src/element/labels.ts`, `src/element/interface.check.ts`, `src/eval/sample.ts`, `page/main.ts`, `page/open.ts`; their tests.
