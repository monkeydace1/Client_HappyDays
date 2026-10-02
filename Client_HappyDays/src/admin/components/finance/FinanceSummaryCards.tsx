import { Euro, CheckCircle2, Receipt, CalendarDays } from 'lucide-react';
import type { FinanceSummary } from '../../lib/finance';
import { formatEuro } from '../../lib/finance';

interface FinanceSummaryCardsProps {
  summary: FinanceSummary;
}

export function FinanceSummaryCards({ summary }: FinanceSummaryCardsProps) {
  const cards = [
    {
      label: "Chiffre d'affaires",
      value: formatEuro(summary.revenue),
      icon: <Euro className="w-5 h-5" />,
      accent: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Réservations terminées',
      value: String(summary.count),
      icon: <CheckCircle2 className="w-5 h-5" />,
      accent: 'text-green-600 bg-green-50',
    },
    {
      label: 'Panier moyen',
      value: formatEuro(summary.avgPerBooking),
      icon: <Receipt className="w-5 h-5" />,
      accent: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Jours de location',
      value: String(summary.rentalDays),
      icon: <CalendarDays className="w-5 h-5" />,
      accent: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
          <span className={`p-2 rounded-lg ${c.accent}`}>{c.icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{c.label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
