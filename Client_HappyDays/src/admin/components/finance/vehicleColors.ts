/**
 * Categorical chart colours for the "Comparer des véhicules" view, in their fixed order.
 * Validated on the white card surface (adjacent pairs colour-blind safe, normal-vision
 * ΔE ≥ 19.6). Three slots are under 3:1 contrast on white, which is why the comparison
 * table (same colour dots, names and figures) always sits next to the chart.
 * Never cycled: with more than 8 cars the chart shows the selection's total instead.
 */
export const VEHICLE_SERIES_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#6250d6', // violet
  '#e34948', // red
] as const;

/** Single-series colour, same blue as the overview chart. */
export const TOTAL_SERIES_COLOR = '#2563EB';

export function seriesColor(slot: number | undefined): string | undefined {
  return slot === undefined ? undefined : VEHICLE_SERIES_COLORS[slot];
}
