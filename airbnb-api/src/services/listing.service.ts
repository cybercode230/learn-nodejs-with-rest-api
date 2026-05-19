/**
 * File: listing.service.ts
 * What it is doing: Handles business logic for property listings.
 * Responsibility: Executing database queries to manage listings, supporting search filters and pagination, computing stats, and validating related entities before creation.
 * Outcomes: Returns filtered lists of properties, individual listing details, search results, stats, or the updated state of listings to the controller.
 */
import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { ListingType, Prisma } from "@prisma/client";
import { createListingSchema, updateListingSchema } from "../dtos/index.js";
import { cleanObject } from "../utils/cleanObject.js";
import { NotificationService } from "./notification.service.js";

export class ListingService {
  static async getAllListings(filters: {
    location?: string;
    type?: ListingType;
    maxPrice?: number;
    skip?: number;
    take?: number;
  }) {
    // Initialize an empty query condition object
    const where: Prisma.ListingWhereInput = { status: "APPROVED" };

    // Add location search filter (case-insensitive substring match) if provided
    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: "insensitive"
      };
    }

    // Add exact property type filter if provided
    if (filters.type) {
      where.type = filters.type;
    }

    // Add maximum price filter if provided
    if (filters.maxPrice) {
      where.pricePerNight = {
        lte: filters.maxPrice
      };
    }

    // Prepare the base query options:
    // - host: { select: { name, avatar } } gives the host's display info
    // - _count: { select: { bookings: true } } gives total booking count per listing
    const options: Prisma.ListingFindManyArgs = {
      where,
      include: {
        host: {
          select: {
            name: true,
            avatar: true
          }
        },
        photos: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    };

    // Apply pagination offsets and limits if defined in the filters
    if (filters.skip !== undefined) options.skip = filters.skip;
    if (filters.take !== undefined) options.take = filters.take;

    // Execute the query to find listings and count total matching documents in parallel
    const [listings, total] = await Promise.all([
      prisma.listing.findMany(options),
      prisma.listing.count({ where })
    ]);

    return { data: listings, total };
  }

  static async searchListings(filters: {
    location?: string;
    type?: ListingType;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    skip?: number;
    take?: number;
  }) {
    // Build the Prisma where clause dynamically based on provided filters
    const where: Prisma.ListingWhereInput = { status: "APPROVED" };

    if (filters.location) {
      where.location = { contains: filters.location, mode: "insensitive" };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    // Price range filter — supports both minPrice and maxPrice independently
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (filters.minPrice !== undefined) {
        (where.pricePerNight as Prisma.FloatFilter).gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (where.pricePerNight as Prisma.FloatFilter).lte = filters.maxPrice;
      }
    }

    // Filter by minimum guest capacity
    if (filters.guests !== undefined) {
      where.guests = { gte: filters.guests };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          host: { select: { name: true, avatar: true } },
          photos: true,
          _count: { select: { bookings: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take
      }),
      prisma.listing.count({ where })
    ]);

    return { data: listings, total };
  }

  static async getListingById(id: string) {
    // Retrieve a single listing by its ID, including host info, photos, and booking count
    return prisma.listing.findUnique({
      where: { id },
      include: {
        host: {
          select: { name: true, avatar: true, email: true }
        },
        photos: true,
        bookings: true,
        _count: { select: { bookings: true } }
      }
    });
  }

  static async createListing(rawData: any) {
    // Extract hostId from rawData before validation — it comes from req.userId (token), not the client body
    const { hostId, ...bodyData } = rawData;

    // Validate the rest of the payload (hostId is excluded from the schema intentionally)
    const validatedData = createListingSchema.parse(bodyData);

    // Verify the assigned host actually exists in the database
    const host = await prisma.user.findUnique({ where: { id: hostId } });
    if (!host) {
      throw new Error("HOST_NOT_FOUND");
    }

    // Create the listing in the DB with a generated ID
    return prisma.listing.create({
      data: cleanObject({
        ...validatedData,
        id: generateId(),
        hostId
      }),
      include: {
        host: { select: { name: true, avatar: true } },
        _count: { select: { bookings: true } }
      }
    });
  }

  static async updateListing(id: string, rawData: any) {
    // Validate the incoming data against the update schema
    const validatedData = updateListingSchema.parse(rawData);

    // Check if price dropped
    if (validatedData.pricePerNight !== undefined) {
      const existingListing = await prisma.listing.findUnique({ where: { id } });
      if (existingListing && validatedData.pricePerNight < existingListing.pricePerNight) {
        // Find users who saved this listing
        const savedListings = await prisma.savedListing.findMany({ where: { listingId: id } });
        
        // Notify them asynchronously
        Promise.all(savedListings.map((sl: { userId: string }) => 
          NotificationService.sendNotification(sl.userId, {
            title: "Price drop on your wishlist 💸",
            body: `"${existingListing.title}" dropped from $${existingListing.pricePerNight} to $${validatedData.pricePerNight}/night`,
            type: "price_drop",
            data: { listingId: id, route: "ListingDetail" },
            channelId: "promotions"
          })
        )).catch(err => console.error("Error sending price drop notifications:", err));
      }
    }

    // Update the targeted listing using cleanObject to remove undefined properties
    return prisma.listing.update({
      where: { id },
      data: cleanObject(validatedData),
      include: {
        host: { select: { name: true, avatar: true } },
        _count: { select: { bookings: true } }
      }
    });
  }

  static async deleteListing(id: string) {
    // Delete the specified listing record (cascade deletes photos, bookings, reviews)
    return prisma.listing.delete({
      where: { id }
    });
  }

  static async getListingStats() {
    // Run all aggregation queries in parallel for optimal performance — no sequential queries
    const [
      totalListings,
      priceAggregate,
      byLocation,
      byType
    ] = await Promise.all([
      // Total count of all listings on the platform
      prisma.listing.count(),

      // Average pricePerNight across all listings
      prisma.listing.aggregate({
        _avg: { pricePerNight: true }
      }),

      // Count of listings grouped by location
      prisma.listing.groupBy({
        by: ["location"],
        _count: { location: true },
        orderBy: { _count: { location: "desc" } }
      }),

      // Count of listings grouped by type (APARTMENT, HOUSE, VILLA, CABIN)
      prisma.listing.groupBy({
        by: ["type"],
        _count: { type: true },
        orderBy: { _count: { type: "desc" } }
      })
    ]);

    return {
      totalListings,
      averagePrice: priceAggregate._avg.pricePerNight,
      byLocation,
      byType
    };
  }

  // --- SEARCH HISTORY LOGIC ---

  static async saveSearchHistory(userId: string, filters: any) {
    const { location, type, minPrice, maxPrice, guests } = filters;
    
    // Check if a similar search already exists to prevent clutter
    const existing = await prisma.searchHistory.findFirst({
      where: {
        userId,
        location: location || null,
        type: type || null,
        guests: guests ? parseInt(guests) : null
      }
    });

    if (existing) {
      // Update timestamp to bring it to top of recent searches
      return prisma.searchHistory.update({
        where: { id: existing.id },
        data: { createdAt: new Date() }
      });
    }

    return prisma.searchHistory.create({
      data: {
        id: generateId(),
        userId,
        location: location || null,
        type: type || null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        guests: guests ? parseInt(guests) : null
      }
    });
  }

  static async getUserSearchHistory(userId: string) {
    return prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  }

  static async getHostListings(hostId: string) {
    return prisma.listing.findMany({
      where: { hostId },
      include: {
        photos: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
