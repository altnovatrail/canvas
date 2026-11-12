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
tutor_tag := "v0.1.22"

# The release of spec whose file of the legal texts, in tasks/spec-<tag>/, the samples page takes
# its sets of texts from (T89; R69): the tag spec/ stands on, and LEGAL_FILE's in scripts/legal.ts,
# which scripts/legal.test.ts holds this to. ci-licenses verifies the file.
spec_tag := "v0.15.1"
legal_file := "legal-2.tar.gz"

# The release of modules whose package of grade-3-math, in tasks/modules-<tag>/, ci-licenses writes
# synthetic samples of a module's eval set on (T86; R63): ci-licenses verifies the index, and holds
# the package's inventory to the index's digest of it, as moduleTasksOf holds server.json to the
# inventory. The package of english-essays 0.2.0 beside it, whose essays the tests hold to the
# digests module-kit gives their open views, is held to the index the same way (T98).
modules_tag := "v0.2.0"
module_id := "novatrail/grade-3-math"
module_version := "0.2.0"
module_package := "tasks/modules-" + modules_tag + "/novatrail-grade-3-math-" + module_version
essays_package := "tasks/modules-" + modules_tag + "/novatrail-english-essays-0.2.0"

# The release of modules whose tasks the samples page carries for an eval set, the release of
# module-kit whose open writes their open views, and the seeds of the templates' instances it writes
# (T101; R71): the copy in tasks/modules-<tag>/ is what that module-kit wrote of that release with
# those seeds, which just modules-open writes and ci-licenses holds it to. MODULES_FILE in
# src/eval/tasks.ts has the tag and the seeds too, and scripts/modules.test.ts holds them to these.
page_modules_tag := "v0.2.4"
module_kit_tag := "v0.3.0"
open_seeds := "1 2 3 4 5"

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
# each of its files checked (R77 spec; R49); so is spec's file of the legal texts, whose sets the
# samples page carries (T89; R69), and the copy of the open views of modules the page carries is
# held to what module-kit open writes anew of the release, every file of it verified first (T101;
# R71; just modules-open). The samples of a module's eval set too: the index of
# the release of modules whose package of grade-3-math the tree holds is verified, a sample is
# written of each of its tasks into build/synthetic-module by the generator's file, built as a
# release carries it, and sample-check holds them, and the example of a module's sheet, as an eval
# set of their module (T86, T96; R63, R68). sample-check runs buf
# from the toolchain stage on the contracts of spec/. spec's recipes run under this same just.
ci-licenses:
    {{ quote(just_executable()) }} -f spec/justfile licenses-check-repo package-lock.json licenses.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify-npm package-lock.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify tutor {{ tutor_tag }} tasks/tutor_{{ tutor_tag }}_open-tasks.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify spec {{ spec_tag }} tasks/spec-{{ spec_tag }}/{{ legal_file }}
    {{ quote(just_executable()) }} modules-open check
    {{ quote(just_executable()) }} -f spec/justfile sample-check examples/*.json
    {{ quote(just_executable()) }} synthetic build/synthetic > /dev/null
    {{ quote(just_executable()) }} -f spec/justfile sample-check build/synthetic/*.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify modules {{ modules_tag }} tasks/modules-{{ modules_tag }}/module-index.json
    test "sha256:$(sha256sum < {{ module_package }}/inventory.json | cut -d ' ' -f 1)" = "$(node -p 'require("./tasks/modules-{{ modules_tag }}/module-index.json").modules["{{ module_id }}"]["{{ module_version }}"].package_digest')"
    test "sha256:$(sha256sum < {{ essays_package }}/inventory.json | cut -d ' ' -f 1)" = "$(node -p 'require("./tasks/modules-{{ modules_tag }}/module-index.json").modules["novatrail/english-essays"]["0.2.0"].package_digest')"
    rm -rf build/synthetic-module
    {{ quote(just_executable()) }} synthetic-module {{ module_package }} {{ modules_tag }} build/synthetic-module comparing-fractions-d1:201 comparing-fractions-d3:202 comparing-fractions-d5:203 division-with-remainder-d1:204 division-with-remainder-d3:205 division-with-remainder-d5:206 fractions-of-a-whole-d1:207 fractions-of-a-whole-d3:208 fractions-of-a-whole-d5:209 times-tables-d1:210 times-tables-d3:211 times-tables-d5:212 > /dev/null
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
# no page but 0.0.0, so into no release; the generator of a module's eval set, as
# scripts/generator.ts builds it, synthetic-module_<version>.mjs (R68); LICENSE; and SHA256SUMS of
# the six. The set is written outside dist/, which takes files alone; the builders of the page and
# of the generator each write their one file there and print its path first.
# The package's archive is packed from a copy of what npm pack takes, with the version set there,
# so that the package.json of the tree keeps 0.0.0, and scripts/release.ts checks the archive
# itself and names it. npm pack fixes every file's time and order, scripts/archive.ts writes
# nothing of the machine or the time, and two builds of the page or of the generator are the same
# bytes (R66, R68), so a
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
    generator="$(basename "$(node scripts/generator.ts dist "$number" | sed -n 1p)")"
    cp LICENSE dist/LICENSE
    (cd dist && sha256sum -- "$archive" "${synthetic}.tar.gz" "${synthetic}.tsv" "$page" "$generator" LICENSE > SHA256SUMS)
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

# The open views of the tasks of modules the samples page carries, as module-kit open writes them of
# the release page_modules_tag of modules with the seeds open_seeds (T101; R71; R43 module-kit):
# check holds the copy in tasks/modules-<tag>/ to them, and copy writes it anew, for a move to
# another release or other seeds, after which it prints the sum MODULES_FILE takes. Every file
# comes from its release and enters only once spec's release-verify has accepted it (R77 spec):
# module-kit's binary for this machine, the index of the release — the copy's, which copy fetches
# when the copy has none — and of each module the archive of the package that module-kit open
# takes, which scripts/modules.ts names by the index's entries: its file is named by the package's
# digest, in the release of the entry (the second 2026-11-02 amendment to R63 spec). The files are
# kept in build/modules-open/ by their names, which hold their tags or digests, and checked again
# on every run, and one the check refuses is removed; the packages are unpacked anew. It reads
# GitHub and Sigstore, and spec/ has to be checked out: ci-licenses runs it, never a build.
modules-open mode="check": _install
    #!/usr/bin/env bash
    set -euo pipefail
    mode={{ quote(mode) }}
    if [ "$mode" != check ] && [ "$mode" != copy ]; then
        echo "modules-open: the mode is check or copy, not $mode" >&2
        exit 2
    fi
    just={{ quote(just_executable()) }}
    copy=tasks/modules-{{ page_modules_tag }}
    work=build/modules-open
    case "$(uname -m)" in
        x86_64) arch=amd64 ;;
        aarch64 | arm64) arch=arm64 ;;
        *) echo "modules-open: module-kit has no binary for $(uname -m)" >&2; exit 2 ;;
    esac
    mkdir -p "$work/files"
    # A file of a release and its bundle into a folder, kept there by name, and verified every time:
    # one release-verify refuses goes, so that the next run fetches it anew.
    fetch() {
        local repository="$1" tag="$2" name="$3" folder="${4:-$work/files}"
        for file in "$name" "$name.sigstore.json"; do
            if [ ! -f "$folder/$file" ]; then
                curl -fsSL --retry 3 -o "$folder/$file.part" \
                    "https://github.com/altnovatrail/$repository/releases/download/$tag/$file"
                mv "$folder/$file.part" "$folder/$file"
            fi
        done
        if ! "$just" -f spec/justfile release-verify "$repository" "$tag" "$folder/$name"; then
            rm -f "$folder/$name" "$folder/$name.sigstore.json"
            exit 1
        fi
    }
    kit="module-kit_{{ module_kit_tag }}_linux_$arch"
    fetch module-kit {{ module_kit_tag }} "$kit"
    chmod +x "$work/files/$kit"
    # The copy's index is the tree's; a copy of another release fetches its own.
    if [ "$mode" = copy ]; then mkdir -p "$copy"; fi
    if [ "$mode" = copy ] || [ -f "$copy/module-index.json" ]; then
        fetch modules {{ page_modules_tag }} module-index.json "$copy"
    else
        echo "modules-open: $copy has no module-index.json; just modules-open copy writes it" >&2
        exit 1
    fi
    rm -rf "$work/packages" "$work/out"
    folders=()
    while read -r release package; do
        fetch modules "$release" "$package.tar.gz"
        mkdir -p "$work/packages/$package"
        tar -xzf "$work/files/$package.tar.gz" -C "$work/packages/$package"
        folders+=("$work/packages/$package")
    done < <(node scripts/modules.ts packages "$copy/module-index.json")
    seeds=()
    for seed in {{ open_seeds }}; do seeds+=(--seed "$seed"); done
    "$work/files/$kit" open --index "$copy/module-index.json" --latest "$copy/module-index.json" \
        "${seeds[@]}" --out "$work/out" "${folders[@]}" > /dev/null
    node scripts/modules.ts "$mode" "$work/out" "$copy"
    if [ "$mode" = copy ]; then
        echo "modules-open: the sha256 of MODULES_FILE in src/eval/tasks.ts is $(sha256sum < "$copy/open-views.json" | cut -d ' ' -f 1)"
    fi

# Write the synthetic samples of a module's eval set into a folder — the module's eval/ — one of each
# <task>:<seed> called, on the package that module-kit build wrote of the module at the commit the
# samples go into, naming the newest release of modules by its tag (T86; R110 spec, R63). A file of
# the same seed is written anew only when it is a sample of the same task; a template, a choice, an
# essay or a zone is refused. Every path is the caller's, from where just was run. It needs neither
# spec/ nor git nor module-kit: the package's own files, inventory.json and server.json, are enough.
# It runs the file every release carries, synthetic-module_v<X.Y.Z>.mjs, built here as version
# 0.0.0 (T96; R68), so that what modules runs is what canvas's CI tries.
# Its arguments reach Node as they are, each a word of its own: none goes through the shell's text.
[positional-arguments]
synthetic-module package tag folder +calls: _generator-build
    cd {{ quote(invocation_directory()) }} && node {{ quote(justfile_directory() / "build/synthetic-module_v0.0.0.mjs") }} --module "$@"

# The generator of a module's eval set, bundled as a release carries it, into build/ as version
# 0.0.0 (R68).
_generator-build: _install
    node scripts/generator.ts build 0.0.0 > /dev/null

# The generator of the set, built by tsc into build/: the code of src/ names its modules by .js.
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
