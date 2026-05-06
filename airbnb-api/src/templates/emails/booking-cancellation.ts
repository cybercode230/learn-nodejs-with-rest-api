/**
 * File: booking-cancellation.ts
 * What it is doing: Provides the HTML and plain-text email template for booking cancellation notifications.
 * Responsibility: Generating a formatted, readable email sent to a guest when their booking is cancelled.
 * Outcomes: Returns an object with subject, text (plain-text fallback), and html (rich email body).
 */

interface BookingCancellationTemplateParams {
  guestName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
}

export function bookingCancellationTemplate(params: BookingCancellationTemplateParams) {
  const { guestName, listingTitle, checkIn, checkOut } = params;

  const subject = `Booking Cancellation Confirmed — ${listingTitle}`;

  const text = `
Hi ${guestName},

Your booking has been successfully cancelled.

Property: ${listingTitle}
Check-in: ${checkIn}
Check-out: ${checkOut}

If you did not request this cancellation or need assistance, please contact our support team.

We hope to host you again in the future!

The Airbnb API Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Cancellation</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background-color: #e53e3e; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px 24px; }
    .body p { color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
    .details-box { background: #fff5f5; border-left: 4px solid #e53e3e; border-radius: 4px; padding: 16px 20px; margin: 24px 0; }
    .details-box p { margin: 4px 0; font-size: 15px; color: #444; }
    .details-box strong { color: #e53e3e; }
    .footer { background-color: #f4f4f4; padding: 16px 24px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Cancelled</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${guestName}</strong>,</p>
      <p>Your booking has been successfully cancelled. Here are the details of the cancelled reservation:</p>
      <div class="details-box">
        <p><strong>Property:</strong> ${listingTitle}</p>
        <p><strong>Check-in:</strong> ${checkIn}</p>
        <p><strong>Check-out:</strong> ${checkOut}</p>
      </div>
      <p>If you did not request this cancellation or have questions, please contact our support team immediately.</p>
      <p>We hope to welcome you again soon!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Airbnb API. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
