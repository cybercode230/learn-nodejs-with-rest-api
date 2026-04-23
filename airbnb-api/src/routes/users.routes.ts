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

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/:id/listings", getListingsByHost);
router.get("/:id/bookings", getBookingsByGuest);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
