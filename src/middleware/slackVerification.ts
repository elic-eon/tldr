import { Request, Response, NextFunction } from 'express';
import { verifySlackRequest } from '@slack/bolt';
import { ENV } from '../config/env';

export const verifyIncomingRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-slack-signature'] as string;
    const timestamp = parseInt(req.headers['x-slack-request-timestamp'] as string, 10);
    const body = req.body;

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