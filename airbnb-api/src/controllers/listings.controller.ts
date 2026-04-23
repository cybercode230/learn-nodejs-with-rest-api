import type { Request, Response } from "express";
import { listings, type Listing } from "../models/listing.model.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     Listing:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - pricePerNight
 *         - guests
 *         - type
 *         - amenities
 *         - host
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the listing
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         pricePerNight:
 *           type: number
 *         guests:
 *           type: number
 *         type:
 *           type: string
 *           enum: [apartment, house, villa, cabin]
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *         host:
 *           type: string
 */

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Returns the list of all listings
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: The list of listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 */
export const getAllListings = (req: Request, res: Response) => {
  res.json(listings);
};

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The listing id
 *     responses:
 *       200:
 *         description: The listing description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 */
export const getListingById = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const listing = listings.find((l) => l.id === id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }
  res.json(listing);
};

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Listing'
 *     responses:
 *       201:
 *         description: The listing was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Missing required fields
 */
export const createListing = (req: Request, res: Response) => {
  const { title, description, location, pricePerNight, guests, type, amenities, host, rating } = req.body;

  if (!title || !description || !location || !pricePerNight || !guests || !type || !amenities || !host) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newListing: Listing = {
    id: listings.length > 0 ? Math.max(...listings.map((l) => l.id)) + 1 : 1,
    title,
    description,
    location,
    pricePerNight,
    guests,
    type,
    amenities,
    host,
    rating
  };

  listings.push(newListing);
  res.status(201).json(newListing);
};

/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Update an existing listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The listing id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Listing'
 *     responses:
 *       200:
 *         description: The listing was updated
 *       404:
 *         description: Listing not found
 */
export const updateListing = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const listingIndex = listings.findIndex((l) => l.id === id);

  if (listingIndex === -1) {
    return res.status(404).json({ message: "Listing not found" });
  }

  const updatedListing = { ...listings[listingIndex], ...req.body, id };
  listings[listingIndex] = updatedListing;
  res.json(updatedListing);
};

/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Delete a listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The listing id
 *     responses:
 *       204:
 *         description: Listing deleted successfully
 *       404:
 *         description: Listing not found
 */
export const deleteListing = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const listingIndex = listings.findIndex((l) => l.id === id);

  if (listingIndex === -1) {
    return res.status(404).json({ message: "Listing not found" });
  }

  listings.splice(listingIndex, 1);
  res.status(204).send();
};
