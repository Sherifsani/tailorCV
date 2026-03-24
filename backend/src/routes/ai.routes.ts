import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  compare, getResult, selectModel, downloadPdf,
  previewResume, downloadResumePdf, downloadCoverLetterPdf,
  scoreOriginal, healthCheck,
} from '../controllers/ai.controller';

const router = Router();

router.get('/health', healthCheck as any);
router.use(authenticate as any);

router.post('/compare', compare as any);
router.post('/score', scoreOriginal as any);
router.get('/results/:id', getResult as any);
router.patch('/results/:id/select', selectModel as any);
router.get('/results/:id/pdf', downloadPdf as any);
router.post('/resume/preview', previewResume as any);
router.post('/resume/pdf', downloadResumePdf as any);
router.post('/cover-letter/pdf', downloadCoverLetterPdf as any);

export default router;
