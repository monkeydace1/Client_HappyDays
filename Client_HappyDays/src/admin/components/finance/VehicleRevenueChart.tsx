import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VehicleBucket, BucketGranularity, FinanceVehicle } from '../../lib/finance';
import { formatEuro, vehicleSeriesKey } from '../../lib/finance';
import { MAX_CHART_SERIES } from '../../hooks/useVehicleSelection';
import { seriesColor, TOTAL_SERIES_COLOR } from './vehicleColors';

interface VehicleRevenueChartProps {
  data: VehicleBucket[];
  granularity: BucketGranularity;
  /** Selected cars, any order */
  vehicles: FinanceVehicle[];
  slots: Record<number, number>;
}

interface Series {
  key: string;
  name: string;
  color: string;
}

function compactEuro(value: number): string {
  if (value >= 1000) return `${Math.round(value / 100) / 10} k€`;
  return `${value} €`;
}

type ChartRow = VehicleBucket & Record<string, number | string | Record<string, number>>;

function ChartTooltip({
  active,
  payload,
  series,
}: {
  active?: boolean;
  payload?: { payload?: ChartRow }[];
  series: Series[];
}) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  const lines = series.filter((s) => (bucket.values[s.key] ?? 0) > 0).reverse(); // top of the stack first
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm max-w-[320px]">
      <p className="font-medium text-gray-900 capitalize">{bucket.label}</p>
      {series.length > 1 &&
        lines.map((s) => (
          <p key={s.key} className="flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="truncate flex-1">{s.name}</span>
            <span className="tabular-nums">{formatEuro(bucket.values[s.key])}</span>
          </p>
        ))}
      <p className={`text-gray-900 tabular-nums ${series.length > 1 && lines.length > 0 ? 'mt-1 pt-1 border-t border-gray-100 font-medium' : ''}`}>
        {series.length > 1 ? 'Total ' : ''}
        {formatEuro(bucket.revenue)}
      </p>
      <p className="text-gray-500">
        {bucket.count} réservation{bucket.count > 1 ? 's' : ''}
      </p>
    </div>
  );
}

/**
 * Revenue of the selected cars per month (per week on short ranges): one stacked
 * segment per car up to MAX_CHART_SERIES cars, the selection's total above that.
 * Each car keeps its colour slot (useVehicleSelection) whatever else is selected.
 */
export function VehicleRevenueChart({ data, granularity, vehicles, slots }: VehicleRevenueChartProps) {
  const perVehicle = vehicles.length <= MAX_CHART_SERIES;
  const series: Series[] = perVehicle
    ? [...vehicles]
        .sort((a, b) => (slots[a.id] ?? 99) - (slots[b.id] ?? 99))
        .map((v) => ({
          key: vehicleSeriesKey(v.id),
          name: v.former ? `${v.name} (ancien n°${v.number})` : v.name,
          color: seriesColor(slots[v.id]) ?? TOTAL_SERIES_COLOR,
        }))
    : [{ key: 'revenue', name: 'Sélection', color: TOTAL_SERIES_COLOR }];

  const rows: ChartRow[] = data.map((b) => ({ ...b, ...b.values }) as ChartRow);
  const title = granularity === 'month' ? 'Chiffre d’affaires par mois' : 'Chiffre d’affaires par semaine';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

      {series.length > 1 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-700">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      ) : !perVehicle ? (
        <p className="text-xs text-gray-500 mt-1">
          Total des {vehicles.length} véhicules. Sélectionnez-en {MAX_CHART_SERIES} ou moins pour voir le détail par
          véhicule.
        </p>
      ) : null}

      {data.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Aucune donnée sur cette période</p>
      ) : (
        <div className="h-64 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={compactEuro}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<ChartTooltip series={series} />} cursor={{ fill: '#F3F4F6' }} />
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stackId="selection"
                  fill={s.color}
                  // 2px white gap between stacked segments
                  stroke="#FFFFFF"
                  strokeWidth={series.length > 1 ? 2 : 0}
                  radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
                  maxBarSize={48}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
