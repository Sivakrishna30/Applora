import type { WarrantyInfo } from '../../types.js';

export interface WarrantyStoreItem {
    id: string;
    applianceId: string;
    provider?: string;
    startDate: string;
    endDate?: string;
    durationMonths: number;
    coverageType: 'Full Warranty' | 'Comprehensive' | 'Parts Only' | 'Extended Warranty' | 'Expired';
    summaryTerms: string;
    coverage?: any[];
    coveredParts?: string[];
    excludedParts?: string[];
    isAmcActive?: boolean;
    amcExpiryDate?: string;
    amcVendor?: string;
    status?: 'active' | 'expiring' | 'expired';
    createdAt?: string;
    updatedAt?: string;
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
    score: number;
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

export const warranties = new Map<string, WarrantyStoreItem>();
