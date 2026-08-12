import { Router, Request, Response } from 'express';
import { serviceRecords } from './store.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/service-records?applianceId=
router.get('/', (req: Request, res: Response) => {
  const { applianceId } = req.query;
  let result = Array.from(serviceRecords.values());
  if (applianceId) result = result.filter((s) => s.applianceId === applianceId);
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, data: result });
});

// GET /api/service-records/:id
router.get('/:id', (req: Request, res: Response) => {
  const record = serviceRecords.get(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Service record not found' });
  res.json({ success: true, data: record });
});

// POST /api/service-records
router.post('/', (req: Request, res: Response) => {
  const { applianceId, date, type, notes } = req.body;
  if (!applianceId || !date || !type) {
    return res.status(400).json({ success: false, error: 'applianceId, date, and type are required' });
  }

  const id = req.body.id || generateId('srv');
  const now = new Date().toISOString();
  const record = {
    id, applianceId, date, type,
    technicianName: req.body.technicianName || '', serviceCenter: req.body.serviceCenter || '',
    cost: req.body.cost || 0, notes: notes || '',
    spareParts: req.body.spareParts || [], documentId: req.body.documentId || '',
    createdAt: now, updatedAt: now,
  };

  serviceRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

// PUT /api/service-records/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = serviceRecords.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Service record not found' });

  const updated = { ...existing, ...req.body, id: existing.id, applianceId: existing.applianceId, updatedAt: new Date().toISOString() };
  serviceRecords.set(existing.id, updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/service-records/:id
router.delete('/:id', (req: Request, res: Response) => {
  if (!serviceRecords.has(req.params.id)) return res.status(404).json({ success: false, error: 'Service record not found' });
  serviceRecords.delete(req.params.id);
  res.json({ success: true, data: { deleted: req.params.id } });
});

export default router;
