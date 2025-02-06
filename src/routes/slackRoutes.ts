import { Router } from 'express';
import { SlackController } from '../controllers/slackController';
import { verifyIncomingRequest } from '../middleware/slackVerification';

const router = Router();

router.post('/events', verifyIncomingRequest, SlackController.handleEvent);

export default router; 