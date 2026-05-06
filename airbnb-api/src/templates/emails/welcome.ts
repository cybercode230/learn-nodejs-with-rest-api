/**
 * File: welcome.ts
 * What it is doing: Provides the template generator for the welcome email.
 * Responsibility: Taking user data (name, login URL) and injecting it into both HTML and plain-text email templates.
 * Outcomes: Returns an object containing the email subject, HTML body, and text body, ready to be dispatched by the mailer.
 */

// Interface defining the data required to render the welcome email
export interface WelcomeEmailData {
  name: string;
  loginUrl: string;
}

// Function that builds the welcome email strings
export const welcomeEmailTemplate = (data: WelcomeEmailData) => {
  // Define the email subject line
  const subject = "Welcome to Airbnb Clone! 🎉";

  // Construct the rich HTML version of the email with inline CSS
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .header { background: #ff5a5f; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px; color: #333333; }
    .content h2 { margin-top: 0; font-size: 20px; }
    .content p { line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; margin: 16px 0; padding: 12px 24px; background: #ff5a5f; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; }
    .footer { padding: 24px 32px; text-align: center; font-size: 13px; color: #888888; background: #fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Airbnb Clone</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name}, welcome aboard!</h2>
      <p>Thank you for registering with us. We're excited to have you as part of our community.</p>
      <p>You can now log in to your account and start exploring amazing stays around the world.</p>
      <a href="${data.loginUrl}" class="btn">Log In to Your Account</a>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;font-size:13px;color:#555555;">${data.loginUrl}</p>
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
Hi ${data.name}, welcome aboard!

Thank you for registering with us. We're excited to have you as part of our community.

You can now log in to your account and start exploring amazing stays around the world.

Log In: ${data.loginUrl}

If you did not create this account, please contact our support team immediately.

© ${new Date().getFullYear()} Airbnb Clone. All rights reserved.
  `.trim();

  // Return the complete email payload
  return { subject, html, text };
};


