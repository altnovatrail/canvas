// The width table of the workbook's layout (R35): how wide each character of a line is, in whole
// hundredths of the type size, so that the layout puts the boxes where it puts them on any device,
// whatever its fonts, and the text is fitted to its width by SVG (R34). The numbers are the
// canvas's own: each the mean of Liberation Sans and Liberation Serif, the fonts of the image the
// tests run in, rounded to a hundredth — no font's table. Which character is which comes from
// explicit ranges of code points alone, never from the engine's Unicode tables — no `\p{…}`, no
// `\s`, no `Intl.Segmenter` — for those follow each engine's version of Unicode, and the layout
// must be the same in every engine and in Node, as the crop is (R25).

/** A digit: they are all as wide, and the page asks for figures of one width (R35). */
export const DIGIT = 53;

/** A sign of an operation or a comparison: one width for all of them, the mean of theirs. */
export const SIGN = 56;

/** The signs of operations and comparisons, one width for all (R35). */
export const SIGNS = "+−×÷=<>≤≥≠±≈";

/** The space between two words, which the layout sets itself. */
export const SPACE = 26;

/** A wide character — a Chinese, Japanese or Korean one, an emoji: a square. */
export const WIDE = 100;

/** A character the table does not know, a Greek or a Hebrew letter among them. */
export const UNKNOWN = 60;

/**
 * The characters of their own width: printable ASCII, the Russian alphabet and the marks a school
 * page has, by width. ⋅ and ∶ the fonts lack: they take the width of · and of :. The space is
 * SPACE, set by the layout.
 */
export const BY_WIDTH: readonly (readonly [number, string])[] = [
  [19, "'"],
  [23, "|"],
  [25, "ijl"],
  [26, ",."],
  [28, "/:;t\\‘’∶"],
  [31, "!I[]f"],
  [32, "²³"],
  [33, "()-`r·⋅"],
  [38, '"'],
  [39, "г„“”"],
  [40, "°"],
  [41, "{}"],
  [43, "з"],
  [44, "*Js"],
  [45, "т"],
  [46, "к"],
  [47, "^czсэ"],
  [49, "ь"],
  [50, "?aekvxyавеухяё"],
  [51, "ч"],
  [53, "#$_bdghnopquор«»–"],
  [54, "блнп"],
  [55, "Здийц"],
  [56, "~Г"],
  [57, "ъ"],
  [58, "FL"],
  [61, "PSTZРТ"],
  [62, "БКЬ"],
  [64, "EЕЁ"],
  [66, "Чм"],
  [67, "BВЛУ"],
  [68, "Дж"],
  [69, "ACKRVXYАСХЭЯ"],
  [70, "ы"],
  [72, "&DHNUwИЙНП"],
  [73, "Ц"],
  [74, "ф"],
  [75, "GOQОЪю"],
  [78, "Ф"],
  [79, "ш½¼¾⅓⅔⅛"],
  [80, "щ"],
  [81, "m"],
  [86, "%MМ"],
  [88, "Ы"],
  [91, "Ж"],
  [94, "W"],
  [96, "Ш"],
  [97, "@Щ"],
  [100, "—…"],
  [101, "№"],
  [102, "Ю"],
];

/**
 * Code points of no width, each joining the character before it: controls, the soft hyphen,
 * combining marks, the zero-width space and joiners, the marks of direction, variation selectors,
 * the skin tones of emoji and tags.
 */
export const ZERO: readonly (readonly [number, number])[] = [
  [0x0000, 0x0008],
  [0x000e, 0x001f],
  [0x007f, 0x009f],
  [0x00ad, 0x00ad],
  [0x0300, 0x036f],
  [0x0483, 0x0489],
  [0x1ab0, 0x1aff],
  [0x1dc0, 0x1dff],
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2060, 0x206f],
  [0x20d0, 0x20ff],
  [0xfe00, 0xfe0f],
  [0xfe20, 0xfe2f],
  [0xfeff, 0xfeff],
  [0x1f3fb, 0x1f3ff],
  [0xe0000, 0xe007f],
  [0xe0100, 0xe01ef],
];

