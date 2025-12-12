import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroDatePickerProps {
    onConfirm: (from: Date, to: Date) => void;
    initialFrom?: string;
    initialTo?: string;
}

const DAYS = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

export const HeroDatePicker = ({ onConfirm, initialFrom, initialTo }: HeroDatePickerProps) => {
    const [startDate, setStartDate] = useState<Date | null>(initialFrom ? new Date(initialFrom) : null);
    const [endDate, setEndDate] = useState<Date | null>(initialTo ? new Date(initialTo) : null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayClick = (day: Date) => {
        if (isBefore(day, today)) return;

        if (!startDate || (startDate && endDate)) {
            // Start new selection
            setStartDate(day);
            setEndDate(null);
        } else {
            // Complete the selection
            if (isBefore(day, startDate)) {
                setEndDate(startDate);
                setStartDate(day);
            } else {
                setEndDate(day);
            }
        }
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            onConfirm(startDate, endDate);
            setIsOpen(false);
        }
    };

    const isInRange = (day: Date) => {
        if (!startDate) return false;

        const end = endDate || hoverDate;
        if (!end) return false;

        const rangeStart = isBefore(startDate, end) ? startDate : end;
        const rangeEnd = isAfter(startDate, end) ? startDate : end;

        return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
    };

    const isRangeStart = (day: Date) => startDate && isSameDay(day, startDate);
    const isRangeEnd = (day: Date) => endDate && isSameDay(day, endDate);

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return '--/--/----';
        return format(date, 'dd/MM/yyyy');
    };

    const renderMonth = (monthDate: Date, index: number) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Get the day of week for the first day (0 = Sunday)
        const startDayOfWeek = monthStart.getDay();

        // Create empty slots for days before the month starts
        const emptySlots = Array(startDayOfWeek).fill(null);

        return (
            <div key={index} className="flex-1 min-w-[280px]">
                {/* Month Header */}
                <div className="text-center mb-4">
                    <h3 className="text-base font-semibold text-secondary capitalize">
                        {format(monthDate, 'MMMM yyyy', { locale: fr })}
                    </h3>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1">
                    {emptySlots.map((_, i) => (
                        <div key={`empty-${i}`} className="h-10" />
                    ))}
                    {days.map((day) => {
                        const isDisabled = isBefore(day, today);
                        const isStart = isRangeStart(day);
                        const isEnd = isRangeEnd(day);
                        const inRange = isInRange(day);
                        const isToday = isSameDay(day, today);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`relative h-10 flex items-center justify-center ${
                                    inRange && !isStart && !isEnd ? 'bg-green-100' : ''
                                } ${isStart ? 'rounded-l-full bg-green-100' : ''} ${
                                    isEnd ? 'rounded-r-full bg-green-100' : ''
                                }`}
                            >
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => handleDayClick(day)}
                                    onMouseEnter={() => !endDate && startDate && setHoverDate(day)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                        ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-green-200'}
                                        ${isStart || isEnd ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                                        ${inRange && !isStart && !isEnd ? 'text-green-800' : ''}
                                        ${!inRange && !isStart && !isEnd && !isDisabled ? 'text-gray-700' : ''}
                                        ${isToday && !isStart && !isEnd ? 'ring-2 ring-accent ring-inset' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const months = [currentMonth, addMonths(currentMonth, 1)];

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Date Input Fields */}
            <div className="grid grid-cols-2 gap-4">
                {/* Pickup Date */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                        <Calendar size={16} className="text-accent" />
                        Date de départ
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-2
                            ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}
                            ${startDate ? 'text-secondary font-medium' : 'text-gray-400'}
                        `}
                    >
                        <Calendar size={18} className="text-green-500" />
                        {formatDisplayDate(startDate)}
                    </button>
                </div>

                {/* Return Date */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-secondary flex items-center gap-2">
                        <Calendar size={16} className="text-accent" />
                        Date de retour
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-2
                            ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}
                            ${endDate ? 'text-secondary font-medium' : 'text-gray-400'}
                        `}
                    >
                        <Calendar size={18} className="text-green-500" />
                        {formatDisplayDate(endDate)}
                    </button>
                </div>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-6">
                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            disabled={isSameMonth(currentMonth, today)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span className="text-sm text-gray-500">
                            {!startDate
                                ? 'Sélectionnez la date de départ'
                                : !endDate
                                    ? 'Sélectionnez la date de retour'
                                    : `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} jours`
                            }
                        </span>

                        <button
                            type="button"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 overflow-x-auto">
                        {months.map((month, index) => renderMonth(month, index))}
                    </div>

                    {/* Footer with OK Button */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {startDate && (
                                <span>
                                    <span className="font-medium">{format(startDate, 'dd MMM', { locale: fr })}</span>
                                    {endDate && (
                                        <>
                                            <span className="mx-2">→</span>
                                            <span className="font-medium">{format(endDate, 'dd MMM', { locale: fr })}</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!startDate || !endDate}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
