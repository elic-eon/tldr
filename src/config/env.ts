import { config } from 'dotenv';

config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  ENABLE_RAG: process.env.ENABLE_RAG === 'true',
} as const; 