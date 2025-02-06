import { Pool } from 'pg';
import { StoredDocument, EmbeddingVector, VectorStore } from './types';
import { OpenAIEmbeddings } from './embeddings';
import { ENV } from '../config/env';

export class PostgresVectorStore implements VectorStore {
  private pool: Pool;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.pool = new Pool({
      host: ENV.POSTGRES_HOST,
      port: ENV.POSTGRES_PORT,
      database: ENV.POSTGRES_DB,
      user: ENV.POSTGRES_USER,
      password: ENV.POSTGRES_PASSWORD,
    });
    this.embeddings = new OpenAIEmbeddings();
  }

  async addDocuments(documents: StoredDocument[]): Promise<void> {
    const embeddings = await this.embeddings.embedDocuments(
      documents.map(doc => doc.pageContent)
    );

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const embedding = embeddings[i];

        await client.query(
          `INSERT INTO messages (
            content,
            embedding,
            metadata,
            created_at
          ) VALUES ($1, $2, $3, $4)`,
          [
            doc.pageContent,
            embedding,
            doc.metadata,
            new Date(),
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async similaritySearch(query: string, k: number = 5): Promise<StoredDocument[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const result = await this.pool.query(
      `SELECT 
        content,
        metadata,
        1 - (embedding <=> $1) as similarity
      FROM messages
      ORDER BY embedding <=> $1
      LIMIT $2`,
      [queryEmbedding, k]
    );

    return result.rows.map(row => ({
      pageContent: row.content,
      metadata: row.metadata,
    }));
  }
} 