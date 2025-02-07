import { MessageEvent, AppMentionEvent } from '@slack/web-api';
import { WebClient } from '@slack/web-api';
import { ENV } from '../config/env';
import { AIService } from './aiService';
import Container, { Service } from "typedi";
import { SlackService } from './slackService';

@Service()
export class MessageService {
    private aiService: AIService = Container.get(AIService);
    private slackService: SlackService = Container.get(SlackService);

  async handleMessage(event: MessageEvent) {
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

  async handleAppMention(event: AppMentionEvent) {
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

  private async handleSummarizeRequest(event: AppMentionEvent) {
    try {
      const threadTs = event.thread_ts || event.ts;
      const summary = await this.aiService.summarizeThread(threadTs, event.channel);
      await this.slackService.sendMessage(event.channel, summary, threadTs);
    } catch (error) {
      console.error('Error handling summarize request:', error);
      throw error;
    }
  }

  private async handleSuggestionRequest(event: AppMentionEvent) {
    try {
      const query = event.text.replace(/<@[^>]+>/g, '').trim();
      const suggestions = await this.aiService.getSuggestions(query, event.channel, event.thread_ts || event.ts);
      
      await this.slackService.sendMessage(event.channel, suggestions, event.thread_ts || event.ts);
    } catch (error) {
      console.error('Error handling suggestion request:', error);
      throw error;
    }
  }

  private async sendHelpMessage(event: AppMentionEvent) {
    const helpText = `
Hello! I can help you with:
• Summarizing threads - Just mention me with "summarize" in a thread
• Providing suggestions - Mention me with "suggest" followed by your query

Examples:
@YourBot summarize
@YourBot suggest how to handle this customer request?
    `.trim();

    await this.slackService.sendMessage(event.channel, helpText, event.thread_ts || event.ts);
  }

  private async sendErrorMessage(event: AppMentionEvent) {
    await this.slackService.sendMessage(event.channel, "Sorry, I encountered an error processing your request. Please try again.", event.thread_ts || event.ts);
  }
} 