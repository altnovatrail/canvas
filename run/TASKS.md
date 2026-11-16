# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T117. Скорость CI: строка 7.23 — релиз в `toolchain-core` и apt снимка, переход на тег `spec`

- **Цель:** `canvas` — на теге `spec` строки 7.14 COORDINATION.md spec: `.devcontainer/` — шаблона этого тега, со стадией `toolchain-core` и apt только из источников снимка, а релиз и проверки без браузеров строятся в `toolchain-core`; что проверки доказывают, не меняется.
- **Почему:** строка 7.23 spec («релиз — в `toolchain-core`; apt — только снимок, по T166»), шестая поправка 2026-11-15 к R76 spec; замеры — measurements 3.1 spec: шаг сборки образа в релизе `canvas` шёл 826 с, почти всё — `apt-get update --snapshot`. Ждёт тега `spec` строки 7.14 (T166 spec) и релиза `.github` строки 7.13 с `toolchain-core`: оркестратор запустит её, когда оба выйдут. Переход меняет `.devcontainer/`, поэтому она — последняя из задач строки 7.23, после T116.
- **Сделать:**
  1. Переход на тег `spec` — новейший на день задачи, как T113 (R79): подмодуль, пакеты `@altnovatrail/spec` и `@altnovatrail/contracts`, `spec_tag`, копия части `legal`, если тег её меняет; `.devcontainer/` — как пишет рецепт тега; запись журнала о переходе.
  2. Ссылки на релиз `.github` с `toolchain-core` — T66 .github, последняя часть строки 7.13, после перехода `.github` на тег `spec` строки 7.14 (T171 spec: ночью `.devcontainer/` не меняется), — новее `v0.1.30`, который взяла T116; релиз `canvas` — в `toolchain-core` по входу общего `release.yml`; проверки без браузеров — `lint`, `vuln`, `licenses` и документы — там же, если общие workflow это дают. Что T66 .github даёт вызывающему и какие входы у неё новые — по RUN.md, `docs/plan/` и журналу решений `.github` на его теге, запись sources 6, как 6.14.
  3. Поправки к R57 и записи о релизе (R66) — что изменилось; architecture 3.7.
- **Как проверить:** `just ci`; CI pull request зелёный, Release — тоже; время изменённых job до и после — в отчёте; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг. После мержа автор пересобирает контейнер («Rebuild Container»).
- **Разделы:** строки 7.13, 7.14 и 7.23 COORDINATION.md spec; measurements 3.1 spec; R76 spec, R156 spec; R57, R66, R79, R80; [.claude/rules/ci.md](../.claude/rules/ci.md).
