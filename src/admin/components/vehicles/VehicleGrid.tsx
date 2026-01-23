import { useState, useRef, useEffect } from 'react';
import { Wrench, CheckCircle, Plus, Pause, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminVehicle } from '../../types/admin';

interface VehicleGridProps {
  vehicles: AdminVehicle[];
  onToggleMaintenance: (vehicleId: number) => void;
  onAddVehicle: () => void;
  onDeleteVehicle?: (vehicleId: number) => void;
}

export function VehicleGrid({ vehicles, onToggleMaintenance, onAddVehicle, onDeleteVehicle }: VehicleGridProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedVehicle(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVehicleClick = (vehicle: AdminVehicle, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setSelectedVehicle(vehicle);
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  };

  const handleStatusChange = (status: 'available' | 'maintenance') => {
    if (selectedVehicle) {
      // Only toggle if status is different
      if ((status === 'maintenance' && selectedVehicle.status !== 'maintenance') ||
          (status === 'available' && selectedVehicle.status === 'maintenance')) {
        onToggleMaintenance(selectedVehicle.id);
      }
    }
    setSelectedVehicle(null);
    setMenuPosition(null);
  };
  // Count by status
  const statusCounts = {
    available: vehicles.filter((v) => v.status === 'available').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
  };

  return (
    <div className="p-3 space-y-3 overflow-auto h-full">
      {/* Summary - compact */}
      <div className="flex items-center justify-between">
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
        <button
          onClick={onAddVehicle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg
                   hover:bg-primary-hover transition-colors touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Vehicle List - Compact with ID numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {vehicles.map((vehicle) => {
          const isInMaintenance = vehicle.status === 'maintenance';

          return (
            <button
              key={vehicle.id}
              onClick={(e) => handleVehicleClick(vehicle, e)}
              className={`relative bg-white rounded-lg overflow-hidden shadow-sm border text-left
                transition-all touch-manipulation active:scale-95
                ${isInMaintenance ? 'border-gray-300 opacity-60' : 'border-gray-200'}
                ${selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary' : ''}`}
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
        Tapez sur un véhicule pour changer son statut
      </div>

      {/* Status Selection Menu - Compact */}
      <AnimatePresence>
        {selectedVehicle && menuPosition && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
            style={{
              left: Math.min(menuPosition.x - 80, window.innerWidth - 180),
              top: Math.min(menuPosition.y, window.innerHeight - 180),
            }}
          >
            <div className="px-2 py-1 border-b border-gray-100 mb-1">
              <p className="text-[10px] font-medium text-gray-500">#{selectedVehicle.id} - {selectedVehicle.name}</p>
            </div>

            {/* Active Status */}
            <button
              onClick={() => handleStatusChange('available')}
              className={`w-full px-2 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors
                ${selectedVehicle.status === 'available' ? 'bg-green-50' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center
                ${selectedVehicle.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <Play className="w-3 h-3" />
              </div>
              <span className={`text-xs font-medium ${selectedVehicle.status === 'available' ? 'text-green-600' : 'text-gray-700'}`}>
                Actif
              </span>
              {selectedVehicle.status === 'available' && (
                <CheckCircle className="w-3 h-3 ml-auto text-green-500" />
              )}
            </button>

            {/* Pause Status */}
            <button
              onClick={() => handleStatusChange('maintenance')}
              className={`w-full px-2 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors
                ${selectedVehicle.status === 'maintenance' ? 'bg-orange-50' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center
                ${selectedVehicle.status === 'maintenance' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <Pause className="w-3 h-3" />
              </div>
              <span className={`text-xs font-medium ${selectedVehicle.status === 'maintenance' ? 'text-orange-600' : 'text-gray-700'}`}>
                Pause
              </span>
              {selectedVehicle.status === 'maintenance' && (
                <CheckCircle className="w-3 h-3 ml-auto text-orange-500" />
              )}
            </button>

            {/* Delete Vehicle */}
            {onDeleteVehicle && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    if (confirm(`Supprimer le véhicule #${selectedVehicle.id} - ${selectedVehicle.name} ?`)) {
                      onDeleteVehicle(selectedVehicle.id);
                      setSelectedVehicle(null);
                      setMenuPosition(null);
                    }
                  }}
                  className="w-full px-2 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-red-600">Supprimer</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
