import { Router, Request, Response } from 'express';
import { documents } from './store.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/documents?applianceId=
router.get('/', (req: Request, res: Response) => {
  const { applianceId } = req.query;
  let result = Array.from(documents.values());
  if (applianceId) result = result.filter((d) => d.applianceId === applianceId);
  result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  res.json({ success: true, data: result });
});

// GET /api/documents/:id
router.get('/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
  res.json({ success: true, data: doc });
});

// POST /api/documents
router.post('/', (req: Request, res: Response) => {
  const { applianceId, title, type } = req.body;
  if (!applianceId || !title || !type) {
    return res.status(400).json({ success: false, error: 'applianceId, title, and type are required' });
  }

  const id = req.body.id || generateId('doc');
  const now = new Date().toISOString();
  const doc = {
    id, applianceId, title, type,
    fileName: req.body.fileName || '', fileUrl: req.body.fileUrl || '',
    storagePath: req.body.storagePath || '', uploadDate: req.body.uploadDate || now.split('T')[0],
    notes: req.body.notes || '', createdAt: now, updatedAt: now,
  };

  documents.set(id, doc);
  res.status(201).json({ success: true, data: doc });
});

// POST /api/documents/bulk — upload multiple documents at once
router.post('/bulk', (req: Request, res: Response) => {
  const { documents: docs } = req.body;
  if (!Array.isArray(docs) || docs.length === 0) {
    return res.status(400).json({ success: false, error: 'documents array is required' });
  }

  const now = new Date().toISOString();
  const created: any[] = [];

  for (const docInput of docs) {
    const { applianceId, title, type } = docInput;
    if (!applianceId || !title || !type) continue;

    const id = docInput.id || generateId('doc');
    const doc = {
      id, applianceId, title, type,
      fileName: docInput.fileName || '', fileUrl: docInput.fileUrl || '',
      storagePath: docInput.storagePath || '', uploadDate: docInput.uploadDate || now.split('T')[0],
      notes: docInput.notes || '', createdAt: now, updatedAt: now,
    };

    documents.set(id, doc);
    created.push(doc);
  }

  res.status(201).json({ success: true, data: created });
});

// PUT /api/documents/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = documents.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });

  const updated = { ...existing, ...req.body, id: existing.id, applianceId: existing.applianceId, updatedAt: new Date().toISOString() };
  documents.set(existing.id, updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/documents/:id
router.delete('/:id', (req: Request, res: Response) => {
  if (!documents.has(req.params.id)) return res.status(404).json({ success: false, error: 'Document not found' });
  documents.delete(req.params.id);
  res.json({ success: true, data: { deleted: req.params.id } });
});

export default router;
