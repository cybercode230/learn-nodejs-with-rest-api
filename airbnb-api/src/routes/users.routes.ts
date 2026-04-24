import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getListingsByHost,
  getBookingsByGuest
} from "../controllers/users.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getAllUsers);
router.get("/:id", authenticate, getUserById);
router.get("/:id/listings", getListingsByHost);
router.get("/:id/bookings", getBookingsByGuest);
router.post("/", authenticate, requireAdmin, createUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
