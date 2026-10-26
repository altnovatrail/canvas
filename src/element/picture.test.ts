import { expect, test } from "vitest";
import { cropOf } from "../core/crop.js";
import { groupsOf } from "../core/groups.js";
import { pictureOf, rasterOf } from "../core/raster.js";
import { dot, staircase, words } from "../core/sheets.fixture.js";

// The crop's PNG (R25) as a browser takes it: Chromium's own decoder, with no conversion of colour
// space, gives back the very greys the crop was drawn in. The crop is the DOM-free part's, but a
// browser decodes it only here.

test("a browser decodes the crop's PNG to the crop's own pixels", async () => {
  for (const make of [staircase, words, dot]) {
    const { name, work } = make();
    for (const digit of [16, 32]) {
      const crop = cropOf(work.strokes, groupsOf(work.strokes), digit);
      if (crop === null) throw new Error(`${name} has no crop`);
      const gray = rasterOf(work.strokes, crop);
      const png = new Blob([pictureOf(work.strokes, crop)], { type: "image/png" });
      const bitmap = await createImageBitmap(png, {
        colorSpaceConversion: "none",
        premultiplyAlpha: "none",
      });
      expect([bitmap.width, bitmap.height], name).toEqual([crop.width, crop.height]);
      const canvas = new OffscreenCanvas(crop.width, crop.height);
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("no 2D context");
      context.drawImage(bitmap, 0, 0);
      const { data } = context.getImageData(0, 0, crop.width, crop.height);
      let wrong = 0;
      for (const [at, value] of gray.entries()) {
        const k = 4 * at;
        if (
          data[k] !== value ||
          data[k + 1] !== value ||
          data[k + 2] !== value ||
          data[k + 3] !== 255
        ) {
          wrong++;
        }
      }
      expect(wrong, `${name} at ${digit} px`).toBe(0);
    }
  }
});
