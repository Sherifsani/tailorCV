import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import jobsRoutes from './routes/jobs.routes';
import aiRoutes from './routes/ai.routes';
import trackerRoutes from './routes/tracker.routes';
import roadmapRoutes from './routes/roadmap.routes';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/tracker', trackerRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`tailorCV backend running on http://localhost:${env.PORT}`);
});
