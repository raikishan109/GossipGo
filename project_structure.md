# Project Structure

```text
GossipGo/
├── .github/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── redis.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── reportController.js
│   │   │   ├── socialController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── adminMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── csrfMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validateMiddleware.js
│   │   ├── models/
│   │   │   ├── Chat.js
│   │   │   ├── Report.js
│   │   │   ├── Session.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── index.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── socialRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── adminBootstrapService.js
│   │   │   ├── chatService.js
│   │   │   ├── matchmakingService.js
│   │   │   ├── moderationService.js
│   │   │   ├── socialService.js
│   │   │   └── tokenService.js
│   │   ├── sockets/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── anonymousName.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── httpError.js
│   │   │   └── logger.js
│   │   └── app.js
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin-panel/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── offline/
│   │   │   ├── globals.css
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── components/
│   │   │   ├── admin-dashboard.jsx
│   │   │   ├── admin-login-form.jsx
│   │   │   ├── admin-shell.jsx
│   │   │   ├── theme-sync.jsx
│   │   │   └── theme-toggle.jsx
│   │   ├── hooks/
│   │   │   └── useProtectedRoute.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── site-config.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js
│   │   ├── .env.local
│   │   ├── Dockerfile
│   │   ├── jsconfig.json
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tailwind.config.js
│   └── user-panel/
│       ├── app/
│       │   ├── (user)/
│       │   │   ├── chat/
│       │   │   ├── favorites/
│       │   │   ├── friends/
│       │   │   ├── history/
│       │   │   └── settings/
│       │   ├── login/
│       │   ├── offline/
│       │   ├── register/
│       │   ├── layout.js
│       │   ├── not-found.js
│       │   └── page.js
│       ├── components/
│       │   ├── app-shell.jsx
│       │   ├── auth-form.jsx
│       │   ├── chat-panel.jsx
│       │   ├── hero-section.jsx
│       │   ├── navbar.jsx
│       │   ├── social-card.jsx
│       │   └── theme-toggle.jsx
│       ├── hooks/
│       │   ├── useProtectedRoute.js
│       │   └── useSocketChat.js
│       ├── services/
│       │   ├── api.js
│       │   └── site-config.js
│       ├── store/
│       │   ├── authStore.js
│       │   └── uiStore.js
│       ├── styles/
│       │   └── globals.css
│       ├── utils/
│       ├── .env.local
│       ├── Dockerfile
│       ├── jsconfig.json
│       ├── next.config.js
│       ├── package.json
│       └── tailwind.config.js
├── docker-compose.yml
├── .gitignore
├── package.json
├── README.md
└── start.bat
```
