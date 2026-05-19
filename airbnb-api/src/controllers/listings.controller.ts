/**
 * File: listings.controller.ts
 * What it is doing: Provides API endpoint logic for managing property listings.
 * Responsibility: Pagination, filtering, ownership checks, search, and stats.
 * Outcomes: Sends paginated lists, single listing objects, search results, stats, or HTTP error codes.
 */
import type { Request, Response, NextFunction } from "express";
import { ListingService } from "../services/listing.service.js";
import { ListingType, Role } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";

/**
 * @swagger
 * /api/v1/listings:
 *   get:
 *     summary: Get all listings (paginated, includes host name/avatar and booking count)
 *     tags: [Listings]
 *     parameters:
 *       - { in: query, name: location, schema: { type: string }, example: "Malibu" }
 *       - { in: query, name: type, schema: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] } }
 *       - { in: query, name: maxPrice, schema: { type: number }, example: 200 }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200:
 *         description: Paginated listings with host.name, host.avatar, _count.bookings
 */
export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, type, maxPrice, page, limit } = req.query;
    const pageInt = parseInt(page as string) || 1;
    const limitInt = parseInt(limit as string) || 10;
    const skip = (pageInt - 1) * limitInt;
    const filters: any = { skip, take: limitInt };
    if (location) filters.location = location as string;
    if (type) filters.type = type as ListingType;
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    const { data, total } = await ListingService.getAllListings(filters);
    res.json({ data, meta: { total, page: pageInt, limit: limitInt, totalPages: Math.ceil(total / limitInt) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/search:
 *   get:
 *     summary: Search listings by location, type, price range, and guests
 *     tags: [Listings]
 *     parameters:
 *       - { in: query, name: location, schema: { type: string }, example: "NYC" }
 *       - { in: query, name: type, schema: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] } }
 *       - { in: query, name: minPrice, schema: { type: number }, example: 50 }
 *       - { in: query, name: maxPrice, schema: { type: number }, example: 200 }
 *       - { in: query, name: guests, schema: { type: integer }, example: 2 }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200:
 *         description: Filtered and paginated listings
 */
export const searchListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, type, minPrice, maxPrice, guests, page, limit } = req.query;
    const pageInt = parseInt(page as string) || 1;
    const limitInt = parseInt(limit as string) || 10;
    const skip = (pageInt - 1) * limitInt;
    const filters: any = { skip, take: limitInt };
    if (location) filters.location = location as string;
    if (type) filters.type = type as ListingType;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (guests) filters.guests = parseInt(guests as string);
    const { data, total } = await ListingService.searchListings(filters);
    res.json({ data, meta: { total, page: pageInt, limit: limitInt, totalPages: Math.ceil(total / limitInt) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/stats:
 *   get:
 *     summary: Get platform-wide listing statistics
 *     description: Total listings, average price, count by location and type — all via a single Promise.all call.
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listing stats
 *         content:
 *           application/json:
 *             example:
 *               totalListings: 120
 *               averagePrice: 145.50
 *               byLocation: [{ location: "New York", _count: { location: 30 } }]
 *               byType: [{ type: "APARTMENT", _count: { type: 45 } }]
 */
export const getListingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await ListingService.getListingStats();
    res.json(stats);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   get:
 *     summary: Get listing by ID (includes photos, host info, booking count)
 *     tags: [Listings]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Listing details }
 *       404: { description: Listing not found }
 */
export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listing = await ListingService.getListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings:
 *   post:
 *     summary: Create a new property listing
 *     description: hostId is derived from the JWT token — do NOT include it in the body.
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, pricePerNight, guests, type, amenities]
 *             properties:
 *               title: { type: string, example: "Modern Beach Villa", minLength: 5 }
 *               description: { type: string, example: "A beautiful villa with ocean views.", minLength: 10 }
 *               location: { type: string, example: "Malibu, CA" }
 *               pricePerNight: { type: number, example: 350, minimum: 1 }
 *               guests: { type: integer, example: 6, minimum: 1 }
 *               type: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN], example: "VILLA" }
 *               amenities: { type: array, items: { type: string }, example: ["WiFi", "Pool", "Beach Access"] }
 *     responses:
 *       201: { description: Listing created }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: HOST role required }
 */
export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Strip hostId from body — must never come from client input, always from the verified token
    const { hostId: _ignored, ...bodyWithoutHostId } = req.body;
    const newListing = await ListingService.createListing({
      ...bodyWithoutHostId,
      hostId: req.userId
    });
    res.status(201).json(newListing);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   put:
 *     summary: Update listing (host owner or ADMIN only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Updated Beach Villa" }
 *               description: { type: string, example: "Updated description." }
 *               pricePerNight: { type: number, example: 400 }
 *               guests: { type: integer, example: 8 }
 *               amenities: { type: array, items: { type: string }, example: ["WiFi", "Pool", "Hot Tub"] }
 *     responses:
 *       200: { description: Listing updated }
 *       403: { description: You can only edit your own listings }
 *       404: { description: Listing not found }
 */
export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listing = await ListingService.getListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    // Only the owner (HOST) can update the listing. Admin can only DELETE.
    if (listing.hostId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own listings" });
    }
    const updatedListing = await ListingService.updateListing(id, req.body);
    res.json(updatedListing);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   delete:
 *     summary: Delete listing (host owner or ADMIN only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Listing deleted }
 *       403: { description: You can only delete your own listings }
 *       404: { description: Listing not found }
 */
export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listing = await ListingService.getListingById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    // ADMIN bypasses ownership check
    if (listing.hostId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }
    await ListingService.deleteListing(id);
    res.status(204).send();
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/listings/history:
 *   post:
 *     summary: Save a search query to user history
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string }
 *               type: { type: string }
 *               minPrice: { type: number }
 *               maxPrice: { type: number }
 *               guests: { type: integer }
 *     responses:
 *       201: { description: History saved }
 *   get:
 *     summary: Get current user's search history
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of search history items }
 */
export const saveSearchHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await ListingService.saveSearchHistory(req.userId!, req.body);
    res.status(201).send();
  } catch (error) { next(error); }
};

export const getSearchHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await ListingService.getUserSearchHistory(req.userId!);
    res.json(history);
  } catch (error) { next(error); }
};

export const getHostListings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listings = await ListingService.getHostListings(req.userId!);
    res.json(listings);
  } catch (error) { next(error); }
};

export const reportListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const reason = req.body.reason as string;
    if (!reason) return res.status(400).json({ message: "Reason is required" });

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const report = await prisma.report.create({
      data: {
        userId: req.userId as string,
        listingId: id,
        reason,
      }
    });

    await NotificationService.sendToAdmins({
      title: "Listing Reported ⚠️",
      body: `"${listing.title}" was reported for: ${reason}`,
      type: "listing_reported",
      data: { listingId: id, reportId: report.id, route: "ListingDetail" }
    });

    res.status(201).json({ message: "Listing reported successfully" });
  } catch (error: any) { 
    next(error); 
  }
};
