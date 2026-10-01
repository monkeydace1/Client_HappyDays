import React from 'react';
import { Info } from 'lucide-react';
import { LOCATION_FEE_NOTICE } from '../../types';

interface LocationFeeNoticeProps {
    compact?: boolean;
}

/**
 * Shown as soon as the client picks "Autre (préciser)" for the pickup or the return:
 * the delivery fee is not priced online, the team confirms it before the rental.
 */
export const LocationFeeNotice: React.FC<LocationFeeNoticeProps> = ({ compact = false }) => (
    <div
        className={`flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'
        }`}
    >
        <Info size={compact ? 14 : 16} className="flex-shrink-0 mt-0.5" />
        <span>{LOCATION_FEE_NOTICE}</span>
    </div>
);
