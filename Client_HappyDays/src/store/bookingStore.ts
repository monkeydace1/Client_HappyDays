import { create } from 'zustand';
import type { Vehicle, Supplement, ClientInfo } from '../types';
import { PICKUP_LOCATIONS } from '../types';
import {
  computeRentalUnits,
  computeVehicleSubtotal,
  computeSupplementSubtotal,
} from '../lib/pricing';

interface BookingState {
    // Step 1: Dates & Location
    departureDate: string;
    returnDate: string;
    pickupLocation: string;
    customPickupLocation: string;
    returnLocation: string;
    differentReturnLocation: boolean;

    // Step 2: Vehicle Selection
    selectedVehicle: Vehicle | null;

    // Step 3: Supplements
    supplements: Supplement[];
    additionalDriver: boolean;

    // Step 4: Client Information
    clientInfo: ClientInfo | null;

    // Navigation
    currentStep: number;

    // Computed values
    rentalDays: number;
    extraHours: number;

    // Actions - Step 1
    setDepartureDate: (date: string) => void;
    setReturnDate: (date: string) => void;
    setPickupLocation: (location: string) => void;
    setCustomPickupLocation: (location: string) => void;
    setReturnLocation: (location: string) => void;
    setDifferentReturnLocation: (value: boolean) => void;

    // Actions - Step 2
    setSelectedVehicle: (vehicle: Vehicle | null) => void;

    // Actions - Step 3
    addSupplement: (supplement: Supplement) => void;
    removeSupplement: (supplementId: string) => void;
    updateSupplementQuantity: (supplementId: string, quantity: number) => void;
    setAdditionalDriver: (value: boolean) => void;

    // Actions - Step 4
    setClientInfo: (info: ClientInfo) => void;

    // Navigation actions
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;

    // Utility actions
    calculateRentalDays: () => void;
    getTotalPrice: () => number;
    getSupplementsTotal: () => number;
    resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
    // Initial state
    departureDate: '',
    returnDate: '',
    pickupLocation: PICKUP_LOCATIONS[0], // Default to Airport
    customPickupLocation: '',
    returnLocation: '',
    differentReturnLocation: false,
    selectedVehicle: null,
    supplements: [],
    additionalDriver: false,
    clientInfo: null,
    currentStep: 1,
    rentalDays: 0,
    extraHours: 0,

    // Step 1 actions
    setDepartureDate: (date) => {
        set({ departureDate: date });
        get().calculateRentalDays();
    },

    setReturnDate: (date) => {
        set({ returnDate: date });
        get().calculateRentalDays();
    },

    setPickupLocation: (location) => set({ pickupLocation: location }),
    setCustomPickupLocation: (location) => set({ customPickupLocation: location }),
    setReturnLocation: (location) => set({ returnLocation: location }),
    setDifferentReturnLocation: (value) => set({ differentReturnLocation: value }),

    // Step 2 actions
    setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

    // Step 3 actions
    addSupplement: (supplement) =>
        set((state) => ({
            supplements: [...state.supplements, supplement]
        })),

    removeSupplement: (supplementId) =>
        set((state) => ({
            supplements: state.supplements.filter(s => s.id !== supplementId)
        })),

    updateSupplementQuantity: (supplementId, quantity) =>
        set((state) => ({
            supplements: state.supplements.map(s =>
                s.id === supplementId ? { ...s, quantity } : s
            )
        })),

    setAdditionalDriver: (value) => set({ additionalDriver: value }),

    // Step 4 actions
    setClientInfo: (info) => set({ clientInfo: info }),

    // Navigation
    nextStep: () => {
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    previousStep: () => {
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    goToStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(step, 4)) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Utilities
    calculateRentalDays: () => {
        const state = get();
        if (state.departureDate && state.returnDate) {
            const units = computeRentalUnits(state.departureDate, state.returnDate);
            set({ rentalDays: units.fullDays, extraHours: units.extraHours });
        } else {
            set({ rentalDays: 0, extraHours: 0 });
        }
    },

    getSupplementsTotal: () => {
        const state = get();
        const units = { fullDays: state.rentalDays || 1, extraHours: state.extraHours };

        let total = 0;

        // Per-day supplements (charged on full days only)
        state.supplements.forEach(supplement => {
            const quantity = supplement.quantity || 1;
            total += computeSupplementSubtotal(supplement.pricePerDay, quantity, units);
        });

        // Additional driver (8€/day, full days only)
        if (state.additionalDriver) {
            total += computeSupplementSubtotal(8, 1, units);
        }

        return total;
    },

    getTotalPrice: () => {
        const state = get();
        const units = { fullDays: state.rentalDays || 1, extraHours: state.extraHours };

        let total = 0;

        // Vehicle: fullDays × pricePerDay + extraHours × 3€
        if (state.selectedVehicle) {
            total += computeVehicleSubtotal(state.selectedVehicle.pricePerDay, units);
        }

        // Supplements
        total += state.getSupplementsTotal();

        return total;
    },

    resetBooking: () => set({
        departureDate: '',
        returnDate: '',
        pickupLocation: PICKUP_LOCATIONS[0], // Default to Airport
        customPickupLocation: '',
        returnLocation: '',
        differentReturnLocation: false,
        selectedVehicle: null,
        supplements: [],
        additionalDriver: false,
        clientInfo: null,
        currentStep: 1,
        rentalDays: 0,
        extraHours: 0
    })
}));
