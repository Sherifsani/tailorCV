import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
};

export const aiProviders = {
  gpt: !!env.OPENAI_API_KEY,
  claude: !!env.ANTHROPIC_API_KEY,
  gemini: !!env.GEMINI_API_KEY,
};
