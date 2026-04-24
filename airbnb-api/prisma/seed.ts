import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const connectionString = `${process.env["DATABASE_URL"]}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Clean existing data (Delete children before parents)
  console.log("🧹 Cleaning existing data...");
  await prisma.booking.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Create users (2 hosts, 3 guests)
  console.log("👤 Creating users...");
  const host1 = await prisma.user.create({
    data: {
      id: "usr_host1",
      name: "Jean Bosco",
      email: "bosco@example.rw",
      username: "bosco_host",
      phone: "+250780000001",
      password: hashedPassword,
      role: "HOST",
      bio: "Local host in Gisenyi.",
    },
  });

  const host2 = await prisma.user.create({
    data: {
      id: "usr_host2",
      name: "Sonia Uwase",
      email: "uwase@example.rw",
      username: "sonia_host",
      phone: "+250780000002",
      password: hashedPassword,
      role: "HOST",
      bio: "Boutique hotel owner in Kigali.",
    },
  });

  const guest1 = await prisma.user.create({
    data: {
      id: "usr_guest1",
      name: "Alex Smith",
      email: "alex@example.com",
      username: "alex_traveler",
      phone: "+1234567890",
      password: hashedPassword,
      role: "GUEST",
    },
  });

  const guest2 = await prisma.user.create({
    data: {
      id: "usr_guest2",
      name: "Marie Claire",
      email: "marie@example.rw",
      username: "marie_kgl",
      phone: "+250780000003",
      password: hashedPassword,
      role: "GUEST",
    },
  });

  const guest3 = await prisma.user.create({
    data: {
      id: "usr_guest3",
      name: "David Kim",
      email: "david@example.com",
      username: "david_explores",
      phone: "+1999888777",
      password: hashedPassword,
      role: "GUEST",
    },
  });

  // 3. Create listings (4 listings - APARTMENT, HOUSE, VILLA, CABIN)
  console.log("🏠 Creating listings...");
  const listing1 = await prisma.listing.create({
    data: {
      id: "lst_apt1",
      title: "Cozy Apartment in Kigali Height",
      description: "Modern apartment with a city view.",
      location: "Kimihurura, Kigali",
      pricePerNight: 85,
      guests: 2,
      type: "APARTMENT",
      amenities: ["WiFi", "Gym", "Kitchen", "AC"],
      hostId: host2.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      id: "lst_house1",
      title: "Spacious House near Lake Kivu",
      description: "Perfect for family vacations.",
      location: "Rubavu, Gisenyi",
      pricePerNight: 150,
      guests: 6,
      type: "HOUSE",
      amenities: ["WiFi", "Lake View", "Fireplace", "Garden"],
      hostId: host1.id,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      id: "lst_villa1",
      title: "Luxury Villa in Musanze",
      description: "High-end villa near the Volcanoes National Park.",
      location: "Musanze, Northern Province",
      pricePerNight: 450,
      guests: 8,
      type: "VILLA",
      amenities: ["Private Pool", "WiFi", "Chef", "Security"],
      hostId: host2.id,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      id: "lst_cabin1",
      title: "Mountain Cabin in Nyungwe",
      description: "Authentic cabin experience in the forest.",
      location: "Nyamagabe, Southern Province",
      pricePerNight: 120,
      guests: 4,
      type: "CABIN",
      amenities: ["Forest View", "Fireplace", "Breakfast", "Eco-friendly"],
      hostId: host1.id,
    },
  });

  // 4. Create bookings (3 bookings)
  console.log("📅 Creating bookings...");
  const today = new Date();
  
  // Future dates
  const checkIn1 = new Date(today);
  checkIn1.setDate(today.getDate() + 10);
  const checkOut1 = new Date(checkIn1);
  checkOut1.setDate(checkIn1.getDate() + 5);

  const checkIn2 = new Date(today);
  checkIn2.setDate(today.getDate() + 20);
  const checkOut2 = new Date(checkIn2);
  checkOut2.setDate(checkIn2.getDate() + 3);

  const checkIn3 = new Date(today);
  checkIn3.setDate(today.getDate() + 30);
  const checkOut3 = new Date(checkIn3);
  checkOut3.setDate(checkIn3.getDate() + 2);

  await prisma.booking.create({
    data: {
      id: "bk_1",
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalPrice: 5 * listing1.pricePerNight,
      status: "CONFIRMED",
      guestId: guest1.id,
      listingId: listing1.id,
    },
  });

  await prisma.booking.create({
    data: {
      id: "bk_2",
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalPrice: 3 * listing2.pricePerNight,
      status: "PENDING",
      guestId: guest2.id,
      listingId: listing2.id,
    },
  });

  await prisma.booking.create({
    data: {
      id: "bk_3",
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalPrice: 2 * listing4.pricePerNight,
      status: "CONFIRMED",
      guestId: guest3.id,
      listingId: listing4.id,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
