import { MessageEvent, AppMentionEvent } from '@slack/web-api';
import { WebClient } from '@slack/web-api';
import { ENV } from '../config/env';
import { AIService } from './aiService';

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
      const text = event.text.toLowerCase();
      
      if (text.includes('summarize')) {
        await this.handleSummarizeRequest(event);
      } else if (text.includes('suggest')) {
        await this.handleSuggestionRequest(event);
      } else {
        await this.sendHelpMessage(event);
      }
    } catch (error) {
      console.error('Error handling app mention:', error);
      await this.sendErrorMessage(event);
    }
  }

  private static async handleSummarizeRequest(event: AppMentionEvent) {
    try {
      // Check if the mention is in a thread
      const threadTs = event.thread_ts || event.ts;
      
      // Get summary
      const summary = await AIService.summarizeThread(threadTs, event.channel);
      
      // Send response
      await slack.chat.postMessage({
        channel: event.channel,
        text: summary,
        thread_ts: threadTs,
      });
    } catch (error) {
      console.error('Error handling summarize request:', error);
      throw error;
    }
  }

  private static async handleSuggestionRequest(event: AppMentionEvent) {
    try {
      // Extract query from message
      const query = event.text.replace(/<@[^>]+>/g, '').trim();
      
      // Get suggestions
      const suggestions = await AIService.getSuggestions(query, event.channel);
      
      // Send response
      await slack.chat.postMessage({
        channel: event.channel,
        text: suggestions,
        thread_ts: event.thread_ts || event.ts,
      });
    } catch (error) {
      console.error('Error handling suggestion request:', error);
      throw error;
    }
  }

  private static async sendHelpMessage(event: AppMentionEvent) {
    const helpText = `
Hello! I can help you with:
• Summarizing threads - Just mention me with "summarize" in a thread
• Providing suggestions - Mention me with "suggest" followed by your query

Examples:
@YourBot summarize
@YourBot suggest how to handle this customer request?
    `.trim();

    await slack.chat.postMessage({
      channel: event.channel,
      text: helpText,
      thread_ts: event.thread_ts || event.ts,
    });
  }

  private static async sendErrorMessage(event: AppMentionEvent) {
    await slack.chat.postMessage({
      channel: event.channel,
      text: "Sorry, I encountered an error processing your request. Please try again.",
      thread_ts: event.thread_ts || event.ts,
    });
  }
} 