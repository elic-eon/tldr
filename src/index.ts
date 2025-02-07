import 'reflect-metadata';
import express from 'express';
import slackRoutes from './routes/slackRoutes';
import { ENV } from './config/env';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/slack', slackRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server running at http://localhost:${ENV.PORT}`);
});