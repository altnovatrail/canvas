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

#### T118. Firefox прокручивает к пункту рабочей тетради — Д10

- **Цель:** `scrollIntoView` пункта списка рабочей тетради — его `<g role="listitem">` — показывает пункт целиком в Chromium, WebKit и Firefox, и тест прокрутки снова берёт группу во всех трёх движках.
- **Почему:** ночная работа по слову автора 2026-11-16 (прогон «Сделай эпик» spec, T171; R156 spec): в таблице 1 эпика нет, T116 и T117 ждут релизов других репозиториев, а из строк таблицы 4 целиком внутри репозитория закрывается только Д10 — остальные ждут автора, устройства, формат или другие репозитории.
- **Сделать:**
  1. Группа пункта — в начале пункта через `transform`, текст, рамки и значения демонстрации — от этого начала (как велит Д10); `PageItem` даёт начало пункта — левый край колонки и верх ряда.
  2. Тест прокрутки — к группе во всех трёх движках; тесты, что читают координаты частей, — в единицах печати.
  3. Поправки к R36 и R78; architecture 3.2; Д10 — закрыть.
- **Как проверить:** `just ci`; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг.
- **Разделы:** Д10; R36, R78; measurements 1.5 и 1.6; architecture 3.2; [.claude/rules/element.md](../.claude/rules/element.md).
- **Решить при планировании:** В80 — какой разметкой закрыть Д10.
- **Выяснилось при планировании (2026-11-16):**
  - путь Д10 не закрывает её: Firefox берёт SVG-группу как точку в её начале, и с `transform` пункт доезжает лишь до края видимой части — виден 0,5 px. Вложенный `<svg>` размером с пункт Firefox показывает целиком, axe-core чист во всех трёх движках (measurements 1.6). Разметка — решение R36, поэтому вопрос — автору (В80);
  - на ветке `t118-firefox-item-scroll` — шаг 1 и тесты: `PageItem.left` и `top`, группа по `transform`, части от начала пункта; тесты шрифтов, окошек и рамок читают координаты в единицах печати; тест прокрутки в Firefox по-прежнему берёт текст. `just ci` — зелёный, `docs-check-repo` — ok;
  - `/code-review high`, один круг, восемь находок: главная — путь Д10 не показывает пункт в Firefox, и поправки к R36 и R78, architecture 3.2 и сжатая Д10 говорили о «верхе пункта в виду», которого нет. Они сняты до ответа на В80, слабая проверка верха в Firefox — тоже. Не взяты: `inPrint` в тесте окошек и числа раскладки в тесте `page.test.ts` — так написаны соседние тесты.
