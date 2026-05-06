/**
 * File: swagger.ts
 * What it is doing: Configures the OpenAPI/Swagger documentation for the API.
 * Responsibility: Defining the API's global metadata (title, version, servers), establishing reusable DTO schemas (Users, Listings, Bookings), configuring security schemes (Bearer JWT), and locating endpoint comments.
 * Outcomes: Generates a complete `swaggerDocs` JSON object that is served by the Swagger UI middleware, allowing interactive exploration of the API.
 */
import { url } from "node:inspector";
import swaggerJsdoc from "swagger-jsdoc";

// Default port to construct the development server URL
const PORT = process.env["PORT"] || 3001;

// Root configuration object for Swagger JSDoc
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
        // Define the base URL for API requests made from the Swagger UI
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
      {
        url:`https://learn-nodejs-with-rest-api.onrender.com`,
        description: "Production Server",
      }
    ],
    components: {
      // Reusable security settings for the entire API
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // Apply Bearer Auth globally
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Automatically scan controllers AND DTOs for @swagger comments
  // This ensures that $ref: '#/components/schemas/...' works for schemas defined in dtos/index.ts
  apis: ["./src/controllers/*.ts", "./src/dtos/*.ts"],
};

// Compile and export the final Swagger documentation JSON
export const swaggerDocs = swaggerJsdoc(swaggerOptions);

