import type { WarrantyInfo } from '../../types.js';

export function computeWarrantyStatus(w: WarrantyInfo): 'active' | 'expiring' | 'expired' {
  const now = new Date();
  const end = new Date(w.endDate || '');
  if (end < now) return 'expired';
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 90) return 'expiring';
  return 'active';
}
