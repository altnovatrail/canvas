// The package's entry point @altnovatrail/canvas: the canvas as a custom element, one for every
// canvas kind, with its markup in an open shadow root (R07). Importing it registers the element,
// once: a page has one element of this name. The sheet, its layers and the element's properties,
// method and events come with the tasks of the sheet (RUN.md, T09–T15).

/** The name the element is registered under. */
export const TAG = "novatrail-canvas";

/** The element `<novatrail-canvas>`. */
export class NovatrailCanvas extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
}

// A second copy of this module, from a second copy of the package, finds the name taken and
// leaves the first registration in place, rather than throwing when the page imports it. It says
// so, though: elements of the page are then built by the other copy, of whatever version it is.
const registered = customElements.get(TAG);
if (registered === undefined) {
  customElements.define(TAG, NovatrailCanvas);
} else if (registered !== NovatrailCanvas) {
  console.warn(
    `<${TAG}> is already registered by another copy of @altnovatrail/canvas; this copy's element is not used`,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "novatrail-canvas": NovatrailCanvas;
  }
}
