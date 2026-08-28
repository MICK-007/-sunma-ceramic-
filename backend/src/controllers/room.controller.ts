import { Request, Response } from 'express';
import { store } from '../repositories/store';

export const getRooms = (req: Request, res: Response) => {
  return res.json({ success: true, data: store.rooms });
};

export const getRoomBySlug = (req: Request, res: Response) => {
  const { slug } = req.params;
  const room = store.rooms.find(r => r.slug === slug || r.id === slug);

  if (!room) {
    return res.status(404).json({ success: false, message: 'Room simulation preset not found.' });
  }

  return res.json({ success: true, data: room });
};
