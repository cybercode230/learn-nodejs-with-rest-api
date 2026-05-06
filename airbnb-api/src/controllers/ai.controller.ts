/**
 * File: ai.controller.ts
 * What it is doing: Handles AI-powered features by delegating to the AI Service.
 * Responsibility: Validating DTOs/request data, calling service methods, and handling HTTP responses and errors.
 * Outcomes: Intelligent API endpoints with robust error handling and clear Swagger documentation.
 */

import type { Request, Response } from "express";
import { AIService } from "../services/ai.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

// ─── UTILS ───────────────────────────────────────────────────────────────────

/**
 * Handle AI service errors (Rate limit 429, Invalid Key 401 from Groq → 500)
 */
const handleAIError = (error: any, res: Response) => {
  console.error("AI Service Error:", error);
  if (error?.status === 429 || error?.response?.status === 429) {
    return res.status(429).json({ error: "AI service is busy, please try again in a moment" });
  }
  if (error?.status === 401 || error?.response?.status === 401) {
    return res.status(500).json({ error: "AI service configuration error" });
  }
  return res.status(500).json({ error: "Failed to process AI request" });
};

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/ai/search:
 *   post:
 *     summary: Search listings using natural language with pagination
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: "apartment in Kigali under $100 for 2 guests" }
 *     responses:
 *       200: { description: Paginated search results with extracted filters }
 *       400: { description: Could not extract filters }
 */
export async function naturalLanguageSearch(req: Request, res: Response) {
  const { query } = req.body;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!query) return res.status(400).json({ error: "query is required" });

  try {
    const result = await AIService.naturalLanguageSearch(query, page, limit);
    if (result.error === "NO_FILTERS") {
      return res.status(400).json({ error: "Could not extract any filters from your query, please be more specific" });
    }
    res.json(result);
  } catch (error) {
    handleAIError(error, res);
  }
}

/**
 * @swagger
 * /api/v1/ai/listings/{id}/generate-description:
 *   post:
 *     summary: Generate and save a listing description with tone control
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tone: { type: string, enum: [professional, casual, luxury], default: professional }
 *     responses:
 *       200: { description: Generated description and updated listing }
 *       403: { description: Not the owner }
 *       404: { description: Listing not found }
 */
export async function generateListingDescription(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  const tone = req.body.tone || "professional";

  if (!["professional", "casual", "luxury"].includes(tone)) {
    return res.status(400).json({ error: "Invalid tone. Use professional, casual, or luxury." });
  }

  try {
    const result = await AIService.generateDescription(id, req.userId as string, tone);
    if (result.error === "NOT_FOUND") return res.status(404).json({ error: "Listing not found" });
    if (result.error === "FORBIDDEN") return res.status(403).json({ error: "You are not the owner of this listing" });
    res.json(result);
  } catch (error) {
    handleAIError(error, res);
  }
}

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with AI assistant (with optional listing context)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, sessionId]
 *             properties:
 *               message: { type: string, example: "Does this place have WiFi?" }
 *               sessionId: { type: string, example: "session-123" }
 *               listingId: { type: string, example: "listing-456" }
 *     responses:
 *       200: { description: AI response with message count }
 */
export async function chat(req: Request, res: Response) {
  const { message, sessionId, listingId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: "message and sessionId are required" });
  }

  try {
    const result = await AIService.chat(message, sessionId, listingId);
    res.json(result);
  } catch (error) {
    handleAIError(error, res);
  }
}

/**
 * @swagger
 * /api/v1/ai/recommend:
 *   post:
 *     summary: Get personalized listing recommendations based on booking history
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Recommendations with AI reasoning }
 *       400: { description: No booking history }
 */
export async function recommendListings(req: AuthRequest, res: Response) {
  try {
    const result = await AIService.recommend(req.userId as string);
    if (result.error === "NO_HISTORY") {
      return res.status(400).json({ 
        error: `User ${result.userName}, you need to first make at least one booking to be able to get some recommendations.` 
      });
    }
    res.json(result);
  } catch (error) {
    handleAIError(error, res);
  }
}

/**
 * @swagger
 * /api/v1/ai/listings/{id}/review-summary:
 *   get:
 *     summary: Get an AI-generated summary of listing reviews (cached 10m)
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review summary with positives and negatives }
 *       400: { description: Not enough reviews }
 *       404: { description: Listing not found }
 */
export async function getReviewSummary(req: Request, res: Response) {
  const id = req.params.id as string;

  try {
    const result = await AIService.getReviewSummary(id);
    if (result.error === "NOT_FOUND") return res.status(404).json({ error: "Listing not found" });
    if (result.error === "NOT_ENOUGH_REVIEWS") {
      return res.status(400).json({ error: "Not enough reviews to generate a summary (minimum 3 required)" });
    }
    res.json(result);
  } catch (error) {
    handleAIError(error, res);
  }
}