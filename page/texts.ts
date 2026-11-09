// Every text the samples page's script writes, in one place (T81 in RUN.md; R56 in
// docs/decisions.md); the template, page/index.html, holds the few words that never change — the
// heading and two labels — so that a reader of the template sees them. The screens are in Russian
// alone, and a translation by the rules of UI packages' translations (R91 spec; epic E10 in RUN.md)
// goes here and there. The texts are for now: those of the notices and the consent
// are the lawyer's to read (R11; epic E4 in RUN.md of spec), and T20 brings the set of texts.

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
} as const;

/** What the start still lacks before writing (T20): the purpose, the code, the statements. */
export const START_LACKS = {
  purpose: "Выберите, для чего образец.",
  code: "Введите свой код писавшего или попросите новый.",
  codeShape: "Код писавшего — от 6 до 16 цифр и заглавных латинских букв.",
  statements: "Отметьте все заявления: без них дальше нельзя.",
} as const;

/** Why a purpose is closed, or what an open one is limited to (T20; docs/architecture.md, 3.6). */
export const PURPOSE_NOTES = {
  measurementDraft: "Пока тексты черновые — только образцы автора проекта.",
  evalSetDraft:
    "Закрыт, пока тексты черновые: pull request публикует образец сразу, и согласие на него должно быть по утверждённым текстам.",
  evalSetNoModule:
    "Закрыт: в этой сборке нет задач модулей, а в eval-набор модуля идут образцы только его задач.",
} as const;

/** The words of the page's screen. */
export const TEXTS = {
  about:
    "Здесь взрослый пишет от руки решение задачи, а страница сохраняет образец файлом на этом устройстве.",
  version: (version: string) => `Версия страницы: ${version}.`,
  github: "Страницу скачивают с GitHub, и GitHub видел IP-адрес того, кто её скачал.",
  purpose: { measurement: "замер", evalSet: "eval-набор модуля" },
  newCode: (code: string) =>
    `Ваш новый код: ${code}. Запишите его: по нему отзывают согласие на образцы замера, а страница его не запомнит.`,
  notice: (purpose: string, version: string) => `Уведомление: ${purpose}, тексты версии ${version}`,
  summary: (purpose: string, code: string | undefined, version: string) =>
    `${purpose}${code ? `, код писавшего ${code}` : ""}, тексты версии ${version}.`,
  restart:
    "Назначение, код и заявления можно сменить только новым открытием страницы, а написанное не сохранено. Начать заново?",
  offline:
    "Страница работает без сети: всё, что ей нужно, — в этом файле. Образец сохраняется файлом на этом устройстве.",
  sheetTask: "Лист",
  workbookTask: "Тетрадь",
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
  frame: (part: number, of: number) => `Часть ${part} из ${of}`,
  boxFrame: (box: string) => `Окошко ${box}`,
} as const;
