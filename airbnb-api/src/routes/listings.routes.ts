import { Router } from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} from "../controllers/listings.controller.js";

const router = Router();

router.get("/", getAllListings);
router.get("/:id", getListingById);
router.post("/", createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router;
