import type { Appliance } from '../../types.js';

export const appliances = new Map<string, Appliance>();

// Helper: Compute registration score for an appliance based on fields entered and supportive documents
export function computeRegistrationScore(
    fields: Partial<Appliance>,
    docs: any[] = [],
    aiExtractedData?: any
): { score: number; reasons: string[]; conflicts: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const conflicts: string[] = [];

    // 1. Completion scoring (Max: 100 pts)
    if (fields.name?.trim()) {
        score += 10;
    } else {
        reasons.push('Appliance Name is missing (-10)');
    }

    if (fields.brand?.trim()) {
        score += 15;
    } else {
        reasons.push('Brand is missing (-15)');
    }

    if (fields.modelNumber?.trim()) {
        score += 15;
    } else {
        reasons.push('Model Number is missing (-15)');
    }

    if (fields.serialNumber?.trim()) {
        score += 15;
    } else {
        reasons.push('Serial Number is missing (-15)');
    }

    if (fields.purchaseDate?.trim()) {
        score += 10;
    } else {
        reasons.push('Purchase Date is missing (-10)');
    }

    if (fields.purchasePrice && fields.purchasePrice > 0) {
        score += 5;
    } else {
        reasons.push('Purchase Price is missing or zero (-5)');
    }

    if (fields.dealerName?.trim()) {
        score += 5;
    } else {
        reasons.push('Dealer Name is missing (-5)');
    }

    // Warranty is optional but contributes to score
    const hasWarranty = fields.warranty && (fields.warranty.durationMonths > 0 || fields.warranty.summaryTerms?.trim());
    if (hasWarranty) {
        score += 10;
    } else {
        reasons.push('Warranty duration / terms are missing (-10)');
    }

    // Supportive docs check (Invoice, Warranty Card, etc.)
    const hasDocs = docs && docs.length > 0;
    if (hasDocs) {
        score += 15;
    } else {
        reasons.push('No supportive documents / proof of purchase provided (-15)');
    }

    // 2. Verification check for Source of Truth
    if (!aiExtractedData) {
        // Manually added without any OCR AI extracted data as benchmark
        if (!hasDocs) {
            // Manual entry with zero supportive documents reduces the score
            score -= 15;
            reasons.push('Penalty: Manually entered details without any supportive document proof (-15)');
        }
    } else {
        // OCR run. Compare fields manually edited/entered with AI extracted source of truth
        const checkFields = ['brand', 'modelNumber', 'serialNumber', 'purchaseDate', 'purchasePrice', 'dealerName'];
        for (const f of checkFields) {
            const aiVal = aiExtractedData[f];
            const manualVal = (fields as any)[f];
            if (aiVal !== undefined && manualVal !== undefined) {
                const aiStr = String(aiVal).trim().toLowerCase();
                const manualStr = String(manualVal).trim().toLowerCase();
                // Skip if either is empty
                if (aiStr && manualStr && aiStr !== manualStr) {
                    conflicts.push(f);
                }
            }
        }

        if (conflicts.length > 0) {
            const penalty = 25;
            score -= penalty;
            reasons.push(`Penalty: Conflict/Mismatch detected on manually changed fields (${conflicts.join(', ')}) against document source of truth (-${penalty})`);
        }
    }

    const finalScore = Math.max(0, Math.min(score, 100));

    return {
        score: finalScore,
        reasons,
        conflicts,
    };
}

// Helper: Detect conflicts between AI-extracted data and manually entered data
export function detectConflicts(aiData: Record<string, any>, manualData: Record<string, any>): { field: string; aiValue: any; manualValue: any }[] {
    const conflicts: { field: string; aiValue: any; manualValue: any }[] = [];
    const checkFields = ['brand', 'modelNumber', 'serialNumber', 'purchaseDate', 'purchasePrice', 'dealerName'];

    for (const field of checkFields) {
        const aiVal = aiData[field];
        const manualVal = manualData[field];
        if (aiVal && manualVal && aiVal !== manualVal && String(aiVal).trim() !== String(manualVal).trim()) {
            conflicts.push({ field, aiValue: aiVal, manualValue: manualVal });
        }
    }
    return conflicts;
}
