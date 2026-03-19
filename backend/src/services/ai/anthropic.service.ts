import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { ModelOutput } from '../../types';
import { buildPrompt } from './prompt';

let client: Anthropic | null = null;

function getClient() {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function callAnthropic(resumeText: string, jdText: string): Promise<ModelOutput> {
  const prompt = buildPrompt(resumeText, jdText);
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
  return JSON.parse(stripMarkdown(raw)) as ModelOutput;
}
