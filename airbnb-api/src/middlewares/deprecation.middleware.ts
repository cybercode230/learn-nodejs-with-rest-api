/**
 * @file deprecation.middleware.ts
 * @description
 * This middleware is used to mark API routes (typically older versions like v1)
 * as deprecated. It informs clients that:
 * 
 * - The current endpoint is deprecated
 * - There is a planned removal (sunset) date
 * - A newer version of the API is available
 * 
 * This helps frontend apps, API consumers, and developers migrate early
 * before the deprecated version is permanently removed.
 */

import type { Request, Response, NextFunction } from "express";

/**
 * @function deprecateV1
 * @description
 * Express middleware that attaches standard deprecation headers
 * to the response. These headers follow best practices for API versioning
 * and lifecycle communication.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function deprecateV1(
  req: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * Indicates that this API version is deprecated.
   * Clients should start migrating away from it.
   */
  res.setHeader("Deprecation", "true");

  /**
   * Specifies the date when this API version will be sunset (removed).
   * Must be in HTTP-date format (RFC 7231).
   */
  res.setHeader("Sunset", "Wed, 28 May 2026 11:40:00 GMT");

  /**
   * Provides a link to the newer (successor) API version.
   * This helps clients automatically discover the upgrade path.
   */
  res.setHeader("Link", '</airbnb/api/v2>; rel="successor-version"');

  /**
   * Optional: Add a human-readable warning message.
   * Useful for debugging or logging in clients.
   */
  res.setHeader(
    "Warning",
    '299 - "/airbnb/api/v1 is deprecated and will be removed by 28th Apr 2026. Please migrate to /airbnb/api/v2."'
  );

  /**
   * Continue to the next middleware or route handler.
   */
  next();
}