import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Car, RefreshCw, TrendingUp } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { AdminHeader } from './AdminHeader';
import { AdminTabs } from './AdminTabs';
import type { DashboardKPIs } from '../../types/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
  kpis: DashboardKPIs;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminLayout({ children, kpis, onRefresh, isRefreshing }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useAdminStore();
  const { ready, logout: handleLogout } = useAdminGuard();

  if (!ready) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-primary text-white flex-shrink-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6" />
            <span className="font-bold text-lg">Happy Days</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/finance')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation flex items-center gap-1.5"
              title="Finance"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Finance</span>
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
                title="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* KPI Header */}
      <AdminHeader kpis={kpis} />

      {/* Tabs */}
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - Takes remaining space */}
      <motion.main
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 min-h-0 pb-16 md:pb-0 overflow-hidden"
      >
        {children}
      </motion.main>
    </div>
  );
}
