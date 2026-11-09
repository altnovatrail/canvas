// Every text the samples page's script writes, in one place (T81 in RUN.md; R56 in
// docs/decisions.md); the template, page/index.html, holds the few words that never change — the
// heading and two labels — so that a reader of the template sees them. The screens are in Russian
// alone, and a translation by the rules of UI packages' translations (R91 spec; epic E10 in RUN.md)
// goes here and there. The texts are for now: those of the notices and the consent
// are the lawyer's to read (R11; epic E4 in RUN.md of spec), and T20 brings the set of texts.

/** The kinds of task the samples page offers (T21): a sheet, an essay — a sheet whose answer is the
 * whole sheet — and a workbook's page. */
export type TaskKind = "sheet" | "essay" | "workbook";

/** What a form of markup still lacks, said to the writer, before the sample can be saved. */
export const LACKS = {
  groups: "Каждая группа штрихов должна быть ровно в одной части. Начните разметку заново.",
  text: (part: number) =>
    `У части ${part} нет текста: впишите, что в ней написано, или опишите рисунок.`,
  crossedFinal: (part: number) => `Часть ${part} зачёркнута, поэтому в ней нет итогового ответа.`,
  firstErrorPlace: "Первая ошибка указана у части, которой нет.",
  crossedError: (part: number) => `Часть ${part} зачёркнута: первой ошибки в ней быть не может.`,
  answer: "Впишите итоговый ответ так, как он написан.",
  mirroredOne: "Зеркальную цифру отмечают, только когда итоговый ответ один и разборчив.",
  rewrittenBlank: "На пустом листе нечего отмечать как зачёркнутое.",
  emptyNote: (box: string) => `Окошко ${box} пустое: отмечать в нём нечего.`,
  boxValue: (box: string) => `Впишите значение окошка ${box} так, как оно написано.`,
  essayText: "Впишите текст сочинения так, как он написан, или отметьте, что его не прочесть.",
  illegibleBlank: "На пустом листе нечего отмечать как неразборчивое.",
  textBlank: "На листе нет штрихов, а текст сочинения вписан: уберите его.",
  textIllegible:
    "Сочинение отмечено как непрочитываемое, а текст вписан: уберите текст или отметку.",
} as const;

/** What the start still lacks before writing (T20, T84): the purpose, the code, the statements. */
export const START_LACKS = {
  purpose: "Выберите, для чего образец.",
  code: "Введите свой код писавшего или попросите новый.",
  childCode: "Введите код ребёнка — тот, что вписан в его форму согласия.",
  childNew:
    "Сеанс начинается с кодом из принятой формы: впишите новый код в форму, а когда организатор её примет, откройте страницу заново и введите код.",
  codeShape: "Код писавшего — от 6 до 16 цифр и заглавных латинских букв.",
  childCodeShape: "Код ребёнка — от 6 до 16 цифр и заглавных латинских букв.",
  statements: "Отметьте все заявления: без них дальше нельзя.",
} as const;

/** Why a purpose is closed, or what an open one is limited to (T20; docs/architecture.md, 3.6). */
export const PURPOSE_NOTES = {
  measurementDraft: "Пока тексты черновые — только образцы автора проекта.",
  evalSetDraft:
    "Закрыт, пока тексты черновые: pull request публикует образец сразу, и согласие на него должно быть по утверждённым текстам.",
  evalSetNoModule:
    "Закрыт: в этой сборке нет задач модулей, а в eval-набор модуля идут образцы только его задач.",
  childDraft:
    "Закрыт, пока тексты черновые: образец ребёнка делается только по утверждённой форме родителя или опекуна.",
  noTexts: "Закрыт: в наборе текстов этой сборки для него нет текстов.",
} as const;

