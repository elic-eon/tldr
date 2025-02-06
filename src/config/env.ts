import { config } from 'dotenv';

config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  ENABLE_RAG: process.env.ENABLE_RAG === 'true',
  POSTGRES_HOST: process.env.POSTGRES_HOST!,
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_DB: process.env.POSTGRES_DB!,
  POSTGRES_USER: process.env.POSTGRES_USER!,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
} as const; 