/// <reference types="jest" />
import request from "supertest";
import app from "../src/index.js";
import { getPrismaClient } from "./setup.js";

const prisma = getPrismaClient();

describe("User API", () => {
  beforeEach(async () => {
    // Clear data before each test
    await prisma.booking.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should create a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      phone: "+250780000000",
      password: "password123",
      role: "GUEST"
    };

    const response = await request(app)
      .post("/airbnb/api/v1/users")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.id).toBeDefined();
  });

  it("should return 400 for invalid user data", async () => {
    const invalidData = {
      name: "T", // too short
      email: "invalid-email",
    };

    const response = await request(app)
      .post("/airbnb/api/v1/users")
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Validation failed");
  });

  it("should get all users", async () => {
    // Seed a user first
    await prisma.user.create({
      data: {
        id: "usr_test",
        name: "Seed User",
        email: "seed@example.com",
        username: "seeduser",
        phone: "+250780000001",
        password: "hashedpassword"
      }
    });

    const response = await request(app).get("/airbnb/api/v1/users");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
