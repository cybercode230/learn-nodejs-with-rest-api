/**
 * File: upload.controller.ts
 * What it is doing: Handles all file upload and deletion operations for user avatars and listing photos.
 * Responsibility: Ownership checks, Cloudinary upload/delete lifecycle, database record management, enforcing photo limits.
 * Outcomes: Returns updated user/listing records or success messages; sends proper 400/403/404 on invalid operations.
 */
import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { generateId } from "../utils/idGenerator.js";
import prisma from "../config/prisma.js";

// ─── Avatar Upload ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/users/{id}/avatar:
 *   post:
 *     summary: Upload or replace user profile picture
 *     description: >
 *       Uploads a profile picture for the authenticated user.
 *       If the user already has an avatar, the old file is deleted from Cloudinary first.
 *       Field name must be "image". Only the user themselves can upload their own avatar.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "User ID" }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture file (field name: image)"
 *     responses:
 *       200: { description: Avatar uploaded and user record updated }
 *       400: { description: No file uploaded }
 *       403: { description: You can only update your own avatar }
 *       404: { description: User not found }
 */
export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    const id = req.params["id"] as string;

    // Ownership check — users can only change their own avatar
    if (req.userId !== id) {
      return res.status(403).json({ message: "You can only update your own avatar" });
    }

    // Multer sets req.file — if it's missing, no file was sent in the multipart body
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Always clean up the old file from Cloudinary before uploading a new one
    // This prevents orphaned files accumulating in the CDN storage
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Upload the new avatar buffer to Cloudinary under the avatars folder
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");

    // Persist both the URL and the publicId — the publicId is needed for future deletions
    const updated = await prisma.user.update({
      where: { id },
      data: { avatar: url, avatarPublicId: publicId },
      select: {
        id: true, name: true, email: true, username: true,
        phone: true, role: true, avatar: true, createdAt: true, updatedAt: true
      }
    });

    res.json({ message: "Avatar uploaded successfully", user: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Upload failed", details: error.message });
  }
}

/**
 * @swagger
 * /api/v1/users/{id}/avatar:
 *   delete:
 *     summary: Remove user profile picture
 *     description: Deletes the user's avatar from Cloudinary and clears the avatar fields in the database.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Avatar removed }
 *       400: { description: No avatar to remove }
 *       403: { description: You can only remove your own avatar }
 *       404: { description: User not found }
 */
export async function deleteAvatar(req: AuthRequest, res: Response) {
  try {
    const id = req.params["id"] as string;

    if (req.userId !== id) {
      return res.status(403).json({ message: "You can only remove your own avatar" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Guard against trying to delete when there is no avatar
    if (!user.avatar || !user.avatarPublicId) {
      return res.status(400).json({ message: "No avatar to remove" });
    }

    // Remove the file from Cloudinary CDN using its stored publicId
    await deleteFromCloudinary(user.avatarPublicId);

    // Clear both avatar fields in the database
    await prisma.user.update({
      where: { id },
      data: { avatar: null, avatarPublicId: null }
    });

    res.json({ message: "Avatar removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Delete failed", details: error.message });
  }
}

// ─── Listing Photos ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/listings/{id}/photos:
 *   post:
 *     summary: Upload photos to a listing (up to 5 total)
 *     description: >
 *       Uploads one or more photos to a listing. Maximum 5 photos per listing total.
 *       Only the listing's host can upload photos. Field name must be "photos".
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Listing ID" }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Photo files (field name: photos, max 5 total)"
 *     responses:
 *       200: { description: Photos uploaded, returns updated listing with all photos }
 *       400: { description: No files uploaded or maximum 5 photos reached }
 *       403: { description: Only the listing host can upload photos }
 *       404: { description: Listing not found }
 */
export async function uploadListingPhotos(req: AuthRequest, res: Response) {
  try {
    const id = req.params["id"] as string;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only the host who owns the listing can upload photos
    if (listing.hostId !== req.userId) {
      return res.status(403).json({ message: "Only the listing host can upload photos" });
    }

    // Count existing photos to enforce the 5-photo maximum
    const existingCount = await prisma.listingPhoto.count({ where: { listingId: id } });
    if (existingCount >= 5) {
      return res.status(400).json({ message: "Maximum of 5 photos allowed per listing" });
    }

    // Validate that files were actually sent in the multipart request
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Calculate remaining slots and cap the upload to avoid exceeding the limit
    const remainingSlots = 5 - existingCount;
    const filesToProcess = files.slice(0, remainingSlots);

    // Upload each file to Cloudinary and create a ListingPhoto record
    const uploadPromises = filesToProcess.map(async (file) => {
      const { url, publicId } = await uploadToCloudinary(file.buffer, "airbnb/listings");
      return prisma.listingPhoto.create({
        data: { id: generateId(), url, publicId, listingId: id }
      });
    });

    await Promise.all(uploadPromises);

    // Return the updated listing with all its photos
    const updatedListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: true,
        host: { select: { name: true, avatar: true } },
        _count: { select: { bookings: true } }
      }
    });

    res.json({ message: `${filesToProcess.length} photo(s) uploaded`, listing: updatedListing });
  } catch (error: any) {
    res.status(500).json({ message: "Upload failed", details: error.message });
  }
}

/**
 * @swagger
 * /api/v1/listings/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a specific listing photo
 *     description: >
 *       Deletes a photo from Cloudinary and removes the record from the database.
 *       Only the listing's host can delete photos. Verifies the photo belongs to this listing.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: "Listing ID" }
 *       - { in: path, name: photoId, required: true, schema: { type: string }, description: "Photo ID" }
 *     responses:
 *       200: { description: Photo deleted }
 *       403: { description: Only the listing host can delete photos }
 *       404: { description: Listing or photo not found }
 */
export async function deleteListingPhoto(req: AuthRequest, res: Response) {
  try {
    const { id, photoId } = req.params as { id: string; photoId: string };

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.hostId !== req.userId) {
      return res.status(403).json({ message: "Only the listing host can delete photos" });
    }

    const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    // Security check — prevent hosts from deleting photos belonging to other listings
    // A host should only be able to delete photos from their own listings
    if (photo.listingId !== id) {
      return res.status(403).json({ message: "This photo does not belong to this listing" });
    }

    // Remove from Cloudinary CDN first, then delete the database record
    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    res.json({ message: "Photo deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Delete failed", details: error.message });
  }
}

/**
 * @swagger
 * /api/v1/profile/upload:
 *   post:
 *     summary: Generic file upload for profile documents/media
 *     description: Uploads a file to a specific folder in Cloudinary. Used for profile documents.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: File uploaded successfully }
 */
export async function uploadGeneric(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const folder = req.body.folder || `airbnb/general/${req.userId}`;
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      message: "File uploaded successfully",
      url,
      publicId
    });
  } catch (error: any) {
    res.status(500).json({ message: "Upload failed", details: error.message });
  }
}