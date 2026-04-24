import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { connectDB } from "./config/prisma.js";
import { swaggerDocs } from "./config/swagger.js";
import router from "./routes/index.routes.js";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";


const app = express();
const PORT = process.env["PORT"] || 3000;

// Middleware
app.use(express.json());


// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/airbnb/api/v1", router);

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
app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    logger.info(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

if (process.env["NODE_ENV"] !== "test") {
  startServer();
}

export default app;
