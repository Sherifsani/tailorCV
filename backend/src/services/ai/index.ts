import { CompareResult, ModelOutput, ModelResult } from '../../types';
import { aiProviders } from '../../config/env';
import { callOpenAI } from './openai.service';
import { callAnthropic } from './anthropic.service';
import { callGemini } from './gemini.service';

const TIMEOUT_MS = 45000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function normalizeSettled(result: PromiseSettledResult<ModelOutput>): ModelResult {
  if (result.status === 'fulfilled') {
    return { data: result.value, error: null };
  }
  return { data: null, error: result.reason?.message ?? 'Unknown error' };
}

function notConfigured(model: string): ModelResult {
  return { data: null, error: `${model} API key not configured` };
}

export async function runComparison(resumeText: string, jdText: string): Promise<CompareResult> {
  const calls = [
    aiProviders.gpt
      ? withTimeout(callOpenAI(resumeText, jdText), TIMEOUT_MS)
      : Promise.reject(new Error('OpenAI API key not configured')),

    aiProviders.claude
      ? withTimeout(callAnthropic(resumeText, jdText), TIMEOUT_MS)
      : Promise.reject(new Error('Anthropic API key not configured')),

    aiProviders.gemini
      ? withTimeout(callGemini(resumeText, jdText), TIMEOUT_MS)
      : Promise.reject(new Error('Gemini API key not configured')),
  ] as [Promise<ModelOutput>, Promise<ModelOutput>, Promise<ModelOutput>];

  const [gptResult, claudeResult, geminiResult] = await Promise.allSettled(calls);

  return {
    gpt: aiProviders.gpt ? normalizeSettled(gptResult) : notConfigured('OpenAI'),
    claude: aiProviders.claude ? normalizeSettled(claudeResult) : notConfigured('Anthropic'),
    gemini: aiProviders.gemini ? normalizeSettled(geminiResult) : notConfigured('Gemini'),
  };
}
