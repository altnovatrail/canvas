# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T156. `docs/sources.md` по правилу записей: тема 9

- **Цель:** тема 9 `docs/sources.md` — решения элемента и страницы, 9.1–9.20 — по правилу записей `spec/RULES.md` тега `spec`, на котором стоит `spec/`, как T155 для остальных тем.
- **Почему:** третья, последняя часть строки 7.71 COORDINATION.md `spec`, по тексту T291 `spec` (T154 разбил по правилу 11). Строка 7.71 ждёт T154–T156.
- **Сделать:** свернуть повторные чтения до текущего; файлы MathTrail и NovaTrail в записях (canvas-api, standalone, canvas-api-onprem, `spec` на коммите) — git, ссылка репозиторий@коммит у утверждения; спецификации W3C и WHATWG — редакторские черновики без версии остаются записями, а снимок на дату или коммит репозитория спецификации — ссылка; код движков (Chromium, WebKit, Firefox, Go) на коммите — ссылка; поведение, которое держат тесты элемента или `measurements`, — их ссылка, запись удалить; WCAG и стандарты доступности — по их версии. Каждое место, что цитирует удалённую запись, — ссылка вместо неё; номера не переиспользовать, архивы `docs/plan/` не трогать; смысл утверждений не менять; Д25 — поправить, что закрыто. По окончании строка 7.71 в отчёте — сделана.
- **Как проверить:** `just -f spec/justfile docs-check-repo` — зелёный; размер `docs/sources.md` до и после — в отчёт; `/code-review high`, один круг.
- **Разделы:** `spec/RULES.md`, «The bar» и «Citations»; вводная `docs/sources.md`; R171 `spec`; строка 7.71 «Порядка».
