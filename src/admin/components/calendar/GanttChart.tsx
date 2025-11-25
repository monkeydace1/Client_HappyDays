import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { format, addDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAdminStore } from '../../store/adminStore';
import type { AdminVehicle, AdminBooking, CalendarViewDays } from '../../types/admin';

interface GanttChartProps {
  vehicles: AdminVehicle[];
  bookings: AdminBooking[];
  onCellClick: (date: string, vehicleId: number) => void;
  onBookingClick: (bookingId: string) => void;
  onAssignVehicle?: (bookingId: string, vehicleId: number) => void;
}

// Generate date range from start date
function generateDates(startDate: string, days: number): Date[] {
  const dates: Date[] = [];
  const start = parseISO(startDate);
  for (let i = 0; i < days; i++) {
    dates.push(addDays(start, i));
  }
  return dates;
}

// Get booking for a specific vehicle and date
function getBookingForCell(
  bookings: AdminBooking[],
  vehicleId: number,
  date: Date
): AdminBooking | null {
  return bookings.find((booking) => {
    if (booking.assignedVehicleId !== vehicleId && booking.vehicleId !== vehicleId) return false;
    const start = parseISO(booking.departureDate);
    const end = parseISO(booking.returnDate);
    return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
  }) || null;
}

// Check if date is start of booking
function isBookingStart(booking: AdminBooking, date: Date): boolean {
  return isSameDay(parseISO(booking.departureDate), date);
}

