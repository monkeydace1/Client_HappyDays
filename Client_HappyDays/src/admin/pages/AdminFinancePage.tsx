import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, RefreshCw, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { useFinanceData } from '../hooks/useFinanceData';
import {
  resolvePeriod,
  filterCompletedInPeriod,
  summarize,
  bucketRevenue,
  bucketGranularity,
  groupByVehicle,
  groupBySource,
  groupByClient,
  type Period,
  type PeriodPreset,
  type ClientRow,
} from '../lib/finance';
import { PeriodSelector } from '../components/finance/PeriodSelector';
import { FinanceSummaryCards } from '../components/finance/FinanceSummaryCards';
import { RevenueChart } from '../components/finance/RevenueChart';
import { BreakdownTables } from '../components/finance/BreakdownTables';
import { ClientsTable } from '../components/finance/ClientsTable';
import { ClientBookingsModal } from '../components/finance/ClientBookingsModal';

export function AdminFinancePage() {
  const navigate = useNavigate();
  const { ready, logout } = useAdminGuard();
  const { bookings, vehicles, isLoading, isRefreshing, error, refresh } = useFinanceData();

  const [preset, setPreset] = useState<PeriodPreset>('thisMonth');
  const [custom, setCustom] = useState<Period>(() => resolvePeriod('thisMonth'));
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);

  const period = useMemo(() => resolvePeriod(preset, custom), [preset, custom]);

  const completed = useMemo(() => filterCompletedInPeriod(bookings, period), [bookings, period]);
  const summary = useMemo(() => summarize(completed), [completed]);
  const buckets = useMemo(() => bucketRevenue(completed, period), [completed, period]);
  const granularity = useMemo(() => bucketGranularity(period), [period]);
  const byVehicle = useMemo(() => groupByVehicle(completed, vehicles), [completed, vehicles]);
  const bySource = useMemo(() => groupBySource(completed), [completed]);
  const clients = useMemo(() => groupByClient(bookings, period), [bookings, period]);

  const handlePresetChange = useCallback(
    (next: PeriodPreset) => {
      // Entering "Personnalisé" starts from the range currently displayed
      if (next === 'custom' && preset !== 'custom') setCustom(resolvePeriod(preset));
      setPreset(next);
    },
    [preset]
  );

  const closeClient = useCallback(() => setSelectedClient(null), []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar — same look as the dashboard's */}
      <header className="bg-primary text-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              title="Retour au tableau de bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <TrendingUp className="w-6 h-6" />
            <span className="font-bold text-lg">Finance</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Happy Days</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3 md:p-6 space-y-3 md:space-y-4">
        <PeriodSelector
          preset={preset}
          custom={custom}
          resolved={period}
          onPresetChange={handlePresetChange}
          onCustomChange={setCustom}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Impossible de charger les réservations</p>
              <p className="text-red-600/80 mt-0.5">{error}</p>
            </div>
            <button onClick={refresh} className="font-medium underline">
              Réessayer
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-1">
              Seules les réservations <span className="font-medium text-blue-600">Terminées</span> sont
              comptées, à la date de départ.
            </p>
            <FinanceSummaryCards summary={summary} />
            <RevenueChart data={buckets} granularity={granularity} />
            <BreakdownTables byVehicle={byVehicle} bySource={bySource} />
            <ClientsTable clients={clients} onSelect={setSelectedClient} />
          </>
        )}
      </main>

      <ClientBookingsModal client={selectedClient} period={period} onClose={closeClient} />
    </div>
  );
}
