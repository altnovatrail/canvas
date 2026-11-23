# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T148. Ссылки по правилу R171 spec: `docs/sources.md`, `docs/measurements.md` и ключ `"citations": true`

- **Цель:** в `docs/sources.md` и `docs/measurements.md` ссылка стоит, только если читатель пойдёт по ней, чтобы действовать, — запись хранит дату и не хранит номера задачи, в заголовке тоже (R171 spec); `docs-budgets.json` — с ключом `"citations": true`, как `spec/repo-template/files/docs-budgets.json`, и `docs-check-repo` с ним зелёный.
- **Почему:** R171 spec; строка 7.45 COORDINATION.md spec. Часть задачи T138, разбитой по правилу 11 RUN.md и шагу 9 её текста: T138 — план, CLAUDE.md, `.claude/rules/` и комментарии кода; журнал решений — T139–T146 по своим разделам `##`; `docs/architecture.md` — T147; `docs/sources.md`, `docs/measurements.md` и ключ — T148. Объём — около 32 тыс. слов.
- **Зависит от:** T147 и все части T139–T147.
- **Сделать:**
  1. Каждая ссылка — по правилу: внешний факт, который можно оспорить, — одна запись `sources`/`measurements`; решённый выбор, который выглядит изменяемым, — один номер решения, один раз в тексте; строки «Д…» и «В…» — можно; номер задачи — заменить файлом, решением или словами; датированную поправку — ссылкой на запись; остальное — убрать; в скобке не больше двух ссылок; цепочку — свести к одному месту, где утверждение решено.
  2. Записи `sources` и `measurements` — без номеров задач, в заголовках тоже: где запись говорит, что задача сделала, — файл, решение или дата.
  3. Смысл не менять: правка — только ссылок и того, что их окружает. Ссылка, о которой есть настоящее сомнение, — строка таблицы 3 (`run/QUESTIONS.md`).
  4. Последняя часть: включить ключ `"citations": true` в `docs-budgets.json`; что `docs-check-repo` с ним ещё называет в частях T138–T147, исправить здесь.
  5. Замер «после» — командами `measurements 1.18 spec`, по видам, и в отчёте — было до T138 и стало после всех частей.
- **Как проверить:** `just -f spec/justfile docs-check-repo` — зелёный; тот же запуск с временно включённым ключом `"citations": true` в `docs-budgets.json` не называет ни одного места в файлах и разделах этой части (ключ вернуть); `/code-review high`, один круг.
- **Разделы:** R171 spec, R160 spec; RULES.md spec — The bar и Citations; файлы и разделы этой части.
