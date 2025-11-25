import type { DashboardKPIs } from '../../types/admin';

interface AdminHeaderProps {
  kpis: DashboardKPIs;
}

export function AdminHeader({ kpis }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
      {/* Compact inline KPIs */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold text-gray-900">{kpis.totalCars}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Dispo:</span>
          <span className="font-bold text-green-600">{kpis.availableCars}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Actives:</span>
          <span className="font-bold text-red-600">{kpis.activeReservations}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Attente:</span>
          <span className="font-bold text-amber-600">{kpis.pendingReservations}</span>
        </div>
      </div>
    </div>
  );
}
