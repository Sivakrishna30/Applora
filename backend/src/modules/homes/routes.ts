import { Router, Request, Response } from 'express';
import { homes } from './store.js';
import { appliances } from '../appliances/store.js';
import { warranties } from '../warranties/store.js';
import { documents } from '../documents/store.js';
import { serviceRecords } from '../services/store.js';
import { ownershipRecords } from '../ownership/store.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/homes?userId=
router.get('/', (req: Request, res: Response) => {
  const { userId } = req.query;
  let result = Array.from(homes.values());
  if (userId) result = result.filter((h) => h.userId === userId);
  res.json({ success: true, data: result });
});

// GET /api/homes/:id
router.get('/:id', (req: Request, res: Response) => {
  const home = homes.get(req.params.id);
  if (!home) return res.status(404).json({ success: false, error: 'Home not found' });
  res.json({ success: true, data: home });
});

// POST /api/homes
router.post('/', (req: Request, res: Response) => {
  const { userId, name, address, type, rooms, isPrimary } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Home name is required' });

  const id = req.body.id || generateId('home');
  const now = new Date().toISOString();
  const home = {
    id, userId: userId || '', name, address: address || '',
    type: type || 'Apartment', rooms: rooms || ['Living Room', 'Kitchen', 'Bedroom'],
    isPrimary: isPrimary ?? false, createdAt: now, updatedAt: now,
  };

  homes.set(id, home);
  res.status(201).json({ success: true, data: home });
});

// PUT /api/homes/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = homes.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Home not found' });

  const updated = { ...existing, ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  homes.set(existing.id, updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/homes/:id — cascade deletes appliances and sub-records
router.delete('/:id', (req: Request, res: Response) => {
  const home = homes.get(req.params.id);
  if (!home) return res.status(404).json({ success: false, error: 'Home not found' });

  const homeAppliances = Array.from(appliances.values()).filter((a) => a.homeId === home.id);
  for (const app of homeAppliances) {
    for (const [wId, w] of warranties) { if (w.applianceId === app.id) warranties.delete(wId); }
    for (const [dId, d] of documents) { if (d.applianceId === app.id) documents.delete(dId); }
    for (const [sId, s] of serviceRecords) { if (s.applianceId === app.id) serviceRecords.delete(sId); }
    for (const [oId, o] of ownershipRecords) { if (o.applianceId === app.id) ownershipRecords.delete(oId); }
    appliances.delete(app.id);
  }

  homes.delete(home.id);
  res.json({ success: true, data: { deleted: home.id, appliancesRemoved: homeAppliances.length } });
});

export default router;
