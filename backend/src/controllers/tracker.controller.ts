import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { prisma } from '../lib/prisma';

const createSchema = z.object({
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  jobUrl: z.string().url().optional(),
  resumeId: z.string().optional(),
  aiResultId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

export async function createApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = createSchema.parse(req.body);
    const app = await prisma.application.create({
      data: { ...body, userId: req.user!.id },
    });
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
}

export async function createFromResult(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { aiResultId } = z.object({ aiResultId: z.string() }).parse(req.body);
    const userId = req.user!.id;

    const aiResult = await prisma.aIResult.findFirst({
      where: { id: aiResultId },
      include: {
        resume: { select: { userId: true, id: true } },
        jobDescription: true,
      },
    });

    if (!aiResult || aiResult.resume.userId !== userId) {
      res.status(404).json({ error: 'AI result not found' });
      return;
    }

    const jd = aiResult.jobDescription;
    const app = await prisma.application.create({
      data: {
        userId,
        resumeId: aiResult.resumeId,
        aiResultId,
        company: jd.company || 'Unknown Company',
        jobTitle: jd.title || 'Unknown Role',
        jobUrl: jd.sourceUrl ?? undefined,
        status: 'applied',
      },
    });

    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
}

export async function listApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const apps = await prisma.application.findMany({
      where: { userId: req.user!.id },
      include: { resume: { select: { filename: true } } },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

export async function updateApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = updateSchema.parse(req.body);
    const app = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const app = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }

    await prisma.application.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
