/**
 * File: ai.routes.ts
 * What it is doing: Defines the routes for AI-powered features.
 * Responsibility: Mapping AI endpoints to their respective controller functions and applying necessary middleware.
 * Outcomes: Enables natural language search, description generation, chat functionality, recommendations, and review summaries.
 */

import { Router } from "express";
import {
  naturalLanguageSearch,
  generateListingDescription,
  chat,
  recommendListings,
  getReviewSummary,
} from "../../controllers/ai.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { cacheResponse } from "../../middlewares/cache.middleware.js";

const router = Router();

// Natural Language Search
router.post("/search", naturalLanguageSearch);

// Description Generation
router.post("/listings/:id/generate-description", authenticate, generateListingDescription);

// AI Chat
router.post("/chat", chat);

// Personalized Recommendations
router.post("/recommend", authenticate, recommendListings);

// Review Summarization (Cached for 10 minutes)
router.get("/listings/:id/review-summary", cacheResponse(600), getReviewSummary);

export default router;
