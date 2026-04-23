import express from "express";
import type{NextFunction,Request,Response} from "express"
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import usersRoutes from "./routes/users.routes.js";
import listingsRoutes from "./routes/listings.routes.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Listings API",
      version: "1.0.0",
      description: "A simple REST API for Airbnb property listings and users",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./src/controllers/*.ts"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/users", usersRoutes);
app.use("/listings", listingsRoutes);

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Airbnb Listings API",
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// Catch-all 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
