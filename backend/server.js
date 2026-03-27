const http = require("http");

const { createApp } = require("./src/app");
const { connectDatabase } = require("./src/config/database");
const { connectRedis } = require("./src/config/redis");
const { env } = require("./src/config/env");
const { bootstrapAdminOnStartup } = require("./src/services/adminBootstrapService");
const { initializeSocketServer } = require("./src/sockets");
const { logger } = require("./src/utils/logger");

async function bootstrap() {
  await connectDatabase();
  await bootstrapAdminOnStartup();
  const redisClient = await connectRedis();

  const app = createApp();
  const server = http.createServer(app);
  const { io, matchmakingService } = await initializeSocketServer(server, redisClient);

  app.locals.io = io;
  app.locals.matchmakingService = matchmakingService;

  server.listen(env.PORT, () => {
    logger.info(`Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to bootstrap backend", error);
  process.exit(1);
});
