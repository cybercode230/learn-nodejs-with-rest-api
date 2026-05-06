/**
 * File: mailer.ts
 * What it is doing: Configures and exports a NodeMailer transport instance for sending emails.
 * Responsibility: Connecting to an SMTP server using environment credentials and providing a reusable `sendMail` helper function.
 * Outcomes: Enables the application to send transactional emails (like welcome emails and password resets) reliably.
 */
import nodemailer from "nodemailer";

// Retrieve email configuration from environment variables
const EMAIL_HOST = process.env["EMAIL_HOST"] as string;
const EMAIL_PORT = Number(process.env["EMAIL_PORT"] || 587);
const EMAIL_USER = process.env["EMAIL_USER"] as string;
const EMAIL_PASS = process.env["EMAIL_PASS"] as string;
const EMAIL_FROM = process.env["EMAIL_FROM"] as string;

// Initialize the Nodemailer transporter with the SMTP connection details
export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  // Use SSL/TLS for port 465, otherwise assume STARTTLS
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Interface defining the required and optional fields for sending an email
export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Helper function to dispatch emails using the configured transporter
export const sendMail = async (options: SendMailOptions) => {
  // Execute the sending process and wait for completion
  await transporter.sendMail({
    from: EMAIL_FROM, // Sender address
    to: options.to,   // Recipient address
    subject: options.subject,
    text: options.text, // Plain text body
    html: options.html, // HTML formatted body
  });
};

