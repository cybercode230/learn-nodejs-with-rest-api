import type { Request, Response, NextFunction } from "express";
import { ListingService } from "../services/listing.service.js";
import { ListingType, Role } from "../generated/prisma/index.js";
import { createListingSchema, updateListingSchema } from "../dtos/index.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * /airbnb/api/v1/listings:
 *   get:
 *     summary: Get all listings with filters and pagination
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *         example: "Malibu"
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] }
 *         example: "APARTMENT"
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         example: 200
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of properties
 */
export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, type, maxPrice, page, limit } = req.query;

    const pageInt = parseInt(page as string) || 1;
    const limitInt = parseInt(limit as string) || 10;
    const skip = (pageInt - 1) * limitInt;

    const filters: any = {
      skip,
      take: limitInt
    };

    if (location) filters.location = location as string;
    if (type) filters.type = type as ListingType;
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

    const listings = await ListingService.getAllListings(filters);

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}:
 *   get:
 *     summary: Get listing details by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing details
 *       404:
 *         description: Listing not found
 */
export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listing = await ListingService.getListingById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingDTO'
 *     responses:
 *       201:
 *         description: Listing created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newListing = await ListingService.createListing({
      ...req.body,
      hostId: req.userId
    });
    res.status(201).json(newListing);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}:
 *   put:
 *     summary: Update listing details
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListingDTO'
 *     responses:
 *       200:
 *         description: Listing updated
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Listing not found
 */
export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    
    // Ownership check
    const listing = await ListingService.getListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.hostId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only update your own listings" });
    }

    const updatedListing = await ListingService.updateListing(id, req.body);
    res.json(updatedListing);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}:
 *   delete:
 *     summary: Delete listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Listing deleted
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Listing not found
 */
export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;

    // Ownership check
    const listing = await ListingService.getListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.hostId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own listings" });
    }

    await ListingService.deleteListing(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
