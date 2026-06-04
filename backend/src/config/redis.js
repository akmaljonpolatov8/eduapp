const crypto = require("crypto");
const { createClient } = require("redis");
const { env } = require("./env");
const { logger } = require("./logger");

let client = null;
let connectionPromise = null;
const localBlacklist = new Map();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getRedisClient() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (client?.isOpen) {
    return client;
  }

  if (!client) {
    client = createClient({ url: env.REDIS_URL });
    client.on("error", (error) => {
      logger.warn("Redis client error", { message: error.message });
    });
  }

  if (!connectionPromise) {
    connectionPromise = client.connect().catch((error) => {
      logger.warn("Redis unavailable, using in-memory fallback", {
        message: error.message,
      });
      client = null;
      connectionPromise = null;
      return null;
    });
  }

  return connectionPromise;
}

function cleanupLocalBlacklist() {
  const now = Date.now();
  for (const [key, expiresAt] of localBlacklist.entries()) {
    if (expiresAt <= now) {
      localBlacklist.delete(key);
    }
  }
}

async function blacklistToken(token, ttlSeconds) {
  const key = `blacklist:${hashToken(token)}`;
  const redisClient = await getRedisClient();

  if (redisClient) {
    await redisClient.set(key, "1", { EX: Math.max(1, ttlSeconds) });
    return;
  }

  cleanupLocalBlacklist();
  localBlacklist.set(key, Date.now() + Math.max(1, ttlSeconds) * 1000);
}

async function isTokenBlacklisted(token) {
  const key = `blacklist:${hashToken(token)}`;
  const redisClient = await getRedisClient();

  if (redisClient) {
    return (await redisClient.get(key)) !== null;
  }

  cleanupLocalBlacklist();
  return localBlacklist.has(key);
}

module.exports = {
  blacklistToken,
  getRedisClient,
  isTokenBlacklisted,
};
