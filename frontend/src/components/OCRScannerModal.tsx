import React, { useState } from 'react';
import {
  X,
  Scan,
  Upload,
  Sparkles,
  Check,
  FileText,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { OCRScanResult, ApplianceCategory } from '../types';
import { SAMPLE_BILL_PRESETS } from '../data/initialData';
import { scanBillApi } from '../services/api';

interface OCRScannerModalProps {
  onClose: () => void;
  onApplianceScanned: (result: OCRScanResult) => void;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({
  onClose,
  onApplianceScanned,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Editable fields before saving
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [dealerName, setDealerName] = useState('');
  const [category, setCategory] = useState<ApplianceCategory>('AC / HVAC');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [summaryTerms, setSummaryTerms] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Multi-document upload tracking
  const [uploadedDocuments, setUploadedDocuments] = useState<{ name: string, base64: string, mimeType: string }[]>([]);

  // Post-save: ask to add more documents or skip
  const [showAddMorePrompt, setShowAddMorePrompt] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Strip data URL prefix to keep only raw base64 bytes
        const base64 = dataUrl.split(',')[1] || dataUrl;
        setCustomImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple file uploads
  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || dataUrl;
        setUploadedDocuments(prev => [...prev, {
          name: file.name,
          base64,
          mimeType: file.type || 'image/jpeg',
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRunOCR = async () => {
    setIsScanning(true);
    setScanError(null);

    const preset = SAMPLE_BILL_PRESETS[selectedPreset];
    const imageBase64 = customImageBase64 || undefined;
    const textContent = customImageBase64 ? undefined : preset.textContent;

    const response = await scanBillApi({
      imageBase64,
      textContent,
    });

    setIsScanning(false);

    if (response.success && response.data) {
      const data = response.data;
      setScanResult(data);
      setBrand(data.brand);
      setModelNumber(data.modelNumber);
      setSerialNumber(data.serialNumber);
      setPurchaseDate(data.purchaseDate);
      setPurchasePrice(data.purchasePrice);
      setDealerName(data.dealerName);
      setCategory(data.category);
      setWarrantyMonths(data.warrantyDurationMonths);
      setSummaryTerms(data.summaryTerms);
      setInvoiceNumber((data as any).invoiceNumber);
    } else {
      setScanError(response.error || 'Failed to parse invoice using AI');
    }
  };

  const handleSaveToLocker = () => {
    onApplianceScanned({
      brand,
      modelNumber,
      serialNumber,
      purchaseDate,
      purchasePrice: Number(purchasePrice),
      dealerName,
      category,
      warrantyDurationMonths: Number(warrantyMonths),
      summaryTerms,
      confidenceScore: 98,
      invoiceNumber,
    });
    // After saving, ask if user wants to add more documents
    setShowAddMorePrompt(true);
  };

  const handleAddMoreDocuments = () => {
    // Close the modal - user can add documents via the appliance detail page
    onClose();
  };

  const handleSkipDocuments = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-600 text-white font-bold shadow-xs">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Smart Invoice OCR
                </span>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                  Instant Extraction
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Scan Bill, Invoice or Warranty Card
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm flex-1">
          {/* Preset Bills / Custom File Toggle */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              1. Select Sample Receipt or Upload Your Own
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_BILL_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(idx);
                    setCustomImageBase64(null);
                    setCustomFileName('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedPreset === idx && !customImageBase64
                    ? 'bg-purple-50/80 border-purple-500 text-purple-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <FileText className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs font-bold truncate">{preset.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    Preset #{idx + 1}
                  </div>
                </button>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-lg p-3.5 text-center bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                {customFileName ? (
                  <span className="text-purple-700 font-bold">
                    Uploaded: {customFileName}
                  </span>
                ) : (
                  'Click to upload or drag & drop invoice image (JPG, PNG)'
                )}
              </p>
            </div>
          </div>

          {/* Trigger Scan */}
          <button
            onClick={handleRunOCR}
            disabled={isScanning}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>
              {isScanning ? 'Extracting Appliance Details...' : 'Scan Document & Extract Details'}
            </span>
          </button>

          {scanError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Raw OCR Output for Testing */}
          {scanResult && (
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                OCR Raw Output (for testing)
              </label>
              <textarea
                readOnly
                value={JSON.stringify(scanResult, null, 2)}
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-mono"
              />
            </div>
          )}

          {/* Extracted Form Results */}
          {scanResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5">
              <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-purple-800 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>AI NLP Extraction Complete</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    {Object.values(scanResult).filter(v => Boolean(v) && v !== 0).length} Fields Extracted
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Extracted values are pre-filled below. Any unreadable or missing fields are left blank for manual verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    placeholder="e.g., Samsung, LG, Lumio"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    placeholder="e.g., FTW1-ADSG"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Invoice / Order Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ApplianceCategory)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  >
                    <option value="AC / HVAC">AC / HVAC</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="RO / Water Purifier">RO / Water Purifier</option>
                    <option value="Water Heater / Geyser">Water Heater / Geyser</option>
                    <option value="TV & Entertainment">TV & Entertainment</option>
                    <option value="Inverter & Battery">Inverter & Battery</option>
                    <option value="Microwave & Oven">Microwave & Oven</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Dealer / Seller Name
                  </label>
                  <input
                    type="text"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    placeholder="e.g., Amazon, Croma, Vijay Sales"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Warranty Months
                  </label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">
                  Warranty Summary
                </label>
                <input
                  type="text"
                  value={summaryTerms}
                  onChange={(e) => setSummaryTerms(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  placeholder="e.g., 1 Year Comprehensive + 10 Years Compressor"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Upload More Documents (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleMultipleFileUpload}
                    className="hidden"
                    id="multi-upload-ocr"
                  />
                  <label
                    htmlFor="multi-upload-ocr"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 border-dashed rounded-lg cursor-pointer transition-colors text-slate-700 font-bold text-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload More Docs</span>
                  </label>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Verification Evidence
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleMultipleFileUpload}
                    className="hidden"
                    id="evidence-upload-ocr"
                  />
                  <label
                    htmlFor="evidence-upload-ocr"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white hover:bg-blue-50 border border-blue-300 border-dashed rounded-lg cursor-pointer transition-colors text-blue-700 font-bold text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Add Evidence</span>
                  </label>
                </div>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Additional Documents
                  </label>
                  <ul className="list-disc list-inside text-xs text-slate-700">
                    {uploadedDocuments.map((doc, idx) => (
                      <li key={idx} className="py-0.5">{doc.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleSaveToLocker}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Save & Register Appliance
              </button>
            </div>
          )}

          {/* Add More Documents or Skip - shown after saving */}
          {showAddMorePrompt && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Appliance Registered Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Would you like to add more documents (warranty card, service bills, product labels) or verification evidence?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAddMoreDocuments}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                >
                  Add More Documents
                </button>
                <button
                  onClick={handleSkipDocuments}
                  className="flex-1 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
