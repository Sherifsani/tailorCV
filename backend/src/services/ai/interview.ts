import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { aiProviders } from '../../config/env';

let genAI: GoogleGenerativeAI | null = null;
function getGemini() {
  if (!genAI) genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

export interface InterviewQA {
  question: string;
  answer: string;
  type: 'behavioral' | 'technical' | 'situational';
}

function buildInterviewPrompt(resumeText: string, jdText: string): string {
  return `You are an expert interview coach. Based on this resume and job description, generate 8 likely interview questions with concise model answers tailored to this candidate.

Respond with ONLY a raw JSON array:
[
  {
    "question": "<the interview question>",
    "answer": "<a strong, concise model answer in first person, 2-4 sentences, referencing specific experience from the resume where possible>",
    "type": "behavioral" | "technical" | "situational"
  }
]

Mix of types: 3 behavioral, 3 technical (based on required skills in JD), 2 situational.
Focus on gaps between the resume and JD — interviewers often probe those areas.

RESUME:
---
${resumeText.slice(0, 8000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 5000)}
---`;
}

export async function generateInterviewPrep(resumeText: string, jdText: string): Promise<InterviewQA[]> {
  const prompt = buildInterviewPrompt(resumeText, jdText);

  if (aiProviders.gemini) {
    const model = getGemini().getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 2000 },
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  if (aiProviders.claude) {
    const Anthropic = await import('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (msg.content[0] as any).text as string;
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
  }

  if (aiProviders.gpt) {
    const OpenAI = await import('openai');
    const client = new OpenAI.default({ apiKey: env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You return a JSON object with a "questions" array.' },
        { role: 'user', content: prompt },
      ],
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? '{}');
    return parsed.questions ?? parsed;
  }

  throw new Error('No AI provider configured');
}
