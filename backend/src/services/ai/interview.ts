import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, aiProviders } from '../../config/env';

let genAI: GoogleGenerativeAI | null = null;
function getGemini() {
  if (!genAI) genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

export interface RoadmapGap {
  skill: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  why: string;
  steps: string[];
  resources: string[];
  timeframe: string;
}

export interface LearningRoadmap {
  summary: string;
  gaps: RoadmapGap[];
}

function buildRoadmapPrompt(resumeText: string, jdText: string): string {
  return `You are a senior engineering career coach. Analyze the gap between this candidate's resume and the job description, then produce a concrete learning roadmap to close those gaps.

Respond with ONLY a raw JSON object matching this exact schema:
{
  "summary": "<2 sentences: what the candidate is missing overall and the priority focus area>",
  "gaps": [
    {
      "skill": "<skill or knowledge area>",
      "priority": "critical" | "important" | "nice-to-have",
      "why": "<1 sentence: why this gap matters specifically for this role>",
      "steps": ["<concrete learning step>", ...],
      "resources": ["<specific resource: course, doc, book, project>", ...],
      "timeframe": "<realistic estimate e.g. '1-2 weeks', '1 month'>"
    }
  ]
}

Rules:
- Include 3-6 gaps ordered by priority (critical first)
- Only include real gaps — skills clearly required by JD but absent or weak in resume
- Steps should be specific and actionable (not vague like "learn X")
- Resources should be real and specific (e.g. "Kubernetes official docs — concepts section", "freeCodeCamp REST API course")
- Timeframe should be realistic for someone studying part-time
- If the candidate already meets all requirements, return 1 gap with skill "Polish & depth" and nice-to-have priority

RESUME:
---
${resumeText.slice(0, 8000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 5000)}
---`;
}

export async function generateRoadmap(resumeText: string, jdText: string): Promise<LearningRoadmap> {
  const prompt = buildRoadmapPrompt(resumeText, jdText);

  if (aiProviders.gemini) {
    const model = getGemini().getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 2000 },
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as LearningRoadmap;
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
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim()) as LearningRoadmap;
  }

  if (aiProviders.gpt) {
    const OpenAI = await import('openai');
    const client = new OpenAI.default({ apiKey: env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });
    return JSON.parse(res.choices[0].message.content ?? '{}') as LearningRoadmap;
  }

  throw new Error('No AI provider configured');
}
