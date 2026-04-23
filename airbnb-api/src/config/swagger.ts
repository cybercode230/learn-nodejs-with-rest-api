import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env["PORT"] || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Listings API",
      version: "1.0.0",
      description: "A professional REST API for Airbnb property listings, users, and bookings",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "username", "phone"],
          properties: {
            id: { type: "string", readOnly: true, example: "usr_789abc" },
            name: { type: "string", example: "Jane Smith" },
            email: { type: "string", example: "jane.smith@example.com" },
            username: { type: "string", example: "janesmith_traveler" },
            phone: { type: "string", example: "+250788123456" },
            role: { type: "string", enum: ["HOST", "GUEST"], example: "HOST" },
            avatar: { type: "string", example: "https://ui-avatars.com/api/?name=Jane+Smith" },
            bio: { type: "string", example: "Passionate host with 5 beautiful properties in Kigali." },
            createdAt: { type: "string", format: "date-time", readOnly: true, example: "2024-04-23T10:00:00Z" },
          },
        },
        Listing: {
          type: "object",
          required: ["title", "description", "location", "pricePerNight", "guests", "type", "hostId"],
          properties: {
            id: { type: "string", readOnly: true, example: "lst_556677" },
            title: { type: "string", example: "Modern Apartment with Kigali View" },
            description: { type: "string", example: "Spacious 2-bedroom apartment located in the heart of Kiyovu." },
            location: { type: "string", example: "Kigali, Rwanda" },
            pricePerNight: { type: "number", example: 85.0 },
            guests: { type: "integer", example: 3 },
            type: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "CABIN"], example: "APARTMENT" },
            amenities: { type: "array", items: { type: "string" }, example: ["High-speed WiFi", "Washer", "Secure Parking", "Balcony"] },
            rating: { type: "number", readOnly: true, example: 4.9 },
            hostId: { type: "string", example: "usr_789abc" },
            createdAt: { type: "string", format: "date-time", readOnly: true, example: "2024-04-20T08:30:00Z" },
          },
        },
        Booking: {
          type: "object",
          required: ["checkIn", "checkOut", "guestId", "listingId"],
          properties: {
            id: { type: "string", readOnly: true, example: "bkg_990011" },
            checkIn: { type: "string", format: "date", example: "2024-05-10" },
            checkOut: { type: "string", format: "date", example: "2024-05-15" },
            totalPrice: { type: "number", readOnly: true, example: 425.0 },
            status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED"], example: "CONFIRMED" },
            guestId: { type: "string", example: "usr_112233" },
            listingId: { type: "string", example: "lst_556677" },
            createdAt: { type: "string", format: "date-time", readOnly: true, example: "2024-04-23T11:00:00Z" },
          },
        },
      },
    },
  },
  apis: ["./src/controllers/*.ts"],
};

export const swaggerDocs = swaggerJsdoc(swaggerOptions);
