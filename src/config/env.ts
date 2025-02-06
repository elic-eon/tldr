import { config } from 'dotenv';

config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || '',
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN || '',
} as const; 