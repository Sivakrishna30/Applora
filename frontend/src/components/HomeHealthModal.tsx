import React from 'react';
import { X, Zap, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { Appliance, HomeProperty } from '../types';

interface HomeHealthModalProps {
  currentHome: HomeProperty;
  appliances: Appliance[];
  healthScore: number;
  onClose: () => void;
  onNavigateTab: (tab: 'assets' | 'ai' | 'services') => void;
}

export const HomeHealthModal: React.FC<HomeHealthModalProps> = ({
  currentHome,
  appliances,
  healthScore,
  onClose,
  onNavigateTab,
}) => {
  const homeAppliances = appliances.filter((a) => a.homeId === currentHome.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto p-5 space-y-4 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              AI Home Health Scorecard
            </h3>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Gauge Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {currentHome.name}
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 my-0.5">
              {healthScore}%
            </div>
            <p className="text-xs text-slate-600">
              Overall Asset Health: <strong className="text-slate-900 font-semibold">Optimal Condition</strong>
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div>{homeAppliances.length} Appliances Tracked</div>
            <div className="text-emerald-700 font-semibold">
              {homeAppliances.filter((a) => a.status === 'Healthy').length} Healthy
            </div>
            <div className="text-amber-700 font-semibold">
              {homeAppliances.filter((a) => a.status !== 'Healthy').length} Require Action
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Required Maintenance Actions
          </h4>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Kent RO Filter Change Due</div>
                <div className="text-slate-500 text-[11px]">Sediment & Carbon filter alert</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('ai');
              }}
              className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200 text-[11px] transition-colors"
            >
              Order Filter
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Samsung AC Pre-Summer Washing</div>
                <div className="text-slate-500 text-[11px]">Coil cleaning recommended</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('services');
              }}
              className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200 text-[11px] transition-colors"
            >
              Book Service
            </button>
          </div>
        </div>

        {/* AI Energy Tips */}
        <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-lg space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Energy & Lifespan Optimization Tips</span>
          </div>

          <ul className="space-y-1 text-slate-700">
            <li>• Clean LG Fridge rear coils to lower power draw by up to 10%.</li>
            <li>• Keep AC temperature at 24°C for optimal inverter compressor health.</li>
            <li>• Run monthly IFB washing machine descaling cycle to prevent drum scale.</li>
          </ul>
        </div>

        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
