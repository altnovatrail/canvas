---
paths:
  - "page/**"
  - "scripts/page*.ts"
  - "scripts/csp.ts"
  - "scripts/notices*.ts"
  - "emulators/**"
  - "probe/**"
  - ".github/workflows/page.yml"
  - ".github/workflows/emulators.yml"
---

# The samples page, its build and the emulators

## The build

`node scripts/page.ts <folder> <version>` builds the samples page into one file, `samples-page_v<version>.html`, that opens from a file on the device and goes to no network (R55; R25 spec). Vite's API bundles `page/main.ts`, with the element and the sample file's module `src/eval/`, into one script; the builder puts it and the style of `page/index.html` into the page, under the policy of `scripts/csp.ts` — no network, and the page's own style and script by their hashes, in a `<meta>` element, since a page from a file gets no headers (R52, R55). It builds from the tree alone: no `spec/`, no git, no token and no network. Its tasks and text sets come from `tasks/` (`.claude/rules/tasks.md`). Every release carries the page, built by `release-files` with the same builder (R66; `.claude/rules/ci.md`).

The license notices of all the code the file carries — its own, every package bundled, the set of icons — and of the modules whose tasks it carries go into the file itself (R55; `scripts/notices.ts`). A package under a license off spec's list, or with no text of its license, stops the build, as it stops the generator's (R12, R68). A package whose archive holds no text of its license has one kept in `page/notices/<package>-<version>.txt`, from its repository at the tag of that version; a raise of the package moves the file to the new version in the same change, and the old one goes (R55).

What the page does — its «Начало», the purposes and a child's session, the markup of a sample after writing and the opening of a sample file — is R56, R58, R59 and R64, and architecture 3.6 details it. axe-core checks the whole page as it checks the element (R70).

## The emulators

No tablets of the author's own, so the emulators stand in for them, in the software they run (R54, R65). `.github/workflows/page.yml` runs on every pull request, with Android alone, and with the iPad too on a push to `main` and by hand: a driver in `emulators/` goes through the page's start, draws a stroke, marks it up, saves the sheet's and the workbook's samples and sees that the page asked for nothing and broke no rule of its policy, and spec's `sample-check` reads the saved files. Its first job decides by paths whether there is anything to check, and the one check `main` requires is its last job: a path added to the job `changes` goes into the `push` filter too. The jobs in the toolchain stage take its image from the cache of GitHub Actions by `emulators/toolchain.sh`, which `main`'s run fills (R57). The pen, the palm and iCloud need real tablets: Д7 in DEBT.md.

The strokes are the code's: no handwriting goes into a run, and a run's screenshots and reports are its artifact, never files of the repository. `probe/` is the probe of a page opened from a file (R52); `.github/workflows/emulators.yml` runs it on a change of `probe/` or by hand (R54), since it has answered its question (T29, T74, T80; measurements 1.1–1.3).
