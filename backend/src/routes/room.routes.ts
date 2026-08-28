import { Router } from 'express';
import { getRooms, getRoomBySlug } from '../controllers/room.controller';

const router = Router();

router.get('/', getRooms);
router.get('/:slug', getRoomBySlug);

export default router;
