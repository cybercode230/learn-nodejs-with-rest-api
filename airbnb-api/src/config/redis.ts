import { Redis } from "ioredis";
import { logger } from "../utils/logger.js";

// Initialize Redis client using the environment variable or defaulting to localhost
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = new Redis(redisUrl);

redisClient.on("connect", () => {
  logger.info("🟢 Connected to Redis successfully");
});





redisClient.on("error", (error) => {
  logger.error(`🔴 Redis connection error: ${error.message}`);
});
