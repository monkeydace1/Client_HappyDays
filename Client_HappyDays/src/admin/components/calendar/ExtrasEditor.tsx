import { useState } from 'react';
import { Plus, Minus, Trash2, Users, Baby, Shield, Sparkles } from 'lucide-react';
import { additionalDriverSupplement, childSeats, insuranceOptions } from '../../../data/supplementData';
import { computeExtrasSubtotal, type BookingExtra, type RentalUnits } from '../../../lib/pricing';

// Upsell presets (same items and rates as the website) + a free-form entry
const EXTRA_PRESETS: Array<Omit<BookingExtra, 'quantity'>> = [
  { id: additionalDriverSupplement.id, name: additionalDriverSupplement.name, mode: 'per_day', price: additionalDriverSupplement.pricePerDay },
  ...childSeats.map((s) => ({ id: s.id, name: s.name, mode: 'per_day' as const, price: s.pricePerDay })),
  ...insuranceOptions.filter((i) => i.pricePerDay > 0).map((i) => ({ id: i.id, name: i.name, mode: 'per_day' as const, price: i.pricePerDay })),
];
const CUSTOM_ID = 'custom';

function extraIcon(extra: BookingExtra) {
  const cls = 'w-5 h-5 text-gray-400 flex-shrink-0';
  if (extra.id === additionalDriverSupplement.id) return <Users className={cls} />;
  if (extra.id.startsWith('child_seat')) return <Baby className={cls} />;
  if (extra.id.startsWith('insurance')) return <Shield className={cls} />;
  return <Sparkles className={cls} />;
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white';

interface ExtrasEditorProps {
  extras: BookingExtra[];
  /** Rental length — per-day items are billed on fullDays */
  units: RentalUnits;
  onChange: (next: BookingExtra[]) => void;
  /** Read-only (e.g. while another part of the booking is being edited) */
  disabled?: boolean;
  /** Tighter spacing for the QuickAdd bottom sheet */
  compact?: boolean;
  /** Extra read-only rows rendered under the list */
  children?: React.ReactNode;
}

/**
 * "Suppléments" card shared by the reservation modal and the QuickAdd form:
 * list of extras (quantity ± / remove) and a "+ Ajouter" form with the website's
 * presets or a free-form item. All buttons are type="button" so the editor can
 * live inside a <form>.
 */
export function ExtrasEditor({ extras, units, onChange, disabled = false, compact = false, children }: ExtrasEditorProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ presetId: string; name: string; price: string; mode: BookingExtra['mode'] }>({
    presetId: EXTRA_PRESETS[0].id,
    name: '',
    price: '',
    mode: 'per_day',
  });
  const subtotal = computeExtrasSubtotal(extras, units);

  const setQuantity = (index: number, quantity: number) => {
    onChange(quantity <= 0
      ? extras.filter((_, i) => i !== index)
      : extras.map((e, i) => (i === index ? { ...e, quantity } : e)));
  };

  const selectPreset = (presetId: string) => {
    const preset = EXTRA_PRESETS.find((p) => p.id === presetId);
    setDraft({
      presetId,
      name: preset?.name ?? '',
      price: preset ? String(preset.price) : '',
      mode: preset?.mode ?? 'per_day',
    });
  };

  const add = () => {
    const preset = EXTRA_PRESETS.find((p) => p.id === draft.presetId);
    const name = preset ? preset.name : draft.name.trim();
    const price = preset ? preset.price : Number(draft.price);
    const mode = preset ? preset.mode : draft.mode;
    if (!name || !Number.isFinite(price) || price < 0) {
      alert('Indiquez un nom et un prix pour le supplément');
      return;
    }
    const existingIndex = preset ? extras.findIndex((e) => e.id === preset.id) : -1;
    // Free-form items get a deterministic id (list keys also include the index, so duplicates are fine)
    const id = preset?.id ?? `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${mode}-${price}`;
    onChange(existingIndex >= 0
      ? extras.map((e, i) => (i === existingIndex ? { ...e, quantity: e.quantity + 1 } : e))
      : [...extras, { id, name, mode, price, quantity: 1 }]);
    setAdding(false);
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // don't submit an enclosing form
      add();
    }
  };

  return (
    <div className={`bg-gray-50 ${compact ? 'rounded-lg p-3' : 'rounded-xl p-4'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : ''}`}>Suppléments</h3>
        {subtotal > 0 && <span className="text-sm font-medium text-primary">{subtotal}€</span>}
      </div>

      <div className="space-y-2">
        {extras.length === 0 && !children && !adding && (
          <p className="text-sm text-gray-400">Aucun supplément</p>
        )}

        {extras.map((extra, idx) => (
          <div key={`${extra.id}-${idx}`} className="flex items-center gap-2 text-gray-700">
            {extraIcon(extra)}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{extra.name}</p>
              <p className="text-xs text-gray-500">
                {extra.price}€{extra.mode === 'per_day' ? '/jour' : ' (une fois)'}
                {extra.quantity > 1 && ` × ${extra.quantity}`}
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
              {computeExtrasSubtotal([extra], units)}€
            </span>
            {!disabled && (
              <div className="flex items-center gap-1 ml-1">
                <button type="button" onClick={() => setQuantity(idx, extra.quantity - 1)} aria-label="Moins"
                  className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center touch-manipulation">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setQuantity(idx, extra.quantity + 1)} aria-label="Plus"
                  className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center touch-manipulation">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setQuantity(idx, 0)} aria-label="Supprimer"
                  className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center touch-manipulation">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {children}

        {!disabled && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full mt-1 py-2 rounded-lg border-2 border-dashed border-primary/40 text-primary text-sm font-medium
                       hover:bg-primary/5 flex items-center justify-center gap-1.5 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            Ajouter un supplément (siège bébé, assurance, conducteur…)
          </button>
        )}

        {!disabled && adding && (
          <div className="mt-1 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
            <select
              value={draft.presetId}
              onChange={(e) => selectPreset(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              {EXTRA_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.price}€/jour</option>
              ))}
              <option value={CUSTOM_ID}>Autre (libre)…</option>
            </select>
            {draft.presetId === CUSTOM_ID && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  onKeyDown={onEnter}
                  placeholder="Nom (ex. GPS, livraison hôtel…)"
                  className={`${inputClass} col-span-3`}
                />
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  onKeyDown={onEnter}
                  placeholder="Prix €"
                  className={inputClass}
                />
                <select
                  value={draft.mode}
                  onChange={(e) => setDraft({ ...draft, mode: e.target.value as BookingExtra['mode'] })}
                  className={`${inputClass} col-span-2 appearance-none`}
                >
                  <option value="per_day">par jour</option>
                  <option value="one_time">une seule fois</option>
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setAdding(false)}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 touch-manipulation">
                Annuler
              </button>
              <button type="button" onClick={add}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover touch-manipulation">
                Ajouter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
