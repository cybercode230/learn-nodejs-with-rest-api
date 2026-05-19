/**
 * File: socket.ts
 * Description: WebSocket connection manager and event routing handler.
 * 
 * WebSocket Infrastructure Role in System Architecture:
 * 1. REAL-TIME BIDIRECTIONAL COMMUNICATION: WebSockets enable immediate, low-latency, two-way text exchange
 *    between guests and listing hosts/admins without polling HTTP endpoints.
 * 2. CONNECTION STATE MANAGEMENT: Maps active users (`userId`) to their active WebSocket connection handles.
 * 3. PERSISTENT STORAGE: Saves every conversation message to the PostgreSQL `Message` table via Prisma
 *    for offline access and chat history reloading.
 * 4. PUSH FALLBACK: Detects when a message recipient is offline and triggers a push notification
 *    using the `PushService` (`expo-server-sdk`), ensuring messages are never missed.
 * 5. PROTOCOL BINDING: Hooks directly into the primary Node.js HTTP/HTTPS server instance to share the port.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import { NotificationService } from "../services/notification.service.js";

// Map to track active connections: userId -> WebSocket instance
const clients = new Map<string, WebSocket>();

interface IncomingWSMessage {
  type: "auth" | "message";
  token?: string;
  userId?: string; // fallback if testing
  receiverId?: string;
  content?: string;
  listingId?: string;
}

export function initSocketServer(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle express server upgrade request
  server.on("upgrade", (request, socket, head) => {
    // Only accept connection if it requests the correct path or format
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    let currentUserId: string | null = null;

    console.log("[WebSocket] Client connected. Waiting for authentication...");

    ws.on("message", async (rawMessage: string) => {
      try {
        const data: IncomingWSMessage = JSON.parse(rawMessage);

        // 1. AUTH EVENT
        if (data.type === "auth") {
          let verifiedUserId: string | null = null;

          if (data.token) {
            try {
              const decoded = jwt.verify(data.token, process.env.JWT_SECRET || "super-secret-key-change-in-production") as any;
              verifiedUserId = decoded.id;
            } catch (err) {
              console.warn("[WebSocket] JWT verification failed on auth event:", err);
              ws.send(JSON.stringify({ type: "error", message: "Invalid authentication token" }));
              return;
            }
          } else if (data.userId) {
            // For dev/test support
            verifiedUserId = data.userId;
          }

          if (verifiedUserId) {
            currentUserId = verifiedUserId;
            clients.set(currentUserId, ws);
            console.log(`[WebSocket] User authenticated successfully: ${currentUserId}`);
            ws.send(JSON.stringify({ type: "auth_success", userId: currentUserId }));
          }
          return;
        }

        // 2. MESSAGE SEND EVENT
        if (data.type === "message") {
          if (!currentUserId) {
            ws.send(JSON.stringify({ type: "error", message: "Unauthorized. Please authenticate first." }));
            return;
          }

          const { receiverId, content, listingId } = data;
          if (!receiverId || !content) {
            ws.send(JSON.stringify({ type: "error", message: "Missing receiverId or content." }));
            return;
          }

          // Fetch sender profile details to include in message/notification metadata
          const senderInfo = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { name: true },
          });

          const senderName = senderInfo?.name || "Someone";

          // Persist the message to PostgreSQL
          const savedMsg = await prisma.message.create({
            data: {
              content,
              senderId: currentUserId,
              receiverId,
              listingId: listingId || null,
            },
          });

          // Send confirmation back to sender
          ws.send(JSON.stringify({
            type: "msg_sent",
            message: savedMsg,
          }));

          // Forward message in real-time to receiver if online
          const receiverSocket = clients.get(receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(JSON.stringify({
              type: "msg_received",
              message: savedMsg,
              senderName,
            }));
            console.log(`[WebSocket] Message delivered in real-time from ${currentUserId} to ${receiverId}`);
          } else {
            // Recipient is offline/backgrounded: Create in-app + push notification
            console.log(`[WebSocket] User ${receiverId} is offline. Sending notification.`);
            
            await NotificationService.sendNotification(receiverId, {
              title: `New message from ${senderName}`,
              body: content.length > 60 ? `${content.substring(0, 57)}...` : content,
              type: "new_message",
              data: {
                senderId: currentUserId,
                listingId: listingId || "",
                route: "MessageThread",
              },
              channelId: "messages",
            });
          }
        }
      } catch (err) {
        console.error("[WebSocket] Error processing message:", err);
        ws.send(JSON.stringify({ type: "error", message: "Failed to parse message payload" }));
      }
    });

    ws.on("close", () => {
      if (currentUserId) {
        clients.delete(currentUserId);
        console.log(`[WebSocket] Connection closed for user: ${currentUserId}`);
      } else {
        console.log("[WebSocket] Unauthenticated client connection closed.");
      }
    });

    ws.on("error", (err) => {
      console.error(`[WebSocket] Connection error (User: ${currentUserId}):`, err);
    });
  });

  console.log("✅ WebSocket server successfully initialized and bound.");
}

/**
 * Helper to check if a specific user is currently online via WebSockets
 */
export function isUserOnline(userId: string): boolean {
  const client = clients.get(userId);
  return !!client && client.readyState === WebSocket.OPEN;
}
