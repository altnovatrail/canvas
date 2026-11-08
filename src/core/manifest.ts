// The module's manifest as the element reads it (R32): the open view of manifest.yaml, of which it
// takes three fields — the version of the module format, the height of a digit on the crop for
// checking and the explanation language, which the task's statement is in (R51 spec). The rest of
// the manifest it passes over: what a manifest may hold, module-kit checks. Its canvas settings are
// the canvas's own, though: a setting the element does not know is a TypeError, as a field of a
// task is, for the element would draw the module's canvas without it. The type is spec's, from
// its npm package at the version of the spec/ submodule (R73 spec; R41), and app gets the
// manifest's open view once for a module's package and gives it to the element as it is (R36 spec).

import { CROP } from "./crop.js";
import { closed, record, shown, whole } from "./fields.js";

/**
 * The version of the module format the element reads: while the format is v0, the platform reads
 * its current version alone, and a module of another — 0.2 too — is refused with the reason (R44
 * spec; README of the format, §2). The format's rules of a module's versions are module-kit's and
 * api's: the element compares none (R32).
 */
export const FORMAT = "0.3";

/** The open view of a module's manifest, whole: spec's type (R73 spec). */
export type { Manifest } from "@altnovatrail/spec/formatv0/open";

/**
 * What the element makes of a manifest: the height of a digit its crop for checking is drawn at,
 * and the language of the statement — the element's own `lang`, inherited, for `undefined`.
 */
export interface Settings {
  readonly digit: number;
  readonly lang: string | undefined;
}

/** The settings without a manifest: digits of 24 px, and the element's own language. */
export const NO_MANIFEST: Settings = Object.freeze({ digit: CROP.digit, lang: undefined });

/**
 * A language tag of the format: a language, an optional script and an optional region, each in the
 * letter case of the registry — en, zh-Hans, pt-BR, es-419 (language_tag).
 */
const LANGUAGE = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$/;

/**
 * The settings of a manifest, or of none for `undefined`. A field the element reads that the
 * schema refuses is a TypeError that names it; `null` is no manifest, and a wrong value.
 */
export function settingsOf(manifest: unknown): Settings {
  if (manifest === undefined) return NO_MANIFEST;
  const fields = record(manifest, "manifest");
  if (fields.module_format_version !== FORMAT) {
    throw new TypeError(
      `manifest.module_format_version: "${FORMAT}", the version of the module format the element reads, not ${shown(fields.module_format_version)}`,
    );
  }
  const languages = record(fields.languages, "manifest.languages");
  const lang = languages.explanation;
  if (typeof lang !== "string" || !LANGUAGE.test(lang)) {
    throw new TypeError(
      `manifest.languages.explanation: a language tag, as en, zh-Hans or pt-BR, in the letter case of the registry, not ${shown(lang)}`,
    );
  }
  return { digit: digitOf(fields.canvas), lang };
}

/** The height of a digit a manifest's canvas settings give: 24 unless given. */
function digitOf(value: unknown): number {
  if (value === undefined) return CROP.digit;
  const canvas = closed(value, "manifest.canvas", ["digit_height"], "a module's canvas settings");
  if (canvas.digit_height === undefined) {
    throw new TypeError(
      `manifest.canvas: the settings of the module's canvas, at least one, not ${shown(value)}`,
    );
  }
  return whole(canvas.digit_height, "manifest.canvas.digit_height", 1, CROP.tallest);
}
