import { useState, useEffect, useCallback } from 'react';

/** Cars drawn one by one in the chart; past this the chart shows the selection's total. */
export const MAX_CHART_SERIES = 8;

const STORAGE_KEY = 'hd-finance-selected-vehicles';

interface SelectionState {
  /** Finance IDs (negative = previous car of a reused n°), in selection order */
  ids: number[];
  /** Colour slot per car, kept while the car stays selected so its colour never jumps */
  slots: Record<number, number>;
}

const EMPTY: SelectionState = { ids: [], slots: {} };

function lowestFreeSlot(state: SelectionState): number {
  const used = new Set(state.ids.map((id) => state.slots[id]));
  let slot = 0;
  while (used.has(slot)) slot += 1;
  return slot;
}

function add(state: SelectionState, id: number): SelectionState {
  if (state.ids.includes(id)) return state;
  return { ids: [...state.ids, id], slots: { ...state.slots, [id]: lowestFreeSlot(state) } };
}

function remove(state: SelectionState, id: number): SelectionState {
  const ids = state.ids.filter((x) => x !== id);
  const slots = { ...state.slots };
  delete slots[id];
  let next: SelectionState = { ids, slots };
  // Cars that were selected beyond the chart's colours take a freed colour
  for (const other of ids) {
    if (next.slots[other] < MAX_CHART_SERIES) continue;
    const free = lowestFreeSlot({ ids: ids.filter((x) => x !== other), slots: next.slots });
    if (free < MAX_CHART_SERIES) next = { ids, slots: { ...next.slots, [other]: free } };
  }
  return next;
}

function fromIds(ids: number[]): SelectionState {
  return ids.reduce(add, EMPTY);
}

function load(): SelectionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SelectionState>;
    const ids = Array.isArray(parsed.ids) ? parsed.ids.filter((x): x is number => Number.isInteger(x)) : [];
    const slots = parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {};
    const valid = ids.every((id) => Number.isInteger(slots[id]));
    return valid ? { ids, slots } : fromIds(ids);
  } catch {
    return EMPTY;
  }
}

/**
 * The cars picked on the finance page's "Comparer des véhicules" view. Remembered on
 * this device (localStorage) so the agency finds its usual selection again.
 */
export function useVehicleSelection() {
  const [state, setState] = useState<SelectionState>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode / storage blocked: the selection just isn't remembered
    }
  }, [state]);

  const toggle = useCallback((id: number) => {
    setState((s) => (s.ids.includes(id) ? remove(s, id) : add(s, id)));
  }, []);

  const select = useCallback((ids: number[]) => setState(fromIds(ids)), []);

  const clear = useCallback(() => setState(EMPTY), []);

  return { selectedIds: state.ids, slots: state.slots, toggle, select, clear };
}
