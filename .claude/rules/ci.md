---
paths:
  - ".github/**"
  - ".devcontainer/**"
  - "justfile"
  - "package.json"
  - "package-lock.json"
  - "licenses.json"
  - ".npmrc"
  - ".sonarcloud.properties"
  - "biome.json"
  - "tsconfig*.json"
  - "vitest.config.ts"
  - "scripts/release*.ts"
  - "scripts/package*.ts"
---

# CI, the container, the npm packages and the release

## The four checks

`just ci` runs the four checks CI runs, one job each of .github's shared `typescript.yml`, in a new container of the `toolchain` stage of `.devcontainer/Dockerfile` (R19 .github; R12):
- `ci-lint` — Biome, the types of the three programs — the DOM-free part, the element and the scripts with the tests — and the icons and `NOTICE` that `scripts/icons.ts` writes (R46);
- `ci-test` — the package's build, the tests in Node and in Chromium with their coverage, and the package as a consumer takes it;
- `ci-vuln` — `npm audit` of what the package ships with, high or above; of the tools of development, Dependabot's alerts tell (R12);
- `ci-licenses` — spec's `licenses-check-repo`, with spec's list at its tag and the exceptions in `licenses.json` (R39 spec), and `release-verify-npm package-lock.json`, which checks each package of `@altnovatrail` against the signature of its release (R77 spec, R44); then the release files of `tasks/` (`.claude/rules/tasks.md`), and spec's `sample-check` on the example sample files and the synthetic sets (`.claude/rules/eval.md`).

Only `ci-licenses` reads `spec/`, and it needs the network — Sigstore, the npm registry and GitHub: when one of them cannot be read, the file is refused. A task that changes code or its tooling ends with `just ci` green. A test's timeout is twenty times its own time on a free runner of CI (R75): a test that fails only on a loaded host is compared with `main` before the change is blamed.

Coverage goes to Codecov from .github's TypeScript wrapper, `coverage/lcov.info` (R43), and a merge waits for `codecov/patch`, at least 90 % of the changed lines covered (R48 spec). Beside the four run secrets, DCO, CodeQL, Scorecard, SonarCloud and the workflows of the emulators (`.claude/rules/page.md`); rule 12 of RUN.md has their findings closed before the next task.

## Versions and licenses

Every tool is an npm package at the exact version `package-lock.json` pins, run from `node_modules/.bin`: nothing is fetched on the fly (R12). `@altnovatrail/spec` and `@altnovatrail/contracts` are at the version of the tag `spec/` stands on, and so is `@bufbuild/protobuf`, which contracts pins exactly: a move to a new tag of spec raises the three, and Dependabot leaves them alone (R73 spec; R12, R41). `.github/dependabot.yml` says what moves together and what by hand: a raise of Playwright stays red until the image and the revision of the toolchain stage are raised with it, by hand, with a row «в реестр spec» for the template (R79 spec, R13); one of the set of icons, until `just icons` writes them anew (R46).

A new dependency needs a license spec's list allows; a tool that never ships may carry another only as an exception named in `licenses.json` and in its decision, as `lightningcss` and axe-core do (R12 spec; R14, R70). A package that the samples page's bundle or the generator's file carries needs the text of its license, of that version, in `page/notices/` (R55, R68; `.claude/rules/page.md`).

## The container

`.devcontainer/` is spec's template for the kind `typescript` (R79 spec): a move to a new tag of spec takes it as `just new-repo-draft canvas typescript 3.2 <tag>` writes it in a temporary clone of spec, and keeps only the base image Dependabot raises (R45, R13). Chrome Headless Shell, which the tests run in, comes from Playwright's image in the toolchain stage, with its system libraries from a snapshot of the Ubuntu archive (R40 spec).

## The release

A release comes out by itself once CI passes on `main`, by .github's shared `release.yml` pinned by SHA (R18 .github; R08): nobody tags by hand. `RELEASE_LINE` in `.github/workflows/release.yml` is the line, 0.3 since T85, and its `paths` are what the release is built from: a change to one of them gives the next release, and npm the same version. `just release-files` writes the files — the package's archive, which npm takes by trusted publishing with no token, the samples page's build `samples-page_v<X.Y.Z>.html` (R66), the synthetic samples (R50) and the generator of a module's eval set (R68) —, each signed and in `SHA256SUMS`. A pull request builds, signs and checks them and publishes nothing. A file that a change adds to what a release is built from goes into `paths` in the same change.
