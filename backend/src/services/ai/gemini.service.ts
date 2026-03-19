import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { ModelOutput } from '../../types';
import { buildPrompt } from './prompt';

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

export async function callGemini(resumeText: string, jdText: string): Promise<ModelOutput> {
  const prompt = buildPrompt(resumeText, jdText);
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 4000,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as ModelOutput;
}
