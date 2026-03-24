import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { runComparison } from '../services/ai';
import { scoreResume } from '../services/ai/score';
import { generateRoadmap } from '../services/ai/interview';
import { prisma } from '../lib/prisma';
import { aiProviders } from '../config/env';
import { ModelOutput } from '../types';
import { ResumeData } from '../types/resume';
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

    if (!output?.resume) {
      res.status(400).json({ error: 'No tailored resume available for this model' });
      return;
    }

    const jobLabel = [result.jobDescription.company, result.jobDescription.title].filter(Boolean).join(' - ');
    const filename = `resume-${model}-${jobLabel || 'tailored'}.pdf`.replace(/\s+/g, '_').slice(0, 80);

    const html = renderTemplate('jakes', output.resume as ResumeData);
    const pdf = await htmlToPdf(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}

const resumeRenderSchema = z.object({
  resumeData: z.object({
    name: z.string(),
    contact: z.array(z.string()),
    sections: z.array(z.object({
      title: z.string(),
      items: z.array(z.any()),
    })),
  }),
  template: z.enum(['classic', 'jakes', 'minimal']).default('jakes'),
});

export async function previewResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { resumeData, template } = resumeRenderSchema.parse(req.body);
    const html = renderTemplate(template as TemplateId, resumeData as ResumeData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
}

export async function downloadResumePdf(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { resumeData, template } = resumeRenderSchema.parse(req.body);
    const html = renderTemplate(template as TemplateId, resumeData as ResumeData);
    const pdf = await htmlToPdf(html);

    const filename = `${resumeData.name.replace(/\s+/g, '_')}_resume_${template}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}

export async function scoreOriginal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { resumeId, jobDescriptionId } = z.object({
      resumeId: z.string(),
      jobDescriptionId: z.string(),
    }).parse(req.body);

    const [resume, jd] = await Promise.all([
      prisma.resume.findFirst({ where: { id: resumeId, userId: req.user!.id } }),
      prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId: req.user!.id } }),
    ]);

    if (!resume || !jd) { res.status(404).json({ error: 'Resume or JD not found' }); return; }

    const result = await scoreResume(resume.parsedText, jd.rawText);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function interviewPrep(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await prisma.aIResult.findFirst({
      where: { id: req.params.id },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!result || result.resume.userId !== req.user!.id) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    const roadmap = await generateRoadmap(result.resume.parsedText, result.jobDescription.rawText);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
}

export async function downloadCoverLetterPdf(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { text, candidateName } = z.object({
      text: z.string().min(10),
      candidateName: z.string().optional(),
    }).parse(req.body);

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const paragraphs = escaped.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 11pt;
    color: #111;
    background: #fff;
    padding: 48pt 56pt;
    line-height: 1.7;
  }
  .name {
    font-size: 14pt;
    font-weight: 600;
    margin-bottom: 24pt;
    color: #000;
  }
  p { margin-bottom: 12pt; }
  p:last-child { margin-bottom: 0; }
</style>
</head>
<body>
  ${candidateName ? `<div class="name">${candidateName}</div>` : ''}
  ${paragraphs}
</body>
</html>`;

    const pdf = await htmlToPdf(html);
    const safeName = (candidateName ?? 'cover_letter').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_cover_letter.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}

export function healthCheck(_req: AuthRequest, res: Response) {
  res.json({ providers: aiProviders });
}
