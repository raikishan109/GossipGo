FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./

RUN npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
