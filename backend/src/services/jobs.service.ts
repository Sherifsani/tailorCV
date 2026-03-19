import { prisma } from '../lib/prisma';
import { scrapeJobDescription } from './scraper.service';

export async function createManualJob(
  userId: string,
  text: string,
  title?: string,
  company?: string
) {
  return prisma.jobDescription.create({
    data: { userId, sourceType: 'manual', rawText: text, title, company },
  });
}

export async function tryScrapeJob(
  userId: string,
  url: string
): Promise<{ success: true; job: any } | { success: false; reason: string }> {
  const result = await scrapeJobDescription(url);

  if (!result.success) {
    return { success: false, reason: result.reason ?? 'Could not extract job description. Please paste the text manually.' };
  }

  const job = await prisma.jobDescription.create({
    data: {
      userId,
      sourceType: 'url',
      sourceUrl: url,
      rawText: result.text,
      title: result.title,
      company: result.company,
    },
  });

  return { success: true, job };
}

export async function listJobs(userId: string) {
  return prisma.jobDescription.findMany({
    where: { userId },
    select: { id: true, title: true, company: true, sourceType: true, sourceUrl: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function getJob(id: string, userId: string) {
  const job = await prisma.jobDescription.findFirst({ where: { id, userId } });
  if (!job) throw new Error('Job description not found');
  return job;
}
