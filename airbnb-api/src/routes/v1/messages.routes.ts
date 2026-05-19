/**
 * File: messages.routes.ts
 * Description: Express router definition for messaging history and conversations.
 */
import { Router } from "express";
import { getConversations, getMessageHistory } from "../../controllers/messages.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Retrieve all conversations of the authenticated user
router.get("/conversations", authenticate, getConversations);

// Retrieve messages thread with a specific user
router.get("/:participantId", authenticate, getMessageHistory);

export default router;
