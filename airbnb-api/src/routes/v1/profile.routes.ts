import { Router } from "express";
import { getProfile, upsertProfile } from "../../controllers/profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import upload from "../../config/multer.js";
import { uploadGeneric } from "../../controllers/upload.controller.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all profile routes
router.use(authenticate);

// Get the authenticated user's profile
router.get("/", getProfile);

// Create or update the authenticated user's profile
router.put("/", upsertProfile);

// Specific endpoint for uploading profile-related documents/media
// This uses the upload middleware to accept images, videos, or documents
router.post("/upload", upload.single("file"), (req, res, next) => {
  // Set default Cloudinary folder for profile uploads based on user ID
  const authReq = req as AuthRequest;
  req.body.folder = req.body.folder || `airbnb/profiles/${authReq.userId}`;
  next();
}, uploadGeneric);

export default router;