/** The words of the page's screen. */
export const TEXTS = {
  about:
    "Здесь взрослый пишет от руки решение задачи, а страница сохраняет образец файлом на этом устройстве.",
  version: (version: string) => `Версия страницы: ${version}.`,
  github: "Страницу скачивают с GitHub, и GitHub видел IP-адрес того, кто её скачал.",
  purpose: { measurement: "замер", evalSet: "eval-набор модуля", child: "сеанс образца ребёнка" },
  /** The step of the code, for an adult's own code and for a child's (T84). The template holds the
   * adult's words too, so that every label has its text before the script runs. */
  code: {
    measurement: {
      legend: "Код писавшего",
      own: "ввести свой код",
      new: "новый писавший",
      typed: "Ваш код:",
    },
    child: {
      legend: "Код ребёнка",
      own: "ввести код из формы согласия",
      new: "новый код для формы — без ребёнка",
      typed: "Код из формы:",
    },
  },
  newCode: (code: string) =>
    `Ваш новый код: ${code}. Запишите его: по нему отзывают согласие на образцы замера, а страница его не запомнит.`,
  newChildCode: (code: string, version: string) =>
    `Новый код ребёнка: ${code}. Впишите его в форму согласия родителя или опекуна версии ${version}: по нему отзывают согласие и удаляют образцы ребёнка. Страница его не запомнит.`,
  notice: (purpose: string, version: string) => `Уведомление: ${purpose}, тексты версии ${version}`,
  summary: (purpose: string, code: string | undefined, version: string, child = false) =>
    `${purpose}${code ? `, ${child ? "код ребёнка" : "код писавшего"} ${code}` : ""}, тексты версии ${version}.`,
  /** Who writes and who marks up in a child's session (docs/architecture.md, 3.6). */
  childWrites: "Пишет ребёнок. Размечаете вы — со слов ребёнка, после письма.",
  /** Where Safari on an iPad puts a download, which the page cannot see (В30; the 2026-10-22
   * addition to П-10): Apple's guide to iPadOS 27, «Customize your Safari settings on iPad», read
   * 2026-11-09, in English: its Russian page did not show the passage. */
  ipadDownloads:
    "На iPad проверьте до сохранения, куда Safari кладёт загрузки: «Настройки» → «Приложения» → Safari → «Загрузки» (Settings → Apps → Safari → Downloads). Нужно «На iPad» (On My iPad), а не iCloud Drive: иначе файл ребёнка уйдёт в облако Apple.",
  restart:
    "Назначение, код и заявления можно сменить только новым открытием страницы, а написанное не сохранено. Начать заново?",
  offline:
    "Страница работает без сети: всё, что ей нужно, — в этом файле. Образец сохраняется файлом на этом устройстве.",
  /** What the picker calls a task, by its kind (T21): a sheet whose answer is the whole sheet is an
   * essay. */
  taskKind: { sheet: "Лист", essay: "Сочинение", workbook: "Тетрадь" } satisfies Record<
    TaskKind,
    string
  >,
  task: (kind: string, id: string) => `${kind}: ${id}`,
  bank: (path: string) => `Банк ${path}`,
  writer: "Кто писал:",
  writerOwn: "взрослый, своим почерком",
  writerChild: "взрослый, подражая детскому почерку",
  markup: "Разметить",
  markupAgain: "Разметить заново",
  noStrokes: "На листе нет штрихов: образец пустого листа.",
  changed: "Лист изменился после разметки — разметьте его заново.",
  crop: "Так лист увидит модель:",
  cropBox: (box: string) => `Окошко ${box}: так его увидит модель`,
  parts: "Части решения — в том порядке, в каком оно читается.",
  part: (n: number, groups: readonly string[]) => `Часть ${n}: группы ${groups.join(", ")}`,
  show: "Показать на листе",
  join: "Слить со следующей",
  part_: "Разъединить",
  up: "Выше",
  down: "Ниже",
  kind: "Вид:",
  kindText: "текст",
  kindDrawing: "рисунок",
  partText: "Что написано (рисунок — словами, со всеми числами и подписями):",
  crossedOut: "зачёркнута",
  illegible: "написана неразборчиво нарочно",
  /** The same flag in a child's session: whether on purpose, the adult marking it up cannot know. */
  illegibleChild: "написана неразборчиво — не прочесть и со слов ребёнка",
  finalAnswer: "итоговый ответ задачи",
  firstError: "Первая ошибка в решении:",
  noError: "ошибки нет",
  answer: "Итоговый ответ, как написан:",
  mirrored: "в ответе цифра написана зеркально",
  rewritten: "в ответе что-то зачёркнуто и написано заново",
  box: (box: string) => `Окошко ${box}`,
  empty: "пустое",
  read: "Что в нём:",
  readValue: "значение",
  readIllegible: "неразборчиво",
  readAmbiguous: "можно прочесть по-разному",
  value: "Значение, как написано:",
  save: "Сохранить образец",
  saved: (id: string) => `Образец ${id} сохранён в загрузки.`,
  lacks: "Чтобы сохранить, осталось:",
  startLacks: "Чтобы начать, осталось:",
  leave: "Написанное не сохранено. Перейти к другой задаче?",
  /** An essay's markup (T21): its text as written, the writer's mistakes kept, or that it cannot be
   * read as a whole; the marks of its criteria are the organizer's, after the writing (spec's
   * contracts/README.md, «The markup»). */
  essayText: "Текст сочинения, как написан, — с ошибками, с переносами строк:",
  essayIllegible: "сочинение не прочесть целиком",
  essayMarks: "Оценки критериев ставит организатор после письма — страница их не ставит.",
  frame: (part: number, of: number) => `Часть ${part} из ${of}`,
  boxFrame: (box: string) => `Окошко ${box}`,
} as const;
