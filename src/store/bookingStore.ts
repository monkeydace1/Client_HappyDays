import { create } from 'zustand';
import type { Vehicle, Supplement, ClientInfo } from '../types';
import { PICKUP_LOCATIONS } from '../types';

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
    nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
    previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
    goToStep: (step) => set({ currentStep: Math.max(1, Math.min(step, 4)) }),

    // Utilities
    calculateRentalDays: () => {
        const state = get();
        if (state.departureDate && state.returnDate) {
            const departure = new Date(state.departureDate);
            const returnDate = new Date(state.returnDate);
            const diffTime = Math.abs(returnDate.getTime() - departure.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            set({ rentalDays: diffDays || 1 });
        } else {
            set({ rentalDays: 0 });
        }
    },

    getSupplementsTotal: () => {
        const state = get();
        const days = state.rentalDays || 1;

        let total = 0;

        // Add supplements with quantities
        state.supplements.forEach(supplement => {
            const quantity = supplement.quantity || 1;
            total += supplement.pricePerDay * quantity * days;
        });

        // Add additional driver if selected
        if (state.additionalDriver) {
            total += 8 * days; // 8€ per day for additional driver
        }

        return total;
    },

    getTotalPrice: () => {
        const state = get();
        const days = state.rentalDays || 1;

        let total = 0;

        // Vehicle price
        if (state.selectedVehicle) {
            total += state.selectedVehicle.pricePerDay * days;
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
        rentalDays: 0
    })
}));
