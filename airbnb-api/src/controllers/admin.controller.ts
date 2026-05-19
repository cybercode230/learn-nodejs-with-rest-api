import type { Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { NotificationService } from "../services/notification.service.js";
import { runDailyReminders } from "../jobs/reminder.scheduler.js";

export const approveListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await NotificationService.sendNotification(listing.hostId, {
      title: "Listing Approved ✓",
      body: `"${listing.title}" is now live and accepting bookings`,
      type: "listing_approved",
      data: { listingId: id, route: "ListingDetail" },
      channelId: "promotions",
    });

    res.json(updated);
  } catch (error) { next(error); }
};

export const rejectListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await NotificationService.sendNotification(listing.hostId, {
      title: "Listing Needs Changes",
      body: `"${listing.title}" was not approved. Tap to see feedback: ${reason || "No reason provided."}`,
      type: "listing_rejected",
      data: { listingId: id, route: "ListingDetail" },
      channelId: "promotions",
    });

    res.json(updated);
  } catch (error) { next(error); }
};

export const triggerReminders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Run the scheduler synchronously for testing purposes
    await runDailyReminders();
    res.json({ message: "Reminders triggered successfully" });
  } catch (error) { next(error); }
};
