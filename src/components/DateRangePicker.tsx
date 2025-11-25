import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
    onRangeSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
    initialFrom?: Date;
    initialTo?: Date;
}

export const DateRangePicker = ({ onRangeSelect, initialFrom, initialTo }: DateRangePickerProps) => {
    const [range, setRange] = useState<DateRange | undefined>(
        initialFrom && initialTo ? { from: initialFrom, to: initialTo } : undefined
    );
    const [isOpen, setIsOpen] = useState(false);
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

    const handleSelect = (selectedRange: DateRange | undefined) => {
        setRange(selectedRange);

        // Auto-close when both dates are selected
        if (selectedRange?.from && selectedRange?.to) {
            onRangeSelect({ from: selectedRange.from, to: selectedRange.to });
            setTimeout(() => setIsOpen(false), 300);
        }
    };

    const formatDisplayDate = (date: Date | undefined) => {
        if (!date) return '';
        return format(date, 'd MMM yyyy', { locale: fr });
    };

    const displayText = range?.from
        ? range.to
            ? `${formatDisplayDate(range.from)} - ${formatDisplayDate(range.to)}`
            : `${formatDisplayDate(range.from)} - Sélectionnez retour`
        : 'Sélectionnez vos dates';

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base bg-white text-left flex items-center gap-2"
            >
                <Calendar size={18} className="text-accent flex-shrink-0" />
                <span className={range?.from ? 'text-secondary' : 'text-gray-400'}>
                    {displayText}
                </span>
            </button>

            {/* Calendar Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[320px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b">
                            <span className="text-sm font-medium text-secondary">
                                {!range?.from
                                    ? 'Sélectionnez la date de départ'
                                    : !range?.to
                                        ? 'Sélectionnez la date de retour'
                                        : 'Dates sélectionnées'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Calendar */}
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={handleSelect}
                            locale={fr}
                            disabled={{ before: today }}
                            numberOfMonths={1}
                            showOutsideDays={false}
                            classNames={{
                                root: 'date-picker-root',
                                months: 'flex flex-col',
                                month: 'space-y-4',
                                caption: 'flex justify-center pt-1 relative items-center',
                                caption_label: 'text-sm font-medium text-secondary',
                                nav: 'space-x-1 flex items-center',
                                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors',
                                nav_button_previous: 'absolute left-1',
                                nav_button_next: 'absolute right-1',
                                table: 'w-full border-collapse space-y-1',
                                head_row: 'flex',
                                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center',
                                row: 'flex w-full mt-2',
                                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
                                day: 'h-9 w-9 p-0 font-normal mx-auto flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors',
                                day_range_start: 'bg-primary text-white hover:bg-primary rounded-full',
                                day_range_end: 'bg-primary text-white hover:bg-primary rounded-full',
                                day_selected: 'bg-primary text-white hover:bg-primary',
                                day_today: 'bg-accent/20 text-accent font-semibold',
                                day_outside: 'text-gray-300 opacity-50',
                                day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
                                day_range_middle: 'bg-primary/10 text-primary rounded-none',
                                day_hidden: 'invisible',
                            }}
                            modifiersClassNames={{
                                range_start: 'rounded-l-full',
                                range_end: 'rounded-r-full',
                                range_middle: 'rounded-none',
                            }}
                        />

                        {/* Selected Range Display */}
                        {range?.from && range?.to && (
                            <div className="mt-3 pt-3 border-t text-center">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-primary">
                                        {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))} jours
                                    </span>
                                    {' '}de location
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
