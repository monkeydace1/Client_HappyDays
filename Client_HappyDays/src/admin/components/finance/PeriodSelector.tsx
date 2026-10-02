import { CalendarRange } from 'lucide-react';
import type { Period, PeriodPreset } from '../../lib/finance';
import { formatPeriod } from '../../lib/finance';

interface PeriodSelectorProps {
  preset: PeriodPreset;
  custom: Period;
  resolved: Period;
  onPresetChange: (preset: PeriodPreset) => void;
  onCustomChange: (custom: Period) => void;
}

const PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: 'thisMonth', label: 'Ce mois' },
  { id: 'lastMonth', label: 'Mois dernier' },
  { id: 'thisYear', label: 'Cette année' },
  { id: 'custom', label: 'Personnalisé' },
];

export function PeriodSelector({ preset, custom, resolved, onPresetChange, onCustomChange }: PeriodSelectorProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPresetChange(p.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation
              ${preset === p.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500">
          <CalendarRange className="w-4 h-4" />
          {formatPeriod(resolved)}
        </span>
      </div>

      {preset === 'custom' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-gray-500">Du</span>
            <input
              type="date"
              value={custom.from}
              max={custom.to || undefined}
              onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
              className="border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-gray-500">au</span>
            <input
              type="date"
              value={custom.to}
              min={custom.from || undefined}
              onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
              className="border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
      )}
    </div>
  );
}
