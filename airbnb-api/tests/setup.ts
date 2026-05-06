/// <reference types="jest" />
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { execSync } from "child_process";

const connectionString = `${process.env["DATABASE_URL"]}`;

export const getPrismaClient = () => {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prisma = getPrismaClient();

beforeAll(async () => {
  // Sync database schema for testing
  console.log("🛠️ Syncing test database...");
  execSync("npx prisma db push", { 
    stdio: "inherit",
    env: { ...process.env }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
