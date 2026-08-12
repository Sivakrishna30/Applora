import React, { useState } from 'react';
import { X, Share2, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Appliance } from '../types';

interface OwnershipTransferModalProps {
  appliance: Appliance;
  onClose: () => void;
}

export const OwnershipTransferModal: React.FC<OwnershipTransferModalProps> = ({
  appliance,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const transferCode = `APPLORA-TR-${appliance.serialNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Applora Digital Ownership Transfer Code for ${appliance.brand} ${appliance.name}:\nCode: ${transferCode}\nClaim at: https://applora.com/claim`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-5 space-y-4 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Transfer Ownership (Digital RC Book)
            </h3>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Sell this <strong className="text-slate-900 font-semibold">{appliance.brand} {appliance.name}</strong> along with invoices, warranty details, service history and asset age that were stored in the app directly to the buyer.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Secure Transfer Passcode</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between font-mono text-blue-700 text-xs font-bold">
            <span>{transferCode}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            When the buyer enters this passcode in Applora, the appliance will be instantly moved to their account with 100% intact service logs!
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
