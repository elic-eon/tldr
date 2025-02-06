# Take Home Assignment

## Overview

A simple API that serve as slack application backend.

## Technologies Used

- Node.js
- Express
- OpenAI API
- ngrok

## Setup

1. Clone the repository and install dependencies
2. Start the server
3. Set up ngrok:
   - Run `ngrok http 3000`
   - Copy the generated ngrok URL

4. Configure Slack App:
   - Navigate to your Slack App dashboard
   - Under "Event Subscriptions":
     - Enable events
     - Paste the ngrok URL
     - Verify token
     - Subscribe to bot events
   - Install the app to your workspace

## Usage

1. Select the conversation you want to use the app in
2. Click on the app icon
3. Click on `Ask AI`
4. Type your question
5. Click on `Send`

# Development

## Environment Setup

1. **Install Required Software**
   - Node.js (LTS version 18+)
   - Git

3. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your `.env` file with:
   - `SLACK_BOT_TOKEN`
   - `SLACK_SIGNING_SECRET`
   - `SLACK_APP_TOKEN`

4. **Development Tools Setup**
   ```bash
   npm install -g nodemon
   npm install -g ngrok
   ```

5. **Start Development Server**
   ```bash
   # Terminal 1: Start the development server
   npm run dev

   # Terminal 2: Start ngrok tunnel
   ngrok http 3000


8. **Verify Setup**
   - Server should be running on `http://localhost:3000`
   - ngrok should provide a public URL
   - Slack events should be received and logged

## Slack App Setup

1. **Create a New Slack App**:
   - Visit [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App"
   - Choose "From scratch"
   - Enter app name and select workspace
   - Click "Create App"

2. **Basic Information Setup**:
   - Under "Basic Information", collect:
     - Signing Secret (for `SLACK_SIGNING_SECRET`)
     - Generate App-Level Token (for `SLACK_APP_TOKEN`):
       - Click "Generate Token and Scopes"
       - Add `connections:write` scope
       - Name your token and create it

3. **Bot Token Scopes**:
   - Navigate to "OAuth & Permissions"
   - Under "Bot Token Scopes", add:
     - `app_mentions:read`
     - `channels:history`
     - `chat:write`
     - `im:history`
     - `im:write`

4. **Install App to Workspace**:
   - In "OAuth & Permissions"
   - Click "Install to Workspace"
   - Authorize the app
   - Copy "Bot User OAuth Token" (for `SLACK_BOT_TOKEN`)

5. **Event Subscriptions**:
   - Go to "Event Subscriptions"
   - Enable Events: On
   - Set Request URL: `your-ngrok-url/slack/events`
   - Subscribe to bot events:
     - `message.channels`
     - `app_mention`
   - Save Changes