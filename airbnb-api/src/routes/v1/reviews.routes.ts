/**
 * File: reviews.routes.ts
 * What it is doing: Maps HTTP routes to review controller functions.
 * Responsibility: Defining RESTful endpoints for listing reviews, applying auth middleware for protected operations.
 * Outcomes: Exports the reviews router for listing-scoped reviews and standalone review deletion.
 */
import { Router } from "express";
import {
  getReviewsByListing,
  createReview,
  deleteReview
} from "../../controllers/reviews.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a listing (paginated)
 *     tags: [Reviews]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Listing ID" }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated reviews with reviewer name and avatar }
 *       404: { description: Listing not found }
 */

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}/reviews:
 *   post:
 *     summary: Add a review to a listing
 *     description: Rating must be between 1 and 5. guestId comes from the JWT token.
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
 *             $ref: '#/components/schemas/CreateReviewDTO'
 *     responses:
 *       201: { description: Review created }
 *       400: { description: Rating must be between 1 and 5 }
 *       401: { description: Unauthorized }
 *       404: { description: Listing not found }
 */

/**
 * @swagger
 * /airbnb/api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Only the review author or an ADMIN can delete.
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

// Public — get all reviews for a listing
router.get("/", getReviewsByListing);

// Protected — only authenticated users can post a review
router.post("/", authenticate, createReview);

export default router;
