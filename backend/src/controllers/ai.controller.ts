import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { runComparison } from '../services/ai';
import { prisma } from '../lib/prisma';
import { aiProviders } from '../config/env';

const compareSchema = z.object({
  resumeId: z.string(),
  jobDescriptionId: z.string(),
});

export async function compare(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { resumeId, jobDescriptionId } = compareSchema.parse(req.body);
    const userId = req.user!.id;

    const [resume, jd] = await Promise.all([
      prisma.resume.findFirst({ where: { id: resumeId, userId } }),
      prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId } }),
    ]);

    if (!resume) { res.status(404).json({ error: 'Resume not found' }); return; }
    if (!jd) { res.status(404).json({ error: 'Job description not found' }); return; }

    const result = await runComparison(resume.parsedText, jd.rawText);

    const aiResult = await prisma.aIResult.create({
      data: {
        resumeId,
        jobDescriptionId,
        gptOutput: JSON.stringify(result.gpt),
        claudeOutput: JSON.stringify(result.claude),
        geminiOutput: JSON.stringify(result.gemini),
      },
    });

    res.json({
      id: aiResult.id,
      gpt: result.gpt,
      claude: result.claude,
      gemini: result.gemini,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResult(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await prisma.aIResult.findFirst({
      where: { id: req.params.id },
      include: { resume: { select: { userId: true } } },
    });

    if (!result || result.resume.userId !== req.user!.id) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    res.json({
      id: result.id,
      gpt: JSON.parse(result.gptOutput),
      claude: JSON.parse(result.claudeOutput),
      gemini: JSON.parse(result.geminiOutput),
      selectedModel: result.selectedModel,
      createdAt: result.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function selectModel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { model } = z.object({ model: z.enum(['gpt', 'claude', 'gemini']) }).parse(req.body);

    const result = await prisma.aIResult.findFirst({
      where: { id: req.params.id },
      include: { resume: { select: { userId: true } } },
    });

    if (!result || result.resume.userId !== req.user!.id) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    const updated = await prisma.aIResult.update({
      where: { id: req.params.id },
      data: { selectedModel: model },
    });

    res.json({ id: updated.id, selectedModel: updated.selectedModel });
  } catch (err) {
    next(err);
  }
}

export function healthCheck(_req: AuthRequest, res: Response) {
  res.json({ providers: aiProviders });
}
