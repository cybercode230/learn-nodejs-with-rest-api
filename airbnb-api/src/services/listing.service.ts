import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { ListingType, Prisma } from "../generated/prisma/index.js";
import { createListingSchema, updateListingSchema } from "../dtos/index.js";
import { cleanObject } from "../utils/cleanObject.js";

export class ListingService {
  static async getAllListings(filters: {
    location?: string;
    type?: ListingType;
    maxPrice?: number;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.ListingWhereInput = {};

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: "insensitive"
      };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.maxPrice) {
      where.pricePerNight = {
        lte: filters.maxPrice
      };
    }

    const options: Prisma.ListingFindManyArgs = {
      where,
      include: {
        host: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    };

    if (filters.skip !== undefined) options.skip = filters.skip;
    if (filters.take !== undefined) options.take = filters.take;

    return prisma.listing.findMany(options);
  }

  static async getListingById(id: string) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        host: true,
        bookings: true
      }
    });
  }

  static async createListing(rawData: any) {
    const validatedData = createListingSchema.parse(rawData);

    // Verify host exists
    const host = await prisma.user.findUnique({ where: { id: validatedData.hostId } });
    if (!host) {
      throw new Error("HOST_NOT_FOUND");
    }

    return prisma.listing.create({
      data: cleanObject({
        ...validatedData,
        id: generateId()
      })
    });
  }

  static async updateListing(id: string, rawData: any) {
    const validatedData = updateListingSchema.parse(rawData);

    return prisma.listing.update({
      where: { id },
      data: cleanObject(validatedData)
    });
  }

  static async deleteListing(id: string) {
    return prisma.listing.delete({
      where: { id }
    });
  }
}
