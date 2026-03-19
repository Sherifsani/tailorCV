import OpenAI from 'openai';
import { env } from '../../config/env';
import { ModelOutput } from '../../types';
import { buildPrompt } from './prompt';

let client: OpenAI | null = null;

function getClient() {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

export async function callOpenAI(resumeText: string, jdText: string): Promise<ModelOutput> {
  const prompt = buildPrompt(resumeText, jdText);
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 4000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(content) as ModelOutput;
}
