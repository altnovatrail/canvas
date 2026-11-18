# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T135. Комментарии кода по R160 spec: `page/`, `scripts/`, `emulators/`, `probe/`, `.github/` и justfile

- **Цель:** комментарии остального кода и настроек — по R160 spec, «Comments», как в T133: TypeScript, скрипты оболочки, YAML workflow и justfile.
- **Сделать:** как в T133. `.devcontainer/` — заготовка `spec` (R79 spec): его не трогать.
- **Зависит от:** T128.
- **Как проверить:** `just ci`; `just -f spec/justfile docs-check-repo`; проверки по `.claude/rules/page.md` и `.claude/rules/ci.md`; `/code-review high`.
- **Разделы:** R160 spec, R32 spec, R79 spec.
