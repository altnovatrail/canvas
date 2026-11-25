// Select's marks over the sheet and its bar, as the interface mockup draws them: the lasso or the
// rectangle as the pointer draws it, dashed, and a dashed box round the strokes it took, which a
// drag inside it moves, in an SVG of the sheet's units that says nothing to a screen reader; and
// over the box, or under it where the element has no room above, a bar of glass with Copy and
// Delete, each showing its label beside its icon, a group named in the element's language. The
// bar goes while the strokes move, and comes back where they land. This module is no entry point
// of the package.

import type { Box } from "../core/geometry.js";
import type { Point } from "../core/screen.js";
import { SVG, write } from "./attributes.js";
import { labelsFor } from "./labels.js";
import { plainButton } from "./tools.js";

/** What the bar asks of the element: a copy of the strokes taken, or their deletion. */
export interface SelectionActions {
  readonly copy: () => void;
  readonly remove: () => void;
}

/** Where the sheet is on the stage: its corner in sight, in units, and CSS pixels to a unit. */
export interface SelectionView {
  readonly vx: number;
  readonly vy: number;
  readonly k: number;
}

/** How far the bar keeps from the box, and its height, in CSS pixels. */
const BAR_GAP = 10;
const BAR_HEIGHT = 52;

/** Select's marks and bar, as the element shows them. */
export class Selection {
  /** The layer of the shape and the box, in the sheet's units: the element sets its view box. */
  readonly layer = document.createElementNS(SVG, "svg");
  readonly bar = document.createElement("div");
  readonly #shape = document.createElementNS(SVG, "path");
  readonly #box = document.createElementNS(SVG, "rect");
  readonly #copy = plainButton("copy");
  readonly #remove = plainButton("remove");
  #lang: string | undefined;
  /** What the layer and the bar show now, so that only what has changed is written. */
  #shapeDrawn = "";
  #boxDrawn = "";

  constructor(actions: SelectionActions) {
    this.layer.setAttribute("class", "selection");
    this.layer.setAttribute("preserveAspectRatio", "none");
    this.layer.setAttribute("aria-hidden", "true");
    this.#shape.setAttribute("class", "shape");
    this.#box.setAttribute("class", "box");
    this.#shape.setAttribute("display", "none");
    this.#box.setAttribute("display", "none");
    this.layer.append(this.#shape, this.#box);
    this.bar.className = "selection-bar";
    this.bar.setAttribute("role", "group");
    this.bar.hidden = true;
    this.#remove.classList.add("remove");
    this.bar.append(this.#copy, this.#remove);
    this.#copy.addEventListener("click", () => actions.copy());
    this.#remove.addEventListener("click", () => actions.remove());
    this.label(null);
  }

  /** The bar's words in the language of a tag, the element's `lang`, and its `lang` theirs. */
  label(tag: string | null): void {
    const { lang, labels } = labelsFor(tag);
    if (lang === this.#lang) return;
    this.#lang = lang;
    this.bar.lang = lang;
    this.bar.setAttribute("aria-label", labels.selectionButtons);
    for (const [button, word] of [
      [this.#copy, labels.copy],
      [this.#remove, labels.remove],
    ] as const) {
      const label = button.lastElementChild;
      if (label !== null) label.textContent = word;
    }
  }

  /** The shape under way, its points in the sheet's units, closed; none hides it. */
  shape(points: readonly Point[] | undefined): void {
    const d =
      points === undefined || points.length === 0
        ? ""
        : `M${points.map(({ x, y }) => `${x} ${y}`).join("L")}Z`;
    if (d === this.#shapeDrawn) return;
    this.#shapeDrawn = d;
    if (d === "") this.#shape.setAttribute("display", "none");
    else {
      this.#shape.setAttribute("d", d);
      this.#shape.removeAttribute("display");
    }
  }

  /**
   * The box round the strokes taken, in the sheet's units, where the sheet is on the stage, and
   * whether they move now, which takes the bar away; none hides the box and the bar. The bar stands
   * over the box, kept within the stage's `height`, or under it where there is no room above.
   */
  box(box: Box | undefined, view: SelectionView, height: number, moving: boolean): void {
    if (box === undefined) {
      if (this.#boxDrawn === "") return;
      this.#boxDrawn = "";
      this.#box.setAttribute("display", "none");
      this.bar.hidden = true;
      return;
    }
    const drawn = `${box.minX} ${box.minY} ${box.maxX} ${box.maxY} ${view.vx} ${view.vy} ${view.k} ${height} ${moving}`;
    if (drawn === this.#boxDrawn) return;
    this.#boxDrawn = drawn;
    write(this.#box, "x", String(box.minX));
    write(this.#box, "y", String(box.minY));
    write(this.#box, "width", String(box.maxX - box.minX));
    write(this.#box, "height", String(box.maxY - box.minY));
    this.#box.removeAttribute("display");
    this.bar.hidden = moving;
    if (moving) return;
    const { vx, vy, k } = view;
    const top = (box.minY - vy) * k;
    const bottom = (box.maxY - vy) * k;
    const above = top - BAR_GAP - BAR_HEIGHT;
    const y = above >= 0 ? above : Math.min(bottom + BAR_GAP, height - BAR_HEIGHT);
    this.bar.style.setProperty("--select-x", `${((box.minX + box.maxX) / 2 - vx) * k}px`);
    this.bar.style.setProperty("--select-y", `${Math.max(0, y)}px`);
  }
}
