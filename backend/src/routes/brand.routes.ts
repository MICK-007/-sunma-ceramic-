import { Router } from 'express';
import { getBrands } from '../controllers/product.controller';

const router = Router();

router.get('/', getBrands);

export default router;
