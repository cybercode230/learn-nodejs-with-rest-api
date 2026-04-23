import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { connectDB } from "./config/prisma.js";
import { swaggerDocs } from "./config/swagger.js";
import usersRoutes from "./routes/users.routes.js";
import listingsRoutes from "./routes/listings.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";

const app = express();
const PORT = process.env["PORT"] || 3000;

// Middleware
app.use(express.json());

import swaggerUi from "swagger-ui-express";

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/airbnb/api/v1/users", usersRoutes);
app.use("/airbnb/api/v1/listings", listingsRoutes);
app.use("/airbnb/api/v1/bookings", bookingsRoutes);

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Airbnb API",
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// Catch-all 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
