import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as resumeService from '../services/resume.service';

export async function uploadResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const resume = await resumeService.uploadResume(req.user!.id, req.file);
    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resumes = await resumeService.listResumes(req.user!.id);
    res.json(resumes);
  } catch (err) {
    next(err);
  }
}

export async function getResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resume = await resumeService.getResume(req.params.id, req.user!.id);
    res.json(resume);
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await resumeService.deleteResume(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
