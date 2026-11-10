# canvas's own recipes: the package's build, and the four checks .github's typescript.yml runs in
# CI, one job each, in a new container of the toolchain stage of .devcontainer/Dockerfile — as the
# runner's user, with HOME=/tmp and with CI from the step's environment (R19 .github; R12 in
# docs/decisions.md). Only ci-licenses reads spec/: it runs spec's recipes licenses-check-repo,
# release-verify-npm, release-verify and sample-check, and the licenses job alone gets the
# submodule. The code and its tests read nothing of spec/, and the documents are checked by spec's
# own recipe, just -f spec/justfile docs-check-repo. release-files writes the files of a release,
# for .github's shared release.yml (R08), and synthetic the synthetic samples (R49). One more recipe
# is for the author's hands: demo serves a page to try the element on.

set shell := ["bash", "-euo", "pipefail", "-c"]

# The tools are the packages package-lock.json pins, run from where npm ci puts them: nothing is
# fetched on the fly.
bin := "node_modules/.bin"

# The release of tutor whose file of open tasks, in tasks/, the synthetic samples answer: the tag of
# TUTOR_FILE in src/eval/tasks.ts, which scripts/synthetic.test.ts holds this to (R49).
tutor_tag := "v0.1.10"

# The release of modules whose package of grade-3-math, in tasks/modules-<tag>/, ci-licenses writes
# synthetic samples of a module's eval set on (T86; R63): ci-licenses verifies the index, and holds
# the package's inventory to the index's digest of it, as moduleTasksOf holds server.json to the
# inventory.
modules_tag := "v0.2.0"
module_id := "novatrail/grade-3-math"
module_version := "0.2.0"
module_package := "tasks/modules-" + modules_tag + "/novatrail-grade-3-math-" + module_version

# Run the four checks CI runs, before a pull request.
ci: ci-lint ci-test ci-vuln ci-licenses

# Fail on code Biome would format or flag, on a type error in any of the three programs — the
# DOM-free part sees neither the DOM nor Node, the element sees the DOM, and the scripts, the
# configuration and the tests see Node too (R12) — and on icons or a NOTICE that are not what
# scripts/icons.ts writes from the set package-lock.json pins (R46).
ci-lint: _install
    {{ bin }}/biome ci
    {{ bin }}/tsc --noEmit -p tsconfig.core.json
    {{ bin }}/tsc --noEmit -p tsconfig.element.json
    {{ bin }}/tsc --noEmit -p tsconfig.node.json
    node scripts/icons.ts --check

# Build the package, run the tests in Node and in Chromium with their coverage, which .github's
# TypeScript wrapper sends to Codecov from coverage/lcov.info (R43), and check the package the way
# a consumer takes it.
ci-test: build
    {{ bin }}/vitest run --coverage
    node scripts/package.ts

# Fail on a published advisory, high or above, for a package the package ships with. Of the tools
# of development, Dependabot's alerts tell (R12). npm audit reads the lock file and asks the
# registry, so nothing is installed first.
ci-vuln:
    npm audit --omit=dev --audit-level=high

