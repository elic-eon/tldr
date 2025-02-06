import { StorageService } from './storageService';
import { PostgresVectorStore } from './vectorStore';
import { StoredDocument } from './types';
import { ENV } from '../config/env';

interface ThreadMessage {
  user: string;
  text: string;
  timestamp: string;
}

export class AIService {
  private static storageService = new StorageService(new PostgresVectorStore());

  static async summarizeThread(threadTs: string, channelId: string): Promise<string> {
    try {
      // 1. Fetch all messages in the thread
      const messages = await this.fetchThreadMessages(threadTs, channelId);
      
      // 2. Format messages for summarization
      const formattedThread = this.formatMessagesForAI(messages);
      
      // 3. Generate summary using AI
      // TODO: Integrate with your preferred AI service (OpenAI, Claude, etc.)
      const summary = "Thread summary placeholder";
      
      return summary;
    } catch (error) {
      console.error('Error summarizing thread:', error);
      throw error;
    }
  }

  static async getSuggestions(query: string, channelId: string): Promise<string> {
    try {
      let prompt = query;

      if (ENV.ENABLE_RAG) {
        // Only fetch and use context if RAG is enabled
        const similarDocs = await this.storageService.searchSimilarMessages(query);
        const context = this.formatContextForAI(similarDocs);
        
        prompt = `
          Based on the following context:
          ${context}
          
          Please provide suggestions for this query:
          ${query}
        `;
      }
      
      // TODO: Send to AI service
      const suggestions = "AI-generated suggestions" + (ENV.ENABLE_RAG ? " with context" : "");
      
      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // Add method to store new messages - only if RAG is enabled
  static async storeNewMessage(message: {
    id: string;
    text: string;
    channelId: string;
    threadTs?: string;
    user: string;
    timestamp: string;
  }): Promise<void> {
    if (ENV.ENABLE_RAG) {
      await this.storageService.storeMessage(message);
    }
  }

  private static async fetchThreadMessages(threadTs: string, channelId: string): Promise<ThreadMessage[]> {
    // TODO: Implement thread message fetching using Slack API
    return [];
  }

  private static formatContextForAI(documents: StoredDocument[]): string {
    return documents
      .map(doc => `Message from ${doc.metadata.user} at ${doc.metadata.timestamp}:
        ${doc.pageContent}`)
      .join('\n\n');
  }

  private static formatMessagesForAI(messages: ThreadMessage[]): string {
    // TODO: Implement message formatting for AI input
    return '';
  }
} 