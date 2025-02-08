import OpenAI from 'openai';
import { Service } from "typedi";
import { ENV } from '../config/env';
import { AI_CONFIG } from '../config/aiConfig';

@Service()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
    });
  }

  async getSummary(formattedThread: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that summarizes Slack conversations.

Your task is to create clear, well-formatted summaries using Slack's mrkdwn syntax:

1. Structure:
   • Start with a brief overview
   • Use bullet points (•) for main topics only
   • Use tab + • for sub-points
   • Group related points together

2. Formatting:
   • *Bold* for important terms or decisions
   • \`code\` for technical terms, commands, or file names
   • > Quote important messages (one line only)
   • Maintain line breaks for readability

3. User References:
   • Always use exact <@USER_ID> format
   • Never modify or abbreviate user mentions

4. Content Guidelines:
   • Focus on key decisions and action items
   • Include relevant context
   • Highlight important deadlines or dates
   • Note unresolved items or next steps

Example format:
• Main topic 1
    • Sub-point A
    • Sub-point B
• Main topic 2
    • Sub-point X
    • Sub-point Y

Remember: Keep formatting consistent and ensure all user mentions remain in <@USER_ID> format.`
          },
          {
            role: "user",
            content: `Please summarize this Slack thread:\n\n${formattedThread}`
          }
        ],
        max_tokens: AI_CONFIG.MAX_CONTEXT_LENGTH,
        temperature: 0.4,
      });

      // Log token usage
      console.log('OpenAI Token Usage:', {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        model: response.model,
      });

      return response.choices[0].message.content || "Unable to generate summary.";
    } catch (error) {
      console.error('Error getting summary from OpenAI:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async getSuggestions(formattedContext: string, query: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful Slack assistant that provides actionable suggestions based on conversation context.

Your responses should follow this structure:

1. Context Understanding:
   • Brief acknowledgment of the query
   • Reference relevant conversation parts using quotes

2. Suggestions Format:
   • Use bullet points (•) for main suggestions only
   • Use tab + • for sub-points and details
   • Group related suggestions together

3. Slack Formatting:
   • *Bold* for important concepts or recommendations
   • \`code\` for technical terms, commands, or tools
   • > Quote relevant messages (one per line)
   • Maintain proper spacing for readability

4. User References:
   • Always use exact <@USER_ID> format
   • Include relevant user context when referencing past messages

Example format:
• *Main Suggestion 1*
    • Detailed action point
    • Supporting information
• *Main Suggestion 2*
    • Implementation step
    • Additional context

Remember: Be specific, actionable, and maintain proper formatting hierarchy.`
          },
          {
            role: "user",
            content: `Based on this conversation context:\n\n${formattedContext}\n\nPlease provide suggestions for this query: ${query}`
          }
        ],
        max_tokens: AI_CONFIG.MAX_CONTEXT_LENGTH,
        temperature: 0.7,
      });

      // Log token usage
      console.log('OpenAI Token Usage:', {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        model: response.model,
      });

      return response.choices[0].message.content || "I couldn't generate any suggestions at this time.";
    } catch (error) {
      console.error('Error getting suggestions from OpenAI:', error);
      throw new Error('Failed to generate suggestions');
    }
  }
} 