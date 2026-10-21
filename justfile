# canvas's own recipes: the package's build, and the four checks .github's typescript.yml runs in
# CI, one job each, in a new container of the toolchain stage of .devcontainer/Dockerfile — as the
# runner's user, with HOME=/tmp, without the spec submodule, with CI and ALLOWED_LICENSES from the
# step's environment (R19 .github; R12 in docs/decisions.md). Nothing here reads spec/: the
# documents are checked by spec's own recipe, just -f spec/justfile docs-check-repo.

set shell := ["bash", "-euo", "pipefail", "-c"]

# The tools are the packages package-lock.json pins, run from where npm ci puts them: nothing is
# fetched on the fly.
bin := "node_modules/.bin"

# Run the four checks CI runs, before a pull request. ci-licenses needs ALLOWED_LICENSES: the list is
# in .github's typescript.yml (CLAUDE.md, Environment).
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

# Fail if a package of package-lock.json, the tools of development too, carries a license outside
# ALLOWED_LICENSES and is no named exception (R12, R14). It reads the lock file alone.
ci-licenses:
    node scripts/licenses.ts

# Build the package into lib/: JavaScript and its declarations. lib/ is emptied first, so that no
# file of an older build ships.
build: _install
    rm -rf lib
    {{ bin }}/tsc -p tsconfig.build.json

# Format and fix the code in place, the way ci-lint checks it.
fmt: _install
    {{ bin }}/biome check --write

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
