import prisma from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

/**
 * ProfileService handles all business logic related to user profiles.
 */
export class ProfileService {
  /**
   * Retrieves a profile by the associated user ID.
   * @param userId The ID of the user
   */
  static async getProfileByUserId(userId: string) {
    let profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          }
        }
      }
    });

    if (!profile) {
      // Create empty profile if one doesn't exist to prevent 'Profile not found' for old users
      profile = await prisma.profile.create({
        data: {
          id: uuidv4(),
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            }
          }
        }
      });
    }

    return profile;
  }

  /**
   * Creates or updates a profile for a given user.
   * @param userId The ID of the user
   * @param data The profile data to upsert
   */
  static async upsertProfile(userId: string, data: { bio?: string; phoneNumber?: string; address?: string }) {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        id: uuidv4(),
        userId,
        ...data,
      },
    });
  }
}
