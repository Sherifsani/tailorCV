import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createRoadmap, listRoadmaps, getRoadmap, deleteRoadmap } from '../controllers/roadmap.controller';

const router = Router();
router.use(authenticate as any);

router.post('/', createRoadmap as any);
router.get('/', listRoadmaps as any);
router.get('/:id', getRoadmap as any);
router.delete('/:id', deleteRoadmap as any);

export default router;
