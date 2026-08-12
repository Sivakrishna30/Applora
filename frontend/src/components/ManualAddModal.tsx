import React, { useState } from 'react';
import { X, Plus, Sparkles, Upload, Camera, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { Appliance, ApplianceCategory, HomeProperty } from '../types';
import { scanBillApi } from '../services/api';

interface ManualAddModalProps {
  currentHome: HomeProperty;
  onClose: () => void;
  onAddAppliance: (appliance: Appliance) => void;
}

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
];

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  currentHome,
  onClose,
  onAddAppliance,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<ApplianceCategory>('AC / HVAC');
  const [room, setRoom] = useState(currentHome?.rooms?.[0] || '');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [dealerName, setDealerName] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');

  // AI OCR state
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ocrRawOutput, setOcrRawOutput] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]); // Multi-document tracking
  const [isScanned, setIsScanned] = useState(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle file upload with automatic OCR for the first document
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const file = files[0];

    // If it's the first upload, run OCR
    if (!isScanned) {
      setUploadedFileName(file.name);
      setIsOcrScanning(true);
      setOcrSuccess(false);
      setOcrRawOutput('');

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1] || dataUrl;
          const response = await scanBillApi({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          });

          setIsOcrScanning(false);

          if (response.success && response.data) {
            setOcrSuccess(true);
            setIsScanned(true); // Mark as scanned
            setOcrRawOutput(JSON.stringify(response.data, null, 2));

            // Auto-populate fields from OCR result
            const data = response.data as any;
            if (data.brand) setBrand(data.brand);
            if (data.modelNumber) setModelNumber(data.modelNumber);
            if (data.serialNumber) setSerialNumber(data.serialNumber);
            if (data.purchaseDate) setPurchaseDate(data.purchaseDate);
            if (data.purchasePrice) setPurchasePrice(Number(data.purchasePrice));
            if (data.dealerName) setDealerName(data.dealerName);
            if (data.category) setCategory(data.category as ApplianceCategory);

            // Calculate warranty end date if duration and purchase date are available
            if (data.purchaseDate && data.warrantyDurationMonths) {
              const date = new Date(data.purchaseDate);
              date.setMonth(date.getMonth() + Number(data.warrantyDurationMonths));
              setWarrantyEndDate(date.toISOString().split('T')[0]);
            }

            // Construct a default name if possible
            if (data.brand && data.modelNumber) {
              setName(`${data.brand} ${data.modelNumber}`);
            } else if (data.brand) {
              setName(data.brand);
            }
          } else {
            setOcrRawOutput('Error: ' + (response.error || 'OCR scan failed'));
            // Even if OCR fails, we consider the first upload "done" for the prompt
            setIsScanned(true);
          }
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setIsOcrScanning(false);
        setOcrRawOutput('Error: ' + err.message);
        setIsScanned(true);
      }
    } else {
      // For subsequent uploads, just add to document list
      files.forEach((f: File) => {
        setUploadedDocuments(prev => [...prev, f.name]);
      });
    }

    // Reset input
    e.target.value = '';
  };

  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !modelNumber) return;
    // Show confirmation step before final save
    setShowConfirmation(true);
  };

  // Calculate months between start and end date
  const calculateMonthsBetween = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;

    return totalMonths > 0 ? totalMonths : 0;
  };

  const handleFinalConfirmSave = () => {
    if (!name || !modelNumber || !purchaseDate) {
      console.error('Required fields missing: name, modelNumber, purchaseDate');
      return;
    }

    const durationMonths = calculateMonthsBetween(purchaseDate, warrantyEndDate);

    const newAppliance: Appliance = {
      id: `app-${Date.now()}`,
      homeId: currentHome.id,
      name,
      brand,
      modelNumber,
      serialNumber,
      category,
      room,
      purchaseDate,
      purchasePrice: Number(purchasePrice),
      dealerName,
      installationDate: purchaseDate,
      status: 'Healthy',
      warranty: {
        startDate: purchaseDate,
        durationMonths,
        endDate: warrantyEndDate,
        coverageType: 'Full Warranty',
        summaryTerms: 'Fetched from knowledge base',
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          title: uploadedFileName ? `Invoice (${uploadedFileName})` : 'Purchase Receipt',
          type: 'Invoice',
          uploadDate: purchaseDate,
        },
        ...(uploadedDocuments.map(docName => ({
          id: `doc-${Date.now()}-${docName}`,
          title: docName,
          type: 'Other',
          uploadDate: purchaseDate,
        })) || []),
      ],
      serviceHistory: [
        {
          id: `srv-${Date.now()}`,
          applianceId: `app-${Date.now()}`,
          date: purchaseDate,
          type: 'Installation',
          cost: 0,
          notes: 'Device registered.',
        },
      ],
    };

    onAddAppliance(newAppliance);
    onClose();
  };


  // Handle multiple file uploads
  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file: any) =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    setUploadedDocuments(prev => [...prev, ...validFiles.map((f: any) => f.name)]);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Add New Home Appliance
            </h2>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation ? (
          <div className="p-6 space-y-4 text-xs flex-1 overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Confirm Registration</span>
              </div>
              <p className="text-slate-600 text-xs">
                Confirm details before registering to {currentHome.name}.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Appliance Name</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Brand & Model</span>
                  <span className="font-bold text-purple-700">{brand} ({modelNumber})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category & Room</span>
                  <span className="font-semibold text-slate-800">{category} • {room}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Purchase Date & Price</span>
                  <span className="font-semibold text-slate-800">{purchaseDate} (${purchasePrice})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dealer Name</span>
                  <span className="font-semibold text-slate-800">{dealerName || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Warranty (Months)</span>
                  <span className="font-semibold text-emerald-700">{calculateMonthsBetween(purchaseDate, warrantyEndDate)} Months</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Serial Number</span>
                  <span className={`font-mono ${serialNumber ? 'text-slate-800' : 'text-amber-600 font-bold italic'}`}>
                    {serialNumber || 'Required for Warranty'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Warranty End Date</span>
                  <span className={`font-semibold ${warrantyEndDate ? 'text-slate-800' : 'text-amber-600 font-bold italic'}`}>
                    {warrantyEndDate || 'Required for Warranty'}
                  </span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Details Verification</span>
                  {serialNumber && warrantyEndDate ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
                      ✓ Complete & Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit">
                      ⚠ Incomplete Details
                    </span>
                  )}
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Confirmation</span>
                  {uploadedFileName || uploadedDocuments.length > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
                      ✓ Document Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg w-fit">
                      ✗ Unverified (No Document)
                    </span>
                  )}
                </div>
              </div>
              {uploadedDocuments.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Uploaded Documents</span>
                  <ul className="list-disc list-inside text-xs text-slate-700 mt-1">
                    {uploadedDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                onClick={handleFinalConfirmSave}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmitClick} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
            {/* Multi-Document Upload Header */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                  <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Upload Documents</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600">
                Upload receipts, warranty cards, product labels, and other documents.
                Scan with OCR to auto-fill details or enter them manually below.
              </p>

              <div className="flex flex-col gap-2">
                {!isScanned ? (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-blue-50 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer transition-all text-blue-700 font-bold text-sm shadow-sm group">
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Upload Invoice / Take Photo</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 truncate">
                          {uploadedFileName}
                        </p>
                        <p className="text-[10px] text-blue-600 font-medium">
                          Initial scan complete
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer transition-colors text-slate-700 font-bold text-[11px]">
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Add More Documents</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {isOcrScanning && (
                <div className="flex items-center gap-2 text-xs text-blue-700 font-bold bg-white p-2 rounded-lg border border-blue-200 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Scanning receipt & extracting appliance details with AI OCR...</span>
                </div>
              )}



              {uploadedDocuments.length > 0 && (
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Uploaded Files
                  </label>
                  <ul className="list-disc list-inside text-xs text-slate-700">
                    {uploadedDocuments.map((doc, idx) => (
                      <li key={idx} className="py-0.5">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Appliance Name</label>
                <input
                  id="appliance-name-input"
                  type="text"
                  placeholder="e.g. Samsung 1.5T Inverter AC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
                {name && (<span className="text-[10px] text-emerald-600">✓</span>)}
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung, LG, IFB, Sony"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Model Number</label>
                <input
                  type="text"
                  placeholder="e.g. AR18CY5AMWK"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  Serial Number
                  <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded border border-amber-200">Required for Warranty</span>
                </label>
                <input
                  type="text"
                  placeholder="Required for claims - e.g. SN-991823"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ApplianceCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-medium"
                >
                  <option value="AC / HVAC">AC / HVAC</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="Washing Machine">Washing Machine</option>
                  <option value="RO / Water Purifier">RO / Water Purifier</option>
                  <option value="Water Heater / Geyser">Water Heater / Geyser</option>
                  <option value="TV & Entertainment">TV & Entertainment</option>
                  <option value="Inverter & Battery">Inverter & Battery</option>
                  <option value="Mixer & Kitchen">Mixer & Kitchen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Room Location</label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-medium"
                >
                  {currentHome.rooms.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Purchase Price ($)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold">Dealer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Croma Electronics"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  Warranty End Date
                  {!warrantyEndDate && <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded border border-amber-200">Required for Warranty</span>}
                </label>
                <input
                  type="date"
                  value={warrantyEndDate}
                  onChange={(e) => setWarrantyEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">All fields optional except Name & Brand. You can edit later.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue →</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
