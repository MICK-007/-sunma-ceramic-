import { Request, Response } from 'express';
import { store } from '../repositories/store';

export const getPromotions = (req: Request, res: Response) => {
  const active = store.promotions.filter(p => p.isActive);
  return res.json({ success: true, data: active });
};
