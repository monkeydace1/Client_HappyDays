import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenueBucket, BucketGranularity } from '../../lib/finance';
import { formatEuro } from '../../lib/finance';

interface RevenueChartProps {
  data: RevenueBucket[];
  granularity: BucketGranularity;
}

const BAR_COLOR = '#2563EB'; // "Terminée" blue — the only series on the chart

function compactEuro(value: number): string {
  if (value >= 1000) return `${Math.round(value / 100) / 10} k€`;
  return `${value} €`;
}

interface TooltipPayload {
  payload?: RevenueBucket;
}

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900 capitalize">{bucket.label}</p>
      <p className="text-gray-700 tabular-nums">{formatEuro(bucket.revenue)}</p>
      <p className="text-gray-500">
        {bucket.count} réservation{bucket.count > 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function RevenueChart({ data, granularity }: RevenueChartProps) {
  const title = granularity === 'month' ? 'Chiffre d’affaires par mois' : 'Chiffre d’affaires par semaine';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Aucune donnée sur cette période</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
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
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="revenue" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
