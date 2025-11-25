import { motion } from 'framer-motion';
import { Settings, Fuel, Users, Wrench, CheckCircle } from 'lucide-react';
import type { AdminVehicle } from '../../types/admin';

interface VehicleGridProps {
  vehicles: AdminVehicle[];
  onToggleMaintenance: (vehicleId: number) => void;
}

export function VehicleGrid({ vehicles, onToggleMaintenance }: VehicleGridProps) {
  // Count by status
  const statusCounts = {
    available: vehicles.filter((v) => v.status === 'available').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
  };

  return (
    <div className="p-4 space-y-4">
      {/* Summary */}
      <div className="flex gap-3">
        <div className="flex-1 bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-green-700">{statusCounts.available}</p>
            <p className="text-xs text-green-600">Disponibles</p>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-xl p-3 flex items-center gap-3">
          <Wrench className="w-6 h-6 text-gray-600" />
          <div>
            <p className="text-2xl font-bold text-gray-700">{statusCounts.maintenance}</p>
            <p className="text-xs text-gray-600">Maintenance</p>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle, index) => {
          const isInMaintenance = vehicle.status === 'maintenance';

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-white rounded-xl overflow-hidden shadow-sm border
                ${isInMaintenance ? 'border-gray-300 opacity-75' : 'border-gray-100'}`}
            >
              {/* Vehicle Image */}
              <div className="relative h-32 bg-gray-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                {isInMaintenance && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-sm font-bold text-primary">
                  {vehicle.pricePerDay}€/j
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                    <p className="text-sm text-gray-500">{vehicle.category}</p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5" />
                    <span>{vehicle.fuel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{vehicle.seats}</span>
                  </div>
                </div>

                {/* License Plate */}
                {vehicle.licensePlate && (
                  <div className="text-xs font-mono text-gray-400 mb-3">
                    {vehicle.licensePlate}
                  </div>
                )}

                {/* Toggle Maintenance Button */}
                <button
                  onClick={() => onToggleMaintenance(vehicle.id)}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors touch-manipulation
                    ${isInMaintenance
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {isInMaintenance ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Marquer disponible
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Mettre en maintenance
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
