# canvas — sources

> The external facts that the documents of `docs/` of this repository rest on: a provider's terms, a price, a law, a standard, the documentation of a library or of another program, the texts of MathTrail and of other NovaTrail repositories. Here are their records — the address, the version or the date of the page, the date read and the quote in the language of the source, — and [architecture.md](architecture.md) holds the claim and a reference to the record by its number, as to a section: `sources 1.1` (RULES.md, The bar; R143 spec). The quotes that an entry of the decision log gives itself stay in the entry: a decision is not rewritten.
>
> A record is a subsection "N.M" of a topic: one source, or one reading of several sources for the sake of one decision. In brackets at its start are the sections of [architecture.md](architecture.md) and the decisions that rest on it. The number of a record does not change: a new one goes at the end of its topic, a new topic at the end of the file. A source read again is an item with its own date in the same record, and the earlier text is not edited: the decisions of its day rest on it. The model is sources spec. The results of measurements and probes are not here but in [measurements.md](measurements.md).
>
> Until T110 the records stood in architecture 4, under the same headings. A pointer stayed there: the decision log and the archives of `docs/plan/` refer to that section, and they are not rewritten (RUN.md, T110).

## 1. MathTrail, the prototype and the research

### 1.1. MathTrail Canvas

[mathtrail/canvas-api](https://github.com/mathtrail/canvas-api/tree/0901af0), branch `main`, commit 0901af0, read 2026-10-19:

- R15 canvas-api (architecture 2.2): «Координаты хранятся в логической системе страницы. Страница имеет фиксированную ширину, ось y направлена вниз, масштаб одинаков по обеим осям. Нормализация 0..1000 появляется только на границе с Gemini»; by the 2026-10-11 amendment the strokes are kept on the device, «но тоже в логических единицах»;
- spec 4 canvas-api (architecture 2.2): «Лист черновика | 1000 × 1400 единиц, клетка — 50 единиц»; on the picture for checking — «масштаб фиксированный: одна единица — один пиксель» and «на картинке только штрихи ребёнка: без условия, подписи единиц, рамок подсказок и клетки»; the sizes are «константы протокола». Above the section is a note, «Раздел переписывает T67», and T67 «Лист: геометрия, картинка, рамка» in table 1 of its RUN.md is `[ ]`;
- R43 canvas-api (architecture 2.2): «Разбор черновика возвращает `box_2d` в долях 0..1000 картинки черновика. Сервер переводит его в логические единицы листа и пропускает только годный»; «Клиент берёт штрихи, которые были на листе в момент Check и у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц»;
- spec 4.1, 4.2 and 4.4 canvas-api, read again 2026-10-21 (architecture 3.2): «Каждое вписывается по ширине своей области на экране»; the formulas `scale = ширина_области_px / ширина_в_единицах` and `x_px = (x − viewport.x) × scale`; «Лист, который не помещается по высоте, прокручивается: `viewport` — его видимая часть»; «Координаты вне листа или поля прижимает к краю»; «Клиент всегда получает **логические** прямоугольники `{x, y, w, h}`»;
- spec 3.1 canvas-api (architecture 2.1): «Холст | konva + react-konva | 10.7.x / 19.3.x | лист — слои записи (DrawingLayer) и подсказок (HintLayer)…»; «Ввод — Pointer Events. `pointerType` отличает перо от пальца, `pressure` даёт нажим. Нажим меняет только толщину линии на экране; в картинки проверки он не попадает»; on rejecting the palm — «как только в сессии впервые встретилось перо, холст переходит в „режим пера“: касания пальцем и ладонью больше не рисуют» and «Касания с большой площадью (`width` или `height` больше 30 px) отбрасываются как ладонь». In `web/package.json` of the same commit the dependencies are only `react` and `react-dom` 19.3.0 — neither `konva` nor `react-konva`;
- R13 canvas-api (architecture 2.1): «Клиент на React и Konva живёт в этом же репозитории, в `web/`. — Почему: API и клиент меняются вместе, одним pull request». It is the only decision of canvas-api's log that names Konva;
- R65 canvas-api (architecture 2.4): «Разметка автора ставится до отправки и при письме, а не задним числом по рамке модели: так она не подстраивается под ответ модели»;
- R66 canvas-api (architecture 2.4): the author's log «хранит и штрихи как есть — точки со временем, тип указателя, нажим и наклон». T77 «Исследование: PNG или векторы» in table 1 of its RUN.md is `[ ]`.
- read again 2026-10-21 (architecture 3.6): R26 canvas-api — «Согласие родителя подтверждает оператор, а не клиент», «`POST /v1/me/consent` только отмечает, что уведомление прочитано: статус `pending`» and «До `verified` профили детей и холсты не создаются»; П-5 canvas-api — «отметка 18+ при согласии и VPC-метод»; in `docs/plan/E2-draft.md`, T50, — «уведомление о данных для согласия — с номером версии, который пишется в `consent_version`».

### 1.2. MathTrail standalone

[mathtrail/mathtrail-standalone](https://github.com/mathtrail/mathtrail-standalone/tree/c6cbeb2), branch `main`, commit c6cbeb2, read 2026-10-19 (architecture 2.1):

- R269 standalone, "Rejected": "Konva and other canvas libraries. A canvas is one element a screen reader cannot read, and a change of theme means drawing it again. … Mafs and react-konva need React";
- `docs/widget-drawings.md`, the table "What to draw with", by the data of npm and bundlephobia on 2026-10-08: "Konva 10.7.1 | MIT | 186.7 / 55.6 KB" (min / gzip); "react-konva 19.3.0 | MIT | 143.2 / 44.5 KB + React | … | Needs React's reconciler".

### 1.3. The prototype `spec/draft/`

(architecture 2.1) — `NovaTrail Widget.html` at the tag v0.1.0 of `spec`, read 2026-10-19: the sheet is a `<canvas>` element with `getContext('2d')`, and the eraser draws with `globalCompositeOperation = 'destination-out'`, that is, it erases pixels. "Where it differs from the documents in docs/, the documents win" (`spec/draft/README.md`). At the tag v0.2.13 the file is the same, read 2026-10-21 (architecture 3.1): the sheet is built of elements of the page — a dashed SVG sketch lies under the canvas element, the canvas element has `touch-action:none`, the tutor's box is SVG over it with `pointer-events:none`, and the numbers and the caption are `div` elements.

### 1.4. The research «Рукопись ребёнка на канве и ИИ-наставник»

[artifact](https://claude.ai/artifact/QLH6WzmmQs4MY5NvjMxb1D), the report `files/child-handwriting.md`, version 1792539580-561a, of 2026-10-20, read 2026-10-21 (architecture 2.1, 2.2 and 2.4). It is not in the NovaTrail repositories, the author has access to the artifact, and what the documents of `canvas` rest on is quoted below. It is not a decision: «Не решение: решения по нему принимает эпик E6 в RUN.md, а пока они не приняты, действуют документы и журнал решений». Which RUN.md that is, the research does not say: the RUN.md of `spec` at the tag v0.2.12 has no epics after E5, and this one has none after E2. Its items are cited by its own labels — A3, A6, C1. Its «метка» is both the group label of a stroke group (A, B, C) and a mark of the tutor's layer; in the documents of `canvas` the second is «пометка», a mark, as in concepts 8 spec:

- A3: «Канва вида «лист для рукописи» экспортирует только чернила, без сетки и текста задачи, обрезает по рамке работы с полем 12 px и масштабирует так, чтобы медианная высота группы штрихов была ≈32 px»; «Высота цифры — настройка канвы модуля»;
- A4: «Риск по возрастанию: (a) картинка < (b) картинка и грубые признаки процесса < (d) стёртое ≤ (c) сырые штрихи с временем и нажимом»;
- A6: «Метки рисует сервер в памяти запроса по рамкам групп, которые прислало устройство»; the digit heights for eval are «16, 24, 32 и 48 px»; in the summary — «история письма — только условие eval»;
- C1: «(c) для всего, что касается ячейки ответа; (b) для места в черновике; (a) — только если (b) и (c) пусты, и только после притяжки к штрихам. Ничто не сошлось со штрихами — рамки нет»; «Метки — на полях с тонкими выносками, не поверх чернил; чтение всегда получает чистую картинку»; «Рамки групп финального состояния выводимы из самой картинки и не несут времени». Among the measurements for C is «Чтение с метками и без — не портят ли метки чтение (A/B: чистая, размеченная, пара)»;
- C2: «Каждая метка слоя наставника хранит `{stroke_ids, snapped_box}` и рисуется каждый кадр из текущей геометрии этих штрихов; новые штрихи её не двигают; стёрты все её штрихи — метка исчезает»; «Рамка модели переводится в координаты листа по соглашению поставщика, обрезается границами, и берутся штрихи, точки которых в основном внутри (поля и порог — параметры eval); рамка притягивается к их общему прямоугольнику»; «Метки ссылаются на таблицу «метка → ID штрихов», действительную только для своей отправки. `snapped_box` нужен только эскизу «как начать» на пустом месте»;
- H3: «ластик удаляет штрихи целиком, и вырезка рисуется только из видимых — стёртого на картинке нет»; «пустой лист отсекается программой до вызова (R62 canvas-api)»;
- F2: «Текст несёт якоря меток из закрытого набора, который выдаёт сервер (`[[mark:A]]`)»; «каждый кусок — отдельное высказывание, метка появляется на его событии `start`»;
- «И22», an open question of the research: «Как указывать место: размеченная копия, пара «чистая + размеченная», рамки», the recommendation — «A/B по поставщикам до фиксации полей места в схеме наблюдения»;
- on R09 spec, in item 3 «Решения, которые стоит пересмотреть»: «Уточнить, что запрос проверки, кроме картинки, может нести (а) рамки групп штрихов финального состояния и (б) токен прошлой проверки»;
- the synthetic example: «Рамки — `[ymin, xmin, ymax, xmax]` в долях 0–1000 вырезки (внутреннее соглашение; адаптер каждого поставщика переводит в своё)», and `sheet_box` — «где вырезка лежит на листе, в том же порядке `[ymin, xmin, ymax, xmax]`, но в логических координатах листа (здесь 312 × 378, как сама вырезка); по нему устройство возвращает рамки на лист». The crop in the example is 378×312, that is, `sheet_box` covers it together with the margin.

### 1.5. The analysis «Базовая канва и контракт „канва ↔ агент“»

(architecture 2.5 and 3.1; the archive of E2, [docs/plan/E2.md](plan/E2.md)) — the author sent it on 2026-10-21, and it is not in the repository. It was written by a model that had seen neither the code nor the decisions NovaTrail has taken, so what is taken from it is questions, not facts. In `spec` v0.2.14 the same analysis is the source of product 14 spec and architecture 8 spec: from it come О-21, an option of О-8, Т-30, and what the widget protocol has to decide by architecture 3.4 spec (architecture 3.1). T29 in the RUN.md of `spec` takes its section 2.5 as input.

## 2. Drawing libraries

### 2.1. tldraw

(architecture 2.1) — [`LICENSE.md`](https://github.com/tldraw/tldraw/blob/e8eb1cf5635d28a2d516f0c0d823ed35f3ea9dc9/LICENSE.md), branch `main`, commit e8eb1cf; the file last changed on 2025-09-17, "License change for 4.0 (#6780)"; read 2026-10-21:

- ""Production Environment" means any production deployment of the Software that operates on servers, cloud platforms, web applications, or where the software is used to provide functionality to end users, customers, or the public";
- the conditions: "Not to use the Software in Production Environments"; "Not to disable, change, or interfere with the Software's License Key enforcement"; "Not to make the Software available under a license that supersedes or negates the effect of this License". Work in production is by a trial key or by a commercial agreement: "you are permitted to use the Software in Production Environments for the specified period". Other licenses are separate: "Alternative licenses are available from tldraw for commercial and non-commercial use"; their terms were not read;
- "The Software includes technical measures to verify License Key validity, detect deployment environments, enforce usage restrictions based on license type, and ensure proper watermark display. The Software may collect and transmit usage data to tldraw for license compliance purposes";
- in the npm registry, [`tldraw`](https://registry.npmjs.org/tldraw) is 5.5.2 of 2026-10-02, `"license": "SEE LICENSE IN LICENSE.md"`; GitHub's API determines the repository's license as `NOASSERTION`.

### 2.2. tldraw Agent starter kit

(architecture 2.1) — [`templates/agent`](https://github.com/tldraw/tldraw/tree/e8eb1cf5635d28a2d516f0c0d823ed35f3ea9dc9/templates/agent), the same commit, read 2026-10-21: its `LICENSE.md` is "MIT License … Copyright (c) 2024 tldraw Inc."; `package.json` has the dependencies `tldraw`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai` and `@google/generative-ai`; the README — "This starter kit demonstrates how to build an agent that can manipulate the tldraw canvas", and among the agent's actions are "Create, update and delete shapes" and "Draw freehand pen strokes".

### 2.3. The npm registry

(architecture 2.1), read 2026-10-21: [`konva`](https://registry.npmjs.org/konva) — 10.9.0 of 2026-10-15, MIT, no dependencies; [`perfect-freehand`](https://registry.npmjs.org/perfect-freehand) — 1.2.3 of 2026-02-01, MIT, no dependencies; [`rbush`](https://registry.npmjs.org/rbush) — 4.0.1 of 2024-08-21, MIT, one dependency — `quickselect` `^3.0.0`, and [`quickselect`](https://registry.npmjs.org/quickselect) 3.0.0 is ISC.

### 2.4. Konva

(architecture 2.1 and 3.1) — the documentation [konvajs/site](https://github.com/konvajs/site/tree/04f3b66143ef9733662c8b2d86c6be61b2827a7b), commit 04f3b66 "Update to konva 10.9.0: batch updates docs" of 2026-10-15, and the package [konvajs/konva](https://github.com/konvajs/konva/tree/d95eed6d46e785efba6ab5e9eaf5a1d6bbb528c6), tag 10.9.0, commit d95eed6; read 2026-10-21:

- `content/docs/overview.md`: "Each layer has two `<canvas>` renderers: a scene renderer and a hit graph renderer";
- the README of [react-konva-utils](https://github.com/konvajs/react-konva-utils/blob/15b6009acbaf37c913c722a460664e1c2c98e3af/README.md), commit 15b6009: "Konva is a canvas library. It can't render DOM elements directly. `<Html>` creates an absolutely positioned div over the canvas";
- `content/docs/posts/Canvas_vs_SVG.mdx`: "Konva does not create accessible DOM elements for canvas shapes. Keep essential controls and content in HTML";
- `content/docs/sandbox/Free_Drawing.mdx`: the eraser draws a line with `globalCompositeOperation` `'destination-out'`, and the demo removes no strokes;
- `content/api/Konva.Node.mdx`: the handler gets "`evt` as native browser event"; the words `pressure` and `getCoalescedEvents` are not in the documentation of this commit;
- the package's README: "In order to run `konva` in nodejs environment you also need to install `canvas` or `skia-canvas` package manually for rendering backend".

### 2.5. perfect-freehand

(architecture 3.1) — [README](https://github.com/steveruizok/perfect-freehand/blob/f56f097e0e211fffa1601b93883e4d9f9dccf122/packages/perfect-freehand/README.md), tag v1.2.3, commit f56f097, read 2026-10-21: "The `getStroke` function will return a new array of outline points. These outline points will form a polygon (called a "stroke") that surrounds the input points"; "To use real pressure, such as that from a pen or stylus, provide the pressure as the third number for each input point, and set the `simulatePressure` option to `false`". The README suggests passing the path of the outline to `Path2D`.

### 2.6. rbush

(architecture 3.1) — [README](https://github.com/mourner/rbush/blob/c3f6ad06f1e47ccec58998461f3383aa90066ecd/README.md), tag v4.0.1, commit c3f6ad0, read 2026-10-21: "RBush is a high-performance JavaScript library for 2D spatial indexing of points and rectangles"; the search "Returns an array of data items (points or rectangles) that the given bounding box intersects"; "RBush v4+ is published as a ES module and no longer supports CommonJS environments". The package 4.0.1 on jsdelivr holds `index.js`, `rbush.js`, `rbush.min.js`, the README and LICENSE, with no file of types; `@types/rbush` 4.0.0 in the npm registry is MIT.

### 2.7. Other drawing libraries

(architecture 2.1) — the npm registry and the sources at the tags, read 2026-10-21:

- Fabric.js 7.4.0 of 2026-05-18, MIT. No pressure: asked about the width along a stroke, the maintainer answered "no it does not, that would need a special class, derived from path probably" ([#4885](https://github.com/fabricjs/fabric.js/issues/4885#issuecomment-378188602)). The eraser is moved out to [`@erase2d/fabric`](https://github.com/ShaMan123/erase2d) 1.2.2: it draws a path with `destination-out` and changes the clip path of the object being erased. In Node — "Fabric.js depends on node-canvas for a canvas implementation (`HTMLCanvasElement` replacement) and jsdom for a `window` implementation on node" ([README](https://github.com/fabricjs/fabric.js/blob/v740/README.md));
- Paper.js 0.14.0 of 2026-10-19, MIT. After 0.12.18 of 2024-07-17 the next release is 0.12.19 of 2026-10-18; the word "pressure" is not in `dist/paper-full.js`. In Node — "Paper.js relies on Node-Canvas for rendering, which in turn relies on the native libraries Cairo and Pango" ([README](https://github.com/paperjs/paper.js/blob/v0.14.0/README.md));
- PixiJS 8.22.0 of 2026-10-01, MIT: it draws with WebGL, WebGPU or a canvas, the eraser is the blend `erase`, and [accessibility](https://pixijs.com/8.x/guides/components/accessibility) is "PixiJS includes built-in accessibility support through a DOM-based overlay system". Pressure is the field `pressure` of `FederatedPointerEvent`: "Pressure applied by the pointing device during the event" ([source](https://github.com/pixijs/pixijs/blob/v8.22.0/src/events/FederatedPointerEvent.ts));
- Two.js 0.8.24 of 2026-08-29, MIT: "renderer agnostic enabling the same api to render in multiple contexts: webgl, canvas2d, and svg" ([README](https://github.com/jonobr1/two.js/blob/v0.8.24/README.md)); the build has no input handlers;
- Excalidraw 0.18.1 of 2026-04-20, MIT: 31 dependencies, peer `react` and `react-dom` `^17.0.2 || ^18.2.0 || ^19.0.0`; the eraser marks an element deleted whole. A freehand stroke has `pressures: readonly number[]` ([`element/types.ts`](https://github.com/excalidraw/excalidraw/blob/v0.18.1/packages/excalidraw/element/types.ts)), and it is drawn by `getStroke` of perfect-freehand ([`renderer/renderElement.ts`](https://github.com/excalidraw/excalidraw/blob/v0.18.1/packages/excalidraw/renderer/renderElement.ts)); "Since Excalidraw doesn't support server side rendering so it should be rendered only on client" ([documentation](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration));
- tldraw 5.5.2: peer `react` and `react-dom` `^18.2.0 || ^19.2.1`; the license — the record "tldraw" above;
- signature_pad 5.1.4 of 2026-07-31 and Atrament 5.1.0 of 2025-09-26, both MIT: the eraser is `destination-out`. signature_pad — "It's HTML5 canvas based and uses variable width Bézier curve interpolation" ([README](https://github.com/szimek/signature_pad/blob/v5.1.4/README.md)), and its width depends on the speed alone. Atrament — "Atrament does not store the stroke paths itself - instead, it draws directly onto the canvas bitmap" ([README](https://github.com/jakubfiala/atrament/blob/v5.1.0/README.md)), and outside a browser it throws an error;
- drauu 1.0.0 of 2026-01-13, MIT: "SVG-based drawing tool in browser" ([README](https://github.com/antfu/drauu/blob/v1.0.0/README.md)); the eraser removes an SVG path whole, and inside it is perfect-freehand 1.2.2.

The size in section 2.1 is the main file of the build from jsdelivr, compressed by `gzip -9`, 2026-10-21, in bytes: `konva.min.js` — 58,317; perfect-freehand `dist/esm/index.mjs` — 1,999; `rbush.min.js` with `quickselect` inside — 2,327; fabric `dist/index.min.mjs` — 91,558; `paper-core.min.js` — 74,297; `pixi.min.mjs` — 236,793; `two.min.js` — 49,680; Excalidraw `dist/prod/index.js` — 154,698; `signature_pad.min.js` — 4,660; Atrament `dist/esm/index.js` — 2,601; `@drauu/core` `dist/index.mjs` without minification — 8,096.

## 3. The browser's platform

### 3.1. The browser's platform

(architecture 3.1), read 2026-10-21:

- [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/), a W3C Recommendation of 30 June 2026. On `pressure`: "For hardware and platforms that do not support pressure, the value MUST be 0.5 when in the active buttons state and 0 otherwise". On `width` and `height`: "in cases where the actual geometry of the input is not detected by the hardware, the user agent MUST return a default value of 1". On palm rejection by the device: "Currently, it is not possible for authors to suppress this behavior", and `pointercancel` comes when "The user agent interprets the input as accidental (for example, the hardware supports palm rejection)". `getCoalescedEvents()` is declared with `[SecureContext]`. On an iframe: "Note touch-action does not apply/cascade through to embedded browsing contexts", and MDN, [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): "Each embedded browsing context has its own document and allows URL navigations";
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.6/api/PointerEvent.json), release v8.1.6: `getCoalescedEvents` is in Safari and Safari on iOS since 18.2, and for Firefox for Android — "The method always returns an empty array, regardless of the user's actions"; `pressure` is in Safari since 13, `altitudeAngle` since 18.2;
- WebKit, [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/), 2024-07-16: "Safari injects noise into various APIs: namely, during 2D canvas and WebGL readback, and when reading AudioBuffer samples using WebAudio"; "The amount of noise injected is extremely small, and (mostly) should not result in observable differences or artifacts". Apple, [iOS 26](https://www.apple.com/newsroom/2025/06/apple-elevates-the-iphone-experience-with-ios-26/), 2025-06-09: "Browsing in Safari gets even more private with advanced fingerprinting protection extending to all browsing by default". Whether in ordinary browsing noise is put into any canvas, or only into reading by known tracking scripts, is not checked;
- Firefox, the release notes of [120](https://www.firefox.com/en-US/firefox/120.0/releasenotes/): "Firefox’s private windows and ETP-Strict privacy configuration now enhance the Canvas APIs with Fingerprinting Protection"; of [151](https://www.firefox.com/en-US/firefox/151.0/releasenotes/): "Firefox now strengthens protection against fingerprinting in Standard Enhanced Tracking Protection". In [`RFPTargetsDefaultBaseline.inc`](https://github.com/mozilla-firefox/firefox/blob/cc4ebb2adcb7/toolkit/components/resistfingerprinting/RFPTargetsDefaultBaseline.inc) of the branch `release`, version 158.0.2, — `DESKTOP_DEFAULT(EfficientCanvasRandomization)`, and for Android only under `#ifdef NIGHTLY_BUILD`;
- Brave, [Fingerprinting defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/), 2020-05-18: "The default setting for farbling-based fingerprinting is to add small amounts of randomness to semi-identifying endpoints"; the table of these APIs has `toDataURL`, `toBlob` and `getImageData`;
- [HTML Standard, canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026: "Authors should not use the canvas element in a document when a more suitable element is available". On serialization "User agents must support PNG ("image/png")", and the section has no rules on the bytes of the file themselves — compression, filters, ancillary chunks. The mode `desynchronized` belongs to the canvas context: "the user agent may optimize the rendering of the canvas to reduce the latency";
- MDN, [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): "Canvas content is not exposed to accessibility tools like semantic HTML is"; MDN, [`<title>` in SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/title): "The `<title>` SVG element provides an accessible, short-text description of any SVG container element or graphics element";
- WebKit, bug [269535](https://bugs.webkit.org/show_bug.cgi?id=269535) "Canva: No pointer events from Apple Pencil while touch present" — status NEW.

### 3.2. The page's coordinates

(architecture 3.2) — MDN, read 2026-10-21:

- [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio): "returns the ratio of the resolution in physical pixels to the resolution in CSS pixels for the current display device";
- [`viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox): "The viewBox attribute defines the position and dimension, in user space, of an SVG viewport";
- [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect): "providing information about the size of an element and its position relative to the viewport";
- [`clientX`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX): "the horizontal coordinate within the application's viewport at which the event occurred".

### 3.3. Web components

(architecture 2.3 and 3.3), read 2026-10-21:

- React 19:
  - [the blog](https://react.dev/blog/2024/12/05/react-19#support-for-custom-elements): "React 19 adds full support for custom elements and passes all tests on Custom Elements Everywhere"; "props that match a property on the Custom Element instance will be assigned as properties, otherwise they will be assigned as attributes";
  - [the reference](https://react.dev/reference/react-dom/components#custom-html-elements): "React will, however, recognize an custom element's property as one that it may pass arbitrary values to if the property name shows up on the class during construction"; "You can listen for these events using an `on` prefix when binding to the event via JSX"; "Events are case-sensitive and support dashes (`-`)";
  - [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript): "You'll now need to wrap module augmentation of the JSX namespace in `declare module "....":`", and the example has `declare module "react"`;
  - the sources — the tag [v19.3.1](https://github.com/facebook/react/tree/v19.3.1), the last release of React 19, commit `61aa00df822d0eb76d0362eb8b6fdd3527693efe`, read 2026-11-01 (T59; R42); the code in the quotes is brought into one line. [`ReactDOMComponent.js`](https://github.com/facebook/react/blob/v19.3.1/packages/react-dom-bindings/src/client/ReactDOMComponent.js), lines 1961–1976: for a custom element, React passes a property that the new render lacks on as `undefined` — "`!nextProps.hasOwnProperty(propKey)`" and then "`setPropOnCustomElement(domElement, tag, propKey, undefined, nextProps, lastProp)`". Lines 1979–1986: the changed properties come after the removed ones, in the order of `for (const propKey in nextProps)`, if "`nextProp !== lastProp && (nextProp !== undefined || lastProp !== undefined)`". Lines 1463–1471: on mounting, also in the order of the properties, and "`if (propValue === undefined) { continue; }`". [`DOMPropertyOperations.js`](https://github.com/facebook/react/blob/v19.3.1/packages/react-dom-bindings/src/client/DOMPropertyOperations.js), lines 231–232: "`if (name in (node as any)) { (node as any)[name] = value;`" — a property if the element knows it, and an attribute otherwise. So React writes `null` into a property only if the consumer wrote it, and before the element is registered the value goes into an attribute;
- Preact, [Web Components](https://preactjs.com/guide/v10/web-components/): "Preact fully supports Web Components"; "When a Custom Element defines a setter for a given property, Preact detects its existence and will use the setter instead of an attribute"; on events — "unrecognized event handler props passed to a DOM Element are registered using their casing exactly as specified";
- TypeScript, [DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html): "The map interface contains every specified HTML tag name and its corresponding type interface" — this is `HTMLElementTagNameMap`, by which `createElement` and `querySelector` infer the type of the element;
- MDN:
  - [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM): "the styles defined in the shadow DOM tree are scoped to that tree, so just as page styles don't affect elements in the shadow DOM, shadow DOM styles don't affect elements in the rest of the page"; "Language and text directionality, set using lang and dir, are generally inherited from an element's parent node. When that parent is a shadow root, they are inherited from the shadow host instead";
  - [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties): "A custom property defined using two dashes -- instead of @property always inherits the value of its parent"; the fallback values of `var()` are "useful when working with Custom Elements and Shadow DOM";
  - [`Event()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event): of `bubbles` — "The default is false"; `composed` — "A boolean value indicating whether the event will trigger listeners outside of a shadow root";
  - [Reflected attributes](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Reflected_attributes): "Attribute element references can only refer to other elements that are in the same DOM or Shadow DOM, because element ids are only valid in the scope in which they are declared";
  - [Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements): "every custom element name you register must be globally unique across the entire page";
- HTML Standard, [custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html), Last Updated 20 October 2026: if the registry already has a definition with the same name, `define` must "throw a "NotSupportedError" DOMException";
- WICG, [Reference Target](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/reference-target-explainer.md): "The motivating goal of this feature is to enable ARIA relationship attributes to work across shadow root boundaries". Whether it has shipped in browsers was not checked.

### 3.4. The Apple Developer forum

(architecture 2.4; T29 in [RUN.md](../RUN.md)) — [thread 710001](https://developer.apple.com/forums/thread/710001), July 2022, read 2026-10-21. It is a user's post, not Apple's documentation, and it was written before iPadOS 26: "Apple at some point disabled the ability to open local files in Safari", and the Files app shows HTML "with only the internal text and internal header contained CSS styling". The thread says nothing of scripts. It is a lead for the probe of T29, not a fact.

### 3.5. HTML Standard

(architecture 2.5) — [6.8 Editing](https://html.spec.whatwg.org/multipage/interaction.html#editing-2), Last Updated 20 October 2026, read 2026-10-21:

- [`autocorrect`](https://html.spec.whatwg.org/multipage/interaction.html#attr-autocorrect), the state `off`: "The user agent is not allowed to automatically correct spelling while the user types"; "The attribute's invalid value default, missing value default, and empty value default are all the On state";
- [`spellcheck`](https://html.spec.whatwg.org/multipage/interaction.html#spelling-and-grammar-checking), the state `false`: "Spelling and grammar will not be checked"; "If the checking is enabled for a word/sentence/text, the user agent should indicate spelling and grammar errors in that text"; "This specification does not define the user interface for spelling and grammar checkers". In the order by which the browser decides whether to check a text, the user's choice comes before the attribute: "Otherwise, if the user has forced the checking for this text to always be enabled, then the checking is enabled";
- [`writingsuggestions`](https://html.spec.whatwg.org/multipage/interaction.html#attr-writingsuggestions), the state `false`: "Writing suggestions should not be offered on this element";
- [`autocapitalize`](https://html.spec.whatwg.org/multipage/interaction.html#autocapitalization): "User agents or input methods may choose to ignore or override the used autocapitalization hint in certain circumstances"; "the attribute must not be relied on for any sort of input validation".

### 3.6. Browsers and a page from a file

(architecture 2.4 and 3.6; T29 in [RUN.md](../RUN.md)), read 2026-10-22. These are findings of the planning of T29, which was then put off (R17): there were no probes on devices yet. The sources of the engines are at tags: Chromium 156.0.8078.47 — [chromium/src](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/), Firefox 158.0.1 — [mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox/tree/FIREFOX_158_0_1_RELEASE), WebKit — [WebKit/WebKit](https://github.com/WebKit/WebKit/tree/WebKit-7625.1.29.18.27):

- **GitHub**, the headers first-hand, `curl -sIL`, 2026-10-22, 01:14–01:17 UTC:
  - `report-7.0.11.html` of the release v0.4 of `adamws/kicad-via-patterns`, which has `content_type: text/html` in the API, comes through a 302 to `release-assets.githubusercontent.com`, and there it is `content-type: application/octet-stream` and `content-disposition: attachment; filename=report-7.0.11.html`. The same holds for three more `.html` files from releases. GitHub's documentation does not promise this;
  - raw.githubusercontent.com and gist.githubusercontent.com serve HTML as `text/plain; charset=utf-8`, with `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` and `x-content-type-options: nosniff`;
  - GitHub Pages: "When a GitHub Pages site is visited, the visitor's IP address is logged and stored for security purposes, regardless of whether the visitor has signed into GitHub or not" ([What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection), github/docs 5815d11);
- **a secure context**:
  - [Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/): "If origin's scheme is "file", return "Potentially Trustworthy"". The engines do the same: in Chromium — `net/base/is_potentially_trustworthy.cc`, in Firefox — `URI_IS_POTENTIALLY_TRUSTWORTHY` of the protocol `file` in `netwerk/build/components.conf`, in WebKit — `page/SecurityOrigin.cpp`;
  - `getCoalescedEvents()` is `[SecureContext]` in [Pointer Events](https://w3c.github.io/pointerevents/), in Chromium (`pointer_event.idl`) and in WebKit (`PointerEvent.idl`), and in Firefox it is held by the same check, `nsContentUtils::IsSecureContextOrWebExtension`;
- **storage on `file:`**:
  - Chromium: "'file' URLs all parse as ("file", "", 0)" (`url/origin.h`) and "file: origins all serialize to "file://"" — all pages from `file:` share one storage, and "file:// URLs should become unique opaque origins at some point" (`url/origin_unittest.cc`);
  - Firefox — one per file: `security.fileuri.strict_origin_policy` is `true` (`StaticPrefList.yaml`; `caps/tests/unit/test_origin.js`);
  - WebKit — only while the host application keeps `needsStorageAccessFromFileURLsQuirk` on, and what Safari does is not visible;
  - MDN writes "each `file:` URL seems to have its own unique local-storage area" ([Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)) — this differs from Chromium's sources;
- **a policy in `<meta>` on `file:`** — with no exception for `file:` in Chromium (`http_equiv.cc`), Firefox (`nsCSPUtils.cpp`) and WebKit (`Document.cpp`). **`<a download>` with a blob of its own page** works in Chromium (`html_anchor_element.cc`) and Gecko (`nsContentUtils.cpp`);
- **iPadOS and Safari**:
  - "Released September 14, 2026 — 27.0 … Safari 27 is available for iOS 27, iPadOS 27" ([Safari 27 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes));
  - the Files app: "If you haven’t installed the app that created a file, a preview of the file opens in Quick Look" ([iPad User Guide](https://support.apple.com/guide/ipad/ipadb3b759ed/26/ipados/26)). The guide here and below is for iPadOS 26, and for iPadOS 27 it has not been read;
  - Safari's downloads: "iCloud Drive: Select this option to save downloads to the Downloads folder in iCloud Drive" or "On My iPad" ([Customize your Safari settings](https://support.apple.com/guide/ipad/customize-your-safari-settings-ipad54f3cde6/26/ipados/26)), and which is the default is not said;
  - whether Quick Look runs the scripts of HTML and whether Safari opens `file:`, Apple's documentation does not say. Only forums say "no": thread 710001 (2022, below) and [Apple Discussions, thread 256102223](https://discussions.apple.com/thread/256102223), July 2025, — "Quick Look is as close as you can get and it will not run JavaScript";
  - `getCoalescedEvents` since Safari 18.2: "New PointerEvent methods getPredictedEvents() and getCoalescedEvents() are now supported" ([WebKit Features in Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/)). Pointer Events with Apple Pencil since Safari 13: "Added support for the Pointer Events API enabling consistent access to mouse, trackpad, touch, and Apple Pencil events" ([Safari 13 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-13-release-notes)). The pen comes as `pen` with pressure: `TouchType::Stylus ? penPointerEventType() : touchPointerEventType()` and `m_pressure(event.forceAtIndex(index))` (`dom/ios/PointerEventIOS.cpp` of WebKit);
- **Android**:
  - Chrome opens HTML from its own downloads window itself, as `content://` in the built-in viewer (`DownloadUtils.java`, `MediaViewerUtils.java`), and accepts `content://` with the type `text/html` from the Files app (`AndroidManifest.xml`);
  - a direct `file://` to the downloads it will most likely refuse: on `READ_EXTERNAL_STORAGE` — "Starting in API level 33, this permission has no effect" ([Manifest.permission](https://developer.android.com/reference/android/Manifest.permission));
  - that scripts run there is not confirmed, and on Samsung Internet there are no primary sources;
- **Scorecard**, Signed-Releases: it looks at "the project's last five release assets" and searches them for signatures ([checks.md](https://github.com/ossf/scorecard/blob/main/docs/checks.md)).

## 4. AI providers

### 4.1. AI providers on a place in a picture

(architecture 2.2 and 3.2), read 2026-10-21:

- Anthropic, [Coordinates and bounding boxes](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates): "Claude works best with absolute pixel coordinates"; "Claude does not work well when you ask for normalized coordinates"; "The coordinates Claude returns are pixel positions in the image Claude sees: your image after Claude resizes it to fit the model's native resolution"; "Small elements lose precision when an image is downscaled";
- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision): "An image, therefore, costs `⌈width / 28⌉ × ⌈height / 28⌉` visual tokens"; "Images larger than either limit are downscaled before processing". In the table of limits, "Max long edge" is "2576 px" for "Claude 4.7 and later models" and "1568 px" for "All other models". "Claude's coordinate and localization outputs are approximate";
- OpenAI, [Images and vision](https://developers.openai.com/api/docs/guides/images-vision): "patch_count = ceil(width/32)×ceil(height/32)"; "For coordinate-sensitive tasks, resize images to fit those limits before sending them and map returned coordinates back to the original image"; "The model struggles with tasks requiring precise spatial localization". For `gpt-6-astra` at `high` — "up to 2,500 patches", and the page gives no format of a box;
- Google, [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding), Last updated 2026-09-23: "The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000"; "You need to descale these coordinates based on your original image size". Google's models are here only for reference: `tutor` removed them from the measurement (the record `tutor` below).

## 5. NovaTrail repositories

### 5.1. app and skill-map

(architecture 2.3), read 2026-10-21:

- [altnovatrail/app](https://github.com/altnovatrail/app/tree/7a96676), commit 7a96676: T01 «Фреймворк и сборка» in table 1 of its RUN.md is `[ ]`. It decides «как сборка подключает рабочие копии пакетов при разработке, а в релиз берёт точные версии», and names no package manager (architecture 3.4). In architecture 2.4 app — «„Прослушать“ — инструмент канвы, то есть `canvas`; один ли у них с `app` синтез речи, решается вместе со стыковкой пакетов (Т-21)». In T07 app — «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»»;
- [altnovatrail/skill-map](https://github.com/altnovatrail/skill-map/tree/0295ce8), commit 0295ce8: the recommendation of its T04 on Т-26 is «одна на `skill-map` и `canvas`», and if `canvas` works the question out earlier, T04 takes its conclusions.

### 5.2. tutor

(architecture 2.4 and 3.5) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/4394a33), branch `main`, commit 4394a33, read 2026-10-21: R04, R05 and R07 tutor; В7 in table 3 of its RUN.md — «E3 берёт формат `tutor` за основу: он проверен на замере. T04 `canvas` сверяет с ним образец страницы образцов, и когда она появится, страница записи `tutor` уходит»; its epic E2 has one task — T08 «Исследование: как дать модели ход рассуждения», not done; its goal includes «Решено и то, какие виды входа идут в замер … и что для этого пишет страница записи». At the commit [16d9cd1](https://github.com/altnovatrail/tutor/tree/16d9cd1), read 2026-10-21 (T01 in [RUN.md](../RUN.md)), — R08 tutor: «Группы для меток строятся так, как их построит устройство, — по пространству и времени, без разметки», and for the measurement «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px». At the commit [231bf8b](https://github.com/altnovatrail/tutor/tree/231bf8b), read 2026-10-21 (architecture 2.2 and 3.2):

- the analysis of the course of the solution goes «в двух вариантах» (R08 tutor), and in the second — «чистая вырезка, и модель даёт рамку в координатах своего поставщика, а раннер притягивает её к штрихам»; a hit is «Жаккар по множествам штрихов ≥ 0,5, у рамки ещё IoU ≥ 0,5»;
- in architecture 3.1 tutor — «PNG рисуется только из видимых штрихов, без сетки и текста задачи, по рамке работы с полем 12 px»;
- in table 3 of its RUN.md, «в реестр spec», — В12 tutor «Как наблюдение указывает место на канве» and В13 tutor «Высота цифр в картинке для проверки». The recommendation of В13 tutor is «настройка канвы модуля в формате модуля v0 (эпик E2 RUN.md `spec`), умолчание — из выводов E2»;
- the 2026-10-21 amendment to R06 tutor — «Google из замера убран»;
- T32 «Совместимость с `canvas`» in its RUN.md — «скачать синтетические образцы из закреплённого релиза `canvas` — точный тег и сумма sha256», and what is to be decided when it is planned is «где в релизе `canvas` лежат синтетические образцы и в каком они формате» (architecture 2.3 and 3.4).

At the same commit 231bf8b, read again 2026-10-21 (architecture 2.4 and 3.5):
- R05 tutor: the samples «хранятся в `samples/` вне git, и агенты разработки туда не заглядывают»; R07 tutor: «каждый штрих — точки со временем и нажимом, в порядке написания», «каждое стирание — со временем», and «образец, записанный без неё, её уже не вернёт»;
- T12 «Формат образца и синтетические образцы» in its RUN.md, not done: «лист — логические размеры»; «штрих — ID и точки x, y, время и нажим, в порядке написания»; «стирание — время и ID стёртых штрихов»; «разметка при письме: задача, задуманный текст каждой строки и её штрихи, нарочно неразборчивые места, сценарий и ожидаемый исход, кто писал — автор или автор, подражая детскому почерку (R08), — и то, чего требует T08»; «версия формата»; «задача и банк задач — как у задачи модуля: условие, ключ, решение по строкам, ловушки, фразы-утечки, ложные ключи». The recording page is T13, also not done;
- in architecture 3.1 tutor: «Состояния строятся из штрихов и читаются без ключа»; «Строки одного листа связаны писавшим, задачей и сценарием, поэтому граница считается „по листам“»; the height of the digits is measured «парно с 32 px на тех же строках»;
- the runner builds the groups for the labels «так, как их построит устройство: по пространству и времени, без разметки. Разметка — только эталон для места» (T22 tutor), and the PNG «только из видимых штрихов» (T21 tutor);
- В9 tutor «в реестр spec» — the consent of other adults to samples for the measurement: «образцы замера лежат вне репозиториев и уходят двум поставщикам ИИ», the recommendation is «расширить П-16», and until the text of the consent — «только образцы автора».

At the commit [57313fe](https://github.com/altnovatrail/tutor/tree/57313fe), read 2026-10-21 (architecture 3.6): В9 tutor is the same — «до него — только образцы автора»; the 2026-10-21 amendment to R06 tutor — «Замер идёт у двух поставщиков, Anthropic и OpenAI, на четырёх моделях».

### 5.3. spec at the tag v0.2.12

(architecture 2.2 and 2.4) — [altnovatrail/spec](https://github.com/altnovatrail/spec/tree/v0.2.12), commit b721be9, the release is immutable, read 2026-10-21. In its RUN.md: Д12 in table 4 — the answers of `spec` to the rows «в реестр spec» of other repositories, for `canvas` «В4 и В5»; the epic E2 «Формат модуля v0» with the task T28 «Задача: пункты, ячейки ответа и канва», whose «Вход» is «T02 `canvas` — логические координаты листа: в них задаётся зона»; the epic E3 «Контракты первого среза» is in table 2, with the eval protocol and the format of samples.

### 5.4. .github

(architecture 2.3) — [altnovatrail/.github](https://github.com/altnovatrail/.github/tree/e480eb4), branch `main`, commit e480eb4, read 2026-10-21: the 2026-10-21 amendment to R03 .github — «Обёртка Go и релиз приходят с первым кодом `module-kit`, а обёртка TypeScript — с первым кодом на TypeScript, у `canvas`»; the epic E5 «Обёртка TypeScript» in table 2 of its RUN.md — «Идёт с первым кодом на TypeScript — у `canvas`, этап 2». At the commit [ed62dff](https://github.com/altnovatrail/.github/tree/ed62dff), read 2026-10-21 (architecture 2.3 and 3.4):

- R18 .github — the shared release `release.yml`, out in v0.1.4, commit 11435db;
- in the file itself the recipe `release-files` writes into `dist/` "plain files, named with letters, digits, dots, dashes, pluses and underscores", and on anything else the release fails — "dist/ holds something besides files". No tokens go into the build container: "Nothing of the step's environment, no token among it, goes into the container". The container itself is started so: `docker run --rm --user "$(id -u):$(id -g)" --env HOME=/tmp --volume "$tree:/work" --workdir /work release-toolchain just release-files "$VERSION"`, that is, without `--network`;
- R16 .github: the Go wrapper «запускает в ней `just ci-<check>` от пользователя раннера, с `HOME=/tmp`»;
- the file's inputs are `paths` and `publish`, it has no outputs, and it does not publish to npm. On the signature: "What a consumer checks of it is Т-27, which T37 in spec decides";
- the 2026-10-21 amendment to R18 .github — the first release on the shared `release.yml` is `module-kit` v0.1.0, commit 7e0144a.

At the commit [071262c](https://github.com/altnovatrail/.github/tree/071262c), the merge of pull request #39 "Agree the TypeScript wrapper's contract (T21)", read 2026-10-21 (architecture 3.4):
- R19 .github: «Это договор: по нему `canvas` пишет рецепты своего первого кода (T08 canvas), а сам файл пишет T22, вместе с этим кодом». On the container — «`just ci-<check>` идёт в ней от пользователя раннера, с `HOME=/tmp`; из окружения шага в контейнер идёт только `ALLOWED_LICENSES`», the flags `--init` and `--ipc=host`, and «контейнер идёт с сетью: она нужна `npm ci` и `npm audit`»;
- on the recipes — «чем он это делает и в каких версиях, решает и закрепляет репозиторий», and `ci` is «для разработчика: обёртка его не зовёт»;
- on the browsers — «Списка сумм у загрузок Playwright нет (architecture 4), и R34 spec к ним как есть не применить. В рамках правил — папка браузеров из образа Playwright, закреплённого по тегу и digest: в нём браузеры лежат в `/ms-playwright`»; «Сумма, которую репозиторий посчитал сам, — отступление от R34 spec, и тогда это вопрос „в реестр spec“. Выбирает T08 canvas»; «браузеры приходят не из lock-файла, и `ci-licenses` их не видит»;
- on the cost — «каждый из четырёх job собирает стадию `toolchain` целиком, без кеша, а с браузерами в ней — и браузеры … Сколько это стоит, покажет код T08 canvas»;
- architecture 3.3 .github — the text of the calling job "TypeScript" with `typescript.yml@<release SHA>` and the entry `npm` for `dependabot.yml`: «`directory` — папка `package.json`. Node в Dockerfile и браузеры для тестов Dependabot не видит»;
- T22 in its RUN.md — «Обёртку проверяет вызов из pull request репозитория на TypeScript, по SHA ветки, до релиза».

At the commit [ffa555d](https://github.com/altnovatrail/.github/tree/ffa555d), the merge of pull request #43 "Record T22 after the merge", read 2026-10-21 (architecture 2.3 and 3.4). The plan of T22, with a probe by the branch's SHA, above, changed:
- the 2026-10-21 amendment to R19 .github: «`typescript.yml` написан (T22) — по этой записи, и с одним добавлением: в контейнер идёт и `CI`». Vitest takes from it `browser.headless` — "Default: `process.env.CI`" — and `allowOnly` — "Default: `!process.env.CI`". On the flags — «`--ipc=host` — только у job `test`», «а `--init` — у всех четырёх». On the probe — «Проба — pull request #40 в самом `.github`, без мержа, а релиз выходит сразу, не дожидаясь кода `canvas`. Первый код на TypeScript — T08 canvas — зовёт обёртку уже по SHA релиза: на настоящем коде её проверит первый же его pull request, после релиза, а ошибку исправит следующий релиз». On the cost of the browsers — «ни кеш сборки, ни своя стадия для `ci-test` не нужны» and «Пересмотреть, если стадия `canvas` выйдет заметно дороже: её замерит T08 canvas». On the libraries — «Системные библиотеки браузеров ставит `apt-get` без точных версий», this is «вопрос В21 „в реестр spec“ в RUN.md», and the recommendation is «архив Ubuntu на дату: `apt-get --snapshot` с номером снимка в `ARG`, как версия»;
- the second amendment of the same day: «релиз вышел — `v0.1.5`, коммит c772cc8, неизменяемый и Latest»;
- `typescript.yml` in the release: "Of the step's environment only CI and ALLOWED_LICENSES go in. CI, which GitHub sets to true on every runner, is how the tools learn they run in CI: by it Vitest runs its browser headless and refuses test.only". On `--ipc=host` — "the latter only the test job gets, where a browser runs";
- architecture 3.3 .github — the calling job "TypeScript" by the SHA `c772cc86973240e21cebb310fd0cda221a752ade # v0.1.5`. On Dependabot — «Node в Dockerfile и браузеры для тестов Dependabot не видит, и их поднимают руками». The checks in the ruleset `main` — «с `integration_id` 15368 для проверок GitHub Actions и 12526 для SonarCloud»;
- architecture 4 .github — the probe #40, runs 39660777454 and 39661168027: «TypeScript 7.0.2, Vitest 5.0.5 с `@vitest/browser-playwright` 5.0.5 и Playwright 1.64.1» and «Стадия `toolchain` — с `/ms-playwright` из образа выше и 24 пакетами `apt`». Without the exception for `lightningcss` the license check answered "100 packages, 12 refused". The stage with the browsers was built in «49–52 секунды в каждом из четырёх job», without them in «21 секунда». The probe #42, run 39664766549: «стадия с браузерами собралась за 46–56 секунд на job». The image is `mcr.microsoft.com/playwright:v1.64.1-noble`, the index `sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf`, for amd64 — «986 271 382 байта сжатыми»;
- T22 in its RUN.md, «Решено автором (2026-10-21)»: «Проверки „TypeScript / …“ в ruleset `main` `canvas` ставит T23 canvas». Now it is a step of T08: T23 is merged into it (RUN.md, T23). В21 there too, «в реестр spec», — «Точные версии системных пакетов в стадии `toolchain`»; on the recommendation, the archive by date, — «В сборке Dockerfile это ещё не пробовали — проверить при записи»;
- the commits of the probe in `refs/pull/40/head`, read by git: 89520e2 — the probe, 1ee7a91 — the negative case without the exception. In `vitest.config.ts` are the projects `node` and `browser`, the second with `provider: playwright()` and `instances: [{ browser: "chromium" }]`, and on `headless` — "headless is not set here: CI, which typescript.yml passes into the container, turns it on". In the Dockerfile — `COPY --from=` of the same image by digest with the folder `/ms-playwright`, `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` and `apt-get install -y --no-install-recommends` with 24 packages, and in a comment — "apt pins no versions". In the lock file — `lightningcss` 1.33.0 and 11 of its builds for platforms, all under MPL-2.0 and all dev, and it is pulled in by `vite` 8.3.5. The exception in `trial/licenses.mjs` is by name, only MPL-2.0 and only for a dev package;
- the release v0.1.5: the tag is on c772cc8 (`git ls-remote`); the release is immutable and Latest, published 2026-10-21 (`gh release view`, `gh release list`), and `gh release verify v0.1.5 -R altnovatrail/.github` answers "Release v0.1.5 verified!".

At the tag [v0.1.6](https://github.com/altnovatrail/.github/tree/v0.1.6), commit 630924e, read 2026-10-22 (architecture 3.4; T24 and T32 in [RUN.md](../RUN.md)). The session of `.github` reported the release the same day, by its T25:
- the 2026-10-22 amendment to R18 .github: «Рецепты `spec` общий релиз запускает скриптом `spec/tools/toolchain/toolchain.sh` из подмодуля вызывающего, на теге, который тот закрепил»; «Скрипт есть в `spec` с v0.2.17»; «Вызывающий переходит на v0.2.17 до того, как поднимет ссылку на этот релиз `.github`. Иначе краснеет прогон Release на `main`, а релиз ждёт перехода — изменения с прошлого релиза не теряются». Before the build, the step of the number checks that `spec/` is a submodule `altnovatrail/spec` checked out at the pinned commit, that this commit is a tag of `spec`, and that the tag has the script;
- in `release.yml` itself — "pin it at a tag, v0.2.17 or newer, as every NovaTrail repository pins spec";
- architecture 3.3 .github: the example of a calling `release.yml` still pins `v0.1.4`, «где скрипта ещё нет и годится любой тег `spec` с v0.2.11»;
- between v0.1.5 and v0.1.6 only `release.yml` and `self-release.yml` changed (`git diff --stat`), and `typescript.yml` is the same. `release.yml` has no step for npm: T27 in the RUN.md of `.github` writes it, after T25 there. The job `licenses` of the TypeScript wrapper is moved onto the recipe `licenses-check-repo` by T26 there — with «План: да», not yet begun;
- the release is immutable and Latest, published 2026-10-22 (`gh api`), the tag is on 630924e (`git ls-remote`), and `gh release verify v0.1.6 -R altnovatrail/.github` answers "Release v0.1.6 verified!". The script `tools/toolchain/toolchain.sh` is in `spec` at the tags v0.2.17 and v0.2.18 (`git -C spec ls-tree`).

At the tag [v0.1.8](https://github.com/altnovatrail/.github/tree/v0.1.8), commit 0ab2799, read 2026-10-22 (T32 in [RUN.md](../RUN.md)). The session of `.github` reported the release the same day, by its T26:
- the 2026-10-22 amendment to R19 .github: «`ci-licenses` зовёт `just -f spec/justfile licenses-check-repo <lock-file> [<exceptions file>]` из корня репозитория»; «Тег — v0.2.18 или новее: с него у рецепта граница `dev`»; «Имя файла выбирает репозиторий, рекомендуемое — `licenses.json`, как в `spec/justfile`». On the submodule — «Как и в `documents.yml`, checkout берёт все подмодули вызывающего, а у репозиториев NovaTrail он один — `spec`, публичный». On `ALLOWED_LICENSES` — «остаётся в `typescript.yml` и идёт в контейнер, как прежде, — для рецепта, который ещё проверяет по своему списку. Такой сейчас у `canvas`: `scripts/licenses.ts`, до его T32. Это долг Д6 в RUN.md»;
- in `typescript.yml` itself — `submodules: ${{ matrix.check == 'licenses' }}` at the step checkout and "The licenses job gets the submodule at the commit the caller pins, for ci-licenses to run spec's recipe from it"; `ALLOWED_LICENSES` is still in the step's environment;
- architecture 3.3 .github: «На рецепт вызывающий переводит `ci-licenses` вместе с подъёмом ссылки на этот релиз или после него, но не раньше: прежняя обёртка подмодуля не даёт». The example of the calling job there still pins `v0.1.5`, `c772cc8`;
- Д6 in its RUN.md — «Когда вернуться»: «После T32 `canvas`, когда копию не читает ни один вызывающий `typescript.yml`. Тогда `ALLOWED_LICENSES` уходит из `typescript.yml`, а `self-ci.yml` перестаёт требовать в нём копию»;
- between v0.1.5 and v0.1.7 `typescript.yml` did not change, and in v0.1.8 it changed (`gh api …/compare`). `release.yml` has no step for npm at v0.1.8 either;
- the release is immutable and Latest, published 2026-10-22 (`gh release view`, `gh release list`), the tag is on 0ab279940126dadbde0f5a3912ce196ed39470ab (`git ls-remote`), and `gh release verify v0.1.8 -R altnovatrail/.github` answers "Release v0.1.8 verified!".

At the tag [v0.1.9](https://github.com/altnovatrail/.github/tree/v0.1.9), commit 41d5144, read 2026-10-22 (architecture 3.4; T24 in [RUN.md](../RUN.md)). The session of `.github` reported the release the same day, by its T27:
- the 2026-10-22 amendment to R18 .github: «Общий релиз публикует в npm пакет, который назвал вызывающий. Вход `npm-package` — имя в области `@altnovatrail`, а файл — архив, которому имя даёт `npm pack`». Before the GitHub release the archive is checked: «нет `private`, `publishConfig` и своего `tag`, а `repository` — объект с url этого репозитория». Further — «Вердикт — реестр, а не код выхода npm» and «Повтор прогона коммита, уже выпущенного, публикует архив из его релиза». The amendment leaves open, «до первой настоящей публикации, T24 canvas», «примет ли реестр provenance из reusable workflow другого репозитория», «npm/cli#9969 у репозиториев с неизменяемым subject» and «то, что новая настройка trusted publisher по умолчанию разрешает только staged publishing», and «Итог дописывается в RUN.md, T27»;
- architecture 3.3 .github — the author's steps for a repository with a UI package: «первый релиз выходит без `npm-package`»; the archive «автор проверяет — `gh release verify-asset` и подпись — и публикует руками из пустой папки, с 2FA»; «`npm trust github @altnovatrail/<name> --file <release workflow file> --repository altnovatrail/<repository> --allow-publish` или то же на сайте npm. Окружения нет, а прямая публикация разрешена: новая настройка по умолчанию разрешает только staged publishing»; «за 2 дня после настройки должна пройти первая публикация по ней — pull request, который добавляет `npm-package` и правит пути `paths`: одна правка `.github/**` релиза не даёт». The example of a calling `release.yml` there still pins `v0.1.7`, `0acbf75`;
- in `release.yml` itself — the input `npm-package`: "Empty publishes nothing to npm";
- between v0.1.8 and v0.1.9 `release.yml` and the documents of `.github` changed, and `typescript.yml` did not (`gh api …/compare`);
- the release is immutable and Latest, published 2026-10-22 (`gh release view`, `gh release list`), the tag is on 41d5144e304cfad05c681de6934405c08a7435db (`git ls-remote`), and `gh release verify v0.1.9 -R altnovatrail/.github` answers "Release v0.1.9 verified!".

At the tag [v0.1.10](https://github.com/altnovatrail/.github/tree/v0.1.10), commit f3addb7, read 2026-10-22 (architecture 3.4 and 3.7; T36 in [docs/plan/E2.md](plan/E2.md)). The session of `.github` reported the release the same day, by its T29:
- the 2026-10-22 amendment to R19 .github, «по Д6, задача T29»: «В `typescript.yml` больше нет `ALLOWED_LICENSES`, и в контейнер он не идёт. Его единственный вызывающий, `canvas`, с T32 проверяет lock-файл рецептом `spec` и переменную не читает» and «Из окружения шага в контейнер идёт только `CI`». Rejected — «оставить переменную в обёртке ещё на релиз, на всякий случай»;
- in `typescript.yml` itself — "Of the step's environment only CI goes in" and "So this file carries no copy of the list: its callers take the list from spec". Between v0.1.9 and v0.1.10 only the comments, the step's environment and the flags of `docker run` changed in it (`gh api …/compare`), and between v0.1.8 and v0.1.9 it did not change;
- in its RUN.md — «Д6 закрыт 2026-10-22 в T29: копии списка в `typescript.yml` больше нет». In «Сделать» of T29 there — «промпт сессии `canvas`: поднять ссылку на новый релиз и убрать из шапки `justfile` и из документов `canvas` „until its Д6“»;
- architecture 3.3 .github pins `typescript.yml@f3addb7403d084c560c61481e217b93f8e7ee1f3 # v0.1.10` on `main` c97ed06, the commit after the release, and at the tag itself still v0.1.8;
- architecture 2.8 .github at the same commit: «Поднимет ли Dependabot такую ссылку, покажет первый релиз после `v0.1.0`». A search for Dependabot's pull requests across the organization `altnovatrail` found one — spec#7, the devcontainer image (`gh search prs`), and `canvas` had none;
- the release is immutable and Latest, published 2026-10-22 (`gh release view`, `gh release list`), the tag is on f3addb7403d084c560c61481e217b93f8e7ee1f3 (`git ls-remote`), and `gh release verify v0.1.10 -R altnovatrail/.github` answers "Release v0.1.10 verified!".

The other five references — from v0.1.0 to the same release, read 2026-10-22 on `main` c97ed06 (the 2026-10-22 amendment to R12):
- architecture 3.3 .github: «Общие workflow закреплены по SHA первого релиза `.github`, `v0.1.0`» and «Копируя, берут последний релиз `.github`». The texts there are the same as `canvas`'s, except what `canvas` added: `scorecard.yml` matches word for word, `codeql.yml` has an added input `languages` with a comment, and `ci.yml` has the job "TypeScript", which brings the kind typescript;
- between v0.1.0 and v0.1.10, of the five shared workflows one changed — `codeql.yml` (`gh api …/compare`). It takes the language `go` and a new input `paths-ignore`, empty by default. The names of its jobs — `languages` and `analyze (<language>)` — and its permissions are as before, so the required checks of the ruleset `main` do not change. `secrets.yml`, `dco.yml`, `documents.yml` and `scorecard.yml` are the same as in v0.1.0.

At the tag [v0.1.12](https://github.com/altnovatrail/.github/tree/v0.1.12), commit 4225639, read 2026-11-01 (architecture 3.4 and 3.7; R43):
- architecture 3.3 .github, «Покрытие»: «Его `ci-test` пишет отчёт — у Go профиль `coverage/go.out`, у TypeScript lcov `coverage/lcov.info` (3.1), — а `.gitignore` держит `coverage/`» and on raising the reference before the report: «Если он придёт раньше шага 1, он красный: без права прогон CI не стартует вовсе — «The nested job 'coverage' is requesting 'id-token: write', but is only allowed 'id-token: none'»»;
- the 2026-11-01 amendment to R19 .github: «Модуль, которого не загружает ни один тест, в отчёте с нулями или валит рецепт» and «Провайдер покрытия — пакет lock-файла, например `@vitest/coverage-v8`, и `ci-licenses` проверяет его, как всё»;
- in `typescript.yml` itself — "ci-test writes the coverage of the tests as an lcov report, coverage/lcov.info, and the job coverage sends it to Codecov by OIDC, with no secret";
- between v0.1.10 and v0.1.12, of the shared workflows `typescript.yml`, `go.yml`, `release.yml` and `self-ci.yml` changed (`gh api …/compare`), and of them `canvas` calls only the first;
- the release is Latest, published 2026-11-01 (`gh release list`), the tag is on 4225639bcd04f43ef58f95cabf9fdfd947cbcb07 (`gh api …/git/ref/tags/v0.1.12`), and `gh release verify v0.1.12 -R altnovatrail/.github` answers "Release v0.1.12 verified!".
- in `release.yml` itself, read again 2026-11-02 (architecture 3.4; T66) — "A commit gets a release only when a path the caller names in paths has changed since the release before it; the first release comes out always", "With publish: false a run builds, signs and checks the signatures and publishes nothing, which lets a pull request try a change here" and "A run that publishes nothing may run anywhere: a pull request tries a change that way"; of a package that is not in the registry, the npm step of the probe writes "not in the npm registry yet, which matters not with publish false", and the caller's recipe runs as `just release-files "$VERSION"` on the tree of the commit's `git archive`;
- there too, architecture 3.3 .github — the template of a calling `release.yml` with `RELEASE_LINE: "0.1"` and the list of the kind go, and the rule: «Перечень вида typescript `.github` пишет с первым релизом на TypeScript, у `canvas`, по тому же правилу»;
- GitHub Docs, [Troubleshooting Dependabot on GitHub Actions](https://github.com/github/docs/blob/33b1f4a/content/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions.md), commit 33b1f4a, read 2026-11-02 (architecture 3.4): "By default, GitHub Actions workflows triggered by Dependabot get a `GITHUB_TOKEN` with read-only permissions. You can use the `permissions` key in your workflow to increase the access for the token";
- a probe here, 2026-11-02 (T66): two runs of `just release-files v0.1.0` in a row gave the same `SHA256SUMS`, and the archive, put into a trial project by a path to the file, was accepted by TypeScript with the package's declarations and imported by Node.

### 5.5. module-kit

(architecture 3.4 and 3.5), read 2026-10-21:

- [the release v0.1.0](https://github.com/altnovatrail/module-kit/releases/tag/v0.1.0) of 2026-10-21 is immutable. It holds six programs, `LICENSE`, `LICENSE-go` and `SHA256SUMS`, and each file has its own `.sigstore.json` (GitHub's API);
- [altnovatrail/module-kit](https://github.com/altnovatrail/module-kit/tree/1a54028), commit 1a54028: in table 3 of its RUN.md, В6 «в реестр spec» is on which paths the release is built from, and В7 — «Как CI `modules` и `canvas` берут CLI `module-kit` по точному тегу». The recommendation of В7 is the release's binary, checked by its signature, «с тем, что решит T37 `spec` о Т-27».
- there too, its architecture's section 2.5, read again 2026-10-21 (architecture 3.5): «нужна ли CLI `module-kit` своя команда, которая отдаёт открытые виды задач сборке страницы образцов `canvas`, или этой сборке хватает команд карточки — проверить, собрать, построить индекс»; «у шаблонной задачи числа подставляются от зерна (concepts 9.3 spec), так что и её открытый вид зависит от зерна». This is decided by its T05 «Итог детализации», not done.
- its `justfile` at the same commit, read again 2026-11-02 (architecture 3.4; T66): the recipe `release-files version` rejects another number — "the version is v<major>.<minor>.<patch>, as v0.1.0" — and writes into `dist/` the files, `LICENSE` and `SHA256SUMS`.

### 5.6. modules

(architecture 2.4 and 3.5) — [altnovatrail/modules](https://github.com/altnovatrail/modules/tree/105fa72), commit 105fa72, read 2026-10-21: T02 «Образцы добровольцев в eval-наборе (П-16)» in its RUN.md, not done. Before the merge it is to check that «доброволец — взрослый: образцы делают взрослые добровольцы, а аккаунт GitHub может быть и у подростка», that «ни на образце, ни в метаданных его файла нет имён и подписей (П-16)» and that «его формат — по протоколу eval (R15 spec)».

### 5.7. CONTRIBUTING `.github`

(architecture 3.6) — [altnovatrail/.github](https://github.com/altnovatrail/.github/blob/c772cc8/CONTRIBUTING.md), commit c772cc8, read 2026-10-21: "No samples for eval sets yet. Handwriting, voice and photo samples for eval sets are not accepted until the project decides how the people who make them consent to their publication. That is П-16, an open question of spec's privacy document"; on the DCO sign-off — "The line and the email in it stay public in the history for good".

### 5.8. `tutor`'s board on undo and clearing

(architecture 3.3; R19) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3029dfb), commit 3029dfb, `internal/board/page.html`, read 2026-10-22: "Undo stroke" — `document.getElementById("undo").addEventListener("click", () => { state.strokes.pop(); redraw(); });`, and "Clear" — `state.strokes = []; redraw(); document.getElementById("results").replaceChildren(); setStatus("");`. For the time of a check the buttons are disabled — `for (const id of ["check", "undo", "clear", "prev", "next"]) document.getElementById(id).disabled = true;`, — and the move to a task, `showTask`, begins with `state.strokes = [];`.

### 5.9. `tutor`'s board on the picture

(architecture 3.3; R20) — [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3029dfb), commit 3029dfb, read 2026-10-22:

- `internal/board/page.html`:
  - "Check" begins with `if (state.strokes.length === 0) { setStatus("Write a solution first."); return; }` and sends `post("/api/check", { task: state.tasks[state.index].id, image: canvas.toDataURL("image/png") })`;
  - for the time of a check — `state.busy = true`, and `pointerdown` begins with `if (state.busy) return;`;
  - the line is `ctx.lineWidth = 3`, with no pressure;
- `internal/board/server.go`:
  - "decodePNG takes a data URL or bare base64 and checks that it is a PNG of a sensible size", `maxSide = 4000` and `maxBody = 8 << 20`;
  - the page is `//go:embed page.html`, and the routes are `GET /{$}`, `GET /api/tasks`, `GET /api/summary`, `POST /api/check` and `POST /api/mark`;
- `internal/board/ask.go` — "the picture of the board and the prompt come to about 1 300" and `inputTokensBudget = 4000`;
- R19 tutor:
  - «у Claude Opus 5.5 $4 и $20 за миллион токенов входа и выхода, у GPT-6 Astra — $10 и $50. Вход — картинка 1000 × 600 и текст, около 1 300 токенов»;
  - on the cost of a check — «вместе — около 10–20 центов»;
- the tokens of the picture — by the formulas of the record "AI providers on a place in a picture" above:
  - for Claude `⌈1000/28⌉ × ⌈1400/28⌉` = 36 × 50 = 1800, and for the board's sheet `⌈1000/28⌉ × ⌈600/28⌉` = 36 × 22 = 792;
  - for OpenAI `⌈1000/32⌉ × ⌈1400/32⌉` = 32 × 44 = 1408 patches and 32 × 19 = 608, with the limit of 2500 for `gpt-6-astra` at `high`.

## 6. Moves to tags of `spec` and `.github`

### 6.1. The move to `spec` v0.4.1

(architecture 1, 3.3 and 3.7; R41), read 2026-11-01:

- the release — `gh release verify v0.4.1 -R altnovatrail/spec`: "Release v0.4.1 verified!". The release has `format-0.1.tar.gz` and `altnovatrail-spec-0.4.1.tgz` with the signatures `.sigstore.json`, and the sha256 of the package's archive is `5ea7321ed287b6c33dbb4f244b3fc44ae42f38221785d720e7e5fb589a564cb2`;
- the npm registry — [`@altnovatrail/spec`](https://registry.npmjs.org/@altnovatrail/spec): the versions `0.0.0-stage`, 0.4.0 and 0.4.1, `latest` is 0.4.1, the license Apache-2.0. `npm pack @altnovatrail/spec@0.4.1` gives an archive with the same sha256, and `gh release verify-asset v0.4.1 altnovatrail-spec-0.4.1.tgz -R altnovatrail/spec` — "Verification succeeded! altnovatrail-spec-0.4.1.tgz is present in release v0.4.1". The package's README: "The package holds declarations alone, with no code to run, so import them with `import type`" and "Take it at an exact version, the same tag as any submodule or Go module of `spec` you hold, and move all of them together";
- Go — [go.dev/dl, JSON](https://go.dev/dl/?mode=json&include=all): go1.27.3 for linux-amd64 has the sha256 `65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40`, for linux-arm64 — `a06e99309dbcbdca1a8ccd2282c3ee146e55930886e26b4f1193269587165f49`, as in the `.devcontainer/Dockerfile` of `spec` at its tag;
- the neighbors' releases — `gh release list`: `modules` and `tutor` have no releases, `module-kit` has v0.1.0 of 2026-10-21, and the last of `.github` is v0.1.10 of 2026-10-22.

### 6.2. The move to `spec` v0.6.2

(architecture 1, 3.3, 3.4 and 3.7; R44), read 2026-11-02:

- `gh release list -R altnovatrail/spec` — v0.6.2 of 2026-11-01 23:54Z, the last; v0.6.0 came out at 22:56Z, v0.6.1 at 23:36Z. `gh release verify v0.6.2 -R altnovatrail/spec` — "Release v0.6.2 verified!". The release has `altnovatrail-spec-0.6.2.tgz` and `format-0.2.tar.gz`, and beside each a bundle `.sigstore.json`;
- `npm view @altnovatrail/spec@0.6.2`: the version came out 2026-11-01T23:55:23Z, under Apache-2.0 and with no dependencies, `exports` are `./canvas`, `./formatv0`, `./formatv0/open` and `./package.json`, `integrity` is `sha512-FlnH73fs…aibw==`. The registry's archive and the release's file match: the sha256 of both is `95e4e7c2f954608ab6530e3fb9e44c0e4d71665fb4481797137d11555cbef0aa`;
- `just -f spec/justfile release-verify-npm package-lock.json` at v0.6.2 answers in ≈ 2 s: "node_modules/@altnovatrail/spec: altnovatrail-spec-0.6.2.tgz: spec v0.6.2, signed by spec's release.yml, and its integrity is the verified bytes'". On copies of the lock file the recipe refuses with code 1:
  - with a foreign `integrity` — "has the integrity …, and the verified archive's is …";
  - with the address of another version — "comes from …, not …".

  Without packages of `@altnovatrail` it answers "no package of @altnovatrail to verify" and goes neither to Sigstore nor to GitHub. Before the check the recipe `_tools` runs `npm ci` in `spec/tools`, if they are not there yet: 233 packages, ≈ 270 MB, here 2.9 s with an empty npm cache;
- RULES.md at v0.6.2, Hard rules: "A file of a NovaTrail release — a binary, an archive, an index — enters code or CI only once `just -f spec/justfile release-verify` has accepted it (in spec, `just release-verify`), where it enters NovaTrail; a package of `@altnovatrail` from npm, once `release-verify-npm` has accepted the lock file, in CI of the pull request that changes it. From then on the digest the check pinned holds the file — the lock file's `integrity`, the chain of digests from a pinned index — and nothing checks its signature again";
- the `justfile` of `spec` at v0.6.2, the recipe `release-verify-npm`: "a lock file with no such package has nothing to verify. RULES.md has a repository run it in CI of each pull request that changes the lock file";
- `typescript.yml` of `.github` v0.1.12, commit 4225639. The wrapper has no inputs — `on: workflow_call:`, — and the licenses job takes the submodule: `submodules: ${{ matrix.check == 'licenses' }}`. The container: "the container runs as the runner's user, with its home in /tmp, and it has the network npm ci and npm audit need". And also: "What the checks do is the repository's; how they are run is the same everywhere";
- `git -C spec diff --stat v0.4.1 v0.6.2 -- .devcontainer repo-template` is empty;
- the neighbors:
  - `gh release list`: `modules` has no releases, `module-kit` has v0.1.0 of 2026-10-21, `tutor` v0.1.0 of 2026-11-01, `.github` v0.1.12 of 2026-11-01;
  - `gh api repos/altnovatrail/canvas/immutable-releases` — `{"enabled":false}`, and `canvas` has one ruleset — `main` (25506234). The same day, on the author's instruction: `PUT …/immutable-releases` — now `{"enabled":true}`, and `POST …/rulesets` gave the ruleset `v-tags` (26336827). Its `name`, `target`, `enforcement`, `conditions`, `rules` and `bypass_actors` match the ruleset `v-tags` of `module-kit` (25559103) line for line. Since the same day the ruleset `main` also has `codecov/patch` with `integration_id` 254: `gh api apps/codecov` — `id` 254.

### 6.3. `.github` v0.1.13

(architecture 3.4), read 2026-11-02:

- the release came out 2026-11-02 at 01:19Z, its tag is the commit 09443e1. Between v0.1.12 and v0.1.13, of the workflows only `release.yml` changed (`gh api repos/altnovatrail/.github/compare/v0.1.12...v0.1.13`);
- the header of `release.yml`: "With npm-package, the spec submodule is at v0.6.0 or newer, whose release-verify a run again checks the release's archive by";
- the step "spec's release-verify, asked ahead" runs when `inputs.npm-package != '' && steps.version.outputs.version != ''`: "spec ships the recipe from v0.6.0, so a caller with npm-package on an older tag stops at its release, not at a rare run again";
- the step "The identity the signature will carry", with `publish`, stops the run if the caller's workflow is not `<repository>/.github/workflows/release.yml@refs/heads/main`, or if the shared one is pinned not by a SHA of 40 characters;
- the 2026-11-02 amendment to R18 .github, T39 in the RUN.md of `.github`: «Вызывающим без `npm-package` новый тег не нужен».

### 6.4. The move to `spec` v0.6.5 and the icons of the row's buttons

(architecture 3.3, 3.4 and 3.7; R45, R46), read 2026-11-02:

- `gh release list -R altnovatrail/spec` — v0.6.5 of 2026-11-02 05:43Z, the last; v0.6.3 came out at 02:30Z, v0.6.4 at 04:39Z. `gh release verify v0.6.5 -R altnovatrail/spec` — "Release v0.6.5 verified!", and the package's archive in the release has the sha256 `57c399c033c0e2bfed12f355ed49e1f9e57cd24365cf72638c3d4a278e7bc823`, the same as `npm pack @altnovatrail/spec@0.6.5`;
- `npm view @altnovatrail/spec time` — 0.6.5 came out 2026-11-02T05:45:11Z; `just -f spec/justfile release-verify-npm package-lock.json` — "spec v0.6.5, signed by spec's release.yml, and its integrity is the verified bytes'";
- which tag brought what — by `git -C spec show <tag>:…`: R78 spec, R79 spec and the package's README with `release-verify-npm` (В57) — since v0.6.3; `Media` in `types/canvas/index.d.ts` (В58) and R81 spec — since v0.6.4; R83 spec — since v0.6.5;
- the output of the recipe `just new-repo-draft canvas typescript 3.2 v0.6.5` in a temporary clone of `spec` at v0.6.5: its `.devcontainer/Dockerfile` differs from the earlier Dockerfile of `canvas` only in comments and in the `FROM` line of the base image — `3.0.10` in the template, `3.0.12` in `canvas`, — and `devcontainer.json` in two comments and the version of the Biome extension, 3.8.1 against 3.7.1; `host-network.sh` is the same;
- the npm registry: `@iconify-json/material-symbols` 1.2.97 — 2026-10-28T06:30:51Z, `license` is `Apache-2.0`, and its `info.json` — "Material Symbols", 15,761 icons, author Google, `https://github.com/google/material-design-icons`; `@iconify/utils` 3.1.7 — 2026-09-06T15:35:47Z, MIT, with the dependencies `@antfu/install-pkg` 2.1.0, `@iconify/types` 2.0.0, `import-meta-resolve` 4.2.0, `package-manager-detector` 1.9.0 and `tinyexec` 1.3.1, all under MIT and all out before 2026-10-30;
- the set has all the names of the table of architecture 6 spec: for `ink-pen`, `ink-eraser`, `delete-sweep` and `touch-app` the outline and the fill are icons of their own, and for `undo`, `arrow-upward`, `arrow-downward`, `arrow-forward`, `keyboard-arrow-down` and `keyboard-arrow-right` the outline is an alias of the fill. Each icon is `viewBox="0 0 24 24"` and filled shapes `<path fill="currentColor" d="…"/>`;
- a measurement of the row in the container's Chromium: the number of lines of the row of the sheet, of the pen mode and of the example at element widths of 360–1000 px in English and in Russian — without icons, with an icon of 1.25em and padding of 16 px, and with an icon of 1.125em and padding of 8 px (R46, "The look").

### 6.5. Module format 0.4

(architecture 3.3, 3.8 and 3.9; R60, R61), read 2026-11-09: the README of the format at the tag v0.12.0 of `spec`, §2 — while the format is v0, "the platform reads only the current version"; §21 — "on a workbook, a box filled, `fill` … The demo fills the box with its `value` as the learner opens the part"; §9 — "`canvas` lays them out by the same numbers, from the npm package `@altnovatrail/spec`, which carries `page.yaml` and these vectors as JSON". `tutor`'s file of open views v0.1.21 of 2026-11-09 has `module_format_version: "0.3"` (`gh release download`).

### 6.6. `.github` v0.1.21

(architecture 3.7; R60), read 2026-11-09: the release of 2026-11-08, the tag is the commit 706f406, `gh release verify` accepted it. Between v0.1.15 and v0.1.21, of the workflows that `canvas` calls, these changed: `release.yml` — the npm step waits for the registry up to 20 minutes, — `documents.yml` — the image is built by `spec`'s `toolchain.sh`, — and, by one line, `codeql.yml` and `scorecard.yml` (`gh api repos/altnovatrail/.github/compare/v0.1.15...v0.1.21`).

### 6.7. Module format 0.3

(architecture 3.3 and 3.9; R32), read 2026-11-08:

- the README of the format at the tag v0.9.8 of `spec`, §2: "A reader MUST refuse, with a reason, a module that names a version it does not read: one newer than the reader knows, or one outside the versions the platform reads (below)"; "While the format is v0 (0.y), nothing is promised beyond the places that this section keeps in every version: every change is the next 0.y, and the platform reads only the current version"; "A module of 0.2 moved to 0.3 gets the same verdicts, numbers and open view, unless a count of its steps reaches a limit exactly". The vector `vectors/rules/manifest.format-version/previous-minor.yaml` has `module_format_version: "0.2"`;
- [altnovatrail/modules](https://github.com/altnovatrail/modules/tree/v0.1.0), the release v0.1.0 of 2026-11-07: `modules/english-essays/manifest.yaml`, `modules/grade-3-math/manifest.yaml` and `modules/olympiad-math/manifest.yaml` all have `module_format_version: "0.3"`, and so on `main` ae0bfe4 too.

### 6.8. `.github` v0.1.15

(architecture 3.7; the 2026-11-08 amendment to R12), read 2026-11-08: the releases v0.1.14 and v0.1.15 came out 2026-11-02, the tag v0.1.15 is the commit 89d3cee. Between v0.1.13 and v0.1.15, of the workflows only `.github/workflows/release.yml` changed (`gh api repos/altnovatrail/.github/compare/v0.1.13...v0.1.15`): the input `previous-file` — "Empty gives the recipe the version alone", `required: false`, `default: ""`, — and the check of a number npm held: "A version it held keeps its time even then, and the numbers it held last lie under time.unpublished.versions too".

### 6.9. The move to `spec` v0.15.1

(architecture 3.4; R76; T109), read 2026-11-12:

- `gh release list -R altnovatrail/spec` — v0.15.1 of 2026-11-11 22:02Z, the last; `gh release verify v0.15.1 -R altnovatrail/spec` — "Release v0.15.1 verified!"; `npm view @altnovatrail/spec version` — 0.15.1;
- Go — [go.dev/dl, JSON](https://go.dev/dl/?mode=json&include=all): go1.27.4 for linux-amd64 has the sha256 `7226736c2339719cda28fbf3a54d71aa63bcefe376e98cef00034268dab24840`, for linux-arm64 — `3392582988a273a87ab5043ee1b2c9c17a2c3c00580bf9326c47a2e0aaaeac92`, as in the `.devcontainer/Dockerfile` of `spec` at its tag;
- `legal-2.tar.gz` of the release v0.15.1 — sha256 `ae52b41b80711f1ce9be3a95397746979b7370fe7534a3ba8d21d38083a7d05b`, `release-verify spec v0.15.1` — "legal-2.tar.gz: spec v0.15.1, signed by spec's release.yml". Unpacked, it matches the archive of v0.15.0 file for file (`diff -r`), and `tar -tv` gives the dates 2026-11-11 21:52 instead of 03:30.

### 6.10. The move to `spec` v0.16.3

(architecture 3.4; R77; T110), read 2026-11-12:

- `gh release list -R altnovatrail/spec` — v0.16.3 of 2026-11-12 20:17Z, the last, after v0.16.2 and v0.16.1 of the same day; `gh release verify v0.16.3 -R altnovatrail/spec` — "Release v0.16.3 verified!", the tag is the commit 664398e; `npm view @altnovatrail/spec version` — 0.16.3;
- `npm view @altnovatrail/contracts@0.16.3 dependencies` — `{ '@bufbuild/protobuf': '2.17.0' }`; `git ls-remote https://github.com/bufbuild/protobuf-es refs/tags/v2.17.0` — the commit `01a8c3b7c95d17758c641b2b9e8ee2f14a3ee9d7`, and LICENSE and the header of `varint.ts` at it are the same bytes as at v2.16.0;
- `legal-2.tar.gz` of the release v0.16.3 — sha256 `5c9e3b9568bc60e146d3bc031fcc71b8b5cd478333989f2b5b64e44f0222371a`, `release-verify spec v0.16.3` — "legal-2.tar.gz: spec v0.16.3, signed by spec's release.yml". Unpacked, it matches the archive of v0.15.1 file for file (`diff -r`), and `tar -tv` gives the dates 2026-11-12 20:06;
- `just new-repo-draft canvas typescript 3.2 v0.16.3` in a temporary clone of `spec` at the tag gives the `.devcontainer/` of `canvas` byte for byte, and the template's `.claude/settings.json` differs from that of `canvas` only in what holds R15: the `deny` rules on the folder of the samples made by hand;
- `module-kit` on `main` (`gh api repos/altnovatrail/module-kit/commits`) moved to v0.16.3 at 2026-11-12 20:54Z, by its own decision R54 module-kit, without rebuilding its documents, and the pilot, row 7.1 of COORDINATION.md spec, is the task T43 module-kit outside an epic, with no «Сделано»: not begun.

## 7. Tools, packages and CI

### 7.1. GitHub Packages

(architecture 2.3) — GitHub Docs, [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry), read 2026-10-19: "You need an access token to publish, install, and delete private, internal, and public packages". Read again 2026-10-21 in the sources of the documentation, [github/docs](https://github.com/github/docs/blob/cca0c9d7299f760587d6601bd96acfd2f5cb8929/data/reusables/package_registry/authenticate-packages.md), commit cca0c9d: the phrase is the same, and [beside it](https://github.com/github/docs/blob/cca0c9d7299f760587d6601bd96acfd2f5cb8929/data/reusables/package_registry/packages-classic-pat-only.md) — "GitHub Packages only supports authentication using a personal access token (classic)".

### 7.2. npm

(architecture 2.3 and 3.4), read 2026-10-21:

- the CLI — [npm/cli](https://github.com/npm/cli/tree/ae98c62586b6fea44114f72e249e246a2981de70), the release v12.2.1 of 2026-10-15, commit ae98c62:
  - `allow-remote` in `workspaces/config/lib/definitions/definitions.js`: "As of npm 12 the default is `none`. Tarballs that share a hostname with the configured registry (the typical case for the npm registry, GitHub Packages, and most private registries) are still installed normally"; "`root` only allows urls defined in your project's package.json to be installed". In npm 11.19.0, which is in the container together with Node 24.21.0, the default value is `'all'`;
  - `npm-install.md`: a folder outside the project — "it will create a symlink to `<folder>`"; `npm-link.md`: "First, `npm link` in a package folder with no arguments will create a symlink in the global folder…";
  - `npm-audit.md`: "The `audit signatures` command will also verify the provenance attestations of downloaded packages". pacote 22.0.0 from the same build (`node_modules/pacote/lib/registry.js`) checks the package's name and version and its sha512, and calls `sigstore.verify` with no rule on who signed. The workflow and the repository that built the package are not checked;
  - `npm-cache.md`: "All data that passes through the cache is fully verified for integrity on both insertion and extraction";
  - the name of the archive in `workspaces/libnpmpack/lib/index.js` is `${manifest.name}-${manifest.version}.tgz`, without `@` and with `-` instead of `/`;
  - `npm-stage.md`: "Staged publishing allows users to have their automated workflows stage a package without a 2FA prompt, deferring the act of 2FA, allowing the maintainer to approve the staged package and publish at a later point";
  - the parameter `access` has the default value "'public' for new packages, existing packages it will not change the current level";
- the documentation — [npm/documentation](https://github.com/npm/documentation/tree/4e8e03b978033529bf8f50d74305b29939eb022c), commit 4e8e03b of 2026-10-16:
  - `trusted-publishers.mdx`:
    - "Trusted publishing requires npm CLI version 11.5.1 or later and Node version 22.14.0 or higher";
    - "Some GitHub Actions workflows use `workflow_call` to invoke other workflows that run `npm publish` … validation checks the calling workflow's name instead of the workflow that actually contains the publish command, which can cause configuration mismatches. The `id-token: write` permission must also be given to both parent and child workflows";
    - "npm automatically generates and publishes provenance attestations for your package";
    - "A newly created trusted publisher configuration must complete its first successful publish within 2 days";
    - the setting "Require two-factor authentication and disallow tokens";
    - "your package's `repository.url` field in `package.json` must exactly match your GitHub repository";
  - `npm-trust.mdx` (v12): "Package must exist: The package you're configuring must already exist on the npm registry";
  - `downloading-and-installing-packages-locally.mdx`: "Scoped public packages can be downloaded and installed by anyone". In `creating-and-publishing-scoped-public-packages.mdx` — "By default, scoped packages are published with private visibility. To publish a scoped package with public visibility, use `npm publish --access public`": this differs from the CLI's parameter `access`;
  - `organizations/index.mdx`: "Organizations are free when they publish public packages";
  - `policies/unpublish.mdx`: "Registry data is immutable, meaning once published, a package cannot change"; "Once `package@version` has been used, you can never use it again";
  - `about-access-tokens.mdx`: "As of November 2025, only Granular access tokens are supported"; "The ability to publish new package versions directly with a granular access token will be removed in January 2027";
  - `about-two-factor-authentication.mdx`: publishing needs "Two-factor authentication (2FA) enabled on your account, OR A granular access token with bypass 2FA enabled";
- the registry: `https://registry.npmjs.org/-/org/altnovatrail/package` answers 404 `{"error":"Scope not found"}`, and `@altnovatrail/canvas` — 404 `{"error":"Not found"}`. The registry answers a made-up name the same way, so the answer does not prove whether the name is free. The same day the author created the organization `altnovatrail`. After that `-/org/altnovatrail/package` answers 200 `{}`, a made-up name still 404 "Scope not found", and `@altnovatrail/canvas` 404 "Not found": there is no package yet.

Read 2026-10-22 (architecture 3.4; T24 in [RUN.md](../RUN.md)):
- `trusted-publishers.mdx` in npm/documentation, commit [7e98ab4](https://github.com/npm/documentation/tree/7e98ab4d9c17afad7157be171a684bbeffbaa53f) of 2026-10-22: "Configurations created after Sep 03, 2026 are automatically set to allow `npm stage publish`, and you can choose whether to also permit direct publishing with `npm publish`"; "If the configuration is not validated within 2 days, it expires and can no longer be used or edited";
- `npm-trust.md` in npm/cli, tag [v11.19.0](https://github.com/npm/cli/blob/v11.19.0/docs/lib/content/commands/npm-trust.md): "`--allow-publish`: Allows the trusted publisher to run `npm publish` for the package"; "At least one of these flags is required when creating a trust configuration". It needs "`npm@11.15.0` or above" — the container has 11.19.0 — and "2FA enabled on account";
- the issue [npm/cli#9969](https://github.com/npm/cli/issues/9969) of 2026-09-14 — "OIDC trusted publishing fails with "package not found" for GitHub repos that use immutable OIDC subject claims" — is open, with the labels "Needs Triage", "Priority 1" and "oidc", last changed 2026-10-13. Its author and the second commenter write of repositories created after 2026-07-15, where `use_immutable_subject: true` cannot be turned off; the author refers to GitHub's changelog. These are users' reports, not npm's answer;
- `canvas` has `"use_immutable_subject":true` (`gh api repos/altnovatrail/canvas/actions/oidc/customization/sub`), and it was created 2026-10-19 (GitHub's API).

Read 2026-11-02 (architecture 3.4; T70 and T71 in [RUN.md](../RUN.md)):
- the settings page of the package `@altnovatrail/canvas` on the npm site, by the author's screenshot: under "Publishing access" — "Require two-factor authentication and disallow bypass 2fa tokens (recommended)" and "Require two-factor authentication or a granular access token with bypass 2fa enabled", and below them — "Note about trusted publishers: All publishing access options above are compatible with OIDC trusted publishers. If you have configured trusted publishers for this package, they will continue to work regardless of which option you select";
- the output of `npm trust github @altnovatrail/canvas --file release.yml --repository altnovatrail/canvas --allow-publish` at the author's: "Trust configuration created successfully", "permissions: publish, stage publish";
- the registry, `npm view @altnovatrail/canvas --json`: the version `0.0.0-stage` of 05:13:54Z — "Temporary package placeholder for staged publishing", published by the author's account with the first publication, — 0.1.0 of 05:15:11Z and 0.1.1 of 05:39:38Z, whose `_npmUser` is "GitHub Actions <npm-oidc-no-reply@github.com>", and the tag `latest` is 0.1.1;
- the attestations of 0.1.1, `https://registry.npmjs.org/-/npm/v1/attestations/@altnovatrail%2fcanvas@0.1.1`: «https://github.com/npm/attestation/tree/main/specs/publish/v0.1» and «https://slsa.dev/provenance/v1». The second's `workflow` is `.github/workflows/release.yml` of `altnovatrail/canvas` on `refs/heads/main`, commit fd032f1, and the certificate has `altnovatrail/.github/.github/workflows/release.yml@09443e1027ef24197439dfe60a072d14c3626cc3`; `npm audit signatures` in a trial project — "2 packages have verified attestations";
- npm/cli#9969 is still open, last changed 2026-10-28 (`gh api repos/npm/cli/issues/9969`).

### 7.3. Node.js

(architecture 3.4) — [dist/index.json](https://nodejs.org/dist/index.json), read 2026-10-21: v24.21.0 has `"npm": "11.19.0"`.

### 7.4. Docker

(architecture 3.4) — the documentation, [docker/docs](https://github.com/docker/docs/blob/226023fc89bdeb3f051c4c8c697d04ed5f5bcd2c/content/manuals/engine/network/_index.md), commit 226023f, read 2026-10-21: "Containers have networking enabled by default, and they can make outgoing connections"; "When you run a container without the `--network` option, it is connected to the default bridge"; "Containers attached to the default bridge have access to network services outside the Docker host".

### 7.5. Playwright

(architecture 3.4) — [microsoft/playwright](https://github.com/microsoft/playwright/tree/v1.64.1), tag v1.64.1, read 2026-10-21:

- [`docs/src/docker.md`](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/docker.md): "It is recommended to always pin your Docker image to a specific version if possible. If the Playwright version in your Docker image does not match the version in your project/tests, Playwright will be unable to locate browser executables"; of the image, "This image includes the Playwright browsers and browser system dependencies. The Playwright package/dependency is not included in the image and should be installed separately"; of the flags, "Using `--init` Docker flag is recommended to avoid special treatment for processes with PID=1" and "Using `--ipc=host` is recommended when using Chromium. Without it, Chromium can run out of memory and crash";
- [`nativeDeps.ts`](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/src/server/registry/nativeDeps.ts): the entry `ubuntu24.04-x64` has 21 packages for `chromium`, from `libasound2t64` to `libxrandr2`, with no versions.

### 7.6. GitHub releases

(architecture 3.4) — the sources of GitHub Docs, [github/docs](https://github.com/github/docs/tree/cca0c9d7299f760587d6601bd96acfd2f5cb8929), commit cca0c9d, read 2026-10-21:

- `about-releases.md`, with the values of its variables filled in: "Up to 1000 release assets may be associated with a single release. Each file included in a release must be under 2 GiB";
- `immutable-releases.md`: "Immutable releases are releases where the assets and associated Git tag cannot be changed after publication"; "Release assets cannot be modified or deleted". Along with it, a "release attestation, which is a cryptographically verifiable record of a release containing the release tag, commit SHA, and release assets" is created;
- `immutable-releases.md`, read again 2026-11-10 on docs.github.com (architecture 3.4; T75; R66): "Only the assets and tag are locked. You can still edit the title and release notes of a published immutable release, and change whether it is marked as a pre-release or as the latest release";
- `verify-release-integrity.md`: "To verify a local artifact is an exact match for a release asset" — `gh release verify-asset RELEASE-TAG ARTIFACT-PATH`;
- `oidc-with-reusable-workflows.md`: "If that job is part of a reusable workflow, the token will include the standard claims that contain information about the calling workflow, and will also include a custom claim called `job_workflow_ref` that contains information about the called workflow";
- the GitHub API, 2026-10-21: `altnovatrail/canvas` has `immutable-releases` at `{"enabled":false,"enforced_by_owner":false}`, and it has one ruleset, `main` (25506234). Read again the same day, `repos/altnovatrail/canvas/rulesets/25506234`: the required checks are "Secrets / gitleaks", "DCO / sign-off", "Documents / docs-check-repo" and "CodeQL / analyze (actions)" with `integration_id` 15368, and "SonarCloud Code Analysis" with 12526. It has no "TypeScript / …" checks. Read again after the merge of T08's pull request #18 and its step in the ruleset, 2026-10-21: the required checks are ten — to these five were added "TypeScript / lint", "TypeScript / test", "TypeScript / vuln", "TypeScript / licenses" and "CodeQL / analyze (javascript-typescript)", all with `integration_id` 15368, and `repos/altnovatrail/canvas/rules/branches/main` applies them to `main`.

### 7.7. Code and tools

(architecture 3.7; R12–R15), read 2026-10-21:

- the npm registry, `npm view <package> time`:
  - Biome 2.5.15 — 2026-09-30, and 2.6.0, 2.6.1 and 2.6.2 — 2026-10-21, at 09:51, 10:28 and 11:08 UTC;
  - Vite 8.3.4 — 2026-10-08, and 8.3.5 — 2026-10-21;
  - Vitest 5.0.5 — 2026-10-15, Playwright 1.64.1 — 2026-10-14, TypeScript 7.0.2 — 2026-07-08, `@types/node` 24.19.2 — 2026-10-09;
  - vitest 5.0.5's peer `vite`, "^6.4.0 || ^7.0.0 || ^8.0.0", is not marked optional, and the peer `vitest` of `@vitest/browser-playwright` 5.0.5 is "5.0.5";
  - typescript-eslint 8.72.0 requires `typescript` ">=4.8.4 <6.1.0";
  - the `exports` of the package `typescript` 7.0.2 are `./lib/version.cjs` and `./unstable/*`, and `bin/tsc` runs the native binary of the platform's package `@typescript/typescript-<platform>`;
- npm 11.19.0 in the container, `@npmcli/config`, `definitions.js`, of `before`: "If passed to `npm install`, will rebuild the npm tree such that only versions that were available **on or before** the given date are installed";
- TypeScript 7.0.2 on the build of this package: `rewriteRelativeImportExtensions` rewrote `./sheet.ts` to `./sheet.js` in the JavaScript, and left `./sheet.ts` in the `.d.ts`. Hence the imports with `.js` in `src/` (R12);
- Node 24.21.0 in the container: `process.features.typescript` is `strip`, and a `.ts` file with types runs with no flags and no warning; `import.meta.main` is declared in `@types/node` 24.19.2;
- Biome: the schema of its settings 2.5.15, `linter.rules.preset`: "recommended", "all", "none". The extension for VS Code is [biomejs/biome-vscode](https://github.com/biomejs/biome-vscode/tree/v3.7.1), tag v3.7.1, commit cd61440:
  - README: "dual-licensed under the MIT License and the Apache License, Version 2.0";
  - `src/locator.ts` looks for Biome first in the settings, then: "Check the project's `node_modules` directory for a Biome binary";
  - in the Marketplace the stable versions are 3.8.0 of 2026-10-21 and 3.7.1 of 2026-06-18, and the versions with a date in their number are pre-releases;
- Playwright: [microsoft/playwright](https://github.com/microsoft/playwright/tree/v1.64.1), tag v1.64.1, commit cfe490d:
  - `packages/playwright-core/browsers.json`: `chromium-headless-shell` has `"revision": "1248"`, `"browserVersion": "156.0.8078.4"`, `"title": "Chrome Headless Shell"`;
  - `packages/playwright-core/src/server/registry/index.ts`: for `ubuntu24.04-x64`, "`cftUrl('linux64/chrome-headless-shell-linux64.zip')`", that is, `builds/cft/${browserVersion}/…` on `https://cdn.playwright.dev`;
  - `docs/src/browsers.md`: "by default, Playwright uses open source Chromium builds" and "Playwright ships a regular Chromium build for headed operations and a separate chromium headless shell for headless mode";
  - `nativeDeps.ts` for `ubuntu24.04-x64`: `chromium` has 21 packages, `firefox` 25, `webkit` 52;
  - `lib/coreBundle.js` of the package playwright-core 1.64.1: `chromiumSwitches` holds `"--disable-dev-shm-usage"`;
- the image `mcr.microsoft.com/playwright:v1.64.1-noble`, index `sha256:7852dc5…`, amd64 manifest `sha256:bdfda2a…` (the MCR registry):
  - the layer `sha256:e20e5ef…`, 314,299,253 bytes compressed, is `playwright-core install chromium`: `chromium-1248` with `WidevineCdm/LICENSE`, `chromium_headless_shell-1248` and `ffmpeg-1013`. Firefox and WebKit are separate layers, of 122,076,107 and 113,748,815 bytes, and they hold no license files;
  - `chromium_headless_shell-1248/chrome-headless-shell-linux64/ABOUT`: "Google Chrome … Copyright 2026 Google LLC. All rights reserved. Chrome is made possible by the Chromium open source project (https://www.chromium.org/) and other open source software (chrome://credits). See the Terms of Service at chrome://terms". `LICENSE.headless_shell` beside it begins with "The Chromium Project" and BSD-3-Clause;
  - in the rebuilt container `chrome-headless-shell --version` answers "Google Chrome for Testing 156.0.8078.4", and the folder takes 273 MB;
- Chrome's terms: [Chrome/ChromeOS/GooglebookOS Additional Terms of Service](https://www.google.com/chrome/terms/), the edition "Last modified: 30 September, 2025": "By using Chrome or ChromeOS, you agree to the Google Terms of Service located at https://policies.google.com/terms and these Google Chrome and ChromeOS Additional Terms of Service. These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS. Most source code for Chrome is available free of charge under open source software license agreements at chrome://credits". The page [Chrome for Testing](https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing), updated 2023-06-12, and the README of [GoogleChromeLabs/chrome-for-testing](https://github.com/GoogleChromeLabs/chrome-for-testing) at commit b9cf0a2 say nothing of the terms of their builds;
- apt 2.8.3 of the base image: its `changelog` has "Initial support for snapshot servers, apt --snapshot option" and "Automatically enable snapshots where supported". `apt-config dump` names snapshot servers for `archive.ubuntu.com` and `security.ubuntu.com`. On empty lists `apt-get update --snapshot 20261021T000000Z` took `noble`, `noble-updates`, `noble-backports` and `noble-security` from `https://snapshot.ubuntu.com/ubuntu/20261021T000000Z`, and `apt-get install -s` of 24 packages gave "0 upgraded, 61 newly installed, 0 to remove";
- Dependabot: [dependabot-core](https://github.com/dependabot/dependabot-core/blob/fda701f/docker/lib/dependabot/docker/file_parser.rb), commit fda701f: the parser of a Dockerfile takes a line only if it matches `FROM_LINE`, `^FROM\s+…`. Groups across several ecosystems: [github/docs](https://github.com/github/docs/tree/1696b2d/content/code-security), commit 1696b2d: "Multi-ecosystem updates allow Dependabot to group dependency updates across different package ecosystems … into a single pull request per group", and `patterns` are required for them. What then happens to the entry's other packages, the documentation does not say;
- Claude Code: [Permissions](https://code.claude.com/docs/en/permissions): "`/path` Path relative to the settings source", and in the project's settings that is `<primary working directory>/path`; "A `*` in a Bash rule matches any text, including spaces"; of a Bash rule, "isn't a security boundary around the program";
- SonarQube Cloud: [Automatic analysis](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/automatic-analysis): of `.sonarcloud.properties`, "Below are the supported optional settings for the `.sonarcloud.properties` file. Wildcard patterns are not allowed". The list of settings itself was not read in the page's text;
- `tutor`: its T11, pull request #13, merged as f501412: the section `samples/` in CLAUDE.md, `/samples/` in `.gitignore`, and in `.claude/settings.json` `Read(/samples)`, `Read(/samples/**)`, `Edit(/samples)`, `Edit(/samples/**)` and `Bash(*samples*)`.

### 7.8. Test coverage

(architecture 3.7; R43), read 2026-11-01:

- Vitest, [docs/guide/coverage.md](https://github.com/vitest-dev/vitest/blob/v5.0.5/docs/guide/coverage.md) at the tag v5.0.5: of v8, "This provider requires Javascript runtime that's implemented on top of V8 engine, such as NodeJS, Deno or any Chromium based browsers such as Google Chrome" and "User's source files can be executed as-is without any pre-instrumentation steps"; of istanbul, "Source code is transformed to add instrumentation before running" and "Execution speed is slower than V8 due to instrumentation overhead"; of what the report covers, "By default Vitest will show only files that were imported during test run";
- in the same place, [docs/guide/projects.md](https://github.com/vitest-dev/vitest/blob/v5.0.5/docs/guide/projects.md): "the root configuration will only influence global options such as `reporters` and `coverage`";
- the npm registry (`npm view`): `@vitest/coverage-v8` 5.0.5 is under MIT, of 2026-10-15, its peers are `vitest` and `@vitest/browser` 5.0.5, and of the versions 5 the only newer one is 5.1.0-beta.1;
- a probe here: the module `src/core/`, which no test loads, entered the report with `LH:0`, and the run of all the tests with coverage took 16.0 s against 15.4 without it.

### 7.9. Vite 8.3.4 for `just demo`

(architecture 3.7; R12, R14, R20), read 2026-10-22:

- the npm registry, `npm view vite time`: 8.3.4 came out 2026-10-08, 8.3.5 on 2026-10-21. Vitest 5.0.5 has in its `peerDependencies` `"vite": "^6.4.0 || ^7.0.0 || ^8.0.0"`;
- `dist/node/chunks/node.js` of the package `vite`:
  - with no list of its own: `allow: raw?.fs?.allow ?? [workspaceRoot]`;
  - `isFileLoadingAllowed` makes no exception for the page's root: a file passes only if `fs.allow.some((uri) => isFileInTargetPath(uri, filePath))`;
  - Vite adds its own client to the list itself: `if (!allowDirs.some((dir) => isParentDirectory(dir, resolvedClientDir))) allowDirs.push(resolvedClientDir)`;
  - CSS by default is `transformer: "postcss"`, and `lightningcss` is taken for minification in the build, `cssMinify`;
- a probe 2026-10-22, in T34's working tree:
  - `just demo` answers 200 on `/` and `/main.ts`;
  - on `/@fs/<tree>/package.json` and `RUN.md`, 403, and the server's log has exactly three allowed folders: `demo`, `src` and `node_modules`;
  - on `/package.json`, `/../package.json` and `/%2e%2e/package.json` it answers with the page itself, `index.html`.

## 8. Licenses and contribution

### 8.1. Apache License 2.0

(architecture 3.6) — this repository's [LICENSE](../LICENSE), section 2, read 2026-10-21: "each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form".

### 8.2. Developer Certificate of Origin 1.1

(architecture 3.6; П-18) — [developercertificate.org](https://developercertificate.org/), read 2026-10-21: (c) "The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it"; (d) "a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely".

### 8.3. GitHub Docs: removing data from a repository

(architecture 3.6) — [github/docs](https://github.com/github/docs/blob/efd4783/content/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository.md), commit efd4783, read 2026-10-21: "If you only rewrite your history and force push it, the commits with sensitive data may still be accessible elsewhere", among other places "Through any pull requests that reference them". And of GitHub Support: it "won't remove non-sensitive data".

## 9. Decisions of the element and the page

### 9.1. The sheet's input

(architecture 3.1, 3.2 and 3.7; R18), read 2026-10-22:

- **perfect-freehand 1.2.3**: the package from the lock file, and its sources are the `sourcesContent` in `dist/esm/index.mjs.map`. The code's defaults are `size = 16` and `last: isComplete = false`, while the README's table of options has "`size` | number | 8" and "`last` | boolean | true". A single point is completed by `getStrokePoints`: "If there's only one point, add another point at a 1pt offset", `UNIT_OFFSET: [1, 1]`. The threshold at the end is "Pixels to skip at the end of a stroke to reduce noise", `END_NOISE_THRESHOLD = 3`, and with `thinning` 0 the radius is `size / 2`, with no pressure. A measurement on straight strokes at `size` 3: at 0.5 and 1 unit long the outline is wider by 0.08 and 0.29 of a unit than when counted in "sheet × 10", and from 2 units on it is the same;
- **Pointer Events**. The [Editor's Draft](https://w3c.github.io/pointerevents/), of the list of intermediate points: "For all other trusted event types, it is an empty list" — for all but `pointermove` and `pointerrawupdate` — and "Untrusted events have their coalesced events list initialized to the value passed to the constructor". The table of buttons of [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/) has "Right Mouse, Pen barrel button" with `button` 2 and `buttons` 2, and "Pen eraser button" with 5 and 32; "Pointer Events do not fire overlapping pointerdown and pointerup events for chorded button presses";
- **canvas-api-onprem**: [MathTrail/canvas-api-onprem](https://github.com/MathTrail/canvas-api-onprem/tree/f4bfe5274f2cd73af3bb24ebc97a83dacf07de84), the branch `main`, commit f4bfe52, Apache-2.0. `ui/src/components/OlympiadCanvas.tsx` has `const PEN_OPTIONS = { size: 5, thinning: 0.5, smoothing: 0.5, streamline: 0.5 }` with no `simulatePressure`, so the library replaces the pressure passed as the third number with one derived from speed, and the points are the position on Konva's stage, in pixels. The search in T09's planning found no code of pen mode or of palm rejection in any branch of canvas-api or in MathTrail's other repositories;
- **`tutor`'s board**: [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3660eac), commit 3660eac, the merge of pull request #20, `internal/board/page.html`: `<canvas id="board" width="1000" height="600" …>`, `ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";`, the background is `ctx.fillStyle = "#fff"`, and a point is `(e.clientX - r.left) * canvas.width / r.width`;
- **Chrome Headless Shell 156** (R13), probes in the container:
  - `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2` in the middle of a test: in the test's frame `devicePixelRatio` became 2, while the `devicePixelContentBoxSize` of a drawing surface of 300 × 420 CSS px stayed 300 × 420. Neither a ResizeObserver entry nor a `change` event of `matchMedia("(resolution: 1dppx)")` came in 20 frames, though `matches` became `false`;
  - with `deviceScaleFactor: 2` in Playwright's context, `devicePixelRatio` is 2 from the very start, and the `devicePixelContentBoxSize` of an element of 300 × 100 CSS px is 300 × 100, both in the test's frame and on the page outside it;
  - the mouse of `Input.dispatchMouseEvent` presses with the `force` it was given, and without one with 0; with `pointerType: "pen"` and `force` a pen comes, with that pressure;
  - `PointerEvent.pressure` is a 32-bit number: 0.6 reads as 0.6000000238418579;
  - Vitest 5.0.5 puts the screenshots of failed tests in `.vitest/attachments/failure-screenshots/`.

### 9.2. The picture of the work and the stop of writing

(architecture 3.1 and 3.3; R20), read 2026-10-22:

- HTML Standard, [canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026:
  - for `toBlob`: "set result to a copy of this canvas element's bitmap", and the file is written from the copy afterwards, "in parallel", and the callback gets it or `null`;
  - for `convertToBlob` of `OffscreenCanvas`, the same: "Let bitmap be a copy of this's bitmap", and the default type is "image/png";
  - in the support tables on the same page, `toBlob` is "Firefox 18+ Safari 11+ Chrome 50+", and `convertToBlob` is "Firefox 105+ Safari 16.4+ Chrome 69+";
- HTML Standard, [Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees), the same date: "Hit-testing must act as if the 'pointer-events' CSS property were set to 'none'". Of the attribute `inert`: "Authors should not specify elements as inert unless the content they represent are also visually obscured in some way";
- MDN, [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events), revision of 2026-08-14: the formal definition has "Inherited yes";
- CSS Shadow Module Level 1, [Editor’s Draft, 28 April 2026](https://drafts.csswg.org/css-shadow-1/): the shadow tree is part of the "flattened element tree, which CSS uses for all purposes after Selectors (including inheritance and box construction)";
- Playwright 1.64.1, `lib/coreBundle.js` of the package `playwright-core`: in headless, `chromeArguments.push("--hide-scrollbars", …)`, so in the tests the sheet has no scrollbars.

### 9.3. The eraser and the writing history

(architecture 3.1, 3.3 and 3.5; R22), read 2026-10-25:

- DOM Standard, [Event](https://dom.spec.whatwg.org/), Living Standard — Last Updated 19 October 2026: "The timeStamp attribute must return the value it was initialized to", and when an event is created, "Initialize event's timeStamp attribute to the relative high resolution coarse time given time and event's relevant global object";
- High Resolution Time, [Editor's Draft 1 September 2026](https://w3c.github.io/hr-time/): "The now() method MUST return the number of milliseconds in the current high resolution time given this's relevant global object (a duration)", and "The relative high resolution coarse time given a moment from the monotonic clock coarseTime and a global object global, is the duration from global's relevant settings object's time origin to coarseTime". So an event's `timeStamp` and `performance.now()` count from one start, the page's time origin;
- perfect-freehand 1.2.3, the `sourcesContent` in `dist/esm/index.mjs.map`: `getStrokeRadius` is `size * easing(0.5 - thinning * (0.5 - pressure))`. At `size` 3, `thinning` 0.5 and pressure 1 the radius is 2.25 units of the sheet: this is `INK_REACH`, the farthest the ink goes from a stroke's points;
- the pen's eraser is "Pen eraser button", with `button` 5 and `buttons` 32, in the table of buttons of Pointer Events Level 3 (above, "The sheet's input"). The DevTools protocol does not have it: in `types/protocol.d.ts` of the package `playwright-core` 1.64.1, `type MouseButton = "none"|"left"|"middle"|"right"|"back"|"forward"`, `buttons` has "Left=1, Right=2, Middle=4, Back=8, Forward=16, None=0", and `pointerType?: "mouse"|"pen"`. So the tests give it by synthetic events;
- `tutor`'s sample format: «стирание — время и ID стёртых штрихов» (above, "tutor"): it has no undo and no clearing.

### 9.4. Layers, the grid and the statement

(architecture 3.1, 3.2 and 3.3; R23), read 2026-10-25:

- HTML Standard, [event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering), Living Standard — Last Updated 22 October 2026: in "update the rendering", "For each doc of docs, run the scroll steps for doc", and later "For each doc of docs, run the animation frame callbacks for doc";
- Chrome Developers, [Inside look at modern web browser (part 4)](https://developer.chrome.com/blog/inside-browser-part4), Mariko Kosaka, 2018-09-21: "If no input event listeners are attached to the page, Compositor thread can create a new composite frame completely independent of the main thread";
- [SVG 2](https://www.w3.org/TR/2026/CR-SVG2-20261006/), W3C Candidate Recommendation Snapshot 06 October 2026, of `non-scaling-stroke`: "stroke outline shall be calculated in the "host" coordinate space" and "The host coordinate space for vector-effect is the viewport coordinate system of the furthest ancestral SVG viewport";
- the forced colors mode:
  - [CSS Color Adjustment Level 1](https://www.w3.org/TR/2025/CR-css-color-adjust-1-20251216/), CR Snapshot 16 December 2025: "svg|svg { forced-color-adjust: preserve-parent-color; }";
  - MDN, [`forced-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors), revision of 2026-04-20: "The browser provides the color palette to authors through the CSS system color keywords";
  - MDN, [system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color), revision of 2026-08-12: Canvas — "Background of application content or documents", CanvasText — "Text color in application content or documents", GrayText — "Text color for disabled items (for example, a disabled control)";
- [CSS Custom Properties for Cascading Variables Level 1](https://www.w3.org/TR/css-variables-1/), CR Snapshot 16 June 2022: if the value after the substitution of `var()` is invalid, the computed value is "Either the property's inherited value or its initial value depending on whether the property is inherited or not, respectively, as if the property's value had been specified as the unset keyword";
- MDN, [blob: URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob), revision of 2026-09-17: "Each of these must be released by calling URL.revokeObjectURL() when you no longer need them" and "revoke object URLs only when the resource is no longer accessible by the user (such as when the image is removed from the DOM)";
- formulas, what the choice was made from:
  - [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.7/mathml/elements/math.json), release v8.1.7: `math` is in Chrome since 109, in Firefox since 4, in Safari since 5.1; web-features 3.44.0 calls `mathml` Baseline since 2023-01-12;
  - the npm registry: `katex` 0.19.1 of 2026-10-23, MIT, with 60 font files, and its README says "Make sure to include the CSS and font files in both cases"; `temml` 0.14.0 of 2026-10-08, MIT, and its README says "Temml is a LaTeX-to-MathML Core JavaScript conversion utility";
- tasks without formulas, and the statement above the sheet:
  - `tutor`, [6af03a2](https://github.com/altnovatrail/tutor/tree/6af03a29585789dc51f5f359b67d2ff82e8add79): the board's five tasks are `internal/board/tasks.go`, the synthetic samples `internal/synth/synth.go`, for example «Реши уравнение 2(x − 3) = 10.» and «Вычисли (47 + 19) : 6.». The bank's format, `internal/sample/bank.go`, has "Statement is the condition the writer solves, in Russian", and no fields for a picture, a formula or a canvas. The measurement's bank of tasks itself does not exist yet: `tutor`'s T15 is `[?]`. The board, `internal/board/page.html`, puts the statement above the sheet, `<p id="statement" lang="ru">`, and writes the text into it by `textContent`;
  - MathTrail standalone, [e90334e](https://github.com/mathtrail/mathtrail-standalone/tree/e90334e1946ae26c627263075ae886636aa49270): 603 tasks in `content/examples/*.json`, 95 of them with a picture, 6 with a fraction a/b in the question, and no LaTeX and no Unicode fractions. The question is `<p class="mt-task-text">`, in plain text. A picture the card cannot draw, it skips: "a picture the card cannot draw all read as none, and the task stands on its words" (`web/src/widget/payload.ts`);
  - canvas-api, commit 0901af0 (above), read again 2026-10-25: `docs/spec.md` has «| Условие задачи | текст над листом, а не часть листа; на картинки проверки оно не попадает |» and «Ширина области листа ограничена, поэтому на широком экране по бокам остаются поля». Neither KaTeX nor MathJax nor MathML is in the repository;
  - the prototype `spec/draft/NovaTrail Widget.html` at the tag v0.2.18: the statement is in the header above the squared field, and the squares are a CSS background;
- `app`, [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504) of 2026-10-21: T07 «Языки интерфейса (О-2) и доступность интерфейса» is `[ ]`, and its «Сделать» has «стандарт доступности и схема переводов — общие для пакетов интерфейса»;
- probes in the container, Chrome Headless Shell 156 through Playwright 1.64.1:
  - with `forcedColors: "active"` in Playwright's context, `matchMedia("(forced-colors: active)")` matches from the very start. The page's own color `rgb(255, 0, 0)` computes to the color CanvasText, so the mode forces the colors, not only the media query;
  - Vitest 5.0.5's `page.screenshot` with `save: false` writes no file: "If file is not saved, `page.screenshot` always returns `base64` screenshot" (`@vitest/browser/context.d.ts`). `page.getByRole` goes into an open shadow root.

### 9.5. Stroke groups

(architecture 3.2, 3.5 and 3.7; R24), read 2026-10-25:

- pauses in children's writing: M. Pascual, O. Soler, N. Salas, ["In a split second: Handwriting pauses in typical and struggling writers"](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.1052264/full), Frontiers in Psychology, published 2023-01-06. Eighty children of grades 3 and 5 wrote the alphabet with a Neo Smartpen, and pauses were counted from 100 ms: "The average duration of handwriting pauses was around 400ms, in line with assumptions that transcription pauses would fall under the 2,000ms threshold", "3rd graders made more and longer pauses than 5th graders" and "There is only a weak empirical basis to claim that specific average numbers and durations of pauses may be associated with specific writing processes";
- the study "A child's handwriting on the canvas and the AI tutor" («Рукопись ребёнка на канве и ИИ-наставник») (above), the example "ladder" («лестница»): «Строит группы и хранит у себя таблицу «группа → ID штрихов» (A → s1–s9, B → s10–s11, C → s12–s20, D → s23–s24)». The group labels there go in the order of writing: the drawing, the caption, the expression, the answer in a circle;
- `tutor`, [016d1e5](https://github.com/altnovatrail/tutor/tree/016d1e50f5544bbc55f7f98e43ab33eaa2d92de0) of 2026-10-25:
  - R08 tutor: «Группы для меток строятся так, как их построит устройство, — по пространству и времени, без разметки»;
  - R11 tutor: «лог действий строит программа раннера так, как его построило бы устройство, — из штрихов и стираний, без разметки. В нём порядок групп, долгие паузы не короче 6 с, сколько стёрто и у какой группы, возврат к прежней группе»;
  - R21 tutor: «Большой замер чтения ИИ возвращается — по плану architecture 3.1, только на моделях Claude»; its tasks wait for the measurement's planning;
  - in architecture 3.1 tutor: «группы — те же, что для меток, по пространству и времени, а их порядок — по первому штриху»;
  - the synthetic samples, `internal/synth/synth.go`: `charHeight = 36 // the height of a digit`, `charAdvance = 26`, `lineStep = 80`, `w.pause(1500)` before each line and `w.pause(120 + w.rng.Int64N(130))` between strokes;
  - there is no algorithm of groups and no threshold, in the documents or in the code;
- `spec`, the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32 of 2026-10-23: the epic E3 is still a row of table 2 of its RUN.md, with no tasks. The rule of groups is not there: T12 gives it;
- MathTrail:
  - canvas-api, commit 0901af0 (above): no groups, and `docs/spec.md` has «сегментации строк и штрихов на сервере больше нет». In its abandoned design, at commit [2796f48](https://github.com/mathtrail/canvas-api/tree/2796f48), a stroke's row is by the median y, `row = floor((median_y − 200) / 100) + 1`, and a row is over when the child «не трогал холст 6 секунд»;
  - standalone, [491d5c2](https://github.com/mathtrail/mathtrail-standalone/tree/491d5c28c255353b50b84ab1dc68a7022a3a7d55): no groups, and in `SPEC.md` the prototype is "what it only pretends to do yet: recognising handwriting and drawings, the companion's voice, problems from a photo";
- The Go Programming Language Specification, [`doc/go_spec.html`](https://github.com/golang/go/blob/72edc307c89f81d0f1270dcb02d48ad976803551/doc/go_spec.html), "Language version go1.28 (October 9, 2026)": "An implementation may combine multiple floating-point operations into a single fused operation, possibly across statements, and produce a result that differs from the value obtained by executing and rounding the instructions individually";
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html), the branch `main` of 2026-10-23: `Math.hypot` is "Return an implementation-approximated Number value representing the square root of the sum of squares of the mathematical values of the elements of _coerced_";
- Vitest 5.0.5, `dist/chunks/index.1TqnEahn.js` in `node_modules`: `updateSnapshot` is `"none"` when CI is running and there is no flag of update, and `"new"` otherwise. A written snapshot file is not rewritten without `-u`, and a mismatch with it is a failure.

### 9.6. The crop

(architecture 3.1, 3.2, 3.5 and 3.7; R25), read 2026-10-25. The providers' pages have no date of revision:

- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision):
  - "Each model has a maximum native image resolution, expressed as a long-edge limit and a visual-token limit. Images larger than either limit are downscaled before processing";
  - the table of limits has "High-resolution | Claude 4.7 and later models | 2,576 px | 4,784" and "Standard | All other models | 1,568 px | 1,568";
  - "An image, therefore, costs `⌈width / 28⌉ × ⌈height / 28⌉` visual tokens";
  - "Claude might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels";
  - "Claude supports JPEG, PNG, GIF, and WebP images"; "The maximum dimensions for each image are 8000x8000 px"; the size of an image in the API is "10 MB (base64-encoded)", and on Amazon Bedrock "5 MB (base64-encoded)";
- Anthropic, [Coordinates and bounding boxes](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates):
  - "Claude finds the largest aspect-preserving size that satisfies both of the model's image limits": a side no longer than 1,568 px at the standard level and 2,576 at the high one, and no more than 1,568 and 4,784 tokens;
  - "The token limit can also trigger a resize when neither side exceeds the edge limit";
- OpenAI, [Images and vision](https://developers.openai.com/api/docs/guides/images-vision): "patch_count = ceil(width/32)×ceil(height/32)"; for `gpt-6-astra` at `high`, "up to 2,500 patches and a 65,535-pixel maximum dimension", for `gpt-5.6-sol`, `-terra` and `-luna`, "`high` fits within 2048 × 2048 pixels and 2,500 patches";
- `tutor`, [74f0019](https://github.com/altnovatrail/tutor/tree/74f0019b2742a0d6a4e7ee5732da8d7f31da16a4) of 2026-10-25:
  - R08 tutor: «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px; основная — 32 px»; how to count the median, how thick a line is and what the limit of size is, neither the documents nor the code say: there is no code of the rendering, the groups or the median, and tutor's T21 and T22 are postponed;
  - the 2026-10-23 amendment to R06 tutor: «OpenAI из замера убран: замер идёт только на моделях Claude. По этой записи это `claude-haiku-5-5` и `claude-opus-5-5`»;
  - the 2026-10-25 amendment to R19 tutor: «Картинка не уменьшается: запрос велит API отвергнуть картинку, которую тот уменьшил бы, — иначе пиксели модели разошлись бы с пикселями доски»; in tutor's T45 the board's picture is «792 токена, меньше предела стандартного уровня в 1 568, и ни одна сторона не длиннее 1 568 px»;
  - the board, `internal/board/page.html`, draws `ctx.lineWidth = 3` on a drawing surface of 1000 × 600, a pixel per unit, and a digit of the synthetic samples is `charHeight = 36`;
  - R11 tutor gives the model «видимые штрихи в порядке написания, упрощёнными ломаными в целых пикселях вырезки»;
  - in architecture 3.1 tutor: «Вырезка при цифрах 32 px — около 320×260 у листа строк и около 600×450 у свободного решения с рисунком. Это допущение, а не замер»;
- `spec` v0.2.18 and the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32 of 2026-10-23:
  - on both, concepts 15 spec has «рамка группы | group box | общий прямоугольник штрихов группы, в долях вырезки»; the epic E3 of their RUN.md has the rules of the crop, «они одни у устройства и раннера», and test vectors «от геометрии с группами к параметрам и рамкам вырезки, а не байты PNG»; T28's «Вход» there has «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32»;
  - Т-32 has «Годность рамки — целые 0–1000 и min < max — проверяет адаптер, а у негодной рамки места нет»; Т-31 has «От групп зависит и масштаб вырезки»;
  - only on `main`: T28's «Вход» has «масштаб вырезки задаёт медианная высота группы штрихов», and the card architecture 3.2 spec has the workbook's «вырезку ячейки»;
- canvas-api, [`docs/spec.md`](https://github.com/mathtrail/canvas-api/blob/0901af0439280334b3da33ffc4cc5c853e4403ff/docs/spec.md), section 4.3: the picture for checking is the whole sheet, «одна единица — один пиксель», and the lines are «чёрные линии постоянной толщины — 4 единицы, со скруглёнными концами»;
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html): for `Math.sqrt`, "Return 𝔽(the square root of ℝ(_n_))", and 𝔽 is "the IEEE 754-2019 roundTiesToEven mode"; for `Math.round`, "preferring the Number closer to +∞ in the case of a tie"; for division, "Return 𝔽(ℝ(_x_) / ℝ(_y_))"; for `Math.hypot` and `Math.sin`, "implementation-approximated";
- Go, [`src/math/sqrt.go`](https://github.com/golang/go/blob/0d37007fda071631fbcb520b99c85a8e4c93108a/src/math/sqrt.go): "On systems where Sqrt is a single instruction, the compiler may turn a direct call into a direct use of that instruction instead", and the fallback code is "Return correctly rounded sqrt"; `doc/go_spec.html` (above) has "An explicit floating-point type conversion rounds to the precision of the target type, preventing fusion that would discard that rounding";
- [PNG, Third Edition](https://www.w3.org/TR/png-3/), W3C Recommendation 24 June 2025: in 11.2.1, for color type 0, "Greyscale | 0 | 1, 2, 4, 8, 16"; in 10.1, "deflate compression with a sliding window … of at most 32768 bytes"; in 11.3, "Ancillary chunks may be ignored by a decoder"; in 5.5 the CRC is computed "on the preceding bytes in the chunk, including the chunk type field and chunk data fields, but not including the length field";
- [RFC 1950](https://www.rfc-editor.org/rfc/rfc1950), 2.2: "The information in FLEVEL is not needed for decompression"; Adler-32 is "two sums accumulated per byte … Both sums are done modulo 65521". [RFC 1951](https://www.rfc-editor.org/rfc/rfc1951): the fixed codes are 3.2.6, and 3.1.1 has "Huffman codes are packed starting with the most-significant bit of the code"; the length 258 is the code 285 with no extra bits (3.2.5).

### 9.7. The tutor's marks

(architecture 3.1, 3.2, 3.3, 3.5 and 3.7; R26), read 2026-10-26:

- canvas-api, commit 0901af0 (above):
  - R43 canvas-api: «Клиент берёт штрихи, которые были на листе в момент Check и у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц. Их он обводит с отступом»; «Если таких штрихов нет или модель места не нашла, рамки нет — остаётся только вопрос». R43 canvas-api has no amendments;
  - spec 4.4 canvas-api: «Сервер пропускает только годную рамку: четыре целых числа от 0 до 1000, `xmin < xmax` и `ymin < ymax`, и площадь не больше четверти листа»; the client «обводит общую рамку этих штрихов с отступом 10 единиц на слое подсказок»; «Рамка и вопрос исчезают, когда ребёнок снова нажал Check или стёр любой из обведённых штрихов»;
  - there is no code of the binding: it is canvas-api's task T71, and it is not done;
- `tutor`, [0f624a3](https://github.com/altnovatrail/tutor/tree/0f624a31d1a01cf02af6fa28816383e9bc3b28aa) of 2026-10-25:
  - T45's amendment to R19 tutor: «Рамку модели доска рисует как есть, с углами в любом порядке»; among what it rejected, «пометка, притянутая к штрихам, и метки групп на копии картинки, как в R08»;
  - R24 tutor rejects «метки на полях и притяжка рамки к штрихам (R08, R11) — попадание считается по строке, и модели хватает рамки», and in architecture 3.1 tutor a box counts «если оценка `error` и рамка попала в строку первой ошибки: в рамке с полем 8 px больше всего видимых точек именно этой строки»;
  - R08 tutor: «На реальной школьной рукописи у лучшей модели без дообучения F1 по рамкам ответа — не выше 55 %»;
- `spec` v0.2.18 and the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32: of marks, boxes and snapping, nothing changed between them:
  - concepts 8 spec: «Слой наставника — рамки, пометки, номера, короткие надписи и пунктирный набросок «как начать»», «Набросок рисуется под записью ученика, рамки и пометки — над ней» and «Ни то, ни другое не меняет и не закрывает работу ученика (R05)»;
  - concepts 15 spec has no term «пометка», neither Russian nor English;
  - R36 spec: «Контекст отправки — где вырезка лежит на листе (`sheet_box`), рамки групп штрихов и таблицу «метка группы → ID штрихов» — держит `app`, а не канва»;
  - Т-31 and Т-32 are open, and the epic E3 has not begun;
- Vitest 5.0.5, `@vitest/browser`, `dist/locators-BHr21v4S.js` in `node_modules`: the role of the element `svg` is `` SVG:()=>`img` ``, and `aria-hidden` is in the list of ARIA's global attributes.

### 9.8. The package's interface

(architecture 3.1, 3.3 and 3.7; R27), read 2026-10-26:

- `spec`: the branch `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32, as at T14:
  - R36 spec: «Элемент получает данные свойствами, отдаёт работу методом, а изменения и просьбы — событиями» and «У `canvas`: историю письма — событием после каждого штриха, вырезку для проверки — методом `exportWork()`»; `spec` does not name the event;
  - T28's «Вход» in `spec`'s RUN.md: «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32» and «Как поля называются в схеме, решает T28». T28 and T35 there are not done, `spec`'s releases have no files, and there is no package of `spec`'s types in npm;
  - on `main` the first slice has two canvas kinds, the handwriting sheet and the workbook, by the decision on three modules that came out in v0.2.19, and the card architecture 3.2 spec was extended on 2026-10-22: the workbook — the page, the answer slots, a slot's crop and the template layer — is detailed by `canvas`. `canvas`'s submodule `spec` is on v0.2.18;
- `app`: [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), the branch `main`:
  - no code: "There is no code here yet: the framework and the build are the first thing that epic decides";
  - T01 «Фреймворк и сборка» and T07 «Языки интерфейса (О-2) и доступность интерфейса» in its RUN.md have not begun. T07 has «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»»;
  - what is kept on the device, its T02 decides: «работа нужна на устройстве, пока идёт попытка»;
- `tutor`: [41fde66](https://github.com/altnovatrail/tutor/tree/41fde663368d05ddb06fcfc5ce97955395ce309c), the branch `main`:
  - the measurement does not take `canvas`: the samples with strokes are written by the board's recording mode, in the format `tutor-sample`: «Не страница `canvas`»;
  - the board's recording mode, R25 tutor: «Всё, чего ластик коснулся между нажатием и отпусканием, — одна запись стирания». tutor's T13 has «Undo стирает последний видимый штрих, и это пишется стиранием — помаркой», and «Clear начинает лист заново со второго нажатия»;
- the package `@altnovatrail/canvas` has not come out: `altnovatrail/canvas` has no releases (`gh release list`), and `npm view @altnovatrail/canvas` answers "404 Not Found".

### 9.9. The sheet's own buttons

(architecture 3.1, 3.2, 3.3 and 3.7; R28), read 2026-10-26:

- `spec`: the branch `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32, as at T15, and the submodule's tag v0.2.18 are the same in this:
  - concepts 8 spec: «Инструменты разрешает задача: перо, ластик, линейка, транспортир, калькулятор, клавиатура, микрофон». `spec` nowhere calls undo and clearing tools;
  - the illustration concepts 16.1 spec is `canvas: { kind: handwriting-sheet, grid: squares, tools: [pen, eraser] }`, and concepts 16 spec says of it «Это не формат: имена полей и запись условные, их задаст схема модуля»;
  - T28's «Сделать» in `spec`'s RUN.md has «канва задачи: вид и его параметры, инструменты и слой шаблона». There is no schema of the task: T28 is not done;
  - on `main`, in `format/README.md`, section 2, a minor version of the format may add "a new check kind, canvas kind, tool or list value";
  - О-2 advises «английский и русский»; `spec` has no common schema of translations for the UI packages and no level of accessibility;
- `app`: [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), the branch `main`, as at T15: T01 and T07 have not begun, and T07 has «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»». How `app` passes the language to `canvas` is written nowhere;
- `tutor`: [90589e5](https://github.com/altnovatrail/tutor/tree/90589e54f179652b96ac2941cf7765c9d7f4b25e), the branch `main`:
  - the board, `internal/board/page.html`: the row `.tools` under the sheet is "Undo stroke", "Clear" and "Check", not sticky. R19 tutor: «кнопки, подписи и сообщения доски на английском, как весь код (R14 spec)»;
  - the recording page, `internal/board/record.html`: under the sheet, `<button id="eraser" type="button" aria-pressed="false">Eraser</button>`, "Undo", "Clear" and "Done", and "Undo" is disabled when there is nothing to undo: `byId("undo").disabled = !writing || visible().length === 0;`;
- canvas-api: [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0439280334b3da33ffc4cc5c853e4403ff): the sheet is not built, and its task T48 canvas-api is not done. The mockup `draft/MathTrail Minimal.html` has a panel of icons over the sheet, `position:absolute;top:12px;right:12px`, buttons of 44 × 44 px with `title` and without `aria-*`. In product 8 canvas-api: «Крупные кнопки и области касания»;
- WAI-ARIA Authoring Practices:
  - [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) — "Use toolbar as a grouping element only if the group contains 3 or more controls"; "the keyboard tab sequence includes one stop for the toolbar and arrow keys move focus among the controls in the toolbar"; "in circumstances where discoverability of a function is crucial, it may be helpful if disabled controls are focusable so screen reader users are more likely to be aware of their presence";
  - [the example of a toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/examples/toolbar/) — "since pressing one toggles off another so that only one button in the group is in the pressed state, the toggles behave like radio buttons";
  - [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) — "when navigating through a radio group in a toolbar with arrow keys, the button that is checked does not change";
  - [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) — "When the action associated with a button is unavailable, the button has aria-disabled set to true";
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled), Recommendation 06 June 2023 — `aria-disabled` "Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable";
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), Recommendation 12 December 2024:
  - 2.5.8 — "at least 24 by 24 CSS pixels";
  - 2.5.5 — "at least 44 by 44 CSS pixels";
  - 2.4.11 — "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content";
- HTML Standard, Living Standard — Last Updated 26 October 2026:
  - [language](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes) — "If the node's parent is a shadow root — Use the language of that shadow root's host", and `lang` of `HTMLElement` is "[CEReactions, Reflect] attribute DOMString lang": a reflection of its own attribute;
  - [the requirements for a constructor](https://html.spec.whatwg.org/multipage/custom-elements.html) — "The element's attributes and children must not be inspected, as in the non-upgrade case none will be present" and "The element must not gain any attributes or children";
  - [`disabled`](https://html.spec.whatwg.org/multipage/interaction.html#focusable-area) — focus goes only to what is "not actually disabled";
- [RFC 4647](https://www.rfc-editor.org/rfc/rfc4647#section-3.4), section 3.4 — "In the lookup scheme, the language range is progressively truncated from the end until a matching language tag is located", and "Single letter or digit subtags … are removed at the same time as their closest trailing subtag". In ECMA-402 such a lookup is an internal operation, and `supportedLocalesOf` looks among the engine's own languages; `Intl.LocaleMatcher` is at stage 1 ([tc39/proposals](https://github.com/tc39/proposals/blob/HEAD/ecma402/README.md));
- forced colors: [CSS Color 4](https://www.w3.org/TR/css-color-4/#css-system-colors) — ButtonFace "The face background color for push buttons"; [CSS Color Adjustment 1](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties) — for a color that is not a system one, "its used value is instead forced to a system color";
- the sticky row: [CSS Positioned Layout 3](https://www.w3.org/TR/css-position-3/#valdef-position-sticky) — sticky holds "in reference to the nearest ancestor scroll container's scrollport"; [CSS Overflow 3](https://www.w3.org/TR/css-overflow-3/#valdef-overflow-hidden) — with `hidden`, and `auto` with no overflow behaves like it, the box is "still a scroll container"; MDN, [Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context), revision of 2026-09-28 — a stacking context is made by "Element with a position value fixed or sticky";
- web.dev, [Custom element best practices](https://web.dev/articles/custom-elements-best-practices), Last updated 2017-08-14 — "Do not dispatch events in response to the host setting a property (downward data flow)".

### 9.10. Input on tablets

(architecture 2.6, 3.1, 3.2, 3.3 and 3.7; R29), read 2026-10-26:

- [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/), W3C Recommendation of 30 June 2026:
  - `width` — "The width (magnitude on the X axis), in CSS pixels (see [CSS21]), of the contact geometry of the pointer. This value MAY be updated on each event for a given pointer", and where the geometry is not measured, 1;
  - `touch-action` "does in fact apply to all forms of pointer inputs that allow direct manipulation for panning and zooming", and for `none`, "Direct manipulation interactions that begin on the element MUST NOT trigger behaviors related to viewport panning and zooming";
  - of palm rejection by the device itself: "devices that support both touch and pen interactions may ignore touch inputs while the pen is actively being used, to allow users to rest their hand on the touchscreen while using the pen";
  - a touch and a pen on the screen "SHOULD behave exactly as if setPointerCapture was called on the target element just before the invocation of any pointerdown listeners";
- [W3C pointerevents issue #203](https://github.com/w3c/pointerevents/issues/203), open: "In some situations like note taking applications, you might want the pen to draw by default, while still allowing a finger to scroll. That's not possible to express with `touch-action` today.";
- the width of a touch in the browsers' code: read in the code, not checked on devices:
  - WebKit on iOS, `Source/WebCore/dom/ios/PointerEventIOS.cpp`: `m_width(2 * event.radiusXAtIndex(index))`, and the radius on both axes is the touch's `majorRadius`;
  - Chromium: the width of a touch is `radius_x * 2`, and for `pointerup`, "For pointerup, even known width/height is ignored in favor of the default value of 1";
- [recto, pull request #32](https://github.com/ErenDenizK/recto/pull/32) of 2026-10-19 — another project's report, not a measurement: "iOS Safari reports a touch's width and height as twice the contact radius, about 40–60 px for a fingertip. So most finger presses were treated as a palm and dropped";
- WebKit, bug [269535](https://bugs.webkit.org/show_bug.cgi?id=269535) "Canva: No pointer events from Apple Pencil while touch present" — status NEW, last changed 2026-08-11. In the comments:
  - "If the user rests their hand on the screen prior to starting drawing we get no PointerEvents for the Apple Pencil";
  - "still seeing this problem with the iOS 27 developer beta";
  - of Chrome, "FWIW, in Chrome 121 on Android, when a stylus makes contact, pointerup events are dispatched for any ongoing touches and a pen pointerdown is dispatched";
- WebKit, bug [238543](https://bugs.webkit.org/show_bug.cgi?id=238543) "If pinch-zoom is disabled with touch-action, then multi finger scrolling should also be disabled" — status NEW;
- the Apple forum, [thread 773213](https://developer.apple.com/forums/thread/773213), January 2025, with no answer from Apple: "Apple Pencil down blocks touch input until lifted and touch input blocks Apple Pencil input", and this holds for touch and mouse events too: "any variant exhibits the same behavior";
- DevTools protocol, [`Input.dispatchTouchEvent`](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/Input.pdl): for a touch point, `radiusX` is "X radius of the touch area (default: 1.0)", and "TouchEnd and TouchCancel must not contain any touch points". T35's probe in the container's Chrome Headless Shell:
  - touches come as pointer events `touch`, with the width as twice `radiusX`, and with implicit capture;
  - `touchEnd` with fingers releases only them;
  - `timestamp` reaches `timeStamp`;
  - for `pointerup` the width is 1;
  - `navigator.maxTouchPoints` is 0;
- Playwright, [`docs/src/browsers.md`](https://github.com/microsoft/playwright/blob/41d368a5c7e7a2f32f6109ba736af9f25cfacd3d/docs/src/browsers.md), commit 41d368a: "Playwright's WebKit is derived from the latest WebKit main branch sources" and "Playwright doesn't work with the branded version of Safari since it relies on patches";
- Android, [`ViewConfiguration.java`](https://github.com/aosp-mirror/platform_frameworks_base/blob/8b948e548b782592ae280a3cd9a91798afe6df9d/core/java/android/view/ViewConfiguration.java), commit 8b948e5:
  - `TAP_TIMEOUT = 100` — "Defines the duration in milliseconds we will wait to see if a touch event is a tap or a scroll";
  - `TOUCH_SLOP = 8` — "Distance a touch can wander before we think the user is scrolling in dips";
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation of 12 December 2024:
  - 2.5.1 Pointer Gestures (A) — "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential";
  - 2.5.7 Dragging Movements (AA) — "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author";
  - [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — "This criterion does not apply to scrolling and dragging gestures enabled by the user agent", but it "does apply if content actively suppresses the user agent's own scrolling functionality and/or implements its own scrolling mechanism"; and also: "achieving keyboard equivalence for a dragging operation does not automatically meet this success criterion";
- Apple, Human Interface Guidelines, [Apple Pencil and Scribble](https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble) — "Let people choose when to switch between Apple Pencil and finger input".

### 9.11. The buttons «Выше» and «Ниже»

(architecture 2.6, 3.1, 3.2 and 3.3; R33), read 2026-10-27:

- the step of Page Down in the engines' code: read in the code, not checked on devices:
  - Chromium, [`cc/input/scroll_utils.h`](https://github.com/chromium/chromium/blob/377f5e85f70e900020b60a03f67f07032f6ad1af/cc/input/scroll_utils.h) and [`scroll_utils.cc`](https://github.com/chromium/chromium/blob/377f5e85f70e900020b60a03f67f07032f6ad1af/cc/input/scroll_utils.cc), commit 377f5e8: `kMinFractionToStepWhenPaging = 0.875f`. `kMaxOverlapBetweenPages` is `40` on Mac (`#if BUILDFLAG(IS_MAC)`), and otherwise `std::numeric_limits<int>::max()`. The step is `std::max(min_page_step, length - kMaxOverlapBetweenPages)`, where `min_page_step = length * kMinFractionToStepWhenPaging`;
  - WebKit, [`Source/WebCore/platform/Scrollbar.h`](https://github.com/WebKit/WebKit/blob/e427188d73fb165e49a4aade8c172b47ea6fbe02/Source/WebCore/platform/Scrollbar.h), commit e427188: `static float minFractionToStepWhenPaging() { return 0.8; }`, and `pageStep` is the greater of `viewWidthOrHeight * minFractionToStepWhenPaging()` and `contentWidthOrHeight - maxOverlapBetweenPages()`;
  - WebKit's greatest overlap by default is `std::numeric_limits<int>::max()`, by [`ScrollbarTheme.h`](https://github.com/WebKit/WebKit/blob/8b21bb68c6fbc325572bb23189e9948b14dd740d/Source/WebCore/platform/ScrollbarTheme.h), commit 8b21bb6. On Mac it is `40`, by [`ScrollbarThemeMac.h`](https://github.com/WebKit/WebKit/blob/b8f13b0bdb24aa2c7cce86b426d21a7cdcfe7d9b/Source/WebCore/platform/mac/ScrollbarThemeMac.h), commit b8f13b0. [`ScrollbarThemeIOS.h`](https://github.com/WebKit/WebKit/blob/b279109c4a222d514467aead0cd97c00b777edfd/Source/WebCore/platform/ios/ScrollbarThemeIOS.h) (commit b279109) and `ScrollbarThemeComposite.h` have no overlap of their own;
  - WebKit on iOS:
    - the keyboard scrolls with [`WKKeyboardScrollingAnimator.mm`](https://github.com/WebKit/WebKit/blob/3fdbb7698ab689d74dc1b76f1741362a2ede8e0b/Source/WebKit/UIProcess/ios/WKKeyboardScrollingAnimator.mm), commit 3fdbb76: `const CGFloat defaultPageScrollFraction = 0.8;`, and a page is the height of what scrolls multiplied by it;
    - for a page, [`WKContentViewInteraction.mm`](https://github.com/WebKit/WebKit/blob/a647e38977957c6fd89a430759d9d51fa50bce2b/Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm), commit a647e38, computes it: `WebCore::Scrollbar::pageStep(protect(_page)->unobscuredContentRect().height(), self.bounds.size.height)`, the same 0.8 of the visible part;
  - Firefox, [`modules/libpref/init/StaticPrefList.yaml`](https://github.com/mozilla-firefox/firefox/blob/b94dd99eb54f0b0a883a2ad6597facf350c27a80/modules/libpref/init/StaticPrefList.yaml), commit b94dd99: `toolkit.scrollbox.pagescroll.maxOverlapPercent` is `10`, and `maxOverlapLines` is `2`, "The maximum overlap between pages when scrolling with page-up/page-down/spacebar";
- WebKit, bug [277290](https://bugs.webkit.org/show_bug.cgi?id=277290) "AX: Scrolling containers inoperable with keyboard" — status NEW, filed 2024-07-29:
  - "For containers that allow scrolling, a keyboard-only user cannot scroll the container";
  - in a comment of 2025-12-11, "Since Chrome finally fixed this in January, WebKit is the last holdout";
  - a pull request for it was proposed 2026-06-06;
- Chrome, ["Keyboard focusable scrollers"](https://developer.chrome.com/blog/keyboard-focusable-scrollers), updated 2024-03-20:
  - "This feature allows scrollers without tabindex value set and without any focusable children to be keyboard focusable";
  - "To improve performance, this feature has been pushed back to Chrome 132".

### 9.12. The workbook

(architecture 2.7; R34), read 2026-10-27:

- [SVG 2](https://www.w3.org/TR/2026/CR-SVG2-20261006/), W3C Candidate Recommendation Snapshot 06 October 2026, the chapter [Text](https://www.w3.org/TR/2026/CR-SVG2-20261006/text.html):
  - `textLength` — "The author's computation of the total sum of all of the advance values that correspond to character data within this element";
  - for `lengthAdjust`, the value `spacing` is "Indicates that only the advance values are adjusted. The glyphs themselves are not stretched or compressed", and `spacingAndGlyphs` is "Indicates that the advance values are adjusted and the glyphs themselves stretched or compressed in one axis";
  - "The user agent is required to achieve correct start and end positions for the text strings, but the locations of intermediate glyphs are not predictable";
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data/blob/v8.1.7/svg/elements/text.json), release v8.1.7: `textLength` and `lengthAdjust` of `<text>` are in Chrome since 1, in Firefox since 1.5, in Safari since 3, and Safari on iOS is as Safari;
- WebKit:
  - [PR 74063](https://github.com/WebKit/WebKit/pull/74063), merged 2026-09-19: "getComputedTextLength(), getSubStringLength(), getStartPositionOfChar(), getEndPositionOfChar() and getExtentOfChar() reported pre-stretch numbers under lengthAdjust="spacingAndGlyphs"";
  - [PR 77259](https://github.com/WebKit/WebKit/pull/77259), merged 2026-10-16: "Following the spec steps fixes textLength with x/y lists and on text paths, and lengthAdjust="spacingAndGlyphs" and whitespace collapsing now match Chrome and Firefox" and "The new path is behind the internal SVG2TextLayoutAlgorithmEnabled flag, off by default for now";
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024:
  - 1.3.2 Meaningful Sequence — "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined";
  - 1.4.4 Resize Text — "Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality";
  - 1.4.10 Reflow — "Except for parts of the content which require two-dimensional layout for usage or meaning";
  - 1.4.11 Non-text Contrast — "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s)", and among them "Graphical Objects: Parts of graphics required to understand the content". The sheet's grid `#d3dbe5` on `#fff` is 1.40:1 by WCAG's formula of contrast;
- `tutor`, [8451728](https://github.com/altnovatrail/tutor/tree/845172878617727fa4da3133b0c9633e8d8ee140) of 2026-10-27:
  - in RUN.md, `tutor`'s T78–T80 are `[ ]`. `tutor`'s T79 has «один вызов на страницу: вырезки ячеек с подписями — с текстом пунктов или без него» and «ответ по ячейке — текст, разборчиво ли, другие прочтения, пуста ли». The report of `tutor`'s T80 compares reading «с текстом пункта против без него»;
  - in its architecture 2.6, in the recommendation to the product: «ячейки рабочей тетради — цифры на устройстве своей малой сетью, с откатом к ИИ». In the table, this option has «своя малая сеть читает ячейки тетради»;
- the prototype `spec/draft/NovaTrail Widget.html` at the tag v0.2.37, an illustration:
  - the header above the page has "Workbook · 10 examples" and the statement;
  - the items stand in a grid of two columns, in rows 84 px high, with a number in a circle;
  - after "=" there is a box of 76 × 62 px with a dashed line at its bottom;
  - an item has a tick "✓", and the tutor's mark is a dashed circle around the box;
- a probe in the container, Chrome Headless Shell 156 through Playwright 1.64.1. SVG in an open shadow root: the root is `role="none"`, inside it `<g role="list">`, and the items are `<g role="listitem">` with `<text>` and `<rect role="img" aria-label>`. `ariaSnapshot()` gives the list, its items, the text and the pictures with names, in order: «listitem: text: 1. 7 × · img "окошко 1, пусто" · text: = 56». With `role="list"` on the root itself, the same.

  Clarification 2026-10-27, T51: `ariaSnapshot()` is Playwright's model, which it builds itself. Chromium's own accessibility tree, `Accessibility.getFullAXTree` through the DevTools protocol, showed the same in the planning of T47 and T51: the root `role="none"` is skipped, `list`, its `listitem` in order, the text as `StaticText`, the boxes as `image` with names.

### 9.13. The workbook's layout

(R35), read 2026-10-27:

- the image's fonts: the package `fonts-liberation` 1:2.1.5-3 from a snapshot of the Ubuntu archive (`dpkg -s`): Liberation Sans, Serif and Mono. The widths of the characters were read from their tables `cmap` and `hmtx` and checked in Chrome Headless Shell 156: the mean of Sans and Serif, rounded to a hundredth, is the number of R35's table;
- the fonts' license, `/usr/share/doc/fonts-liberation/copyright`: "License: SIL-OFL-1.1". What it permits is "to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software", and its condition 5 is "The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license". What goes into the package is neither the fonts' files nor their tables, but means of its own of the two fonts, rounded to a hundredth. This is an argument of the decision, not a legal opinion;
- a probe in the container, Chrome Headless Shell 156 through Playwright 1.64.1:
  - `textLength` with `lengthAdjust="spacingAndGlyphs"` fits a `<text>` exactly: the width of `getBBox` is the one set, ±1 unit, in Liberation Sans, Serif and Mono;
  - `sans-serif` in the image is Liberation Sans, and `system-ui` is Liberation Mono;
  - `lang` with no namespace on an SVG `<g>` gives its `<text>` `:lang(ru)`, as `xml:lang` does;
  - an inherited `direction: rtl` moves `<text x="100">` with `text-anchor: start` to 72, and `direction: ltr` on the SVG returns it to 100.

### 9.14. Filled answer slots and the worked example

(architecture 2.8; R42), read 2026-11-01:

- the README of `spec`'s format v0.4.1, §18: "`answer_slots_filled` — every answer slot of the task holds something of the learner's: a stroke in its zone or its box, an option tapped, and for an answer slot bound `anywhere` or `sheet`, a stroke on the sheet". §14: "An answer slot bound `anywhere` or `sheet` is the only answer slot of its task" and "The learner's app shows the `text`, with the options of the item's answer slots bound `choice`, beside the sheet: the sheet shows neither". §21: "The learner does not write on the sheet: it holds the author's demo and no learner's work", "The learner opens them one at a time, and MAY hide the whole demo and show it again" and "Whether the paragraphs and the pictures beside the sheet stand above it or beside it is the canvas's to say, as for a task's statement";
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024. 4.1.3 Status Messages: "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus". 1.3.2: "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined". 2.4.3: "focusable components receive focus in an order that preserves meaning and operability";
- [Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), updated 11 May 2026: a status tells "the success or results of an action", and the criterion "specifically addresses scenarios where new content is added to the page without changing the user's context". An example: after "Add to Shopping Cart", "5 items" appears beside it, and the screen reader speaks it without taking the focus;
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), W3C Recommendation 06 June 2023. The role `status` is "A type of live region whose content is advisory information for the user but is not important enough to justify an alert", it has "an implicit aria-live value of polite and an implicit aria-atomic value of true", and "If another part of the page controls what appears in the status, authors SHOULD make the relationship explicit with the aria-controls attribute". `aria-expanded` "Indicates whether a grouping element owned or controlled by this element is expanded or collapsed", and "If a grouping container that can be expanded or collapsed is not owned by the element that has the aria-expanded attribute, the author SHOULD identify the controlling relationship by referencing the container from the element that has aria-expanded with the aria-controls property";
- [APG, Disclosure (Show/Hide) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), the page has no date: "The element that shows and hides the content has role button", "When the content is visible, the element with role button has aria-expanded set to true" and "Optionally, the element with role button has a value specified for aria-controls that refers to the element that contains all the content that is shown or hidden"; Enter and Space "toggles the visibility of the disclosure content";
- [HTML Standard, The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute), Last Updated 30 October 2026: an element with `hidden` "is not yet, or is no longer, directly relevant to the page's current state", and "User agents should not render elements that are in the Hidden state".

### 9.15. Shared loading of pictures

(architecture 3.3; R23, R42; T64), read 2026-11-01:

- [HTML Standard, Images](https://html.spec.whatwg.org/multipage/images.html), Last Updated 30 October 2026: "Each Document object must have a list of available images", and "The list of available images is intended to enable synchronous switching when changing the src attribute to a URL that has previously been loaded". If the list has a picture for the URL, "Set the current request to a new image request whose image data is that of the entry and whose state is completely available". But "User agents may also remove images from such lists at any time (e.g. to save memory)";
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1: after `new Image()` with a `blob:` URL and `await decode()`, a new `<img>` with the same URL is `complete`, with `naturalWidth` above zero, synchronously, even before it is inserted into the document, for SVG and for PNG. After `URL.revokeObjectURL` a new `<img>` with that URL is not decoded: "EncodingError: The source image cannot be decoded";
- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026: "interface SVGImageElement : SVGGraphicsElement { … attribute DOMString? crossOrigin; }; SVGImageElement includes SVGURIReference;" — the IDL has no method `decode()`. In Chrome Headless Shell 156, `SVGImageElement.prototype.decode` is a function: Chromium gives it beyond the standard.

### 9.16. Pictures in sheet areas

(architecture 3.3; R42; T61), read 2026-11-01:

- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026, of `image`: `preserveAspectRatio` "must be explicitly set to none to turn off aspect ratio control", and "If the value of ‘preserveAspectRatio’ was 'none' then aspect ratio of the image would not be preserved. The image would be fit such that the top/left corner of the raster exactly aligns with coordinate (x, y) and the bottom/right corner of the raster exactly aligns with coordinate (x+width, y+height)";
- [SVG 2, Rendering Model](https://www.w3.org/TR/SVG2/render.html), the same, 3.4 Rendering order: "By default, elements are painted in document order: an element that appears later in the markup is painted on top of an element that appears earlier";
- [CSS Color Adjustment Module Level 1](https://www.w3.org/TR/css-color-adjust-1/), W3C Candidate Recommendation Snapshot, 16 December 2025, 3.1: in the forced colors mode "the <color> components of all properties on the element are force-adjusted to the user’s preferred color palette", and "background-image computes to none unless the original value contains a url() function". The pixels of a picture's file are not a property, and a picture on the sheet keeps the colors of its file: a test in Chromium holds this;
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. A PNG of 3000 × 3000 of noise: a new `<image>` with a `blob:` URL that a picture had decoded beforehand is painted, by Element Timing, 15 ms after its insertion, in the nearest frame, and without the decoding 105 ms after, six `requestAnimationFrame` callbacks later. A PNG of 40 × 20 of four colors in an `<image preserveAspectRatio="none">` of 400 × 300 fit its corners to the corners, and an SVG file stretches the same way, with `viewBox` and without it. `scrollIntoView` on a box with `visibility: hidden` scrolls the container the same as on a visible one.

### 9.17. Styles under CSP

(architecture 3.3 and 3.7; R51), read 2026-11-08:

- [CSSOM](https://drafts.csswg.org/cssom/), Editor’s Draft 13 October 2026, of the assignment of `adoptedStyleSheets`: "If value’s constructed flag is not set, or its constructor document is not equal to this DocumentOrShadowRoot’s node document, throw a "NotAllowedError" DOMException";
- [DOM Standard](https://dom.spec.whatwg.org/), Living Standard — Last Updated 4 November 2026, "To adopt a node node into a document document": the step for a shadow root changes its document and its registry of custom elements, and says nothing of the sheets of `adoptedStyleSheets`;
- [Content Security Policy Level 3](https://w3c.github.io/webappsec-csp/), Editor’s Draft 27 October 2026, `style-src`: "The following CSS algorithms are gated on the unsafe-eval source expression" — as a list: insert a CSS rule, parse a CSS rule, parse a CSS declaration block, parse a group of selectors; — "This would include, for example, all invocations of CSSOM’s various cssText setters and insertRule methods" and right there "This needs to be better explained", with a reference to issue #212 of `w3c/webappsec-csp`. And `style-src-elem` "governs the behaviour of styles except for styles defined in inline attributes";
- [app](https://github.com/altnovatrail/app/tree/375a09b), the branch `main`, commit 375a09b, RUN.md, Д9: «Не проверено: … что `style-src` не блокирует `adoptedStyleSheets` и `element.style` канвы (вторая поправка 2026-11-02 к R36 spec)»;
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. Under the policy `default-src 'none'; style-src 'self'; img-src blob:` in a frame's `<meta>`, a `<style>` in a shadow root is blocked — a `securitypolicyviolation` event with `style-src-elem` and the URL `inline`, and the host has `display: inline` — while a sheet from `replaceSync()`, assignments to the `style` properties and `blob:` pictures work with no events. An element moved into an iframe of the same origin stays with an empty `adoptedStyleSheets` and with no styles — both there and after its return — until `adoptedCallback()` gives it the sheet.

### 9.18. The sheet's zoom

(architecture 3.2 and 3.3; R73; T94), read 2026-11-11, the pages' text by `curl`:

- [Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), updated 06 September 2026: "Content satisfies the success criterion if it can be scaled up to 200% using at least one text scaling mechanism supported by user agents"; "it should still be possible to get 200% text enlargement in some way compared to the default 100% zoom"; among the sufficient techniques, G142 and G178;
- [G178](https://www.w3.org/WAI/WCAG22/Techniques/general/G178), "Providing controls on the web page that allow users to incrementally change the size of all text on the page up to 200 percent", updated 24 September 2025, a technique for 1.4.4 (Sufficient): "The purpose of this technique is to provide a mechanism on the web page to incrementally increase the size of text".

### 9.19. The row in a low window, focus and motion

(architecture 3.3; R28, R33; T92), read 2026-11-11:

- [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), updated 04 October 2026: 320 CSS px is "a starting viewport width of 1280 CSS pixels wide at 400% zoom", and 256 CSS px is "a starting viewport height of 1024 CSS pixels at 400% zoom"; of sticky panels, "It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user"; the criterion allows two-dimensional layout for "interfaces where it is necessary to keep toolbars in view while manipulating content" too;
- [C34](https://www.w3.org/WAI/WCAG22/Techniques/css/C34), "Using media queries to un-fixing sticky headers / footers", updated 12 January 2026, a technique for 1.4.10 (Advisory): "The objective of this technique is to be able to present content with sticky headers and footers when there is enough space". In its example a header with `min-height: 130px` sticks only in a window of `@media (min-height: 480px)`;
- [Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), updated 15 June 2026: "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content"; "Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs"; a failure is F110, "due to a sticky footer or header completely hiding focused elements";
- [Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), updated 04 October 2026: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible";
- [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), updated 04 October 2026: the parts of an interface and their states "have a contrast ratio of at least 3:1 against adjacent color(s)", and "the visual focus indicator for a component must have sufficient contrast against the adjacent background when the component is focused";
- [Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), updated 16 September 2025: "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed", and of scrolling, "Moving new content into the viewport is essential for scrolling".

### 9.20. Declared nonconformances

(architecture 3.10; R74; T95), read 2026-11-11, the pages' text by `curl`:

- [Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), updated 01 October 2025: the criterion is "In content implemented using markup languages that support the following text style properties, no loss of content or functionality occurs by setting all of the following and by changing no other style property"; "The author requirement is both to not interfere with a user's ability to override the author settings, and to ensure that content thus modified does not break content"; "Content does not fail this SC if the method chosen by the user - for instance, the use of an extension or bookmarklet - fails to correctly set the line height and spacing text properties on the content (provided that the content is not actively and purposely preventing the properties from being added)";
- [Understanding 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html), updated 04 October 2026: the criterion is "The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular of the immediately surrounding text";
- [Understanding 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), updated 04 October 2026: the exception is "except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints"; "For example, if using handwriting to enter text, the input technique (handwriting) requires path-dependent input but the underlying function (text input) does not"; "Free hand drawing, or watercolor painting require path dependent input";
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1, on the page of `just demo` 414 CSS px wide: the rules of the Text Spacing bookmarklet — `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em` with `!important` on every element and `margin-bottom: 2em` on a paragraph — first as a style of the document, and then also as a sheet in the element's shadow root, in place of a user style. The document's style reaches the statement by inheritance — `letter-spacing` 1.92 px — but not the workbook's printed text: its text has `normal`. The sheet in the shadow root gives the printed text 3.6 px, but the widths of the first three pieces stay within a third of a unit: 24, 41 and 57 units of the sheet against 24, 41 and 57.34 without the spacing; `textLength` holds them. No label of the row's eight buttons went beyond its button, neither on the sheet nor on the workbook.
