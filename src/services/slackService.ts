import { WebClient } from '@slack/web-api';
import { Service } from "typedi";
import { ENV } from '../config/env';
import { ThreadMessage } from './types';

@Service()
export class SlackService {
  private slackClient: WebClient;
  private botUserId: string = '';

  constructor() {
    this.slackClient = new WebClient(ENV.SLACK_BOT_TOKEN);
    this.initBotUserId();
  }

  private async initBotUserId() {
    try {
      const authInfo = await this.slackClient.auth.test();
      this.botUserId = authInfo.user_id as string;
    } catch (error) {
      console.error('Error getting bot user ID:', error);
    }
  }

  async sendMessage(channel: string, text: string, threadTs?: string) {
    return this.slackClient.chat.postMessage({
      channel,
      text,
      thread_ts: threadTs,
    });
  }

  async getThreadReplies(channelId: string, threadTs: string): Promise<ThreadMessage[]> {
    try {
      const result = await this.slackClient.conversations.replies({
        channel: channelId,
        ts: threadTs,
      });

      if (!result.messages) {
        return [];
      }

      const botCommandRegex = new RegExp(`<@${this.botUserId}>\\s*(summarize|suggest)`, 'i');

      return result.messages
        .filter(message => 
          message.user !== this.botUserId && 
          !(message.text || '').match(botCommandRegex)
        )
        .map(message => ({
          user: message.user || 'unknown',
          text: message.text || '',
          timestamp: message.ts || ''
        }));
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      throw new Error('Failed to fetch thread messages');
    }
  }

  async getRecentMessagesAndThreads(channelId: string): Promise<ThreadMessage[]> {
    try {
      // Get recent messages
      const result = await this.slackClient.conversations.history({
        channel: channelId,
        oldest: (Date.now() / 1000 - 86400 * 3).toString(), // 3 days ago
        inclusive: true,
      });

      
      if (!result.messages) {
        return [];
      }

      const botCommandRegex = new RegExp(`<@${this.botUserId}>\\s*(summarize|suggest)`, 'i');
      const messages: ThreadMessage[] = [];

      // Process each message and its thread if exists
      for (const message of result.messages) {
        if (message.user === this.botUserId) continue;
        if (message.text && message.text.match(botCommandRegex)) continue;

        messages.push({
          user: message.user || 'unknown',
          text: message.text || '',
          timestamp: message.ts || ''
        });

        // If message has replies, fetch them
        if (message.thread_ts) {
          const threadReplies = await this.getThreadReplies(channelId, message.thread_ts);
          messages.push(...threadReplies);
        }
      }

      return messages;
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      throw new Error('Failed to fetch recent messages');
    }
  }
} 