import type { Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.body;
    if (!listingId) return res.status(400).json({ message: "listingId is required" });

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: req.userId as string,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedListing.create({
        data: {
          userId: req.userId as string,
          listingId,
        },
      });
      res.json({ saved: true });
    }
  } catch (error) { next(error); }
};

export const getWishlists = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wishlists = await prisma.savedListing.findMany({
      where: { userId: req.userId },
      include: {
        listing: {
          include: { photos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(wishlists);
  } catch (error) { next(error); }
};
