/**
 * File: auth.service.ts
 * What it is doing: Handles all authentication-related business logic (register, login, forgot/reset/change password).
 * Responsibility: Validating input data via schemas, interacting with the Prisma database to fetch/update users, hashing/comparing passwords, generating/verifying JWTs, and orchestrating email sending for welcome and password reset.
 * Outcomes: Returns sanitized user data, JWT tokens for valid sessions, and standard success/error messages to the controllers.
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { loginSchema, createUserSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../dtos/index.js";
import { sendMail } from "../config/mailer.js";
import { welcomeEmailTemplate } from "../templates/emails/welcome.js";
import { resetPasswordEmailTemplate } from "../templates/emails/reset-password.js";

// Load environment variables for token signing and URL construction
const JWT_SECRET = process.env["JWT_SECRET"] as string;
const APP_URL = process.env["APP_URL"] || "http://localhost:3002";

export class AuthService {
  static async register(rawData: any) {
    // Validate incoming registration data
    const validatedData = createUserSchema.parse(rawData);

    // Check if user already exists using either email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    // If a user with the same email or username is found, throw a constraint error
    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        throw new Error("EMAIL_ALREADY_IN_USE");
      }
      if (existingUser.username === validatedData.username) {
        throw new Error("USERNAME_ALREADY_IN_USE");
      }
    }

    // Securely hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Destructure bio out of validatedData since it belongs in the Profile model, not User
    const { bio, ...userData } = validatedData;

    // Create the new user record in the database
    const userId = generateId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role || "GUEST",
        avatar: userData.avatar,
        profile: {
          create: {
            id: generateId(),
            bio: bio || null, // Bio is stored in the associated Profile record
          }
        }
      }
    });

    // Strip out the password field before returning the user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate the welcome email content
    const welcomeEmail = welcomeEmailTemplate({
      name: user.name,
      loginUrl: `${APP_URL}/airbnb/api/v1/auth/login`,
    });

    // Asynchronously send the welcome email (non-blocking)
    sendMail({
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    }).catch(err => console.error("Failed to send welcome email:", err));

    // Return the sanitized user data
    return userWithoutPassword;
  }

  static async login(rawData: any) {
    // Validate incoming login credentials
    const validatedData = loginSchema.parse(rawData);

    // Look up the user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // Throw error if user does not exist
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Sign a new JWT containing the user ID and role, valid for 7 days
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Omit the password from the returned user details
    const { password: _, ...userWithoutPassword } = user;

    // Return the authentication token and user data
    return { token, user: userWithoutPassword };
  }

  static async forgotPassword(rawData: any) {
    // Validate the email provided for password recovery
    const validatedData = forgotPasswordSchema.parse(rawData);

    // Security principle: always return the same generic 200 message whether the user exists or not.
    // This prevents email enumeration attacks where an attacker could probe which emails are registered.
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // If the user exists, generate a cryptographically secure reset token and send the email.
    // If the user does NOT exist, we silently do nothing — the caller still gets a 200 response.
    if (user) {
      // Generate a cryptographically secure random raw token (256 bits = 32 bytes = 64 hex chars)
      // Raw tokens stored in a database are a security risk if the DB is compromised — store the hash instead
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Hash the raw token using SHA-256 before storing it — the DB never sees the plaintext token
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      // Set a 1-hour expiry window for the reset link
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // Persist the hashed token and expiry to the user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry,
        }
      });

      // The email link carries the RAW token — the recipient hashes it server-side to verify
      // Format: http://localhost:3000/auth/reset-password/<rawToken>
      const resetLink = `${APP_URL}/auth/reset-password/${rawToken}`;

      // Build and send the password reset email
      const resetEmail = resetPasswordEmailTemplate({
        name: user.name,
        resetLink,
        expiresIn: "1 hour",
      });

      sendMail({
        to: user.email,
        subject: resetEmail.subject,
        html: resetEmail.html,
        text: resetEmail.text,
      }).catch(err => console.error("Failed to send reset email:", err));
    }

    // Always return the same vague success message — never reveal whether the email is registered
    return { message: "If that email is registered, a reset link has been sent" };
  }

  static async resetPasswordByToken(rawToken: string, rawData: any) {
    // Validate the new password (must be at least 8 characters)
    const validatedData = resetPasswordSchema.parse(rawData);

    // Hash the incoming raw token to compare against the stored hash
    // The raw token is what the user received in the email link; the DB stores the hash
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Find the user whose hashed reset token matches AND whose expiry hasn't passed
    // Use the same error message for both "not found" and "expired" — never reveal which
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() } // Token must still be within the 1-hour window
      }
    });

    if (!user) {
      // "Invalid or expired reset token" — same message for both cases to prevent probing
      throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

    // Hash the new password before persisting it
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password and clear the reset token fields — one-time use only
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Token is consumed — cannot be reused
        resetTokenExpiry: null, // Clear the expiry too
      }
    });

    return { message: "Password reset successfully" };
  }

  static async changePassword(userId: string, rawData: any) {
    // Validate both fields are present and meet the minimum length requirement
    const validatedData = changePasswordSchema.parse(rawData);

    // Fetch the user's current record to compare their password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    // Verify the provided current password matches the stored bcrypt hash
    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isMatch) {
      throw new Error("WRONG_CURRENT_PASSWORD");
    }

    // Hash the new password before storing
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: "Password changed successfully" };
  }

  static async validateResetToken(rawToken: string) {
    // Hash the incoming raw token and look it up against the stored hash
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    // Reject the token validation if the database record is invalid or expired
    if (!user) {
      throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

    // Confirm the token is valid for the associated user
    return { valid: true, userId: user.id };
  }
}
