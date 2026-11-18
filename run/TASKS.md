# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T133. Комментарии кода по R160 spec: `src/core/` и `src/eval/`

- **Цель:** комментарии `src/core/` и `src/eval/` говорят только то, чего не скажут код и имена: почему, ограничение, ловушку, контракт экспортируемого API (R160 spec, «Comments»).
- **Сделать:** убрать пересказ кода, историю, номера задач и разделов документов; где причина — решение, ограничение одной фразой и номер в конце, `(R25)`. Строки, названия тестов и сгенерированный код — не комментарии, их не трогать. Код не менять.
- **Зависит от:** T128.
- **Как проверить:** `just ci`; `just -f spec/justfile docs-check-repo` — номера в комментариях; проверки по `.claude/rules/eval.md`; `/code-review high`.
- **Разделы:** R160 spec, R32 spec; RULES.md spec — The bar.

#### T134. Комментарии кода по R160 spec: `src/element/`

- **Цель:** комментарии `src/element/` — по R160 spec, «Comments», как в T133; JSDoc экспортируемого API, который уходит в типы пакета, держит его контракт.
- **Сделать:** как в T133. `src/element/` — в путях релиза: мерж выпускает следующую версию линии.
- **Зависит от:** T128.
- **Как проверить:** `just ci`; `just -f spec/justfile docs-check-repo`; проверки по `.claude/rules/element.md`; `/code-review high`.
- **Разделы:** R160 spec, R32 spec; R08.

#### T135. Комментарии кода по R160 spec: `page/`, `scripts/`, `emulators/`, `probe/`, `.github/` и justfile

- **Цель:** комментарии остального кода и настроек — по R160 spec, «Comments», как в T133: TypeScript, скрипты оболочки, YAML workflow и justfile.
- **Сделать:** как в T133. `.devcontainer/` — заготовка `spec` (R79 spec): его не трогать.
- **Зависит от:** T128.
- **Как проверить:** `just ci`; `just -f spec/justfile docs-check-repo`; проверки по `.claude/rules/page.md` и `.claude/rules/ci.md`; `/code-review high`.
- **Разделы:** R160 spec, R32 spec, R79 spec.
