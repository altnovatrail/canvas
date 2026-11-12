# canvas — источники

> Внешние факты, на которых стоят документы `docs/` этого репозитория: условия поставщика, цена, закон, стандарт, документация библиотеки или другой программы, тексты MathTrail и других репозиториев NovaTrail. Здесь их записи — адрес, версия или дата страницы, дата прочтения и цитата на языке источника, — а [architecture.md](architecture.md) держит утверждение и ссылку на запись по её номеру, как на раздел: `sources 1.1` (RULES.md, The bar; R143 spec). Цитаты, которые запись журнала решений даёт сама, остаются в записи: решение не переписывается.
>
> Запись — подраздел «N.M» темы: один источник или одно чтение нескольких источников ради одного решения. В скобках в её начале — разделы [architecture.md](architecture.md) и решения, которые на неё опираются. Номер записи не меняется: новая встаёт в конец своей темы, новая тема — в конец файла. Источник, прочитанный заново, — пункт со своей датой в той же записи, а прежний текст не правится: на него опираются решения его дня. Образец — sources spec. Итоги замеров и проб — не здесь, а в [measurements.md](measurements.md).
>
> До T110 записи стояли в architecture 4, под теми же заголовками. Там остался указатель: на тот раздел ссылаются журнал решений и архивы `docs/plan/`, а их не переписывают (RUN.md, T110).

## 1. MathTrail, прототип и исследования

### 1.1. MathTrail Canvas

