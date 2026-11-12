# canvas decision log

> Why canvas is built the way it is. Each entry says what was decided, why, what was rejected and where it is described.
>
> **Rule:** do not re-propose what was rejected without new facts. If a decision has to change, ask the author and update this file. An entry is never rewritten: an amendment with its date at the end of the entry corrects it, or a new entry replaces it, and the old one stays where it is, marked "Superseded".
>
> The repository was set up 2026-10-19 from the template of `spec` v0.1.0 (R21 spec), moved to `spec` v0.2.9 on 2026-10-20 (R01), to v0.2.12 on 2026-10-21 (R03), the same day to v0.2.13 (R04) and to v0.2.14 (R10), to v0.2.18 on 2026-10-22 (R16), to v0.2.35 on 2026-10-26 (R30) and the same day to v0.2.37 (R31), to v0.2.42 on 2026-10-27 (R40), to v0.4.1 on 2026-11-01 (R41), to v0.6.2 on 2026-11-02 (R44) and the same day to v0.6.5 (R45), to v0.9.8 on 2026-11-08 (R47) and the same day to v0.9.9 (R53), to v0.12.0 on 2026-11-09 (R60), straight to v0.14.0 on 2026-11-10, past v0.13.0 (R67), to v0.15.0 on 2026-11-11 (R72), and to v0.15.1 on 2026-11-12 (R76) and the same day to v0.16.3 (R77). How it comes to differ from the template over time — by tools in the devcontainer, by rules in RUN.md — is recorded here as a decision, as R46 canvas-api recorded its differences from its model. Next number — R78.
>
> Here entries are cited as `R03`, in other repositories as `R03 canvas`. The decisions of `spec` are cited as "R18 spec", MathTrail's as "R37 canvas-api", and in a list as "canvas-api: R37, R38". Each log has its own numbers.
>
> The open questions that concern more than one repository are in the registers of `spec`: О- in product 13 spec, П- in privacy 9 spec, Т- in repositories 8 spec. What is still to decide in the component itself is in [architecture.md](architecture.md), section 2.

## `spec` tag

**R01. `canvas` is on `spec` v0.2.9: the submodule `spec/` is at this tag, the links to `spec` pinned to a tag name it, and what came from the template is as in the template v0.2.9. Since then the documents are checked by `just -f spec/justfile docs-check-repo`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.1.0 v0.2.9`, read 2026-10-20; Д6 in table 4 of RUN.md `spec`):
  - R25 spec — the samples page for the first measurement; the card architecture 3.2 spec says the same. By their recommendations, it decided all three rows «в реестр spec» that the setting up of the repository brought — В1–В3 of table 3 of RUN.md, which in RUN.md `spec` are В15–В17:
    - there is no hosting: the build is downloaded from the release of `canvas` and opened on the volunteer's device. By R25 spec nobody's logs will see the volunteer's IP address, and they open the pull request on GitHub anyway; GitHub sees the download itself too, and this refinement of R25 spec is in В4. The page will move to the hosting of the build of `app` when that appears (Т-17);
    - children's samples are made with the same page, but without a pull request; where the file goes and who has access to it, П-10 and П-12 decide;
    - the tasks and media files the page's build takes from the release of `modules` through the CLI of `module-kit`. The CI of `canvas` takes them by exact tag — this is the link "a CI tool", not a dependency at build time (repositories 1 spec) — and the package still knows no subjects.

    In detail — [architecture.md](architecture.md), sections 1 and 2.4. The decision does not diverge from what the tasks of `canvas` were going to decide: T04 still decides what the page asks and what it writes to the file, and now also how a child sample differs from an adult's. One thing R25 spec does not say: a child sample has no pull request, and the argument about the IP address does not fit it — this is В4 of table 3 of RUN.md, «в реестр spec». Children's samples do not go to the AI provider until П-3 has given an agreement that admits children (R24 spec): this is named in T04 and in [architecture.md](architecture.md), section 2.4;
  - the 2026-10-19 amendment to R11 spec — Т-7 is closed in its part about the API: the contract `app` ↔ `api` and the observation are on protobuf and buf, and what stayed open in Т-7 is the module format. The contracts themselves are written by the epic E3 in RUN.md `spec`. So T02 and [architecture.md](architecture.md), section 2.2, now cite R11 spec and E3 about the contract and the observation, not Т-7. Where the code takes the types of `spec` from the generated packages of its releases, the citation of Т-7 stays: the open view of a task is part of the module format;
  - concepts 15 spec — the term "accessibility": it is not the unlocking of a skill and not access to content (concepts 4 spec). [architecture.md](architecture.md), section 2.1, uses it, and now T01 does too;
  - R32 spec — the repository's documents are checked by the `docs-check` of the `spec` its submodule is on: the links, its own sections and log, the tables «В» and «Д», and the citations of `spec` against the submodule at its tag. An example of a citation is written in inline code, so that the check does not take it for a citation (RULES.md, Citations);
  - R30 spec — the CI checks are the same in all repositories, and `canvas` will have them even before its code: secret scanning, DCO, CodeQL, Scorecard and the documents check — the shared checks from `.github`. All the checks but Scorecard hold the merge, the quality gate of SonarCloud among them, and merging is by merge commit only. T21 `spec` connects them: its session writes the CI files here, together with `dependabot.yml` and the exclusion `spec/**` for SonarCloud (Д7 in table 4 of RUN.md `spec`), and it also sets the ruleset of the branch `main`. Until then `canvas` has no shared checks;
  - R33 spec and rule 12 of RUN.md — before a new task, close the findings of SonarCloud, CodeQL and Scorecard on the last one. A finding that a change cannot close stays open, and its reason is recorded: one common to all repositories in R33 spec, one of its own in this log;
  - R31 spec — the release of `spec` comes out by itself, after green CI on `main`: the next patch of the line, immutable, with GitHub's attestation. The repository still moves to a new tag by a task of its own;
  - RULES.md — an example of a citation is written in code (Citations). A development or CI tool that ships nowhere and puts none of its own code into what ships may also carry another OSI-approved license, or free terms for open source, but only as a named exception: in the license check or in the decision that brings it in (Hard rules; R12 spec). This concerns the tools of the future code of `canvas`;
  - architecture 3.11 spec and Т-27 — the shared release workflow with a signature comes with the first code of `module-kit`, and what checks its signature of a package or of a build, Т-27 decides. This is an input of T03: it decides whether that workflow signs the releases of the `canvas` package;
  - R23, R24, R26–R29 spec, Т-28 and П-17 — about other components: the success corridor, the key for eval and where it lies, one account for an adult and their children, the generator of randomness, the types of the graph, the reason codes. They change no documents of `canvas` beyond those named above: the samples from the samples page are run to the AI provider by `tutor`, with a separate key of the platform for eval (R24 spec);
  - devcontainer — the base image `devcontainers/base` 3.0.10 by its digest; Claude Code is installed without the packages' scripts, its `install.cjs` is run by name, and `claude --version` stops the build on the stub; `git.alwaysSignOff` — a commit from Source Control is signed off by DCO (R22 spec, R30 spec).
- **What is changed here:**
  - `spec/` — at v0.2.9, commit 5eafb1a. The links to `spec` in README.md and the tag in CLAUDE.md and RUN.md — v0.2.9. That the repository was set up from the template v0.1.0, the start of the log still says: it is history;
  - the five examples of citations of the old template — in inline code: two in CLAUDE.md, Documents, two in «Ссылках» of RUN.md and one at the start of the log. Rule 6 of RUN.md and CLAUDE.md, Environment, name `docs-check-repo`, and rule 12 of RUN.md is new. These places are as in the template v0.2.9;
  - `.devcontainer/` — the one that the recipe of `spec` v0.2.9 (`editDevcontainer`) builds for `canvas` of the kind `typescript`. The names of the container and of the network and `postStartCommand` are its own, as on v0.1.0, and the kind `typescript` has no extensions of its own. The move introduces no differences from the template;
  - what the tag decided for `canvas` is named in its documents: table 3 of RUN.md — without В1–В3, its opening says what closed them, and the new rows are В4 and В5; T04 and T05 — R25 spec, and T04 R24 spec too; T03 — Т-27; T02 — R11 spec and E3; T01 — the term; «Почему такой порядок» and «Не входит» of the epic E1 in RUN.md; CLAUDE.md, The component; [architecture.md](architecture.md), sections 1, 2.2 and 2.4.

— *Why now:* T21 `spec` connects the shared checks from `.github` here (R30 spec), and among them the required "Documents / docs-check-repo". The shared `documents.yml` builds the stage `toolchain` from the `.devcontainer/Dockerfile` of whoever called it and runs `just -f spec/justfile docs-check-repo` in it ([`documents.yml`](https://github.com/altnovatrail/.github/blob/ff2a359/.github/workflows/documents.yml), release v0.1.0 of `.github` — the latest as of 2026-10-20, commit ff2a359, read 2026-10-20). And `spec` has this recipe only since v0.2.3 (R32 spec): on v0.1.0 the required check would be red and would hold any merge. v0.2.9 is the latest release of `spec` as of 2026-10-20, and immutable (`gh release view -R altnovatrail/spec`); `gh release verify v0.2.9 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit 5eafb1a. Д6 in table 4 of RUN.md `spec` also says to take the latest release at the time of the task.

— *Rejected:*
- to stay on v0.1.0 until the first code: the required documents check from T21 `spec` would hold any merge, T04 would go by the questions В1–В3, which are already decided, and a citation of a section of `spec` that is not at the tag, or a gap in the log, would pass unnoticed (Д6 in table 4 of RUN.md `spec`);
- v0.2.3–v0.2.8: they have `docs-check-repo`, but the template has no rule 12 of RUN.md until v0.2.7 and no R33 spec until v0.2.8, and Д6 says to take the latest release at the time of the task;
- to move without the devcontainer, or to carry over its changes selectively: the container of `canvas` is the container of `spec` (CLAUDE.md, Environment), and a difference would have to be recorded as a decision, and there is no reason for one;
- examples of citations in guillemets, as before: `docs-check-repo` checks a number in guillemets against the log, and R32 spec rejected not checking them.

— *Consequence:* T06 goes first in table 1 of RUN.md, and T01 depends on it. The new questions are В4 and В5 of table 3 of RUN.md, both «в реестр spec». The devcontainer image was not built here — Д1 in table 4 of RUN.md, until Rebuild Container. The comment on the installation of Claude Code in the Dockerfile of `spec` is inexact: without `install.cjs`, what stays in place of the CLI is not a Node wrapper but a stub of 500 bytes, which writes "Error: claude native binary not installed." and exits with code 1 (`bin/claude.exe` of the package `@anthropic-ai/claude-code@2.1.280` from the npm registry, read 2026-10-20). The Dockerfile here is a copy of that of `spec`, so the fix goes there — В5, the same question as В2 in table 3 of RUN.md `module-kit`. The CI files — the calls of the shared workflows, `dependabot.yml`, `.sonarcloud.properties` — are written here by T21 `spec`, not by a task of this repository. — RUN.md, T06, T01, T02, T03, T04, T05; CLAUDE.md; README.md; `.devcontainer/`; [architecture.md](architecture.md), sections 1, 2.2 and 2.4.

## The work plan

**R02. The handwriting sheet and the samples page — the epic E2 beside E1: table 1 of RUN.md holds two current epics.**
- E1 stays a detailing without code. A task of E2 waits not for all of E1 but for those of its tasks whose decisions it needs: the skeleton — T01 and T03, the input — T02, the sample file and the samples page — T04.
- T05 checks the tasks of E2 against [architecture.md](architecture.md), section 3, edits their bodies if the decisions of T01–T04 changed them, and proposes the epic after E2.

— *Why:* the author's answer 2026-10-21 — «да» to the plan of E2 with this recommendation; the other option was E2 after T05.
- The dependency is the tasks', not the epic's. After T05 the first code would wait for the most tied task of E1 too, T04: the sample format of `tutor` is still being designed (В7 tutor; its T08 is not done), the eval protocol is the epic E3 in RUN.md `spec`, and that is still in table 2, and the volunteers' consent is П-16.
- The measurement of AI reading in `tutor` has already begun — by the epic E2 beside its E1 (R01 and R04 tutor) —, and the samples for it will be written by a temporary recording page (R05 tutor); it does not exist yet. The samples page will replace it (В7 tutor): the sooner it comes, the fewer samples gather in the format of the recording page, which would later have to be converted, and the sooner the measurement runs on the same canvas as the learners'.
- `tutor` is built the same way (R04 tutor): the two repositories of the first code of stage 2 plan alike. The template has one current epic (R19 spec), so the difference is recorded here.

— *Rejected:*
- E2 after T05: the first code would wait for T04 and T05, though the skeleton and the sheet need only T01–T03;
- code tasks in E1: E1 would stop being a detailing without code, and its result and «Не входит» would have to be edited.

— *Consequence:* table 1 of RUN.md holds E1 and E2, and the start of RUN.md and «Как устроен план» speak of two current epics. The tasks of E2 are T08–T25, with «План: да», except T16, T23 and T25 — the move to a tag of `spec`, the connection of the shared check and the epic's summary, which the documents define. The rows В6–В10 of table 3 are «в реестр spec». — RUN.md: «Как устроен план», table 1, the epics E1 and E2, T05.

— *Amendment 2026-10-22:* E2 is replanned for the MVP — R17. In work are T09, T33 and T34, and T32 once the wrapper of `.github` comes out; the other tasks are postponed. — RUN.md, E2.

## `spec` tag v0.2.12

**R03. `canvas` is on `spec` v0.2.12: the submodule `spec/` is at this tag, the links to `spec` pinned to a tag name it, and the devcontainer is the one that the recipe of `spec` of the new tag builds for `canvas`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.9 v0.2.12`, read 2026-10-21; Д11 and Д12 in table 4 of RUN.md `spec`):
  - the answers of `spec` to two rows «в реестр spec» of this repository, both by their recommendations:
    - В4 — the 2026-10-20 amendment to R25 spec and an addition to П-10. The build for a child sample is downloaded from the release of `canvas` by the adult who runs the session, like any visitor of GitHub, and GitHub sees their IP address. The build's file holds neither a sample nor a child's data, and the sample file goes nowhere by this path; the text of the separate consent to children's samples says so (П-10), and it is finally decided together with П-10 and П-12 in the epic E4 of RUN.md `spec`;
    - В5 — the comment on the installation of Claude Code in `.devcontainer/Dockerfile` of `spec` is corrected: without `install.cjs`, `claude` is a stub that writes that the native binary is not installed and exits with code 1;
  - architecture 3.10 spec — from stage 2 the CI of `canvas` also takes the release of `modules` by exact tag: the build of the samples page puts tasks and media into it through the CLI of `module-kit` (R25 spec). [architecture.md](architecture.md), sections 1 and 2.4, say the same. The temporary source of the measurement's tasks, while `modules` has no code, is В6 in table 3 of RUN.md: if `spec` accepts it, both this row and the card architecture 3.2 spec are edited;
  - R34 spec and the rule of RULES.md, Hard rules: an archive that the Dockerfile downloads is checked against its sha256 sum before it is unpacked — an `ARG` for each architecture beside the version. The versions of the tools in the Dockerfile of `spec` are the same as on v0.2.9: Node 24.21.0, just 1.58.0, gh 2.101.0, just-lsp 0.10.0, Claude Code 2.1.280;
  - the amendments to R30 and R32 spec: T21 `spec` connected the shared checks and the ruleset of `main` in all eleven component repositories, and the documents check is required in all of them. Here this is pull request #2, merged 2026-10-20 (commit ec8a228), and the ruleset 25506234;
  - the amendment to R31 spec: the release of another repository calls the recipes of `spec` — `release-version <commit> <workflow>` and `release-refusal` — not copies of them (repositories 5 spec). This is an input of T24: `canvas` has no release of its own yet;
  - the TypeScript wrapper of `.github` comes with the first code in TypeScript — that of `canvas` (architecture 3.11 spec; repositories 6 spec). The epic E2, T23 and [architecture.md](architecture.md), section 2.3, already say so;
  - the plan of the epic E2 of `spec`, «Формат модуля v0»: T02 `canvas` takes its T28 as an input — this is already in T02 and in [architecture.md](architecture.md), section 2.2. The epic E1 of `spec` went to the archive `docs/plan/E1.md`;
  - the measurement of `tutor`, begun before item 5 of repositories 6 spec, is recorded there with a mark — the answer to В4 `tutor`. About the same early start of the code of `canvas` — В10 in table 3 of RUN.md;
  - the amendment to R27 spec and Т-29 — about `engine` and `infra`: they change no documents of `canvas`;
  - the template `repo-template/` and the recipes `tools/new-repo/` did not change between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.12, commit b721be9. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md — v0.2.12. What was before, the start of the log and R01 still say: it is history;
  - `.devcontainer/Dockerfile` matches byte for byte what `editDevcontainer` from `spec/tools/new-repo/devcontainer.mjs` v0.2.12 builds for `canvas` of the kind `typescript`: the sha256 sums and the new comment on the installation of Claude Code. `devcontainer.json` and `host-network.sh` did not change. The move introduces no differences from the template;
  - table 3 of RUN.md — without В4 and В5, and its opening says what closed them; T04 and [architecture.md](architecture.md), section 2.4, name the answer to В4;
  - table 4 of RUN.md: Д1 is closed — the container was rebuilt; Д2 — the image by the new Dockerfile has not yet been built here.

— *Why now:* the answers of `spec` to В4 and В5 exist only since v0.2.11, and each repository closes its rows by its own move to the latest release that came out with them (Д12 in table 4 of RUN.md `spec`). T01–T04 read the latest `spec`: it holds the plan of the module format v0, which T02 takes as an input. v0.2.12 is the latest release of `spec` as of 2026-10-21, and immutable (`gh release view -R altnovatrail/spec`); `gh release verify v0.2.12 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit b721be9.

— *Rejected:*
- v0.2.10 — it has neither the answer to В4 nor the sums in the Dockerfile;
- v0.2.11 — it has the answers already, but Д12 says to take the latest release, and v0.2.12 also brings the plan of the module format v0, which T02 reads as an input;
- to carry only the sums into the Dockerfile, or to edit it by hand: the devcontainer of `canvas` is the container of `spec` (CLAUDE.md, Environment), and a difference would have to be recorded as a decision, and there is no reason for one.

— *Consequence:* В4 and В5 left table 3 of RUN.md. The sha256 sums in the new Dockerfile were checked 2026-10-21 against the publishers' lists of sums — `SHASUMS256.txt` of Node, `SHA256SUMS` of just and just-lsp, `gh_2.101.0_checksums.txt` — and all eight matched. The image by it has not been built here — Д2 in table 4 of RUN.md, until Rebuild Container. — RUN.md, T07, T04; CLAUDE.md; README.md; `.devcontainer/`; [architecture.md](architecture.md), section 2.4.

## `spec` tag v0.2.13

**R04. `canvas` is on `spec` v0.2.13: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.12 v0.2.13`, read 2026-10-21): R35 spec — the review of a task goes in one round of `/code-review high`, and the executor may hand in a small change without review; the report says whether there was a review, and if not, why. These are rules 6 and 8 of the template's RUN.md and AGENTS.md. The tag changes nothing else: `tools/new-repo/`, `.devcontainer/` and `spec/docs/`, but for the log, are the same between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.13, commit ba6ac67. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md — v0.2.13. What was before, the start of the log, R01 and R03 still say: it is history;
  - the move does not change rules 6 and 8 of RUN.md and AGENTS.md: the change by R35 spec was already made here by the session of `.github` on the author's instruction (pull request #4, commit 5c43ca4);
  - the devcontainer does not change: the recipe `editDevcontainer` and the Dockerfile of `spec` at v0.2.13 are the same as at v0.2.12 (R03).

— *Why now:* the author's instruction 2026-10-21 — «обнови spec до последней версии»; T01–T04 read the latest `spec`. v0.2.13 is the latest release of `spec` as of 2026-10-21, and immutable (`gh release list`, `gh release view v0.2.13 -R altnovatrail/spec`); `gh release verify v0.2.13 -R altnovatrail/spec` confirmed it by its attestation, and the tag is at commit ba6ac67.

— *Rejected:* to stay on v0.2.12 — rules 6 and 8 of RUN.md and AGENTS.md here already follow R35 spec, and `spec/` at v0.2.12 does not know this decision.

— *Consequence:* Д2 in table 4 of RUN.md stays as it was: the move does not change the devcontainer image. — RUN.md, T26; CLAUDE.md; README.md.

## The detailing

**R05. The drawing engine is code of our own on the browser's API. The canvas is a stack of layers of page elements. On the handwriting sheet the learner's work is Canvas 2D with the outline of perfect-freehand 1.2.3 and the index of strokes rbush 4.0.1, and the template and the tutor's layer are HTML and SVG. The text canvas is the page's markup in the same stack, and the stroke groups and the crop are computed by DOM-free code of our own.**
- **Layers.** Each layer is a page element of its own: all of one size, in the same units of the sheet (T02) and in the order of concepts 8 spec. The tutor's layer is in two elements: the sketch under the learner's work, the boxes and marks above it. What draws what — [architecture.md](architecture.md), section 3.1.
- **The text canvas** — words and sentences in HTML: the edits are their state, the input is the keyboard. Ink on it goes by the same layer of the learner's work, if a task needs it.
- **The widget layer** — a place of its own in the stack, empty until stage 4. The chosen tool distributes the input through `pointer-events` (R16 spec; architecture 3.4 spec).
- **Input** — code of our own on Pointer Events. Palm rejection is as in canvas-api: pen mode after the first pen in the session, and a threshold of the touch's area (spec 3.1 canvas-api). Beyond that — a button that brings back drawing with a finger, and `pointercancel` cancels a stroke. The thresholds are parameters of T09, and T22 checks them on devices.
- **DOM-free** — the strokes, the writing history, the index, the groups and boxes, the snapping of marks, the raster of the crop and the PNG: plain TypeScript, the same in the browser and in Node. The raster's algorithm — T13.
- **The first code** — the sheet and the samples page. To the samples page the drawing engine gives only the sheet: input, ink with pressure, the eraser, undo, the writing history, the grid and the statement, groups and the crop. There is no tutor on it: one box tied to strokes enters the sheet's first code only to check the tying (T14). The first code needs no scene graph.

— *Why:* the author's answers while T01 was planned, 2026-10-21. The drawing engine, the groups and the crop, the pen and the palm — by the recommendations, and the text canvas, the widget layer and the minimum of the samples page — «да» to the plan with the recommendations. The comparison — [architecture.md](architecture.md), section 2.1, the sources — section 4.
- **A place of its own for the iframe.** The widget's iframe sandbox needs a place of its own between the layers (R16 spec; concepts 8 spec). A stack of page elements has one, and Konva puts no HTML between its layers: "It can't render DOM elements directly".
- **Accessibility.** The argument of R269 standalone — a screen reader does not read the drawing surface — weighs for the statement, the tools and the marks, not for the ink. Handwriting stays a picture in any technology, and the learner sees what was read as text — «Я прочитал 6» (R05 spec). So the statement and the tools are HTML, the marks are SVG, and the drawing surface is only for the ink (concepts 15 spec).
- **The eraser and the marks.** An eraser of whole strokes and marks tied to strokes (concepts 8 spec; C2 of the study) are code of our own in any option. Of the libraries whose eraser was checked, only Excalidraw and drauu delete a stroke whole, and in the others the eraser erases pixels or there is none at all.
- **The crop.** The browser's drawing surface cannot give the crop for checking and for samples:
  - the HTML Standard does not define the bytes of a PNG;
  - in Node — for the tests and the synthetic samples of T18 — the drawing surface needs a native package with pixels of its own;
  - browsers add noise to what is read from a drawing surface: Brave by default, Firefox on the desktop in standard protection too, Safari in Private Browsing and possibly in all browsing. The noise is small, but the same strokes would give different bytes.
- **Size:** perfect-freehand and rbush together — ≈4 KB gzip, Konva — ≈58 KB.
- **Framework.** The part on the page holds on to no framework, so any answer to Т-21 will do ([architecture.md](architecture.md), section 2.3).
- **Prototype.** The prototype `spec/draft/` is already built this way: the SVG sketch lies under the drawing surface, the SVG box above it.

— *Rejected:*
- **Konva 10.9.0**, which canvas-api planned:
  - it has two drawing surfaces of its own for each layer, and HTML and an iframe go only on top of its scene;
  - it gives no accessibility; the eraser in its example erases pixels; export goes by the browser's drawing surface, and in Node it needs `canvas` or `skia-canvas`;
  - its strength — the scene graph, the events of shapes, dragging — the sheet does not need: the learner writes and erases, and the marks are not moved;
  - MathTrail has no experience with Konva: canvas-api's client never had it ([architecture.md](architecture.md), section 2.1);
- **Fabric.js, Paper.js, PixiJS and Two.js.** Fabric and Paper have no pressure, and Two.js has no input at all. In Fabric and PixiJS the eraser erases pixels, and Paper has no eraser — only the blend `destination-out`. In Node, Fabric, Paper and Two.js need node-canvas, and PixiJS has no ready adapter for Node; besides, PixiJS draws with WebGL and weighs ≈237 KB;
- **Excalidraw** is an application for React, not a drawing engine. A web component would carry React inside, beside the framework of `app` — the same duplicate frameworks that R16 spec speaks of;
- **tldraw:**
  - its license forbids work in production without a key, and the code checks the key and may send usage data; the package needs React;
  - its Agent starter kit goes to AI providers itself and changes the board — against R03, R05 and R15 spec;
  - the terms of tldraw's other licenses were not read: React and the data collection reject it anyway, and the bindings by ID, for which the study cites it (C2), carry over without it;
- **signature_pad and Atrament** — they draw on one drawing surface, and their eraser erases pixels; Atrament besides keeps no strokes: "draws directly onto the canvas bitmap";
- **drauu** deletes a stroke whole, but everything else — the writing history, the IDs of strokes for marks, the crop — would be code of our own, and in Node it needs a DOM;
- **ink in SVG.** Theme and zoom are simpler, but each stroke is a DOM element, and SVG has no low-latency mode `desynchronized`;
- **one drawing surface for all layers** — an iframe will not fit between the layers, and a screen reader will not read the statement on a drawing surface;
- **the text canvas by the same drawing engine, on a drawing surface.** The layout of text, editing, input from the keyboard and with stress marks, selection and accessibility would have to be written ourselves, and the page's markup gives them by itself. In concepts 16.2 spec the text canvas has `cross-out`, `insert` and `keyboard`, and the edit is checked by a program, without AI (architecture 4.2 spec): it needs no picture of the work;
- **the crop by the browser's drawing surface** — OffscreenCanvas and `convertToBlob`: the bytes depend on the browser and its noise, and Node needs a native package;
- **palm rejection word for word as in canvas-api.** Without a way out of pen mode the finger would not draw until the page was reloaded — for example, when the pen's battery ran down;
- **a switch «рисовать пальцем» instead of pen mode** — an extra action for the learner on every device with a pen.

— *Revisit* — when tools come that move and rotate — the ruler and the protractor —, or the creative canvas: they may need a scene graph. The DOM-free part does not change from this.

— *Consequence:*
- **T02** — the units of the sheet, one transform of coordinates for all layers, and what marks are tied to on the text canvas. How groups are computed — with a note: `tutor` builds them «по пространству и времени» (R08 tutor), and T12 without time (C1);
- **T03** — the interface wraps the part on the page, which has no framework;
- **T08** — perfect-freehand and rbush at exact versions; the tests of the DOM-free part run in Node, those of the part on the page in the browser. The native `canvas` is not needed;
- **T09–T14** — by [architecture.md](architecture.md), section 3.1, and T13 — a raster and a PNG of our own;
- **T19** — the build as one file without others' resources;
- **T22** — palm rejection, WebKit bug 269535 and `getCoalescedEvents` on a page opened from a file: the method is declared only for a secure context.

— [architecture.md](architecture.md), sections 2.1, 3.1 and 4; RUN.md, T01.

— *Amendment 2026-10-22:* palm rejection from the item "Input" — pen mode, the threshold of the touch's area and the button that brings back drawing with a finger — is now T35, not T09. T09 was split while it was planned: it holds input by one pointer, and the palm, pen mode, scrolling with two fingers and several touches at once went to T35, postponed until tablets (R18). The thresholds are parameters of T35, and T22 checks them on devices, after it; this is how both "T09–T14" and "T22" in "Consequence" read. `pointercancel` cancels a stroke already from T09. — R18; RUN.md, T09, T22, T35.

— *Amendment 2026-10-22:* the picture of the work for `tutor`'s board — a PNG of the whole sheet — is drawn by the browser's drawing surface: a `<canvas>` outside the document and its `toBlob` (R20). This is not the "crop by the browser's drawing surface" of "Rejected": the byte-for-byte repetition, Node and the noise concern the crop of the product and of the samples, and the board's picture does not need them, since the board itself sends `canvas.toDataURL`. The crop of T13 is still a raster of our own and a PNG encoder of our own, and the item "DOM-free" about the raster of the crop stands. — R20; RUN.md, T34.

— *Amendment 2026-10-25:* `canvas` builds no text canvas (R21). What this entry says of it is history: part of the heading, the item "The text canvas", the line of "Rejected" about the text canvas on a drawing surface, and the marks of the text canvas in "Consequence" about T02. The drawing engine and the stack of layers stay as decided — for the sheet. — R21; [architecture.md](architecture.md), section 3.1.

— *Amendment 2026-10-25:* the layers stand in the scene — the visible part of the sheet — and shift in the same frame in which the ink is drawn (R23). The element shows the task's statement not on the template layer but above the sheet, in the same scrolling, and the template holds the grid. There are no formulas: the tasks do not need them. Input through `pointer-events` is distributed so: an inactive layer gets `none`, and the active one drops its `none` but does not get `auto`, and the consumer's `none` on the element still reaches the drawing surface (R20). — R23; RUN.md, T11.

— *Amendment 2026-10-25:* T13 decided the raster's algorithm (R25). The raster is gray: a pixel takes the share that the line covers, by the distance to the stroke's segments and by a ramp of one pixel at the edge. The PNG encoder is our own: one block of fixed Huffman. Only +, −, ×, ÷ and `Math.sqrt` go into a pixel, so the bytes are the same in any JavaScript engine, not only in one environment. — R25; [architecture.md](architecture.md), section 3.1; RUN.md, T13.

— *Amendment 2026-10-26:* there is no longer a picture of the whole sheet (R27): `exportPNG()` is removed together with `workchange`, and the browser's drawing surface in the element draws only the ink on the screen. Only the crop of T13 goes for checking — a raster and an encoder of our own —, and `exportWork()` gives it. — R27; [architecture.md](architecture.md), section 3.1; RUN.md, T15.

— *Amendment 2026-10-26:* palm rejection is done (R29). Pen mode is one for the whole page: a touch of the pen turns it on, and the button «Рисовать пальцем» turns it off. A palm is a touch wider or taller than 100 CSS px, not 30 as in spec 3.1 canvas-api: on iPadOS the width of a touch is twice its radius, and a threshold of 30 px would take drawing away from the finger. The thresholds are parameters of T22. — R29; RUN.md, T35.

**R06. The handwriting sheet is 1000 × 1400 logical units, as in canvas-api. The crop by A3 goes for checking. The place in the observation is in fractions 0–1000 of the crop, and `canvas` on the device turns it into units of the sheet. Stroke groups are by space and time, as in `tutor`, and the marks of the text canvas are tied to words by ID.**
- **The sheet.** The origin is the top left corner, the y axis points down, and the scale is the same on both axes. The sheet is fitted to the width of its area, and what does not fit in height scrolls. The size is a constant of the canvas kind, not a setting of the module; there are no pages. In units of the sheet are the strokes, the grid, the zone of an answer slot and all the layers, and all the layers have the same transform to the screen.
- **The crop** — by A3: only the visible strokes, a margin of 12 px, and a scale such that the median height of a group becomes the digit height — 32 px by default. `sheet_box` — where the crop with its margin lies on the sheet. The formulas — [architecture.md](architecture.md), section 3.2.
- **The place from the model.** The adapter of `tutor` turns the provider's convention into fractions 0–1000 of the crop, and `canvas` turns the fractions into units of the sheet, by `sheet_box`. `sheet_box` and the table "group → strokes" do not leave the device.
- **Stroke groups** — by space and time, as R08 tutor. The algorithm and the thresholds — T12.
- **Marks.** On the sheet — `{stroke_ids, snapped_box}` (C2 of the study), on the text canvas — `{word_ids}`.

— *Why:* the author's answers while T02 was planned, 2026-10-21. The sheet and the place from the model — by the recommendations, the groups — not by the recommendation of В12 of table 3 of RUN.md, and the crop, the marks of the text canvas and the rows «в реестр spec» — «да» to the plan with the recommendations. The comparison — [architecture.md](architecture.md), section 2.2, the sources — section 4.
- **The units of the sheet** do not depend on the screen (R15 canvas-api). One constant of size gives the same zones of slots and the same samples on any device, and the format v0 needs no parameter for it.
- **The crop by A3** evens out handwriting: the model sees digits ≈32 px high, however large or small the learner wrote and whatever the screen. Empty margins and large digits would give extra pixels, and at Anthropic and OpenAI the tokens of an image grow with its size ([architecture.md](architecture.md), section 4).
- **The fractions of the crop:**
  - the providers name the place differently: Claude in pixels of the image after its own downscaling, Gemini in fractions 0–1000, and OpenAI has no box format. Only the adapter of `tutor` can recompute the place after the downscaling: only it sees that downscaling;
  - fractions mean the same for any image — for the crop, and later for a photo of paper. So the observation — the shared type of `tutor`, `module-kit` and eval (repositories 5 spec) — does not depend on the canvas kind;
  - only `canvas` knows where the crop lies on the sheet. The server does not need `sheet_box`, and less data goes out (R09 spec);
  - the study's example is built the same way: the fractions are «внутреннее соглашение», and by `sheet_box` «устройство возвращает рамки на лист».
- **Groups by space and time** — as in `tutor`: a stroke added later beside an old entry becomes a group of its own and does not merge with it. The labels in the samples of `canvas` and in the measurement of `tutor` are built by one rule (R08 tutor). The price the author accepted: the same strokes written in another order give other groups. The partition also carries a rough sign of the process — by the scale A4 of the study, the group boxes are then nearer to (b) than to (a). The crop's scale depends on the groups too, since it comes from their median. But that is one number per crop, and its pixels are only the final strokes.
- **Words by ID** — the same design as strokes by ID on the sheet (C2): a mark holds on to its content, not to a place on the screen. Editing needs words with IDs too: in concepts 9.2 spec this is "the required edits by place".

— *Rejected:*
- **the whole sheet on the screen** — on a screen wider than it is tall, the sheet would be fitted by height, and the grid's cell would shrink;
- **the sheet's height as a setting of the module** — an extra parameter of the format v0, on which the zones of slots would depend. Come back to it if a task needs more than the sheet;
- **several pages** — the crop and the groups would know about pages, and canvas-api managed with one sheet (spec 4.1 canvas-api);
- **the whole sheet as the picture for checking**, as in spec 4.3 canvas-api, — the scale of the digits would depend on the handwriting, and empty margins would cost tokens;
- **a crop without scaling** — the same dependence on handwriting;
- **units of the sheet in the observation**, with the transform in the adapter of `tutor`, — `tutor` would get `sheet_box` with the work, and the observation would depend on the canvas kind;
- **fractions, but `api` turns them into units of the sheet** — `api` would get `sheet_box` and would know the sheet's geometry;
- **groups without time** (C1; the recommendation of В12) — the bounding boxes can be derived from the picture itself, but the groups of `canvas` would diverge from the groups of the measurement of `tutor` (R08 tutor), and what was added later would merge with the earlier writing;
- **rules of groups of their own for the device and for the runner** — the labels in the samples and in the measurement would diverge;
- **marks of the text canvas by offsets in characters** — every insertion shifts them; **by the coordinates of the layout** — the layout depends on the screen and the font.

— *Revisit:* the groups — by the findings of the measurement of `tutor`, which compares labels and a bounding box (R08 tutor); the sheet — if a task does not fit into one sheet 1000 × 1400.

— *Consequence:*
- **T03** — the interface gives the crop together with `sheet_box`, the group boxes and the table "group → strokes", and takes marks with a group label, an answer slot or a crop box in fractions of the crop;
- **T04** — the group boxes in a sample are in fractions of the crop. Partition by time is a rough sign of the process (A4), and the crop's scale depends on it: this has to be taken into account in the composition of a child sample. A PNG of the runner of `tutor` with another digit height is drawn by the same rules of the crop (section 3.2);
- **T09** — the points in units of the sheet, input by the inverse transform; scrolling with two fingers is needed;
- **T11** — one transform for all layers and the limits of `k`;
- **T12** — groups by space and time; its body is corrected by this entry;
- **T13** — the scale, the margin and `sheet_box` by section 3.2. The size limit — with an eye on the providers' limits, and `s` is bounded from above for the case when `h_med` is near zero;
- **T14** — the fractions are turned into units of the sheet by `sheet_box`, then the bounding box snaps to the strokes of its submission, as in R43 canvas-api;
- **table 3 of RUN.md** — В13 and В14 «в реестр spec», the answer in В12 and an addition to В8;
- **the sketch "how to begin"** on an empty place is not addressed by the crop — its place is decided with the first slice of `app` and `api`.

— [architecture.md](architecture.md), sections 2.2, 3.1, 3.2 and 4; RUN.md, T02, T12, table 3.

— *Amendment 2026-10-22:* for the MVP — `tutor`'s check board — the picture of the work is a PNG of the sheet, as on the board, not the crop by A3 (R17). The crop stays the picture for checking in the product and will come back with T12 and T13. Which sheet the element has for the board — the 1000 × 1400 of this entry or 1000 × 600, as on the board — the planning of T34 decides, and the board's sheet only by an amendment of its own. — RUN.md, T34.

— *Amendment 2026-10-22:* scrolling with two fingers from "Consequence" about T09 is now T35, and T09 decided the path of scrolling (R18). The sheet scrolls by the native scrolling of a container inside the element — by the wheel, the scroll bar and the keyboard —, and the drawing surface stands in its visible part and is shifted by a matrix. The item of "Consequence" about T11 reads so: T11, when it comes back, puts the other layers into this scrolling — whether they scroll with the content or, like the drawing surface, shift themselves — and decides the limits of `k`. The shift `vy` is still the same for all layers. — R18; RUN.md, T09, T11, T35.

— *Amendment 2026-10-22:* the element's sheet for the board is the 1000 × 1400 of this entry, without an amendment, and the picture is the whole sheet, a pixel per unit (R20). The board gives the element a height, and the sheet scrolls in it. The sheet 1000 × 600 is rejected: the canvas would have two sheets of different heights. — R20; RUN.md, T34.

— *Amendment 2026-10-25:* there is no text canvas (R21), and with it no marks by words. What this entry says of them is history: part of the heading, `{word_ids}` in "Marks", "Words by ID" in "Why" and the line of "Rejected" about the marks of the text canvas. A mark is only on the sheet, `{stroke_ids, snapped_box}`. — R21; [architecture.md](architecture.md), section 3.2.

— *Amendment 2026-10-25:* the sheet is fitted to the width of its area, but not wider than 1000 CSS px: `k` is at most 1, and on a wide screen the sheet stands in the middle (R23). What the 2026-10-22 amendment left open is decided: the other layers do not scroll with the content but shift themselves, in the ink's frame — the SVG by its `viewBox`. "The HTML of the template takes the same `k`" applies to HTML on the sheet, when it appears: the statement stands above the sheet, in CSS px. — R23; [architecture.md](architecture.md), section 3.2; RUN.md, T11.

— *Amendment 2026-10-25:* T12 decided the groups' algorithm and thresholds (R24). Two strokes are neighbors if there are no more than 2 s between them and the boxes of their points come closer than 50 units horizontally and vertically. A group is the strokes that a chain of neighbors joins. T12 gives the group's rectangle on the sheet, and T13 computes the group box in fractions of the crop and `h_med`. "Revisit" about the groups stands: the measurement of `tutor` came back 2026-10-23, only on Claude's models (R21 tutor). — R24; [architecture.md](architecture.md), section 3.2; RUN.md, T12, T13.

— *Amendment 2026-10-25:* T13 decided the crop (R25).
- `h_med` is not the median of the groups but the lower median of the heights of the bundles. A bundle is strokes whose boxes touch, without time. Strokes under 15 units high do not count and bind nothing, and the scale takes a median no higher than 100 units.
- The crop fits within Claude's standard level: no longer than 1568 px and no more than 1568 tokens. If it does not fit, the digits are drawn smaller than D. A side shorter than 200 px gets a wider margin.
- The line is D / 12, and the group boxes are by the ink, rounded outward. The formulas of section 3.2 are corrected by this entry.
- The price from "Why" — "the crop's scale depends on the groups too" — is gone: the scale depends neither on the groups nor on the order of writing.

— R25; [architecture.md](architecture.md), section 3.2; RUN.md, T13.

— *Amendment 2026-10-26:* "Consequence" about T14 is decided (R26). The fractions are turned into units of the sheet by `sheet_box` — in whole numbers, on the crop itself —, and the model's box, widened by a quarter of the digit height, takes the strokes of its submission that have no fewer than two thirds of their points in it. A sweep over synthetic sheets did not confirm the rule of R43 canvas-api — half the points and 10 units. The mark on the sheet is `{stroke_ids, snapped_box}`, as decided here, and the box stands around those of its strokes that are visible now. — R26; [architecture.md](architecture.md), section 3.2; RUN.md, T14.

— *Amendment 2026-10-26:* there is no longer a picture of the sheet for the MVP (R27): `exportPNG()` is removed. The picture for checking is the crop by A3 of this entry, and `exportWork()` gives it together with the context of the submission. — R27; RUN.md, T15.

— *Amendment 2026-10-26:* scrolling with two fingers is done (R29). Code of our own shifts the same native scrolling — of the sheet's container, and if that cannot scroll in this direction, of an ancestor or of the page — and chooses it at the first step of the gesture. — R29; RUN.md, T35.

— *Amendment 2026-10-27:* the workbook has the same page of 1000 × 1400 units, a constant of the kind, and it has no pages either (R34). What goes for checking from the workbook is not a crop of the whole work but a crop of each filled box — by the same rules of the crop —, and the place in the observation on the workbook is the answer slot. The workbook does not open "Come back to it if a task needs more than the sheet": a task that did not fit is a `TypeError`, and T47 will pass the limit for authors «в реестр spec». — R34.

**R07. The canvas enters its consumer as a web component — one element `<novatrail-canvas>` for all canvas kinds, without a framework and with an open Shadow DOM. It gets data by properties, gives the work for checking by a method, and the writing history and a request to voice by events. The types of data are from the releases of `spec`, the element's types from the package, and "listen" is voiced by `app`.**
- **The element.** It takes the canvas kind from the task's open view. It registers when its entry point is imported, and the DOM-free part is a separate entry point, which is imported in Node too.
- **It gets:**
  - the task's open view;
  - a function that gives a promise of a media file `Blob`;
  - the writing history;
  - the tutor's marks together with the context of their submission.

  The language comes from the attribute `lang` on the element itself.
- **It gives:**
  - the event `historychange` — after each stroke, erasure and undo;
  - the asynchronous method `exportWork()` — the crop and the context of the submission, and `null` for an empty sheet;
  - the writing history — for reading;
  - the event `speak` — a request to voice a text.

  The element sends the events from itself, and they bubble.
- **The context of the submission** — `sheet_box`, the group boxes and the table "label → stroke IDs" — is held by `app`, not by the canvas. `sheet_box` and the table do not go to the server (R06), and the group boxes go only by the answer to В8 of table 3 of RUN.md.
- **The types of data**, while `spec` does not have them, are temporary ones of our own of the same composition (В16 in table 3 of RUN.md).

The design — [architecture.md](architecture.md), section 3.3.

— *Why:* the author's answers while T03 was planned, 2026-10-21, all by the recommendations. The task was split by rule 11 of RUN.md: T27 decides Т-26 and Т-27.
- **A web component:**
  - this is the recommendation of Т-21: the package has several consumers — `app`, the samples page, the site, the card of the MCP channel —, and the framework of each is decided by its repository;
  - the framework of `app` is not chosen yet (T01 app), and the part of the canvas on the page needs no framework (R05);
  - React 19 and Preact take the element by themselves. React 19 "passes all tests on Custom Elements Everywhere", and Preact: "Preact fully supports Web Components" ([architecture.md](architecture.md), section 4).
- **One element.** The module chooses the canvas kind for each task, and a new kind is code of the platform (R02 spec). A new version of `canvas` brings such a kind without an edit of `app`.
- **Shadow DOM.** The styles of the page and of the element do not touch each other. The price: ARIA references by ID do not leave the shadow root, so everything they refer to lives inside the element.
- **Properties, a method and events.** `app` saves the history after each stroke, so it comes by an event. `app` asks for the crop on "Check", so it is given by a method. `app` holds the context of the submission: the canvas has no data of its own (architecture 3.2 spec).
- **Media files are `Blob`:** the canvas calls no one over the network (repositories 2.1 spec).
- **"Listen" is `app`'s.** Speech synthesis is then one for the whole app, with one set of rules — only local voices (Т-13). `app` itself postponed this question until Т-21 (architecture 2.4 app).
- **The types of data are from `spec`.** These data travel between repositories, and the formats that repositories share live in `spec`. The code will take them from the packages of its releases (R10 spec; R21 spec).

— *Rejected:*
- **a component of the framework of `app`** — it would decide for `app`, whose framework is not chosen (R11 spec), and would carry the framework into the samples page and into the second build, though the canvas does not need it (R05). Were the second consumer's framework another, it would also get the duplicate frameworks that R16 spec writes of;
- **a mount function** — every consumer would write the mounting, unmounting and cleanup itself, and each framework would need a binding of its own. A web component gives this by the browser's means;
- **a Preact component in the wrapper `preact-custom-element`** — it would carry Preact inside the canvas (R05);
- **an element of its own for each canvas kind** — `app` would choose the element itself and would be edited with each new kind;
- **the page's shared DOM** — the styles of `app` could shift the canvas's layers, and the canvas's styles would touch `app`;
- **the canvas voices by itself** — the rules of voices would have to be kept the same in two packages;
- **media files by URL** — the canvas would go to the network itself;
- **the context of the submission in the canvas's memory** — the canvas would hold data of its own (architecture 3.2 spec);
- **one entry point, and the element registers when it is imported** — the DOM-free part could not be imported in Node, where there is no DOM to register the element in.

— *Revisit* — if one page needs two versions of the package: the element's name is one for the whole page ([architecture.md](architecture.md), section 4), and registries of names for shadow trees were not checked here.

— *Consequence:*
- **T04** — the sample takes the writing history and the crop in the same form in which the element gives them;
- **T08** — the package's skeleton is a web component without a framework, with two entry points: the DOM-free part and the element;
- **T11** — labels and names are inside the element, and the theme is by CSS variables;
- **T14** — marks come with the context of their submission;
- **T15** — the element, its properties, method and events; a trial consumer; what exactly the event and the method carry;
- **T19** — the samples page is a build of its own of the same element;
- **T27** — the publication and the release of the package;
- **`app`** — what it has to do — [architecture.md](architecture.md), section 3.3. It holds the context of the submission itself, and voices "listen" by its own speech synthesis;
- **table 3 of RUN.md** — В15 and В16 «в реестр spec».

— [architecture.md](architecture.md), sections 2.3, 3.1, 3.2, 3.3 and 4; RUN.md, T03, T27, table 3.

— *Amendment 2026-10-22:* for the MVP the element has methods of undo, of clearing and of a PNG of the work, and an event of change (R17). The planning of T34 decides their names and form. The properties, the events and `exportWork()` of this entry stay the interface of the product, and T15 will finish building it. — RUN.md, T33, T34.

— *Amendment 2026-10-22:* T33 decided the names of the methods of undo and clearing: they are `undo()` and `clear()`, and the buttons for them in the MVP are the consumer's (R19). The name and form of the PNG method and the event of change are still decided by T34. Both methods also stay in the interface of the product, which T15 finishes building. — R19; RUN.md, T33, T34.

— *Amendment 2026-10-22:* T34 decided the PNG method and the event of change (R20). `exportPNG(): Promise<Blob | null>` gives a PNG of the whole sheet, and `null` for an empty sheet. `workchange` is a plain event from the host after each change of the work, including after `undo()` and `clear()`. This is the interface of the MVP. `exportWork()` and `historychange` of this entry stay the interface of the product, and T15 will decide whether the MVP's methods stay beside them. — R20; RUN.md, T15, T34.

— *Amendment 2026-10-25:* there is no text canvas (R21), and no "listen" on the canvas either. The element sends no event `speak`, and "listen" in the heading, `speak` in "It gives", "'Listen' is `app`'s" in "Why", "the canvas voices by itself" in "Rejected" and "listen" in "Consequence" about `app` are history. R36 spec and architecture 3.1 spec name the event — this is В32 in table 3 of RUN.md. The element is still one for all canvas kinds and takes the kind from the task's open view: a new kind, if there is one, will come with a new version of the package. — R21; [architecture.md](architecture.md), section 3.3.

— *Amendment 2026-10-25:* beyond the list "It gets", the element has the property `tool`, `"pen"` or `"eraser"`: what the primary button does. The consumer switches it by a button of its own, like `undo()` and `clear()` in the MVP, and the pen's eraser erases with any `tool` (R22). `workchange` comes after erasing too. The writing history until T15 is in the DOM-free part, and the event `historychange` and the property `history` are still T15's. — R22; RUN.md, T10.

— *Amendment 2026-10-25:* the element gets `task` and `media` from T11 (R23). `task` is a temporary type of the same composition that the format v0 will give — the canvas kind, the grid and the statement with its language —, and `media` is, as decided, a function that gives a promise of a `Blob`. The element shows the statement above the sheet. T11 has no tool buttons of its own, and the labels of the tools come with T15, together with the buttons. The theme is the variables `--novatrail-canvas-paper`, `--novatrail-canvas-ink` and `--novatrail-canvas-grid`. `history`, `marks`, `exportWork()` and `historychange` are still T15's. — R23; [architecture.md](architecture.md), section 3.3; RUN.md, T11, T15.

— *Amendment 2026-10-26:* the element gets `marks` from T14, not from T15 (R26): the marks of one submission together with its context — the numbers of the crop and the groups — by a temporary type. `history`, `exportWork()` and `historychange` are still T15's, and `exportWork()` gives a context of the same type. The context is returned only to the element that gave it: another's is a `TypeError`. — R26; [architecture.md](architecture.md), section 3.3; RUN.md, T14, T15.

— *Amendment 2026-10-26:* the interface of the product is finished (R27). The element gets and gives `history` by the same property. `historychange` is a `CustomEvent` whose `detail` is the new events of the history and the number of the first of them. `exportWork()` gives the PNG of the crop and the context of the submission with a digest. `exportPNG()` and `workchange` are removed: the interface of the MVP is replaced by the interface of the product. The entry point `@altnovatrail/canvas/core` gives the types of data and `replay`. The language from `lang` and the element's own buttons — T41: T15 was split while it was planned. — R27; [architecture.md](architecture.md), section 3.3; RUN.md, T15, T41.

— *Amendment 2026-10-26:* the language from `lang` and the element's own buttons are done (R28). The element watches its `lang` and labels the buttons by it, and the row of buttons sets itself the language of its labels: a screen reader reads English labels under another language in English. Beyond "It gives" — the event `toolchange`: the learner changed the tool by a button of the element. Which tools to show, the task says by the field `canvas.tools`. — R28; [architecture.md](architecture.md), section 3.3; RUN.md, T41.

— *Amendment 2026-10-26:* `canvas` is on `spec` v0.2.35 (R30), and В32 is closed by R41 spec: the first slice has no text canvas, and R36 spec and architecture 3.1 spec leave `speak` until it, "later". The types of the open view will come with names in snake_case (R45 spec). A picture is named by its path from `media/`, and a task by its full ID (R46 spec). The package releases a new canvas kind before the module that takes it (R44 spec; repositories 4 spec). The temporary task type of our own diverges from the schema of R51 spec — this is Д5 in table 4 of RUN.md. — R30.

— *Amendment 2026-10-27:* the element also gets the open view of the module manifest — by the property `manifest` —, and from it the module format version, the digit height on the crop and the explanation language in which the statement is (R32). It takes the task's open view in the names of the draft of the format 0.1. — R32; RUN.md, T44.

— *Amendment 2026-11-02:* "the element's types from the package" now means: the types of the agreement with `app` are those of `spec`, `@altnovatrail/spec/canvas` from the line 0.5, written by hand (R74 spec; R44), and the package `canvas` declares only its own. The element's class is `implements CanvasElement`, and the package `canvas` adds to `HTMLElementTagNameMap` and `GlobalEventHandlersEventMap`: to the second by `extends CanvasEventMap`. `canvas` no longer has declarations of its own of the agreement's types. The entry points give the types of `spec` under their names — the same types, as R41 gives `Manifest` and `WorkedExample`: both give the types of data, the writing history and the context of the submission with its parts, and the element's entry point also `CanvasElement`, `CanvasEventMap`, the types of the events and of the work, `Filled` and `Tool`. A consumer takes them from either of the two packages, and README shows the path of `spec`: that is how `app` takes them (R74 spec). The package's own are only what the agreement does not name: the marks `marks` with `Marks`, `Mark` and `Anchor` — until the contract of the epic E3 in RUN.md `spec` (R26) —, `media` with `Media`, the commands `undo()` and `clear()`, the task and the canvas with the temporary `canvas.tools` (R41; Д5 in table 4 of RUN.md), `Crop` and `GridKind`. Through `CanvasElement` there is no field `canvas.tools`: a task literal with it is a type error, and through `NovatrailCanvas` it is not. Whether `media`, `undo()` and `clear()` are part of the agreement with `app` is В58 «в реестр spec». `interface.check.ts` and `entry.check.ts` check the types of the entry points against the types of `spec` for identity, with `readonly` and optional fields, and the trial consumer takes the agreement's types from `spec`. Rejected — entry points without the agreement's types, so that a consumer would take them only from `spec`: there would be one path, but the tests, `demo/` and the consumer of `core` would have to import the same type in a new way, and the entry points already give `Manifest` and `WorkedExample`. — R27; [architecture.md](architecture.md), section 3.3; RUN.md, T69, table 3.

— *Amendment 2026-11-02:* `media` with `Media` is already part of the agreement with `app`: `spec` recorded В58 by the 2026-11-02 amendments to R36 spec and R74 spec, and the element takes `Media` from `@altnovatrail/spec/canvas`, and the entry point gives it under the same name. `interface.check.ts` holds `media` through `CanvasElement`, and the trial consumer gives it the same way. What stays the package's own is `undo()` and `clear()` — the element's buttons call them — and everything else that the amendment above names. — R45; RUN.md, T73 in [plan/E8.md](plan/E8.md).

— *Amendment 2026-11-08:* the types of the tutor's marks — the property `marks` and `Marks`, `Mark` and `Anchor` — are now from `@altnovatrail/spec/canvas` too: `spec` recorded them in the form of the temporary types of `canvas` and checked the kind and the place of a mark against the message `Mark` of the contract `novatrail.api.v1` (R97 spec; the second 2026-11-03 amendment to R74 spec). `src/core/marks.ts` gives the types of `spec`, and `interface.check.ts` and `entry.check.ts` check them for identity. What stays the element's own is `undo()`, `clear()` and the temporary tools of the task (Д5). — R47.

**R08. The package comes out on npm — `@altnovatrail/canvas`, in the scope of the organization `altnovatrail`. Everything that `canvas` puts out is the files of one GitHub release with the signature of the shared `release.yml` of `.github`: the package, the build of the samples page, the synthetic samples, the license and the sums. The same file of the package goes to npm — by a step of the same shared release, through trusted publishing, without a long-lived token.**
- **The release** comes out by itself. The `release.yml` of `canvas` calls the shared one by the SHA of its release, and the line is `0.1`. A release comes out only if the paths it is built from have changed (R18 .github).
- **The files** are written by `release-files` in the stage `toolchain`: `altnovatrail-canvas-<X.Y.Z>.tgz`, `samples-page_v<X.Y.Z>.html`, the archive `synthetic-samples_v<X.Y.Z>.<…>`, `LICENSE` and `SHA256SUMS`. Each file has a cosign signature, and the package's version is the release's number without `v`. `dist/` is given to these files only, and `release-files` itself builds the page for the release.
- **npm** gets the same `.tgz` by the same run. Trusted publishing checks the `release.yml` of `canvas`, and npm creates the provenance itself. The shared release has no such step yet — В18 in table 3 of RUN.md —, and the author publishes the first version by hand (T24).
- **How they are taken:**
  - `app` — an exact version from npm, and during development a working copy by a link;
  - the CI of `tutor` — the archive of the synthetic samples by tag and sum;
  - an adult — the build of the page from the release's page.
- **Signature.** What the consumer checks, Т-27 decides, and the answer of `canvas` for its consumers is В19 in table 3 of RUN.md. The package from npm is tied to the release by its sum: it is the same as in the signed `SHA256SUMS`.

The design — [architecture.md](architecture.md), section 3.4.

— *Why:* the author's answers while T27 was planned, 2026-10-21: the registry and the package's path into it — by the recommendations, the rest — «да» to the plan with the recommendations. The comparison — [architecture.md](architecture.md), section 2.3, the sources — section 4.
- **npm** passes the criterion of Т-26 — by an exact version and without a token, for the authors of widgets too:
  - anyone installs a public package in a scope — "Scoped public packages can be downloaded and installed by anyone";
  - a version does not change — "Registry data is immutable" —, and its number is not reused;
  - an organization for public packages is free;
  - trusted publishing does without a token and gives provenance.
- **The same file.** npm checks the registry's signature and the provenance, but not which workflow built the package. So the file itself holds the tie of the package to the signed release: its sha256 is in the signed `SHA256SUMS`. The check of Т-27 extends to the version on npm too, if its archive from the registry is checked against this sum. This is a separate step: the lock file keeps sha512 (В19 in table 3 of RUN.md).
- **A step of the shared release:**
  - publication is the same for all repositories with packages on the shared release, and `.github` holds what is shared this way (R03 .github);
  - OIDC needs no secret (R05 .github);
  - from a reusable workflow, npm checks the name of the calling workflow. The provenance certificate, by Fulcio's rule, names the shared `release.yml` in its SAN, as the cosign signatures do (Т-27).
- **One release.** `app`, the CI of `tutor` and an adult take one version by one tag. The page and the synthetic samples are not packages: they are downloaded as files (R25 spec; T32 tutor).

— *Rejected:*
- **GitHub Packages** — a token is needed even to install a public package, and only a personal access token (classic);
- **GitHub releases only** — npm 12 closes installation by a link by default:
  - a project would need `allow-remote=root`;
  - a package that itself depends on a NovaTrail package by a link would need `all`;
  - in npm 11, which comes with Node 24, installation by a link is still open, but it is already being closed;
- **a publication job of our own in the `release.yml` of `canvas`** — a copy in every repository with packages. It too needs an edit of `.github`: the shared `release.yml` has no outputs — neither the version nor a sign that the release came out;
- **staged publishing** — the author with 2FA approves each version, and the release waits for a person again, while it must come out by itself (R18 .github; R31 spec);
- **publication of each version by hand** — the release waits for a person the same way, and the step can be forgotten;
- **a long-lived npm token in the secrets** — the shared workflow takes no secrets (R05 .github), and npm will remove direct publication by a granular token in January 2027;
- **`npm publish` from the tree** — npm would build its own archive, not the one signed in the release;
- **the page and the synthetic samples as npm packages** — they are taken as files: an adult without npm, the CI of `tutor` by tag and sum;
- **separate releases for the page and the synthetic samples** — one version of `canvas` would have several tags.

— *Revisit:*
- if npm stops letting publication from a reusable workflow through by the name of the calling one, or the registry does not accept provenance from there — the first publication will check this (T24);
- if `spec` decides Т-26 otherwise;
- when `app` begins to take the package: versions without edits of the package will become noise for it;
- when the samples page moves to the hosting of the build of `app` (Т-17).

— *Consequence:*
- **T08** — the name `@altnovatrail/canvas`, the field `repository`, which npm checks, and the folder of the package's build outside `dist/`. The recipes, `.npmrc` and the stage `toolchain` are by the agreement of the TypeScript wrapper, R19 .github, as [architecture.md](architecture.md), section 3.4, retells it: neither the code nor the tests nor the `justfile` take anything from `spec/`;
- **T18** — the synthetic samples as one archive, with the name by section 3.4;
- **T19** — the page's build as one file, with the license notices inside;
- **T21** — `release-files` takes the source of the tasks, by tag and by the sums from the tree. How to check the signature of the CLI of `module-kit` and of the release of `modules`, T37 `spec` decides (В7 module-kit);
- **T23** — the calling job by architecture 3.3 .github, on the recipes of T08 (R19 .github);
- **T24** — the npm step from В18, the release's paths and the author's steps by section 3.4;
- **T05** — check the other tasks of E2 against section 3.4;
- **`app`** — the package from npm by exact version, the working copy by a link; what to check of the signature — Т-27;
- **`tutor`** — its T32 knows where the synthetic samples are (В7);
- **`skill-map`** — its T04 takes this answer;
- **table 3 of RUN.md** — В17–В19 «в реестр spec» and additions to В7 and В16.

— [architecture.md](architecture.md), sections 2.3, 3.1, 3.3, 3.4 and 4; RUN.md, T27, T08, T23, T24, table 3.

— *Amendment 2026-10-21:* the TypeScript wrapper came out before the code of `canvas` — `typescript.yml` in the release of `.github` v0.1.5, commit c772cc8 —, and there will be no probe by a branch's SHA: a probe in `.github` itself checked the wrapper (R19 .github, with the amendments to it). T08 writes the calling job, by the release's SHA from the start, and the author sets the four checks "TypeScript / …" in the ruleset of `main` as a step of T08. T23 is merged into T08, and the item "T23" in "Consequence" reads as an item of T08. — [architecture.md](architecture.md), sections 3.4 and 4; RUN.md, T08, T23.

— *Amendment 2026-10-22:* the npm step came out — `release.yml` in the release of `.github` v0.1.9, commit 41d5144, by the 2026-10-22 amendment to R18 .github —, and the input `npm-package` turns it on. The first release of `canvas` comes out without it, and the author publishes the first version by hand with the same file, having checked it (T24). A new trusted publisher setting allows only staged publishing by default, and this decision rejected that: the setting of `canvas` allows direct publication too, `--allow-publish`. Added to "Revisit" is the bug npm/cli#9969: for repositories with an immutable subject of GitHub's OIDC token the registry refuses the exchange, and `canvas` has such a subject. Whether it affects `canvas`, the first publication of T24 will check. If it does, each version would have to be published by hand, and that path is rejected. — [architecture.md](architecture.md), sections 3.4 and 4; RUN.md, T24.

— *Amendment 2026-11-02:* T66 recorded what the release is built from, what comes out first and how the release is tried before it comes out. The author decided while it was planned, by the recommendations.
- **The first release** — the package, `LICENSE` and `SHA256SUMS`: `altnovatrail-canvas-<X.Y.Z>.tgz` and the sums of two files. The build of the samples page and the synthetic samples come out in the next releases, T24 in E5 (the 2026-11-01 amendment to R42).
- **The recipe `release-files <version>`** takes a number of the form `v0.1.0`, as the recipe of `module-kit` does, and writes it in without `v` as the package's version. `npm pack` packs the archive from a copy of what it takes — `lib/`, `package.json`, README and LICENSE —, and the tree's `package.json` stays `0.0.0`. `scripts/release.ts` checks the very archive being released, by the output of `npm pack --json`: the package's name, the version, the file's name — what the shared `release.yml` looks for —, and that it holds only the build. The recipe takes the file's name from this check, and does not write it itself. The number is strictly `v<major>.<minor>.<patch>`, without leading zeros and without a suffix. The same commit gives the same sums: `npm pack` pins the time and the order of the files. The recipe prints `SHA256SUMS` to the log, so that the build can be repeated and checked.
- **The paths** — what the package's consumer gets, by the rule of the template of architecture 3.3 .github: «в перечне то, что получит потребитель» (the 2026-10-22 amendment to R31 spec):
  - the package's code, `src/*.ts` without `*.test.ts`, `*.fixture.ts` and `*.check.ts`;
  - `package.json`, `tsconfig.base.json` and `tsconfig.build.json`;
  - `justfile`;
  - README and LICENSE — `npm pack` always puts them into the archive;
  - the whole `.devcontainer/Dockerfile` — its stage `toolchain` holds Node and the npm that packs the archive;
  - `release.yml` itself, so that a change of `RELEASE_LINE` gives a release.

  The lock file is not in the list: it does not go into the archive, and the compiler is pinned by an exact version in `package.json`. `.github` writes the list of the kind typescript with the first release of `canvas`, and this one is its proposal.
- **The probe.** Our own `release.yml` runs after CI on `main`, by the button and also on each pull request, with `publish: false` and `npm-package: "@altnovatrail/canvas"`. The shared `release.yml` then builds the files, signs them and checks the signatures, and the npm step checks the archive and makes a trial publication. Nothing goes out either to a GitHub release or to npm. T70 turns on the publication for `main`, and T71 `npm-package` for all events.

— *Why:* a release is irreversible. An immutable release cannot be replaced, and a number that npm has once taken cannot be returned: "Once package@version has been used, you can never use it again" (the 2026-11-01 amendment to R18 .github). The shared `release.yml` allows the probe itself: "A run that publishes nothing may run anywhere: a pull request tries a change that way". With `npm-package` it checks the archive by the same code that later publishes — `package.json`, the registry and a trial publication —, and the own check of `canvas` stays the one that both the local build and a release without the npm step in T70 see. The paths are by the rule of the template: for Go the list holds the whole Dockerfile, because Go is pinned there, and in `canvas` npm packs the archive from the same stage.

— *Rejected:*
- paths without README and the Dockerfile — the README in the npm archive would lag behind until a version with code, and a new npm in the image may build the archive otherwise: the template's rule would be broken;
- the lock file in the paths — each raise of a development tool would give a version, and the lock file does not go into the archive;
- the filter `paths` on `pull_request` — it would repeat the list in another syntax, and a run of a change outside the list ends as soon as the number is computed;
- the probe only on `main`, as in the template — the first probe would come with the merge, and `main` would be the first to see an error of the recipe;
- a trial pull request without a merge, like the probes of `.github` — until T70 nobody would check that the recipe has not broken;
- checking an archive built from the root instead of the one released — `scripts/package.ts` looks at `npm pack --dry-run` of the tree with the version `0.0.0`, and what goes out is a copy with another version.

Our own `release.yml` lets the probe after CI on `main` run only if CI passed: with `publish: false` the shared job does not ask this. The key `permissions` raises the write permissions in a Dependabot pull request too: "You can use the `permissions` key in your workflow to increase the access for the token" ([architecture.md](architecture.md), section 4).

— *Revisit:*
- when `app` begins to take the package: a raise of a tool changes `package.json`, tasks edit README, and Dependabot the image, and each time a version comes out without edits of the code;
- if `canvas` gets pull requests from forks: they have no write permissions and no OIDC, and the probe does not start there. It is not in the ruleset and does not hold the merge.

— `justfile`, `scripts/release.ts`, `.github/workflows/release.yml`, README.md; [architecture.md](architecture.md), sections 3.4, 3.7 and 4; RUN.md, T66, T70 and T71.

— *Amendment 2026-11-02:* R77 spec decided what the consumer checks, and Т-27 is closed. The items "Signature" and "The same file" read so: the signature of the file itself ties the version on npm to the signed release. The archive from the registry is the same bytes as the release file `altnovatrail-canvas-<X.Y.Z>.tgz`, and the consumer checks it by the recipe of `spec` `release-verify-npm` in the CI of the pull request that changes its lock file: the signature by the bundle of this file in the release, and `integrity` by the checked bytes (the 2026-11-01 amendment to R37 spec). `SHA256SUMS` is not needed for this, but it stays a release file: by it the build is repeated and checked (the 2026-11-02 amendment above). The recipe will accept the files of `canvas` if the shared `release.yml` of `.github` no lower than v0.1.7 signed them — `canvas` has v0.1.12 — on a call of the `release.yml` of `canvas` from `main` at the tag's commit, and immutable releases and the ruleset of the tags `v*` are turned on in `canvas` before the first release: this is the author's step of T66. — R44; [architecture.md](architecture.md), section 3.4.

— *Amendment 2026-11-02:* the condition of R77 spec for checking the signature is met in `canvas` before the first release. Immutable releases are turned on, and the ruleset of tags `v-tags` (26336827) — `refs/tags/v*`, the rules `update`, `deletion` and `non_fast_forward`, without bypass — is the same as in `module-kit` (architecture 3.3 .github). The executor turned them on at the author's instruction — a confirmation by rule 4. — RUN.md, T66; [architecture.md](architecture.md), sections 3.4 and 4.

— *Amendment 2026-11-02:* T70 turned on the publication, and its merge is the first release. Our own `release.yml` publishes after CI on `main` and by the button: `publish` is `true` everywhere but `pull_request`, and a pull request still tries the release without publication. The input `npm-package` is `@altnovatrail/canvas` only for the probes of a pull request, and empty for a release. The package is not in the registry yet: the npm step with publication would stop the release, and a trusted publisher is set up only for a package that is in the registry. The author publishes the first version by hand, with the same release file, and T71 gives the npm step to all events.

Before the merge:
- all seven links to `.github` are at v0.1.13, `09443e1`. The signature of the first release is immutable, and the shared `release.yml` v0.1.13 checks, when publishing, what `release-verify` will require (R77 spec): the signature will name the `release.yml` of `canvas` on `main`, and the shared workflow is pinned by SHA. Dependabot would not have offered the raise before 2026-11-05;
- the Dependabot queue is merged: vite 8.3.5, biome 2.6.4 and the image devcontainers/base 3.0.12. After the first release each raise that touches the paths is a new version (see "Revisit"). Between T70 and T71 no pull request touches the release's paths: otherwise a version without npm would come out, and v0.1.1 must be released by the pull request of T71 itself ([architecture.md](architecture.md), section 3.4);
- README — the Release badge and the badge of the release number (repositories 2.3 spec), and installation by exact version with the check `release-verify-npm`.

Rejected — `npm-package` for the release too: the shared `release.yml` checks the registry before the GitHub release, and for a package that is not there the run with publication stops — v0.1.0 would not have come out at all.

— `.github/workflows/`, README.md; [architecture.md](architecture.md), section 3.4; RUN.md, T70.

— *Amendment 2026-11-02:* trusted publishing works for `canvas`, and the "Revisit" about its refusal is lifted. The author set up the trusted publisher — `canvas`'s `release.yml` — and forbade tokens that bypass 2FA, and T71 gave the input `npm-package` to every event. Its merge released v0.1.1, and the npm step of the shared `release.yml` published the same archive by OIDC, with no token. The version has provenance, and the registry accepted it from a reusable workflow of another repository: the certificate names `.github`'s shared `release.yml` at the SHA of v0.1.13, and the SLSA predicate names `canvas`'s `release.yml` on `main`. The bug npm/cli#9969 is still open, but it did not touch `canvas`, whose token subject is immutable. The trusted publisher's setting allows staged publishing too — that is how npm creates every new setting —, but the release step publishes directly, as R08 decided. — RUN.md, T71; [architecture.md](architecture.md), sections 3.4 and 4.

— *Amendment 2026-11-02, E8's "Consequence" on the tasks of E5:* the bodies of the tasks in E2's archive are not edited, but read as follows:
- **T24** — the samples page and the synthetic samples come out in the next releases, by the same recipe `release-files` and the same `release.yml`. The recipe puts their files into `dist/` beside the package, and their sources go into the list `paths`. A release has one tag, so a release for the page alone is a new version on npm too, by the same step: that is the "Revisit" above. Each change of the paths is tried in a pull request with no publishing, and the first release and the npm step have already passed — T70 and T71;
- **T21** — the source of the measurement's tasks for the page's build has come: `tutor`'s release v0.1.1 of 2026-11-02 carries the file of open views `tutor_v0.1.1_open-tasks.json` with its signature. The page's CI takes it only once the recipe `release-verify` has accepted the file (R77 spec), and the move to `modules` is still Д4;
- **T19, T20 and T29** — the element that the page's build takes is the same package, with the contract's types from `spec` (the 2026-11-02 amendment to R07): the page is a consumer, as `app` is.

— RUN.md, T72; table 4, Д4.

— *Amendment 2026-11-07:* the synthetic samples come out before the samples page — the author decided so on 2026-11-07, when `tutor`'s CI asked for synthetic samples for T32 tutor. The release with the archive of synthetic samples is T24, and the next release, T75, releases the page's build. So `tutor`'s CI waits neither for the measurement's tasks in the build nor for the check of the page on devices (T21, T22). "One release" holds: a version has one tag, and each next release carries all the files `canvas` has by then. The archive of synthetic samples is `synthetic-samples_v<X.Y.Z>.tar.gz`, flat, one JSON per sample, with its sum in `SHA256SUMS` and a bundle beside it, as T32 tutor asks. T24 decides the details. — RUN.md, T18, T24, T75.

— *Amendment 2026-11-08:* T24 added to the release's files the archive of synthetic samples `synthetic-samples_v<X.Y.Z>.tar.gz` and its list `synthetic-samples_v<X.Y.Z>.tsv` — what each sample shows. Both files are signed, like the others, and stand in `SHA256SUMS`. The release's paths now take what the archive is built from too. How this is built is R50. — RUN.md, T24.

— *Amendment 2026-11-08:* the release line is `0.2`, `RELEASE_LINE` in `.github/workflows/release.yml` — T77, the author's answer during execution, by the recommendation. From T77 the element reads the module format 0.3 and does not accept a manifest of format 0.2, which every 0.1 release accepted (the 2026-11-08 amendment to R32). In versions 0.y.z, y carries a change of behavior — that is how `spec` compares module versions too (R89 spec) —, and the number tells a consumer that a manifest 0.2 no longer does. The line's first release is v0.2.0: the recipe `release-version` takes the line's next patch, and the new line has no tags yet. The rule from here on: the line is raised when a release stops accepting what the release before it accepted — a format version or another input of the contract. Rejected — keeping `0.1`: nothing would have broken — the release has no modules 0.2, and `app` has no code yet —, but the number v0.1.8 would not have said that a manifest 0.2 is no longer accepted. — RUN.md, T77; [architecture.md](architecture.md), section 3.4; `.github/workflows/release.yml`.

— *Amendment 2026-11-09 (T85):* **the release line is 0.3: from `spec` v0.12.0 the element reads the module format 0.4 and refuses a manifest 0.3, which every release of the line 0.2 took. `RELEASE_LINE` in `.github/workflows/release.yml` is `"0.3"`, and T85's merge releases 0.3.0 — and the same version on npm. `.github`'s shared workflows are v0.1.21 instead of v0.1.15: the npm step waits for the registry 20 minutes, not 5 (Д91 in `spec`'s RUN.md; R60).**

— *Amendment 2026-11-09 (T21):* **the page's build takes the measurement's tasks from the copy of `tutor`'s file in the tree, `tasks/tutor_v0.1.10_open-tasks.json` — the one that `ci-licenses` checks by the recipe `release-verify` on every pull request, and whose sum `TUTOR_FILE` holds —, and `release-files` downloads nothing. The synthetic samples and the page have one path of the file, and a pull request builds the same page as a release (R62).**

— *Amendment 2026-11-10 (T75):* **every release from T75 carries the samples page's build. `release-files` builds it by `node scripts/page.ts dist <number>`, with the draft of texts, and puts `samples-page_v<X.Y.Z>.html` into `SHA256SUMS` as the fifth file, and the release's paths take the page's sources, its builder and the programs of `tsconfig` whose options Vite reads. The release's description begins with a paragraph about the page and about the IP address — the job `notes` of canvas's own `release.yml` puts it there. How this is built is R66.** — RUN.md, T75.

— *Amendment 2026-11-10 (T96):* **a release has six files and `SHA256SUMS`: to the earlier ones comes the generator of a module's eval set `synthetic-module_v<X.Y.Z>.mjs`, which `release-files` writes into `dist/` after the page, and to the release's paths come its code, its entry point, its builder, the shared helpers of the notices and `tsconfig.node.json` (R68).**

**R09. The sample file: what it holds is set by the purpose and by who wrote, and the provenance — a person or synthetic — does not change the composition. The writing history is only in a measurement sample by an adult, and eval-set samples and child samples hold the final geometry of the visible strokes, with no time, pressure or order of writing. Synthetic samples come out in every composition. All of them hold crops at the eval's heights, which `canvas` draws, the stroke groups, the markup by lines and a reference to the task with no key. About the person — the purpose, who wrote, the consent's text version and, except in the eval set, a random writer code.**
- **Three fields** set the file's composition and where it may go:
  - **purpose** — the measurement or the eval set. An eval-set sample goes by a pull request into `modules` and is published under Apache-2.0, and it cannot be withdrawn (R20 spec; concepts 3 spec). A measurement sample by an adult stays outside git, with `tutor` (R05 tutor);
  - **who wrote** — an adult in their own hand, an adult imitating a child's, or a child. A child only with the purpose "measurement", but their sample does not go to `tutor` together with the adults' samples. It lies outside the repositories, with no pull request, and where the file goes and who has access to it is for П-10 and П-12 to decide. It goes to no AI until П-3 has given a contract that admits children, and `tutor`'s runner checks this by the field (R25 spec; R24 spec; В20);
  - **provenance** — a person or synthetic. A synthetic sample has a seed, and the sample's ID is derived from it, while a person's sample has a random ID. Synthetic samples come out in every composition, and `tutor`'s CI checks them all (В7).
- **Composition:**
  - **a measurement sample by an adult** — the writing history as the element gives it (R07). A stroke is an ID, a pointer type and points: x, y, time and pressure, in the order of writing. Erasures and undos come with their time. Time is milliseconds from the sample's first event, with no date, and coordinates are units of the sheet to a precision of 0.1;
  - **an eval-set sample and a child sample** — the final geometry of the visible strokes. Points go along the stroke's length, a stroke's direction is canonical, and strokes are numbered by place. It holds no time, no pressure, no order of writing and nothing erased. On the scale of A4 of the study "A child's handwriting on the canvas and the AI tutor" («Рукопись ребёнка на канве и ИИ-наставник») this is class (b): the division into strokes and the split into groups remain;
  - **in all of them** — the crops, each with its own parameters; the stroke groups — boxes in fractions of each crop and a table "label → stroke IDs"; the markup; the reference to the task; the versions of the format and of `canvas`; the consent's text version.
- **The order of computation:**
  1. the groups are built on the raw history, by space and time (R06), and the labels are given by place, from top to bottom;
  2. in eval-set samples and child samples the strokes are numbered anew, by place, and the table of groups and the markup move to the new numbers;
  3. the points are rounded, and in eval-set samples and child samples also resampled;
  4. `h_med` is computed from the recorded geometry and groups, and for each crop D, `s`, `sheet_box`, the width, the height and the boxes. All of it goes into the file, and the runner will repeat the boxes from what is recorded.

  A sample's crop differs from the crop that `app` sends only by the rounding of the points, and in eval-set samples and child samples also by the resampling. The resampling step is taken such that no difference shows on the crop, and T17 chooses it.
- **The crops** are drawn by `canvas` on saving — at each digit height that the eval protocol names, now 16, 24, 32 and 48 px (A6 of the study; R08 tutor). The working one is the module's digit height: `app` sends the crop at it. The states — after a line and a pause in a line — are drawn by the runner, from the writing history. So only measurement samples by adults have them.
- **The markup** is by lines, like `tutor`'s format (T12 tutor). Before a line is written — the sheet's scenario and the line's intended text. After writing, before saving — the strokes of each line, deliberately illegible places as sets of strokes, what is crossed out, the first error, the line of the final answer, the value in each answer slot and the expected outcome. There is room for what T08 tutor will require too. After saving the markup does not change. A child sample is marked up by an adult — from the child's words, after writing —, and the file names how the markup was obtained.
- **The reference to the task** is without the key (R05 spec): the source — the release's tag and the file's sha256; the module or the task bank and its version; the task's ID and, for a templated one, the seed; the digest of the open view. The key is with the runner.
- **About the person** — the purpose, who wrote, the consent's text version and, except in eval-set samples, a random writer code, which the page makes. No name, email or GitHub account, no device, browser, screen or language, no date, age or grade.
- **The container** is one JSON per sample, compatible with the JSON mapping of proto3; the crops are PNG in base64. The field names, the schema and the container will be set by the eval protocol (epic E3 in `spec`'s RUN.md; R15 spec), and `canvas`'s proposal goes there — В20 in table 3 of RUN.md.
- **The task is split.** T04 decides the file's composition, and T28 the page's steps — age, consent, the child sample session. R25 spec assigns to T04 the check whether a build opened from a file works, and the probe T29 of epic E2 does it: it is code, if only a probe.

How it is built — [architecture.md](architecture.md), section 3.5.

— *Why:* the author's answers in planning T04, 2026-10-21. The split of the task, the writing history, the writer code and the crops — by the recommendations, the rest — «да» to the plan with recommendations. The options — [architecture.md](architecture.md), section 2.4, the sources — section 4. A separate agent checked the design before the work.
- **The history where it is read.** The measurement needs it: the model must see the course of reasoning (R07 tutor), and the states are built by the strokes' time (architecture 3.1 tutor). The submitted work carries one crop (R09 spec), and a module's eval set measures what goes in the work. What is published in a module is not withdrawn (concepts 3 spec), and raw strokes with time and pressure are the riskiest class on the scale of A4 of the study. Data — a minimum (R09 spec).
- **Pressure in a measurement sample** — as the element records it (R07) and as `tutor`'s recording page does (R07 tutor). Which kinds of input are measured is for T08 tutor to decide, and "a sample recorded without it will not get it back" (R07 tutor). Removing pressure from the protocol is only a proposal (В20).
- **The final geometry, not a single crop.** The runner finds the place of the first error by sets of strokes, and snaps the model's box to the strokes (R08 tutor). Without strokes there is neither. The canonical direction and the numbers by place remove the order of writing from the geometry.
- **Groups by time for a child too.** The crop in a sample must be the one `app` sends, and its scale comes from the groups (R06).
- **`canvas` draws the crops.** The runner compares digit heights "in pairs with 32 px on the same lines" (architecture 3.1 tutor). So the comparison runs on one render, and it is the same as `app`'s.
- **Markup by lines, like `tutor`'s format.** Then the runner reads the samples of the samples page and of the recording page with one code (В7 tutor). The intended text is set before the line is written, not read afterwards from one's own writing.
- **The writer code.** The lines of one sheet are "linked by the writer" (architecture 3.1 tutor), and by the code the runner will also account for the link between the sheets of one writer. Child samples are withdrawn by the code and deleted on schedule (П-10): the adult writes the code down beside the consent. The eval set needs no code, and it would link the published samples to each other.
- **A reference without the key.** The canvas gets no key (R05 spec); the key lies in the task bank or in the module package, with the runner. The digest of the open view stays the same when the source changes by В6.
- **JSON of proto3.** `spec`'s contracts are protobuf (R11 spec), and in proto3's JSON mapping bytes are a base64 string.

— *Rejected:*
- **the history in all adults' samples**, as in E2's plan: the open eval set would forever hold the dynamics of the pen, which the eval set does not read;
- **the history for a child** — class (c) on the scale of A4;
- **only a crop for a child** — without strokes there is neither Jaccard by strokes nor snapping of the box;
- **groups without time for a child**, as T02's "Open" allowed — the crop would not be the one `app` sends;
- **one field "kind of sample"** — it would mix the purpose, who wrote and the provenance, and synthetic samples are needed in every composition;
- **a random ID for synthetic samples** — one seed must give the same file byte for byte (T18);
- **one crop, with the runner drawing the other heights** (T21 tutor) — the comparison of heights would have two renders;
- **a measurement sample without pressure** — it departs from R07 and R07 tutor, and T08 tutor has not yet decided whether pressure is needed;
- **markup after the whole sheet**, from one's own writing — the text would no longer be the intended one;
- **date, age, grade, device** — no check reads them. Whether a child's grade is needed is for П-10 to decide (В21);
- **a writer code in the eval set**.

— *Revisit:*
- if R09 spec, В8 or О-8 adds the history, the states or the group boxes to the check: eval-set samples are then recorded anew, they cannot be supplemented;
- if T08 tutor takes pressure into no kind of input — it leaves the measurement samples (В20);
- if the eval protocol decides otherwise — the composition moves to the protocol (T16, T17);
- the groups — by the measurement's findings (R06): eval-set samples keep the groups of their own version of `canvas`.

— *Consequence:*
- **T10** — undo and the clearing of the sheet are written into the history so that a measurement sample takes it;
- **T12** — the group labels are given by place, from top to bottom, and the rule of groups with its thresholds goes to the protocol with test vectors on the writing history (В20; В12);
- **T13** — a crop is drawn at any digit height, and its parameters are given with it;
- **T17** — the fields, the compositions and the resampling step by [architecture.md](architecture.md), section 3.5;
- **T18** — synthetic samples in every composition, the ID from the seed;
- **T19** — how the build opens on each device — by T29;
- **T20** — the markup and the writer code — by section 3.5, the steps — by T28;
- **T28** and **T29** — new tasks in table 1 of RUN.md;
- **T05** — check the bodies of E2's tasks against section 3.5: there the writing history is named «в образцах взрослых»;
- **`tutor`** — the runner takes the crops and the groups from the sample, and pressure and the composition go to В20;
- **`modules`** — T02 modules checks the purpose and "who wrote";
- **table 3 of RUN.md** — В20 and В21 «в реестр spec», additions to В7, В9 and В12.

— [architecture.md](architecture.md), sections 1, 2.4, 3.2, 3.3, 3.5 and 4; RUN.md, T04, T28, T29, T19, T20, table 3.

— *Amendment 2026-10-25:* T12 decided the rule of groups (R24). "By place, from top to bottom" in step 1 of "The order of computation" means: by the top of the group's rectangle, then by its left edge. The rule computes at the sample's precision — in tenths of a unit and whole milliseconds. So the groups on the raw history and on the recorded one coincide if the sample rounds the same way: places to `round(10 × v)`, time to whole milliseconds, and a half up. This is an input of T17. — R24; [architecture.md](architecture.md), sections 3.2 and 3.5; RUN.md, T12.

— *Amendment 2026-10-25:* the crop's scale no longer comes from the groups (R25).
- In step 4 of "The order of computation" `h_med` is computed from the recorded geometry, and the boxes from the groups.
- The argument "Groups by time for a child too" of "Why" now rests on the boxes and the table of groups: in a sample they are the same as those `app` sends.
- The crop computes in tenths of a unit, as the sample writes. So a measurement sample's crop matches `app`'s crop byte for byte, rather than "differs only by the rounding of the points".
- In eval-set samples and child samples the crop's numbers are the same if T17's resampling keeps the stroke's extreme points.

— R25; [architecture.md](architecture.md), section 3.5; RUN.md, T13.

— *Amendment 2026-10-26:* `tutor` no longer snaps the model's box to the strokes, nor finds the place by sets of strokes: the board draws the box as it is (T45's amendment to R19 tutor), and the measurement counts it by the line of the first error — "within the box with a margin of 8 px, most of the visible points are of this very line" (R24 tutor). The argument "The final geometry, not a single crop" holds anyway: the lines of the markup are sets of strokes, and the runner counts a hit on a line by points. The device's rule of snapping is R26, and it is proposed to the eval protocol with test vectors (В37 in table 3 of RUN.md). — R26; [architecture.md](architecture.md), sections 3.2 and 4; RUN.md, T14.

— *Amendment 2026-10-27:* a workbook's sample carries the crops of the boxes at the eval's heights, a table "box → stroke IDs", which the device built on the raw strokes, and the boxes' rectangles in units of the page, and it has no groups. In a workbook's eval-set samples and child samples there are only the boxes' strokes, and the table moves to the new stroke numbers, as the table of groups does. A measurement sample by an adult carries the whole writing history, as decided here. For the eval protocol this is В47 «в реестр spec» (R34). — R34.

— *Amendment 2026-11-08:* the composition moved to the eval protocol, as "Revisit" bids (R93–R95 spec; [the text of the contracts](../spec/contracts/README.md) at the tag v0.9.8, section "The sample file"). The protocol took the three fields and the compositions as they are here, and it differs as follows:
- **no pressure** in any sample: no kind of a model's input takes it (R93 spec). "Pressure in a measurement sample" and the second "Revisit" are lifted;
- **the markup** is the field `markup`: the truth of each answer slot that AI reads — the value as written, or why there is none —, the notes of the slots, and on a sheet the writing parts with their kind, text, strokes, "crossed out", "illegible" and "final answer" and the number of the first error, for an essay the marks of the criteria. It holds no scenario of the sheet, no intended text of a line and no expected outcome: the runner gets the outcome by the key (R95 spec). In synthetic samples the first error and the marks are the code's choice by the seed (the 2026-11-08 amendment to R95 spec);
- **the reference to the task** carries the digest of the bank or of the package instead of the bank's version, and the digest of the open view is the `sha256:` of the canonical text;
- **the versions** are `canvas_version` and `text_set_version`, and in a file that the page did not write, synthetic samples' too, `0.0.0` and `none` (the 2026-11-07 amendment to R93 spec). An eval-set sample also has `license: "Apache-2.0"`;
- **the crops** are at 16, 24, 32 and 48 px and at the module's height, and the set's shared numbers are the box of the points and h_med in tenths. Each writer of the file draws them from the strokes the file holds, and `spec`'s check computes them again (R94 spec);
- **the container** is the message `Sample` of the package `novatrail.eval.v1`, and the code of `@altnovatrail/contracts` writes and reads it; `spec`'s recipe `sample-check` checks the file (R93 spec).

The protocol now sets the file's composition, and this entry is what `canvas` proposed to it. — R47; T17 and T18 in RUN.md.

— *Amendment 2026-11-08, T17:* the module `src/eval/` builds the sample file (R48). It follows "The order of computation" thus: the groups and the table of boxes on the raw history, and the points of the final geometry in the canonical direction, along the stroke's length every 0.25 unit, with the ends and the points the stroke's box rests on; the strokes by place. The crop's numbers from such geometry are the same as from the history. A synthetic sample's ID is `synthetic-<seed>`, a person's is 12 random characters, and the writer code is 8. — R48.

## `spec` tag v0.2.14

**R10. `canvas` is on `spec` v0.2.14: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.13 v0.2.14`, read 2026-10-21). All that is new in it comes from the author's analysis "The base canvas and the contract 'canvas ↔ agent'" («Базовая канва и контракт „канва ↔ агент“») of 2026-10-21 (product 14 spec; architecture 8 spec):
  - architecture 3.4 spec — what the widget protocol has to decide beyond R16 spec: a channel through a `MessageChannel` port, a version of the state in each message of the widget, the widget's parts for the tutor's marks, "state, not verdict" and conformance tests in `spec` with a test host in `widget-template`. From stage 4 this is an input of the widget host — the protocol's side in the app, which `canvas` holds (architecture 3.2 spec). This does not depart from [architecture.md](architecture.md), section 3.1: there the widget layer waited for the protocol's detailing, and now it names what of it the host needs. One thing is unclear — В22: of the protocol's side in the app architecture 3.4 spec writes "`app`", but does not say whether the host passes the conformance tests. Epic E5 in `spec`'s RUN.md decides the protocol;
  - О-21 — a hint at the learner's request. It touches `canvas` at the edge. Before the first submission the recommendation gives what the module gives to the solving steps, and a sketch "how to begin", if the module gives one. The sketch is drawn by `canvas`'s tutor's layer, and before the first submission there is no crop, so the sketch's place is not addressed by it: R06 has already recorded this, and it is decided with the first slice of `app` and `api`. Unsubmitted work does not go to reading, and the request button is `app`'s, so О-21 does not change the element's interface (R07);
  - О-8 is supplemented with the option of a "live" mode — the tutor reads the work by itself, by the canvas's events —, and it is to be decided by the data of `tutor`'s measurement. The recommendation is as before: a check only by the button. The event `historychange` (R07) carries the writing history for `app`, not for reading, and epic E2 puts off the "live display" until the measurement's findings anyway;
  - Т-30 — the withdrawal of a version of a module or of a widget. It touches `canvas` in two places. From stage 4 — the widget host, which will not learn of a withdrawal by itself: it knows neither `api` nor the index, and this is decided at `app` ([architecture.md](architecture.md), section 3.1). And already now — the samples page's build: `canvas`'s CI puts a module's tasks into it from a release of `modules`, and Т-30 says nothing of it — В23;
  - T29 in `spec`'s RUN.md takes as its input [architecture.md](architecture.md), section 2.5 — the recommendation to give the answer of the text canvas as it was typed. The source is named the same there and here: the analysis "The base canvas and the contract 'canvas ↔ agent'" («Базовая канва и контракт „канва ↔ агент“»), which the author sent on 2026-10-21;
  - R09 — the sample file's composition, decided on v0.2.13 — the tag does not change: none of these points touches the composition. And О-8 now bids deciding by the data of `tutor`'s measurement on reading at a pause, and these come from the measurement samples with the writing history, which R09 kept;
  - the rest is about other components: О-21 in the format of hints (T30 in `spec`'s RUN.md), withdrawal in the module index (T34 there too), attempts on a withdrawn version in `api` (architecture 3.5 spec), the module registry (architecture 3.13 spec), epic E5, concepts 10 spec and the prototype `draft/`. It changes no other document of `canvas`;
  - `repo-template/`, `tools/new-repo/` and `.devcontainer/` did not change between the tags.
- **What is changed here:**
  - `spec/` — at v0.2.14, commit f5f438e. The links to `spec` in README.md and the tag in CLAUDE.md and at the start of RUN.md are v0.2.14. The log's opening, R01, R03 and R04 still say what was before: it is history;
  - [architecture.md](architecture.md): section 3.1, "The widget layer from stage 4" — what the host needs of architecture 3.4 spec; section 2.3 — a link to architecture 3.4 spec; section 2.5 — the input of `spec`'s T29; section 3.4 — a withdrawn version of a module in a released build of the page (В23); section 4 — where the same analysis is in `spec`;
  - the devcontainer does not change: the Dockerfile and the recipe `editDevcontainer` at v0.2.14 are the same as at v0.2.13 (R04).

— *Why now:* the author's instruction of 2026-10-21 — move `canvas` to `spec`'s latest release. T28 and T05 read the latest `spec`. And v0.2.14 brings the widget protocol, which `canvas` implements as the host from stage 4: what in it is unclear for `canvas` is better named while `spec`'s epic E5 has not begun. v0.2.14 is `spec`'s latest release as of 2026-10-21, and immutable (`gh release list -R altnovatrail/spec`); `gh release verify v0.2.14 -R altnovatrail/spec` confirmed it by its attestation, and the tag is on the commit f5f438e.

— *Rejected:*
- staying on v0.2.13 until T05: T28 and T05 would read `spec` without О-21, Т-30 and architecture 3.4, and В22 and В23 would wait for the next move;
- deciding О-21, Т-30 or the widget protocol here: these are questions of `spec`'s registers and of its epic E5 (RULES.md, Across repositories). Here — only what they mean for `canvas`, and what is unclear — as rows «в реестр spec»;
- an amendment to R05 for architecture 3.4 spec: R05 did not decide the protocol — only the widget's place in the stack and how the tool distributes input, and 3.4 spec does not change that.

— *Consequence:* Д2 in table 4 of RUN.md stays as it was: the move does not change the devcontainer's image. The new rows are В22 and В23 of table 3 of RUN.md, both «в реестр spec». — RUN.md, T30, table 3; CLAUDE.md; README.md; [architecture.md](architecture.md), sections 2.3, 2.5, 3.1, 3.4 and 4.

## Detailing — continued

**R11. The samples page: the purpose is chosen on the page itself, and the page takes no consent. It shows the notice of the purpose and writes into the file the version of its text set, and the written consent is a signed form, which the organizer accepts before the first sample or session. Until a lawyer has checked the texts, only the author's measurement is open: the eval set and the child sample session are closed. The age is a declaration «мне 18 лет или больше», and the writer code is one per person.**
- **The purpose** — the measurement or the eval set — is chosen on the page, at each opening and before writing, and the page does not remember it. There is one build (R08; R25 spec). It opens a purpose and the child sample session only if it carries a text set for them.
- **The text set** — the samples page notice and the consent form, with one version, which does not depend on the language. This is the "consent's text version" in the file (R09). The set has a status: a draft or approved by a lawyer.
- **Consent — as in R26 canvas-api:**
  - the page takes no consent: it shows the notice of the purpose;
  - the written consent is a signed form outside the page. The organizer accepts it before the first sample or session, and the person declares on the page that this is done;
  - what holds this is not the page but the acceptance of files and the checks by the fields. The measurement's organizer, `tutor`'s runner and `modules`'s CI check the version of the text set and "who wrote". The page is a barrier of the interface, not a boundary, like the PIN in П-17.
- **While the set is a draft:**
  - the measurement — only the author's samples. He declares that he writes his own samples — he needs no form. The page says so, and the acceptance of files holds it (В9 tutor);
  - the eval set is closed in every build until there is an approved text by П-16;
  - the child sample session is closed until there is an approved text of epic E4 in `spec`'s RUN.md;
  - a test "approved" set exists only in the tests of T20 and T22, and it does not go into a release.
- **The age** is a declaration «мне 18 лет или больше», with no year of birth (П-6). "Adult" in `spec` is the category "18 and over" (privacy 3.1 spec). Whether this is enough for consent and for a license to one's own work in every country is a question for a lawyer (В21 in table 3 of RUN.md).
- **The writer code** is one per person, and only in the measurement and the child's session. The page makes it but does not remember it: the person enters their code or asks for a new one. The adult gets the child's code in advance, without the child, and writes it into the consent form, and the organizer accepts the form with the code already in it. In each session the adult enters this code. The code is a pseudonym, not anonymity (privacy 1 spec).
- **What the page remembers** about people — nothing: no codes, no purpose, no declarations. It asks for all of this at each opening.
- **The texts.** The documents set the meaning of the screens; the strings and the languages are T20's, and the final texts come after the lawyer. Where the text sets lie and who approves them is В24 in table 3 of RUN.md.

How it is built — [architecture.md](architecture.md), section 3.6.

— *Why:* the author's answers in planning T28, 2026-10-21, all four by the recommendations; the rest — «да» to the plan with recommendations. A separate agent checked the design before the work.
- **The purpose on the page.** The measurement will run on `modules`'s tasks too, once they have content (R25 spec; В6 in table 3 of RUN.md), so the source of the tasks does not set the purpose. A second build for a second purpose is what R25 spec rejected for children's samples. And a choice at each opening keeps one from publishing out of habit what was written for the measurement.
- **The notice and the form.** A mark on a page that anyone can download can be set by anyone. canvas-api decided the same: «`POST /v1/me/consent` только отмечает, что уведомление прочитано», and the operator confirms the consent by a signed form (R26 canvas-api). The version in the file links the sample to the text the person saw.
- **The form before the first sample.** In canvas-api «до `verified` профили детей и холсты не создаются» (R26 canvas-api): data appear after the consent, not before it.
- **The eval set is closed until П-16.** A pull request publishes a sample at once, and it cannot be removed afterwards. Even after the history is rewritten, the commits stay accessible "through any pull requests that reference them", and GitHub Support does not delete data that are not secret ([architecture.md](architecture.md), section 4). Samples for eval sets are not accepted anyway until П-16 is decided (`.github`'s CONTRIBUTING).
- **The child's session is closed until E4.** Where a child sample's file goes and who has access to it is for П-10 and П-12 to decide. Until they are decided, there is no one to accept a child's data.
- **A declaration, not a year of birth.** П-6 advises so, and so it was in canvas-api: «отметка 18+ при согласии» (П-5 canvas-api). A year of birth is superfluous data, and the page cannot check it anyway.
- **The code per person, not per device.** By the code the runner accounts for the link between the sheets of one writer, and by a child's code the consent is withdrawn and the samples are deleted on schedule (R09). On a shared tablet a device's code would be shared, and a consent withdrawal by it would touch other people's samples, and a person with two devices would have two codes. The page remembers no codes, so on a shared tablet no one will see or choose someone else's code. The child's code comes before the form: the form is accepted before the session, and the code must be in it by then.

— *Rejected:*
- **the build sets the purpose** — by the source of the tasks or by a parameter: the first breaks when the measurement moves to `modules`'s tasks, the second means two builds and an amendment to R08;
- **a mark on the page as the consent itself** — anyone can set it, and П-16 and П-10 speak of a written consent;
- **the page says nothing of consent** — the person would not learn what is in the file and where it will go;
- **the eval set with a draft text** — a pull request publishes at once;
- **the child sample session with a draft** — until П-10 and П-12 are decided, there is nowhere to pass the file;
- **a year of birth** — superfluous data;
- **a code per device** — it mixes people on a shared device;
- **the page remembers codes and offers "this is me"** — on a shared tablet someone else's code is visible, and it can be chosen;
- **the page makes the child's code in the first session** — by then the form has already been accepted, and it has no code;
- **a code from the organizer** on the form — that is an amendment to R09: the page makes the code.

— *Revisit:*
- when E4 approves the texts — open the eval set and the child sample session;
- if the page moves to hosting (Т-17) — what it says about the IP address;
- if `spec` gives its own rule on a volunteer's age.

— *Consequence:*
- **T20** — the choice of the purpose, the writers' codes, "who wrote" for each sample, the barriers by the text sets and a test text set; the screens — by [architecture.md](architecture.md), section 3.6;
- **T29** — where downloads land and whether that folder syncs with a cloud; whether the storage of a page from a file is kept when the file's name is new;
- **T22** — on devices both the release's build and a test build with the test text set, to check the screens closed in the release;
- **T24** — the test text set does not go into a release, and the release's description says that GitHub sees the IP address of whoever downloads;
- **T05** — as a row «в реестр spec», an edit of the card architecture 3.2 spec: the samples page has the purpose "measurement", and a measurement's file goes to the organizer, not into `modules`;
- **`tutor`** — the runner checks the version of the text set and "who wrote"; **`modules`** — its CI too, and who opens the pull request is for T02 modules to decide;
- **table 3 of RUN.md** — В24 «в реестр spec», additions to В9 and В21.

— [architecture.md](architecture.md), sections 2.4, 3.6 and 4; RUN.md, T28, T20, T22, T24, T29, T05, table 3.

— *Amendment 2026-10-22:* E4 in this entry — "The child's session is closed until E4" and "when E4 approves the texts" in "Revisit" — is epic E4 in `spec`'s RUN.md, «Приватность до первого ребёнка». From 2026-10-22 `canvas` has an epic E4 of its own, «Лист для продукта» (the 2026-10-22 amendment to R17), and it opens nothing here. The eval set and the child sample session open only when `spec`'s epic approves the texts. — RUN.md, table 2.

— *Amendment 2026-11-09 (T85):* **the platform has no lawyer: legal questions are decided by the author on Claude's analysis, and the texts of the notice and of the consent are written by `spec`'s epic E4 (R112 spec). Where this entry and R58 and R59 say "approved by a lawyer", "before a lawyer" or "a lawyer decides", it reads as "approved by the author on Claude's analysis" and "the author decides"; the entry's text is not rewritten (R112 spec, "How to read the earlier entries"). The status "approved" of a text set is set by the author. The legal texts are in English, and the English text is the one in force, and a screen in another language says that the text is in English (privacy 7 spec): the page's text set will take the texts of `spec`'s E4 when its release puts them out, in a task of its own — `spec` v0.12.0 does not have them yet.**

— *Amendment 2026-11-10 (T75):* **the release's description speaks of the IP address in a paragraph that the job `notes` of `canvas`'s `release.yml` puts at its start once the shared `release.yml` has written the description: the shared one takes no text of the caller's (R66). The test text set does not go into a release: the builder puts it only into the version `0.0.0` (R58), and the release's paths do not take it.** — RUN.md, T75.

— *Amendment 2026-11-10 (T88):* **`spec`'s answer in planning T95 of its RUN.md (R124 spec; Д151 in `spec`'s RUN.md): the adult's declaration of age is «мне 18 лет или больше, и по законам места, где я живу, я вправе заключить этот договор», in both sets of `page/sets/`, the draft one and the test one. R124 spec does not change the sample file's composition. T89 takes the text sets from `spec`'s release file `legal-1.tar.gz` (R130 spec; Д161 there too), and in `legal-1` v0.14.0 all texts and sets are drafts. The word "lawyer" is removed both in the draft set and in the comments of the page's code, which the T85 amendment did not edit (R112 spec; R67).**

— *Amendment 2026-11-10 (T89):* **a text set is a set of the part `legal` from `spec`'s release file `legal-1.tar.gz`, and each purpose has its own, with its own version: `measure`, `eval-set` and `child-sample` (R130 spec). A purpose is open only with a current set, and "while the set is a draft" reads as "while the purpose's set has no version in force": then the measurement is open only for the author's own samples by `canvas`'s draft `draft-0`, and the eval set and the child sample session are closed. The file gets the version of the purpose's set — the ID and the number joined by a hyphen, `measure-1` (the 2026-11-09 amendment to R93 spec). The "Revisit" — "when E4 approves the texts" — is carried out by the move to a tag of `spec` in which the set is in force, with no edit of the code (R69).**

## The first code

**R12. The first code of `canvas` is the package `@altnovatrail/canvas` at the root of the repository, on npm, which comes with Node. It has two entry points: `@altnovatrail/canvas` — the element, `@altnovatrail/canvas/core` — the DOM-free part. The build is `tsc` of TypeScript 7.0.2 into `lib/`, formatting and linting are Biome 2.5.15, the tests are Vitest 5.0.5 in Node and in Chromium. The recipes `ci-lint`, `ci-test`, `ci-vuln` and `ci-licenses` follow the contract of the TypeScript wrapper, and the versions are the latest of those released no later than three days before the installation.**
- **The package** — `package.json` and the lock file at the root, and `.npmrc` sets `ignore-scripts=true` and `save-exact=true` (R19 .github):
  - `exports`: `"."` leads to `lib/element/index.js`, which registers `<novatrail-canvas>` on import, and `"./core"` to `lib/core/index.js`, with no DOM. Each entry point has its own declarations. `sideEffects` names only the element's entry point: otherwise the consumer's bundler would drop the registration;
  - `name` is `@altnovatrail/canvas`, and `version` is `0.0.0`: `release-files` writes in the number (R08). `repository` is `git+https://github.com/altnovatrail/canvas.git`, which trusted publishing checks. `files` is only `lib`;
  - `dependencies` — perfect-freehand 1.2.3 and rbush 4.0.1 (R05). `devDependencies` — typescript 7.0.2, @biomejs/biome 2.5.15, vitest 5.0.5, @vitest/browser-playwright 5.0.5, playwright 1.64.1, @types/node 24.19.2 and @types/rbush 4.0.0.
- **Versions.** Each is the latest of those released no later than three days before the installation, like Dependabot's pause `cooldown`. The lock file was built by `npm install --before=2026-10-18T00:00:00Z`, and the date applies to the transitive packages too. So it holds Vite 8.3.4, not 8.3.5 of 2026-10-21, and Biome 2.5.15, not 2.6.0–2.6.2 of the same day.
- **The build** — `tsc -p tsconfig.build.json` into `lib/`: JavaScript and declarations, and `lib/` is cleaned before the build. The package has no bundler: the consumer's bundler resolves the dependencies. `dist/` stays for the release's files (R08), and T19 builds the samples page into one file.
- **Types** — three programs of `tsc --noEmit`, each with `lib` and `types` set explicitly. Since TypeScript 6 `types` is empty by default, and `rootDir` is the config's folder.
  - the DOM-free part sees only ES2022 — neither DOM nor Node. This holds the promise of R05 and R07: it is the same in a browser and in Node;
  - the element sees ES2022 and DOM;
  - the scripts, configs and tests see Node too.

  The negative checks are the files `*.check.ts`, which the build does not take. `document` and `process` in the DOM-free part and `process` in the element must be errors, or else the unused `@ts-expect-error` becomes an error. The root `tsconfig.json` refers to the three programs, and the editor takes a file's own program for it. Imports in `src/` are with `.js`: `rewriteRelativeImportExtensions` rewrites `.ts` only in JavaScript, and would leave `./sheet.ts` in the build's declarations. Node itself runs the scripts, by type stripping, and they import `.ts`.
- **Formatting and linting** — Biome, the set `recommended`, an indent of two spaces, a line of 100 characters, as in the Dockerfile and `spec/tools`. Biome looks only at the code and its configs: not `spec/`, not `.devcontainer/`, not the lock file.
- **Tests** — Vitest, two projects, each with its own `include`: `spec/tools` has tests of its own.
  - `node` — the DOM-free part and the scripts;
  - `browser` — the element, in Chromium through `@vitest/browser-playwright`. `headless: true` is set explicitly. This departs from the contract, by which `CI` turns headless on: there is no display either in the container or on the runner, and without it `just ci` would fail in the container. In CI `CI` still keeps `test.only` out.

  After the build `scripts/package.ts` checks the package as a consumer takes it: the DOM-free part imports in bare Node by the package's name, both entry points and their declarations are in place, and `npm pack` takes only `lib/`, `package.json`, README and LICENSE.
- **The recipes** — the `justfile` at the root:
  - `ci-lint` — `biome ci` and the three programs of `tsc`;
  - `ci-test` — the build, `vitest run` and the check of the package;
  - `ci-vuln` — `npm audit --omit=dev --audit-level=high`, as the contract recommends and as in R48 canvas-api (R19 .github);
  - `ci-licenses` — `node scripts/licenses.ts`, also by the recommendation of R19 .github: a script of its own until `spec` gives a shared check (В20 in `.github`'s RUN.md);
  - `ci` — all four, for the developer; also `build` and `fmt`.

  `ci-lint` and `ci-test` install the packages themselves, `npm ci --ignore-scripts`, with a stamp from the sums of `package.json` and the lock file, like `spec`'s `_tools`. In CI they always install, in the container when something has changed. Binaries are taken only from `node_modules/.bin`.
- **The license check** — `scripts/licenses.ts`. It is written anew, after the pattern of `spec`'s `licenses-check` and R48 canvas-api, reads only the lock file and imports only Node's modules:
  - SPDX expressions — AND, OR, WITH and parentheses, identifiers case-insensitive;
  - the list is `ALLOWED_LICENSES` from the environment. Without it the check refuses and says where the list is;
  - a lock file without `packages` — a refusal: an old lock file would pass with nothing checked (В20 in `.github`'s RUN.md);
  - an exception is a name, a license, a reason and a decision, and only for a package the lock file marks `dev`. It covers the tool's builds for platforms too — those the tool itself names in `optionalDependencies`, if the build is `dev` too and under the same license. Another package it names is checked like any other. An exception the lock file no longer needs, and a tool whose license has changed, are errors. The only exception is `lightningcss` (R14).
- **Dependabot** — an entry `npm` in `/` by the text of architecture 3.3 .github, with a pause of three days. There are two additions:
  - the group `vitest` — `vitest` and `@vitest/*`: `@vitest/browser-playwright` 5.0.5 requires `vitest` exactly 5.0.5;
  - `ignore` of the major versions of `@types/node`: they follow Node in the Dockerfile, which is raised by hand.

  `playwright` comes in a pull request of its own. It is red until the image and the browser's revision are raised by hand in that same pull request (R13).
- **CI.** The job "TypeScript" in `ci.yml` calls `.github`'s `typescript.yml` v0.1.5 by the SHA c772cc8. `codeql.yml` calls the shared `codeql.yml` with the input `languages: javascript-typescript` — v0.1.0 already accepts it (Д9 in table 4 of `spec`'s RUN.md).
- **The code's skeleton** — the sheet's size 1000 × 1400 (R06) in the DOM-free part and the class `NovatrailCanvas` with an open Shadow DOM. The element is registered once: a second copy of the module finds the name taken, changes nothing and writes a warning about it to the console — the page's elements are then built by the other copy, whatever its version.

— *Why:* the author's answers in planning T08, 2026-10-21: one task, the entry points and Biome — by the recommendations; the rest — «да» to the plan with recommendations. The sources — [architecture.md](architecture.md), section 4.
- **npm** comes with Node 24.21.0 — that is npm 11.19.0 —, and the wrapper's contract requires no other (R19 .github). The repository has one package, and the root is the folder where the wrapper calls `just`.
- **Biome, not ESLint.** TypeScript 7.0.2 is a compiler in Go, without the classic API of `typescript`, and typescript-eslint 8.72.0 requires `typescript` below 6.1. With ESLint, TypeScript 6.0.3 would have to be kept beside it only for linting. Biome alone does formatting and linting and does without TypeScript, as in R47 canvas-api.
- **A pause in choosing versions** — the same protection as Dependabot's `cooldown`: a version that is withdrawn a day later does not get into the lock file.
- **Three programs** — as in R47 canvas-api, where the scripts' program does not see the DOM. Here, in addition, the DOM-free part sees neither DOM nor Node.
- **A license check of its own.** `spec`'s check reads only its own lock file, and the submodule does not come into CI (R21 spec; В20 in `.github`'s RUN.md).
- **`--omit=dev`.** An advisory on a tool that ships nowhere would hold up every merge (R48 canvas-api). Advisories on tools come with Dependabot's alerts, and `canvas` has them on: `vulnerability-alerts` in GitHub's API answers 204, 2026-10-21.

— *Rejected:*
- ESLint 10 with typescript-eslint and Prettier — for the reason above;
- the entry points `/element` and `/core` with no root — `app` would write an extra path, and registration on the package's import is the usual way of a web component. A single entry point was already rejected in R07;
- a bundler for the package — Vite, tsdown, esbuild: `tsc` is enough for a library, and the consumer's bundler will resolve the dependencies;
- the latest versions on the day of installation — Biome 2.6.0–2.6.2 came out hours before it, three releases in a row;
- `headless` by `CI`, as in `.github`'s probe — in a container with no display `just ci` would fail;
- a full `npm audit` in `ci-vuln` — for the reason above;
- `spec`'s license check from the submodule — CI has no submodule (R21 spec);
- a Dependabot group across several ecosystems for the pair of `playwright` and the image — GitHub's documentation does not say what then happens to the entry's other packages;
- `.ts` imports in `src/` with `rewriteRelativeImportExtensions` — the build's declarations would refer to `.ts` files, which the package does not have.

— *Revisit:*
- `target` and `lib` ES2022 — after T29 and T22, when the devices' browsers are known;
- the TypeScript 7 extension for the editor: the TypeScript built into VS Code is of another version, and the judge is `ci-lint`;
- the license check — when `spec` gives a shared one (В20 in `.github`'s RUN.md).

— *Consequence:*
- T09–T15 write code in `src/core/` and `src/element/`, and the tests `*.test.ts` beside it; the element's tests run in the project `browser`;
- T18 draws the synthetic samples with the DOM-free part; T19 chooses the page's bundler and names its licenses;
- T24 takes `lib/` through `npm pack`, and `release-files` writes in `version`;
- if the package's declarations begin to refer to rbush's types, `@types/rbush` moves to `dependencies`: otherwise for `app` they will be `any` or an error;
- `.github` — a line of the report: two additions in the entry `npm` and `headless` set explicitly.

— `package.json`, `package-lock.json`, `.npmrc`, `tsconfig*.json`, `biome.json`, `vitest.config.ts`, `justfile`, `src/`, `scripts/`, `.github/`; [architecture.md](architecture.md), sections 3.3, 3.4, 3.7 and 4; RUN.md, T08.

— *Amendment 2026-10-22:* the license check of its own lasts until T32. `spec` gave the recipes `licenses-allowed` and `licenses-check-repo` (R39 spec), and by the 2026-10-22 amendment to R39 spec moved into the recipe the bound `dev` and the builds for platforms — as they are built here. `ci-licenses` will move to the recipe, and the exception `lightningcss` (R14) to its file of exceptions, once the job `licenses` of `.github`'s wrapper takes the submodule `spec` (Д15 in `spec`'s RUN.md). Until then `scripts/licenses.ts` stays, and the item "Revisit" on the license check reads so. The CI files for T08's code were written by a session of `canvas`, as the 2026-10-21 amendment to R30 spec now bids. — R16; RUN.md, T32.

— *Amendment 2026-10-22:* the project `browser` runs in Chromium twice — with a pixel density of 1 and of 2. The second instance is the same Chromium with `deviceScaleFactor: 2` in Playwright's context: a density that the DevTools protocol sets in the middle of a test tells the test's frame nothing (R18). In `.gitignore` `/.vitest/` stands beside `__screenshots__/`: Vitest 5 puts the screenshots of failed tests there. — R18; `vitest.config.ts`, `.gitignore`.

— *Amendment 2026-10-22:* the licenses are checked by `spec`'s recipe — T32. `ci-licenses` is `just -f spec/justfile licenses-check-repo package-lock.json licenses.json` (R39 spec with the 2026-10-22 amendment to it). `scripts/licenses.ts` and its 17 tests are gone, and the item "Revisit" on the license check is closed.
- **What is `spec`'s:** the list of category A, the parsing of SPDX expressions and the rule of exceptions, at the submodule's tag. Since v0.2.18 an exception for a license off the list holds only a package the lock file marks `dev`, and it covers too the builds for platforms that the tool itself names in `optionalDependencies`, while they are `dev` and under the same license. This is the bound `scripts/licenses.ts` had. The list now follows `canvas`'s tag of `spec`, not a release of `.github`. The check no longer reads `ALLOWED_LICENSES`.
- **What is `canvas`'s:** the exceptions — `licenses.json` at the root. The name is recommended by `.github` and `spec/justfile`. The format is JSON by R39 spec: a package has `license` — what the lock file says — and `reason`, and the reason itself names the decision. There are no other fields, and a file of the wrong shape stops the check. There is one exception — `lightningcss` (R14).
- **CI:** the job "TypeScript" calls `.github`'s `typescript.yml` v0.1.8 by the SHA 0ab2799. Its job `licenses` takes the submodule `spec` — all of the caller's submodules, and `canvas` has one (the 2026-10-22 amendment to R19 .github). The reference is raised by the same change that moved `ci-licenses`. The other three jobs run without `spec/`, as before.
- **Checked** 2026-10-22, on `main` abd723a with T32's edits. The recipe with `licenses.json` answers "ok — 115 packages, 1 exceptions". Without the exception — 12 refusals, and if `lightningcss` is not `dev` — 12 too: itself and its 11 builds. A package under GPL-3.0-only is refused too, and so is an exception that has nothing to accept, and a file with the field `decision` stops the check with code 2. Each `ci-*` ran in a copy of the tree, through `env -i` — only `PATH`, the path to the browsers, a temporary `HOME` and `CI=true`, with no `ALLOWED_LICENSES`. `ci-lint`, `ci-test` and `ci-vuln` ran without `spec/`, `ci-licenses` with it. All four are green, and without `spec/` `ci-licenses` refuses and names `spec/justfile`.

*Why:* R39 spec — repositories take the list and the check of npm's lock file by `spec`'s recipes, and Д16 in `spec`'s RUN.md bids `canvas` move. The argument of "A license check of its own" above — CI has no submodule — is lifted: the job `licenses` of the wrapper v0.1.8 takes it. The "Rejected" on `spec`'s check from the submodule is history: the new facts are R39 spec and this release of `.github`. *Rejected:*
- keeping `scripts/licenses.ts` beside the recipe — the rule would again live in two copies, and that is exactly what R39 spec rejected;
- taking only the list from `spec`, `licenses-allowed`, and checking with a script of its own — the bound `dev` and the builds would stay in `canvas`'s copy;
- raising the reference to the wrapper later than the move — v0.1.5 has no `spec/` in the job `licenses`, and "TypeScript / licenses" would turn red. — R14; `justfile`, `licenses.json`, `.github/workflows/ci.yml`, CLAUDE.md, README.md; [architecture.md](architecture.md), sections 3.4 and 3.7; RUN.md, T32.

— *Amendment 2026-10-22:* Vite 8.3.4 is a direct development dependency, of the same version that already stood as Vitest's required peer (R20). It is the latest version released no later than three days before the installation: 8.3.4 came out on 2026-10-08, 8.3.5 on 2026-10-21. The tree of packages did not change, and in the lock file Vite and the 36 packages under it lost the mark `peer`.
- **What for** — the recipe `demo`: the page `demo/`, on which the author tries the element by hand, on Vite's development server. `tsc` still builds the package, and the "Rejected" on a bundler for the package is in force: the page is not built, and the module for the board is T24.
- **Checks** — Biome looks at `demo/**/*.ts`, `demo/main.ts` is in the element's program, and `demo/vite.config.ts` in Node's program. In Dependabot Vite goes in the group `vitest`.

— R20; `package.json`, `package-lock.json`, `justfile`, `biome.json`, `tsconfig.element.json`, `tsconfig.node.json`, `.github/dependabot.yml`; RUN.md, T34.

— *Amendment 2026-10-22:* the job "TypeScript" calls `.github`'s `typescript.yml` v0.1.10 by the SHA f3addb7 — T36. From this release only `CI` goes from the step's environment into the container, and the wrapper does not pass `ALLOWED_LICENSES`: so its contract was amended by Д6 in `.github`'s RUN.md (the 2026-10-22 amendment to R19 .github). The license check has not read the variable since T32, so the raise changes nothing for `canvas`'s recipes. It is recorded here, as the 2026-10-21 amendment to R30 spec bids.

*Why now:* `.github` closed Д6 and wrote to `canvas` about it (T29 in `.github`'s RUN.md). The header of the `justfile` and [architecture.md](architecture.md), section 3.4, spoke rightly of the variable in the container only while the reference was to v0.1.8, so the raise and their edit go in one change. *Rejected:* waiting for Dependabot's pull request. Whether it raises the references to `.github` is not yet checked (architecture 2.8 .github), and the pause of three days checks nothing here: only `canvas` calls `typescript.yml`, and the pull request with the raise checks the wrapper. — `.github/workflows/ci.yml`, `justfile`; [architecture.md](architecture.md), sections 3.4 and 4; RUN.md, T36.

— *Amendment 2026-10-22:* the other five references to `.github`'s shared workflows — `secrets.yml`, `dco.yml` and `documents.yml` in `ci.yml`, `codeql.yml` and `scorecard.yml` — are at v0.1.10 too, by the SHA f3addb7, by the author's decision. All six references are now at one release. Of the five workflows, only `codeql.yml` has changed since v0.1.0: it also takes the language `go` and the input `paths-ignore`, and its job names and permissions are as before. The input `languages: javascript-typescript` stays, `canvas` sets no `paths-ignore`, and the required checks of the ruleset `main` are the same. The raise of the references is recorded by the repository's own log (the 2026-10-21 amendment to R30 spec).

*Why:* architecture 3.3 .github bids taking the latest release, and since v0.1.0 the references have fallen ten releases behind. *Rejected:* waiting for Dependabot or for a task that will need a new release (the 2026-10-21 amendment to R30 spec). Whether Dependabot raises the references to `.github` is not yet checked (architecture 2.8 .github), and references at different releases would force reading each release separately. — `.github/workflows/ci.yml`, `codeql.yml`, `scorecard.yml`; [architecture.md](architecture.md), sections 3.7 and 4; RUN.md, E2.

— *Amendment 2026-11-01:* `dependencies` also hold `@altnovatrail/spec` 0.4.1, the types of the module format: declarations only, and the package's declarations refer to them. Its version is moved by a move to a tag of `spec`, together with the submodule, and Dependabot does not touch it (R73 spec). — R41.

— *Amendment 2026-11-01:* all six references to `.github`'s shared workflows are at v0.1.12, by the SHA 4225639 — T65 (R43). Between v0.1.10 and v0.1.12, of the six only `typescript.yml` changed: its job `coverage` sends the coverage report of `ci-test` to Codecov by OIDC, and the job "TypeScript" in `ci.yml` gives it `id-token: write`. `canvas` does not call `go.yml` and `release.yml`. The earlier jobs and the required checks of the ruleset `main` are the same, and the new job is the check "TypeScript / coverage", which the ruleset does not have: the merge is held by `codecov/patch` (`gh api …/compare`; architecture 3.3 .github). — `.github/workflows/ci.yml`, `codeql.yml`, `scorecard.yml`; R43.

— *Amendment 2026-11-02:* `ci-licenses` checks the signatures too. After `licenses-check-repo` it calls `spec`'s recipe `release-verify-npm package-lock.json`, and every package of `@altnovatrail` in the lock file must be the signed file of its release (R77 spec; R44). The recipe installs `spec/tools` from `spec`'s lock file and goes to Sigstore, the npm registry and GitHub, and when one of them does not answer, the package is refused. The pause of three days does not apply to `@altnovatrail/spec`: its version is set by the submodule's tag (R73 spec), the same recipe checks its signature, Dependabot does not touch it, and the package has no dependencies of its own. So `canvas` went to 0.6.2, released on 2026-11-01 — the author's answer in planning T67, by the recommendation. — `justfile`, `.github/workflows/ci.yml`, `.github/dependabot.yml`; R44.

— *Amendment 2026-11-02:* the package `@altnovatrail/spec` 0.6.5 is installed without the pause, like 0.6.2: its version is set by the tag (R45). `devDependencies` also hold `@iconify-json/material-symbols` 1.2.97 and `@iconify/utils` 3.1.7, and `scripts/` holds `icons.ts`, which writes the icons of the row's buttons and `NOTICE`: `ci-lint` checks them against the script, and `NOTICE` goes into the package's archive (R46). — R45, R46.

— *Amendment 2026-11-08:* `spec`'s second package is `@altnovatrail/contracts`, the code of the contracts and the test vectors of the device's and the runner's rules (R83 spec, R94 spec). It is in `devDependencies`, at the same exact version as the submodule `spec/` and `@altnovatrail/spec`: the tests take its vectors, and T17's sample file will take the contract's code. It is taken without the pause, like `@altnovatrail/spec` (R44, R45): the tag sets the version, and `release-verify-npm` checks the signature. Dependabot does not raise it. — R47.

— *Amendment 2026-11-08, T17:* `@bufbuild/protobuf` 2.16.0 is in `devDependencies`, at an exact version: with it the sample file's module `src/eval/` writes and reads the message `Sample` of the code of `@altnovatrail/contracts`, and the same package installs it. The module is outside the package: `tsconfig.build.json` does not build it, and the package `canvas` is still without these dependencies (R48). — R48.

— *Amendment 2026-11-08:* the Dependabot queue, pull requests #76–#82, is taken in one branch at the author's request. All seven references to `.github`'s shared workflows — `secrets.yml`, `dco.yml`, `documents.yml` and `typescript.yml` in `ci.yml`, `codeql.yml`, `scorecard.yml` and `release.yml` — are at v0.1.15, by the SHA 89d3cee: Dependabot raised five, and did not touch `secrets.yml` and `documents.yml`. Between v0.1.13 and v0.1.15, of the workflows only the shared `release.yml` changed: an optional input `previous-file`, which `canvas` does not set, and the check of a number npm has held — now by `time.unpublished.versions` too ([architecture.md](architecture.md), section 4). `devDependencies` hold Biome 2.6.5 and the group `vitest`: `vitest`, `@vitest/browser-playwright` and `@vitest/coverage-v8` 5.1.0. The lock file was built by `npm install --before=2026-11-05T00:00:00Z`, by this entry's pause: without the date npm would have taken `ast-v8-to-istanbul` 1.0.8, released the same day. Transitively raised were `@babel/parser` and `@babel/helper-string-parser` 7.29.13, `@types/estree` 1.0.10, `magic-string` 1.4.5, `tinybench` 6.2.3 and `ws` 8.22.1 — all under MIT and none newer than 2026-11-04. — [architecture.md](architecture.md), sections 3.7 and 4; `.github/workflows/`; `package.json`, `package-lock.json`.

— *Amendment 2026-11-10 (T88):* **README's section Install names a consumer's version of `@altnovatrail/spec` by the tag of the consumer's own submodule `spec`, not by `canvas`'s `dependencies`: the contract's types are structural, and `tsc` catches a mismatch of shape at the seam (Д186 in `spec`'s RUN.md; R73 spec; R67).**

— *Amendment 2026-11-12:* the Dependabot queue, pull requests #99–#101, is taken in one branch at the author's request, with no task. `devDependencies` hold Biome 2.6.6, `@iconify-json/material-symbols` 1.2.98 and Playwright 1.65.0. The lock file was built by `npm install --before=2026-11-09T00:00:00Z`, by this entry's pause: Biome 2.6.7 came out on 2026-11-11, Vite 8.3.7 and 8.3.8 on 2026-11-09 and 2026-11-11, so the group `vitest` stays on Vite 8.3.6. Transitively only `playwright-core` 1.65.0 was raised, with the same license, Apache-2.0. `just icons` wrote the icons and `NOTICE` by the set 1.2.98: the row's icons are the same, only the set's version in their header changed (R46). `@bufbuild/protobuf` 2.17.0, #100, is not taken: `@altnovatrail/contracts` 0.15.1 names it at an exact version, 2.16.0, and the lock file would hold two copies of it, and the sample file's module writes and reads the contracts package's messages with the one that package installs (R48). A move to a tag of `spec` moves it, together with `@altnovatrail/contracts`, and Dependabot no longer raises it. The browser under Playwright 1.65.0 is the 2026-11-12 amendment to R13. — [architecture.md](architecture.md), section 3.7; `.github/dependabot.yml`; `package.json`, `package-lock.json`, `NOTICE`, `src/element/icons.ts`.

— *Amendment 2026-11-12 (T110):* **`@bufbuild/protobuf` in `devDependencies` is 2.17.0, at an exact version: `@altnovatrail/contracts` 0.16.3 pins it so (sources 6.10), and with the earlier 2.16.0 the lock file would get two copies. Its version goes with the tag of `spec`, and Dependabot does not touch it (`.github/dependabot.yml`).** — R55, R77; RUN.md, T110.

**R13. `canvas`'s container differs from `spec`'s container by what the code added. In the stage `toolchain` — Chrome Headless Shell 1248 from the Playwright image v1.64.1, pinned by tag and digest, and its system libraries from the snapshot 20261021T000000Z of the Ubuntu archive. In the stage `devcontainer` — the Biome extension 3.7.1. Chrome Headless Shell is a build of Google Chrome for Testing under Google's free terms and a named exception for a tool that ships nowhere.**
- **The browser.** `COPY --from=mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5…` takes only `/ms-playwright/chromium_headless_shell-1248` — the browser Playwright runs in headless mode. The revision is an `ARG` by `browsers.json` of playwright-core 1.64.1, and `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` lies outside `HOME`. Firefox, WebKit, FFmpeg and the full Chromium with `WidevineCdm` are not copied: the tests do not run them. The folder is 273 MB.
- **The libraries** — 21 packages of Chromium from Playwright v1.64.1's `nativeDeps.ts` for Ubuntu 24.04 and `libfontconfig1`, `libfreetype6`, `fonts-liberation`, as in `.github`'s probe. They are installed by `apt-get update --snapshot` and `apt-get install --snapshot` with `ARG UBUNTU_SNAPSHOT=20261021T000000Z`.
  - So each package has an exact version — the one the archive had on that date —, and `apt` checks the archive's signature itself. This is the recommendation of В21 in `.github`'s RUN.md.
  - In the container, on empty lists, the snapshot worked: 61 new packages, with no conflicts. The image built by the Dockerfile.
- **Integrity** — by the rules: the image is pinned by tag and digest (RULES.md, Hard rules), and Playwright publishes no sums of its downloads (R19 .github).
- **How it is raised.**
  - The image's tag is the version of the package `playwright` in the lock file, and the revision is the one `browsers.json` of that version names. Otherwise Playwright finds no browser, and `ci-test` fails: "Executable doesn't exist at /ms-playwright/chromium_headless_shell-1248/…".
  - Dependabot reads only the `FROM` lines in the Dockerfile, and the image stands in `COPY --from`. So the tag, the digest and the revision are raised by hand — in the Dependabot pull request that raises `playwright`.
  - The same edit raises the snapshot. It is also raised if the build fails after a new digest of the base image.
- **The browser's terms.**
  - `ABOUT` in the folder: "Google Chrome … Copyright 2026 Google LLC. All rights reserved … See the Terms of Service at chrome://terms". The binary itself calls itself "Google Chrome for Testing 156.0.8078.4".
  - Playwright v1.64.1 downloads it from `cdn.playwright.dev/builds/cft/…`: this is a build of Chrome for Testing, not Chromium from source, though Playwright's `docs/src/browsers.md` writes of "open source Chromium builds". For arm64 the source is the same, `linux-arm64/chrome-headless-shell-linux-arm64.zip`, but that binary was not opened here: the image was built only on amd64.
  - Chrome's terms are the Google Terms of Service and Chrome's Additional Terms of Service: "These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS" and "Most source code for Chrome is available free of charge under open source software license agreements". The list of these licenses is `LICENSE.headless_shell` in the folder, and Chromium's BSD-3-Clause comes first in it.
  - The browser ships nowhere and puts nothing of its own into what ships: it only runs the tests. By the author's decision this is a named exception — free terms for a CI tool (RULES.md, Licenses). How to read the rule is for `spec` to decide — В27 «в реестр spec».
- **The Biome extension** 3.7.1 — MIT and Apache-2.0. It is the latest stable version released no later than three days before: 3.8.0 came out on 2026-10-21. The extension runs Biome from the project's `node_modules`, and Biome is the default TypeScript formatter.
- **The cost.** Each pull request builds the stage `toolchain` five times — in the four jobs "TypeScript" and in Documents —, and each build pulls the Playwright image. All required checks now depend both on MCR and on `snapshot.ubuntu.com`. On T08's pull request, #18, the step "Toolchain image" took 57–67 seconds in each of the five jobs. Without the browser the same step takes 18 seconds: Documents on `main` 7756744. In `.github`'s probe the stage with the browsers built in 46–56 seconds against 21 without them ([architecture.md](architecture.md), section 4). The recipes themselves ran 1–6 seconds.
- **The Dockerfile** is no longer the byte-for-byte output of `spec`'s `editDevcontainer`: the header and the stage `toolchain` are its own. The reference to `spec`'s decision on sums became `(R34 spec)`: in the same file new comments cite `canvas`'s own R13.

— *Why:* the author's decisions in planning T08, 2026-10-21: the browser — Chrome Headless Shell, as a named exception; the rest — «да» to the plan with recommendations. The probes and the build — RUN.md, T08; the sources — [architecture.md](architecture.md), section 4.
- The browser's path is the one `.github`'s probe went through and the contract recommends (R19 .github), but only with the part of the image that runs.
- The snapshot gives each package an exact version without a change of the base image, by one `ARG` line, as for Node and just (В21 in `.github`'s RUN.md).
- Chrome Headless Shell is the engine of Chrome on Android and the desktop. Playwright's builds under open licenses require more: Firefox under MPL-2.0 — 25 system packages, WebKit under LGPL-2.1 and BSD-2-Clause — 52, and nobody has tried their path.

— *Rejected:*
- the whole folder `/ms-playwright`, as in the probe — Firefox, WebKit, FFmpeg and the full Chromium with the proprietary `WidevineCdm` would lie idle, and the terms of each would have to be named;
- the image in a `FROM` line, visible to Dependabot — it would come in a pull request of its own, red without its pair `playwright`, and with no pause `cooldown`: MCR's images have no release date (R49 canvas-api);
- a sum of the browser computed by `canvas` itself — a departure from R34 spec (R19 .github);
- `apt` without versions, as in the probe — Hard rules require exact versions;
- the stage `toolchain` from the Playwright image — it has the user `pwuser` and a base image of its own (В21 in `.github`'s RUN.md);
- WebKit or Firefox instead of Chromium — the author's answer; they will be returned to if `spec` does not accept the reading of В27;
- `--shm-size` or `--ipc=host` in `devcontainer.json` — Playwright itself runs Chromium with `--disable-dev-shm-usage`, and the tests in the container pass without them.

— *Revisit:*
- if `spec` reads the rule otherwise (В27);
- when WebKit is needed — the engine of Safari on the iPad, the main device with a pen (T09, T22);
- if the stage's build in a pull request turns out noticeably dearer than in `.github`'s probe.

— *Consequence:*
- the next move to a tag of `spec` carries the changes of `editDevcontainer` into the Dockerfile by hand and keeps these; to В11 — «Дополнено»;
- Д2 is closed: the image is built, the sums checked during the build;
- `.github` — a line of the report: the outcome of the snapshot for its В21, the cost of five builds, only Chrome Headless Shell and its terms;
- В27 and В28 «в реестр spec».

— `.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`; CLAUDE.md, Environment; [architecture.md](architecture.md), sections 3.4, 3.7 and 4; RUN.md, T08, tables 3 and 4.

— *Amendment 2026-10-21:* the item "The cost" is more exact so: not all the required checks depend on MCR and `snapshot.ubuntu.com`, but five — those that build the stage `toolchain`: the four "TypeScript / …" and Documents. Secrets, DCO, CodeQL and SonarCloud do not build it. After the merge of pull request #18 the four "TypeScript / …" went into the ruleset `main` beside Documents, so without MCR and the snapshot the merge does not pass. — RUN.md, T08.

— *Amendment 2026-10-22:* `spec` recorded the rule by which the browser was taken by the 2026-10-22 amendment to R12 spec and an edit of RULES.md, Licenses — in answer to В27. The rule accepts free terms, for open source or for everyone, within two bounds, and Chrome Headless Shell is the first such tool. `canvas` keeps them: NovaTrail does not distribute the browser — the image of the stage `toolchain` with it is not published —, and the package is built, run and deployed without it: the browser only runs the tests. Google's terms for CI are accepted by the author as the organization's representative, and by a contributor who runs the tests in their own container, themselves ("Consequence" of the same amendment). The item "Revisit" on the reading of the rule is closed. The snapshot of the Ubuntu archive for the browser's libraries is now a rule of every repository, R40 spec. — R16.

— *Amendment 2026-10-22:* in "Revisit", WebKit will be needed by T35 and T22, not T09: input on tablets is split off from T09 into T35 (R18). — R18; RUN.md, T35.

— *Amendment 2026-10-26:* T35 did without WebKit (R29). Its tests run in Chromium, with real touches through the DevTools protocol. Playwright's WebKit is built from WebKit's branch main, and Playwright "doesn't work with the branded version of Safari since it relies on patches": it will not show the behavior of Safari on iPadOS — WebKit's bug 269535. WebKit in "Revisit" stays with T22. — R29; RUN.md, T35, T22.

— *Amendment 2026-11-02:* the stage with the browser and the Biome extension now come from the kind `typescript` of `spec`'s template (R79 spec). The Dockerfile and `devcontainer.json` are again the recipe's output: checked by the recipe `new-repo-draft` at v0.6.5, byte for byte, except for the base image, which Dependabot raises — `canvas` has 3.0.12, the template 3.0.10. The stage's lines are the same as above, and the comments refer to R79 spec and R40 spec. The Biome extension is 3.8.1. `spec` raises the Playwright image, the revision and the snapshot in the template, and `canvas` gets them by its move. If a new `playwright` is needed sooner, all three are raised here, in the package's pull request, and a row «в реестр spec» asks the template for the same (R79 spec). The exception for Chrome Headless Shell is now named by R79 spec too. — R45; RUN.md, T73 in [plan/E8.md](plan/E8.md).

— *Amendment 2026-11-08:* the `toolchain` stage of the template also carries buf 1.75.0, with its sums for both architectures: with it `spec`'s recipe `sample-check` checks the sample files by the image of the contracts in the submodule (R83 spec, R93 spec). The Dockerfile is again the output of the template's recipe, byte for byte. — R47.

— *Amendment 2026-11-12:* the browser is Chrome Headless Shell 1254 from Playwright's image v1.65.0, `mcr.microsoft.com/playwright:v1.65.0-noble@sha256:9beb546099e11f52d62e505537914870e01a67e0e6b00ae41da4775324e73dbe`, with amd64 and arm64. It was raised by the pull request that raised the package `playwright` to 1.65.0 (the 2026-11-12 amendment to R12) — here first, as R79 spec allows: `spec`'s template v0.15.1 and `spec`'s `main` on 2026-11-12 are still on v1.64.1 and revision 1248. The revision is from `browsers.json` of `playwright-core` 1.65.0, and the digest is the tag's index in MCR, read 2026-11-12. The libraries are the same: the entry `ubuntu24.04-x64` for `chromium` in `playwright-core` 1.65.0 has the same 21 packages as 1.64.1, and the archive's snapshot is the former one. Until the move to a tag of `spec` whose template takes v1.65.0, the Dockerfile differs from the output of its recipe by these two lines — В79 «в реестр spec». — `.devcontainer/Dockerfile`; [architecture.md](architecture.md), section 3.7; RUN.md, table 3.

— *Amendment 2026-11-12 (T110):* **Playwright's image v1.65.0 and revision 1254 are now also in the kind `typescript` of `spec`'s template v0.16.3 — the answer to В79, the 2026-11-11 amendment to R79 spec —, and `.devcontainer/` is again the recipe's output: `just new-repo-draft canvas typescript 3.2 v0.16.3` in a temporary clone of `spec` gave it byte for byte (sources 6.10). The two lines of difference that the 2026-11-12 amendment speaks of are gone.** — R77; RUN.md, T110.

**R14. `lightningcss` under MPL-2.0 is a named exception of the license check, together with its builds for the platforms, as long as the lock file marks them `dev`.**
- It is Vite's CSS minifier: Vite 8 depends on it directly, and Vite itself comes as a required peer of Vitest 5.0.5. The lock file has `lightningcss` 1.33.0 and 11 builds that it names itself in `optionalDependencies`, all under MPL-2.0 and `dev`.
- It puts nothing of its own into what ships: `tsc` builds the package `canvas`, and Vite runs only inside Vitest. MPL-2.0 is OSI-approved and binds only the files of `lightningcss` itself.
- The mechanism is R12: by name and license, only for `dev`, and with the builds that `lightningcss` itself names — if they are `dev` and under MPL-2.0. The exception does not cover a package of a similar name that it does not name, and an exception that is not needed is an error.

— *Why:* an exception is by name only, for a tool that does not ship, and each comes with its own decision (RULES.md, Licenses; R19 .github), as R48 canvas-api. Without it "TypeScript / licenses" is red: 12 packages off the list, as in the probe of `.github`, and as many here.

— *Rejected:*
- Vitest without Vite — it has the required peer `vite`;
- the builds by a pattern of the name, as in the probe of `.github` — the pattern would also cover someone else's package of a similar name;
- all 12 names as a list — each new build for a platform would need an edit of the exception, and `lightningcss` names them itself anyway.

— *Revisit* — in T19: if Vite builds the samples page that ships, `lightningcss` starts minifying its CSS. Even then it puts in no code of its own, but the decision is read again.

— `scripts/licenses.ts`; R12; RUN.md, T08, T19.

— *Amendment 2026-10-22:* the exception lies in `licenses.json`, the file of exceptions of `spec`'s recipe `licenses-check-repo` (T32; the amendment to R12): `"lightningcss": {"license": "MPL-2.0", "reason": …}`, and the reason names R14. The mechanism recorded above — only `dev`, and only the builds that `lightningcss` itself names, as long as they are `dev` and under MPL-2.0 — is now held by the recipe: `spec` moved it there by the 2026-10-22 amendment to R39 spec. The decision does not change, and what is "Rejected" above stands: the recipe too takes neither a pattern of the name nor a list of 12 names. "Revisit in T19" stays. — `licenses.json`; R12; RUN.md, T32.

— *Amendment 2026-10-22:* Vite is now a direct development dependency and runs not only inside Vitest: the development server `just demo` runs on it (R20). `lightningcss` does nothing there either: the development server's CSS is processed by postcss, and Vite calls `lightningcss` only for minifying in a build, which the page does not have. The page is not in the package, so the decision does not change: the exception is still for `dev`, and the check answers "ok — 115 packages, 1 exceptions". — R20; RUN.md, T34.

**R15. `samples/` is closed to agents: a rule in CLAUDE.md, `/samples/` in `.gitignore` and the `deny` rules of Claude Code — on reading and writing the folder and on shell commands that name it as a word of its own or as part of a path.**
- These are the three bans of R05 tutor, which its T11 put in place before the first sample (`tutor`, merged f501412), with one difference. The Bash rule of `tutor` is `*samples*`, and those of `canvas` are patterns of the folder's name, not of the word. The name is closed:
  - at the start of a command — `samples`, `samples *`, `samples/*`;
  - after a space or `/` — `* samples`, `* samples *`, `* samples/*` and the same with `/`;
  - in quotes — `*"samples"*`, `*"samples/*` and the same with `'`;
  - after `=` — `*=samples`, `*=samples *`, `*=samples/*`;
  - after `<` and `>` — `*<samples*`, `*>samples*`.
- `samples/` holds the samples with handwriting, which do not get into the repository: the file the author saves while trying the samples page on a device (T22), and everything with handwriting in it. The synthetic samples of T18 are not there.

— *Why:* T08 puts the bans in place before the first sample, as R05 tutor did (RUN.md, T08). П-12 recommends not letting development agents near eval samples outside the repositories (R05 tutor).
- The Bash rule is narrower than that of `tutor`: in `canvas` the word stands in its own names — `samples-page_v<X.Y.Z>.html` and `synthetic-samples_v<X.Y.Z>.<…>` (R08). The patterns were checked on 16 commands with the folder — among them a path at the start of the command, in quotes, after `=` and in a redirection, which the review of T08 found — and on 8 commands with these names and with recipes.
- `*` in a Bash rule matches any text, and `/samples` in the project's settings counts from the working folder (Claude Code's documentation; [architecture.md](architecture.md), section 4). The rule took effect at once: a command with the folder was refused in this session.

— *Rejected:*
- `Bash(*samples*)`, as in `tutor` — it would close `samples-page_v…` and `synthetic-samples_v…`;
- only the rule in CLAUDE.md — Claude Code would hold it by memory, not by a setting.

— *Consequence:*
- nobody names a folder of the code `samples`, at any depth: `*/samples/*` would close it too. T18 names the folder of the synthetic samples otherwise;
- the rules are not an access boundary: a Bash rule, by Claude Code's documentation, "isn't a security boundary". So whatever needs the samples is run by the author.

— CLAUDE.md, `samples/`; `.gitignore`; `.claude/settings.json`; RUN.md, T08, T18, T22.

— *Amendment 2026-10-26:* `spec`'s documents check, from v0.2.35, reads only the files that git tracks or that the repository's `.gitignore` files do not keep out of git, and does not go into `samples/` (the 2026-10-26 amendment to R32 spec; R30). Before that it walked the whole tree but for `.git`, `node_modules` and `spec/`. Other walks of the tree — `grep -r`, `find .` — still go there, and the rule of CLAUDE.md on them stands. — R30.

## `spec` tag v0.2.18

**R16. `canvas` is on `spec` v0.2.18: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it. `spec` has recorded the rows «в реестр spec» В6–В28, and they are closed: the tasks and the documents name its numbers instead of them.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.14 v0.2.18`, read 2026-10-22). The releases v0.2.15–v0.2.18 recorded the answers to the rows В6–В28 of `canvas` — by their recommendations, and В27 with two bounds (Д13, Д16 and Д17 in RUN.md of `spec`) —, the answers to the rows В17–В22 of `.github` (Д15 there) and an amendment about the files of CI (Д14 there). Where each row of `canvas` went, the opening of table 3 of RUN.md names. What changes the work of `canvas`:
  - **the 2026-10-21 amendment to R25 spec** (В6, В25). As long as `modules` has no first content, the CI of `canvas` puts into the page's build the file of open views of the measurement's tasks from a release of `tutor` — by exact tag and sum, without keys, solutions and traps. With the first content of `modules` the source is again its release, through the CLI of `module-kit`. `tutor` puts out the file by a task of its own, when it moves to a tag with the amendment. There too: the build opened from a file is checked by the probe of T29, not by T04. Hence the source and the dependencies of T21 and the table of sources in [architecture.md](architecture.md), section 3.5;
  - **R36 spec** (В15) — the web component `<novatrail-canvas>`, one for every canvas kind; the data types come from the releases of `spec`; «прослушать» is voiced by `app` on the event `speak`, and `app` holds the context of the submission. This is R07, and Т-21 is closed;
  - **R37 spec** (В17, В18) — npm, `@altnovatrail/canvas`, the same file that is signed in the GitHub release, by a step of the shared `release.yml` through trusted publishing. This is R08, and Т-26 is closed. `.github` writes the step by an amendment to R18 .github, and T24 waits for it;
  - **R38 spec** (В7) — the CI of `tutor` takes the synthetic samples from a release of `canvas` by tag and sum. The release of `tutor` with the file of the measurement's tasks comes out first, and the synthetic samples of `canvas` come out in the same release as the page's build;
  - **the 2026-10-22 amendment to R12 spec and RULES.md, Licenses** (В27): free terms — for open source or for everyone — the rule accepts if NovaTrail does not distribute the tool and the platform can be built, run and deployed without it. Chrome Headless Shell of R13 is the first such tool; the amendment to R13 is higher up the log;
  - the other answers are questions and tasks of `spec` that `canvas` waits for, as it waited for the rows: Т-31 (В8), Т-32 (В13), П-18 (В21), the eval protocol in epic E3 of RUN.md of `spec` (В12, В20), «Вход» T28 and T35 there (В14, В16), the additions to Т-27 and Т-30 (В19, В23), epic E4 (В24), architecture 3.4 spec and epic E5 (В22), concepts 15 spec (В9), repositories 6 spec, item 5 (В10), Д12 (В26) and Д17 (В28 and the addition to В11).
- **Rules for all repositories** that `canvas` gets with the same tag:
  - the 2026-10-21 amendment to R30 spec: what code adds to the calling files of CI is written by the session of the repository itself, and the checks in the ruleset are set by the author, or by the executor with the author's confirmation. T08 did just that, and for `canvas` the risk Д14 is lifted;
  - R40 spec and Hard rules: an `apt` package comes from a snapshot of the Ubuntu archive, with an `ARG` beside the list, and the snapshot is raised by hand. R13 already sets it so, and R40 spec quotes its build in CI;
  - R39 spec with the 2026-10-22 amendment: the list of licenses and the check of npm's lock file are `spec`'s recipes `licenses-allowed` and `licenses-check-repo`, with the bound `dev` and the builds for platforms, as in the check of `canvas` (R12, R14). `canvas` moves to them in T32: the wrapper of `.github` v0.1.5 runs the job `licenses` without the submodule `spec`, and the recipe cannot be found in CI until `.github` puts out a wrapper with it (Д15 in RUN.md of `spec`). The amendment to R12 is higher up the log;
  - the 2026-10-21 amendment to R31 spec: the runner calls the release recipes of another repository by the script `spec/tools/toolchain/toolchain.sh` from its submodule, at its tag. This is for T24;
  - the 2026-10-21 amendment to R32 spec: `.github` and hyphenated names are a citation's suffix wherever a word boundary follows them. The wordings of `canvas` written around the former rule stay correct.
- **Devcontainer.** The `.devcontainer/` of `spec` did not change between the tags. The recipe `editDevcontainer` now appends the suffix `spec` to each decision that the copy's Dockerfile cites (Д15 in RUN.md of `spec`), and the template names the browser for the tests a decision of the repository itself, as R13 does (Д17 there). In the Dockerfile of `canvas` the only such reference is already `(R34 spec)`, and R12 and R13 in the comments of `.devcontainer/` are its own, so there is nothing to carry over (R13, "Consequence").
- **What is changed here:**
  - `spec/` is at v0.2.18, commit 04ab0d2; the tag is in README.md, CLAUDE.md and at the top of RUN.md. CLAUDE.md also names the source of the tasks for the page's build, by the amendment to R25 spec, and E1 is in the archive, by the author's answer;
  - RUN.md: table 3 — the rows В6–В28 are removed, and its opening names where each went; the description of E2 — «Результат», «Основа», «Нужно», «Не входит», «Риски» and the order of the tasks; T11–T18, T21, T24, T25 and T29 name the numbers of `spec`; in table 1 — T31 and T32, and T16, T21 and T24 depend on T31; in table 4 — Д4: the source of the measurement's tasks is temporary, and the plan has no task yet for the move to `modules`;
  - [architecture.md](architecture.md): sections 1, 2.3, 2.4 and 3.1–3.7 — the numbers of `spec` instead of rows of table 3; 3.5 — the table of the sources of tasks; 3.4 and 3.7 — R39 and R40 spec;
  - the amendments to R12 and R13.

  The entries of history name the rows as they were: the body of T08, «Решено автором» of E2, "What is known" in [architecture.md](architecture.md), section 2, and the entries of this log. The numbers of the rows are not reused.

— *Why now:* the author's instruction of 2026-10-22 — move `canvas` to `spec` v0.2.18 and begin planning T29. The rows «в реестр spec» hung open, and the sessions of `canvas` would plan without knowing the answers (Д13, Д16 in RUN.md of `spec`). T29 reads R25 spec, and the amendment to it names the probe of T29. v0.2.18 is the latest release of `spec` on 2026-10-22 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.18 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 04ab0d2.

— *Rejected:*
- staying on v0.2.14 until T16: the rows would hang, and T21 and T24 would wait for the move, though their answers were already out;
- moving to the license recipe in this same task: the job `licenses` of the wrapper v0.1.5 runs without `spec/`, and "TypeScript / licenses" would turn red on every pull request;
- leaving the rows in table 3 with the mark «записано»: a row «в реестр spec» goes once the question is recorded in `spec` (RUN.md, «Как устроен план: эпики»).

— *Consequence:* T32 waits for `.github` vX.Y.Z — «Нужно» of E2 in RUN.md, and the move of the source of tasks to `modules` is Д4. No rows «в реестр spec» are left in table 3; the next number is В29. Each move to a tag still carries the edits of `editDevcontainer` into the Dockerfile by hand (Д17 in RUN.md of `spec`; R13). — RUN.md, T31, T32, tables 1 and 3, E2; CLAUDE.md; README.md; [architecture.md](architecture.md), sections 1, 2, 3.1–3.7.

## E2 for the MVP

**R17. E2 is replanned for the MVP: first the handwriting sheet as the element `<novatrail-canvas>`, which the check board of `tutor` can take — input, undo of a stroke, clearing and the PNG of the work. The rest of E2 is deferred until the author decides by the board's data.**
- **What is built now** — T09, T33 and T34: input by pen, finger and mouse (T09), undo of a stroke and clearing (T33), the element with the PNG of the work and a trial consumer that does what the board does (T34). T32 — the license check by the recipe of `spec` — goes when the wrapper of `.github` comes out, and does not hold up the MVP.
- **What is deferred** — `[?]`, with the reason and the time in the body of each task:
  - T10–T15 — the eraser and the writing history, the layers and the grid, the groups, the crop by A3, the marks and the full interface: the MVP does not need them. Return — when the author decides what to build after the MVP; T10 and T15 then complete T33 and T34;
  - T16–T22, T24, T25 and T29 — the sample file, the synthetic samples, the samples page and everything for it, the release and the handover to the measurement: the big measurement is deferred (R19 tutor; В20 tutor). Return — when the author decides by the board's data, and T24 also when the board wants the element.

  What is deferred is the execution, not the decisions: R05–R11 stay in force and wait for their tasks. For the MVP only R06 — the picture — and R07 — the interface — got amendments.
- **The picture for the MVP** is the PNG of the work, as the board has it, not the crop by A3 (R06). The crop is scaled by the median height of the stroke groups, and the MVP has no groups (T12). The board needs no crop: the PNG of its whole sheet goes to the model. Which sheet, at what scale and by what the PNG is drawn, the planning of T34 decides; the crop by A3 comes back with T12 and T13.
- **The interface for the MVP** is a part of R07: the methods of undo, clearing and the PNG, and the event of change. The full interface — the properties `task`, `media`, `history` and `marks`, the event `historychange` and `exportWork()` — T15 completes.
- **The board and the release.** Whether the board takes the element, the author decides. Then — a release with a built JS module: the package has no bundler of its own (R12), and a program in Go embeds the board's page (R19 tutor). T24 is revisited then.

— *Why:* the author's decisions of 2026-10-22. The message of `tutor` about the check board quoted his words: «на этапе MVP мне всего лишь нужно чтобы ты на канве показывал 5 статичных задач. Я сам буду их решать. Иногда специально ошибаться или писать неразборчиво. ИИ будет пытаться понять что я написал и выдавать свою оценку — решил правильно или с ошибкой. Далее я жму кнопку ИИ был прав или нет. Всё. Никаких проверок с твоей стороны не нужно вообще» (R19 tutor). In the planning of T29 the author answered «Перепланировать E2 под MVP»; the sheet «как у доски»; the deferred tasks «отложена», with their bodies; E2 ends with the element and a trial consumer. The last three answers follow the executor's recommendation.
- The board of `tutor` needs nothing from `canvas` (R19 tutor). And the big measurement, for which E2 built the samples page, is deferred together with the tasks of `tutor` that `canvas` waited for: the file of the measurement's tasks (T35 and T37 tutor), the CI that reads the synthetic samples (T32 tutor) and the recording page (T13 tutor).
- The sheet is what `app` takes from `canvas` first, and the board too, if the author so decides. So it is not deferred.

— *Rejected:*
- keeping E2 as it is: the samples page, the synthetic samples and the build from a file would be built for a measurement that does not exist yet;
- deferring the measurement's tasks without replanning the epic: E2 would have no result left that is needed now;
- the eraser and the grid, or the crop by A3, in the MVP: the board needs none of them, the crop also needs the groups, and the epic would take longer;
- the measurement's tasks as a separate epic for later: their bodies would leave RUN.md, and on their return they would be written anew;
- a release for the board in E2: the author has not yet decided whether the board takes the element.

— *Consequence:*
- RUN.md: in table 1 — T33 and T34, and the deferred tasks are `[?]`; «Результат», «Нужно», «Риски» and the order of E2 are for the MVP; T29 keeps what was decided and found in its planning;
- «в реестр spec» — two rows. В29: repositories 6 spec, item 5, puts the sheet and the samples page as the first code of `canvas`, and the page now waits for the big measurement; to be recorded together with В20 tutor. В30: Safari's downloads on an iPad may land in iCloud Drive, and then the sample file, a child's too, goes to Apple's cloud — for П-10 and П-12;
- the amendments to R02, R06 and R07.

— RUN.md: the opening, E2, table 1, table 3, T10–T25, T29, T33, T34; [architecture.md](architecture.md), sections 1, 2.4, 3.6 and 4; README.md.

— *Amendment 2026-10-22:* in the planning of T09, T35 was split out of it — input on tablets: the palm, pen mode, scrolling with two fingers and several touches at once. It is deferred until tablets, not until the decision by the board's data, and goes before T22 (R18). Beyond R06 and R07, R05 also got amendments for the MVP — palm rejection is now T35 — and R06 a second time: the path of scrolling. — R18; RUN.md, T09, T35.

— *Amendment 2026-10-22:* which sheet, at what scale and by what the PNG is drawn, T34 decided (R20): it is the whole sheet 1000 × 1400, one pixel per unit, with an even line on white, and the browser's drawing surface draws it. The method is `exportPNG()`, the event of change is `workchange`. — R20; RUN.md, T34.

— *Amendment 2026-10-22:* the board of `tutor` does not take the element — the author's answer «нет» to В31 of RUN.md. It stays on its own sheet 1000 × 600, and `tutor` records this by the 2026-10-22 amendment to R19 tutor. The item "The board and the release" is decided: there is no release for the board, and T24 returns only with the big measurement or by a new decision of the author. E2 for the MVP ended with T34, and it came out as its risk «доска может так и не взять элемент» assumed: the sheet is ready for `app` and the samples page. A return to the board — only by a new decision of the author. — R20; RUN.md, E2, table 3.

— *Amendment 2026-10-22:* the deferred tasks leave table 1 — the author's decision after T36. All the tasks of E2 were done or deferred, and table 1 would hold only deferred ones.
- **Archive.** The done tasks of E2 — T08, T31, T32, T09, T33, T34 and T36 — and the canceled T23 moved to [docs/plan/E2.md](plan/E2.md), together with the description of the epic as of 2026-10-22, without waiting for its end. The bodies of the deferred tasks went there too, word for word.
- **Epics.** The deferred tasks became epics of table 2, after E3. E4 is the sheet for the product: T10–T15 and T35. E5 is the samples page and the big measurement: T16–T22, T24, T25 and T29. E5 goes after E4: the sample file needs the eraser and the crop, the build needs the interface, the devices need input on tablets. An epic that is taken returns its tasks to table 1 with the same numbers. A task's body moves from the archive back into RUN.md, and in the archive a line stays in its place, about where and when it went. When to return is as in "What is deferred" and in the amendment about T35: T35 also waits for tablets and goes before T22 (R18), and E5 also waits for the decision on the big measurement.
- **Numbers.** E4 and E5 here and below are epics of `canvas`. E4 and E5 without a suffix in R10, R11 and R16 are epics of RUN.md of `spec`: «Приватность до первого ребёнка» and «Виджеты и сторонние авторы». R11 says so by an amendment of its own too: only the epic of `spec` opens a child's session.
- **E2** is now called «Лист для рукописи»: the samples page went to E5. The epic ends with the demo of the sheet, T37: the author tries the element by hand and takes the measurements that the page for trials shows.

*Why:* the MVP is done, and the board did not take the element (В31). The tasks that wait for the author's decision are work for later epics, not for the current one. The item "Rejected" about the measurement's tasks as a separate epic is history: its argument is withdrawn. The bodies are not written anew: they lie in the archive and come back with the tasks. *Rejected:*
- keeping the deferred tasks in table 1 — the current epic would consist of tasks that nobody runs;
- one epic for everything deferred — the sheet for the product and the samples page wait for different decisions: E5 also waits for the big measurement;
- writing the tasks of E4 and E5 anew when they are planned — what was decided and found in planning T29 and others would have to be found again. — RUN.md, E2, table 2, T37; docs/plan/E2.md.

— *Amendment 2026-10-25:* epic E3 is removed (R21), and E4 and E5 go after E2. "After E3" in the item "Epics" of the amendment above reads so. — R21; RUN.md, table 2.

— *Amendment 2026-10-25:* the author took E4, and what to build after the MVP is decided. The tasks of E4 — T10–T15 and T35 — returned to table 1 of RUN.md with the same numbers, and their bodies — from the archive of E2 into RUN.md; in the archive, in their place, is a line about where and when they went. In the bodies of T10–T15 the item «Отложена» became the item «Возвращена», and T15 names one canvas kind (R21). T35 still waits for tablets (R18), and E5 for E4 and for the author's decision on the big measurement. — RUN.md, E4, tables 1 and 2; docs/plan/E2.md.

— *Amendment 2026-10-26:* the MVP's interface is no more (R27): `exportPNG()` and `workchange` are removed, and in their place are the product's `exportWork()` and `historychange`. The board did not take the element (В31), and the package had not come out. — R27; RUN.md, T15.

— *Amendment 2026-10-26:* В29 and В30 are closed by the move to `spec` v0.2.35 (R30):
- В29 — by the 2026-10-22 amendment to R43 spec and in repositories 6 spec, item 5: the sheet — the element `<novatrail-canvas>` — comes as the first code of `canvas`. The samples page, the synthetic samples and the build from a file wait until the measurement needs samples of volunteers or of children — that is epic E5;
- В30 — by the 2026-10-22 addition to П-10: where the page proposes to put the sample file on an iPad, the planning of E5 chooses, and whether that is enough, the lawyer decides in epic E4 of RUN.md of `spec`.

— R30; RUN.md, table 3.

— *Amendment 2026-11-02:* the author took E5 — the answer to В59 (R45). The tasks of E5 — T16–T22, T24, T25 and T29 — returned to table 1 of RUN.md with the same numbers, and their bodies — from the archive of E2 into RUN.md, as with E4: «Отложена» became «Возвращена», and the item «Читать вместе с» names the "Consequences" of the decisions of E4, E6, E7 and E8 that change them. In the archive, in their place, is a line about where and when they went. The return of T29 started T74 — the probe on tablets, as T29 decided in its planning on 2026-10-22. — R45; RUN.md, table 1; [plan/E2.md](plan/E2.md).

**R18. The sheet's input is one pointer at a time, by its primary button. A stroke keeps every intermediate point except those closer than 0.1 unit to the last one recorded, and always the place and time of the lift. For the mouse and the finger the line is even, and only the pen changes the thickness by pressure. The drawing surface stands in the visible part of the sheet, and the sheet scrolls by the native scrolling of its container.**
- **Pointer.** The one that went down first writes, until it lifts. A second pointer and any button but the primary one — the pen's button and eraser, the mouse's right and middle buttons — do not write. A stroke ends on `pointerup`, on a move whose primary button is no longer pressed, on the loss of capture and when the element leaves the page, and `pointercancel` throws it away (R05). The pointer's type is written as it came (R09). There is no context menu over the drawing surface — neither by a long press of the pen or the finger, nor by the right button.
- **Points** come from `getCoalescedEvents`, and where it is missing or the list is empty, from the event itself:
  - a point closer than 0.1 unit to the last one recorded is not written: the sample file would not keep such a difference (R09). In memory the fractional numbers stay as they are;
  - the last point is always written, even closer than 0.1: the place and time of the lift, with the pressure of the previous move. A touch without movement is two points at one place, of the touch and of the lift;
  - the time is the `timeStamp` of each point in milliseconds from the sheet's first event, as in the sample (R09), and it does not decrease;
  - the stroke's ID is 1, 2, … in the order of the starts. It is not reused, and neither is the number of a stroke thrown away.
- **Line** — the outline of perfect-freehand 1.2.3, every parameter set explicitly: `size` 3 units — like the board's `lineWidth` 3 on a sheet 1000 wide (R19 tutor) —, `smoothing` and `streamline` 0.5, round ends, no tapering, and `last` for a finished stroke. The pressure is the code's own, as the third number of a point, with `simulatePressure: false`; `thinning` is 0.5 for the pen and 0 for the others. A stroke of one point goes into the library twice and is drawn as a circle with the line's diameter. The ink is `#111`, as on the board.
- **drawing surface** — one, as high as the visible part of the sheet, and its pixels are its size on the screen times `devicePixelRatio`. A media query tells the element of a new density. The `Path2D` path of a finished stroke is built once, and on each frame only the path of the stroke being written is built anew. Strokes outside the visible part are not drawn, and a new size of the drawing surface, which wipes it, is drawn again at once — in the same frame, before the frame is painted.
- **Scrolling** is native, of the container in the shadow root: the wheel, the scroll bar and the keyboard are the browser's. The drawing surface stands in the visible part (`position: sticky`) and is shifted by a matrix, and `vy` is the drawing surface's offset from the top of the sheet, divided by `k`. By default the element is as high as the sheet; if the consumer gave it a smaller height, the sheet scrolls inside it. At a new width `vy` stays the same. The sheet does not scroll by finger, and neither does the page above the drawing surface: it covers the visible part of the sheet and has `touch-action: none`. Scrolling with two fingers in T35 lifts this.
- **Code.** The DOM-free part — the stroke, the screen transform, the input recorder and the outline, `src/core/` — with its tests in Node. Its public entry point does not change: the element takes these modules by a relative path. The module `src/element/probe.ts`, which the package does not export, shows the element's state to the tests. The element's tests run in Chromium twice, with density 1 and 2, and real input of the mouse and of the pen with pressure goes through `Input.dispatchMouseEvent` of the DevTools protocol.

— *Why:* the author's answers in the planning of T09, 2026-10-22: split the task, an even line for the mouse and the finger, all points without repeats. The last point, the touch, native scrolling and this entry are a «да» to the plan with the recommendations of its review. The pixels of the drawing surface and the two instances of Chromium were decided in the course of the work, not as in the plan — why, below. The sources are [architecture.md](architecture.md), section 4.
- **One pointer.** The MVP's board is a computer: a mouse and sometimes a tablet's pen (R19 tutor). The palm, pen mode and two fingers are needed by tablets, and there are none to check on yet: this is T35.
- **Primary button.** The pen's button and eraser come with `button` 2 and 5, and the mouse's right button with 2. If they wrote, the pen's eraser would leave ink.
- **Last point.** `pointerup` has no intermediate points, and thinning would drop the place of the lift. The pressure at `pointerup` is 0 because the buttons are no longer pressed, not because it was measured. The groups are built by space and time (R06), and the pause before the lift is part of the stroke's time.
- **Even line.** That is how the board's sheet draws. And the mouse's pressure is 0.5 while the button is pressed, by definition, not by measurement; so is the finger's where the hardware does not measure pressure.
- **`size` 3, without a multiplier.** perfect-freehand has one absolute threshold: the outline does not go around the last 3 units of a stroke. A measurement on straight strokes: at 0.5–1 unit the outline is wider by 0.1–0.3 unit because of it, and from 2 units on there is no difference.
- **The pixels of the drawing surface are its size on the screen times the density,** not `device-pixel-content-box`, as the plan had it. When the density is emulated — both by the DevTools protocol and by Playwright's context — Chrome Headless Shell 156 gives this size at density 1, though `devicePixelRatio` is 2. So there would be nothing to check the buffer at density 2 with, and WebKit does not give this size at all. The cost is no more than a device pixel per edge, when the drawing surface's size on the screen is fractional.
- **Two instances of Chromium,** not emulation in the middle of a test, as the plan had it: the test's frame does not notice such emulation — neither a ResizeObserver entry nor the media query's event arrives.
- **Native scrolling.** The wheel and the touchpad with their inertia, the scroll bar, the keyboard and the handover of scrolling to the page at the sheet's edge come for free and the same as everywhere on the page. Our own code for the wheel would have to write all this anew.

— *Rejected:*
- several pointers and palm rejection now — there is nothing to check them on; this is T35;
- pressure for the mouse and the finger — the thickness would come from a number that the browser put in place of a measurement;
- all points without thinning — places that the sample file does not tell apart; thinning without the last point — the place and time of the lift would be lost;
- computing the outline in "sheet × 10", `size` 30 on points × 10 — a multiplier for the sake of the threshold of 3 units, while the difference is fractions of a unit on strokes shorter than 2 units;
- `device-pixel-content-box` — for the reason above. Return to it if the ink grows blurry on screens with a fractional density;
- our own code for the wheel with our own `vy` — for the reason above;
- the outline's path by the helper `getSvgPathFromStroke` from the README — the `Path2D` path is built by our own code, with curves through the midpoints of the edges;
- public methods of the element for the sake of the tests — the methods are for T34 to decide.

— *Revisit:* a limit on a stroke's length. In canvas-api it is 2000 points (spec 4.2 canvas-api); here there is no limit. Return to it if a long stroke being written starts to lag.

— *Consequence:*
- RUN.md: T09 is split; T35 «Ввод на планшетах: ладонь, режим пера и два пальца» is `[?]`, before T22, and T22 depends on it; for T11 the path of scrolling is decided, and what is left to it is how the other layers fit into this scrolling; T34 has a step for the author: a mouse on a computer;
- the amendments to R05, R06, R12, R13 and R17;
- [architecture.md](architecture.md), sections 3.1, 3.2, 3.7 and 4.

— `src/core/`, `src/element/`, `vitest.config.ts`, `.gitignore`; [architecture.md](architecture.md), sections 3.1, 3.2, 3.7 and 4; RUN.md, T09, T11, T22, T34, T35.

— *Amendment 2026-10-22:* the item "Rejected" saying that the methods are for T34 to decide reads thus: the methods of undo and clearing, `undo()` and `clear()`, were opened by T33 (R19), and T34 decides the PNG and the event of change. And from T33 on, the finished strokes are held not by the input recorder but by the work on the sheet: the recorder hands a finished stroke to a handler (R19). — R19; RUN.md, T33.

— *Amendment 2026-10-25:* the pen's eraser — `button` 5 — still does not write, but erases (R22). One pointer at a time both writes and erases. The sheet's clock is shared: the input recorder takes the time of the points from the sheet's clock, `Clock`, by which the time of erasing, clearing and undo runs too. As before, it is milliseconds from the sheet's first event, and it does not decrease. — R22; RUN.md, T10.

— *Amendment 2026-10-25:* the drawing surface in the visible part of the sheet is not alone but in a scene of layers, and all of them are shifted in the ink's frame (R23). Above the sheet, in the same scrolling, is the task statement, and by default the element is as high as the statement and the sheet. On the statement, the sheet and the page above it can be scrolled by finger: `touch-action: none` is only on the drawing surface. — R23; RUN.md, T11.

— *Amendment 2026-10-26:* the input recorder clamps the pressure to 0–1: an event that a script makes may give more, and the sheet would write a history that it would not accept itself (R27). When the sheet gets another history, the recorder drops the stroke under the pen and numbers the next one from the history's greatest ID + 1. — R27; RUN.md, T15.

— *Amendment 2026-10-26:* input on tablets is done (R29). Still one pointer at a time writes, but not always the one that went down first: the pen cancels a touch's stroke in progress and writes itself, and a second finger that touched soon after the first cancels the first one's stroke, and both scroll. "The sheet does not scroll by finger" is no longer so: two fingers scroll it, by code of its own. — R29; RUN.md, T35.

**R19. Undo and clearing are a stack of actions in the DOM-free part. Undo removes the last action — a stroke written or a clearing —, and clearing is an action too, and undo brings its strokes back. There is no redo. The element opens the methods `undo()` and `clear()`, and in the MVP the buttons for them are the consumer's.**
- **The work on the sheet** — `Work` in `src/core/work.ts`: the strokes that are visible, in the order of writing, and the stack of actions. An action is `write`, a stroke is written, or `clear`, the sheet is cleared, together with the strokes that were on it. T10 adds erasing.
  - undo removes the last action: for `write` its stroke goes, and for `clear` its strokes come back — the same array. On a sheet with no actions it changes nothing and returns `false`;
  - clearing removes all the strokes in one action, and on an empty sheet it is not an action: `false`, and nothing goes onto the stack;
  - there is no redo of what was undone.
- **The input recorder** does not hold a finished stroke. It first finishes it, then hands it to the handler it gets at creation — and the element puts the stroke into the work. The ID and the time are still the recorder's, and undo does not give the ID back (R18).
- **The stroke being written** is touched by neither undo nor clearing: it is the recorder's and goes onto the sheet when it ends — after that action.
- **Element.** The methods `undo(): boolean` and `clear(): boolean` return `true` if the sheet changed, and the sheet is redrawn on the next frame. A finished stroke's path is built once (R18), after an undone clearing too. In the MVP the buttons for the methods are the consumer's: the board keeps its own "Undo stroke" and "Clear" (R19 tutor).

— *Why:* the author's answers in the planning of T33, 2026-10-22, both by the recommendations: clearing can be undone, there is no redo; the buttons are the consumer's, and the methods are in T33. The sources are [architecture.md](architecture.md), section 4.
- **Clearing can be undone.** A child who pressed «Очистить» by accident does not lose the work. On the board clearing cannot be undone, but the board is the author's sheet, while the sheet of `canvas` is also the learner's.
- **No redo.** The board has none either, and the clearing that can be undone already guards the work against an accidental loss. Redo is one more stack and one more button for the consumer.
- **Stack of actions** — T10 waits for it: erasing goes onto the same stack, and the writing history records the actions as events with their time (R09).
- **Buttons with the consumer, methods now.** The board has buttons of its own, and the element's own buttons mean labels, translation by `lang` and accessibility, the work of T11 and T15. T33 opens the methods, not T34: that the sheet is redrawn after each operation is checked on the element itself.
- **First finish, then hand over.** Otherwise in the handler the stroke would be both live and on the sheet, and the event of change of T34 would see it twice.

— *Rejected:*
- clearing without undo, as on the board — an accidental clearing would wipe the work for good;
- redo of what was undone — for the reason above;
- the element's own buttons — for the reason above;
- the methods in T34, and in T33 an access for the tests — the tests would call the operations around the interface;
- undo and clearing also removing the stroke being written — the ink would vanish from under a pen that is still on the sheet;
- the input recorder holding the finished strokes and the stack itself — it records input, and the work on the sheet is another thing: T10's erasing goes into it too;
- a snapshot of the sheet for each action instead of a stack of actions — memory would grow by the whole sheet with each stroke, and erasing and the writing history fit actions, not snapshots.

— *Revisit:* the buttons — when the tools come into the element (T11, T15); redo — if someone asks for it; a limit on the stack — if the stack becomes noticeable in memory: the cleared strokes live in it for the sheet's whole life, and with them the paths the element built for them.

— *Consequence:*
- **T10** — erasing goes onto the same stack. The sheet's clock — the time from the first event — is now the input recorder's, and the events of undo, clearing and erasing need it too. The order of the history is the order of the actions: a stroke finished after an undo or a clearing comes after it in the history, though the time of its points is earlier;
- **T34** — the PNG and the event of change, and the event comes after `undo()` and `clear()` too. How the board moves on to the next task — with a new element or by a reset of the sheet that cannot be undone — T34 decides. Only not by `clear()`: "Undo stroke" would bring back the strokes of the previous task;
- **T15** — a new `history` replaces both the strokes and the stack;
- the amendments to R07 and R18.

— `src/core/work.ts`, `src/core/recorder.ts`, `src/element/`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.7 and 4; RUN.md, T10, T15, T33, T34.

— *Amendment 2026-10-22:* the "Consequence" about T34 is decided (R20). `workchange` comes after `undo()` and `clear()` too, if they changed the sheet, and the board moves on to the next task with a new element. The element has no reset that cannot be undone. — R20; RUN.md, T34.

— *Amendment 2026-10-25:* erasing went onto the same stack (R22). Its action keeps the erased strokes with their places on the sheet, and undo returns them to the same places — without the snapshot of the sheet that this entry rejected. The sheet is in the order in which the strokes went down. The methods of the work on the sheet take the page's time — `undo(time)`, `clear(time)`, `erase(ids, time)` —, and each action that changed something writes an event of the writing history. — R22; RUN.md, T10.

— *Amendment 2026-10-25:* "Revisit" about the buttons reads thus: the buttons — when the tools come into the element, from T15. T11 has no buttons of its own — the author's answer in its planning (R23). — R23; RUN.md, T11, T15.

— *Amendment 2026-10-26:* the "Consequence" about T15 is done (R27): another `history` replaces both the strokes and the stack, and the stack is built by the same rules that built it during writing — `undo()` after it removes its last action. "Revisit" about the buttons is T41: T15 was split in planning. — R27; RUN.md, T15, T41.

— *Amendment 2026-10-26:* "Revisit" about the buttons is done (R28): the element has its own «Отменить» and «Очистить», and they call `undo()` and `clear()`. The methods stay: the consumer may call them too. «Отменить», while there is nothing to undo, and «Очистить» on an empty sheet are disabled, and whether the stack is empty, `Work.undoable` tells. — R28; RUN.md, T41.

**R20. The element for the board: the picture of the work is the PNG of the whole sheet 1000 × 1400, a pixel per unit, with an even line on white. The browser's drawing surface draws it, and `exportPNG(): Promise<Blob | null>` gives it. After each change of the work the element sends the event `workchange`. The consumer moves on to the next task with a new element, and keeps writing off during the check by the style `pointer-events: none`.**
- **Sheet** — 1000 × 1400 by R06, without an amendment. The board gives the element a height — its own sheet's 600 px —, and the sheet scrolls in it (R18).
- **Picture:**
  - the whole sheet, not the visible part: 1000 × 1400 pixels, a pixel per unit, at any density and any size of the element;
  - the background is white and opaque, the ink is `#111`, as on the screen;
  - the line is even, 3 units, the pen's too. The path of the mouse and the finger is the same as on the screen, and the pen's is its own, without pressure, and it too is built once (R18);
  - it is the sheet at the moment of the call. A stroke being written is not on it — it is not on the sheet yet (R19). Nor is a stroke finished while the picture is being encoded.
- **What draws it** — the browser's drawing surface: a `<canvas>` of its own that is not in the document, the strokes' paths on it, and then `toBlob` with the type `image/png`. `toBlob` copies the drawing surface at the call and encodes the copy later. `OffscreenCanvas` with `convertToBlob` does the same, but Safari has it only from 16.4, and `toBlob` from 11, and the devices' browsers are not chosen yet (R12). The crop of T13 is still its own raster and its own encoder (R05).
- **Method** — `exportPNG(): Promise<Blob | null>`:
  - on an empty sheet — `null`, as `exportWork()` of R07: an empty sheet does not go to the model (H3), and the board says "Write a solution first.";
  - without a 2D context the promise is rejected rather than giving `null`: the consumer would take `null` for an empty sheet;
  - an element outside the page gives the picture too.
- **Event** — `workchange`, a plain `Event` from the host, which bubbles (R07). It is also `composed`: if the element stands in the consumer's shadow tree, the event comes out of there too, and outside, the target becomes the host of that tree. It comes synchronously, when the work has already changed.
  - It comes on each stroke that went onto the sheet, and on `undo()` and `clear()` that returned `true`.
  - It does not come on a stroke that `pointercancel` threw away, on `undo()` and `clear()` that changed nothing, and while a stroke is being written.
  - A stroke that ended because the element was removed from the page gives the event too. Only the listeners of the element itself hear it: it does not reach the ancestors.
  - Whether there is something to undo, the element does not say.
- **Next task** — a new element in place of the former one. The element has no reset that cannot be undone, and `clear()` will not do for this: "Undo stroke" would bring back the strokes of the previous task (R19). The board can conveniently listen for the event on a permanent ancestor of the element.
- **During the check** — `pointer-events: none` on the element. CSS inherits it into the shadow tree, and a new stroke cannot begin.
  - The cost: during this time the sheet does not scroll either.
  - This holds as long as the element itself sets no `pointer-events` inside, and a test holds this.
  - A stroke already being written is not stopped by the style: the drawing surface holds its pointer by capture, and the stroke goes to its end, goes onto the sheet and gives `workchange`. It is not in a picture taken before that. On the board "Check" is pressed with the same mouse that writes, so there is no stroke under it at that moment.
- **The entry point `@altnovatrail/canvas/core`** still gives only `SHEET`. The board needs nothing from the DOM-free part, and what else to give, T15 decides, by the types of `spec`.
- **Trial consumer** — `src/element/consumer.test.ts`: the board's path only through the element's interface — the methods and the event, without `probe.ts`. It reads the picture as the board would read it: the signature, IHDR and the pixels after `createImageBitmap`.
- **The page for trials by hand** — `demo/` and the recipe `just demo`.
  - It is the development server of Vite 8.3.4 on `127.0.0.1:5173`, and VS Code forwards it to a browser outside the container.
  - It serves only the page, the element's sources and the packages they take. Without its own list `server.fs.allow` Vite would serve the whole repository (R15).
  - The page has no build, and it is not in the package.
  - Vite is a direct development dependency, of the same version that Vitest already installed.

— *Why:* the author's answers in the planning of T34, 2026-10-22, all by the recommendations: the sheet and the picture, the browser's drawing surface, the method and an event without state. The rest is a «да» to the plan with the recommendations of its review. The sources are [architecture.md](architecture.md), section 4.
- **The sheet of R06.** One sheet for the board, `app` and the samples page — without an amendment to R06 and without a setting of the height.
  - The picture is taller than the board's: for Claude ≈1800 tokens instead of ≈790, for OpenAI 1408 patches instead of 608.
  - At the prices of R19 tutor the extra ≈1000 tokens of Claude are ≈0.4 cent per check, and 800 patches of OpenAI ≈0.8 cent, if a patch counts as a token. Together about a cent above its 10–20 cents.
  - The board's budget for input, 4000 tokens, is enough.
- **The browser's drawing surface.** The arguments of R05 against it concern the crop of the product and of the samples: byte-for-byte reproduction for the synthetic samples (T18), Node, and the noise that browsers add to what is read from a drawing surface. The board's picture needs none of this: the board itself sends `canvas.toDataURL`, the tests run in Chromium, and the picture is read by models. The noise of Firefox, Brave and Safari is accepted: it is small, and the board's sheet has the same. A raster and a PNG encoder of our own are the work of T13.
- **Even line.** Pressure «в картинки проверки он не попадает» (spec 3.1 canvas-api), and the board's line is even. On the screen the pen's thickness still follows the pressure (R18).
- **`Blob`** — binary, like the media files of R07, without base64, which is a third longer than the bytes themselves. Base64 is needed only by the board's request, in JSON. `FileReader.readAsDataURL` turns a `Blob` into a data URL — that is one line at the board.
- **`null` on an empty sheet** — as `exportWork()` of R07: an empty sheet does not go to the model (H3).
- **Event without state.** The board does not need to know whether there is something to undo: its buttons are disabled only during the check, and `undo()` returns `false` anyway. The event says that the sheet changed — for example, that the answers of the previous check no longer apply to it.
- **New element.** The element has no data of its own (architecture 3.2 spec), and replacing the sheet in place is what `history` of T15 gives. A reset without undo would be a third command with the same meaning.
- **`pointer-events`, not `inert`.** HTML Standard: "Authors should not specify elements as inert unless the content they represent are also visually obscured in some way", and the sheet is visible during the check.

— *Rejected:*
- a sheet 1000 × 600 for the board — by an amendment to R06 or by the sheet's height in the element's settings: the canvas would have two sheets of different heights, and the DOM-free part and the element would compute by it, not by a constant;
- the ink's box instead of the whole sheet — that is already a crop without scaling, which R06 rejected for the product, not a PNG «как у доски» (R17);
- a raster and a PNG encoder of our own now — that is the work of T13, and the MVP would take longer;
- a data URL — a string a third longer than the bytes, and `app` would turn it back;
- `exportWork()` right now — from T13 on, the same method would give the crop by A3 instead of the sheet, and the board would get another picture under the same name;
- the properties `canUndo` and `empty` — the board does not need them, and T15 would have to keep or change them;
- the event without `composed` — a consumer that has the element in its own shadow tree would not hear it from outside;
- the pen's path with pressure on the picture, `OffscreenCanvas`, a reset of the sheet without undo, the move through `clear()` and `inert` — for the reasons above.

— *Revisit:*
- the sheet for the board — if by its data the models read a picture of 1000 × 1400 worse than one of 1000 × 600;
- stopping the writing — by a property of the element that stops only the writing, if the board needs to scroll the sheet during the check;
- `exportPNG()` and `workchange` — when T15 completes `exportWork()` and `historychange`.

— *Consequence:*
- **T10** — `workchange` comes after erasing too;
- **T11** — the layers that distribute input through `pointer-events` (R05) do not set it on the drawing surface and the layers above it in such a way that the consumer's `pointer-events: none` stops working. A test holds this;
- **T13** — the crop is still its own raster (R05), and the board's picture does not change because of it;
- **T15** — whether `exportPNG()` and `workchange` stay beside `exportWork()` and `historychange`, and what else the entry point `/core` gives;
- **T24** — the module for the board. `go:embed` embeds its page, and the server answers only `/` and `/api/*`, so the module needs a route or a place in the page itself;
- the amendments to R05, R06, R07, R12, R14, R17 and R19;
- a letter for `tutor` in the report of T34: if the board takes the element, the comment in its `ask.go` about 1300 tokens and the price in R19 tutor go out of date.

— `src/core/outline.ts`, `src/element/`, `demo/`, `justfile`, `package.json`, `package-lock.json`, `biome.json`, `tsconfig.element.json`, `tsconfig.node.json`, `.github/dependabot.yml`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.7 and 4; RUN.md, T10, T11, T15, T24, T34, E2.

— *Amendment 2026-10-22:* the board of `tutor` does not take the element — the author's answer «нет» to В31 of RUN.md (the 2026-10-22 amendment to R19 tutor). The decisions of this entry stay: the picture, the method, the event, stopping the writing by the consumer's style and a new element for each task are the element's MVP interface. Its next consumers are `app` and the samples page, and what of it stays beside `exportWork()` and `historychange`, T15 decides. Until a new decision of the author, these do not apply:
- "Revisit" about the sheet for the board;
- the "Consequence" about the module for the board in T24, and its row in «Решить при планировании» of T24;
- the letter for `tutor` from the report of T34.

The item "The board does not take the element" of [architecture.md](architecture.md), section 3.3, says what the board would need if the author decides otherwise. — R17; RUN.md, E2, T24, table 3.

— *Amendment 2026-10-25:* the "Consequence" about T10 is done: `workchange` comes after erasing too — one per press of the eraser, when it is lifted, and a press without hits gives none. `exportPNG()` during a press gives the sheet with the strokes under the eraser: the work has not changed yet (R22). — R22; RUN.md, T10.

— *Amendment 2026-10-25:* the "Consequence" about T11 is done (R23). `pointer-events: none` is set on all the layers but the drawing surface, and no `pointer-events` is set on the drawing surface and its ancestors. The consumer's `none` on the element still stops the writing, and tests hold this. `exportPNG()` is still `#111` on white, whatever theme the consumer sets. — R23; RUN.md, T11.

— *Amendment 2026-10-26:* `exportPNG()` and `workchange` are removed (R27), and "Revisit" and "Consequence" about T15 are decided. `historychange` comes at the same moments as `workchange` came, and the crop of `exportWork()` goes to the check: a PNG of the whole sheet beside it would invite sending the wrong picture. The package had not come out, and there was nobody to remove them from. The entry point `core` gives the data types and `replay`, and the trial consumer goes the path of `app`. What stays is the style `pointer-events: none` during the check and a new element for each task, and the sheet can now also be replaced in place by another `history`. If the author decides otherwise on В31, a task of its own brings back the picture for the board. — R27; [architecture.md](architecture.md), section 3.3; RUN.md, T15.

— *Amendment 2026-10-26:* `pointer-events: none` on the element also stops its buttons (R28), but only for the pointer: from the keyboard they work during the check too. By that time the work has already been taken by `exportWork()`, an undo or a clearing after it is an ordinary action with its own `historychange`, and the marks hold on to their strokes. The keyboard too can be stopped by a property, if `app` asks for it. — R28; [architecture.md](architecture.md), section 3.3; RUN.md, T41.

— *Amendment 2026-10-26:* during the check, with `pointer-events: none`, scrolling with two fingers does not start, and scrolling already started goes on until the lift: the drawing surface holds the fingers by capture (R29). The wheel and the scroll bar — as before. — R29; RUN.md, T35.

## The work plan — continued

**R21. `canvas` does not build a text canvas: epic E3 «Текстовая канва» is removed. The package has one canvas kind — the handwriting sheet —, and a return to the text canvas is possible only by a new decision of the author.**
- **What is removed** — what was decided only for the text canvas: words and sentences in HTML, edits as their state and input from the keyboard (R05), marks by words — `{word_ids}` (R06), edits as the work from `exportWork()` and the event `speak` for «прослушать» (R07). E3 had no tasks, and there is no code of the text canvas, so only the plan's row and these decisions are removed.
- **Input "as typed"** ([architecture.md](architecture.md), section 2.5) is no longer for `canvas` to decide: the sheet has no field to type into. The subsection stays as a record, because «Вход» T29 in RUN.md of `spec` refers to it. Its finding concerns any typed answer, including an answer slot with keyboard input in `app` (concepts 6 spec).
- **What stays.** The element `<novatrail-canvas>` is still one for every canvas kind and takes the kind from the task's open view (R07). A new kind, if the author decides on one, comes with a new version of the package, without an edit of `app` (R02 spec). The sheet and the epics E4 and E5 do not change; they only go after E2 now.
- **`spec`.** The two canvas kinds in the first slice are named by product 10 spec and the card architecture 3.2 spec, the event `speak` by R36 spec and architecture 3.1 spec, and the statement's words with IDs for the text canvas by «Вход» T28 in RUN.md of `spec`. Until `spec` decides, `canvas` differs from the card in this. What to change is В32 in table 3 of RUN.md, «в реестр spec».

— *Why:* the author's decision of 2026-10-25: «второй тип канвы делать не будем», and the epic is to be removed. The author gave no reason.

— *Rejected:*
- keeping E3 in table 2 or deferring it — the author decided to remove the epic;
- removing the epic but keeping the decisions on the text canvas in force until a return to it — the documents would describe `{word_ids}` and `speak`, which nobody builds, and `app` would wait for an event that will not come.

— *Consequence:*
- RUN.md: table 2 has no row of E3, and the table's opening says when and why it went. E4 and E5 go after E2, and table 1 names E4 as the next. Table 3 has В32 «в реестр spec»;
- [architecture.md](architecture.md): sections 1, 3.1, 3.2 and 3.3 — without the text canvas. What the subsections 2.1–2.3 and 2.5 say of it stays as a record of what was known and what was chosen from;
- README.md: one canvas kind;
- the amendments to R05, R06, R07 and R17.

— RUN.md, tables 1–3; [architecture.md](architecture.md), sections 1, 2, 2.5, 3, 3.1, 3.2 and 3.3; README.md.

— *Amendment 2026-10-26:* В32 is closed by R41 spec — otherwise than `canvas` advised (R30). There is no second module on a text canvas: the first slice has three modules, and the slice's canvases are the handwriting sheet and the workbook. The card architecture 3.2 spec gives `canvas` the detailing of the workbook — the page, the answer slots, the crop of a slot and the template layer. This is epic E6 of table 2 of RUN.md, the first one — by the author's decision. "The package has one canvas kind" above is about what has been built: the workbook comes with E6. The decision on the text canvas stays. — R30; RUN.md, table 2.

## E4. The sheet for the product

**R22. The eraser erases whole strokes, along the path of the press: everything its path came near leaves the sheet in one action when it is lifted, and one undo brings it all back. It is turned on by the element's property `tool` and by the pen's eraser. The writing history is the events "stroke", "erasing", "clearing" and "undo" with the sheet's time, and each names the IDs it removed or brought back. The sheet's clock is one for the strokes and the actions.**
- **Eraser — along the path.** A press takes each stroke whose line comes no farther than the reach from the eraser's path; a touch is a path of one point.
  - The strokes under the eraser vanish from the screen at once, and leave the sheet when it is lifted — in one action of erasing in the stack of R19. One undo returns them all, to their former places.
  - `pointercancel` throws the press away, and the strokes come back. A press without hits is not an action.
  - On the lift, those of the taken strokes that are on the sheet then leave: for what was removed during the press by undo or clearing and did not come back, there is nothing left to erase.
  - Outside the visible part of the sheet — where a captured pointer goes — the eraser takes nothing, and the path goes on from its last place on the screen. Otherwise a pointer beyond the edge of the drawing surface would lead the eraser along the sheet's border, to which the coordinate transform pins it, and over the invisible part of the sheet.
- **Reach** — `ERASER_RADIUS_PX / k + INK_REACH`: 10 CSS px on the screen, whatever the sheet's zoom, plus 2.25 units — half of the pen's widest line. `k` is taken at the moment of the press. A hit is computed on the polyline of the stroke's raw points: the index of rbush 4.0.1 finds the strokes by their boxes, and our own code computes the exact distance from a segment of the path to the segments of the stroke (R05). The index is rebuilt when the sheet's array of strokes has changed, and only when it is accessed.
- **Turning on.** The property `tool` — `"pen"` or `"eraser"`, `"pen"` by default: the primary button writes or erases.
  - The consumer switches it with its own button, like `undo()` and `clear()` in the MVP. Another value is a `TypeError`. A value assigned before the element is registered, the element takes at creation, and an invalid one leaves the pen and writes a warning to the console: an exception in the constructor would leave the element not working.
  - The pen's eraser — `button` 5, and bit 32 in `buttons` (Pointer Events Level 3) — erases with any `tool`.
  - A press goes on as it began: a change of `tool` does not change it. One pointer at a time writes or erases (R18).
- **Sheet** — the strokes in the order in which they went down, not by ID. The action of erasing keeps the erased strokes with their places, and undo returns them to the same places: there is no snapshot of the whole sheet (R19).
- **The writing history** — events in the order in which the actions went down, with the sheet's time:
  - "stroke" — the time when it went down, and the stroke itself: the ID, the pointer type and the points with time and pressure. Usually it goes down with its last point. If the stroke ended without `pointerup`, and another action went down while it was being written, then no earlier than that action;
  - "erasing" — the time of the lift and the IDs of the erased strokes, in the sheet's order;
  - "clearing" — the time and the IDs of everything that was on the sheet;
  - "undo" — the time, the IDs it removed and the IDs it brought back.

  The time when an action went down does not decrease along the history. Folding the history gives the sheet without the rules of the stack: it only adds and removes IDs. The events are plain data, in JSON as they are. The history does not go outside yet: the event `historychange` and the property `history` are T15 (R07).
- **The sheet's clock** — milliseconds from the first access to it, not decreasing. The input recorder takes the time of the points from it, and the work on the sheet the time of erasing, clearing and undo, and only when the action went down: an empty undo does not touch the clock. The page's time — the `timeStamp` of a pointer event and `performance.now()` at the methods — is counted from one origin ([architecture.md](architecture.md), section 4).
- **Code:** in the DOM-free part — `clock.ts`, `geometry.ts`, `history.ts`, `eraser.ts` and `work.ts`, with tests in Node; in the element — `tool`, the routing of input between the recorder and the eraser, and drawing without the strokes under the eraser. On the page for trials — the button "Eraser".

— *Why:* the author's answers in the planning of T10, 2026-10-25. Not to split the task — not by the recommendation; the eraser along the path, undo and clearing with their own IDs, `tool` and the pen's eraser — by the recommendations. The rest is a «да» to the plan. Before the work a separate agent checked the plan: the sheet's order, the lazy index and the reach in CSS px are its corrections. The sources are [architecture.md](architecture.md), section 4.
- **A path, not a touch.** Going over several strokes with the eraser is one action and one undo. A touch stays a particular case.
- **Under the eraser — at once, off the sheet — on the lift.** So erasing goes down as a stroke does: one action, one event `workchange`, one event of the history. `pointercancel` throws it away, and `exportPNG()` during the press gives the sheet as it still is.
- **Events with their own IDs.** Whoever reads the history — the runner of `tutor` — does not need to repeat the stack rules of `canvas`. It reads clearing as erasing from the format of `tutor`: «стирание — время и ID стёртых штрихов» ([architecture.md](architecture.md), section 4). IDs are not data about a person, and they add no information about the writing.
- **One time for erasing — the lift's.** The format of `tutor` gives erasing one time, and the work changes when the eraser is lifted.
- **The order in which they went down.** If T35 allows several touches at once, stroke 3 may go down before stroke 2, and an order by ID would differ from the order of writing.
- **Index by the change of the array.** Each action gives a new array of strokes (R19), and an index built for its own array does not diverge from it. Editing the index on each action is six places for it to go out of sync: writing, erasing, clearing and the undo of each of the three.
- **Reach in CSS px.** In the sheet's units the eraser on a phone 360 px wide would be three times smaller than on a screen of 1000 px. Erasing is written by ID, so the history does not depend on the screen.
- **The pen's eraser.** A pen turned over erases, as on paper, and nothing needs switching. It cannot be passed through the DevTools protocol: the tests give it by synthetic events, and on devices T22 checks it.
- **One clock.** By the DOM Standard `timeStamp` is a "relative high resolution coarse time", and by High Resolution Time `now()` is the "current high resolution time", and both are counted from the time origin of the global object. The cost: `undo()` gets the time of `performance.now()`, which is later than the click, and the next points of a stroke being written may be pulled up to it by a few milliseconds.

— *Rejected:*
- an eraser by touch — several strokes would be erased by several presses and undone by several undos;
- each hit as an action of its own — going over five strokes would mean five undos;
- undo and clearing with the time only — everyone who reads the history would have to repeat the stack rules;
- a time for each erased stroke — the format of `tutor` does not know it, and the work changes on the lift;
- splitting the task into the DOM-free part and the eraser on the element (T38) — the author's answer: as one task;
- only `tool` — a pen turned over would not erase; only the pen's eraser — the mouse and the finger would not erase at all;
- the sheet in the order of the IDs, an index edited on each action and the reach in the sheet's units — for the reasons above;
- a snapshot of the sheet for each erasing — R19 rejected it.

— *Revisit:*
- the reach — by the probe on devices (T22); the pen's eraser — if on devices it comes otherwise than in Pointer Events Level 3;
- a hit by the raw points — if on fast strokes the eraser misses the ink. perfect-freehand smooths the path (`streamline` 0.5), and at a sharp corner with sparse points the ink may move away from the polyline farther than `INK_REACH`. Then — compute by perfect-freehand's middle line, `getStrokePoints`.

— *Consequence:*
- **T15** — `historychange` and `history`. It needs: a clock that continues the time of an assigned history; the next ID at the input recorder; a check of an assigned history — the IDs do not repeat, what is erased and removed was on the sheet, the time does not decrease; one helper for the upgrade of properties for `tool`, `task` and `history`. T15 also decides how `tool` gets along with the tools from `task`;
- **T12** — the groups are built from the history with its time; **T14** — a mark disappears when all its strokes are erased: erasing exists;
- **T17** — the history in a measurement sample is the events of this entry;
- **T22** — the reach and the pen's eraser on devices;
- the amendments to R07, R18, R19 and R20;
- **table 3 of RUN.md** — В33 «в реестр spec»: the events of the history go to the eval protocol.

— `src/core/`, `src/element/`, `demo/`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.5, 3.7 and 4; RUN.md, T10, table 3; README.md.

— *Amendment 2026-10-25:* "outside the visible part of the sheet" is now outside the drawing surface, clipped to the visible part of the container: while the statement is visible above the sheet, the drawing surface goes below it (R23). "One helper for the upgrade of properties" from the "Consequence" about T15 already exists: `tool`, `task` and `media` go through it. — R23; RUN.md, T11.

— *Amendment 2026-10-26:* the "Consequence" about T14 is done (R26): a mark is not seen when all its strokes are erased, and it comes back with them after an undo. The strokes under a press of the eraser remove it from the screen at once, and `pointercancel` brings it back. — R26; RUN.md, T14.

— *Amendment 2026-10-26:* the "Consequence" about T15 is done (R27). The history goes out by the property `history` and the event `historychange`, and comes in by the same property. The clock continues an assigned history by `resume`: from its last event plus the pause of the groups and 1 ms more, and the sheet's time is the time of its history. The next ID is the greatest in the history + 1. The check of an assigned history is stricter than the "Consequence" named: the history passes through the actions of the work on the sheet, each recorded action must match the given one, and the time is checked only for its order. The shared helper for the upgrade of properties takes `history` too, before `marks`. How `tool` gets along with the task's tools is T41. — R27; RUN.md, T15, T41.

— *Amendment 2026-10-26:* `tool` is also switched by the element's buttons, «Перо» and «Ластик», and the element announces the learner's change of the tool by the event `toolchange` (R28). The pen's eraser erases with any `tool`, if the task allows the eraser. In a task without it the pen's back end does nothing, `tool = "eraser"` is a `TypeError`, and a new task without the eraser brings back the pen. So it is decided how `tool` gets along with the task's tools — from the amendment about T15. — R28; RUN.md, T41.

— *Amendment 2026-10-26:* in pen mode a finger does not erase. Without pen mode, a press of the eraser by a finger is canceled by a second finger that touched soon after: scrolling begins, and nothing is erased (R29). — R29; RUN.md, T35.

— *Amendment 2026-10-26:* В33 is recorded in `spec` (R31). The eval protocol takes the events of the writing history as they are: erasing and clearing name the IDs of the erased strokes, and undo the IDs it removed and brought back. The runner folds the history without the stack rules, only adding and removing IDs, and reads clearing as erasing (epic E3 in RUN.md of `spec`; concepts 15 spec, "writing history"). — R31.

**R23. The sheet is a stack of layers in its visible part, in the order of concepts 8 spec, and all the layers move in the frame in which the ink is drawn. On the template is the task's grid, and the element shows the task statement above the sheet, in the same scrolling. The sheet is no wider than 1000 CSS px. The element gets the task and the media files by the properties `task` and `media`, and the theme by CSS variables; it has no tool buttons of its own until T15.**
- **The layers** stand in the scene — the sticky visible part of the sheet —, from bottom to top:
  - the author's template — an SVG with the grid;
  - the place of the module's widget and the place of the demo — empty;
  - the tutor's sketch — an empty SVG;
  - the ink — the drawing surface;
  - the tutor's marks — an empty SVG until T14.

  All the layers are of one size and `position: absolute`. The `viewBox` of each SVG is the visible part of the sheet in its units, `0 vy 1000 H/k`. One layout sets it, in the same frame in which the ink is drawn: on scrolling and on a new size.
- **Input** is taken by the drawing surface alone. The other layers have `pointer-events: none` and `aria-hidden`, and no `pointer-events` is set on the drawing surface and its ancestors, so the consumer's `none` on the element reaches the drawing surface (R20). A layer that later becomes active will remove its `none`, but will not get `auto`.
- **The grid** is squares, lines or dots: `squares`, `lines` and `dots`, as in concepts 16.1 spec.
  - The step is from 20 to 500 units, 50 by default.
  - The lines lie strictly inside the sheet, at `i × step`, and their thickness is in CSS px at any `k`. The dots stand where the lines would cross.
  - A sheet without a task is in squares of 50: concepts 8 spec knows no sheet without a grid.
  - The grid's path is built by the DOM-free part, `grid.ts`.
- **The statement** is above the sheet, in the element itself and in the same scrolling.
  - Paragraphs are text, through `textContent`, and pictures are an `<img>` from a `Blob` that the function `media` gives. The statement inherits its font and color from the consumer, and takes its language from the task.
  - A picture stands in a frame of its own size, and the size is given by the task. While the picture has not come, or if it never comes, the frame shows its description, and a screen reader reads it as a picture. A picture with an empty description is decoration, and it has no frame.
  - The file's URL is revoked when the picture has left the statement, when the file did not decode and when the element has left the page. The files of the pictures that stand in the statement stay with the element: on a return to the page the pictures are seen again, and a new task with the same picture takes its file. The element does not hold the files of the pictures that have left the statement.
  - A reference names one file while the picture is in the statement. A new function `media` gives files only to the pictures that have none, and does not cancel the loads already begun: React gives a new function on every re-render.
- **No formulas**: the tasks do not need them.
- **Zoom.** `k` is no more than 1: the sheet is no wider than 1000 CSS px, and on a wide screen it stands in the center; there is no lower limit. The limit is the layout's, `fitScale`. The `k` for input, for the eraser's reach and for drawing is computed from the sheet's rectangle on the screen, `scaleFor`, with no limit.
- **The visible part** follows the scrolling. While the statement is in view, the drawing surface goes below the visible part of the container, and the eraser takes nothing there (R22). `vy` is counted from the top of the sheet, and at a new width or a new height of the statement the visible part stays at the same place of the sheet. A new height of the container itself does not touch the scrolling: a scroll in progress is not cut off.
- **Properties:**
  - `task` — a temporary type of the open view of the same make-up that format v0 will give: the canvas kind `handwriting-sheet`, the grid and the step, the statement and its language (T28 and T35 in RUN.md of `spec`; R36 spec). The fields the sheet does not read are skipped, and what the sheet cannot show is a `TypeError` with the field's name. Only `undefined` omits a field, and `null` is a value, and a wrong one. The same task, or one equal to it by its template, changes nothing, and another changes only the template, and in it only what has changed: the grid or the statement. The work stays, since a new task is a new element (R20);
  - `media` — a function that returns a `Promise<Blob>`;
  - `tool`, `task` and `media`, assigned before the element is registered, go through one shared helper: an invalid value leaves the property as the element starts it, and gives a warning.
- **The theme** is the variables `--novatrail-canvas-paper`, `--novatrail-canvas-ink` and `--novatrail-canvas-grid`, with light defaults.
  - In forced colors mode the system ones stand in their place: Canvas, CanvasText and GrayText.
  - The ink is drawn in the drawing surface's color as its style computed it, and is redrawn on a change of the theme.
  - The picture of the work (R20) is still `#111` on white.
- **Tool buttons** are still the consumer's, and the element's own come with T15.
- **Code:**
  - in the DOM-free part — `grid.ts`, `task.ts` and `fitScale` in `screen.ts`;
  - in the element — the scene of layers in `index.ts` and the statement in `statement.ts`;
  - tests in Chromium — `layers.test.ts` and `statement.test.ts`, and forced colors mode is a Vitest project of its own, `forced-colors.test.ts`;
  - on the page for probes — the grid's kind and step, a statement with a picture and the dark theme.

— *Why:* the author's answers in the planning of T11, 2026-10-25. Not to split the task — not by the recommendation; the statement above the sheet, tool buttons from T15 and only an upper limit of `k` — by the recommendations. The rest is a «да» to the plan. Before the work a separate agent checked the design. Its corrections are the limit at the layout alone, an explicit size of the layers, the visible part by the scrolling, redrawing on a change of the theme and the lifetime of the pictures' URLs. The sources are [architecture.md](architecture.md), section 4.
- **The layers move in the ink's frame.** The browser takes the scrolling step before the frame callbacks (HTML Standard), and Chrome's compositor thread assembles frames even without the main thread. A layer that scrolls by itself would get a frame or two ahead of the ink on scrolling: the ink is redrawn by the scroll event. Moved in one frame, the layers lag all together and do not drift from one another.
- **`viewBox`, not a shift of an SVG the size of the whole sheet.** The browser rasterizes only the visible part, and a fractional shift does not blur the lines in CSS px. The thickness at `non-scaling-stroke` the browser computes from the viewport of the outermost SVG (SVG 2), so a transform of the page does not change it either.
- **The statement above the sheet:**
  - so it is at canvas-api — «текст над листом, а не часть листа», — on `tutor`'s board and in `spec`'s prototype;
  - HTML text grows with the page's zoom and wraps by the width, while on the sheet it would grow only together with the sheet;
  - the statement's place on the sheet would depend on the device's fonts, while the strokes lie in the sheet's units. On another device the text would end up under the ink, and the answer slots — T28 in RUN.md of `spec` — could run onto it.

  concepts 6 spec, on the contrary, puts the statement «на нестираемом слое шаблона». This is В34 in table 3 of RUN.md.
- **Formulas.** Neither `tutor`'s tasks nor the 603 tasks of MathTrail standalone have any: there it is text with the signs ×, :, − and fractions of the form a/b. Nor are there libraries of formulas: neither KaTeX, nor MathJax, nor MathML is at `tutor`, at canvas-api or at standalone.
- **The picture's frame.** The task gives the picture a size, and the place for the picture is held until it comes: neither the text nor the sheet moves under the pen. A screen reader will read the description, and while the picture is not there, the learner will see it too.
- **The files' URLs:**
  - MDN advises revoking the URL when the picture has left the document, not on load;
  - moving the element on the page is a disconnection and a connection in one task, so the URL is revoked after a microtask if the element has not come back;
  - otherwise the pictures of every task would be held in memory while `app` is open, since the consumer moves to a new task with a new element (R20).
- **The limit of `k`:**
  - a drawing surface as high as the sheet grows with the square of `k`. At a width of 2560 px and a density of 2, without the limit the buffer would be 5120 × 7168 pixels, ≈147 MB, and with the limit it is 2000 × 2800, ≈22 MB;
  - a square of 50 px and a line of 3 px stay on a wide screen as they are on paper;
  - so it is at canvas-api too: «на широком экране по бокам остаются поля»;
  - there are no phones in the first slice (product 10 spec), and a lower limit is not needed.
- **The limit at the layout, not at the input.** An element 800 px wide in an ancestor with `transform: scale(1.5)` is wider than 1000 px on the screen. With the limit at the input the points would land 20 % off.
- **Buttons — from T15.** The buttons' labels are translated by `lang`, by the shared scheme of the UI packages, and it does not exist yet: T07 of `app` is not done. The task's allowed tools are T15 too.
- **A variable's default at every `var()`.** A declaration in `:host` would set the variable on the host itself, and the value the element inherits from the page would not reach the shadow tree.

— *Rejected:*
- layers that scroll together with the content, and a shift of an SVG the size of the whole sheet instead of `viewBox` — for the reasons above;
- the statement on the sheet — for the reasons above; the statement at the consumer — the card architecture 3.2 spec gives the canvas «показ содержания модуля: условие, формулы, медиа»;
- tool buttons of its own now — for the reason above; the buttons forever at the consumer — the author's answer;
- `k` with no limits — the drawing surface's buffer and the square would grow with the screen, and each consumer would guard against it by itself;
- `k` with a lower limit too — on a narrow screen the sheet would scroll sideways, and with a finger only from T35;
- the limit at `scaleFor` — for the reason above;
- formulas now — KaTeX 0.19.1 with its own CSS and 60 font files, Temml 0.14.0 or MathML from the open view: the tasks do not need them;
- a picture that has not come silently disappearing, as in standalone — the learner would lose what is on it;
- an event to the consumer about a picture that has not come — `app` knows anyway that its function gave no file;
- a theme without variables — `app` could not set a dark theme;
- splitting the task into T11 and T39 — the author's answer: as one task.

— *Revisit:*
- the limit of `k` — by the probe on devices (T22);
- a drawing surface the size of the whole sheet with the native scrolling, without lag, — to measure there too: its buffer at `k` 1 and a density of 2 is ≈22 MB;
- formulas — when a task needs them: with no dependencies — MathML Core, and from LaTeX — Temml;
- the statement on the sheet — if format v0 puts on the sheet pictures that one writes over.

— *Consequence:*
- **T13** — there is no statement on the sheet, and the crop does not draw the grid anyway;
- **T14** — the marks go into the marks' SVG, and the accessible name removes `aria-hidden` from it;
- **T15** — tool buttons of its own with labels by `lang`, the task's allowed tools and how `tool` gets along with them, and also how `task` gets along with `history`;
- **T19** — the samples page gives `media` from its build, and its content security policy needs `img-src blob:`;
- **T22** — the limit of `k`, the statement above the sheet and a drawing surface the size of the whole sheet, on devices;
- amendments to R05, R06, R07, R18, R19, R20 and R22;
- **table 3 of RUN.md** — В34 «в реестр spec»: the statement above the sheet against concepts 6 and 8 spec, and the description and the size of the statement's picture — to format v0.

— `src/core/`, `src/element/`, `demo/`, `vitest.config.ts`; [architecture.md](architecture.md), sections 1, 3.1, 3.2, 3.3, 3.7 and 4; RUN.md, T11, T15, E4, table 3; README.md.

— *Amendment 2026-10-26:* the marks layer has no `aria-hidden` at all, and removing it, as the "Consequence" about T14 told, was not needed (R26). The layer has a constant `role="none"`, and each visible mark has `role="img"` and an `aria-label`. A root `<svg>` without `aria-hidden` and without a role would be read as a picture with no name: so the locators engine of Vitest counts it too. The layer's `pointer-events: none` is as before. — R26; [architecture.md](architecture.md), section 3.1; RUN.md, T14.

— *Amendment 2026-10-26:* the "Consequence" about T15 is split (R27): tool buttons of its own, labels by `lang` and the task's allowed tools are T41, and `task` and `history` do not depend on each other: neither resets the other, and the order does not matter. Tool buttons are the consumer's until T41. The task got a temporary field `canvas.digit` — the digit height on the crop. — R27; RUN.md, T15, T41.

— *Amendment 2026-10-26:* the element's own buttons exist from T41 (R28) — as a row above the statement and the sheet, outside their scrolling. Input is taken by the drawing surface and by the row's buttons, and both take it only as the element does: the row sets no `pointer-events` of its own. The visible part of the sheet for the eraser starts below the row when the row has stuck above the sheet. The height of an element without a height of its own is the row, the statement and the sheet. The theme colors the row too: paper, ink, and in forced colors mode the system colors of buttons. The top offset of the sticky row is the variable `--novatrail-canvas-top`. — R28; [architecture.md](architecture.md), sections 3.1 and 3.3; RUN.md, T41.

— *Amendment 2026-10-26:* the drawing surface takes touches for scrolling with two fingers too (R29), and on the statement, the margins and the row of buttons a finger scrolls with the native scrolling, as before. The row has a fifth button, «Рисовать пальцем»: in pen mode on a narrow element the row with it wraps, but only between strokes. — R29; RUN.md, T35.

— *Amendment 2026-10-26:* В34 is closed by R51 spec, by `canvas`'s recommendation (R30). The task statement is part of the author's template, and whether it is above the canvas or on it is decided by the canvas kind: the sheet shows it above the sheet. The picture has a description and a size, and concepts 6 and 8 spec are amended. There is no sound and there are no formulas in the statement of v0. The parts of the statement in the schema `task.schema.json` are the same as the temporary type's: `text` or `picture` with `alt`, `width` and `height`, — and the picture is named by a path from `media/`. — R30.

— *Amendment 2026-10-27:* the task no longer skips the fields the sheet does not read (R32): the element checks it strictly, as the schema does, and a field the open view does not have is a `TypeError`, except the temporary `canvas.tools`. The canvas kind is `handwriting_sheet`, the step is `grid_step`, and the statement's language is given not by the task but by the module manifest, the property `manifest`. Without a manifest it is the element's own language, as before without `task.lang`. Only `undefined` still omits a field, and the extra fields of the writing history are skipped, as before (R27). — R32.

— *Amendment 2026-10-27:* in the workbook too the statement is above the page (R34). Its template layer carries the item lines and the boxes, and a screen reader reads it: it has no `aria-hidden`, its root is `role="none"`, and the lines are a list. The sheet's template is still `aria-hidden`. — R34.

— *Amendment 2026-10-27:* the template layer is by the canvas kind (R36): the sheet's has the grid and `aria-hidden`, the workbook's has the item lines without a grid, and its root is `role="none"`. The theme colors the workbook's print too — in the ink's color, and in forced colors this is CanvasText. The element is horizontal at any writing mode of the page: `:host { writing-mode: horizontal-tb }`. — R36.

— *Amendment 2026-11-01:* on the sheet of a worked example the drawing surface takes no input: `pointer-events: none` by a rule on the sheet's class, and the press is taken by the scene (R42). This is the one exception to "no `pointer-events` is set on the drawing surface and its ancestors": without the class the drawing surface again inherits the consumer's `none`. The ban on the context menu and on selection is now on the scene, not on the drawing surface, and above the sheet there are still none. — R42; RUN.md, T59.

— *Amendment 2026-11-01:* the pictures' files are held not by the statement but by the element's one loader (R42; T64). A reference is one file and one call of `media`, however many pictures show it: the task statement, the example's statement, the demo's parts beside the sheet and in the sheet's areas. A file is held while what the element shows names its reference — the task statement or the example as a whole —, and not while the picture is in the statement: the element asks for all the example's pictures when the example has come. The `blob:` URL is one per reference while the element is on the page, and the loader decodes it, once, before a picture shows it. It is revoked when nothing names the reference any more, when the file did not decode and when the element has left the page. A reference without a file — it did not come or did not decode — is asked for again with every new task and every new example, when the element returns to the page and at a new function `media`. The warnings in the console are about the picture, not about the statement. — R42; [architecture.md](architecture.md), section 3.3; RUN.md, T64.

— *Amendment 2026-11-11 (T94):* **`k` is the fit to the width, no wider than 1000 CSS px, multiplied by the page's zoom, from 100 to 200 % (R73): the limit holds the fit, and the zoom goes beyond it.** "The sheet is no wider than 1000 CSS px" now means "the fitted sheet". The visible part is by the width too: `vx`, its left edge in the sheet's units, and the layers' `viewBox` is `vx vy W/k H/k`. The scene sticks to the left edge of the container too, and the drawing surface is the visible part on both axes: its buffer does not grow with the zoom, in an element with a height. The `k` of input, of the eraser's reach and of drawing is by the width of the sheet on the screen, not of the drawing surface. A new width, a new zoom and the browser's zoom keep the top left corner of the visible part at the same place of the sheet. The "Rejected" about `k` with a lower limit stays: scrolling sideways came not by a lower limit but by a zoom the learner chooses on their own, with «Левее» and «Правее» and two fingers. — R73; [architecture.md](architecture.md), sections 3.1 and 3.2.

**R24. The stroke groups are by nearness in space and in time. Two strokes are neighbors if there are no more than 2 s between them, and the boxes of their points come closer than a square — 50 units horizontally and vertically. A group is the strokes that a chain of neighbors joins. The rule takes the visible strokes and counts in integers: in tenths of a unit and in milliseconds. The labels are A, B, C… by place, top to bottom. The group's rectangle is in the sheet's units, and the group box in fractions of the crop is computed by T13.**
- **The input** is the visible strokes of the final sheet with the time of their points: the fold of the writing history, which is also the strokes on the sheet (R22). What is erased and what is removed by undo does not enter the groups, and what is brought back by undo enters with the time when it was written. Erasing and undo do not split groups. A stroke without points or one ID on two strokes is a `TypeError`, and a rule whose limit is not a finite number from 0 is a `RangeError`.
- **Integers.** Places are in tenths of a unit, `round(10 × v)`, and time is in whole milliseconds, `round(t)`: so the sample will record them (R09). A half is rounded up: 100.05 units is 1001 tenths. A stroke's span is from the earliest time of its points to the latest. Further on the rule only subtracts and compares.
- **Neighbors** — both conditions at once, and in both the boundary is included:
  - the pause between the strokes — from the end of the earlier one to the start of the later one, and for strokes that overlap in time it is 0 — is no more than 2000 ms;
  - the gap between the boxes of their points is no more than 500 tenths, 50 units, horizontally, and as much vertically.
- **A group** is the strokes linked by a chain of neighbors. The candidates for neighbors are found by an rbush index over the boxes in tenths, widened by the threshold: on integers this is exactly the condition of place. Time is checked separately (R05).
- **The labels** are by place, top to bottom (R09):
  - the order is by the group's rectangle in tenths: top, left, bottom, right. Then by the earliest start, and only if that too is the same — by the smaller ID;
  - the labels are A…Z, then AA…AZ, BA…ZZ, AAA…;
  - in the table "label → strokes' IDs" the IDs go in ascending order.
- **The group's rectangle** is the common rectangle of the points of its strokes in the sheet's units, `[ymin, xmin, ymax, xmax]`, by the geometry it was given: on the device by the raw strokes, in the sample by the recorded ones (R09). The "group box" is already fractions of the crop (concepts 15 spec), and it is computed together with `h_med` by T13.
- **What follows from it:**
  - what is written later next to older writing is a group of its own (R06);
  - a stroke that touches two groups joins them only if it is no farther than 2 s from the strokes of both. Otherwise it enters the one that is nearer in time, or stands alone;
  - lines written one after another do not merge: under a stroke of a line lies a stroke written a line later. The exception is short lines of one or two signs;
  - a drawing holds together while its neighboring parts are written without a pause for thought.
- **Code** — `groups.ts` in the DOM-free part, with tests in Node:
  - the rule `GROUP_RULE`;
  - the groups `groupsOf`;
  - the pairs of neighbors `neighboursOf`;
  - the rectangle `rectOf`;
  - the label `labelOf`.

  The synthetic sheets are in the tests, and the test vectors are `vectors/groups.json`. On the page for probes — the groups under the sheet and the rule's fields.

— *Why:* the author's answers in the planning of T12, 2026-10-25. The rule of pairs, the pause of 2 s, nearness by the boxes, the fractions of the crop in T13 and the groups on the page for probes — by the recommendations. The thresholds 50 × 25, which the author chose first, the sweep over synthetic sheets did not confirm: the "ladder" fell apart. Then the author chose 50 × 50 — also by the recommendation. Before the work a separate agent checked the design. Its corrections are the counting in integers, labels without IDs, the clock of the synthetic samples, the file of vectors from the test and the rectangle as a function of its own. The sources are [architecture.md](architecture.md), section 4.
- **Nobody has the rule.** `tutor` builds the groups «так, как их построит устройство, — по пространству и времени, без разметки» (R08 tutor), and `spec` puts a rule with thresholds into the eval protocol by T12 (epic E3 in RUN.md of `spec`). Neither the algorithm nor the thresholds are at `tutor`, at `spec` or at MathTrail.
- **Pairs, not series.** Time is compared between two neighbors, not over the whole sheet. So a return to older writing amid fast work elsewhere still gives a group of its own, as R06 requires.
- **2 seconds.** The mean pause of writing in children of grades 3 and 5 is about 400 ms, and 2000 ms is the threshold below which studies of writing count a pause as part of the writing itself. A longer pause is thought, and what is written after it is already another thought.
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
- **Integers and subtraction.** `tutor`'s runner repeats the rule in Go, and the Go specification allows several floating-point operations to be fused into one and to give a different result. In JavaScript `Math.hypot` is an approximate function. So the distances along the lines of strokes in the two implementations could diverge at the boundary. Here only the conversion to integers rounds — one multiplication by 10 and the rounding of a half up —, and further on the rule subtracts and compares integers and rounds nothing.
- **Labels by place.** Labels in the order of writing would give away the course of the work (R09). The ID is also the order of writing, so it decides only when two groups coincide both in place and in start.

— *Rejected:*
- **series by pauses:** a pause longer than 2 s over the whole sheet starts a new series, and a group is only inside a series. A fast return to older writing would merge with it — against R06;
- **a group is open while it is being written:** a stroke enters the group next to it if its last stroke landed no earlier than 2 s before. Lines would then be kept apart only by a vertical threshold smaller than the gap between lines, 12 units, and dots and bars farther than 12 would move away into groups of their own. Besides, the rule depends on the order of traversal, and it is harder for the runner to repeat;
- **place alone** (C1) — R06 already rejected it;
- **the thresholds 50 × 25**, which the author chose first, — by the sweep above;
- **the distance along the lines of strokes:** a circle around the answer would not take everything inside it, but the root and the fused operations would set the device and the runner apart at the boundary;
- **thresholds from the grid step or from the size of the handwriting:** the rule would need the task's step or an estimate of the handwriting of its own — the device, the runner and the sample alike;
- **a pause of 4–6 s**, like the long pause in `tutor`'s action log and at canvas-api's line, — by the sweep above;
- **labels in the order of writing**, as in the study's example, — they give away the course of the work; **labels by reading lines** — they need a rule of lines of their own;
- **erasing and undo as a boundary of groups:** a correction in place would tear a digit off its number;
- **groups over the whole history, with the erased strokes:** an erased stroke would glue visible ones together, and it is not in the picture;
- **boxes in fractions of the crop in T12:** they need `sheet_box`, the crop's width and height, and that is T13.

— *Revisit:*
- by `tutor`'s measurement, which compares the labels with the model's box (R08 tutor). It came back 2026-10-23, only on the models of Claude (R21 tutor). The reference for the groups is the markup by lines: a group must not go beyond a marked-up line;
- when a task's grid step is not 50 — the thresholds, maybe, from the step;
- when several touches write at once (T35): strokes that overlap in time have a pause of 0;
- if the measurement shows that the merging of short lines in a row gets in the way.

— *Consequence:*
- **T13** — the group boxes in fractions of each crop and `h_med`. A median over groups is fragile: a sheet with one drawing and one number gives the median of two numbers, (300 + 32) / 2 = 166 units, and the digits on the crop come out ≈ 6 px. Whether to compute the median over groups, its planning will decide;
- **T14** — a mark with a group label finds the strokes by the table of its submission;
- **T15** — a clock that continues an assigned history leaves a pause longer than 2 s after it: otherwise the first stroke of a new session would become a neighbor of the strokes of the past one. `exportWork()` takes the groups from `groupsOf`;
- **T17** — the sample rounds the places the same way, `round(10 × v)`, and the time to whole milliseconds, and a half up. The labels are set before the strokes are renumbered (R09);
- amendments to R06 and R09;
- **table 3 of RUN.md** — В35 «в реестр spec»: the rule and the test vectors — to the eval protocol, and for `tutor`'s action log — to which group to assign what is erased.

— `src/core/`, `src/element/probe.ts`, `demo/`, `vectors/`; [architecture.md](architecture.md), sections 3.1, 3.2, 3.5, 3.7 and 4; RUN.md, T12, T13, T15, E4, table 3; README.md.

— *Amendment 2026-10-25:* T13 of the "Consequence" is decided: `h_med` is computed not over groups but over stroke bundles, without time (R25). The groups give the crop the boxes and the table "label → strokes' IDs". — R25; RUN.md, T13.

— *Amendment 2026-10-26:* the "Consequence" about T14 is decided (R26): a mark with a group label holds on to the strokes of its group's row of the table of its submission. The group boxes in the context also check that it is of this sheet: each stroke of the table lies in the box of its group. — R26; RUN.md, T14.

— *Amendment 2026-10-26:* the "Consequence" about T15 is done (R27): the clock after an assigned history runs from its last event plus 2001 ms, and the first stroke of a new session is not a neighbor of the strokes of the past one. `exportWork()` takes the groups from `groupsOf`. That the context is of this sheet is checked no longer by the group boxes, as the 2026-10-26 amendment said, but by the submission's digest. — R27; RUN.md, T15.

— *Amendment 2026-10-26:* the "Revisit" about several touches is closed: T35 kept one writing pointer (R29), and there are no strokes that overlap in time. — R29; RUN.md, T35.

— *Amendment 2026-10-26:* В35 is recorded in `spec` (R31). The eval protocol takes the group rule and `vectors/groups.json` as they are, and assigns an erased stroke to the groups of the visible strokes that would have been its neighbors: without visible neighbors — to none, with neighbors in two groups — to both. The vectors will come out in `spec`'s releases by way of T35 in RUN.md of `spec`, and `canvas` will take them from there (epic E3 there too). — R31.

— *Amendment 2026-10-27:* the workbook has no groups. Their place is taken by the boxes: the table "box → strokes' IDs" stands in the submission's context instead of the table of labels (R34). — R34.

— *Amendment 2026-11-08:* the group rule is now the eval protocol, as written here, with the groups of an erased stroke beyond it (R94 spec; [the text of the contracts](../spec/contracts/README.md) at the tag v0.9.8, section "The rules the device and the runner share"). Its test vectors are `vectors/eval/v1/groups.json` of the package `@altnovatrail/contracts`, and the groups test checks the sheet's code against them, and `vectors/groups.json` is removed. The rule changes only in `spec`, and `canvas` brings a change as a row «в реестр spec». — R47.

**R25. The crop for checking is by stroke bundles: the scale is such that the lower median of the bundles' heights, but no higher than 100 units, becomes the digit height D. The crop fits into Claude's standard level — no longer than 1568 px and no more than 1568 tokens —, and a side smaller than 200 px gets a wider margin. The line is D / 12, and the group boxes are by the ink, outward. The crop's numbers are computed in integers, and the raster and the PNG are code of its own, the same in any JavaScript engine.**
- **The input:**
  - the visible strokes of the final sheet, their groups by R24 and the digit height D — an integer number of px from 1 to 256;
  - places are in tenths of a unit, `round(10 × v)`, a half up, as for the groups (R24). So both the numbers and the raster are computed;
  - errors:
    - a point that is not finite or is outside the sheet, a D not from the range — `RangeError`;
    - a stroke without points, an ID twice, groups that do not cover the visible strokes exactly once each — `TypeError`;
  - an empty sheet gives no crop, and in its place is `null` (H3).
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
- **`sheet_box`** is where the crop together with its margins lies on the sheet, in the sheet's units: xmin = B.xmin − left margin / s, xmax = xmin + width / s, y — the same way.
- **The line** is max(D′, 12) / 12 px: at 32 px — 2.67, at 16 — 1.33, at 48 — 4, and no thinner than 1 px. At any D up to 256 its half is smaller than the margin.
- **The group boxes** are the group's ink: the rectangle of its points, widened by half the line and by the pixel of its edge, in fractions 0–1000 of the crop, `[ymin, xmin, ymax, xmax]`. The raster also paints this pixel, so every pixel of the group's ink lies in its box. The minimum is rounded down and the maximum up, so min < max for any group, a dot's too (Т-32).
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
- **What follows from it:**
  - a drawing, a fraction, a column and a circle around the answer do not throw the scale off;
  - the scale depends neither on the groups nor on the order of writing: the same final sheet gives the same crop;
  - the crop of a measurement sample matches `app`'s crop byte for byte: both compute in tenths. For the eval-set samples and the child samples the numbers are the same if the resampling keeps the extreme points of a stroke;
  - the weak spots are lines that touch, a cross through the whole writing and a frame around everything. They glue the bundles together, and the digits come out smaller than D;
  - long work is drawn smaller than D, and D′ says so.
- **Code** — the DOM-free part, with tests in Node:
  - `crop.ts` — the constants `CROP`, the bundles `bundlesOf`, the median `medianOf` and the crop's numbers `cropOf`;
  - `raster.ts` — the pixels `rasterOf` and the crop's PNG `pictureOf`;
  - `png.ts` — the encoder `encodePNG`;
  - `sets.ts` — the union-find of the bundles and of the groups, and `geometry.ts` — the conversion to tenths, shared with the groups.

  The synthetic sheets are `sheets.fixture.ts`, outside the build and the package, and the test vectors are `vectors/crops.json`. A test in Chromium checks that the browser reads the PNG into the same grays. On the page for probes — the crop at the chosen digit height and its size at the heights of eval.

— *Why:* the author's answers in the planning of T13, 2026-10-25. The bundles, the limit of the standard level with a lower limit of 200 px and the line D / 12 — by the recommendations. The author did not split the task — not by the recommendation. Before the work a separate agent checked the design. Its corrections:
- a budget of tokens instead of one long side;
- bars do not link bundles;
- the boxes are by the ink, outward;
- the vectors carry integers, and the numbers are checked against a reference on BigInt;
- the groups and the points are checked at the input;
- the raster is protected from approximate functions;
- LZ77 — with two candidates;
- the module of the synthetic data — outside the build.

The sources are [architecture.md](architecture.md), section 4.
- **Nobody has the rule.** `tutor` says only «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px; основная — 32 px» (R08 tutor). `tutor` has no code of rendering, and `spec` puts «правила вырезки» into the eval protocol: «они одни у устройства и раннера».
- **The median of the groups is fragile.** A group of R24 is the whole writing: a fraction, a column, lines in a row. On the "ladder" the ordinary median of the groups is 46 units at a digit of 36, and a drawing with a number gives the mean of the drawing and the digit, 168. Bundles take a sign on its own, and a drawing as one bundle.
- **The sweep.** Twenty-six synthetic sheets — the eleven sheets of T12 and fifteen sheets of the crop. The median of each was written down before the run. "Breaks" means that the digits at D = 32 come out smaller than 31 px or larger than 48:

  | Rule | What breaks |
  |---|---|
  | bundles, bars outside the count, the lower median, 15 and 100 units — accepted | lines that touch: digits of 16 px |
  | the same, bars link | also a fraction whose bars touch the digits: 16 px |
  | the same, a bar is lower than 10 units | also a "5" with a slanted underline: 110 px |
  | the same, without a ceiling or with a ceiling of 200 | a drawing alone shrinks to 32 or 48 px; lines — 11 px |
  | the same, the ordinary median | a drawing with a number and a house with a number — 12 px; fractions — 29 px |
  | the heights of strokes, the lower median | a house with a number — 14 px; at a "4" and a "+" of two strokes the digits are larger, up to 46 px |
  | the groups of R24, the lower median | a fraction — 16, a column — 12, a circle around the answer — 21, words — 21 px |
  | the groups of R24, the ordinary median, as in R06 | also the "ladder" — 25, fractions — 17, a drawing with a number — 12 px |

  There is no rule without failures: bundles break on lines that touch, the heights of strokes on a drawing next to a number.
- **The standard level.**
  - Claude has two levels: "Standard | All other models | 1,568 px | 1,568" and "High-resolution | Claude 4.7 and later models | 2,576 px | 4,784". A picture costs "⌈width / 28⌉ × ⌈height / 28⌉ visual tokens", and "Images larger than either limit are downscaled before processing".
  - `tutor`'s Claude adapter tells the API to reject a picture that the API would downscale (the 2026-10-25 amendment to R19 tutor). A crop larger than the model's limit would fail the call.
  - The standard level is taken by any model of Claude, and by OpenAI at `high` — up to 2,500 patches of 32 px and 2048 px — too.
  - A sheet filled with digits of 36 units fits at D = 32: 913 × 1269 px, 1518 tokens.
- **No smaller than 200 px.** "Claude might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels". An answer of one digit at 32 px is 16 × 32 px of work: the margin around it grows, and the scale does not.
- **The line D / 12.** `tutor`'s board draws 3 px at one unit per pixel, and the digit of its synthetic samples is 36: that is 1/12. Crops at different D are one drawing at different scales. At canvas-api the line was 4 units at one pixel per unit.
- **Boxes by the ink.** By Т-32 a box is valid only if «целые 0–1000 и min < max». For a group of a dot or of a bar a box by the points degenerates. The pixel of the edge was added to the box by the review: the raster paints pixels another half pixel beyond the edge of the line, and without it the light edge of the ink went outside the box.
- **Integers and one division.** Go may fuse "x*y + z" into one operation, while a division of two integers is one operation, and IEEE 754 rounds it the same way. Computing `sheet_box` by the formulas of section 3.2 in floating-point numbers diverges from the exact result in the last bit in about a third of cases — 948.4499999999999 instead of 948.45 on a probe of 100,000 random sheets —, so the vectors carry integers.
- **A raster and a PNG of its own** — R05: the HTML Standard does not set the bytes of a PNG, and the browser's drawing surface brings in noise. In ECMAScript `Math.sqrt` is "Return 𝔽(the square root of ℝ(n))", and `hypot` and trigonometry are "implementation-approximated". So perfect-freehand does not go into the crop.

— *Rejected:*
- **the median of the groups of R24**, as in R06, — by the sweep: a fraction, a column and lines in a row are one tall group;
- **the heights of strokes** — by the sweep: a drawing of many tall strokes next to one number throws the scale off;
- **bundles by the touching of lines, not of boxes** — the sample's resampling would change the touching, and the median would jump;
- **the ordinary median** — with two bundles, a drawing and a number, it is their mean;
- **bars that link** — a fraction whose bar touches the digits becomes one bundle;
- **perfect-freehand and the browser's drawing surface on the crop** (R05);
- **deflate without compression** — 1.2 MB for the crop of the whole sheet;
- **dynamic Huffman** — it would compress better, but it needs code trees of its own and their own recording, and the crop of a sheet of lines weighs a few KB anyway;
- **LZ77 hash chains** — the repeats of strokes on white are runs of white and the row above;
- **color and alpha** — the crop is gray;
- **Claude's high level** — a model of the standard level would downscale such a crop, and `tutor`'s adapter rejects such a one;
- **a crop without a lower limit** — it can be smaller than 200 px;
- **a line as on the screen, 3 units × s,** — thin for large handwriting, bold for small;
- **a constant line, 3 px,** — bold at 16 px and thin at 48;
- **boxes by the points with the rounding of a half** — for a dot and a bar min = max, and Т-32 does not accept such a box;
- **boxes by the edge of the line, without the pixel of the edge,** — the light edge of the ink goes outside the box;
- **two tasks** — the crop's numbers (T13) and the picture (T40). The author kept one.

— *Revisit:*
- by `tutor`'s measurement (R21 tutor): the median, the heights D and the line — when it shows at which heights the model reads better;
- when the list of models is fixed (R07 spec): if they are all of the high level, the limit can be raised;
- if lines that touch or crosses through the writing turn up in the samples — the rule of bundles;
- on the move to `spec` v0.2.32 — the crop of a workbook's answer slot.

— *Consequence:*
- **T14** — the model's box in fractions lands on the sheet by the `sheet_box` of its submission, with its margins;
- **T15** — `exportWork()` calls `groupsOf`, `cropOf` and `pictureOf`, and takes D from the task. What the entry point `core` exports, it decides;
- **T17** — the resampling keeps the extreme points of a stroke; `h_med` is by the recorded geometry, and the boxes by the groups;
- **T18** — the synthetic samples are drawn by the same code;
- **`tutor`** — the runner draws the states and the frames by this rule and converts the strokes to the crop's pixels with the same integers (R11 tutor);
- amendments to R05, R06, R09 and R24;
- **table 3 of RUN.md** — В36 «в реестр spec».

— `src/core/`, `src/element/picture.test.ts`, `src/element/probe.ts`, `scripts/package.ts`, `tsconfig.build.json`, `demo/`, `vectors/crops.json`; [architecture.md](architecture.md), sections 3.1, 3.2, 3.5, 3.7 and 4; RUN.md, T13, T14, T15, E4, table 3; README.md.

— *Amendment 2026-10-26:* the "Consequence" about T14 is decided (R26). The model's box lands on the sheet by the `sheet_box` of its submission, with its margins, — in integers, on the crop itself, with the same numbers as its raster. The formula of `sheet_box` is moved out into `sheetBoxOf`: by it the element checks the context that came back with the marks. — R26; [architecture.md](architecture.md), section 3.2; RUN.md, T14.

— *Amendment 2026-10-26:* the "Consequence" about T15 is done (R27): `exportWork()` calls `groupsOf`, `cropOf` and `pictureOf` through `workForCheck`, and takes D from the task's temporary field `canvas.digit` — from 1 to 256 px, 32 by default. Of `crop.ts`, `raster.ts` and `png.ts` the entry point `core` exports nothing: the rules of the crop wait for the eval protocol (В36). — R27; RUN.md, T15.

— *Amendment 2026-10-26:* Т-32 is closed by R53 spec (R30). The place in the observation and in the contract is fractions 0–1000 of the crop, `[ymin, xmin, ymax, xmax]`, integers, and the validity of a box — integers 0–1000 and min < max — is checked by the adapter. So "min < max for any group, a dot's too (Т-32)" above now rests on R53 spec. The digit height by R51 spec is in the module manifest, `canvas.digit_height` (an amendment to R27). — R30.

— *Amendment 2026-10-26:* В36 is recorded in `spec` (R31). The eval protocol takes the rules of the crop and `vectors/crops.json` as they are: the scale is by the lower median of the bundles' heights, no higher than 100 units, and the numbers are in integers. The term "stroke bundle" is in concepts 15 spec, and Т-31 and «Вход» of T28 in RUN.md of `spec` speak of bundles. "The rules of the crop wait for the eval protocol (В36)" in the amendment about T15 above reads so: the protocol has accepted them, and the entry point `core` does not export them while it does not exist — epic E3 in RUN.md of `spec` has not begun. — R31.

— *Amendment 2026-10-27:* the "Revisit" about the crop of a workbook's answer slot is decided (R34): on the workbook this rule draws the crop of each filled box by its strokes, at the manifest's digit height. — R34.

— *Amendment 2026-10-27:* on the workbook this rule draws the crop of each filled box — by its strokes, as one group, at the manifest's digit height (R38). There are no crop numbers in the workbook's context: there is no snapping there. At the heights of eval the crop of a box is the lower limit, 200 × 200 px, that is, 64 tokens. — R38.

— *Amendment 2026-11-08:* the crop rule is now the eval protocol, as written here (R94 spec), and the crop test checks the code against `vectors/eval/v1/crops.json` of the package `@altnovatrail/contracts`: `vectors/crops.json` is removed. The protocol's `bundle_median` is h_med itself, and the crop's `exact.median` is H, min(h_med, 1000), the height the scale takes. The rule changes only in `spec`. — R47.

**R26. The tutor's marks hold on to the learner's strokes: a mark of the sheet is `{stroke_ids, snapped_box}`, and its box stands around those of its strokes that are visible now. The model's box in fractions of the crop is snapped to the strokes by a rule in integers: the box is wider by a quarter of the digit height, and a stroke is taken if no fewer than two thirds of its points are in it. The marks come by the property `marks` from T14, together with the context of their submission, and for now one kind is drawn — the frame.**
- **The input is the property `marks`:** the marks of one submission together with its context. The types are its own, temporary, until the contract of epic E3 in RUN.md of `spec` (R36 spec):
  - the context is the crop's numbers, as `cropOf` gives them, with `sheet_box` and the group boxes, and the groups of `groupsOf` — the table "label → strokes' IDs". The context returns only to the element that gave it out;
  - a mark is the kind `frame`, a place and a name. The place is a group label, an answer slot or a box `[ymin, xmin, ymax, xmax]` in integer fractions 0–1000 of the crop, and the name is what a screen reader reads, in the consumer's words;
  - `undefined` removes the marks. Each value is checked anew, even the same object, and marks of the same names on the same strokes write nothing.
- **The check** — a `TypeError` with the field's path:
  - the kind is not `frame`, the name is empty, the place has not exactly one key, the box is invalid by Т-32, the label is not in the table, IDs repeat in the groups;
  - the group boxes are not the right ones or not in the right order, or `sheet_box` is farther than a millionth of a unit from what the crop's integers yield. Snapping computes on integers, and a millionth can be lost by a store that keeps numbers shorter than JSON;
  - the context is someone else's: a stroke of the table is unknown to the sheet or does not lie wholly in the box of its group. Its own context always passes this: a group box takes its points with the edge, outward (R25);
  - the fields the sheet does not read, it skips. A value assigned before registration goes through the shared helper, so the errors are only `TypeError`, and `null` is an error too, as with `task`.
- **Where a mark is** is decided on assignment — by all the strokes the sheet has known, the erased ones too, but only from the submission's table:
  - a group label — the strokes of its row of the table;
  - a box — snapping, below;
  - a slot — no strokes, while the task has no slots: their zones will come with format v0 («Вход» of T28 in RUN.md of `spec`).

  `stroke_ids` are the strokes taken, and `snapped_box` is the rectangle of their points, what the model saw. What is written after the submission is not in the table, and no mark takes it. Not a single stroke — there is no mark, and the question sounds without it (R43 canvas-api; C1).
- **Snapping** — on the crop, in integers:
  - D′, the width w and the height h, the margins my and mx, B — the box of the points in tenths, H — the height by which the scale is taken, in tenths (R25);
  - a point in tenths (px, py) stands on the crop at X = 1000 × ((px − B.xmin) × D′ + mx × H), and Y — the same way, with py, B.ymin and my: the place in px multiplied by 1000 × H;
  - a box holds a point if (xmin × w − μ × D′) × H ≤ X ≤ (xmax × w + μ × D′) × H, and the same by y, with h. The edges are inclusive, μ = 250 thousandths of D′;
  - a stroke is taken if k of its n points are in the box, k ≥ 1 and 3k ≥ 2n — no fewer than two thirds;
  - this is the same as laying the box on the sheet by `sheet_box` and widening it by H / 4. The box is first widened, then clipped by the sheet's bounds, and the clipping changes nothing: the points lie on the sheet;
  - for the submission's strokes every number is smaller than 2^31. The margin and the threshold are parameters of eval (C2): the function takes the rule, as `groupsOf` does, and an invalid rule is a `RangeError`.
- **The box on the sheet:**
  - around the points of those strokes of the mark that are visible now and not under the eraser's press, 10 units from them, as in canvas-api, and within the sheet;
  - the corners are rounded, and the line is 2 CSS px at any zoom;
  - the color is the variable `--novatrail-canvas-mark`, blue `#2563eb` by default, temporarily and not red (E4 in RUN.md, «Не входит»). In forced colors — `Highlight`;
  - new strokes do not move it. If all its strokes are erased, it is not seen, and undo brings it back.
- **Over a mark.** While the new points of the stroke being written, with the ink's reach, enter a mark's box, the mark fades to a quarter, and so until the stroke has landed or has been undone. A box that has appeared or moved in the middle of a stroke is checked against the whole stroke. The other marks do not change, and there is no transition.
- **Accessibility:**
  - the marks layer has a constant `role="none"`, and no `aria-hidden`;
  - a visible mark is `<rect role="img" aria-label="name">`, and a hidden one is `display="none"`;
  - the layer takes no input: `pointer-events: none`, as on all the layers but the drawing surface (R23).
- **Code:**
  - the DOM-free part: `marks.ts` — the rule `SNAP_RULE`, the check `marksOf`, the snapping `snapOf`, the marks' places `placesOf` and the current box `shownOf`. The check's helper shared with the task is `fields.ts`, the box around boxes `around`, shared with the crop, is in `geometry.ts`, and the crop's private `Mark` and `marksOf` became `Extent` and `extentsOf`;
  - the element — the property `marks` and the marks layer; `probe.ts` gives the tests the marks and their boxes;
  - the test vectors are `vectors/snaps.json`, and the generator of sheets with a seed is in `sheets.fixture.ts`, shared with the crop test. On the page for probes — the marks by a frozen submission.

— *Why:* the author's answers in the planning of T14, 2026-10-26. Fading while one writes over a mark, `marks` in T14 and a slot that the type accepts but does not draw — by the recommendations. The margin and the threshold — too, but in two steps: first a quarter of a digit and half of the points, as in R43 canvas-api, and the sweep did not confirm the half, and the author took two thirds. Before the work a separate agent checked the design. Its corrections:
- the margin is a parameter of the rule, and at a threshold of 0 a stroke is taken only if at least one point is inside;
- the box is first widened, then clipped;
- the reference in BigInt is derived from `sheet_box`, and does not repeat the formula;
- where a mark is is decided by all the strokes the sheet has known, and what is seen — on drawing;
- the check of someone else's context;
- the marks layer has `role="none"`;
- fading — by the new points of the stroke;
- the submission on the page for probes is frozen.

The sources are [architecture.md](architecture.md), section 4.
- **Nobody has the rule in code.** R43 canvas-api takes the strokes «у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц», but its T71 is not done. The study says «штрихи, точки которых в основном внутри (поля и порог — параметры eval)» (C2). `tutor` rejected snapping: the board draws the model's box as it is (the T45 amendment to R19 tutor), and the measurement credits it by the line — «в рамке с полем 8 px больше всего видимых точек именно этой строки» (R24 tutor).
- **The margin is from the digit height.** The model's error is measured in the pixels of the picture it saw, and the digits on the crop are D′ px at any handwriting. 10 units of the sheet on the crop are from 3 px for large handwriting to 21 px for small. A quarter of a digit at D = 32 is 8 px, as much as the margin of `tutor`'s measurement.
- **The sweep.** Thirty-four synthetic sheets — the sheets of T12 and of the crop — at the heights 16, 32 and 48 px. The target is a group, a bundle or a bar, and the model's box is the ink box of the target with each edge shifted at random by up to ⅛, ¼ or ½ of the digit height, 40 boxes per target. The strokes' points go every 2 units, as with input. The shares — at shifts of up to ⅛, ¼ and ½ of a digit:

  | Margin and threshold | Exact | Extra strokes | No box |
  |---|---|---|---|
  | a quarter of a digit, two thirds — accepted | 81, 77, 61 % | 19, 23, 26 % | 0, 0, 8 % |
  | a quarter of a digit, half — at first | 80, 74, 59 % | 21, 26, 31 % | 0, 0, 6 % |
  | an eighth of a digit, half | 88, 80, 55 % | 12, 14, 18 % | 0, 4, 19 % |
  | an eighth of a digit, two thirds | 89, 81, 49 % | 11, 12, 13 % | 0, 5, 28 % |
  | 10 units, half — R43 canvas-api | 75, 70, 59 % | 25, 29, 34 % | 0, 0, 4 % |
  | no margin, half | 76, 61, 38 % | 6, 6, 8 % | 17, 29, 45 % |
  | half a digit, half | 48, 49, 49 % | 52, 52, 51 % | 0, 0, 0 % |

  Two thirds at the same margin are better than half at any shift and take a neighbor less often. An eighth of a digit is more exact at small shifts, but at large ones there is no box one time in five, and the models' boxes on handwriting are inexact: the best model's F1 on the answer boxes is no higher than 55 % (R08 tutor). On the polylines of the synthetic samples, where a stroke has from two to seven points, half took a neighbor with one end in the box, and exact came out 70, 65 and 50 %.
- **By all the strokes the sheet has known.** A mark holds on to what the model saw. Were it decided by the visible ones only, the marks that came after a clearing would not come back with undo, and a stroke erased before the mark came would not come back into its box.
- **Someone else's context.** Each element numbers the strokes from 1, and a new task is a new element (R20). Another element's context would land on foreign strokes with the same IDs. Its own context always passes the check, and a foreign one only if its strokes lie where the strokes of this sheet lie: that happens if the same thing was written in the same places on two sheets. The check would be made exact by a stamp of the submission that `exportWork()` issues and `marks` checks — this is T15.
- **Fading over a mark.** A mark does not cover the learner's work (R05 spec), and the box's line over the ink would cover what the learner writes across it. Only the mark that is being written into fades, and only while the writing goes on.
- **`role="none"`.** A root `<svg>` without `aria-hidden` the locators engine of Vitest counts as a picture: `SVG:()=>'img'`, and in Chromium it is a node of its own. A layer without a role would be read as an extra picture without a name, and `aria-hidden` would hide the marks too.

— *Rejected:*
- **10 units of the sheet, as in canvas-api,** — the margin depends on the handwriting, and by the sweep there are fewer exact ones at any shift;
- **half the points** — by the sweep: at the same margin there are fewer exact ones, and more neighbors;
- **no margin** — a model's box slightly narrower than the writing loses strokes: at a shift of up to ¼ of a digit there is no box almost every third time;
- **clipping first, widening then** — a box in the crop's margin beyond the sheet's edge would not take the ink at the edge;
- **deciding by the visible ones on assignment** — the marks after a clearing would not come back with undo;
- **a limit on the box's area, as in spec 4.4 canvas-api,** — the validity of a box is checked by `tutor`'s adapter (Т-32), and the crop is cut to the work, and a large box on it is legitimate — for a column, for example;
- **removing a mark when any of its strokes is erased,** as in canvas-api, — C2 and T14 remove it when all of them are erased;
- **removing `aria-hidden` when there are marks,** as the "Consequence" of R23 told, — the layer would be read as a picture with no name;
- **a mark that does not fade** — the box's line would lie on what the learner writes across it; **all the marks fade for the time of any stroke** — they would blink on every stroke;
- **`marks` in T15, as in R07,** — the tests and the page for probes would set the marks through `probe.ts`;
- **a slot is a `TypeError`** — one such mark would break the whole assignment; **slots in the task now** — format v0 may name them otherwise.

— *Revisit:*
- the margin and the threshold — by `tutor`'s measurement, if it measures the place on the device, and by the eval protocol (C2; В37);
- if the eval-set samples and the child samples take the points by the length of the stroke, not as they came (T17): the share of points depends on how densely they stand;
- when the answer slots come — format v0;
- the color and the look of the box — with the first slice of `app` and `api` (E4 in RUN.md, «Не входит»);
- the check that the context is its own — with `exportWork()` (T15): the stamp of the submission that it issues and `marks` checks would make it exact.

— *Consequence:*
- **T15** — `exportWork()` gives out a context of the type `Submission`, and a new `history` decides anew where the marks are. The trial consumer gives marks with a context;
- **T17** — snapping counts the points as they are, so the sample's resampling changes the share: the sample's rule with it goes to В37;
- amendments to R06, R07, R09, R22, R23, R24 and R25;
- **table 3 of RUN.md** — В37 «в реестр spec».

— `src/core/`, `src/element/`, `demo/`, `vectors/snaps.json`; [architecture.md](architecture.md), sections 3.1, 3.2, 3.3, 3.5, 3.7 and 4; RUN.md, T14, T15, E4, table 3; README.md.

— *Amendment 2026-10-26:* the check by place was replaced by the submission's digest (R27), and the "Revisit" about the stamp of the submission is decided. The context carries the digest of the table's strokes and of the crop's integers. A stroke of the table that the sheet did not know is a `TypeError`, and so is the digest of the strokes the sheet knows with the given integers, if it is not the right one. The context now goes to any sheet whose history holds its strokes — and to the same sheet after a reload. A new `history` sets the marks anew, wholly: if they do not land, `marks` = `undefined`. Marks before their history are a `TypeError`, and the consumer gives `history` before `marks`. The "Consequence" about T15 is done. — R27; [architecture.md](architecture.md), section 3.3; RUN.md, T15.

— *Amendment 2026-10-26:* a mark's place in the contract is fractions 0–1000 of the crop: Т-32 is closed by R53 spec the way R06 decided, and `canvas` converts them into the sheet's units (R30). The marks in `api`'s answer — a group label, an answer slot or a box — come in the same fractions. A box "invalid by Т-32" above is now invalid by R53 spec. Of В37 the place is so decided, and the submission's context, the snapping rule and the term wait for a record in `spec`. — R30; RUN.md, table 3.

— *Amendment 2026-10-26:* В37 is recorded in `spec` (R31):
- the mark, its kind and its place are in the contract `app` ↔ `api`, epic E3 in RUN.md of `spec`. There is one kind so far, a box, and `app` writes the name for the screen reader in its own words; what comes from `api` for the name, the contract decides;
- the eval protocol takes the snapping rule and `vectors/snaps.json` as they are, and the margin and the threshold are parameters of eval;
- the term «пометка наставника — mark» is in concepts 15 spec;
- the crop's integers and the digest in the submission context are the second 2026-10-26 amendment to R36 spec (the amendment to R27).

— R31.

— *Amendment 2026-10-27:* on a workbook a mark comes only with an answer slot — the numbers of the item and of the box, from 1, not IDs — and holds on to the strokes of its box from the submission's table, by the rules of this entry. On a workbook a mark's place is only a slot: a group label and a model's box in fractions of the crop are a `TypeError` (R34). T49 puts a mark on a box. — R34.

— *Amendment 2026-10-27:* T53 puts a mark on a box, not T49: the author split T49 while planning it. The box of a mark on a box goes around the box itself and the visible ink of its strokes together, with a margin of 10 units. This is the author's answer, and T53 will make the amendment to this entry. — R38.

— *Amendment 2026-10-27:* on a workbook a mark comes with a slot by place — `{ item, slot }`, from 1 — and holds on to the strokes of the row of its submission's table, and its box stands around the box and the visible ink of its strokes together (R39). On a sheet too the slot is by place, not by ID, and gives no box there: the sheet takes no zones. A slot not from the table has no box. — R39.

— *Amendment 2026-11-08:* the snapping rule is now the eval protocol, as written here, and the margin and the share are still parameters of eval (R94 spec). A test checks the code against `vectors/eval/v1/snaps.json` of the package `@altnovatrail/contracts`: `vectors/snaps.json` is removed. The rule changes only in `spec`. — R47.

— *Amendment 2026-11-08, T17:* eval-set samples and child samples take the points along the length of the stroke, every 0.25 units (R48): the *Revisit* above has fired. The share of points that snapping counts is then another for them than for the sheet that wrote them. There is no snapping in a sample, and `tutor`'s runner does not do it (R24 tutor), so there is nothing to drift apart until someone snaps a box to the strokes of the geometry. This is В61 «в реестр spec» in table 3 of RUN.md. — R48.

**R27. The package's interface: the writing history comes in by the property `history` and goes out by it and by the event `historychange`, and the work for checking by `exportWork()`: the PNG of the crop and the submission context with its digest. The same history changes nothing, and another one, once checked, replaces the sheet and places the marks anew. `exportPNG()` and `workchange` are removed, the entry point `core` gives the data types and `replay`, and the element's own buttons are T41.**
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
    - the clock runs from the last event + the groups' pause + 1 ms, 2001 ms (R24), and from 0 for an empty history. The sheet's time is its history's time;
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
  - a stroke that landed when the element had left the page is heard only by the element's own listeners (R20). So `app` listens to the element, not to an ancestor.
- **`exportWork(): Promise<{ png, submission } | null>`:**
  - the sheet at the moment of the call: the stroke under the pen is not on it, and the strokes under an eraser not yet lifted are;
  - the groups by `groupsOf`, the crop by `cropOf` at the task's digit height and the PNG by `pictureOf` (R24, R25). The height is the temporary field `task.canvas.digit`: integer px from 1 to 256, 32 by default — a setting of the module's canvas, as «Вход» of T28 in RUN.md of `spec` calls it;
  - the context is `{ crop, groups, digest }`, frozen: `crop` holds only the numbers by which the marks are placed (`CropNumbers`);
  - for an empty sheet, `null` (H3);
  - the DOM-free part, `workForCheck`, computes all of it, and the element only puts the bytes into a `Blob`.
- **The submission digest** is CRC-32 and Adler-32 from the PNG encoder, 16 hexadecimal digits, of a text in UTF-8:
  - the strokes of the table in ascending order of ID: the ID and the points in tenths of a unit and whole milliseconds, as the rules see them (R24, R25);
  - the context's integers: D′, width, height, margins, `exact`, groups and boxes. `sheet_box` is not in the text: it is derived from these numbers and checked against them with a tolerance (R26).

  The digest catches an accidental divergence, not a forgery: CRC-32 sees any change within 32 consecutive bits, and any other passes both sums with a chance no greater than about 2⁻³². `marksOf` checks the digest's form, and `placesOf` the digest itself: a stroke of the table that the sheet did not know is a `TypeError`, and so is a digest of strokes the sheet knows, erased ones too, with the integers given, if it is not the right one. The check by place of R26 goes, and the matching of the boxes' labels against the groups stays. The same history after a reload gives the same digest, and a sheet with other work or a changed context gives a `TypeError`. `app` keeps the history and the context as they are, through JSON: a store that rounds changes the digest.
- **Marks under a new history** are placed anew, whole: the digest holds the whole table. If they fit, they stay, and what has not changed is not written to the DOM. If they do not, `marks` = `undefined`, and there are no boxes. Marks before their history are a `TypeError`, as in R26, so the consumer gives `history` before `marks`.
- **Removed** are `exportPNG()` and `workchange`, and with them the path of the pen without pressure for the picture of the sheet. The package had not come out: there are no GitHub releases, and npm gives 404.
- **`core`** gives `SHEET` and `replay`, and as types `Stroke`, `InkPoint`, `HistoryEvent`, `Task` with its parts and `GridKind`, `Marks`, `Mark`, `Anchor`, `Submission`, `CropNumbers`, `Crop`, `Frame`, `Group` and `Box`. `Media` stays with the element: it holds a `Blob`.
- **In passing:**
  - the input recorder clamps pressure to 0–1: an event that a script makes may give more, and the sheet would write a history it would not itself accept;
  - a stroke whose points are far outside the visible part is not drawn until it comes into it: an assigned history can hold thousands of strokes;
  - a stroke's ID does not repeat within one history.
- **The element's types** are `HistoryChange`, `HistoryChangeEvent` and `ExportedWork`, and `historychange` is in `GlobalEventHandlersEventMap`, with no code: the type holds on the element, on its ancestors and on `document`.
- **Code:**
  - in the DOM-free part: `resume` of the clock, `restart` of the input recorder, the check of the history and its comparison (`history.ts`), the restoring of the work, `Work.restore`, with actions that take the event's time, `nextIdOf` and `resumeOf` (`work.ts`), the digest `digestOf` (`marks.ts`), the work for checking `workForCheck` (`submission.ts`) and `canvas.digit` (`task.ts`);
  - in the element: `history`, `historychange`, `exportWork()` and the new placing of marks;
  - the type checks: `entry.check.ts` and `interface.check.ts`;
  - the trial consumer: `app`'s path; the page for trials: by `exportWork()` and with the button "Reopen".

— *Why:* the author's answers in planning T15, 2026-10-26, all by the recommendations: split it into T15 and T41; remove `exportPNG()` and `workchange`; the submission's sign is a digest; a new history places the marks anew; `core` is the types and `replay`. Before the work a separate agent checked the design. Its corrections:
- the check of the history goes through the actions of the sheet's work with the event's time, without the clock;
- there is no comparison with the last value assigned;
- time only for order;
- the event is reliable when a listener itself acts or assigns a history;
- the history's arrays are frozen too;
- the digest holds the context's integers too;
- pressure is clamped to 0–1, and only visible strokes are drawn.

Sources: [architecture.md](architecture.md), section 4.
- **The split.** The buttons need a shared scheme of translations for UI packages, and T07 of `app`, which has not started, will hand it over: `app` has no code. `app` and epic E5 need the interface of the history and of the check before the buttons.
- **One event.** `historychange` comes at the same moments as `workchange`: one history event per action. Two events per action would double the listeners, and `detail` gives `app` what it has to append on the device.
- **One picture.** What goes to the check is the crop by A3 (R06). The PNG of the whole sheet was for the board (R20), the board did not take the element (В31), and beside `exportWork()` it would invite sending the wrong picture.
- **The same history, by content.** `app` keeps its copy — appended to, or read from the device — and gives it at every re-render. A comparison with the last array assigned would miss a copy appended to in place, and by identity alone the sheet would be rebuilt at every re-render.
- **A strict check.** The sheet takes only a history it could have written itself. The undo stack is built by the same rules that built it in writing, and `undo()` after opening takes back the previous action (R19). Time only for order: the exact time of a record and growing IDs follow from a single pointer, and T35 may let several touches in at once (R22).
- **The digest.** Every sheet numbers its strokes from 1 (R20), and the check by place of R26 let through another sheet with the same work in the same places. The digest knows the strokes to a tenth and a millisecond, as the rules see them, and the context's integers: changed numbers of the crop would otherwise place the marks by numbers that are not theirs. It is synchronous, since the setter of `marks` is synchronous. It catches no forgery, and there is no need to catch one: the context is `app`'s own data, and an error of `app` — another's context or a changed one — it does see, but for a case with a chance of about 2⁻³².
- **A pause after the history.** Without it, the first stroke of a new session would become a neighbor of the previous session's strokes and join their group (R24).
- **Reset what is under the pen.** The ID of the stroke under the pen may coincide with a stroke of the new history, and its time may turn out earlier than the history's last event. The IDs an eraser's press has taken are from the previous sheet too: keep it, and lifting it would erase the strokes of the new history with the same IDs.
- **`core`.** A consumer without the DOM needs to read a saved history: the types and `replay`. The rules of the groups, of the crop and of snapping are proposals to the eval protocol (В35–В37), and in `core` their signatures would become the package's interface before the protocol.

— *Rejected:*
- **as one task**: split by the recommendation;
- **`exportPNG()` and `workchange` beside the new interface**: two events per action and a picture that does not go to the check; **removing only `workchange`**: the PNG of the whole sheet would be left with no consumer;
- **the check by place, as in R26**: it lets through another sheet with the same work;
- **marks that a new history always removes**: the same history after a reload would lose them; **marks that wait for their history**: another's context would then silently show nothing, without a `TypeError`;
- **comparison with the last array assigned** and **by identity only**: for the reasons above;
- **the exact time of a record and growing IDs**: several touches at once would break them (T35);
- **`core` with the rules**: before the eval protocol; **`core` with `SHEET` only**: a consumer without the DOM could not read the history;
- **SHA-256**: in the browser it is asynchronous; **one CRC-32**: it alone would be enough, and Adler-32 is a second sum for free, from the same PNG code;
- **an event on an assignment of `history`**: the assignment is the consumer's own action;
- **the buttons and `lang` in T15**: that is T41.

— *Revisit:*
- the types, with the release of `spec` (T35 in RUN.md of `spec`), and the composition of the event and of the context, with the contract of epic E3 and the eval protocol (В38);
- the check of the history, if other code starts to give one: the stack rules are then a format;
- the warning about the beginning of a history, if a consumer rolls the sheet back that way on purpose;
- the picture of the whole sheet, if the board takes the element (В31).

— *Consequence:*
- **T41** — its own buttons, labels by `lang` and the task's tools;
- **T16, T17** — the measurement sample takes the history from the element's `history` (R09);
- **T19** — the samples page listens to `historychange` on the element itself;
- amendments to R05, R06, R07, R17, R18, R19, R20, R22, R23, R24, R25 and R26;
- **table 3 of RUN.md** — В38 «в реестр spec», and В37 is supplemented with the digest.

— `src/core/`, `src/element/`, `scripts/package.ts`, `demo/`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.7 and 4; RUN.md, T15, T41, E4, table 3; README.md.

— *Amendment 2026-10-26:* the *Consequence* about T41 is done (R28): its own buttons, labels by `lang` and the task's tools. — R28; RUN.md, T41.

— *Amendment 2026-10-26:* T35 kept a single writer (R29): IDs grow in the order the strokes begin, and the strokes themselves do not overlap in time. The check of the time of an assigned history stays a check of order. — R29; RUN.md, T35.

— *Amendment 2026-10-26:* R51 spec puts the digit height on the crop into the module manifest — `canvas.digit_height`, integer px from 1 to 256, 32 without the field — and rejected a height for each task, as the temporary type's `canvas.digit`. That answers В38 as to the digit height, and how the app gets it with the task, T34 in RUN.md of `spec` decides. The temporary field `canvas.digit` stays until the task type moves to the schema of R51 spec (Д5 in table 4 of RUN.md). — R30.

— *Amendment 2026-10-26:* В38 is recorded in `spec` by the second 2026-10-26 amendment to R36 spec (R31). The property `history`, the event `historychange` with the frozen `detail` `{ events, from }` and the asynchronous `exportWork()` with `{ png, submission }` are the agreement of `canvas` and `app`, and the submission context carries the crop's integers and the digest. `app` keeps the history and the context as they are, without rounding, and T35 in RUN.md of `spec` releases the types of the event, the property and the method. — R31.

— *Amendment 2026-10-27:* `exportWork()` takes the digit height from the module manifest — `canvas.digit_height` of the property `manifest` — and the temporary field `task.canvas.digit` is no more (R32). It still takes it at the moment of the call: `task` and `manifest` do not depend on each other, and without a manifest it is 32 px. — R32.

— *Amendment 2026-10-27:* on a workbook `exportWork()` gives `{ cells, submission }` — the crop of each filled box and the context `{ boxes, digest }` — and, if no box is filled, `null`. The method's promise is now `{ png, submission }`, `{ cells, submission }` or `null`. Which boxes are filled, the new read-only property `filled` says (R34). The agreement of `canvas` and `app` is В46 «в реестр spec». — R34.

— *Amendment 2026-10-27:* until T49, `exportWork()` on a workbook rejects the promise — `DOMException` `NotSupportedError`, for an empty workbook too: `null` would say that nothing is written (R36). — R36.

— *Amendment 2026-10-27:* beside `history` is the read-only property `filled` (R37): which boxes of the workbook are filled, and `null` on a sheet. An action changes it before `historychange`, and an assignment of `task` and `history` changes it with no event. — R37.

— *Amendment 2026-10-27:* on a workbook `exportWork()` gives `{ cells, submission }` (R38): `cells` is `{ item, slot, png }`, and `submission` is `{ boxes, digest }`. The types of the work are `ExportedSheet`, `ExportedWorkbook` with `ExportedCell` and their union `ExportedWork`, and those of the context `SheetSubmission`, `WorkbookSubmission` and their union `Submission`. Until T53 the marks take only a sheet's context. — R38.

— *Amendment 2026-10-27:* `task` and `history` are given before `marks`: a workbook's context is checked against the page's boxes (R39). A new page, like a new history, places the marks anew, and if they do not fit, `marks` is `undefined`, with no event. The same page writes nothing. — R39.

— *Amendment 2026-11-02:* the data types that `core` gives now come from `spec`. The writing history, the submission context with its parts, `Filling` and `DemoState` come from `@altnovatrail/spec/canvas`, and the task, the example and the manifest still from `formatv0/open` (R41; R74 spec; the amendment of the same day to R07). The code of `core` goes without the DOM, as it did, and `boundary.check.ts` holds it to that. But the file of `spec` that the types come from names DOM types too — `Blob`, `CustomEvent` and `HTMLElement` — and the declarations of `core` lead to it. A consumer of `/core` in Node without the DOM library and with `skipLibCheck: false` gets 6 errors TS2304, and with `@types/node` one, on `HTMLElement`; with `skipLibCheck` or with the DOM, none. There is no such consumer now: `app`, the samples page, the tests and the synthetic samples have the DOM or `skipLibCheck`. Rejected:
- copies of the data types of `core`'s own, with a check for identity: the declarations would stay without the DOM, but the seam would again rest on copies, which R41 left behind for the task;
- a row «в реестр spec» about a DOM-free subpath at once: a question to `spec` with no consumer.

Revisit when a consumer of `core` without the DOM and without `skipLibCheck` appears: then a row «в реестр spec» about a subpath of `@altnovatrail/spec/canvas` with data types without the DOM. — RUN.md, T69.

**R28. The sheet's own buttons: a row above the statement and the sheet, outside their scrolling — «Перо» and «Ластик», «Отменить» and «Очистить». The labels come from a table of its own in English and Russian, by the element's own `lang`, the tools from the task's field `canvas.tools`, and the element announces a change of tool by the learner with the event `toolchange`.**
- **The row** is a toolbar of buttons, `role="toolbar"`, first in the shadow tree, before the scrolling:
  - as wide as the sheet's column — no wider than 1000 CSS px, and centered — and outside the element's scrolling. In an element with a height, the statement and the sheet scroll under it. Without a height, the row holds to the top of an ancestor's scrolling while the element is on screen (`position: sticky`), below the top by `--novatrail-canvas-top`, 0 by default;
  - above the sheet: `isolation: isolate` on the host, `z-index: 1` on the row. The stage is sticky too and stands later in the tree, so without this a stuck row would be painted under the ink;
  - its size is set by CSS, not by the element's layout. A row that wraps on a narrow screen takes height from the container, and the resize observer lays the sheet out anew;
  - a press on the row does not reach the drawing surface. A captured pointer under the stuck row writes as beyond the edge of the drawing surface, and the eraser takes nothing there: the visible part of the sheet begins below the row;
  - the row has no `pointer-events` of its own: the consumer's `none` on the element (R20) stops the buttons too — for the pointer, but not for the keyboard.
- **The buttons:**
  - «Перо» and «Ластик» are a group `radiogroup` «Инструмент» of `<button role="radio" aria-checked>`, and «Отменить» and «Очистить» are `<button>` elements that call `undo()` and `clear()` (R19);
  - the keyboard, by APG Toolbar:
    - one Tab stop, a roving `tabindex`;
    - ← and → go to the neighboring button, in a circle, and Home and End to the first and the last. The arrows move the focus but do not choose a tool;
    - Space and Enter press the button;
    - the row does not take keys with Alt, Ctrl and Meta;
    - the first entry is on «Перо», later ones on the button that had the focus last;
  - «Отменить», while there is nothing to undo, and «Очистить» on an empty sheet are `aria-disabled="true"`: they grow pale, stay focusable, and a press does nothing;
  - a button is no smaller than 44 × 44 CSS px, and the browser's ring shows the focus.
- **The labels** are a table of its own in English and Russian, as О-2 advises: Sheet, Tool, Pen, Eraser, Undo and Clear; «Лист», «Инструмент», «Перо», «Ластик», «Отменить» and «Очистить»:
  - the language is the element's own attribute `lang` (R07), which the element watches (`observedAttributes`). It does not read an ancestor's language;
  - the language is looked up as in RFC 4647, 3.4: the tag in lower case, the tail cut off subtag by subtag, and a singleton subtag together with the next one. If none is found, English;
  - the row has its own `lang`, the language of the labels it shows. A screen reader reads English labels under `lang="de"` in English;
  - the constructor labels in English and does not read the host's attributes: an attribute that was there before registration comes right after the constructor.
- **The task's tools** are the temporary field `task.canvas.tools`, as in the illustration of concepts 16.1 spec:
  - a list of strings, and without the field the pen and the eraser. The sheet takes `"pen"` and `"eraser"` and skips unknown ones — a ruler, a calculator, a microphone: `app` shows some, others will come with new versions of the sheet;
  - without `"pen"`, a `TypeError`: the sheet writes with the pen. Not a list, a hole, or not a string: a `TypeError` with the field's path;
  - without `"eraser"` there is no eraser at all:
    - there is no button «Ластик», and «Перо» stays;
    - the back end of the pen neither erases nor writes;
    - `tool = "eraser"` is a `TypeError`;
    - a new task without an eraser brings back the pen, with no event. An eraser's press already under way goes on as it began (R22);
  - undo and clearing are not tools: concepts 8 spec does not name them, and they always have buttons.
- **`tool` and the buttons are one:**
  - a button chooses `tool`, and an assignment of `tool` marks the button;
  - the element announces a change of tool by the learner with the event `toolchange`: a `CustomEvent` from the host, `bubbles` and `composed`, with a frozen `detail` `{ tool }`;
  - an assignment of `tool`, a second press of the chosen one and the pen brought back by a new task give no event;
  - a consumer that gives `tool` itself listens to `toolchange`, or its re-render will bring back the previous tool. After a new task it takes `tool` from the element: a task without an eraser brings back the pen with no event, and its `tool = "eraser"` would be a `TypeError`.
- **The theme:**
  - the row is the color of the paper, and the buttons' text and borders the color of the ink;
  - the chosen tool is filled with ink, and an unavailable button is paler;
  - in forced colors:
    - the row: Canvas;
    - the buttons: ButtonFace, ButtonText and ButtonBorder;
    - the chosen one: Highlight and HighlightText;
    - an unavailable one: GrayText.
- **Code:**
  - in the DOM-free part: the type `Tool` and the task's field of tools (`task.ts`), and `Work.undoable`;
  - in the element: the row (`tools.ts`), the labels (`labels.ts`), `toolchange` and the types `ToolChange` and `ToolChangeEvent`.

— *Why:* the author's answers in planning T41, 2026-10-26, all by the recommendations:
- the row at the top, outside the scrolling;
- unavailable buttons grow pale and keep the focus;
- labels of its own in English and Russian;
- «нет в списке — нет на листе» ("not in the list, not on the sheet");
- `toolchange` from the learner;
- the row's offset by a variable.

Before the work a separate agent checked the design. Its corrections:
- `isolation` and `z-index`;
- the visible part below the row;
- the row's size by CSS only;
- the row is paper and ink;
- the focus when a button disappears;
- radio buttons;
- a `Map` of the labels;
- `Tool` in the DOM-free part.

Sources: [architecture.md](architecture.md), section 4.
- **The row at the top, outside the scrolling.** The buttons are always at hand, and nothing covers the learner's work. A toolbar over the sheet, as in the mockups of canvas-api, would cover the ink, and a pen at the sheet's corner would hit a button.
- **`aria-disabled`, not `disabled`.** `disabled` takes a button out of the focus: the last undo from the keyboard would drop the focus off the row. APG allows unavailable elements of a toolbar to stay focusable, so that they are found.
- **Radio buttons, not toggles.** The pen and the eraser are a choice of one of two, and that is how APG's toolbar example describes it. A toggle `aria-pressed` would switch the tool off with a second press, and there is nothing to switch it off into. Buttons, not `<input type="radio">`: with native radios the arrows choose, and in a toolbar they only move the focus.
- **The element's own `lang`.** So R07 decided: `app` sets the language. `HTMLElement.lang` does not reflect an ancestor's language, and the element cannot keep watch over all its ancestors.
- **A table of its own.** There is no shared scheme of translations for UI packages yet — T07 of `app` will give it — and without labels of its own the goal of T41 cannot be met. Two rows of a table are easier to replace with the scheme than to remove translations from every consumer.
- **The task allows.** "The tools are allowed by the task" (concepts 8 spec): an eraser that the task did not give erases neither by the button nor by the pen. The sheet skips unknown tools: the task names `app`'s tools too, and the sheet's new tools will come with a new version of the package.
- **`toolchange` only from the learner.** web.dev advises: "Do not dispatch events in response to the host setting a property (downward data flow)". The consumer made the assignment itself and knows of it.
- **A variable for the offset.** `app`'s sticky header would otherwise cover the row, and with it the button in focus (WCAG 2.4.11).

— *Rejected:*
- **a row at the bottom**, as on `tutor`'s board, and **a toolbar over the sheet in a corner**: the author's answer, and the toolbar would cover the ink; **buttons in the sheet's scrolling**: they would leave the screen together with the statement;
- **`disabled`** and **always available buttons**: for the reasons above, and because then nobody sees that there is nothing to undo;
- **`aria-pressed` on the pen and the eraser** and **native radios**: for the reasons above;
- **an ancestor's language** and **`Intl.Collator.supportedLocalesOf`**, which looks up by the engine's languages, not by a table of its own;
- **labels from the consumer**: every consumer, the samples page too, would translate four words; **English only**: the goal of T41 would be left unmet;
- **a list that hides only the buttons**: the eraser would erase by the pen where the task did not give it; **an unknown tool is a `TypeError`**: the sheet would not show a task of `app` with a ruler or a calculator;
- **an event on an assignment of `tool`** and **an element with no event**: for the reasons above;
- **`delegatesFocus`**: a press on the drawing surface would give the focus to the pen's button;
- **icons on the buttons**: the first slice of `app` will decide the look of the interface;
- **`top: 0` without a variable**: for the reason above.

— *Revisit:*
- the labels, when T07 of `app` gives the shared scheme of translations for UI packages;
- the icons, with the look of `app`'s interface;
- the keyboard for the time of a check, by a property that stops it too, if `app` asks for one (R20);
- the field of tools, with format v0 (T28 in RUN.md of `spec`; В39 in table 3 of RUN.md);
- the row's width, if someone notices it on a computer with a classic scrollbar: the row is measured by the element, and the sheet by the container without the scrollbar, so the row is wider than the sheet by the scrollbar's width. CSS does not know the scrollbar's width, and laying the row out by code would make a loop of the resize observer. On tablets scrollbars lie over the content, and the width is one.

— *Consequence:*
- **T35** — the button that brings back drawing with a finger goes into this row;
- **T19** — the samples page takes the element's buttons and gives it the language of its texts;
- amendments to R07, R19, R20, R22, R23 and R27;
- **table 3 of RUN.md** — В39 and В40 «в реестр spec».

— `src/core/`, `src/element/`, `demo/`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.7 and 4; RUN.md, T41, T35, table 3; README.md.

— *Amendment 2026-10-26:* the *Consequence* about T35 is done (R29). The row has a fifth button, «Рисовать пальцем» ("Draw with finger"): it is visible in pen mode on a device with touch, and in the table of labels its key is `finger`. It appears and goes between strokes, and when it disappears it gives the focus to the pen's button, as «Ластик» does. — R29; RUN.md, T35.

— *Amendment 2026-10-26:* В39 is closed by R51 spec, not by `canvas`'s recommendation (R30). Format v0 has no field of tools: each task has a pen and an eraser, and R51 spec rejected "a field of tools of the pen and the eraser". The field will come with a minor version, with the first module that needs a ruler or a calculator, and the *Revisit* about the field of tools above waits for it. The temporary field `canvas.tools` stays until the task type moves to the schema of R51 spec (Д5): a sheet without the field gives the pen and the eraser, as R51 spec does too. — R30.

— *Amendment 2026-10-26:* В40 is recorded in `spec` by the first 2026-10-26 amendment to R36 spec (R31). `toolchange` and `lang` are the agreement of `canvas` and `app`, the labels are the package's own table, and T07 of `app` takes the table of labels and the row's accessibility as an input of the shared scheme of translations and of the standard of accessibility. The 2026-10-26 amendment to R51 spec speaks of В39 too: its composition is an input of the minor version with the field of tools, and `canvas.tools` lives until the move to the types of `spec` (Д5). — R31.

— *Amendment 2026-10-27:* `canvas.tools` is a temporary field of both canvas kinds, the sheet and the workbook, by the same rules. The strict check of the task lets it through: it is the only field of the task that is not in the schema of R51 spec (R32). — R32.

— *Amendment 2026-10-27:* the row also has «Выше» and «Ниже», as a pair between «Очистить» and «Рисовать пальцем», on any device. Their labels in the table are `up` and `down`: Up and Down, «Выше» and «Ниже». At the edge a button is `aria-disabled`, as «Отменить» and «Очистить» are, and its theme and forced colors are those of the whole row. — R33.

— *Amendment 2026-10-27:* the toolbar's name follows the canvas kind: «Лист» or «Тетрадь» (R34). The buttons and their keyboard on a workbook are the same. — R34.

— *Amendment 2026-10-27:* the table of labels also has `workbook` and `box`: Workbook and Box, «Тетрадь» and «Окошко». The toolbar's name changes with the canvas kind, and the boxes' names with the element's `lang`, as the buttons' labels do (R36). — R36.

— *Amendment 2026-10-27:* the table of labels also has `filled`: filled and «заполнено». A filled box's name is «Окошко, заполнено» (R37). — R37.

— *Amendment 2026-11-01:* in the worked-example mode the row of buttons has no buttons of the pen and the eraser, no «Отменить», «Очистить» and «Рисовать пальцем», but «Дальше», the disclosure button «Показ», «Выше» and «Ниже», in that order, and it is called «Пример». The Tab stop is then on the first visible button, «Дальше», not on the pen's button. T59 and T60 build it. — R42.

— *Amendment 2026-11-02:* the icons on the buttons, from the *Rejected* and the *Revisit* above, came not with the look of `app`'s interface but with R78 spec: before the label of each button of the row there is an icon of the set Material Symbols by the table of architecture 6 spec, and the button's name is still its label. From right to left, ArrowLeft leads to the next button, by the direction of the row and of its arrows (R46). — R46.

— *Amendment 2026-11-11 (T91):* **the labels follow the shared rules of translations of UI packages (R91 spec), in the interface languages `en` and `ru` (R92 spec). A label with a number or a word inside is one string with placeholders by name — «Часть {n} из {total}.», «Окошко {slot}», «{name}, заполнено», «{name}: {value}» — not a gluing of «Часть», a number, «из» and a number; a place without a value is a `TypeError`, not braces on the screen. The labels have no plural forms — none of them counts things — and the first such label will take the CLDR categories with `other` by the `Intl.PluralRules` of the label's language: so the author decided, instead of code that the package does not call. The fallback label is English, with its own `lang`; the buttons' labels are the words of the table of architecture 6 spec; the learner's gender and the AI's first person are not in the labels (R70 spec; П-15). The phrases that only `canvas` shows are [architecture.md](architecture.md), section 3.3. The wait for T07 of `app` above is fulfilled by `spec`'s answer, R91 spec.** — RUN.md, T91; `src/element/labels.ts`, `src/element/labels.test.ts`.

— *Amendment 2026-11-11 (T92):* **in a low window the row does not stick, and the focus shows a ring of its own, of the ink's color (R90 spec; WCAG 1.4.10, 2.4.11, 2.4.7, 1.4.11).**
- **The threshold:** the row sticks while it is no taller than a quarter of the scrolling it sticks in, below `--novatrail-canvas-top`. The scrolling is the nearest ancestor across shadow boundaries with overflow `auto`, `scroll`, `overlay` or `hidden`, or the window without the scrollbar, `document.scrollingElement.clientHeight`: this height does not change when a phone's browser hides its toolbar. Everything — the row, the ancestor and the offset — is measured on the screen, with the ancestors' scale. Otherwise the row is `loose`, `position: static`: it stands in its place, above the statement, and leaves with the scrolling. Its place and size are the same, so the threshold does not depend on its own answer and needs no margin against jitter.
- **When it is recomputed:** on a new size of the row — it wraps by the width, by `lang`, by the canvas kind and with the finger's button —, of the window and of the ancestor it sticks in, and on scrolling of the page and of the ancestors. A new `--novatrail-canvas-top` changes no sizes, and the threshold hears it from the next scroll, as R33 hears another shadow tree: a scroll reads only the row's `top` and recomputes the threshold when the offset has changed. An ancestor whose overflow changed by a style alone, with no new size and no scroll, the threshold also learns of from the next of them.
- **The focus ring:** `:focus-visible` is a 2 px solid line of the ink's color, 2 px outside the button, and Highlight in forced colors. The row's margins at the sides are 4 px: the ring of an outermost button stands on the row's paper, at the window's edge too. The "the browser's ring shows the focus" above is replaced by this.
- **An unavailable button** is paler by color — `color-mix` of 40 % ink on paper — not by `opacity: 0.4`: transparency would make the ring pale too. «Выше», which keeps the focus at the edge (R33), would show it at about 2.6:1 to the paper, less than 3:1 by 1.4.11. In forced colors it is GrayText, as it was. A browser without `color-mix` still makes it pale by transparency (`@supports`).

*Why:* the author's answers in planning T92, 2026-11-11, all by the recommendations. Understanding 1.4.10 advises "static positioning" for a sticky toolbar in a small window, and technique C34 removes the stickiness when there is little room. A quarter is by its example: a header of 130 px sticks from a window of 480 px, about 27 %. A share, unlike the window's height, sees the row wrapping, the language of its labels, the canvas kind, `app`'s header and its scrolling in a container of its own. The ring has no variable of its own: `app`'s theme already holds the contrast of ink to paper for the buttons' labels, and a new variable is a clause of the agreement, which `spec` has recorded. Before the work a separate agent checked the design; its corrections were the paleness by color, the overflow `hidden`, one parsing of the offset for two rules and the row's margins at the sides. Sources: [architecture.md](architecture.md), section 4.

*Rejected:* the window's height, `@media (min-height: 480px)`, as in C34 literally: it does not see the row wrapping, `app`'s header and scrolling; both conditions at once: two rules instead of one; a button that collapses the row: a new word of the table of architecture 6 spec; the row in one line with sideways scrolling: it departs from R90 spec and covers the sheet anyway; a ring variable of its own: for the reason above. The "buttons in the sheet's scrolling: they would leave the screen together with the statement" from the *Rejected* above is now the price of a low window, and of it alone: in a window where the row would cover more than a quarter, it leaves with the scrolling, as C34 advises.

— RUN.md, T92; [architecture.md](architecture.md), sections 3.1, 3.3 and 4; `src/element/index.ts`, `src/element/tools.ts`, `src/element/reflow.test.ts`, `src/element/a11y.test.ts`, `src/element/forced-colors.test.ts`.

— *Amendment 2026-11-11 (T93):* **the toolbar's name is not the canvas kind but its buttons: «Кнопки листа», «Кнопки тетради» and «Кнопки примера», "Sheet buttons", "Workbook buttons" and "Worked example buttons". The kind's name — «Лист», «Тетрадь» or «Пример» — is now on the scrolling container, the region `region` (the T93 amendment to R33): so a screen reader will not show the toolbar and the region under one name.** The table of labels also has `sheetButtons`, `workbookButtons` and `exampleButtons`, and `sheet`, `workbook` and `example` stay the kind's names. This does not concern the words of the table of architecture 6 spec: it has only buttons. `app` does not read the toolbar's name (`main` 61fa6e9, read 2026-11-11).

*Why:* the author's answer in planning T93, 2026-11-11, by the recommendation: in the screen reader's list of landmarks stands the sheet itself, and the toolbar names itself by its buttons.

*Rejected:* the toolbar as it is, with a new name for the region, «Лист с задачей»: the pair «Лист» and «Лист с задачей» confuses. «Лист с условием» does not fit either: «условие» in the vocabulary of concepts 15 spec is a check, the predicate, and «условие задачи», the statement, is another thing.

— RUN.md, T93; [architecture.md](architecture.md), sections 2.8, 3.3 and 3.7; `src/element/labels.ts`, `src/element/tools.ts`. — R33, R34, R36, R42.

— *Amendment 2026-11-11 (T94):* **after «Выше» and «Ниже» the row has the zoom pair «Крупнее» and «Мельче», and while the sheet is zoomed in, «Левее» and «Правее» after it, before «Рисовать пальцем» (R73).** Each pair is a unit of wrapping of its own, as «Выше» and «Ниже» are. At the limit of zoom a button is unavailable and keeps the focus, and so are «Левее» and «Правее» at the edge toward which they scroll. At 400 CSS px the sheet's row is in three lines, not two: the zoom pair does not fit into the second. The labels are `zoomIn`, `zoomOut`, `left` and `right` of the table of labels, en and ru, until the words of architecture 6 spec by В76. — R73.

— *Amendment 2026-11-12 (T110):* **the labels `zoomIn`, `zoomOut`, `left` and `right` — «Крупнее», «Мельче», «Левее» and «Правее», "Zoom in", "Zoom out", "Left" and "Right" — are now words of the table of architecture 6 spec: `spec` recorded В76 by recommendation (a) (Д219 spec), and there is nothing left to wait for.** — R73, R77; RUN.md, T110.

**R29. Input on tablets: pen mode is one for the whole page, a palm is a touch wider than 100 CSS px, two-finger scrolling is code of its own, and the button «Рисовать пальцем» is in the element's row. One pointer still writes, but the pen removes a touch's stroke that is under way.**
- **Pen mode** is one for the whole page, in its memory:
  - a pen's `pointerdown` on the drawing surface of any sheet of the page turns it on, by any button: both the tip and the pen's eraser. A hovering pen does not turn it on;
  - the button «Рисовать пальцем» turns it off, and the pen's next touch turns it on again;
  - the next task is a new element (R20), and the mode stays. Nothing is stored or sent, and after the page reloads there is no mode;
  - in pen mode a finger's touch neither writes nor erases. The mouse does not touch the mode.
- **A palm** is a touch whose `width` or `height` is greater than 100 CSS px, on `pointerdown` or on any coalesced `pointermove`:
  - it neither writes nor scrolls until it lifts;
  - the stroke it was already writing is removed, as on `pointercancel`: there is no history event, and its ID stays taken (R18);
  - the palm ends the scrolling it was in.
- **Who writes:**
  - still one pointer at a time (R18). Several touches at once never write;
  - the pen removes a touch's stroke that is under way — that was a palm — and writes itself;
  - while a pen or a mouse writes, a touch does nothing. A touch that was on the screen during a pen stroke does nothing until it lifts;
  - without pen mode the first touch writes or erases by `tool`. A second touch that came no later than 150 ms after the first, while that one has moved no more than 8 px, removes its stroke or eraser's press, and both fingers scroll. A later second touch does nothing, and the stroke goes on;
  - in pen mode one touch does nothing, and two that touched no more than 150 ms apart scroll;
  - a third touch does nothing. When one finger of a pair lifts, the gesture ends, and the other does nothing until it lifts;
  - a mouse and a pointer without a type write when nobody else writes;
  - a finger's press that was under way on another sheet when the pen turned the mode on goes to its end as it began (R22);
  - the drawing surface holds by capture every pointer that came down on it, until it lifts, whether it writes or not. A pointer that comes down again under the same ID has lost its `pointerup`, and the stroke it was writing lands where it was — as on a loss of capture (R18).
- **Two-finger scrolling** is code of its own, because `touch-action` acts on the pen too:
  - the sheet moves vertically together with the midpoint of the two fingers — after the first 8 px, with no jump. A step is a whole pixel, the remainder goes into the next step, and the scrolling is with `behavior: "instant"`;
  - what to scroll, the gesture's first step chooses, and the choice does not change until the gesture's end. It is the sheet's container if it can move that way, otherwise the host's nearest scrollable ancestor — across shadow boundaries, up to an `overscroll-behavior` of `contain` or `none` —, otherwise the page. A page with hidden overflow, as under a window over it, the fingers do not scroll: a finger would not scroll it either. The page's overflow is the root's, and if the root's is `visible`, then `body`'s (CSS Overflow 3). A container at its edge passes the scrolling on with the next gesture;
  - the shift is divided by the container's own scale: an ancestor with `transform` changes the fingers' path on the screen;
  - there is no inertia, and the sheet stops together with the fingers;
  - for the time of a check, with `pointer-events: none` (R20), a new gesture does not start, and one already started goes on until the lift;
  - on the statement, the margins and the row of buttons a finger scrolls by native scrolling, as before (R23).
- **The button «Рисовать пальцем»** is a `<button>`, fifth in the row, after «Очистить»; its labels are "Draw with finger" and «Рисовать пальцем»:
  - it is visible in pen mode if the device has touch (`navigator.maxTouchPoints > 0`);
  - it appears and goes only between strokes: while a pointer writes or erases, the row does not change its width;
  - a press turns pen mode off on the whole page, with no event. The button goes, and the focus and the Tab stop move to «Перо», as from a vanished «Ластик» (R28);
  - it is no smaller than 44 × 44 CSS px, as all the row's buttons are.
- **The thresholds** are `PALM_PX` 100 CSS px, `PAIR_MS` 150 ms and `SLOP_PX` 8 CSS px, in pixels of the screen, not of the sheet. All three are parameters of T22.
- **What the canvas will not fix:**
  - WebKit 269535: on an iPad the Apple Pencil gives no pointer events while a finger or the edge of a palm touches the screen;
  - Chrome on Android, when a pen touches, releases the touches under way by a `pointerup` event. A palm that was writing before the page's first pen leaves a stroke, and «Отменить» removes it;
  - a palm on the row of buttons is not cut off.
- **Code:**
  - in the DOM-free part: `hands.ts`, with the rule `Hands`, the mode `PenMode`, the type `Contact` and the thresholds;
  - in the element:
    - `session.ts`: the page's mode;
    - the field `#hands`, the scrolling `#scroll` and the choice of the container;
    - the fifth button in `tools.ts` and its label in `labels.ts`.

— *Why:* the author's answers in planning T35, 2026-10-26, all by the recommendations:
- do it without a tablet, and T22 will check it on devices;
- pen mode for the whole page;
- a palm is wider than 100 px;
- the button in pen mode, on a device with touch;
- the second finger soon after the first;
- one finger in pen mode does nothing;
- there is no inertia;
- a replacement for two fingers by one pointer, as an open question.

Before the work a separate agent checked the design. Its corrections:
- who writes, only the input recorder and the eraser know;
- a palm is recognized on `pointerdown` and `pointermove`;
- the scrolling container holds for the whole gesture;
- the pair's window works in pen mode too;
- the button changes only between strokes;
- the touch's sizes are in a separate type;
- the mode is turned on by the pen's touch, not by hovering.

Sources: [architecture.md](architecture.md), section 4.
- **A mode for the whole page.** A new task is a new element (R20). A mode on the element would be reset at every task, and each task's first palm would write. canvas-api turns the mode on «в сессии» ("in the session").
- **100 px, not 30.** WebKit on iPadOS gives a touch a width of double the radius, and, by another project's report, at a fingertip that is 40–60 px. The threshold of 30 px in canvas-api had no code behind it, and on the main device with a pen it would have taken drawing away from the finger. A high threshold will let a small touch of a palm through, but in pen mode a touch does not write anyway.
- **A palm by `pointerdown` and `pointermove`.** On `pointerup` Chromium gives `width` and `height` 1, and a palm grows as it lands.
- **The pen removes a touch's stroke.** A touch that writes when the pen touches is a palm that landed earlier. Pointer Events Level 3 allows the device itself, too, to ignore touches while the pen writes.
- **A window of 150 ms and a tolerance of 8 px.** Android waits 100 ms to tell a tap from a scroll (`TAP_TIMEOUT`) and counts as a scroll a path longer than 8 dp (`TOUCH_SLOP`). The 50 ms on top are a margin for children's fingers. The window works in pen mode too: a thumb that holds the tablet will not make a pair.
- **Two fingers in pen mode too.** A palm that landed before the pen would move the sheet under it with one touch.
- **Scrolling by code of its own.** `touch-action` "does in fact apply to all forms of pointer inputs that allow direct manipulation", that is, to the pen too. The open W3C issue pointerevents #203 is about the same: a pen that writes beside a finger that scrolls cannot be expressed by `touch-action`.
- **A container for the whole gesture.** Within a gesture the sheet's container and the page do not compete, and at the edge the scrolling goes further with the next gesture. How the browsers themselves hold a gesture has not been checked against a source: this is a decision of our own.
- **The button between strokes.** A row that wraps takes height from the container (R28), and the sheet would move under the pen.
- **The button only with touch.** A graphics tablet on a computer gives a pen, but there are no fingers there, and the button would be superfluous.

— *Rejected:*
- **a mode on each element**: it would be reset at every task; **a property and an event** for `app`: more interface for what the page remembers anyway;
- **the threshold of 30 px**: for the reason above;
- **several writing touches at once**: a palm would write beside a finger, and the order of the strokes by ID would diverge from the order of writing (R22);
- **one finger scrolls in pen mode**: the author's answer; a palm would move the sheet;
- **a toggle with `aria-pressed`**: it would hold the choice even when the pen is in the hand again, and after an accidental press a palm would write;
- **the mode by the pen's hovering**: a pen brought to the screen would turn the mode on right after the button was pressed;
- **`touch-action: pan-y` on the drawing surface in pen mode**: `touch-action` acts on the pen too, and by WebKit 238543 Safari scrolls with two fingers even where `touch-action` forbids zooming;
- **handing the scrolling to the page in the middle of a gesture**: the container and the page would compete within one gesture;
- **delaying a finger's stroke**, so that the pen has time to remove it: a finger would draw with a lag;
- **touch events against WebKit 269535**: by Apple's forum, they behave the same;
- **inertia**: the author's answer: on iPad and Android it is tuned on the devices;
- **WebKit in the tests now**: for the reason from the amendment to R13;
- **the buttons «Выше» and «Ниже» now**: the author's answer: the level of accessibility will be set by the shared standard of T07 of `app` ([architecture.md](architecture.md), subsection 2.6).

— *Revisit:*
- the thresholds, the window and the tolerance, by T22;
- inertia, by T22;
- the mode across a reload, by a property for `app`, if it asks;
- the button on a computer with a graphics tablet and a touch screen, by T22;
- a replacement for two fingers by one pointer, with the standard of accessibility of T07 of `app` (subsection 2.6; В41 in table 3 of RUN.md).

— *Consequence:*
- **T22** checks on devices:
  - the thresholds, the window and the tolerance;
  - WebKit 269535 and 238543;
  - Android and a palm before the first pen;
  - the button on a graphics tablet;
  - inertia;
- amendments to R05, R06, R13, R18, R20, R22, R23, R24, R27 and R28;
- [architecture.md](architecture.md), subsection 2.6, and table 3 of RUN.md — В41 «в реестр spec».

— `src/core/`, `src/element/`; [architecture.md](architecture.md), sections 2.6, 3.1, 3.2, 3.3, 3.7 and 4; RUN.md, T35, T22, table 3; README.md.

— *Amendment 2026-10-26:* the button «Рисовать пальцем» appears and goes between the strokes of the whole page, not of one sheet. The review of T42, which went in one branch with T35, found this.
- **What was.** A pen that touched sheet A turned the mode on on the whole page, and the row of sheet B above it showed the button at once, in the middle of a stroke on A. B's narrow row wrapped, B became taller, and sheet A slid down under the pen.
- **Now.** Pen mode knows whether anyone is writing on any sheet of the page. Each sheet tells it whether a pointer is writing on it, and hears from it the end of a stroke when no sheet is being written on any more. The row changes the button only when the page is not writing. A test with two sheets holds this, and it fails without the fix.
- **Code:** `PenMode` has `writing`, `enlist` and `settle`, and `Hands` has `scrolling`. A pointer's lift, its cancel and a loss of capture go through `#lifted`: a gesture that has ended releases what it was scrolling.

— `src/core/hands.ts`, `src/element/index.ts`; [architecture.md](architecture.md), section 3.3.

— *Amendment 2026-10-26:* В41 is recorded in `spec` as the open question О-24 (R31). The level of accessibility of the interface and the sheet's scrolling by one pointer are decided together with the standard of accessibility of T07 of `app`, with the same options and recommendation. `spec`'s addition to О-24: the scrolling of its own by two fingers falls under 2.5.1 of level A too, and in an element with a height, on a narrow tablet, without a replacement the sheet already does not meet it. Subsection 2.6 of [architecture.md](architecture.md) is open, now with `spec`'s number. — R31.

— *Amendment 2026-10-27:* the button «Рисовать пальцем» is the last in the row, after «Ниже», not the fifth after «Очистить»: when it comes and goes, the row's other buttons do not move. The *Revisit* about a replacement for two fingers by one pointer is done: it is the buttons «Выше» and «Ниже», which scroll the same as two fingers. And the *Rejected* about the buttons now was withdrawn by the author in planning E6, 2026-10-26: T45 builds them, without waiting for the standard of T07 of `app`. — R33.

— *Amendment 2026-11-01:* the sheet of a worked example neither turns pen mode on nor turns it off: the drawing surface there takes no input, and a finger and a pen scroll the sheet by native scrolling, as they scroll the statement — `touch-action` there is the browser's (R42). The row of an example has no button «Рисовать пальцем», in pen mode too. — R42; RUN.md, T59.

— *Amendment 2026-11-11 (T94):* **two fingers scroll sideways too, while the sheet is zoomed in (R73).** The threshold is the distance the fingers' midpoint has gone, 8 px; the first step has no jump: it is the share of the path along each axis that lies beyond the threshold. A rail: if, crossing the threshold, the midpoint has gone twice as far along one axis as along the other, the gesture goes only along it until its end, `RAIL` = 2. What to scroll along each axis, the gesture's first step along it chooses. At 100 % nothing scrolls sideways, and the threshold counts only the path down, as before: `HandsSheet.across()` says whether the sheet scrolls sideways, and `HandsSheet.scroll` is `(dx, dy, fresh)`. T22 checks the rail's threshold on devices (Д7). — R73; `src/core/hands.ts`.

## `spec` tag v0.2.35

**R30. `canvas` is on `spec` v0.2.35: the submodule `spec/` is at this tag, and the links to `spec` pinned to a tag name it. `spec` has decided the rows «в реестр spec» В29, В30, В32, В34 and В39, and they are closed: the documents name its numbers instead of them. The second canvas kind of the first slice is the workbook, and `canvas` details it: epic E6. The temporary task type moves to the task schema of R51 spec by a task of its own.**
- **What the tag brings to `canvas`** (`git -C spec diff v0.2.18 v0.2.35`, read 2026-10-26). The releases v0.2.19–v0.2.35 answered five rows of `canvas` and the questions it was waiting for. What `canvas` gets with the tag, Д18–Д22, Д25, Д27–Д29 and Д32–Д34 in RUN.md of `spec` name:
  - **R41 spec** (В32): the first slice is three modules of two subjects, and the slice's canvases are the handwriting sheet and the workbook; it has no text canvas.
    - The sheet serves olympiad mathematics and short essays in English, and the workbook the school mathematics of grade 3: the task's items stand on the non-erasable template layer, and the answer to each is a number or a fraction by hand in its answer slot.
    - В32 is closed otherwise than `canvas` advised: the second module is not Spanish A1, and the modules became three.
    - The card architecture 3.2 spec gives `canvas` the detailing of the workbook: the page, the answer slots, the crop of a slot and the template layer.
    - `speak` of R36 spec and architecture 3.1 spec is left until the text canvas, "later";
  - **R51 spec**: the task of format v0, the schema `task.schema.json`:
    - the canvas kind is `handwriting_sheet` or `workbook`. For a sheet the task gives the grid `grid` and its step `grid_step`, from 20 to 500 units, 50 without the field;
    - **the task statement** (В34): paragraphs and pictures with a description and a size. It is part of the author's template, and whether it is above the canvas or on it, the canvas kind decides: a sheet shows it above the sheet. So В34 is closed, by `canvas`'s recommendation, and concepts 6 and 8 spec are amended;
    - **each task has a pen and an eraser** (В39), and there is no field of tools in v0: it will come with a minor version, with the first module that needs a ruler or a calculator. So В39 is closed, not by `canvas`'s recommendation: R51 spec rejected "a field of tools of the pen and the eraser";
    - **the digit height on the crop** is `canvas.digit_height` in the module manifest: integer px from 1 to 256, 32 without the field. R51 spec rejected a height for each task, as the temporary type's `canvas.digit`. That answers В38 as to the digit height, and how the app gets it with the task, T34 in RUN.md of `spec` decides;
    - the task's items with answer slots and the slot bindings of v0: on a sheet `anywhere`, `sheet`, `zone` and `choice`, on a workbook the line's box, `box`. A zone is `left`, `top`, `width` and `height` in units of the sheet;
  - **the 2026-10-22 amendment to R43 spec and repositories 6 spec, item 5** (В29): the first code of `canvas` is the sheet, the element `<novatrail-canvas>`. The samples page, the synthetic samples and the build from a file wait until the measurement needs volunteers' or children's samples: that is epic E5;
  - **the 2026-10-22 addition to П-10** (В30): where the page offers to put a sample file on an iPad, the planning of E5 chooses, and whether that is enough, a lawyer decides in epic E4 of RUN.md of `spec`;
  - **R53 spec**: the place on the canvas in an observation and in the contract `app` ↔ `api`: fractions 0–1000 of the crop, `[ymin, xmin, ymax, xmax]`, integers. `canvas` converts it into units of the sheet, and `sheet_box` does not leave the device. So Т-32 is closed — by what `canvas` decided for itself in R06 — and with it the mark's place from В37;
  - **R52 spec**: nothing goes from the writing history to the AI, and П-21 is closed. R09 does not change: the writing history does not go to the check anyway;
  - **R44, R45 and R46 spec**:
    - the module format has a version of its own, MAJOR.MINOR, and a window of versions. `canvas` releases a new canvas kind before the module that takes it (repositories 4 spec);
    - the names of fields and the values are in snake_case;
    - a picture is named by its path from `media/`, and a task by its full ID;
  - **the 2026-10-22 and 2026-10-26 amendments to R25 spec and R38 spec:**
    - the measurement of the course of writing is done on the sheets of `tutor`'s board and on synthetic samples, without `canvas`'s page;
    - `tutor`'s release with the measurement's tasks and the check of `canvas`'s synthetic samples in `tutor`'s CI wait for epic E3 of `tutor`;
    - `canvas`'s page writes the volunteers' and the children's samples, when it comes to them;
    - `tutor`'s temporary file of the measurement's tasks moves to the task schema of R51 spec.

    This goes to E5 and Д4;
  - **the 2026-10-22 amendment to R31 spec**: the template of `paths` of the calling `release.yml` lists what the release is built from, by the kind of repository. `.github` writes the list for the kind `typescript` with the first release in TypeScript, `canvas`'s. This goes to T24;
  - **the rest** `canvas` waits for, as it waited for the rows:
    - the eval protocol and the contract `app` ↔ `api`: epic E3 in RUN.md of `spec` (В33, В35–В37);
    - the types for TypeScript: T35 there too (В38, В40);
    - the standard of accessibility of UI packages: from T07 of `app` (В41);
    - the group boxes at the check: Т-31.
- **The rules for all repositories** that `canvas` gets with the same tag:
  - **RULES.md, How we work:** code comes with its tests, and where coverage goes to Codecov, a merge waits for `codecov/patch` (R48 spec). `canvas`'s tests have come with every change of code since T08, and it has no coverage in Codecov: that waits for the upload in `.github`'s wrapper (Д29 in RUN.md of `spec`);
  - **RULES.md, Language:** the normative texts for authors are in English (R42 spec). Rule 10 of RUN.md names them, as the template does;
  - **R48 spec and repositories 2.3 spec**: the status badges at the beginning of README:
    - from day one: CI, CodeQL, Scorecard, the license and five measures of SonarCloud;
    - with the first code: the TypeScript version;
    - Release and the release number will come with the first release (T24), coverage with Codecov, and OpenSSF Best Practices with the project that the author will set up (Д34 in RUN.md of `spec`);
  - **the 2026-10-22 amendment to R12 spec:** npm is a tool of development and CI under Artistic-2.0, and this exception is named. `canvas`'s license check does not see it: npm is not in the lock file;
  - **the 2026-10-26 amendment to R32 spec:** the documents check reads only the files that git tracks or does not ignore, and does not go into `samples/` (the amendment to R15).
- **Devcontainer.** `spec`'s `.devcontainer/` did not change between the tags, and in `tools/new-repo/` only the tests changed. The template changed in two places: the badges in README and rule 10 of RUN.md.
- **What is changed here:**
  - `spec/` is at v0.2.35, commit 15459d4; the tag is in README.md, CLAUDE.md and at the beginning of RUN.md. CLAUDE.md also names the order of the first code by repositories 6 spec, item 5;
  - README.md: the badges by repositories 2.3 spec;
  - RUN.md:
    - rule 10, as in the template;
    - table 1: T42;
    - table 2: epic E6 «Рабочая тетрадь», first;
    - table 3: the rows В29, В30, В32, В34 and В39 are removed, and its opening names where each went. В37 and В38 are without what R53 and R51 spec decided;
    - table 4: Д5;
  - [architecture.md](architecture.md): sections 1, 3.1, 3.2, 3.3 and 3.6, `spec`'s numbers instead of the rows of table 3 and instead of Т-32;
  - the comments in `src/core/marks.ts` and `demo/main.ts`: R53 spec instead of Т-32;
  - amendments to R07, R15, R17, R21, R23, R25, R26, R27 and R28.

  The entries of the history name the rows as they were. The numbers «В» of the rows are not reused.

— *Why now:* the author's decision of 2026-10-26, once E4 was done: to make the move in task T42, in one branch with E4's archive and the review of tables 3 and 4. `spec`'s answers to five rows would hang open, and the next epic would be chosen by v0.2.18, whose card has no workbook. v0.2.35 is `spec`'s latest release as of 2026-10-26 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.35 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 15459d4.

— *Rejected:*
- making the move in the first task of the next epic, or with `spec`'s types (T35 in `spec`'s RUN.md): the rows would hang, and the epic would be chosen by a card without the workbook;
- moving the temporary task type to the schema of R51 spec in this same task — the author's decision: the move is here, and the type is a task of its own (Д5);
- leaving the rows in table 3 with the mark «записано» ("recorded") — by the argument of R16.

— *Consequence:*
- **the workbook** is epic E6 of table 2 of RUN.md, first by the author's decision: detailing by the card, then the code. The canvas kind that is built is still one, the sheet (the amendment to R21);
- **the temporary task type against the schema of R51 spec** is Д5:
  - the kind `handwriting-sheet` instead of `handwriting_sheet`;
  - the step `step` instead of `grid_step`;
  - the digit height `canvas.digit` on the task instead of `canvas.digit_height` in the manifest;
  - the field `canvas.tools`, which v0 does not have;
  - no fields `id` and `items`, which the task's open view carries by the schema;
- the badges Release, the release number, coverage and Best Practices, with what they tell of;
- В33, В35–В38, В40 and В41 wait to be recorded in `spec`, and the author's answers of 2026-10-26 are in the rows themselves.

— RUN.md, T42, tables 1–4; CLAUDE.md; README.md; [architecture.md](architecture.md), sections 1, 3.1, 3.2, 3.3, 3.6; `src/core/marks.ts`, `demo/main.ts`.

— *Amendment 2026-10-26:* "the rest `canvas` waits for, as it waited for the rows" and "В33, В35–В38, В40 and В41 wait to be recorded in `spec`" were settled the same day: `spec` recorded the rows in v0.2.36 and v0.2.37, and `canvas` moved to v0.2.37 (R31). The eval protocol and the contract still wait for epic E3 in `spec`'s RUN.md, the types for T35 there, and the standard of accessibility for T07 of `app` (О-24). — R31.

— *Amendment 2026-10-27:* T44 narrowed Д5 (R32). The canvas kind, the grid step, `id` and `items` follow the format's draft, and the digit height and the language come from the module manifest, the property `manifest`. What remains is canvas's own temporary types instead of `spec`'s types, and the temporary field `canvas.tools`. — R32.

## `spec` tag v0.2.37

**R31. `canvas` is on `spec` v0.2.37: the submodule `spec/` is at this tag. `spec` has recorded the «в реестр spec» rows В33, В35–В38, В40 and В41, and table 3 of RUN.md is empty: instead of the rows, the documents name spec's entries.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.35 v0.2.37`, read 2026-10-26). v0.2.36 and v0.2.37 recorded the author's answers of 2026-10-26 to `canvas`'s rows: all by `canvas`'s recommendations, and В41 as an open question. What `canvas` gets with the tag is named by Д35 and Д36 in `spec`'s RUN.md:
  - **the eval protocol** — epic E3 there, «Правила `canvas` в протоколе eval». The protocol takes as they are the writing history of R22 (В33), the rule of groups of R24 and `vectors/groups.json` (В35), the rules of the crop of R25 and `vectors/crops.json` (В36) and the rule of snapping of R26 and `vectors/snaps.json` (В37). An erased stroke belongs to the groups of those visible strokes that would have been its neighbors. `canvas`'s test vectors will come out in `spec`'s releases by T35 there, and `canvas` will then take them from there;
  - **the contract `app` ↔ `api`** — the same epic: the tutor's mark, its kind and its place. There is one kind so far, the box, and `app` writes the name for the screen reader in its own words (В37);
  - **concepts 8 and 15 spec** — the terms «пометка наставника» (tutor's mark, mark) and «связка штрихов» (stroke bundle); the writing history names the events of erasing, clearing and undo with their IDs, and the tutor's layer names the tutor's marks: boxes, numbers and short captions;
  - **the first 2026-10-26 amendment to R36 spec** (В40): `toolchange` and `lang` are an agreement between `canvas` and `app`, the labels are the package's own table, and the row's accessibility is as in R28. T07 of `app` takes the table of labels and the row's accessibility as an input to the shared schema of translations and standard of accessibility;
  - **the second 2026-10-26 amendment to R36 spec** (В38 and the context from В37): `history`, `historychange` with `{ events, from }` and `exportWork()` with `{ png, submission }` are an agreement between `canvas` and `app`. The submission's context carries the crop's integers and the digest, and `app` keeps it as it is, without rounding. T35 in `spec`'s RUN.md releases the types;
  - **О-24** (В41) — the level of the interface's accessibility and the sheet's scrolling with one pointer, together with the standard of T07 of `app`. The options and the recommendation come from subsection 2.6 of [architecture.md](architecture.md). `spec`'s addition: the element's own scrolling with two fingers falls under 2.5.1 of level A too, and for an element with a set height on a narrow tablet, the sheet without a replacement no longer meets it;
  - **the 2026-10-26 amendment to R51 spec** — on В39, which `canvas` closed with R30: the row's composition is an input to the minor version with the field of tools, and `canvas.tools` lives until the move to `spec`'s types (Д5);
  - architecture 3.1 and 3.2 spec name the element's interface, privacy 4 spec the crop's integers and the digest in the submission's context, and Т-31 the bundles.
- **RULES.md, the devcontainer and the template** did not change between the tags: `git -C spec diff --stat v0.2.35 v0.2.37 -- RULES.md .devcontainer repo-template tools` is empty.
- **What is changed here:**
  - `spec/` is at v0.2.37, commit 591979b; the tag is in README.md, CLAUDE.md and at the start of RUN.md;
  - RUN.md: table 3 is empty, and its opening names the decisions that closed the rows. In table 4, Д5 names the format's draft by R44 spec, and Д6 the badges of README that T42 waited for. T42 and this task, T43, are in E4's archive, [plan/E4.md](plan/E4.md);
  - [architecture.md](architecture.md): the opening of section 2, subsection 2.6 and sections 3.5 and 3.7 — `spec`'s entries instead of the rows, and in 2.6 also the addition to О-24;
  - the comment of `src/core/index.ts` — the eval protocol instead of the rows;
  - amendments to R22, R24, R25, R26, R27, R28, R29 and R30.

  The entries of history name the rows as they were.

— *Why now:* the author's instruction of 2026-10-26 — to decide all that can be decided in tables 3 and 4. Only a move closes the rows of table 3 (RULES.md, Across repositories). v0.2.37 is `spec`'s latest release as of 2026-10-26 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.37 -R altnovatrail/spec` confirmed it by its attestation; the tag is on commit 591979b.

— *Rejected:*
- making the move in the first task of E6: the rows would hang, though the answers are recorded;
- leaving the rows in table 3 with the mark «записано» ("recorded") — by the argument of R16.

— *Consequence:*
- the rules of groups, of the crop and of snapping stay inside `core`, and the vectors are canvas's own: there is no eval protocol yet, and the vectors will come out by T35 in `spec`'s RUN.md. The move to that tag will take them;
- subsection 2.6 is open — О-24, with the standard of T07 of `app`;
- Д5 stays: the temporary task type moves to the schema of R51 spec in the first task of E6. `canvas` will take the schema and the types from the release of T35 in `spec`'s RUN.md, because the code of other repositories does not take the format's draft (R44 spec).

— RUN.md, T43, tables 3 and 4; CLAUDE.md; README.md; [architecture.md](architecture.md), sections 2, 2.6, 3.5 and 3.7; `src/core/index.ts`.

— *Amendment 2026-10-27:* subsection 2.6 is decided as to scrolling: the sheet scrolls with one pointer, by the buttons «Выше» and «Ниже». The level of accessibility still waits for the standard of T07 of `app` (О-24), and `canvas`'s answer to О-24 is row В44 «в реестр spec» in table 3 of RUN.md. — R33.

— *Amendment 2026-11-08:* the eval protocol came out, and `canvas`'s vectors went to `spec` (R94 spec): the rules of groups, of the crop, of snapping and of boxes are held by `spec`'s vectors from the package `@altnovatrail/contracts`, and `canvas` kept only the vectors of the layout, `vectors/pages.json`. — R47.

## E6. The workbook

**R32. The element takes the task in the names of the format's draft 0.1 (R51 spec), by its own temporary types, and checks it strictly, as the schema does: a field the open view does not have is a `TypeError`, but for the temporary `canvas.tools`. It takes the module manifest by the property `manifest` and reads from it the module format version, the digit height and the explanation language. It checks the workbook, but does not show it until T47. On the sheet `zone` is a `TypeError`, and `app` shows the options of `choice` and the item's text.**
- **The task is the property `task`:** the task's open view by `task.schema.json` of draft 0.1 (the format's README, §14).
  - Fields: `id`, the task's local ID; `statement`, the statement's parts; `canvas`, the canvas kind; and `items`, the items. The canvas kind is `handwriting_sheet` with the grid `grid` and the step `grid_step`, or `workbook`.
  - A sheet's item is the answer slots `answer_slots` and, where needed, `text`. The slot bindings are `anywhere`, `sheet`, `zone` and `choice`.
  - A workbook's item is a line `line` of pieces of text and boxes `binding: box`.
  - The types are canvas's own, of the same composition. `Task` is `SheetTask` or `WorkbookTask`; there are also `SheetCanvas`, `WorkbookCanvas`, `SheetItem`, `WorkbookItem`, `AnswerSlot`, `Zone`, `LinePart`, `StatementPart`, `TextPart` and `PicturePart`. Both entry points export them, and at run time `core` still exports only `SHEET` and `replay`.
  - `canvas.tools` is a temporary field of both kinds, by the rules of R28, until the minor version with the field of tools (the 2026-10-26 amendment to R51 spec).
- **The check is as the schema's**, in the DOM-free part:
  - `id`, `statement`, `canvas` and `items` are required;
  - as in `task.schema.json`, the check covers the types, the enumerations, the integers and their bounds, the lengths of lists, the distinctness of options and the patterns — of the task's ID (`local_id`) and of the picture's path (`picture_path`);
  - the rules between fields are checked the same way: a workbook's item is only a line, a line has at least one box, a workbook has no grid, and an answer slot `anywhere` or `sheet` is the only one in its task;
  - every object is closed: a field the schema does not name is a `TypeError` with the field's path. So is an old name of the temporary type — `step`, `digit`, `lang` — and a closed field: `skills`, `band`, `difficulty`, `age_categories` and an item's `skills`. There is no open view with them (R05 spec; R51 spec);
  - only `undefined` omits a field, and `null` is a wrong value, as before (R23);
  - the path names the field as a place in the format examples does: `#/items/0/answer_slots/0` is `task.items[0].answer_slots[0]`;
  - the format rules beyond the schema — `task.zones`, `task.known-pictures` and others — are checked by `module-kit`.
- **What the sheet shows** — still the grid, the statement above the sheet and the tools (R23, R28):
  - a workbook is a `TypeError` on `task.canvas.kind`, until T47: the element checks a workbook's task whole, but does not undertake to show it;
  - `zone` is a `TypeError` on its `binding`, until its own epic;
  - the sheet skips `choice`: `app` shows the options;
  - the sheet skips the item's text too, and `app` shows it, together with the options. For `zone` the text's place is by the zone, and for `anywhere` and `sheet` the answer slot is the whole sheet, and the question stands in the statement.
- **The manifest is the property `manifest`:** the open view of the module manifest, as `app` has it. The element reads three fields of it and skips the rest:
  - `module_format_version` is `"0.1"`, otherwise a `TypeError`: while the format is v0, the platform reads only its current version (R44 spec);
  - `canvas.digit_height` is the digit height on the crop: whole px from 1 to 256, and 32 without the field. `exportWork()` takes it at the moment of the call (R27);
  - `languages.explanation` is the statement's language, a tag by the pattern `language_tag`. A new language changes only the statement's attribute, and its pictures stay.

  The canvas settings in the manifest are the canvas's own: a setting the element does not know is a `TypeError`, as a task's field is, since without it the element would draw the module's canvas wrong. The element reads the same object of the manifest again: the consumer could have changed it in place.

  Without a manifest the digits are 32 px, and the statement is in the element's own language, as before without `task.lang`. There is no manifest only with `undefined`, and `null` is a `TypeError`. `task` and `manifest` do not depend on each other, and a value assigned before registration goes through the shared helper (R23).
- **The tests** run on copies of the format examples of the tag v0.2.37 and of its open-view vectors, as rows of tables: the code and the tests do not read `spec/`.
  - The open view of every valid example is a task. With its closed fields, an example is a `TypeError` on `task.skills`.
  - Every invalid example with an error in the open view is a `TypeError` at the place from its first line or deeper. Four have their error in a closed field, and their open view is valid.
  - Of the manifest's examples, four fail at their place — their error is in one of the element's three fields — and sixteen pass.
- **The code:**
  - in the DOM-free part, `task.ts`: the types, the check `taskOf` and the template `templateOf`; `manifest.ts`: the settings `settingsOf`; the check's helpers are in `fields.ts`;
  - the helper of tasks and manifests for the tests and the trial page is `tasks.fixture.ts`;
  - in the element, the property `manifest`, and the statement's language is set apart from its parts (`statement.ts`).

— *Why:* the author's answers in the planning of T44, 2026-10-27, all by the recommendations:
- the digit height and the language from the manifest, by the property `manifest`. R51 spec puts them in the manifest, and `app` has the manifest: by it `app` asks for the learner's grade (architecture 3.1 spec). How `app` gets the manifest with the task is for T34 in `spec`'s RUN.md to decide, and this is В42;
- the workbook is a `TypeError` until T47;
- the check is strict, by the schema. Every object of the format is closed (the format's README, §5). Without strictness the old `step` would silently give a cell of 50, and `digit` a crop at 32 px. The window of R44 spec names `canvas` among the readers of modules;
- in one task, though it is more than one check (rule 11);
- `app` shows the item's text, since `app`'s task screen is "the canvas, answer slots, the choice of an option" (architecture 3.1 spec). This is В43.

  Decided in the epic's planning: `zone` on the sheet is a `TypeError`, and the sheet skips `choice`.

— *Rejected:*
- the element's own properties, the digit height and the statement's language: the names are not the format's, and `app` would parse the manifest itself;
- fields in the task, `canvas.digit_height` and `lang`, like `canvas.tools`: R51 spec rejected a height on each task, and the strict check would have two more exceptions;
- skipping extra fields, as R23 had it: a typo and an old name would silently give the default;
- checking only what the element reads: the TypeScript type and the check would part from the schema;
- checking the manifest whole: that is the work of `module-kit`, and the element needs three fields;
- `spec`'s schemas through a JSON Schema validator: the code of other repositories does not take the draft (R44 spec), and the schemas for code will come out with T35 in `spec`'s RUN.md;
- a blank sheet for a workbook's task: what is written on it would not be the workbook's history, and `app` could start to rely on it;
- the items' texts as paragraphs under the statement: the text of an item with a choice would stand apart from the options, which `app` shows;
- splitting the task into the task type and the property `manifest` — the author's answer.

— *Revisit:*
- with the types and schemas of T35 in `spec`'s RUN.md: canvas's own types will give way to them, and the check will stay;
- with the epic of zones — `zone` on the sheet;
- by `spec`'s answers to В42 and В43.

— *Consequence:*
- **T47** lifts the workbook's refusal and shows its lines;
- **T19**: the samples page gives the element the module manifest of the task too;
- **Д5** is narrowed, and **В42** and **В43** are rows «в реестр spec» in table 3 of RUN.md;
- a move to a new tag of `spec` compares the copies of the examples: `git -C spec diff <old> <new> -- format/`;
- amendments to R07, R23, R27, R28 and R30.

— RUN.md, T44, tables 3 and 4; [architecture.md](architecture.md), sections 1, 3.2, 3.3 and 3.7; README.md; `src/core/`, `src/element/`, `demo/`.

— *Amendment 2026-10-27:* "`app` shows the item's text" is about the sheet. On a workbook the item line is a part of the template, and the element shows it (R34). — R34.

— *Amendment 2026-10-27:* `templateOf` no longer rejects a workbook: its template is the layout of the lines on the page (R35). For now the element rejects it, by the same `TypeError` on `task.canvas.kind`, until the template layer of T51, and a task whose lines did not fit is a `TypeError` on `task.items[i]` before that. "T47 lifts the workbook's refusal and shows its lines" of the "Consequence" is shared by T47 and T51. — R35.

— *Amendment 2026-10-27:* since T51 the element shows the workbook (R36): there is no refusal on `task.canvas.kind` any more. A task whose lines did not fit is still a `TypeError` on `task.items[i]`. — R36.

— *Amendment 2026-10-27:* since `spec` v0.2.42 the task's open view has two more fields, `givens` and `unknown`, the givens and the unknown (R57 spec). For now the strict check rejects them: a task with them is a `TypeError` "task.givens: no field of a task's open view". Epic E7 will take them, and until it the copies of the format examples in the tests stay copies of v0.2.37 (Д5). — R40.

— *Amendment 2026-11-01:* the element takes the fields `givens` and `unknown` (T55). `givens` is a list of texts, from one, non-empty and distinct, and `unknown` is a non-empty text. The check only checks them, and `app` shows the chips (architecture 3.1 spec); they do not go into the author's template. The copies of the format examples in the tests are of the tag v0.4.1, not v0.2.42 as T55 named it: its branch ended with the move to v0.4.1 (R41), and the author chose the branch's tag. There are now this many copies:
- **valid examples of a task** — 16, and with them 7 open-view vectors. The open view of each is a task, and of a task template too: the placeholders stand in it as written;
- **invalid** — 55. 19 have their error in the open view, and they are a `TypeError` at their place or deeper. 36 have a closed error, and their open view is a task: the place lies under a closed field — `check`, `skills`, `template` and others —, or a closed field is missing, a box's `check` or `solution`, or `check` stands on a piece of text of a line;
- **the manifest** — 4 valid and 22 invalid, and 4 of them fail.

  The types of the task and of the manifest are `spec`'s, and canvas's own are only the narrowed ones, for the check (R41). — R41; RUN.md, T55.

— *Amendment 2026-11-02:* the element reads format 0.2, which came out with `spec` v0.6.0 (the 2026-11-01 amendment to R44 spec; the format's README, §2 and §11) — T68. The author's answers in the planning of T68:
- **a manifest of any version but 0.2 is a `TypeError`, and a manifest 0.1 too**, by the recommendation. While the format is v0, the platform reads only its current version, and a module of a version the reader does not read it "MUST refuse, with a reason" (the format's README, §2; the vector `manifest.format-version/previous-minor`). The rule above is the same, and only the version changes: `module_format_version` is `"0.2"`. Rejected:
  - reading 0.1 and 0.2, with 32 px for 0.1 without the field: the element would part from the format and from `module-kit`, which rejects a module 0.1 (Д59 in `spec`'s RUN.md), and the rule "only the current version" would have to be changed by a new decision;
  - reading 0.1 as 0.2: a module 0.1 without the field would silently get another height than the one its author wrote it with, and the format's README, §2, calls moving a module to 0.2 a new version of the module.

Also decided in the execution:
- **without `canvas.digit_height` and without a manifest, the digits are 24 px**, not 32 (the 2026-10-28 amendment to R51 spec). The default, as before, is one for both cases, `CROP.digit`: `app` does not have two defaults, and without a manifest the element draws the crop as for a module without the field. That is how `spec` expects it: «`canvas` — 24 px без паспорта, с форматом 0.2» (Д47 in `spec`'s RUN.md);
- **the copies in the tests are of the tag v0.6.2.** Only the manifest's copies changed: the version is `"0.2"`, `format-version-as-number` has `0.2` as a number, and three valid examples without `canvas` give 24. The copies of tasks and lessons, `workbook-page.yaml` and `tables-page.yaml` have not changed since v0.4.1 — `git -C spec diff --stat v0.4.1 v0.6.2` on their paths is empty —, and only the tag in their comments changed, and in `vectors/pages.json` the tag in the text of `about`. There are now this many copies of the manifest:
  - valid — 4 examples and the open-view vector `every-field-open`;
  - invalid — 22, and 4 of them still fail;
  - vectors of the rule `manifest.format-version` — three, `next-minor`, `previous-minor` and `unknown-version`, and all three fail. The open-view vector, `next-minor` and `unknown-version` were there at v0.4.1 too, but there were no copies of them: the test of versions took their values without the names;
- **the rest that format 0.2 gave** the code does not need. The SHOULD on a picture's opaque light background is the 2026-11-02 amendment to R42, the guideline on a workbook's page is the 2026-11-02 amendment to R35, and "An opaque picture hides the grid under its area" (the format's README, §21) the element already carries out: the demo layer stands above the template with the grid (R23, R42);
- the test of the submission's digest holds the crop at 32 px explicitly, since it holds the digest's record, not the height's default. The manifest of the tests of `app`'s path sets 16 px: at 24 it would not differ from the default, and at 32 the crop of its sheet no longer fits within the limit (R25).

— RUN.md, T68; [architecture.md](architecture.md), the status and sections 1, 3.2, 3.3 and 3.9; README.md; `src/core/`, `src/element/`, `demo/`, `vectors/pages.json`.

— *Amendment 2026-11-08:* the element reads format 0.3, which came out with `spec` v0.9.0 (the format's README, §2; R89 spec, R101 spec) — T77. A manifest of any other version is a `TypeError`, and 0.2 too. Decided in the planning of T77, by the documents:
- **The element does not read 0.2 beside 0.3.** While the format is v0, "the platform reads only the current version", and a module of a version the reader does not read it "MUST refuse, with a reason" (the format's README, §2). The vector `manifest.format-version/previous-minor` at v0.9.8 is already `"0.2"`. There are no modules 0.2 in a release: all three modules of `modules` v0.1.0 have `module_format_version: "0.3"` ([architecture.md](architecture.md), section 4). Rejected — reading 0.2 and 0.3: the element would part from the format text and from `module-kit`, and a module 0.2 moved to 0.3 has the same open view and numbers (the format's README, §2), so there would be no gain either.
- **The rules of version comparison** — the format's README, §27, the rules `module-version.*` (R89 spec) — are held by `module-kit` and `api`. The element compares no module versions and takes nothing from these rules. The rest that format 0.3 gave — Starlark, the module index and the places of the package that each version holds — the element does not need either.
- **The types** did not change: `ModuleFormatVersion` of the package `@altnovatrail/spec` 0.9.8 is `string`, and the check `FORMAT` still holds the version.
- **The copies in the tests are of the tag v0.9.8.** Only the manifest's copies changed: the version is `"0.3"`, `format-version-as-number` has `0.3` as a number, the versions' vector `next-minor` has `"0.4"`, and `previous-minor` has `"0.2"`. The count of copies is the same: 4 valid examples and the vector `every-field-open`, 22 invalid, of which 4 fail, and three vectors of versions. On the paths of the copies of tasks and lessons, `git -C spec diff --stat v0.6.2 v0.9.8` gives two edits: in `workbook-page.yaml`, `trap_values`, a closed field the open view does not carry, and in `essays-for-adults.yaml`, `skills`, and the test takes only its name. The tests are not touched by them, and in them, in `pages.fixture.ts` and in `vectors/pages.json` only the tag changed.
- The refused version in the test of assignment before registration is now `"0.2"`, the previous one.

— RUN.md, T77, table 4 (Д5); [architecture.md](architecture.md), the status and sections 3.3, 3.9 and 4; README.md; `src/core/`, `src/element/`, `src/eval/tasks.ts`, `demo/`, `vectors/pages.json`.

**R33. The buttons «Выше» and «Ниже» in the element's row, on any device: a press scrolls what two fingers would scroll (R29), by ⅘ of what it shows. At the edge the button fades and keeps the focus, and «Рисовать пальцем» becomes the last in the row.**
- **The buttons** are `<button>` elements of the row (R28), a pair between «Очистить» and «Рисовать пальцем»:
  - always visible — on any device, for an element with a height and without one —, so they do not change the row's width within a session;
  - the pair wraps whole: on a narrow screen it is not split between the row's lines;
  - the finger button is the last: when it comes and goes between strokes (R29), the row's other buttons do not move;
  - the labels are Up and Down, «Выше» and «Ниже», the keys `up` and `down` in the table of labels;
  - the toolbar's arrows go through them in the row's order, and Space and Enter press them (R28);
  - a button is at least 44 × 44 CSS px, and the theme and forced colors are as for the row's other buttons.
- **A press:**
  - scrolls what the first step of a two-finger gesture in the same direction would choose: the sheet's container, if it can move, otherwise the element's nearest scrollable ancestor — across shadow boundaries, up to `overscroll-behavior` `contain` or `none` —, otherwise the page, if its overflow is not hidden (R29);
  - chooses anew at every press: a container at its edge passes the scrolling on with the next press, as two fingers do with the next gesture;
  - the shift is ⅘ of what the scrollable shows on the screen: within the ancestors that clip it and within the window's visual viewport (`visualViewport`), and while the row of buttons is stuck above it, below the row. For a scrollable off the screen its whole client area is taken. The shift is in whole pixels of its layout, at least one, with `behavior: "instant"`, as for two fingers;
  - while someone writes or erases on any sheet of the page, a press does nothing: the sheet does not move under the pen (R29).
- **The edge:**
  - the button is `aria-disabled="true"` while what it would scroll goes no further its way. It fades and keeps the focus, as «Отменить» and «Очистить» do (R28);
  - the element recomputes the edges on a scroll of the container, on a scroll of the page and of its ancestors — by one `scroll` listener on `document`, in the capture phase —, on a new size of the page and of the window, and on a new layout;
  - the element does not hear a scroll of an ancestor in someone else's shadow tree. So a press asks anew rather than trusting the button's look, and a stale look does not take the scrolling away.
- **The check.** With `pointer-events: none` for the time of the check (R20) the buttons take no pointer, but scroll from the keyboard: scrolling changes neither the work, nor the history, nor the crop.
- **The code** is in the element: the pair of buttons and the method `edges` in `tools.ts`, the labels in `labels.ts`; the press, the visible part, the edges, the share `UP_DOWN` and the client area `clientBoxOf` in `index.ts`.

— *Why:* the author's answers in the planning of T45, 2026-10-27, all by the recommendations:
- the buttons are always visible:
  - on a tablet they replace two fingers. The element's own scrolling with two fingers is a multipoint gesture in the author's content. A replacement for it with one pointer is needed by 2.5.1 of level A, and one without dragging by 2.5.7 of level AA ([architecture.md](architecture.md), subsection 2.6);
  - on a computer they let the keyboard scroll an element with a height in Safari. A scroll container without focusable content cannot be scrolled from the keyboard there — WebKit bug 277290 has been open since 2024-07-29 —, and the sheet's container holds only the statement and the drawing surface;
- ⅘ is as Page Down in Safari on the iPad, the main device with a pen: WebKit pages there by 0.8 of the visible part. An overlap of a fifth keeps the last lines on the screen, and the learner does not lose the place;
- the edge is as for «Отменить» and «Очистить»: the button is visible and in focus, and it shows that there is nowhere to go;
- the finger button is last: coming and going, it leaves the other buttons in their places.

Before the work, a separate agent checked the design. Its corrections:
- the visible part is the scrollable's, below the row and within the window;
- a press during a stroke does nothing;
- the element hears a scroll of the page and of its ancestors on `document`;
- a press asks anew;
- the pair wraps whole.

The sources are in [architecture.md](architecture.md), section 4.

— *Rejected:*
- **buttons only on a device with touch**, like «Рисовать пальцем» — in Safari an element with a height would be left without scrolling from the keyboard;
- **buttons while the container scrolls** — the visibility would change with the layout and wait for the end of a stroke, and an element without a height would get no buttons, though two fingers scroll the page there;
- **⅞**, as Chrome on Android and Windows, and **the whole visible part** — less overlap, and without it a line at the edge is cut in half;
- **the scrollable's `clientHeight`** — the step would go both through what the row and `app`'s sticky header cover and through what is beyond the window's edge;
- **the part of the drawing surface** — without the statement and without the window, and for an element without a height the container is as tall as its content;
- **smooth scrolling** — two fingers scroll instantly, and smooth scrolling would need `prefers-reduced-motion` and a rule for a press in the middle of a run;
- **a press that trusts `aria-disabled`** — a stale look would take away scrolling that two fingers would do;
- **the edges in the drawing frame** — the frame runs on every move of a stroke, and a scroll of the page does not call it;
- **`disabled`** — takes the button out of the focus order (R28);
- **buttons that vanish at the edge** — the row would change its width;
- **a place after the finger button** — «Выше» and «Ниже» would move when it comes and goes;
- **icons** — the first slice of `app` will decide the interface's look (R28);
- **scrolling during a stroke** — the sheet would move under the pen.

— *Revisit:*
- the share ⅘ and quick presses — by T22. A double tap may zoom the page, and then the buttons need `touch-action: manipulation`;
- the level of accessibility — by the standard of T07 of `app` (О-24; В44 in table 3 of RUN.md);
- the scrollable's `scroll-padding` — if `app` gets a bottom bar over the sheet.

— *Consequence:*
- **T22** tries the share and quick presses on devices;
- **T47**: the workbook has the same row;
- subsection 2.6 of [architecture.md](architecture.md) is decided, and **В44** is a row «в реестр spec» in table 3 of RUN.md, `canvas`'s answer to О-24;
- amendments to R28, R29 and R31.

— RUN.md, T45, table 3; [architecture.md](architecture.md), sections 2, 2.6, 3.1, 3.2, 3.3, 3.7 and 4; README.md; `src/element/`.

— *Amendment 2026-11-02:* the icons of "Rejected" came with R78 spec: «Выше» and «Ниже» have arrows of the set Material Symbols before the label, and in forced colors mode they are of the label's color (R46). — R46.

— *Amendment 2026-11-11 (T92):* **in a low window the row does not stick (the T92 amendment to R28), and for an element without a height «Выше» and «Ниже» are at hand while the row is visible: a step of the page takes it off the screen. This is the price of 1.4.10, not a nonconformance with 2.5.1: `app`, which needs the buttons always, gives the element a height by the window, and then the row does not go away.** The visible part, while the row stands in place, is counted without its height, but below the band `--novatrail-canvas-top`, which `app`'s header covers then too, and the opened part of an example comes out from under this band, not from under the row. The band stands above what the row sticks in: above the page's scrolling, when the row sticks in its own panel, there is none, and a step of «Ниже» passed on to the page is ⅘ of the whole window. There is no motion but the scrolling itself (WCAG 2.3.3; R90 spec): «Выше», «Ниже», two fingers, a part of an example and a picture in a sheet area scroll at once, `behavior: "instant"`, even when the page asks for `scroll-behavior: smooth` — "Rejected" above rejected smooth scrolling —, and there are no animations in the style. The test `src/element/motion.test.ts` holds this under `prefers-reduced-motion: reduce`. — RUN.md, T92; [architecture.md](architecture.md), sections 3.1 and 3.3.

— *Amendment 2026-11-11 (T93):* **the element's scroll container, while its content overflows it, is a region: `role="region"`, `tabindex="0"` and the name of the canvas kind, «Лист», «Тетрадь» or «Пример» (R90 spec; WCAG 2.1.1, 2.1.2, 2.4.7). The keyboard enters it with Tab after the row, scrolls it by the browser's native keys — the arrows, Page Up and Page Down, Home, End and Space — and leaves with Tab for what comes after the element.**
- **When:** the three attributes — together, and only while the container's `scrollHeight` exceeds its `clientHeight` by more than 0.5 px. An element without a height has no overflow — the page scrolls —, and it has no Tab stop; nor does an element with a height where the task fit. Chrome, "Keyboard focusable scrollers", and axe's rule `scrollable-region-focusable` decide it so too. The check is called by the layout, `#layout()` — a new size of the container, of the statement, of the list of parts and of the screen's density —, and by a new size of the page, of the row and of the window, not by scrolling: scrolling does not change the overflow. A container that holds the focus keeps the attributes until the focus leaves it, and the window's `blur` does not remove them. The overflow is only vertical: horizontally the container hides the excess, `overflow-x: hidden`.
- **The name** is by the kind and by the labels' language, as the row's name is (the T93 amendment to R28). The container has no `lang` of its own: it would fall on the statement too, which has the task's language. So, with an element's `lang` that the table does not have, the region's English name is read in the element's language.
- **The focus ring** is 2 px of the ink's color inside the edge of the visible part, and Highlight in forced colors, as for the buttons (the T92 amendment to R28). It is on the container's empty sibling `.ring` in the still wrapper `.frame`, over the sheet: the `outline` of the container itself is drawn under its positioned descendants — the paper `.sheet` and the scene —, and a probe in Chromium showed it only above the statement. The sticky row, `z-index: 1`, covers the top of the ring. A pointer press focuses the container without the ring and scrolls neither it nor the page, and `-webkit-tap-highlight-color: transparent` keeps a touch from flashing the whole sheet.
- **«Выше» and «Ниже»** stay: without them one pointer will not scroll the sheet (2.5.1, 2.5.7). For the keyboard in Safari they are no longer the only way — the region itself gives one too.

*Why:* the author's answers in the planning of T93, 2026-11-11, by the recommendations. R90 spec tells every package "an own scroll container — only with `tabindex="0"`, the role `region` and a name" because of WebKit bug 277290, and 2.1.2 tells it to let the keyboard out. The overflow, not the element's height: the consumer's height cannot be read from the style — `getComputedStyle` gives px already computed —, and without overflow there is nothing to scroll.

*Rejected:* a Tab stop always on an element with a height — for the reason above; an own `keydown` for the keys — the browser scrolls a focused container itself; `outline` or `box-shadow: inset` of the container itself — both are under the sheet, and forced colors remove the shadow; `:has()` or a class on `focus` — the sibling selector `+` does the same without them.

*Revisit:* the keyboard in Safari — on a device: there is no WebKit in the image, and that the region scrolls from the keyboard there is known from bug 277290 and R90 spec, not from a probe; the horizontal — with the sheet's zoom, T94.

— RUN.md, T93; [architecture.md](architecture.md), sections 2.6, 3.1 and 3.3; `src/element/index.ts`, `src/element/keyboard.test.ts`, `src/element/a11y.test.ts`, `src/element/forced-colors.test.ts`.

— *Amendment 2026-11-11 (T94):* **«Левее» and «Правее» scroll an enlarged sheet sideways by the same rules by which «Выше» and «Ниже» scroll it down (R73):** what two fingers would scroll, by ⅘ of the visible width, at once, and they are unavailable at the edge. The chain is the container, an ancestor with `overflow-x` scrolling, the page; `overscroll-behavior-x: contain` or `none` stops it, and for a right-to-left ancestor `scrollLeft` counts from the right edge. They are visible while the zoom is above 100 %. The region of T93 holds for overflow sideways too, while the sheet is enlarged: an element without a height whose sheet is wider than it has a Tab stop too, and the arrows left and right scroll it. — R73.

**R34. The workbook is a page of 1000 × 1400 units, as the sheet is, and the statement is above it. The layout in the DOM-free part puts the items' lines on the template layer, by the task and by its own table of widths, not by the device's font; a task that did not fit is a `TypeError`. The box is one and the same for the whole task, each stroke is in one box or in none, and the rest is scratch work. A crop of each filled box goes to the check, on the workbook the boxes replace the groups, and the property `filled` tells which boxes are filled.**
- **The page** is 1000 × 1400 units, a constant of the kind, as for the sheet (R06), without a grid:
  - the statement is above it, HTML, in the same scrolling, as on the sheet (R23);
  - the items go as lines in order, each with its number on the left. Short lines stand in two columns, a long one wraps by words, and a word longer than the line wraps by characters;
  - the free space is for scratch work.
- **The layout** is a function of one task, in the DOM-free part and in integers:
  - the characters' widths are canvas's own table by classes: digits, Latin, Cyrillic, operation and comparison signs, punctuation. A character the table does not know has a width of its own;
  - the SVG of the template layer draws the text. A piece is one `<text>` at one point, without `tspan`, and `textLength` with `lengthAdjust="spacingAndGlyphs"` fits it to the computed width in any font. The code does not read the SVG's text sizes;
  - the boxes and the numbers stand where the layout put them, on any device;
  - the numbers — the font size, the line step, the box, the margins and the rule of columns — are chosen by the sweep of T47. The entry point `core` does not export the layout, and a file of test vectors holds its numbers.
- **A task that did not fit** is a `TypeError` on `task.items` with the number of the first item that did not fit, as for a zone (R32). The boxes and the text do not shrink. T47 will pass the limit for authors, with the layout's numbers, «в реестр spec», to T38 in `spec`'s RUN.md.
- **The box** is one and the same for the whole task:
  - it holds a two-level fraction, a three-digit number and a comparison sign;
  - the border is thin and solid, of one thickness at any zoom, with a contrast of at least 3:1;
  - the line's characters stand at the middle of its height;
  - the border does not clip the ink.
- **The boxes' strokes** — each visible stroke is in one box or in none:
  - the rule is in integers, without the DOM and without time, for each stroke separately: other strokes do not change it;
  - the rule decides a contested case itself: more points, then the earlier place;
  - the parameters are in fractions of the box, and the sweep of T48 chooses them;
  - the rule takes the same strokes as `exportWork()`: the stroke under the pen is not there, and the strokes under an eraser not yet lifted are (R27);
  - what is in no box is scratch work. It is the learner's work: it is on the page and in the writing history, but does not go to the check.
- **There are no groups on the workbook** — the boxes take their place:
  - the submission's context is `{ boxes, digest }`: the table "box → stroke IDs", where a box is the numbers of the item and of the box, from 1, and the digest of its strokes, places and the boxes' rectangles. A context given under another layout is a `TypeError`. There are no crop numbers in it: there is no snapping on the workbook;
  - a tutor's mark comes with an answer slot — by place, since answer slots have no IDs (R51 spec) —, and holds to the strokes of its row of the table by the rules of R26: when all of them are erased it is not seen, and an undo brings it back. A mark's place on the workbook is only an answer slot: a group label and the model's box in fractions of the crop are a `TypeError`. The mark itself is a box, as on the sheet.
- **`filled`** is a read-only property:
  - per item, per box, whether it is filled, in the order of the items and the boxes. The value is frozen and stays the same until it changes, and on the sheet it is `null`;
  - a box is filled if it holds at least one of the strokes that would go into `exportWork()`: exactly such boxes have a crop;
  - the value changes with an action on the sheet, before `historychange`, and on an assignment of `task` or `history` without an event: an assignment is the consumer's own action (R28);
  - being filled shows on the box itself too, not only by color, and sounds in its name.
- **To the check** the whole page goes at once:
  - `exportWork()` gives `{ cells, submission }`. `cells` are the crops of the filled boxes, `{ item, slot, png }` in the task's order: the rule of R25 over the box's strokes, at the manifest's digit height, only the ink, without the border and the text. `submission` is one submission context. Its key names the kind of the work: `png` for the sheet, `cells` for the workbook;
  - an empty box gives no crop and is not read. If none is filled, `null`, even if there is scratch work;
  - the place in an observation on the workbook is the answer slot by place.
- **Accessibility**: a screen reader reads the lines, in the task's order:
  - the SVG of the workbook's template has no `aria-hidden`, the root is `role="none"`, the lines are a list `<g role="list">` of `<g role="listitem">`, the text is `<text>`. A box is `<rect role="img" aria-label>` with a name from the table of labels and with whether it is filled;
  - the lines' language is the manifest's `languages.explanation`, as for the statement (R32), and a box's name has its own `lang`, as the row of buttons has (R28);
  - the text and the borders are in the ink's color on the paper, and CanvasText in forced colors. A filled box there is Highlight;
  - the panel's name is by the canvas kind: «Лист» or «Тетрадь».
- **The workbook's sample** (epic E5):
  - the boxes' crops at eval's heights;
  - the table "box → stroke IDs" that the device built from the raw strokes: the runner does not recompute it, as it does not recompute the groups ([architecture.md](architecture.md), section 3.5). In eval-set samples and child samples it moves to the new numbers of the strokes, as the table of groups does;
  - the boxes' rectangles in page units, and the runner does not need `canvas`'s layout;
  - eval-set samples and child samples hold only the boxes' strokes, and a measurement sample from an adult carries the whole writing history (R09);
  - the eval protocol takes the box rule and its test vectors as they are.

— *Why:* the author's answers in the planning of T46, 2026-10-27, all by the recommendations:
- the page 1000 × 1400 and a `TypeError` for a task that did not fit;
- canvas's own table of widths;
- a crop of each box;
- boxes instead of groups;
- the property `filled`;
- a sample with the device's table;
- in one task, though it is about an hour of reading (rule 11).

The rest is «да» ("yes") to the plan. Before the questions, two separate agents checked the design: one from the side of the check and the agreements, the other from the side of the page and the code. Their corrections:
- `TypeError` instead of shrinking;
- the contested case is in the box rule itself, and its parameters are in fractions of the box;
- the rule is per stroke, and on the same strokes as `exportWork()`;
- the sample carries the device's table;
- the context without crop numbers, and the mark's answer slot by place;
- two columns for short lines;
- the SVG root is `role="none"`, and the box's border is not in the grid's color;
- a WebKit-safe form of text;
- the layout outside `core`, with vectors;
- the panel's name by the canvas kind.

The sources are in [architecture.md](architecture.md), section 4.
- **A page like the sheet:**
  - `SHEET` holds the check of an assigned history, the crop, the marks and the screen. With one page every valid history is whole under any task, and `task` and `history` are still assigned in any order (R27);
  - the canvas already rejected two sheets of different heights — in the amendment to R06 on the board (R20);
  - ten short items — the example of concepts 8 spec — stand in two columns, and room is left for scratch work.
- **The statement above the page** — by the arguments of R23:
  - HTML grows with the zoom and wraps;
  - its place does not depend on fonts;
  - the sizes of the statement's pictures are in CSS px (R51 spec).

  So it is in the prototype too.
- **`TypeError`, not shrinking:**
  - a child does not write smaller because the box is smaller. The answer would go past the border, and the box would count as empty and not be read;
  - T48 chooses the box rule at one scale;
  - a refusal of a task valid by the format already exists — the zone (R32). The limit for authors, which `module-kit` will check, will lift it.
- **Canvas's own table of widths:**
  - a box stands where the task's layout put it, and strokes in page units fall into it on any device — the argument of R23. The runner and the synthetic samples will repeat the layout without a browser;
  - the SVG itself fits the text to the width. A font in the package would have to be waited for, and its license and weight are one more dependency;
  - in WebKit only the simple case is reliable — one `<text>`, one point: the new layout of SVG text is turned off there.
- **The box's crop:**
  - the card gives `canvas` «вырезку ячейки» (the crop of an answer slot), and the "Revisit" of R25 waited for it;
  - this is how T79 of `tutor` reads answer slots, and the reading of digits on the device, which `tutor` advises, takes the same picture;
  - the model need not search for what is in which box, and the crop rule is the one the eval protocol has already taken (R31);
  - the crop has no fonts on it, and its bytes are the same in any browser engine;
  - the scratch work does not go. Of the forms that give the same use, this is the poorest in data: so requires the rule of recommendation of П-21, by which R52 spec was decided.
- **Boxes instead of groups.** A group of R24 joins strokes closer than 50 units and 2 s to each other. And "47 ÷ 6 = [ ] r [ ]" is written in a row, and one group would take both boxes. A mark on the workbook is about the answer in a box, and the table of boxes names exactly that.
- **A property, not an event.** R27 rejected two events for one action, and the second amendment to R36 spec fixed the `detail` of `historychange`.
- **A sample with the device's table:**
  - the share of points depends on how densely they stand (R26), and the points of eval-set samples and child samples are resampled (R09). The device's table and the boxes' rectangles spare the runner the layout and the recount;
  - neither the check nor eval reads the scratch work, and a child sample does not need it.

— *Rejected:*
- **a width of 1000 and a height by the lines** — `SHEET` would become a function of the task, and a history given before the task would be checked against a page not its own;
- **the height as a setting of the module** — R06 rejected it with the reservation "Come back to it if a task needs more than the sheet". On the workbook that is exactly a task that did not fit. The answer to it is the limit for authors and a `TypeError`, and a height from the module would make the check of the history depend on the task, as a height by the lines would;
- **the statement on the page** — its place would depend on the font, and the pictures' sizes are CSS px;
- **shrinking down to a limit, and without a limit** — for the reasons above;
- **a font of its own in the package** and **a layout by the device's font** — for the reasons above;
- **a box sized by the answer** — the key is closed, and the open view does not know it; **a box that grows** — the lines under it would shift under the pen;
- **a stroke by its bundle** — a fraction bar does not join bundles (R25); **clipping the ink by the border** — a digit beyond the edge would be lost;
- **forbidding writing outside the boxes** — working in the margins is usual for a school workbook;
- **one crop of the strokes of all the boxes** — the model would search for what is in which box; **a crop of the whole page** — the scratch work would go to the provider;
- **the groups of R24 over the whole page** and **inside the boxes** — for the reasons above;
- **an event of its own** and **the filled state in `detail`** — for the reasons above;
- **a hidden copy of the lines in HTML** — two sources of one text, and the screen reader would show the wrong place;
- **a sample as for the sheet** — the child sample would hold the scratch work; **deciding the sample in E5** — the row for the protocol would come too late for epic E3 of `spec`;
- **splitting the task** — the author's answer.

— *Revisit:*
- the layout's numbers — by the sweep of T47. After the first release only a decision of its own changes them: the histories know neither the task nor the layout. Under new numbers old answers would fall into other boxes or into the scratch work, and `filled` and the crops would change with them. Such a decision names how `app` opens the histories written before it. An edit of a task's text is already another task and a new version of the module (R44 spec), and the history of another task under this one is the consumer's error (R27);
- the text in Safari — by T22, or when WebKit turns on the new SVG layout;
- a copy of the lines in HTML — if VoiceOver on the iPad does not read the SVG (T22);
- the limit of lines — by `spec`'s answer to T47's row;
- the empty box — by epic E3 and T29 in `spec`'s RUN.md: concepts 9.1 spec has no "no answer";
- the growth of the lines' text with the page's zoom (WCAG 1.4.4) — by the standard of T07 of `app` (О-24);
- one crop — if `spec` chooses it in В45: T49 keeps this option cheap.

— *Consequence:*
- **T47**: the page and the template layer, the `TypeError` and a row «в реестр spec» on the limit of lines;
- **T48**: the box rule, its test vectors and `filled`;
- **T49**: `exportWork()` on the workbook, the context `{ boxes, digest }` and the marks with an answer slot by place;
- **T50**: sections 1 and 3 and a "Consequence" about the tasks of E5: the sample file, the synthetic samples, the samples page and the probe on devices;
- amendments to R06, R09, R23, R24, R25, R26, R27, R28 and R32;
- **table 3 of RUN.md**: В45–В48 «в реестр spec».

— RUN.md, T46–T49, E6, table 3; [architecture.md](architecture.md), sections 1, 2, 2.7 and 4.

— *Amendment 2026-10-27:* the layout's numbers, the table of widths and the rules of lines are R35. Its planning refined four places:
- "the characters' widths are canvas's own table by classes": a class is for the digits and for the operation and comparison signs, and the letters and the punctuation marks each have a width of their own;
- "a piece is one `<text>`": a piece is the part of a piece on one line of the page — a piece wrapped onto two lines cannot be drawn by one `<text>` without `tspan`;
- "the boxes and the text do not shrink": the font size and the boxes do not change, and the fitting by `textLength` stretches or squeezes the characters — in the image's fonts by less than ⅛;
- the item's number in the error's path is from 0, `task.items[i]`, as in the format's path `#/items/0`, and in the error's text from 1.

"The runner and the synthetic samples will repeat the layout" of the "Why" is the synthetic samples and `module-kit`: the runner does not need it, the boxes' rectangles lie in the sample (В47). The author split the task T47 in its planning: the layout is T47, the template layer T51. — R35.

— *Amendment 2026-10-27:* the box rule is R37. Its planning refined two places:
- "the earlier place" is earlier in the task's order: by item, then by box, from 1. On any page of R35 this is also the order from top to bottom, left to right, and the runner, which has the numbers and the rectangles of the boxes in the sample, does not need the layout;
- "the parameters are in fractions of the box" — in thousandths: of the box's width horizontally and of its height vertically.

The rule is not "the share of points" but "the middle of the frame of points": the sweep of T48 chose it from both families and a variant. — R37.

— *Amendment 2026-10-27:* the "Consequence" about T49 is half done: the work for the check is R38, and T53 places the marks with an answer slot by place — the author split T49 in its planning. The workbook's digest holds all the boxes of the page, not only the filled ones: for a context of another layout it is different, even if the filled boxes stayed in place, and the check of marks of T53 will not let it through. — R38.

— *Amendment 2026-10-27:* the "Consequence" about T49 is done wholly: the marks with an answer slot by place are T53 (R39). — R39.

— *Amendment 2026-10-27:* the "Consequence" about T50 is done. The workbook is in [architecture.md](architecture.md), sections 1 and 3, its whole design in section 3.8, and subsection 2.7 is "Decided". From the decisions of E6, R32–R39, this follows for the tasks of epic E5. The bodies of the tasks in E2's archive are not edited: their planning takes this up.
- **T16**: the eval protocol takes the box rule and `vectors/boxes.json` as they are (В47), and with them the workbook's sample. If the protocol decides otherwise — an amendment to R34 and section 3.5.
- **T17**: the workbook's sample file (section 3.5):
  - the crops of the filled boxes at eval's heights, by the same `cellsForCheck`, with the item and the box;
  - the table "box → stroke IDs" that the device built, and the rectangles of all the page's boxes;
  - a workbook's sample has no groups and no group boxes;
  - eval-set samples and child samples hold only the boxes' strokes, and the table moves to the new numbers of the strokes.
- **T18**: the synthetic samples carry workbook pages too, in every composition: tasks like the layout's set, `src/core/pages.fixture.ts`, and writing by seed, as in the sweep of the box rule, `src/core/workbooks.fixture.ts`. An empty workbook, like an empty sheet, gives no crops.
- **T19**: the samples page shows the workbook too: it gives the element the task and the module manifest (R32). The workbook's printed text takes the page's font, and whatever it is, it does not move the layout (R34, R36).
- **T20**: a workbook's markup is by box: the value in each box. On the workbook the table of boxes replaces "the strokes of each line" of section 3.5. On saving, the page shows the boxes' crops — what the model will see.
- **T21**: the element rejects a workbook's task that did not fit on the page (R35). So the build checks that every workbook task from the file of the measurement's tasks fits on the page — otherwise only the volunteer would see it.
- **T22** tries on devices what R33–R37 left to it:
  - the share ⅘ and quick presses of «Выше» and «Ниже»;
  - the lines' font size and fonts on children's tablets;
  - the text, its reset and the borders in Safari;
  - VoiceOver and TalkBack — by lines and by touch;
  - a fraction by finger and by pen in a box of 100, and with it the margin and the limit of the box rule.

  Before the first release an amendment with new vectors changes the layout's numbers and the rule, and after it only a decision of its own.
- **T24**: the first release carries the workbook too: a new canvas kind comes out before the module that takes it (R44 spec; architecture 3.2 spec). So the author decided in the planning of E6: T24 or a task of its own comes out first.
- **T25**: section 3 is about the workbook too. `tutor`'s CI reads the workbook's samples if the measurement takes them: T78–T80 of `tutor` run on their own synthetic samples, without `canvas` (`tutor` at b028234, read 2026-10-27).

The «Основа» of E5 in table 2 of RUN.md names this amendment. — RUN.md, T50, table 2; [architecture.md](architecture.md), sections 1, 2, 2.7, 3 and 3.8.

— *Amendment 2026-10-27:* "Revisit: the empty box — by epic E3 and T29 in `spec`'s RUN.md" is decided: an empty answer slot is "unreadable" with the reason `blank` (R56 spec). It needs no crop: `filled` names the empty boxes. — R40.

— *Amendment 2026-11-11 (T93):* the workbook's panel name is «Кнопки тетради», and «Тетрадь» is the name of its scroll container while it scrolls (the T93 amendments to R28 and R33). — R28, R33.

— *Amendment 2026-11-11 (T94):* **the "Revisit" about the growth of the lines' text with the page's zoom (1.4.4) is decided by R73: the buttons «Крупнее» and «Мельче» grow the printed text up to 200 % at any width, and the nonconformance that `app` declared goes away.** The workbook's page stays 1000 × 1400 units and is not laid out anew: 1.4.10 allows it a two-dimensional layout. — R73.

**R35. The layout of a workbook's page: font size 30 units, box 100 × 100, rows 32 apart, margins 40 and two columns of 440: up to 10 rows, that is up to 20 short items or up to 10 long ones of one line. Short items stand two in a row, row by row, and a long one takes the whole width and wraps. The characters' widths are canvas's own numbers in hundredths of the font size, by a measurement of the image's fonts, and characters are told apart only by explicit code ranges. For now the element rejects the workbook: its template layer is T51.**
- **The numbers** are in page units, 1000 × 1400 (R34):
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
- **Only explicit code ranges.** Neither `\p{…}`, nor `\s`, nor `trim()`, nor `Intl.Segmenter`, nor `normalize()`: they follow their engine's Unicode tables, and the layout is one in any engine and in Node, as the crop is (R25). Words are what lies between runs of the whitespace U+0009–000D, 0020, 0085, 2028 and 2029; a run is one space, and at the edges of a piece none. A cluster is the walk of `for…of`: a character without a width, a character after the joiner U+200D and the second regional indicator of a flag go to the character before them.
- **The lines:**
  - the words of one piece that stand side by side in a line are one text, one `<text>` (R34), of the width ⌈30 × (Σ hundredths + 26 × (words − 1)) / 100⌉. The places are sums of integers in order;
  - a box holds to the word after it, and a line may wrap between two boxes. A line does not start with a character of `.,:;!?)]}»…` and does not end with one of `([{«„`. Two pieces of text in a row are joined with a space, and before a closing character and after an opening one, without a gap;
  - an item is short if its line, laid in one line, is no wider than 384 — a column without the number's indent. Two short ones in a row stand in one row — at 40 and at 520 —, and a short one before a long one stands alone, on the left;
  - a long item takes the whole width, 864, greedily: by pieces inside which the line cannot wrap; a piece wider than the line, by one word or box; and a word wider than the line, by clusters. Wrapped lines start under the first;
  - a line with a box is 100 high, without a box 46. The baseline is the middle of the line + ⌊font size / 3⌋: so the middle of digits and signs falls on the middle of the box without `dominant-baseline`. The top of a box is the top of its line;
  - the number "n." stands on the right of its column, on the baseline of the item's first line.
- **Did not fit**: a row that would go lower than 1360 is a `TypeError` on `task.items[i]`, the first item of this row. The number in the path is from 0, as in the format's path `#/items/0`, and in the error's text from 1. The layout stops on it, and a huge task costs no more than its check. There are no more than 99 items on a page, whatever numbers the sweep gave: the number column is two digits.
- **The layout** is `pageOf` in `src/core/page.ts`:
  - `Page` is the items in order, each with its number, its line in reading order and its boxes by place, from 1, and the bottom of the last row. All in integers and frozen;
  - `templateOf` gives it as the workbook's template together with the statement and the tools (R32), and `sameLayer` compares templates: the same grid or the same lines;
  - the entry point `core` does not export the layout, and `entry.check.ts` holds this;
  - [vectors/pages.json](../vectors/pages.json) holds the numbers: the set's pages, the table of widths and the rules of lines, and for each page the layout or the error.
- **The element** rejects the workbook for now by the former `TypeError` on `task.canvas.kind`: the template layer, accessibility, the theme and the trial page are T51. A task whose lines did not fit is a `TypeError` earlier, on its item.

— *Why:* the author's answers in the planning of T47, 2026-10-27, all by the recommendation:
- split T47 into the layout and the template layer, T51;
- the box 100 × 100;
- two columns — row by row;
- `exportWork()` on the workbook until T49 — a refusal with `DOMException` "NotSupportedError" (this is T51).

Before the questions, two separate agents checked the design — from the side of the layout and from the side of the element. The sources are in [architecture.md](architecture.md), section 4.
- **The box 100 × 100** is two cells of the sheet (R06). A synthetic two-level fraction with digits of 36 units each (`src/core/sheets.fixture.ts`) is 86 high, and in the box it has 7 above and below. Three digits are 72 wide, 14 on each side. With a box of 104 there are already only 9 rows, and 125 and 150 give 8 and 7.
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
  | box 96 | a fraction in the box has 5 to spare on each side |
  | gap 20, margins 50 or 60 between columns | "347 ÷ 6 = [ ] r [ ]" goes to the whole width |
  | rows 24 apart | the boxes of neighboring rows are closer than 32 |

  Font size 30 is 24.6 CSS px on a tablet at k 0.82, 21.3 at 0.71, and on a phone at 0.39, 11.7. «47 : 6 = [ ] (ост. [ ])» with a box of 100 is long at any font size: this is the row for authors, В49.
- **A width per character for letters, not classes.** Coarse classes would stretch "r" by 41 % and squeeze "mm" by 44 %. The hundredths are canvas's own rounded numbers, and the rounding error is under 0.5 % against ±10 % between fonts.
- **The distortion** on the set — 252 parts of text in the image's Chromium. The fitting to the table stretches or squeezes text in Liberation Sans by a factor of 0.975–1.085 (median 1.043), and in Liberation Serif by 0.910–1.000 (median 0.938). Liberation Mono it squeezes: the median is 1.42, and a lone "." 2.25. T22 measures the devices' fonts.
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
- **`dominant-baseline` and `text-anchor: end`** — in WebKit only the simple case is reliable (R34);
- **a number column sized by the count of items** — the indent would change with the tenth item;
- **a place set aside for scratch work,** — scratch work keeps what the lines did not take, and the task does not need it;
- **a line break after a box** — the box would be torn from the word after it;
- **one task** — the author's answer: T47 and T51.

— *Revisit:*
- the font size and the fonts — by T22, on children's tablets. After the first release only a decision of their own changes the numbers (R34);
- the box and the gap between boxes — by T48's sweep of the box rule and by T22, if a fraction written with a finger does not fit. Before the first release — by an amendment, with new vectors;
- right-to-left writing — with the first module in such a language: the line runs left to right, and a piece as the browser lays it out;
- Greek and Latin with diacritics — with widths of their own, if they come into the modules of the first slice.

— *Consequence:*
- **T51** — the workbook's template layer in the element: SVG, accessibility, the theme, the trial page and the refusal of `exportWork()` until T49;
- **T48** depends on T51: whether a box is filled is seen on the box itself;
- amendments to R32 and R34;
- **table 3 of RUN.md** — В49 «в реестр spec»: a limit of lines for authors, for T38 in RUN.md of `spec`.

— RUN.md, T47, T51, E6, table 3; [architecture.md](architecture.md), sections 2.7, 3.2, 3.3, 3.7 and 4; `src/core/`, `src/element/fonts.test.ts`, `vectors/pages.json`.

— *Amendment 2026-10-27:* the element no longer rejects a workbook: T51 made its template layer (R36). It checked the fitting of the text under an ancestor's hostile styles: the start and the end of each text are where the layout puts them, in the three fonts of the image. — R36.

— *Amendment 2026-10-27:* the set's synthetic fraction — `fraction()` in `src/core/sheets.fixture.ts` — is 74 high, not 86: its digits stand at 300→336 and 338→374. In a box of 100 it has 13 above and below, not 7, and in a box of 96, 11, not 5. So the row "box 96" of the sweep's table breaks nothing: the box of 100 is the author's answer, two cells of the sheet, not a consequence of the fraction. "Revisit: the box and the gap — by T48's sweep of the box rule": T48's sweep did not touch them. With a box of 100 and a gap of 32 the accepted rule loses not one answer of the set (R37). — R37.

— *Amendment 2026-11-02:* the layout's numbers will become a format rule. `spec` answered В49 with the first 2026-11-01 amendment to R51 spec: the lines of a task on a workbook MUST fit on the page the way the layout of `canvas` lays them out, and the rule comes in with the version 0.y that the modules' requests bring after their first content (T38 in RUN.md of `spec`, put off to the epic E6 there). In 0.2 there is only a guide for authors, the README of the format, §14: up to 10 rows, a short item a line of up to 384 units, a long one in one line up to 864. Until the rule, the numbers and the table of widths are `canvas`'s, but it brings a change to them as a row «в реестр spec»: the guide is corrected by it (Д57 in RUN.md of `spec`). With the rule, the numbers, the table of widths, the rules of lines and the cases of `vectors/pages.json` move into `format/`, a test of `canvas` checks the layout against the vectors of `spec`, and a change of the numbers becomes a version of the format. The result of T22 — the font size and the fonts on children's tablets — had better be ready by that version. — R44.

— *Amendment 2026-11-09 (T85):* **the numbers and the rule of the layout are now the format's: `format/page.yaml` and the test vectors `format/vectors/pages/` of `spec`, which the package `@altnovatrail/spec` carries as JSON (the format text of `spec`, §§9 and 14; R108 spec). These are the numbers and the vectors of `canvas`, and the element's layout gives each of the 19 vectors of `spec` with no changes. The tests hold it by the package's vectors, and the table of widths and the numbers by the package's `page.json`; no test writes `vectors/pages.json` any more, and it stays as it was, a record that this entry and the archive of E6 refer to (R60).**

**R36. The workbook's template layer: the element shows the lines of its items on the page — the numbers and the pieces of text as SVG, fitted to the layout of R35, and the boxes with a frame of 1 CSS px on whole device pixels. The printing is in the ink's color and the consumer's font, and it takes nothing else inherited. A screen reader reads the lines as a list, and the boxes by the names from the table of labels. `exportWork()` on a workbook until T49 is a refusal `NotSupportedError`, and the element is horizontal whatever the page's writing mode.**
- **The layer by canvas kind** — the same SVG of the template layer, with the same `viewBox` (R23):
  - a sheet has the grid, and the layer is `aria-hidden`;
  - a workbook has the lines without a grid, its root is `role="none"`, without `aria-hidden`;
  - a task of another kind rebuilds the layer, a task with the same lines (`sameLayer`) writes nothing, and the work stays (R20);
  - a workbook that does not fit is still a `TypeError` at `task.items[i]` (R35).
- **The lines:**
  - `<g class="print">`, in it `<g role="list">`, and in that a `<g role="listitem">` per item, in the task's order;
  - the number and each part of a piece on a line of the page are a `<text x y textLength lengthAdjust="spacingAndGlyphs">` by `PageText`, without `tspan`. The code reads no sizes of the text (R34);
  - a box is a `<rect role="img">` by `PageBox`.
- **The printing takes nothing inherited.** The printing group has `all: initial`, and after it `font-family: inherit`, `visibility: inherit`, `pointer-events: none`, `direction: ltr`, `font-variant-numeric: tabular-nums`, font size 30 and `color: var(--novatrail-canvas-ink, #111)`. The text is `fill: currentColor`, the frame `stroke: currentColor`.
- **The box's frame** is 1 CSS px, `vector-effect: non-scaling-stroke` and `shape-rendering: crispEdges`.
- **Color:**
  - the printing and the frames are in the ink's color, and they have no theme variable of their own;
  - an invalid value of the variable gives them, as it gives the ink of the drawing surface, the color of the page's text, not the black of `all: initial`;
  - in forced colors, an explicit `fill` and `stroke` of CanvasText: SVG keeps the parent's color there ([architecture.md](architecture.md), section 4), and the theme's ink would stay.
- **Accessibility:**
  - the numbers are text, and a screen reader reads them, like the markers of an `<ol>`;
  - a box's name is «Окошко», and among several in a line «Окошко 1», «Окошко 2», by place. Whether it is filled, in the name, is T48;
  - the language of the lines is the manifest's `languages.explanation`, as an attribute `lang` on `<g role="list">`. Without a manifest there is no attribute, and the lines are in the element's language, like the statement (R32);
  - a box has a `lang` of its own, the language of the labels, by the element's `lang`, like the row of buttons (R28). A new `lang` of the element changes the boxes' names together with the buttons' labels;
  - the panel's name is by the canvas kind: Sheet or Workbook, «Лист» or «Тетрадь».
- **The labels** — the table of R28 also has `workbook` and `box`: Workbook and Box, «Тетрадь» and «Окошко».
- **`exportWork()`** on a workbook until T49 is a rejected promise, `DOMException` `NotSupportedError`, for an empty workbook and for a written-on one.
- **Marks** until T49 are as on a sheet: strokes hold them, not boxes.
- **The page's writing mode.** `:host { writing-mode: horizontal-tb }`: the element — both sheet and workbook — is horizontal under an ancestor's vertical writing. A `writing-mode` on the element itself is stronger: that is the consumer's choice.
- **Scrolling to an item.** `scrollIntoView` of an item that is not seen scrolls the container at once. The item comes into the visible part when the layout sets a new `viewBox`, after two animation frames.
- **Tests:**
  - `src/element/workbook.test.ts`, in Chromium, at densities 1 and 2:
    - the start and the end of each text are where the layout puts them, in the three fonts of the image, under an ancestor's hostile styles and `dir=rtl`;
    - the boxes lie over the ink at any width and scrolling;
    - the eraser does not take the template;
    - the frame, on a screenshot;
    - the list, the order and the names, in the DOM and in Chromium's own tree, through `cdp()` by the `frameId` of the test's iframe;
    - `:lang()`, `scrollIntoView` under any writing mode of the page, the switch between canvas kinds, the theme and `exportWork()`;
  - forced colors, in `forced-colors.test.ts`.

— *Why:* the author's answer in the planning of T51, 2026-10-27, by the recommendation: fix the page's vertical writing in T51. The rest was decided by R34, R35 and the body of T51, accepted together with the plan of T47, and the probes in the planning of T51 closed its questions. The sources are in [architecture.md](architecture.md), section 4.
- **A frame on whole pixels.** With `crispEdges` each edge is the full ink color, 18.9:1 for `#111`, at densities 1, 1.25, 1.5 and 2, and its width is 1–2 device pixels. An antialiased frame at density 1 falls to 3.59:1, and with `#555` to 2.41:1, below 3:1 (WCAG 2.2, 1.4.11).
- **The reset** was checked under an ancestor's hostile styles in three fonts: the start of the first character and the end of the last are where the layout puts them, to 0.05 of a unit or closer. `all: initial` alone is not enough: it does not reset `direction`, and it resets `visibility` and `pointer-events` the wrong way (R35; T47).
- **Color through `color`** — this way an invalid value of the variable behaves for the printing as for the ink: CSS computes it as `unset`.
- **The numbers are read**, as in a numbered list of HTML: the tutor and `app` name an item by its number.
- **The refusal of `exportWork()`**: `null` would say that nothing is written, and a crop of all the strokes would send the scratch work (R35).
- **`:host`, not the printing:** vertical writing lays the whole scene on its side, and scrolling to an item scrolls nothing. `:host` overrides an inherited writing mode, but not the consumer's own.
- **The tree through the test's `cdp()`:** the Playwright provider gives a session of the page, and the tree of the test's iframe is taken by its `frameId`. The CDP tree has no `lang`, and `:lang()` checks the language.

— *Rejected:*
- **an antialiased frame** — for the reason above;
- **a theme variable of its own for the printing** — the printing goes in the ink's color, as the statement goes in the consumer's color;
- **the grid's color for the frame** — 1.4:1 on white (R34);
- **`aria-hidden` on the numbers** — an item without a number cannot be found by the tutor's words;
- **text on the drawing surface** — a screen reader does not read it;
- **HTML text in `foreignObject`** — the browser's layout lays it out, not R35;
- **a Vitest command of its own for the tree** — the test's `cdp()` already gives a session;
- **resetting the writing mode only on the printing** — vertical writing breaks the whole element.

— *Revisit:*
- the reset in WebKit, `-webkit-text-size-adjust`, the frame and the text in Safari, VoiceOver on iPad — T22: the image has no WebKit;
- a copy of the lines in HTML — if VoiceOver on iPad does not read the SVG (R34);
- exploring by touch — VoiceOver and TalkBack under the finger — by T22. Over the lines lies the drawing surface, which takes input (R23), and a finger may land on it rather than on an item. Only reading in order is checked: the tree and the roles;
- the lines' text growing with the page's zoom (1.4.4) — by the standard of T07 of `app` (R34; О-24).

— *Consequence:*
- amendments to R23, R27, R28, R32 and R35;
- **T48** — whether a box is filled, in its name and on the box itself, and in forced colors Highlight;
- **T49** — the workbook's work for checking, instead of the refusal, and marks on boxes.

— RUN.md, T51; [architecture.md](architecture.md), sections 2.7, 3.1, 3.2, 3.3, 3.7 and 4; `src/element/`, `demo/`.

— *Amendment 2026-10-27:* a filled box's frame is 3 CSS px, and in forced colors Highlight. A filled box's name is «Окошко, заполнено» (R37). — R37.

— *Amendment 2026-10-27:* `exportWork()` on a workbook no longer refuses with `NotSupportedError`: it gives the crops of the filled boxes or `null` (R38). — R38.

— *Amendment 2026-11-11 (T93):* the table of labels also has `sheetButtons`, `workbookButtons` and `exampleButtons`, the panel's names: «Кнопки листа», «Кнопки тетради» and «Кнопки примера». `sheet`, `workbook` and `example` now name the scrolling container (the T93 amendments to R28 and R33). — R28, R33.

— *Amendment 2026-11-11 (T94):* **the "Revisit" on 1.4.4 is decided by R73:** the printing grows with the sheet's zoom up to 200 %, and the font size on screen is `30 × k` CSS px, at 320 CSS px and 200 %, 19.2. — R73.

**R37. The box rule: a stroke belongs to a box if the middle of the frame of its points lies in the box widened by 120 thousandths of its size, and the frame itself is no wider and no taller than 1600 thousandths of the box. Otherwise the stroke is scratch work. Of two boxes the rule takes the one with more of the stroke's points, then the earlier by (item, box). Which boxes are filled, the property `filled` says. A filled box's frame is 3 CSS px, and its name says «заполнено».**
- **The rule** is `cellOf` in `src/core/boxes.ts`, in integers:
  - the points are in tenths of a unit, `round(10 × v)`, half up, as for groups (R24). The box is in tenths: L, T, W and H;
  - x0, x1, y0 and y1 are the least and the greatest coordinates of the stroke's points;
  - the size: 1000 × (x1 − x0) ≤ 1600 × W and 1000 × (y1 − y0) ≤ 1600 × H;
  - the middle: 1000 × (x0 + x1) ≥ 2 × (1000 × L − 120 × W) and 1000 × (x0 + x1) ≤ 2 × (1000 × (L + W) + 120 × W), and the same vertically;
  - of the boxes where both the size and the middle hold, the one with more of the stroke's points in the widened box, and on a tie the earlier in the task's order: by item, then by box, from 1. None — scratch work;
  - all the integers are below 2^31;
  - a stroke without points is a `TypeError`, and a point outside the page a `RangeError`, as for the crop. The rule and the crop take the stroke's frame in tenths from one function, `extentOf` in `src/core/geometry.ts`.

  With a box of 100 the margin is 12 units, and the limit 160: the box and 30 on each side. Boxes stand 32 apart (R35), so the widened ones do not overlap, and a workbook's page has no disputed case. It is needed for rectangles that others will give.
- **The module** gives:
  - `cellsOf(page)` — the boxes in the task's order;
  - `cellOf`, and with it `tableOf` — the table "box → stroke IDs", for T49 — and `filledOf`.

  The `core` entry point does not give the rule, and `entry.check.ts` holds that.
- **Test vectors** — [vectors/boxes.json](https://github.com/altnovatrail/canvas/blob/602945b/vectors/boxes.json), 20 cases:
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
  - the stroke under the pen is not in it, and a stroke under the eraser before lift-off is, as for `exportWork()`.
- **Look and name:**
  - a filled box's frame is 3 CSS px of the same ink color, on whole device pixels, and in forced colors Highlight. An empty one's frame is 1 CSS px;
  - a filled one's name is «Окошко, заполнено», «Окошко 1, заполнено» / "Box, filled". An empty one's name is «Окошко». The label `filled` is in the table of R28.
- **The trial page** shows in the counter's row how many boxes are filled.

— *Why:*

The author's answers in the planning of T48, 2026-10-27:
- as one task — not by the recommendation. The executor advised splitting it into the rule and `filled`, T52;
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
  - the top bar of a scratch digit 10 below a box. The rule takes a stroke alone, without its sign (R34).

  There are 113 "any" strokes, and the rule takes 112 of them into boxes, a circle around a box among them.
- **The middle of the frame, not the share of points.** A stroke's frame changes with density by less than the step of the points, and the share of points changes a lot (R26). A runner that takes a sample's points by the stroke's length will get the same verdict, unless the stroke stands at the very edge.
- **The margin 120** is the middle of the window 100–140 where nothing is lost. At 100 one dot changes its verdict with density, and 12 is less than 16, half the gap between boxes.
- **The limit 1600, not 1400.** On the set they are equal, but 1400 is exactly the length of the set's longest bar. 160 is the box and 30 on each side, and 32 further on is already the next box.
- **Split signs.** The rule takes a stroke alone (R34), and a sign at the edge could come apart: one bar into the box, the other into scratch work. The accepted rule has none such on the set, and at a margin of 80 and less there are some.
- **The 3 px frame.** It is seen not only by color but by its width. The contrast is that of ink on paper, 18.9:1 for `#111`. It is on whole pixels, like the frame of R36, and does not look like a verdict.
- **«Заполнено» only on a filled one.** «Пусто» on each line of a new page is noise, and without «заполнено» a box is empty.
- **The set's fraction** is 74 high, not 86 (the amendment to R35).

— *Rejected:*
- **the share of points, as for snapping (R26),** — by the table: at any margin it loses a bar with points at the corners or takes scratch work, and the verdict depends on density;
- **the frame of the points wholly in the box** — it loses a bar wider than the box and a sign at the edge;
- **a margin wider than 160** — the widened boxes overlap, and scratch work goes into a box;
- **«пусто» in an empty box's name**, **a 2 px frame with a tint** and **a mark in the corner** — the author's answers;
- **splitting the task into T48 and T52** — the author's answer.

— *Revisit:*
- the margin and the limit — by T22, by T78–T80 of `tutor` and by children's samples: the set is synthetic. Before the first release — by an amendment, with new vectors;
- if a fraction written with a finger does not fit into a box — together with the numbers of R35.

— *Consequence:*
- **T49** takes `tableOf` for the context `{ boxes, digest }` and for the boxes' crops, and "no box is filled" is an empty table;
- amendments to R27, R28, R34, R35 and R36;
- **В47** — the rule and `vectors/boxes.json` are already there.

— RUN.md, T48; [architecture.md](architecture.md), sections 2.7, 3.1, 3.2, 3.3 and 3.7; `src/core/boxes.ts`, `src/core/workbooks.fixture.ts`, `src/element/`, `vectors/boxes.json`.

— *Amendment 2026-10-27:* the "Consequence" on T49 is done: `cellsForCheck` takes `tableOf` for the crops and the context, and "no box is filled" is an empty table and `null` (R38). — R38.

— *Amendment 2026-11-01:* on a sheet `filled` for a slot `anywhere` or `sheet` is `[[has a stroke]]` by the same rule "the stroke that `exportWork()` would take", and a sheet with only `choice`, a sheet without a task and an example are `null`. The type and the time of change are as before. T57 builds it. — R42.

— *Amendment 2026-11-08:* the box rule is now the eval protocol, as written here (R94 spec; В47), and a test checks the code against `vectors/eval/v1/boxes.json` of the package `@altnovatrail/contracts`: `vectors/boxes.json` is removed. The link to it in "Test vectors" above now leads to the commit 602945b, where it still was. The rule changes only in `spec`. — R47.

**R38. A workbook's work for checking is a crop of each filled box by its strokes, with the numbers of the item and the box, and the context `{ boxes, digest }`: the table "box → stroke IDs" and the digest of its strokes, of all the page's boxes and of the table's rows. If no box is filled, `null`. The work's kind is named by its key — `png` for a sheet, `cells` for a workbook —, and only the crops with their places leave the device. Marks on boxes are T53.**
- **The work** is `cellsForCheck` in `src/core/submission.ts`, beside the sheet's `workForCheck`:
  - the table is `tableOf` by the box rule (R37), on the same strokes as `filled`: the stroke under the pen is not there, and strokes under the eraser before lift-off are;
  - `cells` is the `{ item, slot, png }` of each filled box, in the task's order. The PNG is a crop of R25 by the strokes of one box, as one group, at the manifest's digit height at the moment of the call. The scratch work goes nowhere;
  - `submission` is `{ boxes, digest }`, where `boxes` are the table's rows `{ item, slot, ids }`, the IDs ascending;
  - not one filled box — `null`, even with scratch work;
  - the crops are frozen on the outside — the bytes of a PNG cannot be frozen —, and the context deeply.
- **The digest** is `workbookDigestOf` in `src/core/marks.ts`: the same CRC-32 and Adler-32 as the sheet's (R27), of the text in UTF-8. The lines of the text:
  - the table's strokes by ascending ID — as for the sheet: the ID and the points in tenths of a unit and whole milliseconds;
  - `cell item slot left top width height` — for each box of the page, in the task's order, in whole units of the page;
  - `box item slot ID,…` — for each row of the table.

  It holds no numbers of the crop, and no digit height either. The text of the sheet's digest did not change: a pinned literal of a test still holds it.
- **Types:**
  - in the DOM-free part, `SheetSubmission`, the former `Submission`, and `WorkbookSubmission`, and `Submission` is their union. Also the table's row `Filling`. The `core` entry point gives these types, but not the rules;
  - in the element, `ExportedSheet { png, submission }` and `ExportedWorkbook { cells, submission }` with `ExportedCell { item, slot, png }`, and `ExportedWork` is their union. The work's kind is by its key: `"png" in work` or `"cells" in work`;
  - `Marks.submission` until T53 is `SheetSubmission`: marks cannot be given a workbook's context yet, and `interface.check.ts` holds that.
- **Leaving the device** are only the crops with their places, the item and the box. The table and the digest stay with `app`, like the sheet's context (R09 spec).
- **Size** — a measurement on T48's synthetic samples, `seeded()`, 540 boxes:
  - **a box's crop:** at D = 16, 32 and 48 each is the lower limit of R25, 200 × 200 px, that is 64 tokens;
  - **PNG at 32 px:** 0.6–1.9 KB, median 1.1 KB;
  - **at 256 px:** the largest is 726 × 664 px, 624 tokens.

  | Items, one box each | Crops | Tokens | PNG, median (min–max) | base64, median |
  |---|---|---|---|---|
  | 5 | 5 | 320 | 5.6 KB (4.1–6.9) | 7.5 KB |
  | 10 | 10 | 640 | 10.9 KB (9.1–14.2) | 14.5 KB |
  | 15 | 15 | 960 | 16.1 KB (14.0–20.5) | 21.4 KB |

  A crop of the whole sheet is no more than 1568 tokens (R25).
- **An empty box** gives no crop (R34):
  - in `spec` v0.2.39, T29 of its RUN.md decided: «пусто — «не прочитать» по причине `blank`» (read 2026-10-27). An empty box's value is `null`, it need not be read, and which boxes are empty, `filled` says;
  - the tag is newer than the pinned v0.2.37, so the number of its entry does not stand here. The move to a new tag will name it.
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

The author's answers in the planning of T49, 2026-10-27, by the recommendations:
- split the task into T49 — the work for checking — and T53 — marks on boxes. A reason beyond the length: В45 and В46 with the sizes go to `spec` without waiting for the marks;
- the frame of a mark on a box goes around the box and its ink together. T53 makes it.

The design was checked by an architect agent. Its corrections:
- the digest holds all the page's boxes;
- the crops are frozen only on the outside;
- the table is computed anew;
- the work is narrowed by a helper, not by a copy;
- for T53, the order "`task` and `history` before `marks`", one shared re-placing of the marks at a new history and a new layout, and a slot not from the table gets no frame.

More reasons:
- **A crop per box** — R34: the model need not look for what is in which box, and T79 of `tutor` reads the slots the same way.
- **A digest over all the boxes.** R34 says: "A context given at another layout is a `TypeError`". If the digest held only the filled boxes, a context of another layout would pass whenever those boxes stayed in place: items added at the end, an empty box moved.
- **No numbers of the crop** — there is no snapping on a workbook, a mark comes with a slot (R34). So the digit height does not change the digest either.
- **The table anew, not from the cache of `filled`.** `cellOf` is a pure function, so `cells` and `filled` agree anyway. Pulling the element's cache into the DOM-free part is an interface for the sake of one call per «Проверить». A test holds the agreement.
- **`Submission` is a union,** like `Task = SheetTask | WorkbookTask`. A sheet-only type under the shared name would read as shared, and a union in the promise of `exportWork()` breaks the same places whatever the names.
- **Size.** 64 tokens per box at the usual heights is the lower limit of R25, "no less than 200 px", for which the crop is wider than its work. A page of 10 items, one box each, is 640 tokens, less than the limit of a crop of the whole sheet.

— *Rejected:*
- **a digest of only the filled boxes** — for the reason above;
- **`png: null` for empty boxes** — `filled` already says which are empty, and an empty record in `cells` would invite sending an empty box;
- **the table from the element's cache** and **a sheet-only `Submission`** — for the reasons above;
- **as one task** — the author's answer.

— *Revisit:*
- the form and the types — by the answer of `spec` to В45 and В46 and with the types of T35 in RUN.md of `spec`;
- how many crops per call and whether the item's text is needed — by T79 and T80 of `tutor`. T79 of `tutor` in its measurement sends empty slots too, asking "is it empty" (`tutor` at f55b3b8, read 2026-10-27). If the product needs it, empty boxes will go into `cells`;
- one crop — if `spec` chooses it in В45;
- the entry on the empty box — by its number, with the move to the tag `spec` v0.2.39 or newer.

— *Consequence:*
- **T53** — marks on boxes:
  - `Anchor.cell` by place;
  - the workbook's context in `marks`;
  - `task` and `history` before `marks`;
  - the frame around the box and its ink;
- **T50** — sections 1 and 3;
- **the workbook's sample (E5)** — the boxes' crops by the same `cellsForCheck` at the eval heights, the table and the boxes' rectangles (R34; [architecture.md](architecture.md), section 3.5);
- amendments to R25, R26, R27, R34, R36 and R37;
- **table 3 of RUN.md** — В45 and В46 made more precise.

— RUN.md, T49, T53; [architecture.md](architecture.md), sections 2.7, 3.2, 3.3, 3.5 and 3.7; `src/core/`, `src/element/`, `demo/`.

— *Amendment 2026-10-27:* the "Consequence" on T53 is done: marks on boxes, the order "`task` and `history` before `marks`" and the frame around the box and its ink are R39. — R39.

— *Amendment 2026-10-27:* the "Consequence" on T50 is done: the workbook is in [architecture.md](architecture.md), sections 1 and 3, and its whole design is section 3.8. The workbook's sample is not built yet: the epic E5 builds it, and what this means for T17 and its other tasks, the 2026-10-27 amendment to R34 says. — RUN.md, T50.

— *Amendment 2026-10-27:* "Revisit: the entry on the empty box — by its number, with the move to the tag" is done: it is R56 spec, at `spec` v0.2.42. — R40.

**R39. Marks on boxes: on a workbook a mark comes with an answer slot by place — `{ item, slot }`, from 1 — and holds to the strokes of its submission's table row, and its frame stands around the box and the visible ink of its strokes together. The context's kind is named by its keys, and `task` and `history` are given before `marks`. A new page places the marks anew or takes them off, without an event.**
- **The place** — `Anchor.cell` is now `{ item, slot }` (`CellPlace`), not an ID string, for both canvas kinds: slots have no ID (R51 spec). On a sheet a slot still gives no frame: a sheet takes no zones (R32).
- **The check is `marksOf`** in `src/core/marks.ts`:
  - the context's kind is by its keys: `crop` and `groups` for a sheet, `boxes` for a workbook. Both at once is a `TypeError`, and a key with the value `null` is the same as one left out: some storages write so;
  - the table's rows are checked like groups: a place (item, box) and a stroke ID once each, the IDs whole numbers from 1. The digest holds the order of the rows and of the IDs in them;
  - with a workbook's context a mark stands only on a slot: a group label and the model's frame are a `TypeError` at `marks.marks[n].at`.
- **The mark's place is `placesOf(marks, known, cells)`:**
  - `cells` are the boxes of the workbook's page in the task's order, and `null` on a sheet;
  - a context of another canvas kind is a `TypeError`, and it says that the task is given before the marks;
  - an ID of the table that the sheet did not know is a `TypeError`;
  - the digest is computed anew, over the known strokes, the erased ones too, and over the boxes of the current page (R38). A page of another layout is a `TypeError`;
  - a slot is the strokes of its row and the page's box. A slot not from the table — an empty box or a box that is not on the page — gets no frame, not a `TypeError`.
- **The frame** — by the author's answer: around the box and the visible ink of its strokes together, `shownOf` with the box. The margin is 10 units, the line 2 CSS px, it pales under a stroke, and in forced colors it is Highlight, as on a sheet (R26). When all its strokes are erased it is not seen, and undo brings it back. The next box stands 32 units away, and a frame with a margin of 10 does not touch it.
- **The order of assignment:** `task` and `history` before `marks`. Before a task the element has a sheet's template, and a workbook's context would be of another kind. At registration the element takes the properties in this order anyway.
- **A new page:**
  - there is one re-placing of the marks, `#replace()`, for the setters `history` and `task`;
  - for `task`, only when the layer changes: the same page writes nothing;
  - marks that did not take their place on the new page or in the new history are taken off: `marks` is `undefined`, without an event.
- **Types:** `CellPlace` is in both entry points, and `Marks.submission` is the union `Submission`, a sheet or a workbook (R38).
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

The frame is the author's answer in the planning of T49, 2026-10-27, by the recommendation:
- it does not cross the box's frame;
- it does not jump with the handwriting;
- it takes the ink that went past the edge;
- it does not touch the neighbor.

So it is in the prototype too — a circle around the box. The author asked, in one phrase, for the task to be done and brought to its merge into `main`.

The rest are the architect agent's corrections in the planning of T49 (R38):
- **A slot not from the table gets no frame.** A `TypeError` of one mark would break the whole assignment — R26 rejected it for a slot for the same reason. And an empty box gives no answer, and the frame has nothing to hold to.
- **`task` before `marks`.** A workbook's context is checked by the page's boxes, and before a task the element has a sheet's template. The history is before the marks anyway (R27).
- **Re-placing only at a new layer.** `app` gives the task at every redraw, and the same page does not change the marks.
- **Rows like groups.** A place and an ID once each. The digest checks the order, as for groups.

— *Rejected:*
- **a frame only around the ink**, as on a sheet, and **only around the box** — the author's answer;
- **a slot not from the table is a `TypeError`** and **re-placing at every task** — for the reasons above;
- **a slot as a string, as in R26,** — slots have no ID (R51 spec).

— *Revisit:*
- the place and the kind of a slot's field — with the contract of the epic E3 in RUN.md of `spec`. There too, the mark of an empty box: the verdict "unreadable" for the reason `blank` in the tag `spec` v0.2.39 may call for a frame around the box alone, without strokes;
- the color and the look of the frame — with the first slice of `app` and `api`, as in R26.

— *Consequence:*
- **T50** — sections 1 and 3;
- amendments to R26, R27, R34 and R38;
- **table 3 of RUN.md** — В46 made more precise.

— RUN.md, T53; [architecture.md](architecture.md), sections 2.7, 3.2, 3.3 and 3.7; `src/core/marks.ts`, `src/element/`, `demo/`.

— *Amendment 2026-10-27:* the "Consequence" on T50 is done: the workbook is in [architecture.md](architecture.md), sections 1 and 3, and its whole design is section 3.8. — RUN.md, T50.

— *Amendment 2026-11-08:* a mark of an empty box circles the box itself, without strokes, — however one writes in it later (the second 2026-11-03 amendment to R74 spec; R97 spec). The reason "an empty box gives no answer, and the frame has nothing to hold to" is withdrawn: the verdict "unreadable" for the reason `blank` calls for a frame around the box. Without a frame stay the mark of a box not from the page and a slot on a sheet. `placesOf` gives an empty box its rectangle without stroke IDs, and `shownOf` the rectangle itself. — R47.

## `spec` tag v0.2.42

**R40. `canvas` is on `spec` v0.2.42: the submodule `spec/` is at this tag. `spec` has not yet recorded the rows «в реестр spec» В42–В49, and they stay. The tag brings `canvas` new open fields of the task, the exit condition "something in each slot" and the demo of a lesson's worked example — that is the epic E7, and until it the temporary types and the copies of the format examples in the tests stay at v0.2.37.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.37 v0.2.42`, read 2026-10-27). The tags v0.2.39–v0.2.42 recorded the format of the epic E2 of `spec`: slot checks, traps, techniques and solving steps, lessons and the generator (R56–R59 spec). v0.2.38 is the OpenSSF Best Practices badge of `spec` itself:
  - **the slot check** — each answer slot has its own, `check`, closed whole (R56 spec). It does not go into the open view, and the element does not get it. An empty slot is "unreadable" for the reason `blank`. This is the answer to the "Revisit" of R34 and R38 on the empty box: it needs no crop, `filled` names the empty boxes;
  - **"givens" and "unknown"** — the open fields of the task `givens` and `unknown` (R57 spec). The element's strict check rejects them for now (R32): a task with them is a `TypeError` "task.givens: no field of a task's open view". The rest of the task's open view is as before: the parts of the statement, the canvas, the items and the slots. The new fields `check`, `simpler_case`, `techniques`, `traps`, `solution` and `leak_phrases` are closed;
  - **the step's exit condition** `answer_slots_filled` — each answer slot has something in it: a stroke in its zone or box, a chosen option, and for `anywhere` and `sheet` a stroke on the sheet (the README of the format, §18; R57 spec). What it is for `anywhere` and `sheet`, the card of `app` leaves to `app` and `canvas` to decide (architecture 3.1 spec). On a workbook it is `filled` (R37), and on a sheet `filled` is `null`;
  - **the example's demo** — a lesson carries worked examples, and the demo layer shows the example's parts one at a time and images on sheet areas at their size. The whole demo can be hidden, and the learner does not write on an example's sheet (R58 spec; concepts 8 spec). The element will take the lesson's open view with temporary types of its own (architecture 3.2 spec);
  - **the manifest** — a new open field `rung_templates`. The element reads three fields of the manifest and skips the others (R32), so it takes the tag's manifest;
  - **the randomness generator** (R59 spec) the element does not need now: the numbers of a templated task come in its open view. A widget's seed is its own, not the attempt's seed, and how the widget gets it, the widget protocol decides (architecture 3.4 spec). The app's side of the protocol is the widget host of `canvas`, from stage 4.
- **RULES.md, the devcontainer, the template and the documents check** did not change between the tags: `git -C spec diff --stat v0.2.37 v0.2.42 -- RULES.md .devcontainer repo-template` is empty, and in `tools/` only the format check `format-check` and the test `new-repo` changed. The recipe `licenses-check-repo` is as before.
- **The rows of table 3:** `spec` recorded none of В42–В49 — not in the log, not in RUN.md, not in the card. В45 now names R56 spec, and В50 is closed by the author's answer of 2026-10-27: the next epic is E7.
- **What the move does not do** — as in T43:
  - the temporary task type and its check stay as before, and the copies of the format examples in the tests stay copies of v0.2.37 (Д5). The new fields, the exit condition and the example's demo are the epic E7;
  - the `core` entry point and the vectors — as they were.
- **What is changed here:**
  - `spec/` is at v0.2.42, commit 69b5b3c; the tag is in README.md, CLAUDE.md and at the top of RUN.md;
  - RUN.md: E6 is in the archive [plan/E6.md](plan/E6.md), and this task, T54, is there too. Table 1 has no rows, E7 in table 2 names the entries of `spec`, В45 names R56 spec, В50 is closed, and Д4–Д6 are checked;
  - [architecture.md](architecture.md): the status and sections 1, 3.3 and 3.8 name R56 spec and the task's new fields, and a new subsection 2.8 what the tag left `canvas` to decide;
  - amendments to R32, R34 and R38.

— *Why now:* the author's instruction of 2026-10-27 — move to the new `spec` in one branch with the archive of E6 and a review of tables 3 and 4. What the move holds is the author's answer, by the recommendation: the submodule and the documents, and the task's new fields are E7. v0.2.42 is the latest release of `spec` on 2026-10-27 (`gh release list -R altnovatrail/spec`), and `gh release verify v0.2.42 -R altnovatrail/spec` confirmed it by its attestation.

— *Rejected:*
- **the move together with the fields `givens` and `unknown`** — that is code, tests and a code review, more than one check. Their place is E7, together with the exit condition and the example's demo, which are decided by one agreement with `app`;
- **v0.2.41** — v0.2.42 came out before the move began.

— *Revisit:* which copies of the format examples move to the new tag — in the planning of E7.

— *Consequence:*
- **E7** in table 2 of RUN.md names R56–R58 spec, and its first tasks take the task's fields and the exit condition;
- amendments to R32, R34 and R38;
- **В45** names R56 spec, **В50** is closed;
- **Д5** — the copies at v0.2.37, the new fields are E7.

— RUN.md, T54, tables 1–4; [plan/E6.md](plan/E6.md); [architecture.md](architecture.md), sections 1, 2, 2.8, 3.3 and 3.8; README.md; CLAUDE.md.

— *Amendment 2026-10-27:* E7 is taken — the author's answer to В50 — and planned: the tasks T55–T62 in table 1 of RUN.md. "Revisit: which copies of the format examples move to the new tag" was decided in the planning: the copies of the task, of the manifest and of the vectors of the open view are T55, and the copies of the lessons T58. — RUN.md, E7.

— *Amendment 2026-11-01:* T55 took the task's fields, and the copies of the format examples in the tests are at v0.4.1 (the amendment to R32). "Д5 — the copies at v0.2.37" from the "Consequence" is out of date: `canvas` moved to v0.4.1, and its task and manifest types are now those of `spec` (R41). — R41.

— *Amendment 2026-11-01:* [architecture.md](architecture.md), subsection 2.8, is decided — R42: `filled` on a sheet, the property `workedExample` and the example mode, the demo's buttons with `demoState` and `demochange`, the parts above the sheet and their accessibility. The rows «в реестр spec» are В52–В54. — R42.

## `spec` tag v0.4.1

**R41. `canvas` is on `spec` v0.4.1: the submodule `spec/` is at this tag, and the types of the task and the manifest come from the npm package `@altnovatrail/spec` of the same version, in `dependencies`. `spec` has recorded the rows «в реестр spec» В42–В49, and table 3 of RUN.md names its entries in their place. The element's own task types are only narrowed ones, for the check, and outward it gives the types of `spec` and the temporary field `canvas.tools`.**
- **What the tag brings `canvas`** (`git -C spec diff v0.2.42 v0.4.1`, read 2026-11-01). Between the tags are v0.2.43–v0.2.46, the line 0.3 (v0.3.0–v0.3.4) and the line 0.4 (v0.4.0, v0.4.1), and in the log R60–R73 spec:
  - **the answers to В42–В49** were recorded 2026-10-27, all by the recommendations of `canvas`. What went where, Д41 in RUN.md of `spec` names:
    - В42 and В46 — the 2026-10-27 amendment to R36 spec;
    - В43 — architecture 3.1 and 3.2 spec and the README of the format, §14;
    - В44 — an addition to О-24;
    - В45 — the 2026-10-27 amendment to R53 spec and the epic E3 in RUN.md of `spec`;
    - В47 — the eval protocol of the same epic;
    - В48 — architecture 3.2, concepts 8 and 15 spec and the README of the format, §11;
    - В49 — «Вход» of T38 in RUN.md of `spec`: its planning will decide the rule.

    The part of В42 on how `app` gets the manifest was decided by T34 there. `api` gives the manifest's open view by the package digest of the attempt, once per package, and `app` caches it and gives it to the element through the property `manifest` (the 2026-10-28 amendment to R36 spec; R62 spec). The element is ready for this: it reads the same object again (R32);
  - **the format is version 0.1, not a draft.** It came out with v0.3.0, and code takes the format from the signed release file `format-0.1.tar.gz`, not from the submodule (R64 spec; the README of the format, §2 and §3). Any change to the format is now version 0.2 in a new line of `spec`. `module_format_version` is still `"0.1"`, and the manifest's check (R32) takes it;
  - **TypeScript types** — the npm package `@altnovatrail/spec`: declarations only, flat, like the Go types, with `exports` `./formatv0` and `./formatv0/open`, under Apache-2.0. A release of `spec` from the line 0.4 carries it as the file `altnovatrail-spec-<version>.tgz`, with a signature and an attestation. `canvas` takes it in `dependencies` at an exact version, the same as the submodule's tag, moves them together and excludes the package from Dependabot's `npm` (R73 spec; Д46 and Д49 in RUN.md of `spec`). The types of the element itself — events, `exportWork()`, `filled`, marks — `spec` has not released yet: that is T46 in its RUN.md;
  - **task templates** — the closed field `template` (R60 spec). `app` and the element get the open view of an instance: numbers in place of the placeholders, without `template`. The instances of one template share one ID (Д42 there), and the element keeps nothing by a task's ID: it compares the author's template by content (`sameTemplate`). Only `module-kit` runs the templates' solvers (R61 spec);
  - **the size of the statement's image** is an integer no greater than 2^53 − 1 (`common.schema.json`). The element's check already knew this: `whole` takes no integers beyond `Number.MAX_SAFE_INTEGER` (R32);
  - **the module package and the index** (R62 spec, R63 spec) — for the epic E5. The samples page's build takes the open views and the media from the packages of a release of `modules` through the CLI of `module-kit`. Before the build CI reads the withdrawal marks in the index of the newest release of `modules` and does not build a withdrawn version of a module, and a child sample session is run by the build of the latest release of `canvas`. So Т-30 is closed (the 2026-10-28 amendments to R25 spec; Д44 and Д45 in RUN.md of `spec`);
  - **the digit height without a manifest is 24 px with the format 0.2** (the 2026-10-28 amendment to R51 spec; Д47 in RUN.md of `spec`). There is no format 0.2 yet: T48 there will give it, in the line 0.5. Until then the element without a manifest draws a digit at 32 px;
  - **concepts 15 spec** — the term «шаблон задачи», task template: «не шаблон ступени и не шаблон автора на канве». In the documents of `canvas` "template" is the author's template and its layer (R23), and the type `Template` in the code is it too;
  - the decisions of `tutor` R65–R71 spec — on the reading of work and on hints — do not touch `canvas`. Who will run the reading model on the device, `app` or `canvas`, R66 spec leaves for later;
  - the rest — the release files, the Go module and the checks of `spec` — does not concern `canvas`.
- **RULES.md** did not change between the tags. **The template** — one change, in CLAUDE.md: "The container is spec's: Node.js, Go and just". **The devcontainer** — Go 1.27.3 in the stage `toolchain`, with sums per architecture and `GOTOOLCHAIN=local` (R64 spec). Go comes with the Dockerfile into the copy of any repository (repositories 2.2 spec), so the move carries it over by hand, though the code of `canvas` takes no Go. The sums were checked against the list of go.dev 2026-11-01. The recipes `docs-check-repo` and `licenses-check-repo` in the `justfile` of `spec` are as before, and `_tools` now installs TypeScript 7.0.2 too.
- **What is changed here** — in one branch with T55, at the author's instruction:
  - `spec/` is at v0.4.1, commit 23000f3. `gh release verify v0.4.1 -R altnovatrail/spec` — "Release v0.4.1 verified!", and the release is the latest;
  - **the package of types** — `@altnovatrail/spec` 0.4.1 in `dependencies`:
    - the archive from npm is the same as the release file: the sha256 `5ea7321e…` matches;
    - `gh release verify-asset v0.4.1 altnovatrail-spec-0.4.1.tgz -R altnovatrail/spec` — "Verification succeeded!";
    - `integrity` in the lock file is the sha512 of this archive;
    - in `.github/dependabot.yml` the package is excluded from the updates of `npm`;
  - **types** (Д5; Д49 in RUN.md of `spec`):
    - `Task`, which the element takes through the property `task`, is the type `Task` from `@altnovatrail/spec/formatv0/open`, and its canvas is `Canvas` from there too with a temporary `tools` (R28). `Manifest` is the type of `spec` whole. `app`'s task and manifest of these types go into the element as they are;
    - the narrowed types `SheetTask`, `WorkbookTask` and their parts stay our own: the check `taskOf` gives them, and the rest of the element reads by them. The types of `spec` are flat, and only the check tells the canvas kinds apart. The entry points no longer give them: outward go `Task`, `Canvas` and `Manifest`;
    - `src/core/task.check.ts` holds that a checked task is a task by the type of `spec`. If `spec` changes the form and the check does not, the type error will be here, not at the seam of `app` and the element;
    - the line of `interface.check.ts` "an item line on a sheet is a type error" went: flat types do not catch it, and only the check refuses (R32);
    - the trial consumer gives a task and a manifest of the types of `spec`, like `app`;
  - Go in `.devcontainer/Dockerfile`, Go in CLAUDE.md; the tag is in README.md, CLAUDE.md and at the top of RUN.md;
  - RUN.md: table 3 — В42–В49 closed, В51 opened; table 4 — Д4–Д6 checked, Д5 narrowed; the body of T58 — the lesson's types from the package, and for E7 — «Нужно» and the risks;
  - [architecture.md](architecture.md): the status and sections 1, 2.8, 3.1, 3.3, 3.4, 3.7 and 4;
  - amendments to R12, R32 and R40.

  The entries of the history name the rows as they were.

— *Why now:* the author's instruction of 2026-11-01 — «выполни задачу T55 и в том же бранче перейди на spec новой версии». v0.4.1 is the latest release of `spec` on 2026-11-01 (`gh release list -R altnovatrail/spec`). The types are in the move, not in a separate task: the author's answer, not by the recommendation. Д49 in RUN.md of `spec` indeed names, for `canvas`, «своей задачей перехода на тег линии 0.4».

— *Rejected:*
- **the types as a separate task after the move** — the executor's recommendation: the decisions on the narrowed types would go through plan mode. The author took the types into the move;
- **flat types inside the element too**: each place where the element reads an item of a sheet or a line of a workbook would narrow the type itself, by a field — `slot.zone !== undefined` —, though the check has already told the kind;
- **narrowed types in the entry points further on**: a consumer would take the task types of `canvas` instead of the types of `spec`, and the seam with `app` would again rest on copies (Д49 in RUN.md of `spec`);
- **`peerDependencies`** — rejected by R73 spec;
- **not carrying Go over**: the changes of the container of `spec` come here by hand (CLAUDE.md, Environment), and repositories 2.2 spec carries Go into the copy of any repository;
- **v0.4.0** — its version in npm has no provenance, and v0.4.1 came out before the move.

— *Revisit:*
- with T46 in RUN.md of `spec` — the element's types and its vectors;
- with the format 0.2 (T48 there) — the version the manifest's check takes, and the digit height without a manifest, 24 px;
- with a minor version of the format with a field of tools — `canvas.tools` (the 2026-10-26 amendment to R51 spec);
- the copies of the format examples in the tests — by reading the release file `format-0.1.tar.gz` (R64 spec), if the copies become dearer.

— *Consequence:*
- **T55** — the copies of the examples at v0.4.1 (the amendment to R32);
- **T58** — the types of the lesson, the segment, the worked example and the demo's part from the package of `spec`, and our own only narrowed ones, for the check;
- **E5** — the samples page's build from the packages of `modules` and without withdrawn versions (R62 spec, R63 spec);
- **Д5** is narrowed: our own are only the check's narrowed types, `canvas.tools` and the copies of the examples. **В51** — «в реестр spec»: the card architecture 3.2 spec still says that `canvas` has temporary types of its own;
- amendments to R12, R32 and R40.

— RUN.md, T55, T63, tables 1, 3 and 4; [architecture.md](architecture.md), the status, sections 1, 2.8, 3.1, 3.3, 3.4, 3.7 and 4; README.md; CLAUDE.md; `.devcontainer/Dockerfile`; `.github/dependabot.yml`; `package.json`; `src/core/`, `src/element/`.

— *Amendment 2026-11-02:* the archive of the package of `spec` from npm is checked not by `gh release verify-asset` but by the recipe of `spec` `release-verify-npm` on the lock file — and not once at the move but in CI, in the step `ci-licenses` (the 2026-11-01 amendment to R73 spec; R77 spec). The link of the package's version to the submodule's tag is still held by the move: the recipe checks the archive against the release of its own version. The package is now 0.6.2, and the "Revisit" on T46 and the format 0.2 is carried out by T69 and T68. — R44.

## E7. The new `spec`: the task's fields and the example's demo

**R42. On a sheet `filled` for a slot `anywhere` or `sheet` is `[[has a stroke]]`, otherwise `null`. The element takes a worked example through the property `workedExample`, and then it is not a task: the learner does not write, and the demo's parts are opened by the element's buttons. For `app` there are the property `demoState` and the event `demochange`. The demo's paragraphs and images stand above the sheet, under the statement, and a polite region `status` announces the opened part.**
- **`filled` on a sheet:**
  - for a slot `anywhere` or `sheet`, `[[true]]` if the sheet has a stroke that `exportWork()` would take, otherwise `[[false]]`. "Has a stroke" is the same as «Очистить» being enabled (R28): the stroke under the pen does not count yet, and a stroke under the eraser before lift-off still counts, as on a workbook (R37);
  - a sheet with only `choice` slots, a sheet without a task and an example are `null`: the element has nothing to say, and only `app` sees the choice of an option. The format gives no mixed task: a slot `anywhere` or `sheet` is the only one in its task (the README of the format, §14), and the element rejects a slot in a zone (R32). So the type is as before — `readonly (readonly boolean[])[] | null`;
  - the time of change is as on a workbook: an action changes `filled` before `historychange`, and an assignment of `task` and `history` changes it without an event. The value is the same frozen array until it changes;
  - `app` reads the exit condition `answer_slots_filled` by the slot binding: for `choice`, its own choice of an option, for other slots, `filled[item − 1][slot − 1]`.
- **The example is the property `workedExample`:** the open view of the segment `worked_example`, the type `WorkedExample` of the package of `spec` (R41) — the statement, the canvas and the demo's parts. The element checks it like a task (R32).
  - The element shows a task or an example, not both. A `TypeError` is an example when `task` is set, the history is not empty or a stroke or an eraser press is under way, and a task when an example is set; `undefined` removes either. One lesson segment is a new element (R20): `app` gives each segment its own;
  - an equal example — by content, as `sameTemplate` — changes nothing, and another one replaces everything and returns the demo to its start, without an event;
  - **example mode:**
    - `task` is `undefined`; `history` is empty, a non-empty one is a `TypeError`, and there is no `historychange`;
    - `marks`: assigning marks is a `TypeError`, there is nothing to mark, and `undefined` may be assigned, and they read as `undefined`. `exportWork()` gives `null`, and `filled` is `null`;
    - `tool` is `"pen"`, only it may be assigned, and there is no `toolchange`. `undo()` and `clear()` do nothing;
    - `manifest` is checked as always, and gives the language of the statement and of the parts. `media` gives all the example's images;
    - the drawing surface takes no input, so the example's sheet neither turns pen mode on nor off (R29). One finger and the pen scroll the sheet by the browser's scrolling, and «Выше» and «Ниже» stay (R33). How exactly the sheet takes no input is T59;
    - the row of buttons is named by the segment's kind — «Пример», "Worked example", — as a workbook names its own (R34). In it, in order, are «Дальше», «Показ», «Выше» and «Ниже», and there is no «Пера», «Ластика», «Отменить», «Очистить» or «Рисовать пальцем». The Tab stop is on the first visible button, «Дальше».
- **The demo's parts are opened by the element:**
  - in the row, «Дальше», which opens the next part, and the disclosure button «Показ», `aria-expanded`, which hides and shows the whole demo (APG, Disclosure);
  - **`demoState`** is a frozen `{ opened, hidden }`. `opened` is how many parts are open, from the first, from 0 to all, and `hidden` whether the whole demo is hidden. At first it is `{ opened: 0, hidden: false }`: the learner opens each part themself. Parts do not close one at a time;
  - `demoState` is assigned after `workedExample`, as `marks` after `task` and `history` (R26). Before an example the property is `undefined`: assigning a state is a `TypeError`, and `undefined` may be assigned, and it changes nothing. A state is an object with only `opened`, an integer from 0 to the number of parts, and `hidden`, `true` or `false`; anything else is a `TypeError` with the field's path. A new or another example returns the state to its start;
  - **`demochange`** is a `CustomEvent` with the same `detail`, it bubbles and is `composed`, only when the learner changed the state with a button. Assigning `demoState` gives no event and announces nothing, as with `tool` and `toolchange` (R27, R28). `app` keeps the state and returns it, and it may also lead the parts itself;
  - «Дальше» is `aria-disabled` while the demo is hidden or all the parts are open, and it keeps focus, as «Выше» and «Ниже» do at the edge (R33).
- **Paragraphs and images beside the sheet** — above the sheet, under the statement: a numbered list of the open parts in the same column and scrolling as the statement (R23). An image beside the sheet is as in the statement: a frame of its own size with the description, until the file has come. An image on a sheet area stands on the demo layer, at the area's size (the README of the format, §21), and in the list there is its item with the description. An opened part is scrolled into view at once, without animation, and there is one target: for an image on an area, its sheet area, for the other parts, their list item. The layout keeps a sheet scrolled into view in place when the list above it grows.
- **Accessibility:**
  - the reading order is the row of buttons, the statement, the list of parts. Unopened parts are not in the DOM, and a hidden demo is the attribute `hidden` on the list: the opened parts and their images stay;
  - a screen reader finds an image on an area by its description in the list item, and the demo layer stays `aria-hidden`, as the marks layer names its frames in words (R26);
  - an opened part is announced by a polite region `role="status"`, empty in the shadow root from the very start: the part's text or the image's description, and for a decorative image only the part's number. Focus stays on «Дальше», so the learner opens the next part with the same press. The part's number is in the element's language, the part itself in the manifest's language, with separate `lang` attributes. «Дальше» points to the region by `aria-controls`, and «Показ» to the list: both control what they do not contain (WAI-ARIA 1.2, `status` and `aria-expanded`);
  - the buttons are by R28: a target of 44 × 44 CSS px, `aria-disabled` does not take focus away, system colors in forced colors mode. The accessibility level still waits for О-24 and the standard of T07 of `app`, and T22 will check VoiceOver and the region inside the shadow root.

— *Why:* the author's answers in planning T56, 2026-11-01, all as recommended:
- `filled` on a sheet is `[[has a stroke]]`: the exit condition asks the element (architecture 3.2 spec), and `app` reads one type for both canvas kinds with one piece of code. A stroke counts if `exportWork()` would take it — the same rule as for a workbook's box (R37);
- the element opens the parts, and `app` knows and sets the state: the format lets the learner open and hide (the format's README, §21), `app` has no player yet, and the example needs trying now — on the demo page and in the test consumer. A property and an event are the same contract as `tool` and `toolchange`;
- above the sheet: that is where the statement stands (R23), and there is one column at any width. The sheet shifts when a part opens, but nobody writes on an example's sheet;
- as one task (rule 11), though it is about 60–80 minutes of reading: the contract with `app` is one for both questions.

The rest is the plan's proposal, which the architect agent checked. The sources are [architecture.md](architecture.md), section 4, "Filled answer slots and the worked example".

— *Rejected:*
- **`filled` per slot, with `null` for a `choice`**: the type would change for a form the format does not allow;
- **`false` for a `choice`**: it says "empty" of what the element does not see;
- **`app` folds the `replay` history itself**: it would not be the element that the condition asked, and `app` would repeat the eraser's rule up to the lift;
- **the example through `task`**: the types and the errors of the check would mix, and `app` would sort out what came;
- **an element of its own for the example**: a second tag and a second copy of the row of buttons;
- **the name `example`**: in `spec`, "examples" are the format's example files. The name `workedExample` is the format's, like `task` and `manifest` (R32);
- **the names `demo` and `hidden`**: `demo` is already the example's parts, `workedExample.demo`, and the folder of the demo page, and `hidden` is an HTML attribute, which would hide the whole element;
- **an event on an assignment of `demoState`** — as with `tool` (R28): `app` would hear its own action;
- **closing the parts one at a time** — the format only lets them be opened one at a time and the whole demo be hidden;
- **a «Дальше» that shows a hidden demo and opens a part**: two changes by one press, and the learner's choice to hide the demo is undone;
- **the parts beside the sheet on a wide screen and above it on a narrow one**: two layouts, the element wider than 1000 CSS px, and on a narrow tablet above the sheet all the same;
- **focus on the opened part**: it breaks repeated presses of «Дальше» and leads out of the row of buttons;
- **`aria-live="assertive"`**: a part of the demo does not call for interrupting the learner (WAI-ARIA 1.2, the role `status`).

— *Revisit:*
- the demo's own buttons, to be made ones that can be switched off, if `app`'s lesson player wants one «Дальше» button for parts and segments alike;
- `filled` for a slot in a zone — with the epic of zones (R32);
- a learner's writing on an example's sheet and a demo above a lesson's task — with the format's minor versions (R58 spec);
- the buttons and the announcement — with the standard of T07 `app` (О-24).

— *Consequence:*
- **T57** — `filled` on a sheet by this decision;
- **T58** — the check of the example and its parts;
- **T59** — the property `workedExample`, the example's mode and the row without tools;
- **T60** — the list of parts, the buttons, `demoState` and `demochange`, the `status` region;
- **T61** — the pictures on the sheet's areas and their descriptions in the list;
- **T22** in E5 — VoiceOver on the `status` region in a shadow root, and the scrolling of an example's sheet on a tablet;
- **В52–В54** — rows «в реестр spec» in table 3 of RUN.md;
- amendments to R28, R37 and R40.

— RUN.md, T56–T61, table 3; [architecture.md](architecture.md), the status, sections 2, 2.8 and 4.

— *Amendment 2026-11-01:* T58 built the example's type and its check. The example is the type `WorkedExample` of the `spec` package, and canvas's own narrowed types are `CheckedExample`, its canvas `ExampleCanvas` and its parts `ExamplePart`: a paragraph, a picture beside the sheet and a picture on an area, `AreaPicture` (`src/core/example.ts`). The check `exampleOf` names a field by its path from `workedExample`. The canvas is only a sheet with a grid, and `tools` and a workbook are a `TypeError`; a picture on an area has no size of its own, and the area lies on the sheet by the rule of `lesson.areas`. The equality `sameExample` is by content, with the default grid. The entry points give the type `WorkedExample`, but not the check. — RUN.md, T58.

— *Amendment 2026-11-01:* T59 built the property `workedExample` and the example's mode. The author's answers in planning T59, both as recommended:
- **the sheet takes no input**, this way: the drawing surface has `pointer-events: none` and `touch-action: auto` — by a CSS rule on the sheet's class, not by the element's style, so that without the class the drawing surface inherits the consumer's `none` again (R20). A press reaches the scene: a finger and a pen scroll the container or the page by native scrolling, and a pinch zooms, as over the statement (R23). An example's sheet neither turns pen mode on nor off (R29). The ban on the context menu and on selection moved from the drawing surface to the scene, and at the start of the press handler stands a guard for events that a script sends straight to the drawing surface. Rejected: `touch-action: pan-y` on the drawing surface — the events would come, each handler would filter them out itself, and a pinch over the sheet would not zoom;
- **the row «Пример»** is built by the same row of buttons: it knows its kind — sheet, workbook or example — and hides the writing buttons by the attribute `hidden`. When the visibility changes, the Tab stop and the focus move off a hidden button to the first visible one. Before T60 that is «Выше», and from T60 on, «Дальше». Rejected: a row of the example's own — a second copy of the keyboard, the labels and the theme.

Also decided in execution:
- the element checks its state before the value: an example with a task set, a non-empty history or a stroke in progress is a `TypeError` before the check of its shape. Each property removes only its own, and `task = undefined` with an example does not remove the example;
- whatever the hands held when the example came — a palm, two scrolling fingers — goes: the sheet takes input no more, and the captured pointers run to their lift and do nothing;
- as long as no button of the row has been in focus, the Tab stop is on the first visible button, whichever it has become: «Перо» on a sheet, «Выше» on an example (R28);
- an example's sheet never has marks: the check of the marks rejects a submission without groups or without lines, and an example's history is empty. There are none to remove on entering an example;
- React 19.3.1's sources: React assigns `undefined` to a removed property of a custom element, and the element gets `null` only if the consumer wrote it itself. The README needs no note about it. But React assigns the changed properties in JSX order, so `app` gives each segment a new element — in React, by a new `key` — and imports the entry point before the first render: before the registration React writes an attribute ([architecture.md](architecture.md), sections 3.3 and 4).

— `src/core/example.ts`, `src/element/`, `demo/`; [architecture.md](architecture.md), sections 3.1, 3.3, 3.7 and 4; RUN.md, T59; README.md.

— *Amendment 2026-11-01:* T60 built the parts of the demo. The author's answers in planning T60, all as recommended:
- **the labels** are «Дальше» and "Next", «Показ» and "Demo": in concepts 15 spec, «показ автора» is demo. The `status` region announces an opened part so: «Часть 2 из 4.» or "Part 2 of 4." in the labels' language, and after it the part's text or the picture's description in the manifest's language; for a decorative picture, only the number. «Из 4» tells how many are left and is not declined. Rejected: a number without the total — the learner would learn of the demo's end only by a faded «Дальше»;
- **«Показ»** tells of itself by a triangle — ▾ while the demo is visible, and ▸ when it is hidden —, an SVG with no name, and the label does not change: the state for a screen reader is `aria-expanded`. A hidden demo and a demo with no opened parts take no space, and nothing else is seen. Rejected: a fill, as for the chosen tool — from the first second it distracts from «Дальше» and reads as a toggle; a line «Показ спрятан» in place of the list — it repeats the triangle;
- **React 19** assigns properties in JSX order, so `app` writes `workedExample` before `demoState`, as `history` before `marks`, and listens to `ondemochange`. As with `tool`, `app` either gives no state at all or gives what `demochange` said: a new literal on every re-render would bring the demo back to its start. The property stays as it was. Rejected: the element keeps a state that came before the example and checks it later — an error in it would surface later, and not where it was made;
- **by rule 11** T60 is split: T64 takes the shared loading of the pictures of the statement and of the list, and the order is T60 → T64 → T61, since the demo layer needs the same loading. Until T64 a picture beside the sheet in the list is a frame of its own size with its description, like a picture of the statement whose file has not come.

Also decided in execution (the architect agent's review and the code):
- `demoState` is the element's own frozen object: what is assigned is checked and copied, and an assignment equal by content leaves the same object. The start is one frozen object for all elements. The element checks the state before the value: without an example, a `TypeError` before the check of its shape. Both entry points give the type `DemoState`: `app` keeps the state on the device, like the writing history;
- the `status` region empties on an assignment of the state, on «Показ» and on a new or removed example: then the same words can be announced again. The part's number is in the labels' language, as the row of buttons finds it, not in the `lang` attribute's: with `lang="fr"` the number is English and marked `en`. The part's words are in the manifest's language, and without a manifest without a `lang` of their own. The region is out of sight for all but a screen reader, not hidden: a hidden one announces nothing;
- a picture on an area in the list is a list item inside which is a `role="img"` with its description: the role on the item itself would take the item's own role off it. A decorative picture beside the sheet is a frame of its own size with no name, and one on an area an empty item;
- on a press of «Дальше» the layout runs at once, before the item is scrolled into view: otherwise the scroll event would count the visible part by the sheet's old place, and `ResizeObserver` would bring the scroll back. The item comes into view by its nearest edge, and if the row of buttons sticks above it, whatever scrolls back goes back by as much as the row covers of it, and a scroller at its start passes the rest on to the next one, as «Выше» does (R33). One `scroll-margin` in CSS would act on every scroll of the chain — on the sheet's container, above which the row stands, and on the page, above which it sticks. An element without a height does not hold the sheet in place, as when the statement grows: the page's scroll anchor is the host. T22 will check it;
- «Дальше» and «Показ» stand first in the row and are hidden by the attribute `hidden` on a sheet and a workbook, so there are now nine buttons in the row. The Tab stop in an example is on «Дальше», and a removed example hands the focus from «Дальше» to the pen's button.

— `src/core/example.ts`, `src/element/`, `demo/`; [architecture.md](architecture.md), sections 2.8, 3.1, 3.3 and 3.7; RUN.md, T60 and T64; README.md.

— *Amendment 2026-11-01:* T64 built one loading of the pictures of the statement and of the demo, `Pictures` (`src/element/pictures.ts`). The author's answer in planning T64, as recommended:
- **the element asks for all the example's pictures when the example comes**: the statement's, and those of the parts beside the sheet and on the sheet's areas, which T61 will place. The file and the URL are held while the example names the reference, and the URL is decoded before it is shown: a part that «Дальше» opened shows its picture in the same press, and a hidden demo and a `demoState` with a smaller `opened` ask for no files again. The price is the files of the parts the learner will not open, within one example. Rejected:
  - loading when a part is opened: each opened part would first show its description, and with an `app` that takes media over the network perhaps for seconds. A picture on an area would come later than its part, and fewer opened parts from `app` would drop files, which would be asked for again;
  - the files at once, and the URL and the decoding on showing: a frame or two of the description on every «Дальше», and each kind of picture would decode the file itself, and `SVGImageElement` in the IDL of SVG 2 has no `decode()` — Chromium gives it beyond the standard.

Also decided in execution (the architect agent's review and the code):
- the references are named by one place of the element — the change of the template, right after the statement has changed its frames. A file that both the past and the new ones name stays, and is seen in the new frame at once, and the references gone are removed when their frames are no more — with no needless writes into frames that are going. A reference named again the loading leaves alone, and a reference without a file it asks for again; a loading in progress runs to its end, and its file goes to the reference only if it is named again;
- a picture is shown by its display — what to show at the URL and what to do when the URL has gone —, and the loading keeps the displays apart from the named references. The frame of the statement and of the list of parts is one such display, `framed` in `statement.ts`, and T61's demo layer will set its own, without a frame;
- Chromium shows a new `<img>` with an already decoded URL synchronously — that is how the HTML Standard describes the document's list of available images —, and the loading holds the picture that decoded the URL while the URL lives. A browser may throw an entry out of the list or not keep it at all: then the frame waits for its picture to decode and until then shows the description, not emptiness. T22 will check Safari;
- a picture's frame in the list of parts stands in its item's line, from its top: the item's number is then at the top, as for a paragraph, not at the picture's bottom edge;
- the test "an equal example changes nothing" waited for one call of `media`, and an example with parts gives a call for each reference — now it checks the list of references.

The sources are [architecture.md](architecture.md), section 4, "Shared loading of pictures".

— `src/element/`, `demo/`; [architecture.md](architecture.md), sections 3.3, 3.7 and 4; RUN.md, T64 and T61; README.md.

— *Amendment 2026-11-01:* T61 put the pictures on the sheet's areas on the layer of the author's demo. The author's answers in planning T61, all as recommended:
- **the demo layer is SVG.** A picture on an area is an `<image>` with the area's `x`, `y`, `width` and `height` in the sheet's units, and the layer's `viewBox` is written by the same layout as the template's, the sketch's and the marks', in the frame of the ink (R23). Rejected: an HTML block 1000 × 1400 with the matrix (k, 0, 0, k, 0, −vy·k) — a second way of shifting beside `viewBox`, a shift across the whole sheet, which R23 rejected for SVG. The matrix remains the widget layer's, when it comes;
- **the picture is stretched over the area**, `preserveAspectRatio="none"`: the picture's corners are at the area's corners (SVG 2). That is how "at the size of its area" (the format's README, §21) and "to the size of the area" above read, and where the drawing falls on the sheet's cells does not depend on the file. The price is distortion, if the author did not give the area the picture's proportions, as the format bids. Rejected: fitting it in, `xMidYMid meet` — the drawing slides off the cells the author set it on, and its size is no longer the area's;
- **of overlapping areas, the later-opened part is on top**, by the order of the SVG document: what the learner has just opened is seen whole. Rejected: the earlier-opened on top — a new part would go under the old ones, and «Дальше» might show nothing.

Also decided in execution (the architect agent's review, a probe and the code):
- the pictures on the sheet are set and removed by the list of parts, `Parts`, together with their items: each part with an area, a decorative one too, is an `<image>` at the end of the layer's group and a display of its own in the loading (T64), without a frame. The place of an `<image>` and of a workbook's box is set by one helper, `placeOver`. While there is no file or it is not decoded, the sheet is empty there, and the description is in the item. A hidden demo is `display="none"` on the group: SVG has no attribute `hidden`. A new example gives the group its visibility back;
- an opened picture on an area scrolls the sheet to the area's block in the sheet itself, not to the picture in the sticky scene: until the next frame that one stands at its old place, and the row that covers it would be counted wrongly. The block is `visibility: hidden`: otherwise a positioned neighbor of the scene would be drawn and take the pointer over the drawing surface —, and its place is in fractions of the sheet, so the layout has nothing to write. It is set by the item, which remembers its area, and `clear()` removes the place: then no task after an example depends on `visibility`. An area taller than the visible part comes into view by its top, under the row: from below "nearest" places it so, and from above "nearest" places its bottom, and the row's loop brings the top back;
- a probe in Chromium: an `<image>` with a URL that the loading decoded is drawn in the nearest frame after its insertion, and without the decoding a large picture comes some six frames later. In forced colors a picture on the sheet is in its file's colors: CSS Color Adjust changes only the colors of properties;
- the review held that an SVG file without `viewBox` is not stretched in `<image>`, and that the tests therefore need a PNG. The probe refuted it: Chromium stretches an SVG file, with `viewBox` and without. The tests need a PNG of four colors because the corners of a one-colored picture cannot be seen on a snapshot, and the format gives pictures only as rasters.

For T22: Safari and iPad — a picture on an area by a `blob:` URL in the first frame, the scroll to a `visibility: hidden` block, and VoiceOver, which does not see the demo layer.

The sources are [architecture.md](architecture.md), section 4, "Pictures on the sheet's areas".

— `src/element/`, `demo/`; [architecture.md](architecture.md), sections 3.1, 3.2, 3.3, 3.7 and 4; RUN.md, T61 and table 3; README.md.

— *Amendment 2026-11-01:* T62 brought what epic E7 decided together into [architecture.md](architecture.md), section 3.9, and subsection 2.8 is "Decided" and stays as a record. E7 was done on 2026-11-01: T55, T56, T57, T58, T59, T60, T64 and T61, and beside it, outside the epics, T63 (R40–R42). There are no new decisions, and the next number is still R43. The "Consequence" of E7's decisions for the tasks of E5, whose bodies in the archive of E2 are not edited:
- **T22** — on the devices, beyond the list of the 2026-10-27 amendment to R34: VoiceOver on the polite `status` region in a shadow root and on the hidden demo layer; the scrolling of an example's sheet by finger and by pen, and a pinch over it, on iPad; a sheet that shifts, on an element without a height, when the list of parts grows; an opened part's picture in the same press, the frame's fallback decoding and a picture on an area by a `blob:` URL in Safari; the scroll to an area's block with `visibility: hidden`;
- **T24** — the first release carries the lesson's worked example too: the properties `workedExample` and `demoState`, the event `demochange`, and in the README the order of the properties for React (R44 spec; section 3.4). Where this release is to be — in E5, or as an epic of its own, E8, with a task of the package alone that it would take out of T24 — the author decides: `spec`'s cross-repository plan asks for the first release before `app`'s code (В56 in table 3 of RUN.md);
- **T18–T21** — the example gives no samples: the learner does not write on its sheet (R58 spec), so the synthetic samples and the samples page do not need it, and the sheet and the workbook in them are as before.

— RUN.md, T62, tables 2–4; [architecture.md](architecture.md), the status, sections 1, 2, 2.8, 3, 3.1, 3.4 and 3.9; README.md.

— *Amendment 2026-11-01:* the author answered В56: the next epic is E8 «Первый релиз» of table 2 of RUN.md, taken the same day, and E7, together with T63, went to the archive [plan/E7.md](plan/E7.md). For T24 of the "Consequence" of the amendment above this means: the first release puts out the package alone — both canvas kinds and the worked example — by a task that E8 will take out of T24, and the samples page and the synthetic samples stay T24 in E5 and come out in later releases. The first release's composition, an amendment to R08, is for the planning of that task to decide, and before the release itself comes the move to a tag of `spec`'s line 0.6: the format 0.2 and `spec`'s types of the element. So the first release comes out when `app` waits for it: `spec`'s cross-repository plan puts it before `app`'s code, after E7 and the move to the line 0.6 (COORDINATION.md on `spec`'s `main`, commit c0e7c98, read 2026-11-01, rows 5.3 and 5.5). Rejected: E5 whole — the release would wait for the eval protocol and the texts of consent, epics E3 and E4 in `spec`'s RUN.md; taking no epic yet — `app` would be left without a package.

— RUN.md, «Сделанные эпики», tables 1–4; [plan/E7.md](plan/E7.md); [architecture.md](architecture.md), sections 2.8 and 3.4; README.md; CLAUDE.md.

— *Amendment 2026-11-02:* `spec` recorded the rows «в реестр spec» on 2026-11-01, all as `canvas` recommended: В52–В54 by a second amendment of the same day to R36 spec, В55 by a second amendment to R51 spec, and В51 by the card architecture 3.2 spec (Д58 in `spec`'s RUN.md). The types `workedExample`, `demoState`, `DemoState`, `DemoChangeEvent` and `demochange` came out in `@altnovatrail/spec/canvas`, and T69 takes them. A module's picture SHOULD have an opaque light background, and `module-kit` warns of a transparent one, so `canvas` needs no backing under a picture. — R44.

— *Amendment 2026-11-02:* the triangle of «Показ» gave way to icons of the set, by the table of architecture 6 spec: an arrow down while the demo is visible, and one along the row when it is hidden, mirrored in right-to-left. The state is still told by `aria-expanded`, and the label does not change. «Дальше» has an arrow forward, mirrored too (R46). — R46.

— *Amendment 2026-11-09 (T85):* **with the format 0.4 a worked example may stand on a workbook too: the element lays out the example's lines as a task's lines, and the demo's step `fill` writes in the value of its box — R61.**

— *Amendment 2026-11-11 (T93):* the example's row of buttons is called «Кнопки примера», "Worked example buttons", and «Пример» is the name of its scroll container, while it scrolls (the T93 amendments to R28 and R33). — R28, R33.

— *Amendment 2026-11-11 (T94):* **a worked example has the zoom's pair in its row too, and, while the sheet is zoomed, «Левее» and «Правее» as well (R73).** A finger on its sheet scrolls along both axes by native scrolling; the example's parts stick to the container's left edge at the width of the fit; «Дальше» brings a picture's area into view sideways too, `scrollIntoView` with `inline: "nearest"`. When it brings a part out from under the row, the scroll of the chain runs again as long as each of its steps leaves less covered than the last: a row that the element's bottom has pressed above its place drops into its place as the page scrolls and covers the part again, and the next step brings it out. This came out with a taller row. — R73.

**R43. The test coverage of `canvas` goes to Codecov from `.github`'s TypeScript wrapper. `ci-test` writes it, by the flag `--coverage`, as one lcov report, `coverage/lcov.info`, with the v8 provider over all three Vitest projects. The report holds only the package's code — every module of `src/` but the tests, fixtures and type checks, and also one that no test loads, with zeros. `.github`'s wrappers are at v0.1.12, and a merge is held by `codecov/patch`, at least 90 % of the changed lines, once the author puts it in the ruleset.**
- **The contract** — the 2026-11-01 amendment to R19 .github and architecture 3.3 .github, "Coverage", at v0.1.12: the report is exactly `coverage/lcov.info`; a module without tests is in the report with zeros, through `coverage.include`; Vitest cleans `coverage/` itself; the caller has no artifact `typescript-coverage` of its own; its job gives `contents: read` and `id-token: write`; `.github/codecov.yml` follows `.github`'s template: patch 90 %, project only for information, a comment only when the coverage changes.
- **The provider** — `@vitest/coverage-v8` 5.0.5 under MIT, in `devDependencies`: the version of Vitest itself, out on 2026-10-15, more than three days before installation (R12). With it 11 packages came into the lock file, all `dev` and under MIT, and `ci-licenses` passes without a new exception. Dependabot keeps it in the group `vitest`.
- **The scope** — `coverage.include` is `src/**/*.ts`, and `coverage.exclude` is `*.test.ts`, `*.fixture.ts` and `*.check.ts`: on 2026-11-01 that is 36 modules. The report is `lcovonly`, and `text-summary` prints the total into the run's log. The element's modules run three times — in Chromium at density 1 and 2 and in forced colors —, and those of the DOM-free part in Node as well, and V8 adds up their hits into one line of the report. A line's coverage — whether it is covered or not — does not change by this; only the number of hits grows.
- **Where it is on** — only in `ci-test`, by the flag: `vitest` in development writes no report, and `just ci` writes it, as CI does.
- **The permissions** — the job "TypeScript" in `ci.yml` has `contents: read` and `id-token: write`: the wrapper's nested job `coverage` gets no more than the caller gives, and without the permission the run does not start at all (architecture 3.3 .github).
- **The references** — all six, to the shared workflows — are at v0.1.12, commit 4225639 (the 2026-11-01 amendment to R12).

— *Why:* where the coverage goes to Codecov, a merge waits for `codecov/patch` (R48 spec; RULES.md, How we work). Д29 in `spec`'s RUN.md waited for the upload in the wrapper, and it came out in `.github` v0.1.12 on 2026-11-01. The report, the permissions and `codecov.yml` go before the raise of the references or together with it: a raise without them is red, one's own or Dependabot's. V8 counts the coverage itself, without instrumenting, and all of `canvas`'s tests run in Node and in Chromium, where it works ([architecture.md](architecture.md), section 4). The package's code is what goes out to npm and what `app` takes.

— *Rejected:*
- istanbul — it instruments the sources before the run, and the tests are slower, while the timed tests — a workbook's crops, a statement's pictures — are at the limit of a CI runner already (T11, T62);
- `scripts/` and `demo/` in the report — `scripts/package.ts` checks the package after the tests, and `demo/` is a page for trying by hand: both would stand with zeros, and their edits would require 90 % coverage of the new lines;
- coverage always, by the setting `coverage.enabled` — `vitest` in development would write a report on every run;
- the reporter `lcov` — it also writes HTML pages, which the wrapper does not take.

— *Revisit:* if the tests go to a browser not on V8 — WebKit or Firefox: the v8 provider does not work there.

— *Consequence:*
- the author's step — `codecov/patch` in the ruleset of `main`, `integration_id` 254, after Dependabot's first pull request with the upload (rule 4; architecture 3.3 .github). While `main` has no report, the check comes as a success;
- the coverage badge in the README — with the first upload on `main`, in T66 (repositories 2.3 spec; Д6);
- from this step on, every pull request with code covers at least 90 % of the changed lines with tests.

— `package.json`, `package-lock.json`, `vitest.config.ts`, `justfile`, `.gitignore`, `.github/codecov.yml`, `.github/workflows/ci.yml`, `codeql.yml`, `scorecard.yml`; R12; [architecture.md](architecture.md), sections 3.4, 3.7 and 4; RUN.md, T65.

— *Amendment 2026-11-02:* `codecov/patch` has stood in the ruleset of `main` since 2026-11-02, with `integration_id` 254 — Codecov: the author put it there. "Once the author puts it in the ruleset" above is fulfilled, and from this day a merge of a pull request with code waits for at least 90 % of the changed lines covered. On #63, with no edits of the code, the check came as "Coverage not affected". — RUN.md, T65; [architecture.md](architecture.md), section 3.7.

## `spec` tag v0.6.2

**R44. `canvas` is on `spec` v0.6.2: the submodule `spec/` and the package `@altnovatrail/spec` are at this tag, and the package 0.6.2 is taken without R12's pause, since its version is set by the tag. `ci-licenses` checks every package of `@altnovatrail` in the lock file by `spec`'s recipe `release-verify-npm`, on every pull request and on `main`: so `canvas` carries out the signature rule of RULES.md (R77 spec). `spec` recorded the rows «в реестр spec» В51–В55, all as `canvas` recommended, and no rows are left in table 3 of RUN.md. The format 0.2 in the element and the element's types from `spec` are taken by T68 and T69.**
- **What the tag brings `canvas`** (`git -C spec diff v0.4.1 v0.6.2`, read 2026-11-02). Between the tags lie the line 0.5 (v0.5.0–v0.5.8) and the line 0.6 (v0.6.0–v0.6.2), and in the log R74–R77 spec and the 2026-11-01 amendments to R14, R17, R19, R22, R25, R30, R31, R36, R37, R44, R48, R51, R56, R63, R64, R68, R72, R73 and R76 spec:
  - **the answers to В51–В55** were recorded on 2026-11-01, all as `canvas` recommended. What went where is named by Д58 in `spec`'s RUN.md:
    - В51 — the card architecture 3.2 spec: `canvas`'s types of the task and of the manifest come from the `spec` package, and its own are the narrowed types of the check and `canvas.tools`. Its parts Д38, Д41 and Д49 are marked done there too;
    - В52 — the second 2026-11-01 amendment to R36 spec and architecture 3.1 spec: `filled` on a sheet, and `app` reads the exit condition `answer_slots_filled` by the slot binding;
    - В53 — the same amendment: the property `workedExample` and the example's mode;
    - В54 — the same amendment, and architecture 3.1 and 3.2 spec: the demo's buttons are the element's, and `demoState` and `demochange` are for `app`;
    - В55 — the second 2026-11-01 amendment to R51 spec, the format's README, §14 and §21, and architecture 3.7 spec: a module's picture SHOULD have an opaque light background, and `module-kit` warns of a transparent one but does not refuse it.

    `canvas` has already decided and built all this (R42), and the move does not touch the code;
  - **the element's types** — `@altnovatrail/spec/canvas` since the line 0.5, written by hand (R74 spec; Д50 and Д58 in `spec`'s RUN.md). They hold `CanvasElement` and its events in `CanvasEventMap`, the writing history, the work and the context of a submission, `Filling`, `CellPlace`, `Filled` and `Tool`, and with the answers to В53 and В54 also `workedExample`, `demoState`, `DemoState`, `DemoChangeEvent` and `demochange`. They hold no marks until the contract of epic E3, and the element in `HTMLElementTagNameMap` and its events in `GlobalEventHandlersEventMap` are set by the `canvas` package. R74 spec does not name `media`, `undo()` and `clear()`: if they are a contract with `app`, a row «в реестр spec» brings them. T69 takes these types;
  - **the signature rule** is R77 spec, and the recipes `release-verify` and `release-verify-npm` are T52 in `spec`'s RUN.md (the 2026-11-01 amendment to R77 spec). RULES.md has a new hard rule, "Release files are verified": a file of a NovaTrail release enters code or CI only once `release-verify` has accepted it, and a package of `@altnovatrail` from npm once `release-verify-npm` has accepted the lock file in CI of the pull request that changes it. From then on the file is held by the digest the check pinned, and nobody checks its signature again. Т-27 is closed. For `canvas` the rule stands in three places (Д54 in `spec`'s RUN.md):
    - the npm packages in its lock file — here, in `ci-licenses`;
    - the CLI of `module-kit` and the release of `modules` in the CI of the samples page — from E5;
    - its own files are checked by its consumers: `app` the package from npm, `tutor`'s CI the archive of the synthetic samples. The recipe accepts them if they were signed by `.github`'s shared `release.yml` no lower than v0.1.7 — `canvas` has it at v0.1.12 — on a call from `canvas`'s `release.yml` on `main`, at the tag's commit. The condition of the check is immutable releases and a ruleset of the tags `v*` at `canvas` before the first release: that is the author's step T66, needed before T70.

    The 2026-11-01 amendment to R37 spec: the version in npm is tied to the release by the signature of the file itself, and `SHA256SUMS` is not needed for that, but stays a file of `canvas`'s release (R08). The 2026-11-01 amendment to R73 spec: the archive of the `spec` package is checked by the recipe, not by `gh release verify-asset`;
  - **the format 0.2** — since v0.6.0 (the 2026-11-01 amendment to R44 spec; Д59 in `spec`'s RUN.md). It has one change: without `canvas.digit_height` a digit on the crop is 24 px, not 32. The second version's vectors pin that a 0.2 reader rejects a 0.1 module — the case `previous-minor` of the rule `manifest.format-version` —, and that the build takes a past index of another version — the vector `earlier-format-version`. The examples of tasks and lessons did not change, and in the examples and vectors of the manifest, the inventory, the index and the packages the version and the digests did. The format's README has two more texts without a rule: a SHOULD about a picture's background (В55) and a guide for authors on a workbook's page (В49). The types `formatv0` and `formatv0/open` changed only in comments. The format 0.2 in the element is T68;
  - **a workbook's page** — the first 2026-11-01 amendment to R51 spec, the answer to В49 (Д57 in `spec`'s RUN.md): the rule will enter the format with the 0.y version that the modules' requests bring after their first content (T38 in `spec`'s RUN.md, put off into epic E6 there; Д60), and 0.2 has only a guide. What this means for the layout's numbers is an amendment to R35;
  - **the cross-repository plan** — R76 spec and COORDINATION.md at the root of `spec` (Д53 in `spec`'s RUN.md). The order is repositories 6 spec: `canvas` and `tutor` go side by side, before items 3 and 4. Row 5.3 of COORDINATION.md is `canvas`'s move to the line 0.6, this entry, and 5.5 is the first release of `@altnovatrail/canvas` to npm: «решает `canvas`, где ему быть», and at `canvas` that is E8, T70 (the 2026-11-01 amendment to R42). The epic of `app`'s code, row 6.6, waits for row 5.5. `spec`'s coordinator keeps the rows of the other repositories by their RUN.md, and `canvas` edits nothing in the file;
  - the rest does not concern `canvas`: the path of assessment by a rubric (R75 spec), the coverage of `spec`'s Go in Codecov, the templates of issues and pull requests in `.github` — a repository sets up no templates of its own (the 2026-11-01 amendment to R22 spec), and `canvas` has none —, and the illustrations of concepts 16 spec.
- **RULES.md** — the new hard rule on the signature, and COORDINATION.md in Russian (R76 spec). The **devcontainer** and the **template** did not change: `git -C spec diff --stat v0.4.1 v0.6.2 -- .devcontainer repo-template` is empty. The recipes `licenses-check-repo` and `docs-check-repo` are as before, and `_tools` now also installs the Sigstore packages for `release-verify` — `@sigstore/verify` 4.1.2 and its neighbors, under Apache-2.0 and MIT.
- **What is changed here:**
  - `spec/` — at v0.6.2, commit 49d0fb6: that is `spec`'s last release and its `main`. `gh release verify v0.6.2 -R altnovatrail/spec` — "Release v0.6.2 verified!";
  - **the package** `@altnovatrail/spec` 0.6.2 in `dependencies`, installed by `npm install --save-exact`, and the lock file changed only in its entry. It came out in npm on 2026-11-01 at 23:55Z, less than three days before installation — an exception to R12's pause (an amendment to R12). The archive from the registry is the same as the release file: the sha256 `95e4e7c2…` matches. `just -f spec/justfile release-verify-npm package-lock.json` — "spec v0.6.2, signed by spec's release.yml, and its integrity is the verified bytes'". The code did not change: `just ci` on the package 0.6.2 is green;
  - **`ci-licenses`** calls `release-verify-npm package-lock.json` after `licenses-check-repo`. The licenses job of the TypeScript wrapper already takes the submodule `spec` and goes to the network, and runs the container as the runner's user with `HOME=/tmp`: `_tools` installs `spec/tools` into the checkout's submodule, as for `docs-check-repo`. The check runs on every pull request and on `main` inside "TypeScript / licenses", which the ruleset of `main` already requires: there is no new required check and no step of the author's. A lock file without packages of `@altnovatrail` the recipe accepts without going either to Sigstore or to GitHub, but before the check its `_tools` installs `spec/tools` from the registry, if they are not there yet: in CI, on every run, 233 packages, ≈ 270 MB;
  - the comments of `justfile`, `ci.yml` and `.github/dependabot.yml`; the tag in README.md, CLAUDE.md and at the start of RUN.md;
  - RUN.md: table 3 — В51–В55 closed; table 4 — Д4–Д6 checked; the bodies of T67–T70, the introduction, «Нужно» and the risks of E8;
  - [architecture.md](architecture.md): the status and sections 1, 2.8, 3.3, 3.4, 3.5, 3.7, 3.8, 3.9 and 4;
  - amendments to R08, R12, R35, R41 and R42.

  The entries of the history name the rows as they were.
- **What the move does not do:**
  - the format 0.2 in the element — `FORMAT` in `src/core/manifest.ts`, 24 px without a manifest and the copies of the examples in the tests — is T68. Until it, the package's types speak of the format 0.2, while the check of the manifest takes only 0.1, and the copies in the tests are of the tag v0.4.1. There is no release between T67 and T68: the first release, T70, comes after T68 and T69, so no consumer will see such a `canvas`;
  - the element's types from `@altnovatrail/spec/canvas` — T69;
  - the check of the CLI of `module-kit` and of the release of `modules` in the CI of the samples page — E5.

— *Why now:* T48 in `spec`'s RUN.md opened the line 0.6 on 2026-11-01, and the cross-repository plan puts the move as the first task of `canvas`'s course, row 5.3, before the first release, row 5.5 (R76 spec; Д53 and Д58 in `spec`'s RUN.md). v0.6.2 is `spec`'s last release and its `main` on 2026-11-02 (`gh release list -R altnovatrail/spec`). Where the check of the lock file runs and what to do about R12's pause the author decided in planning T67, both times as recommended.

— *Rejected:*
- **a job of its own in `ci.yml`, only in a pull request that changes the lock file:** a checkout with `fetch-depth: 2`, `git diff HEAD^1`, its own build of the stage `toolchain` and a skip that GitHub counts as a success. It is more exact by R77 spec, but it is `canvas`'s first job outside `.github`'s shared CI files (R30 spec), with its own copy of how the wrapper calls the recipe, and one more required check in the ruleset. The price of the chosen way is ≈ 10–20 s per run, and a failure of Sigstore, the registry or GitHub holds up any pull request and CI on `main`, and with it the release;
- **a check in `.github`'s wrapper:** `typescript.yml` has no inputs, and what the recipes check the repository decides — "What the checks do is the repository's";
- **waiting for R12's pause** — until 2026-11-05: no version 0.6.x is three days old yet, and the pause adds nothing to the check of the signature;
- **v0.6.0 or v0.6.1:** their format is the same, and v0.6.1 and v0.6.2 edited only `spec`'s documents — COORDINATION.md, RUN.md and concepts 16 spec.

— *Revisit:*
- if a failure of Sigstore starts holding up pull requests that do not change the lock file — a job of its own only for those that do;
- when `canvas` gets a second lock file — the samples page's in E5, for example: the same recipe checks it.

— *Consequence:*
- **T68** — the format 0.2: `FORMAT`, 24 px without a manifest and the copies of the examples by `git -C spec diff v0.4.1 v0.6.2 -- format/`, and its planning decides the fate of the manifest 0.1: the vector `previous-minor` says that a 0.2 reader rejects it;
- **T69** — the element's types from `@altnovatrail/spec/canvas` with `workedExample`, `DemoState`, `DemoChangeEvent` and `demochange`, and the marks and `Media` stay canvas's own;
- **T70** — the author checks the first release's archive with the recipe `release-verify`, which is already there, and before the release `canvas` must have immutable releases and a ruleset of the tags `v*` (R77 spec);
- **E5** — the CI of the samples page checks the CLI of `module-kit` and the release of `modules` with the recipe `release-verify` before the first run (R77 spec);
- amendments to R08, R12, R35, R41 and R42.

— RUN.md, T67–T70, tables 3 and 4; [architecture.md](architecture.md), the status and sections 1, 2.8, 3.3, 3.4, 3.5, 3.7, 3.8, 3.9 and 4; README.md; CLAUDE.md; `justfile`; `.github/workflows/ci.yml`; `.github/dependabot.yml`; `package.json`; `package-lock.json`.

## `spec` tag v0.6.5

**R45. `canvas` is on `spec` v0.6.5: the submodule `spec/` and the package `@altnovatrail/spec` are at this tag, and the package 0.6.5 is taken without R12's pause, as 0.6.2 was (R44). `spec` recorded the rows «в реестр spec» В57 and В58, both as `canvas` recommended: `media` and its type `Media` are a contract with `app`, and the element takes them from `@altnovatrail/spec/canvas`, while `undo()` and `clear()` stay its own. The stage with the browser and the Biome extension came from the kind `typescript` of `spec`'s template, and the devcontainer is again the output of its recipe (R79 spec). The icons of the row's buttons, which R78 spec bids to set by this move, are R46. The next epic is E5: my answer to В59.**
- **What the tag brings `canvas`** (`git -C spec diff v0.6.2 v0.6.5`, read 2026-11-02). Between the tags lie v0.6.3–v0.6.5, and in the log R78–R83 spec and the 2026-11-02 amendments to R05, R11, R21, R36, R39, R44, R49, R57, R58, R63, R64, R69, R72–R74, R77, R78 and R80 spec:
  - **the answers to В57 and В58**, both as `canvas` recommended; what went where is named by Д65 and Д72 in `spec`'s RUN.md:
    - В57 — since v0.6.3: the README of the npm package `@altnovatrail/spec`, `tools/types/npm/README.md`, teaches the recipe `release-verify-npm` in "Checking the archive", and calls `gh release verify-asset` a check of the attestation, a separate one;
    - В58 — since v0.6.4: the 2026-11-02 amendments to R36 spec and R74 spec. `media` and `Media` are in `CanvasElement` and in `@altnovatrail/spec/canvas`, and `undo()` and `clear()` are members of `canvas` outside the contract, and `tools/types/canvas.check.ts` holds that the contract does not know them. No new line of `spec` was needed;
  - **the icons** — R78 spec and the table of values of architecture 6 spec, since v0.6.3: one set, Material Symbols in the Rounded style, for all UI packages, the set's package in `canvas`'s `devDependencies`, embedded at build, with no requests at run time, and a line about the set in `NOTICE`. What `canvas` does by its move is named by Д61 in `spec`'s RUN.md: icons on the row's buttons, the embedding by a script on `@iconify/utils` with a check in CI, `NOTICE` in `files`, the triangle of «Показ» by icons of the table, and the icons, «значки», in "Rejected" of R28 and R33 to be revisited. That is R46;
  - **the template's kind `typescript`** — R79 spec, the answer to В4 `app`, since v0.6.3: the stage with the browser — the lines of R13 `canvas` — and the extension `biomejs.biome` 3.8.1, with Biome as the default formatter. The comments of the stage `toolchain` are rewritten so that they hold in a copy of any kind (Д75 in `spec`'s RUN.md). Д63 there too bids `canvas` take the stage from the recipe by its move;
  - **the inbox** — R81 spec and the edit of RULES.md, Across repositories, since v0.6.4: `spec`'s session finds the rows «в реестр spec» itself, by the recipe `just inbox`, on `main` of each repository, and a row's question opens with the mark «В реестр spec» — the recipe does not tell the case apart. The author carries rows no more, and the template of RUN.md rewrote rule 2 so;
  - **the format** — the same version 0.2: in `format/` only the README changed: the exit of the last solving step, the hint ladder and the showing of the solution by R82 spec, and when a skill graph is a chain. That does not concern the canvas. The schemas, examples and vectors are the same, so the copies in the tests (Д5) do not change;
  - **for E5:** the file name of a package of `modules` is derived from the index's entry, and the CI of the samples page finds the package by it too (the second 2026-11-02 amendment to R63 spec; Д70 in `spec`'s RUN.md). The eval protocol — T58–T60 of epic E3 there — has not come out yet;
  - **the contracts** — R83 spec, since v0.6.5: protobuf and buf in `spec`'s `contracts/`, and `spec` writes the mark's type in `@altnovatrail/spec/canvas` by hand and checks it against the contract's type. That is the basis of E9 in table 2 of RUN.md;
  - the rest does not concern `canvas`: the learner model on the server (R80 spec), the showing of the solution and the hint on request (R82 spec) — that is `api`, `app` and `tutor`.
- **RULES.md** — the mark «В реестр spec» and the recipe `just inbox` (R81 spec). The **template** — the kind `typescript` (R79 spec) and rule 2 of RUN.md. `spec`'s **devcontainer** changed only in comments.
- **What is changed here:**
  - `spec/` — at v0.6.5, commit 1a99391: `spec`'s last release and its `main`. `gh release verify v0.6.5 -R altnovatrail/spec` — "Release v0.6.5 verified!";
  - **the package** `@altnovatrail/spec` 0.6.5 in `dependencies`, installed by `npm install --save-exact`, and the lock file changed only in its entry. It came out in npm on 2026-11-02 at 05:45Z, less than three days before installation (an amendment to R12). The archive from the registry is the same as the release file: the sha256 `57c399c0…` matches. `just -f spec/justfile release-verify-npm package-lock.json` — "spec v0.6.5, signed by spec's release.yml, and its integrity is the verified bytes'". The package's types between 0.6.2 and 0.6.5 changed in `Media` and `media`, and otherwise only in comments;
  - **`media`** — `Media` from `@altnovatrail/spec/canvas`: `src/element/pictures.ts` and the element's entry point give `spec`'s type, `interface.check.ts` checks it for identity and holds `media` through `CanvasElement`, and the test consumer gives `media` through `CanvasElement`, as `app` does (an amendment to R07);
  - **the devcontainer** — the output of the recipe `new-repo-draft canvas typescript 3.2 v0.6.5`, built in a temporary clone of `spec`, outside the repository: the Dockerfile and `devcontainer.json` match it byte for byte, but for the base image. `canvas`'s is `3.0.12` — Dependabot raises it —, and the template's `3.0.10`. The Biome extension is 3.8.1, and `host-network.sh` did not change (an amendment to R13);
  - `.github/dependabot.yml` — a comment on raising Playwright and the icon set;
  - RUN.md: rule 2 and «Как устроен план» by the template (R81 spec); table 3 — В57–В59 closed; table 4 — Д4–Д6; the archive of E8 and epic E5 (an amendment to R17);
  - the tag in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status and sections 2.4, 3.3, 3.4, 3.6, 3.7, 3.9 and 4;
  - amendments to R07, R12, R13 and R17.

  The entries of the history name the rows as they were.
- **The next epic is E5**, my answer to В59 on 2026-11-02: the move to `spec`'s last tag — option 1 — and E5 at once — option 2. E5's tasks are T16–T22, T24, T25 and T29 from E2's archive and the new T74 (an amendment to R17). There is no eval protocol yet, so E5 starts with probes and the build of the page.

— *Why now:* v0.6.5 is `spec`'s last release and its `main` on 2026-11-02 (`gh release list -R altnovatrail/spec`). It holds the answers to both of `canvas`'s rows and R78 spec, which bids `canvas` set the icons by its move to the tag (Д61 in `spec`'s RUN.md). The icons are in this same task, by my answer in planning T73, against the recommendation: the executor proposed them as a task of their own, as E8 split the move into T67–T69.

— *Rejected:*
- **the icons as a task of their own after the move** — the executor's recommendation by rule 11; the author's answer is one branch;
- **v0.6.4** — the answers to both of `canvas`'s rows, R78 spec and R79 spec are already in it, but v0.6.5 is the last release, and its R83 spec is the basis of E9;
- **the template's base image 3.0.10** — Dependabot would raise it again at once, and the line `FROM` is Dependabot's;
- **waiting for R12's pause** — the pause adds nothing to the check of the signature, and the version is set by the tag (R44).

— *Revisit:*
- if `canvas` needs a new `playwright` before the template — raise the image, the revision and the snapshot here, in the package's pull request, and ask the template for the same by a row «в реестр spec» (R79 spec);
- if `spec` raises them in the template — the next move brings them.

— *Consequence:*
- E5 is in table 1 of RUN.md, and E8 with T73 in the archive [plan/E8.md](plan/E8.md) (an amendment to R17);
- R46 — the icons of the row's buttons;
- amendments to R07, R12, R13 and R17.

— RUN.md, tables 1–4; T73 in [plan/E8.md](plan/E8.md); [architecture.md](architecture.md), the status and sections 2.4, 3.3, 3.4, 3.6, 3.7, 3.9 and 4; README.md; CLAUDE.md; `.devcontainer/`; `.github/dependabot.yml`; `package.json`; `package-lock.json`; `src/element/pictures.ts`, `src/element/index.ts`, `src/element/interface.check.ts`, `src/element/consumer.test.ts`.

## The icons of the row's buttons

**R46. Each button of the row shows, before its label, an icon of the set Material Symbols by the table of values of architecture 6 spec (R78 spec). The icons are written into the module `src/element/icons.ts` by the script `scripts/icons.ts` from the set's package `@iconify-json/material-symbols` 1.2.97, with `@iconify/utils` 3.1.7 — both in `devDependencies` —, and the same script writes `NOTICE`, which goes into the package's archive. `ci-lint` fails if the module or `NOTICE` is not what the script writes. An icon is an SVG with no name for a screen reader, in the color of the button's text; the chosen tool's has a fill, «Показ»'s is an arrow down or along the row, and those of «Отменить», «Дальше» and a hidden «Показ» are mirrored in right-to-left. The label stays the button's text, and the button's padding is 8 px instead of 16, so that the row loses no room.**
- **How an icon gets into the build:**
  - the script holds the table of the row's values — the base of the name, the fill and the mirroring — as architecture 6 spec gives it, and takes from the set the outline `<base>-outline-rounded`, and, where there is a fill, `<base>-rounded` too. A name that the set does not have, or an icon not made of filled `path` contours alone, stops the script. For the line icons — the arrows and «Отменить» — the outline in the set is an alias of the fill, as R78 spec says;
  - the module is data: each icon has its name, `viewBox` and the contours `d`, and each value of the row its icons and mirroring. The element builds the SVG through `createElementNS`, without `innerHTML`, so a page's Trusted Types policy does not touch it, and the SVG has its own size of one letter — in case the element's style does not come. The module is formatted by the same Biome that `ci-lint` checks with — the script runs it with this same Node by its path in `node_modules`, without looking for the program in `PATH` —, and its header names the set, its version and its license. The module is excluded from SonarCloud's search for duplicates, `sonar.cpd.exclusions` in `.sonarcloud.properties`: SonarCloud reads records of one kind as copies of each other, and in pull request #72 it counted 72 duplicated lines, 10.8 % of the new lines, against the threshold of 3 %;
  - at run time, not one request: the contours are in the build (R78 spec; R07). `canvas` has no bundler — only `tsc` (R12) —, and a bundler's plugin does not suit it;
  - `just icons` writes the module and `NOTICE` anew, and `node scripts/icons.ts --check` in `ci-lint` checks them, as `spec`'s `just types-check` checks its types. A raise of the set by Dependabot is red until `just icons` is run in its pull request.
- **`NOTICE`** names the set, its author and its license, the address `google/material-design-icons` and the version of the set's package (R78 spec). It is in `files` of `package.json`, `scripts/package.ts` requires it in the archive, `release-files` puts it into the archive, and `release.yml` into the list of the release's paths. The license text is the `LICENSE` of the package itself, the same Apache-2.0.
- **Licenses and versions.** `@iconify-json/material-symbols` is Apache-2.0, `@iconify/utils` and its five dependencies MIT: all from `spec`'s list, without exceptions. The icons go into what ships, though the set's package is in `devDependencies` (the 2026-11-02 amendment to R39 spec), and the code of `@iconify/utils` does not: only the set's data gets into the module. Both versions are the latest that came out no later than three days before installation (R12): 1.2.97 on 2026-10-28, 3.1.7 on 2026-09-06 (the npm registry, read 2026-11-02).
- **The look:**
  - the icon is before the label, 1.125em, with a gap of 4 px; the button's padding is 8 px at the sides instead of 16, and its height and width are no less than 44 px (R28). With the former padding and an icon of 1.25em, the row in pen mode wrapped onto an extra line already at a width of 800 px. With the chosen ones, the row of the sheet, of pen mode and of the example stands in as many lines as without icons, in English at 360, 400, 600, 768, 800 and 1000 px, and in Russian at 360, 480, 800 and 1000 px, while an extra one remained for the sheet at 480 px in English and at 600 px in Russian, and in pen mode at 400 and 768 px in Russian (a measurement in Chromium, 2026-11-02);
  - the color is `currentColor`: in forced colors mode an icon is in the color of its button's text: ButtonText, HighlightText for the chosen tool, GrayText for an unavailable button (R23);
  - the fill is on the chosen «Перо» or «Ластик», and their choice is still told to a screen reader by `aria-checked`. On «Рисовать пальцем» no fill is seen: the finger mode, once on, hides the button (R29);
  - «Показ» — an arrow down while the demo is visible, and along the row when it is hidden, instead of R42's triangle, and the state is still told by `aria-expanded`;
  - in right-to-left, the row's `:dir(rtl)` mirrors the icons of «Отменить», «Дальше» and a hidden «Показ»: their direction runs along the row (architecture 6 spec). So do the keyboard's arrows: the one that points along the row leads to the next button — in right-to-left, ArrowLeft —, otherwise the arrow of «Дальше» and the key would lead different ways. Before T73 ArrowRight led to the next button in either direction (R28).
- **The label** is visible beside the icon until the accessibility standard of T07 `app` decides otherwise (О-24; R78 spec).

— *Why:* R78 spec and Д61 in `spec`'s RUN.md bid `canvas` set the icons by its move to the tag, and I decided in planning T73: in the same branch. The way is the one R78 spec names for a package without a bundler: a script on `@iconify/utils`, and a check in CI by Д61 there too. The contours are data, not SVG text: the element builds its SVGs through the DOM anyway. The padding of 8 px is by measurement: an icon with its gap added ≈ 26 px to a button.

— *Rejected:*
- unplugin-icons and other bundler plugins — there is no bundler (R12);
- SVGs copied into the repository, and Iconify components that fetch icons over the network — R78 spec rejected them;
- an icon's body as an SVG string through `innerHTML`: on a page with Trusted Types it would fail;
- a module without a check in CI: a hand edit or a new version of the set would silently drift apart from `NOTICE` and from the table;
- a padding of 16 px — the row wrapped onto an extra line; an icon of 1em — smaller than the label, and it wins no more in width than 1.125em with a padding of 8 px (a measurement);
- a fill on «Рисовать пальцем», which nobody would see.

— *Revisit:*
- when T07 `app` decides whether the label is visible beside the icon (О-24);
- when `canvas` brings in a tool that is not in the table: its icon is named by an amendment to R78 spec on a row «в реестр spec», and the set has no protractor.

— *Consequence:* amendments to R28 and R33 — the icons, «значки», in "Rejected", to R42 — the triangle of «Показ», to R12 — two packages and the script. In E5 the page's build carries the icons, and the notices in its file name the set (T19).

— `scripts/icons.ts`, `scripts/icons.test.ts`, `src/element/icons.ts`, `src/element/tools.ts`, `src/element/index.ts`, `NOTICE`, `package.json`, `justfile`, `scripts/package.ts`, `.github/workflows/release.yml`, `.github/dependabot.yml`, `.sonarcloud.properties`; `src/element/tools.test.ts`, `src/element/forced-colors.test.ts`; [architecture.md](architecture.md), sections 3.3, 3.4 and 3.7; RUN.md, T73 in [plan/E8.md](plan/E8.md).

— *Amendment 2026-11-11 (T94):* **four more values of the row — «Крупнее», «Мельче», «Левее» and «Правее» — with the icons `zoom-in`, `zoom-out`, `arrow-left-alt` and `arrow-right-alt`, without a fill and not mirrored (R73).** `arrow-forward` is already «Дальше»'s, and `arrow-left-alt` has another arrowhead. В76 carries them into the table of architecture 6 spec; until it is recorded they are in `TABLE` of `scripts/icons.ts`. — R73.

— *Amendment 2026-11-12 (T110):* **`spec` took the four values of the T94 amendment, with their icons, into the table of architecture 6 spec by В76 (Д219 spec): in `TABLE` of `scripts/icons.ts` they now follow the table, like the rest.** — R73, R77; RUN.md, T110.

## `spec` tag v0.9.8

**R47. `canvas` is on `spec` v0.9.8: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The sample file, its markup and the rules the device and the runner share are now `spec`'s eval protocol, the package `novatrail.eval.v1` (R93–R95 spec). The tests of the groups, the crop, the snapping and the boxes check `canvas`'s code against `spec`'s vectors, and its own vectors, but for `pages.json`, are removed. The types of the marks come from `@altnovatrail/spec/canvas`, and the mark of an empty box frames the box itself. `spec` recorded В60 by option (a). The styles under CSP, the format 0.3 and the standard of accessibility and translations, which the tag also bids to take, are tasks T76 and T77 and epic E10.**
- **What the tag brings `canvas`** (`git -C spec diff v0.6.5 v0.9.8`, read 2026-11-08). Between the tags lie v0.6.6–v0.9.8, in the log R84–R107 spec, and what `canvas` gets with the tag is named by Д50, Д68, Д79, Д80, Д87, Д91, Д92, Д94–Д97, Д107, Д108 and Д115 in `spec`'s RUN.md:
  - **the eval protocol** — R93–R95 spec. The sample file is the message `Sample` of the package `novatrail.eval.v1`, one JSON per sample, without pressure, an eval-set sample's with the license in the file; the reader is strict, and the file is checked by `spec`'s recipe `sample-check` (Д94, Д95). The markup is the field `markup`: the slot truth, the marks of the answer slots, and on a sheet the writing parts with the first error or the scores of an essay's criteria (Д97). The protocol wrote down the rules of the groups, the crop, the snapping and the boxes as `canvas` wrote them, and their vectors came out in the npm package `@altnovatrail/contracts` (R94 spec; Д96). Where the protocol parted from R09 is an amendment to R09;
  - **the answer to В60** — the 2026-11-08 amendment to R95 spec, since v0.9.8, by option (a) of the row: `first_error` of a sheet's parts and an essay's scores in a synthetic sample are a choice of the code by the seed, like the slots' values, and say nothing about the solution. Measures on these fields measure nothing on synthetic samples, and the admission rule does not count them (Д115);
  - **the synthetic samples** write `canvas_version` `0.0.0` and `text_set_version` `none`: the file was not written by the samples page (the 2026-11-07 amendment to R93 spec);
  - **the marks** — R97 spec and the second 2026-11-03 amendment to R74 spec: the property `marks` and the types `Marks`, `Mark` and `Anchor` are in `@altnovatrail/spec/canvas`, in the shape of `canvas`'s temporary types, and a mark frames a workbook's empty box itself (Д50). That is epic E9 of table 2 of RUN.md, and this move did it;
  - **the styles under CSP** — the second 2026-11-02 amendment to R36 spec: the element sets the styles of its Shadow DOM by `adoptedStyleSheets`, without an inline `<style>`, requires of the consumer's CSP only `img-src blob:`, and the element's test runs under the CSP `default-src 'none'; style-src 'self'; img-src blob:` (Д79). That is T76;
  - **the format 0.3** — R89, R101 and R102 spec, since v0.9.0: the rules of version comparison. The task's schema changed only in `$id`, and the manifest's in four lines. `canvas` reads 0.3 by the tag's types, and takes the format 0.3 manifest into the element as a task of its own (В34 `module-kit`; Д107, Д108). That is T77;
  - **the standard of UI packages** — R90 spec and R91 spec: WCAG 2.2 level AA and two criteria of AAA; a zoom of the sheet up to 200 % with scrolling in two directions, a workbook's lines and boxes in the accessibility tree, the keyboard into the sheet and out of it, a row of buttons that does not stick in a low window, the frames of `exportWork()` without the theme and forced colors, an axe-core of its own; placeholders, CLDR's number forms and labels by the table of words (Д87). That is epic E10 in table 2 of RUN.md;
  - **the artifact** — concepts 8 and 15 spec: a work that is itself the result, while the work on a task with a key — strokes, answers, the context of a submission — is not an artifact, and the device erases it with the end of the attempt (Д68). So [architecture.md](architecture.md), section 1, now says;
  - **the samples page** — "hand the file to the eval-set organizer" and the author's statement for the purpose "eval set" (Д80). That is T20;
  - **the npm step of the shared release** waits 20 minutes for the version to appear (the 2026-11-02 amendment to R37 spec; Д91): `canvas` will get it with the release of `.github` that has it;
  - the rest does not concern `canvas`: the own key on the device (R84 spec), the deployment configuration (R85 spec), the observation (R86 spec), a submission with a rubric (R87 spec), the Starlark dialect (R88 spec), the interface languages (R92 spec), the admission to AI by age (R96 spec), the contract `app` ↔ `api` beyond the mark (R97–R100 spec), the gate `sim` (R103 spec), the engine (R104, R107 spec), the production images (R105 spec) and the rollout of `infra` (R106 spec).
- **RULES.md** — the rule on production images (R105 spec): `canvas` has none. The **template** — buf in the stage `toolchain` and in CLAUDE.md.
- **What is changed here:**
  - `spec/` — at v0.9.8, commit b1fbc61: `spec`'s last release and its `main`. `gh release verify v0.9.8 -R altnovatrail/spec` — "Release v0.9.8 verified!";
  - **the packages** — `@altnovatrail/spec` 0.9.8 in `dependencies` and `@altnovatrail/contracts` 0.9.8 in `devDependencies`, both by `npm install --save-exact`, without R12's pause, as in R44 and R45. The archives from the registry are the release files of `spec` v0.9.8: `release-verify-npm` accepted both. The types of `@altnovatrail/spec` between 0.6.5 and 0.9.8 changed in the marks and in comments (an amendment to R12);
  - **the marks** — `src/core/marks.ts` gives `spec`'s types, and so do the entry points, `interface.check.ts` and `entry.check.ts` check them for identity, and the directive `@ts-expect-error` on `marks` is removed (an amendment to R07). The mark of an empty box frames the box (an amendment to R39);
  - **the vectors** — the tests of the groups, the crop, the snapping and the boxes read `spec`'s vectors: `src/core/contracts.fixture.ts` translates the protocol's messages into the sheet's types, and 16, 34, 14 and 20 cases agree with `canvas`'s code without a single edit of the rules. `vectors/groups.json`, `crops.json`, `snaps.json` and `boxes.json` are removed, and `pages.json` stays (amendments to R24–R26, R31 and R37);
  - **the devcontainer** — the output of the recipe `new-repo-draft canvas typescript 3.2 v0.9.8`, built in a temporary clone of `spec`, outside the repository: the Dockerfile matches it byte for byte, buf 1.75.0 with its sums (an amendment to R13). `devcontainer.json` and `host-network.sh` did not change;
  - `.github/dependabot.yml` — `@altnovatrail/contracts` in `ignore`, like `@altnovatrail/spec`;
  - RUN.md: T16 done; T17, T18 and T20 supplemented with what the tag bids them; the new T76 and T77 and epic E10; table 2 without E9; table 3 — В60 closed; table 4 — Д4 and Д5;
  - the tag in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status and sections 1, 3.2, 3.3, 3.5, 3.7 and 3.8.
- **Found:** the `exact.median` of `canvas`'s crop is H, the height the scaling takes, min(h_med, 1000), and the protocol's `bundle_median` is h_med itself. `spec`'s vectors tell them apart on three sheets, and T17 writes h_med into `CropSet`.

— *Why now:* the author's instruction of 2026-11-08, «выпущена новая версия spec — перейди на неё», and Д115 in `spec`'s RUN.md: T16 leads the move to a release with the 2026-11-08 amendment to R95 spec, and v0.9.8 is the first such release, the last one on 2026-11-08 and `spec`'s `main` (`gh release list -R altnovatrail/spec`). The synthetic samples' path to `tutor` — T16, T17, T18 and T24 — starts with it.

— *Rejected:*
- **v0.9.7** — the first release with the protocol, but without the answer to В60 (Д115 in `spec`'s RUN.md);
- **the move without the types of the marks** — the executor's recommendation at the first estimate, by rule 11; the author's answer is the move whole;
- **CSP, the format 0.3, R90 spec and R91 spec by this same move** — the synthetic samples' path to `tutor` would wait several days for them. The author's answer on the split is as recommended: the move, and the tasks after T24;
- **vectors of its own beside `spec`'s vectors** — two copies of the same rules would silently drift apart (R94 spec);
- **the vectors from the submodule `spec/`** — the code and the tests take `spec`'s files from the package of the same version, checked by its signature, not from the submodule (R94 spec);
- **`@altnovatrail/contracts` in `dependencies` now** — the `canvas` package would carry a dependency that its code does not call yet. Where the code of the sample file goes, T17 decides.

— *Revisit:*
- if T17 puts the code of the sample file into the package — `@altnovatrail/contracts` moves to `dependencies`;
- if `spec` changes a rule or the vectors — the next move brings them, and the test checks the code against the new ones.

— *Consequence:*
- T76 and T77 in table 1 of RUN.md, after T24, and epic E10 in table 2;
- T17, T18 and T20 — «Дополнено 2026-11-08»;
- amendments to R07, R09, R12, R13, R24–R26, R31, R37 and R39.

— RUN.md, T16, T17, T18, T20, T76, T77, tables 1–4; [architecture.md](architecture.md), the status and sections 1, 3.2, 3.3, 3.5, 3.7 and 3.8; README.md; CLAUDE.md; `.devcontainer/Dockerfile`; `.github/dependabot.yml`; `package.json`; `package-lock.json`; `tsconfig.core.json`, `tsconfig.node.json`; `src/core/marks.ts`, `src/core/contracts.fixture.ts`, `src/core/*.test.ts`, `src/core/entry.check.ts`, `src/core/index.ts`, `src/element/index.ts`, `src/element/interface.check.ts`, `src/element/workbook.test.ts`; `vectors/`.

## The sample file

**R48. The sample file is built, written and read by the module `src/eval/`, outside the package, by the code of `@altnovatrail/contracts`: the message `Sample` of the package `novatrail.eval.v1` of each composition — a measurement by an adult with the writing history, an eval set's, and a child's with the final geometry, on a sheet and on a workbook. The final geometry is strokes in the canonical direction, with points along the stroke's length every 0.25 units and with the points the stroke's box rests on, numbered by place. The crops are drawn from the strokes the file holds, and their numbers are the same as from the history. The examples of each composition are written by a test into `examples/`, and `ci-licenses` checks them by `spec`'s recipe `sample-check`.**
- **The module** — `src/eval/sample.ts` and `src/eval/resample.ts`, without the DOM, in Node and in the browser. The samples page (T20) and the generator of the synthetic samples (T18) will take it:
  - `sampleOf` assembles a sample from the purpose, "who wrote", the provenance, the writer code, the reference to the task, the sheet or the workbook with the writing history, and the markup in the sheet's stroke numbers. A child's sample for an eval set, a writer code for an eval set and a measurement without a code are a `TypeError`; the rest is held by `sample-check`;
  - `sampleText` writes the file with every field, zeros too, by the proto names, and `readSample` reads strictly: an unknown field and another protocol are a `TypeError`;
  - `personId` and `writerCode` make the sample's ID — 12 characters `[a-z2-7]`, 60 bits — and the writer code — 8 characters `[0-9A-Z]` without I, L, O and U, 40 bits — from the caller's random bytes: for the page that is `crypto.getRandomValues`. `syntheticId` is `synthetic-<seed>`, as in `spec`'s examples.
- **The order of the computation** — by R09 with its amendments:
  1. the device builds the sheet's groups and the table of boxes from the raw history (R24, R37);
  2. the sample's history — time in whole milliseconds, places to a tenth, without pressure: the rounding keeps the order of the times, and a stroke lies no earlier than its last point (R22);
  3. the final geometry — the visible strokes, on a workbook only the strokes of the boxes. The points go along the stroke's length by a step, and the ends and the first points that reach each edge of the stroke's box stay: a point on a segment lies in the stroke's box and does not leave it when rounded to a tenth. The step is counted from one end and from the other, each series is taken in the canonical direction — the one of the two that comes first by the points in tenths, each compared top first, then left —, and of the two series the one that comes first goes. So the direction is canonical by the file's own points, and a stroke written the other way gives the same points. A stroke that the file does not hold — an erased one, or a workbook's draft — is a `TypeError` in the markup, and `sampleOf` does not change the caller's markup. The numbers are by place: the top of the stroke's box, its left edge, its bottom, its right edge, then the points in the canonical direction, and the former ID;
  4. the groups, the table and the markup move to the new numbers;
  5. the crops — from the file's strokes (R94 spec), at 16, 24, 32 and 48 px and at the module's height, without repeats, in ascending order. A workbook has a set for each filled box, from its strokes, as one group of the rule, but without crop boxes. `bundle_median` is h_med, not the crop's `exact.median`.
- **The step of 0.25 units** is the largest of 0.25, 0.5 and 1 at which no pixel of the crop at any height moves by more than a quarter of the gray scale on the tests' synthetic sheets. At 0.5 a line's edge on lowercase letters at 48 px moves by up to 136 of 255, at 1 by up to 254. The crop's numbers are the same at all three: the strokes' boxes do not change. `src/eval/resample.test.ts` holds this by enumeration.
- **The examples** — `examples/sheet-measurement.json`, `sheet-eval-set.json`, `workbook-child.json` and `workbook-measurement.json`, synthetic, on the tasks of `tutor`'s file of open tasks v0.1.1, as in `spec`'s examples. `src/eval/sample.test.ts` writes them through `toMatchFileSnapshot`, as the vectors were written before: in CI the file is not rewritten, and a divergence from the code is a failure. `ci-licenses` calls `just -f spec/justfile sample-check examples/*.json`: in CI only the licenses job has the submodule `spec/`, and buf is in the stage `toolchain` (R47).

How it is built: [architecture.md](architecture.md), sections 3.5 and 3.7.

— *Why:* the author's answers in planning T17, 2026-11-08: the place of the code and the check in CI as recommended, and the task whole, against the recommendation to split it into the sheet and the workbook.
- **Outside the package** — only the samples page and the generator write the sample file, both in this repository; `app` does not write it, and the package needs neither `@altnovatrail/contracts` nor `@bufbuild/protobuf` (R47, "Revisit"). The boundary is held by the package's check `scripts/package.ts`: a build file outside `lib/core` and `lib/element` is a failure, so a module that `core` imported by mistake will not get into the archive.
- **The examples in git** — `.github`'s shared wrapper does not give the submodule `spec/` to the tests: the code takes `spec`'s files from releases (R21 spec). The licenses job gets it, and the files it checks are held by the test.
- **Along the length and with the box** — points along the stroke's length do not tell how fast it was written, nor the canonical direction from where; the stroke's box holds the stroke bundles, h_med and the group boxes, so the runner will repeat the crop's numbers from the file (R94 spec).
- **A step by pixels, not by eye** — "no difference is seen on the crop" (R09) a test holds only by a number, and a quarter of the gray scale at a line's edge is its measure.

— *Rejected:*
- **the code in the package, in `core`** — every consumer, `app` too, would pull in the code of the contracts, which it does not call;
- **a row for `.github`, so that the tests get `spec/`** — the check in CI would wait for an answer;
- **the workbook as a task of its own** — the executor's recommendation by rule 11; the author's answer is one task;
- **the step 0.5** — a line's edge moves by up to half the gray scale;
- **the points as they came, without time** — their density gives away the speed of writing;
- **thinning without inserting points** — the sparse places of a fast stroke would stay sparse.

— *Revisit:*
- if the runner or anyone else starts snapping the model's box to the strokes of the final geometry — the share of points there is other than on the sheet (an amendment to R26; В61 in table 3 of RUN.md);
- if the size of the eval set's files becomes a concern of `modules` — the step and the form of the record; an example of a sheet's geometry is now about 550 KB.

— *Consequence:*
- **T18** — the generator calls `sampleOf` and `syntheticId`, and each of its files passes `sample-check` too;
- **T20** — the page calls `sampleOf`, `personId` and `writerCode` with `crypto.getRandomValues`, and gives the markup in the sheet's stroke numbers;
- amendments to R09, R12 and R26; В61 in table 3 of RUN.md.

— RUN.md, T17, T18, T20, table 3; [architecture.md](architecture.md), sections 3.5 and 3.7; README.md; `src/eval/`, `examples/`, `justfile`, `package.json`, `package-lock.json`, `tsconfig.core.json`, `tsconfig.build.json`, `vitest.config.ts`.

— *Amendment 2026-11-08:* `spec` decided the first item of "Revisit" by В61, by the 2026-11-08 amendment to R94 spec, from v0.9.9 (R53): snapping takes the strokes as they came — on the device the strokes of the submission, in eval those that the writing history shows — and a sample's final geometry does not serve as its input. Eval chooses the margin and the threshold of snapping and measures snapping only on samples with a history. So a runner that snaps a box to the final geometry departs from the protocol, not from this entry. Revisit now — when a measurement of snapping takes its place on the device (the "Revisit" of R26): then the share by the length of the stroke will be proposed by a row «в реестр spec» of its own, as the same amendment to R94 spec says.

**R49. The synthetic samples are drawn by the generator `src/eval/synthetic.ts`: 16 samples from the seeds 101–116 on the tasks of `tutor`'s file of open views v0.1.10 — the sheets of the banks `eval/bank.json` and `eval/free-bank.json` and the pages of `eval/workbook.json`, without essays. No set is in git: the recipe `just synthetic <folder>` writes it — in `ci-licenses`, where `sample-check` checks each file, and in `release-files` for the archive of T24. `tutor`'s file lies in `tasks/` as a copy of the release, and `ci-licenses` checks its signature by the recipe `release-verify` on every pull request.**
- **The generator** — without DOM, like the whole of `src/eval/`:
  - `SET` — 16 entries: the seed, the scenario, the purpose, who wrote and the bank. `syntheticSample` takes a task from the bank by the seed, draws the scenario's strokes with the hand on a sheet or on a page of a workbook, writes the markup in the numbers of the sheet's strokes and gives it all to `sampleOf` (R48) with `syntheticId`. The writer code is `writerCode` from the bytes of the same generator of the seed;
  - the hand — `src/eval/hand.ts`: `Hand`, its own outlines of digits and signs `GLYPHS` and the fonts, moved from the synthetic sheets of the tests, which now take them from here. The hand writes through `Recorder` into `Work`, on the sheet's clock, with erasures, clearing and undo (R22), and the points between a stroke's corners stand 2 units apart and shift by the seed by up to 0.4 units. The hand has pressure, but it does not go into the file (R93 spec);
  - the scenarios and what they give the markup — `SCENARIOS`: a correct solution without `first_error`; a solution with an error in a line that the seed chose, and with `first_error` on it; an answer erased and written again; a sheet cleared before the solution, and an extra stroke undone; a crossed-out answer written again below, with the note `crossed_out` at the answer's place; a mirrored digit of the answer — `UNREADABLE_AMBIGUOUS` and the note `mirrored`; an illegible answer — `UNREADABLE_ILLEGIBLE`; two final answers; a solution without an answer; an empty sheet; a number line with jumps — a drawing part, a line of the sum and the answer, and `first_error` is chosen by the seed; a page with all its boxes, with empty boxes and a crossed-out answer, with a mirrored digit and an erased answer, and an empty page;
  - the numbers of the lines — arithmetic from the seed's number: there is one line with an error, only in the error scenario, and the lines after it carry it. Whether the sum is right the markup does not say: the `first_error` of the synthetic samples is the seed's choice (the 2026-11-08 amendment to R95 spec);
  - the set holds each composition on a sheet and on a workbook, each writer and each event of the history — writing, erasure, clearing and undo.
- **The tasks** — `src/eval/tasks.ts`. `openTasksOf` reads `tutor`'s file and gives, by bank, references to the tasks: the tag, the file's sha256, the bank and the bank's digest as the file gives it, the task's ID and the digest of the open view — the sha256 of the canonical text of the task's object by RFC 8785, as the section "Packages" of the format text defines it. For `equation-1` and `workbook-01` it is the same as in the examples of `spec`. The hash is given by the caller: the DOM-free part has none of its own, and Node has it. Of a task only the ID, the canvas kind and the workbook's items are taken: the file is of format 0.3, and the element reads 0.2 (T77).
- **`tutor`'s file** — `tasks/tutor_v0.1.10_open-tasks.json` with its Sigstore bundle, byte for byte from the release. The tag, the name and the sha256 are `TUTOR_FILE`, and the tag is also the variable `tutor_tag` of the `justfile`, and a test holds them equal. `ci-licenses` calls `release-verify tutor v0.1.10` on the file from the tree (R77 spec), and the generator's script refuses a file with another sha256. A new release of `tutor` comes as a replacement of the file and of the three values.
- **The run in Node** — `scripts/synthetic.ts`: writes each sample as a file `<ID>.json` and prints a line per sample — the ID, the purpose, the writer and the scenario. The code of `src/` names its modules `.js`, and Node does not take such names for `.ts`, so `just synthetic` first builds the generator with `tsc` by `tsconfig.synthetic.json` into `build/`, and Node runs the build. It needs neither `spec/` nor `git`, and the network only for `npm ci`, when the packages are not installed yet, as the whole build does. Of the folder the recipe removes only the files of the previous set, `synthetic-*.json`. The set is about 6 MB of JSON; two runs give the same bytes.

How it is built — [architecture.md](architecture.md), sections 3.4, 3.5 and 3.7.

— *Why:* the author's answers in planning T18, 2026-11-08, — all by the executor's recommendations.
- **The set not in git** — 6 MB that every change of the raster or of the points alters would clutter the history, and the generator repeats them byte for byte. `sample-check` checks the files in the tree, and `ci-licenses` writes them there itself.
- **`tutor`'s file in the tree** — `release-files` runs without the network, and a release file enters CI only after `release-verify` (R77 spec); the page's build will take the same file (T21).
- **16 samples** — each composition, writer, event and kind of markup at least once; `tutor`'s runner needs to read the samples, not to measure AI on them (R38 spec).
- **Without essays** — the task's goal is digits, expressions and drawings, the hand has no Latin letters, and there is no rubric of an essay in the open view, so the generator cannot choose marks that the runner would not reject (the section "Eval sets" of the contracts text).
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
- **T24** — `release-files` calls `just synthetic` and packs the folder into the archive `synthetic-samples_v<X.Y.Z>.tar.gz`, and puts the lines "ID — purpose — writer — scenario" where it decides;
- **T21** — the page's build takes the same file from `tasks/`.

— RUN.md, T18, T21, T24; [architecture.md](architecture.md), sections 3.4, 3.5 and 3.7; README.md; `src/eval/`, `src/core/sheets.fixture.ts`, `src/core/workbooks.fixture.ts`, `scripts/synthetic.ts`, `tasks/`, `justfile`, `tsconfig.synthetic.json`, `.gitignore`.

— *Amendment 2026-11-09 (T21):* the page's build takes the same `tutor` file from `tasks/` too — all its tasks, the essays too (R62). `openTasksOf` now rejects a task with a field outside the format's open view, so the synthetic samples will not take a file with a closed field either.

— *Amendment 2026-11-09 (T86):* **the same generator also writes the synthetic samples of a module's eval set — on the module package that the call names, by the recipe `just synthetic-module` (R63). It does not change this decision's set: the choice of a task from the bank by the seed stayed with the set, and the drawing became shared.**

— *Amendment 2026-11-10 (T99):* **the synthetic samples correspond to `tutor`'s file v0.1.22, of format 0.4, instead of v0.1.10: `TUTOR_FILE`, `tutor_tag` and the copy in `tasks/` are raised together, and `ci-licenses` checks it by `release-verify`. The file's banks and tasks are the same byte for byte; in v0.1.22 only `module_format_version` changed, 0.3 → 0.4: in the samples' references to tasks the tag and the file's digest change, and the digests of the banks and of the open views are the same (R60, R62).**

**R50. The release carries the synthetic samples as two files: the archive `synthetic-samples_v<X.Y.Z>.tar.gz` — a flat tar, one file `<ID>.json` per sample — and the list `synthetic-samples_v<X.Y.Z>.tsv`: a line per sample, the ID, the purpose, who wrote and the scenario. The archive is written by code of its own, `scripts/archive.ts`, with no machine and no time in its bytes, and one commit gives the same archive. Both files are signed and stand in `SHA256SUMS`, and the release's paths take everything the synthetic samples are built from.**
- **The archive** — ustar: the names in ascending order, each file with a header with its name, size and checksum, mode `0644`, owner `0` with no name, time `0`, type "regular file"; no directories, a name of 1 to 100 bytes without `/`; at the end two empty blocks. Compression — gzip from `node:zlib`, level 9, with no file name and no time in the header. Deflate is the zlib of Node itself, whose version `.devcontainer/Dockerfile` pins, so the bytes are the same in the `toolchain` stage, not on any machine; a test holds the sha256 of a small archive, and a Node with another deflate fails it before the release. The repeat byte for byte, the headers, the empty folder, the refusals and the reading of the archive by GNU `tar` are held by `scripts/archive.test.ts` in `ci-test`. The archive is about 770 KB, and the set itself 5.2 MB of JSON: R49 and T18 name about 6 MB — that is what it takes on disk, in blocks.
- **`release-files`** writes the set by the recipe `just synthetic` into a temporary folder outside `dist/` — the shared release takes only files and fails on a subfolder —, packs it with `node scripts/archive.ts` and puts the list beside it: a line with the names of the columns `id`, `purpose`, `writer`, `scenario`, then a line per sample. The list is written by the generator itself, not by catching the recipe's output: nothing that `npm ci` or `tsc` would print gets into it. The archiver does not pack an empty folder. `SHA256SUMS` — the package, the archive, the list and `LICENSE`.
- **The release's paths** in `.github/workflows/release.yml` — added to the earlier ones are `scripts/synthetic.ts`, `scripts/archive.ts`, `tsconfig.synthetic.json`, `tasks/*` and `package-lock.json`: the sample's JSON is written by the packages from it; the generator `src/eval/` is already taken by the mask `src/*.ts`. So new synthetic samples come out as a release even if the package did not change.

How it is built — [architecture.md](architecture.md), section 3.4.

— *Why:* the author's answers in planning T24, 2026-11-08, — all by the executor's recommendations.
- **An archiver of its own** — `tutor`'s CI pins the archive's sum by tag (T32 tutor), and the bytes must not depend on the versions of `tar` and `gzip` of the image and on their flags; code of its own is held by tests in `ci-test`, and a recipe is not.
- **The list as a separate file** — the release's description is written by the shared `release.yml` itself (`gh release create --generate-notes`), and no text can be passed into it; and a README inside the archive would make it not only the JSON that `tutor` asked for.

— *Rejected:*
- **GNU `tar` and `gzip` in the recipe** — only a run of the recipe would hold the repeat, and the bytes would be held by the versions of the image's tools;
- **the lines in the release's description** — the shared `release.yml` does not take it;
- **a README in the archive** — the archive would stop being only samples;
- **no list** — `tutor` will read the samples without it too, but matching the scenarios against its run is simpler by the list.

— *Revisit:* if `tutor` wants the set otherwise — by directories, with a manifest — that is its row to T32 tutor.

— *Consequence:* T75 carries the page's build too in the same release, by the same recipe; T25 waits for a release of `tutor` whose runner reads this archive.

— RUN.md, T24, T25, T75; [architecture.md](architecture.md), section 3.4; README.md; `scripts/archive.ts`, `scripts/archive.test.ts`, `justfile`, `.github/workflows/release.yml`.

**R51. The element sets the styles of its Shadow DOM by `adoptedStyleSheets`, not by a `<style>` element in the shadow tree: one `CSSStyleSheet` per document, built by the window of that document and filled by `replaceSync()`. Under the CSP of `app` — `default-src 'none'; style-src 'self'; img-src blob:` — the element works and asks of the consumer's policy only `img-src blob:`. A test of the element under this policy holds this.**
- **The sheet** — the same text of styles that stood in `<style>`, rule for rule. The first element of a document builds the sheet by the constructor `CSSStyleSheet` of that document's window and fills it by `replaceSync()`, and the other elements of the document take the same object: the rules are parsed once per document, not for each element.
- **A move into another document.** A root can be given only a sheet of its own document: otherwise CSSOM throws `NotAllowedError`. Chromium, when it moves an element into another document — for instance, into an iframe of the same origin —, clears the `adoptedStyleSheets` of its root, and without a fix of its own the element would be left without styles both there and after its return. So `adoptedCallback()` gives the root the sheet of the new document. A document without a window cannot build a sheet: there the element is without styles until it gets into a document with a window. With `<style>` a move did not lose the styles, and the test `index.test.ts` holds that it does not lose them now either.
- **The attribute `style`** the element does not write in the markup. The sizes it sets itself — to the frame of a picture in the statement and in the list of the demo's parts, to the visible part of the sheet, to the demo's area on the sheet — it assigns through CSSOM, by the properties of `style`. The policy of `app` does not block them in Chromium: the test compares the width of the frame of the statement's picture, and the height of the visible part of the sheet only indirectly, by a sheet that took its place and took strokes.
- **What else concerns the CSP:**
  - the pictures of the statement and of the demo — beside the sheet and on the sheet — are `blob:` addresses: `img-src blob:`;
  - the element loads no fonts: the font is the consumer's, and the package has no `@font-face`, so it needs no `font-src`;
  - media files come as a `Blob` from `media`, and the element does not go to the network: no `connect-src` is needed either;
  - the crop for the check is its own raster and its own PNG, without loads (R25).
- **The test** — `src/element/csp.test.ts` in the project `browser`, in both instances of Chromium. The policy is set by a `<meta http-equiv="Content-Security-Policy">` element in the `<head>` of the test's frame, when the file's modules are already loaded: after that the frame loads nothing but `blob:` pictures, like the page of `app`, and the runner, already loaded, works. Each file of tests has its own frame, and the other files do not fall under the policy.
  - The first test holds that the policy acts: a `<style>` in the shadow root is blocked, and the page hears the event `securitypolicyviolation`.
  - Then — a sheet with a picture of the statement, a grid, strokes and a tutor's mark, a workbook, and a worked example with pictures beside the sheet and on it. The styles are in place, the sizes through CSSOM too, the pictures came by `blob:` addresses and are decoded, and there are no violation events.
  - With the old `<style>` the last three tests fail: the host has `display: inline`, the workbook's print is the browser's `rgb(0, 0, 0)`, not the ink's color `rgb(17, 17, 17)`, and the violation event is `style-src-elem`.

How it is built — [architecture.md](architecture.md), section 3.3.

— *Why:* the second 2026-11-02 amendment to R36 spec wrote this down as a requirement of the contract: the CSP of `app` does not change with the canvas's version (the 2026-11-02 amendment to R09 app), and the other consumers need not allow inline styles. The tag v0.9.8 says to take it (Д79 in RUN.md of `spec`), and the move T16 put it off as task T76, by my decision of 2026-11-08 (R47). The task's plan is "—": the documents decided what to do.
- **A sheet per document, not per element** — a lesson of `app` has many elements, and the rules are parsed once.
- **`adoptedCallback()`** — without it an element moved into another document would lose its styles, which did not happen with `<style>`. A probe in the image's Chrome Headless Shell showed this: after a move the root has zero sheets, and the host has `display: inline` — both in an iframe and after the return.
- **`<meta>` in the test's frame** — Vitest serves the frame's page with its own scripts, and `default-src 'none'` as a header of the response would stop the runner itself. A `<meta>` after the modules are loaded gives the same policy word for word.

— *Rejected:*
- **a hash of the styles in the `style-src` of `app`, and `'unsafe-inline'`** — the amendment to R36 spec itself rejected them;
- **one sheet per module, with no regard to the document** — an element moved into an iframe would be left without styles;
- **a CSS file of the package through `<link rel="stylesheet">`** — the package has no bundler (R12): the file's address would be set by the consumer's bundler, and `style-src 'self'` would let the file in only from the consumer's origin;
- **a policy as a header of the server for the test's page** — it would stop the runner, and one that lets the runner in is no longer the policy of `app`;
- **a check only by hand, on `demo/`** — without CI a regression would pass unnoticed.

— *Revisit* — if WebKit or Gecko blocks `replaceSync()` or the assignments through CSSOM under such a policy. CSP3 names the parsing of a declaration block and `insertRule` among the CSS algorithms that the absence of `'unsafe-eval'` closes, but writes at once that this "needs to be better explained" ([architecture.md](architecture.md), section 4). Chromium does not close them, and there are no other engines in the image. In WebKit and Firefox `app` will check this: its Д9 in RUN.md (`main` 375a09b, read 2026-11-08) names «что `style-src` не блокирует `adoptedStyleSheets` и `element.style` канвы».

— *Consequence:* `app` changes nothing: its policy is already such. The row В62 in table 3 of RUN.md tells `spec` that `canvas`'s part in Д79 is done.

— RUN.md, T76, table 3; [architecture.md](architecture.md), sections 3.3, 3.7 and 4; `src/element/index.ts`, `src/element/csp.test.ts`, `src/element/index.test.ts`.

— *Amendment 2026-11-12:* **the test's policy is the policy of `app` plus `script-src 'self'`: `default-src 'none'; style-src 'self'; img-src blob:; script-src 'self'`. It holds the styles and the pictures word for word by the policy of `app`, and lets scripts in from the origin of the tests' server — for the runner.** With Playwright 1.65.0 (the 2026-11-12 amendment to R12) the tests run in Chrome Headless Shell 158 instead of 156. After a file's tests the runner imports again the module that takes the coverage, `/@id/@vitest/coverage-v8/browser`, and 158 blocks this import under `default-src 'none'`: "Failed to fetch dynamically imported module", four unhandled errors on the two instances of Chromium, and `ci-test` fails, though all eight tests of the file passed. Without the policy there are no errors, and with 1.64.1 and the browser 1248 there are none either. Sources with a path — this module's, `/@id/`, `/@fs/`, `/node_modules/`, all three together and a path with `%40` — did not let the import in, and the whole origin did: so `'self'` is taken, the same thing, shorter. What the test no longer catches is a script that the element would load from its own origin; the element imports none after loading (`git grep "import("` in `src/core` and `src/element` outside the tests is empty), and R51's promise about the consumer's policy — only `img-src blob:` — is as before. The author's answer of 2026-11-12 when the dependencies were raised, by the recommendation; rejected — keeping Playwright at 1.64.1, or putting the raise off until a task of its own about the test's frame. — `src/element/csp.test.ts`.

## The probe of a page from a file

**R52. The probe of a page opened from a file is code in the repository, in `probe/`: one source — `page.html` and `probe.js` — and the script `probe/build.ts`, which writes two files from it, `t29-probe-csp.html` with the candidate policy of the page's build and `t29-probe-open.html` without it. The test `probe/probe.test.ts` opens both by `file://` in the image's Chrome Headless Shell. Neither the package nor the release's paths carry the probe: it comes out as a pre-release with a tag that does not begin with `v`, one tag per run.**
- **What the probe checks** — what the page's build will meet on the device (T29): whether the scripts ran, `isSecureContext` and the protocol, whether there is `getCoalescedEvents`, the pointers by type — the number of events, the greatest pressure and the width of the touch, the number of intermediate events —, requests to `127.0.0.1:4` and `probe.invalid` through `fetch` and `<img>`, a `blob:` picture, `localStorage` by the file's name, and whether IndexedDB opens. The report is seen on the page and is saved as a file through `<a download>` with a blob — the way the page will save a sample.
- **The report** — only the fields of the list: numbers, flags, the browser's string, the file's name without folders and the probe's version. No paths, no messages of errors, no points of strokes: the report goes to the author in the chat and does not get into the repository. The name is cut after decoding, at the slash and the colon: an Android `content://` address hides the whole path in its last segment, `raw%3A%2Fstorage%2F…`. While the pointer moves, the report is written once a frame, so that the writing does not take time from the counting of events.
- **Blocked or failed.** A request that the policy stopped the page learns of by the event `securitypolicyviolation` with its address, and without the event the request failed in the network. An event that came later than the result corrects the result. Port 4 is not one of the ports that Chromium refuses by itself: on port 9 it answered `ERR_UNSAFE_PORT` even without the policy, and the probe would not tell the network from the browser.
- **The candidate policy** — `default-src 'none'; script-src` and `style-src` by hashes, `img-src blob:` (R23), `connect-src 'none'; base-uri 'none'; form-action 'none'`, by a `<meta>` element: a page from a file gets no headers of a response. The hashes are computed by `build.ts`. The code is ASCII without a carriage return: the parser drops it before the browser computes the hash; and the script has no `</script` and no `<!--`, which would close it earlier. Otherwise the build stops, and `<meta charset="utf-8">` stands first.
- **The test** — in the project `node`: Vitest in the browser serves pages by `http:`, and the probe needs `file:`. Under the policy each request beyond the file and its blob ends with the cause `csp`, and the events are two each for `connect-src` and `img-src`; without the policy the same requests fail with `ERR_CONNECTION_REFUSED` and `ERR_NAME_NOT_RESOLVED`. Also — the storage after a reload, the mouse pointer, the file's name from an Android address and the saved report with the fields of the list. A spoiled hash brings down six tests of eight, `connect-src *` two.

— *Why:* T29 in its planning on 2026-10-22 kept the probe outside the repository. In planning on 2026-11-08 I decided to keep it here, by the recommendation: there are no tablets, and the CI workflows of T74 and T78 take the same probe into the emulators. A probe outside the repository would vanish with its pre-release: `canvas` has immutable releases turned on, and the tag name of a deleted release can no longer be taken (RUN.md, T29, «Выяснилось при планировании (2026-11-08)»). Code in the repository comes with its tests (RULES.md, How we work).
- **One source and a script** — SonarCloud would count two files with almost the same code as duplicated lines, and hashes computed by hand would drift from the code silently.
- **`node probe/build.ts`, without a recipe** — the `justfile` is among the release's paths, and a recipe of the probe would release a new version of the package without a single change in it (the 2026-11-02 amendment to R08).

— *Rejected:*
- **the probe outside the repository** — the decision of 2026-10-22: T74 would write it anew, and the results of the two probes would compare poorly;
- **two files by hand** — duplicated lines, and hashes computed by hand;
- **a test in the project `browser`** — Vitest's frame comes by `http:`, not from a file, and the secure context, the storage and the policy are different there;
- **the probe inside the package or `demo/`** — the package carries nothing but `lib/` and NOTICE (R12), and `demo/` is a page for trying by hand, on Vite, by `http:`.

— *Revisit:* when T19 builds the samples page itself — its test will open the build itself from a file, and the probe is needed only for the devices that the test does not reach.

— *Consequence:*
- **T29** — the pre-release `t29-probe` from `node probe/build.ts build/probe`, a run in Chrome and Firefox on Linux;
- **T74** — the same probe, with a tag of its own, in the emulators; **T78** — the same scaffold for the page's build;
- **T19** — the candidate policy checked in Chromium from a file.

— RUN.md, T29, T74; [architecture.md](architecture.md), section 3.7; `probe/`, `biome.json`, `tsconfig.node.json`, `vitest.config.ts`, `.gitignore`.

## `spec` tag v0.9.9

**R53. `canvas` is on `spec` v0.9.9: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The tag carries the answers to В61 and В62, both by the recommendations of `canvas`, and `canvas`'s code has nothing to change.**
- **What the tag brings `canvas`** (`git -C spec diff v0.9.8 v0.9.9`, read 2026-11-08). Between the tags there is one entry of `spec`'s inbox triage, `main` fa5da0b, and what `canvas` gets with the tag is named by Д116 and Д117 in RUN.md of `spec`:
  - **В61** — the 2026-11-08 amendment to R94 spec and [the contracts text](../spec/contracts/README.md), section 12: snapping takes the strokes as they came, a sample's final geometry does not serve as its input, and eval chooses the margin and the threshold only by samples with a history. The protocol's package is the same. This is an amendment to R48;
  - **В62** — `canvas`'s part in Д79 of `spec` was done by T76 (R51), and `app` gets the element under its CSP with `@altnovatrail/canvas` 0.1.7, and format 0.3 from 0.2.0 (row 6.6 of COORDINATION.md of `spec`);
  - **a sheet without strokes** — the third 2026-11-08 amendment to R95 spec: such a sheet does not go to the model, and the runner's report measures it without slots. For an empty sheet `exportWork()` already gives `null`, and the synthetic samples v0.1.6 already carry one, `synthetic-110`: `canvas` has nothing to change;
  - **citations** — the 2026-11-08 amendment to R32 spec: the name of a NovaTrail repository after a number or a section is a suffix wherever a word boundary follows it. The documents check of `canvas` at this tag is green, without a single change (Д116);
  - the rest does not concern `canvas`: the port of `modules` from standalone (the 2026-11-08 amendment to R01 spec), `module-kit`'s warning about a number in a module's text and the format's example of traps (the 2026-11-08 amendments to R57 spec), the cards of `engine` and `.github`.
- **What is changed here:**
  - `spec/` — at v0.9.9, commit fa5da0b: `spec`'s latest release and its `main`. `gh release verify v0.9.9 -R altnovatrail/spec` accepted the release;
  - **the packages** — `@altnovatrail/spec` 0.9.9 in `dependencies` and `@altnovatrail/contracts` 0.9.9 in `devDependencies`, both by `npm install --save-exact`, without the pause of R12, as in R44, R45 and R47. `release-verify-npm` accepted both. The archives 0.9.8 and 0.9.9 differ only in the version in `package.json`: neither the types, nor the schemas, nor the vectors changed;
  - **the copies of the format in the tests** — the same: between the tags `format/` changed the format's README, §20, and the example of traps `traps/valid/olympiad-math.yaml`, which the tests do not copy (Д5);
  - **devcontainer** — `spec`'s template did not change between the tags: the Dockerfile and `devcontainer.json` are the same (R45);
  - RUN.md: T79 is done; table 3 — В61 and В62 are closed; Д5 is reconciled; the tag — in README.md, CLAUDE.md and at the start of RUN.md; [architecture.md](architecture.md) — the status.

— *Why now:* the author's instruction of 2026-11-08 «сначала перейди на spec последней версии», before the next task of E5. v0.9.9 is `spec`'s latest release on 2026-11-08 and its `main` (`gh release list -R altnovatrail/spec`), and it closes both open rows of table 3.

— *Rejected:* **staying on v0.9.8** until a task that needs the tag — the rows В61 and В62 would hang open, though the answer is already out, and RULES.md says to remove a row when `canvas` is on a tag with the answer.

— *Consequence:* an amendment to R48; the merge releases `canvas` — the next patch of the line 0.2, and the same version in npm: `package.json` and the lock file are among the release's paths (the 2026-11-02 amendment to R08).

— RUN.md, T79, tables 3 and 4; [architecture.md](architecture.md), the status; README.md; CLAUDE.md; `package.json`; `package-lock.json`.

## The emulators in CI

**R54. The probe of a page from a file on Android is run by an emulator on a GitHub runner — the job `android` of a workflow of its own, `.github/workflows/emulators.yml`, on `ubuntu-24.04`, by `workflow_dispatch` and on a pull request with changes to `probe/` or to the workflow itself. The workflow builds the probe's files itself and serves them from the runner by the server `probe/serve.ts` with the headers of a GitHub release, and Chrome in the emulator downloads and opens them, as a volunteer does. The driver `probe/android.ts` taps by the bounds of the nodes of `uiautomator dump` and reads the page's report by Chrome's DevTools, and the screenshots and the reports are the run's artifact.**
- **The emulator** — the action `reactivecircus/android-emulator-runner` v2.38.0 by SHA a421e43, Apache-2.0; the emulator's build is pinned by the input `emulator-build`, 16740729 — 37.2.13 of the stable channel; the image is `system-images;android-36;google_apis;x86_64`, the tablet `pixel_tablet` 2560 × 1600. The image `google_apis` is a debug one, `ro.debuggable=1`, and Chrome reads flags from `/data/local/tmp/chrome-command-line`; the Chrome in it is 133.0.6943.137.
- **The image's revision** is what `sdkmanager` installs: it gives no way to pin it. The run writes it into the artifact, `sdk-installed.txt`, — on 2026-11-08 revision 7, — and how this fits the rule of exact versions is asked by the row В63 of table 3 of RUN.md, «в реестр spec».
- **The server** serves the folder's files, and only them, with `Content-Type: application/octet-stream` and `Content-Disposition: attachment` — those that T29 read at a GitHub release. So the emulator's browser downloads them, and neither a pre-release nor the confirmations by rule 4 are needed.
- **The container and the tools.** The probe, the server and the driver run in a container of the `toolchain` stage, like the shared workflows of `.github`, on the runner's network; `adb` is given to the driver by the runner as a volume — the one that the action installed. The action runs each line of `script` by its own `sh -c`, so the run is one script, `probe/android.sh`.
- **The driver:** a warm-up of Chrome on an empty page, with answers to its first-run offers; the download of each file by a `VIEW` intent; the opening — the file's name in Chrome's list of downloads, and without it, "Open" in the message about the download, which does not name the file; if Chrome showed neither, the list through the menu. Each step looks for a page of the probe that it has not found yet, and the driver knows that Chrome is in focus by `mCurrentFocus` from `dumpsys window`; the report; "Write storage"; swipes by touch and, through `input stylus`, by pen — in the middle of the field, away from the edge of the screen, where a swipe is the "back" gesture; "Save report"; the second file; a restart of Chrome and the first file again. Drawing counts only if the page counted events, and any failed step brings down the run. The pure functions — the parsing of the dump with its entities, finding a node, the points of a tap and of a swipe, the window's focus — are held by `probe/android.test.ts`.
- **Licenses.** The emulator, the system image and `platform-tools` are under `android-sdk-license`, and Chrome in the image is on Google's terms. These are tools of CI on free terms: NovaTrail does not distribute them — the action installs them on the runner, they go into neither the image nor the release —, and it builds without them, like Chrome Headless Shell in R13 (R12 spec and the 2026-10-22 amendment to it). This is the named exception — here.

— *Why:* the author has no tablets, and the emulator answers the software part of the checklist of T29 (the 2026-11-02 amendment to R17; RUN.md, T74, «Решено автором (2026-11-08)»). The local server is the author's decision in planning T74, by the recommendation: a pre-release for each version of the probe would burn the tag's name forever (R52), and T78 needs a path without a release.

— *Rejected:*
- **a pre-release per run** — the tag names of immutable releases do not come back, and each change of the probe would wait for a confirmation;
- **`adb push` of the file into the downloads** — that way neither the download nor how Chrome opens it can be checked;
- **Playwright `_android`** — the driver would need the Playwright package, and one DevTools message `Runtime.evaluate` through `adb forward` reads the report anyway, by Node's built-in `WebSocket`, without a single dependency;
- **the image `google_apis_playstore`** — Chrome is in `google_apis` too, and that one is a debug image, `ro.debuggable=1` by the run, and Chrome reads flags from the file; whether the image with Play is a debug one the run did not check;
- **an emulator in the development container** — it has no `/dev/kvm`, and the container's template is `spec`'s (RUN.md, E5, «Решено автором (2026-11-08)»).

— *Revisit:*
- when `spec` answers В63 — pin the image's revision as it decides;
- when tablets appear — a step on hardware by the checklist of T22 (Д7);
- if the image's Chrome grows so old that it parts from the volunteers' tablets: in image 36 it is 133, and there is nothing to update it with in CI.

— *Consequence:* T80 — the iPad Simulator — stands on this workflow as a job of its own; T78 — the check of the page's build on every pull request — takes the same server and driver.

— RUN.md, T74, T80, table 3; [architecture.md](architecture.md), sections 2.4, 3.6, 3.7 and 4; `.github/workflows/emulators.yml`, `probe/serve.ts`, `probe/serve.test.ts`, `probe/android.ts`, `probe/android.test.ts`, `probe/android.sh`, `probe/probe.js`, `probe/page.html`.

— *Amendment 2026-11-08 (T80):* **beside the job `android` — the job `ipad` on two images, `xcode-27` with iPadOS 27 and `macos-26` with iPadOS 26.5, and the job `safari` on `macos-26`. On an iPad the driver `probe/ipad.ts` clicks on elements by WebDriverAgent — `appium/WebDriverAgent` v16.15.3, commit 02cb92f, BSD, built by the runner's Xcode —, and Safari on macOS downloads the files through `safaridriver` and opens them as Finder does, `open -a Safari`. Node on the macOS runners is `actions/setup-node` v7.1.0, commit 949feb2, with the version `NODE_VERSION` of the Dockerfile, 24.21.0: there is no Docker there.**
- **A click, not a tap by the bounds.** A tap in the middle of the bounds from the tree hit what was under the dialog: Safari's dialog about the download is in the tree earlier than on the screen. WebDriverAgent clicks an element found by an NSPredicate where it can be hit, and waits for that.
- **One session of WebDriverAgent.** A new session on `bundleId` launches the app anew, and a new launch of Safari breaks the download; the apps are switched by `/wda/apps/activate`.
- **The files in "On My iPad".** Pressing "Download" in Safari's dialog through WebDriverAgent does not put the file there: of eight downloads in four runs, one ended up in "Files". So the driver, having found the downloads not in place, puts the files into the folder "Downloads" of the local storage of "Files" itself — through the container of the group `group.com.apple.FileProvider.LocalStorage` from `simctl get_app_container` — and writes this into the findings. The main question — whether "Files" runs the page's script — stays the same for this: the file is the same, and the same Quick Look opens it.
- **Safari on macOS.** `safaridriver` does not open a `file://` page — it stays empty —, and AppleScript, the only way into Safari's window without WebDriver, asks the runner's user for a consent that nobody gives. So the job takes the screen by `screencapture`, and only the picture answers what Safari did with the page.
- **Licenses.** Xcode, Simulator, Safari and `safaridriver` are on Apple's terms, free ones: tools of CI, NovaTrail does not distribute them — they are on the runner's image — and builds without them. This is the named exception of R12 spec — here, as for the Android emulator. WebDriverAgent is BSD, OSI, and is shipped nowhere either.
- **The CodeQL finding #10** `js/http-to-file-access` in `probe/android.ts` was closed 2026-11-08 as "used in tests", by the author's decision «на своё усмотрение» (rule 12): the driver is a tool of CI, and the probe's report from the emulator, read by `JSON.parse`, it writes into files with constant names in the artifact's folder. Nothing of this ships.

— *Why:* T80, split from T74, — the iPad and, by the author's decision in its planning, Safari on macOS (RUN.md, T80, «Решено автором (2026-11-08)»).

— *Rejected:* **Appium** — it would add a tree of npm packages on the runner, and WebDriverAgent answers over HTTP by itself; **an XCUITest of its own** — an Xcode project written without Xcode at hand; **the files through `simctl` from the start** — that way neither the download nor the question it asks can be checked, and with the download both were checked where it landed.

— *Revisit:* if a way appears to press "Download" reliably in the simulator's Safari — remove the files that the driver puts in; if macOS on the runner lets Safari's window render or gives a consent to AppleScript — read Safari's report on macOS, as on the others.

— RUN.md, T80, table 3; [architecture.md](architecture.md), sections 2.4, 3.6, 3.7 and 4; `.github/workflows/emulators.yml`, `probe/ipad.ts`, `probe/ipad.test.ts`, `probe/ipad.sh`, `probe/simulator.ts`, `probe/simulator.test.ts`, `probe/safari.ts`, `probe/safari.test.ts`.

— *Amendment 2026-11-08 (rule 12, before T19):* the CodeQL findings #20 and #21 — `js/http-to-file-access` in `probe/ipad.ts` — the author closed as "used in tests", for the same reason as #10: the iPad driver is a tool of CI, and what WebDriverAgent shows on the screen and the probe's report it writes into files with constant names in the artifact's folder. Nothing of this ships.

— *Amendment 2026-11-09 (T78):* **the build of the samples page is opened on every pull request that changes it by the Android emulator and the iPad Simulator — the workflow `.github/workflows/page.yml`. Android — the same emulator and versions as the probe's, and the page from Chrome's download, by `content://`. iPad — iPadOS 26.5 on `macos-26`, Safari through the system's `safaridriver`, and the page from the runner's server, as from hosting: from a file it does not work on an iPad (В64). The drivers draw a stroke on the sheet and on a page of the workbook, save both samples and see that the page asked for nothing and did not break the policy; the sample files are read by `readSample`. The drivers' common parts are in `emulators/`, and the probe moves onto them. The required check is one, the summary job "Samples page".**
- **When it runs.** The workflow starts on every pull request, and the job `changes` decides by `git diff` whether anything that goes into the build or checks it is touched: `src/`, `page/`, `scripts/page.ts`, `scripts/csp.ts`, `tasks/`, `package.json`, the lock file, `.devcontainer/Dockerfile`, `emulators/` and the workflow itself. If not, the other jobs are skipped. GitHub counts a skipped job as a success, so the summary job "Samples page" stands on every pull request and can be required. One check is required, not each: for a job with a matrix skipped by `if` GitHub does not expand the name, and a check with the version's name would hang forever.
- **The build** — `node scripts/page.ts build/page 0.0.0` in the `toolchain` stage, as the release will build it (R55), and an artifact for the other jobs. There is no recipe: the `justfile` is a path of the release, and the recipe and `release-files` are T75.
- **The watcher** — `emulators/watch.ts`, the driver's script in the page: a listener of `securitypolicyviolation` with the directive and the address of each violation, listeners of errors with their text, and a copy of the text of each blob that the page gives to a link — taken when the page makes the blob: Safari did not let a blob be read back while it was downloading it itself ("NotReadableError"). It runs before the page's script. On Android DevTools sets it and reloads the page, recording the `Network` requests; the driver's script is not subject to the page's policy. In Safari no WebDriver lets a script be set before the page's script, and `ReportingObserver` does not give out the violations from before the watcher came — though WebKit's sources have its buffer (`Source/WebCore/Modules/reporting/ReportingObserver.cpp`): a red run with a request at the page's start on an iPad would have passed green. So Safari opens a copy of the build where the watcher is written in before the page's script, and its hash stands beside the script's hash in the policy (`watched()`); nothing else changes in the copy. The requests in Safari — by `performance.getEntriesByType("resource")`, and on both — by the server's log, where there must be only the GET of the page. The watcher's test opens the real build in Chrome Headless Shell — and a copy, with the watcher written in, of a build whose script asks for the network at start: the watcher sees its `connect-src`.
- **`safaridriver` and Simulator** — a session with `platformName: iOS`, `safari:useSimulator` and `safari:deviceUDID`, as Flutter (`packages/flutter_tools/lib/src/drive/web_driver_service.dart`) and browsertime call it; Apple's pages are silent about iOS (read 2026-11-08). The recipe that works on GitHub's runners is a new Simulator, the keys of remote automation in it and a reboot, Safari before `safaridriver`, and the image's Xcode: after `xcode-select` `safaridriver` loses Simulator.app (`Laticent/lattice`, `docs/scripts/ios-safari/run.sh`, commit 3687a60, read 2026-11-08). On iPadOS 26.5 it passed the first time.
- **Not iPadOS 27.** On the image `xcode-27` `safaridriver` does not create a session with Simulator — "Could not find any session hosts that match the requested capabilities", in two runs of two; the same recipe says that Xcode 27 replaced Simulator.app. By the author's decision iPadOS 27 is removed from the page's check until it is fixed, and the probe of T80 runs it, through WebDriverAgent.
- **Touch and click in Safari.** The stroke is WebDriver actions with a `touch` pointer, and where it gave no stroke — `mouse`: on the workbook's page a touch gave no stroke once in six runs, and the mouse did. A WebDriver click on the save button on iOS scrolled it into the window and tapped the sheet under it — a point of a stroke —, so the iPad driver saves by a `click()` of the button itself: what is checked is the page's path of saving, not where WebDriver lands. On Android — a tap on the screen by `input`, at the points that the save button gives, seen both in the page and in the `uiautomator` dump.
- **One path for both devices** — `emulators/volunteer.ts`: open the page with the watcher, wait until it has seen the page from its start, a stroke and the saving of the sheet, the workbook's page, a stroke and the saving, the result. A device gives only its own ways — how the page opens, how a stroke is drawn, how a button is pressed —, and each of them, when it fails, is a step of the device.
- **Whose failure.** A step of the driver is the device's or the page's (`emulators/run.ts`). A failure of the device — the emulator, the browser, the download, the session, a button that Chrome covered with its offer to translate the page — gives one more pass, a failure of the page brings down the run at once, and the job's result names whose it is.
- **The policy in the page itself.** The drivers read the `<meta>` of the page's policy and require `default-src 'none'` and `connect-src 'none'`. Under it any request of the page is a violation that the watcher sees. Without it the request goes out, and Safari does not count a failed request in `performance`, so on an iPad only this check would see it.
- **The server for the Android emulator** — on its own `localhost`: `adb reverse` leads the server's port to the runner. The host alias `10.0.2.2`, which the probe of T74 used, SonarCloud flagged as a hard-coded address (S1313), and the probe and the page now take the server in the same way.
- **The site icon.** Safari itself asks the server for `/favicon.ico`, and the policy stops it as a picture not from a blob: this is neither a request nor a violation of the page, and the drivers name it separately.
- **Checked red**, by two temporary commits:
  - the page asks for `https://probe.invalid/leak` at start under its policy — the run is red with "a failure of the page": both devices saw `connect-src` to this address. The first run showed that the watcher in Safari does not see this after loading — hence the copy with the watcher written in;
  - the builder does not set the policy — Android saw the request itself in DevTools, and the iPad the absence of the policy.
- **The sample files** are read by `emulators/saved.ts` in the `toolchain` stage: the author's measurement, an adult, a person, the page's version, `draft-0`, the task, the writing history, a sheet and a workbook with one writer code. `sample-check` — from T20: without the markup it does not accept a file. The strokes are drawn by the code, there is no handwriting in the run; the screenshots, the reports and the files are artifacts for seven days.
- **Licenses and versions** — the same as the probe's: the emulator, the image, Xcode, Simulator, Safari and `safaridriver` are the named exceptions above. New is `actions/download-artifact` v8.0.2 by SHA 9000827, MIT.

— *Why:* T78, by the author's decisions in its planning on 2026-11-08 — all by the recommendation: the iPad by http from the runner; `readSample`, and `sample-check` from T20; the workflow on every pull request with the job `changes`; and in the execution — removing iPadOS 27 until it is fixed (RUN.md, T78).

— *Rejected:*
- **the iPad from a file through WebDriverAgent** — the page does not run its script there (T80), and there would be nothing to check;
- **the watcher in Safari after loading, through `safaridriver`** — it does not see the violations of the page's first instant;
- **WebDriverAgent for iPadOS 27** — the page's scripts are not visible to it: no violations, no requests, no sample file — and ten more minutes of build in every run;
- **iPadOS 27 as a red job, not counted in the summary** — a red cross on every pull request and eleven minutes of macOS for nothing;
- **a filter of paths in `on:`** — the workflow would not start at all, and the required check would hang;
- **the check of each job required** — the name of a job with a matrix skipped by `if` is not expanded;
- **a cache of the Android image** — the Android job runs about six minutes without it too.

— *Revisit:* when `safaridriver` on the image with Xcode 27 finds a session in Simulator — bring back iPadOS 27; when T20 gives the markup — `sample-check` in the job `saved`; when В64 is answered — open the page on the iPad as the answer decides.

— RUN.md, T78, T20, T22; [architecture.md](architecture.md), section 3.7; `.github/workflows/page.yml`, `.github/workflows/emulators.yml`, `emulators/`.

— *Amendment 2026-11-09 (T83):* **the drivers wait for a sign until a deadline in seconds, not by a number of attempts; a WebDriver command waits 30 s for an answer, and a new session 120; Chrome on Android shows no hints over a page from a download; for Simulator the version of Xcode is written from Xcode's `version.plist`.**
- **Waiting by a deadline** — `until` in `emulators/wait.ts`: it tries the sign at least once and repeats until the deadline, however long each attempt takes. All the loops of `emulators/android.ts`, `emulators/page-android.ts` and `emulators/volunteer.ts` moved onto it, and with them the probe of T74, which takes the same functions. A loop "for 3 s" of `uiautomator` dumps of 2–3 s each and a second of pause ran 10 s — after each «Сохранить» on Android —, and the search for a button "for 10 s" waited about 50 before giving the pass to the second round (RUN.md, T83, «Выяснилось при планировании»). The deadlines are set by how long a step takes on a slow device, not by the number of the earlier attempts: the page's steps — the sample file and the markup form — wait 30 s, since on an iPad 27 s at times passed between the markup and the file, and their failure is a failure of the page, without a second pass; the opening of a download — 120 s, with Chrome's menu at the 45th and the 90th second. After «Сохранить» on Android the driver waits for the file itself in the downloads, up to 10 s, and answers Chrome's question if it asked one: the file comes in a second or two.
- **The WebDriver timeouts** — `timeoutOf` in `emulators/webdriver.ts`: `POST /session` — 120 s, the rest — 30 s instead of 90. In the first run of pull request #97 `POST /url` hung all of 90 s, and the other commands answer in a second or two. The opening of a page, `POST …/url`, waits 60 s: WebDriver answers it when the page has loaded. A command longer than 5 s writes a line `slow:` into the job's log, and through it into `phases.txt`; a timeout error names the command and how long it waited.
- **Chrome's hints.** In Chrome 133 the hints `IPH_CCTMinimized` and `IPH_CCTHistory` are on by default (`components/feature_engagement/public/feature_constants.cc` of Chromium, tag 133.0.6943.137, read 2026-11-09). The bubble "Minimize tab to return to it later" stood over the page from the download, `uiautomator` read only its window, and did not find the save button. The flag `--disable-features` in Chrome's file of flags turns them off. When there is no button, the driver writes the screen's words into the log. But even without the bubble the first pass did not find the button: Chrome's accessibility tree, which `uiautomator` reads, lagged behind the page's scrolling and showed its top. So each attempt scrolls the page a pixel up and back to the button: scrolling updates the tree.
- **The version of Xcode** — `CFBundleShortVersionString` and `ProductBuildVersion` from `version.plist` of the Xcode that `xcode-select` chose, in the same form as `xcodebuild -version`: that one ran 57 s for the sake of two lines of `versions.txt`.
- **The iPad's phases** — finer: the copy with the watcher, the server, `safaridriver --enable`, its launch and answer, each attempt at a session, and on a failure of the device — the closing and the launch of Safari.

— *Why:* T83, by the author's decisions in its planning on 2026-11-09 — all by the recommendation: by the phases of T82 the check of the page on a device takes about a minute, and the run 10–11 (RUN.md, T83).

— *Rejected:*
- **a cache of the Android emulator and system image** — `reactivecircus/android-emulator-runner` v2.38.0 always calls `sdkmanager --install` and downloads the emulator's zip by `curl` (`src/sdk-installer.ts`, lines 52–78), so a cache will not remove a break of dl.google.com, and the Android job is not on the longest path anyway;
- **booting Simulator in the background** — before it run only Node and the page's build, about 15 s;
- **shorter timeouts** — Safari's session in Simulator took 23 s at one time and about two minutes at another, and a failure by timeout gives a second pass anyway.

— *Revisit:* the iPad job takes 7–10 minutes even after this amendment: the queue of macOS runners and the spread of Simulator's boot and of Safari's launch — from 15 s to over two minutes —, and the driver's work about two (RUN.md, T83, «Сделано»). What to do with this is the author's decision, in the same place, «Открыто».

— *Amendment 2026-11-09 (T20):* **the iPad Simulator in `page.yml` runs on a push to `main` and by hand, and on a pull request only the Android emulator runs: so the author answered В66 in planning T20, by option (b). The driver computes the page's point on the Android screen from the bounds of the node of the page's own view, `android.webkit.WebView`, and the page's `devicePixelRatio`, and by the save button only if there is no such node. Both drivers go through the page's «Начало», R58.**
- **Why not the iPad on a pull request.** The iPad job after T83 took 7–10 minutes and waited about five more for a macOS runner, and its driver's work took about two. A pull request waits only for Android, and what only Safari sees is checked by the run on `main` — after the merge, but before the release; the devices are T22.
- **Why from the page's view.** On `main` the runs after T82 and T83 failed alike: the first pass of Android did not find the save button — the `uiautomator` tree showed the top of the page even after the repeated scrolling —, and in the recovery `am force-stop` went into "device offline", and there was no second pass. The node of the page's view is a node of Chrome itself, and its bounds are right even when the page's tree inside it lags behind. The press of the save button is at the same point, in the middle of its bounds in the page. The step writes into the log how the point was found, and on a failure a dump of the screen goes into the artifact.

— *Why:* В66 and the red `main` — by the author's decisions in planning T20 on 2026-11-09 (RUN.md, T20).

— *Rejected:* **the iPad on every pull request** — 12–15 minutes of waiting with the queue; **a larger macOS runner** — paid, rule 4.

— *Amendment 2026-11-09 (T85):* **`spec`'s answer to В63 is the 2026-11-08 amendment to R34 spec: a tool of CI that there is nothing to pin with is pinned as narrowly as its installer allows, and the run writes the exact version into the artifact (Д122 in RUN.md of `spec`). The revision of the Android system image is held by the run's record `sdk-installed.txt`, and `emulators/simulator.sh` also writes into the iPad's `versions.txt` the image of the macOS runner — `ImageOS` and `ImageVersion` — and the version of macOS beside Xcode and the simulator's runtime; so does the Safari probe of T80. В63 is closed.**

— *Amendment 2026-11-09 (T21):* **a failure of Safari in the iPad Simulator is no longer counted against the page. Before each stroke the driver asks the page for two frames (`PAINT`) and waits for the second up to 20 s (`PAINTED`): the element that the choice of a task gave is laid out only in a frame. No frame — the device's step "the page renders … before the stroke", and the run goes to a second pass. Likewise, if the page stopped answering the driver while it waits for the file, this is a step of the device, not "the file was not passed".**
- **Why.** After the merge of T21 the iPad run on `main` (42704340066) failed twice. The first time the choice already showed the workbook, the file named `workbook-01`, but Safari drew no frames for a few seconds — the screenshots still showed the sheet —, and the stroke did not find a laid-out element: "0 strokes", a step of the page, no second pass. The second time the page stopped answering `execute/sync`, and the wait for the file recorded this as the page's refusal. The runs by hand on the earlier code with three tasks and on T21 with a choice without groups both passed, and in both a failure of the device cut the first pass short: the simulator is unstable without T21 too, and the choice's groups do not look like the cause.
- **The check.** `emulators/volunteer.test.ts` — a device without frames and a device that is silent while the file is passed give the verdict `device`; `emulators/watch.test.ts` — both scripts in Chromium after a change of task; a run of `page.yml` by hand on the branch of the fix.

— *Amendment 2026-11-10 (T22):* **each device of `page.yml` goes through two builds, each by a run of its own with its own folder and artifact: the release — with the items of the checklist of T22 on the sheet and a file opened on a page opened anew, and the test build — with a child sample session. On Android the movements of T22 are Chrome's touches through DevTools, on the iPad the page's events (R65).**

## The samples page

**R55. The samples page is built by `node scripts/page.ts <folder> <version>` into one file `samples-page_v<version>.html`: Vite's JS API bundles `page/main.ts` with the element and the sample file's module `src/eval/` into one script, and the builder embeds it and the style of `page/index.html` into the page with a policy without network by their hashes — the same as that of the probe of T29 (`scripts/csp.ts`). The builder reads the tasks and the references to them from `tutor`'s file in `tasks/` and puts them into the bundle. The license notices of all the code the file carries are in the file itself, and a package with a license off the list stops the build. T75 puts the page into the release.**
- **The builder** — Vite 8.3.6 from the lock file: its JS API in library mode, `format: "iife"`, without writing to disk, `target: "es2022"` and `minify`. There are no new dependencies. Vite and Rolldown, with which it bundles, are MIT; `lightningcss` takes no part in the build: the bundle has no CSS — the element's styles are `adoptedStyleSheets` (R51) —, and the page's style is embedded as it is. So the "Revisit" of R14 does not fire.
- **One file.** `<meta charset="utf-8">` at the start, the policy in a `<meta>`: `default-src 'none'`, the script and the style by hashes, `img-src blob:`, `connect-src 'none'`, `base-uri 'none'`, `form-action 'none'`. Not a single address: no `src`, no `href`. The build refuses if the template or the bundle has a control character other than a tab and a line feed — the parser would change it before the hash —, if the bundle carries `</script` or `<!--`, and if the template does not have exactly one place for the policy, the script and the notices.
- **The tasks.** `openTasksOf` requires a synchronous SHA-256, which the page does not have, so the builder loads `src/eval/tasks.ts` through Vite's `ssrLoadModule`, checks `tutor`'s file against its sum (R49) and puts into the bundle the open views of three tasks — two sheets and a page of a workbook — with the sample's references to them. The full set of the measurement's tasks and their media is T21.
- **The notices** — a `<details>` block at the bottom of the page: the license of `canvas`, each package of the bundle — by the folders of its modules in Vite's output, one nested in another's `node_modules` too —, `@altnovatrail/contracts` (Apache-2.0), `@bufbuild/protobuf` (Apache-2.0 AND BSD-3-Clause), `perfect-freehand` and `rbush` (MIT), `quickselect` (ISC) — with the text of its license, and the NOTICE of the set Material Symbols (R46). A package's license must be in the builder's list, and its text in its folder or, if the npm package does not carry it, as a copy in `page/notices/` by name and version: so for `@bufbuild/protobuf` 2.16.0, whose text is taken from its repository at the tag v2.16.0 — LICENSE and the BSD-3-Clause header of `varint.ts`. A new version without its own text will stop the build. This is the check of what the build carries that the body of T19 waited for — in the builder and its test, not in `ci-licenses`.
- **The page now** — a choice of task, the element with it, the button «Сохранить образец (без разметки)»: a sample file of the author's measurement by the protocol, through `sampleOf` with the writing history, an ID from `crypto.getRandomValues`, a writer code — one per opening of the page, shown so that it gets written down —, the version of the texts `draft-0` and the page's version, and `<a download>` with a blob, as T29 and T74 checked. There is no markup in the file: the protocol requires it — `sample-check` answers "the markup has no truth" —, and the markup on the screen is made by T20. `readSample` reads the file.
- **The version of the texts** — `draft-0`, not `none`: the contracts text of `spec` leaves `none` to the files that the page did not write, and "the page MUST NOT name a set of texts `none`" (`spec/contracts/README.md`, "The sample file"). The text set is given by T20.
- **A change of task** with unsaved writing asks for confirmation: otherwise the strokes would vanish silently.
- **Where it works** — a computer (T29) and Android (T74); on an iPad — no: Quick Look does not run the script (T80; В64).

— *Why:* T19, by the author's decisions in its planning on 2026-11-08: Vite and a script of its own, by the recommendation; a sheet and a workbook with a real file, by the recommendation; into the release — in T75, by the recommendation; a file without markup until T20, by the recommendation, when `sample-check` did not accept it (RUN.md, T19).

— *Rejected:*
- **`vite-plugin-singlefile`** — a new dependency, and the policy's hashes would still have to be computed by ourselves;
- **a recipe in the `justfile` now** — the `justfile` is among the release's paths, and the merge would release a new version of the package with no page in it;
- **synthetic tasks, from fixtures** — the sample's reference to a task would not be real, and `sampleOf` requires it;
- **`openTasksOf` in the page** — the page has no synchronous hash, and an asynchronous one would change the module's API for the sake of one place;
- **the raw history instead of a sample file** — what was saved would not be a sample.

— *Revisit:* when T20 gives the markup — the file passes `sample-check`, and the test checks it; when T21 gives the set of the measurement's tasks and the media — the notices will name the media too; when В64 is answered — what to do on an iPad.

— *Consequence:* T20 — the steps and the markup on this page; T21 — the measurement's tasks and media in the same build; T75 — `release-files` calls the builder, and the release's paths take `page/`, `scripts/page.ts` and `scripts/csp.ts`; T78 — this build in the emulators.

— RUN.md, T19, T20, T21, T75; [architecture.md](architecture.md), sections 3.4, 3.6 and 3.7; `page/`, `scripts/page.ts`, `scripts/page.test.ts`, `scripts/csp.ts`, `probe/build.ts`, `biome.json`, `tsconfig.element.json`.

— *Amendment 2026-11-09 (T85):* **`spec`'s answer to В64 is the 2026-11-08 amendment to R25 spec: the first measurement is on computers and Android, and the page opened on an iPad says that it cannot be opened here (Д130 in RUN.md of `spec`). On an iPad "Files" shows the page without its script, so only the page's HTML itself can say this: the template has a paragraph `#no-script` — «Если на странице только этот текст, она здесь не работает…» —, and the page's script, where it runs, removes it first of all. The page does not move to hosting yet, and it will move as a separate site with its own origin (the second 2026-11-08 amendment to R25 spec; Д132). В64 is closed.**

— *Amendment 2026-11-09 (T21):* **the build puts in all the tasks of `tutor`'s file — 56, bank after bank, and in the choice there is a group per bank. A field outside the open view at any depth and a picture in the statement stop the build (R62).**

— *Amendment 2026-11-10 (T75):* **`release-files` puts the page into the release (R66). Two builds of one tree give the same bytes, the builder's test holds this, so the page's sum in `SHA256SUMS` can be repeated. Vite takes the options of TypeScript from the file's program through `tsconfig.json`: a change of an option in `tsconfig.element.json` changes the page's bytes, so it and `tsconfig.core.json` — the programs of what the bundle carries — stand among the release's paths, and `tsconfig.node.json` does not.** — RUN.md, T75.

— *Amendment 2026-11-10 (T96):* **the helpers of the notices — the list of licenses, the bundle's packages, the kept texts and the check `carried` — moved from `scripts/page.ts` to `scripts/notices.ts`: the generator's builder takes them too (R68). The page's bytes are the same as before the move.**

— *Amendment 2026-11-10 (T89):* **the builder takes the text sets too: `spec`'s release file `legal-1.tar.gz` from `tasks/spec-<tag>/`, by its sum, reads it by its own reader `scripts/legal.ts` and puts into the bundle the current set of each purpose, the notice in blocks, and, while the measurement has no set, the draft `draft-0`. The reader's packages — ajv, yaml and mdast — work only in the builder, and the bundle does not carry them: no license notices were added to the file (R69).**

— *Amendment 2026-11-12 (T110):* **the license text of `@bufbuild/protobuf` is `page/notices/bufbuild-protobuf-2.17.0.txt`, from its repository at the tag v2.17.0, commit 01a8c3b (sources 6.10): LICENSE and the BSD-3-Clause header of `varint.ts` are the same as at v2.16.0, and the copy of 2.16.0 is gone. The build with 2.17.0 without the copy stopped, as intended.** — R12, R77; RUN.md, T110.

## The markup of a sample on the page

**R56. The samples page marks up a sample after writing and saves it only when the markup is enough: a sheet — by the parts of the solution from the device's groups, which the writer merges, with the kind, the text, the flags, the first error and the final answer, as written; a workbook — by each box of the page. `page/markup.ts` builds the markup from the form by the eval protocol and names what it lacks, by the same rules by which `sample-check` holds the file. The page remembers nothing, and its screens are only in Russian: the texts that the script writes are in `page/texts.ts`, and the few constant words — a heading and two labels — are in the template `page/index.html`, where both a screen reader before the script and the check of SonarCloud see them.**
- **The order on the screen.** Writing, «Разметить», the form, «Сохранить образец». «Разметить» takes the element's work — `exportWork()`: the crop of the sheet with the groups or the crops of the filled boxes — and shows the crop that the model will see. A new stroke after that changes the groups, and the form goes away: the markup is asked for anew. «Кто писал» — in one's own handwriting or imitating a child's — is set for each sample, and «на листе нет ничего личного» is confirmed for each.
- **A sheet.** The parts at first — a group per part, by the labels A, B, … by place (R06). The writer merges a part with the next one, splits it into groups and rearranges the parts into the order in which the solution is read. A part has a kind, text or drawing; the text as written, or the drawing in words; «зачёркнута», «написана неразборчиво нарочно» and «итоговый ответ задачи». «Показать на листе» draws the group boxes of the part as marks of the element with the anchor `{ group }`. A group in which two parts mixed the writer erases and writes anew: there is no selection layer of its own.
- **The truth of a sheet** — of its one answer place, `anywhere` — is derived from the parts: without strokes — `UNREADABLE_BLANK`; without a final answer — `UNREADABLE_NO_FINAL_ANSWER`; two final answers or more — `UNREADABLE_SEVERAL_FINAL_ANSWERS`; one, written illegibly, — `UNREADABLE_ILLEGIBLE`; one with a mirrored digit — `UNREADABLE_AMBIGUOUS`; otherwise — the final answer as written, which the page offers as the part's text. The place's notes are «зеркальная цифра» and «зачёркнуто и написано заново».
- **A workbook** — each box of the page by place, in the task's order: an empty one — `UNREADABLE_BLANK`, a filled one — the value as written, «неразборчиво» or «можно прочесть по-разному», with the box's crop and a frame `{ cell }` on the page.
- **What is lacking** the page names before saving, and the save button is disabled until then: the text of a part, a final answer in a part not crossed out, the first error of a part not crossed out, the final answer, the value of a box; each group in exactly one part. So the page does not save a file that `sample-check` will reject.
- **The page's examples** — `examples/page-sheet-measurement.json` and `examples/page-workbook-measurement.json`: the test `page/markup.test.ts` writes them by a synthetic sheet and a synthetic page of a workbook, and `ci-licenses` holds them by the recipe `sample-check`, like the examples of R48. In the emulators the drivers mark up through the page's form, and the job `saved` runs `sample-check` on the saved files (the T78 amendment to R54).
- **The code** — in `page/`, not in `src/eval/`: `src/*.ts` is a path of the release, and the merge would release a version of the package with no page in it (R55).
- **The page is not translated:** `translate="no"` and `<meta name="google" content="notranslate">`. Automatic translation would distort the form's texts, and Chrome's offer to translate the Russian page in the Android emulator covered the save button and cost the run a second pass.
- **The emulators faster and without random failures** (the T78 amendment to R54 changes thus):
  - each device builds the page itself, and Android's files are checked by its own job — no job waits for the build, and only the iPad's files wait for a short check where the `buf` of the `toolchain` stage is;
  - the probe of T29, T74 and T80 runs on its own changes and by hand, not on every change of the drivers' common parts: its question is closed, and the common parts are checked by `page.yml`. Its job on WebDriverAgent ran up to 13.5 minutes and failed most often;
  - the warm-up of Chrome waits for Chrome on the screen, not for words, which an empty page does not have: the wait for words ate two minutes of each run;
  - the settings of Safari's automation are written into Simulator before its only boot, and Safari is launched before `safaridriver`: without this the sessions do not find Safari. Its own window beside the session's window took WebDriver's touches, and the strokes are drawn otherwise (below);
  - a stroke on the iPad is drawn by the pointer events of the page itself — `strokeBy()`, like a finger's touch: WebDriver's actions in Safari Simulator three times went into a window other than the session's or did not reach the page, and the mouse hung after them. The element takes such events as a finger — this is checked in Chrome Headless Shell; the native input of pen and palm is hardware (Д7).

— *Why:* without the markup `sample-check` does not accept the page's file — "the markup has no truth" —, and `tutor`'s runner has nothing to measure on it (R95 spec). How the markup looks on the screen was left to T20 by section 3.6, and T20 together with the steps is more than one check: by the author's decision in its planning on 2026-11-09 the markup is T81, first, and everything here is by the recommendations (RUN.md, T81).

— *Rejected:*
- **selecting strokes with a lasso** — more flexible, but it needs a selection layer of its own over the element;
- **a button «следующая часть» while writing** — the strokes that cross out the earlier part would get into the new one;
- **an unfinished sheet in the storage** — the storage of a page from a file cannot be trusted, and in Chromium any local HTML file will read it (T29, T74; section 3.6);
- **the screens in English too** — nobody will check these texts until a lawyer reads them;
- **essays now** — the build has none: the truth of an essay — its text or «пусто», «неразборчиво» — is given by T21 together with the measurement's tasks, and the criteria's marks are set by the organizer, not by the page.

— *Revisit:* when T21 brings essays — their form; when the markup of parts from groups is not enough for the volunteers — the selection of strokes.

— *Consequence:* T20 — the page's steps around this markup; T22 — its check on devices; T21 — essays.

— RUN.md, T81, T20, T21; [architecture.md](architecture.md), sections 3.5, 3.6 and 3.7; `page/markup.ts`, `page/markup.test.ts`, `page/texts.ts`, `page/main.ts`, `page/index.html`, `scripts/page.test.ts`, `examples/`, `emulators/volunteer.ts`, `emulators/watch.ts`, `.github/workflows/page.yml`, `vitest.config.ts`.

— *Amendment 2026-11-09 (T21):* the first item of "Revisit" is carried out. **An essay is marked up by its text, as written, or «не прочесть целиком», and a sheet without strokes as empty. It has no parts and no marks, and the page sets no criteria's marks: `marks` are empty, the organizer adds them (R62).**

## The cache of the `toolchain` image in the emulators' CI

**R57. The jobs of the emulators' workflows that run in a container of the `toolchain` stage — `android` and `ipad-check` in `page.yml`, `android` in `emulators.yml` — take its image from the cache of GitHub Actions: `emulators/toolchain.sh` loads it from a `docker save` file, and without the file builds the image from `.devcontainer/Dockerfile` and saves the file. `actions/cache` puts the file into the cache and takes it out by a key of the runner's OS and architecture and the Dockerfile's sha256. The cache of `main`, which every pull request reads, is filled by the run of `page.yml` on a push to `main` by the paths of the job `changes`. The scripts of the iPad Simulator write the start time of each phase.**
- **The key and the rule of exact versions.** The Dockerfile pins everything it installs: the image by tag and digest, the archives by sha256, the apt packages by the ID of a snapshot of the Ubuntu archive (R34 spec, R40 spec). So the image from the cache is the one that this Dockerfile would build, and the key is its content, `toolchain-<OS>-<architecture>-<sha256>`. A change of the Dockerfile gives a new key, and the image is built anew whole; Dependabot raises the base image rarely, once a week at the most often. The key takes the whole Dockerfile, the stage `devcontainer` too: a change of it will build the same image anew, and a key by one stage would require a step of its own that cuts it out.
- **Without the network.** On a hit the Dockerfile is not executed: nodejs.org, the snapshot of the Ubuntu archive and Playwright's image are not needed. On 2026-11-09 nodejs.org twice answered 504, and the Android job failed (RUN.md, T81, «Сделано»).
- **The saving** — by the step `actions/cache/save` right after the build, not at the end of the job: the built image is good even if the emulator fails later, and such a run will fill the cache too. The step runs only on a miss, and takes the key from the output `cache-primary-key` of the restore step. The script deletes a file that did not load and builds the image itself: a spoiled entry in the cache brings down not the run but only its speed. The loaded file is deleted at once, and the saved one by the next step: the emulator needs disk.
- **The cache's scopes.** A cache saved in a pull request is seen only by that pull request, and the cache of `main` by all pull requests. Into the scope of `main` only the jobs that run on `main` write — code merged into `main`, and actions pinned by SHA: a pull request, someone else's from a fork too, will not substitute the cache of `main`. The image from the cache is checked against nothing — the build is not reproducible byte for byte —, so the entry of `main` is held by the same as all the code on `main`: review and pinned actions. GitHub erases a cache after a week without access, and then the first pull request will build the image, as before this decision.
- **The warm-up** — `on.push` of `page.yml` on `main` with the paths of the job `changes`, the same list in the syntax of a filter; a comment at each of the two lists says to change them together. On a push the job `changes` answers "check", and the run is full: along the way the emulators check `main` itself after the merge. For a public repository the runners are free.
- **The steps — right in the workflow**, three times, not as a composite action of its own: Dependabot `github-actions` with `directory: /` looks at `.github/workflows`, and an action in another folder would require a change of `dependabot.yml`.
- **The iPad's phases.** `emulators/simulator.sh` and `emulators/page-ipad.sh` write the start time of each phase — the choice of the device and the runtime, the creation of Simulator, the boot, the wait for its end, the launch of Safari, the server and `safaridriver`, the driver — into the job's log and into `phases.txt` of the artifact, and after them each line of the driver with its time: the attempts at a session and the steps. In the first run with them (pull request #97) the wait for the end of the boot took 1 min 42 s, `xcodebuild -version` for `versions.txt` 57 s, Safari, the server, `safaridriver` and the session 65 s, and the pass that failed by a device timeout, with a new session, 4 min 4 s more (RUN.md, T82, «Сделано»). In the previous run the iPad job waited 6 min 51 s of 9 min 13 s for the first session of `safaridriver`, and where these minutes went the log did not show.
- **The license.** `actions/cache` v6.1.0, commit 55cc834, is MIT: an action of CI, it ships nowhere.

— *Why:* T82, by the author's decisions in its planning on 2026-11-09 — all by the recommendation. The measurement of the run "Samples page" of pull request #96 showed: the longest path is the iPad job, 9 min 13 s, and after it `ipad-check`, 1 min 33 s, of which the image was being built 77 s; the Android job 5 min 39 s, of them the image 80 s (RUN.md, T82, «Выяснилось при планировании»).

— *Rejected:*
- **a cache of the AVD with a quick-boot snapshot** — the Android job runs in parallel with the iPad's and is 3.5 minutes shorter, so it will not shorten the run, and a spoiled snapshot would hang the emulator's boot;
- **the caches of `npm`** — `npm ci` with the page's build takes 5–6 s on both Linux and macOS;
- **a cache of the WebDriverAgent build** — the build takes about three minutes, but only in the probe of T80, and the probe after T81 runs on its own changes and by hand. A spoiled build in the cache would bring it down;
- **buildx with the cache `type=gha`** — `docker/setup-buildx-action` and `docker/build-push-action`, Apache-2.0, cache the layers one by one, and a change of the Dockerfile would rebuild only the tail. But these are two actions instead of one, and the image is still exported into Docker by a load;
- **a light warm-up job of its own** — only the image and its saving on a push to `main` with a change of the Dockerfile: cheaper than a full run, but one more branch of conditions in the workflow, and the emulators would then not check `main` after the merge. A full run accesses the cache along the way and keeps it from the weekly erasure;
- **a change of the shared workflows of `.github`**, which build the image for the TypeScript checks in the same way — another repository is not changed from here (RULES.md, Across repositories). This is the row В65 of table 3, «в реестр spec».

— *Revisit:* when the iPad's phases show where the minutes before the session go — speed them up by a task of its own; when В65 is answered — the cache of the shared workflows; if the Android job becomes the longest path — the AVD cache; if the download of the emulator and of the system image from dl.google.com brings down runs — their cache by a pinned build: on 2026-11-09 a break of this download already brought down one job (RUN.md, T82, «Открыто»).

— RUN.md, T82, table 3; R54 and its amendments, R56; [architecture.md](architecture.md), section 3.7; `.github/workflows/page.yml`, `.github/workflows/emulators.yml`, `emulators/toolchain.sh`, `emulators/simulator.sh`, `emulators/page-ipad.sh`.

— *Amendment 2026-11-09 (T85):* **the answer of `spec` to В65 is the 2026-11-09 amendment to R31 spec: the shared workflows of `.github` and the `toolchain.sh` of `spec` take the cache of the `toolchain` stage's image by the sha256 of the Dockerfile (Д146 in the RUN.md of `spec`). There is nothing yet to compare the copy in `emulators/toolchain.sh` with: T104 of `spec`, which gives `toolchain.sh` the cache, did not go into v0.12.0. The comparison comes with the move to a tag that has it. В65 is closed.**

— *Amendment 2026-11-10 (T88):* **the comparison with the `toolchain.sh` of `spec` v0.13.0 (T104 in the RUN.md of `spec`; Д146 there too): `emulators/toolchain.sh` took its behavior, with its own path `build/toolchain.tar` and image name `toolchain`. After `docker load` the script checks `docker image inspect toolchain`; a file that did not load or gave another image is deleted, and the stage is built with a GitHub warning and writes no file — the cache entry already exists, and a save would not replace it; a failed `docker save` is a warning with no file, and the script succeeds: the image is there. The script stays its own: the `toolchain.sh` of `spec` has the image `novatrail-toolchain` and the path from the variable `TOOLCHAIN_IMAGE_FILE`, while the emulators' jobs call it `toolchain`. The shared workflows of `.github` v0.1.22 take the same cache in `typescript.yml` and `documents.yml` (R67).**

## An adult's steps on the samples page

**R58. Before writing, the samples page takes an adult through «Начало»: the purpose — a measurement or a module's eval set —, the writer code for a measurement, the notice of the purpose with the version of the text set, and the declarations without which one cannot go on. Which purposes are open is decided by the status of the text set the build carries: the draft `draft-0` by default, or the set that the builder's flag `--texts` named. The builder puts the test "approved" set only into a page of version `0.0.0`. What was started holds until the page is opened anew, and the page keeps it nowhere. The child sample session is T84.**
- **Text sets** — `page/sets/`: `draft-0.json` and `test-approved-0.json`. A set has a version, a status — `draft` or `approved` — and texts:
  - the declaration of age;
  - for each purpose — the notice in paragraphs, the second declaration and "where to hand over the file".

  `page/sets.ts` holds the format. The builder checks a set by the same rules, and the version is one the sample file allows: 1–32 Latin letters, digits, dots and hyphens, but not `none`. An approved set has the eval set's texts, and the draft has none.
- **Purposes** — by the table of section 3.6 and by the build's tasks, `page/steps.ts`:
  - with the draft, the measurement is open only for the author's samples — as is said beside it —, and the eval set is closed, with the reason: a pull request publishes the sample at once;
  - with an approved set, the measurement is open, and the eval set only if the build has modules' tasks: a module's eval set takes samples only of its own module's tasks, with the source `modules` (the contracts text of `spec`, "Eval sets"), and a sample of a `tutor` task would be rejected there. The build has only `tutor` tasks so far, so even with an approved set the eval set is closed, with this reason. Having chosen the eval set, a person sees only modules' tasks in the choice of task.
- **Declarations** — «мне 18 лет или больше» and a second one: with the draft, «я автор проекта и пишу свои образцы», with an approved set, one about the consent form of its version. Choosing another purpose asks them anew.
- **Writer code** — for a measurement only: «ввести свой код» or «новый писавший». The page accepts an entered code regardless of case and spaces if it is of 6–16 digits and capital Latin letters. A new one it shows and asks to be written down. The eval set has no code: its sample is published, and a code would link the samples.
- **«Начать»** is disabled while something is missing, and the page names what. After it, «Начало» folds into a line — the purpose, the code, the version of the set —, and they can be changed only by opening the page anew, with a question if what was written is not saved. The page touches no browser storage: after a reload it remembers neither the purpose, nor the code, nor the declarations, and the storages are empty — so the page's test checks.
- **After saving**, the page says where to hand over the file: a measurement sample to the organizer, and an eval-set sample by a pull request to `modules`.
- **The test set.** The builder takes `--texts <file>`. A set whose version begins with `test-` it puts only into a page of version `0.0.0`: `canvas` never has such a release (the contracts text of `spec`, "The sample file"), so the release of T75 will not carry the test set. The page's test builds both builds: with the test set the measurement asks for the declaration about the form, and the eval set is closed — the build has no modules' tasks.
- **The texts** of the sets are drafts until the lawyer (epic E4 in the RUN.md of `spec`); the author proofreads them after the merge. The screen's texts are in `page/texts.ts`, and the fixed words of «Начала» are in the template.

— *Why:* T20, by the author's decisions at its planning on 2026-11-09: split by rule 11 — the adult here, the child in T84; the test set by a flag of the builder; both as recommended (RUN.md, T20).

— *Rejected:*
- **a second entry point of the page with the test set** — two builds would drift apart more easily, and a flag with a refusal outside `0.0.0` holds the same with one;
- **changing the purpose or the code in the middle of writing** — the samples of one opening would mix purposes; opening the page anew is cheaper and more honest;
- **a code in the header for the whole opening**, as it was since T19, — anyone at a shared tablet would see it, and R11 has one enter one's own code or ask for a new one.

— *Revisit:* when the lawyer has read the texts — an approved set instead of the draft; when T84 gives the child's session — its texts in the same sets; when modules' tasks come into the build — test the eval set's path end to end, as the measurement's is.

— RUN.md, T20, T84; [architecture.md](architecture.md), sections 3.6 and 3.7; `page/sets.ts`, `page/sets/`, `page/steps.ts`, `page/steps.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.ts`, `scripts/page.test.ts`.

— *Amendment 2026-11-09 (T84):* **the texts of the child sample session are in the same sets, as their part `child`, and the eval set's texts in an approved set are now optional, as are the session's: the lawyer reads the adults' consent (П-16) and the consent to a child's samples (П-10) separately, and a set approved for one may come before the other. A purpose without its texts is closed and named with the reason. The draft has neither. The "Revisit" about T84 is done — R59.**

— *Amendment 2026-11-09 (T85):* **"Revisit" — "when the lawyer has read the texts" — reads as "when the author approves the texts of epic E4 of `spec`" (R112 spec; the T85 amendment to R11).**

— *Amendment 2026-11-10 (T87):* **under «Началом», a section of its own, «Открыть образец»: it opens a sample file for viewing, with no purpose, code or declarations, and goes away together with «Началом» once writing has begun (R64).**

— *Amendment 2026-11-10 (T89):* **each purpose has its own set from a release file of `spec` (R69), and a set of the page no longer has the status `draft` or `approved`: a purpose is open with its current set, and the measurement, while it has none, by the author's draft. `page/sets/` holds only this draft, `draft-0`, and the test "approved" set `test-approved-0` was replaced by the test part `page/sets/test/` in the layout of `legal`, with the sets `test-measure`, `test-eval-set` and `test-child-sample` in force. The flag `--texts` names the part's folder and takes it only into a page of version 0.0.0. The declarations and "where to hand over the file" are words of `page/texts.ts`. After saving, an eval-set sample goes to the organizer by an upload link, and the organizer adds it to `modules` (R126 spec), not a pull request of the writer.**

— *Amendment 2026-11-11 (T101):* **the build carries modules' tasks (R71), so the eval set has one reason left to be closed — the set `eval-set` with no version in force. The choice of task after «Начать» picks tasks by purpose: for the eval set only modules' tasks, for the measurement and the child sample session only the tasks of the file of `tutor`. A module's group of tasks is named «Модуль <ID> <версия>», and an instance of a template is named with its seed: «Лист: <ID>, зерно N». The sample file of any purpose is named `<id>.json`, not `sample-<id>.json`: that is how it lies in a module's `eval/` (R04 modules), and the organizer renames nothing.** — RUN.md, T101; R71; `page/main.ts`, `page/texts.ts`, `scripts/page.test.ts`, `emulators/page-android.ts`.

## The child sample session on the page

**R59. The page runs the child sample session from the same «Начала»: as the last choice, a group of its own below the adult's purposes. It is open only if the build's text set is approved and carries the session's texts. The adult enters the child's code — the one written into the accepted form —, and a new code the page gives only for the form and starts no session with it. In the session the child writes and the adult does the markup; the file is a measurement, `WRITER_CHILD`, the final geometry and the code. Before saving, the page asks to check on an iPad that Safari's downloads land «На iPad», not in iCloud Drive. The test build for T22 is built by the job `android` of the workflow `page.yml` and kept as an artifact.**
- **Where on the screen.** Section 3.6 has the session given "as a separate button, below". It is a radio button of the same group `purpose`, but in a nested group «Сеанс образца ребёнка», the last inside the choice of purpose, with the reason for closing beside it. A separate neighboring group with the same name would confuse the arrows, Tab and the count «3 из 3» of a screen reader. `page/steps.ts` holds the logic: `purposes()` gives a third entry, `child`.
- **The code.** The code step is shared with the measurement, but with its own words: «Код ребёнка», «ввести код из формы согласия», «новый код для формы — без ребёнка». The page shows a new code with the version of the text set — the form names it — and does not enable «Начать»: the session begins with the code of a form the organizer has already accepted (R11). On a switch between the measurement and the session the code step is cleared, and the adult's and the child's new codes differ: they are the codes of two people. The session, like the measurement, always has a code (`hasCode`).
- **Declarations** — «мне 18 лет или больше» and «отдельная письменная форма родителя или опекуна этого ребёнка версии … с кодом, введённым выше, подписана и принята организатором» (П-10). The code is not put into the declaration's text: the declarations are redrawn on a change of purpose, not of code.
- **Writing and markup.** «Кто писал» is not asked in the session — the child writes —, and the page says: «Пишет ребёнок. Размечаете вы — со слов ребёнка, после письма». The protocol defines a writing part's flag `illegible` as "written illegibly on purpose" (the contracts text of `spec`, "The markup"), and whether on purpose only the writer knows. Without the flag the adult could not mark a part of the child's that cannot be read, and the sheet's truth would be wrong: `UNREADABLE_ILLEGIBLE` is derived from the flag of a part with a result. So in the session the flag is there, with the label «написана неразборчиво — не прочесть и со слов ребёнка». What the flag means for a child sample `spec` will decide — row В68 of table 3 of RUN.md.
- **The file** — a measurement, `WRITER_CHILD`, the final geometry with no time and pressure, the child's code, no license (the contracts text of `spec`, "The sample file"); `sampleOf` writes it, as before. "Where to hand over the file" comes from the session's texts: to the organizer, with no pull request, and delete it from the device.
- **iPad and iCloud (В30; the 2026-10-22 addition to П-10).** The page does not see Safari's setting, and the adult who runs the session checks it: "Choose where to save downloads… Go to the Settings app on your iPad. Tap Apps, then tap Safari. Tap Downloads, then choose… On My iPad: Select this option to save downloads to the Downloads folder on your iPad" ([Customize your Safari settings on iPad](https://support.apple.com/guide/ipad/customize-your-safari-settings-ipad54f3cde6/27/ipados/27), the iPadOS 27 guide, read 2026-11-09). The guide's Russian page did not show this paragraph, so the page names the menu items both in Russian and in English. The phrase is in `page/texts.ts` and only in the session. Whether it is enough for П-10 the lawyer decides in epic E4 of the RUN.md of `spec`. Which option of П-10 was taken `spec` will learn by row В67 of table 3 of RUN.md.
- **The test build for T22** — `node scripts/page.ts build/page-test 0.0.0 --texts page/sets/test-approved-0.json` in the job `android` of the workflow `page.yml`, as a step of its own after the checks of the release build, so that a failure of the test build does not skip them, and the artifact `samples-page-test` for 7 days. The file in it is named as the release build is, `samples-page_v0.0.0.html`, and the artifact's name tells them apart. The emulators do not open it yet: T22 runs both builds by its own checklist.
- **Who sees it.** Anyone signed in to GitHub can download an artifact of a public repository — for 7 days, from the run's page, not from the releases page. The barrier is not the build's secrecy but that its samples will reach no one: the texts say «тестовый набор, не для образцов», every file carries the version `test-approved-0` and the page version `0.0.0`, which no release has, and the intake of files checks both (R11; R58).

— *Why:* T84, by the author's decisions at its planning on 2026-11-09, all as recommended: the build as an artifact of CI; the session in the emulators in T22; the phrase about the iPad in the child's session (RUN.md, T84). The place on the screen, the code only from the form and the session's optional texts follow from R11 and section 3.6; a separate agent checked the design before the work.

— *Rejected:*
- **a pre-release of `canvas` with the test build**, as `t29-probe` was, — an action outside the repository by rule 4, which moreover would have to be put up and deleted by hand for every run of T22, and on the releases page, beside the real builds, it is easier to take for one of them. It differs from an artifact not in who can download it, but in where the build stands and how long it lives;
- **the child's session in the emulators already here** — one more opening of the page from a download, about a minute to a minute and a half on every pull request, and T22 runs both builds anyway;
- **a session with a new code in the same opening** — the organizer has not yet accepted a form with this code, and R11 puts the form before the session;
- **the phrase about the iPad in every purpose** and **no phrase while the iPad has no hosting (В64)** — the author chose the child's session: there the file is a child's data;
- **a separate radio group beside the purposes** — the same group in two neighboring sets confuses the keyboard and the screen reader.

— *Revisit:* when the lawyer has read the texts — the session's texts in an approved set and whether the phrase about the iPad is enough (П-10); when the iPad has hosting (Т-17; В64) — where the phrase stands; when T22 opens the test build in the emulators — `emulators/saved.ts` expects `Writer.ADULT` and the writing history, and it has to read the child's files in its own way.

— RUN.md, T84, T22; [architecture.md](architecture.md), sections 3.6 and 3.7; `page/sets.ts`, `page/sets/test-approved-0.json`, `page/steps.ts`, `page/steps.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.test.ts`, `.github/workflows/page.yml`.

— *Amendment 2026-11-09 (T85):* **"Revisit" — "when the lawyer has read the texts" and "whether the phrase about the iPad is enough (П-10)" — the author decides by Claude's analysis (R112 spec; the T85 amendment to R11).**

— *Amendment 2026-11-10 (T22):* **the emulators now open the test build: both jobs of `page.yml` go through the child sample session on it in a run of its own, after the release build, and `emulators/saved.ts` reads the child's files — `WRITER_CHILD`, the final geometry, the set `test-approved-0` and the entered code. The build is built before the emulator, `emulators/builds.sh`, and is still kept as an artifact (R65).** What was rejected here, "the child's session in the emulators already here", T22 took: its cost is about a minute per device.

— *Amendment 2026-11-10 (T88):* **the answers of `spec` (R125 spec; Д151 in the RUN.md of `spec`; the 2026-11-09 addition to П-10). After saving in the child's session, the page says that the file goes to the organizer by the upload link the organizer gave for the session, which is valid for a day, and once the organizer has received it, the adult erases the file from the device: so says `child.handOver` of the test set. The phrase about the iPad before saving is enough if the notice and the form speak of Apple's cloud and of erasing the file (В67). The flag `illegible` on a child sample means «не прочесть и со слов ребёнка» — the 2026-11-09 amendment to R95 spec, as `canvas` recommended (В68) —, and the page's label is the same. T89 takes the session's texts from `legal-1.tar.gz` (R67).**

— *Amendment 2026-11-10 (T89):* **the child sample session is open with the current set `child-sample` of the part `legal` (R69): the notice is `child-sample-notice`, and the version in the file and in the declaration about the form is `child-sample-<n>`. The test build is built by `node scripts/page.ts build/page-test 0.0.0 --texts page/sets/test`, its session samples name `test-child-sample-1`, and `emulators/saved.ts` expects this version.**

## `spec` tag v0.12.0 and format 0.4

**R60. `canvas` is on `spec` v0.12.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, and the shared workflows of `.github` at v0.1.21. The element reads module format 0.4 and only it, the workbook's layout follows the page and the vectors of `spec`, and a worked example goes onto the workbook too (R61). The page's build and the synthetic samples accept the tasks file of `tutor`, the temporary source of Д4, with format 0.3 too, as a named exception. What the tags v0.9.10–v0.12.0 require of `canvas` beyond the format is taken, and the two tasks of Д128 are T86 and T87 in the plan.**
- **The submodule and the packages.** `spec/` is v0.12.0, commit 5b4640a, the latest release of `spec`; `gh release verify` accepted it. `@altnovatrail/spec` and `@altnovatrail/contracts` are 0.12.0, at exact versions, and `ci-licenses` checks their signatures (R44). The types of 0.12.0 build with the code without edits: the fields of 0.4 are optional, none is removed or renamed, and `types/canvas` did not change. The devcontainer template of the kind `typescript` and RULES.md did not change between the tags.
- **`.github` v0.1.21** instead of v0.1.15, by the author's decision, — for the npm step that waits for the registry 20 minutes, not 5 (Д91 in the RUN.md of `spec`); `gh release verify` accepted the release. `documents.yml` now builds the image by the `toolchain.sh` of `spec`, and it is in `spec/`.
- **Format 0.4 in the element** (Д121, Д135 in the RUN.md of `spec`; row 5.8 of its COORDINATION.md):
  - `FORMAT` is `"0.4"`: while the format is v0, the platform reads only its current version, "the platform reads only the current version", and a 0.3 manifest is a `TypeError` (the format text of `spec`, §2);
  - the workbook's layout follows `format/page.yaml` and the test vectors of `format/vectors/pages/`, which the package `@altnovatrail/spec` carries as JSON (§§9 and 14): the element's layout gives all 19 vectors, the refusals on the same item, and the numbers and the table of widths match `page.json`. The tests hold it to them, and `vectors/pages.json` is no longer written (the T85 amendment to R35);
  - the worked example on a workbook — R61;
  - the format puts a numbered list (`numbered_list`) only into a lesson's `explanation` (§21), and `app` draws the explanations: the element shows a task and a worked example, but not an explanation. That Д121 names it a part of `canvas`, `spec` will learn by row В69 of table 3 of RUN.md;
  - the copies of the format's examples and vectors in the tests are of the tag v0.12.0: a manifest of version `"0.4"`; for a task, a closed `leading_question` and the new examples `minutes-past-the-hour`, `who-is-shorter` and four invalid ones with an error in a closed `check`; for a lesson, an example on a workbook, its vectors and the rules `lesson.example-fills` and `lesson.workbook-page`.
- **The tasks file of `tutor`** — even v0.1.21 — is of format 0.3. `openTasksOf` accepts it with 0.4 and 0.3, `TUTOR_FORMATS`: by §2, a 0.3 module moved to 0.4 keeps its open view, and 0.4 removed no fields. This is an exception for the source of Д4, not a window of the element's versions; it goes when `tutor` releases a 0.4 file or the build moves to `modules` (Д4). `spec` will learn of it by row В70 of table 3 of RUN.md.
- **What the tags require beyond the format:**
  - В63 — the T85 amendment to R54 (Д122): the image of the macOS runner goes into the iPad's `versions.txt`;
  - В64 — the T85 amendment to R55 (Д130, Д132): a paragraph for an iPad where the page's script does not run;
  - В65 — the T85 amendment to R57 (Д146): the comparison of `emulators/toolchain.sh` comes with the tag in which T104 of `spec` comes out;
  - R112 spec — the T85 amendment to R11: there is no lawyer, the author decides by Claude's analysis; RUN.md and [architecture.md](architecture.md) are edited where "lawyer" read as a rule in force, and the log's entries and the archives are not;
  - Д128 — two tasks in E5 after T21, by the author's decision: T86, the synthetic samples on a module's package with the source `modules` and the tag of the newest release, and T87, the samples page's mode "open a file" (R110 spec).
- **The release.** The line is 0.3 (the T85 amendment to R08): the merge releases 0.3.0 and the same version to npm.

— *Why:* the author's instruction of 2026-11-09, «сначала перейди на последнюю версию spec», and the author's decisions at the planning of T85 (RUN.md, T85): one task, with format 0.4, not as recommended; Д128 after T21, `.github` here too, and the exception for the file of `tutor`, as recommended.

— *Rejected:*
- **a window of versions 0.3 and 0.4 in the element** — against §2 of the format, and the 0.4 manifest of `modules` is read anyway;
- **waiting for a 0.4 file from `tutor`** — format 0.4 in the element would wait for another repository's release, and the open view of 0.3 and 0.4 is the same;
- **numbers of the layout of our own beside the numbers of `spec`** — two sources of one rule; the element's numbers stay in the code, and a test holds them equal to `page.json`;
- **deleting `vectors/pages.json`** — R35 and the archive of E6 refer to it, and they are not rewritten;
- **format 0.4 as a separate task after the move** — the executor recommended so, and the author decided on one.

— *Revisit:* when `tutor` releases a tasks file of format 0.4 — remove the exception `TUTOR_FORMATS`; when T104 of `spec` comes out — compare `emulators/toolchain.sh` with `toolchain.sh` (Д146); when E4 of `spec` releases the texts of the notice and of the consent — the page's text set on them (the T85 amendment to R11).

— RUN.md, T85, T86, T87, table 3; [architecture.md](architecture.md), the status and sections 3.3, 3.6, 3.7 and 3.8; README.md, CLAUDE.md; `src/core/manifest.ts`, `src/core/page.ts`, `src/core/example.ts`, `src/eval/tasks.ts`, `src/element/index.ts`, `src/element/parts.ts`, `page/index.html`, `page/main.ts`, `emulators/simulator.sh`, `.github/workflows/`.

— *Amendment 2026-11-10 (T88):* **"Revisit" was checked by the move to v0.14.0 (R67). The numbered list is a part of `app` (Д121 in the RUN.md of `spec` and row 5.8 of its COORDINATION.md; В69). `tutor` will release the file of `tutor` of format 0.4 in a task of its own, and then the exception `TUTOR_FORMATS` is removed (Д158 in the RUN.md of `spec`; В70): on 2026-11-10 the newest release of `tutor` is v0.1.21, of format 0.3, and its move to `spec` v0.14.0 is still under way. `emulators/toolchain.sh` is compared (the T88 amendment to R57). The texts of E4 of `spec` came out as the file `legal-1.tar.gz`, and the page's set on them is T89.**

— *Amendment 2026-11-10 (T99):* **the exception of format 0.3 for the file of `tutor` is removed: `tutor` released a file of open views of format 0.4 — v0.1.22 of 2026-11-10 (Д158 in the RUN.md of `spec`) —, and `openTasksOf` accepts only the element's format, `FORMAT`, and `TUTOR_FORMATS` is gone. The "Revisit" about the exception is closed.**

## A worked example on a workbook

**R61. The element shows a lesson's worked example on a workbook (format 0.4) as a task on a workbook on which nobody writes: the example's lines are on the page in the task's layout, the boxes empty, and a demo step `fill` writes its value into its box when the learner opens the step. The values stand in the middle of the boxes, on the line, at the width of their text by the table of widths, as the lines' texts do, and to a screen reader the box names it: «Окошко 1: 5». A hidden demo hides the values too. The check is by the schema and the rules `lesson.example-fills` and `lesson.workbook-page`.**
- **The check** (`src/core/example.ts`): the canvas is a `handwriting_sheet` with a grid or a `workbook` with no fields; a workbook has `lines`, a sheet has none. A line is pieces of text and boxes, at least one box, and a box has a `value`, no wider than the box as a line's text: `pieceWidth` measures it as the layout measures a piece, and 100 units is the `box_width` of `page.yaml`. The lines lie on the page as a task's lines do, and a refusal of the layout names the line: `workedExample.lines[10]`. A demo step on a workbook is a paragraph, a picture beside the sheet or `fill`, and there is no picture on the sheet; a sheet has no `fill`. Every `fill` names a box of the lines, none is filled twice, and each is filled.
- **A copy, not a new shape.** The check returns a copy of the example, as before: the step `fill` does not carry the box's value, `fillValue` finds it by the lines.
- **The display** (`src/element/index.ts`, `src/element/parts.ts`): the template is `pageOf` the lines without values, the pen is the only tool, there is no input, as for an example on a sheet (R42). The open steps give `filledBy`: the box and its value; a hidden demo gives nothing. The value is a `<text>` after the box's frame, `aria-hidden`, and the frame names the box with the value; the entry of the list of steps is «Окошко 1.1: 5», and the polite live region says the same.

— *Why:* §21 of the format of `spec` v0.12.0: "on a workbook, a box filled, `fill` … The demo fills the box with its `value` as the learner opens the part"; row 5.8 of the COORDINATION.md of `spec` — «показ примера на тетради». The value goes by the table of widths, not by the device's font, for the same reason as the lines' texts: the boxes and the text stand the same on any device (R35).

— *Rejected:*
- **the value in the demo step after the check** — the check would stop returning a copy of the example;
- **the value as text without `aria-hidden`** — the screen reader would read it twice, as text and as the box's name;
- **the values even with a hidden demo** — the demo is hidden whole, as the pictures on a sheet are.

— RUN.md, T85; R42, R35; `src/core/example.ts`, `src/core/example.test.ts`, `src/core/page.ts`, `src/element/index.ts`, `src/element/parts.ts`, `src/element/parts.test.ts`.

— *Amendment 2026-11-12 (T107):* **the value that a step `fill` wrote into a box is not part of the box's name but a node of its own, in the lines' language: the frame names the box without the value, «Окошко 1», and the value's `<text>` stands right after it, without `aria-hidden`, and inherits the lines' `lang` from their layer. The entry of the list of parts and the announcement of the region `status` are the same label "{name}: {value}", but the label's words are a `<span>` in the labels' language, and the value is a `<span>` of its own between them: in the entry it inherits the list's language, and in the announcement it takes the list's `lang`, if there is one.** So a value that is a word sounds in its own language when the interface language is not the module's language (3.1.2; the T107 amendment to R74). `sayAround` cuts the label at the place of `{value}` (`src/element/labels.ts`), and in each language of the table of labels `valued` names `{value}` once. The entry no longer has a `lang` of its own: a new module language reaches the value in the box and in the entry by itself, and an announcement made before stays as it was, as with a paragraph. The rejection "the value as text without `aria-hidden`" stood on the name of a box with a value: the screen reader would read it twice. There is no such name any more, and a screen reader reads the value once — as the node after the box, in the order of the line (a Chromium probe at the planning of T107). Rejected:
- **the value as the box's description, `aria-describedby` on the value's node** — the browser computes a description, like a name, as a string with no language, and the node's `lang` does not reach the screen reader;
- **a box with a value as a `role="group"` with the box's name and the value inside** — the author's decision of 2026-11-12: a workbook's boxes would get two roles, `img` when empty and `group` with a value, and how VoiceOver and TalkBack read a group in SVG cannot be checked before Д7;
- **a `lang` of its own for the value in the entry, as in the announcement** — a new module language changes the list's `lang`, and the value's explicit `lang` would stay the old one.

— RUN.md, T107; R74, R36, R28; [architecture.md](architecture.md), sections 3.3, 3.8, 3.9 and 3.10; `src/element/labels.ts`, `src/element/parts.ts`, `src/element/index.ts`, `src/element/parts.test.ts`, `src/element/labels.test.ts`.

## The measurement's tasks in the page's build

**R62. The samples page's build puts in all the tasks of the file of open views of `tutor` from `tasks/` — 56 tasks of four banks, in the choice a group per bank —, and takes the file from the tree, as the synthetic samples do: there is nothing to download. A task carries only the fields of the format's open view, which the types `@altnovatrail/spec/formatv0/open` name. A field outside them, at any depth, stops both the build and the synthetic samples, and a picture in the statement stops the build: the file of `tutor` carries no media. The page marks up an essay by its text as written, or by the reason why there is none, and gives no scores of the criteria. `canvas` does not match the samples of tasks of `tutor` and of `modules`.**
- **The source.** The copy `tasks/tutor_v0.1.10_open-tasks.json`, which `ci-licenses` checks by the recipe `release-verify` on every pull request, and whose sum `TUTOR_FILE` holds (R49). The build of a pull request and the build of a release are one and the same, and it needs no network. There is no raise to `tutor` v0.1.21: its `banks` are the same byte for byte — 10 + 6 + 20 + 20 tasks of format 0.3, with no media —, and a raise would change only the tag and the file's sum in the reference.
- **The open fields** (`src/eval/tasks.ts`). Each type of a task's open view — `Task`, `StatementPart`, `Canvas`, `Item`, `AnswerSlot`, `SheetRectangle` and `LinePart` — has its own table of fields, written `satisfies Record<keyof open.X, Field>`. A field that `spec` opens fails `tsc` until it is named, and a closed field does not get into the table: the type does not have it. `openTasksOf` walks each task by the tables. A field of another name and a field of the wrong kind — an object instead of a text, a text instead of a list — is a `TypeError` with the path: `eval/workbook.json workbook-01: items[0] line[1] check is no field of the open view`. The check stands where the references are computed, so it runs in the very build that writes the release file, and in the synthetic samples too.
- **Media and the task's kind.** `pageTasksOf` in `scripts/page.ts` stops the build on a task whose statement names a picture: the file of `tutor` carries no media, and the way for media is the packages of `modules` (Д4). While there are no media, `ci-licenses` has nothing to check in the build. A sheet that does not have one answer place `anywhere` or `sheet` — a zone, a choice, several places — stops the build the same way: the page cannot mark up such a sheet. `openTasksOf` rejects a bank that occurs twice in the file: the reference names the bank by its path, and the tasks of one would get the references of the other.
- **The choice of task.** A group `<optgroup>` «Банк …» for each bank, in the file's order. An entry is «Лист: …», «Сочинение: …» or «Тетрадь: …» with the task's ID, and the entry's value is its number in the build: number 0 is `equation-1`, as the emulators expect. An essay is a sheet whose only answer place is bound to `sheet`.
- **The essay** (`essayMarkup` in `page/markup.ts`). It has no parts, no first error and no tags. The truth of its answer place is the text as written, with its errors and line breaks; `UNREADABLE_ILLEGIBLE` when the essay cannot be read as a whole; `UNREADABLE_BLANK` for a sheet with no strokes. `writing` is `marks` with no scores: "The marks come after the writing: the organizer of the eval set or of the measurement adds them" (the contracts text of `spec`, "The sample file", "The markup"). The flag «сочинение не прочесть целиком» is the same in the child's session: it does not say "on purpose", as the flag of a part of a sheet does (В68). `sample-check` accepts such a file — the example `examples/page-essay-measurement.json`, which `ci-licenses` checks with the rest.
- **Two sources.** A reference to a task names its source — `tutor` or `modules` (R09). Whether to match the samples of one task from two sources, and by what, is the business of the runner of `tutor`, not of `canvas`. `spec` will learn of this by row В71 of table 3 of RUN.md.

— *Why:* T21 and the author's decisions at its planning, 2026-11-09, all as recommended (RUN.md, T21). One path of the file for the synthetic samples and the page is one check of the signature. The fields go by the types of `spec`, not by a list of closed names of our own: by the format, all that is not open becomes closed (the format text of `spec`, §6).

— *Rejected:*
- **downloading the file in `release-files`** by tag and sum, as R08 supposed: a second path of the same file beside the synthetic samples' copy, and a pull request would check a build other than the one that comes out;
- **a raise to `tutor` v0.1.21** — the same tasks, and the archive of the synthetic samples would come out different;
- **the packages of `modules` now** — in a task of its own by Д4, beside T86, with the withdrawn versions by R63 spec;
- **a search for closed names in the build's HTML** — the page's code itself carries such words as `key`, and the minified bundle writes field names without quotes;
- **a label of its own for the essay's flag for a child** — so the plan proposed, but the flag «не прочесть целиком» says nothing of any "on purpose".

— *Revisit:* when the build moves to the packages of `modules` (Д4) — media, their check in `ci-licenses` and the withdrawn versions; when `tutor` releases a file with other banks or of format 0.4 — a raise of the copy together with the synthetic samples (R60).

— RUN.md, T21, table 3, Д4; R08, R09, R49, R55, R56; [architecture.md](architecture.md), sections 3.4, 3.5 and 3.6; `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `page/main.ts`, `page/markup.ts`, `page/markup.test.ts`, `page/texts.ts`, `examples/page-essay-measurement.json`.

— *Amendment 2026-11-10 (T88):* **the answer of `spec` to В71 (Д164 in the RUN.md of `spec`): the runner of `tutor` keeps samples separate by source, and a sample counts toward the task of its own source. A sample's reference names the source anyway, and `canvas` changes nothing (R67).**

— *Amendment 2026-11-10 (T99):* **the page's build takes the tasks of the copy of `tutor` v0.1.22 in `tasks/` instead of v0.1.10: the same 56 tasks of four banks, byte for byte, and the build does not change them, while the references to them in samples name the tag v0.1.22 and the digest of its file (the T99 amendment to R49).**

— *Amendment 2026-11-11 (T101):* **the build takes modules' tasks too — for the eval set, as a copy of the output of `module-kit open` in `tasks/modules-v0.2.4/` (R71) —, while the measurement and the child sample session stay on the copy of the file of `tutor`, as the author decided: the tasks by which `tutor` measures do not change in the middle of the measurement. The "Revisit" line about media, their check and the withdrawn versions is done for modules' tasks: the media are the files of `media/` that the statements of the taken tasks name, compared with the output of `module-kit` in `ci-licenses`, and `module-kit open` itself skips the withdrawn versions, by the index. A picture in the statement of a `tutor` task still stops the build.** — RUN.md, T101; R71; Д4.

## Synthetic samples on a module's package

**R63. The synthetic samples of a module's eval set are written by the generator of `canvas` on a module's package — the folder that `module-kit build` wrote on the commit into which the samples go: `just synthetic-module <package> <tag> <folder> <task>:<seed>...`. `canvas` builds a task's open view from the package's canonical view with the same tables of open fields that hold the file of `tutor` (R62), and checks the package against its inventory. A sample is an eval set's, by an adult, under Apache-2.0, with the source `modules` and the tag the call named. A sheet with one place `anywhere` and a workbook's page are drawn; a template, a choice, an essay and a zone are a refusal. A seed whose file is already in the folder is written anew only if it is a sample of the same task.**
- **The package** (`moduleTasksOf` in `src/eval/tasks.ts`). `inventory.json` and `server.json` are taken from the folder; a sample does not need `device/`. The inventory is of format 0.4, which the element reads, with the module ID `<publisher>/<name>`, a version and a `server_part` whose digest and size are those of the text of `server.json`. The package digest is the sha256 of the inventory (the format text of `spec`, §25). The tag is `vX.Y.Z`: the protocol does not check it (the contracts text of `spec`, "Eval sets").
- **The open view.** The walk by the tables of open fields is one for both inputs: in the file of `tutor` a field outside the open view is a refusal, and in a package it is dropped, as the server drops it (§6 of the format). A field of the wrong kind is a refusal in both. On all 773 tasks other than templates of the release `modules` v0.2.0 the view and its digest matched `module-kit open` v0.3.0 byte for byte; a test holds the digests of the 12 tasks of grade-3-math.
- **The sample** (`moduleSample` in `src/eval/synthetic.ts`). The seed picks a scenario from the scenarios of a sheet or a workbook, and the writer — an adult in their own hand or imitating a child's. There is no writer code, the license is Apache-2.0, the ID is `synthetic-<seed>`. A seed is from 0 to 2^32 − 1: the generator takes 32 bits from it, and two seeds above that would draw one sample. A workbook is drawn only if all its items are lines with boxes, with no other answer places. T18's set is the same, byte for byte: the choice of a task from a bank stayed with it, and the drawing became shared.
- **The call** (`scripts/synthetic.ts`, `--module`). First everything is checked — the package, each call, each drawing, each file of the same seed, read by `readSample` —, and only then written. The errors are all named at once, a page that does not lay out too, code 1; a call not in form is code 2. A person's sample under the same name is never overwritten. The recipe hands the arguments to Node as they are (`[positional-arguments]`), bypassing the shell's text.
- **A specimen module in the tree.** `tasks/modules-v0.2.0/` is `module-index.json` with its Sigstore bundle and the `inventory.json` and `server.json` of the package grade-3-math 0.2.0, byte for byte from the signed release. `ci-licenses` checks the index's signature with `release-verify`, compares the sha256 of the inventory with the package digest in the index — then `moduleTasksOf` compares `server.json` with the inventory —, writes a sample for each of the 12 tasks into `build/synthetic-module` and holds them with `sample-check --eval-set novatrail/grade-3-math`. The example of a module's sheet `examples/module-sheet-eval-set.json` — on a package that a test writes from the same one with a sheet task and the ID `example/sheets` — is held by `sample-check --eval-set example/sheets`.

— *Why:* R110 spec and Д128 in the RUN.md of `spec`, the author's answers at the planning of T86 on 2026-11-09 — all as recommended (RUN.md, T86). A projection of the open view of our own instead of `module-kit` — because `module-kit open` takes a package only by an entry of a release's index, and a commit's package is in no index; the comparison with it on all the tasks of a release showed that the tables give the same view.

— *Rejected:*
- **the input `open-views.json` from `module-kit open`** — a commit's package would need a temporary index built for it; a path shared with the page's build from `modules` (Д4) is not worth it;
- **templates now** — only `module-kit` computes an instance by its seed (§§22–23 of the format);
- **a refusal on every known seed** — a pull request that changes a task's open view redoes its samples, and the call must overwrite them;
- **a copy of the whole package olympiad-math** — 1.3 MB for the sake of sheets; an example on a package that a test writes holds the sheet, and the generator went through the real package olympiad-math by hand during T86.

— *Revisit:* when a module needs synthetic samples of templates, choices or essays — in a task of its own; when `modules` releases a package of a format newer than 0.4 — together with the element's move; when `spec` opens a new field of a task — the tables of open fields fail `tsc` until it is named.

— RUN.md, T86, table 3; R49, R62; [architecture.md](architecture.md), sections 3.5 and 3.7; README.md; `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `src/eval/synthetic.ts`, `src/eval/synthetic.test.ts`, `scripts/synthetic.ts`, `scripts/synthetic.test.ts`, `justfile`, `tasks/modules-v0.2.0/`, `examples/module-sheet-eval-set.json`.

— *Amendment 2026-11-10 (T88):* **the author's answer to В72 is option (a) (Д128 in the RUN.md of `spec`): the generator stays as it is — synthetic samples of `anywhere` sheets without templates and of workbooks, and for templates, choices and essays, people's samples (R67).**

— *Amendment 2026-11-10 (T96):* **the generator comes out as a file of every release, `synthetic-module_v<X.Y.Z>.mjs`, and `just synthetic-module` and `ci-licenses` run the same file, built as version 0.0.0; the module mode moved to `scripts/synthetic-module.ts`, and `scripts/synthetic.ts` writes only the set of `tutor` (R68).**

— *Amendment 2026-11-10 (T97):* **for a task that the generator does not draw — a choice, an essay, a zone —, `moduleTasksOf` keeps the digest of its open view too, beside the reason, and a template has none: a template has no open view. It is the same walk that T86 compared with `module-kit open` v0.3.0 on all 773 tasks other than templates, so these digests are its too, and T98 will compare them on packages of format 0.4 (R68). A task with the place `anywhere` on a canvas of another kind, neither a sheet nor a workbook, is a refusal with a reason too, not a `TypeError` of the whole package.**

— *Amendment 2026-11-10 (T98):* **the projection is compared on format 0.4, on the packages of the release `modules` v0.2.1 — `grade-3-math` 0.3.0 and `olympiad-math` 0.3.0 — and `english-essays` 0.2.0, which its index names from v0.2.0: `release-verify` accepted the release files, the package and the binary of `module-kit` v0.3.0. `module-kit open` gave 795 open views, and for all 773 tasks other than templates the digest `--digest` of the generator's file is the same byte for byte as that of `module-kit` — for the 122 choices too, and for the essays, which the generator does not draw; `canvas` does not compute the 22 instances of templates. The generator drew 12 of the 12 tasks of `grade-3-math` and 631 of the 775 tasks of `olympiad-math` — the choices and templates were rejected —, and all 643 samples passed `sample-check --eval-set`; 631 files in one call crash its Node process, and it ran in batches of 50. The new fields of format 0.4 — `leading_question`, the check `time`, `notation: word` — did not get into the open views of these packages' tasks, and the open views of `grade-3-math` 0.3.0 are the same as those of 0.2.0, so the 0.2.0 fixture stays. The comparison is a one-off, and CI holds a part of it: the package `english-essays` 0.2.0 (15 KB) lies in `tasks/modules-v0.2.0/` beside `grade-3-math`, `ci-licenses` compares its inventory with the index, and a test compares the digests of its five essays and three choices with those that `module-kit` gave (R68).**

— *Amendment 2026-11-11 (T101):* **the input `open-views.json` from `module-kit open`, rejected here for the generator, is now taken by the page's build (R71): it has a release's package, not a commit's, and a release has an index. The generator stays on its own projection of a commit's package. On the same packages with seeds 1–5, `canonicalText` gave the digest of each of the 883 open views, byte for byte the one `module-kit` writes — of the templates' instances too; `openViewsOf` holds this on every build.** — RUN.md, T101; R71; `src/eval/tasks.ts`.

## The samples page's mode "open a file"

**R64. The samples page opens a sample file for viewing — by a section of its own, «Открыть образец», under «Началом», in the same build and with no network. It shows the strokes, drawn from the file alone, the crops from the file and the markup in words, changing nothing, saving nothing and calling no AI. A sample of any purpose opens — an eval set's, a measurement's and a child's. For the writing history the end result is shown, and the checkbox «показать стёртое» adds, in another style, all that was written and is not visible at the end — erased, cleared and taken back by undo: that is in the file too.**
- **Where.** A section under «Началом»: the choice of a file, a note that the file goes nowhere, and a line for a reading error. A chosen file hides «Начало» and shows the sample; another file is chosen in the same field. «К началу» is a new opening of the page: it remembers neither the file nor its content (R11). Once writing has begun, the section is gone: viewing does not touch an unfinished sheet.
- **Reading.** Only `readSample` (R48): a field outside the message or another protocol is an error text, and nothing is drawn. Beyond reading the page does not check the file — that is the `sample-check` of `spec`, and other repositories may not write a check of their own (R93 spec).
- **The drawing** (`page/open.ts`, `page/main.ts`) — an SVG from the file, with no task: a sheet by its width and height, and the drawing's frame takes in a stroke beyond the sheet's edge too, so that none is cut off; for a workbook, each box as a rectangle with its place `item.place`; the strokes as lines of the sheet's pen width (`INK_WIDTH`). For a history, the sheet's own `replay` (`src/core/history.ts`) computes what is visible at the end from the file's events: writing, erasing, clearing, undo. What was written and is not visible at the end is drawn dashed in the color `GrayText`, on top, only with the checkbox, and the checkbox names how many such strokes there are. The SVG's attributes are presentation attributes: the page's policy does not let in the attribute `style` (R55).
- **Crops** — PNG from the file, by blob URL, as the markup's crops (R23), by digit height; for a workbook, by a filled box.
- **Words.** The purpose, who wrote, the provenance, the writer code, the license, the versions, the task's source with the digests of the file and of the bank, its ID and the digest of its open view; the markup — the truth by places, the tags, the parts with their text as written, flags and number of strokes, the first error, the scores of the criteria. A value of an enumeration that the page does not know is shown by its name in the protocol. The purpose, «кто писал» and the box are named with the same words as in «Начале» and the markup. Two files chosen in a row do not mix: the last is shown. The file's texts go into the page only as text, not as HTML.
- **Nothing leaves:** no requests, no downloads, no storage — the page's test holds this by `file://` on a sample of each composition from `examples/`.

— *Why:* R110 spec and Д128 in the RUN.md of `spec`, the author's answers at the planning of T87 on 2026-11-09 — all as recommended (RUN.md, T87). `modules` publishes an eval-set sample forever together with the texts of the markup, and a measurement sample goes to the organizer and to AI providers: only a person sees a name or a contact in it before the push, and the file is shown neither to an AI nor to an agent (П-12). The build has no modules' tasks (R62), and the file itself carries the sheet, the boxes, the strokes and the crops. What was erased stays in the file's history, and without it a name written and erased would go unnoticed.

— *Rejected:*
- **strokes on the element** — the build has no module's task, and a module's workbook would lie without lines and boxes; the element has no mode "view only", and one could write on it;
- **eval-set samples only** — a measurement sample goes further too, to the organizer and AI providers, and a child's file already lies on the device where it is opened;
- **only the history's end result** — what was erased stays in the file; **a replay of the history in time** — more code, and it finds a name no better than the checkbox;
- **a choice "write or open" before «Началом»** — an extra step for every volunteer for the sake of the organizer's mode; **viewing during writing too** — the unfinished sheet would have to be kept safe;
- **a build of its own for viewing** — R110 spec requires the same build.

— *Revisit:* when modules' tasks come into the build (Д4) — whether to show the task's statement beside it; when the protocol gives a new field of a sample — its words here; on tablets — T22 checks the choice of a file in the iPad's «Файлах» and in Android's downloads.

— RUN.md, T87, T22; R11, R48, R55, R58, R62; [architecture.md](architecture.md), section 3.6; `page/open.ts`, `page/open.test.ts`, `page/main.ts`, `page/index.html`, `page/texts.ts`, `scripts/page.test.ts`, `tsconfig.element.json`, `tsconfig.node.json`.

## Devices in the emulators

**R65. The emulators of `page.yml` go through T22's checklist: there are no tablets, and the hardware is debt Д7. Each device goes through two builds, each in a run of its own. On the release build, after the sheet's first stroke — a stroke that the browser cancels, the row's eraser and undo, a second stroke written and erased, and two fingers that scroll; the workbook «подражая детскому почерку»; then the page is opened anew, and the sheet's file is opened in it. On the test build — its «Начало» and the child sample session. On Android the gestures are touches of Chrome itself through DevTools, on the iPad the page's pointer events. The executor looks at the screenshots, and the result item by item is in the task.**
- **Gestures** (`emulators/volunteer.ts`, `emulators/watch.ts`). After the first stroke:
  - a stroke cut off by `pointercancel` does not change the history;
  - the row's «Ластик» takes the next presses, and a stroke along the same path writes `erase`;
  - «Отменить» writes `undo` and brings the stroke back;
  - «Перо» comes back, a second stroke to the right of the first is written and erased — the file carries it as erased;
  - two fingers moving up shift the sheet's view or the window and write nothing — the sum of their scrolling serves as the measure.

  The driver finds the row's buttons by their label in the element's shadow tree.
- **How on the devices.** Android — the DevTools `Input.dispatchTouchEvent`: Chrome's touches, several fingers and `touchCancel`, in the page's CSS pixels, and the first stroke still by the emulator's `input touchscreen swipe`. iPad — the page's own `PointerEvent`, `pointersBy` with one or two pointers, as T81's stroke was, and `click()` on the buttons: WebDriver's touches in Simulator missed. The run's report names the way of each step.
- **A file opened on the page** (T87; R64). The page is opened anew — it remembers nothing —, and the section «Открыть образец» gets the sheet's file. On Android, the very file from Chrome's downloads, `DOM.setFileInputFiles`, and if Chrome does not read it, the text. On the iPad, the text of the saved blob as a file of the page. The page's step holds: the view is shown, there is no fewer than one line, the erased stroke apart, the checkbox is there, all the crops are decoded. The emulators do not go through the system's file picker.
- **The test build** (R59) — `emulators/builds.sh` builds it beside the release, and the server serves it on a port of its own, 8081, under the name `samples-page_v0.0.0-test.html`: Chrome keeps both downloads in one list and opens them by name. The steps:
  - the eval set is closed with a reason, and the measurement and the session are open;
  - a new child's code is shown for the form and starts no session;
  - the form's code, `T22CHILD`, starts the session;
  - the child writes, «Кто писал» is not asked, the phrase about the iPad is there;
  - a part's flag is labeled «не прочесть и со слов ребёнка»;
  - the sheet and the workbook are saved.
- **Files** (`emulators/saved.ts`). The expectation goes by folder: for the release, a history, `draft-0`, one sample in one's own hand and one imitating a child's; for the test build, `-test`, `WRITER_CHILD`, the final geometry, `test-approved-0` and the code `T22CHILD`. A child's workbook may have no strokes in its geometry: the driver's stroke lands outside the boxes, in the scratch area (R53). `sample-check` holds the files of both folders.
- **What is left to the hardware** — the list in Д7: the pen's pressure and tilt, the palm and the thresholds of R29, a touch's `width` and `height`, WebKit bug 269535, the button «Рисовать пальцем», the pen's eraser and the eraser's reach (R22), the share ⅘ and fast presses of «Выше» and «Ниже» (R33), VoiceOver and TalkBack (R34–R37, R42), a lesson example's sheet on a tablet (R42), the system's file picker, iCloud.

— *Why:* the author's answers at the planning of T22 on 2026-11-10 (RUN.md, T22): one task, not as recommended; the rest as recommended. Chrome's touches go the browser's real input path up to the pointer events, and on the iPad the driver has no such path: the page's events check the sheet's code in WebKit, but not the touch stack. The runs go where they went (В66): Android on every pull request with the page, the iPad on `main` and by hand.

— *Rejected:*
- **WebDriverAgent touches on the iPad** — in T80 a download through it got through once in eight, and in T81 the touches missed;
- **synthetic events on Android too** — there the DevTools already open gives real touches;
- **the new steps only on `main`** — a failure of the eraser, undo or the child's session would be found only by a run after the merge;
- **the test build as a task of its own** — the executor proposed to split T22 so, and the author kept the task whole;
- **the file's text on Android too** — then the step would not go through the file that Chrome really saved.

— *Revisit:* when there are tablets — the list of Д7 in a task of its own; when modules' tasks come into the build (Д4) — the eval set's path as a second case of the test build; when the element gives the workbook's lines and boxes in the accessibility tree (epic E10) — a stroke into a box by its frame, not at random.

— RUN.md, T22; R53, R54, R59, R64; [architecture.md](architecture.md), sections 3.1 and 3.7; `emulators/volunteer.ts`, `emulators/watch.ts`, `emulators/page-android.ts`, `emulators/page-ipad.ts`, `emulators/page-ipad.sh`, `emulators/android.sh`, `emulators/builds.sh`, `emulators/saved.ts` and their tests, `.github/workflows/page.yml`.

## The page in the release

**R66. Every release of `canvas` since T75 carries the samples page's build `samples-page_v<X.Y.Z>.html` — with the draft of the texts and the release's version without `v` — signed and in `SHA256SUMS`, as the other files are. `release-files` builds it with the same builder as the emulators do, and the release's paths take in everything it is built from. The release's description begins with a paragraph about the page: it opens from a file on a computer or Android, does not work on an iPad, goes to no network, and GitHub sees the IP address of whoever downloads the release file. A job of its own, `notes`, puts the paragraph in after the shared `release.yml`. The released file is checked by `release-verify`, by a rebuild of the tag's commit and by opening it from `file://`.**
- **The build** — `node scripts/page.ts dist <number>` in `release-files`, after the synthetic samples: the builder writes one file into the folder, and the recipe checks that it is named by the tag. The builder puts the test text set only into version `0.0.0` (R58), and it does not go into a release.
- **Paths** — added to the earlier ones: `page/*.ts` without tests, `page/index.html`, `page/notices/*`, `page/sets/draft-0.json`, `scripts/page.ts`, `scripts/csp.ts`, `tsconfig.json`, `tsconfig.core.json` and `tsconfig.element.json`. The element's code and `src/eval/`, the file of `tutor`, the lock file, `LICENSE` and `NOTICE` were already among them. The `tsconfig` programs, because Vite takes the transform options from them: `useDefineForClassFields: false` in `tsconfig.element.json` changes the page's bytes (the 2026-11-10 amendment to R55).
- **Repeatability.** The test `scripts/page.test.ts` builds version `1.2.3` twice — the second time in a process of its own, `node scripts/page.ts`, as `release-files` calls it — and expects the same bytes. Repeatability on another machine is checked by comparing the released file with a rebuild. The emulators of a pull request build the same page from the same tree as version `0.0.0`, so they have checked the code that comes out: the version string and the script's hash in the policy differ.
- **The paragraph.** The shared `release.yml` writes the description itself, `gh release create … --generate-notes`, and takes no text of ours. The description of an immutable release can be changed: "Only the assets and tag are locked. You can still edit the title and release notes of a published immutable release" (GitHub Docs, "Immutable releases", read 2026-11-10). The job `notes` runs after the shared one, with `contents: write`, however the shared one ended, if it ran: a release that came out while the npm step after it failed gets the paragraph too.
  - It finds the commit's release by `target_commitish` among all the pages of the list — the shared one creates the release with `--target` on the SHA —, and if there is no release, it writes nothing.
  - The paragraph with the release's tag goes first, between two HTML comment markers, `gh release edit --notes-file`. It removes the earlier paragraph between the markers, and the `\r` of an edit on the site does not break the markers: a rerun by the button, a new wording and a manual edit of the description leave one paragraph, and it does not touch a description that would not change.
  - On a pull request it takes the newest release and prints the description it would write, changing nothing: the script runs on every pull request, not only on `main`.

  The paragraph is in English, as everything outside `docs/` is (R14 spec).
- **The check of the released file** — by the executor after the merge of T75: `release-verify` accepts the file and its bundle (R77 spec), the sum is the same as that of `node scripts/page.ts` on the tag's commit, and the file opened from `file://` in the container's Chromium shows the version, goes to no network, keeps the policy and saves a sample that `sample-check` accepts. From then on every release is held by the repeat of the bytes and by the Release probe on a pull request, which runs `release-files` and checks the signatures.

— *Why:* the author's answers at the planning of T75 on 2026-11-10, all as recommended (RUN.md, T75). R11 asks for the release's description to speak of the IP address — where the file is downloaded —, and the page says it only after the download. A job of our own writes the paragraph by itself on every release and does not wait for `.github`. The repeat of the bytes carries the check by the emulators of a pull request over to the released file with no new mode in the workflow and the drivers.

— *Rejected:*
- **an input for a text of our own in the shared `release.yml`** — a row for `.github` and waiting for its release for the sake of what only `canvas` needs;
- **the paragraph only in the README and on the page** — R11 asks for the release's description, and the README is not visible from the release's page;
- **the emulators on the release file** — the repeat of the bytes makes this superfluous, and an input `release` in `page.yml` and the drivers is new code;
- **the release after "Samples page"** — the release would wait for the iPad, which does not run on a pull request, and the first measurement is not written on an iPad (the 2026-11-08 amendment to R25 spec). Android holds every pull request with the page;
- **`tsconfig.node.json` in the paths** — its program is the scripts and the tests, which the bundle does not carry.

— *Revisit:* if the shared `release.yml` gives an input for a text of our own — remove the job `notes`; if the page moves to hosting (Т-17) — what the paragraph says about the IP address; if Vite stops giving the same bytes — the test holds the repeat.

— RUN.md, T75; R08, R11, R55, R58; [architecture.md](architecture.md), sections 3.4, 3.6 and 3.7; `justfile`, `.github/workflows/release.yml`, `scripts/page.test.ts`, README.md.

— *Amendment 2026-11-10 (T96):* **a second file of the same make is the generator of a module's eval set: `scripts/generator.ts` builds it with the same Vite, `scripts/generator.test.ts` holds the repeat, and `tsconfig.node.json` is now in the paths — Vite takes its options for the `scripts/` that the generator carries (R68). The "Rejected" about `tsconfig.node.json` held while `scripts/` were not in the bundle.**

## `spec` tag v0.14.0

**R67. `canvas` is on `spec` v0.14.0, by way of v0.13.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, and the shared workflows of `.github` at v0.1.22, with the cache of the `toolchain` stage's image. What the tags v0.13.0 and v0.14.0 require of `canvas` is taken, but for two things: T89 takes the text sets from `legal-1.tar.gz`, and the exception of format 0.3 waits for a 0.4 file of `tutor`. The questions В67–В73 are closed.**
- **The submodule and the packages.** `spec/` is v0.14.0, commit c318cb4, the latest release of `spec` (2026-11-10); `gh release verify` accepted it. `@altnovatrail/spec` and `@altnovatrail/contracts` are 0.14.0, by `npm install --save-exact`, and the lock file changed only in their entries, and `ci-licenses` checks the signatures (R44). The 0.14.0 packages only added the exports `legalv1`, `consentagev1` and `exportv1`: `types/canvas`, `formatv0`, `page`, the observation protocol and the contracts' vectors did not change, and in `sample_pb` only the comment on `text_set_version` changed. The devcontainer template of the kind `typescript`, RULES.md and the license check did not change between the tags, and the recipes of `spec` that `canvas` calls are the same.
- **The copies of the format in the tests** are the same bytes, and the tag in their comments is v0.14.0: between the tags `format/` changed only the trap catalog `traps/valid/olympiad-math.yaml`, which the tests do not copy.
- **`.github` v0.1.22** instead of v0.1.21 — by Д146 in the RUN.md of `spec`: `typescript.yml` and `documents.yml` take the stage's image from the cache of GitHub Actions and build it only on a miss. `gh release verify` accepted the release, and the calls gained no inputs.
- **What the tags require:**
  - Д151 in the RUN.md of `spec` (R124 spec, R125 spec) — the T88 amendments to R11 and R59: the adult's declaration and the phrase after saving in the child's session (В67);
  - Д146 — the T88 amendment to R57: `emulators/toolchain.sh` by the `toolchain.sh` of `spec`;
  - Д186 — the T88 amendment to R12: the README's section Install;
  - В68 — the 2026-11-09 amendment to R95 spec: the page's label of the flag is the same (the T88 amendment to R59);
  - В69 and В70 — Д121 and Д158 (the T88 amendment to R60); В71 — Д164 (the T88 amendment to R62); В72 — Д128, option (a) (the T88 amendment to R63); В73 — the cards architecture 3.2 and 3.10 spec;
  - Д161 — the text sets from `legal-1.tar.gz` (R130 spec): T89. In `legal-1` of v0.14.0 all texts and sets are drafts, and a purpose without a current set does not open: T89 decides what is open before approval;
  - R112 spec — "lawyer" is removed both from the draft text set and from the comments of the page's code, which T85 did not edit (the T88 amendment to R11).
- **The entries of `spec` that diverged from `canvas`** — row 5.8 of COORDINATION.md is not yet marked, though T85 did it (R60), the status of `canvas` there is v0.9.9, and the table of incoming items of the RUN.md of `spec` puts the answer to В73 into "architecture 3.2 and 4", though it went into 3.2 and 3.10 — `spec` will learn of them by row В75 of table 3 of RUN.md.
- **The release.** The line is 0.3: the merge releases the next patch and the same version to npm, because `package.json`, the lock file, the README and `page/sets/draft-0.json` are in the release's paths (R08, R66). With it the README tells of the finished E5 (Д8).

— *Why:* the author's instruction of 2026-11-10, «перейди на самую последнюю», at the planning of T88, which was going to v0.13.0, and the author's decisions at the planning, all as recommended: the phrases of Д151 and Install here too, the divergences of the entries of `spec` by row В75 (RUN.md, T88).

— *Rejected:*
- **v0.13.0, as the plan had it** — v0.14.0 came out the same day and carries the samples page's texts, which T89 moves to;
- **the phrases of Д151 in T89** — T89 moves the sets to the file of `spec`, and the declaration is needed by the draft set too, which comes out in every release;
- **a copy of the `toolchain.sh` of `spec` instead of our own script** — it has the image `novatrail-toolchain` and the path from a variable, and the emulators' jobs call the image `toolchain`;
- **waiting for a 0.4 file of `tutor`** — the move would wait for another repository's release, and the exception breaks nothing.

— *Revisit:* when `tutor` releases a file of open views of format 0.4 — remove `TUTOR_FORMATS` in a task of its own, together with the copy in `tasks/` (Д158 in the RUN.md of `spec`; R62); when the sets of `legal` come into force — what the page opens (T89).

— RUN.md, T88, T89, tables 3 and 4; R11, R12, R57, R59, R60, R62, R63; [architecture.md](architecture.md), the status; README.md, CLAUDE.md; `emulators/toolchain.sh`, `page/sets/`, `page/sets.ts`, `page/steps.ts`, `page/texts.ts`, `.github/workflows/`, `package.json`, the copies of the format in `src/core/`.

## The generator of a module's eval set as a release file

**R68. Every release of `canvas` carries the generator of a module's eval set as one file `synthetic-module_v<X.Y.Z>.mjs` — an ES module for Node 24 with no npm packages beside it, signed by the shared `release.yml` and in `SHA256SUMS`. `node <file> --module <package> <tag> <folder> <task>:<seed>...` writes the same as `just synthetic-module` wrote, byte for byte, and `modules` checks the file with `release-verify` (R77 spec) and holds it by tag and digest. The same file, built as version 0.0.0, is run by `just synthetic-module` and `ci-licenses`.**
- **The code.** The module mode is a module of its own, `scripts/synthetic-module.ts`, without `import.meta.main`: `moduleMain` returns the exit code — 0, 1 on a refusal, 2 on a call not in form —, and the file's entry point, `scripts/synthetic-module.main.ts`, calls it on the first argument `--module`. `scripts/synthetic.ts` kept the set of `tutor`, which `tsc` still builds into `build/` (R49). The file writes the usage line with its own name.
- **The build** — `node scripts/generator.ts <folder> <version>`: an SSR build of Vite 8.3.6, by the same builder as the page (R55) — all packages inside (`ssr.noExternal`), the modules `node:*` outside, the target `node24`, the format `es`, without minification and into one module. The file opens with a comment `/*! … */`: what it is, Node 24, the call, the check by `release-verify`, the `LICENSE` of `canvas` — its `NOTICE` speaks of icons, which the file does not carry —, and the license notice of each package — `@altnovatrail/contracts`, `@bufbuild/protobuf`, `rbush` and `quickselect`; a comment's end inside the notices is broken up. A package with a license off the list stops the build: the page and the generator take the helpers of the notices from the shared `scripts/notices.ts` (the T96 amendment to R55).
- **Repeatability and equality.** Two builds of one tree give the same bytes, and the file on the package `grade-3-math` 0.2.0 and seeds 201–212 writes the same 12 files and lines as `writeModuleSamples`; `scripts/generator.test.ts` holds this, and it also runs the file from a folder without `node_modules`. On T96's commit the file and the earlier path by `tsc` gave the same bytes, and the page after the move of the helpers the same bytes as before it.
- **The release's paths** — `scripts/synthetic-module.ts`, `scripts/synthetic-module.main.ts`, `scripts/generator.ts`, `scripts/notices.ts` and `tsconfig.node.json`: Vite takes the transform options of the files of `scripts/` from it — an edit of `useDefineForClassFields` there changes the bytes of a class in `scripts/` (the T96 amendment to R66).
- **The release files** — six and `SHA256SUMS`: `release-files` writes the generator's file into `dist/` after the page (the T96 amendment to R08). `release-verify` does not restrict the name: it checks the signature, the repository, the tag and the release of `.github`.

— *Why:* the request of `modules` of 2026-11-10 (the row В36 of `modules`; E11) and the author's answers at the planning of T96 (RUN.md, T96): the name with `.mjs`, the file for the recipe of `canvas` too, the code without minification; the rest as recommended. A release file enters the CI of `modules` only once `release-verify` has accepted it (RULES.md, Hard rules), and a clone of `canvas` built by `npm ci` and `tsc` is code with no check of a signature. One file for `just synthetic-module` and for `modules` makes "byte for byte" true by construction: `ci-licenses` tries the very form that comes out.

— *Rejected:*
- **esbuild** — a new dependency for what Vite already does (R12, R55);
- **a clone of `canvas` at the tag in the CI of `modules`** — code with no signature and a build by `npm ci` and `tsc` in another repository's CI;
- **`.js`** — with no `package.json` beside it Node recognizes an ES module by its syntax, and beside a `package.json` without `"type": "module"` it does not;
- **minified code, as the page's** — a reader of `modules` could not read what goes into its CI, and the size of a CLI affects nothing;
- **the `tutor` mode in the file** — it reads the repository's `tasks/`, and the set of `tutor` comes out as an archive anyway (R50);
- **a second path by `tsc` beside the file** — two codes of one generator, and only a test would hold them equal.

— *Revisit:* when `spec` raises Node in the devcontainer — the build's target and the header; when T97 gives `--digest` — the entry point and the usage line; if Vite stops giving the same bytes — the test holds the repeat.

— RUN.md, E11, T96; R08, R12, R49, R55, R63, R66; [architecture.md](architecture.md), sections 3.4, 3.5 and 3.7; README.md; `scripts/synthetic-module.ts`, `scripts/synthetic-module.main.ts`, `scripts/generator.ts`, `scripts/notices.ts`, `scripts/synthetic.ts`, `justfile`, `.github/workflows/release.yml`.

— *Amendment 2026-11-10 (T97):* **the file's second mode is `--digest <package> <task>...`, point 2 of the request of `modules`: a line per task, its ID and the digest of its open view separated by a tab, in the call's order — by the same projection as the reference to a task in a sample, without a second walk (`moduleDigests` in `scripts/synthetic-module.ts`). A task that is not in the package and a template are all named at once after the lines of the other tasks, and the code is 1: the CI of `modules` takes the lines of the others even then; a call without a package or tasks is code 2 and the usage line of both modes. The release's tag does not change the digest, and the call does not take it. By this command the CI of `modules` compares people's samples with the commit's package (the 2026-11-06 amendment to R04 modules; R95 spec). The "Revisit" about `--digest` is closed.**

## The page's text sets from a release of `spec`

**R69. The samples page's text sets come from the file of a `spec` release `legal-1.tar.gz`: a copy `tasks/spec-<tag>/legal-1.tar.gz` of the same tag as the submodule `spec/` and the package `@altnovatrail/spec`, which `ci-licenses` checks by the recipe `release-verify` (R77 spec) and the builder holds by its sum. The build reads the part by §5 of the README of the part `legal` — the passport's schema from the same archive, then five rules in order —, and each purpose has its own current set: the measurement's is `measure`, the eval set's is `eval-set`, the child sample session's is `child-sample`. A purpose with no current set is closed, and the measurement, while `measure` has none, is open only for the author's own samples, by the draft `draft-0`. A sample's `text_set_version` is the set's ID and number joined by a hyphen, `measure-1`. The page shows the notice as its gist in Russian from the passport and as the full English text, which is the one in force.**
- **The copy and the signature.** `release-verify spec <tag> <file>` recognizes a file of `spec` by its name, `legal-<n>.tar.gz`, and checks it against `git archive` of the folder `legal/` at the tag. So the copy lies in the folder of its tag, with its `legal-1.tar.gz.sigstore.json` beside it. The tag, the name and the sum are held by `LEGAL_FILE` in `scripts/legal.ts`, and a test checks the tag against `spec_tag` in `justfile` and against the version of `@altnovatrail/spec`: a move to a new tag of `spec` raises them together with the file. The release's paths take the copy through `tasks/*`, and `scripts/legal.ts` by a line of its own; so does `page.yml`.
- **The reader** is `scripts/legal.ts`, only in the builder and the tests, on Node: ajv 8.20.0 by the 2020-12 schema, yaml 2.9.1 by YAML 1.2 with the Core schema, with no repeated keys and no anchors, and mdast-util-from-markdown 2.1.0 with GFM — the same versions as `spec/tools` has. The part's `VERSION` equals the passport's field `format`, and `tar` unpacks exactly the bytes checked against the sum. The code of `canvas` and its tests do not read `spec/`, so the reader is its own — a third beside the checks of `spec` and `api` —, and a test runs all 27 reading vectors from the same archive through it: each rule and the schema reject, and the part is accepted. The build reads the part without the release before, as `legal-check-dir` reads the folder of a copy: the rule `legal.in-force-unchanged` is the history of `spec` itself, and `spec`'s CI checked against the release before the part it then signed. A part the reader rejects stops the build.
- **The display.** The builder turns the notice's Markdown into blocks — headings, paragraphs, lists with the number of the first item, tables, quotes, code and the thematic break, and within a line bold, italics, code and the line break —, and the page builds elements from them as text, with no HTML (`page/notice.ts`): its policy needs nothing. A node of another kind stops the build. For display the text is read as it is written — CommonMark with GitHub's tables and nothing more of GFM (the README of the part `legal`, §4) —, so `~30 days~` and `[ ]` stay text; the rule `legal.markdown` reads the same text with all of GFM, as `spec`'s check does, so that a bare address is a link and is rejected. On the page, headings deeper than the third level merge into the sixth: HTML has six, and the texts of `legal-1` have two levels. Above the English text with `lang="en"` stand the gist of the notice in Russian from the passport and a sentence that the English text is the one in force (privacy 7 spec; R116 spec). The text's headings stand below the notice's heading: the first level is the fourth.
- **The statements and «куда передать файл»** are the page's words, `page/texts.ts`. The statement of age (R124 spec) is in every purpose, and the second one is «форма согласия версии … подписана и принята организатором»; in a child's session it is the parent's or guardian's form of the same version, in the draft «я автор проекта и пишу свои образцы». The file goes to the organizer by an upload link that works for a day, and is then erased from the device, as every notice says (R125 spec, R126 spec); for an eval set in `modules`, the organizer enters the sample.
- **The draft `draft-0`** is `page/sets/draft-0.json`: the notice in paragraphs, the author's statement and «куда передать файл», only for the measurement. The build takes it only while `measure` has no current set. No set of the part carries the version `draft-0` — their numbers start at 1 —, so the author's sample cannot be mistaken for a sample under a set. The notice was corrected: the writing history is by time, without pressure, as it lies in the file (R93 spec).
- **The test part** is `page/sets/test/`, in the layout of `legal`: the sets `test-measure`, `test-eval-set` and `test-child-sample` in force, texts in English — with headings, a list and a table —, and the gist «тестовый набор, не для образцов». The flag `--texts <folder>` takes it only into a page of version 0.0.0, and the builder looks in it for sets with the prefix `test-` and reads it with the same reader by the release's schema. It is not among the release's paths. The test "approved" set `test-approved-0` is gone.
- **On `spec` v0.14.0** every set of `legal-1` is a draft, so the release opens only the author's measurement by `draft-0`, and the eval set and the child sample session are closed: «пока текст согласия на него не утверждён». When the author puts a set in force, a move to a new tag of `spec` opens its purpose, with no change of code; the eval set also needs the modules' tasks in the build (R58).

— *Why:* `spec`'s answer in the planning of T96 of its RUN.md (R130 spec; Д161 there; the 2026-11-09 amendment to R93 spec) and the author's decisions in the planning of T89 (RUN.md, T89): the task whole, not by the recommendation; the author's measurement on `draft-0` while `measure` is not in force; a full reader by the vectors; a test part of its own — by the recommendations. The copy in the tree is as with `tutor`'s file (R62): a pull request checks the same build that will come out, and the build needs no network. Each purpose has its own set, because the author approves the adults' and the child's consents separately (the T84 amendment to R58), and the part gives each its own version.

— *Rejected:*
- **downloading the file in CI** — a second path beside the copy, and a pull request would check a build other than the one that will come out (R62);
- **a reader without the schema and the rules**, trusting the signature, — the part's README says not to accept a part that even one step rejects;
- **the reader's code from `spec/tools`** — the code of `canvas` and its tests do not read `spec/`, and the release's build runs without the submodule;
- **the drafts of `legal-1` in the test build, as if they were in force**, — the devices would have real texts, but a draft "is shown to nobody", and a sample would name a version that looks like a real one;
- **everything closed while the sets are drafts**, — the author could not write samples of their own on the release's page, and needs no form (R11);
- **HTML from Markdown in the builder** — it would have to be inserted as HTML, and blocks keep text as text;
- **display with all of GFM** — by the part's README the text is CommonMark with tables, and GFM would strike through `~30 days, ~90 days~` and make `[ ]` a task checkbox.

— *Revisit:* when the author puts the set `measure` in force — remove `draft-0` and the author's statement; when the modules' tasks come into the build (Д4) — the eval set under the set `eval-set`; when the version of the part `legal` becomes 2 — the file's name and the layout; when the page gets languages by R91 spec (T91) — the gist in `en` for an English screen.

— RUN.md, T89; R11, R55, R58, R59, R62; [architecture.md](architecture.md), sections 3.6 and 3.7; the README of the part `legal` in `spec`; `scripts/legal.ts`, `scripts/legal.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `page/sets.ts`, `page/sets/draft-0.json`, `page/sets/test/`, `page/notice.ts`, `page/steps.ts`, `page/steps.test.ts`, `page/texts.ts`, `page/main.ts`, `page/index.html`, `justfile`, `.github/workflows/release.yml`, `.github/workflows/page.yml`, `emulators/`.

— *Amendment 2026-11-11 (T101):* **the *Revisit* line on the modules' tasks is carried out: the build carries them (R71), and the eval set will open as soon as the set `eval-set` has a version in force. The test build, where `test-eval-set` is in force, already opens it, and the page's test saves in it a sample on an instance of a template.** — RUN.md, T101; R71.

— *Amendment 2026-11-11 (T102):* **the *Revisit* line on `measure` is carried out: on `spec` v0.15.0 the set `measure` is in force, and the draft `draft-0` is removed — the file, its type and the author's statement. A purpose with no current set is closed, the measurement too, with a reason of its own. The line on version 2 of the part `legal` is carried out too: the file is `legal-2.tar.gz`, its layout is the same, and the reader goes through the translations as well (R72).** — RUN.md, T102; R72.

## axe-core in the tests

**R70. In the tests, axe-core 4.14.0 checks the shadow tree of `<novatrail-canvas>` — by the rules of WCAG 2.2 level AA, with the root at the element itself, on every canvas kind and in forced colors. A test fails on every violation and on an "incomplete" that is not in the kind's named list. The contrast of the workbook's lines, which axe does not determine, the test computes itself. The samples page goes through the same axe whole. axe-core is under MPL-2.0, a named exception of the license check, as `lightningcss` is (R14).**
- **Why its own.** `app`'s CI does not check the subtree of the canvas element (R11 app), so `canvas`'s CI holds it: "its own axe-core in CI" is what R90 spec tells `canvas` to do.
- **The rules** are the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`: by the tag `wcag22aa` axe marks only what is new in 2.2, so all five are needed. The rule `target-size` measures 2.5.8, "at least 24 by 24 CSS pixels", and R90 spec requires 2.5.5 too, 44 × 44: the test of the row holds that measure (R28). What axe does not measure at all — the keyboard inside the sheet, zoom, the layout in a low window — is tasks T92–T94, and the result is T95.
- **How.** `axe-core` right in the tests of Vitest browser: a test runs inside the page, and `axe.run(element)` goes through the open shadow root. The helper `axeOf` and the canvas kinds — a sheet with a task and a stroke, a statement with pictures, a workbook, marks on a sheet, a worked example on a sheet, with a picture beside it and in a sheet area, all parts open, and an example on a workbook — are in `src/element/axe.fixture.ts`, which `src/element/a11y.test.ts` in the project `browser`, at both densities, and `src/element/forced-colors.test.ts` take. The tags are in `src/element/wcag.fixture.ts`, with no DOM: both the element's tests and the page's test take them. The helper's error names the rule, the node and `failureSummary`; a test also holds that the helper fails on a button without a name put into the shadow root.
- **"Incomplete".** What axe cannot determine it leaves "incomplete", not as a violation. In the workbook this is `color-contrast` of its lines: "Element's background color could not be determined because it is overlapped by another element" — the input layer `.stage` lies over the SVG of the lines. So the kind names its "incomplete" ones, a new one does not pass silently, and the test computes the contrast of the lines' text against the paper itself, by WCAG's relative luminance, on the task's workbook and on the example's workbook: no less than 4.5:1 (1.4.3). For the default colors, `#111` on `#fff`, it is about 18.9:1. The test refuses to measure a color with transparency: it has no contrast of its own.
- **The samples page.** `scripts/page.test.ts` puts `axe.source` into the page through `page.evaluate` — the page's policy does not let in a script it did not bring —, and goes through «Начало» of both builds, the notice of each open purpose, the writing, the markup form and «Открыть образец» with each file of the examples; a button without a name put into the page gives `button-name`. "Incomplete" ones are named there too: for the workbook's file, `color-contrast` of the labels of the boxes in the sample's sketch, text inside a picture under strokes, which 1.4.3 exempts: "part of a picture that contains significant other visual content". The test found one violation — `color-contrast` of the reason notes, the class `.note` with `GrayText` —, and the color became `#595959`, 7.0:1 on white.
- **The license.** axe-core is under MPL-2.0, approved by OSI, with no dependencies, only in the tests: it puts nothing of its own into the package or the page, and NovaTrail does not distribute it. So it is a named exception in `licenses.json` (RULES.md, Licenses; R12), and the check answers "2 exceptions". The version came out on 2026-10-05 — more than three days before it was installed (R12).
- **On 2026-11-10** the element has no violations on any kind, in any color mode.

— *Why:* T90 and the author's decisions in its planning (RUN.md, T90): a test of its own for the contrast of the workbook's lines and "incomplete" by the kind's list, the samples page in the same task, both by the recommendation; `axe-core` right in the tests — by the plan's recommendation. The plan's probe on the page's build found zero violations in the element, and one in the page.

— *Rejected:*
- **`@axe-core/playwright`** — it needs Playwright's `Page` object, and a test of Vitest browser runs inside the page; one more package under MPL-2.0 for what `axe.run` does itself;
- **exceptions of rules for known violations until their tasks** — there are no such violations; a future one is fixed, or gets an exception with a task's number, when it appears;
- **accepting "incomplete"** — nothing would hold the contrast of the workbook's lines;
- **only the tag `wcag22aa`** — it carries only what is new in 2.2.

— *Revisit:* when axe learns to determine the background under the input layer — remove the workbook's "incomplete"; when T92–T94 change the row, the sheet and zoom — their kinds in `KINDS`; with a new version of axe — the list of "incomplete" and the rules.

— RUN.md, T90; R12, R14, R28; [architecture.md](architecture.md), section 3.7; `src/element/axe.fixture.ts`, `src/element/a11y.test.ts`, `src/element/forced-colors.test.ts`, `scripts/page.test.ts`, `page/index.html`, `licenses.json`, `package.json`.

## Modules' tasks on the samples page

**R71. The samples page's build carries modules' tasks for an eval set — a copy of what `module-kit` v0.3.0 writes by its command `open` about the release `modules` v0.2.4 with the templates' seeds 1–5. The copy lies in `tasks/modules-v0.2.4/`, and `ci-licenses` writes the output anew from the files that `release-verify` accepted and checks it against the copy byte for byte. The page takes sheets with one answer place `anywhere` or `sheet` and workbook pages, with the media of their statements and the module manifest, and leaves to `app` the choice that is marked by a tap. A sample's reference names the release that issued the package, the module, its version and the package digest, the task, for an instance its seed, and the digest of the open view that `module-kit` gives.**

- **Why a copy, and not `module-kit` in the build.** The release's build runs with no network, no token and no `spec/`: "The recipe runs with no network, token or spec/" (`.github`'s shared `release.yml` v0.1.22, the step of the previous release's file). So the build takes a file of the tree, as it takes `tutor`'s copy (R62), and `ci-licenses` has the network and `spec/`. The recipe `just modules-open`:
  - downloads the `module-kit` binary for its machine, `linux_amd64` or `linux_arm64`, and the archives of the packages that `module-kit open` will take from the copy's index — for each module the newest version of format 0.4 that the index has not withdrawn (`scripts/modules.ts packages`). The archive's name is `sha256-<hex>.tar.gz` from the package digest, in the release of its entry (the second 2026-11-02 amendment to R63 spec);
  - has `release-verify` accept the binary, the copy's index and each archive, unpacks the packages and runs `module-kit open` with `--index` and `--latest` — the copy's index, the newest on the day of the copy —, and with the seeds from `justfile`;
  - checks the output against the copy (`check`, in `ci-licenses`) or writes the copy anew (`copy`, on a move to another release or to other seeds).
- **What is in the copy.** The release's `module-index.json` with its signature, `open-views.json` as it is, and for each module `modules/<ID>/<version>/` — `LICENSE`, `NOTICE` if there is one, and only those files of `media/` that the statements of the tasks the page takes name: 164 pictures, 1.89 MB of the package's 12.3 MB of media, — without the media of lessons and solutions. The copy is 2.8 MB, and the page's file about 3.6 MB. `MODULES_FILE` in `src/eval/tasks.ts` holds the tag, the seeds and the sum of `open-views.json`, and a test holds their agreement with `justfile`.
- **What the page takes.** `kindOf` in `scripts/page.ts` is one for the build and for the selection of the copy's media: a workbook page, a sheet with one place `anywhere` — among them a choice written by hand too, the check `choice` with the place `anywhere` (§15 of the README of the module format) —, and an essay, a sheet with one place `sheet`. Tapped choice (`binding: choice`) is shown and marked by `app`, and the element skips it (R42), so the page does not take it and it does not stop the build. On v0.2.4 this is 758 views of 883: 741 sheets of `olympiad-math` — of them 110 instances of 22 templates —, 12 workbook pages of `grade-3-math` and 5 essays of `english-essays`; 125 tapped choices are outside it.
- **What the build checks.** `openViewsOf` reads `open-views.json` of the format `module-kit-open-views` version 0 and of module format 0.4: each view is only the fields of the open view, the same walk as for `tutor`'s file, and its `canonicalText` gives the very digest that `module-kit` wrote, otherwise `TypeError`. So the sample's digest is the one that the `just eval-match` of `modules` checks it against (the T59 amendment to R25 modules). A picture is PNG or WebP, otherwise the build stops.
- **The sample's reference.** The source `modules` is `tag`, `module`, `version`, `package_digest`. By the contract `tag` is "the release of `modules` whose index holds the package", and this is the entry's `release` — the release that issued the package: v0.2.1 for `olympiad-math` and `grade-3-math`, v0.2.0 for `english-essays`. The tag does not change when `canvas` moves to a new release of `modules` with the same package. `task` is the task's ID, for an instance the template's ID, and `seed` is its seed in decimal digits.
- **The page.** The module manifest gives the element the digit height (R32), and the media are a `Blob` from the build's data by the statement's reference. The license notices of the file name each module: Apache-2.0, `LICENSE` — the same text as `canvas`'s, otherwise its own —, and its `NOTICE`: for `olympiad-math` this is the MIT of `mathtrail-standalone`. The choice of a task, the file's name and the purposes are the T101 amendment to R58.
- **The measurement is on `tutor`'s file.** So the author decided (RUN.md, T101): the tasks by which `tutor` measures do not change in the middle of the measurement. Д4 stays open for the measurement.

— *Why:* `modules`' request for its T62 — the author's first samples in the eval sets of modules, above all of templates, of choice by hand and of essays, which the generator does not draw (R63) —, and the author's decisions in the planning of T101, 2026-11-11: the measurement on `tutor`, seeds 1–5 and `<id>.json` — by the recommendation, the task whole — not by the recommendation. A copy, not a download: the release's build has no network, and a pull request checks the very build that will come out (R62).

— *Rejected:*
- **`module-kit` in the build** — the release's build has no network, so the binary and the packages would have to be put in the tree;
- **a copy of the packages' archives with a choice of a template's instance of our own** — the choice of an instance by seed is the format's generator, the code of `module-kit` (R31 module-kit), and 11 MB of the archive of `olympiad-math` in the tree;
- **a copy of the whole output of `open`** — 15 MB, of them 12 MB of media of lessons and solutions that the page does not show;
- **the measurement on `modules`** — the tasks by which `tutor` measures would change in the middle of the measurement;
- **`--latest` from the newest release of `modules` on every run** — the copy would stop matching with no change in the tree; a new release comes by a change of the copy of its own, as `tutor`'s file does;
- **seeds for each template as a list of its own** — `module-kit open` takes one shared list, and R43 module-kit rejected `--seeds <file>`.

— *Revisit:* when `modules` issues new versions of modules or withdraws one — the copy anew, `just modules-open copy`, with the tag and the sum; when `module-kit` comes out with a new projection or output format — the same; when `spec` gives `eval-set` in force — the move to the tag opens the eval set with no work on the page; when the measurement asks for modules' tasks — Д4.

— RUN.md, T101, Д4; R11, R32, R42, R58, R62, R63, R69; [architecture.md](architecture.md), sections 3.5 and 3.6; R43 module-kit; R04 modules, R25 modules; `justfile`, `scripts/modules.ts`, `scripts/modules.test.ts`, `scripts/page.ts`, `scripts/page.test.ts`, `src/eval/tasks.ts`, `src/eval/tasks.test.ts`, `page/main.ts`, `page/texts.ts`, `emulators/watch.ts`, `emulators/page-android.ts`, `tasks/modules-v0.2.4/`.

## The move to `spec` v0.15.0

**R72. `canvas` is on `spec` v0.15.0: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag. The page takes the text sets from `legal-2.tar.gz` — the part `legal` of version 2, where a text version has translations —, and on it `measure-2` and `eval-set-1` are in force: the release opens the measurement and the eval set, and the child sample session is closed until a set `child-sample` is in force. The author's draft `draft-0` is gone.**

- **What the tag tells** — Д193, Д202, Д205 and Д207 in `spec`'s RUN.md: `measure` in force, version 2 current (R139 spec, R140 spec, R141 spec), `eval-set` of version 1 in force, the release's file `legal-2.tar.gz` with the field `translations`, and `child-sample` a draft until T117 of `spec`. Д189 — the generator and the digest command — was done by E11. `spec` recorded В75 by option (a).
- **The part at version 2.** A text version's translations are the files `texts/<ID>/<n>.<tag>.md` that the `translations` of the version's entry name; they have no force, the English text is the one in force (the README of the part `legal`, sections 2 and 4). The reader `scripts/legal.ts` goes through them with the rules `legal.files`, `legal.markdown` and `legal.in-force-unchanged`, and for the last one through the translations of the entry of the release before too, as `spec`'s reader does. The page does not show translations. The types are `@altnovatrail/spec/legalv2`: the package 0.15.0 gives it instead of `legalv1`.
- **The draft is removed.** The *Revisit* line of R69 told to remove `draft-0` once `measure` was in force. The author writes their own samples as a volunteer — with a form that the author accepts as the organizer. A purpose with no current set is closed, and the measurement too — with a reason of its own —, so the page will not open the measurement without a consent text if the set goes out of force.
- **What did not change.** The devcontainer template, RULES.md, the sample's contracts, `format-0.4`, `release-verify`, `sample-check`, `docs-check` and the license check are the same (`git -C spec diff v0.14.0 v0.15.0`). `.github` has released nothing newer than v0.1.22.

— *Why:* the author's word of 2026-11-11 — «переходи на spec последней версии» —, and the tag itself opens the purposes that the page was waiting for: the eval set for T62 of `modules` and the volunteers' measurement.

— *Rejected:*
- **keeping `draft-0` as a fallback path** — R69 told to remove it, and a measurement without a set in force would open samples without a consent text;
- **showing the notice's translation into Russian** — a translation has no force, and the page already shows the gist in Russian from the passport (R116 spec).

— RUN.md, T102, table 3; R67, R69, R71; [architecture.md](architecture.md), section 3.6; the README of the part `legal` in `spec`; `scripts/legal.ts`, `scripts/legal.test.ts`, `page/sets.ts`, `page/steps.ts`, `page/texts.ts`, `page/main.ts`, `scripts/page.ts`, `justfile`, `tasks/spec-v0.15.0/`.

## The sheet's zoom

**R73. The sheet is zoomed by the row's buttons «Крупнее» and «Мельче» — from fit to the width up to twice as large, in steps of a quarter —, one zoom for the whole page, in its memory. A zoomed-in sheet scrolls in its container across too: by the row's «Левее» and «Правее», two fingers and keys —, and the statement and the parts of the example stay at the fit width, at the left edge. The drawing surface is only the visible part, on both axes. With this the print of the workbook's lines grows up to 200 %, and the nonconformance 1.4.4 that `app` declared goes away (R90 spec).**
- **The zoom** z is 100, 125, 150, 175 or 200 %; `k = min(A / 1000, 1) × z`. The fit holds the limit of 1000 CSS px of R23, and the zoom goes beyond it: on a wide screen at 200 % the sheet is 2000 CSS px. The browser's zoom works as before: it grows the sheet while the area is wider than 1000 CSS px, and the buttons do always (technique G178).
- **The buttons** are the pair «Крупнее» and «Мельче», "Zoom in" and "Zoom out", after «Выше» and «Ниже», with the icons `zoom-in` and `zoom-out`; at the limit a button is disabled, `aria-disabled`, and keeps focus. While z is above 100 %, they are followed by the pair «Левее» and «Правее», "Left" and "Right", with the icons `arrow-left-alt` and `arrow-right-alt`, which are not mirrored: the sides are the screen's. The pair across stands after the zoom pair: the last «Мельче» hides it and does not move the buttons under the finger. In a right-to-left row — by `dir`, as its icons are mirrored (R46) — «Левее» still stands to the left of «Правее». The worked example has both pairs too. The four values wait for the tables of words and of icons of architecture 6 spec — row В76 of table 3 of RUN.md —, and until then stand in `labels.ts` and `scripts/icons.ts`.
- **For the whole page.** The zoom is in the memory of the module `session.ts`, beside the pen mode (R29): a new task is a new element (R20), and it opens at the same zoom until the page is loaded anew. Nothing is stored and nothing leaves, and the agreement with `app` is as before. A press on any sheet lays out every sheet of the page anew, and while someone writes or erases on one of them it does nothing: nothing moves under the pen (R33).
- **The layout.** A column as wide as the sheet, `1000·k`, and in a wide area centered, as before. While z is above 100 %, the container scrolls across too, `overflow-x: auto`, left to right in any direction of the page: the statement and the list of parts keep the element's direction as the style computes it — by the attribute `dir` or by `direction`. The statement and the parts are at the fit width, `min(A, 1000)`, and stick to the left edge of the container: they wrap as at 100 % and do not move across. At 100 % the container does not scroll across, and everything is as before the zoom.
- **The stage** sticks to the top and to the left edge of the container and is as wide as its visible part: the drawing surface is the visible part on both axes, and its buffer does not grow with the zoom. In an element without a height the stage is still as tall as the whole sheet: at z 2, a column of 1000 and density 2 the buffer is 2000 × 5600 pixels, ≈ 45 MB, twice the 22 MB at 100 %.
- **The view.** `View` is `k`, `vx` and `vy`: `vx` is the left edge of the visible part in units of the sheet. The element takes `k` by the sheet's width on the screen — the drawing surface is no longer as wide as the sheet —, and `vx` and `vy` by the offset of the drawing surface from the sheet. The SVG layers get the `viewBox` `vx vy W/k H/k`, the drawing surface a shift by `−vx` and `−vy`, the input `x = (clientX − r.left) / k + vx`. For the eraser the visible part is clipped by the container across too, so beyond the edge it takes nothing (R22). The crop, the groups, the boxes and the marks are in units of the sheet and know nothing of the zoom.
- **The anchor** is the top left corner of the visible part, as R23 holds `vy` at a new width: a new `k` — from a press, the window or the browser's zoom — leaves it at the same place of the sheet if the top, or the left edge, of the sheet has left the view. While the top of the sheet is in view, the sheet grows down and to the right, and nothing scrolls.
- **Across.** «Левее» and «Правее» scroll what two fingers would scroll that way, by ⅘ of the visible width, `behavior: "instant"`, and stand disabled at the edge, as «Выше» and «Ниже» do (R33). The chain is the same: the container, the nearest ancestor with `overflow-x` scrolling that can scroll, otherwise the page; an ancestor with `overscroll-behavior-x: contain` or `none` does not pass it on. In a right-to-left ancestor `scrollLeft` goes from 0 at the right edge to minus the overflow. Across, the row covers nothing.
- **Two fingers** (R29) scroll across too while z is above 100 %. The threshold is the distance their midpoint has traveled, 8 px, and the first step comes without a jump: the share of the path along each axis that lies past the threshold. If, when crossing the threshold, the midpoint has traveled twice as far along one axis as along the other, the gesture goes along it alone to its end — the "rail", `RAIL` in `hands.ts`: scrolling down does not drift across. Otherwise along both. What to scroll on each axis is chosen by the gesture's first step along it. On a sheet that does not scroll across — at 100 % —, the threshold counts only the path down, as before.
- **The keyboard.** While the sheet is wider than the container, the arrows left and right scroll the region of T93 across, by the browser. An element without a height whose zoomed-in sheet is wider than it is a region with a Tab stop too: by the overflow across (the axe rule `scrollable-region-focusable`).
- **The worked example:** the drawing surface takes no input, and a finger scrolls the sheet on both axes by native scrolling. «Дальше» brings the picture's area on the sheet into view across too, `scrollIntoView` with `inline: "nearest"`.
- **The tests** are `src/element/zoom.test.ts`, at density 1 and 2, at widths of 320, 640, 1000 and 1400 CSS px: `k`, the drawing surface's buffer, the statement at the edge, the anchor, a stroke and the eraser with a shift across, one crop at any zoom, «Левее» and «Правее» under an ancestor's zoom, the zoom for the whole page and the pen, the workbook's print twice as large at 320 and 640 (1.4.4), a region without a height with axe and the arrows, two fingers across and the rail, the layers with one view. The rail is `src/core/hands.test.ts`, the steps `src/core/zoom.test.ts`, `vx` `src/core/screen.test.ts`.

— *Why:* the author's answers in the planning of T94, 2026-11-11. Buttons of its own, not the browser's zoom: with `k = A / 1000` the browser's zoom reduces A in CSS px, and the workbook's print on an iPad and in an `app` column narrower than 1000 px does not grow at all, while Understanding 1.4.4 requires that up to 200 % "it should still be possible to get 200% text enlargement in some way compared to the default 100% zoom"; the buttons are technique G178. The zoom is for the whole page: the author first chose a zoom per element, and then, on the agent's argument — R29 keeps the pen mode on the page for the same reason —, the page, by the recommendation. «Левее» and «Правее» are in T94 whole, not by the recommendation: they had been proposed as a task of their own, T103. The labels and the icons are by the recommendations. The anchor, the visibility of the pair across and the rail's threshold were decided by the executor. Before the work a separate agent checked the design; its corrections are `k` by the sheet and not by the drawing surface, the order of the pairs in the row, the visibility of the pair across by the zoom and not by the overflow, the rail, and the zoom on the page. The sources are [architecture.md](architecture.md), section 4.

— *Rejected:*
- **only the browser's zoom with a lower limit of the sheet's width** — R23 rejected it: on a narrow tablet the sheet would scroll across at 100 % too, and on an iPad it would still not reach 200 %;
- **a two-finger pinch** — more code, and its single-pointer replacement under 2.5.1 is the same buttons;
- **a zoom per element, from 100 %** — the learner would press «Крупнее» on every task; **a property `zoom` and an event** for `app` — a new clause of the agreement for what the page remembers anyway;
- **«Левее» and «Правее» as a task of their own or as a declared nonconformance with 2.5.1 and 2.5.7** — the author's answer;
- **«Увеличить» and «Уменьшить»** — longer, and the row wraps more often; **«Влево» and «Вправо»** — do not pair with «Выше» and «Ниже»;
- **the icons `arrow-back` and `arrow-forward`** — `arrow-forward` is already «Дальше»'s;
- **the anchor at the middle of the visible part** — R23 has one rule for any new `k`, and the line that is read from the top stays in place;
- **«Левее» and «Правее» by the overflow** — they would come and go with the window's size and the scrollbar, and the row would change under the pen too;
- **a drawing surface as wide as the sheet** — at z 2 and a column of 1000 it would be 2000 CSS px.

— *Revisit:* the zoom's step, the rail's threshold and the row in three lines on a narrow tablet — on devices (Д7); the drawing surface's buffer in an element without a height — there too; the zoom in the agreement with `app`, if `app` wants to remember it longer than the page does.

— *Consequence:*
- the T94 amendments to R23, R28, R29, R33, R34, R36, R42 and R46;
- **table 3 of RUN.md** — В76 «в реестр spec»: the four values in the tables of architecture 6 spec and the removed nonconformance 1.4.4 of the workbook's lines at `app`;
- **T95** — 1.4.4 is not among `canvas`'s nonconformances.

— RUN.md, T94; [architecture.md](architecture.md), sections 2.7, 3.1, 3.2, 3.3, 3.7, 3.8 and 4; README.md; `src/core/zoom.ts`, `src/core/screen.ts`, `src/core/hands.ts`, `src/element/session.ts`, `src/element/index.ts`, `src/element/tools.ts`, `src/element/labels.ts`, `scripts/icons.ts`, `src/element/icons.ts`, `src/element/zoom.test.ts`.

— *Amendment 2026-11-12 (T110):* **the row's four values — «Крупнее», «Мельче», «Левее» and «Правее», "Zoom in", "Zoom out", "Left" and "Right", with the icons `zoom-in`, `zoom-out`, `arrow-left-alt` and `arrow-right-alt` without fill and without mirroring — are now in both tables of architecture 6 spec: `spec` recorded В76 by recommendation (a) (Д219 spec). The notes that they wait for В76 are removed from `src/element/labels.ts` and `scripts/icons.ts`, and the test of the buttons' words `labels.test.ts` holds these four too.** — R77; RUN.md, T110.

## Declared nonconformances

**R74. What the element does not yet meet of the standard of UI packages (R90 spec) is named by [architecture.md](architecture.md), section 3.10 — the criterion, what stands instead and when it goes. Two criteria are declared: 1.4.12 — the workbook's print does not take the user's text spacing —, and 3.1.2 — the value of the demo in a workbook box, and the name of the sheet's region in an element without an attribute `lang` from the table of labels, sound in a language not their own. `canvas` has no nonconformance 1.4.4 (R73), and the answer in handwriting is declared by `app` (О-25).** The result of epic E10, T95, 2026-11-11.
- **1.4.12.** The workbook's print drops the inherited spacing, `all: initial`, and each piece of it keeps the layout's width, `textLength` with `lengthAdjust="spacingAndGlyphs"` (R36): the user's spacing does not change it, wherever it is set (the probe of T95). Instead: print up to 200 % by the buttons «Крупнее» and «Мельче» (R73), and the consumer's font. There is no deadline: the place of a piece and of a box is set by `spec`'s page rule, `format/page.yaml` (the T85 amendment to R35), and this goes only if the rule gives the lines room for spacing — question В77 in RUN.md.
- **3.1.2, the value of the demo.** The demo step `fill` writes the value into the box (R61), and the box's name, the item of the list of parts and the announcement of the region `status` speak it in the language of the labels, not of the lines (T91; R42). This is heard when the value is a word and the interface language is not the language of the module's lines. It goes with a task of epic E12: the value as its own node with the language of the lines, in all three places.
- **3.1.2, the name of the region.** The scroll container has no `lang` of its own — it would fall on the statement too —, so the English name of the region sounds in the element's language when the element has no attribute `lang` from the table of labels: there is no attribute at all, or it is outside the table (T93). `app` always sets the attribute, and its languages are `en` and `ru` (R92 spec), so this never happens with it. The attribute outside the table goes with a task of epic E12: the labels' language on the container, and the element's language on the column, the only node in it. Without the attribute the element's language is inherited, and it cannot be given to the column.
- **Not declared:** the row of buttons that in a low window goes away with the scrolling in an element without a height — `app` gives the element a height (T92; section 3.3); the order of the arrows in the pair «Левее» and «Правее» on a right-to-left page (T94) — `app` has no such pages, and the languages `en` and `ru` are written left to right; the handwriting of the samples page — it is the sample itself, the exception of 2.1.1 for a path.
- **A new nonconformance** goes into section 3.10 and into a row «в реестр spec» for `app`'s page "Accessibility", and one that is gone leaves them the same way.

— *Why:* R90 spec tells a package to declare by itself, and `app` to gather what is declared. The list was gathered from «Открыто» of T90–T94 and from the criteria that the tasks of E10 did not touch. Of them only 1.4.12 would fail without a declaration: Understanding 1.4.12 exempts content from spacing that did not take effect only if it is "not actively and purposely preventing" it, and the workbook's print prevents it on purpose. The sources are [architecture.md](architecture.md), section 4.

— *Rejected:*
- **print with the user's spacing** — without `textLength` a piece wider than its place would run onto the box, and the box's place is `spec`'s page rule and the place of its crop (R38). A margin for spacing in the layout is a matter for `spec`'s rule: 0.12 of the font size for each character — more than a fifth of a digit's width, 0.53 of the font size by the table of widths (R35) —, and the workbook's lines would become shorter for every learner;
- **not declaring 3.1.2 of the demo's value**, since the boxes' values are usually numbers: the format does not forbid a word in a box;
- **the region's name through `aria-labelledby` on a node with `lang="en"`** — the name the browser computes is a string without a language, and the path through the column, which would hold the element's language, is shorter;
- **declaring the row in a low window a nonconformance with 2.5.1** — decided by T92: `app` gives the element a height.

— *Consequence:*
- table 3 of RUN.md — В77 «в реестр spec»: what `canvas` declares and where, and the workbook's page rule;
- table 2 of RUN.md — epic E12.

— RUN.md, T95, tables 2 and 3; R28, R33, R34–R37, R42, R61, R70, R73; R92 spec; [architecture.md](architecture.md), sections 2, 3, 3.3, 3.9, 3.10 and 4; README.md.

— *Amendment 2026-11-12 (T106):* **with an attribute `lang` that the table of labels does not know, the region's name sounds in its own language: the scroll container takes the labels' `lang` — English —, and the column, the container's only node, takes the attribute's `lang`, so the statement, the parts and the sheet stay in the element's language. The second nonconformance 3.1.2 has narrowed to an element without an attribute `lang`.** "Does not know" means that the RFC 4647 lookup found nothing in the table, and the labels are the fallback English ones: so it is with `de`, `fr-CA` and an empty attribute, which names the language unknown and gives it to the column as such, but not with `ru-RU` and `en-GB`. The languages are then set by the same step as the region's name, `#nameRegion` — on a new value of the attribute, its removal and a change of canvas kind. With an attribute from the table the name is already in the element's language, and neither the container nor the column has a `lang` of its own, as before (T93). Without the attribute the element's language is inherited: the element does not read an ancestor's language (R28; [architecture.md](architecture.md), section 3.3), and cannot name it for the column, so this nonconformance stays, with no deadline, and `app`, which always sets the attribute, does not have it. Rejected:
- **`lang` on the container and the column only while the container is a region** — a `lang` without a name falls on nothing, and two steps, the role and the language, would diverge in the places where the region appears and goes: on scrolling, on focus and on `blur`;
- **the column's language as an ancestor's language read along the tree when there is no attribute** — the element would watch the `lang` of all its ancestors and of the document, and a change in them gives no events; `app` sets the attribute, and such a consumer can only be a third party's.

— RUN.md, T106; table 3, В77; [architecture.md](architecture.md), sections 3.3 and 3.10.

— *Amendment 2026-11-12 (T107):* **the first nonconformance 3.1.2, the value of the demo, is gone: the value of the step `fill` sounds as its own node in the language of the lines — in the box, in the item of the list of parts and in the announcement of the region `status` —, and not as part of a label in the language of the labels (the T107 amendment to R61). Of the declared ones, 1.4.12 of the workbook's print and 3.1.2 of the region's name in an element without an attribute `lang` remain.** Section 3.10 holds the value in a row of "What the element holds", by the tests `parts.test.ts` and `labels.test.ts`, and the nonconformance's row is gone. For `app`'s page "Accessibility" — a change of row В77 of table 3: `spec` has not recorded it yet (`spec`'s RUN.md on `main`, 6a4ba48, read 2026-11-12). How VoiceOver and TalkBack hear the value behind the box, Д7 will check.

— RUN.md, T107; table 3, В77; table 4, Д7; [architecture.md](architecture.md), section 3.10.

— *Amendment 2026-11-12 (T110):* **`spec` recorded В77 by recommendation (a): `app` takes the nonconformances onto its page "Accessibility" from section 3.10, the card architecture 3.2 spec names it, and the second 2026-11-12 amendment to R90 spec says that with `canvas` v0.3.14 or newer `app` takes only 1.4.12 — it never has the region's name without an attribute `lang` (Д218 spec).** — R77; RUN.md, T110.

## Tests under load

**R75. A test's time limit is its own: a test or a hook gets a timeout of twenty times its own time on a free runner of CI, rounded up to whole tens of seconds, when this is longer than its project's default limit, and one helper holds the rule, `budget()` in `src/core/budget.fixture.ts`. A test waits for the event it waits for, not for time. An enumeration checks each of its states once and gathers the violations under one `expect`, when these are the same checks for less work. (2026-11-12, T105)**
- **The projects' default limits** — Vitest 5.1.0: in Node 5 s per test and 10 s per hook, in the browser 15 and 30 s. So a limit of its own goes to a Node test from 0.3 s — from this time on Vitest writes the test a line in the log —, to a Node hook longer than 0.5 s and to a browser test longer than 0.75 s. The rest stay on the default limits, and the rule removes their own literal from them too: so went the 40 s of two tests of `emulators/volunteer.test.ts`, which with fake clocks take milliseconds, and the 60 and 120 s of two tests and a hook of `scripts/generator.test.ts`.
- **A test's time** is its line in the log of a green run of "TypeScript / test": coverage is on there, and the browsers of the other projects run beside the project `node`. A hook has no line, and its time is the file's line minus the lines of its tests. A test writes only its time, `{ timeout: budget(1_450) }` as the second argument, and a hook `budget()` as the last one. The times were taken from the run of `main` 43118509970 of 2026-11-11. The enumeration of six steps of `work.test.ts`, which T105 rebuilt, has no line there, and its time is an estimate: 1.2 s on a free container, multiplied by 2.6 — the ratio of the runner to the container for the earlier enumeration, 19.2 s to 7.3 s. The CI line of its pull request will replace it.
- **Twenty times** is the margin for a loaded host, by T105's measurements in the container, the branch and `main` by one recipe at the same time. At a load average of 42–85 on 20 cores, "app's path" of `consumer.test.ts` went past 15 s — eighteen of its own times on the runner —, and `scripts/synthetic.test.ts` and `scripts/generator.test.ts` past ten of their own. `main` failed there with 22 and 18 tests a run, and the branch with ten times with 4 and 5, the ones named. At a load average of about 100 both fail, 15–33 tests a run: there the tests need 20–30 of their times on the runner, and the limit does not hold such a load. The limit catches a hang and a twentyfold slowdown. A smaller one shows in the tests' times in the CI log.
- **Its own event, not time:** `pictured` in `src/element/axe.fixture.ts` waits for the media files and their parsing — `arrive()` from `pointer.fixture.ts` —, not for a one-second poll of the number of pictures by `expect.poll`. The media are a spy, and if the element did not ask for the files, the helper fails at once. The page's tests, `scripts/page.test.ts`, wait for a node, for visibility and for the form by Playwright's waits — `waitFor` and `waitForFunction` —, not by polls. The polls of `src/element/hands.test.ts` stay: their condition already holds at the first read — the row is updated by a microtask of the input event that the test waits for anyway.
- **The probe, storage:** the test `probe/probe.test.ts` closes the page that wrote and reads the record in a new page of the same file and context, not after a reload. Under load — a load average of 43–80 on 20 cores — the first document after a `reload()` of the file in Chrome Headless Shell read the storage as empty in 1–4 of 40 repeats and stayed so, although a new page of the same context and a second reload saw the record. Waiting for the record to reach the browser's storage before the reload did not change this: there is no event here that the test would have failed to wait for. The new page passed 160 repeats of 160 at a load average of 60–70. The reload on devices is held by the probe itself (T29, T74).
- **The enumeration of six steps** of `work.test.ts`: a step's checks depend only on the steps before it, so each of the 19,530 states is checked in the first sequence with that beginning, and the end in all 15,625. The violations gather as a line with the steps, as in the enumeration of `hands.test.ts`, and the comparison is Node's `isDeepStrictEqual`, stricter than `toEqual`. Outside Vitest — 0.36 s instead of 4.67.

— *Why:* a timeout holds against a hang, not against slowness, and the tests' times under the host's load grow 2–30 times (T93, T94, T105). A limit of its own for each test, not a shared one for the project, the author decided as early as T62 ([E7's archive](plan/E7.md)): a shared limit would hide a test that slowed down by a mistake. The helper holds the multiplier in one place, and the test keeps what was learned about it — its time. The author first chose ten times — by the "seven times of app's path" at a load average of 101 that T93 counted from a limit of 5 s. The browser's default limit is 15 s, so there were about eighteen of them, and the measurements at load 42–85 left five failures a run with ten times: by them the author chose twenty.

— *Rejected:*
- **ten times** — at load 42–85 they do not hold "app's path", the synthetic samples and the generator (the measurements above);
- **thirty times** — they hold a load of about 100 too, but the limits reach 3–6 minutes, and a hung test holds CI that long;
- **a shared `testTimeout`, `hookTimeout` or limit of `expect.poll` in `vitest.config.ts`** — what T62 rejected, and for every test at once;
- **a project of its own for heavy tests** — its `testTimeout` is the same shared limit, only for a group, and the heavy tests are single tests of light files;
- **`--maxWorkers`** — four threads in the container did not help (T93), and the host's load does not depend on the number of Vitest's threads;
- **`sequence.groupOrder`, the browsers after Node** — CI is longer, and it does not save from load from outside;
- **`retry`** — hides a race instead of waiting for its event;
- **fewer cases** — the test catches less (the risk of epic E12); rebuilding the enumeration of `hands.test.ts` and the comparison of `marks.test.ts` — a gain of less than twofold: the time there is in the code under test;
- **waiting before the reload until the record reaches the browser's storage** — checked under load: the reloaded document still read it empty.

— *Consequence:* a new test gets `budget()` with its own time when twenty of its times are longer than the project's limit, and a test whose time on the runner has grown gets a new time. A wait in a test is the event it waits for.

— RUN.md, T105; R12, R13, R43, R52; T93, T94, T102, T104; [architecture.md](architecture.md), section 3.7.

## The move to `spec` v0.15.1

**R76. `canvas` is on `spec` v0.15.1: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, the copy of the part `legal` is `tasks/spec-v0.15.1/legal-2.tar.gz`, and the devcontainer is the output of the template's recipe, with Go 1.27.4. One task is one session (R143 spec): `.claude/settings.json` takes from the template the hook `UserPromptSubmit`, `spec/tools/session/`, compaction at 400 thousand tokens and the claude.ai connectors turned off, beside the deny rules on `samples/`, and RUN.md takes the template's paragraph on the session.** 2026-11-12, T109.
- **What the tag brings `canvas`** (`git -C spec diff v0.15.0 v0.15.1`, read 2026-11-12):
  - RULES.md, How we work, — the rule "one task is one session" and the hook that holds it (R143 spec; T129 of `spec`). `canvas`'s CLAUDE.md imports RULES.md, so the rule applies with the submodule;
  - the template: `.claude/settings.json` — the keys `autoCompactWindow`, `disableClaudeAiConnectors` and `hooks`, and RUN.md — the paragraph «Одна задача — одна сессия» in «Как пользоваться». `canvas` takes both changes as they are: the settings by the template's keys beside its own `permissions` (R15), RUN.md by the same paragraph after the line that starts a task;
  - `.devcontainer/Dockerfile` — Go 1.27.4 instead of 1.27.3 because of GO-2026-6859 (the 2026-11-11 amendment to R64 spec). The recipe `just new-repo-draft canvas typescript 3.2 v0.15.1` in a temporary clone of `spec` gave a `.devcontainer/` with which `canvas`'s Dockerfile now matches byte for byte, and `devcontainer.json` and `host-network.sh` did not change. `canvas` does not need Go: it comes with the stage `toolchain` into every repository (R64 spec);
  - the part `legal` did not change between the tags, and `legal-2.tar.gz` of v0.15.1 is a new archive of the same content: the files are the same, the dates inside are 2026-11-11 21:52 instead of 03:30, and the sum is different. The copy moves to `tasks/spec-v0.15.1/`: CI checks it by the recipe `release-verify spec` of the tag that `spec/` is on (R69). `measure-2` and `eval-set-1` are still in force, and `child-sample` is a draft;
  - the packages 0.15.1: the types of `tools/types` did not change, and `@altnovatrail/contracts` has a new field `teaching_modules` in `novatrail.api.v1`, which `canvas` does not read: it takes from the package `novatrail.eval.v1` and the vectors `vectors/eval/v1/`, and they are the same;
  - the format, `format-0.4`, `release-verify`, `sample-check`, `docs-check` and the license check did not change. `canvas` does not call the new recipes `tokens-report` and `session-test`.
- **What the tag does not bring yet.** The rest of R143 spec — a thin CLAUDE.md, the bodies of done tasks to the archive at once, the "Sources" of `docs/architecture.md` into a file of their own, the translation of `docs/` into English — is on v0.15.1 still `spec`'s tasks T130–T139, and what each repository takes, T123 of `spec` will name as a row of COORDINATION.md. `canvas` takes this by tasks of its own when they come, not by this move.

— *Why:* the author's word of 2026-11-12 — «переходи на spec последней версии» —, and the newest tag is v0.15.1 (`gh release list -R altnovatrail/spec`, `npm view @altnovatrail/spec version` — 0.15.1). The hook is taken now, not by the task T123: RULES.md, which `canvas` imports with this tag, already says that the hook of `.claude/settings.json` holds the rule, and without the hook the rule's words about it would be untrue.

— *Rejected:*
- **keeping the copy of `legal` of the tag v0.15.0**, since the content is the same, — `release-verify` checks the file by the release's signature by the tag of `spec/`, and `ci-licenses` takes the tag from `spec_tag` of `justfile`: a copy of another tag would set them apart, as it would the test `scripts/legal.test.ts`, which holds the copy's tag to the package `@altnovatrail/spec`;
- **taking the template's `.claude/settings.json` whole** — the template does not know the deny rules on `samples/`, and R15 holds them.

— RUN.md, T109; R13, R15, R45, R69, R72; R64 spec, R143 spec; [architecture.md](architecture.md), sections 3.4 and 4; `.devcontainer/Dockerfile`, `.claude/settings.json`, `justfile`, `scripts/legal.ts`, `tasks/spec-v0.15.1/`.

— *Amendment 2026-11-12 (T110):* **what the tag v0.15.1 did not bring yet — a thin CLAUDE.md, the bodies of done tasks to the archive at once, the "Sources" into a file of their own and the translation of `docs/` — `canvas` took with v0.16.3 by the task T110 (R77).** — R77; RUN.md, T110.

## `spec`'s line 0.16: saving tokens

**R77. `canvas` is on `spec` v0.16.3 and takes the task T123 spec whole, by epic E13 of one task, T110: the submodule `spec/` and the packages `@altnovatrail/spec` and `@altnovatrail/contracts` are at this tag, the copy of the part `legal` is `tasks/spec-v0.16.3/legal-2.tar.gz`; RUN.md has the template's rules of v0.16.3, and table 4 is in a `DEBT.md` of its own; CLAUDE.md is thin, and the checks of the parts are the rules `.claude/rules/<part>.md`; the "Sources" of architecture 4 are records in `docs/sources.md`, and `canvas`'s probes are in `docs/measurements.md`; the documents of `docs/`, but for the archives `docs/plan/`, are in English, and the size limits beyond the block `repository` of `spec`'s budgets are named by `docs-budgets.json`.** 2026-11-12, T110.
- **What the tag brings `canvas`** (`git -C spec diff v0.15.1 v0.16.3`, read 2026-11-12; the release, the packages and the archive — sources 6.10):
  - RULES.md — the bar: the documents of `docs/`, but for the epic archives, are read by a session of Claude Code and are written for it, to be read in parts; an external fact is a record of `docs/sources.md`, and a claim cites it, `sources 1.1`; the results of measurements are in `docs/measurements.md`; `docs/` is in English, and a translation is a task of its own, by `tools/translation/README.md` spec; a decision that changes another entry of the log puts an amendment on it in the same change (R143 spec). `canvas`'s CLAUDE.md imports RULES.md, so the rules apply with the submodule;
  - the template: `.claude/settings.json` — the line `"**/canvas/spec/.claude/rules/**"` in `claudeMdExcludes` (Д215 spec), otherwise a rule of a part of `spec` would get into a session of `canvas` as soon as the session reads a file of `spec/`; RUN.md — the body of a done task to the epic's archive at once, a task outside an epic to the current epic's archive, table 4 in `DEBT.md`, a measurement of tokens at an epic's archive (R19 spec, R145 spec); CLAUDE.md — thin, with the rules of the parts by `paths`; `docs/sources.md`, `DEBT.md` and `docs-budgets.json`; AGENTS.md — a point on the rules by paths. The kind `typescript` adds no keys to `.claude/settings.json`;
  - `.devcontainer/` is the same as `canvas`'s: the template's kind `typescript` took the Playwright image v1.65.0 and revision 1254 — the answer to В79 (the 2026-11-11 amendment to R79 spec) —, and the recipe `just new-repo-draft canvas typescript 3.2 v0.16.3` in a temporary clone of `spec` gave `.devcontainer/` byte for byte;
  - the part `legal` and `format/` did not change between the tags, and `legal-2.tar.gz` of v0.16.3 is a new archive of the same content: the files are the same (`diff -r`), the dates inside are 2026-11-12 20:06, and the sum is different. The copy moves to `tasks/spec-v0.16.3/`, as R69 requires: `release-verify spec` checks it by the tag of `spec/`;
  - the packages 0.16.3: in the types only `admissionv0` changed, which `canvas` does not read; `@altnovatrail/contracts` 0.16.3 pins `@bufbuild/protobuf` 2.17.0 at an exact version, and `canvas` raises its own to it, so that the lock file has one copy (the T110 amendments to R12 and R55);
  - the answers to the rows «в реестр spec» В76–В79 — all by `canvas`'s recommendations: В76 and В77 — the 2026-11-12 amendment and the second 2026-11-12 amendment to R90 spec, architecture 3.2 and 6 spec, Д218 spec and Д219 spec; В78 — architecture 3.2 spec; В79 — the 2026-11-11 amendment to R79 spec. By Д219 spec the notes that they wait for В76 leave `src/element/labels.ts`, `scripts/icons.ts` and R73 (the T110 amendment to R73).
- **What the task does beyond the tag** — by the shared text of T123 spec and row 7.5 of COORDINATION.md spec:
  - table 4 goes to `DEBT.md` at the root, in Russian. The rows Д4, Д5 and Д7 went over the row limit of 4 KB and were condensed to their gist and their last check, and their earlier wording is in E13's archive word for word, `docs/plan/E13.md`;
  - the body of T109 goes to E13's archive: so its body said, and rule 9 sends a done task outside an epic to the current epic's archive;
  - architecture 4 — 218 KB, 73 sources — moves word for word: 69 sources as the records `sources 1.1`–`9.20` in nine topics, and four probes of `canvas` — T29, T74, T80 and the workbook's template layer — as the subsections measurements 1.1–1.4. In the section's place stands a pointer: the log and the archives cite it, and they are not rewritten. In sections 1–3, the 105 citations "section 4" now go to their own records, and the brackets at the beginning of a record name the sections of architecture that rest on it — "architecture 3.1";
  - the translation of `docs/architecture.md`, `docs/decisions.md`, `docs/sources.md` and `docs/measurements.md` into English — by `spec/tools/translation/README.md`: pieces, subagents, `translation-check` with a commit before the translation, and a blind reading of a selection;
  - `docs-budgets.json` — the limits that remain beyond the block `repository` after the rebuilding and the translation (R145 spec);
  - the measurement of token use — "before", `canvas`'s row of measurements 1.9 spec, and "after", the session of T110 — in measurements 2.

— *Why:* the author's word of 2026-11-12 — «переходи на spec последней версии» —, and the newest tag is v0.16.3 (`gh release list -R altnovatrail/spec`, `npm view @altnovatrail/spec version` — 0.16.3). Line 0.16 comes with the task T123 spec, and the author took all of it at once, without waiting for the pilot of `module-kit`, row 7.1, and as one task. An epic, not a task outside the epics: by rule 9 the body of a done task goes to the current epic's archive, and only an epic has an archive. The "Sources" move out before the translation: the records and the citations of them are translated together with the claims, and the check of the translation sees them in place.

— *Rejected:*
- **only the move, with the rebuilding and the translation as a task after the pilot of `module-kit`** — the executor's recommendation: row 7.5 of COORDINATION.md spec waits for 7.1, and the pilot would find a mistake in the shared text of T123. The author chose everything at once;
- **five tasks or three** — the executor's recommendation: the move with the working rules, the "Sources", the translation of architecture, and the log in two halves, ≈ 60–90 minutes of review each. The author chose one task: one branch and one merge;
- **a task outside the epics** — the bodies of T110 and of T109 would wait for the next epic's archive in RUN.md, against rule 9;
- **raising the limits of the rows Д4, Д5 and Д7 in `docs-budgets.json`** — T123 spec raises a limit only for what stays beyond it after the rebuilding and the translation, and the table of debt is in Russian and does not shrink by translation;
- **rewriting the log's and the archives' citations of "section 4"** — an entry of the log is not rewritten, and an archive is moved word for word; the pointer leads to the records just as well.

— RUN.md, T110; T123 spec; R76 spec, R143 spec, R145 spec, R79 spec, R90 spec; sources 6.10; Д215 spec, Д218 spec, Д219 spec; R12, R13, R55, R69, R73, R74, R76; R19 spec; [architecture.md](architecture.md), sections 3.4 and 4; [sources.md](sources.md); [measurements.md](measurements.md); `DEBT.md`, `docs-budgets.json`, `.claude/settings.json`, `.claude/rules/`, `CLAUDE.md`, `AGENTS.md`, `justfile`, `scripts/legal.ts`, `tasks/spec-v0.16.3/`, `page/notices/`.
