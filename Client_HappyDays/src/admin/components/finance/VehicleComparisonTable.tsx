import { Table2 } from 'lucide-react';
import type { VehicleComparison, VehicleComparisonRow } from '../../lib/finance';
import { formatEuro } from '../../lib/finance';
import { seriesColor } from './vehicleColors';
import { VehicleNumber } from './VehiclePicker';

interface VehicleComparisonTableProps {
  comparison: VehicleComparison;
  slots: Record<number, number>;
  showColors: boolean;
}

function percent(ratio: number | null): string {
  return ratio === null ? '—' : `${Math.round(ratio * 100)} %`;
}

function ShareBar({ ratio }: { ratio: number }) {
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 rounded-full" style={{ width }} />
    </div>
  );
}

export function VehicleComparisonTable({ comparison, slots, showColors }: VehicleComparisonTableProps) {
  const { rows, total } = comparison;
  const maxRevenue = rows[0]?.revenue || 0;

  const cells = (r: VehicleComparisonRow, strong: boolean) => (
    <>
      <td className="py-2 px-2 text-right tabular-nums align-top">{r.count}</td>
      <td className="py-2 px-2 text-right tabular-nums align-top">{r.rentalDays}</td>
      <td className={`py-2 px-2 text-right tabular-nums align-top ${strong ? 'font-semibold text-gray-900' : ''}`}>
        {formatEuro(r.revenue)}
      </td>
      <td className="py-2 px-2 text-right tabular-nums align-top">{r.rentalDays ? formatEuro(r.avgPerDay) : '—'}</td>
      <td className="py-2 px-2 text-right tabular-nums align-top">{percent(r.occupancy)}</td>
      <td className="py-2 pl-2 text-right tabular-nums align-top">{percent(r.share)}</td>
    </>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Table2 className="w-4 h-4 text-gray-500" /> Comparaison
      </h2>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="text-left font-medium pb-2 pr-2">Véhicule</th>
              <th className="text-right font-medium pb-2 px-2" title="Réservations terminées">Rés.</th>
              <th className="text-right font-medium pb-2 px-2" title="Jours de location">Jours</th>
              <th className="text-right font-medium pb-2 px-2">CA</th>
              <th className="text-right font-medium pb-2 px-2" title="Chiffre d'affaires ÷ jours de location">€ / jour</th>
              <th className="text-right font-medium pb-2 px-2" title="Jours loués ÷ jours de la période où la voiture était dans la flotte (jusqu'à aujourd'hui)">
                Occupation
              </th>
              <th className="text-right font-medium pb-2 pl-2" title="Part du CA de la sélection">Part</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const color = showColors ? seriesColor(slots[r.vehicleId]) : undefined;
              const muted = r.count === 0;
              return (
                <tr key={r.vehicleId} className={`border-t border-gray-100 ${muted ? 'text-gray-400' : 'text-gray-700'}`}>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
                      <span className={`truncate ${muted ? '' : 'text-gray-900'}`}>{r.name}</span>
                      <VehicleNumber number={r.number} former={r.former} />
                    </div>
                    <div className={`mt-1 w-32 ${color ? 'ml-[18px]' : ''}`}>
                      <ShareBar ratio={maxRevenue ? r.revenue / maxRevenue : 0} />
                    </div>
                  </td>
                  {cells(r, !muted)}
                </tr>
              );
            })}
          </tbody>
          {rows.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200 text-gray-900 font-medium">
                <td className="py-2 pr-2">Total sélection</td>
                {cells(total, true)}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Occupation = jours loués ÷ jours de la période où la voiture était dans la flotte, jusqu'à aujourd'hui.
        Comme le CA, les jours d'une location comptent à sa date de départ.
      </p>
    </div>
  );
}
