/**
 * The handwriting sheet in logical units: 1000 wide and 1400 tall, the origin at its top left
 * corner and y pointing down, one scale on both axes (R06). Every layer of the sheet counts in
 * these units, whatever the device's screen.
 */
export const SHEET = Object.freeze({ width: 1000, height: 1400 } as const);
