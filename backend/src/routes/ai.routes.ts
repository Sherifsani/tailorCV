import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { compare, getResult, selectModel, healthCheck } from '../controllers/ai.controller';

const router = Router();

router.get('/health', healthCheck as any);
router.use(authenticate as any);

router.post('/compare', compare as any);
router.get('/results/:id', getResult as any);
router.patch('/results/:id/select', selectModel as any);

export default router;
