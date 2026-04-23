import { randomBytes } from "node:crypto";

/**
 * Generates a 32-character hexadecimal string (128 bits).
 * This follows the user's request for a full string of 32 hex characters without hyphens.
 */
export const generateId = (): string => {
  return randomBytes(16).toString("hex");
};
