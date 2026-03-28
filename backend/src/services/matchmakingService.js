const crypto = require("crypto");

class MatchmakingService {
  constructor({ io, redisClient }) {
    this.io = io;
    this.redisClient = redisClient;
    this.serverId = crypto.randomUUID();
    this.localQueue = [];
    this.activeChats = new Map();
    this.queueItemsKey = "gossipgo:queue:items";
    this.queueOrderKey = "gossipgo:queue:order";
    this.matchLockKey = "gossipgo:queue:lock";
  }

  async enqueue(user) {
    await this.removeFromQueue(user.userId);

    if (this.redisClient) {
      await this.redisClient.hSet(this.queueItemsKey, user.userId, JSON.stringify(user));
      await this.redisClient.rPush(this.queueOrderKey, user.userId);
      return;
    }

    this.localQueue.push(user);
  }

  async removeFromQueue(userId) {
    if (this.redisClient) {
      await this.redisClient.hDel(this.queueItemsKey, userId);
      await this.redisClient.lRem(this.queueOrderKey, 0, userId);
      return;
    }

    this.localQueue = this.localQueue.filter((item) => item.userId !== userId);
  }

  async dequeuePair() {
    if (!this.redisClient) {
      if (this.localQueue.length < 2) {
        return null;
      }

      return [this.localQueue.shift(), this.localQueue.shift()];
    }

    const lock = await this.redisClient.set(this.matchLockKey, this.serverId, {
      NX: true,
      EX: 2
    });

    if (!lock) {
      return null;
    }

    try {
      const firstId = await this.redisClient.lPop(this.queueOrderKey);
      const secondId = await this.redisClient.lPop(this.queueOrderKey);

      if (!firstId || !secondId) {
        if (firstId) {
          await this.redisClient.rPush(this.queueOrderKey, firstId);
        }
        return null;
      }

      const [first, second] = await Promise.all([
        this.redisClient.hGet(this.queueItemsKey, firstId),
        this.redisClient.hGet(this.queueItemsKey, secondId)
      ]);

      await Promise.all([
        this.redisClient.hDel(this.queueItemsKey, firstId),
        this.redisClient.hDel(this.queueItemsKey, secondId)
      ]);

      if (!first || !second) {
        return null;
      }

      return [JSON.parse(first), JSON.parse(second)];
    } finally {
      await this.redisClient.del(this.matchLockKey);
    }
  }

  async attemptMatch() {
    const pair = await this.dequeuePair();
    if (!pair) {
      return null;
    }

    const roomId = `chat_${crypto.randomUUID()}`;

    return {
      roomId,
      users: pair
    };
  }

  async registerActiveChat(roomId, payload) {
    this.activeChats.set(roomId, payload);
    if (this.redisClient) {
      await this.redisClient.set(`gossipgo:active:${roomId}`, JSON.stringify(payload), {
        EX: 60 * 60
      });
    }
  }

  async endActiveChat(roomId) {
    this.activeChats.delete(roomId);
    if (this.redisClient) {
      await this.redisClient.del(`gossipgo:active:${roomId}`);
    }
  }

  async resetState({ disconnectClients = false } = {}) {
    this.localQueue = [];
    this.activeChats.clear();

    if (this.redisClient) {
      const activeKeys = await this.redisClient.keys("gossipgo:active:*");
      const keysToDelete = [this.queueItemsKey, this.queueOrderKey, this.matchLockKey, ...activeKeys];

      if (keysToDelete.length > 0) {
        await Promise.all(keysToDelete.map((key) => this.redisClient.del(key)));
      }
    }

    if (disconnectClients && this.io?.fetchSockets) {
      const sockets = await this.io.fetchSockets();
      sockets.forEach((socket) => {
        socket.emit("chat:ended", { reason: "reset" });
        socket.disconnect(true);
      });
    }
  }

  async getWaitingCount() {
    if (this.redisClient) {
      return this.redisClient.lLen(this.queueOrderKey);
    }

    return this.localQueue.length;
  }

  async getActiveCount() {
    if (!this.redisClient) {
      return this.activeChats.size;
    }

    const keys = await this.redisClient.keys("gossipgo:active:*");
    return keys.length;
  }
}

module.exports = { MatchmakingService };
