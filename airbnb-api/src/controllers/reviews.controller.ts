/**
 * File: reviews.controller.ts
 * What it is doing: Handles API endpoints for listing reviews.
 * Responsibility: Fetching paginated reviews, creating new reviews with rating validation, and deleting reviews with ownership checks.
 * Outcomes: Returns reviews with reviewer info, creates/deletes reviews, or returns appropriate HTTP errors.
 */
import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import { createReviewSchema } from "../dtos/index.js";
import { generateId } from "../utils/idGenerator.js";
import prisma from "../config/prisma.js";
import { redisClient } from "../config/redis.js";
import { logger } from "../utils/logger.js";

/**
 * @swagger
 * /api/v1/listings/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a listing (paginated)
 *     tags: [Reviews]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Listing ID" }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200:
 *         description: Paginated reviews with reviewer name and avatar
 *       404:
 *         description: Listing not found
 */
export const getReviewsByListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = req.params["id"] as string;

    // Verify the listing exists before fetching its reviews
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch reviews and total count in parallel — always use Promise.all for list+count
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        include: {
          // Include reviewer's name and avatar for display in the UI
          guest: { select: { name: true, avatar: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { listingId } })
    ]);

    res.json({ data: reviews, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/{id}/reviews:
 *   post:
 *     summary: Add a review to a listing
 *     description: >
 *       Creates a review for a listing. Rating must be between 1 and 5.
 *       The guestId is derived from the JWT token — do not include it in the body.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Listing ID" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5, description: "Rating from 1 to 5" }
 *               comment: { type: string, example: "This place was amazing!", minLength: 5 }
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation error (e.g. rating not between 1 and 5)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = req.params["id"] as string;

    // Verify the listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Validate rating (1–5) and comment (min 5 chars) from the request body
    const validatedData = createReviewSchema.parse(req.body);

    // guestId always comes from the verified JWT token — never from the client body
    const review = await prisma.review.create({
      data: {
        id: generateId(),
        rating: validatedData.rating,
        comment: validatedData.comment,
        guestId: req.userId as string,
        listingId
      },
      include: {
        guest: { select: { name: true, avatar: true } }
      }
    });

    // ─── CLEAR CACHE ──────────────────────────────────────────────────────────
    // Clear the AI review summary cache for this listing so the next summary request is fresh
    const cacheKey = `cache:/api/v1/ai/listings/${listingId}/review-summary`;
    await redisClient.del(cacheKey);
    logger.info(`?? CACHE CLEARED: AI Review Summary -> ${cacheKey}`);
    // ─────────────────────────────────────────────────────────────────────────

    res.status(201).json(review);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Only the guest who wrote the review or an ADMIN can delete it.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Review ID" }
 *     responses:
 *       200: { description: Review deleted }
 *       401: { description: Unauthorized }
 *       403: { description: You can only delete your own reviews }
 *       404: { description: Review not found }
 */
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ownership check — only the author or an ADMIN can delete the review
    if (review.guestId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted successfully" });
  } catch (error) { next(error); }
};
