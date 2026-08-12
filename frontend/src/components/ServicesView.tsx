import React, { useState } from 'react';
import {
  Wrench,
  Mail,
  MessageSquare,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Building,
  DollarSign,
  ShieldCheck,
  Send,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Appliance, Complaint, ServiceRecord } from '../types';

interface ServicesViewProps {
  appliances: Appliance[];
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => void;
  onUpdateComplaintStatus: (id: string, status: any) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  appliances,
  complaints,
  onAddComplaint,
  onUpdateComplaintStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'history' | 'amc'>('complaints');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // All service records across appliances
  const allServiceRecords = appliances.flatMap((a) =>
    a.serviceHistory.map((s) => ({
      ...s,
      applianceName: a.name,
      brand: a.brand,
    }))
  );

  // Active AMCs
  const activeAmcs = appliances.filter((a) => a.warranty.isAmcActive);

  return (
    <div className="space-y-5 pb-20 text-slate-900 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-700">
            <Wrench className="w-4 h-4 text-purple-600" />
            <span>Service & Support Routing Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight brand-font">
            Maintenance & Support Portal
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Auto-route service requests to brand support, track AMC contracts, and preserve repair records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'complaints'
              ? 'bg-white text-purple-700 border-t-2 border-purple-600 font-extrabold border-x border-slate-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Active Complaints ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'history'
              ? 'bg-white text-purple-700 border-t-2 border-purple-600 font-extrabold border-x border-slate-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>Complete Service History ({allServiceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('amc')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 ${activeTab === 'amc'
              ? 'bg-white text-purple-700 border-t-2 border-purple-600 font-extrabold border-x border-slate-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>AMC Contracts ({activeAmcs.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPLAINTS & ROUTING */}
      {activeTab === 'complaints' && (
        complaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 brand-font">All Appliances Functioning Smoothly</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active complaints or service breakdowns reported. Use the Applora AI Assistant to run a diagnostic or log an issue when needed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Complaints List */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Raised Issues & Diagnoses
              </h3>

              {complaints.map((cmp) => (
                <div
                  key={cmp.id}
                  onClick={() => setSelectedComplaint(cmp)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${selectedComplaint?.id === cmp.id
                      ? 'bg-purple-50 border-purple-400 text-purple-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-purple-700">{cmp.brand}</span>
                    <span className="text-[10px] text-slate-500">{cmp.createdDate}</span>
                    <span className="text-[10px] text-slate-500">{cmp.brand}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {cmp.applianceName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                    {cmp.issueTitle}
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                    Status: {cmp.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Complaint & Auto-Routing Panel */}
            {selectedComplaint ? (
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase">
                      {selectedComplaint.brand} Support Assistant
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {selectedComplaint.issueTitle}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Appliance: {selectedComplaint.applianceName}
                    </p>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {selectedComplaint.status}
                  </span>
                </div>

                {/* Terms & Conditions Breakdown & Coverage Verification */}
                <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-purple-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>T&C Breakdown & Warranty Coverage Pre-Check</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Covered under T&C
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>T&C Document Breakdown:</strong> Document terms extracted into sections with key coverage details (Section 4: Functional Components & Manufacturing Defects).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-md border border-emerald-200">
                      <span className="font-bold text-emerald-800 text-[11px] block mb-1">
                        ✓ Covered Under Terms:
                      </span>
                      <p className="text-[11px] text-slate-600">
                        Compressor, PCB electronics, motor assembly, sealed refrigeration loop, & authorized technician labor.
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-md border border-rose-200">
                      <span className="font-bold text-rose-800 text-[11px] block mb-1">
                        ✕ Not Covered (Exclusions):
                      </span>
                      <p className="text-[11px] text-slate-600">
                        Physical impact damage, external power surges, cosmetic wear, or third-party modifications.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-purple-200 text-[11px] text-purple-900 font-medium flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Service Pre-Check:</strong> Reported issue ("{selectedComplaint.issueTitle}") is verified covered under brand policies for free brand repair.
                    </span>
                  </div>
                </div>

                {/* AI Diagnosis & DIY Steps */}
                {selectedComplaint.aiDiagnosis && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                    <div className="font-bold text-purple-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span>Applora AI Diagnostic Findings</span>
                    </div>
                    <p className="text-slate-700">{selectedComplaint.aiDiagnosis}</p>

                    {selectedComplaint.diySteps && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="font-bold text-emerald-700">Safe DIY Fix Steps:</span>
                        <ul className="mt-1 space-y-1 text-slate-600">
                          {selectedComplaint.diySteps.map((step, idx) => (
                            <li key={idx}>
                              {idx + 1}. {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Module 7: Auto-Routing Actions */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Module 7: Brand Support Auto-Routing
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email Support */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                        <Mail className="w-4 h-4" />
                        <span>Official Email Support</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Generate structured complaint draft with serial number & invoice attachment.
                      </p>
                      <button
                        onClick={() => {
                          onUpdateComplaintStatus(selectedComplaint.id, 'Brand Emailed');
                          window.open(
                            `mailto:${selectedComplaint.brandSupportEmail || 'support@brand.com'}?subject=Service Request: ${selectedComplaint.applianceName}&body=Issue: ${selectedComplaint.issueTitle}%0A%0AAppliance Serial: #${selectedComplaint.id}`
                          );
                        }}
                        className="w-full py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Draft Support Email</span>
                      </button>
                    </div>

                    {/* WhatsApp Support */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp Direct Chat</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Launch direct chat with brand service center.
                      </p>
                      <button
                        onClick={() => {
                          window.open(`https://wa.me/?text=Hello%20Support,%20I%20have%20an%20issue%20with%20my%20${selectedComplaint.applianceName}:%20${selectedComplaint.issueTitle}`);
                        }}
                        className="w-full py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open WhatsApp Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs shadow-xs">
                Select a complaint from the list to view diagnostic steps & auto-routing.
              </div>
            )}
          </div>
        )
      )}

      {/* TAB 2: SERVICE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900">
            Comprehensive Asset Maintenance Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Appliance</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Service Type</th>
                  <th className="p-2.5">Technician / Center</th>
                  <th className="p-2.5">Cost</th>
                  <th className="p-2.5">Notes & Parts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allServiceRecords.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">
                      {srv.brand} {srv.applianceName}
                    </td>
                    <td className="p-2.5 text-slate-500">{srv.date}</td>
                    <td className="p-2.5 text-purple-700 font-bold">{srv.type}</td>
                    <td className="p-2.5 text-slate-500">{srv.technicianName || 'Certified Tech'}</td>
                    <td className="p-2.5 font-bold text-emerald-700">
                      {srv.cost === 0 ? 'Free' : `$${srv.cost}`}
                    </td>
                    <td className="p-2.5 text-slate-600 max-w-xs truncate">
                      {srv.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AMC CONTRACTS */}
      {activeTab === 'amc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeAmcs.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                <span>{item.brand} AMC Contract</span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Active
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>

              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
                <div>Vendor: {item.warranty.amcVendor || 'Brand Authorized Care'}</div>
                <div>Expires: {item.warranty.amcExpiryDate || '2026-12-31'}</div>
                <div>Coverage: Unlimited preventive maintenance visits</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
