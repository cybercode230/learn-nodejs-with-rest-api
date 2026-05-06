import type { Request, Response } from "express";
import { ProfileService } from "../services/profile.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieves the profile details for the authenticated user, including related user data like avatar.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const profile = await ProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve profile", details: error.message });
  }
}

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Create or update current user's profile
 *     description: Upserts the profile details for the authenticated user.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Internal server error
 */
export async function upsertProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { bio, phoneNumber, address } = req.body;
    
    const profile = await ProfileService.upsertProfile(userId, { bio, phoneNumber, address });
    
    res.json({ message: "Profile updated successfully", profile });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
}
