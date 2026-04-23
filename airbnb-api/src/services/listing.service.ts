import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { ListingType, Prisma } from "../generated/prisma/index.js";

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

  static async createListing(data: {
    title: string;
    description: string;
    location: string;
    pricePerNight: number;
    guests: number;
    type: ListingType;
    amenities: string[];
    hostId: string;
  }) {
    // Verify host exists
    const host = await prisma.user.findUnique({ where: { id: data.hostId } });
    if (!host) {
      throw new Error("HOST_NOT_FOUND");
    }

    return prisma.listing.create({
      data: {
        ...data,
        id: generateId()
      }
    });
  }

  static async updateListing(id: string, data: any) {
    return prisma.listing.update({
      where: { id },
      data
    });
  }

  static async deleteListing(id: string) {
    return prisma.listing.delete({
      where: { id }
    });
  }
}
