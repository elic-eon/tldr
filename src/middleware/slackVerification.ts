import { Request, Response, NextFunction } from 'express';
import { verifySlackRequest } from '@slack/bolt';
import { ENV } from '../config/env';

const FIVE_MINUTES = 5 * 60;

export const verifyIncomingRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-slack-signature'] as string;
    const timestamp = parseInt(req.headers['x-slack-request-timestamp'] as string, 10);
    const body = req.body;

    // Verify timestamp is not stale
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestamp) > FIVE_MINUTES) {
      throw new Error('Request timestamp is too old');
    }

    verifySlackRequest({
      signingSecret: ENV.SLACK_SIGNING_SECRET,
      body: JSON.stringify(body),
      headers: {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': timestamp,
      },
    });

    next();
  } catch (error) {
    res.status(401).send('Verification failed');
  }
}; 