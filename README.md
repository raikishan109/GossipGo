# GossipGo

GossipGo is a monorepo for an anonymous real-time text chat platform built with `Next.js`, `Node.js`, `Express`, `Socket.io`, `MongoDB`, and `Redis`.

## Features

- Email/password authentication with bcrypt password hashing
- JWT session auth with CSRF token validation for state-changing REST requests
- Optional guest mode with generated anonymous usernames
- User panel with profile, settings, privacy controls, chat history toggle, block, and report tools
- Admin panel with dashboard metrics, user ban/unban, report handling, and flagged chat review
- Queue-based one-to-one matchmaking over Socket.io
- Typing indicators, disconnect/next controls, spam throttling, and abusive-word detection
- Redis-backed queue storage plus Socket.io Redis adapter support for horizontal scaling
- Docker and GitHub Actions CI ready

## Folder Structure

```text
/backend
  /src
    /config
    /controllers
    /middlewares
    /models
    /routes
    /services
    /sockets
    /utils
  server.js

/frontend
  /user-panel    # User-facing Next.js app
  /admin-panel   # Admin-facing Next.js app

```

## Setup

### 1. Environment variables

Copy:

- `backend/.env.example` to `backend/.env`
- `frontend/user-panel/.env.local.example` to `frontend/user-panel/.env.local`
- `frontend/admin-panel/.env.local.example` to `frontend/admin-panel/.env.local`

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

Backend runs on `http://localhost:5000`, the user panel on `http://localhost:3000`, and the admin panel on `http://localhost:3001`.

### 4. Run with Docker

```bash
docker compose up --build
```

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongodb:27017/gossipgo
REDIS_URL=redis://redis:6379
USERPANEL_URL=http://localhost:3000
ADMINPANEL_URL=http://localhost:3001
BOOTSTRAP_ADMIN_ON_STARTUP=true
ADMIN_EMAIL=admin@gossipgo.local
ADMIN_PASSWORD=Admin@12345
ADMIN_USERNAME=GossipGoAdmin
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=20
GUEST_MODE_ENABLED=true
```

### User Panel

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Admin Panel

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## REST API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/guest`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/settings`
- `GET /api/users/history`
- `POST /api/users/block/:userId`
- `DELETE /api/users/block/:userId`

### Social

- `GET /api/social/friends`
- `POST /api/social/friends/request`
- `GET /api/social/requests`
- `GET /api/social/favorites`
- `POST /api/social/favorites`
- `GET /api/social/history`
- `GET /api/social/find`

### Chats

- `GET /api/chats`
- `GET /api/chats/:chatId`

### Reports

- `GET /api/reports`
- `POST /api/reports`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/status`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:reportId`
- `GET /api/admin/chats/flagged`

## Socket Events

### Client to server

- `chat:queue:join`
- `chat:session:set`
- `chat:typing`
- `chat:message:send`
- `chat:next`
- `chat:end`

### Server to client

- `chat:queue:joined`
- `chat:matched`
- `chat:typing:update`
- `chat:message:new`
- `chat:ended`
- `chat:error`

## Database Schema

### Users

- `email`
- `password`
- `username`
- `avatar`
- `role`
- `status`
- `blockedUsers`
- `preferences.theme`
- `preferences.privacy`
- `preferences.chatHistoryEnabled`
- `lastSeenAt`

### Chats

- `roomId`
- `users`
- `messages`
- `status`
- `startedAt`
- `endedAt`
- `endedReason`
- `historyEnabled`
- `flagged`
- `moderation.flagCount`
- `moderation.flaggedWords`

### Reports

- `reporterUser`
- `reportedUser`
- `chat`
- `reason`
- `details`
- `status`
- `handledBy`
- `handledAt`
- `resolutionNotes`

### Sessions / Tokens

- `user`
- `tokenId`
- `csrfTokenHash`
- `userAgent`
- `ipAddress`
- `expiresAt`
- `revokedAt`

## Security

- `helmet`, `hpp`, MongoDB operator sanitization, and input validation
- JWT verification for REST and WebSocket connections
- CSRF token validation for state-changing API calls
- Rate limiting for auth and general API traffic
- Message spam throttling and abusive-word flagging
- Block and report workflows

## Matchmaking Logic

- Users enter a waiting queue stored in Redis or memory fallback
- Two queued users are popped into a dedicated room
- A `Chat` document is created for the session
- Typing and message events flow over Socket.io
- Ending a chat removes the active room and allows requeueing
- Disconnects clean up rooms and mark the chat as disconnected

## Production Notes

- Use a strong `JWT_SECRET`
- Put frontend and backend behind a reverse proxy such as Nginx
- Replace permissive Socket.io CORS with your production frontend and admin origins
- Use Redis and multiple backend instances for horizontal scaling
- Enable `BOOTSTRAP_ADMIN_ON_STARTUP=true` only when `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_USERNAME` are set to your intended admin account

### Suggested production values

```env
# backend/.env
USERPANEL_URL=https://your-user-panel.vercel.app
ADMINPANEL_URL=https://your-admin-panel.vercel.app
```

```env
# frontend/user-panel/.env.local
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

```env
# frontend/admin-panel/.env.local
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```
