import { StoredDocument } from './types';
import { Service } from 'typedi';

export interface VectorStore {
  addDocuments(documents: StoredDocument[]): Promise<void>;
  similaritySearch(query: string, k?: number): Promise<StoredDocument[]>;
}

@Service()
export class StorageService {
  private vectorStore: VectorStore;
  
  constructor(vectorStore: VectorStore) {
    this.vectorStore = vectorStore;
  }

  async storeMessage(message: {
    id: string;
    text: string;
    channelId: string;
    threadTs?: string;
    user: string;
    timestamp: string;
  }): Promise<void> {
    const document: StoredDocument = {
      pageContent: message.text,
      metadata: {
        messageId: message.id,
        channelId: message.channelId,
        threadTs: message.threadTs,
        user: message.user,
        timestamp: message.timestamp,
      },
    };

    await this.vectorStore.addDocuments([document]);
  }

  async searchSimilarMessages(query: string, k: number = 5): Promise<StoredDocument[]> {
    return await this.vectorStore.similaritySearch(query, k);
  }
} 