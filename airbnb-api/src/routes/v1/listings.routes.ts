/**
 * File: listings.routes.ts
 * What it is doing: Maps HTTP routes to controller functions for property listings.
 * Responsibility: Defining the RESTful endpoints for listings, enforcing HOST role for mutations, and registering search/stats routes before the /:id wildcard.
 * Outcomes: Exports the listings router module.
 */
import { Router } from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  searchListings,
  getListingStats
} from "../../controllers/listings.controller.js";
import { authenticate, requireHost } from "../../middlewares/auth.middleware.js";
import { cacheResponse } from "../../middlewares/cache.middleware.js";

const router = Router();

// IMPORTANT: /search and /stats must be registered BEFORE /:id
// otherwise Express would treat "search" and "stats" as an :id param

// Search listings by location, type, price range, and guest capacity
router.get("/search", searchListings);

// Platform-wide listing statistics (total, avg price, by location, by type)
router.get("/stats", authenticate, getListingStats);

// Public route to view all listings (supports filters), cached for 60 seconds
router.get("/", cacheResponse(60), getAllListings);

// Public route to view details of a specific property, cached for 5 minutes
router.get("/:id", cacheResponse(300), getListingById);

// Protected routes — only HOST (or ADMIN) can create, update, or delete listings
router.post("/", authenticate, requireHost, createListing);
router.put("/:id", authenticate, requireHost, updateListing);
router.delete("/:id", authenticate, requireHost, deleteListing);

export default router;
