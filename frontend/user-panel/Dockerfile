FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/user-panel/package.json frontend/user-panel/package.json
COPY frontend/admin-panel/package.json frontend/admin-panel/package.json

RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=deps /app/frontend/user-panel/package.json ./frontend/user-panel/package.json
COPY --from=deps /app/frontend/admin-panel/package.json ./frontend/admin-panel/package.json
COPY frontend ./frontend

RUN npm run build:frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/frontend/admin-panel/package.json ./frontend/admin-panel/package.json
COPY --from=builder /app/frontend/user-panel ./frontend/user-panel

EXPOSE 3000
CMD ["npm", "run", "start:frontend"]

