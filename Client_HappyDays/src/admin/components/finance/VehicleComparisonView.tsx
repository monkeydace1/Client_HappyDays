import { useMemo } from 'react';
import { MousePointerClick } from 'lucide-react';
import type { AdminBooking } from '../../types/admin';
import type { FinanceVehicle, Period, BucketGranularity } from '../../lib/finance';
import {
  filterByVehicles,
  summarize,
  compareVehicles,
  bucketRevenueByVehicle,
  formatEuro,
} from '../../lib/finance';
import { MAX_CHART_SERIES } from '../../hooks/useVehicleSelection';
import { FinanceSummaryCards } from './FinanceSummaryCards';
import { VehiclePicker } from './VehiclePicker';
import { VehicleRevenueChart } from './VehicleRevenueChart';
import { VehicleComparisonTable } from './VehicleComparisonTable';
import { VehicleBookingsList } from './VehicleBookingsList';

interface VehicleComparisonViewProps {
  /** Completed bookings of the period, whole fleet */
  completed: AdminBooking[];
  fleet: FinanceVehicle[];
  period: Period;
  granularity: BucketGranularity;
  selectedIds: number[];
  slots: Record<number, number>;
  onToggle: (id: number) => void;
  onSelect: (ids: number[]) => void;
  onClear: () => void;
}

/** Finance → "Comparer des véhicules": the period's figures for the cars the agency picks. */
export function VehicleComparisonView({
  completed,
  fleet,
  period,
  granularity,
  selectedIds,
  slots,
  onToggle,
  onSelect,
  onClear,
}: VehicleComparisonViewProps) {
  // Stored selections may name cars that are no longer listed (e.g. a deleted car)
  const ids = useMemo(() => {
    const listed = new Set(fleet.map((v) => v.id));
    return selectedIds.filter((id) => listed.has(id));
  }, [fleet, selectedIds]);
  const selectedVehicles = useMemo(() => fleet.filter((v) => ids.includes(v.id)), [fleet, ids]);
  const showColors = ids.length > 0 && ids.length <= MAX_CHART_SERIES;

  const subset = useMemo(() => filterByVehicles(completed, ids), [completed, ids]);
  const summary = useMemo(() => summarize(subset), [subset]);
  const comparison = useMemo(() => compareVehicles(completed, fleet, period, ids), [completed, fleet, period, ids]);
  const buckets = useMemo(() => bucketRevenueByVehicle(completed, period, ids), [completed, period, ids]);
  const fleetRevenue = useMemo(() => completed.reduce((s, b) => s + (b.totalPrice || 0), 0), [completed]);

  return (
    <>
      <VehiclePicker
        fleet={fleet}
        selectedIds={ids}
        slots={slots}
        showColors={showColors}
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={onClear}
      />

      {ids.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <MousePointerClick className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Choisissez un ou plusieurs véhicules pour voir leurs chiffres.</p>
          <p className="text-xs text-gray-400 mt-1">La sélection est gardée sur cet appareil.</p>
        </div>
      ) : (
        <>
          <FinanceSummaryCards summary={summary} />
          <p className="text-xs text-gray-500 px-1">
            {ids.length === 1 ? 'Ce véhicule' : `Ces ${ids.length} véhicules`} :{' '}
            <span className="font-medium text-gray-900">
              {fleetRevenue ? Math.round((summary.revenue / fleetRevenue) * 100) : 0} %
            </span>{' '}
            du chiffre d'affaires de la période ({formatEuro(summary.revenue)} sur {formatEuro(fleetRevenue)}).
          </p>
          <VehicleRevenueChart data={buckets} granularity={granularity} vehicles={selectedVehicles} slots={slots} />
          <VehicleComparisonTable comparison={comparison} slots={slots} showColors={showColors} />
          <VehicleBookingsList bookings={subset} fleet={fleet} />
        </>
      )}
    </>
  );
}