/** Code points of a square's width: Hangul, CJK, the full-width forms and emoji. */
export const WIDE_RANGES: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f],
  [0x2e80, 0x303e],
  [0x3041, 0x33ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xa000, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe30, 0xfe4f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f000, 0x1faff],
  [0x20000, 0x3fffd],
];

/**
 * The white space a line breaks at: tab, the line and paragraph ends and the space. A run of it is
 * one space between two words, and none at the ends of a piece. Any other space — a no-break one
 * among them — is a character of its word.
 */
export const BREAKS: readonly number[] = [0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0x85, 0x2028, 0x2029];

/** The joiner of an emoji's sequence: the next code point goes with the one before it. */
const ZWJ = 0x200d;

/** The regional indicators, two of which make a flag. */
const REGIONAL: readonly [number, number] = [0x1f1e6, 0x1f1ff];

/**
 * The spaces that do not break, by code point, for they do not show: the no-break space, the figure
 * space, a digit wide, and the narrow no-break space.
 */
export const SPACES: readonly (readonly [number, number])[] = [
  [0x00a0, 26],
  [0x2007, 53],
  [0x202f, 20],
];

const OWN: ReadonlyMap<number, number> = new Map([
  ...BY_WIDTH.flatMap(([width, characters]) =>
    Array.from(characters, (character) => [character.codePointAt(0) ?? 0, width] as const),
  ),
  ...SPACES,
]);

function within(code: number, ranges: readonly (readonly [number, number])[]): boolean {
  return ranges.some(([from, to]) => code >= from && code <= to);
}

/** The width of a code point, in hundredths of the type size. */
export function widthOf(code: number): number {
  if (within(code, ZERO)) return 0;
  if (code >= 0x30 && code <= 0x39) return DIGIT;
  const character = String.fromCodePoint(code);
  if (SIGNS.includes(character)) return SIGN;
  const own = OWN.get(code);
  if (own !== undefined) return own;
  return within(code, WIDE_RANGES) ? WIDE : UNKNOWN;
}

/** Whether a line may break at this code point, white space that collapses. */
export function breaks(code: number): boolean {
  return BREAKS.includes(code);
}

/**
 * The words of a piece of text: what lies between its runs of white space. A piece of white space
 * alone has none.
 */
export function wordsOf(text: string): string[] {
  const words: string[] = [];
  let word = "";
  for (const character of text) {
    if (breaks(character.codePointAt(0) ?? 0)) {
      if (word !== "") words.push(word);
      word = "";
    } else {
      word += character;
    }
  }
  if (word !== "") words.push(word);
  return words;
}

/**
 * The clusters of a word, which a word too long for a line is broken between: a code point of no
 * width, and whatever follows a joiner, go with the one before them, and so does the second
 * regional indicator of a flag. The code points come by `for…of`, which pairs surrogates by the
 * language's own rule, not by Unicode's tables.
 */
export function clustersOf(word: string): string[] {
  const clusters: string[] = [];
  let joined = false;
  let regional = 0;
  for (const character of word) {
    const code = character.codePointAt(0) ?? 0;
    const flag = code >= REGIONAL[0] && code <= REGIONAL[1];
    const last = clusters.length - 1;
    if (last >= 0 && (joined || widthOf(code) === 0 || (flag && regional === 1))) {
      clusters[last] += character;
      regional = flag && regional === 1 ? 2 : regional;
    } else {
      clusters.push(character);
      regional = flag ? 1 : 0;
    }
    joined = code === ZWJ;
  }
  return clusters;
}

/** The width of a cluster: that of its first code point. */
export function clusterWidth(cluster: string): number {
  return widthOf(cluster.codePointAt(0) ?? 0);
}

/** The width of a word, in hundredths of the type size: the sum of its clusters'. */
export function wordWidth(word: string): number {
  return clustersOf(word).reduce((sum, cluster) => sum + clusterWidth(cluster), 0);
}
