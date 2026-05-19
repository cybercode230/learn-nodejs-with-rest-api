import prisma from "../config/prisma.js";
import { PushService } from "./push.service.js";

interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  channelId?: "bookings" | "messages" | "reminders" | "promotions";
}

export class NotificationService {
  /**
   * Creates an in-app notification in the database and dispatches a push notification via Expo.
   */
  static async sendNotification(userId: string, payload: NotificationPayload) {
    try {
      // 1. Create in-app notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          data: payload.data || {},
        },
      });

      // 2. Dispatch push notification to registered devices
      await PushService.sendNotification(userId, {
        title: payload.title,
        body: payload.body,
        data: {
          ...payload.data,
          notificationId: notification.id,
          type: payload.type,
        },
        channelId: payload.channelId,
      });

      return notification;
    } catch (error) {
      console.error("[NotificationService] Error sending notification:", error);
    }
  }

  /**
   * Sends notifications to all users with ADMIN role.
   */
  static async sendToAdmins(payload: Omit<NotificationPayload, "channelId"> & { channelId?: "bookings" | "messages" | "reminders" | "promotions" }) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.sendNotification(admin.id, {
          ...payload,
          channelId: payload.channelId || "reminders",
        });
      }
    } catch (error) {
      console.error("[NotificationService] Error sending to admins:", error);
    }
  }
}
