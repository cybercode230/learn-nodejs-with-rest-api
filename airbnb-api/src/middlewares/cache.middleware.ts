import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware to cache HTTP responses using Redis
 * @param durationInSeconds How long to keep the cache in seconds
 */
export const cacheResponse = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Construct a unique cache key based on the URL
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if we have a cached response
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        // Log that the response was served from cache
        logger.info(`⚡ CACHE HIT: Served from Redis -> ${key}`);
        // Send the cached JSON response
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      } else {
        // Log that the response was not cached
        logger.info(`🐌 CACHE MISS: Fetching from DB -> ${key}`);
        // If not cached, override res.json to capture the response data
        const originalJson = res.json.bind(res);

        res.json = (body: any) => {
          // Send response to the client
          const result = originalJson(body);

          // Save the response in Redis asynchronously
          redisClient.setex(key, durationInSeconds, JSON.stringify(body)).catch((err: any) => {
            logger.error(`Failed to cache response: ${err.message}`);
          });

          return result;
        };

        next();
      }
    } catch (error: any) {
      logger.error(`Redis cache error: ${error.message}`);
      next(); // Continue without cache if Redis fails
    }
  };
};
