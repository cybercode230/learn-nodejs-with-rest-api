/**
 * File: upload.routes.ts
 * What it is doing: Maps file upload and deletion endpoints to their controller functions.
 * Responsibility: Applying authenticate middleware and Multer file parsers to the correct routes.
 * Outcomes: Exports the upload router with paths matching /users/:id/avatar and /listings/:id/photos.
 */
import { Router } from "express";
import upload from "../../config/multer.js";
import {
  uploadAvatar,
  deleteAvatar,
  uploadListingPhotos,
  deleteListingPhoto
} from "../../controllers/upload.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// ─── User Avatar ──────────────────────────────────────────────────────────────
// POST /users/:id/avatar — upload.single("image") expects field name "image"
router.post("/users/:id/avatar", authenticate, upload.single("image"), uploadAvatar);

// DELETE /users/:id/avatar — removes avatar from Cloudinary + clears DB fields
router.delete("/users/:id/avatar", authenticate, deleteAvatar);

// ─── Listing Photos ───────────────────────────────────────────────────────────
// POST /listings/:id/photos — upload.array("photos", 5) expects field name "photos", max 5 files
router.post("/listings/:id/photos", authenticate, upload.array("photos", 5), uploadListingPhotos);

// DELETE /listings/:id/photos/:photoId — removes specific photo from Cloudinary + DB
router.delete("/listings/:id/photos/:photoId", authenticate, deleteListingPhoto);

export default router;