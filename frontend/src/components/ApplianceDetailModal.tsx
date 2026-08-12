import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  Wrench,
  FileText,
  Sparkles,
  QrCode,
  DollarSign,
  Share2,
  Tag,
  AlertCircle,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  Upload,
  Zap,
  TrendingUp,
  Download,
  Check,
} from 'lucide-react';
import { Appliance, ApplianceDocument, ServiceRecord } from '../types';
import { explainWarrantyApi, getRepairAdviceApi } from '../services/api';

interface ApplianceDetailModalProps {
  appliance: Appliance;
  onClose: () => void;
  onAddServiceLog: (applianceId: string, log: Omit<ServiceRecord, 'id' | 'applianceId'>) => void;
  onAddDocument: (applianceId: string, doc: Omit<ApplianceDocument, 'id'>) => void;
  onRaiseComplaint: (appliance: Appliance) => void;
  onTransferOwnership: (appliance: Appliance) => void;
  onListMarketplace: (appliance: Appliance) => void;
}

export const ApplianceDetailModal: React.FC<ApplianceDetailModalProps> = ({
  appliance,
  onClose,
  onAddServiceLog,
  onAddDocument,
  onRaiseComplaint,
  onTransferOwnership,
  onListMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'warranty' | 'history' | 'documents' | 'advisor'>('overview');

  // AI Warranty Explanation state
  const [isExplainingWarranty, setIsExplainingWarranty] = useState(false);
  const [warrantyExplanation, setWarrantyExplanation] = useState<any>(null);

  // AI Repair Advisor state
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [repairEstimateInput, setRepairEstimateInput] = useState<number>(0);
  const [faultDescriptionInput, setFaultDescriptionInput] = useState<string>('');

  // Add Service Form state
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newServiceType, setNewServiceType] = useState<any>('Preventive Maintenance');
  const [newTechnician, setNewTechnician] = useState('');
  const [newServiceCost, setNewServiceCost] = useState(0);
  const [newServiceNotes, setNewServiceNotes] = useState('');
  const [newSpareParts, setNewSpareParts] = useState('');

  // Add Document Form state
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<any>('Invoice');

  // Calculate age
  const purchaseYear = new Date(appliance.purchaseDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0.5, currentYear - purchaseYear);

  const handleRunWarrantyExplain = async () => {
    setIsExplainingWarranty(true);
    const res = await explainWarrantyApi({
      applianceName: appliance.name,
      brand: appliance.brand,
      modelNumber: appliance.modelNumber,
      warrantyTerms: appliance.warranty.summaryTerms,
      purchaseDate: appliance.purchaseDate,
    });
    setIsExplainingWarranty(false);
    if (res.success && res.data) {
      setWarrantyExplanation(res.data);
    }
  };

  const handleRunRepairAdvisor = async () => {
    setIsAdvisorLoading(true);
    const res = await getRepairAdviceApi({
      applianceName: appliance.name,
      brand: appliance.brand,
      ageYears,
      originalCost: appliance.purchasePrice,
      estimatedRepairCost: repairEstimateInput,
      faultDescription: faultDescriptionInput,
    });
    setIsAdvisorLoading(false);
    if (res.success && res.data) {
      setAdvisorData(res.data);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechnician || !newServiceNotes) {
      console.error('Technician name and notes are required');
      return;
    }
    onAddServiceLog(appliance.id, {
      date: new Date().toISOString().split('T')[0],
      type: newServiceType,
      technicianName: newTechnician,
      cost: Number(newServiceCost),
      notes: newServiceNotes,
      spareParts: newSpareParts ? newSpareParts.split(',').map((s) => s.trim()) : [],
    });
    setShowAddServiceForm(false);
    setNewTechnician('');
    setNewServiceNotes('');
    setNewSpareParts('');
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;
    onAddDocument(appliance.id, {
      title: newDocTitle,
      type: newDocType,
      uploadDate: new Date().toISOString().split('T')[0],
      fileUrl: '#',
    });
    setShowAddDocForm(false);
    setNewDocTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Verified Digital Record
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-300">
                  #{appliance.serialNumber}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                {appliance.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 pt-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'overview'
                ? 'bg-white text-purple-600 border-t-2 border-purple-600 font-bold border-x border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>Overview & Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-3.5 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'warranty'
                ? 'bg-white text-purple-600 border-t-2 border-purple-600 font-bold border-x border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Warranty Terms</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'history'
                ? 'bg-white text-purple-600 border-t-2 border-purple-600 font-bold border-x border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Service Timeline ({appliance.serviceHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'documents'
                ? 'bg-white text-purple-600 border-t-2 border-purple-600 font-bold border-x border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Locker ({appliance.documents.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs sm:text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Digital Identity */}
                <div className="space-y-3">
                  <div className="rounded-xl p-4 bg-purple-50/60 border border-purple-200 space-y-2">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase">
                      {appliance.room}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {appliance.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Category: {appliance.category}
                    </p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-500 text-[11px]">Brand & Model</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {appliance.brand}
                      </div>
                      <div className="text-xs text-purple-700 font-mono">
                        {appliance.modelNumber}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-500 text-[11px]">Purchase Date</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {appliance.purchaseDate}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ageYears.toFixed(1)} years old
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-500 text-[11px]">Purchase Price</div>
                      <div className="font-bold text-purple-600 text-sm mt-0.5">
                        ${appliance.purchasePrice}
                      </div>
                      <div className="text-xs text-slate-500">Tracked Value</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-500 text-[11px]">Dealer / Vendor</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                        {appliance.dealerName}
                      </div>
                    </div>

                    {appliance.installationDate && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="text-slate-500 text-[11px]">Installation Date</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {appliance.installationDate}
                        </div>
                      </div>
                    )}

                    {appliance.powerRatingKw && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="text-slate-500 text-[11px]">Power Rating</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {appliance.powerRatingKw} kW
                        </div>
                      </div>
                    )}
                  </div>

                  {appliance.notes && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Appliance Notes & Location
                      </div>
                      <p className="text-xs text-slate-700">
                        {appliance.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI WARRANTY INTELLIGENCE */}
          {activeTab === 'warranty' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                      Current Warranty Status
                    </span>
                    <h3 className="text-base font-bold text-slate-900 my-0.5">
                      {appliance.warranty.summaryTerms}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Coverage Started: {appliance.warranty.startDate} • Duration:{' '}
                      {appliance.warranty.durationMonths} Months
                    </p>
                  </div>

                  <button
                    onClick={handleRunWarrantyExplain}
                    disabled={isExplainingWarranty}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs shrink-0 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isExplainingWarranty
                        ? 'AI Parsing...'
                        : 'Explain Warranty in Plain Language'}
                    </span>
                  </button>
                </div>
              </div>

              {/* AI Explanation Output */}
              {warrantyExplanation && (
                <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Applora AI Warranty Breakdown</span>
                  </div>

                  <p className="text-xs text-slate-800 italic">
                    "{warrantyExplanation.warrantyStatusText || 'Simplified for clarity.'}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-white border border-emerald-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Covered Parts & Services</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {warrantyExplanation.coveredParts?.map((pt: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-rose-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Excluded (Not Covered)</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {warrantyExplanation.excludedParts?.map((pt: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {warrantyExplanation.actionTip && (
                    <div className="text-xs text-purple-800 bg-white p-2.5 rounded-lg border border-purple-200 font-medium">
                      💡 <strong>Pro Tip:</strong> {warrantyExplanation.actionTip}
                    </div>
                  )}
                </div>
              )}

              {/* Standard Covered vs Excluded list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <h4 className="text-xs font-bold text-emerald-800 mb-2">
                    ✓ Registered Covered Parts
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {appliance.warranty.coveredParts?.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    )) || <li>• Motor & Sealed System</li>}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <h4 className="text-xs font-bold text-slate-600 mb-2">
                    ✕ Exclusions
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {appliance.warranty.excludedParts?.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    )) || <li>• Physical damage, labor after year 1</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Appliance Lifecycle & Service History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permanent RC book timeline recording every repair, maintenance, and part change.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Service</span>
                </button>
              </div>

              {/* Add Service Form */}
              {showAddServiceForm && (
                <form
                  onSubmit={handleSaveService}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3"
                >
                  <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    Add Service / Repair Log
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">
                        Service Type
                      </label>
                      <select
                        value={newServiceType}
                        onChange={(e) => setNewServiceType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="Preventive Maintenance">Preventive Maintenance</option>
                        <option value="Repair">Repair</option>
                        <option value="Gas Refill">Gas Refill</option>
                        <option value="Filter Replacement">Filter Replacement</option>
                        <option value="Parts Replacement">Parts Replacement</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">
                        Technician Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex (Brand Authorized)"
                        value={newTechnician}
                        onChange={(e) => setNewTechnician(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        value={newServiceCost}
                        onChange={(e) => setNewServiceCost(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">
                      Replaced Parts (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Capacitor 45uF, Valve Seal"
                      value={newSpareParts}
                      onChange={(e) => setNewSpareParts(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe work done..."
                      value={newServiceNotes}
                      onChange={(e) => setNewServiceNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddServiceForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-xs"
                    >
                      Save to Timeline
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline List */}
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pl-5 py-1">
                {appliance.serviceHistory.map((srv) => (
                  <div key={srv.id} className="relative group">
                    <div className="absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-xs" />
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-purple-700">{srv.type}</span>
                        <span className="text-slate-500">{srv.date}</span>
                      </div>

                      <p className="text-xs text-slate-700">{srv.notes}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                        <span>Tech: {srv.technicianName || 'Certified Tech'}</span>
                        <span className="font-bold text-emerald-700">
                          {srv.cost === 0 ? 'Free Service' : `$${srv.cost}`}
                        </span>
                      </div>

                      {srv.spareParts && srv.spareParts.length > 0 && (
                        <div className="mt-2 text-[10px] bg-white px-2 py-1 rounded text-purple-700 border border-slate-200 font-medium">
                          Parts Replaced: {srv.spareParts.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Digital Document Vault</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Store tax bills, warranty cards, manuals, and repair receipts permanently.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddDocForm(!showAddDocForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Doc</span>
                </button>
              </div>

              {/* Upload Form */}
              {showAddDocForm && (
                <form
                  onSubmit={handleSaveDocument}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3"
                >
                  <h4 className="text-[10px] font-bold text-purple-600 uppercase">
                    Upload New Document
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">
                        Document Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extended AMC Contract PDF"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold">
                        Document Type
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="Invoice">Invoice / Purchase Bill</option>
                        <option value="Warranty Card">Warranty Card</option>
                        <option value="AMC Contract">AMC Contract</option>
                        <option value="Repair Bill">Repair Bill</option>
                        <option value="User Manual">User Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-xs"
                    >
                      Attach Document
                    </button>
                  </div>
                </form>
              )}

              {/* Document Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {appliance.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2 rounded bg-white text-purple-600 border border-slate-200 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {doc.type} • {doc.uploadDate}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Opening ${doc.title}`)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-purple-600 border border-slate-200 text-xs shrink-0"
                      title="View PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRaiseComplaint(appliance)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Raise AI Complaint</span>
            </button>

            <button
              onClick={() => onTransferOwnership(appliance)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Transfer RC</span>
            </button>
          </div>

          <button
            onClick={() => onListMarketplace(appliance)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span>List on Verified Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