// Calculate booking span in days
function getBookingSpan(booking: AdminBooking, startDate: Date, totalDays: number): number {
  const bookingStart = parseISO(booking.departureDate);
  const bookingEnd = parseISO(booking.returnDate);
  const viewEnd = addDays(startDate, totalDays);

  const effectiveStart = bookingStart < startDate ? startDate : bookingStart;
  const effectiveEnd = bookingEnd > viewEnd ? viewEnd : bookingEnd;

  const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Status color mapping
function getStatusColor(status: AdminBooking['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500';
    case 'confirmed':
      return 'bg-red-500';
    case 'completed':
      return 'bg-gray-400';
    case 'cancelled':
      return 'bg-gray-300';
    default:
      return 'bg-gray-400';
  }
}

// Vehicle status color
function getVehicleStatusBg(status: AdminVehicle['status']): string {
  switch (status) {
    case 'maintenance':
      return 'bg-gray-200';
    case 'retired':
      return 'bg-gray-300';
    default:
      return 'bg-white';
  }
}

export function GanttChart({
  vehicles,
  bookings,
  onCellClick,
  onBookingClick,
  onAssignVehicle,
}: GanttChartProps) {
  const {
    calendarStartDate,
    calendarViewDays,
    setCalendarViewDays,
    navigateCalendar,
    goToToday,
    unassignedPanelExpanded,
    toggleUnassignedPanel,
    selectedUnassignedBookingId,
    selectUnassignedBooking,
  } = useAdminStore();

  const dates = useMemo(
    () => generateDates(calendarStartDate, calendarViewDays),
    [calendarStartDate, calendarViewDays]
  );

  const unassignedBookings = useMemo(
    () => bookings.filter((b) => !b.assignedVehicleId && b.status === 'pending'),
    [bookings]
  );

  const viewOptions: { value: CalendarViewDays; label: string }[] = [
    { value: 7, label: '7j' },
    { value: 14, label: '14j' },
    { value: 30, label: '30j' },
  ];

  const handleVehicleRowClick = (vehicleId: number) => {
    if (selectedUnassignedBookingId && onAssignVehicle) {
      onAssignVehicle(selectedUnassignedBookingId, vehicleId);
      selectUnassignedBooking(null);
    }
  };

  // Cell width based on view
  const cellWidth = calendarViewDays <= 7 ? 50 : calendarViewDays <= 14 ? 44 : 40;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Unassigned Bookings Panel */}
      {unassignedBookings.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 flex-shrink-0">
          <button
            onClick={toggleUnassignedPanel}
            className="w-full px-4 py-3 flex items-center justify-between touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">
                {unassignedBookings.length} réservation{unassignedBookings.length > 1 ? 's' : ''} non assignée{unassignedBookings.length > 1 ? 's' : ''}
              </span>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-amber-600 transition-transform ${
                unassignedPanelExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {unassignedPanelExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {unassignedBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => selectUnassignedBooking(
                        selectedUnassignedBookingId === booking.id ? null : booking.id
                      )}
                      className={`w-full p-3 rounded-lg text-left transition-all touch-manipulation
                        ${selectedUnassignedBookingId === booking.id
                          ? 'bg-amber-500 text-white ring-2 ring-amber-600'
                          : 'bg-white hover:bg-amber-100'}`}
                    >
                      <div className="font-medium">{booking.clientName}</div>
                      <div className="text-sm opacity-80">
                        {booking.vehicleName} · {format(parseISO(booking.departureDate), 'dd/MM')} - {format(parseISO(booking.returnDate), 'dd/MM')}
                      </div>
                      {selectedUnassignedBookingId === booking.id && (
                        <div className="text-xs mt-1 opacity-90">
                          Tapez sur un véhicule pour assigner
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateCalendar('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover touch-manipulation"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => navigateCalendar('next')}
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCalendarViewDays(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all touch-manipulation
                ${calendarViewDays === option.value
                  ? 'bg-white shadow text-primary'
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Grid - Using CSS Grid for proper sticky behavior */}
      <div className="flex-1 overflow-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `120px repeat(${calendarViewDays}, ${cellWidth}px)`,
            minWidth: `${120 + calendarViewDays * cellWidth}px`,
          }}
        >
          {/* Header Row */}
          {/* Empty corner cell */}
          <div className="sticky left-0 top-0 z-30 bg-gray-100 border-b border-r border-gray-300 h-16" />

          {/* Date headers */}
          {dates.map((date, index) => {
            const isToday = isSameDay(date, new Date());
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
              <div
                key={index}
                className={`sticky top-0 z-20 h-16 flex flex-col items-center justify-center border-b border-r border-gray-200
                  ${isToday ? 'bg-primary text-white' : isWeekend ? 'bg-gray-200' : 'bg-gray-100'}`}
              >
                <div className="text-xs font-medium">
                  {format(date, 'EEE', { locale: fr })}
                </div>
                <div className={`text-base font-bold ${isToday ? '' : 'text-gray-900'}`}>
                  {format(date, 'd')}
                </div>
                <div className="text-xs opacity-70">
                  {format(date, 'MMM', { locale: fr })}
                </div>
              </div>
            );
          })}

          {/* Vehicle Rows */}
          {vehicles.map((vehicle) => {
            const isInMaintenance = vehicle.status === 'maintenance';
            const isSelecting = !!selectedUnassignedBookingId;

            return (
              <>
                {/* Vehicle Name Cell - Sticky */}
                <div
                  key={`name-${vehicle.id}`}
                  className={`sticky left-0 z-10 h-14 px-2 flex items-center border-b border-r border-gray-300
                    ${getVehicleStatusBg(vehicle.status)}
                    ${isSelecting ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                  onClick={() => isSelecting && handleVehicleRowClick(vehicle.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-gray-900 truncate leading-tight">
                      {vehicle.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vehicle.pricePerDay}€/j
                    </div>
                  </div>
                  {isInMaintenance && (
                    <span className="flex-shrink-0 text-[10px] bg-gray-600 text-white px-1 py-0.5 rounded ml-1">
                      M
                    </span>
                  )}
                </div>

                {/* Date Cells */}
                {dates.map((date, dateIndex) => {
                  const booking = getBookingForCell(bookings, vehicle.id, date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isStart = booking && isBookingStart(booking, date);
                  const span = booking && isStart
                    ? getBookingSpan(booking, parseISO(calendarStartDate), calendarViewDays)
                    : 0;

                  return (
                    <div
                      key={`cell-${vehicle.id}-${dateIndex}`}
                      className={`relative h-14 border-b border-r border-gray-100
                        ${isWeekend ? 'bg-gray-50' : 'bg-white'}
                        ${isInMaintenance ? 'bg-gray-200' : ''}`}
                    >
                      {booking && isStart ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick(booking.id);
                          }}
                          className={`absolute top-1 left-0.5 h-12 rounded ${getStatusColor(booking.status)}
                            text-white text-[10px] font-medium px-1.5 overflow-hidden
                            hover:opacity-90 transition-opacity touch-manipulation z-10
                            flex flex-col justify-center`}
                          style={{
                            width: `calc(${Math.min(span, calendarViewDays - dateIndex)} * ${cellWidth}px - 4px)`,
                          }}
                        >
                          <div className="truncate leading-tight">{booking.clientName}</div>
                          <div className="truncate opacity-80 leading-tight">{format(parseISO(booking.departureDate), 'dd/MM')} - {format(parseISO(booking.returnDate), 'dd/MM')}</div>
                        </button>
                      ) : !booking && !isInMaintenance && !isSelecting ? (
                        <button
                          onClick={() => onCellClick(format(date, 'yyyy-MM-dd'), vehicle.id)}
                          className="w-full h-full hover:bg-green-100 transition-colors touch-manipulation"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
