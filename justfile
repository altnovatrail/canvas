# canvas's own recipes: the package's build, and the four checks .github's typescript.yml runs in
# CI, one job each, in a new container of the toolchain stage of .devcontainer/Dockerfile — as the
# runner's user, with HOME=/tmp, with CI and ALLOWED_LICENSES from the step's environment (R19
# .github; R12 in docs/decisions.md). Nothing here reads ALLOWED_LICENSES, which .github keeps for
# older checks until its Д6. Only ci-licenses reads spec/: it runs spec's recipe
# licenses-check-repo, and the licenses job alone gets the submodule. The code and its tests read
# nothing of spec/, and the documents are checked by spec's own recipe, just -f spec/justfile
# docs-check-repo. One more recipe is for the author's hands: demo serves a page to try the
# element on.

set shell := ["bash", "-euo", "pipefail", "-c"]

# The tools are the packages package-lock.json pins, run from where npm ci puts them: nothing is
# fetched on the fly.
bin := "node_modules/.bin"

# Run the four checks CI runs, before a pull request.
ci: ci-lint ci-test ci-vuln ci-licenses

# Fail on code Biome would format or flag, and on a type error in any of the three programs: the
# DOM-free part sees neither the DOM nor Node, the element sees the DOM, and the scripts, the
# configuration and the tests see Node too (R12).
ci-lint: _install
    {{ bin }}/biome ci
    {{ bin }}/tsc --noEmit -p tsconfig.core.json
    {{ bin }}/tsc --noEmit -p tsconfig.element.json
    {{ bin }}/tsc --noEmit -p tsconfig.node.json

# Build the package, run the tests in Node and in Chromium, and check the package the way a
# consumer takes it.
ci-test: build
    {{ bin }}/vitest run
    node scripts/package.ts

# Fail on a published advisory, high or above, for a package the package ships with. Of the tools
# of development, Dependabot's alerts tell (R12). npm audit reads the lock file and asks the
# registry, so nothing is installed first.
ci-vuln:
    npm audit --omit=dev --audit-level=high

# Fail if a package of package-lock.json, the tools of development too, carries a license that
# spec's list does not allow and is no exception that licenses.json names (R12, R14). The list,
# the reading of SPDX expressions and the rule of an exception are spec's, at the tag spec/ is on:
# an exception off the list holds only for a package the lock file marks dev, and covers the
# builds for each platform it names in optionalDependencies while they are dev too and under the
# same license (R39 spec). It reads the lock file, licenses.json and spec/ at its tag, so nothing
# is installed first, but spec/ has to be checked out. spec's recipe runs under this same just.
ci-licenses:
    {{ quote(just_executable()) }} -f spec/justfile licenses-check-repo package-lock.json licenses.json

# Build the package into lib/: JavaScript and its declarations. lib/ is emptied first, so that no
# file of an older build ships.
build: _install
    rm -rf lib
    {{ bin }}/tsc -p tsconfig.build.json

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
