import OpenAI from 'openai';
import { ENV } from '../config/env';

export class OpenAIEmbeddings {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
    });
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    return response.data.map(item => item.embedding);
  }
} 