import { Car, Globe } from 'lucide-react';
import type { VehicleRevenue, SourceRevenue } from '../../lib/finance';
import { formatEuro } from '../../lib/finance';
import { SOURCE_LABELS } from '../../lib/bookingStatus';

interface BreakdownTablesProps {
  byVehicle: VehicleRevenue[];
  bySource: SourceRevenue[];
}

function ShareBar({ ratio }: { ratio: number }) {
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 rounded-full" style={{ width }} />
    </div>
  );
}

export function BreakdownTables({ byVehicle, bySource }: BreakdownTablesProps) {
  const maxVehicle = byVehicle[0]?.revenue || 0;

  return (
    <div className="grid lg:grid-cols-2 gap-3">
      {/* Per vehicle */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" /> Par véhicule
        </h2>
        {byVehicle.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Aucune réservation terminée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="text-left font-medium pb-2">Véhicule</th>
                  <th className="text-right font-medium pb-2">Rés.</th>
                  <th className="text-right font-medium pb-2">Jours</th>
                  <th className="text-right font-medium pb-2">CA</th>
                </tr>
              </thead>
              <tbody>
                {byVehicle.map((v) => (
                  <tr key={v.vehicleId} className="border-t border-gray-100">
                    <td className="py-2 pr-2">
                      <p className="text-gray-900 truncate max-w-[180px] md:max-w-none">{v.name}</p>
                      <div className="mt-1 w-32">
                        <ShareBar ratio={maxVehicle ? v.revenue / maxVehicle : 0} />
                      </div>
                    </td>
                    <td className="py-2 text-right tabular-nums text-gray-700 align-top">{v.count}</td>
                    <td className="py-2 text-right tabular-nums text-gray-700 align-top">{v.rentalDays}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-gray-900 align-top">
                      {formatEuro(v.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per source */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" /> Par source
        </h2>
        <div className="space-y-3">
          {bySource.map((s) => (
            <div key={s.source}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{SOURCE_LABELS[s.source]}</span>
                <span className="text-gray-500 tabular-nums">
                  {s.count} rés. · <span className="font-semibold text-gray-900">{formatEuro(s.revenue)}</span>
                  <span className="ml-2 text-xs">{Math.round(s.share * 100)}%</span>
                </span>
              </div>
              <div className="mt-1">
                <ShareBar ratio={s.share} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
