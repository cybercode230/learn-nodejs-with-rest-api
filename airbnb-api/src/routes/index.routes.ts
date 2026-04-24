import { Router } from "express";
import listingRoutes from "./listings.routes.js";
import userRoutes from "./users.routes.js";
import bookingRoutes from "./bookings.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);

export default router;