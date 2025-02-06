import { Request, Response, NextFunction } from 'express';
import { verifyIncomingRequest } from '../slackVerification';
import * as SlackBolt from '@slack/bolt';

describe('Slack Verification Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {
        'x-slack-signature': 'v0=valid_signature',
        'x-slack-request-timestamp': Math.floor(Date.now() / 1000).toString(),
      },
      body: { test: 'data' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    nextFunction = jest.fn();

    jest.spyOn(SlackBolt, 'verifySlackRequest').mockImplementation(
      ({ signingSecret, body, headers }) => true
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call next() for valid Slack requests', async () => {
    await verifyIncomingRequest(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 for invalid Slack requests', async () => {
    // Override the mock for this specific test
    (SlackBolt.verifySlackRequest as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await verifyIncomingRequest(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith('Verification failed');
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should validate request timestamp is not stale', async () => {
    const staleTimestamp = (Math.floor(Date.now() / 1000) - 301).toString(); // 5 minutes old
    mockRequest.headers!['x-slack-request-timestamp'] = staleTimestamp;

    await verifyIncomingRequest(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith('Verification failed');
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 