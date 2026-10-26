// The page's pen mode (R29): one for every sheet of the page, from a pen's first touch on any of
// them until the learner asks for the finger, or the page is loaded again. The next task is a new
// element (R20), and the mode stays. It is a state of the interface in memory, not data: nothing is
// stored or sent. This module is no entry point of the package.

import { PenMode } from "../core/hands.js";

/** The pen mode of every sheet of this page. */
export const PEN_MODE = new PenMode();
