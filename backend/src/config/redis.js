import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export async function connectRedis() {
  if(!redisClient.isOpen){
    await redisClient.connect();
  }

  console.log("Redis connected successfully");
}

export async function invalidateTicketCache() {
  if (!redisClient.isReady) return;

  try {
    for await (const key of redisClient.scanIterator({
      MATCH: "tickets:v1:*",
      COUNT: 100,
    })) {
      await redisClient.del(key);
    }

    console.log("Ticket cache invalidated");
  } catch (error) {
    console.error("Ticket cache invalidation failed:", error.message);
  }
}