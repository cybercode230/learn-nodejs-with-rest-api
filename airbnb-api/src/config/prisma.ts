/**
 * File: prisma.ts
 * What it is doing: Initializes the Prisma ORM client with a PostgreSQL adapter.
 * Responsibility: Creating a connection pool to the database, configuring the Prisma Client to use this pool, and providing a function to explicitly connect and verify the DB status on startup.
 * Outcomes: Exports a ready-to-use `prisma` instance for performing database operations throughout the application.
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaClient } from "@prisma/client";


// Fetch the database URL from environment variables
const connectionString = `${process.env["DATABASE_URL"]}`;

// Initialize a pg connection pool for efficient database connection reuse
const pool = new pg.Pool({ connectionString });
// Wrap the pool in Prisma's PostgreSQL adapter
const adapter = new PrismaPg(pool);
// Instantiate the Prisma Client with the custom adapter
const prisma = new PrismaClient({ adapter });


// Helper function to establish the initial connection and log the status
export const connectDB = async () => {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    // Log failure and crash the process if the DB cannot be reached
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Export the initialized client as the default export for app-wide use
export default prisma;

