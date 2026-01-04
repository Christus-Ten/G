# Goat Bot V2

## Overview

Goat Bot V2 is a Facebook Messenger chatbot built with Node.js that uses an unofficial Facebook Chat API to automate messaging and provide various commands and features. The bot connects to Facebook using personal account credentials (cookies/fbstate) and listens for messages via MQTT protocol. It includes a web dashboard for configuration and management, supports multiple database backends, and provides an extensible command/event system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Application Structure

The bot uses a process spawning pattern where `index.js` spawns `Goat.js` as a child process, enabling automatic restarts on crashes (exit code 2). This provides resilience and the ability to update without manual intervention.

### Login and Authentication

- **Facebook Authentication**: Uses `fca-aryan` (Facebook Chat API fork) for connecting to Messenger
- **Cookie-based Login**: Authenticates via Facebook cookies stored in `account.txt` or retrieved from email/password
- **Multiple Login Methods**: Supports standard cookie login, email/password login, and mbasic login
- **Session Management**: Automatic cookie refresh at configurable intervals to maintain session validity

### Command System

- **Commands** (`scripts/cmds/`): User-invokable commands with prefix (default `-`)
- **Events** (`scripts/events/`): Automatic handlers for message events, user joins/leaves, etc.
- Commands are dynamically loaded at startup with automatic npm package installation for missing dependencies
- Each command exports a config object with metadata and handler functions (`onStart`, `onChat`, `onReply`, `onReaction`)

### Event Handler Pipeline

Located in `bot/handler/`, the system processes incoming messages through:
1. `handlerAction.js` - Entry point for all events
2. `handlerCheckData.js` - Ensures user/thread data exists in database
3. `handlerEvents.js` - Routes events to appropriate command handlers based on type

### Database Layer

Supports three storage backends configured in `config.json`:
- **SQLite** (default): Local file-based storage using Sequelize ORM
- **MongoDB**: Cloud-ready NoSQL storage via Mongoose
- **JSON**: Simple file-based storage for lightweight deployments

Database controllers in `database/controller/` provide abstracted data access:
- `threadsData.js` - Group chat data
- `usersData.js` - User profiles and settings
- `dashBoardData.js` - Web dashboard accounts
- `globalData.js` - Bot-wide settings

### Web Dashboard

Express.js application in `dashboard/` providing:
- User registration/login with email verification
- Facebook ID verification for group management
- Thread-specific configuration (welcome messages, attachments)
- Passport.js local strategy authentication
- Rate limiting for API endpoints

### Utility Layer

`utils.js` provides shared functionality:
- Google Drive integration for file storage
- Translation system with language files
- HTTP utilities (stream handling, URL fetching)
- Time formatting with timezone support
- Email sending via Gmail OAuth2

## External Dependencies

### Third-Party Services

- **Facebook Messenger**: Core messaging platform via unofficial API (`fca-aryan`)
- **Google Cloud Platform**: 
  - OAuth2 for Gmail (sending verification emails)
  - Google Drive API for file storage (attachments)
- **Google reCAPTCHA v2**: Dashboard form protection
- **Uptime Monitoring**: Optional integration with BetterStack or UptimeRobot

### Key NPM Packages

- `express` - Web server framework
- `sequelize` / `mongoose` - Database ORMs
- `passport` - Authentication middleware
- `nodemailer` - Email sending
- `googleapis` - Google services integration
- `mqtt` - Real-time message listening
- `socket.io` - WebSocket support for dashboard
- `canvas` - Image manipulation
- `axios` - HTTP client

### Configuration Files

- `config.json` - Main bot configuration (credentials, database, features)
- `configCommands.json` - Command-specific environment variables
- `account.txt` - Facebook session cookies