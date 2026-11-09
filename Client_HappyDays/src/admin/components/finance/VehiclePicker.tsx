import { Car, Check } from 'lucide-react';
import type { FinanceVehicle } from '../../lib/finance';
import { VEHICLE_CATEGORIES } from '../../../data/vehicleData';
import { seriesColor } from './vehicleColors';

interface VehiclePickerProps {
  fleet: FinanceVehicle[];
  selectedIds: number[];
  slots: Record<number, number>;
  /** Selected cars carry their chart colour (only when the chart draws them one by one) */
  showColors: boolean;
  onToggle: (id: number) => void;
  onSelect: (ids: number[]) => void;
  onClear: () => void;
}

export function VehicleNumber({ number, former }: { number: number; former: boolean }) {
  return (
    <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
      {former ? `ancien n°${number}` : `n°${number}`}
    </span>
  );
}

export function VehiclePicker({ fleet, selectedIds, slots, showColors, onToggle, onSelect, onClear }: VehiclePickerProps) {
  const selected = new Set(selectedIds);
  const current = fleet.filter((v) => !v.former);
  const former = fleet.filter((v) => v.former);
  const count = fleet.filter((v) => selected.has(v.id)).length;
  const categories = VEHICLE_CATEGORIES.filter((c) => current.some((v) => v.category === c));

  const quickPicks = [
    { label: 'Toute la flotte', ids: current.map((v) => v.id) },
    ...categories.map((c) => ({
      label: c,
      ids: current.filter((v) => v.category === c).map((v) => v.id),
    })),
  ];

  const chip = (v: FinanceVehicle) => {
    const isSelected = selected.has(v.id);
    const color = showColors ? seriesColor(slots[v.id]) : undefined;
    return (
      <button
        key={v.id}
        type="button"
        onClick={() => onToggle(v.id)}
        aria-pressed={isSelected}
        className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-sm transition-colors touch-manipulation
          ${isSelected
            ? 'border-primary bg-primary/5 text-gray-900'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
      >
        {isSelected ? (
          color ? (
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          ) : (
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          )
        ) : (
          <span className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
        )}
        <span>{v.name}</span>
        <VehicleNumber number={v.number} former={v.former} />
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" /> Véhicules à comparer
        </h2>
        <span className="text-xs text-gray-500">
          {count === 0 ? 'Aucun sélectionné' : `${count} sélectionné${count > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-gray-500 mr-1">Sélection rapide :</span>
        {quickPicks.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => onSelect(q.ids)}
            className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium touch-manipulation"
          >
            {q.label}
          </button>
        ))}
        {count > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="px-2.5 py-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-medium touch-manipulation"
          >
            Effacer
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">{current.map(chip)}</div>

      {former.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mt-4 mb-2">Anciens véhicules (historique)</p>
          <div className="flex flex-wrap gap-2">{former.map(chip)}</div>
        </>
      )}
    </div>
  );
}
