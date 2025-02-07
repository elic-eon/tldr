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
} 