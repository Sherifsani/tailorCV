import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { aiProviders } from '../../config/env';

let genAI: GoogleGenerativeAI | null = null;
function getGemini() {
  if (!genAI) genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

function buildScorePrompt(resumeText: string, jdText: string): string {
  return `You are a strict technical recruiter. Score how well this resume matches the job description.

Respond with ONLY a raw JSON object:
{ "score": <integer 0-100>, "summary": "<one sentence honest assessment>" }

Scoring rules:
- 0-30: Poor fit. Missing most required skills.
- 31-50: Weak fit. Significant gaps.
- 51-65: Moderate fit. Meets some requirements.
- 66-79: Good fit. Minor gaps.
- 80-89: Strong fit.
- 90-100: Exceptional — near-perfect match only.
- Missing core required technical skills → score cannot exceed 50
- Zero domain experience for domain-specific role → score cannot exceed 40

RESUME:
---
${resumeText.slice(0, 8000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 5000)}
---`;
}

export async function scoreResume(resumeText: string, jdText: string): Promise<{ score: number; summary: string }> {
  const prompt = buildScorePrompt(resumeText, jdText);

  // Use whichever provider is configured — prefer gemini (fast/cheap), fallback to others
  if (aiProviders.gemini) {
    const model = getGemini().getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 200 },
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  if (aiProviders.claude) {
    const Anthropic = await import('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
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
      max_tokens: 200,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });
    return JSON.parse(res.choices[0].message.content ?? '{}');
  }

  throw new Error('No AI provider configured');
}
