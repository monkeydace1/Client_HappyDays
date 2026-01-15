import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, Car, Clock, Mail, Euro } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import type { AdminVehicle, QuickAddData } from '../../types/admin';
import { vehicles as vehicleData } from '../../../data/vehicleData';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuickAddData) => void;
  initialDate: string | null;
  initialVehicleId: number | null;
  vehicles: AdminVehicle[];
}

export function QuickAddModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialVehicleId,
  vehicles,
}: QuickAddModalProps) {
  const [formData, setFormData] = useState<QuickAddData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    vehicleId: initialVehicleId || 0,
    departureDate: initialDate || '',
    returnDate: initialDate ? format(addDays(parseISO(initialDate), 1), 'yyyy-MM-dd') : '',
    pickupTime: '09:00',
    returnTime: '09:00',
    notes: '',
    pricePerDay: undefined,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        vehicleId: initialVehicleId || 0,
        departureDate: initialDate || '',
        returnDate: initialDate ? format(addDays(parseISO(initialDate), 1), 'yyyy-MM-dd') : '',
        pickupTime: '09:00',
        returnTime: '09:00',
        notes: '',
        pricePerDay: undefined,
      });
    }
  }, [isOpen, initialDate, initialVehicleId]);

  // Helper to get vehicle year from static data
  const getVehicleYear = (vehicleId: number): number | undefined => {
    return vehicleData.find(v => v.id === vehicleId)?.year;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.vehicleId && formData.departureDate && formData.returnDate) {
      onSubmit(formData);
      onClose();
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal - Bottom sheet on mobile */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2
                     md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full
                     bg-white rounded-t-2xl md:rounded-2xl z-50 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Nouvelle réservation</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
              {/* Client Name & Phone - 2 columns on mobile */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Nom du client *
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200
                                 focus:border-primary focus:ring-2 focus:ring-primary/20
                                 outline-none transition-all text-sm"
                        placeholder="Nom"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200
                                 focus:border-primary focus:ring-2 focus:ring-primary/20
                                 outline-none transition-all text-sm"
                        placeholder="0555..."
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                {/* Vehicle & Price - 2 columns */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Véhicule *
                    </label>
                    <div className="relative">
                      <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.vehicleId}
                        onChange={(e) => {
                          const newVehicleId = Number(e.target.value);
                          const newVehicle = vehicles.find(v => v.id === newVehicleId);
                          setFormData({
                            ...formData,
                            vehicleId: newVehicleId,
                            pricePerDay: newVehicle?.pricePerDay || undefined
                          });
                        }}
                        className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200
                                 focus:border-primary focus:ring-2 focus:ring-primary/20
                                 outline-none transition-all text-sm appearance-none bg-white"
                        required
                      >
                        <option value={0}>Sélectionner...</option>
                        {vehicles
                          .filter((v) => v.status === 'available')
                          .map((vehicle) => {
                            const year = getVehicleYear(vehicle.id);
                            return (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} - {year || ''} - #{vehicle.id}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Prix/jour
                    </label>
                    <div className="relative">
                      <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.pricePerDay || ''}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200
                                 focus:border-primary focus:ring-2 focus:ring-primary/20
                                 outline-none transition-all text-sm"
                        placeholder={selectedVehicle?.pricePerDay?.toString() || '0'}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Départ *
                    </label>
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Retour *
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      min={formData.departureDate}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Heure départ
                    </label>
                    <input
                      type="time"
                      value={formData.pickupTime || '09:00'}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Heure retour
                    </label>
                    <input
                      type="time"
                      value={formData.returnTime || '09:00'}
                      onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Price Preview */}
                {selectedVehicle && formData.departureDate && formData.returnDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total estimé</span>
                      <span className="text-lg font-bold text-primary">
                        {(() => {
                          const days = Math.ceil(
                            (new Date(formData.returnDate).getTime() -
                              new Date(formData.departureDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          ) || 1;
                          const pricePerDay = formData.pricePerDay || selectedVehicle.pricePerDay;
                          return `${days * pricePerDay}€`;
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.pricePerDay || selectedVehicle.pricePerDay}€/jour
                      {formData.pricePerDay && formData.pricePerDay !== selectedVehicle.pricePerDay && (
                        <span className="ml-1 text-orange-500">(prix modifié)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold
                           rounded-xl transition-all duration-200 active:scale-[0.98]
                           touch-manipulation text-sm sm:text-base"
                >
                  Créer la réservation
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
