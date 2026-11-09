import { Car, Globe, ChevronRight } from 'lucide-react';
import type { VehicleRevenue, SourceRevenue } from '../../lib/finance';
import { formatEuro } from '../../lib/finance';
import { SOURCE_LABELS } from '../../lib/bookingStatus';
import { VehicleNumber } from './VehiclePicker';

interface BreakdownTablesProps {
  byVehicle: VehicleRevenue[];
  bySource: SourceRevenue[];
  /** Row click → the car's figures in the "Comparer des véhicules" view */
  onSelectVehicle?: (vehicleId: number) => void;
}

function ShareBar({ ratio }: { ratio: number }) {
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 rounded-full" style={{ width }} />
    </div>
  );
}

export function BreakdownTables({ byVehicle, bySource, onSelectVehicle }: BreakdownTablesProps) {
  const maxVehicle = byVehicle[0]?.revenue || 0;

  return (
    <div className="grid lg:grid-cols-2 gap-3">
      {/* Per vehicle */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" /> Par véhicule
        </h2>
        {byVehicle.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Aucun véhicule</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="text-left font-medium pb-2">Véhicule</th>
                  <th className="text-right font-medium pb-2">Rés.</th>
                  <th className="text-right font-medium pb-2">Jours</th>
                  <th className="text-right font-medium pb-2">CA</th>
                  {onSelectVehicle && <th className="pb-2" aria-hidden="true" />}
                </tr>
              </thead>
              <tbody>
                {byVehicle.map((v) => (
                  <tr
                    key={v.vehicleId}
                    onClick={onSelectVehicle ? () => onSelectVehicle(v.vehicleId) : undefined}
                    title={onSelectVehicle ? 'Voir les chiffres de ce véhicule' : undefined}
                    className={`border-t border-gray-100 ${v.count === 0 ? 'text-gray-400' : ''}
                      ${onSelectVehicle ? 'cursor-pointer hover:bg-gray-50 group' : ''}`}
                  >
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`truncate max-w-[160px] md:max-w-none ${v.count === 0 ? '' : 'text-gray-900'}`}>{v.name}</span>
                        <VehicleNumber number={v.number} former={v.former} />
                      </div>
                      <div className="mt-1 w-32">
                        <ShareBar ratio={maxVehicle ? v.revenue / maxVehicle : 0} />
                      </div>
                    </td>
                    <td className="py-2 text-right tabular-nums align-top">{v.count}</td>
                    <td className="py-2 text-right tabular-nums align-top">{v.rentalDays}</td>
                    <td className={`py-2 text-right tabular-nums align-top ${v.count === 0 ? '' : 'font-semibold text-gray-900'}`}>
                      {formatEuro(v.revenue)}
                    </td>
                    {onSelectVehicle && (
                      <td className="py-2 pl-1 align-top w-5">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </td>
                    )}
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
