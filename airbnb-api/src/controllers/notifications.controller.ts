import type { Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read for the user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) { next(error); }
};
