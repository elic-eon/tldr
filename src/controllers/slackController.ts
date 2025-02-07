import { Request, Response } from 'express';
import { MessageEvent, AppMentionEvent } from '@slack/web-api';
import { Container } from "typedi";
import { MessageService } from '../services/messageService';

export class SlackController {
  private static messageService = Container.get(MessageService);

  static async handleEvent(req: Request, res: Response): Promise<void> {
    const { type, event, challenge } = req.body;

    // Handle URL verification
    if (type === 'url_verification') {
      res.json({ challenge });
      return;
    }

    // Acknowledge receipt of the event immediately
    res.status(200).send('OK');

    // Process events after sending response
    if (type === 'event_callback') {
      try {
        await SlackController.routeEvent(event);
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }
  }

  private static async routeEvent(event: MessageEvent | AppMentionEvent | { type: string }) {
    switch (event.type) {
      case 'message':
        await this.messageService.handleMessage(event as MessageEvent);
        break;
      case 'app_mention':
        await this.messageService.handleAppMention(event as AppMentionEvent);
        break;
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }
  }
} 