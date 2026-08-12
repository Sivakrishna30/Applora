const fs = require('fs');
const path = require('path');
const targetFile = path.join(__dirname, 'backend', 'src', 'modules', 'appliances', 'routes.ts');
let c = fs.readFileSync(targetFile, 'utf8');

// Fix blank line after import and remove artifact
c = c.replace(/import type { AppliancePopulated } from '\.\.\/\.\.\/types\.js';\s*>>>>>>>\s*const router = Router\(\);/,
    "import type { AppliancePopulated } from '../../types.js';\n\nconst router = Router();");

// Replace the old warranty + score section
const oldSection = `  // Initialize warranty with PROPOSED status if provided
  if (req.body.warranty) {
    const warId = generateId('war');
    const warrantyDuration = req.body.warranty.durationMonths || 12;
    const startDate = req.body.warranty.startDate || req.body.purchaseDate || '';
    const endDate = req.body.warranty.endDate || '';

    warranties.set(warId, {
      id: warId, applianceId: id,
      provider: req.body.warranty.provider || brand,
      startDate, endDate,
      durationMonths: warrantyDuration,
      coverageType: req.body.warranty.coverageType || 'Full Warranty',
      summaryTerms: req.body.warranty.summaryTerms || '',
      coverage: req.body.warranty.coverage || [],
      // Verification fields
      verificationStatus: 'PROPOSED',
      score: calculateInitialScore({ brand, modelNumber: modelNumber || '', purchaseDate: req.body.purchaseDate || '', warrantyDuration }),
      provenance: [],
      createdAt: now, updatedAt: now,
    });
  }

  res.status(201).json({ success: true, data: populateAppliance(id) });
});

// Helper function to calculate initial score based on fields entered
function calculateInitialScore(fields: { brand: string; modelNumber?: string; purchaseDate?: string; warrantyDuration?: number }): number {
  let score = 0;
  // Base score for entering required fields
  if (fields.brand) score += 20;
  if (fields.modelNumber) score += 20;
  if (fields.purchaseDate) score += 20;
  if (fields.warrantyDuration && fields.warrantyDuration > 0) score += 20;
  // Cap at 100
  return Math.min(score, 100);
}`;

const newSection = `  // Compute registration score based on all fields entered
  const score = computeRegistrationScore(appliance);

  // Initialize warranty with PROPOSED status if provided, with score and provenance
  if (req.body.warranty) {
    const warId = generateId('war');
    const warrantyDuration = req.body.warranty.durationMonths || 12;
    const startDate = req.body.warranty.startDate || req.body.purchaseDate || '';
    const endDate = req.body.warranty.endDate || '';

    // Check for conflicts if AI data was provided
    const conflicts = req.body.aiExtractedData ? detectConflicts(req.body.aiExtractedData, appliance) : [];

    warranties.set(warId, {
      id: warId, applianceId: id,
      provider: req.body.warranty.provider || brand,
      startDate, endDate,
      durationMonths: warrantyDuration,
      coverageType: req.body.warranty.coverageType || 'Full Warranty',
      summaryTerms: req.body.warranty.summaryTerms || '',
      coverage: req.body.warranty.coverage || [],
      // Verification fields (PROPOSED until reviewed)
      verificationStatus: 'PROPOSED',
      score: score,
      provenance: req.body.aiExtractedData ? [{
        value: req.body.aiExtractedData,
        source: 'AI OCR Scan',
        sourceType: 'AI',
        observedAt: now,
        extractedBy: 'AI',
        confidence: req.body.aiExtractedData.confidenceScore || 0,
        verificationStatus: 'PROPOSED',
      }] : [],
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      createdAt: now, updatedAt: now,
    } as any);
  }

  res.status(201).json({ success: true, data: { ...populateAppliance(id), registrationScore: score } });
});`;

if (c.includes(oldSection.trim())) {
    c = c.replace(oldSection.trim(), newSection.trim());
    fs.writeFileSync(targetFile, c);
    console.log('Fixed successfully');
} else {
    // Fallback for partial matches or different formatting
    console.log('Old section not found exactly, trying regex or manual fix...');
    // Force clean up of >>>>>>>
    c = c.replace(/>>>>>>>\s*/g, '');
    fs.writeFileSync(targetFile, c);
    console.log('Cleaned up artifacts.');
}
