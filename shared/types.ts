// =============================================================================
// AppLora Phase 1 — Core Types
// "DigiLocker for your home" — Consumer-first, Asset-first
//
// Collections:
//   users, homes, appliances, warranties, documents, serviceRecords, ownershipRecords
//
// Relationships:
//   User → Home (via home.userId)
//   Home → Appliance (via appliance.homeId)
//   Appliance → Warranty (via warranty.applianceId)
//   Appliance → Document (via document.applianceId)
//   Appliance → ServiceRecord (via serviceRecord.applianceId)
//   Appliance → OwnershipRecord (via ownershipRecord.applianceId)
// =============================================================================

// --- User ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  memberSince: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Home / Property ---
export type PropertyType = 'Apartment' | 'Villa' | 'Rental' | 'Office' | 'Commercial';

export interface HomeProperty {
  id: string;
  userId?: string;
  name: string;
  address: string;
  type: PropertyType;
  rooms: string[];
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Appliance ---
export type ApplianceCategory =
  | 'AC / HVAC'
  | 'Refrigerator'
  | 'Washing Machine'
  | 'RO / Water Purifier'
  | 'Microwave & Oven'
  | 'Water Heater / Geyser'
  | 'TV & Entertainment'
  | 'Inverter & Battery'
  | 'Mixer & Kitchen'
  | 'Other';

export type ApplianceStatus =
  | 'Healthy'
  | 'Service Due'
  | 'Under Repair'
  | 'Warranty Expiring'
  | 'Needs Attention'
  | 'For Sale';

export interface Appliance {
  id: string;
  homeId: string;
  name: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  category: ApplianceCategory;
  room: string; // location within home (e.g. "Master Bedroom")
  purchaseDate: string;
  purchasePrice: number;
  dealerName: string;
  installationDate?: string;
  status: ApplianceStatus;
  photoUrl?: string;
  notes?: string;
  powerRatingKw?: number;
  verifiedHistoryBadge?: boolean;
  healthScore?: number;
  registrationScore?: number;
  registrationScoreReasons?: string[];
  registrationConflicts?: string[];
  aiExtractedData?: any;
  qrCode?: string;
  warranty?: WarrantyInfo | any;


