/**
 * File: index.routes.ts
 * What it is doing: Consolidates all domain-specific routers into a single master router.
 * Responsibility: Acting as the central hub for routing, mounting sub-routers under their correct path prefixes.
 * Outcomes: Exports a unified router mounted by the main Express app under /airbnb/api/v1.
 */
import { Router } from "express";
import listingRoutes from "./listings.routes.js";
import userRoutes from "./users.routes.js";
import bookingRoutes from "./bookings.routes.js";
import authRoutes from "./auth.routes.js";
import uploadRoutes from "./upload.routes.js";
import profileRoutes from "./profile.routes.js";
import reviewRoutes from "./reviews.routes.js";
import aiRoutes from "./ai.routes.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { deleteReview } from "../../controllers/reviews.controller.js";

// Initialize the master router
const router = Router();

// ─── Auth (public + protected mixed — auth.routes.ts handles per-route middleware)
router.use("/auth", authRoutes);

// ─── Listings (public reads, protected writes)
// reviews are nested under /listings/:id/reviews
router.use("/listings/:id/reviews", reviewRoutes);
router.use("/listings", listingRoutes);

// ─── Users (admin-only lists, protected profile routes)
router.use("/users", userRoutes);

// ─── Bookings (all protected — bookings.routes.ts handles role checks)
router.use("/bookings", authenticate, bookingRoutes);

// ─── Upload (avatar and listing photos — paths are /users/:id/avatar and /listings/:id/photos)
// Mount at root so the full paths /users/:id/avatar etc. are preserved
router.use("/", uploadRoutes);

// ─── Profile
router.use("/profile", authenticate, profileRoutes);

// ─── Reviews — standalone delete endpoint: DELETE /reviews/:id
router.delete("/reviews/:id", authenticate, deleteReview);

// ─── AI
router.use("/ai", aiRoutes);

export default router;