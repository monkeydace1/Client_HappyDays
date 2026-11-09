import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import type { AdminBooking } from '../../types/admin';
import type { FinanceVehicle } from '../../lib/finance';
import { formatEuro, formatDay, financeVehicleId } from '../../lib/finance';
import { SOURCE_LABELS } from '../../lib/bookingStatus';

interface VehicleBookingsListProps {
  /** Completed bookings of the selected cars in the period */
  bookings: AdminBooking[];
  fleet: FinanceVehicle[];
}

const PAGE = 15;

export function VehicleBookingsList({ bookings, fleet }: VehicleBookingsListProps) {
  const [showAll, setShowAll] = useState(false);
  const byId = new Map(fleet.map((v) => [v.id, v]));
  const sorted = [...bookings].sort((a, b) =>
    a.departureDate === b.departureDate ? b.createdAt.localeCompare(a.createdAt) : a.departureDate < b.departureDate ? 1 : -1
  );
  const visible = showAll ? sorted : sorted.slice(0, PAGE);

  const carLabel = (b: AdminBooking) => {
    const v = byId.get(financeVehicleId(b));
    if (!v) return b.vehicleName;
    return v.former ? `${v.name} (ancien n°${v.number})` : `${v.name} · n°${v.number}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-gray-500" /> Locations terminées
        <span className="text-xs font-normal text-gray-500">({sorted.length})</span>
      </h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">Aucune location terminée sur cette période</p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="text-left font-medium pb-2 pr-2">Départ</th>
                  <th className="text-left font-medium pb-2 px-2">Client</th>
                  <th className="text-left font-medium pb-2 px-2">Véhicule</th>
                  <th className="text-right font-medium pb-2 px-2">Jours</th>
                  <th className="text-right font-medium pb-2 pl-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100 text-gray-700">
                    <td className="py-2 pr-2 whitespace-nowrap tabular-nums">{formatDay(b.departureDate)}</td>
                    <td className="py-2 px-2">
                      <p className="text-gray-900 truncate max-w-[180px]">{b.clientName || 'Client sans nom'}</p>
                      <p className="text-xs text-gray-400">{SOURCE_LABELS[b.source]} · {b.bookingReference}</p>
                    </td>
                    <td className="py-2 px-2 truncate max-w-[200px]">{carLabel(b)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{b.rentalDays}</td>
                    <td className="py-2 pl-2 text-right tabular-nums font-medium text-gray-900">{formatEuro(b.totalPrice || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > PAGE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg touch-manipulation"
            >
              {showAll ? 'Afficher moins' : `Afficher tout (${sorted.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
