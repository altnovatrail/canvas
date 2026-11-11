// The page's pen mode (R29) and its zoom (T94): one of each for every sheet of the page, the mode
// from a pen's first touch on any of them until the learner asks for the finger, the zoom as the
// learner last stepped it, till the page is loaded again. The next task is a new element (R20),
// and both stay. They are states of the interface in memory, not data: nothing is stored or sent.
// This module is no entry point of the package.

import { PenMode } from "../core/hands.js";
import { PageZoom } from "../core/zoom.js";

/** The pen mode of every sheet of this page. */
export const PEN_MODE = new PenMode();

/** The zoom of every sheet of this page. */
export const PAGE_ZOOM = new PageZoom();
