# TASKS.md — tasks outside an epic of `canvas`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T114\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T120. Картинка работы: PNG штрихов поверхности

- **Кто:** Claude. **План:** —.
- **Цель:** элемент `<novatrail-canvas>` даёт картинку работы для `StoredWork.picture` `PutWork`, и `app` сохраняет работу на сервере (T62 `app`).
- **Почему:** строка `app` В66, решение автора 2026-11-16 в T172 spec: кто рисует лист и вырезку, тот рисует и картинку, и они выглядят одинаково; R76 spec, строка 5.14 COORDINATION.md spec; architecture 3.2 spec. `exportPNG()` снят R27, а `exportWork()` даёт только вырезку для проверки. Текст задачи дал оркестратор `spec` для строки 5.14, «Сделай эпик E…» — слово автора на неё (R156 spec; правило 6 COORDINATION.md spec).
- **Сделать:** метод элемента — PNG штрихов, что показывает поверхность листа или тетради в конце работы, без условия, нарисованный тем же кодом, что лист и вырезка; на тетради — вся её поверхность одной картинкой; размер — под предел работы 4 МиБ ([текст контрактов](../spec/contracts/README.md), раздел 15); метод — в соглашении элемента и в [docs/architecture.md](../docs/architecture.md), поправкой к решению об экспорте; тесты; релиз в npm.
- **Как проверить:** проверки `canvas` по его RUN.md; PNG с подписью PNG на листе и на тетради, до первой отправки и после неё; снимок картинки против снимка поверхности.
- **Разделы:** строка 5.14 COORDINATION.md spec; architecture 3.2 spec; [текст контрактов](../spec/contracts/README.md), раздел 15; R36 spec; R27; строка `app` В66; Д13 в [DEBT.md](DEBT.md).
