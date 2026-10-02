import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminBooking, AdminVehicle } from '../types/admin';
import { fetchBookings, fetchVehicles, subscribeToBookings, subscribeToVehicles } from '../services/adminService';

/**
 * Finance data: real rows only. Unlike useAdminData there is no sample-data
 * fallback — an empty database shows as zero, an error as an error.
 * Loads on mount, then follows the realtime channels: any booking or vehicle
 * change (e.g. a rental marked Terminée on another phone) reloads the figures.
 */
export function useFinanceData() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);
      const [vehiclesData, bookingsData] = await Promise.all([fetchVehicles(), fetchBookings()]);
      setVehicles(vehiclesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading finance data:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: coalesce bursts of changes into one reload
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const scheduleReload = () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => load(), 500);
    };
    const unsubBookings = subscribeToBookings(scheduleReload, scheduleReload, scheduleReload);
    const unsubVehicles = subscribeToVehicles(scheduleReload);
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      unsubBookings();
      unsubVehicles();
    };
  }, [load]);

  return { bookings, vehicles, isLoading, isRefreshing, error, refresh: () => load(true) };
}
