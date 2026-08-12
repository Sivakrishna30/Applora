import { Router, Request, Response } from 'express';
import { warranties } from './store.js';
import { computeWarrantyStatus } from './helpers.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/warranties?applianceId=
router.get('/', (req: Request, res: Response) => {
  const { applianceId } = req.query;
  let result = Array.from(warranties.values());
  if (applianceId) result = result.filter((w) => w.applianceId === applianceId);
  const withStatus = result.map((w) => ({
    ...w,
    status: computeWarrantyStatus(w as any)
  }) as any);
  res.json({ success: true, data: withStatus });
});

// GET /api/warranties/:id
router.get('/:id', (req: Request, res: Response) => {
  const warranty = warranties.get(req.params.id);
  if (!warranty) return res.status(404).json({ success: false, error: 'Warranty not found' });
  res.json({ success: true, data: { ...warranty, status: computeWarrantyStatus(warranty as any) } });
});

// POST /api/warranties
router.post('/', (req: Request, res: Response) => {
  const { applianceId, startDate, endDate } = req.body;
  if (!applianceId || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: 'applianceId, startDate, and endDate are required' });
  }

  const id = req.body.id || generateId('war');
  const now = new Date().toISOString();
  const warranty = {
    id, applianceId, provider: req.body.provider || '', startDate, endDate,
    durationMonths: req.body.durationMonths || 12, coverageType: req.body.coverageType || 'Full Warranty',
    summaryTerms: req.body.summaryTerms || '', coverage: req.body.coverage || [],
    // Verification fields (initialized as PROPOSED)
    verificationStatus: 'PROPOSED' as const,
    score: 0,
    provenance: [] as any[],
    createdAt: now, updatedAt: now,
  } as any;

  warranties.set(id, warranty);
  res.status(201).json({ success: true, data: { ...warranty, status: computeWarrantyStatus(warranty) } });
});

// PUT /api/warranties/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = warranties.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Warranty not found' });

  const updated = { ...existing, ...req.body, id: existing.id, applianceId: existing.applianceId, updatedAt: new Date().toISOString() };
  warranties.set(req.params.id, updated);
  res.json({ success: true, data: { ...updated, status: computeWarrantyStatus(updated) } });
});

// DELETE /api/warranties/:id
router.delete('/:id', (req: Request, res: Response) => {
  if (!warranties.has(req.params.id)) return res.status(404).json({ success: false, error: 'Warranty not found' });
  warranties.delete(req.params.id);
  res.json({ success: true, data: { deleted: req.params.id } });
});

export default router;
