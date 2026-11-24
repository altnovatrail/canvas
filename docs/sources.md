# canvas — sources

> The facts of the outside world the repository's documents under `docs/` rest on and no run of ours checks: a law, a regulator, a standard's normative text, a provider's terms and policies, a price, a license, a page that changes in place with no version, a text outside the repositories. Here are their records — the address, the date it was read and a quote in the source's language — and [architecture.md](architecture.md) and the decision log hold the claim and a citation of its one record by its number, `sources 1.1`, not a chain. A record's heading names its topic, not a task. The quotes that an entry of the decision log gives itself stay in the entry.
>
> No record is needed for a library's documentation or code at a version or commit — a link beside the claim —, for a behaviour a test or a measurement checks — they are its evidence —, or for spec's tags and the files of NovaTrail's and MathTrail's repositories — git, at a commit.
>
> A record is a subsection "N.M" of a topic: one source, or one reading of several sources for one decision. A record's number never changes and is never given again: a new one goes at the end of its topic, a new topic at the end of the file, and a record removed leaves a gap. A source read again with the same text changes the record's date; with another text, the claims and decisions on it are rewritten in the same change and the record holds the new reading alone — where a decision waits on the author, an open question, and both readings stand until it is closed. The model is `spec/docs/sources.md`. The results of measurements and probes are not here but in [measurements.md](measurements.md).

## 1. The research and the analysis

### 1.4. The research «Рукопись ребёнка на канве и ИИ-наставник»

