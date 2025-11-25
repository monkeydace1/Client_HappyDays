import type { AdminVehicle } from '../types/admin';

// Sample car placeholder image for all vehicles
const SAMPLE_CAR_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

// Base 6 vehicles (from original vehicleData.ts)
const baseVehicles = [
  {
    name: 'Renault Clio 5',
    brand: 'Renault',
    model: 'Clio 5',
    category: 'Citadine',
    transmission: 'Manuelle' as const,
    fuel: 'Essence' as const,
    seats: 5,
    pricePerDay: 35,
  },
  {
    name: 'Dacia Sandero Stepway',
    brand: 'Dacia',
    model: 'Sandero Stepway',
    category: 'Citadine',
    transmission: 'Manuelle' as const,
    fuel: 'Essence' as const,
    seats: 5,
    pricePerDay: 40,
  },
  {
    name: 'Peugeot 208',
    brand: 'Peugeot',
    model: '208',
    category: 'Citadine',
    transmission: 'Automatique' as const,
    fuel: 'Essence' as const,
    seats: 5,
    pricePerDay: 45,
  },
  {
    name: 'Hyundai Tucson',
    brand: 'Hyundai',
    model: 'Tucson',
    category: 'SUV',
    transmission: 'Automatique' as const,
    fuel: 'Diesel' as const,
    seats: 5,
    pricePerDay: 80,
  },
  {
    name: 'Volkswagen Golf',
    brand: 'Volkswagen',
    model: 'Golf',
    category: 'Compacte',
    transmission: 'Automatique' as const,
    fuel: 'Essence' as const,
    seats: 5,
    pricePerDay: 50,
  },
  {
    name: 'Toyota Corolla',
    brand: 'Toyota',
    model: 'Corolla',
    category: 'Berline',
    transmission: 'Automatique' as const,
    fuel: 'Hybride' as const,
    seats: 5,
    pricePerDay: 60,
  },
];

// Generate 18 vehicles (6 base × 3 copies with different colors/variants)
const colors = ['Noir', 'Blanc', 'Gris'];

export const adminVehicles: AdminVehicle[] = [];

let idCounter = 1;
for (let copy = 0; copy < 3; copy++) {
  for (const base of baseVehicles) {
    const color = colors[copy];
    adminVehicles.push({
      id: idCounter,
      name: `${base.name} ${color}`,
      brand: base.brand,
      model: base.model,
      category: base.category,
      image: SAMPLE_CAR_IMAGE,
      transmission: base.transmission,
      fuel: base.fuel,
      seats: base.seats,
      pricePerDay: base.pricePerDay,
      featured: idCounter <= 6,
      status: 'available',
      licensePlate: `${idCounter.toString().padStart(3, '0')}-${base.brand.substring(0, 3).toUpperCase()}-31`,
    });
    idCounter++;
  }
}

// Helper functions
export const getAdminVehicleById = (id: number): AdminVehicle | undefined => {
  return adminVehicles.find(v => v.id === id);
};

export const getAvailableVehicles = (): AdminVehicle[] => {
  return adminVehicles.filter(v => v.status === 'available');
};

export const getVehiclesByStatus = (status: AdminVehicle['status']): AdminVehicle[] => {
  return adminVehicles.filter(v => v.status === status);
};
