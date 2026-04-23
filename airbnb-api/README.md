# Airbnb Listings API — Lesson 2: Databases & Prisma

A professional REST API that mimics Airbnb, built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** connecting to a **PostgreSQL** database.

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database running
- `.env` file configured with `DATABASE_URL`

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## 🛠 API Structure

All endpoints are accessible from the root `/`.

### 👤 Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user details, listings, and bookings
- `GET /users/:id/listings` - Get all listings by a host
- `GET /users/:id/bookings` - Get all bookings by a guest
- `POST /users` - Create a new user
- `PUT /users/:id` - Update user details
- `DELETE /users/:id` - Delete a user

### 🏠 Listings
- `GET /listings` - Get all listings (supports filtering & pagination)
  - `location`: filter by location (case-insensitive)
  - `type`: filter by `APARTMENT`, `HOUSE`, `VILLA`, `CABIN`
  - `maxPrice`: filter by maximum price per night
  - `page` & `limit`: pagination support
- `GET /listings/:id` - Get listing details and host info
- `POST /listings` - Create a listing
- `PUT /listings/:id` - Update a listing
- `DELETE /listings/:id` - Delete a listing

### 📅 Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create a booking (Calculates price server-side)
- `PATCH /bookings/:id/status` - Update booking status
- `DELETE /bookings/:id` - Cancel/Delete a booking

## 📚 Research Tasks

### 1. `onDelete: Cascade` in Prisma
**What happens to a host's listings when the host is deleted?**
In our schema, we used `onDelete: Cascade`. This means if a User (Host) is deleted, all their associated Listings will be automatically deleted by the database to maintain referential integrity.

**What should happen to bookings?**
Similarly, if a Listing or a Guest is deleted, the associated Bookings are cascaded and deleted. In a real business scenario, you might prefer "Soft Deletes" or `onDelete: SetNull` for bookings to keep financial records, but for this lesson, `Cascade` ensures a clean database.

### 2. `select` vs `include` vs `_count`
- **`include`**: Fetches all fields of the related record (e.g., fetching a listing with all host details).
- **`select`**: Fetches only specific fields of the related record (e.g., fetching a listing but only the host's name). This is more efficient for bandwidth.
- **`_count`**: Used to get the number of related records without fetching the records themselves (e.g., getting the number of listings a user has).

### 3. `findFirst` vs `findUnique`
- **`findUnique`**: Used to find a record by its unique identifier (`id`) or a `@unique` field. It is the most performant way to fetch a single record.
- **`findFirst`**: Used to find the first record that matches a set of criteria that aren't necessarily unique.

### 4. Database Indexing
Adding `@@index([location])` would speed up searches when users filter by location, as the database creates a sorted data structure for those values instead of scanning the entire table.

## 🏗 Architecture
This project follows a **Service-Controller** pattern for better separation of concerns:
- **Controllers**: Handle HTTP requests, input validation, and send responses.
- **Services**: Contain business logic and interact with the Prisma ORM.
- **Prisma**: ORM for PostgreSQL database management.
- **DTOs**: (Data Transfer Objects) used for structured communication between layers.

## 🛠 Database Management (Prisma)

### Syncing the Database
To sync your local database with the Prisma schema without creating migrations (useful for rapid development):
```bash
npx prisma db push
```

### Creating Migrations
To create and apply a versioned migration:
```bash
npx prisma migrate dev --name <migration_name>
```

### Viewing Data
Open Prisma Studio to view and edit your data in a browser:
```bash
npx prisma studio
```

## 🔑 Automated ID Generation
This project uses a custom **32-character hex** ID generator (`src/utils/idGenerator.ts`). 
**Note:** You do not need to provide an `id` in the request body for POST operations; the backend will generate one automatically.

---
*Created as part of the Klab-pro Node.js course.*