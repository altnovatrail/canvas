import { expect, test } from "vitest";
import { NO_MANIFEST, settingsOf } from "./manifest.js";
import { moduleManifest, pathOf, refusal, under } from "./tasks.fixture.js";

// Copies of the manifest examples of the module format at spec v0.2.37
// (spec/format/examples/manifest/): code and tests read nothing of spec/, so a move to a new tag
// compares them with `git -C spec diff <old> <new> -- format/` (R32). Each is written as a change
// to what the examples share.

/** The places of a manifest the element reads (R32). */
const READ = ["#/module_format_version", "#/languages", "#/canvas"];

/** What most examples share: the module of olympiad mathematics. */
const OLYMPIAD = {
  module_format_version: "0.1",
  id: "novatrail/olympiad-math",
  version: "0.1.0",
  title: "Olympiad mathematics, grades 1–6",
  subject: "mathematics",
  audience: { age_categories: ["under_13"] },
  languages: { explanation: "en" },
  authors: [{ name: "The NovaTrail authors" }],
  license: "Apache-2.0",
};

/** The module of school mathematics for grade 3, and its one band. */
const GRADE_3 = {
  ...OLYMPIAD,
  id: "novatrail/school-math-grade-3",
  title: "School mathematics, grade 3",
  audience: { age_categories: ["under_13"], grades: [3] },
};
const BAND_3 = { id: "grade-3", title: "Grade 3", grades: [3] };

/** A third party's module of physics for grade 8, in Russian. */
const OPTICS = {
  module_format_version: "0.1",
  id: "acme/optics-8",
  version: "1.2.0",
  title: "Оптика, 8 класс",
  subject: "physics",
  audience: { age_categories: ["from_13_to_consent", "from_consent_to_18"] },
  languages: { explanation: "ru" },
  authors: [{ name: "Acme Learning" }],
  license: "CC-BY-SA-4.0",
};

/** The valid examples, and the settings the element makes of each. */
const VALID: readonly (readonly [string, object, { digit: number; lang: string }])[] = [
  [
    "olympiad-math",
    {
      ...OLYMPIAD,
      audience: { age_categories: ["under_13"], grades: [1, 2, 3, 4, 5, 6] },
      bands: [
        { id: "grades-1-2", title: "Grades 1–2", grades: [1, 2] },
        { id: "grades-3-4", title: "Grades 3–4", grades: [3, 4] },
        { id: "grades-5-6", title: "Grades 5–6", grades: [5, 6] },
      ],
      dependencies: ["core.division-with-remainder", "core.fractions-of-a-whole"],
    },
    { digit: 32, lang: "en" },
  ],
  ["school-math-grade-3", { ...GRADE_3, bands: [BAND_3] }, { digit: 32, lang: "en" }],
  [
    "short-essays",
    {
      ...OLYMPIAD,
      id: "novatrail/short-essays",
      title: "Short essays in English",
      subject: "writing",
      audience: {
        age_categories: ["under_13", "from_13_to_consent", "from_consent_to_18", "adult"],
      },
      bands: [
        { id: "first-steps", title: "First steps" },
        { id: "whole-essays", title: "Whole essays" },
      ],
    },
    { digit: 32, lang: "en" },
  ],
  [
    "third-party",
    {
      ...OPTICS,
      audience: { ...OPTICS.audience, grades: [8] },
      bands: [{ id: "grade-8", title: "8 класс", grades: [8] }],
      dependencies: ["core.linear-equations"],
      canvas: { digit_height: 40 },
      authors: [{ name: "Acme Learning" }, { name: "A. Example" }],
    },
    { digit: 40, lang: "ru" },
  ],
];

/** The invalid examples: the name, the place their first line names, and the manifest. */
const INVALID: readonly (readonly [string, string, object])[] = [
  [
    "age-category-twice",
    "#/audience/age_categories",
    { ...OLYMPIAD, audience: { age_categories: ["under_13", "under_13"] } },
  ],
  ["author-without-name", "#/authors/0", { ...OLYMPIAD, authors: [{}] }],
  [
    "band-grade-thirteen",
    "#/bands/0/grades/1",
    { ...GRADE_3, bands: [{ ...BAND_3, grades: [3, 13] }] },
  ],
  ["band-without-title", "#/bands/0", { ...GRADE_3, bands: [{ id: "grade-3", grades: [3] }] }],
  [
    "dependency-twice",
    "#/dependencies",
    { ...OLYMPIAD, dependencies: ["core.fractions-of-a-whole", "core.fractions-of-a-whole"] },
  ],
  [
    "dependency-with-subject",
    "#/dependencies/0",
    { ...OPTICS, dependencies: ["core.math.linear-equations"] },
  ],
  ["device-name-in-id", "#/id", { ...OLYMPIAD, id: "novatrail/con" }],
  [
    "digit-height-zero",
    "#/canvas/digit_height",
    { ...GRADE_3, bands: [BAND_3], canvas: { digit_height: 0 } },
  ],
  ["empty-canvas", "#/canvas", { ...GRADE_3, canvas: {} }],
  [
    "empty-dependencies",
    "#/dependencies",
    { ...OLYMPIAD, id: GRADE_3.id, title: GRADE_3.title, dependencies: [] },
  ],
  [
    "format-version-as-number",
    "#/module_format_version",
    { ...OLYMPIAD, module_format_version: 0.1 },
  ],
  [
    "grade-zero",
    "#/audience/grades/0",
    { ...GRADE_3, audience: { age_categories: ["under_13"], grades: [0] } },
  ],
  ["id-without-publisher", "#/id", { ...OLYMPIAD, id: "olympiad-math" }],
  [
    "language-in-capitals",
    "#/languages/explanation",
    { ...OLYMPIAD, languages: { explanation: "EN" } },
  ],
  // No license: a field left out by undefined is no field, as the element reads it.
  ["missing-license", "#", { ...OLYMPIAD, license: undefined }],
  [
    "no-age-category",
    "#/audience/age_categories",
    { ...OLYMPIAD, audience: { age_categories: [] } },
  ],
  ["pre-release-version", "#/version", { ...OLYMPIAD, version: "1.0.0-beta.1" }],
  ["presentation-style", "#", { ...OLYMPIAD, presentation_style: "playful" }],
  ["unknown-dependency", "#/dependencies/0", { ...OLYMPIAD, dependencies: ["core.long-division"] }],
  ["unknown-subject", "#/subject", { ...OLYMPIAD, subject: "chemistry" }],
];

