import { Router, Request, Response } from 'express';
import { appliances, computeRegistrationScore, detectConflicts } from './store.js';
import { warranties } from '../warranties/store.js';
import { documents } from '../documents/store.js';
import { serviceRecords } from '../services/store.js';
import { ownershipRecords } from '../ownership/store.js';
import { computeWarrantyStatus } from '../warranties/helpers.js';
import { generateId } from '../../utils.js';
import type { AppliancePopulated } from '../../types.js';
const router = Router();

function populateAppliance(applianceId: string): AppliancePopulated | null {
  const app = appliances.get(applianceId);
  if (!app) return null;

  const warranty = Array.from(warranties.values()).find((w) => w.applianceId === applianceId) || null;
  const docs = Array.from(documents.values()).filter((d) => d.applianceId === applianceId);
  const services = Array.from(serviceRecords.values())
    .filter((s) => s.applianceId === applianceId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const ownership = Array.from(ownershipRecords.values())
    .filter((o) => o.applianceId === applianceId)
    .sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());

  const warrantyWithStatus = warranty ? { ...warranty, status: computeWarrantyStatus(warranty) } : null;

  return { ...app, warranty: warrantyWithStatus, documents: docs, serviceHistory: services, ownershipHistory: ownership };
}

// GET /api/appliances?homeId=
router.get('/', (req: Request, res: Response) => {
  const { homeId } = req.query;
  let appList = Array.from(appliances.values());
  if (homeId) appList = appList.filter((a) => a.homeId === homeId);
  const populated = appList.map((a) => populateAppliance(a.id)!).filter(Boolean);
  res.json({ success: true, data: populated });
});

// GET /api/appliances/:id
router.get('/:id', (req: Request, res: Response) => {
  const populated = populateAppliance(req.params.id);
  if (!populated) return res.status(404).json({ success: false, error: 'Appliance not found' });
  res.json({ success: true, data: populated });
});

// POST /api/appliances
router.post('/', (req: Request, res: Response) => {
  const { homeId, name, brand, modelNumber, category } = req.body;
  if (!homeId || !name || !brand) {
    return res.status(400).json({ success: false, error: 'homeId, name, and brand are required' });
  }

  const id = req.body.id || generateId('app');
  const now = new Date().toISOString();

  const appliance = {
    id, homeId, name, brand,
    modelNumber: modelNumber || '', serialNumber: req.body.serialNumber || '',
    category: category || 'Other', room: req.body.room || '',
    purchaseDate: req.body.purchaseDate || '', purchasePrice: req.body.purchasePrice || 0,
    dealerName: req.body.dealerName || '', installationDate: req.body.installationDate || '',
    status: req.body.status || 'Healthy', photoUrl: req.body.photoUrl || '',
    notes: req.body.notes || '', powerRatingKw: req.body.powerRatingKw || undefined,
    createdAt: now, updatedAt: now,
  };

  appliances.set(id, appliance);

  // Compute registration score based on all fields entered
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
});

// PUT /api/appliances/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = appliances.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Appliance not found' });

  const updated = { ...existing, ...req.body, id: existing.id, homeId: req.body.homeId || existing.homeId, updatedAt: new Date().toISOString() };
  delete (updated as any).warranty;
  delete (updated as any).documents;
  delete (updated as any).serviceHistory;
  delete (updated as any).ownershipHistory;

  appliances.set(existing.id, updated);
  res.json({ success: true, data: populateAppliance(existing.id) });
});

// DELETE /api/appliances/:id — cascade
router.delete('/:id', (req: Request, res: Response) => {
  const app = appliances.get(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'Appliance not found' });

  let warDeleted = 0, docDeleted = 0, srvDeleted = 0, ownDeleted = 0;
  for (const [wId, w] of warranties) { if (w.applianceId === app.id) { warranties.delete(wId); warDeleted++; } }
  for (const [dId, d] of documents) { if (d.applianceId === app.id) { documents.delete(dId); docDeleted++; } }
  for (const [sId, s] of serviceRecords) { if (s.applianceId === app.id) { serviceRecords.delete(sId); srvDeleted++; } }
  for (const [oId, o] of ownershipRecords) { if (o.applianceId === app.id) { ownershipRecords.delete(oId); ownDeleted++; } }
  appliances.delete(app.id);

  res.json({ success: true, data: { deleted: app.id, cascaded: { warranties: warDeleted, documents: docDeleted, serviceRecords: srvDeleted, ownershipRecords: ownDeleted } } });
});

export default router;
