# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T114. CI на `.github` v0.1.24

- **Цель:** общие workflow `canvas` — на последнем релизе `.github`, v0.1.24, а Dependabot поднимает ссылки на них одной группой.
- **Почему:** T113 перевела `canvas` на `spec` v0.18.3, а `uses:` в `.github/workflows/` ещё на v0.1.22 (`c0234058dc1a85edd7b5d579b90f8fdb98ea826b`). Задача — следующая после перехода, как T68 `sim`: так велит текст T113 от оркестратора (R156 spec). Кеш образа `toolchain` у `canvas` уже есть с v0.1.22 (Д146 spec), а группы `shared-workflows` в `.github/dependabot.yml` нет (Д88 spec).
- **Сделать:**
  1. `gh release verify v0.1.24 -R altnovatrail/.github`; SHA тега — `gh api repos/altnovatrail/.github/git/ref/tags/v0.1.24` (на 2026-11-16 — `fab102d8bbb4659575e107ee488e072aaaa71821`).
  2. Каждый `uses: altnovatrail/.github/...@<SHA> # v0.1.22` в `ci.yml`, `codeql.yml`, `scorecard.yml` и `release.yml` — на SHA v0.1.24 с версией в комментарии; что v0.1.23 и v0.1.24 меняют во входах и выходах общих workflow `typescript.yml`, `documents.yml`, `release.yml` — по их диффу, `gh api repos/altnovatrail/.github/compare/v0.1.22...v0.1.24`.
  3. Группа `shared-workflows`, `patterns: ["altnovatrail/.github/*"]`, под `github-actions` в `.github/dependabot.yml` (architecture 3.3 `.github`; Д88 spec).
  4. Поправка к записи журнала о CI (R43 и те, что называют v0.1.22), если релиз меняет то, что она говорит.
- **Как проверить:** `just ci`; проверки pull request — Documents, TypeScript, Release, CodeQL, Scorecard — зелёные; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг.
- **Разделы:** R156 spec; Д88 spec, Д146 spec; [.claude/rules/ci.md](../.claude/rules/ci.md); R43, R44.
