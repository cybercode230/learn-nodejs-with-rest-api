/**
 * File: reset-password.ts
 * What it is doing: Provides the template generator for the password reset email.
 * Responsibility: Inserting dynamic user data (name, reset token link, expiration) into HTML and plain-text email layouts.
 * Outcomes: Returns an object containing the email subject, HTML body, and text body, ready to be dispatched by the mailer.
 */

// Interface defining the data required to render the reset password email
export interface ResetPasswordEmailData {
  name: string;
  resetLink: string;
  expiresIn: string;
}

// Function that builds the password reset email strings
export const resetPasswordEmailTemplate = (data: ResetPasswordEmailData) => {
  // Define the email subject line
  const subject = "Password Reset Request";

  // Construct the rich HTML version of the email with inline CSS
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .header { background: #ff5a5f; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px; color: #333333; }
    .content h2 { margin-top: 0; font-size: 20px; }
    .content p { line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; margin: 16px 0; padding: 12px 24px; background: #ff5a5f; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 16px 0; color: #856404; font-size: 14px; }
    .footer { padding: 24px 32px; text-align: center; font-size: 13px; color: #888888; background: #fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Airbnb Clone</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <a href="${data.resetLink}" class="btn">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;font-size:13px;color:#555555;">${data.resetLink}</p>
      <div class="alert">
        <strong>Note:</strong> This link will expire in ${data.expiresIn}. If you did not request a password reset, please ignore this email — your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Airbnb Clone. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();

  // Construct the fallback plain-text version of the email
  const text = `
Hi ${data.name},

We received a request to reset your password. Click the link below to set a new password:

${data.resetLink}

This link will expire in ${data.expiresIn}. If you did not request a password reset, please ignore this email — your password will remain unchanged.

© ${new Date().getFullYear()} Airbnb Clone. All rights reserved.
  `.trim();

  // Return the complete email payload
  return { subject, html, text };
};


