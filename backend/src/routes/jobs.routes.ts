import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createManual, scrape, listJobs, getJob } from '../controllers/jobs.controller';

const router = Router();

router.use(authenticate as any);

router.post('/manual', createManual as any);
router.post('/scrape', scrape as any);
router.get('/', listJobs as any);
router.get('/:id', getJob as any);

export default router;