[mathtrail/canvas-api](https://github.com/mathtrail/canvas-api/tree/0901af0), ветка `main`, коммит 0901af0, прочитано 2026-10-19:

- R15 canvas-api (architecture 2.2): «Координаты хранятся в логической системе страницы. Страница имеет фиксированную ширину, ось y направлена вниз, масштаб одинаков по обеим осям. Нормализация 0..1000 появляется только на границе с Gemini»; по поправке 2026-10-11 штрихи хранятся на устройстве, «но тоже в логических единицах»;
- spec 4 canvas-api (architecture 2.2): «Лист черновика | 1000 × 1400 единиц, клетка — 50 единиц»; о картинке проверки — «масштаб фиксированный: одна единица — один пиксель» и «на картинке только штрихи ребёнка: без условия, подписи единиц, рамок подсказок и клетки»; размеры — «константы протокола». Над разделом — пометка «Раздел переписывает T67», а T67 «Лист: геометрия, картинка, рамка» в таблице 1 его RUN.md — `[ ]`;
- R43 canvas-api (architecture 2.2): «Разбор черновика возвращает `box_2d` в долях 0..1000 картинки черновика. Сервер переводит его в логические единицы листа и пропускает только годный»; «Клиент берёт штрихи, которые были на листе в момент Check и у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц»;
- spec 4.1, 4.2 и 4.4 canvas-api, перечитано 2026-10-21 (architecture 3.2): «Каждое вписывается по ширине своей области на экране»; формулы `scale = ширина_области_px / ширина_в_единицах` и `x_px = (x − viewport.x) × scale`; «Лист, который не помещается по высоте, прокручивается: `viewport` — его видимая часть»; «Координаты вне листа или поля прижимает к краю»; «Клиент всегда получает **логические** прямоугольники `{x, y, w, h}`»;
- spec 3.1 canvas-api (architecture 2.1): «Холст | konva + react-konva | 10.7.x / 19.3.x | лист — слои записи (DrawingLayer) и подсказок (HintLayer)…»; «Ввод — Pointer Events. `pointerType` отличает перо от пальца, `pressure` даёт нажим. Нажим меняет только толщину линии на экране; в картинки проверки он не попадает»; об отсечении ладони — «как только в сессии впервые встретилось перо, холст переходит в „режим пера“: касания пальцем и ладонью больше не рисуют» и «Касания с большой площадью (`width` или `height` больше 30 px) отбрасываются как ладонь». В `web/package.json` того же коммита в зависимостях только `react` и `react-dom` 19.3.0 — ни `konva`, ни `react-konva`;
- R13 canvas-api (architecture 2.1): «Клиент на React и Konva живёт в этом же репозитории, в `web/`. — Почему: API и клиент меняются вместе, одним pull request». Это единственное решение журнала canvas-api, где названа Konva;
- R65 canvas-api (architecture 2.4): «Разметка автора ставится до отправки и при письме, а не задним числом по рамке модели: так она не подстраивается под ответ модели»;
- R66 canvas-api (architecture 2.4): журнал автора «хранит и штрихи как есть — точки со временем, тип указателя, нажим и наклон». T77 «Исследование: PNG или векторы» в таблице 1 его RUN.md — `[ ]`.
- перечитано 2026-10-21 (architecture 3.6): R26 canvas-api — «Согласие родителя подтверждает оператор, а не клиент», «`POST /v1/me/consent` только отмечает, что уведомление прочитано: статус `pending`» и «До `verified` профили детей и холсты не создаются»; П-5 canvas-api — «отметка 18+ при согласии и VPC-метод»; в `docs/plan/E2-draft.md`, T50, — «уведомление о данных для согласия — с номером версии, который пишется в `consent_version`».

### 1.2. MathTrail standalone

[mathtrail/mathtrail-standalone](https://github.com/mathtrail/mathtrail-standalone/tree/c6cbeb2), ветка `main`, коммит c6cbeb2, прочитано 2026-10-19 (architecture 2.1):

- R269 standalone, «Rejected»: «Konva and other canvas libraries. A canvas is one element a screen reader cannot read, and a change of theme means drawing it again. … Mafs and react-konva need React»;
- `docs/widget-drawings.md`, таблица «What to draw with», по данным npm и bundlephobia на 2026-10-08: «Konva 10.7.1 | MIT | 186.7 / 55.6 KB» (min / gzip); «react-konva 19.3.0 | MIT | 143.2 / 44.5 KB + React | … | Needs React's reconciler».

### 1.3. Прототип `spec/draft/`

(architecture 2.1) — `NovaTrail Widget.html` на теге `spec` v0.1.0, прочитано 2026-10-19: лист — элемент `<canvas>` с `getContext('2d')`, а ластик рисует с `globalCompositeOperation = 'destination-out'`, то есть стирает пиксели. «Where it differs from the documents in docs/, the documents win» (`spec/draft/README.md`). На теге v0.2.13 файл тот же, прочитано 2026-10-21 (architecture 3.1): лист сложен из элементов страницы — пунктирный набросок SVG лежит под холстом, на холсте стоит `touch-action:none`, рамка наставника — SVG поверх него с `pointer-events:none`, а номера и надпись — элементы `div`.

### 1.4. Исследование «Рукопись ребёнка на канве и ИИ-наставник»

[артефакт](https://claude.ai/artifact/QLH6WzmmQs4MY5NvjMxb1D), отчёт `files/child-handwriting.md`, версия 1792539580-561a, от 2026-10-20, прочитано 2026-10-21 (architecture 2.1, 2.2 и 2.4). В репозиториях NovaTrail его нет, доступ к артефакту — у автора, а то, на что опираются документы `canvas`, процитировано ниже. Это не решение: «Не решение: решения по нему принимает эпик E6 в RUN.md, а пока они не приняты, действуют документы и журнал решений». Какой это RUN.md, исследование не говорит: в RUN.md `spec` на теге v0.2.12 эпиков после E5 нет, а здесь — после E2. Его пункты цитируются по его же меткам — A3, A6, C1. «Метка» в нём — и метка группы штрихов (A, B, C), и пометка слоя наставника; в документах `canvas` второе — «пометка», как в concepts 8 spec:

- A3: «Канва вида «лист для рукописи» экспортирует только чернила, без сетки и текста задачи, обрезает по рамке работы с полем 12 px и масштабирует так, чтобы медианная высота группы штрихов была ≈32 px»; «Высота цифры — настройка канвы модуля»;
- A4: «Риск по возрастанию: (a) картинка < (b) картинка и грубые признаки процесса < (d) стёртое ≤ (c) сырые штрихи с временем и нажимом»;
- A6: «Метки рисует сервер в памяти запроса по рамкам групп, которые прислало устройство»; высоты цифр для eval — «16, 24, 32 и 48 px»; в резюме — «история письма — только условие eval»;
- C1: «(c) для всего, что касается ячейки ответа; (b) для места в черновике; (a) — только если (b) и (c) пусты, и только после притяжки к штрихам. Ничто не сошлось со штрихами — рамки нет»; «Метки — на полях с тонкими выносками, не поверх чернил; чтение всегда получает чистую картинку»; «Рамки групп финального состояния выводимы из самой картинки и не несут времени». Среди замеров к C — «Чтение с метками и без — не портят ли метки чтение (A/B: чистая, размеченная, пара)»;
- C2: «Каждая метка слоя наставника хранит `{stroke_ids, snapped_box}` и рисуется каждый кадр из текущей геометрии этих штрихов; новые штрихи её не двигают; стёрты все её штрихи — метка исчезает»; «Рамка модели переводится в координаты листа по соглашению поставщика, обрезается границами, и берутся штрихи, точки которых в основном внутри (поля и порог — параметры eval); рамка притягивается к их общему прямоугольнику»; «Метки ссылаются на таблицу «метка → ID штрихов», действительную только для своей отправки. `snapped_box` нужен только эскизу «как начать» на пустом месте»;
- H3: «ластик удаляет штрихи целиком, и вырезка рисуется только из видимых — стёртого на картинке нет»; «пустой лист отсекается программой до вызова (R62 canvas-api)»;
- F2: «Текст несёт якоря меток из закрытого набора, который выдаёт сервер (`[[mark:A]]`)»; «каждый кусок — отдельное высказывание, метка появляется на его событии `start`»;
- И22, открытый вопрос исследования: «Как указывать место: размеченная копия, пара «чистая + размеченная», рамки», рекомендация — «A/B по поставщикам до фиксации полей места в схеме наблюдения»;
- о R09 spec, в пункте 3 «Решения, которые стоит пересмотреть»: «Уточнить, что запрос проверки, кроме картинки, может нести (а) рамки групп штрихов финального состояния и (б) токен прошлой проверки»;
- синтетический пример: «Рамки — `[ymin, xmin, ymax, xmax]` в долях 0–1000 вырезки (внутреннее соглашение; адаптер каждого поставщика переводит в своё)», а `sheet_box` — «где вырезка лежит на листе, в том же порядке `[ymin, xmin, ymax, xmax]`, но в логических координатах листа (здесь 312 × 378, как сама вырезка); по нему устройство возвращает рамки на лист». Вырезка в примере — 378×312, то есть `sheet_box` покрывает её вместе с полем.

### 1.5. Анализ «Базовая канва и контракт „канва ↔ агент“»

(architecture 2.5 и 3.1; архив E2, [docs/plan/E2.md](plan/E2.md)) — его прислал автор 2026-10-21, в репозитории его нет. Писала модель, которая не видела ни кода, ни принятых решений NovaTrail, поэтому отсюда берутся вопросы, а не факты. В `spec` v0.2.14 тот же анализ — источник product 14 spec и architecture 8 spec: из него О-21, вариант О-8, Т-30 и то, что протоколу виджета решать по architecture 3.4 spec (architecture 3.1). Раздел 2.5 отсюда T29 в RUN.md `spec` берёт входом.

## 2. Библиотеки рисования

### 2.1. tldraw

(architecture 2.1) — [`LICENSE.md`](https://github.com/tldraw/tldraw/blob/e8eb1cf5635d28a2d516f0c0d823ed35f3ea9dc9/LICENSE.md), ветка `main`, коммит e8eb1cf; файл последний раз менялся 2025-09-17, «License change for 4.0 (#6780)»; прочитано 2026-10-21:

- «"Production Environment" means any production deployment of the Software that operates on servers, cloud platforms, web applications, or where the software is used to provide functionality to end users, customers, or the public»;
- условия: «Not to use the Software in Production Environments»; «Not to disable, change, or interfere with the Software's License Key enforcement»; «Not to make the Software available under a license that supersedes or negates the effect of this License». Работа в production — по пробному ключу или по коммерческому договору: «you are permitted to use the Software in Production Environments for the specified period». Другие лицензии — отдельно: «Alternative licenses are available from tldraw for commercial and non-commercial use»; их условия не читались;
- «The Software includes technical measures to verify License Key validity, detect deployment environments, enforce usage restrictions based on license type, and ensure proper watermark display. The Software may collect and transmit usage data to tldraw for license compliance purposes»;
- в реестре npm [`tldraw`](https://registry.npmjs.org/tldraw) — 5.5.2 от 2026-10-02, `"license": "SEE LICENSE IN LICENSE.md"`; API GitHub определяет лицензию репозитория как `NOASSERTION`.

### 2.2. tldraw Agent starter kit

(architecture 2.1) — [`templates/agent`](https://github.com/tldraw/tldraw/tree/e8eb1cf5635d28a2d516f0c0d823ed35f3ea9dc9/templates/agent), тот же коммит, прочитано 2026-10-21: его `LICENSE.md` — «MIT License … Copyright (c) 2024 tldraw Inc.»; в `package.json` — зависимости `tldraw`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai` и `@google/generative-ai`; README — «This starter kit demonstrates how to build an agent that can manipulate the tldraw canvas», а среди действий агента — «Create, update and delete shapes» и «Draw freehand pen strokes».

### 2.3. Реестр npm

(architecture 2.1), прочитано 2026-10-21: [`konva`](https://registry.npmjs.org/konva) — 10.9.0 от 2026-10-15, MIT, без зависимостей; [`perfect-freehand`](https://registry.npmjs.org/perfect-freehand) — 1.2.3 от 2026-02-01, MIT, без зависимостей; [`rbush`](https://registry.npmjs.org/rbush) — 4.0.1 от 2024-08-21, MIT, одна зависимость — `quickselect` `^3.0.0`, а [`quickselect`](https://registry.npmjs.org/quickselect) 3.0.0 — ISC.

### 2.4. Konva

(architecture 2.1 и 3.1) — документация [konvajs/site](https://github.com/konvajs/site/tree/04f3b66143ef9733662c8b2d86c6be61b2827a7b), коммит 04f3b66 «Update to konva 10.9.0: batch updates docs» от 2026-10-15, и пакет [konvajs/konva](https://github.com/konvajs/konva/tree/d95eed6d46e785efba6ab5e9eaf5a1d6bbb528c6), тег 10.9.0, коммит d95eed6; прочитано 2026-10-21:

- `content/docs/overview.md`: «Each layer has two `<canvas>` renderers: a scene renderer and a hit graph renderer»;
- README [react-konva-utils](https://github.com/konvajs/react-konva-utils/blob/15b6009acbaf37c913c722a460664e1c2c98e3af/README.md), коммит 15b6009: «Konva is a canvas library. It can't render DOM elements directly. `<Html>` creates an absolutely positioned div over the canvas»;
- `content/docs/posts/Canvas_vs_SVG.mdx`: «Konva does not create accessible DOM elements for canvas shapes. Keep essential controls and content in HTML»;
- `content/docs/sandbox/Free_Drawing.mdx`: ластик рисует линию с `globalCompositeOperation` `'destination-out'`, а штрихов демонстрация не удаляет;
- `content/api/Konva.Node.mdx`: обработчик получает «`evt` as native browser event»; слов `pressure` и `getCoalescedEvents` в документации этого коммита нет;
- README пакета: «In order to run `konva` in nodejs environment you also need to install `canvas` or `skia-canvas` package manually for rendering backend».

### 2.5. perfect-freehand

(architecture 3.1) — [README](https://github.com/steveruizok/perfect-freehand/blob/f56f097e0e211fffa1601b93883e4d9f9dccf122/packages/perfect-freehand/README.md), тег v1.2.3, коммит f56f097, прочитано 2026-10-21: «The `getStroke` function will return a new array of outline points. These outline points will form a polygon (called a "stroke") that surrounds the input points»; «To use real pressure, such as that from a pen or stylus, provide the pressure as the third number for each input point, and set the `simulatePressure` option to `false`». Путь контура README предлагает отдать в `Path2D`.

### 2.6. rbush

(architecture 3.1) — [README](https://github.com/mourner/rbush/blob/c3f6ad06f1e47ccec58998461f3383aa90066ecd/README.md), тег v4.0.1, коммит c3f6ad0, прочитано 2026-10-21: «RBush is a high-performance JavaScript library for 2D spatial indexing of points and rectangles»; поиск «Returns an array of data items (points or rectangles) that the given bounding box intersects»; «RBush v4+ is published as a ES module and no longer supports CommonJS environments». В пакете 4.0.1 на jsdelivr — `index.js`, `rbush.js`, `rbush.min.js`, README и LICENSE, файла типов нет; `@types/rbush` 4.0.0 в реестре npm — MIT.

### 2.7. Другие библиотеки рисования

(architecture 2.1) — реестр npm и исходники на тегах, прочитано 2026-10-21:

- Fabric.js 7.4.0 от 2026-05-18, MIT. Нажима нет: на вопрос о толщине вдоль штриха сопровождающий ответил «no it does not, that would need a special class, derived from path probably» ([#4885](https://github.com/fabricjs/fabric.js/issues/4885#issuecomment-378188602)). Ластик вынесен в [`@erase2d/fabric`](https://github.com/ShaMan123/erase2d) 1.2.2: он рисует путь с `destination-out` и меняет clip path стираемого объекта. В Node — «Fabric.js depends on node-canvas for a canvas implementation (`HTMLCanvasElement` replacement) and jsdom for a `window` implementation on node» ([README](https://github.com/fabricjs/fabric.js/blob/v740/README.md));
- Paper.js 0.14.0 от 2026-10-19, MIT. После 0.12.18 от 2024-07-17 следующий релиз — 0.12.19 от 2026-10-18; слова «pressure» в `dist/paper-full.js` нет. В Node — «Paper.js relies on Node-Canvas for rendering, which in turn relies on the native libraries Cairo and Pango» ([README](https://github.com/paperjs/paper.js/blob/v0.14.0/README.md));
- PixiJS 8.22.0 от 2026-10-01, MIT: рисует WebGL, WebGPU или холстом, ластик — blend `erase`, а [доступность](https://pixijs.com/8.x/guides/components/accessibility) — «PixiJS includes built-in accessibility support through a DOM-based overlay system». Нажим — поле `pressure` у `FederatedPointerEvent`: «Pressure applied by the pointing device during the event» ([исходник](https://github.com/pixijs/pixijs/blob/v8.22.0/src/events/FederatedPointerEvent.ts));
- Two.js 0.8.24 от 2026-08-29, MIT: «renderer agnostic enabling the same api to render in multiple contexts: webgl, canvas2d, and svg» ([README](https://github.com/jonobr1/two.js/blob/v0.8.24/README.md)); обработчиков ввода в сборке нет;
- Excalidraw 0.18.1 от 2026-04-20, MIT: 31 зависимость, peer `react` и `react-dom` `^17.0.2 || ^18.2.0 || ^19.0.0`; ластик помечает элемент удалённым целиком. У штриха от руки — `pressures: readonly number[]` ([`element/types.ts`](https://github.com/excalidraw/excalidraw/blob/v0.18.1/packages/excalidraw/element/types.ts)), а рисует его `getStroke` из perfect-freehand ([`renderer/renderElement.ts`](https://github.com/excalidraw/excalidraw/blob/v0.18.1/packages/excalidraw/renderer/renderElement.ts)); «Since Excalidraw doesn't support server side rendering so it should be rendered only on client» ([документация](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration));
- tldraw 5.5.2: peer `react` и `react-dom` `^18.2.0 || ^19.2.1`; лицензия — запись «tldraw» выше;
- signature_pad 5.1.4 от 2026-07-31 и Atrament 5.1.0 от 2025-09-26, обе MIT: ластик — `destination-out`. signature_pad — «It's HTML5 canvas based and uses variable width Bézier curve interpolation» ([README](https://github.com/szimek/signature_pad/blob/v5.1.4/README.md)), а толщина у него зависит только от скорости. Atrament — «Atrament does not store the stroke paths itself - instead, it draws directly onto the canvas bitmap» ([README](https://github.com/jakubfiala/atrament/blob/v5.1.0/README.md)), а вне браузера бросает ошибку;
- drauu 1.0.0 от 2026-01-13, MIT: «SVG-based drawing tool in browser» ([README](https://github.com/antfu/drauu/blob/v1.0.0/README.md)); ластик удаляет путь SVG целиком, а внутри — perfect-freehand 1.2.2.

Размер в разделе 2.1 — главный файл сборки с jsdelivr, сжатый `gzip -9`, 2026-10-21, в байтах: `konva.min.js` — 58 317; perfect-freehand `dist/esm/index.mjs` — 1 999; `rbush.min.js` с `quickselect` внутри — 2 327; fabric `dist/index.min.mjs` — 91 558; `paper-core.min.js` — 74 297; `pixi.min.mjs` — 236 793; `two.min.js` — 49 680; Excalidraw `dist/prod/index.js` — 154 698; `signature_pad.min.js` — 4 660; Atrament `dist/esm/index.js` — 2 601; `@drauu/core` `dist/index.mjs` без минификации — 8 096.

## 3. Платформа браузера

### 3.1. Платформа браузера

(architecture 3.1), прочитано 2026-10-21:

- [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/), W3C Recommendation от 30 июня 2026. О `pressure`: «For hardware and platforms that do not support pressure, the value MUST be 0.5 when in the active buttons state and 0 otherwise». О `width` и `height`: «in cases where the actual geometry of the input is not detected by the hardware, the user agent MUST return a default value of 1». Об отсечении ладони устройством: «Currently, it is not possible for authors to suppress this behavior», а `pointercancel` приходит, когда «The user agent interprets the input as accidental (for example, the hardware supports palm rejection)». `getCoalescedEvents()` объявлен с `[SecureContext]`. Об iframe: «Note touch-action does not apply/cascade through to embedded browsing contexts», а MDN, [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): «Each embedded browsing context has its own document and allows URL navigations»;
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.6/api/PointerEvent.json), релиз v8.1.6: `getCoalescedEvents` — в Safari и Safari на iOS с 18.2, а у Firefox для Android — «The method always returns an empty array, regardless of the user's actions»; `pressure` — в Safari с 13, `altitudeAngle` — с 18.2;
- WebKit, [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/), 2024-07-16: «Safari injects noise into various APIs: namely, during 2D canvas and WebGL readback, and when reading AudioBuffer samples using WebAudio»; «The amount of noise injected is extremely small, and (mostly) should not result in observable differences or artifacts». Apple, [iOS 26](https://www.apple.com/newsroom/2025/06/apple-elevates-the-iphone-experience-with-ios-26/), 2025-06-09: «Browsing in Safari gets even more private with advanced fingerprinting protection extending to all browsing by default». Шумит ли в обычном просмотре любой холст или только чтение известными скриптами слежки — не проверено;
- Firefox, примечания к выпуску [120](https://www.firefox.com/en-US/firefox/120.0/releasenotes/): «Firefox’s private windows and ETP-Strict privacy configuration now enhance the Canvas APIs with Fingerprinting Protection»; к выпуску [151](https://www.firefox.com/en-US/firefox/151.0/releasenotes/): «Firefox now strengthens protection against fingerprinting in Standard Enhanced Tracking Protection». В [`RFPTargetsDefaultBaseline.inc`](https://github.com/mozilla-firefox/firefox/blob/cc4ebb2adcb7/toolkit/components/resistfingerprinting/RFPTargetsDefaultBaseline.inc) ветки `release`, версия 158.0.2, — `DESKTOP_DEFAULT(EfficientCanvasRandomization)`, а для Android — только под `#ifdef NIGHTLY_BUILD`;
- Brave, [Fingerprinting defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/), 2020-05-18: «The default setting for farbling-based fingerprinting is to add small amounts of randomness to semi-identifying endpoints»; в таблице этих API — `toDataURL`, `toBlob` и `getImageData`;
- [HTML Standard, canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026: «Authors should not use the canvas element in a document when a more suitable element is available». При сериализации «User agents must support PNG ("image/png")», а правил о самих байтах файла — сжатии, фильтрах, служебных блоках — в разделе нет. Режим `desynchronized` — у контекста холста: «the user agent may optimize the rendering of the canvas to reduce the latency»;
- MDN, [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): «Canvas content is not exposed to accessibility tools like semantic HTML is»; MDN, [`<title>` в SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/title): «The `<title>` SVG element provides an accessible, short-text description of any SVG container element or graphics element»;
- WebKit, ошибка [269535](https://bugs.webkit.org/show_bug.cgi?id=269535) «Canva: No pointer events from Apple Pencil while touch present» — статус NEW.

### 3.2. Координаты страницы

(architecture 3.2) — MDN, прочитано 2026-10-21:

- [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio): «returns the ratio of the resolution in physical pixels to the resolution in CSS pixels for the current display device»;
- [`viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox): «The viewBox attribute defines the position and dimension, in user space, of an SVG viewport»;
- [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect): «providing information about the size of an element and its position relative to the viewport»;
- [`clientX`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX): «the horizontal coordinate within the application's viewport at which the event occurred».

### 3.3. Веб-компоненты

(architecture 2.3 и 3.3), прочитано 2026-10-21:

- React 19:
  - [блог](https://react.dev/blog/2024/12/05/react-19#support-for-custom-elements): «React 19 adds full support for custom elements and passes all tests on Custom Elements Everywhere»; «props that match a property on the Custom Element instance will be assigned as properties, otherwise they will be assigned as attributes»;
  - [справочник](https://react.dev/reference/react-dom/components#custom-html-elements): «React will, however, recognize an custom element's property as one that it may pass arbitrary values to if the property name shows up on the class during construction»; «You can listen for these events using an `on` prefix when binding to the event via JSX»; «Events are case-sensitive and support dashes (`-`)»;
  - [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript): «You'll now need to wrap module augmentation of the JSX namespace in `declare module "....":`», в примере — `declare module "react"`;
  - исходники — тег [v19.3.1](https://github.com/facebook/react/tree/v19.3.1), последний релиз React 19, коммит `61aa00df822d0eb76d0362eb8b6fdd3527693efe`, прочитано 2026-11-01 (T59; R42); код в цитатах сведён в одну строку. [`ReactDOMComponent.js`](https://github.com/facebook/react/blob/v19.3.1/packages/react-dom-bindings/src/client/ReactDOMComponent.js), строки 1961–1976: у custom element свойство, которого в новой отрисовке нет, React передаёт дальше как `undefined` — «`!nextProps.hasOwnProperty(propKey)`» и затем «`setPropOnCustomElement(domElement, tag, propKey, undefined, nextProps, lastProp)`». Строки 1979–1986: изменённые свойства — после снятых, по порядку `for (const propKey in nextProps)`, если «`nextProp !== lastProp && (nextProp !== undefined || lastProp !== undefined)`». Строки 1463–1471: при монтировании — тоже по порядку свойств, а «`if (propValue === undefined) { continue; }`». [`DOMPropertyOperations.js`](https://github.com/facebook/react/blob/v19.3.1/packages/react-dom-bindings/src/client/DOMPropertyOperations.js), строки 231–232: «`if (name in (node as any)) { (node as any)[name] = value;`» — свойство, если элемент его знает, а иначе атрибут. Значит, `null` в свойство React пишет, только если его написал потребитель, а до регистрации элемента значение уходит в атрибут;
- Preact, [Web Components](https://preactjs.com/guide/v10/web-components/): «Preact fully supports Web Components»; «When a Custom Element defines a setter for a given property, Preact detects its existence and will use the setter instead of an attribute»; о событиях — «unrecognized event handler props passed to a DOM Element are registered using their casing exactly as specified»;
- TypeScript, [DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html): «The map interface contains every specified HTML tag name and its corresponding type interface» — это `HTMLElementTagNameMap`, по которому `createElement` и `querySelector` выводят тип элемента;
- MDN:
  - [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM): «the styles defined in the shadow DOM tree are scoped to that tree, so just as page styles don't affect elements in the shadow DOM, shadow DOM styles don't affect elements in the rest of the page»; «Language and text directionality, set using lang and dir, are generally inherited from an element's parent node. When that parent is a shadow root, they are inherited from the shadow host instead»;
  - [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties): «A custom property defined using two dashes -- instead of @property always inherits the value of its parent»; запасные значения `var()` — «useful when working with Custom Elements and Shadow DOM»;
  - [`Event()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event): у `bubbles` — «The default is false»; `composed` — «A boolean value indicating whether the event will trigger listeners outside of a shadow root»;
  - [Reflected attributes](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Reflected_attributes): «Attribute element references can only refer to other elements that are in the same DOM or Shadow DOM, because element ids are only valid in the scope in which they are declared»;
  - [Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements): «every custom element name you register must be globally unique across the entire page»;
- HTML Standard, [custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html), Last Updated 20 October 2026: если в реестре уже есть определение с тем же именем, `define` должен «throw a "NotSupportedError" DOMException»;
- WICG, [Reference Target](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/reference-target-explainer.md): «The motivating goal of this feature is to enable ARIA relationship attributes to work across shadow root boundaries». Вышло ли это в браузерах, не проверялось.

### 3.4. Форум Apple Developer

(architecture 2.4; T29 в [RUN.md](../RUN.md)) — [тред 710001](https://developer.apple.com/forums/thread/710001), июль 2022, прочитано 2026-10-21. Это сообщение пользователя, а не документация Apple, и написано оно до iPadOS 26: «Apple at some point disabled the ability to open local files in Safari», а «Файлы» показывают HTML «with only the internal text and internal header contained CSS styling». О скриптах тред не говорит. Это зацепка для пробы T29, а не факт.

### 3.5. HTML Standard

(architecture 2.5) — [6.8 Editing](https://html.spec.whatwg.org/multipage/interaction.html#editing-2), Last Updated 20 October 2026, прочитано 2026-10-21:

- [`autocorrect`](https://html.spec.whatwg.org/multipage/interaction.html#attr-autocorrect), состояние `off`: «The user agent is not allowed to automatically correct spelling while the user types»; «The attribute's invalid value default, missing value default, and empty value default are all the On state»;
- [`spellcheck`](https://html.spec.whatwg.org/multipage/interaction.html#spelling-and-grammar-checking), состояние `false`: «Spelling and grammar will not be checked»; «If the checking is enabled for a word/sentence/text, the user agent should indicate spelling and grammar errors in that text»; «This specification does not define the user interface for spelling and grammar checkers». В порядке, по которому браузер решает, проверять ли текст, выбор пользователя идёт раньше атрибута: «Otherwise, if the user has forced the checking for this text to always be enabled, then the checking is enabled»;
- [`writingsuggestions`](https://html.spec.whatwg.org/multipage/interaction.html#attr-writingsuggestions), состояние `false`: «Writing suggestions should not be offered on this element»;
- [`autocapitalize`](https://html.spec.whatwg.org/multipage/interaction.html#autocapitalization): «User agents or input methods may choose to ignore or override the used autocapitalization hint in certain circumstances»; «the attribute must not be relied on for any sort of input validation».

### 3.6. Браузеры и страница из файла

(architecture 2.4 и 3.6; T29 в [RUN.md](../RUN.md)), прочитано 2026-10-22. Это находки планирования T29, которая потом отложена (R17): проб на устройствах ещё не было. Исходники движков — на тегах: Chromium 156.0.8078.47 — [chromium/src](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/), Firefox 158.0.1 — [mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox/tree/FIREFOX_158_0_1_RELEASE), WebKit — [WebKit/WebKit](https://github.com/WebKit/WebKit/tree/WebKit-7625.1.29.18.27):

- **GitHub**, заголовки из первых рук, `curl -sIL`, 2026-10-22, 01:14–01:17 UTC:
  - `report-7.0.11.html` релиза `adamws/kicad-via-patterns` v0.4, у которого в API `content_type: text/html`, приходит через 302 на `release-assets.githubusercontent.com`, а там — `content-type: application/octet-stream` и `content-disposition: attachment; filename=report-7.0.11.html`. Так же — ещё три файла `.html` из релизов. Документация GitHub этого не обещает;
  - raw.githubusercontent.com и gist.githubusercontent.com отдают HTML как `text/plain; charset=utf-8`, с `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` и `x-content-type-options: nosniff`;
  - GitHub Pages: «When a GitHub Pages site is visited, the visitor's IP address is logged and stored for security purposes, regardless of whether the visitor has signed into GitHub or not» ([What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection), github/docs 5815d11);
- **безопасный контекст**:
  - [Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/): «If origin's scheme is "file", return "Potentially Trustworthy"». Так и в движках: в Chromium — `net/base/is_potentially_trustworthy.cc`, в Firefox — `URI_IS_POTENTIALLY_TRUSTWORTHY` у протокола `file` в `netwerk/build/components.conf`, в WebKit — `page/SecurityOrigin.cpp`;
  - `getCoalescedEvents()` — `[SecureContext]` в [Pointer Events](https://w3c.github.io/pointerevents/), в Chromium (`pointer_event.idl`) и в WebKit (`PointerEvent.idl`), а в Firefox — по той же проверке, `nsContentUtils::IsSecureContextOrWebExtension`;
- **хранилище на `file:`**:
  - Chromium: «'file' URLs all parse as ("file", "", 0)» (`url/origin.h`) и «file: origins all serialize to "file://"» — у всех страниц из `file:` одно хранилище, а «file:// URLs should become unique opaque origins at some point» (`url/origin_unittest.cc`);
  - Firefox — по файлу: `security.fileuri.strict_origin_policy` — `true` (`StaticPrefList.yaml`; `caps/tests/unit/test_origin.js`);
  - WebKit — только пока приложение-хозяин держит включённой `needsStorageAccessFromFileURLsQuirk`, а что у Safari, не видно;
  - MDN пишет «each `file:` URL seems to have its own unique local-storage area» ([Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)) — это расходится с исходниками Chromium;
- **политика в `<meta>` на `file:`** — без исключения для `file:` в Chromium (`http_equiv.cc`), Firefox (`nsCSPUtils.cpp`) и WebKit (`Document.cpp`). **`<a download>` с blob своей страницы** — работает в Chromium (`html_anchor_element.cc`) и Gecko (`nsContentUtils.cpp`);
- **iPadOS и Safari**:
  - «Released September 14, 2026 — 27.0 … Safari 27 is available for iOS 27, iPadOS 27» ([Safari 27 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes));
  - «Файлы»: «If you haven’t installed the app that created a file, a preview of the file opens in Quick Look» ([iPad User Guide](https://support.apple.com/guide/ipad/ipadb3b759ed/26/ipados/26)). Руководство здесь и ниже — для iPadOS 26, а для iPadOS 27 оно не прочитано;
  - загрузки Safari: «iCloud Drive: Select this option to save downloads to the Downloads folder in iCloud Drive» или «On My iPad» ([Customize your Safari settings](https://support.apple.com/guide/ipad/customize-your-safari-settings-ipad54f3cde6/26/ipados/26)), а что по умолчанию, не сказано;
  - выполняет ли Quick Look скрипты HTML и открывает ли Safari `file:`, документация Apple не говорит. «Нет» говорят только форумы: тред 710001 (2022, ниже) и [Apple Discussions, тред 256102223](https://discussions.apple.com/thread/256102223), июль 2025, — «Quick Look is as close as you can get and it will not run JavaScript»;
  - `getCoalescedEvents` — с Safari 18.2: «New PointerEvent methods getPredictedEvents() and getCoalescedEvents() are now supported» ([WebKit Features in Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/)). Pointer Events с Apple Pencil — с Safari 13: «Added support for the Pointer Events API enabling consistent access to mouse, trackpad, touch, and Apple Pencil events» ([Safari 13 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-13-release-notes)). Перо приходит как `pen` с нажимом: `TouchType::Stylus ? penPointerEventType() : touchPointerEventType()` и `m_pressure(event.forceAtIndex(index))` (`dom/ios/PointerEventIOS.cpp` WebKit);
- **Android**:
  - Chrome открывает HTML из своего окна загрузок сам, как `content://` во встроенном просмотрщике (`DownloadUtils.java`, `MediaViewerUtils.java`), и принимает `content://` с типом `text/html` от «Файлов» (`AndroidManifest.xml`);
  - прямой `file://` к загрузкам он, скорее всего, отклонит: о `READ_EXTERNAL_STORAGE` — «Starting in API level 33, this permission has no effect» ([Manifest.permission](https://developer.android.com/reference/android/Manifest.permission));
  - что скрипты там выполнятся, не подтверждено, а о Samsung Internet первоисточников нет;
- **Scorecard**, Signed-Releases: смотрит «the project's last five release assets» и ищет в них подписи ([checks.md](https://github.com/ossf/scorecard/blob/main/docs/checks.md)).

## 4. Поставщики ИИ

### 4.1. Поставщики ИИ о месте на картинке

(architecture 2.2 и 3.2), прочитано 2026-10-21:

- Anthropic, [Coordinates and bounding boxes](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates): «Claude works best with absolute pixel coordinates»; «Claude does not work well when you ask for normalized coordinates»; «The coordinates Claude returns are pixel positions in the image Claude sees: your image after Claude resizes it to fit the model's native resolution»; «Small elements lose precision when an image is downscaled»;
- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision): «An image, therefore, costs `⌈width / 28⌉ × ⌈height / 28⌉` visual tokens»; «Images larger than either limit are downscaled before processing». В таблице пределов «Max long edge» — «2576 px» у «Claude 4.7 and later models» и «1568 px» у «All other models». «Claude's coordinate and localization outputs are approximate»;
- OpenAI, [Images and vision](https://developers.openai.com/api/docs/guides/images-vision): «patch_count = ceil(width/32)×ceil(height/32)»; «For coordinate-sensitive tasks, resize images to fit those limits before sending them and map returned coordinates back to the original image»; «The model struggles with tasks requiring precise spatial localization». У `gpt-6-astra` в `high` — «up to 2,500 patches», а формата рамки на странице нет;
- Google, [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding), Last updated 2026-09-23: «The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000»; «You need to descale these coordinates based on your original image size». Модели Google здесь — только для справки: из замера `tutor` их убрал (запись `tutor` ниже).

## 5. Репозитории NovaTrail

### 5.1. app и skill-map

(architecture 2.3), прочитано 2026-10-21:

- [altnovatrail/app](https://github.com/altnovatrail/app/tree/7a96676), коммит 7a96676: T01 «Фреймворк и сборка» в таблице 1 его RUN.md — `[ ]`. Она решает, «как сборка подключает рабочие копии пакетов при разработке, а в релиз берёт точные версии», а менеджера пакетов не называет (architecture 3.4). В architecture 2.4 app — «„Прослушать“ — инструмент канвы, то есть `canvas`; один ли у них с `app` синтез речи, решается вместе со стыковкой пакетов (Т-21)». В T07 app — «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»»;
- [altnovatrail/skill-map](https://github.com/altnovatrail/skill-map/tree/0295ce8), коммит 0295ce8: рекомендация его T04 к Т-26 — «одна на `skill-map` и `canvas`», и если `canvas` разберёт вопрос раньше, T04 берёт его выводы.

### 5.2. tutor

(architecture 2.4 и 3.5) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/4394a33), ветка `main`, коммит 4394a33, прочитано 2026-10-21: R04, R05 и R07 tutor; В7 в таблице 3 его RUN.md — «E3 берёт формат `tutor` за основу: он проверен на замере. T04 `canvas` сверяет с ним образец страницы образцов, и когда она появится, страница записи `tutor` уходит»; в его эпике E2 одна задача — T08 «Исследование: как дать модели ход рассуждения», не сделана; её цель — в том числе «Решено и то, какие виды входа идут в замер … и что для этого пишет страница записи». На коммите [16d9cd1](https://github.com/altnovatrail/tutor/tree/16d9cd1), прочитано 2026-10-21 (T01 в [RUN.md](../RUN.md)), — R08 tutor: «Группы для меток строятся так, как их построит устройство, — по пространству и времени, без разметки», а для замера «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px». На коммите [231bf8b](https://github.com/altnovatrail/tutor/tree/231bf8b), прочитано 2026-10-21 (architecture 2.2 и 3.2):

- разбор хода решения идёт «в двух вариантах» (R08 tutor), и во втором — «чистая вырезка, и модель даёт рамку в координатах своего поставщика, а раннер притягивает её к штрихам»; попадание — «Жаккар по множествам штрихов ≥ 0,5, у рамки ещё IoU ≥ 0,5»;
- в architecture 3.1 tutor — «PNG рисуется только из видимых штрихов, без сетки и текста задачи, по рамке работы с полем 12 px»;
- в таблице 3 его RUN.md, «в реестр spec», — В12 tutor «Как наблюдение указывает место на канве» и В13 tutor «Высота цифр в картинке для проверки». Рекомендация В13 tutor — «настройка канвы модуля в формате модуля v0 (эпик E2 RUN.md `spec`), умолчание — из выводов E2»;
- поправка 2026-10-21 к R06 tutor — «Google из замера убран»;
- T32 «Совместимость с `canvas`» в его RUN.md — «скачать синтетические образцы из закреплённого релиза `canvas` — точный тег и сумма sha256», а решить при её планировании — «где в релизе `canvas` лежат синтетические образцы и в каком они формате» (architecture 2.3 и 3.4).

На том же коммите 231bf8b, перечитано 2026-10-21 (architecture 2.4 и 3.5):
- R05 tutor: образцы «хранятся в `samples/` вне git, и агенты разработки туда не заглядывают»; R07 tutor: «каждый штрих — точки со временем и нажимом, в порядке написания», «каждое стирание — со временем», а «образец, записанный без неё, её уже не вернёт»;
- T12 «Формат образца и синтетические образцы» в его RUN.md, не сделана: «лист — логические размеры»; «штрих — ID и точки x, y, время и нажим, в порядке написания»; «стирание — время и ID стёртых штрихов»; «разметка при письме: задача, задуманный текст каждой строки и её штрихи, нарочно неразборчивые места, сценарий и ожидаемый исход, кто писал — автор или автор, подражая детскому почерку (R08), — и то, чего требует T08»; «версия формата»; «задача и банк задач — как у задачи модуля: условие, ключ, решение по строкам, ловушки, фразы-утечки, ложные ключи». Страница записи — T13, тоже не сделана;
- в architecture 3.1 tutor: «Состояния строятся из штрихов и читаются без ключа»; «Строки одного листа связаны писавшим, задачей и сценарием, поэтому граница считается „по листам“»; высота цифр меряется «парно с 32 px на тех же строках»;
- группы для меток раннер строит «так, как их построит устройство: по пространству и времени, без разметки. Разметка — только эталон для места» (T22 tutor), а PNG — «только из видимых штрихов» (T21 tutor);
- В9 tutor «в реестр spec» — согласие других взрослых на образцы для замера: «образцы замера лежат вне репозиториев и уходят двум поставщикам ИИ», рекомендация — «расширить П-16», а до текста согласия — «только образцы автора».

На коммите [57313fe](https://github.com/altnovatrail/tutor/tree/57313fe), прочитано 2026-10-21 (architecture 3.6): В9 tutor та же — «до него — только образцы автора»; поправка 2026-10-21 к R06 tutor — «Замер идёт у двух поставщиков, Anthropic и OpenAI, на четырёх моделях».

### 5.3. spec на теге v0.2.12

(architecture 2.2 и 2.4) — [altnovatrail/spec](https://github.com/altnovatrail/spec/tree/v0.2.12), коммит b721be9, релиз неизменяемый, прочитано 2026-10-21. В его RUN.md: Д12 в таблице 4 — ответы `spec` на строки «в реестр spec» других репозиториев, у `canvas` — «В4 и В5»; эпик E2 «Формат модуля v0» с задачей T28 «Задача: пункты, ячейки ответа и канва», чей «Вход» — «T02 `canvas` — логические координаты листа: в них задаётся зона»; эпик E3 «Контракты первого среза» — в таблице 2, с протоколом eval и форматом образцов.

### 5.4. .github

(architecture 2.3) — [altnovatrail/.github](https://github.com/altnovatrail/.github/tree/e480eb4), ветка `main`, коммит e480eb4, прочитано 2026-10-21: поправка 2026-10-21 к R03 .github — «Обёртка Go и релиз приходят с первым кодом `module-kit`, а обёртка TypeScript — с первым кодом на TypeScript, у `canvas`»; эпик E5 «Обёртка TypeScript» в таблице 2 его RUN.md — «Идёт с первым кодом на TypeScript — у `canvas`, этап 2». На коммите [ed62dff](https://github.com/altnovatrail/.github/tree/ed62dff), прочитано 2026-10-21 (architecture 2.3 и 3.4):

- R18 .github — общий релиз `release.yml`, вышел в v0.1.4, коммит 11435db;
- в самом файле рецепт `release-files` пишет в `dist/` «plain files, named with letters, digits, dots, dashes, pluses and underscores», а на всём прочем релиз падает — «dist/ holds something besides files». В контейнер сборки токены не идут: «Nothing of the step's environment, no token among it, goes into the container». Сам контейнер запускается так: `docker run --rm --user "$(id -u):$(id -g)" --env HOME=/tmp --volume "$tree:/work" --workdir /work release-toolchain just release-files "$VERSION"`, то есть без `--network`;
- R16 .github: обёртка Go «запускает в ней `just ci-<проверка>` от пользователя раннера, с `HOME=/tmp`»;
- входы у файла — `paths` и `publish`, выходов у него нет, и в npm он не публикует. Про подпись: «What a consumer checks of it is Т-27, which T37 in spec decides»;
- поправка 2026-10-21 к R18 .github — первый релиз на общем `release.yml` — `module-kit` v0.1.0, коммит 7e0144a.

На коммите [071262c](https://github.com/altnovatrail/.github/tree/071262c), мерж pull request #39 «Agree the TypeScript wrapper's contract (T21)», прочитано 2026-10-21 (architecture 3.4):
- R19 .github: «Это договор: по нему `canvas` пишет рецепты своего первого кода (T08 canvas), а сам файл пишет T22, вместе с этим кодом». О контейнере — «`just ci-<проверка>` идёт в ней от пользователя раннера, с `HOME=/tmp`; из окружения шага в контейнер идёт только `ALLOWED_LICENSES`», флаги `--init` и `--ipc=host` и «контейнер идёт с сетью: она нужна `npm ci` и `npm audit`»;
- о рецептах — «чем он это делает и в каких версиях, решает и закрепляет репозиторий», а `ci` «для разработчика: обёртка его не зовёт»;
- о браузерах — «Списка сумм у загрузок Playwright нет (architecture 4), и R34 spec к ним как есть не применить. В рамках правил — папка браузеров из образа Playwright, закреплённого по тегу и digest: в нём браузеры лежат в `/ms-playwright`»; «Сумма, которую репозиторий посчитал сам, — отступление от R34 spec, и тогда это вопрос „в реестр spec“. Выбирает T08 canvas»; «браузеры приходят не из lock-файла, и `ci-licenses` их не видит»;
- о цене — «каждый из четырёх job собирает стадию `toolchain` целиком, без кеша, а с браузерами в ней — и браузеры … Сколько это стоит, покажет код T08 canvas»;
- architecture 3.3 .github — текст вызывающего job «TypeScript» с `typescript.yml@<SHA релиза>` и запись `npm` для `dependabot.yml`: «`directory` — папка `package.json`. Node в Dockerfile и браузеры для тестов Dependabot не видит»;
- T22 в его RUN.md — «Обёртку проверяет вызов из pull request репозитория на TypeScript, по SHA ветки, до релиза».

На коммите [ffa555d](https://github.com/altnovatrail/.github/tree/ffa555d), мерж pull request #43 «Record T22 after the merge», прочитано 2026-10-21 (architecture 2.3 и 3.4). План T22 с пробой по SHA ветки, выше, поменялся:
- поправка 2026-10-21 к R19 .github: «`typescript.yml` написан (T22) — по этой записи, и с одним добавлением: в контейнер идёт и `CI`». Vitest берёт из него `browser.headless` — «Default: `process.env.CI`» — и `allowOnly` — «Default: `!process.env.CI`». О флагах — «`--ipc=host` — только у job `test`», «а `--init` — у всех четырёх». О пробе — «Проба — pull request #40 в самом `.github`, без мержа, а релиз выходит сразу, не дожидаясь кода `canvas`. Первый код на TypeScript — T08 canvas — зовёт обёртку уже по SHA релиза: на настоящем коде её проверит первый же его pull request, после релиза, а ошибку исправит следующий релиз». О цене браузеров — «ни кеш сборки, ни своя стадия для `ci-test` не нужны» и «Пересмотреть, если стадия `canvas` выйдет заметно дороже: её замерит T08 canvas». О библиотеках — «Системные библиотеки браузеров ставит `apt-get` без точных версий», это «вопрос В21 „в реестр spec“ в RUN.md», а рекомендация — «архив Ubuntu на дату: `apt-get --snapshot` с номером снимка в `ARG`, как версия»;
- вторая поправка того же дня: «релиз вышел — `v0.1.5`, коммит c772cc8, неизменяемый и Latest»;
- `typescript.yml` в релизе: «Of the step's environment only CI and ALLOWED_LICENSES go in. CI, which GitHub sets to true on every runner, is how the tools learn they run in CI: by it Vitest runs its browser headless and refuses test.only». О `--ipc=host` — «the latter only the test job gets, where a browser runs»;
- architecture 3.3 .github — вызывающий job «TypeScript» по SHA `c772cc86973240e21cebb310fd0cda221a752ade # v0.1.5`. О Dependabot — «Node в Dockerfile и браузеры для тестов Dependabot не видит, и их поднимают руками». Проверки в ruleset `main` — «с `integration_id` 15368 для проверок GitHub Actions и 12526 для SonarCloud»;
- architecture 4 .github — проба #40, прогоны 39660777454 и 39661168027: «TypeScript 7.0.2, Vitest 5.0.5 с `@vitest/browser-playwright` 5.0.5 и Playwright 1.64.1» и «Стадия `toolchain` — с `/ms-playwright` из образа выше и 24 пакетами `apt`». Без исключения для `lightningcss` проверка лицензий ответила «100 packages, 12 refused». Стадия с браузерами собиралась «49–52 секунды в каждом из четырёх job», без них — «21 секунда». Проба #42, прогон 39664766549: «стадия с браузерами собралась за 46–56 секунд на job». Образ — `mcr.microsoft.com/playwright:v1.64.1-noble`, индекс `sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf`, у amd64 — «986 271 382 байта сжатыми»;
- T22 в его RUN.md, «Решено автором (2026-10-21)»: «Проверки „TypeScript / …“ в ruleset `main` `canvas` ставит T23 canvas». Теперь это шаг T08: T23 слита с ней (RUN.md, T23). В21 там же, «в реестр spec», — «Точные версии системных пакетов в стадии `toolchain`»; о рекомендации, архиве на дату, — «В сборке Dockerfile это ещё не пробовали — проверить при записи»;
- коммиты пробы в `refs/pull/40/head`, прочитаны git: 89520e2 — проба, 1ee7a91 — отрицательный случай без исключения. В `vitest.config.ts` — проекты `node` и `browser`, у второго `provider: playwright()` и `instances: [{ browser: "chromium" }]`, а о `headless` — «headless is not set here: CI, which typescript.yml passes into the container, turns it on». В Dockerfile — `COPY --from=` того же образа по digest с папкой `/ms-playwright`, `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` и `apt-get install -y --no-install-recommends` с 24 пакетами, а в комментарии — «apt pins no versions». В lock-файле — `lightningcss` 1.33.0 и 11 его сборок под платформы, все под MPL-2.0 и все dev, а тянет его `vite` 8.3.5. Исключение в `trial/licenses.mjs` — по имени, только MPL-2.0 и только у пакета dev;
- релиз v0.1.5: тег — на c772cc8 (`git ls-remote`); релиз неизменяемый и Latest, опубликован 2026-10-21 (`gh release view`, `gh release list`), а `gh release verify v0.1.5 -R altnovatrail/.github` отвечает «Release v0.1.5 verified!».

На теге [v0.1.6](https://github.com/altnovatrail/.github/tree/v0.1.6), коммит 630924e, прочитано 2026-10-22 (architecture 3.4; T24 и T32 в [RUN.md](../RUN.md)). О релизе в тот же день сообщила сессия `.github` по своей T25:
- поправка 2026-10-22 к R18 .github: «Рецепты `spec` общий релиз запускает скриптом `spec/tools/toolchain/toolchain.sh` из подмодуля вызывающего, на теге, который тот закрепил»; «Скрипт есть в `spec` с v0.2.17»; «Вызывающий переходит на v0.2.17 до того, как поднимет ссылку на этот релиз `.github`. Иначе краснеет прогон Release на `main`, а релиз ждёт перехода — изменения с прошлого релиза не теряются». До сборки шаг номера проверяет, что `spec/` — подмодуль `altnovatrail/spec`, извлечён на закреплённом коммите, этот коммит — тег `spec` и в теге есть скрипт;
- в самом `release.yml` — «pin it at a tag, v0.2.17 or newer, as every NovaTrail repository pins spec»;
- architecture 3.3 .github: пример вызывающего `release.yml` закрепляет ещё `v0.1.4`, «где скрипта ещё нет и годится любой тег `spec` с v0.2.11»;
- между v0.1.5 и v0.1.6 изменились только `release.yml` и `self-release.yml` (`git diff --stat`), а `typescript.yml` тот же. Шага npm в `release.yml` нет: его пишет T27 в RUN.md `.github`, после T25 там же. Job `licenses` обёртки TypeScript переводит на рецепт `licenses-check-repo` T26 там же — с «План: да», ещё не начатая;
- релиз неизменяемый и Latest, опубликован 2026-10-22 (`gh api`), тег — на 630924e (`git ls-remote`), а `gh release verify v0.1.6 -R altnovatrail/.github` отвечает «Release v0.1.6 verified!». Скрипт `tools/toolchain/toolchain.sh` есть в `spec` на тегах v0.2.17 и v0.2.18 (`git -C spec ls-tree`).

На теге [v0.1.8](https://github.com/altnovatrail/.github/tree/v0.1.8), коммит 0ab2799, прочитано 2026-10-22 (T32 в [RUN.md](../RUN.md)). О релизе в тот же день сообщила сессия `.github` по своей T26:
- поправка 2026-10-22 к R19 .github: «`ci-licenses` зовёт `just -f spec/justfile licenses-check-repo <lock-файл> [<файл исключений>]` из корня репозитория»; «Тег — v0.2.18 или новее: с него у рецепта граница `dev`»; «Имя файла выбирает репозиторий, рекомендуемое — `licenses.json`, как в `spec/justfile`». О подмодуле — «Как и в `documents.yml`, checkout берёт все подмодули вызывающего, а у репозиториев NovaTrail он один — `spec`, публичный». Об `ALLOWED_LICENSES` — «остаётся в `typescript.yml` и идёт в контейнер, как прежде, — для рецепта, который ещё проверяет по своему списку. Такой сейчас у `canvas`: `scripts/licenses.ts`, до его T32. Это долг Д6 в RUN.md»;
- в самом `typescript.yml` — `submodules: ${{ matrix.check == 'licenses' }}` у шага checkout и «The licenses job gets the submodule at the commit the caller pins, for ci-licenses to run spec's recipe from it»; `ALLOWED_LICENSES` по-прежнему в окружении шага;
- architecture 3.3 .github: «На рецепт вызывающий переводит `ci-licenses` вместе с подъёмом ссылки на этот релиз или после него, но не раньше: прежняя обёртка подмодуля не даёт». Пример вызывающего job там ещё закрепляет `v0.1.5`, `c772cc8`;
- Д6 в его RUN.md — «Когда вернуться»: «После T32 `canvas`, когда копию не читает ни один вызывающий `typescript.yml`. Тогда `ALLOWED_LICENSES` уходит из `typescript.yml`, а `self-ci.yml` перестаёт требовать в нём копию»;
- между v0.1.5 и v0.1.7 `typescript.yml` не менялся, а в v0.1.8 изменился (`gh api …/compare`). Шага npm в `release.yml` и на v0.1.8 нет;
- релиз неизменяемый и Latest, опубликован 2026-10-22 (`gh release view`, `gh release list`), тег — на 0ab279940126dadbde0f5a3912ce196ed39470ab (`git ls-remote`), а `gh release verify v0.1.8 -R altnovatrail/.github` отвечает «Release v0.1.8 verified!».

На теге [v0.1.9](https://github.com/altnovatrail/.github/tree/v0.1.9), коммит 41d5144, прочитано 2026-10-22 (architecture 3.4; T24 в [RUN.md](../RUN.md)). О релизе в тот же день сообщила сессия `.github` по своей T27:
- поправка 2026-10-22 к R18 .github: «Общий релиз публикует в npm пакет, который назвал вызывающий. Вход `npm-package` — имя в области `@altnovatrail`, а файл — архив, которому имя даёт `npm pack`». До релиза GitHub архив проверяется: «нет `private`, `publishConfig` и своего `tag`, а `repository` — объект с url этого репозитория». Далее — «Вердикт — реестр, а не код выхода npm» и «Повтор прогона коммита, уже выпущенного, публикует архив из его релиза». Открытым «до первой настоящей публикации, T24 canvas» поправка оставляет «примет ли реестр provenance из reusable workflow другого репозитория», «npm/cli#9969 у репозиториев с неизменяемым subject» и «то, что новая настройка trusted publisher по умолчанию разрешает только staged publishing», а «Итог дописывается в RUN.md, T27»;
- architecture 3.3 .github — шаги автора у репозитория с пакетом интерфейса: «первый релиз выходит без `npm-package`»; архив «автор проверяет — `gh release verify-asset` и подпись — и публикует руками из пустой папки, с 2FA»; «`npm trust github @altnovatrail/<имя> --file <файл workflow релиза> --repository altnovatrail/<репозиторий> --allow-publish` или то же на сайте npm. Окружения нет, а прямая публикация разрешена: новая настройка по умолчанию разрешает только staged publishing»; «за 2 дня после настройки должна пройти первая публикация по ней — pull request, который добавляет `npm-package` и правит пути `paths`: одна правка `.github/**` релиза не даёт». Пример вызывающего `release.yml` там закрепляет ещё `v0.1.7`, `0acbf75`;
- в самом `release.yml` — вход `npm-package`: «Empty publishes nothing to npm»;
- между v0.1.8 и v0.1.9 изменились `release.yml` и документы `.github`, а `typescript.yml` — нет (`gh api …/compare`);
- релиз неизменяемый и Latest, опубликован 2026-10-22 (`gh release view`, `gh release list`), тег — на 41d5144e304cfad05c681de6934405c08a7435db (`git ls-remote`), а `gh release verify v0.1.9 -R altnovatrail/.github` отвечает «Release v0.1.9 verified!».

На теге [v0.1.10](https://github.com/altnovatrail/.github/tree/v0.1.10), коммит f3addb7, прочитано 2026-10-22 (architecture 3.4 и 3.7; T36 в [docs/plan/E2.md](plan/E2.md)). О релизе в тот же день сообщила сессия `.github` по своей T29:
- поправка 2026-10-22 к R19 .github, «по Д6, задача T29»: «В `typescript.yml` больше нет `ALLOWED_LICENSES`, и в контейнер он не идёт. Его единственный вызывающий, `canvas`, с T32 проверяет lock-файл рецептом `spec` и переменную не читает» и «Из окружения шага в контейнер идёт только `CI`». Отвергнуто — «оставить переменную в обёртке ещё на релиз, на всякий случай»;
- в самом `typescript.yml` — «Of the step's environment only CI goes in» и «So this file carries no copy of the list: its callers take the list from spec». Между v0.1.9 и v0.1.10 в нём изменились только комментарии, окружение шага и флаги `docker run` (`gh api …/compare`), а между v0.1.8 и v0.1.9 он не менялся;
- в его RUN.md — «Д6 закрыт 2026-10-22 в T29: копии списка в `typescript.yml` больше нет». В «Сделать» T29 там же — «промпт сессии `canvas`: поднять ссылку на новый релиз и убрать из шапки `justfile` и из документов `canvas` „until its Д6“»;
- architecture 3.3 .github закрепляет `typescript.yml@f3addb7403d084c560c61481e217b93f8e7ee1f3 # v0.1.10` на `main` c97ed06, коммите после релиза, а на самом теге — ещё v0.1.8;
- architecture 2.8 .github на том же коммите: «Поднимет ли Dependabot такую ссылку, покажет первый релиз после `v0.1.0`». Поиск pull request Dependabot по организации `altnovatrail` нашёл один — spec#7, образ devcontainer (`gh search prs`), а у `canvas` их не было;
- релиз неизменяемый и Latest, опубликован 2026-10-22 (`gh release view`, `gh release list`), тег — на f3addb7403d084c560c61481e217b93f8e7ee1f3 (`git ls-remote`), а `gh release verify v0.1.10 -R altnovatrail/.github` отвечает «Release v0.1.10 verified!».

Остальные пять ссылок — с v0.1.0 на тот же релиз, прочитано 2026-10-22 на `main` c97ed06 (поправка 2026-10-22 к R12):
- architecture 3.3 .github: «Общие workflow закреплены по SHA первого релиза `.github`, `v0.1.0`» и «Копируя, берут последний релиз `.github`». Тексты там те же, что у `canvas`, кроме того, что `canvas` добавил: `scorecard.yml` совпадает слово в слово, у `codeql.yml` добавлен вход `languages` с комментарием, а у `ci.yml` — job «TypeScript», который приносит вид typescript;
- между v0.1.0 и v0.1.10 из пяти общих workflow изменился один — `codeql.yml` (`gh api …/compare`). Он берёт язык `go` и новый вход `paths-ignore`, по умолчанию пустой. Имена job — `languages` и `analyze (<язык>)` — и права у него прежние, так что обязательные проверки ruleset `main` не меняются. `secrets.yml`, `dco.yml`, `documents.yml` и `scorecard.yml` — те же, что в v0.1.0.

На теге [v0.1.12](https://github.com/altnovatrail/.github/tree/v0.1.12), коммит 4225639, прочитано 2026-11-01 (architecture 3.4 и 3.7; R43):
- architecture 3.3 .github, «Покрытие»: «Его `ci-test` пишет отчёт — у Go профиль `coverage/go.out`, у TypeScript lcov `coverage/lcov.info` (3.1), — а `.gitignore` держит `coverage/`» и о подъёме ссылки раньше отчёта: «Если он придёт раньше шага 1, он красный: без права прогон CI не стартует вовсе — «The nested job 'coverage' is requesting 'id-token: write', but is only allowed 'id-token: none'»»;
- поправка 2026-11-01 к R19 .github: «Модуль, которого не загружает ни один тест, в отчёте с нулями или валит рецепт» и «Провайдер покрытия — пакет lock-файла, например `@vitest/coverage-v8`, и `ci-licenses` проверяет его, как всё»;
- в самом `typescript.yml` — «ci-test writes the coverage of the tests as an lcov report, coverage/lcov.info, and the job coverage sends it to Codecov by OIDC, with no secret»;
- между v0.1.10 и v0.1.12 из общих workflow изменились `typescript.yml`, `go.yml`, `release.yml` и `self-ci.yml` (`gh api …/compare`), а из них `canvas` зовёт только первый;
- релиз — Latest, опубликован 2026-11-01 (`gh release list`), тег — на 4225639bcd04f43ef58f95cabf9fdfd947cbcb07 (`gh api …/git/ref/tags/v0.1.12`), а `gh release verify v0.1.12 -R altnovatrail/.github` отвечает «Release v0.1.12 verified!».
- в самом `release.yml`, перечитано 2026-11-02 (architecture 3.4; T66) — «A commit gets a release only when a path the caller names in paths has changed since the release before it; the first release comes out always», «With publish: false a run builds, signs and checks the signatures and publishes nothing, which lets a pull request try a change here» и «A run that publishes nothing may run anywhere: a pull request tries a change that way»; о пакете, которого в реестре нет, шаг npm пробы пишет «not in the npm registry yet, which matters not with publish false», а рецепт вызывающего идёт как `just release-files "$VERSION"` на дереве `git archive` коммита;
- там же, architecture 3.3 .github — шаблон вызывающего `release.yml` с `RELEASE_LINE: "0.1"` и перечнем вида go и правило: «Перечень вида typescript `.github` пишет с первым релизом на TypeScript, у `canvas`, по тому же правилу»;
- GitHub Docs, [Troubleshooting Dependabot on GitHub Actions](https://github.com/github/docs/blob/33b1f4a/content/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions.md), коммит 33b1f4a, прочитано 2026-11-02 (architecture 3.4): «By default, GitHub Actions workflows triggered by Dependabot get a `GITHUB_TOKEN` with read-only permissions. You can use the `permissions` key in your workflow to increase the access for the token»;
- проба здесь, 2026-11-02 (T66): два прогона `just release-files v0.1.0` подряд дали один и тот же `SHA256SUMS`, а архив, поставленный в пробный проект по пути к файлу, принял TypeScript с объявлениями пакета и импортировал Node.

### 5.5. module-kit

(architecture 3.4 и 3.5), прочитано 2026-10-21:

- [релиз v0.1.0](https://github.com/altnovatrail/module-kit/releases/tag/v0.1.0) от 2026-10-21 — неизменяемый. В нём шесть программ, `LICENSE`, `LICENSE-go` и `SHA256SUMS`, и у каждого файла — свой `.sigstore.json` (API GitHub);
- [altnovatrail/module-kit](https://github.com/altnovatrail/module-kit/tree/1a54028), коммит 1a54028: в таблице 3 его RUN.md В6 «в реестр spec» — о том, из каких путей собран релиз, а В7 — «Как CI `modules` и `canvas` берут CLI `module-kit` по точному тегу». Рекомендация В7 — бинарник релиза, сверенный подписью, «с тем, что решит T37 `spec` о Т-27».
- там же, раздел 2.5 его architecture, перечитано 2026-10-21 (architecture 3.5): «нужна ли CLI `module-kit` своя команда, которая отдаёт открытые виды задач сборке страницы образцов `canvas`, или этой сборке хватает команд карточки — проверить, собрать, построить индекс»; «у шаблонной задачи числа подставляются от зерна (concepts 9.3 spec), так что и её открытый вид зависит от зерна». Решает это его T05 «Итог детализации», не сделана.
- его `justfile` на том же коммите, перечитано 2026-11-02 (architecture 3.4; T66): рецепт `release-files version` отвергает другой номер — «the version is v<major>.<minor>.<patch>, as v0.1.0» — и пишет в `dist/` файлы, `LICENSE` и `SHA256SUMS`.

### 5.6. modules

(architecture 2.4 и 3.5) — [altnovatrail/modules](https://github.com/altnovatrail/modules/tree/105fa72), коммит 105fa72, прочитано 2026-10-21: T02 «Образцы добровольцев в eval-наборе (П-16)» в его RUN.md, не сделана. Проверить до слияния она собирается, что «доброволец — взрослый: образцы делают взрослые добровольцы, а аккаунт GitHub может быть и у подростка», что «ни на образце, ни в метаданных его файла нет имён и подписей (П-16)» и что «его формат — по протоколу eval (R15 spec)».

### 5.7. CONTRIBUTING `.github`

(architecture 3.6) — [altnovatrail/.github](https://github.com/altnovatrail/.github/blob/c772cc8/CONTRIBUTING.md), коммит c772cc8, прочитано 2026-10-21: «No samples for eval sets yet. Handwriting, voice and photo samples for eval sets are not accepted until the project decides how the people who make them consent to their publication. That is П-16, an open question of spec's privacy document»; о подписи DCO — «The line and the email in it stay public in the history for good».

### 5.8. Доска `tutor` об отмене и очистке

(architecture 3.3; R19) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3029dfb), коммит 3029dfb, `internal/board/page.html`, прочитано 2026-10-22: «Undo stroke» — `document.getElementById("undo").addEventListener("click", () => { state.strokes.pop(); redraw(); });`, а «Clear» — `state.strokes = []; redraw(); document.getElementById("results").replaceChildren(); setStatus("");`. На время проверки кнопки выключаются — `for (const id of ["check", "undo", "clear", "prev", "next"]) document.getElementById(id).disabled = true;`, — а переход к задаче, `showTask`, начинается с `state.strokes = [];`.

### 5.9. Доска `tutor` о картинке

(architecture 3.3; R20) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3029dfb), коммит 3029dfb, прочитано 2026-10-22:

- `internal/board/page.html`:
  - «Check» начинается с `if (state.strokes.length === 0) { setStatus("Write a solution first."); return; }` и шлёт `post("/api/check", { task: state.tasks[state.index].id, image: canvas.toDataURL("image/png") })`;
  - на время проверки — `state.busy = true`, а `pointerdown` начинается с `if (state.busy) return;`;
  - линия — `ctx.lineWidth = 3`, без нажима;
- `internal/board/server.go`:
  - «decodePNG takes a data URL or bare base64 and checks that it is a PNG of a sensible size», `maxSide = 4000` и `maxBody = 8 << 20`;
  - страница — `//go:embed page.html`, а маршруты — `GET /{$}`, `GET /api/tasks`, `GET /api/summary`, `POST /api/check` и `POST /api/mark`;
- `internal/board/ask.go` — «the picture of the board and the prompt come to about 1 300» и `inputTokensBudget = 4000`;
- R19 tutor:
  - «у Claude Opus 5.5 $4 и $20 за миллион токенов входа и выхода, у GPT-6 Astra — $10 и $50. Вход — картинка 1000 × 600 и текст, около 1 300 токенов»;
  - о цене проверки — «вместе — около 10–20 центов»;
- токены картинки — по формулам записи «Поставщики ИИ о месте на картинке» выше:
  - у Claude `⌈1000/28⌉ × ⌈1400/28⌉` = 36 × 50 = 1800, а у листа доски `⌈1000/28⌉ × ⌈600/28⌉` = 36 × 22 = 792;
  - у OpenAI `⌈1000/32⌉ × ⌈1400/32⌉` = 32 × 44 = 1408 патчей и 32 × 19 = 608, при пределе 2500 у `gpt-6-astra` в `high`.

## 6. Переходы на теги `spec` и `.github`

### 6.1. Переход на `spec` v0.4.1

(architecture 1, 3.3 и 3.7; R41), прочитано 2026-11-01:

- релиз — `gh release verify v0.4.1 -R altnovatrail/spec`: «Release v0.4.1 verified!». У релиза — `format-0.1.tar.gz` и `altnovatrail-spec-0.4.1.tgz` с подписями `.sigstore.json`, а sha256 архива пакета — `5ea7321ed287b6c33dbb4f244b3fc44ae42f38221785d720e7e5fb589a564cb2`;
- реестр npm — [`@altnovatrail/spec`](https://registry.npmjs.org/@altnovatrail/spec): версии `0.0.0-stage`, 0.4.0 и 0.4.1, `latest` — 0.4.1, лицензия Apache-2.0. `npm pack @altnovatrail/spec@0.4.1` даёт архив с тем же sha256, а `gh release verify-asset v0.4.1 altnovatrail-spec-0.4.1.tgz -R altnovatrail/spec` — «Verification succeeded! altnovatrail-spec-0.4.1.tgz is present in release v0.4.1». README пакета: «The package holds declarations alone, with no code to run, so import them with `import type`» и «Take it at an exact version, the same tag as any submodule or Go module of `spec` you hold, and move all of them together»;
- Go — [go.dev/dl, JSON](https://go.dev/dl/?mode=json&include=all): у go1.27.3 для linux-amd64 sha256 `65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40`, для linux-arm64 — `a06e99309dbcbdca1a8ccd2282c3ee146e55930886e26b4f1193269587165f49`, как в `.devcontainer/Dockerfile` `spec` на его теге;
- релизы соседей — `gh release list`: у `modules` и `tutor` релизов нет, у `module-kit` — v0.1.0 от 2026-10-21, у `.github` последний — v0.1.10 от 2026-10-22.

### 6.2. Переход на `spec` v0.6.2

(architecture 1, 3.3, 3.4 и 3.7; R44), прочитано 2026-11-02:

- `gh release list -R altnovatrail/spec` — v0.6.2 от 2026-11-01 23:54Z, последний; v0.6.0 вышел в 22:56Z, v0.6.1 — в 23:36Z. `gh release verify v0.6.2 -R altnovatrail/spec` — «Release v0.6.2 verified!». В релизе — `altnovatrail-spec-0.6.2.tgz` и `format-0.2.tar.gz`, а рядом с каждым — bundle `.sigstore.json`;
- `npm view @altnovatrail/spec@0.6.2`: версия вышла 2026-11-01T23:55:23Z, под Apache-2.0 и без зависимостей, `exports` — `./canvas`, `./formatv0`, `./formatv0/open` и `./package.json`, `integrity` — `sha512-FlnH73fs…aibw==`. Архив реестра и файл релиза совпадают: sha256 у обоих — `95e4e7c2f954608ab6530e3fb9e44c0e4d71665fb4481797137d11555cbef0aa`;
- `just -f spec/justfile release-verify-npm package-lock.json` на v0.6.2 отвечает за ≈ 2 с: «node_modules/@altnovatrail/spec: altnovatrail-spec-0.6.2.tgz: spec v0.6.2, signed by spec's release.yml, and its integrity is the verified bytes'». На копиях lock-файла рецепт отказывает с кодом 1:
  - с чужим `integrity` — «has the integrity …, and the verified archive's is …»;
  - с адресом другой версии — «comes from …, not …».

  Без пакетов `@altnovatrail` он отвечает «no package of @altnovatrail to verify» и не идёт ни в Sigstore, ни в GitHub. До проверки рецепт `_tools` делает `npm ci` в `spec/tools`, если их ещё нет: 233 пакета, ≈ 270 МБ, здесь — 2,9 с с пустым кешем npm;
- RULES.md на v0.6.2, Hard rules: «A file of a NovaTrail release — a binary, an archive, an index — enters code or CI only once `just -f spec/justfile release-verify` has accepted it (in spec, `just release-verify`), where it enters NovaTrail; a package of `@altnovatrail` from npm, once `release-verify-npm` has accepted the lock file, in CI of the pull request that changes it. From then on the digest the check pinned holds the file — the lock file's `integrity`, the chain of digests from a pinned index — and nothing checks its signature again»;
- `justfile` `spec` на v0.6.2, рецепт `release-verify-npm`: «a lock file with no such package has nothing to verify. RULES.md has a repository run it in CI of each pull request that changes the lock file»;
- `typescript.yml` `.github` v0.1.12, коммит 4225639. Входов у обёртки нет — `on: workflow_call:`, — а job лицензий берёт подмодуль: `submodules: ${{ matrix.check == 'licenses' }}`. Контейнер: «the container runs as the runner's user, with its home in /tmp, and it has the network npm ci and npm audit need». И ещё: «What the checks do is the repository's; how they are run is the same everywhere»;
- `git -C spec diff --stat v0.4.1 v0.6.2 -- .devcontainer repo-template` пуст;
- соседи:
  - `gh release list`: у `modules` релизов нет, у `module-kit` — v0.1.0 от 2026-10-21, у `tutor` — v0.1.0 от 2026-11-01, у `.github` — v0.1.12 от 2026-11-01;
  - `gh api repos/altnovatrail/canvas/immutable-releases` — `{"enabled":false}`, а у `canvas` один ruleset — `main` (25506234). В тот же день, по поручению автора: `PUT …/immutable-releases` — теперь `{"enabled":true}`, а `POST …/rulesets` дал ruleset `v-tags` (26336827). Его `name`, `target`, `enforcement`, `conditions`, `rules` и `bypass_actors` совпадают с ruleset `v-tags` `module-kit` (25559103) строка в строку. В ruleset `main` с того же дня — ещё `codecov/patch` с `integration_id` 254: `gh api apps/codecov` — `id` 254.

### 6.3. `.github` v0.1.13

(architecture 3.4), прочитано 2026-11-02:

- релиз вышел 2026-11-02 в 01:19Z, его тег — коммит 09443e1. Между v0.1.12 и v0.1.13 из workflow изменился только `release.yml` (`gh api repos/altnovatrail/.github/compare/v0.1.12...v0.1.13`);
- шапка `release.yml`: «With npm-package, the spec submodule is at v0.6.0 or newer, whose release-verify a run again checks the release's archive by»;
- шаг «spec's release-verify, asked ahead» идёт при `inputs.npm-package != '' && steps.version.outputs.version != ''`: «spec ships the recipe from v0.6.0, so a caller with npm-package on an older tag stops at its release, not at a rare run again»;
- шаг «The identity the signature will carry» при `publish` останавливает прогон, если workflow вызывающего — не `<репозиторий>/.github/workflows/release.yml@refs/heads/main`, или если общий закреплён не по SHA из 40 знаков;
- поправка 2026-11-02 к R18 .github, T39 в RUN.md `.github`: «Вызывающим без `npm-package` новый тег не нужен».

### 6.4. Переход на `spec` v0.6.5 и иконки кнопок строки

(architecture 3.3, 3.4 и 3.7; R45, R46), прочитано 2026-11-02:

- `gh release list -R altnovatrail/spec` — v0.6.5 от 2026-11-02 05:43Z, последний; v0.6.3 вышел в 02:30Z, v0.6.4 — в 04:39Z. `gh release verify v0.6.5 -R altnovatrail/spec` — «Release v0.6.5 verified!», а архив пакета в релизе — sha256 `57c399c033c0e2bfed12f355ed49e1f9e57cd24365cf72638c3d4a278e7bc823`, тот же, что `npm pack @altnovatrail/spec@0.6.5`;
- `npm view @altnovatrail/spec time` — 0.6.5 вышла 2026-11-02T05:45:11Z; `just -f spec/justfile release-verify-npm package-lock.json` — «spec v0.6.5, signed by spec's release.yml, and its integrity is the verified bytes'»;
- какой тег что принёс — по `git -C spec show <тег>:…`: R78 spec, R79 spec и README пакета с `release-verify-npm` (В57) — с v0.6.3; `Media` в `types/canvas/index.d.ts` (В58) и R81 spec — с v0.6.4; R83 spec — с v0.6.5;
- вывод рецепта `just new-repo-draft canvas typescript 3.2 v0.6.5` во временном клоне `spec` на v0.6.5: его `.devcontainer/Dockerfile` расходится с прежним Dockerfile `canvas` только в комментариях и строке `FROM` базового образа — у заготовки `3.0.10`, у `canvas` `3.0.12`, — а `devcontainer.json` — в двух комментариях и версии расширения Biome, 3.8.1 против 3.7.1; `host-network.sh` тот же;
- реестр npm: `@iconify-json/material-symbols` 1.2.97 — 2026-10-28T06:30:51Z, `license` — `Apache-2.0`, а его `info.json` — «Material Symbols», 15 761 иконка, автор Google, `https://github.com/google/material-design-icons`; `@iconify/utils` 3.1.7 — 2026-09-06T15:35:47Z, MIT, с зависимостями `@antfu/install-pkg` 2.1.0, `@iconify/types` 2.0.0, `import-meta-resolve` 4.2.0, `package-manager-detector` 1.9.0 и `tinyexec` 1.3.1, все под MIT и вышедшие раньше 2026-10-30;
- в наборе есть все имена таблицы architecture 6 spec: у `ink-pen`, `ink-eraser`, `delete-sweep` и `touch-app` контур и заливка — свои иконки, а у `undo`, `arrow-upward`, `arrow-downward`, `arrow-forward`, `keyboard-arrow-down` и `keyboard-arrow-right` контур — псевдоним заливки. Каждая иконка — `viewBox="0 0 24 24"` и закрашенные контуры `<path fill="currentColor" d="…"/>`;
- замер строки в Chromium контейнера: число линий строки листа, режима пера и примера на ширине элемента 360–1000 px по-английски и по-русски — без иконок, с иконкой 1.25em и полями 16 px и с иконкой 1.125em и полями 8 px (R46, «Вид»).

### 6.5. Формат модуля 0.4

(architecture 3.3, 3.8 и 3.9; R60, R61), прочитано 2026-11-09: README формата на теге `spec` v0.12.0, §2 — пока формат v0, «the platform reads only the current version»; §21 — «on a workbook, a box filled, `fill` … The demo fills the box with its `value` as the learner opens the part»; §9 — «`canvas` lays them out by the same numbers, from the npm package `@altnovatrail/spec`, which carries `page.yaml` and these vectors as JSON». Файл открытых видов `tutor` v0.1.21 от 2026-11-09 — с `module_format_version: "0.3"` (`gh release download`).

### 6.6. `.github` v0.1.21

(architecture 3.7; R60), прочитано 2026-11-09: релиз от 2026-11-08, тег — коммит 706f406, `gh release verify` принял его. Между v0.1.15 и v0.1.21 из workflow, которые зовёт `canvas`, изменились `release.yml` — шаг npm ждёт реестр до 20 минут, — `documents.yml` — образ собирает `toolchain.sh` `spec`, — и в одну строку `codeql.yml` и `scorecard.yml` (`gh api repos/altnovatrail/.github/compare/v0.1.15...v0.1.21`).

### 6.7. Формат модуля 0.3

(architecture 3.3 и 3.9; R32), прочитано 2026-11-08:

- README формата на теге `spec` v0.9.8, §2: «A reader MUST refuse, with a reason, a module that names a version it does not read: one newer than the reader knows, or one outside the versions the platform reads (below)»; «While the format is v0 (0.y), nothing is promised beyond the places that this section keeps in every version: every change is the next 0.y, and the platform reads only the current version»; «A module of 0.2 moved to 0.3 gets the same verdicts, numbers and open view, unless a count of its steps reaches a limit exactly». Вектор `vectors/rules/manifest.format-version/previous-minor.yaml` — `module_format_version: "0.2"`;
- [altnovatrail/modules](https://github.com/altnovatrail/modules/tree/v0.1.0), релиз v0.1.0 от 2026-11-07: `modules/english-essays/manifest.yaml`, `modules/grade-3-math/manifest.yaml` и `modules/olympiad-math/manifest.yaml` — все с `module_format_version: "0.3"`, и так же на `main` ae0bfe4.

### 6.8. `.github` v0.1.15

(architecture 3.7; поправка 2026-11-08 к R12), прочитано 2026-11-08: релизы v0.1.14 и v0.1.15 вышли 2026-11-02, тег v0.1.15 — коммит 89d3cee. Между v0.1.13 и v0.1.15 из workflow изменился только `.github/workflows/release.yml` (`gh api repos/altnovatrail/.github/compare/v0.1.13...v0.1.15`): вход `previous-file` — «Empty gives the recipe the version alone», `required: false`, `default: ""`, — и проверка номера, который держал npm: «A version it held keeps its time even then, and the numbers it held last lie under time.unpublished.versions too».

### 6.9. Переход на `spec` v0.15.1

(architecture 3.4; R76; T109), прочитано 2026-11-12:

- `gh release list -R altnovatrail/spec` — v0.15.1 от 2026-11-11 22:02Z, последний; `gh release verify v0.15.1 -R altnovatrail/spec` — «Release v0.15.1 verified!»; `npm view @altnovatrail/spec version` — 0.15.1;
- Go — [go.dev/dl, JSON](https://go.dev/dl/?mode=json&include=all): у go1.27.4 для linux-amd64 sha256 `7226736c2339719cda28fbf3a54d71aa63bcefe376e98cef00034268dab24840`, для linux-arm64 — `3392582988a273a87ab5043ee1b2c9c17a2c3c00580bf9326c47a2e0aaaeac92`, как в `.devcontainer/Dockerfile` `spec` на его теге;
- `legal-2.tar.gz` релиза v0.15.1 — sha256 `ae52b41b80711f1ce9be3a95397746979b7370fe7534a3ba8d21d38083a7d05b`, `release-verify spec v0.15.1` — «legal-2.tar.gz: spec v0.15.1, signed by spec's release.yml». Распакованный, он совпадает с архивом v0.15.0 файл в файл (`diff -r`), а `tar -tv` даёт даты 2026-11-11 21:52 вместо 03:30.

### 6.10. Переход на `spec` v0.16.3

(architecture 3.4; R77; T110), прочитано 2026-11-12:

- `gh release list -R altnovatrail/spec` — v0.16.3 от 2026-11-12 20:17Z, последний, после v0.16.2 и v0.16.1 того же дня; `gh release verify v0.16.3 -R altnovatrail/spec` — «Release v0.16.3 verified!», тег — коммит 664398e; `npm view @altnovatrail/spec version` — 0.16.3;
- `npm view @altnovatrail/contracts@0.16.3 dependencies` — `{ '@bufbuild/protobuf': '2.17.0' }`; `git ls-remote https://github.com/bufbuild/protobuf-es refs/tags/v2.17.0` — коммит `01a8c3b7c95d17758c641b2b9e8ee2f14a3ee9d7`, а LICENSE и заголовок `varint.ts` на нём — те же байты, что на v2.16.0;
- `legal-2.tar.gz` релиза v0.16.3 — sha256 `5c9e3b9568bc60e146d3bc031fcc71b8b5cd478333989f2b5b64e44f0222371a`, `release-verify spec v0.16.3` — «legal-2.tar.gz: spec v0.16.3, signed by spec's release.yml». Распакованный, он совпадает с архивом v0.15.1 файл в файл (`diff -r`), а `tar -tv` даёт даты 2026-11-12 20:06;
- `just new-repo-draft canvas typescript 3.2 v0.16.3` во временном клоне `spec` на теге даёт `.devcontainer/` `canvas` байт в байт, а `.claude/settings.json` заготовки отличается от `canvas` только тем, что держит R15: правилами `deny` на папку образцов, написанных рукой;
- `module-kit` на `main` (`gh api repos/altnovatrail/module-kit/commits`) — перешёл на v0.16.3 в 2026-11-12 20:54Z, своим решением R54 module-kit, без перестройки документов, а пилот, строка 7.1 COORDINATION.md spec, — задача T43 module-kit вне эпика, без «Сделано»: не начат.

## 7. Инструменты, пакеты и CI

### 7.1. GitHub Packages

(architecture 2.3) — GitHub Docs, [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry), прочитано 2026-10-19: «You need an access token to publish, install, and delete private, internal, and public packages». Перечитано 2026-10-21 в исходниках документации, [github/docs](https://github.com/github/docs/blob/cca0c9d7299f760587d6601bd96acfd2f5cb8929/data/reusables/package_registry/authenticate-packages.md), коммит cca0c9d: фраза та же, а [рядом](https://github.com/github/docs/blob/cca0c9d7299f760587d6601bd96acfd2f5cb8929/data/reusables/package_registry/packages-classic-pat-only.md) — «GitHub Packages only supports authentication using a personal access token (classic)».

### 7.2. npm

(architecture 2.3 и 3.4), прочитано 2026-10-21:

- CLI — [npm/cli](https://github.com/npm/cli/tree/ae98c62586b6fea44114f72e249e246a2981de70), релиз v12.2.1 от 2026-10-15, коммит ae98c62:
  - `allow-remote` в `workspaces/config/lib/definitions/definitions.js`: «As of npm 12 the default is `none`. Tarballs that share a hostname with the configured registry (the typical case for the npm registry, GitHub Packages, and most private registries) are still installed normally»; «`root` only allows urls defined in your project's package.json to be installed». В npm 11.19.0, который стоит в контейнере вместе с Node 24.21.0, значение по умолчанию — `'all'`;
  - `npm-install.md`: папка вне проекта — «it will create a symlink to `<folder>`»; `npm-link.md`: «First, `npm link` in a package folder with no arguments will create a symlink in the global folder…»;
  - `npm-audit.md`: «The `audit signatures` command will also verify the provenance attestations of downloaded packages». pacote 22.0.0 из той же сборки (`node_modules/pacote/lib/registry.js`) сверяет имя и версию пакета и его sha512, а `sigstore.verify` зовёт без правила о том, кто подписал. Workflow и репозиторий, которые собрали пакет, не проверяются;
  - `npm-cache.md`: «All data that passes through the cache is fully verified for integrity on both insertion and extraction»;
  - имя архива в `workspaces/libnpmpack/lib/index.js` — `${manifest.name}-${manifest.version}.tgz`, без `@` и с `-` вместо `/`;
  - `npm-stage.md`: «Staged publishing allows users to have their automated workflows stage a package without a 2FA prompt, deferring the act of 2FA, allowing the maintainer to approve the staged package and publish at a later point»;
  - у параметра `access` значение по умолчанию — «'public' for new packages, existing packages it will not change the current level»;
- документация — [npm/documentation](https://github.com/npm/documentation/tree/4e8e03b978033529bf8f50d74305b29939eb022c), коммит 4e8e03b от 2026-10-16:
  - `trusted-publishers.mdx`:
    - «Trusted publishing requires npm CLI version 11.5.1 or later and Node version 22.14.0 or higher»;
    - «Some GitHub Actions workflows use `workflow_call` to invoke other workflows that run `npm publish` … validation checks the calling workflow's name instead of the workflow that actually contains the publish command, which can cause configuration mismatches. The `id-token: write` permission must also be given to both parent and child workflows»;
    - «npm automatically generates and publishes provenance attestations for your package»;
    - «A newly created trusted publisher configuration must complete its first successful publish within 2 days»;
    - настройка «Require two-factor authentication and disallow tokens»;
    - «your package's `repository.url` field in `package.json` must exactly match your GitHub repository»;
  - `npm-trust.mdx` (v12): «Package must exist: The package you're configuring must already exist on the npm registry»;
  - `downloading-and-installing-packages-locally.mdx`: «Scoped public packages can be downloaded and installed by anyone». В `creating-and-publishing-scoped-public-packages.mdx` — «By default, scoped packages are published with private visibility. To publish a scoped package with public visibility, use `npm publish --access public`»: с параметром `access` CLI это расходится;
  - `organizations/index.mdx`: «Organizations are free when they publish public packages»;
  - `policies/unpublish.mdx`: «Registry data is immutable, meaning once published, a package cannot change»; «Once `package@version` has been used, you can never use it again»;
  - `about-access-tokens.mdx`: «As of November 2025, only Granular access tokens are supported»; «The ability to publish new package versions directly with a granular access token will be removed in January 2027»;
  - `about-two-factor-authentication.mdx`: для публикации нужны «Two-factor authentication (2FA) enabled on your account, OR A granular access token with bypass 2FA enabled»;
- реестр: `https://registry.npmjs.org/-/org/altnovatrail/package` отвечает 404 `{"error":"Scope not found"}`, а `@altnovatrail/canvas` — 404 `{"error":"Not found"}`. Так же реестр отвечает и на выдуманное имя, поэтому свободно ли имя, ответ не доказывает. В тот же день автор создал организацию `altnovatrail`. После этого `-/org/altnovatrail/package` отвечает 200 `{}`, выдуманное имя — по-прежнему 404 «Scope not found», а `@altnovatrail/canvas` — 404 «Not found»: пакета ещё нет.

Прочитано 2026-10-22 (architecture 3.4; T24 в [RUN.md](../RUN.md)):
- `trusted-publishers.mdx` в npm/documentation, коммит [7e98ab4](https://github.com/npm/documentation/tree/7e98ab4d9c17afad7157be171a684bbeffbaa53f) от 2026-10-22: «Configurations created after Sep 03, 2026 are automatically set to allow `npm stage publish`, and you can choose whether to also permit direct publishing with `npm publish`»; «If the configuration is not validated within 2 days, it expires and can no longer be used or edited»;
- `npm-trust.md` в npm/cli, тег [v11.19.0](https://github.com/npm/cli/blob/v11.19.0/docs/lib/content/commands/npm-trust.md): «`--allow-publish`: Allows the trusted publisher to run `npm publish` for the package»; «At least one of these flags is required when creating a trust configuration». Нужны «`npm@11.15.0` or above» — в контейнере 11.19.0 — и «2FA enabled on account»;
- ошибка [npm/cli#9969](https://github.com/npm/cli/issues/9969) от 2026-09-14 — «OIDC trusted publishing fails with "package not found" for GitHub repos that use immutable OIDC subject claims» — открыта, с метками «Needs Triage», «Priority 1» и «oidc», последнее изменение — 2026-10-13. Её автор и второй комментатор пишут о репозиториях, созданных после 2026-07-15, где `use_immutable_subject: true` не выключается; автор ссылается на changelog GitHub. Это отчёты пользователей, а не ответ npm;
- у `canvas` — `"use_immutable_subject":true` (`gh api repos/altnovatrail/canvas/actions/oidc/customization/sub`), а создан он 2026-10-19 (API GitHub).

Прочитано 2026-11-02 (architecture 3.4; T70 и T71 в [RUN.md](../RUN.md)):
- страница настроек пакета `@altnovatrail/canvas` на сайте npm, по снимку экрана автора: в «Publishing access» — «Require two-factor authentication and disallow bypass 2fa tokens (recommended)» и «Require two-factor authentication or a granular access token with bypass 2fa enabled», а под ними — «Note about trusted publishers: All publishing access options above are compatible with OIDC trusted publishers. If you have configured trusted publishers for this package, they will continue to work regardless of which option you select»;
- вывод `npm trust github @altnovatrail/canvas --file release.yml --repository altnovatrail/canvas --allow-publish` у автора: «Trust configuration created successfully», «permissions: publish, stage publish»;
- реестр, `npm view @altnovatrail/canvas --json`: версия `0.0.0-stage` от 05:13:54Z — «Temporary package placeholder for staged publishing», её опубликовала учётная запись автора с первой публикацией, — 0.1.0 от 05:15:11Z и 0.1.1 от 05:39:38Z, у которой `_npmUser` — «GitHub Actions <npm-oidc-no-reply@github.com>», а тег `latest` — 0.1.1;
- аттестации 0.1.1, `https://registry.npmjs.org/-/npm/v1/attestations/@altnovatrail%2fcanvas@0.1.1`: «https://github.com/npm/attestation/tree/main/specs/publish/v0.1» и «https://slsa.dev/provenance/v1». У второй `workflow` — `.github/workflows/release.yml` `altnovatrail/canvas` на `refs/heads/main`, коммит fd032f1, а в сертификате — `altnovatrail/.github/.github/workflows/release.yml@09443e1027ef24197439dfe60a072d14c3626cc3`; `npm audit signatures` в пробном проекте — «2 packages have verified attestations»;
- npm/cli#9969 — по-прежнему открыта, последнее изменение — 2026-10-28 (`gh api repos/npm/cli/issues/9969`).

### 7.3. Node.js

(architecture 3.4) — [dist/index.json](https://nodejs.org/dist/index.json), прочитано 2026-10-21: у v24.21.0 — `"npm": "11.19.0"`.

### 7.4. Docker

(architecture 3.4) — документация, [docker/docs](https://github.com/docker/docs/blob/226023fc89bdeb3f051c4c8c697d04ed5f5bcd2c/content/manuals/engine/network/_index.md), коммит 226023f, прочитано 2026-10-21: «Containers have networking enabled by default, and they can make outgoing connections»; «When you run a container without the `--network` option, it is connected to the default bridge»; «Containers attached to the default bridge have access to network services outside the Docker host».

### 7.5. Playwright

(architecture 3.4) — [microsoft/playwright](https://github.com/microsoft/playwright/tree/v1.64.1), тег v1.64.1, прочитано 2026-10-21:

- [`docs/src/docker.md`](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/docker.md): «It is recommended to always pin your Docker image to a specific version if possible. If the Playwright version in your Docker image does not match the version in your project/tests, Playwright will be unable to locate browser executables»; об образе — «This image includes the Playwright browsers and browser system dependencies. The Playwright package/dependency is not included in the image and should be installed separately»; о флагах — «Using `--init` Docker flag is recommended to avoid special treatment for processes with PID=1» и «Using `--ipc=host` is recommended when using Chromium. Without it, Chromium can run out of memory and crash»;
- [`nativeDeps.ts`](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/src/server/registry/nativeDeps.ts): у записи `ubuntu24.04-x64` для `chromium` — 21 пакет, от `libasound2t64` до `libxrandr2`, без версий.

### 7.6. Релизы GitHub

(architecture 3.4) — исходники GitHub Docs, [github/docs](https://github.com/github/docs/tree/cca0c9d7299f760587d6601bd96acfd2f5cb8929), коммит cca0c9d, прочитано 2026-10-21:

- `about-releases.md`, с подставленными значениями переменных: «Up to 1000 release assets may be associated with a single release. Each file included in a release must be under 2 GiB»;
- `immutable-releases.md`: «Immutable releases are releases where the assets and associated Git tag cannot be changed after publication»; «Release assets cannot be modified or deleted». При этом создаётся «release attestation, which is a cryptographically verifiable record of a release containing the release tag, commit SHA, and release assets»;
- `immutable-releases.md`, перечитано 2026-11-10 на docs.github.com (architecture 3.4; T75; R66): «Only the assets and tag are locked. You can still edit the title and release notes of a published immutable release, and change whether it is marked as a pre-release or as the latest release»;
- `verify-release-integrity.md`: «To verify a local artifact is an exact match for a release asset» — `gh release verify-asset RELEASE-TAG ARTIFACT-PATH`;
- `oidc-with-reusable-workflows.md`: «If that job is part of a reusable workflow, the token will include the standard claims that contain information about the calling workflow, and will also include a custom claim called `job_workflow_ref` that contains information about the called workflow»;
- API GitHub, 2026-10-21: у `altnovatrail/canvas` `immutable-releases` — `{"enabled":false,"enforced_by_owner":false}`, а ruleset у него один — `main` (25506234). Перечитано в тот же день, `repos/altnovatrail/canvas/rulesets/25506234`: обязательные проверки — «Secrets / gitleaks», «DCO / sign-off», «Documents / docs-check-repo» и «CodeQL / analyze (actions)» с `integration_id` 15368 и «SonarCloud Code Analysis» с 12526. Проверок «TypeScript / …» в нём нет. Перечитано после мержа pull request #18 T08 и её шага в ruleset, 2026-10-21: обязательных проверок десять — к этим пяти добавлены «TypeScript / lint», «TypeScript / test», «TypeScript / vuln», «TypeScript / licenses» и «CodeQL / analyze (javascript-typescript)», все с `integration_id` 15368, а `repos/altnovatrail/canvas/rules/branches/main` применяет их к `main`.

### 7.7. Код и инструменты

(architecture 3.7; R12–R15), прочитано 2026-10-21:

- реестр npm, `npm view <пакет> time`:
  - Biome 2.5.15 — 2026-09-30, а 2.6.0, 2.6.1 и 2.6.2 — 2026-10-21, в 09:51, 10:28 и 11:08 UTC;
  - Vite 8.3.4 — 2026-10-08, а 8.3.5 — 2026-10-21;
  - Vitest 5.0.5 — 2026-10-15, Playwright 1.64.1 — 2026-10-14, TypeScript 7.0.2 — 2026-07-08, `@types/node` 24.19.2 — 2026-10-09;
  - у vitest 5.0.5 peer `vite` «^6.4.0 || ^7.0.0 || ^8.0.0» не помечен необязательным, а у `@vitest/browser-playwright` 5.0.5 peer `vitest` — «5.0.5»;
  - typescript-eslint 8.72.0 требует `typescript` «>=4.8.4 <6.1.0»;
  - `exports` пакета `typescript` 7.0.2 — `./lib/version.cjs` и `./unstable/*`, а `bin/tsc` запускает нативный бинарник платформенного пакета `@typescript/typescript-<платформа>`;
- npm 11.19.0 в контейнере, `@npmcli/config`, `definitions.js`, о `before`: «If passed to `npm install`, will rebuild the npm tree such that only versions that were available **on or before** the given date are installed»;
- TypeScript 7.0.2 на сборке этого пакета: `rewriteRelativeImportExtensions` переписал `./sheet.ts` в `./sheet.js` в JavaScript, а в `.d.ts` оставил `./sheet.ts`. Отсюда импорты с `.js` в `src/` (R12);
- Node 24.21.0 в контейнере: `process.features.typescript` — `strip`, а файл `.ts` с типами запускается без флагов и без предупреждения; `import.meta.main` объявлен в `@types/node` 24.19.2;
- Biome — схема настроек 2.5.15, `linter.rules.preset`: «recommended», «all», «none». Расширение для VS Code — [biomejs/biome-vscode](https://github.com/biomejs/biome-vscode/tree/v3.7.1), тег v3.7.1, коммит cd61440:
  - README: «dual-licensed under the MIT License and the Apache License, Version 2.0»;
  - `src/locator.ts` ищет Biome сначала в настройках, затем — «Check the project's `node_modules` directory for a Biome binary»;
  - в Marketplace стабильные версии — 3.8.0 от 2026-10-21 и 3.7.1 от 2026-06-18, а версии с датой в номере — предварительные;
- Playwright — [microsoft/playwright](https://github.com/microsoft/playwright/tree/v1.64.1), тег v1.64.1, коммит cfe490d:
  - `packages/playwright-core/browsers.json` — у `chromium-headless-shell` `"revision": "1248"`, `"browserVersion": "156.0.8078.4"`, `"title": "Chrome Headless Shell"`;
  - `packages/playwright-core/src/server/registry/index.ts` — для `ubuntu24.04-x64` «`cftUrl('linux64/chrome-headless-shell-linux64.zip')`», то есть `builds/cft/${browserVersion}/…` на `https://cdn.playwright.dev`;
  - `docs/src/browsers.md`: «by default, Playwright uses open source Chromium builds» и «Playwright ships a regular Chromium build for headed operations and a separate chromium headless shell for headless mode»;
  - `nativeDeps.ts` для `ubuntu24.04-x64`: у `chromium` — 21 пакет, у `firefox` — 25, у `webkit` — 52;
  - `lib/coreBundle.js` пакета playwright-core 1.64.1: в `chromiumSwitches` — `"--disable-dev-shm-usage"`;
- образ `mcr.microsoft.com/playwright:v1.64.1-noble`, индекс `sha256:7852dc5…`, манифест amd64 `sha256:bdfda2a…` (реестр MCR):
  - слой `sha256:e20e5ef…`, 314 299 253 байта сжатыми, — `playwright-core install chromium`: `chromium-1248` с `WidevineCdm/LICENSE`, `chromium_headless_shell-1248` и `ffmpeg-1013`. Firefox и WebKit — отдельные слои по 122 076 107 и 113 748 815 байт, и файлов лицензий в них нет;
  - `chromium_headless_shell-1248/chrome-headless-shell-linux64/ABOUT`: «Google Chrome … Copyright 2026 Google LLC. All rights reserved. Chrome is made possible by the Chromium open source project (https://www.chromium.org/) and other open source software (chrome://credits). See the Terms of Service at chrome://terms». `LICENSE.headless_shell` там же начинается с «The Chromium Project» и BSD-3-Clause;
  - в пересобранном контейнере `chrome-headless-shell --version` отвечает «Google Chrome for Testing 156.0.8078.4», а папка занимает 273 МБ;
- условия Chrome — [Chrome/ChromeOS/GooglebookOS Additional Terms of Service](https://www.google.com/chrome/terms/), редакция «Last modified: 30 September, 2025»: «By using Chrome or ChromeOS, you agree to the Google Terms of Service located at https://policies.google.com/terms and these Google Chrome and ChromeOS Additional Terms of Service. These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS. Most source code for Chrome is available free of charge under open source software license agreements at chrome://credits». Страница [Chrome for Testing](https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing), обновлена 2023-06-12, и README [GoogleChromeLabs/chrome-for-testing](https://github.com/GoogleChromeLabs/chrome-for-testing) на коммите b9cf0a2 об условиях своих сборок не пишут;
- apt 2.8.3 базового образа: в `changelog` — «Initial support for snapshot servers, apt --snapshot option» и «Automatically enable snapshots where supported». `apt-config dump` называет серверы снимков для `archive.ubuntu.com` и `security.ubuntu.com`. На пустых списках `apt-get update --snapshot 20261021T000000Z` взял `noble`, `noble-updates`, `noble-backports` и `noble-security` с `https://snapshot.ubuntu.com/ubuntu/20261021T000000Z`, а `apt-get install -s` 24 пакетов — «0 upgraded, 61 newly installed, 0 to remove»;
- Dependabot — [dependabot-core](https://github.com/dependabot/dependabot-core/blob/fda701f/docker/lib/dependabot/docker/file_parser.rb), коммит fda701f: разбор Dockerfile берёт строку, только если она совпадает с `FROM_LINE` — `^FROM\s+…`. Группы по нескольким экосистемам — [github/docs](https://github.com/github/docs/tree/1696b2d/content/code-security), коммит 1696b2d: «Multi-ecosystem updates allow Dependabot to group dependency updates across different package ecosystems … into a single pull request per group», и `patterns` для них обязательны. Что тогда бывает с остальными пакетами записи, документация не говорит;
- Claude Code — [Permissions](https://code.claude.com/docs/en/permissions): «`/path` Path relative to the settings source», а в настройках проекта это `<primary working directory>/path`; «A `*` in a Bash rule matches any text, including spaces»; о правиле Bash — «isn't a security boundary around the program»;
- SonarQube Cloud — [Automatic analysis](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/automatic-analysis): о `.sonarcloud.properties` — «Below are the supported optional settings for the `.sonarcloud.properties` file. Wildcard patterns are not allowed». Сам список настроек в тексте страницы не прочитан;
- `tutor` — его T11, pull request #13, слит f501412: раздел `samples/` в CLAUDE.md, `/samples/` в `.gitignore` и в `.claude/settings.json` — `Read(/samples)`, `Read(/samples/**)`, `Edit(/samples)`, `Edit(/samples/**)` и `Bash(*samples*)`.

### 7.8. Покрытие тестов

(architecture 3.7; R43), прочитано 2026-11-01:

- Vitest, [docs/guide/coverage.md](https://github.com/vitest-dev/vitest/blob/v5.0.5/docs/guide/coverage.md) на теге v5.0.5: о v8 — «This provider requires Javascript runtime that's implemented on top of V8 engine, such as NodeJS, Deno or any Chromium based browsers such as Google Chrome» и «User's source files can be executed as-is without any pre-instrumentation steps»; об istanbul — «Source code is transformed to add instrumentation before running» и «Execution speed is slower than V8 due to instrumentation overhead»; об охвате — «By default Vitest will show only files that were imported during test run»;
- там же, [docs/guide/projects.md](https://github.com/vitest-dev/vitest/blob/v5.0.5/docs/guide/projects.md): «the root configuration will only influence global options such as `reporters` and `coverage`»;
- реестр npm (`npm view`): `@vitest/coverage-v8` 5.0.5 — под MIT, от 2026-10-15, его peer — `vitest` и `@vitest/browser` 5.0.5, а из версий 5 новее — только 5.1.0-beta.1;
- проба здесь: модуль `src/core/`, которого не грузит ни один тест, встал в отчёт с `LH:0`, а прогон всех тестов с покрытием шёл 16,0 с против 15,4 без него.

### 7.9. Vite 8.3.4 для `just demo`

(architecture 3.7; R12, R14, R20), прочитано 2026-10-22:

- реестр npm, `npm view vite time`: 8.3.4 вышла 2026-10-08, 8.3.5 — 2026-10-21. У Vitest 5.0.5 в `peerDependencies` — `"vite": "^6.4.0 || ^7.0.0 || ^8.0.0"`;
- `dist/node/chunks/node.js` пакета `vite`:
  - без своего списка — `allow: raw?.fs?.allow ?? [workspaceRoot]`;
  - у корня страницы в `isFileLoadingAllowed` исключения нет: файл проходит, только если `fs.allow.some((uri) => isFileInTargetPath(uri, filePath))`;
  - свой клиент Vite добавляет в список сам: `if (!allowDirs.some((dir) => isParentDirectory(dir, resolvedClientDir))) allowDirs.push(resolvedClientDir)`;
  - CSS по умолчанию — `transformer: "postcss"`, а `lightningcss` берётся для сжатия при сборке, `cssMinify`;
- проба 2026-10-22, в рабочем дереве T34:
  - `just demo` на `/` и `/main.ts` отвечает 200;
  - на `/@fs/<дерево>/package.json` и `RUN.md` — 403, а в журнале сервера — ровно три разрешённые папки: `demo`, `src` и `node_modules`;
  - на `/package.json`, `/../package.json` и `/%2e%2e/package.json` отвечает самой страницей, `index.html`.

## 8. Лицензии и вклад

### 8.1. Apache License 2.0

(architecture 3.6) — [LICENSE](../LICENSE) этого репозитория, раздел 2, прочитано 2026-10-21: «each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form».

### 8.2. Developer Certificate of Origin 1.1

(architecture 3.6; П-18) — [developercertificate.org](https://developercertificate.org/), прочитано 2026-10-21: (c) «The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it»; (d) «a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely».

### 8.3. GitHub Docs: удаление данных из репозитория

(architecture 3.6) — [github/docs](https://github.com/github/docs/blob/efd4783/content/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository.md), коммит efd4783, прочитано 2026-10-21: «If you only rewrite your history and force push it, the commits with sensitive data may still be accessible elsewhere», среди прочего — «Through any pull requests that reference them». И о Support GitHub: он «won't remove non-sensitive data».

## 9. Решения элемента и страницы

### 9.1. Ввод листа

(architecture 3.1, 3.2 и 3.7; R18), прочитано 2026-10-22:

- **perfect-freehand 1.2.3** — пакет из lock-файла, а его исходники — `sourcesContent` в `dist/esm/index.mjs.map`. Умолчания кода — `size = 16` и `last: isComplete = false`, а таблица опций README — «`size` | number | 8» и «`last` | boolean | true». Одну точку `getStrokePoints` дополняет: «If there's only one point, add another point at a 1pt offset», `UNIT_OFFSET: [1, 1]`. Порог конца — «Pixels to skip at the end of a stroke to reduce noise», `END_NOISE_THRESHOLD = 3`, а при `thinning` 0 радиус — `size / 2`, без нажима. Замер на прямых штрихах при `size` 3: в 0,5 и 1 единицу длиной контур шире на 0,08 и 0,29 единицы, чем при счёте в «листе × 10», а с 2 единиц — такой же;
- **Pointer Events**. В [Editor's Draft](https://w3c.github.io/pointerevents/) о списке промежуточных точек: «For all other trusted event types, it is an empty list» — у всех, кроме `pointermove` и `pointerrawupdate`, — и «Untrusted events have their coalesced events list initialized to the value passed to the constructor». В таблице кнопок [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/) — «Right Mouse, Pen barrel button» с `button` 2 и `buttons` 2 и «Pen eraser button» с 5 и 32; «Pointer Events do not fire overlapping pointerdown and pointerup events for chorded button presses»;
- **canvas-api-onprem** — [MathTrail/canvas-api-onprem](https://github.com/MathTrail/canvas-api-onprem/tree/f4bfe5274f2cd73af3bb24ebc97a83dacf07de84), ветка `main`, коммит f4bfe52, Apache-2.0. В `ui/src/components/OlympiadCanvas.tsx` — `const PEN_OPTIONS = { size: 5, thinning: 0.5, smoothing: 0.5, streamline: 0.5 }` без `simulatePressure`, так что нажим, переданный третьим числом, библиотека заменяет выведенным из скорости, а точки — положение на сцене Konva, в пикселях. Кода режима пера и отсечения ладони поиск при планировании T09 не нашёл ни в одной ветке canvas-api, ни в других репозиториях MathTrail;
- **доска `tutor`** — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3660eac), коммит 3660eac — мерж pull request #20, `internal/board/page.html`: `<canvas id="board" width="1000" height="600" …>`, `ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";`, фон — `ctx.fillStyle = "#fff"`, а точка — `(e.clientX - r.left) * canvas.width / r.width`;
- **Chrome Headless Shell 156** (R13), пробы в контейнере:
  - `Emulation.setDeviceMetricsOverride` с `deviceScaleFactor: 2` посреди теста: в кадре теста `devicePixelRatio` стал 2, а `devicePixelContentBoxSize` холста 300 × 420 CSS px остался 300 × 420. Ни записи ResizeObserver, ни события `change` у `matchMedia("(resolution: 1dppx)")` за 20 кадров не пришло, хотя `matches` стал `false`;
  - с `deviceScaleFactor: 2` в контексте Playwright `devicePixelRatio` — 2 с самого начала, а `devicePixelContentBoxSize` элемента 300 × 100 CSS px — 300 × 100, и в кадре теста, и на странице вне его;
  - мышь `Input.dispatchMouseEvent` нажимает с тем `force`, что ей дали, а без него — с 0; с `pointerType: "pen"` и `force` приходит перо с этим нажимом;
  - `PointerEvent.pressure` — 32-битное число: 0,6 читается как 0,6000000238418579;
  - снимки упавших тестов Vitest 5.0.5 кладёт в `.vitest/attachments/failure-screenshots/`.

### 9.2. Картинка работы и остановка письма

(architecture 3.1 и 3.3; R20), прочитано 2026-10-22:

- HTML Standard, [canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026:
  - у `toBlob` — «set result to a copy of this canvas element's bitmap», а файл из копии пишется потом, «in parallel», и колбэк получает его или `null`;
  - у `convertToBlob` `OffscreenCanvas` — то же, «Let bitmap be a copy of this's bitmap», а тип по умолчанию — «"image/png"»;
  - в таблицах поддержки на той же странице `toBlob` — «Firefox 18+ Safari 11+ Chrome 50+», а `convertToBlob` — «Firefox 105+ Safari 16.4+ Chrome 69+»;
- HTML Standard, [Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees), та же дата: «Hit-testing must act as if the 'pointer-events' CSS property were set to 'none'». Об атрибуте `inert` — «Authors should not specify elements as inert unless the content they represent are also visually obscured in some way»;
- MDN, [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events), правка 2026-08-14: в формальном определении — «Inherited yes»;
- CSS Shadow Module Level 1, [Editor’s Draft, 28 April 2026](https://drafts.csswg.org/css-shadow-1/): теневое дерево входит в «flattened element tree, which CSS uses for all purposes after Selectors (including inheritance and box construction)»;
- Playwright 1.64.1, `lib/coreBundle.js` пакета `playwright-core`: в headless — `chromeArguments.push("--hide-scrollbars", …)`, так что в тестах у листа полосы прокрутки нет.

### 9.3. Ластик и история письма

(architecture 3.1, 3.3 и 3.5; R22), прочитано 2026-10-25:

- DOM Standard, [Event](https://dom.spec.whatwg.org/), Living Standard — Last Updated 19 October 2026: «The timeStamp attribute must return the value it was initialized to», а когда событие создаётся, — «Initialize event's timeStamp attribute to the relative high resolution coarse time given time and event's relevant global object»;
- High Resolution Time, [Editor's Draft 1 September 2026](https://w3c.github.io/hr-time/): «The now() method MUST return the number of milliseconds in the current high resolution time given this's relevant global object (a duration)», а «The relative high resolution coarse time given a moment from the monotonic clock coarseTime and a global object global, is the duration from global's relevant settings object's time origin to coarseTime». Так что `timeStamp` события и `performance.now()` отсчитаны от одного начала — time origin страницы;
- perfect-freehand 1.2.3, `sourcesContent` в `dist/esm/index.mjs.map`: `getStrokeRadius` — `size * easing(0.5 - thinning * (0.5 - pressure))`. При `size` 3, `thinning` 0,5 и нажиме 1 радиус — 2,25 единицы листа: это `INK_REACH`, самое дальнее, куда чернила отходят от точек штриха;
- ластик пера — «Pen eraser button» с `button` 5 и `buttons` 32 в таблице кнопок Pointer Events Level 3 (выше, «Ввод листа»). В DevTools protocol его нет: в `types/protocol.d.ts` пакета `playwright-core` 1.64.1 — `type MouseButton = "none"|"left"|"middle"|"right"|"back"|"forward"`, у `buttons` — «Left=1, Right=2, Middle=4, Back=8, Forward=16, None=0», а `pointerType?: "mouse"|"pen"`. Поэтому тесты дают его синтетическими событиями;
- формат образца `tutor` — «стирание — время и ID стёртых штрихов» (выше, «tutor»): отмен и очисток в нём нет.

### 9.4. Слои, сетка и условие

(architecture 3.1, 3.2 и 3.3; R23), прочитано 2026-10-25:

- HTML Standard, [event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering), Living Standard — Last Updated 22 October 2026: в «update the rendering» — «For each doc of docs, run the scroll steps for doc», а позже — «For each doc of docs, run the animation frame callbacks for doc»;
- Chrome Developers, [Inside look at modern web browser (part 4)](https://developer.chrome.com/blog/inside-browser-part4), Mariko Kosaka, 2018-09-21: «If no input event listeners are attached to the page, Compositor thread can create a new composite frame completely independent of the main thread»;
- [SVG 2](https://www.w3.org/TR/2026/CR-SVG2-20261006/), W3C Candidate Recommendation Snapshot 06 October 2026, о `non-scaling-stroke`: «stroke outline shall be calculated in the "host" coordinate space» и «The host coordinate space for vector-effect is the viewport coordinate system of the furthest ancestral SVG viewport»;
- режим принудительных цветов:
  - [CSS Color Adjustment Level 1](https://www.w3.org/TR/2025/CR-css-color-adjust-1-20251216/), CR Snapshot 16 December 2025: «svg|svg { forced-color-adjust: preserve-parent-color; }»;
  - MDN, [`forced-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors), правка 2026-04-20: «The browser provides the color palette to authors through the CSS system color keywords»;
  - MDN, [system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color), правка 2026-08-12: Canvas — «Background of application content or documents», CanvasText — «Text color in application content or documents», GrayText — «Text color for disabled items (for example, a disabled control)»;
- [CSS Custom Properties for Cascading Variables Level 1](https://www.w3.org/TR/css-variables-1/), CR Snapshot 16 June 2022: если значение после подстановки `var()` недопустимо, то вычисленное значение — «Either the property's inherited value or its initial value depending on whether the property is inherited or not, respectively, as if the property's value had been specified as the unset keyword»;
- MDN, [blob: URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob), правка 2026-09-17: «Each of these must be released by calling URL.revokeObjectURL() when you no longer need them» и «revoke object URLs only when the resource is no longer accessible by the user (such as when the image is removed from the DOM)»;
- формулы — то, из чего выбирали:
  - [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.7/mathml/elements/math.json), релиз v8.1.7: `math` — в Chrome с 109, в Firefox с 4, в Safari с 5.1; web-features 3.44.0 называет `mathml` Baseline с 2023-01-12;
  - реестр npm: `katex` 0.19.1 от 2026-10-23, MIT, с 60 файлами шрифтов, а его README — «Make sure to include the CSS and font files in both cases»; `temml` 0.14.0 от 2026-10-08, MIT, а его README — «Temml is a LaTeX-to-MathML Core JavaScript conversion utility»;
- задачи без формул и условие над листом:
  - `tutor`, [6af03a2](https://github.com/altnovatrail/tutor/tree/6af03a29585789dc51f5f359b67d2ff82e8add79): пять задач доски — `internal/board/tasks.go`, синтетика — `internal/synth/synth.go`, например «Реши уравнение 2(x − 3) = 10.» и «Вычисли (47 + 19) : 6.». В формате банка, `internal/sample/bank.go`, — «Statement is the condition the writer solves, in Russian», а полей картинки, формулы и канвы нет. Самого банка задач замера ещё нет: T15 `tutor` — `[?]`. Доска, `internal/board/page.html`, ставит условие над листом — `<p id="statement" lang="ru">`, а текст в него пишет `textContent`;
  - MathTrail standalone, [e90334e](https://github.com/mathtrail/mathtrail-standalone/tree/e90334e1946ae26c627263075ae886636aa49270): 603 задачи в `content/examples/*.json`, у 95 из них картинка, у 6 — дробь a/b в вопросе, а LaTeX и дробей Юникода нет. Вопрос — `<p class="mt-task-text">` простым текстом. Картинку, которую карточка нарисовать не может, она пропускает: «a picture the card cannot draw all read as none, and the task stands on its words» (`web/src/widget/payload.ts`);
  - canvas-api, коммит 0901af0 (выше), перечитано 2026-10-25: в `docs/spec.md` — «| Условие задачи | текст над листом, а не часть листа; на картинки проверки оно не попадает |» и «Ширина области листа ограничена, поэтому на широком экране по бокам остаются поля». Ни KaTeX, ни MathJax, ни MathML в репозитории нет;
  - прототип `spec/draft/NovaTrail Widget.html` на теге v0.2.18: условие — в шапке над полем в клетку, а клетка — фон CSS;
- `app`, [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504) от 2026-10-21: T07 «Языки интерфейса (О-2) и доступность интерфейса» — `[ ]`, и у неё в «Сделать» — «стандарт доступности и схема переводов — общие для пакетов интерфейса»;
- пробы в контейнере, Chrome Headless Shell 156 через Playwright 1.64.1:
  - с `forcedColors: "active"` в контексте Playwright `matchMedia("(forced-colors: active)")` выполняется с самого начала. Собственный цвет страницы `rgb(255, 0, 0)` вычисляется в цвет CanvasText, так что режим принуждает цвета, а не только медиа-запрос;
  - `page.screenshot` Vitest 5.0.5 с `save: false` файла не пишет: «If file is not saved, `page.screenshot` always returns `base64` screenshot» (`@vitest/browser/context.d.ts`). `page.getByRole` проходит в открытый shadow root.

### 9.5. Группы штрихов

(architecture 3.2, 3.5 и 3.7; R24), прочитано 2026-10-25:

- паузы в детском письме — M. Pascual, O. Soler, N. Salas, [«In a split second: Handwriting pauses in typical and struggling writers»](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.1052264/full), Frontiers in Psychology, опубликовано 2023-01-06. Восемьдесят детей 3 и 5 классов писали алфавит пером Neo Smartpen, а паузы считались от 100 мс: «The average duration of handwriting pauses was around 400ms, in line with assumptions that transcription pauses would fall under the 2,000ms threshold», «3rd graders made more and longer pauses than 5th graders» и «There is only a weak empirical basis to claim that specific average numbers and durations of pauses may be associated with specific writing processes»;
- исследование «Рукопись ребёнка на канве и ИИ-наставник» (выше), пример «лестница»: «Строит группы и хранит у себя таблицу «группа → ID штрихов» (A → s1–s9, B → s10–s11, C → s12–s20, D → s23–s24)». Метки там идут в порядке письма: рисунок, подпись, выражение, ответ в круге;
- `tutor`, [016d1e5](https://github.com/altnovatrail/tutor/tree/016d1e50f5544bbc55f7f98e43ab33eaa2d92de0) от 2026-10-25:
  - R08 tutor — «Группы для меток строятся так, как их построит устройство, — по пространству и времени, без разметки»;
  - R11 tutor — «лог действий строит программа раннера так, как его построило бы устройство, — из штрихов и стираний, без разметки. В нём порядок групп, долгие паузы не короче 6 с, сколько стёрто и у какой группы, возврат к прежней группе»;
  - R21 tutor — «Большой замер чтения ИИ возвращается — по плану architecture 3.1, только на моделях Claude»; его задачи ждут планирования замера;
  - в architecture 3.1 tutor — «группы — те же, что для меток, по пространству и времени, а их порядок — по первому штриху»;
  - синтетика, `internal/synth/synth.go`: `charHeight = 36 // the height of a digit`, `charAdvance = 26`, `lineStep = 80`, `w.pause(1500)` перед каждой строкой и `w.pause(120 + w.rng.Int64N(130))` между штрихами;
  - ни алгоритма групп, ни порогов нет ни в документах, ни в коде;
- `spec`, ветка `main` — [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), тег v0.2.32 от 2026-10-23: эпик E3 — по-прежнему строка таблицы 2 его RUN.md, задач у него нет. Правила групп там нет: его даёт T12;
- MathTrail:
  - canvas-api, коммит 0901af0 (выше): групп нет, а в `docs/spec.md` — «сегментации строк и штрихов на сервере больше нет». В его брошенном замысле, на коммите [2796f48](https://github.com/mathtrail/canvas-api/tree/2796f48), строка штриха — по медиане y, `row = floor((median_y − 200) / 100) + 1`, а строка кончена, когда ребёнок «не трогал холст 6 секунд»;
  - standalone, [491d5c2](https://github.com/mathtrail/mathtrail-standalone/tree/491d5c28c255353b50b84ab1dc68a7022a3a7d55): групп нет, а в `SPEC.md` прототип — «what it only pretends to do yet: recognising handwriting and drawings, the companion's voice, problems from a photo»;
- The Go Programming Language Specification, [`doc/go_spec.html`](https://github.com/golang/go/blob/72edc307c89f81d0f1270dcb02d48ad976803551/doc/go_spec.html), «Language version go1.28 (October 9, 2026)»: «An implementation may combine multiple floating-point operations into a single fused operation, possibly across statements, and produce a result that differs from the value obtained by executing and rounding the instructions individually»;
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html), ветка `main` от 2026-10-23: `Math.hypot` — «Return an implementation-approximated Number value representing the square root of the sum of squares of the mathematical values of the elements of _coerced_»;
- Vitest 5.0.5, `dist/chunks/index.1TqnEahn.js` в `node_modules`: `updateSnapshot` — `"none"`, когда идёт CI и флага обновления нет, а иначе `"new"`. Записанный файл снимка без `-u` не переписывается, и расхождение с ним — провал.

### 9.6. Вырезка

(architecture 3.1, 3.2, 3.5 и 3.7; R25), прочитано 2026-10-25. У страниц поставщиков даты правки нет:

- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision):
  - «Each model has a maximum native image resolution, expressed as a long-edge limit and a visual-token limit. Images larger than either limit are downscaled before processing»;
  - в таблице пределов — «High-resolution | Claude 4.7 and later models | 2,576 px | 4,784» и «Standard | All other models | 1,568 px | 1,568»;
  - «An image, therefore, costs `⌈width / 28⌉ × ⌈height / 28⌉` visual tokens»;
  - «Claude might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels»;
  - «Claude supports JPEG, PNG, GIF, and WebP images»; «The maximum dimensions for each image are 8000x8000 px»; размер картинки в API — «10 MB (base64-encoded)», а на Amazon Bedrock — «5 MB (base64-encoded)»;
- Anthropic, [Coordinates and bounding boxes](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates):
  - «Claude finds the largest aspect-preserving size that satisfies both of the model's image limits»: сторона не длиннее 1 568 px на стандартном уровне и 2 576 на высоком, а токенов не больше 1 568 и 4 784;
  - «The token limit can also trigger a resize when neither side exceeds the edge limit»;
- OpenAI, [Images and vision](https://developers.openai.com/api/docs/guides/images-vision): «patch_count = ceil(width/32)×ceil(height/32)»; у `gpt-6-astra` в `high` — «up to 2,500 patches and a 65,535-pixel maximum dimension», у `gpt-5.6-sol`, `-terra` и `-luna` — «`high` fits within 2048 × 2048 pixels and 2,500 patches»;
- `tutor`, [74f0019](https://github.com/altnovatrail/tutor/tree/74f0019b2742a0d6a4e7ee5732da8d7f31da16a4) от 2026-10-25:
  - R08 tutor — «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px; основная — 32 px»; как считать медиану, сколько толщины у линии и каков предел размера, нет ни в документах, ни в коде: кода рендера, групп и медианы нет, а T21 и T22 tutor отложены;
  - поправка 2026-10-23 к R06 tutor — «OpenAI из замера убран: замер идёт только на моделях Claude. По этой записи это `claude-haiku-5-5` и `claude-opus-5-5`»;
  - поправка 2026-10-25 к R19 tutor — «Картинка не уменьшается: запрос велит API отвергнуть картинку, которую тот уменьшил бы, — иначе пиксели модели разошлись бы с пикселями доски»; в T45 tutor картинка доски — «792 токена, меньше предела стандартного уровня в 1 568, и ни одна сторона не длиннее 1 568 px»;
  - доска, `internal/board/page.html`, рисует `ctx.lineWidth = 3` на холсте 1000 × 600, по пикселю на единицу, а цифра синтетики — `charHeight = 36`;
  - R11 tutor даёт модели «видимые штрихи в порядке написания, упрощёнными ломаными в целых пикселях вырезки»;
  - в architecture 3.1 tutor — «Вырезка при цифрах 32 px — около 320×260 у листа строк и около 600×450 у свободного решения с рисунком. Это допущение, а не замер»;
- `spec` v0.2.18 и ветка `main` — [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), тег v0.2.32 от 2026-10-23:
  - на обоих в concepts 15 spec — «рамка группы | group box | общий прямоугольник штрихов группы, в долях вырезки»; в эпике E3 их RUN.md — правила вырезки, «они одни у устройства и раннера», и тест-векторы «от геометрии с группами к параметрам и рамкам вырезки, а не байты PNG»; во «Входе» T28 там же — «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32»;
  - в Т-32 — «Годность рамки — целые 0–1000 и min < max — проверяет адаптер, а у негодной рамки места нет»; в Т-31 — «От групп зависит и масштаб вырезки»;
  - только на `main` — во «Входе» T28 «масштаб вырезки задаёт медианная высота группы штрихов», а в карточке architecture 3.2 spec — «вырезку ячейки» рабочей тетради;
- canvas-api, [`docs/spec.md`](https://github.com/mathtrail/canvas-api/blob/0901af0439280334b3da33ffc4cc5c853e4403ff/docs/spec.md), раздел 4.3: картинка проверки — весь лист, «одна единица — один пиксель», а линии — «чёрные линии постоянной толщины — 4 единицы, со скруглёнными концами»;
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html): у `Math.sqrt` — «Return 𝔽(the square root of ℝ(_n_))», а 𝔽 — «the IEEE 754-2019 roundTiesToEven mode»; у `Math.round` — «preferring the Number closer to +∞ in the case of a tie»; у деления — «Return 𝔽(ℝ(_x_) / ℝ(_y_))»; у `Math.hypot` и `Math.sin` — «implementation-approximated»;
- Go, [`src/math/sqrt.go`](https://github.com/golang/go/blob/0d37007fda071631fbcb520b99c85a8e4c93108a/src/math/sqrt.go): «On systems where Sqrt is a single instruction, the compiler may turn a direct call into a direct use of that instruction instead», а запасной код — «Return correctly rounded sqrt»; в `doc/go_spec.html` (выше) — «An explicit floating-point type conversion rounds to the precision of the target type, preventing fusion that would discard that rounding»;
- [PNG, Third Edition](https://www.w3.org/TR/png-3/), W3C Recommendation 24 June 2025: в 11.2.1 у типа цвета 0 — «Greyscale | 0 | 1, 2, 4, 8, 16»; в 10.1 — «deflate compression with a sliding window … of at most 32768 bytes»; в 11.3 — «Ancillary chunks may be ignored by a decoder»; в 5.5 CRC считается «on the preceding bytes in the chunk, including the chunk type field and chunk data fields, but not including the length field»;
- [RFC 1950](https://www.rfc-editor.org/rfc/rfc1950), 2.2: «The information in FLEVEL is not needed for decompression»; Adler-32 — «two sums accumulated per byte … Both sums are done modulo 65521». [RFC 1951](https://www.rfc-editor.org/rfc/rfc1951): фиксированные коды — 3.2.6, а в 3.1.1 — «Huffman codes are packed starting with the most-significant bit of the code»; длина 258 — код 285 без лишних бит (3.2.5).

### 9.7. Пометки наставника

(architecture 3.1, 3.2, 3.3, 3.5 и 3.7; R26), прочитано 2026-10-26:

- canvas-api, коммит 0901af0 (выше):
  - R43 canvas-api — «Клиент берёт штрихи, которые были на листе в момент Check и у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц. Их он обводит с отступом»; «Если таких штрихов нет или модель места не нашла, рамки нет — остаётся только вопрос». Поправок у R43 canvas-api нет;
  - spec 4.4 canvas-api: «Сервер пропускает только годную рамку: четыре целых числа от 0 до 1000, `xmin < xmax` и `ymin < ymax`, и площадь не больше четверти листа»; клиент «обводит общую рамку этих штрихов с отступом 10 единиц на слое подсказок»; «Рамка и вопрос исчезают, когда ребёнок снова нажал Check или стёр любой из обведённых штрихов»;
  - кода привязки нет: это задача T71 canvas-api, и она не сделана;
- `tutor`, [0f624a3](https://github.com/altnovatrail/tutor/tree/0f624a31d1a01cf02af6fa28816383e9bc3b28aa) от 2026-10-25:
  - поправка T45 к R19 tutor — «Рамку модели доска рисует как есть, с углами в любом порядке»; среди отвергнутого там — «пометка, притянутая к штрихам, и метки групп на копии картинки, как в R08»;
  - R24 tutor отвергает «метки на полях и притяжка рамки к штрихам (R08, R11) — попадание считается по строке, и модели хватает рамки», а в architecture 3.1 tutor рамка засчитана, «если оценка `error` и рамка попала в строку первой ошибки: в рамке с полем 8 px больше всего видимых точек именно этой строки»;
  - R08 tutor — «На реальной школьной рукописи у лучшей модели без дообучения F1 по рамкам ответа — не выше 55 %»;
- `spec` v0.2.18 и ветка `main` — [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), тег v0.2.32: о пометках, рамках и притяжке между ними ничего не изменилось:
  - concepts 8 spec — «Слой наставника — рамки, пометки, номера, короткие надписи и пунктирный набросок «как начать»», «Набросок рисуется под записью ученика, рамки и пометки — над ней» и «Ни то, ни другое не меняет и не закрывает работу ученика (R05)»;
  - в concepts 15 spec термина «пометка» нет — ни русского, ни английского;
  - R36 spec — «Контекст отправки — где вырезка лежит на листе (`sheet_box`), рамки групп штрихов и таблицу «метка группы → ID штрихов» — держит `app`, а не канва»;
  - Т-31 и Т-32 открыты, а эпик E3 не начат;
- Vitest 5.0.5, `@vitest/browser`, `dist/locators-BHr21v4S.js` в `node_modules`: роль элемента `svg` — `` SVG:()=>`img` ``, а `aria-hidden` стоит в списке глобальных атрибутов ARIA.

### 9.8. Интерфейс пакета

(architecture 3.1, 3.3 и 3.7; R27), прочитано 2026-10-26:

- `spec` — ветка `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), тег v0.2.32, как при T14:
  - R36 spec — «Элемент получает данные свойствами, отдаёт работу методом, а изменения и просьбы — событиями» и «У `canvas`: историю письма — событием после каждого штриха, вырезку для проверки — методом `exportWork()`»; имени события `spec` не называет;
  - «Вход» T28 в RUN.md `spec` — «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32» и «Как поля называются в схеме, решает T28». T28 и T35 там не сделаны, у релизов `spec` нет файлов, а пакета типов `spec` в npm нет;
  - на `main` в первом срезе два вида канвы — лист для рукописи и рабочая тетрадь, по решению о трёх модулях, которое вышло в v0.2.19, — а карточка architecture 3.2 spec дополнена 2026-10-22: рабочую тетрадь — страницу, ячейки ответа, вырезку ячейки и слой шаблона — детализирует `canvas`. Подмодуль `spec` у `canvas` — на v0.2.18;
- `app` — [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), ветка `main`:
  - кода нет: «There is no code here yet: the framework and the build are the first thing that epic decides»;
  - T01 «Фреймворк и сборка» и T07 «Языки интерфейса (О-2) и доступность интерфейса» в его RUN.md не начаты. В T07 — «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»»;
  - что хранится на устройстве, решает его T02: «работа нужна на устройстве, пока идёт попытка»;
- `tutor` — [41fde66](https://github.com/altnovatrail/tutor/tree/41fde663368d05ddb06fcfc5ce97955395ce309c), ветка `main`:
  - замер `canvas` не берёт: образцы со штрихами пишет режим записи доски, в формате `tutor-sample`, — «Не страница `canvas`»;
  - режим записи доски, R25 tutor: «Всё, чего ластик коснулся между нажатием и отпусканием, — одна запись стирания». В T13 tutor — «Undo стирает последний видимый штрих, и это пишется стиранием — помаркой», а «Clear начинает лист заново со второго нажатия»;
- пакет `@altnovatrail/canvas` не выходил: у `altnovatrail/canvas` нет релизов (`gh release list`), а `npm view @altnovatrail/canvas` отвечает «404 Not Found».

### 9.9. Свои кнопки листа

(architecture 3.1, 3.2, 3.3 и 3.7; R28), прочитано 2026-10-26:

- `spec` — ветка `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), тег v0.2.32, как при T15, и тег подмодуля v0.2.18 — в этом одинаково:
  - concepts 8 spec — «Инструменты разрешает задача: перо, ластик, линейка, транспортир, калькулятор, клавиатура, микрофон». Отмену и очистку `spec` инструментами нигде не зовёт;
  - иллюстрация concepts 16.1 spec — `canvas: { kind: handwriting-sheet, grid: squares, tools: [pen, eraser] }`, а concepts 16 spec о ней — «Это не формат: имена полей и запись условные, их задаст схема модуля»;
  - в «Сделать» T28 в RUN.md `spec` — «канва задачи: вид и его параметры, инструменты и слой шаблона». Схемы задачи нет: T28 не сделана;
  - на `main` в `format/README.md`, раздел 2, минорная версия формата может добавить «a new check kind, canvas kind, tool or list value»;
  - О-2 советует «английский и русский»; общей схемы переводов пакетов интерфейса и уровня доступности в `spec` нет;
- `app` — [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), ветка `main`, как при T15: T01 и T07 не начаты, а в T07 — «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»». Как `app` передаёт язык `canvas`, нигде не записано;
- `tutor` — [90589e5](https://github.com/altnovatrail/tutor/tree/90589e54f179652b96ac2941cf7765c9d7f4b25e), ветка `main`:
  - доска, `internal/board/page.html`: строка `.tools` под листом — «Undo stroke», «Clear» и «Check», без липкости. R19 tutor — «кнопки, подписи и сообщения доски на английском, как весь код (R14 spec)»;
  - страница записи, `internal/board/record.html`: под листом — `<button id="eraser" type="button" aria-pressed="false">Eraser</button>`, «Undo», «Clear» и «Done», а «Undo» выключается, когда отменять нечего: `byId("undo").disabled = !writing || visible().length === 0;`;
- canvas-api — [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0439280334b3da33ffc4cc5c853e4403ff): лист не построен, а его задача T48 canvas-api не сделана. В макете `draft/MathTrail Minimal.html` — панель значков поверх листа, `position:absolute;top:12px;right:12px`, кнопки 44 × 44 px с `title` и без `aria-*`. В product 8 canvas-api — «Крупные кнопки и области касания»;
- WAI-ARIA Authoring Practices:
  - [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) — «Use toolbar as a grouping element only if the group contains 3 or more controls»; «the keyboard tab sequence includes one stop for the toolbar and arrow keys move focus among the controls in the toolbar»; «in circumstances where discoverability of a function is crucial, it may be helpful if disabled controls are focusable so screen reader users are more likely to be aware of their presence»;
  - [пример панели](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/examples/toolbar/) — «since pressing one toggles off another so that only one button in the group is in the pressed state, the toggles behave like radio buttons»;
  - [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) — «when navigating through a radio group in a toolbar with arrow keys, the button that is checked does not change»;
  - [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) — «When the action associated with a button is unavailable, the button has aria-disabled set to true»;
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled), Recommendation 06 June 2023 — `aria-disabled` «Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable»;
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), Recommendation 12 December 2024:
  - 2.5.8 — «at least 24 by 24 CSS pixels»;
  - 2.5.5 — «at least 44 by 44 CSS pixels»;
  - 2.4.11 — «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content»;
- HTML Standard, Living Standard — Last Updated 26 October 2026:
  - [язык](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes) — «If the node's parent is a shadow root — Use the language of that shadow root's host», а `lang` у `HTMLElement` — «[CEReactions, Reflect] attribute DOMString lang»: отражение своего атрибута;
  - [требования к конструктору](https://html.spec.whatwg.org/multipage/custom-elements.html) — «The element's attributes and children must not be inspected, as in the non-upgrade case none will be present» и «The element must not gain any attributes or children»;
  - [`disabled`](https://html.spec.whatwg.org/multipage/interaction.html#focusable-area) — в фокус попадает только то, что «not actually disabled»;
- [RFC 4647](https://www.rfc-editor.org/rfc/rfc4647#section-3.4), раздел 3.4 — «In the lookup scheme, the language range is progressively truncated from the end until a matching language tag is located», а «Single letter or digit subtags … are removed at the same time as their closest trailing subtag». В ECMA-402 такой поиск — внутренняя операция, а `supportedLocalesOf` ищет по языкам самого движка; `Intl.LocaleMatcher` — на стадии 1 ([tc39/proposals](https://github.com/tc39/proposals/blob/HEAD/ecma402/README.md));
- принудительные цвета: [CSS Color 4](https://www.w3.org/TR/css-color-4/#css-system-colors) — ButtonFace «The face background color for push buttons»; [CSS Color Adjustment 1](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties) — у цвета, который не системный, «its used value is instead forced to a system color»;
- липкая строка: [CSS Positioned Layout 3](https://www.w3.org/TR/css-position-3/#valdef-position-sticky) — sticky держится «in reference to the nearest ancestor scroll container's scrollport»; [CSS Overflow 3](https://www.w3.org/TR/css-overflow-3/#valdef-overflow-hidden) — у `hidden`, а `auto` без переполнения ведёт себя как он, блок «still a scroll container»; MDN, [Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context), правка 2026-09-28 — контекст наложения даёт «Element with a position value fixed or sticky»;
- web.dev, [Custom element best practices](https://web.dev/articles/custom-elements-best-practices), Last updated 2017-08-14 — «Do not dispatch events in response to the host setting a property (downward data flow)».

### 9.10. Ввод на планшетах

(architecture 2.6, 3.1, 3.2, 3.3 и 3.7; R29), прочитано 2026-10-26:

- [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/), W3C Recommendation от 30 июня 2026:
  - `width` — «The width (magnitude on the X axis), in CSS pixels (see [CSS21]), of the contact geometry of the pointer. This value MAY be updated on each event for a given pointer», а где геометрия не измерена — 1;
  - `touch-action` «does in fact apply to all forms of pointer inputs that allow direct manipulation for panning and zooming», а у `none` «Direct manipulation interactions that begin on the element MUST NOT trigger behaviors related to viewport panning and zooming»;
  - об отсечении ладони самим устройством — «devices that support both touch and pen interactions may ignore touch inputs while the pen is actively being used, to allow users to rest their hand on the touchscreen while using the pen»;
  - касание и перо на экране «SHOULD behave exactly as if setPointerCapture was called on the target element just before the invocation of any pointerdown listeners»;
- [issue W3C pointerevents #203](https://github.com/w3c/pointerevents/issues/203), открыта: «In some situations like note taking applications, you might want the pen to draw by default, while still allowing a finger to scroll. That's not possible to express with `touch-action` today.»;
- ширина касания в коде браузеров — прочитано в коде, на устройствах не проверено:
  - WebKit на iOS, `Source/WebCore/dom/ios/PointerEventIOS.cpp`: `m_width(2 * event.radiusXAtIndex(index))`, а радиус по обеим осям — `majorRadius` касания;
  - Chromium: ширина касания — `radius_x * 2`, а у `pointerup` — «For pointerup, even known width/height is ignored in favor of the default value of 1»;
- [recto, pull request #32](https://github.com/ErenDenizK/recto/pull/32) от 2026-10-19 — отчёт другого проекта, а не измерение: «iOS Safari reports a touch's width and height as twice the contact radius, about 40–60 px for a fingertip. So most finger presses were treated as a palm and dropped»;
- WebKit, ошибка [269535](https://bugs.webkit.org/show_bug.cgi?id=269535) «Canva: No pointer events from Apple Pencil while touch present» — статус NEW, последнее изменение 2026-08-11. В комментариях:
  - «If the user rests their hand on the screen prior to starting drawing we get no PointerEvents for the Apple Pencil»;
  - «still seeing this problem with the iOS 27 developer beta»;
  - о Chrome — «FWIW, in Chrome 121 on Android, when a stylus makes contact, pointerup events are dispatched for any ongoing touches and a pen pointerdown is dispatched»;
- WebKit, ошибка [238543](https://bugs.webkit.org/show_bug.cgi?id=238543) «If pinch-zoom is disabled with touch-action, then multi finger scrolling should also be disabled» — статус NEW;
- форум Apple, [тема 773213](https://developer.apple.com/forums/thread/773213), январь 2025, без ответа Apple: «Apple Pencil down blocks touch input until lifted and touch input blocks Apple Pencil input», и это касается событий касаний и мыши тоже — «any variant exhibits the same behavior»;
- DevTools protocol, [`Input.dispatchTouchEvent`](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/Input.pdl): у точки касания `radiusX` — «X radius of the touch area (default: 1.0)», а «TouchEnd and TouchCancel must not contain any touch points». Проба T35 в Chrome Headless Shell контейнера:
  - касания приходят событиями указателя `touch`, с шириной — удвоенным `radiusX` — и с неявным захватом;
  - `touchEnd` с пальцами отпускает только их;
  - `timestamp` доходит до `timeStamp`;
  - у `pointerup` ширина — 1;
  - `navigator.maxTouchPoints` — 0;
- Playwright, [`docs/src/browsers.md`](https://github.com/microsoft/playwright/blob/41d368a5c7e7a2f32f6109ba736af9f25cfacd3d/docs/src/browsers.md), коммит 41d368a: «Playwright's WebKit is derived from the latest WebKit main branch sources» и «Playwright doesn't work with the branded version of Safari since it relies on patches»;
- Android, [`ViewConfiguration.java`](https://github.com/aosp-mirror/platform_frameworks_base/blob/8b948e548b782592ae280a3cd9a91798afe6df9d/core/java/android/view/ViewConfiguration.java), коммит 8b948e5:
  - `TAP_TIMEOUT = 100` — «Defines the duration in milliseconds we will wait to see if a touch event is a tap or a scroll»;
  - `TOUCH_SLOP = 8` — «Distance a touch can wander before we think the user is scrolling in dips»;
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation от 12 декабря 2024:
  - 2.5.1 Pointer Gestures (A) — «All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential»;
  - 2.5.7 Dragging Movements (AA) — «All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author»;
  - [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — «This criterion does not apply to scrolling and dragging gestures enabled by the user agent», но «does apply if content actively suppresses the user agent's own scrolling functionality and/or implements its own scrolling mechanism»; и ещё: «achieving keyboard equivalence for a dragging operation does not automatically meet this success criterion»;
- Apple, Human Interface Guidelines, [Apple Pencil and Scribble](https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble) — «Let people choose when to switch between Apple Pencil and finger input».

### 9.11. Кнопки «Выше» и «Ниже»

(architecture 2.6, 3.1, 3.2 и 3.3; R33), прочитано 2026-10-27:

- шаг Page Down в коде движков — прочитано в коде, на устройствах не проверено:
  - Chromium, [`cc/input/scroll_utils.h`](https://github.com/chromium/chromium/blob/377f5e85f70e900020b60a03f67f07032f6ad1af/cc/input/scroll_utils.h) и [`scroll_utils.cc`](https://github.com/chromium/chromium/blob/377f5e85f70e900020b60a03f67f07032f6ad1af/cc/input/scroll_utils.cc), коммит 377f5e8: `kMinFractionToStepWhenPaging = 0.875f`. `kMaxOverlapBetweenPages` — `40` на Mac (`#if BUILDFLAG(IS_MAC)`), а иначе `std::numeric_limits<int>::max()`. Шаг — `std::max(min_page_step, length - kMaxOverlapBetweenPages)`, где `min_page_step = length * kMinFractionToStepWhenPaging`;
  - WebKit, [`Source/WebCore/platform/Scrollbar.h`](https://github.com/WebKit/WebKit/blob/e427188d73fb165e49a4aade8c172b47ea6fbe02/Source/WebCore/platform/Scrollbar.h), коммит e427188: `static float minFractionToStepWhenPaging() { return 0.8; }`, а `pageStep` — больший из `viewWidthOrHeight * minFractionToStepWhenPaging()` и `contentWidthOrHeight - maxOverlapBetweenPages()`;
  - наибольший нахлёст у WebKit по умолчанию — `std::numeric_limits<int>::max()`, по [`ScrollbarTheme.h`](https://github.com/WebKit/WebKit/blob/8b21bb68c6fbc325572bb23189e9948b14dd740d/Source/WebCore/platform/ScrollbarTheme.h), коммит 8b21bb6. На Mac — `40`, по [`ScrollbarThemeMac.h`](https://github.com/WebKit/WebKit/blob/b8f13b0bdb24aa2c7cce86b426d21a7cdcfe7d9b/Source/WebCore/platform/mac/ScrollbarThemeMac.h), коммит b8f13b0. У [`ScrollbarThemeIOS.h`](https://github.com/WebKit/WebKit/blob/b279109c4a222d514467aead0cd97c00b777edfd/Source/WebCore/platform/ios/ScrollbarThemeIOS.h) (коммит b279109) и `ScrollbarThemeComposite.h` своего нахлёста нет;
  - WebKit на iOS:
    - клавиатура прокручивает с [`WKKeyboardScrollingAnimator.mm`](https://github.com/WebKit/WebKit/blob/3fdbb7698ab689d74dc1b76f1741362a2ede8e0b/Source/WebKit/UIProcess/ios/WKKeyboardScrollingAnimator.mm), коммит 3fdbb76: `const CGFloat defaultPageScrollFraction = 0.8;`, и страница — высота прокручиваемого, умноженная на неё;
    - у страницы её считает [`WKContentViewInteraction.mm`](https://github.com/WebKit/WebKit/blob/a647e38977957c6fd89a430759d9d51fa50bce2b/Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm), коммит a647e38: `WebCore::Scrollbar::pageStep(protect(_page)->unobscuredContentRect().height(), self.bounds.size.height)` — те же 0,8 видимой части;
  - Firefox, [`modules/libpref/init/StaticPrefList.yaml`](https://github.com/mozilla-firefox/firefox/blob/b94dd99eb54f0b0a883a2ad6597facf350c27a80/modules/libpref/init/StaticPrefList.yaml), коммит b94dd99: `toolkit.scrollbox.pagescroll.maxOverlapPercent` — `10`, а `maxOverlapLines` — `2`, «The maximum overlap between pages when scrolling with page-up/page-down/spacebar»;
- WebKit, ошибка [277290](https://bugs.webkit.org/show_bug.cgi?id=277290) «AX: Scrolling containers inoperable with keyboard» — статус NEW, заведена 2024-07-29:
  - «For containers that allow scrolling, a keyboard-only user cannot scroll the container»;
  - в комментарии от 2025-12-11 — «Since Chrome finally fixed this in January, WebKit is the last holdout»;
  - pull request к ней предложен 2026-06-06;
- Chrome, [«Keyboard focusable scrollers»](https://developer.chrome.com/blog/keyboard-focusable-scrollers), обновлено 2024-03-20:
  - «This feature allows scrollers without tabindex value set and without any focusable children to be keyboard focusable»;
  - «To improve performance, this feature has been pushed back to Chrome 132».

### 9.12. Рабочая тетрадь

(architecture 2.7; R34), прочитано 2026-10-27:

- [SVG 2](https://www.w3.org/TR/2026/CR-SVG2-20261006/), W3C Candidate Recommendation Snapshot 06 October 2026, глава [Text](https://www.w3.org/TR/2026/CR-SVG2-20261006/text.html):
  - `textLength` — «The author's computation of the total sum of all of the advance values that correspond to character data within this element»;
  - у `lengthAdjust` значение `spacing` — «Indicates that only the advance values are adjusted. The glyphs themselves are not stretched or compressed», а `spacingAndGlyphs` — «Indicates that the advance values are adjusted and the glyphs themselves stretched or compressed in one axis»;
  - «The user agent is required to achieve correct start and end positions for the text strings, but the locations of intermediate glyphs are not predictable»;
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.7/svg/elements/text.json), релиз v8.1.7: `textLength` и `lengthAdjust` у `<text>` — в Chrome с 1, в Firefox с 1.5, в Safari с 3, а Safari на iOS — как Safari;
- WebKit:
  - [PR 74063](https://github.com/WebKit/WebKit/pull/74063), влит 2026-09-19: «getComputedTextLength(), getSubStringLength(), getStartPositionOfChar(), getEndPositionOfChar() and getExtentOfChar() reported pre-stretch numbers under lengthAdjust="spacingAndGlyphs"»;
  - [PR 77259](https://github.com/WebKit/WebKit/pull/77259), влит 2026-10-16: «Following the spec steps fixes textLength with x/y lists and on text paths, and lengthAdjust="spacingAndGlyphs" and whitespace collapsing now match Chrome and Firefox» и «The new path is behind the internal SVG2TextLayoutAlgorithmEnabled flag, off by default for now»;
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024:
  - 1.3.2 Meaningful Sequence — «When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined»;
  - 1.4.4 Resize Text — «Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality»;
  - 1.4.10 Reflow — «Except for parts of the content which require two-dimensional layout for usage or meaning»;
  - 1.4.11 Non-text Contrast — «The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s)», и среди них «Graphical Objects: Parts of graphics required to understand the content». Сетка листа `#d3dbe5` на `#fff` по формуле контраста WCAG — 1,40:1;
- `tutor`, [8451728](https://github.com/altnovatrail/tutor/tree/845172878617727fa4da3133b0c9633e8d8ee140) от 2026-10-27:
  - в RUN.md T78–T80 `tutor` — `[ ]`. У T79 `tutor` — «один вызов на страницу: вырезки ячеек с подписями — с текстом пунктов или без него» и «ответ по ячейке — текст, разборчиво ли, другие прочтения, пуста ли». Отчёт T80 `tutor` сравнивает чтение «с текстом пункта против без него»;
  - в его architecture 2.6, в рекомендации продукту: «ячейки рабочей тетради — цифры на устройстве своей малой сетью, с откатом к ИИ». У этого варианта в таблице — «своя малая сеть читает ячейки тетради»;
- прототип `spec/draft/NovaTrail Widget.html` на теге v0.2.37 — иллюстрация:
  - в шапке над страницей — «Workbook · 10 examples» и условие;
  - пункты стоят в сетке из двух колонок, строкой высотой 84 px, с номером в круге;
  - после «=» — окошко 76 × 62 px с пунктирной чертой снизу;
  - у пункта — отметка «✓», а пометка наставника — пунктирный круг вокруг окошка;
- проба в контейнере, Chrome Headless Shell 156 через Playwright 1.64.1. SVG в открытом shadow root: корень — `role="none"`, в нём `<g role="list">`, а пункты — `<g role="listitem">` с `<text>` и `<rect role="img" aria-label>`. `ariaSnapshot()` даёт список, его пункты, текст и картинки с именами, по порядку: «listitem: text: 1. 7 × · img "окошко 1, пусто" · text: = 56». С `role="list"` на самом корне — то же.

  Уточнение 2026-10-27, T51: `ariaSnapshot()` — модель Playwright, которую он строит сам. Дерево доступности самого Chromium, `Accessibility.getFullAXTree` через DevTools protocol, при планировании T47 и T51 показало то же: корень `role="none"` пропущен, `list`, его `listitem` по порядку, текст — `StaticText`, окошки — `image` с именами.

### 9.13. Раскладка тетради

(R35), прочитано 2026-10-27:

- шрифты образа — пакет `fonts-liberation` 1:2.1.5-3 из снимка архива Ubuntu (`dpkg -s`): Liberation Sans, Serif и Mono. Ширины знаков прочитаны из их таблиц `cmap` и `hmtx` и сверены в Chrome Headless Shell 156: среднее Sans и Serif, округлённое до сотой, — число таблицы R35;
- лицензия шрифтов, `/usr/share/doc/fonts-liberation/copyright`, — «License: SIL-OFL-1.1». Её разрешение — «to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software», а условие 5 — «The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license». В пакет идут не файлы и не таблицы шрифтов, а свои средние двух шрифтов, округлённые до сотой. Это довод решения, а не юридическое заключение;
- проба в контейнере, Chrome Headless Shell 156 через Playwright 1.64.1:
  - `textLength` с `lengthAdjust="spacingAndGlyphs"` подгоняет `<text>` точно: ширина `getBBox` — заданная ±1 единица в Liberation Sans, Serif и Mono;
  - `sans-serif` в образе — Liberation Sans, а `system-ui` — Liberation Mono;
  - `lang` без пространства имён на `<g>` SVG даёт его `<text>` `:lang(ru)`, как и `xml:lang`;
  - унаследованный `direction: rtl` сдвигает `<text x="100">` с `text-anchor: start` к 72, а `direction: ltr` на SVG возвращает его к 100.

### 9.14. Заполненные ячейки и пример с разбором

(architecture 2.8; R42), прочитано 2026-11-01:

- README формата `spec` v0.4.1, §18: «`answer_slots_filled` — every answer slot of the task holds something of the learner's: a stroke in its zone or its box, an option tapped, and for an answer slot bound `anywhere` or `sheet`, a stroke on the sheet». §14: «An answer slot bound `anywhere` or `sheet` is the only answer slot of its task» и «The learner's app shows the `text`, with the options of the item's answer slots bound `choice`, beside the sheet: the sheet shows neither». §21: «The learner does not write on the sheet: it holds the author's demo and no learner's work», «The learner opens them one at a time, and MAY hide the whole demo and show it again» и «Whether the paragraphs and the pictures beside the sheet stand above it or beside it is the canvas's to say, as for a task's statement»;
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024. 4.1.3 Status Messages: «In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus». 1.3.2: «When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined». 2.4.3: «focusable components receive focus in an order that preserves meaning and operability»;
- [Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), обновлено 11 May 2026: статус сообщает «the success or results of an action», а критерий «specifically addresses scenarios where new content is added to the page without changing the user's context». Пример: после «Add to Shopping Cart» рядом появляется «5 items», и программа чтения произносит его, не забирая фокус;
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), W3C Recommendation 06 June 2023. Роль `status` — «A type of live region whose content is advisory information for the user but is not important enough to justify an alert», у неё «an implicit aria-live value of polite and an implicit aria-atomic value of true», и «If another part of the page controls what appears in the status, authors SHOULD make the relationship explicit with the aria-controls attribute». `aria-expanded` «Indicates whether a grouping element owned or controlled by this element is expanded or collapsed», и «If a grouping container that can be expanded or collapsed is not owned by the element that has the aria-expanded attribute, the author SHOULD identify the controlling relationship by referencing the container from the element that has aria-expanded with the aria-controls property»;
- [APG, Disclosure (Show/Hide) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), даты у страницы нет: «The element that shows and hides the content has role button», «When the content is visible, the element with role button has aria-expanded set to true» и «Optionally, the element with role button has a value specified for aria-controls that refers to the element that contains all the content that is shown or hidden»; Enter и Space «toggles the visibility of the disclosure content»;
- [HTML Standard, The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute), Last Updated 30 October 2026: элемент с `hidden` «is not yet, or is no longer, directly relevant to the page's current state», и «User agents should not render elements that are in the Hidden state».

### 9.15. Общая загрузка картинок

(architecture 3.3; R23, R42; T64), прочитано 2026-11-01:

- [HTML Standard, Images](https://html.spec.whatwg.org/multipage/images.html), Last Updated 30 October 2026: «Each Document object must have a list of available images», и «The list of available images is intended to enable synchronous switching when changing the src attribute to a URL that has previously been loaded». Если в списке есть картинка адреса, «Set the current request to a new image request whose image data is that of the entry and whose state is completely available». Но «User agents may also remove images from such lists at any time (e.g. to save memory)»;
- проба в Chrome Headless Shell 156.0.8078.4 образа через Playwright 1.64.1: после `new Image()` с адресом `blob:` и `await decode()` новый `<img>` с тем же адресом — `complete`, с `naturalWidth` больше нуля, синхронно, ещё до вставки в документ, у SVG и у PNG. После `URL.revokeObjectURL` новый `<img>` с этим адресом не разбирается — «EncodingError: The source image cannot be decoded»;
- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026: «interface SVGImageElement : SVGGraphicsElement { … attribute DOMString? crossOrigin; }; SVGImageElement includes SVGURIReference;» — метода `decode()` в IDL нет. В Chrome Headless Shell 156 `SVGImageElement.prototype.decode` — функция: Chromium даёт его сверх стандарта.

### 9.16. Картинки на участках листа

(architecture 3.3; R42; T61), прочитано 2026-11-01:

- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026, о `image`: `preserveAspectRatio` «must be explicitly set to none to turn off aspect ratio control», и «If the value of ‘preserveAspectRatio’ was 'none' then aspect ratio of the image would not be preserved. The image would be fit such that the top/left corner of the raster exactly aligns with coordinate (x, y) and the bottom/right corner of the raster exactly aligns with coordinate (x+width, y+height)»;
- [SVG 2, Rendering Model](https://www.w3.org/TR/SVG2/render.html), там же, 3.4 Rendering order: «By default, elements are painted in document order: an element that appears later in the markup is painted on top of an element that appears earlier»;
- [CSS Color Adjustment Module Level 1](https://www.w3.org/TR/css-color-adjust-1/), W3C Candidate Recommendation Snapshot, 16 December 2025, 3.1: в режиме принудительных цветов «the <color> components of all properties on the element are force-adjusted to the user’s preferred color palette», а «background-image computes to none unless the original value contains a url() function». Пиксели файла картинки — не свойство, и цвета файла у картинки на листе остаются: это держит тест в Chromium;
- проба в Chrome Headless Shell 156.0.8078.4 образа через Playwright 1.64.1. PNG 3000 × 3000 из шума: новый `<image>` с адресом `blob:`, который картинка разобрала заранее, по Element Timing нарисован через 15 мс после вставки, в ближайшем кадре, а без разбора — через 105 мс, шестью колбэками `requestAnimationFrame` позже. PNG 40 × 20 из четырёх цветов в `<image preserveAspectRatio="none">` 400 × 300 лёг углами в углы, а SVG-файл растягивается так же, с `viewBox` и без него. `scrollIntoView` у бокса `visibility: hidden` прокручивает контейнер так же, как у видимого.

### 9.17. Стили под CSP

(architecture 3.3 и 3.7; R51), прочитано 2026-11-08:

- [CSSOM](https://drafts.csswg.org/cssom/), Editor’s Draft 13 October 2026, о присвоении `adoptedStyleSheets`: «If value’s constructed flag is not set, or its constructor document is not equal to this DocumentOrShadowRoot’s node document, throw a "NotAllowedError" DOMException»;
- [DOM Standard](https://dom.spec.whatwg.org/), Living Standard — Last Updated 4 November 2026, «To adopt a node node into a document document»: шаг для теневого корня меняет его документ и реестр пользовательских элементов, а о листах `adoptedStyleSheets` не говорит ничего;
- [Content Security Policy Level 3](https://w3c.github.io/webappsec-csp/), Editor’s Draft 27 October 2026, `style-src`: «The following CSS algorithms are gated on the unsafe-eval source expression» — списком: insert a CSS rule, parse a CSS rule, parse a CSS declaration block, parse a group of selectors; — «This would include, for example, all invocations of CSSOM’s various cssText setters and insertRule methods» и тут же «This needs to be better explained», с отсылкой к issue #212 `w3c/webappsec-csp`. А `style-src-elem` «governs the behaviour of styles except for styles defined in inline attributes»;
- [app](https://github.com/altnovatrail/app/tree/375a09b), ветка `main`, коммит 375a09b, RUN.md, Д9: «Не проверено: … что `style-src` не блокирует `adoptedStyleSheets` и `element.style` канвы (вторая поправка 2026-11-02 к R36 spec)»;
- проба в Chrome Headless Shell 156.0.8078.4 образа через Playwright 1.64.1. Под политикой `default-src 'none'; style-src 'self'; img-src blob:` в `<meta>` кадра `<style>` в теневом корне заблокирован — событие `securitypolicyviolation` с `style-src-elem` и адресом `inline`, у хоста `display: inline`, — а лист из `replaceSync()`, присвоения свойствам `style` и картинки `blob:` работают без событий. Элемент, перенесённый в iframe того же origin, остаётся с пустым `adoptedStyleSheets` и без стилей — и там, и после возврата, — пока лист ему не даст `adoptedCallback()`.

### 9.18. Масштаб листа

(architecture 3.2 и 3.3; R73; T94), прочитано 2026-11-11, текст страниц — `curl`:

- [Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), обновлено 06 September 2026: «Content satisfies the success criterion if it can be scaled up to 200% using at least one text scaling mechanism supported by user agents»; «it should still be possible to get 200% text enlargement in some way compared to the default 100% zoom»; среди достаточных техник — G142 и G178;
- [G178](https://www.w3.org/WAI/WCAG22/Techniques/general/G178), «Providing controls on the web page that allow users to incrementally change the size of all text on the page up to 200 percent», обновлено 24 September 2025, техника к 1.4.4 (Sufficient): «The purpose of this technique is to provide a mechanism on the web page to incrementally increase the size of text».

### 9.19. Строка в низком окне, фокус и движение

(architecture 3.3; R28, R33; T92), прочитано 2026-11-11:

- [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), обновлено 04 October 2026: 320 CSS px — «a starting viewport width of 1280 CSS pixels wide at 400% zoom», а 256 CSS px — «a starting viewport height of 1024 CSS pixels at 400% zoom»; о липких панелях — «It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user»; двумерную раскладку критерий разрешает и «interfaces where it is necessary to keep toolbars in view while manipulating content»;
- [C34](https://www.w3.org/WAI/WCAG22/Techniques/css/C34), «Using media queries to un-fixing sticky headers / footers», обновлено 12 January 2026, техника к 1.4.10 (Advisory): «The objective of this technique is to be able to present content with sticky headers and footers when there is enough space». В её примере шапка высотой `min-height: 130px` липнет только в окне `@media (min-height: 480px)`;
- [Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), обновлено 15 June 2026: «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content»; «Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs»; провал — F110, «due to a sticky footer or header completely hiding focused elements»;
- [Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), обновлено 04 October 2026: «Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible»;
- [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), обновлено 04 October 2026: части интерфейса и их состояния «have a contrast ratio of at least 3:1 against adjacent color(s)», а «the visual focus indicator for a component must have sufficient contrast against the adjacent background when the component is focused»;
- [Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), обновлено 16 September 2025: «Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed», а о прокрутке — «Moving new content into the viewport is essential for scrolling».

### 9.20. Объявленные несоответствия

(architecture 3.10; R74; T95), прочитано 2026-11-11, текст страниц — `curl`:

- [Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), обновлено 01 October 2025: критерий — «In content implemented using markup languages that support the following text style properties, no loss of content or functionality occurs by setting all of the following and by changing no other style property»; «The author requirement is both to not interfere with a user's ability to override the author settings, and to ensure that content thus modified does not break content»; «Content does not fail this SC if the method chosen by the user - for instance, the use of an extension or bookmarklet - fails to correctly set the line height and spacing text properties on the content (provided that the content is not actively and purposely preventing the properties from being added)»;
- [Understanding 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html), обновлено 04 October 2026: критерий — «The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular of the immediately surrounding text»;
- [Understanding 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), обновлено 04 October 2026: исключение — «except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints»; «For example, if using handwriting to enter text, the input technique (handwriting) requires path-dependent input but the underlying function (text input) does not»; «Free hand drawing, or watercolor painting require path dependent input»;
- проба в Chrome Headless Shell 156.0.8078.4 образа через Playwright 1.64.1, на странице `just demo` шириной 414 CSS px: правила закладки Text Spacing — `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em` с `!important` у каждого элемента и `margin-bottom: 2em` у абзаца — сначала стилем документа, а затем ещё и таблицей в теневом корне элемента, вместо стиля пользователя. Стиль документа доходит до условия наследованием — `letter-spacing` 1,92 px, — а до печати тетради нет: у её текста — `normal`. Таблица в теневом корне даёт печати 3,6 px, но ширины первых трёх кусков остаются в пределах трети единицы: 24, 41 и 57 единиц листа против 24, 41 и 57,34 без интервалов, — их держит `textLength`. Ни одна подпись восьми кнопок строки не вышла за свою кнопку — ни на листе, ни на тетради.
