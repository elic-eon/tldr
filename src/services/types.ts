export interface StoredDocument {
  pageContent: string;
  metadata: Record<string, any>;
}

export type EmbeddingVector = number[];

export interface VectorStore {
  addDocuments(documents: StoredDocument[]): Promise<void>;
  similaritySearch(query: string, k?: number): Promise<StoredDocument[]>;
}

export interface SearchResult {
  document: StoredDocument;
  score: number;
}

export interface ThreadMessage {
  user: string;
  text: string;
  timestamp: string;
} 