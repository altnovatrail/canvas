// Select's marks over the sheet and its bar, as the interface mockup draws them: the lasso or the
// rectangle as the pointer draws it, dashed, and a dashed box round the strokes it took, which a
// drag inside it moves, in an SVG of the sheet's units that says nothing to a screen reader, with a
// round grip at each of its corners, a target of 44 CSS pixels, whose drag scales them from the
// corner across; and over the box, or under it where the element has no room above, a bar of glass
// with Copy and Delete, each showing its label beside its icon, a group named in the element's
// language, kept to the part of the stage in sight. The bar goes while the strokes move, and comes back where they land; while a grip is
// dragged, it shows the scale in percent in their place. This module is no entry point of the
// package.

import type { Box } from "../core/geometry.js";
import type { Point } from "../core/screen.js";
import { SVG, write } from "./attributes.js";
import { labelsFor } from "./labels.js";
import { plainButton } from "./tools.js";

/** A corner of the box: top or bottom, left or right. */
export type Corner = "tl" | "tr" | "bl" | "br";

/**
 * What the bar and the grips ask of the element: a copy of the strokes taken, or their deletion;
 * and a grip's press, its pointer's moves and its end, `pointerup` or another, for a scale.
 */
export interface SelectionActions {
  readonly copy: () => void;
  readonly remove: () => void;
  readonly scaleDown: (corner: Corner, event: PointerEvent) => void;
  readonly scaleMove: (event: PointerEvent) => void;
  readonly scaleUp: (event: PointerEvent) => void;
}

/** Where the sheet is on the stage: its corner in sight, in units, and CSS pixels to a unit. */
export interface SelectionView {
  readonly vx: number;
  readonly vy: number;
  readonly k: number;
}

/** The part of the stage in sight, from its top, in CSS pixels. */
export interface SelectionSeen {
  readonly top: number;
  readonly bottom: number;
}

/** How far the bar keeps from the box, and its height, in CSS pixels. */
const BAR_GAP = 10;
const BAR_HEIGHT = 52;

/** Select's marks and bar, as the element shows them. */
export class Selection {
  /** The layer of the shape and the box, in the sheet's units: the element sets its view box. */
  readonly layer = document.createElementNS(SVG, "svg");
  readonly bar = document.createElement("div");
  /** The grips, over the box in CSS pixels of the stage: the element puts it on the stage. */
  readonly grips = document.createElement("div");
  readonly #shape = document.createElementNS(SVG, "path");
  readonly #box = document.createElementNS(SVG, "rect");
  readonly #copy = plainButton("copy");
  readonly #remove = plainButton("remove");
  readonly #percent = document.createElement("span");
  #lang: string | undefined;
  /** What the layer and the bar show now, so that only what has changed is written. */
  #shapeDrawn = "";
  #boxDrawn = "";
  #percentDrawn: number | undefined;

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
    this.#percent.className = "percent";
    this.#percent.hidden = true;
    this.bar.append(this.#copy, this.#remove, this.#percent);
    this.#copy.addEventListener("click", () => actions.copy());
    this.#remove.addEventListener("click", () => actions.remove());
    this.grips.className = "selection-grips";
    this.grips.setAttribute("aria-hidden", "true");
    this.grips.hidden = true;
    for (const corner of ["tl", "tr", "bl", "br"] as const) {
      const grip = document.createElement("div");
      grip.className = `corner ${corner}`;
      grip.addEventListener("pointerdown", (event) => actions.scaleDown(corner, event));
      grip.addEventListener("pointermove", (event) => actions.scaleMove(event));
      for (const end of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
        grip.addEventListener(end, (event) => actions.scaleUp(event));
      }
      this.grips.append(grip);
    }
    this.label(null);
  }

  /** The bar's words in the language of a tag, the element's `lang`, and its `lang` theirs. */
  label(tag: string | null): void {
    const { lang, labels } = labelsFor(tag);
    if (lang === this.#lang) return;
    this.#lang = lang;
    this.#percentDrawn = undefined;
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
   * whether they move now, which takes the bar and the grips away, or the factor a grip's drag
   * scales them by now, which the bar shows in place of its buttons; none hides the box, the grips
   * and the bar. The bar stands over the box, or under it where the part of the stage in sight,
   * `seen`, has no room above, and is kept within that part.
   */
  box(
    box: Box | undefined,
    view: SelectionView,
    seen: SelectionSeen,
    moving: boolean,
    factor?: number,
  ): void {
    if (box === undefined) {
      if (this.#boxDrawn === "") return;
      this.#boxDrawn = "";
      this.#box.setAttribute("display", "none");
      this.bar.hidden = true;
      this.grips.hidden = true;
      return;
    }
    const drawn = `${box.minX} ${box.minY} ${box.maxX} ${box.maxY} ${view.vx} ${view.vy} ${view.k} ${seen.top} ${seen.bottom} ${moving} ${factor}`;
    if (drawn === this.#boxDrawn) return;
    this.#boxDrawn = drawn;
    write(this.#box, "x", String(box.minX));
    write(this.#box, "y", String(box.minY));
    write(this.#box, "width", String(box.maxX - box.minX));
    write(this.#box, "height", String(box.maxY - box.minY));
    this.#box.removeAttribute("display");
    this.bar.hidden = moving;
    this.grips.hidden = moving;
    if (moving) return;
    const { vx, vy, k } = view;
    const left = (box.minX - vx) * k;
    const top = (box.minY - vy) * k;
    const bottom = (box.maxY - vy) * k;
    this.grips.style.transform = `translate(${left}px, ${top}px)`;
    this.grips.style.width = `${(box.maxX - box.minX) * k}px`;
    this.grips.style.height = `${bottom - top}px`;
    this.#showPercent(factor);
    const above = top - BAR_GAP - BAR_HEIGHT;
    const y = above >= seen.top ? above : Math.min(bottom + BAR_GAP, seen.bottom - BAR_HEIGHT);
    this.bar.style.setProperty("--select-x", `${((box.minX + box.maxX) / 2 - vx) * k}px`);
    this.bar.style.setProperty("--select-y", `${Math.max(seen.top, y)}px`);
  }

  /** The bar's buttons, or while a grip is dragged the scale it gives, in the element's language. */
  #showPercent(factor: number | undefined): void {
    const scaling = factor !== undefined;
    this.#copy.hidden = scaling;
    this.#remove.hidden = scaling;
    this.#percent.hidden = !scaling;
    this.bar.classList.toggle("scaling", scaling);
    if (!scaling || factor === this.#percentDrawn) return;
    this.#percentDrawn = factor;
    this.#percent.textContent = new Intl.NumberFormat(this.#lang, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(factor);
  }
}
