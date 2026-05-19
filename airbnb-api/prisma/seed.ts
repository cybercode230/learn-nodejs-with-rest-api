import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import { listingsData } from "./seedsListing.js";

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

  // Common password for all seeded accounts
  const hashedPassword = await bcrypt.hash("cyber@123", 10);

  // 2. Create users (1 admin, 2 hosts, 3 guests)
  console.log("👤 Creating users...");

  // Admin user (also acts as Host 2)
  const admin = await prisma.user.create({
    data: {
      id: "0d7b35f95d22fbdd7f702bb6a01aec88",
      name: "Cyuzuzo Josue",
      email: "cyuzuzojosue230@gmail.com",
      username: "cyuzuzojosue",
      phone: "+250780000000",
      password: hashedPassword,
      role: "ADMIN",
      avatar: "https://res.cloudinary.com/dc3xf2utp/image/upload/v1778231869/airbnb/avatars/oalemvaeha6komr0ew3s.jpg",
    },
  });

  // Host 1: John Doe
  const host1 = await prisma.user.create({
    data: {
      id: "d69642322d00b8d5a97a951bd5758e0e",
      name: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe",
      phone: "+250780000001",
      password: hashedPassword,
      role: "HOST",
      avatar: "https://res.cloudinary.com/dc3xf2utp/image/upload/v1778772612/airbnb/avatars/nq9v9hopevficwybhwjp.jpg",
    },
  });

  // Guest 1
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

  // Guest 2
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

  // Guest 3
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

  // 3. Create listings from seedsListing.ts
  console.log("🏠 Creating listings...");
  
  const typePhotos: Record<string, string[]> = {
    APARTMENT: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ],
    HOUSE: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ],
    VILLA: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
    ],
    CABIN: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80"
    ]
  };

  for (const listing of listingsData) {
    const { host, ...listingFields } = listing;
    
    await prisma.listing.create({
      data: {
        id: listingFields.id,
        title: listingFields.title,
        description: listingFields.description,
        location: listingFields.location,
        pricePerNight: listingFields.pricePerNight,
        guests: listingFields.guests,
        amenities: listingFields.amenities,
        type: listingFields.type,
        hostId: listingFields.hostId,
        createdAt: new Date(listingFields.createdAt),
        updatedAt: new Date(listingFields.updatedAt),
        status: "APPROVED",
      },
    });

    // Create listing photos
    const urls = typePhotos[listingFields.type] || typePhotos["APARTMENT"];
    for (let i = 0; i < urls.length; i++) {
      await prisma.listingPhoto.create({
        data: {
          id: `photo_${listingFields.id}_${i}`,
          url: urls[i],
          publicId: `public_id_${listingFields.id}_${i}`,
          listingId: listingFields.id,
        }
      });
    }
  }

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

  // Listing 7cbcb9162dbac08751b209e616655bc2 is 85 per night
  await prisma.booking.create({
    data: {
      id: "bk_1",
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalPrice: 5 * 85,
      status: "CONFIRMED",
      guestId: guest1.id,
      listingId: "7cbcb9162dbac08751b209e616655bc2",
    },
  });

  // Listing 1ff5e56d0d3be27995441e56f075a8b5 is 110 per night
  await prisma.booking.create({
    data: {
      id: "bk_2",
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalPrice: 3 * 110,
      status: "PENDING",
      guestId: guest2.id,
      listingId: "1ff5e56d0d3be27995441e56f075a8b5",
    },
  });

  // Listing 2d633fc31561ef91ed2cb10400932bdc is 150 per night
  await prisma.booking.create({
    data: {
      id: "bk_3",
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalPrice: 2 * 150,
      status: "CONFIRMED",
      guestId: guest3.id,
      listingId: "2d633fc31561ef91ed2cb10400932bdc",
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
    pool.end();
  });
