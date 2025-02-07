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
Your summaries should:
1. Be concise and focus on key points
2. Use bullet points for main topics
3. Always refer to users using their exact <@USER_ID> format from the input
4. Use Slack-style formatting:
   - Bold for important terms using *asterisks*
   - Quote important messages using > at start of line
   - Use \`code\` for technical terms

Note: It's crucial to maintain the exact <@USER_ID> format when mentioning users.`
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
} 