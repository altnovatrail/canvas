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

/** The words of the page's screen. */
export const TEXTS = {
  version: (version: string) => `Версия страницы: ${version}.`,
  code: "Код писавшего на это открытие страницы:",
  codeAfter: "Запишите его: по нему отзывают согласие.",
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
  leave: "Написанное не сохранено. Перейти к другой задаче?",
  frame: (part: number, of: number) => `Часть ${part} из ${of}`,
  boxFrame: (box: string) => `Окошко ${box}`,
} as const;
