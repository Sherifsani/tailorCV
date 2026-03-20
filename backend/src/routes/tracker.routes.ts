import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createApplication, createFromResult, listApplications, updateApplication, deleteApplication } from '../controllers/tracker.controller';

const router = Router();

router.use(authenticate as any);

router.post('/', createApplication as any);
router.post('/from-result', createFromResult as any);
router.get('/', listApplications as any);
router.patch('/:id', updateApplication as any);
router.delete('/:id', deleteApplication as any);

export default router;
