const { createClient } = require("redis");

const { env } = require("./env");
const { logger } = require("../utils/logger");

let redisClient;
let redisConnectionAttempted = false;

async function connectRedis() {
  if (redisConnectionAttempted) {
    return redisClient;
  }

  redisConnectionAttempted = true;

  const client = createClient({
    url: env.REDIS_URL,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false
    }
  });

  client.on("error", (error) => {
    logger.warn("Redis error", error.message || error);
  });

  try {
    await client.connect();
    redisClient = client;
    logger.info("Redis connected");
  } catch (error) {
    logger.warn(
      `Redis unavailable at ${env.REDIS_URL}. Falling back to in-memory matchmaking.`
    );

    try {
      if (client.isOpen) {
        await client.disconnect();
      }
    } catch (disconnectError) {
      logger.warn("Redis disconnect after failed connect also failed", disconnectError.message || disconnectError);
    }

    redisClient = null;
  }

  return redisClient;
}

module.exports = { connectRedis };
