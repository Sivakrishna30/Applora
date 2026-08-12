import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Scan,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  QrCode,
  Tag,
} from 'lucide-react';
import { Appliance, ApplianceCategory, HomeProperty } from '../types';

interface AssetsViewProps {
  currentHome: HomeProperty;
  appliances: Appliance[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectAppliance: (appliance: Appliance) => void;
  onOpenOCR: () => void;
  onOpenManualAdd: () => void;
}

const CATEGORIES: (ApplianceCategory | 'All')[] = [
  'All',
  'AC / HVAC',
  'Refrigerator',
  'Washing Machine',
  'RO / Water Purifier',
  'Water Heater / Geyser',
  'TV & Entertainment',
  'Inverter & Battery',
  'Microwave & Oven',
];

export const AssetsView: React.FC<AssetsViewProps> = ({
  currentHome,
  appliances,
  searchQuery,
  setSearchQuery,
  onSelectAppliance,
  onOpenOCR,
  onOpenManualAdd,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<
    ApplianceCategory | 'All'
  >('All');

  // Filter home appliances
  const homeAppliances = appliances.filter((a) => a.homeId === currentHome.id);

  // Apply room, category, and text search filter
  const filteredAppliances = homeAppliances.filter((a) => {
    const matchesRoom = selectedRoom === 'All' || a.room === selectedRoom;
    const matchesCategory =
      selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.room.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRoom && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-20 text-slate-900">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-700">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Appliance Locker</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight brand-font">
            Digital Home Asset Repository
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified digital ownership cards, serial numbers, warranties, and
            maintenance history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOCR}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Bill (AI OCR)</span>
          </button>
          <button
            onClick={onOpenManualAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedRoom('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedRoom === 'All'
              ? 'bg-purple-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Rooms ({homeAppliances.length})
        </button>

        {currentHome.rooms.map((room) => {
          const count = homeAppliances.filter((a) => a.room === room).length;
          return (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRoom === room
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {room} ({count})
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1 text-[11px]">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Appliances Grid */}
      {filteredAppliances.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center my-6 shadow-xs">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No Appliances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No home appliances match your search or filter criteria. Add your first
            appliance or scan a bill to create its digital identity!
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onOpenOCR}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
            >
              Scan Bill with AI
            </button>
            <button
              onClick={onOpenManualAdd}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAppliances.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAppliance(item)}
              className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-purple-500 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                    {item.room}
                  </div>
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status === 'Healthy'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : item.status === 'Service Due'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : item.status === 'Needs Attention'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-purple-50 text-purple-800 border-purple-300'
                    }`}
                  >
                    {item.status}
                  </div>

                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 border border-slate-300 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    <span>RC Book #{item.serialNumber.slice(-6)}</span>
                  </div>
                </div>

                {/* Brand & Model */}
                <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>{item.brand}</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {item.modelNumber}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 my-1 line-clamp-2 group-hover:text-purple-700 transition-colors">
                  {item.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 my-1.5">
                  {item.warranty.summaryTerms}
                </p>
              </div>

              {/* Bottom Metadata */}
              <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Logs:</span>
                  <span className="font-semibold text-slate-800">
                    {item.serviceHistory.length} Events
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Documents:</span>
                  <span className="font-semibold text-slate-800">
                    {item.documents.length} PDF/Bills
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 font-bold text-purple-600 group-hover:underline">
                  <span>Inspect Digital Identity</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
