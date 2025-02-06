import { MessageEvent, AppMentionEvent } from '@slack/web-api';
import { WebClient } from '@slack/web-api';
import { ENV } from '../config/env';

const slack = new WebClient(ENV.SLACK_BOT_TOKEN);

export class MessageService {
  static async handleMessage(event: MessageEvent) {
    console.log('Received message:', event);

    try {
      // Handle regular messages
      if ('text' in event) {
        console.log('Received message:', event.text);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  static async handleAppMention(event: AppMentionEvent) {
    try {
      // Handle when bot is mentioned
      await slack.chat.postMessage({
        channel: event.channel,
        text: `Hello! You mentioned me with: ${event.text}`,
        thread_ts: event.thread_ts || event.ts,
      });
    } catch (error) {
      console.error('Error handling app mention:', error);
    }
  }
} 