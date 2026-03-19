import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadResume, listResumes, getResume, deleteResume } from '../controllers/resume.controller';

const router = Router();

router.use(authenticate as any);

router.post('/', upload.single('resume'), uploadResume as any);
router.get('/', listResumes as any);
router.get('/:id', getResume as any);
router.delete('/:id', deleteResume as any);

export default router;
