import { motion } from 'framer-motion';
import { Calendar, List, Car } from 'lucide-react';
import type { AdminTab } from '../../types/admin';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'calendar', label: 'Calendrier', icon: <Calendar className="w-5 h-5" /> },
  { id: 'reservations', label: 'Réservations', icon: <List className="w-5 h-5" /> },
  { id: 'vehicles', label: 'Véhicules', icon: <Car className="w-5 h-5" /> },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <>
      {/* Desktop Tabs (Top) */}
      <div className="hidden md:flex bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-3 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors touch-manipulation
                ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                  style={{ width: '33.33%', left: `${tabs.findIndex((t) => t.id === tab.id) * 33.33}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
