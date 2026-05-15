/**
 * File: index.ts
 * What it is doing: Entry point for the Express application.
 * Responsibility: Initializing the Express server, applying global middleware (JSON parsing, error handling), configuring Swagger UI, mounting API routes, and connecting to the database.
 * Outcomes: Starts the web server listening on the configured port, ready to accept incoming API requests.
 */
import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { connectDB } from "./config/prisma.js";
import { swaggerDocs } from "./config/swagger.js";
import router from "./routes/v1/index.routes.js";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { deprecateV1 } from "./middlewares/deprecation.middleware.js";
import { logger } from "./utils/logger.js";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";

// Initialize the Express application instance
const app = express();
// Define the port, defaulting to 3000 if not specified in the environment
// const PORT = process.env["PORT"] || 3001;
const PORT = Number(process.env["PORT"]) || 3001;

// Global Middleware
app.use(cors({ origin: "*" }));

// Rate limiting: maximum 100 requests per 1 minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 1 minute",
  handler: (req, res, next, options) => {
    logger.warn(`🛑 RATE LIMITED: IP ${req.ip} exceeded ${options.max} requests limit`);
    res.status(options.statusCode).send(options.message);
  }
});

// Compress HTTP responses
app.use(compression({
  filter: (req, res) => {
    // Rely on the default compression filter logic
    const shouldCompress = compression.filter(req, res);
    if (shouldCompress) {
      logger.info(`🗜️ COMPRESSED: Response for ${req.method} ${req.url}`);
    }
    return shouldCompress;
  }
}));

// Automatically parse incoming requests with JSON payloads
app.use(express.json());

// dev format in development, combined format in production
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));

// Swagger Documentation Middleware
// Serve the Swagger UI interactive documentation at the /api-docs endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
// Mount all application routes under the v1 API prefix
app.use("/api/v1", deprecateV1, router, limiter);
app.use("/api/v2", router, limiter);

// Welcome / Healthcheck Route
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});
// Provide a simple endpoint to verify the API is running and link to the docs
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Airbnb API",
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// Catch-all 404 handler
// If no previous route matched the request, return a 404 error
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error handler
// Catch any errors passed to next() and format them for the client
app.use(errorHandler);

// Function to initialize external dependencies and start the HTTP server
export const startServer = async () => {
  // Ensure the database connection is established before accepting requests
  await connectDB();

  // Start listening on the designated port
  // return app.listen(PORT, "192.168.1.176", () => {
  return app.listen(PORT, () => {
    logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    logger.info(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

// Start the server automatically if we are not in a test environment
if (process.env["NODE_ENV"] !== "test") {
  startServer();
}

// Export the app instance for testing purposes
export default app;

