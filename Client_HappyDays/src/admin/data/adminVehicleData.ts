import type { AdminVehicle } from '../types/admin';
import { vehicles } from '../../data/vehicleData';

// Convert website vehicles to admin vehicles with additional fields
export const adminVehicles: AdminVehicle[] = vehicles.map((vehicle) => ({
  id: vehicle.id,
  name: vehicle.name,
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  category: vehicle.category,
  image: vehicle.image,
  transmission: vehicle.transmission as 'Manuelle' | 'Automatique',
  fuel: vehicle.fuel as 'Essence' | 'Diesel' | 'Hybride',
  seats: vehicle.seats,
  pricePerDay: vehicle.pricePerDay,
  featured: vehicle.featured,
  status: 'available' as const,
  licensePlate: `${vehicle.id.toString().padStart(3, '0')}-${vehicle.brand.substring(0, 3).toUpperCase()}-31`,
}));

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