# The checks of package-lock.json. First, fail if a package of it, the tools of development too,
# carries a license that spec's list does not allow and is no exception that licenses.json names
# (R12, R14). The list, the reading of SPDX expressions and the rule of an exception are spec's, at
# the tag spec/ is on: an exception off the list holds only for a package the lock file marks dev,
# and covers the builds for each platform it names in optionalDependencies while they are dev too
# and under the same license (R39 spec). That reads the lock file, licenses.json and spec/ at its
# tag, and installs nothing. Then, fail unless each package of @altnovatrail in the lock file is the
# signed file of its release: spec's release-verify-npm checks the archive at the lock file's
# resolved address against the release's bundle, by Sigstore's trust root, and the lock file's
# integrity against the verified bytes (R77 spec; R44). RULES.md asks it of each pull request that
# changes the lock file; here it runs on every one, inside a check main already requires. It
# installs spec/tools from spec's lock file and reads Sigstore, the registry and GitHub: when one
# of them cannot be read, the package is refused. So spec/ has to be checked out, and the network
# reachable. Last, fail unless spec's sample-check takes the example sample files, one of each
# composition, which src/eval/sample.test.ts writes in examples/ and ci-test holds to the code: the
# eval protocol forbids a check of canvas's own, and this job alone has spec/ (R93 spec; R48). The
# synthetic set too, which no tree holds: tutor's file of open tasks that it answers is verified
# first, as a file of a release enters NovaTrail, then the set is written into build/synthetic and
# each of its files checked (R77 spec; R49). The samples of a module's eval set too: the index of
# the release of modules whose package of grade-3-math the tree holds is verified, a sample is
# written of each of its tasks into build/synthetic-module, and sample-check holds them, and the
# example of a module's sheet, as an eval set of their module (T86; R63). sample-check runs buf
# from the toolchain stage on the contracts of spec/. spec's recipes run under this same just.
ci-licenses:
    {{ quote(just_executable()) }} -f spec/justfile licenses-check-repo package-lock.json licenses.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify-npm package-lock.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify tutor {{ tutor_tag }} tasks/tutor_{{ tutor_tag }}_open-tasks.json
    {{ quote(just_executable()) }} -f spec/justfile sample-check examples/*.json
    {{ quote(just_executable()) }} synthetic build/synthetic > /dev/null
    {{ quote(just_executable()) }} -f spec/justfile sample-check build/synthetic/*.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify modules {{ modules_tag }} tasks/modules-{{ modules_tag }}/module-index.json
    test "sha256:$(sha256sum < {{ module_package }}/inventory.json | cut -d ' ' -f 1)" = "$(node -p 'require("./tasks/modules-{{ modules_tag }}/module-index.json").modules["{{ module_id }}"]["{{ module_version }}"].package_digest')"
    rm -rf build/synthetic-module
    node build/scripts/synthetic.js --module {{ module_package }} {{ modules_tag }} build/synthetic-module comparing-fractions-d1:201 comparing-fractions-d3:202 comparing-fractions-d5:203 division-with-remainder-d1:204 division-with-remainder-d3:205 division-with-remainder-d5:206 fractions-of-a-whole-d1:207 fractions-of-a-whole-d3:208 fractions-of-a-whole-d5:209 times-tables-d1:210 times-tables-d3:211 times-tables-d5:212 > /dev/null
    {{ quote(just_executable()) }} -f spec/justfile sample-check --eval-set {{ module_id }} build/synthetic-module/*.json
    {{ quote(just_executable()) }} -f spec/justfile sample-check --eval-set example/sheets examples/module-sheet-eval-set.json

# Build the package into lib/: JavaScript and its declarations. lib/ is emptied first, so that no
# file of an older build ships.
build: _install
    rm -rf lib
    {{ bin }}/tsc -p tsconfig.build.json

# Write the files of the release of a version, v0.1.0 say, into dist/, as .github's shared
# release.yml runs it: in the toolchain stage, on the tree of the commit alone, with no git, no spec
# submodule and no token (R08; R18 .github). They are the package's archive, as npm pack makes it,
# with the version without its v, NOTICE in it too (R46); the synthetic samples, as just synthetic
# writes them, in one flat archive, synthetic-samples_<version>.tar.gz, and what each shows, one
# line to a sample under a line of the columns' names, synthetic-samples_<version>.tsv (R50); the
# samples page, as scripts/page.ts builds it with the draft of texts, samples-page_<version>.html,
# whose own version is the number without its v (R55; R66): the set of texts for tests goes into
# no page but 0.0.0, so into no release; LICENSE; and SHA256SUMS of the five. The set is written
# outside dist/, which takes files alone; the page's builder writes its one file there and prints
# its path first.
# The package's archive is packed from a copy of what npm pack takes, with the version set there,
# so that the package.json of the tree keeps 0.0.0, and scripts/release.ts checks the archive
# itself and names it. npm pack fixes every file's time and order, scripts/archive.ts writes
# nothing of the machine or the time, and two builds of the page are the same bytes (R66), so a
# build of the same commit gives the same sums, and the sums are printed for whoever builds it
# again to compare.
release-files version: build
    #!/usr/bin/env bash
    set -euo pipefail
    version={{ quote(version) }}
    if ! [[ "$version" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
        echo "release-files: the version is v<major>.<minor>.<patch>, as v0.1.0, not ${version}" >&2
        exit 1
    fi
    number="${version#v}"
    node scripts/package.ts
    rm -rf dist
    mkdir dist
    stage="$(mktemp -d)"
    trap 'rm -rf "$stage"' EXIT
    cp -R lib package.json README.md LICENSE NOTICE "$stage"
    packed="$(cd "$stage" && npm pkg set version="$number" && npm pack --json --ignore-scripts --pack-destination "$OLDPWD/dist")"
    archive="$(node scripts/release.ts "$number" <<< "$packed")"
    synthetic="synthetic-samples_${version}"
    {{ quote(just_executable()) }} synthetic "$stage/synthetic" "dist/${synthetic}.tsv" > /dev/null
    node scripts/archive.ts "$stage/synthetic" "dist/${synthetic}.tar.gz"
    page="$(basename "$(node scripts/page.ts dist "$number" | sed -n 1p)")"
    cp LICENSE dist/LICENSE
    (cd dist && sha256sum -- "$archive" "${synthetic}.tar.gz" "${synthetic}.tsv" "$page" LICENSE > SHA256SUMS)
    cat dist/SHA256SUMS

# Write the synthetic samples into a folder, one file each, <ID>.json, and print a line for each:
# its ID, its composition and what it shows (R49); given a list, write the lines there too, under a
# line of the columns' names, as a release's .tsv has them (R50). The folder and the list are the
# caller's, from where just was run; of what the folder holds, only the files of an older set,
# synthetic-*.json, go. The code of src/ names its modules by .js, so tsc builds the generator into
# build/ first, and Node runs that. It reads tutor's file of open tasks from tasks/, which
# ci-licenses verifies, and needs neither spec/ nor git; the network only as npm ci does, when the
# packages are not installed yet.
synthetic folder list="": _synthetic-build
    cd {{ quote(invocation_directory()) }} && node {{ quote(justfile_directory() / "build/scripts/synthetic.js") }} {{ quote(folder) }} {{ if list == "" { "" } else { quote(list) } }}

# Write the synthetic samples of a module's eval set into a folder — the module's eval/ — one of each
# <task>:<seed> called, on the package that module-kit build wrote of the module at the commit the
# samples go into, naming the newest release of modules by its tag (T86; R110 spec, R63). A file of
# the same seed is written anew only when it is a sample of the same task; a template, a choice, an
# essay or a zone is refused. Every path is the caller's, from where just was run. It needs neither
# spec/ nor git nor module-kit: the package's own files, inventory.json and server.json, are enough.
# Its arguments reach Node as they are, each a word of its own: none goes through the shell's text.
[positional-arguments]
synthetic-module package tag folder +calls: _synthetic-build
    cd {{ quote(invocation_directory()) }} && node {{ quote(justfile_directory() / "build/scripts/synthetic.js") }} --module "$@"

# The generator, built by tsc into build/: the code of src/ names its modules by .js.
_synthetic-build: _install
    rm -rf build/scripts build/src
    {{ bin }}/tsc -p tsconfig.synthetic.json

# Write the icons of the row's buttons, src/element/icons.ts, and NOTICE anew, from the set of icons
# package-lock.json pins: after a new version of the set, or of the table in scripts/icons.ts (R46).
icons: _install
    node scripts/icons.ts

# Format and fix the code in place, the way ci-lint checks it.
fmt: _install
    {{ bin }}/biome check --write

# Serve a page to try the element on by hand — with a mouse, a pen or a finger — as tutor's check
# board would have it (RUN.md, T34; R20): Vite's dev server on 127.0.0.1:5173, which VS Code
# forwards to a browser outside the container. It serves the page, the element's sources and the
# packages they import, and nothing else of the repository; it builds nothing.
demo: _install
    {{ bin }}/vite --config demo/vite.config.ts

# Install the packages from package-lock.json, again whenever package.json or the lock file changes:
# the stamp holds their hashes, as spec's _tools does. In CI each job starts from a fresh checkout,
# so it always installs. Package scripts never run: .npmrc sets ignore-scripts, and the flag says it
# again.
[private]
_install:
    #!/usr/bin/env bash
    set -euo pipefail
    stamp=node_modules/.installed-from
    wanted="$(sha256sum package.json package-lock.json)"
    if [[ ! -f "$stamp" || "$(cat "$stamp")" != "$wanted" ]]; then
        npm ci --ignore-scripts --no-audit --no-fund
        printf '%s\n' "$wanted" > "$stamp"
    fi
