import { Router, Request, Response } from 'express';
import { ownershipRecords } from './store.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/ownership-records?applianceId=
router.get('/', (req: Request, res: Response) => {
  const { applianceId } = req.query;
  let result = Array.from(ownershipRecords.values());
  if (applianceId) result = result.filter((o) => o.applianceId === applianceId);
  result.sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());
  res.json({ success: true, data: result });
});

// GET /api/ownership-records/:id
router.get('/:id', (req: Request, res: Response) => {
  const record = ownershipRecords.get(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Ownership record not found' });
  res.json({ success: true, data: record });
});

// POST /api/ownership-records
router.post('/', (req: Request, res: Response) => {
  const { applianceId, ownerName, transferDate, transferType } = req.body;
  if (!applianceId || !ownerName || !transferDate) {
    return res.status(400).json({ success: false, error: 'applianceId, ownerName, and transferDate are required' });
  }

  const id = req.body.id || generateId('own');
  const now = new Date().toISOString();
  const record = {
    id, applianceId, ownerName,
    ownerEmail: req.body.ownerEmail || '', ownerPhone: req.body.ownerPhone || '',
    transferDate, transferType: transferType || 'original', notes: req.body.notes || '',
    createdAt: now, updatedAt: now,
  };

  ownershipRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

// PUT /api/ownership-records/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = ownershipRecords.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Ownership record not found' });

  const updated = { ...existing, ...req.body, id: existing.id, applianceId: existing.applianceId, updatedAt: new Date().toISOString() };
  ownershipRecords.set(existing.id, updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/ownership-records/:id
router.delete('/:id', (req: Request, res: Response) => {
  if (!ownershipRecords.has(req.params.id)) return res.status(404).json({ success: false, error: 'Ownership record not found' });
  ownershipRecords.delete(req.params.id);
  res.json({ success: true, data: { deleted: req.params.id } });
});

export default router;
