import { useState } from 'react';
import { Search, Users, ChevronRight } from 'lucide-react';
import type { ClientRow } from '../../lib/finance';
import { formatEuro, formatDay, matchesClientSearch } from '../../lib/finance';

interface ClientsTableProps {
  clients: ClientRow[];
  onSelect: (client: ClientRow) => void;
}

export function ClientsTable({ clients, onSelect }: ClientsTableProps) {
  const [search, setSearch] = useState('');
  const filtered = clients.filter((c) => matchesClientSearch(c, search));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" /> Clients
          <span className="text-xs font-normal text-gray-500">({clients.length})</span>
        </h2>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom ou téléphone"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          {clients.length === 0 ? 'Aucun client sur cette période' : 'Aucun client ne correspond'}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left font-medium pb-2">Client</th>
                <th className="text-left font-medium pb-2">Téléphone</th>
                <th className="text-right font-medium pb-2">Réservations</th>
                <th className="text-right font-medium pb-2">Total payé</th>
                <th className="text-left font-medium pb-2 pl-4">Dernière location</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.key}
                  onClick={() => onSelect(c)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer touch-manipulation"
                >
                  <td className="py-2.5 pr-2 font-medium text-gray-900">{c.name}</td>
                  <td className="py-2.5 pr-2 text-gray-700 whitespace-nowrap">{c.phone || '—'}</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-900">
                    {c.periodCount}
                    {c.lifetimeCount > c.periodCount && (
                      <span className="text-xs text-gray-400 ml-1">({c.lifetimeCount} au total)</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-gray-900">
                    {formatEuro(c.periodTotal)}
                    {c.lifetimeTotal > c.periodTotal && (
                      <span className="block text-xs font-normal text-gray-400">
                        {formatEuro(c.lifetimeTotal)} au total
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pl-4 text-gray-700 whitespace-nowrap">{formatDay(c.lastRental)}</td>
                  <td className="py-2.5 text-right text-gray-400">
                    <ChevronRight className="w-4 h-4 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
