import { motion } from 'framer-motion';
import { Car, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { DashboardKPIs } from '../../types/admin';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function KPICard({ icon, label, value, color, bgColor }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} rounded-xl p-3 md:p-4 flex items-center gap-3`}
    >
      <div className={`${color} p-2 rounded-lg bg-white/80`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
}

interface AdminHeaderProps {
  kpis: DashboardKPIs;
}

export function AdminHeader({ kpis }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 md:py-4">
      {/* Mobile: 2x2 grid, Desktop: 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          icon={<Car className="w-5 h-5" />}
          label="Total"
          value={kpis.totalCars}
          color="text-primary"
          bgColor="bg-primary-light"
        />
        <KPICard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Disponibles"
          value={kpis.availableCars}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KPICard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Actives"
          value={kpis.activeReservations}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <KPICard
          icon={<Clock className="w-5 h-5" />}
          label="En attente"
          value={kpis.pendingReservations}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>
    </div>
  );
}
