import React, { useState } from 'react';
import { Database, CheckCircle2, XCircle, AlertCircle, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { Appliance } from '../types';

interface VerificationRequest {
    id: string;
    brand: string;
    model: string;
    category: string;
    aiExtractedData: any;
    status: 'Pending' | 'Verified' | 'Rejected';
    requestDate: string;
}

const MOCK_REQUESTS: VerificationRequest[] = [
    {
        id: 'req-1',
        brand: 'Samsung',
        model: 'AR18CY5AMWK',
        category: 'AC / HVAC',
        aiExtractedData: {
            warrantyDuration: '12 Months',
            compressorWarranty: '10 Years',
            inverterTechnology: 'Yes',
            energyRating: '5 Star'
        },
        status: 'Pending',
        requestDate: '2026-08-10'
    },
    {
        id: 'req-2',
        brand: 'LG',
        model: 'GL-B201RPZD',
        category: 'Refrigerator',
        aiExtractedData: {
            warrantyDuration: '12 Months',
            compressorWarranty: '10 Years',
            capacity: '190L'
        },
        status: 'Pending',
        requestDate: '2026-08-11'
    }
];

export const AdminPanel: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>(MOCK_REQUESTS);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-2">
                <Database className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-extrabold text-slate-900 brand-font">Appliance Knowledge Base</h1>
                <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Admin Mode
                </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-sm font-bold text-blue-900">Verification Queue</h3>
                    <p className="text-xs text-blue-700">
                        Review AI-fetched technical specifications and warranty terms before committing to the global knowledge base.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Pending Verification
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full">
                        {requests.filter(r => r.status === 'Pending').length}
                    </span>
                </h2>

                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">{req.category}</div>
                                    <h3 className="text-sm font-extrabold text-slate-900">{req.brand} {req.model}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-medium uppercase">Requested</div>
                                    <div className="text-xs font-bold text-slate-700">{req.requestDate}</div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">AI Fetched Specifications</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(req.aiExtractedData).map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <div className="text-[9px] text-slate-400 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</div>
                                                <div className="text-xs font-bold text-slate-800">{String(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setRequests(prev => prev.filter(r => r.id !== req.id))}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRequests(prev => prev.filter(r => r.id !== req.id))}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-500">All caught up!</p>
                            <p className="text-xs text-slate-400">No pending verification requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
