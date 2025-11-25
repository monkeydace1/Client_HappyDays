import { Wrench, CheckCircle } from 'lucide-react';
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
    <div className="p-3 space-y-3 overflow-auto h-full">
      {/* Summary - compact */}
      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          <span className="font-bold text-green-700">{statusCounts.available}</span>
          <span className="text-green-600">dispo</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <Wrench className="w-3.5 h-3.5 text-gray-600" />
          <span className="font-bold text-gray-700">{statusCounts.maintenance}</span>
          <span className="text-gray-600">maint.</span>
        </div>
      </div>

      {/* Vehicle List - Compact with ID numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {vehicles.map((vehicle) => {
          const isInMaintenance = vehicle.status === 'maintenance';

          return (
            <button
              key={vehicle.id}
              onClick={() => onToggleMaintenance(vehicle.id)}
              className={`relative bg-white rounded-lg overflow-hidden shadow-sm border text-left
                transition-all touch-manipulation active:scale-95
                ${isInMaintenance ? 'border-gray-300 opacity-60' : 'border-gray-200'}`}
            >
              {/* Vehicle Image with ID overlay */}
              <div className="relative h-20 bg-gray-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                {/* Large ID number */}
                <div className={`absolute top-1 left-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                  ${isInMaintenance ? 'bg-gray-600 text-white' : 'bg-primary text-white'}`}>
                  {vehicle.id}
                </div>
                {isInMaintenance && (
                  <div className="absolute top-1 right-1 bg-gray-800 text-white px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
                    <Wrench className="w-2.5 h-2.5" />
                    M
                  </div>
                )}
              </div>

              {/* Vehicle Info - compact */}
              <div className="p-2">
                <div className="font-medium text-xs text-gray-900 truncate">
                  {vehicle.name}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-500">{vehicle.category}</span>
                  <span className="text-[10px] font-bold text-primary">{vehicle.pricePerDay}€</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="text-[10px] text-gray-400 text-center pt-2">
        Tapez sur un véhicule pour basculer maintenance/disponible
      </div>
    </div>
  );
}