  documents?: ApplianceDocument[];
  serviceHistory?: ServiceRecord[];
  ownershipHistory?: OwnershipRecord[];
  createdAt?: string;
  updatedAt?: string;
}

// Populated appliance — returned by GET /api/appliances/:id
// Includes related data from other collections
export interface AppliancePopulated extends Appliance {
  warranty: WarrantyInfo | null;
  documents: ApplianceDocument[];
  serviceHistory: ServiceRecord[];
  ownershipHistory: OwnershipRecord[];
}

// --- Warranty ---
export interface WarrantyCoverage {
  part: string;
  covered: boolean;
}

export interface WarrantyInfo {
  id?: string;
  applianceId?: string;
  provider?: string; // brand or third party
  startDate: string;
  endDate?: string;
  durationMonths: number;
  coverageType: 'Full Warranty' | 'Comprehensive' | 'Parts Only' | 'Extended Warranty' | 'Expired';
  summaryTerms: string;
  coverage?: WarrantyCoverage[]; // detailed what's covered / not covered
  coveredParts?: string[];
  excludedParts?: string[];
  isAmcActive?: boolean;
  amcExpiryDate?: string;
  amcVendor?: string;
  status?: 'active' | 'expiring' | 'expired';
  createdAt?: string;
  updatedAt?: string;
  // Verification Evidence
  verificationStatus: 'PROPOSED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'CONFLICTING' | 'OUTDATED';
  verifiedBy?: string;
  verifiedAt?: string;
  evidence?: {
    sourceUrl?: string;
    document?: string;
    uploadedDocument?: string;
    evidenceScreenshot?: string;
    evidenceAttachment?: string;
  };
  // Scoring
  score: number; // 0-100 based on fields entered and verification
  provenance: Array<{
    value: any;
    source: string;
    sourceType: 'AI' | 'Manual' | 'Official' | 'User';
    observedAt: string;
    extractedBy: 'AI' | 'Human';
    confidence: number;
    verificationStatus: 'PROPOSED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'CONFLICTING' | 'OUTDATED';
    verifiedBy?: string;
    verifiedAt?: string;
    evidence?: string;
  }>;
}

// --- Document ---
export type DocumentType =
  | 'Invoice'
  | 'Warranty Card'
  | 'AMC Contract'
  | 'Repair Bill'
  | 'User Manual'
  | 'Installation Receipt'
  | 'Service Invoice'
  | 'Photo';

export interface ApplianceDocument {
  id: string;
  applianceId?: string;
  title: string;
  type: DocumentType;
  fileName?: string;
  fileUrl?: string;
  storagePath?: string; // Cloud Storage path (future)
  uploadDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Service Record ---
export type ServiceType =
  | 'Installation'
  | 'Preventive Maintenance'
  | 'Repair'
  | 'Gas Refill'
  | 'Filter Replacement'
  | 'Parts Replacement'
  | 'AMC Renewal'
  | 'Inspection';

export interface ServiceRecord {
  id: string;
  applianceId: string;
  date: string;
  type: ServiceType;
  technicianName?: string;
  serviceCenter?: string;
  cost: number;
  notes: string;
  spareParts?: string[];
  documentId?: string; // link to a document (service bill)
  createdAt?: string;
  updatedAt?: string;
}

// --- Ownership Record ---
export interface OwnershipRecord {
  id: string;
  applianceId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  transferDate: string;
  transferType: 'purchase' | 'gift' | 'transfer' | 'original';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Dashboard Summary ---
export interface DashboardSummary {
  totalAppliances: number;
  activeWarranties: number;
  expiringWarranties: number;
  expiredWarranties: number;
  totalAssetValue: number;
  appliances: AppliancePopulated[];
}

// --- Legacy types kept for backward compatibility with existing UI components ---
// These will be phased out as UI components are updated

export interface Complaint {
  id: string;
  applianceId: string;
  applianceName: string;
  brand: string;
  issueTitle: string;
  issueDescription: string;
  symptoms: string[];
  aiDiagnosis?: string;
  diySteps?: string[];
  suggestedAction?: 'DIY Fix' | 'Warranty Claim' | 'Technician Booking' | 'Replace';
  estimatedCostRange?: string;
  status: 'Open' | 'Diagnosis Ready' | 'Brand Emailed' | 'Service Booked' | 'Resolved';
  createdDate: string;
  brandSupportEmail?: string;
  brandSupportWhatsapp?: string;
}

export interface MarketplaceListing {
  id: string;
  appliance: Appliance & {
    warranty: WarrantyInfo;
    documents: ApplianceDocument[];
    serviceHistory: ServiceRecord[];
    verifiedHistoryBadge: boolean;
    healthScore: number;
    qrCode: string;
  };
  askingPrice: number;
  originalPrice: number;
  sellerName: string;
  sellerContact: string;
  sellerUserId?: string;
  location: string;
  city?: string;
  distanceKm?: number;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair';
  verifiedBadge: boolean;
  listingDate: string;
  status: 'Available' | 'Pending Transfer' | 'Sold';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  applianceId?: string;
}

export interface OCRScanResult {
  brand: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  dealerName: string;
  category: ApplianceCategory;
  warrantyDurationMonths: number;
  summaryTerms: string;
  confidenceScore: number;
  invoiceNumber?: string;
}

// Legacy interfaces used by existing components
export interface HealthAlert {
  id: string;
  applianceId: string;
  applianceName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  actionText: string;
  actionType: 'service' | 'warranty' | 'filter' | 'amc';
}

export interface HomeHealthReport {
  score: number;
  totalAppliances: number;
  activeWarranties: number;
  servicesDue: number;
  alerts: HealthAlert[];
  aiInsights: string[];
  estimatedTotalAssetValue: number;
}
