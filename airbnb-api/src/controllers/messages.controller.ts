/**
 * File: messages.controller.ts
 * Description: Controller for message history and conversation listings.
 */
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

/**
 * Get distinct conversations for the logged-in user.
 * Groups messages by participant, fetching their details and the latest message.
 */
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Fetch all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Group by participant
    const conversationsMap = new Map<string, any>();

    for (const msg of messages) {
      const isSentByMe = msg.senderId === userId;
      const participant = isSentByMe ? msg.receiver : msg.sender;

      if (!participant) continue;

      if (!conversationsMap.has(participant.id)) {
        conversationsMap.set(participant.id, {
          id: `conv_${participant.id}`,
          participantId: participant.id,
          participantName: participant.name,
          participantAvatar: participant.avatar || "https://a0.muscache.com/defaults/user_pic-50x50.png",
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt.toISOString(),
          unreadCount: 0, // Simplified or calculated if read state is stored
          messages: []
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get full message history between logged-in user and a specific participant.
 */
export const getMessageHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const participantId = req.params.participantId as string;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: participantId },
          { senderId: participantId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Map senderId 'me' on client for convenience
    const mapped = messages.map(m => ({
      id: m.id,
      senderId: m.senderId === userId ? "me" : m.senderId,
      text: m.content,
      timestamp: m.createdAt.toISOString(),
      read: true
    }));

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};
