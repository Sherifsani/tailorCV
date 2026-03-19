import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ModelOutput {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  tailoredResume: string;
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
