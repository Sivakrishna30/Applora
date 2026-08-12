import { Router, Request, Response } from 'express';
import { users } from './store.js';
import { generateId } from '../../utils.js';

const router = Router();

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
});

// POST /api/users
router.post('/', (req: Request, res: Response) => {
  const { name, email, phone, avatarUrl } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }

  const id = req.body.id || generateId('usr');
  const now = new Date().toISOString();

  const user = {
    id,
    name,
    email,
    phone: phone || '',
    avatarUrl: avatarUrl || '',
    isLoggedIn: true,
    memberSince: new Date().getFullYear().toString(),
    createdAt: now,
    updatedAt: now,
  };

  users.set(id, user);
  res.status(201).json({ success: true, data: user });
});

// PUT /api/users/:id
router.put('/:id', (req: Request, res: Response) => {
  const existing = users.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const updated = { ...existing, ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  users.set(existing.id, updated);
  res.json({ success: true, data: updated });
});

export default router;
