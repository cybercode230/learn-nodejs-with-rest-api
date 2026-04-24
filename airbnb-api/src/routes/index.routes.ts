import { Router } from "express";
import listingRoutes from "./listings.routes.js";
import userRoutes from "./users.routes.js";
import bookingRoutes from "./bookings.routes.js";

const router = Router();

router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);

export default router;