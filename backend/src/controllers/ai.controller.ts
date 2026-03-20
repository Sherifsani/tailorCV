import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { runComparison } from '../services/ai';
import { prisma } from '../lib/prisma';
import { aiProviders } from '../config/env';
import { generateResumePdf } from '../services/pdf.service';
import { ModelOutput } from '../types';
import { parseResume } from '../services/resume-parser.service';
import { renderTemplate, TemplateId } from '../services/templates/index';
import { htmlToPdf } from '../services/puppeteer.service';

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

export async function downloadPdf(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { model } = z.object({ model: z.enum(['gpt', 'claude', 'gemini']) }).parse(req.query);

    const result = await prisma.aIResult.findFirst({
      where: { id: req.params.id },
      include: {
        resume: { select: { userId: true } },
        jobDescription: { select: { title: true, company: true } },
      },
    });

    if (!result || result.resume.userId !== req.user!.id) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    const outputMap: Record<string, string> = {
      gpt: result.gptOutput,
      claude: result.claudeOutput,
      gemini: result.geminiOutput,
    };

    const parsed = JSON.parse(outputMap[model]) as { data?: ModelOutput; error?: string } | ModelOutput;
    const output: ModelOutput | null = 'data' in parsed && parsed.data ? parsed.data : parsed as ModelOutput;

    if (!output?.tailoredResume) {
      res.status(400).json({ error: 'No tailored resume available for this model' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
    const jobLabel = [result.jobDescription.company, result.jobDescription.title].filter(Boolean).join(' - ');
    const filename = `resume-${model}-${jobLabel || 'tailored'}.pdf`.replace(/\s+/g, '_').slice(0, 80);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const pdfStream = generateResumePdf(output.tailoredResume, user?.name ?? undefined);
    pdfStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

const resumeRenderSchema = z.object({
  text: z.string().min(10),
  template: z.enum(['classic', 'jakes', 'minimal']).default('jakes'),
  name: z.string().optional(),
});

export async function previewResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { text, template, name } = resumeRenderSchema.parse(req.body);
    const parsed = parseResume(text, name);
    const html = renderTemplate(template as TemplateId, parsed);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
}

export async function downloadResumePdf(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { text, template, name } = resumeRenderSchema.parse(req.body);
    const parsed = parseResume(text, name);
    const html = renderTemplate(template as TemplateId, parsed);
    const pdf = await htmlToPdf(html);

    const filename = `${parsed.name.replace(/\s+/g, '_')}_resume_${template}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}

export function healthCheck(_req: AuthRequest, res: Response) {
  res.json({ providers: aiProviders });
}
