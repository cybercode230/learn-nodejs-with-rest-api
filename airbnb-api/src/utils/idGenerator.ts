/**
 * File: idGenerator.ts
 * What it is doing: Provides a utility for generating secure, unique identifiers.
 * Responsibility: Utilizing Node's built-in crypto module to create random byte sequences and formatting them as hexadecimal strings.
 * Outcomes: Returns a 32-character hexadecimal string to be used as primary keys (IDs) for database records.
 */
import { randomBytes } from "node:crypto";

/**
 * Generates a 32-character hexadecimal string (128 bits).
 * This follows the user's request for a full string of 32 hex characters without hyphens.
 */
export const generateId = (): string => {
  // Generate 16 random bytes and convert them to a hex string
  return randomBytes(16).toString("hex");
};

