import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminTab, CalendarViewDays, ReservationFilters } from '../types/admin';

interface AdminState {
  // Authentication
  isAuthenticated: boolean;
  pinVerified: boolean;

  // UI State
  activeTab: AdminTab;
  calendarViewDays: CalendarViewDays;
  calendarStartDate: string; // ISO date string

  // Modal State
  quickAddModalOpen: boolean;
  quickAddDate: string | null;
  quickAddVehicleId: number | null;
  bookingDetailsModalOpen: boolean;
  selectedBookingId: string | null;

  // Unassigned bookings panel
  unassignedPanelExpanded: boolean;
  selectedUnassignedBookingId: string | null; // For tap-to-assign flow

  // Filters
  reservationFilters: ReservationFilters;

  // Actions - Auth
  setAuthenticated: (value: boolean) => void;
  setPinVerified: (value: boolean) => void;
  logout: () => void;

  // Actions - UI
  setActiveTab: (tab: AdminTab) => void;
  setCalendarViewDays: (days: CalendarViewDays) => void;
  setCalendarStartDate: (date: string) => void;
  navigateCalendar: (direction: 'prev' | 'next') => void;
  goToToday: () => void;

  // Actions - Modals
  openQuickAdd: (date: string, vehicleId: number) => void;
  closeQuickAdd: () => void;
  openBookingDetails: (bookingId: string) => void;
  closeBookingDetails: () => void;

  // Actions - Unassigned panel
  toggleUnassignedPanel: () => void;
  selectUnassignedBooking: (bookingId: string | null) => void;

  // Actions - Filters
  setReservationFilters: (filters: Partial<ReservationFilters>) => void;
  resetReservationFilters: () => void;
}

const getDefaultFilters = (): ReservationFilters => ({
  search: '',
  status: 'all',
  dateFrom: undefined,
  dateTo: undefined,
});

const getTodayISO = () => new Date().toISOString().split('T')[0];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      pinVerified: false,
      activeTab: 'calendar',
      calendarViewDays: 14,
      calendarStartDate: getTodayISO(),
      quickAddModalOpen: false,
      quickAddDate: null,
      quickAddVehicleId: null,
      bookingDetailsModalOpen: false,
      selectedBookingId: null,
      unassignedPanelExpanded: false,
      selectedUnassignedBookingId: null,
      reservationFilters: getDefaultFilters(),

      // Auth actions
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setPinVerified: (value) => set({ pinVerified: value }),
      logout: () => set({
        isAuthenticated: false,
        pinVerified: false,
        activeTab: 'calendar',
      }),

      // UI actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCalendarViewDays: (days) => set({ calendarViewDays: days }),
      setCalendarStartDate: (date) => set({ calendarStartDate: date }),

      navigateCalendar: (direction) => {
        const { calendarStartDate, calendarViewDays } = get();
        const current = new Date(calendarStartDate);
        const offset = direction === 'next' ? calendarViewDays : -calendarViewDays;
        current.setDate(current.getDate() + offset);
        set({ calendarStartDate: current.toISOString().split('T')[0] });
      },

      goToToday: () => set({ calendarStartDate: getTodayISO() }),

      // Modal actions
      openQuickAdd: (date, vehicleId) => set({
        quickAddModalOpen: true,
        quickAddDate: date,
        quickAddVehicleId: vehicleId,
      }),
      closeQuickAdd: () => set({
        quickAddModalOpen: false,
        quickAddDate: null,
        quickAddVehicleId: null,
      }),
      openBookingDetails: (bookingId) => set({
        bookingDetailsModalOpen: true,
        selectedBookingId: bookingId,
      }),
      closeBookingDetails: () => set({
        bookingDetailsModalOpen: false,
        selectedBookingId: null,
      }),

      // Unassigned panel actions
      toggleUnassignedPanel: () => set((state) => ({
        unassignedPanelExpanded: !state.unassignedPanelExpanded,
      })),
      selectUnassignedBooking: (bookingId) => set({
        selectedUnassignedBookingId: bookingId,
      }),

      // Filter actions
      setReservationFilters: (filters) => set((state) => ({
        reservationFilters: { ...state.reservationFilters, ...filters },
      })),
      resetReservationFilters: () => set({
        reservationFilters: getDefaultFilters(),
      }),
    }),
    {
      name: 'happy-days-admin',
      partialize: (state) => ({
        // Only persist these fields
        calendarViewDays: state.calendarViewDays,
        // Don't persist auth state for security - require login each time
      }),
    }
  )
);
