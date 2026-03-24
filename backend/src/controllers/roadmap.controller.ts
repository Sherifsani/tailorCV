import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { prisma } from '../lib/prisma';
import { generateRoadmap } from '../services/ai/interview';

export async function createRoadmap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { aiResultId } = z.object({ aiResultId: z.string() }).parse(req.body);

    const aiResult = await prisma.aIResult.findFirst({
      where: { id: aiResultId },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!aiResult || aiResult.resume.userId !== req.user!.id) {
      res.status(404).json({ error: 'AI result not found' });
      return;
    }

    const roadmapData = await generateRoadmap(aiResult.resume.parsedText, aiResult.jobDescription.rawText);

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: req.user!.id,
        aiResultId,
        jobTitle: aiResult.jobDescription.title ?? null,
        company: aiResult.jobDescription.company ?? null,
        summary: roadmapData.summary,
        gaps: JSON.stringify(roadmapData.gaps),
      },
    });

    res.status(201).json({
      ...roadmap,
      gaps: roadmapData.gaps,
    });
  } catch (err) {
    next(err);
  }
}

export async function listRoadmaps(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(roadmaps.map((r) => ({
      ...r,
      gaps: JSON.parse(r.gaps),
    })));
  } catch (err) {
    next(err);
  }
}

export async function getRoadmap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const roadmap = await prisma.roadmap.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!roadmap) { res.status(404).json({ error: 'Roadmap not found' }); return; }

    res.json({ ...roadmap, gaps: JSON.parse(roadmap.gaps) });
  } catch (err) {
    next(err);
  }
}

export async function deleteRoadmap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const roadmap = await prisma.roadmap.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!roadmap) { res.status(404).json({ error: 'Roadmap not found' }); return; }

    await prisma.roadmap.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
