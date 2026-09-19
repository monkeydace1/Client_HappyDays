import { useMemo, useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle, Sparkles, Clock, Car, Check, XCircle, Trash2 } from 'lucide-react';
import { format, addDays, isSameDay, parseISO, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAdminStore } from '../../store/adminStore';
import type { AdminVehicle, AdminBooking, CalendarViewDays, BookingStatus } from '../../types/admin';

interface GanttChartProps {
  vehicles: AdminVehicle[];
  bookings: AdminBooking[];
  onCellClick: (date: string, vehicleId: number) => void;
  onBookingClick: (bookingId: string) => void;
  onAssignVehicle?: (bookingId: string, vehicleId: number) => void;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
  onBookingMove?: (bookingId: string, newDepartureDate: string, newReturnDate: string, newVehicleId?: number) => void;
  onDeleteBooking?: (bookingId: string) => void;
}

// A booking bar rendered from a given cell, spanning `span` visible columns
interface BookingBar {
  booking: AdminBooking;
  span: number;
}

// Precomputed content of one vehicle × day cell
interface CellData {
  all: AdminBooking[];   // every booking covering this day (for "is the cell busy")
  bars: BookingBar[];    // bookings whose bar starts rendering in this cell
}

const EMPTY_CELL: CellData = { all: [], bars: [] };
const VEHICLE_COLUMN_WIDTH = 40;

// Generate date range from start date
function generateDates(startDate: string, days: number): Date[] {
  const dates: Date[] = [];
  const start = parseISO(startDate);
  for (let i = 0; i < days; i++) {
    dates.push(addDays(start, i));
  }
  return dates;
}

/**
 * Build the vehicle → day-index → bookings index ONCE per (bookings, visible range).
 *
 * The previous implementation scanned and date-parsed every booking for every
 * vehicle × day cell on every render (21 vehicles × 180 days × 564 bookings ≈ 2M
 * scans, ~1 s of pure date math per render in the 6-month view). This does one
 * pass over the bookings instead.
 */
function buildCellIndex(bookings: AdminBooking[], viewStart: Date, days: number): Map<number, CellData[]> {
  const index = new Map<number, CellData[]>();

  const getRow = (vehicleId: number): CellData[] => {
    let row = index.get(vehicleId);
    if (!row) {
      row = Array.from({ length: days }, () => ({ all: [], bars: [] }));
      index.set(vehicleId, row);
    }
    return row;
  };

  for (const booking of bookings) {
    const startOffset = differenceInCalendarDays(parseISO(booking.departureDate), viewStart);
    const endOffset = differenceInCalendarDays(parseISO(booking.returnDate), viewStart);
    if (!Number.isFinite(startOffset) || !Number.isFinite(endOffset)) continue; // malformed dates

    // Clip to the visible window. A booking that started before the view renders
    // its bar on the first visible day (same behaviour as before).
    const firstIdx = Math.max(0, startOffset);
    const lastIdx = Math.min(days - 1, endOffset);
    if (firstIdx > lastIdx) continue; // not visible in this range

    // As before, a booking shows on its assigned vehicle row AND on the row of the
    // vehicle originally requested, when those differ.
    const rowIds = booking.assignedVehicleId && booking.assignedVehicleId !== booking.vehicleId
      ? [booking.assignedVehicleId, booking.vehicleId]
      : [booking.assignedVehicleId || booking.vehicleId];

    for (const vehicleId of rowIds) {
      if (!vehicleId) continue;
      const row = getRow(vehicleId);
      for (let i = firstIdx; i <= lastIdx; i++) row[i].all.push(booking);
      row[firstIdx].bars.push({ booking, span: lastIdx - firstIdx + 1 });
    }
  }

  return index;
}

