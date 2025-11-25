// Vehicle types
export interface Vehicle {
    id: number;
    name: string;
    brand: string;
    model: string;
    category: string;
    image: string;
    transmission: 'Manuelle' | 'Automatique';
    fuel: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
    seats: number;
    pricePerDay: number;
    featured?: boolean;
}

// Supplement types
export type SupplementType = 'additional_driver' | 'child_seat' | 'insurance';

export interface Supplement {
    id: string;
    type: SupplementType;
    name: string;
    description?: string;
    pricePerDay: number;
    quantity?: number;
}

export interface ChildSeat extends Supplement {
    type: 'child_seat';
    seatType: 'baby' | 'toddler' | 'booster';
}

export interface Insurance extends Supplement {
    type: 'insurance';
    coverageLevel: 'basic' | 'standard' | 'premium';
    coverageDetails: string[];
}

// Driver's License
export interface DriverLicense {
    documentNumber: string;
    issueDate: string;
    expirationDate: string;
    photoFile?: File | null;
    photoUrl?: string;
}

// Booking types
export interface ClientInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    dateOfBirth: string;
    driverLicense: DriverLicense;
    extraInformation?: string;
    notes?: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
    acceptedTerms: boolean;
}

export interface BookingData {
    // Step 1
    departureDate: string;
    returnDate: string;
    pickupLocation: string;
    customPickupLocation?: string;
    returnLocation?: string;
    differentReturnLocation: boolean;

    // Step 2
    selectedVehicle: Vehicle | null;

    // Step 3
    supplements: Supplement[];
    additionalDriver: boolean;

    // Step 4
    clientInfo: ClientInfo | null;

    // Meta
    currentStep: number;
    totalPrice: number;
    rentalDays: number;
}

// Pickup locations
export const PICKUP_LOCATIONS = [
    'Aéroport International d\'Oran Ahmed Ben Bella',
    'Centre-ville Oran',
    'Autre (préciser)',
] as const;

export type PickupLocation = typeof PICKUP_LOCATIONS[number];
