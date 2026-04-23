import type { Request, Response } from "express";
import { ListingService } from "../services/listing.service.js";
import { ListingType } from "../generated/prisma/index.js";

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
export const getAllListings = async (req: Request, res: Response) => {
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
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Something went wrong" });
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
export const getListingById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const listing = await ListingService.getListingById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Listings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, pricePerNight, guests, type, amenities, hostId]
 *             properties:
 *               title: { type: string, example: "Serene Lake House in Gisenyi" }
 *               description: { type: string, example: "Enjoy a private getaway with a direct view of Lake Kivu. Includes private beach access." }
 *               location: { type: string, example: "Gisenyi, Rwanda" }
 *               pricePerNight: { type: number, example: 120 }
 *               guests: { type: integer, example: 4 }
 *               type: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN], example: "HOUSE" }
 *               amenities: { type: array, items: { type: string }, example: ["WiFi", "Lake View", "Fireplace", "Garden"] }
 *               hostId: { type: string, example: "usr_789abc" }
 *     responses:
 *       201:
 *         description: Listing created
 *       404:
 *         description: Host not found
 */
export const createListing = async (req: Request, res: Response) => {
  try {
    const { title, description, location, pricePerNight, guests, type, amenities, hostId } = req.body;

    if (!title || !description || !location || !pricePerNight || !guests || !type || !amenities || !hostId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newListing = await ListingService.createListing({
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
      hostId
    });

    res.status(201).json(newListing);
  } catch (error: any) {
    if (error.message === "HOST_NOT_FOUND") {
      return res.status(404).json({ message: "Host not found" });
    }
    console.error("Error creating listing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}:
 *   put:
 *     summary: Update listing details
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Updated Villa Title" }
 *               pricePerNight: { type: number, example: 400 }
 *     responses:
 *       200:
 *         description: Listing updated
 *       404:
 *         description: Listing not found
 */
export const updateListing = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const existingListing = await ListingService.getListingById(id);
    if (!existingListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const updatedListing = await ListingService.updateListing(id, req.body);
    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/listings/{id}:
 *   delete:
 *     summary: Delete listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Listing deleted
 *       404:
 *         description: Listing not found
 */
export const deleteListing = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const existingListing = await ListingService.getListingById(id);
    if (!existingListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await ListingService.deleteListing(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
