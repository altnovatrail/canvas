# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T116. Скорость CI: строка 7.23 — движки и образ на релизе `.github` строки 7.13

- **Цель:** CI `canvas` — на релизе `.github` строки 7.13 COORDINATION.md spec: WebKit и Firefox — своей проверкой, образ `toolchain` в своих workflow — как в общих; что проверки доказывают, не меняется.
- **Почему:** строка 7.23 spec и шестая поправка 2026-11-15 к R76 spec; замеры — measurements 3.1 spec. T115 сделала часть, что ничего не ждёт (R80), а эта ждёт релиза `.github` строки 7.13: оркестратор запустит её, когда релиз выйдет. Часть строки 7.13 с `toolchain-core` ждёт ещё и тега `spec` строки 7.14 — она в T117.
- **Сделать:**
  1. `gh release verify <тег> -R altnovatrail/.github`; SHA тега; что релиз меняет во входах и выходах `typescript.yml`, `documents.yml` и `release.yml` — по диффу от v0.1.24 (запись sources 6, как 6.13).
  2. Все `uses: altnovatrail/.github/...` — на SHA релиза с версией в комментарии.
  3. Движки — как строка 7.22 (`app`): WebKit и Firefox — отдельной проверкой через вход `typescript.yml`, покрытие — в Chromium; `ci-test` в `justfile` — так, чтобы `just ci` по-прежнему гонял все три движка.
  4. Свои workflow — `page.yml` и `emulators.yml` — берут образ `toolchain` как общие: один путь и одно имя образа во всех workflow — сейчас у `canvas` `build/toolchain.tar` и `toolchain`, у общих `toolchain.tar` и `novatrail-toolchain.tar` (measurements 3.1 spec), — без сохранения из pull request, а при промахе образ строит один job; `emulators/toolchain.sh` — сверить с `toolchain.sh` `spec` (поправка T88 к R57).
  5. Поправки к R57, R43 и R12 — что изменилось и почему; architecture 3.7.
- **Как проверить:** `just ci`; CI pull request зелёный; время изменённых job до и после — в отчёте, по прогонам `main` и pull request; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг.
- **Разделы:** строки 7.13, 7.22 и 7.23 COORDINATION.md spec; measurements 3.1 spec; R76 spec, R156 spec; R12, R43, R57, R80; [.claude/rules/ci.md](../.claude/rules/ci.md), [.claude/rules/page.md](../.claude/rules/page.md).

#### T117. Скорость CI: строка 7.23 — релиз в `toolchain-core` и apt снимка, переход на тег `spec`

- **Цель:** `canvas` — на теге `spec` строки 7.14 COORDINATION.md spec: `.devcontainer/` — шаблона этого тега, со стадией `toolchain-core` и apt только из источников снимка, а релиз и проверки без браузеров строятся в `toolchain-core`; что проверки доказывают, не меняется.
- **Почему:** строка 7.23 spec («релиз — в `toolchain-core`; apt — только снимок, по T166»), шестая поправка 2026-11-15 к R76 spec; замеры — measurements 3.1 spec: шаг сборки образа в релизе `canvas` шёл 826 с, почти всё — `apt-get update --snapshot`. Ждёт тега `spec` строки 7.14 (T166 spec) и релиза `.github` строки 7.13 с `toolchain-core`: оркестратор запустит её, когда оба выйдут. Переход меняет `.devcontainer/`, поэтому она — последняя из задач строки 7.23, после T116.
- **Сделать:**
  1. Переход на тег `spec` — новейший на день задачи, как T113 (R79): подмодуль, пакеты `@altnovatrail/spec` и `@altnovatrail/contracts`, `spec_tag`, копия части `legal`, если тег её меняет; `.devcontainer/` — как пишет рецепт тега; запись журнала о переходе.
  2. Ссылки на релиз `.github` с `toolchain-core`, если он новее того, что взяла T116; релиз `canvas` — в `toolchain-core` по входу общего `release.yml`; проверки без браузеров — там же, если общие workflow это дают.
  3. Поправки к R57 и записи о релизе (R66) — что изменилось; architecture 3.7.
- **Как проверить:** `just ci`; CI pull request зелёный, Release — тоже; время изменённых job до и после — в отчёте; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг. После мержа автор пересобирает контейнер («Rebuild Container»).
- **Разделы:** строки 7.13, 7.14 и 7.23 COORDINATION.md spec; measurements 3.1 spec; R76 spec, R156 spec; R57, R66, R79, R80; [.claude/rules/ci.md](../.claude/rules/ci.md).
