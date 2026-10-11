const { createClient } = require("redis");

// In-memory fallback stores in case Redis Cloud is not configured or offline
const memoryStore = new Map();
const memoryHashes = new Map();

let isConnected = false;
let realClient = null;

if (process.env.REDIS_URL) {
  try {
    realClient = createClient({ url: process.env.REDIS_URL });
    realClient.on("error", (err) => {
      console.warn("Redis warning (using fallback):", err.message);
      isConnected = false;
    });
    realClient.on("connect", () => {
      console.log("Redis Cloud connected");
      isConnected = true;
    });
  } catch (e) {
    console.warn("Could not initialize Redis client, using in-memory store:", e.message);
  }
} else {
  console.log("No REDIS_URL provided — running with in-memory caching and socket mapping");
}

const safeClient = {
  async connect() {
    if (realClient && !realClient.isOpen) {
      try {
        await realClient.connect();
        isConnected = true;
      } catch (err) {
        console.warn("Redis connection failed, continuing with in-memory store:", err.message);
        isConnected = false;
      }
    }
  },
  get isOpen() {
    return isConnected || true;
  },
  async get(key) {
    if (isConnected && realClient) {
      try { return await realClient.get(key); } catch (e) {}
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },
  async setEx(key, ttl, value) {
    if (isConnected && realClient) {
      try { return await realClient.setEx(key, ttl, value); } catch (e) {}
    }
    memoryStore.set(key, value);
    setTimeout(() => memoryStore.delete(key), ttl * 1000);
    return "OK";
  },
  async del(key) {
    if (isConnected && realClient) {
      try { return await realClient.del(key); } catch (e) {}
    }
    memoryStore.delete(key);
    return 1;
  },
  async hGet(hash, field) {
    if (isConnected && realClient) {
      try { return await realClient.hGet(hash, field); } catch (e) {}
    }
    const map = memoryHashes.get(hash);
    return map ? map.get(field) : null;
  },
  async hSet(hash, field, value) {
    if (isConnected && realClient) {
      try { return await realClient.hSet(hash, field, value); } catch (e) {}
    }
    if (!memoryHashes.has(hash)) memoryHashes.set(hash, new Map());
    memoryHashes.get(hash).set(field, value);
    return 1;
  },
  async hDel(hash, field) {
    if (isConnected && realClient) {
      try { return await realClient.hDel(hash, field); } catch (e) {}
    }
    const map = memoryHashes.get(hash);
    if (map) map.delete(field);
    return 1;
  },
  on(evt, handler) {
    if (realClient) realClient.on(evt, handler);
  }
};

async function connectRedis() {
  await safeClient.connect();
}

module.exports = { redisClient: safeClient, connectRedis };