[artifact](https://claude.ai/artifact/QLH6WzmmQs4MY5NvjMxb1D), the report `files/child-handwriting.md`, version 1792539580-561a, of 2026-10-20, read 2026-10-21. It is not in the NovaTrail repositories, the author has access to the artifact, and what the documents of `canvas` rest on is quoted below. It is not a decision: «Не решение: решения по нему принимает эпик E6 в RUN.md, а пока они не приняты, действуют документы и журнал решений». Which RUN.md that is, the research does not say: the RUN.md of `spec` at the tag v0.2.12 has no epics after E5, and this one has none after E2. Its items are cited by its own labels — A3, A6, C1. Its «метка» is both the group label of a stroke group (A, B, C) and a mark of the tutor's layer; in the documents of `canvas` the second is «пометка», a mark, as in spec's glossary, `spec/docs/concepts.md`:

- A3: «Канва вида «лист для рукописи» экспортирует только чернила, без сетки и текста задачи, обрезает по рамке работы с полем 12 px и масштабирует так, чтобы медианная высота группы штрихов была ≈32 px»; «Высота цифры — настройка канвы модуля»;
- A4: «Риск по возрастанию: (a) картинка < (b) картинка и грубые признаки процесса < (d) стёртое ≤ (c) сырые штрихи с временем и нажимом»;
- A6: «Метки рисует сервер в памяти запроса по рамкам групп, которые прислало устройство»; the digit heights for eval are «16, 24, 32 и 48 px»; in the summary — «история письма — только условие eval»;
- C1: «(c) для всего, что касается ячейки ответа; (b) для места в черновике; (a) — только если (b) и (c) пусты, и только после притяжки к штрихам. Ничто не сошлось со штрихами — рамки нет»; «Метки — на полях с тонкими выносками, не поверх чернил; чтение всегда получает чистую картинку»; «Рамки групп финального состояния выводимы из самой картинки и не несут времени». Among the measurements for C is «Чтение с метками и без — не портят ли метки чтение (A/B: чистая, размеченная, пара)»;
- C2: «Каждая метка слоя наставника хранит `{stroke_ids, snapped_box}` и рисуется каждый кадр из текущей геометрии этих штрихов; новые штрихи её не двигают; стёрты все её штрихи — метка исчезает»; «Рамка модели переводится в координаты листа по соглашению поставщика, обрезается границами, и берутся штрихи, точки которых в основном внутри (поля и порог — параметры eval); рамка притягивается к их общему прямоугольнику»; «Метки ссылаются на таблицу «метка → ID штрихов», действительную только для своей отправки. `snapped_box` нужен только эскизу «как начать» на пустом месте»;
- H3: «ластик удаляет штрихи целиком, и вырезка рисуется только из видимых — стёртого на картинке нет»; «пустой лист отсекается программой до вызова …»;
- F2: «Текст несёт якоря меток из закрытого набора, который выдаёт сервер (`[[mark:A]]`)»; «каждый кусок — отдельное высказывание, метка появляется на его событии `start`»;
- «И22», an open question of the research: «Как указывать место: размеченная копия, пара «чистая + размеченная», рамки», the recommendation — «A/B по поставщикам до фиксации полей места в схеме наблюдения»;
- on spec's decision about what a check request carries, in item 3 «Решения, которые стоит пересмотреть»: «Уточнить, что запрос проверки, кроме картинки, может нести (а) рамки групп штрихов финального состояния и (б) токен прошлой проверки»;
- the synthetic example: «Рамки — `[ymin, xmin, ymax, xmax]` в долях 0–1000 вырезки (внутреннее соглашение; адаптер каждого поставщика переводит в своё)», and `sheet_box` — «где вырезка лежит на листе, в том же порядке `[ymin, xmin, ymax, xmax]`, но в логических координатах листа (здесь 312 × 378, как сама вырезка); по нему устройство возвращает рамки на лист». The crop in the example is 378×312, that is, `sheet_box` covers it together with the margin.

### 1.5. The analysis «Базовая канва и контракт „канва ↔ агент“»

It came from the author and is not in the repository. It was written by a model that had seen neither the code nor the decisions NovaTrail has taken, so what is taken from it is questions, not facts. In `spec` v0.2.14 the same analysis is among the sources of spec's product description and its architecture, `spec/docs/product.md` and `spec/docs/architecture.md`: from it come О-21, an option of О-8, Т-30, and what the widget protocol has to decide about module widgets.

## 2. Drawing libraries

### 2.1. tldraw

[`LICENSE.md`](https://github.com/tldraw/tldraw/blob/e8eb1cf5635d28a2d516f0c0d823ed35f3ea9dc9/LICENSE.md), branch `main`, commit e8eb1cf; the file last changed on 2025-09-17, "License change for 4.0 (#6780)"; read 2026-10-21:

- ""Production Environment" means any production deployment of the Software that operates on servers, cloud platforms, web applications, or where the software is used to provide functionality to end users, customers, or the public";
- the conditions: "Not to use the Software in Production Environments"; "Not to disable, change, or interfere with the Software's License Key enforcement"; "Not to make the Software available under a license that supersedes or negates the effect of this License". Work in production is by a trial key or by a commercial agreement: "you are permitted to use the Software in Production Environments for the specified period". Other licenses are separate: "Alternative licenses are available from tldraw for commercial and non-commercial use"; their terms were not read;
- "The Software includes technical measures to verify License Key validity, detect deployment environments, enforce usage restrictions based on license type, and ensure proper watermark display. The Software may collect and transmit usage data to tldraw for license compliance purposes";
- in the npm registry, [`tldraw`](https://registry.npmjs.org/tldraw) is 5.5.2 of 2026-10-02, `"license": "SEE LICENSE IN LICENSE.md"`; GitHub's API determines the repository's license as `NOASSERTION`.

### 2.7. Other drawing libraries

Pages with no version, read 2026-10-21:

- Fabric.js: asked about the width along a stroke, the maintainer answered "no it does not, that would need a special class, derived from path probably" ([#4885](https://github.com/fabricjs/fabric.js/issues/4885#issuecomment-378188602));
- PixiJS, [accessibility](https://pixijs.com/8.x/guides/components/accessibility): "PixiJS includes built-in accessibility support through a DOM-based overlay system";
- Excalidraw, [documentation](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration): "Since Excalidraw doesn't support server side rendering so it should be rendered only on client".

## 3. The browser's platform

### 3.1. The browser's platform

Read 2026-10-21:

- [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/), a W3C Recommendation of 30 June 2026. On `pressure`: "For hardware and platforms that do not support pressure, the value MUST be 0.5 when in the active buttons state and 0 otherwise". On `width` and `height`: "in cases where the actual geometry of the input is not detected by the hardware, the user agent MUST return a default value of 1". On palm rejection by the device: "Currently, it is not possible for authors to suppress this behavior", and `pointercancel` comes when "The user agent interprets the input as accidental (for example, the hardware supports palm rejection)". `getCoalescedEvents()` is declared with `[SecureContext]`. On an iframe: "Note touch-action does not apply/cascade through to embedded browsing contexts", and MDN, [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): "Each embedded browsing context has its own document and allows URL navigations";
- WebKit, [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/), 2024-07-16: "Safari injects noise into various APIs: namely, during 2D canvas and WebGL readback, and when reading AudioBuffer samples using WebAudio"; "The amount of noise injected is extremely small, and (mostly) should not result in observable differences or artifacts". Apple, [iOS 26](https://www.apple.com/newsroom/2025/06/apple-elevates-the-iphone-experience-with-ios-26/), 2025-06-09: "Browsing in Safari gets even more private with advanced fingerprinting protection extending to all browsing by default". Whether in ordinary browsing noise is put into any canvas, or only into reading by known tracking scripts, is not checked;
- Firefox, the release notes of [120](https://www.firefox.com/en-US/firefox/120.0/releasenotes/): "Firefox’s private windows and ETP-Strict privacy configuration now enhance the Canvas APIs with Fingerprinting Protection"; of [151](https://www.firefox.com/en-US/firefox/151.0/releasenotes/): "Firefox now strengthens protection against fingerprinting in Standard Enhanced Tracking Protection";
- Brave, [Fingerprinting defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/), 2020-05-18: "The default setting for farbling-based fingerprinting is to add small amounts of randomness to semi-identifying endpoints"; the table of these APIs has `toDataURL`, `toBlob` and `getImageData`;
- [HTML Standard, canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026: "Authors should not use the canvas element in a document when a more suitable element is available". On serialization "User agents must support PNG ("image/png")", and the section has no rules on the bytes of the file themselves — compression, filters, ancillary chunks. The mode `desynchronized` belongs to the canvas context: "the user agent may optimize the rendering of the canvas to reduce the latency";
- MDN, [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): "Canvas content is not exposed to accessibility tools like semantic HTML is"; MDN, [`<title>` in SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/title): "The `<title>` SVG element provides an accessible, short-text description of any SVG container element or graphics element";
- WebKit, bug [269535](https://bugs.webkit.org/show_bug.cgi?id=269535) "Canva: No pointer events from Apple Pencil while touch present" — status NEW.

### 3.2. The page's coordinates

MDN, read 2026-10-21:

- [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio): "returns the ratio of the resolution in physical pixels to the resolution in CSS pixels for the current display device";
- [`viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox): "The viewBox attribute defines the position and dimension, in user space, of an SVG viewport";
- [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect): "providing information about the size of an element and its position relative to the viewport";
- [`clientX`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX): "the horizontal coordinate within the application's viewport at which the event occurred".

### 3.3. Web components

Read 2026-10-21:

- React 19:
  - [the blog](https://react.dev/blog/2024/12/05/react-19#support-for-custom-elements): "React 19 adds full support for custom elements and passes all tests on Custom Elements Everywhere"; "props that match a property on the Custom Element instance will be assigned as properties, otherwise they will be assigned as attributes";
  - [the reference](https://react.dev/reference/react-dom/components#custom-html-elements): "React will, however, recognize an custom element's property as one that it may pass arbitrary values to if the property name shows up on the class during construction"; "You can listen for these events using an `on` prefix when binding to the event via JSX"; "Events are case-sensitive and support dashes (`-`)";
  - [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript): "You'll now need to wrap module augmentation of the JSX namespace in `declare module "....":`", and the example has `declare module "react"`;
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

[Thread 710001](https://developer.apple.com/forums/thread/710001), July 2022, read 2026-10-21. It is a user's post, not Apple's documentation, and it was written before iPadOS 26: "Apple at some point disabled the ability to open local files in Safari", and the Files app shows HTML "with only the internal text and internal header contained CSS styling". The thread says nothing of scripts. It is a lead for the probe of the build opened from a file on devices, not a fact.

### 3.5. HTML Standard

[6.8 Editing](https://html.spec.whatwg.org/multipage/interaction.html#editing-2), Last Updated 20 October 2026, read 2026-10-21:

- [`autocorrect`](https://html.spec.whatwg.org/multipage/interaction.html#attr-autocorrect), the state `off`: "The user agent is not allowed to automatically correct spelling while the user types"; "The attribute's invalid value default, missing value default, and empty value default are all the On state";
- [`spellcheck`](https://html.spec.whatwg.org/multipage/interaction.html#spelling-and-grammar-checking), the state `false`: "Spelling and grammar will not be checked"; "If the checking is enabled for a word/sentence/text, the user agent should indicate spelling and grammar errors in that text"; "This specification does not define the user interface for spelling and grammar checkers". In the order by which the browser decides whether to check a text, the user's choice comes before the attribute: "Otherwise, if the user has forced the checking for this text to always be enabled, then the checking is enabled";
- [`writingsuggestions`](https://html.spec.whatwg.org/multipage/interaction.html#attr-writingsuggestions), the state `false`: "Writing suggestions should not be offered on this element";
- [`autocapitalize`](https://html.spec.whatwg.org/multipage/interaction.html#autocapitalization): "User agents or input methods may choose to ignore or override the used autocapitalization hint in certain circumstances"; "the attribute must not be relied on for any sort of input validation".

### 3.6. Browsers and a page from a file

Read 2026-10-22. These are findings of the planning of the probe of the build opened from a file on devices, which was then put off: there were no probes on devices yet.

- **GitHub**, the headers first-hand, `curl -sIL`, 2026-10-22, 01:14–01:17 UTC:
  - `report-7.0.11.html` of the release v0.4 of `adamws/kicad-via-patterns`, which has `content_type: text/html` in the API, comes through a 302 to `release-assets.githubusercontent.com`, and there it is `content-type: application/octet-stream` and `content-disposition: attachment; filename=report-7.0.11.html`. The same holds for three more `.html` files from releases. GitHub's documentation does not promise this;
  - raw.githubusercontent.com and gist.githubusercontent.com serve HTML as `text/plain; charset=utf-8`, with `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` and `x-content-type-options: nosniff`;
- **a secure context**:
  - [Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/): "If origin's scheme is "file", return "Potentially Trustworthy"";
  - `getCoalescedEvents()` is `[SecureContext]` in [Pointer Events](https://w3c.github.io/pointerevents/);
- **storage on `file:`**: MDN writes "each `file:` URL seems to have its own unique local-storage area" ([Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)), and Chromium does otherwise: all its pages from `file:` share one storage (measurements 1.1);
- **iPadOS and Safari**:
  - "Released September 14, 2026 — 27.0 … Safari 27 is available for iOS 27, iPadOS 27" ([Safari 27 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes));
  - the Files app: "If you haven’t installed the app that created a file, a preview of the file opens in Quick Look" ([iPad User Guide](https://support.apple.com/guide/ipad/ipadb3b759ed/26/ipados/26)). The guide here and below is for iPadOS 26, and for iPadOS 27 it has not been read;
  - Safari's downloads: "iCloud Drive: Select this option to save downloads to the Downloads folder in iCloud Drive" or "On My iPad" ([Customize your Safari settings](https://support.apple.com/guide/ipad/customize-your-safari-settings-ipad54f3cde6/26/ipados/26)), and which is the default is not said;
  - whether Quick Look runs the scripts of HTML and whether Safari opens `file:`, Apple's documentation does not say. Only forums say "no": thread 710001 (2022, above) and [Apple Discussions, thread 256102223](https://discussions.apple.com/thread/256102223), July 2025, — "Quick Look is as close as you can get and it will not run JavaScript";
  - `getCoalescedEvents` since Safari 18.2: "New PointerEvent methods getPredictedEvents() and getCoalescedEvents() are now supported" ([WebKit Features in Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/)). Pointer Events with Apple Pencil since Safari 13: "Added support for the Pointer Events API enabling consistent access to mouse, trackpad, touch, and Apple Pencil events" ([Safari 13 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-13-release-notes));
- **Android**: a direct `file://` to the downloads Chrome will most likely refuse: on `READ_EXTERNAL_STORAGE` — "Starting in API level 33, this permission has no effect" ([Manifest.permission](https://developer.android.com/reference/android/Manifest.permission)); on Samsung Internet there are no primary sources;
- **Scorecard**, Signed-Releases: it looks at "the project's last five release assets" and searches them for signatures ([checks.md](https://github.com/ossf/scorecard/blob/main/docs/checks.md)).

## 4. AI providers

### 4.1. AI providers on a place in a picture

Read 2026-10-21:

- Anthropic, [Coordinates and bounding boxes](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates): "Claude works best with absolute pixel coordinates"; "Claude does not work well when you ask for normalized coordinates"; "The coordinates Claude returns are pixel positions in the image Claude sees: your image after Claude resizes it to fit the model's native resolution"; "Small elements lose precision when an image is downscaled";
- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision): "An image, therefore, costs `⌈width / 28⌉ × ⌈height / 28⌉` visual tokens"; "Images larger than either limit are downscaled before processing". In the table of limits, "Max long edge" is "2576 px" for "Claude 4.7 and later models" and "1568 px" for "All other models". "Claude's coordinate and localization outputs are approximate";
- OpenAI, [Images and vision](https://developers.openai.com/api/docs/guides/images-vision): "patch_count = ceil(width/32)×ceil(height/32)"; "For coordinate-sensitive tasks, resize images to fit those limits before sending them and map returned coordinates back to the original image"; "The model struggles with tasks requiring precise spatial localization". For `gpt-6-astra` at `high` — "up to 2,500 patches", and the page gives no format of a box;
- Google, [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding), Last updated 2026-09-23: "The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000"; "You need to descale these coordinates based on your original image size". Google's models are here only for reference: `tutor` removed them from the measurement ([tutor@231bf8b, `docs/decisions.md`](https://github.com/altnovatrail/tutor/blob/231bf8b/docs/decisions.md)).

## 7. Tools, packages and CI

### 7.2. npm

The registry, the npm site and the issue of its CLI:

- read 2026-11-02 — the settings page of the package `@altnovatrail/canvas` on the npm site, by the author's screenshot: under "Publishing access" — "Require two-factor authentication and disallow bypass 2fa tokens (recommended)" and "Require two-factor authentication or a granular access token with bypass 2fa enabled", and below them — "Note about trusted publishers: All publishing access options above are compatible with OIDC trusted publishers. If you have configured trusted publishers for this package, they will continue to work regardless of which option you select";
- read 2026-11-02 — the output of `npm trust github @altnovatrail/canvas --file release.yml --repository altnovatrail/canvas --allow-publish` at the author's: "Trust configuration created successfully", "permissions: publish, stage publish";
- read 2026-11-02 — the registry, `npm view @altnovatrail/canvas --json`: the version `0.0.0-stage` of 05:13:54Z — "Temporary package placeholder for staged publishing", published by the author's account with the first publication, — 0.1.0 of 05:15:11Z and 0.1.1 of 05:39:38Z, whose `_npmUser` is "GitHub Actions <npm-oidc-no-reply@github.com>";
- read 2026-11-02 — the attestations of 0.1.1, `https://registry.npmjs.org/-/npm/v1/attestations/@altnovatrail%2fcanvas@0.1.1`: «https://github.com/npm/attestation/tree/main/specs/publish/v0.1» and «https://slsa.dev/provenance/v1». The second's `workflow` is `.github/workflows/release.yml` of `altnovatrail/canvas` on `refs/heads/main`, commit fd032f1, and the certificate has `altnovatrail/.github/.github/workflows/release.yml@09443e1027ef24197439dfe60a072d14c3626cc3`; `npm audit signatures` in a trial project — "2 packages have verified attestations";
- read 2026-11-24 — the issue [npm/cli#9969](https://github.com/npm/cli/issues/9969) of 2026-09-14, "OIDC trusted publishing fails with "package not found" for GitHub repos that use immutable OIDC subject claims", is open, with the labels "Priority 1" and "feat:oidc", last changed 2026-10-28 (`gh api repos/npm/cli/issues/9969`). Its author and the second commenter write of repositories created after 2026-07-15, where `use_immutable_subject: true` cannot be turned off; the author refers to GitHub's changelog. These are users' reports, not npm's answer. `canvas` has `"use_immutable_subject":true` (`gh api repos/altnovatrail/canvas/actions/oidc/customization/sub`), and it was created 2026-10-19 (GitHub's API).

### 7.6. GitHub releases

Read 2026-11-24:

- GitHub Docs, [Immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases): "Only the assets and tag are locked. You can still edit the title and release notes of a published immutable release, and change whether it is marked as a pre-release or as the latest release";
- the GitHub API: `repos/altnovatrail/canvas/immutable-releases` answers `{"enabled":true,"enforced_by_owner":false}`, and the repository has two rulesets, `main` (25506234) and `v-tags` (26336827). The required checks of `main` (`repos/altnovatrail/canvas/rulesets/25506234`) are thirteen: "Secrets / gitleaks", "DCO / sign-off", "Documents / docs-check-repo", "CodeQL / analyze (actions)", "TypeScript / lint", "TypeScript / test", "TypeScript / vuln", "TypeScript / licenses", "CodeQL / analyze (javascript-typescript)", "Samples page" and "TypeScript / engines" with `integration_id` 15368, "SonarCloud Code Analysis" with 12526 and `codecov/patch` with 254; `repos/altnovatrail/canvas/rules/branches/main` applies them to `main`.

### 7.7. Code and tools

- Chrome's terms, read 2026-10-21: [Chrome/ChromeOS/GooglebookOS Additional Terms of Service](https://www.google.com/chrome/terms/), the edition "Last modified: 30 September, 2025": "By using Chrome or ChromeOS, you agree to the Google Terms of Service located at https://policies.google.com/terms and these Google Chrome and ChromeOS Additional Terms of Service. These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS. Most source code for Chrome is available free of charge under open source software license agreements at chrome://credits". The page [Chrome for Testing](https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing), updated 2023-06-12, and the README of [GoogleChromeLabs/chrome-for-testing](https://github.com/GoogleChromeLabs/chrome-for-testing) at commit b9cf0a2 say nothing of the terms of their builds;
- Claude Code, [Permissions](https://code.claude.com/docs/en/permissions), read 2026-11-24: "`/path` Path relative to the settings source", and in the project's settings that is `<primary working directory>/path`; "`//path` Absolute path from filesystem root"; "A `*` in a Bash rule matches any text, including spaces"; "In gitignore patterns, `*` matches within a single path segment and can appear at any position in the pattern, while `**` matches across directories"; of a Bash rule, "isn't a security boundary around the program";
- SonarQube Cloud, [Automatic analysis](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/automatic-analysis), read 2026-10-21: of `.sonarcloud.properties`, "Below are the supported optional settings for the `.sonarcloud.properties` file. Wildcard patterns are not allowed". The list of settings itself was not read in the page's text.

## 8. Licenses and contribution

### 8.1. Apache License 2.0

This repository's [LICENSE](../LICENSE), section 2, read 2026-10-21: "each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form".

### 8.2. Developer Certificate of Origin 1.1

(П-18) — [developercertificate.org](https://developercertificate.org/), read 2026-10-21: (c) "The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it"; (d) "a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely".

## 9. Decisions of the element and the page

### 9.1. The sheet's input

Read 2026-10-22:

- **perfect-freehand 1.2.3**: the package from the lock file, and its sources are the `sourcesContent` in `dist/esm/index.mjs.map`. The code's defaults are `size = 16` and `last: isComplete = false`, while the README's table of options has "`size` | number | 8" and "`last` | boolean | true". A single point is completed by `getStrokePoints`: "If there's only one point, add another point at a 1pt offset", `UNIT_OFFSET: [1, 1]`. The threshold at the end is "Pixels to skip at the end of a stroke to reduce noise", `END_NOISE_THRESHOLD = 3`, and with `thinning` 0 the radius is `size / 2`, with no pressure. A measurement on straight strokes at `size` 3: at 0.5 and 1 unit long the outline is wider by 0.08 and 0.29 of a unit than when counted in "sheet × 10", and from 2 units on it is the same;
- **Pointer Events**. The [Editor's Draft](https://w3c.github.io/pointerevents/), of the list of intermediate points: "For all other trusted event types, it is an empty list" — for all but `pointermove` and `pointerrawupdate` — and "Untrusted events have their coalesced events list initialized to the value passed to the constructor". The table of buttons of [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/) has "Right Mouse, Pen barrel button" with `button` 2 and `buttons` 2, and "Pen eraser button" with 5 and 32; "Pointer Events do not fire overlapping pointerdown and pointerup events for chorded button presses";
- **canvas-api-onprem**: [MathTrail/canvas-api-onprem](https://github.com/MathTrail/canvas-api-onprem/tree/f4bfe5274f2cd73af3bb24ebc97a83dacf07de84), the branch `main`, commit f4bfe52, Apache-2.0. `ui/src/components/OlympiadCanvas.tsx` has `const PEN_OPTIONS = { size: 5, thinning: 0.5, smoothing: 0.5, streamline: 0.5 }` with no `simulatePressure`, so the library replaces the pressure passed as the third number with one derived from speed, and the points are the position on Konva's stage, in pixels. The search made when the sheet's input was planned found no code of pen mode or of palm rejection in any branch of canvas-api or in MathTrail's other repositories;
- **`tutor`'s board**: [altnovatrail/tutor](https://github.com/altnovatrail/tutor/tree/3660eac), commit 3660eac, the merge of pull request #20, `internal/board/page.html`: `<canvas id="board" width="1000" height="600" …>`, `ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";`, the background is `ctx.fillStyle = "#fff"`, and a point is `(e.clientX - r.left) * canvas.width / r.width`;
- **Chrome Headless Shell 156**, probes in the container:
  - `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2` in the middle of a test: in the test's frame `devicePixelRatio` became 2, while the `devicePixelContentBoxSize` of a drawing surface of 300 × 420 CSS px stayed 300 × 420. Neither a ResizeObserver entry nor a `change` event of `matchMedia("(resolution: 1dppx)")` came in 20 frames, though `matches` became `false`;
  - with `deviceScaleFactor: 2` in Playwright's context, `devicePixelRatio` is 2 from the very start, and the `devicePixelContentBoxSize` of an element of 300 × 100 CSS px is 300 × 100, both in the test's frame and on the page outside it;
  - the mouse of `Input.dispatchMouseEvent` presses with the `force` it was given, and without one with 0; with `pointerType: "pen"` and `force` a pen comes, with that pressure;
  - `PointerEvent.pressure` is a 32-bit number: 0.6 reads as 0.6000000238418579;
  - Vitest 5.0.5 puts the screenshots of failed tests in `.vitest/attachments/failure-screenshots/`.

### 9.2. The picture of the work and the stop of writing

Read 2026-10-22:

- HTML Standard, [canvas](https://html.spec.whatwg.org/multipage/canvas.html), Last Updated 20 October 2026:
  - for `toBlob`: "set result to a copy of this canvas element's bitmap", and the file is written from the copy afterwards, "in parallel", and the callback gets it or `null`;
  - for `convertToBlob` of `OffscreenCanvas`, the same: "Let bitmap be a copy of this's bitmap", and the default type is "image/png";
  - in the support tables on the same page, `toBlob` is "Firefox 18+ Safari 11+ Chrome 50+", and `convertToBlob` is "Firefox 105+ Safari 16.4+ Chrome 69+";
- HTML Standard, [Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees), the same date: "Hit-testing must act as if the 'pointer-events' CSS property were set to 'none'". Of the attribute `inert`: "Authors should not specify elements as inert unless the content they represent are also visually obscured in some way";
- MDN, [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events), revision of 2026-08-14: the formal definition has "Inherited yes";
- CSS Shadow Module Level 1, [Editor’s Draft, 28 April 2026](https://drafts.csswg.org/css-shadow-1/): the shadow tree is part of the "flattened element tree, which CSS uses for all purposes after Selectors (including inheritance and box construction)";
- Playwright 1.64.1, `lib/coreBundle.js` of the package `playwright-core`: in headless, `chromeArguments.push("--hide-scrollbars", …)`, so in the tests the sheet has no scrollbars.

### 9.3. The eraser and the writing history

Read 2026-10-25:

- DOM Standard, [Event](https://dom.spec.whatwg.org/), Living Standard — Last Updated 19 October 2026: "The timeStamp attribute must return the value it was initialized to", and when an event is created, "Initialize event's timeStamp attribute to the relative high resolution coarse time given time and event's relevant global object";
- High Resolution Time, [Editor's Draft 1 September 2026](https://w3c.github.io/hr-time/): "The now() method MUST return the number of milliseconds in the current high resolution time given this's relevant global object (a duration)", and "The relative high resolution coarse time given a moment from the monotonic clock coarseTime and a global object global, is the duration from global's relevant settings object's time origin to coarseTime". So an event's `timeStamp` and `performance.now()` count from one start, the page's time origin;
- perfect-freehand 1.2.3, the `sourcesContent` in `dist/esm/index.mjs.map`: `getStrokeRadius` is `size * easing(0.5 - thinning * (0.5 - pressure))`. With `thinning` 1 the argument of `easing` is the pressure itself, and with `thinning` 0 the outline takes the radius `size / 2` and calls no `easing` (`f?(…H=i(r,f,a,_)):H=r/2` in `index.mjs`); `getStrokePoints` takes a stroke of two points as the first and four of its own toward the second, the last at it, all of a pressure of 0.5 (`pressure:I(l[e][2])?l[e][2]:n`, `n=.5`). At `size` 3 and the pen's widest line, twice the size, the radius is 3 units of the sheet: this is `INK_REACH`, the farthest the ink goes from a stroke's points;
- the pen's eraser is "Pen eraser button", with `button` 5 and `buttons` 32, in the table of buttons of Pointer Events Level 3 (above, "The sheet's input"). The DevTools protocol does not have it: in `types/protocol.d.ts` of the package `playwright-core` 1.64.1, `type MouseButton = "none"|"left"|"middle"|"right"|"back"|"forward"`, `buttons` has "Left=1, Right=2, Middle=4, Back=8, Forward=16, None=0", and `pointerType?: "mouse"|"pen"`. So the tests give it by synthetic events;
- `tutor`'s sample format: «стирание — время и ID стёртых штрихов» ([tutor@231bf8b](https://github.com/altnovatrail/tutor/tree/231bf8b)): it has no undo and no clearing.

### 9.4. Layers, the grid and the statement

Read 2026-10-25:

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
  - `tutor`, [6af03a2](https://github.com/altnovatrail/tutor/tree/6af03a29585789dc51f5f359b67d2ff82e8add79): the board's five tasks are `internal/board/tasks.go`, the synthetic samples `internal/synth/synth.go`, for example «Реши уравнение 2(x − 3) = 10.» and «Вычисли (47 + 19) : 6.». The bank's format, `internal/sample/bank.go`, has "Statement is the condition the writer solves, in Russian", and no fields for a picture, a formula or a canvas. The measurement's bank of tasks itself does not exist yet: its task in `tutor`'s RUN.md is `[?]`. The board, `internal/board/page.html`, puts the statement above the sheet, `<p id="statement" lang="ru">`, and writes the text into it by `textContent`;
  - MathTrail standalone, [e90334e](https://github.com/mathtrail/mathtrail-standalone/tree/e90334e1946ae26c627263075ae886636aa49270): 603 tasks in `content/examples/*.json`, 95 of them with a picture, 6 with a fraction a/b in the question, and no LaTeX and no Unicode fractions. The question is `<p class="mt-task-text">`, in plain text. A picture the card cannot draw, it skips: "a picture the card cannot draw all read as none, and the task stands on its words" (`web/src/widget/payload.ts`);
  - canvas-api, commit [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0), read again 2026-10-25: `docs/spec.md` has «| Условие задачи | текст над листом, а не часть листа; на картинки проверки оно не попадает |» and «Ширина области листа ограничена, поэтому на широком экране по бокам остаются поля». Neither KaTeX nor MathJax nor MathML is in the repository;
  - the prototype `spec/draft/NovaTrail Widget.html` at the tag v0.2.18: the statement is in the header above the squared field, and the squares are a CSS background;
- `app`, [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504) of 2026-10-21: the task «Языки интерфейса (О-2) и доступность интерфейса» is `[ ]`, and its «Сделать» has «стандарт доступности и схема переводов — общие для пакетов интерфейса»;
- probes in the container, Chrome Headless Shell 156 through Playwright 1.64.1:
  - with `forcedColors: "active"` in Playwright's context, `matchMedia("(forced-colors: active)")` matches from the very start. The page's own color `rgb(255, 0, 0)` computes to the color CanvasText, so the mode forces the colors, not only the media query;
  - Vitest 5.0.5's `page.screenshot` with `save: false` writes no file: "If file is not saved, `page.screenshot` always returns `base64` screenshot" (`@vitest/browser/context.d.ts`). `page.getByRole` goes into an open shadow root.

### 9.5. Stroke groups

Read 2026-10-25:

- pauses in children's writing: M. Pascual, O. Soler, N. Salas, ["In a split second: Handwriting pauses in typical and struggling writers"](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.1052264/full), Frontiers in Psychology, published 2023-01-06. Eighty children of grades 3 and 5 wrote the alphabet with a Neo Smartpen, and pauses were counted from 100 ms: "The average duration of handwriting pauses was around 400ms, in line with assumptions that transcription pauses would fall under the 2,000ms threshold", "3rd graders made more and longer pauses than 5th graders" and "There is only a weak empirical basis to claim that specific average numbers and durations of pauses may be associated with specific writing processes";
- the study "A child's handwriting on the canvas and the AI tutor" («Рукопись ребёнка на канве и ИИ-наставник») (above), the example "ladder" («лестница»): «Строит группы и хранит у себя таблицу «группа → ID штрихов» (A → s1–s9, B → s10–s11, C → s12–s20, D → s23–s24)». The group labels there go in the order of writing: the drawing, the caption, the expression, the answer in a circle;
- `tutor`, [016d1e5](https://github.com/altnovatrail/tutor/tree/016d1e50f5544bbc55f7f98e43ab33eaa2d92de0) of 2026-10-25:
  - its decision log, on the groups for marks: «Группы для меток строятся так, как их построит устройство, — по пространству и времени, без разметки»;
  - its decision log, on the log of actions: «лог действий строит программа раннера так, как его построило бы устройство, — из штрихов и стираний, без разметки. В нём порядок групп, долгие паузы не короче 6 с, сколько стёрто и у какой группы, возврат к прежней группе»;
  - its decision log, on the big measurement of the AI's reading: «Большой замер чтения ИИ возвращается — по плану …, только на моделях Claude», the plan being the one in its `docs/architecture.md`; its tasks wait for the measurement's planning;
  - its `docs/architecture.md`: «группы — те же, что для меток, по пространству и времени, а их порядок — по первому штриху»;
  - the synthetic samples, `internal/synth/synth.go`: `charHeight = 36 // the height of a digit`, `charAdvance = 26`, `lineStep = 80`, `w.pause(1500)` before each line and `w.pause(120 + w.rng.Int64N(130))` between strokes;
  - there is no algorithm of groups and no threshold, in the documents or in the code;
- `spec`, the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32 of 2026-10-23: the epic E3 is still a row of table 2 of its RUN.md, with no tasks. The rule of groups is not there: `canvas` gives it itself;
- MathTrail:
  - canvas-api, commit [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0): no groups, and `docs/spec.md` has «сегментации строк и штрихов на сервере больше нет». In its abandoned design, at commit [2796f48](https://github.com/mathtrail/canvas-api/tree/2796f48), a stroke's row is by the median y, `row = floor((median_y − 200) / 100) + 1`, and a row is over when the child «не трогал холст 6 секунд»;
  - standalone, [491d5c2](https://github.com/mathtrail/mathtrail-standalone/tree/491d5c28c255353b50b84ab1dc68a7022a3a7d55): no groups, and in `SPEC.md` the prototype is "what it only pretends to do yet: recognising handwriting and drawings, the companion's voice, problems from a photo";
- The Go Programming Language Specification, [`doc/go_spec.html`](https://github.com/golang/go/blob/72edc307c89f81d0f1270dcb02d48ad976803551/doc/go_spec.html), "Language version go1.28 (October 9, 2026)": "An implementation may combine multiple floating-point operations into a single fused operation, possibly across statements, and produce a result that differs from the value obtained by executing and rounding the instructions individually";
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html), the branch `main` of 2026-10-23: `Math.hypot` is "Return an implementation-approximated Number value representing the square root of the sum of squares of the mathematical values of the elements of _coerced_";
- Vitest 5.0.5, `dist/chunks/index.1TqnEahn.js` in `node_modules`: `updateSnapshot` is `"none"` when CI is running and there is no flag of update, and `"new"` otherwise. A written snapshot file is not rewritten without `-u`, and a mismatch with it is a failure.

### 9.6. The crop

Read 2026-10-25. The providers' pages have no date of revision:

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
  - its decision log, on the picture of a group: «PNG рисуется с медианной высотой группы штрихов 16, 24, 32 и 48 px; основная — 32 px»; how to count the median, how thick a line is and what the limit of size is, neither the documents nor the code say: there is no code of the rendering, the groups or the median, and the tasks of `tutor` that would build them are postponed;
  - its decision log, on the models of the measurement: «OpenAI из замера убран: замер идёт только на моделях Claude. По этой записи это `claude-haiku-5-5` и `claude-opus-5-5`»;
  - its decision log, on the board's picture: «Картинка не уменьшается: запрос велит API отвергнуть картинку, которую тот уменьшил бы, — иначе пиксели модели разошлись бы с пикселями доски»; in a task of tutor's RUN.md the board's picture is «792 токена, меньше предела стандартного уровня в 1 568, и ни одна сторона не длиннее 1 568 px»;
  - the board, `internal/board/page.html`, draws `ctx.lineWidth = 3` on a drawing surface of 1000 × 600, a pixel per unit, and a digit of the synthetic samples is `charHeight = 36`;
  - its decision log gives the model «видимые штрихи в порядке написания, упрощёнными ломаными в целых пикселях вырезки»;
  - its `docs/architecture.md`: «Вырезка при цифрах 32 px — около 320×260 у листа строк и около 600×450 у свободного решения с рисунком. Это допущение, а не замер»;
- `spec` v0.2.18 and the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32 of 2026-10-23:
  - on both, the glossary of `docs/concepts.md` has «рамка группы | group box | общий прямоугольник штрихов группы, в долях вырезки»; the epic E3 of their RUN.md has the rules of the crop, «они одни у устройства и раннера», and test vectors «от геометрии с группами к параметрам и рамкам вырезки, а не байты PNG»; the «Вход» of the task on a task's items, answer slots and canvas there has «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32»;
  - Т-32 has «Годность рамки — целые 0–1000 и min < max — проверяет адаптер, а у негодной рамки места нет»; Т-31 has «От групп зависит и масштаб вырезки»;
  - only on `main`: that task's «Вход» has «масштаб вырезки задаёт медианная высота группы штрихов», and the card of `canvas` in `docs/architecture.md` has the workbook's «вырезку ячейки»;
- canvas-api, [`docs/spec.md`](https://github.com/mathtrail/canvas-api/blob/0901af0439280334b3da33ffc4cc5c853e4403ff/docs/spec.md): the picture for checking is the whole sheet, «одна единица — один пиксель», and the lines are «чёрные линии постоянной толщины — 4 единицы, со скруглёнными концами»;
- ECMAScript, [`spec.html`](https://github.com/tc39/ecma262/blob/40ce6f206b5669e69bf010a38267ae24a2843404/spec.html): for `Math.sqrt`, "Return 𝔽(the square root of ℝ(_n_))", and 𝔽 is "the IEEE 754-2019 roundTiesToEven mode"; for `Math.round`, "preferring the Number closer to +∞ in the case of a tie"; for division, "Return 𝔽(ℝ(_x_) / ℝ(_y_))"; for `Math.hypot` and `Math.sin`, "implementation-approximated";
- Go, [`src/math/sqrt.go`](https://github.com/golang/go/blob/0d37007fda071631fbcb520b99c85a8e4c93108a/src/math/sqrt.go): "On systems where Sqrt is a single instruction, the compiler may turn a direct call into a direct use of that instruction instead", and the fallback code is "Return correctly rounded sqrt"; `doc/go_spec.html` (above) has "An explicit floating-point type conversion rounds to the precision of the target type, preventing fusion that would discard that rounding";
- [PNG, Third Edition](https://www.w3.org/TR/png-3/), W3C Recommendation 24 June 2025: in 11.2.1, for color type 0, "Greyscale | 0 | 1, 2, 4, 8, 16"; in 10.1, "deflate compression with a sliding window … of at most 32768 bytes"; in 11.3, "Ancillary chunks may be ignored by a decoder"; in 5.5 the CRC is computed "on the preceding bytes in the chunk, including the chunk type field and chunk data fields, but not including the length field";
- [RFC 1950](https://www.rfc-editor.org/rfc/rfc1950), 2.2: "The information in FLEVEL is not needed for decompression"; Adler-32 is "two sums accumulated per byte … Both sums are done modulo 65521". [RFC 1951](https://www.rfc-editor.org/rfc/rfc1951): the fixed codes are 3.2.6, and 3.1.1 has "Huffman codes are packed starting with the most-significant bit of the code"; the length 258 is the code 285 with no extra bits (3.2.5).

### 9.7. The tutor's marks

Read 2026-10-26:

- canvas-api, commit [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0):
  - its decision log, on the box around the strokes: «Клиент берёт штрихи, которые были на листе в момент Check и у которых хотя бы половина точек лежит в рамке, расширенной на 10 единиц. Их он обводит с отступом»; «Если таких штрихов нет или модель места не нашла, рамки нет — остаётся только вопрос». That entry has no amendments;
  - its `docs/spec.md`, on the box: «Сервер пропускает только годную рамку: четыре целых числа от 0 до 1000, `xmin < xmax` и `ymin < ymax`, и площадь не больше четверти листа»; the client «обводит общую рамку этих штрихов с отступом 10 единиц на слое подсказок»; «Рамка и вопрос исчезают, когда ребёнок снова нажал Check или стёр любой из обведённых штрихов»;
  - there is no code of the binding: it is an open task of canvas-api, not done;
- `tutor`, [0f624a3](https://github.com/altnovatrail/tutor/tree/0f624a31d1a01cf02af6fa28816383e9bc3b28aa) of 2026-10-25:
  - its decision log, on the board: «Рамку модели доска рисует как есть, с углами в любом порядке»; among what it rejected, «пометка, притянутая к штрихам, и метки групп на копии картинки, как в …»;
  - its decision log rejects «метки на полях и притяжка рамки к штрихам (…) — попадание считается по строке, и модели хватает рамки», and in its `docs/architecture.md` a box counts «если оценка `error` и рамка попала в строку первой ошибки: в рамке с полем 8 px больше всего видимых точек именно этой строки»;
  - its decision log: «На реальной школьной рукописи у лучшей модели без дообучения F1 по рамкам ответа — не выше 55 %»;
- `spec` v0.2.18 and the branch `main`: [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32: of marks, boxes and snapping, nothing changed between them:
  - `docs/concepts.md`, on the tutor's layer: «Слой наставника — рамки, пометки, номера, короткие надписи и пунктирный набросок «как начать»», «Набросок рисуется под записью ученика, рамки и пометки — над ней» and «Ни то, ни другое не меняет и не закрывает работу ученика (…)»;
  - the glossary of `docs/concepts.md` has no term «пометка», neither Russian nor English;
  - its decision log, on what the element and `app` each hold: «Контекст отправки — где вырезка лежит на листе (`sheet_box`), рамки групп штрихов и таблицу «метка группы → ID штрихов» — держит `app`, а не канва»;
  - Т-31 and Т-32 are open, and the epic E3 has not begun;
- Vitest 5.0.5, `@vitest/browser`, `dist/locators-BHr21v4S.js` in `node_modules`: the role of the element `svg` is `` SVG:()=>`img` ``, and `aria-hidden` is in the list of ARIA's global attributes.

### 9.8. The package's interface

Read 2026-10-26:

- `spec`: the branch `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32:
  - its decision log, on the interface of the UI packages: «Элемент получает данные свойствами, отдаёт работу методом, а изменения и просьбы — событиями» and «У `canvas`: историю письма — событием после каждого штриха, вырезку для проверки — методом `exportWork()`»; `spec` does not name the event;
  - the «Вход» of the task on a task's items, answer slots and canvas in `spec`'s RUN.md: «высоту цифры на вырезке в px — настройку канвы модуля, до выводов замера по умолчанию 32» and «Как поля называются в схеме, решает …»: that task names the fields. It and the task of schemas and types in `spec`'s releases are not done, `spec`'s releases have no files, and there is no package of `spec`'s types in npm;
  - on `main` the first slice has two canvas kinds, the handwriting sheet and the workbook, by the decision on three modules that came out in v0.2.19, and the card of `canvas` in its `docs/architecture.md` was extended on 2026-10-22: the workbook — the page, the answer slots, a slot's crop and the template layer — is detailed by `canvas`. `canvas`'s submodule `spec` is on v0.2.18;
- `app`: [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), the branch `main`:
  - no code: "There is no code here yet: the framework and the build are the first thing that epic decides";
  - the tasks «Фреймворк и сборка» and «Языки интерфейса (О-2) и доступность интерфейса» in its RUN.md have not begun. The second has «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»»;
  - what is kept on the device, a task of its RUN.md decides: «работа нужна на устройстве, пока идёт попытка»;
- `tutor`: [41fde66](https://github.com/altnovatrail/tutor/tree/41fde663368d05ddb06fcfc5ce97955395ce309c), the branch `main`:
  - the measurement does not take `canvas`: the samples with strokes are written by the board's recording mode, in the format `tutor-sample`: «Не страница `canvas`»;
  - the board's recording mode, its decision log: «Всё, чего ластик коснулся между нажатием и отпусканием, — одна запись стирания». The task of the recording mode in its RUN.md has «Undo стирает последний видимый штрих, и это пишется стиранием — помаркой», and «Clear начинает лист заново со второго нажатия»;
- the package `@altnovatrail/canvas` has not come out: `altnovatrail/canvas` has no releases (`gh release list`), and `npm view @altnovatrail/canvas` answers "404 Not Found".

### 9.9. The sheet's own buttons

Read 2026-10-26:

- `spec`: the branch `main`, [15026e2](https://github.com/altnovatrail/spec/tree/15026e246ad2143eca476ade3638c6a6cae97808), tag v0.2.32, and the submodule's tag v0.2.18 are the same in this:
  - `docs/concepts.md`, on the canvas: «Инструменты разрешает задача: перо, ластик, линейка, транспортир, калькулятор, клавиатура, микрофон». `spec` nowhere calls undo and clearing tools;
  - an illustration in `docs/concepts.md` is `canvas: { kind: handwriting-sheet, grid: squares, tools: [pen, eraser] }`, and the text around it says of it «Это не формат: имена полей и запись условные, их задаст схема модуля»;
  - the «Сделать» of the task on a task's items, answer slots and canvas in `spec`'s RUN.md has «канва задачи: вид и его параметры, инструменты и слой шаблона». There is no schema of the task: that task is not done;
  - on `main`, in `format/README.md`, a minor version of the format may add "a new check kind, canvas kind, tool or list value";
  - О-2 advises «английский и русский»; `spec` has no common schema of translations for the UI packages and no level of accessibility;
- `app`: [7a96676](https://github.com/altnovatrail/app/tree/7a966769bbc968f1709ce285ddcf3cc38c48b504), the branch `main`: its tasks of the framework and of the interface languages have not begun, and the second has «стандарт доступности и схема переводов — общие для пакетов интерфейса, и это строкой таблицы 3 «в реестр spec»». How `app` passes the language to `canvas` is written nowhere;
- `tutor`: [90589e5](https://github.com/altnovatrail/tutor/tree/90589e54f179652b96ac2941cf7765c9d7f4b25e), the branch `main`:
  - the board, `internal/board/page.html`: the row `.tools` under the sheet is "Undo stroke", "Clear" and "Check", not sticky. Its decision log, on the board: «кнопки, подписи и сообщения доски на английском, как весь код (…)»;
  - the recording page, `internal/board/record.html`: under the sheet, `<button id="eraser" type="button" aria-pressed="false">Eraser</button>`, "Undo", "Clear" and "Done", and "Undo" is disabled when there is nothing to undo: `byId("undo").disabled = !writing || visible().length === 0;`;
- canvas-api: [0901af0](https://github.com/mathtrail/canvas-api/tree/0901af0439280334b3da33ffc4cc5c853e4403ff): the sheet is not built, and the task of canvas-api that builds it is not done. The mockup `draft/MathTrail Minimal.html` has a panel of icons over the sheet, `position:absolute;top:12px;right:12px`, buttons of 44 × 44 px with `title` and without `aria-*`. Its product document has «Крупные кнопки и области касания»;
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

Read 2026-10-26:

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
- DevTools protocol, [`Input.dispatchTouchEvent`](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/Input.pdl): for a touch point, `radiusX` is "X radius of the touch area (default: 1.0)", and "TouchEnd and TouchCancel must not contain any touch points". A probe in the container's Chrome Headless Shell:
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

Read 2026-10-27:

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

Read 2026-10-27:

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
  - in RUN.md, `tutor`'s three tasks that measure the reading of a workbook are `[ ]`. The one on the call has «один вызов на страницу: вырезки ячеек с подписями — с текстом пунктов или без него» and «ответ по ячейке — текст, разборчиво ли, другие прочтения, пуста ли». The report of the last one compares reading «с текстом пункта против без него»;
  - in its `docs/architecture.md`, in the recommendation to the product: «ячейки рабочей тетради — цифры на устройстве своей малой сетью, с откатом к ИИ». In the table, this option has «своя малая сеть читает ячейки тетради»;
- the prototype `spec/draft/NovaTrail Widget.html` at the tag v0.2.37, an illustration:
  - the header above the page has "Workbook · 10 examples" and the statement;
  - the items stand in a grid of two columns, in rows 84 px high, with a number in a circle;
  - after "=" there is a box of 76 × 62 px with a dashed line at its bottom;
  - an item has a tick "✓", and the tutor's mark is a dashed circle around the box;
- a probe in the container, Chrome Headless Shell 156 through Playwright 1.64.1. SVG in an open shadow root: the root is `role="none"`, inside it `<g role="list">`, and the items are `<g role="listitem">` with `<text>` and `<rect role="img" aria-label>`. `ariaSnapshot()` gives the list, its items, the text and the pictures with names, in order: «listitem: text: 1. 7 × · img "окошко 1, пусто" · text: = 56». With `role="list"` on the root itself, the same.

  Clarification 2026-10-27: `ariaSnapshot()` is Playwright's model, which it builds itself. Chromium's own accessibility tree, `Accessibility.getFullAXTree` through the DevTools protocol, showed the same when the workbook's layout and its template layer were planned: the root `role="none"` is skipped, `list`, its `listitem` in order, the text as `StaticText`, the boxes as `image` with names.

### 9.13. The workbook's layout

Read 2026-10-27:

- the image's fonts: the package `fonts-liberation` 1:2.1.5-3 from a snapshot of the Ubuntu archive (`dpkg -s`): Liberation Sans, Serif and Mono. The widths of the characters were read from their tables `cmap` and `hmtx` and checked in Chrome Headless Shell 156: the mean of Sans and Serif, rounded to a hundredth, is the number of canvas's own table of the characters' widths;
- the fonts' license, `/usr/share/doc/fonts-liberation/copyright`: "License: SIL-OFL-1.1". What it permits is "to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software", and its condition 5 is "The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license". What goes into the package is neither the fonts' files nor their tables, but means of its own of the two fonts, rounded to a hundredth. This is an argument of the decision, not a legal opinion;
- a probe in the container, Chrome Headless Shell 156 through Playwright 1.64.1:
  - `textLength` with `lengthAdjust="spacingAndGlyphs"` fits a `<text>` exactly: the width of `getBBox` is the one set, ±1 unit, in Liberation Sans, Serif and Mono;
  - `sans-serif` in the image is Liberation Sans, and `system-ui` is Liberation Mono;
  - `lang` with no namespace on an SVG `<g>` gives its `<text>` `:lang(ru)`, as `xml:lang` does;
  - an inherited `direction: rtl` moves `<text x="100">` with `text-anchor: start` to 72, and `direction: ltr` on the SVG returns it to 100.

### 9.14. Filled answer slots and the worked example

Read 2026-11-01:

- the README of `spec`'s format v0.4.1, §18: "`answer_slots_filled` — every answer slot of the task holds something of the learner's: a stroke in its zone or its box, an option tapped, and for an answer slot bound `anywhere` or `sheet`, a stroke on the sheet". §14: "An answer slot bound `anywhere` or `sheet` is the only answer slot of its task" and "The learner's app shows the `text`, with the options of the item's answer slots bound `choice`, beside the sheet: the sheet shows neither". §21: "The learner does not write on the sheet: it holds the author's demo and no learner's work", "The learner opens them one at a time, and MAY hide the whole demo and show it again" and "Whether the paragraphs and the pictures beside the sheet stand above it or beside it is the canvas's to say, as for a task's statement";
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024. 4.1.3 Status Messages: "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus". 1.3.2: "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined". 2.4.3: "focusable components receive focus in an order that preserves meaning and operability";
- [Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), updated 11 May 2026: a status tells "the success or results of an action", and the criterion "specifically addresses scenarios where new content is added to the page without changing the user's context". An example: after "Add to Shopping Cart", "5 items" appears beside it, and the screen reader speaks it without taking the focus;
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), W3C Recommendation 06 June 2023. The role `status` is "A type of live region whose content is advisory information for the user but is not important enough to justify an alert", it has "an implicit aria-live value of polite and an implicit aria-atomic value of true", and "If another part of the page controls what appears in the status, authors SHOULD make the relationship explicit with the aria-controls attribute". `aria-expanded` "Indicates whether a grouping element owned or controlled by this element is expanded or collapsed", and "If a grouping container that can be expanded or collapsed is not owned by the element that has the aria-expanded attribute, the author SHOULD identify the controlling relationship by referencing the container from the element that has aria-expanded with the aria-controls property";
- [APG, Disclosure (Show/Hide) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), the page has no date: "The element that shows and hides the content has role button", "When the content is visible, the element with role button has aria-expanded set to true" and "Optionally, the element with role button has a value specified for aria-controls that refers to the element that contains all the content that is shown or hidden"; Enter and Space "toggles the visibility of the disclosure content";
- [HTML Standard, The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute), Last Updated 30 October 2026: an element with `hidden` "is not yet, or is no longer, directly relevant to the page's current state", and "User agents should not render elements that are in the Hidden state".

### 9.15. Shared loading of pictures

Read 2026-11-01:

- [HTML Standard, Images](https://html.spec.whatwg.org/multipage/images.html), Last Updated 30 October 2026: "Each Document object must have a list of available images", and "The list of available images is intended to enable synchronous switching when changing the src attribute to a URL that has previously been loaded". If the list has a picture for the URL, "Set the current request to a new image request whose image data is that of the entry and whose state is completely available". But "User agents may also remove images from such lists at any time (e.g. to save memory)";
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1: after `new Image()` with a `blob:` URL and `await decode()`, a new `<img>` with the same URL is `complete`, with `naturalWidth` above zero, synchronously, even before it is inserted into the document, for SVG and for PNG. After `URL.revokeObjectURL` a new `<img>` with that URL is not decoded: "EncodingError: The source image cannot be decoded";
- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026: "interface SVGImageElement : SVGGraphicsElement { … attribute DOMString? crossOrigin; }; SVGImageElement includes SVGURIReference;" — the IDL has no method `decode()`. In Chrome Headless Shell 156, `SVGImageElement.prototype.decode` is a function: Chromium gives it beyond the standard.

### 9.16. Pictures in sheet areas

Read 2026-11-01:

- [SVG 2, Embedded Content](https://www.w3.org/TR/SVG2/embedded.html), W3C Candidate Recommendation Snapshot 06 October 2026, of `image`: `preserveAspectRatio` "must be explicitly set to none to turn off aspect ratio control", and "If the value of ‘preserveAspectRatio’ was 'none' then aspect ratio of the image would not be preserved. The image would be fit such that the top/left corner of the raster exactly aligns with coordinate (x, y) and the bottom/right corner of the raster exactly aligns with coordinate (x+width, y+height)";
- [SVG 2, Rendering Model](https://www.w3.org/TR/SVG2/render.html), the same, 3.4 Rendering order: "By default, elements are painted in document order: an element that appears later in the markup is painted on top of an element that appears earlier";
- [CSS Color Adjustment Module Level 1](https://www.w3.org/TR/css-color-adjust-1/), W3C Candidate Recommendation Snapshot, 16 December 2025, 3.1: in the forced colors mode "the <color> components of all properties on the element are force-adjusted to the user’s preferred color palette", and "background-image computes to none unless the original value contains a url() function". The pixels of a picture's file are not a property, and a picture on the sheet keeps the colors of its file: a test in Chromium holds this;
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. A PNG of 3000 × 3000 of noise: a new `<image>` with a `blob:` URL that a picture had decoded beforehand is painted, by Element Timing, 15 ms after its insertion, in the nearest frame, and without the decoding 105 ms after, six `requestAnimationFrame` callbacks later. A PNG of 40 × 20 of four colors in an `<image preserveAspectRatio="none">` of 400 × 300 fit its corners to the corners, and an SVG file stretches the same way, with `viewBox` and without it. `scrollIntoView` on a box with `visibility: hidden` scrolls the container the same as on a visible one.

### 9.17. Styles under CSP

Read 2026-11-08:

- [CSSOM](https://drafts.csswg.org/cssom/), Editor’s Draft 13 October 2026, of the assignment of `adoptedStyleSheets`: "If value’s constructed flag is not set, or its constructor document is not equal to this DocumentOrShadowRoot’s node document, throw a "NotAllowedError" DOMException";
- [DOM Standard](https://dom.spec.whatwg.org/), Living Standard — Last Updated 4 November 2026, "To adopt a node node into a document document": the step for a shadow root changes its document and its registry of custom elements, and says nothing of the sheets of `adoptedStyleSheets`;
- [Content Security Policy Level 3](https://w3c.github.io/webappsec-csp/), Editor’s Draft 27 October 2026, `style-src`: "The following CSS algorithms are gated on the unsafe-eval source expression" — as a list: insert a CSS rule, parse a CSS rule, parse a CSS declaration block, parse a group of selectors; — "This would include, for example, all invocations of CSSOM’s various cssText setters and insertRule methods" and right there "This needs to be better explained", with a reference to issue #212 of `w3c/webappsec-csp`. And `style-src-elem` "governs the behaviour of styles except for styles defined in inline attributes";
- [app](https://github.com/altnovatrail/app/tree/375a09b), the branch `main`, commit 375a09b, RUN.md, Д9: «Не проверено: … что `style-src` не блокирует `adoptedStyleSheets` и `element.style` канвы (…)»;
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1. Under the policy `default-src 'none'; style-src 'self'; img-src blob:` in a frame's `<meta>`, a `<style>` in a shadow root is blocked — a `securitypolicyviolation` event with `style-src-elem` and the URL `inline`, and the host has `display: inline` — while a sheet from `replaceSync()`, assignments to the `style` properties and `blob:` pictures work with no events. An element moved into an iframe of the same origin stays with an empty `adoptedStyleSheets` and with no styles — both there and after its return — until `adoptedCallback()` gives it the sheet.

### 9.18. The sheet's zoom

Read 2026-11-11, the pages' text by `curl`:

- [Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), updated 06 September 2026: "Content satisfies the success criterion if it can be scaled up to 200% using at least one text scaling mechanism supported by user agents"; "it should still be possible to get 200% text enlargement in some way compared to the default 100% zoom"; among the sufficient techniques, G142 and G178;
- [G178](https://www.w3.org/WAI/WCAG22/Techniques/general/G178), "Providing controls on the web page that allow users to incrementally change the size of all text on the page up to 200 percent", updated 24 September 2025, a technique for 1.4.4 (Sufficient): "The purpose of this technique is to provide a mechanism on the web page to incrementally increase the size of text".

### 9.19. The row in a low window, focus and motion

Read 2026-11-11:

- [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), updated 04 October 2026: 320 CSS px is "a starting viewport width of 1280 CSS pixels wide at 400% zoom", and 256 CSS px is "a starting viewport height of 1024 CSS pixels at 400% zoom"; of sticky panels, "It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user"; the criterion allows two-dimensional layout for "interfaces where it is necessary to keep toolbars in view while manipulating content" too;
- [C34](https://www.w3.org/WAI/WCAG22/Techniques/css/C34), "Using media queries to un-fixing sticky headers / footers", updated 12 January 2026, a technique for 1.4.10 (Advisory): "The objective of this technique is to be able to present content with sticky headers and footers when there is enough space". In its example a header with `min-height: 130px` sticks only in a window of `@media (min-height: 480px)`;
- [Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), updated 15 June 2026: "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content"; "Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs"; a failure is F110, "due to a sticky footer or header completely hiding focused elements";
- [Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), updated 04 October 2026: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible";
- [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), updated 04 October 2026: the parts of an interface and their states "have a contrast ratio of at least 3:1 against adjacent color(s)", and "the visual focus indicator for a component must have sufficient contrast against the adjacent background when the component is focused";
- [Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), updated 16 September 2025: "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed", and of scrolling, "Moving new content into the viewport is essential for scrolling".

### 9.20. Declared nonconformances

Read 2026-11-11, the pages' text by `curl`:

- [Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), updated 01 October 2025: the criterion is "In content implemented using markup languages that support the following text style properties, no loss of content or functionality occurs by setting all of the following and by changing no other style property"; "The author requirement is both to not interfere with a user's ability to override the author settings, and to ensure that content thus modified does not break content"; "Content does not fail this SC if the method chosen by the user - for instance, the use of an extension or bookmarklet - fails to correctly set the line height and spacing text properties on the content (provided that the content is not actively and purposely preventing the properties from being added)";
- [Understanding 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html), updated 04 October 2026: the criterion is "The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular of the immediately surrounding text";
- [Understanding 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), updated 04 October 2026: the exception is "except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints"; "For example, if using handwriting to enter text, the input technique (handwriting) requires path-dependent input but the underlying function (text input) does not"; "Free hand drawing, or watercolor painting require path dependent input";
- a probe in the image's Chrome Headless Shell 156.0.8078.4 through Playwright 1.64.1, on the page of `just demo` 414 CSS px wide: the rules of the Text Spacing bookmarklet — `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em` with `!important` on every element and `margin-bottom: 2em` on a paragraph — first as a style of the document, and then also as a sheet in the element's shadow root, in place of a user style. The document's style reaches the statement by inheritance — `letter-spacing` 1.92 px — but not the workbook's printed text: its text has `normal`. The sheet in the shadow root gives the printed text 3.6 px, but the widths of the first three pieces stay within a third of a unit: 24, 41 and 57 units of the sheet against 24, 41 and 57.34 without the spacing; `textLength` holds them. No label of the row's eight buttons went beyond its button, neither on the sheet nor on the workbook.
