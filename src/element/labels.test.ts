// The element's labels by the shared rules of translations (T91 in RUN.md; R28 in docs/decisions.md;
// R91 spec): every language has every label, with the places of English's; a label is filled by
// name, its places in any order, and never shows a brace; the buttons say the words of the table of
// architecture 6 spec; a language the table has not is English, under its own tag.

import { expect, test } from "vitest";
import { knows, LANGUAGES, labelsFor, placesOf, say, sayAround } from "./labels.js";

const english = labelsFor("en").labels;

test("every language has every label, each with the places of English's", () => {
  expect(LANGUAGES).toEqual(["en", "ru"]);
  for (const tag of LANGUAGES) {
    const { lang, labels } = labelsFor(tag);
    expect(lang).toBe(tag);
    expect(Object.keys(labels).sort((a, b) => a.localeCompare(b))).toEqual(
      Object.keys(english).sort((a, b) => a.localeCompare(b)),
    );
    for (const [key, label] of Object.entries(labels)) {
      const places = placesOf(label);
      const byName = (a: string, b: string) => a.localeCompare(b);
      expect([...places].sort(byName), key).toEqual(
        [...placesOf(english[key as keyof typeof english])].sort(byName),
      );
      // Filled, it shows no brace: none stands outside a place.
      const filled = say(label, Object.fromEntries(places.map((place) => [place, "x"])));
      expect(filled, `${tag} ${key}`).not.toMatch(/[{}]/);
    }
  }
});

test("a label is filled by name: one string, its places in its own order", () => {
  const russian = labelsFor("ru").labels;
  expect(say(russian.part, { n: 2, total: 4 })).toBe("Часть 2 из 4.");
  expect(say(english.part, { total: 4, n: 2 })).toBe("Part 2 of 4.");
  expect(say(russian.filled, { name: say(russian.boxAt, { slot: 2 }) })).toBe(
    "Окошко 2, заполнено",
  );
  expect(say(english.valued, { name: say(english.boxIn, { line: 1, slot: 2 }), value: "5" })).toBe(
    "Box 1.2: 5",
  );
  // A language that puts the number first takes it from the same values.
  expect(say("{total} 中的第 {n} 部分", { n: 2, total: 4 })).toBe("4 中的第 2 部分");
  // A value is put in as it is: braces in it are no places.
  expect(say(english.valued, { name: "Box", value: "{n}" })).toBe("Box: {n}");
});

test("a place with no value is a TypeError, never a brace on the screen", () => {
  expect(() => say(english.part, { n: 2 })).toThrow(/no value for \{total\}/);
  expect(() => say("{constructor}", {})).toThrow(TypeError);
});

test("a label cut at the place of a value fills the rest, in every language, which names the value once (T107)", () => {
  for (const tag of LANGUAGES) {
    const { labels } = labelsFor(tag);
    expect(
      placesOf(labels.valued).filter((place) => place === "value"),
      tag,
    ).toHaveLength(1);
    const name = say(labels.boxIn, { line: 1, slot: 1 });
    const [before, after] = sayAround(labels.valued, "value", { name });
    expect(`${before}5${after}`).toBe(say(labels.valued, { name, value: "5" }));
  }
  expect(sayAround(labelsFor("ru").labels.valued, "value", { name: "Окошко 1.1" })).toEqual([
    "Окошко 1.1: ",
    "",
  ]);
  // A language that puts the value first has it at the start.
  expect(sayAround("{value} в {name}", "value", { name: "окошке" })).toEqual(["", " в окошке"]);
  // Braces in a value given for another place are no places.
  expect(sayAround(english.valued, "value", { name: "{value}" })).toEqual(["{value}: ", ""]);
});

test("a label that names the place to cut at not once, or a place with no value, is a TypeError", () => {
  expect(() => sayAround(english.boxIn, "value", { line: 1, slot: 1 })).toThrow(/not once/);
  expect(() => sayAround("{value} {value}", "value", {})).toThrow(/not once/);
  expect(() => sayAround(english.valued, "value", {})).toThrow(
    'the label "{name}: {value}" has no value for {name}',
  );
});

test("the buttons say the words of the table of architecture 6 spec", () => {
  const words = (tag: string) => {
    const { labels } = labelsFor(tag);
    const { pen, eraser, undo, clear, up, down, zoomIn, zoomOut, left, right, next, demo, finger } =
      labels;
    return [pen, eraser, undo, clear, up, down, zoomIn, zoomOut, left, right, next, demo, finger];
  };
  expect(words("en")).toEqual([
    "Pen",
    "Eraser",
    "Undo",
    "Clear",
    "Up",
    "Down",
    "Zoom in",
    "Zoom out",
    "Left",
    "Right",
    "Next",
    "Demo",
    "Draw with finger",
  ]);
  expect(words("ru")).toEqual([
    "Перо",
    "Ластик",
    "Отменить",
    "Очистить",
    "Выше",
    "Ниже",
    "Крупнее",
    "Мельче",
    "Левее",
    "Правее",
    "Дальше",
    "Показ",
    "Рисовать пальцем",
  ]);
});

test("no label speaks in the first person: a learner reads no AI's «I» or «we»", () => {
  const words = [
    ...["i", "i'm", "i'll", "me", "my", "mine", "we", "us", "our", "let's"],
    ...["я", "меня", "мне", "мной", "мною", "мой", "моя", "моё", "мое", "мои", "моего"],
    ...["мы", "нас", "нам", "нами", "наш", "наша", "наше", "наши", "давай", "давайте"],
  ];
  const first = new RegExp(`(?<![\\p{L}'])(?:${words.join("|")})(?![\\p{L}'])`, "iu");
  expect("Let's try").toMatch(first);
  expect("Моё окошко").toMatch(first);
  expect("Окошко 2, заполнено").not.toMatch(first);
  for (const tag of LANGUAGES) {
    for (const label of Object.values(labelsFor(tag).labels)) expect(label).not.toMatch(first);
  }
});

test("a language the table has not is English, under its own tag", () => {
  for (const tag of ["de", "fr-CA", "", null]) expect(labelsFor(tag).lang).toBe("en");
  expect(labelsFor("ru-RU").lang).toBe("ru");
});

test("the table knows a tag it has labels for, and no other: English that stands for one is not its language", () => {
  for (const tag of ["de", "fr-CA", "", "-ru", "x-ru", null]) expect(knows(tag)).toBe(false);
  for (const tag of ["en", "en-GB", "ru", "ru-RU", "RU-latn"]) expect(knows(tag)).toBe(true);
});
