import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

import { ResumeData } from './resume';
export { ResumeData };

export interface ModelOutput {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  resume: ResumeData;   // structured — replaces flat tailoredResume string
  coverLetter: string;
  reasoning: string;
}

export interface ModelResult {
  data: ModelOutput | null;
  error: string | null;
}

export interface CompareResult {
  gpt: ModelResult;
  claude: ModelResult;
  gemini: ModelResult;
}
