import { StorageService } from './storageService';
import { PostgresVectorStore } from './vectorStore';
import { StoredDocument } from './types';
import { ENV } from '../config/env';
import { ThreadMessage } from './types';
import Container, { Service } from "typedi";
import { SlackService } from './slackService';
import { OpenAIService } from './openaiService';

@Service()
export class AssistantService {
    private storageService: StorageService = Container.get(StorageService);
    private slackService: SlackService = Container.get(SlackService);
    private openaiService: OpenAIService = Container.get(OpenAIService);

  async summarizeThread(threadTs: string, channelId: string): Promise<string> {
    try {
      // 1. Fetch all messages in the thread
      const messages = await this.fetchThreadMessages(threadTs, channelId);
      
      // 2. Format messages for summarization
      const formattedThread = this.formatMessagesForAI(messages);

      // 3. Generate summary using OpenAI
      const summary = await this.openaiService.getSummary(formattedThread);

      return summary;
    } catch (error) {
      console.error('Error summarizing thread:', error);
      throw error;
    }
  }

  async getSuggestions(query: string, channelId: string, threadTs: string): Promise<string> {
    try {
      let contextMessages: ThreadMessage[] = [];
      
      // Get current thread messages
      const threadMessages = await this.fetchThreadMessages(threadTs, channelId);
      contextMessages.push(...threadMessages);

      // Get recent messages and their threads
      const recentMessages = await this.slackService.getRecentMessagesAndThreads(channelId);
      contextMessages.push(...recentMessages);

      let formattedContext = '';

      if (ENV.ENABLE_RAG) {
        // Use both vector search and message context
        const similarDocs = await this.storageService.searchSimilarMessages(query);
        const vectorContext = this.formatContextForAI(similarDocs);
        const messageContext = this.formatMessagesForAI(contextMessages);
        
        formattedContext = `
Recent conversations:
${messageContext}

Similar past messages:
${vectorContext}`;
      } else {
        // Use only message context
        formattedContext = this.formatMessagesForAI(contextMessages);
      }
      
      // Get suggestions from OpenAI
      return await this.openaiService.getSuggestions(formattedContext, query);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // Add method to store new messages - only if RAG is enabled
  async storeNewMessage(message: {
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

  private async fetchThreadMessages(threadTs: string, channelId: string): Promise<ThreadMessage[]> {
    return this.slackService.getThreadReplies(channelId, threadTs);
  }

  private formatContextForAI(documents: StoredDocument[]): string {
    return documents
      .map(doc => `Message from ${doc.metadata.user} at ${doc.metadata.timestamp}:
        ${doc.pageContent}`)
      .join('\n\n');
  }

  private formatMessagesForAI(messages: ThreadMessage[]): string {
    return messages
      .map((msg, index) => {
        const isFirstMessage = index === 0 ? '[THREAD START] ' : '';
        // Format user mentions consistently with Slack's format
        return `${isFirstMessage}<@${msg.user}> (${msg.timestamp}):
${msg.text}`;
      })
      .join('\n\n');
  }
} 