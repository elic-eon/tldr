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
    }

    // Handle events
    if (type === 'event_callback') {
      await SlackController.routeEvent(event);
    }

    // Acknowledge receipt of the event
    res.status(200).send('OK');
  }

  private static async routeEvent(event: MessageEvent | AppMentionEvent | { type: string }) {
    console.log('Routing event:', event);
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