// Status color mapping
// new = purple, pending = orange, active = green, completed = blue, cancelled = red
function getStatusColor(status: AdminBooking['status']): string {
  switch (status) {
    case 'new':
      return 'bg-purple-500';
    case 'pending':
      return 'bg-orange-500';
    case 'active':
      return 'bg-green-500';
    case 'completed':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-red-500';
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

// Status options for quick change menu
const statusOptions: { value: BookingStatus; label: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
  { value: 'new', label: 'Nouveau', color: 'text-purple-600', bgColor: 'bg-purple-500', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'pending', label: 'En attente', color: 'text-orange-600', bgColor: 'bg-orange-500', icon: <Clock className="w-4 h-4" /> },
  { value: 'active', label: 'En cours', color: 'text-green-600', bgColor: 'bg-green-500', icon: <Car className="w-4 h-4" /> },
  { value: 'completed', label: 'Terminée', color: 'text-blue-600', bgColor: 'bg-blue-500', icon: <Check className="w-4 h-4" /> },
  { value: 'cancelled', label: 'Annulée', color: 'text-red-600', bgColor: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
];

// ============================================
// ROW (memoized: only re-renders when its own inputs change, so a drag-over on
// one cell no longer re-renders the whole grid)
// ============================================

interface GanttRowProps {
  vehicle: AdminVehicle;
  dates: Date[];
  dateStrs: string[];
  cells: CellData[];
  cellWidth: number;
  isSelecting: boolean;
  canDrag: boolean;
  draggedBookingId: string | null;
  isDragSourceRow: boolean;
  dropTargetIndex: number | null;
  statusMenuBookingId: string | null;
  onCellClick: (date: string, vehicleId: number) => void;
  onBookingClick: (bookingId: string) => void;
  onVehicleRowClick: (vehicleId: number) => void;
  onBookingContextMenu: (e: React.MouseEvent, booking: AdminBooking) => void;
  onDragStart: (e: React.DragEvent, booking: AdminBooking) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, dateIndex: number, vehicleId: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, dateStr: string, vehicleId: number) => void;
}

const GanttRow = memo(function GanttRow({
  vehicle,
  dates,
  dateStrs,
  cells,
  cellWidth,
  isSelecting,
  canDrag,
  draggedBookingId,
  isDragSourceRow,
  dropTargetIndex,
  statusMenuBookingId,
  onCellClick,
  onBookingClick,
  onVehicleRowClick,
  onBookingContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: GanttRowProps) {
  const isInMaintenance = vehicle.status === 'maintenance';

  return (
    <tr>
      {/* Vehicle Cell - Sticky (ID only, compact V1 design) */}
      <td
        className={`sticky left-0 z-10 border-b border-r border-gray-300 p-0
          ${getVehicleStatusBg(vehicle.status)}
          ${isSelecting ? 'cursor-pointer hover:bg-blue-50' : ''}`}
        onClick={() => isSelecting && onVehicleRowClick(vehicle.id)}
        style={{ width: VEHICLE_COLUMN_WIDTH, minWidth: VEHICLE_COLUMN_WIDTH }}
      >
        <div className="h-12 flex items-center justify-center">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${isInMaintenance ? 'bg-gray-400 text-white' : 'bg-primary text-white'}`}>
            {vehicle.id}
          </span>
        </div>
      </td>

      {/* Date Cells */}
      {dates.map((date, dateIndex) => {
        const cell = cells[dateIndex] ?? EMPTY_CELL;
        const isOddMonth = date.getMonth() % 2 === 1; // Feb, Apr, Jun, Aug, Oct, Dec = gray
        const dateStr = dateStrs[dateIndex];
        const hasBookings = cell.all.length > 0;
        const isDropTarget = dropTargetIndex === dateIndex;

        return (
          <td
            key={dateIndex}
            className={`relative border-b border-r border-gray-100 p-0
              ${isOddMonth ? 'bg-gray-100' : 'bg-white'}
              ${isInMaintenance ? 'bg-gray-200' : ''}
              ${isDropTarget ? 'bg-blue-200 ring-2 ring-blue-400 ring-inset' : ''}`}
            style={{ width: cellWidth, minWidth: cellWidth }}
            onDragOver={(e) => !isInMaintenance && onDragOver(e, dateIndex, vehicle.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => !isInMaintenance && onDrop(e, dateStr, vehicle.id)}
          >
            <div className="h-12 relative overflow-visible">
              {cell.bars.length > 0 ? (
                // Render each booking whose bar starts in this cell
                cell.bars.map(({ booking, span }, bookingIndex) => {
                  const count = cell.bars.length;
                  const height = count > 1 ? `${Math.floor(44 / count) - 1}px` : '44px';
                  const top = count > 1 ? `${bookingIndex * (44 / count) + 2}px` : '2px';
                  const isDragging = draggedBookingId === booking.id;
                  const isMenuTarget = statusMenuBookingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      draggable={canDrag}
                      onDragStart={(e) => onDragStart(e, booking)}
                      onDragEnd={onDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(booking.id);
                      }}
                      onContextMenu={(e) => onBookingContextMenu(e, booking)}
                      className={`absolute left-0.5 rounded ${getStatusColor(booking.status)}
                        text-white font-medium px-1.5 overflow-hidden text-[9px]
                        hover:opacity-90 transition-opacity touch-manipulation cursor-grab active:cursor-grabbing
                        ${isMenuTarget ? 'ring-2 ring-white ring-offset-1' : ''}
                        ${isDragging ? 'opacity-50 ring-2 ring-white' : ''}`}
                      style={{
                        width: `${span * cellWidth - 4}px`,
                        height,
                        top,
                        zIndex: isMenuTarget ? 10 : 5 + bookingIndex,
                      }}
                    >
                      <div className="truncate leading-tight">{booking.clientName.split(' ')[0]}</div>
                    </div>
                  );
                })
              ) : !hasBookings && !isInMaintenance && !isSelecting && !draggedBookingId ? (
                <button
                  onClick={() => onCellClick(dateStr, vehicle.id)}
                  className="w-full h-full hover:bg-green-100 transition-colors touch-manipulation"
                />
              ) : null}

              {/* Drop zone indicator when dragging - only on same vehicle row */}
              {isDragSourceRow && !hasBookings && !isInMaintenance && (
                <div className="absolute inset-0 pointer-events-none">
                  {isDropTarget ? (
                    <div className="w-full h-full bg-blue-300/50 rounded flex items-center justify-center">
                      <span className="text-[8px] text-blue-700 font-medium">Déposer</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-blue-100/30 rounded" />
                  )}
                </div>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
});

// ============================================
// CHART
// ============================================

export function GanttChart({
  vehicles,
  bookings,
  onCellClick,
  onBookingClick,
  onAssignVehicle,
  onStatusChange,
  onBookingMove,
  onDeleteBooking,
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

  // Drag and drop state. The ref mirrors the state so the drag handlers stay
  // referentially stable (they read the ref) while rows still re-render on change.
  const [draggedBooking, setDraggedBooking] = useState<AdminBooking | null>(null);
  const draggedBookingRef = useRef<AdminBooking | null>(null);
  const [dropTarget, setDropTarget] = useState<{ vehicleId: number; dateIndex: number } | null>(null);

  // Status menu state
  const [statusMenuBooking, setStatusMenuBooking] = useState<AdminBooking | null>(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenuBooking(null);
        setStatusMenuPosition(null);
      }
    };

    if (statusMenuBooking) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusMenuBooking]);

  // Handle booking right-click or long-press for status menu
  const handleBookingContextMenu = useCallback((e: React.MouseEvent, booking: AdminBooking) => {
    e.preventDefault();
    e.stopPropagation();
    setStatusMenuBooking(booking);
    setStatusMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle status change from menu
  const handleStatusChange = (newStatus: BookingStatus) => {
    if (statusMenuBooking && onStatusChange) {
      onStatusChange(statusMenuBooking.id, newStatus);
    }
    setStatusMenuBooking(null);
    setStatusMenuPosition(null);
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, booking: AdminBooking) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);
    draggedBookingRef.current = booking;
    setDraggedBooking(booking);
  }, []);

  const clearDrag = useCallback(() => {
    draggedBookingRef.current = null;
    setDraggedBooking(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateIndex: number, vehicleId: number) => {
    // Only allow dropping on the same vehicle row
    const dragged = draggedBookingRef.current;
    if (dragged) {
      const currentVehicleId = dragged.assignedVehicleId || dragged.vehicleId;
      if (vehicleId !== currentVehicleId) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // dragover fires continuously; only update state when the target cell changes
    setDropTarget((prev) =>
      prev && prev.vehicleId === vehicleId && prev.dateIndex === dateIndex ? prev : { vehicleId, dateIndex }
    );
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDate: string, targetVehicleId: number) => {
    e.preventDefault();
    const dragged = draggedBookingRef.current;
    if (!dragged || !onBookingMove) {
      clearDrag();
      return;
    }

    // Only allow dropping on the same vehicle row
    const currentVehicleId = dragged.assignedVehicleId || dragged.vehicleId;
    if (targetVehicleId !== currentVehicleId) {
      clearDrag();
      return;
    }

    // Calculate new dates based on the drop position
    // Use the exact day difference to preserve the booking's original duration
    const originalStart = parseISO(dragged.departureDate);
    const originalEnd = parseISO(dragged.returnDate);
    const daysDiff = Math.round((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));

    const newStart = parseISO(targetDate);
    const newEnd = addDays(newStart, daysDiff);

    onBookingMove(
      dragged.id,
      format(newStart, 'yyyy-MM-dd'),
      format(newEnd, 'yyyy-MM-dd')
    );

    clearDrag();
  }, [onBookingMove, clearDrag]);

  const dates = useMemo(
    () => generateDates(calendarStartDate, calendarViewDays),
    [calendarStartDate, calendarViewDays]
  );

  const dateStrs = useMemo(() => dates.map((d) => format(d, 'yyyy-MM-dd')), [dates]);

  // vehicle → day-index → bookings, rebuilt only when the data or the visible range changes
  const cellIndex = useMemo(
    () => buildCellIndex(bookings, parseISO(calendarStartDate), calendarViewDays),
    [bookings, calendarStartDate, calendarViewDays]
  );
  const emptyRow = useMemo<CellData[]>(
    () => Array.from({ length: calendarViewDays }, () => EMPTY_CELL),
    [calendarViewDays]
  );

  const unassignedBookings = useMemo(
    () => bookings.filter((b) => !b.assignedVehicleId && (b.status === 'new' || b.status === 'pending')),
    [bookings]
  );

  const viewOptions: { value: CalendarViewDays; label: string }[] = [
    { value: 7, label: '7j' },
    { value: 14, label: '14j' },
    { value: 30, label: '30j' },
    { value: 60, label: '60j' },
    { value: 180, label: '6 mois' },
  ];

  const handleVehicleRowClick = useCallback((vehicleId: number) => {
    if (selectedUnassignedBookingId && onAssignVehicle) {
      onAssignVehicle(selectedUnassignedBookingId, vehicleId);
      selectUnassignedBooking(null);
    }
  }, [selectedUnassignedBookingId, onAssignVehicle, selectUnassignedBooking]);

  // Compact cell sizing (V1 design - mobile-first, works on all screens)
  const cellWidth = calendarViewDays <= 7 ? 48 : calendarViewDays <= 14 ? 42 : calendarViewDays <= 30 ? 36 : 28;
  const isSelecting = !!selectedUnassignedBookingId;
  const dragSourceVehicleId = draggedBooking ? (draggedBooking.assignedVehicleId || draggedBooking.vehicleId) : null;
  const today = new Date();

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
      <div className="bg-white border-b border-gray-200 px-2 py-1.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateCalendar('prev')}
            className="p-1.5 hover:bg-gray-100 rounded touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary-hover touch-manipulation"
          >
            Auj.
          </button>
          <button
            onClick={() => navigateCalendar('next')}
            className="p-1.5 hover:bg-gray-100 rounded touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCalendarViewDays(option.value)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all touch-manipulation
                ${calendarViewDays === option.value
                  ? 'bg-white shadow text-primary'
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Grid - Using table layout for proper scroll behavior */}
      <div className="flex-1 overflow-auto min-h-0">
        <table
          className="border-collapse"
          style={{ minWidth: `${VEHICLE_COLUMN_WIDTH + calendarViewDays * cellWidth}px` }}
        >
          <thead>
            <tr>
              {/* Empty corner cell */}
              <th
                className="sticky left-0 top-0 z-30 bg-gray-100 border-b border-r border-gray-300"
                style={{ width: VEHICLE_COLUMN_WIDTH, minWidth: VEHICLE_COLUMN_WIDTH }}
              >
                <div className="h-10" />
              </th>
              {/* Date headers */}
              {dates.map((date, index) => {
                const isToday = isSameDay(date, today);
                const monthIndex = date.getMonth();
                const isOddMonth = monthIndex % 2 === 1; // Feb, Apr, Jun, Aug, Oct, Dec = gray
                const dayOfMonth = date.getDate();
                const isFirstOfMonth = dayOfMonth === 1;
                const isFirstInView = index === 0;
                const showMonth = isFirstOfMonth || isFirstInView;
                return (
                  <th
                    key={index}
                    className={`sticky top-0 z-20 border-b border-r border-gray-200 p-0
                      ${isToday ? 'bg-primary text-white' : isOddMonth ? 'bg-gray-200' : 'bg-gray-100'}`}
                    style={{ width: cellWidth, minWidth: cellWidth }}
                  >
                    <div className="h-10 flex flex-col items-center justify-center">
                      {showMonth ? (
                        <>
                          <div className={`text-[8px] font-medium leading-none uppercase ${isToday ? 'text-white/80' : 'text-primary'}`}>
                            {format(date, 'MMM', { locale: fr })}
                          </div>
                          <div className={`text-sm font-bold leading-none ${isToday ? '' : 'text-gray-900'}`}>
                            {format(date, 'd')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[10px] font-medium leading-none">
                            {format(date, 'EEE', { locale: fr }).slice(0, 2)}
                          </div>
                          <div className={`text-sm font-bold leading-none ${isToday ? '' : 'text-gray-900'}`}>
                            {format(date, 'd')}
                          </div>
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <GanttRow
                key={vehicle.id}
                vehicle={vehicle}
                dates={dates}
                dateStrs={dateStrs}
                cells={cellIndex.get(vehicle.id) ?? emptyRow}
                cellWidth={cellWidth}
                isSelecting={isSelecting}
                canDrag={!!onBookingMove}
                draggedBookingId={draggedBooking?.id ?? null}
                isDragSourceRow={dragSourceVehicleId === vehicle.id}
                dropTargetIndex={dropTarget?.vehicleId === vehicle.id ? dropTarget.dateIndex : null}
                statusMenuBookingId={statusMenuBooking?.id ?? null}
                onCellClick={onCellClick}
                onBookingClick={onBookingClick}
                onVehicleRowClick={handleVehicleRowClick}
                onBookingContextMenu={handleBookingContextMenu}
                onDragStart={handleDragStart}
                onDragEnd={clearDrag}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Change Context Menu */}
      <AnimatePresence>
        {statusMenuBooking && statusMenuPosition && (
          <motion.div
            ref={statusMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[160px]"
            style={{
              left: Math.max(8, Math.min(statusMenuPosition.x, window.innerWidth - 180)),
              top: Math.max(8, Math.min(statusMenuPosition.y, window.innerHeight - 280)),
            }}
          >
            <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
              <p className="text-xs font-medium text-gray-500">Changer le statut</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{statusMenuBooking.clientName}</p>
            </div>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors
                  ${statusMenuBooking.status === option.value ? 'bg-gray-50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full ${option.bgColor} flex items-center justify-center text-white`}>
                  {option.icon}
                </div>
                <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
                {statusMenuBooking.status === option.value && (
                  <Check className="w-4 h-4 ml-auto text-green-500" />
                )}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  onBookingClick(statusMenuBooking.id);
                  setStatusMenuBooking(null);
                  setStatusMenuPosition(null);
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left"
              >
                Voir les détails...
              </button>
              {onDeleteBooking && (
                <button
                  onClick={() => {
                    if (confirm(`Supprimer la réservation et le contact de ${statusMenuBooking.clientName} ?`)) {
                      onDeleteBooking(statusMenuBooking.id);
                    }
                    setStatusMenuBooking(null);
                    setStatusMenuPosition(null);
                  }}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer réservation et contact
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
