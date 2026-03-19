import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as jobsService from '../services/jobs.service';

const manualSchema = z.object({
  text: z.string().min(50),
  title: z.string().optional(),
  company: z.string().optional(),
});

const scrapeSchema = z.object({
  url: z.string().url(),
});

export async function createManual(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = manualSchema.parse(req.body);
    const job = await jobsService.createManualJob(req.user!.id, body.text, body.title, body.company);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function scrape(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { url } = scrapeSchema.parse(req.body);
    const result = await jobsService.tryScrapeJob(req.user!.id, url);
    if (!result.success) {
      res.status(200).json({ success: false, reason: result.reason });
      return;
    }
    res.status(201).json(result.job);
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const jobs = await jobsService.listJobs(req.user!.id);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await jobsService.getJob(req.params.id, req.user!.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
}
