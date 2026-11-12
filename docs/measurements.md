# canvas — замеры и пробы

> Итоги замеров и проб `canvas` — что мерили или пробовали, как, на чём и что вышло, с числами (RULES.md, How we work; R143 spec). Документы, которые описывают устройство, ссылаются на них по номеру, как на раздел: `measurements 1.1`, а [architecture.md](architecture.md) их не держит. Внешние факты с цитатами — в [sources.md](sources.md).
>
> Номер подраздела не меняется: новый встаёт в конец своего раздела, новый раздел — в конец файла. До T110 пробы раздела 1 стояли в architecture 4, под теми же заголовками (RUN.md, T110).

## 1. Пробы браузеров и устройств

### 1.1. Проба T29

(architecture 2.4 и 3.6; R52; T29 в [RUN.md](../RUN.md)) — прогон 2026-11-08 пре-релиза `t29-probe` (sha256 файлов сверены с собранными: `t29-probe-csp.html` — a4278f1e…a235547, `t29-probe-open.html` — 89acda13…a8bb95):

- **Firefox 159.0 на Linux**, руками автора, файлы из `~/Downloads`: скрипт выполнился, `isSecureContext` — да, `getCoalescedEvents` есть, картинка `blob:` показана, IndexedDB открылась. Под политикой все четыре запроса — `blocked`, по два события у `connect-src` и `img-src`; без политики — `failed`, событий нет. У мыши нажим 0,5 с нажатой кнопкой и 0 без неё, ширина 1. Хранилище: у `t29-probe-open.html` в той же папке — своё, у копии `t29-probe-csp.html` в `~/Documents` — пустое, а после перезапуска Firefox пустым оказалось и у оригинала. Отчёты легли сразу в `~/Downloads`, без вопроса, а папка с облаком не синхронизируется;
- **Chromium** — Chrome Headless Shell 156.0.8078.4 образа, с профилем на диске: четыре шага, каждый — новый запуск браузера с тем же профилем, файлы — те же, скачанные из пре-релиза. Скрипт, безопасный контекст, картинка, IndexedDB и запросы — как в Firefox. Запись `t29-probe-csp.html` видят `t29-probe-open.html` той же папки и копия в другой папке, и она переживает перезапуск. Обычный Chrome на хосте автор не прогонял: хранилище и политика — код движка, общий с Chrome Headless Shell, а папку загрузок по умолчанию называют исходники;
- **исходники Firefox** — тег [FIREFOX_159_0_RELEASE](https://github.com/mozilla-firefox/firefox/tree/FIREFOX_159_0_RELEASE), прочитано 2026-11-08:
  - origin файла — весь его адрес: если хоста нет, `rv = aURI->GetAsciiSpec(aOriginNoSuffix);` (`caps/ContentPrincipal.cpp`, `GenerateOriginNoSuffixFromURI`), пока `security.fileuri.strict_origin_policy` — `true` (`StaticPrefList.yaml`); иначе — «`file://UNIVERSAL_FILE_URI_ORIGIN`» для всех файлов;
  - `localStorage` держат в памяти только приватный режим и разделённое хранилище трекеров: «In private-browsing, LocalStorage keeps data in memory», «For Partitioned Trackers, we expose a partitioned LocalStorage, which doesn't share data with other contexts, and it's just in memory» (`dom/base/nsGlobalWindowInner.cpp`, `GetLocalStorage`);
  - очистка при закрытии: `privacy.sanitize.sanitizeOnShutdown` — `false`, `browser.privatebrowsing.autostart` — `false` (`StaticPrefList.yaml`). Если очистка включена, она стирает и `file:`: «We consider just permissions set for http, https and file URLs» (`browser/modules/Sanitizer.sys.mjs`). Почему у автора запись пропала, не проверено: настройки его Firefox проба не читает;
  - загрузки — в папку загрузок без вопроса: `pref("browser.download.useDownloadDir", true);` (`browser/app/profile/firefox.js`);
- **исходники Chromium** — тег [156.0.8078.47](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/), прочитано 2026-11-08: `registry->RegisterBooleanPref(prefs::kPromptForDownload, false, …)` (`chrome/browser/download/download_prefs.cc`) — Chrome по умолчанию папку не спрашивает;
- **порт 9** Chromium отклоняет сам, `net::ERR_UNSAFE_PORT`, и без политики — поэтому проба спрашивает порт 4 (R52).

### 1.2. Проба T74

(architecture 2.4 и 3.6; R54; T74 в [RUN.md](../RUN.md)) — прогон [42506098435](https://github.com/altnovatrail/canvas/actions/runs/42506098435) workflow `emulators.yml` 2026-11-08 на pull request #92, эмулятор 37.2.13, образ `system-images;android-36;google_apis;x86_64` ревизии 7, Android 16, Chrome 133.0.6943.137, `pixel_tablet` 2560 × 1600:

- Chrome скачал оба файла с сервера на раннере — `http://10.0.2.2:8080`, заголовки релиза GitHub — без вопроса о типе файла или о HTTP; спросил он только об уведомлениях, при первом запуске, и драйвер ответил «No thanks». Загрузки легли в `/sdcard/Download`;
- файл открылся из списка загрузок Chrome — по имени, а в прогоне 42503595244 и по «Open» в сообщении о загрузке — во вкладке поверх окна Chrome, с адресом `content://media/external/downloads/19`. Имени файла адрес не несёт, и проба пишет вместо него номер загрузки;
- скрипт выполнился, `isSecureContext` — да, `getCoalescedEvents` есть, картинка `blob:` показана, IndexedDB открылась. Под политикой все четыре запроса — `blocked`, по два события у `connect-src` и `img-src`; без политики — `failed`, событий нет;
- указатели: касание `input touchscreen swipe` — `touch`, 19 событий и 68 промежуточных; `input stylus swipe` — `pen`, 16 и 25. Нажим у обоих — 1, ширина — 1: эмулятор нажима пера не даёт (Д7);
- хранилище: запись страницы с номером 19 видит страница с номером 21, и после `am force-stop` Chrome она осталась. «Save report» положил `report-19.json` в `/sdcard/Download`, без вопроса;
- строка браузера в отчёте — «Linux; Android 10; K», хотя система — Android 16;
- прогон [42507671065](https://github.com/altnovatrail/canvas/actions/runs/42507671065), после ревью, — то же: все 15 шагов ok за 5 минут job, страницы с номерами 17 и 21, касание — 16 событий и 62 промежуточных, перо — 14 и 29. Счётчики событий от прогона к прогону разные, а остальное — одно.

### 1.3. Проба T80

(architecture 2.4 и 3.6; R54; T80 в [RUN.md](../RUN.md)) — прогоны workflow `emulators.yml` 2026-11-08 на pull request #93, iPad Pro 13-inch (M5), WebDriverAgent v16.15.3; находки — по прогону [42516361224](https://github.com/altnovatrail/canvas/actions/runs/42516361224) и следующим:

- **iPadOS 27.2** — образ `xcode-27`, Xcode 27.1, рантайм `iOS-27-2` — и **iPadOS 26.5** — `macos-26`, Xcode 26.6, рантайм `iOS-26-5` — одинаково:
  - Safari на адрес файла с сервера спрашивает «Do you want to download “t29-probe-csp.html”?» — «Download» и «Close», без «View»;
  - «Файлы» → «Browse» → «On My iPad» → «Downloads» → файл: открывается Quick Look с именем файла без `.html`. Разметка и стиль страницы видны, а первая строка — «The page's script did not run.»: скрипт не выполняется. Картинки `blob:` нет, есть пустая рамка. Кнопки видны, но ничего не делают;
  - загрузка, нажатая через WebDriverAgent, легла в «Файлы» один раз из восьми; в остальных прогонах файлы в «Downloads» положил драйвер, через контейнер группы `group.com.apple.FileProvider.LocalStorage` (поправка к R54). Quick Look тот же, что открывает загрузку, так что ответ — о загрузке;
- **Safari 27.2 на macOS 26.7.2** — образ `macos-26`: `safaridriver` скачивает оба файла в `~/Downloads` без вопроса, а `open -a Safari` открывает их по `file:///Users/runner/Downloads/…` — вкладки называются «canvas file probe», то есть разметка прочитана, — но окно на раннере не отрисовывает страницу, ни из `~/Downloads`, ни из своей папки. Выполняется ли скрипт, раннер не показывает; AppleScript просит согласия «"hosted-compute-agent" wants access to control "Safari"».

### 1.4. Слой шаблона тетради

(R36) — пробы в контейнере 2026-10-27, Chrome Headless Shell 156.0.8078.4 через Playwright 1.64.1. Других браузеров в образе нет: Playwright там ставит только `chromium_headless_shell`, и WebKit не пробовался.

- Рамка окошка — 1 CSS px, `#111` на белом, `vector-effect: non-scaling-stroke`. Условия:
  - 24 окошка;
  - ширины листа 414, 700 и 1000 CSS px;
  - `viewBox` со сдвигами 0; 0,37; 13,5 и 101,73 единицы;
  - 1152 края на плотность.

  Итог:
  - с `shape-rendering: crispEdges` самый светлый край — 18,9:1 при плотности 1; 1,25; 1,5 и 2. Толщина — 1 пиксель устройства при 1, 1–2 при 1,25 и 1,5, 2 при 2;
  - сглаженная рамка — 3,59:1 при 1, 5,41 при 1,25, 8,59 при 1,5 и 18,9 при 2.
- Сброс наследуемого — копия слоя в открытом shadow root. Враждебные стили предка:
  - интервалы, жирный, курсив, `text-transform`, `font-size` и `font-size-adjust`;
  - `direction: rtl` и `dir=rtl` у страницы;
  - `text-anchor`, `dominant-baseline` и `baseline-shift`;
  - `fill`, `stroke`, `paint-order` и `-webkit-text-stroke`;
  - `font-feature-settings`, `font-kerning`, `white-space` и `text-size-adjust: 300%`.

  Итог:
  - `all: initial` и пять восстановлений оставляют на `<text>` вычисленные значения по умолчанию;
  - начало первого знака и конец последнего, `getStartPositionOfChar` и `getEndPositionOfChar`, — там, где их ставит раскладка. Так в Liberation Sans, Serif и Mono, при `k` 0,414 и 1, на плотностях 1 и 2. В тесте элемента одинокая «м» в Serif кончается на 0,04 единицы дальше;
  - ширина `getBBox` при `k` 0,414 в Serif расходится с заданной до 2,08 единицы.
- В режиме принудительных цветов без явного `fill` и `stroke` у печати остаётся цвет чернил темы: SVG держит цвет родителя, `svg|svg { forced-color-adjust: preserve-parent-color; }` (выше).
- `scrollIntoView` пункта ниже видимой части — копия сцены: липкая видимая часть с `overflow: clip` и `viewBox` по прокрутке. Контейнер прокручивается сразу, а пункт встаёт в видимую часть через два кадра, когда ставится новый `viewBox`. Так у `<g>`, `<text>` и `<rect>` и при `focus()`.
- Унаследованный `writing-mode: vertical-rl` кладёт сцену набок, и `scrollIntoView` ничего не прокручивает. `:host { writing-mode: horizontal-tb }` возвращает всё, как без него, а `writing-mode` в стиле самого хоста сильнее `:host`.
- `Accessibility.getFullAXTree` с `frameId` фрейма из `Page.getFrameTree` отдаёт дерево iframe того же источника через сессию всей страницы. Так тест берёт дерево фрейма `vitest-iframe` через `cdp()`. Языка в узлах дерева нет.

## 2. Расход токенов сессиями Claude Code

Строка — `just -f spec/justfile tokens-report --since <начало> --until <конец> --row` по расшифровкам сессий этой машины, по образцу measurements 1.9 spec; при архиве эпика — окно эпика (RUN.md, «Как устроен план: эпики»; R145 spec). Первая строка — «до» эпика E13: все сессии `canvas` до 2026-11-12T14:27, как их измерил `spec` в measurements 1.9 spec; следующие — сессии E13 (R77).

| Окно, UTC | Что | Сессии | Вызовы, главная / субагенты | Контекст вызова, тыс., главная / субагенты | Сжатия | Стоимость по ценам API |
|---|---|---|---|---|---|---|
| 2026-10-13T00:00 … 2026-11-12T14:27 | до E13 — measurements 1.9 spec | 37 | 12,565 / 7,897 | 369.1 / 114.8 | 99 | $2,040.66 |
