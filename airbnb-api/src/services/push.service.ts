/**
 * File: push.service.ts
 * Description: Manages registration, validation, and delivery of push notifications to Expo-enabled devices.
 * Responsibility: Queries user push tokens and invokes the Expo Push API, automatically pruning invalid tokens.
 * Outcomes: Real-time user notification dispatching with proper DB cleanup.
 */

import { Expo } from "expo-server-sdk";
import type { ExpoPushMessage } from "expo-server-sdk";
import prisma from "../config/prisma.js";

// Initialize the Expo SDK client
const expo = new Expo();

export class PushService {
  /**
   * Save a push token for a specific user.
   * If the token already exists for this user, it updates it.
   */
  static async registerToken(userId: string, token: string) {
    if (!token || !userId) return;

    try {
      // Find if token exists
      const existing = await prisma.pushToken.findUnique({
        where: { token },
      });

      if (existing) {
        if (existing.userId === userId) {
          // Already registered to this user, nothing to do
          return existing;
        } else {
          // Re-assigned device to another user: delete old registration
          await prisma.pushToken.delete({
            where: { token },
          });
        }
      }

      // Create new token entry
      return await prisma.pushToken.create({
        data: {
          token,
          userId,
        },
      });
    } catch (error) {
      console.error("[PushService] Error registering token:", error);
    }
  }

  /**
   * Remove a push token from the database.
   */
  static async unregisterToken(token: string) {
    try {
      await prisma.pushToken.deleteMany({
        where: { token },
      });
    } catch (error) {
      console.error("[PushService] Error unregistering token:", error);
    }
  }

  /**
   * Send a push notification to a user's registered devices.
   */
  static async sendNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      data?: Record<string, any>;
      channelId?: "bookings" | "messages" | "reminders" | "promotions";
    }
  ) {
    try {
      // Fetch all tokens for this user
      const userTokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { token: true },
      });

      if (!userTokens.length) {
        console.log(`[PushService] No push tokens found for user ${userId}. Skipping push.`);
        return;
      }

      const messages: ExpoPushMessage[] = [];

      for (const t of userTokens) {
        const token = t.token;

        // Verify if it is a valid Expo Push token
        if (!Expo.isExpoPushToken(token)) {
          console.warn(`[PushService] Invalid Expo push token found: ${token}. Pruning.`);
          await this.unregisterToken(token);
          continue;
        }

        messages.push({
          to: token,
          sound: "default",
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          channelId: payload.channelId || "bookings",
          priority: "high",
        });
      }

      if (messages.length === 0) return;

      // Chunk notifications to avoid hitting payload size limits (Expo limit is 100)
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("[PushService] Error sending chunk:", error);
        }
      }

      // Check receipts and handle errors (e.g. DeviceNotRegistered)
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i] as any;
        if (ticket && ticket.status === "error") {
          console.error(`[PushService] Delivery error: ${ticket.message}`);
          if (ticket.details?.error === "DeviceNotRegistered") {
            const msg = messages[i];
            const staleToken = msg ? (msg.to as string) : null;
            if (staleToken) {
              console.log(`[PushService] Cleaning up inactive token: ${staleToken}`);
              await this.unregisterToken(staleToken);
            }
          }
        }
      }
    } catch (error) {
      console.error("[PushService] Unexpected error sending notification:", error);
    }
  }
}
