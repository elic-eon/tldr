import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({
  path: path.resolve(process.cwd(), '.env.test')
});

// Fallback values if .env.test is missing any variables
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'test_db';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'test_user';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'test_password'; 