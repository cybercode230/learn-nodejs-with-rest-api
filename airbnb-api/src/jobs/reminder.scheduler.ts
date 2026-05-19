import cron from "node-cron";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";

/**
 * Checks for bookings starting today or ending today, and sends reminders.
 */
export const runDailyReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Check-in Reminders
    const checkIns = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        listing: { select: { title: true, location: true } },
      },
    });

    for (const booking of checkIns) {
      await NotificationService.sendNotification(booking.guestId, {
        title: "Check-in today! 🏠",
        body: `You check in to "${booking.listing.title}" today. Location: ${booking.listing.location}`,
        type: "checkin_reminder",
        data: { bookingId: booking.id, route: "BookingDetail" },
        channelId: "reminders",
      });
    }

    // 2. Check-out Reminders
    const checkOuts = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkOut: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        listing: { select: { title: true } },
      },
    });

    for (const booking of checkOuts) {
      await NotificationService.sendNotification(booking.guestId, {
        title: "Check-out reminder ⏰",
        body: `Your stay at "${booking.listing.title}" ends today. Don't forget to check out by the agreed time.`,
        type: "checkout_reminder",
        data: { bookingId: booking.id, route: "BookingDetail" },
        channelId: "reminders",
      });
    }

    console.log(`[Scheduler] Processed ${checkIns.length} check-ins and ${checkOuts.length} check-outs.`);
  } catch (error) {
    console.error("[Scheduler] Error running daily reminders:", error);
  }
};

/**
 * Initialize all cron jobs
 */
export const initSchedulers = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", () => {
    console.log("[Scheduler] Running daily 8:00 AM tasks...");
    runDailyReminders();
  });
};
