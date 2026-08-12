import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  Building,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Appliance, Complaint, HomeProperty } from '../types';

interface DashboardViewProps {
  currentHome: HomeProperty | null;
  homes: HomeProperty[];
  onSelectHome: (home: HomeProperty) => void;
  onAddHome: () => void;
  appliances: Appliance[];
  complaints: Complaint[];
  healthScore: number;
  onSelectAppliance: (appliance: Appliance) => void;
  onOpenManualAdd: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenHealthModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentHome,
  homes,
  onSelectHome,
  onAddHome,
  appliances,
  onSelectAppliance,
  onOpenManualAdd,
}) => {
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('All');

  if (!currentHome) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Building className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Welcome to AppLora!</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          You don't have any home properties added yet. Add your primary residence or apartment to start managing your appliances and warranties.
        </p>
        <button
          onClick={onAddHome}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Home</span>
        </button>
      </div>
    );
  }

  // Filter appliances for current home
  const homeAppliances = appliances.filter((a) => a.homeId === currentHome.id);

  const activeWarranties = homeAppliances.filter(
    (a) => a.warranty?.coverageType !== 'Expired'
  ).length;

  const expiringSoonCount = homeAppliances.filter(
    (a) => a.status === 'Warranty Expiring' || (a.warranty?.durationMonths && a.warranty.durationMonths <= 12)
  ).length;

  // Room list extracted from appliances or current home
  const roomsList = ['All', ...Array.from(new Set([...(currentHome.rooms || []), ...homeAppliances.map((a) => a.room)]))];

  const filteredAppliances = selectedRoom === 'All'
    ? homeAppliances
    : homeAppliances.filter((a) => a.room === selectedRoom);

  return (
    <div className="space-y-4 pb-20 text-slate-900">
      {/* Sticky Top Property Switcher Bar & Add Appliance Option */}
      <div className="sticky top-[52px] z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Select Property Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 text-xs font-bold text-purple-900 transition-all text-left"
          >
            <Building className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900">{currentHome.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 font-normal truncate max-w-[180px] sm:max-w-[260px]">
                {currentHome.address}
              </p>
            </div>
          </button>

          {showPropertyDropdown && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Home Property
              </div>
              {homes.map((home) => (
                <button
                  key={home.id}
                  onClick={() => {
                    onSelectHome(home);
                    setShowPropertyDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${home.id === currentHome.id
                      ? 'bg-purple-50 text-purple-900 font-semibold border border-purple-200'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className="truncate">
                    <div className="font-bold">{home.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {home.address}
                    </div>
                  </div>
                  {home.id === currentHome.id && (
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                <button
                  onClick={() => {
                    onAddHome();
                    setShowPropertyDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 transition-colors text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Property</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Appliance Button */}
        <button
          onClick={onOpenManualAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appliance</span>
        </button>
      </div>

      {/* Single Unified Summary Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 sm:gap-4 divide-x divide-slate-100">
        <div className="flex-1 text-center sm:text-left pr-1 sm:pr-2">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Appliances
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 brand-font">
            {homeAppliances.length}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left px-2 sm:px-4">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Active Warranties
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 brand-font">
            {activeWarranties} <span className="text-xs font-normal text-slate-400">/ {homeAppliances.length}</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left pl-2 sm:pl-4">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Expiring Soon
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700 brand-font">
            {expiringSoonCount}
          </div>
        </div>
      </div>

      {/* Digital Appliance Locker */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight brand-font">
              {currentHome.name} Appliances
            </h2>
            <p className="text-xs text-slate-500">
              Select an appliance to view warranty terms, invoice documents, and service logs.
            </p>
          </div>

          {/* Room Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {roomsList.map((roomName) => (
              <button
                key={roomName}
                onClick={() => setSelectedRoom(roomName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedRoom === roomName
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
              >
                {roomName}
              </button>
            ))}
          </div>
        </div>

        {/* Appliance Cards Grid */}
        {filteredAppliances.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 brand-font">
                No Appliances Found in {selectedRoom}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add an appliance manually to start managing warranty terms and digital documents.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenManualAdd}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Appliance</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAppliances.map((item) => {
              const isWarrantyActive = item.warranty.coverageType !== 'Expired';
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAppliance(item)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-purple-500 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {item.room}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isWarrantyActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                      >
                        Warranty: {isWarrantyActive ? 'Active' : 'Expired'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-purple-700">
                      {item.brand}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 my-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">
                      Model: {item.modelNumber}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Purchased: {item.purchaseDate}</span>
                    </div>
                    <span className="text-xs font-bold text-purple-700 group-hover:underline flex items-center gap-0.5">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
