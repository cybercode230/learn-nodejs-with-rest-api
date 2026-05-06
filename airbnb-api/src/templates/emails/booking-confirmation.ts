export const bookingConfirmationTemplate = ({
  guestName,
  listingTitle,
  checkIn,
  checkOut,
  totalPrice,
}: {
  guestName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}) => {
  return {
    subject: `Booking Confirmation for ${listingTitle}`,
    text: `Hi ${guestName},\n\nYour booking for ${listingTitle} is confirmed!\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nTotal Price: $${totalPrice}\n\nThanks for choosing us!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ff385c; margin-top: 0;">Hi ${guestName},</h2>
        <p>Your booking for <strong>${listingTitle}</strong> is confirmed!</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 10px;"><strong>Check-in:</strong> ${checkIn}</li>
            <li style="margin-bottom: 10px;"><strong>Check-out:</strong> ${checkOut}</li>
            <li><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</li>
          </ul>
        </div>
        <p style="color: #4a5568;">Thanks for choosing Airbnb Clone!</p>
      </div>
    `,
  };
};