test("a valid example of the format gives the height of a digit, 32 unless given, and the explanation language", () => {
  for (const [name, manifest, settings] of VALID) {
    expect(settingsOf(manifest), name).toEqual(settings);
  }
  expect(settingsOf(moduleManifest({ digit_height: 48, explanation: "ru" }))).toEqual({
    digit: 48,
    lang: "ru",
  });
});

test("an invalid example is a TypeError at its place when the element reads it, and passes when it does not", () => {
  let refused = 0;
  for (const [name, place, manifest] of INVALID) {
    if (!READ.some((read) => place.startsWith(read))) {
      // What a manifest may hold is module-kit's to check: the element reads three fields.
      expect(() => settingsOf(manifest), name).not.toThrow();
      continue;
    }
    const message = refusal(() => settingsOf(manifest));
    expect(under(message, pathOf(place, "manifest")), `${name}: ${message}`).toBe(true);
    refused++;
  }
  expect(refused).toBe(4);
});

test("without a manifest the digits are 32 px and the statement is in the element's own language", () => {
  expect(settingsOf(undefined)).toBe(NO_MANIFEST);
  expect(NO_MANIFEST).toEqual({ digit: 32, lang: undefined });
});

test("a manifest of a format version the element does not read is a TypeError, as R44 spec's window has it", () => {
  for (const version of ["0.2", "0.0", "1.0", "0.1.0", undefined]) {
    expect(
      () => settingsOf({ ...OLYMPIAD, module_format_version: version }),
      String(version),
    ).toThrow(
      /^manifest\.module_format_version: "0\.1", the version of the module format the element reads, not /,
    );
  }
});

test("a value the element reads that the schema refuses is a TypeError that names its field", () => {
  const wrong: [unknown, RegExp][] = [
    [null, /^manifest: an object, not null$/],
    [[], /^manifest: an object/],
    [{ ...OLYMPIAD, languages: undefined }, /^manifest\.languages: an object, not undefined$/],
    ...["en-us", "EN", "english", "e", "", "en_GB", "zh-hans", 7].map(
      (explanation): [unknown, RegExp] => [
        { ...OLYMPIAD, languages: { explanation } },
        /^manifest\.languages\.explanation: a language tag/,
      ],
    ),
    [{ ...OLYMPIAD, canvas: null }, /^manifest\.canvas: an object, not null$/],
    [
      { ...OLYMPIAD, canvas: {} },
      /^manifest\.canvas: the settings of the module's canvas, at least one, not \{\}$/,
    ],
    [{ ...OLYMPIAD, canvas: { digit_height: undefined } }, /^manifest\.canvas: the settings/],
    [
      { ...OLYMPIAD, canvas: { digitHeight: 48 } },
      /^manifest\.canvas\.digitHeight: no field of a module's canvas settings$/,
    ],
    ...[0, 257, 32.5, "32", null].map((digit_height): [unknown, RegExp] => [
      { ...OLYMPIAD, canvas: { digit_height } },
      /^manifest\.canvas\.digit_height: a whole number from 1 to 256, not /,
    ]),
  ];
  for (const [value, message] of wrong) {
    expect(() => settingsOf(value)).toThrow(TypeError);
    expect(() => settingsOf(value)).toThrow(message);
  }
  for (const explanation of ["en", "ru", "zh-Hans", "pt-BR", "es-419", "sr-Latn-RS", "fil"]) {
    expect(settingsOf({ ...OLYMPIAD, languages: { explanation } }).lang).toBe(explanation);
  }
  expect(settingsOf({ ...OLYMPIAD, canvas: { digit_height: 1 } }).digit).toBe(1);
  expect(settingsOf({ ...OLYMPIAD, canvas: { digit_height: 256 } }).digit).toBe(256);
});
