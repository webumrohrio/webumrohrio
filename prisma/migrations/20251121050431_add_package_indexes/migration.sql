/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Travel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Travel" ADD COLUMN "lastLogin" DATETIME;
ALTER TABLE "Travel" ADD COLUMN "password" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "image" TEXT,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "cashback" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "returnDate" DATETIME,
    "quota" INTEGER NOT NULL,
    "quotaAvailable" INTEGER NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'reguler',
    "flightType" TEXT NOT NULL DEFAULT 'langsung',
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "facilities" TEXT,
    "includes" TEXT,
    "excludes" TEXT,
    "priceOptions" TEXT,
    "itinerary" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookingClicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "travelId" TEXT NOT NULL,
    CONSTRAINT "Package_travelId_fkey" FOREIGN KEY ("travelId") REFERENCES "Travel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("cashback", "category", "createdAt", "departureCity", "departureDate", "description", "duration", "excludes", "facilities", "flightType", "id", "image", "includes", "isActive", "isBestSeller", "itinerary", "name", "originalPrice", "price", "priceOptions", "quota", "quotaAvailable", "rating", "returnDate", "slug", "travelId", "updatedAt") SELECT "cashback", "category", "createdAt", "departureCity", "departureDate", "description", "duration", "excludes", "facilities", "flightType", "id", "image", "includes", "isActive", "isBestSeller", "itinerary", "name", "originalPrice", "price", "priceOptions", "quota", "quotaAvailable", "rating", "returnDate", "slug", "travelId", "updatedAt" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");
CREATE INDEX "Package_departureCity_idx" ON "Package"("departureCity");
CREATE INDEX "Package_category_idx" ON "Package"("category");
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");
CREATE INDEX "Package_isPinned_idx" ON "Package"("isPinned");
CREATE INDEX "Package_createdAt_idx" ON "Package"("createdAt");
CREATE INDEX "Package_travelId_idx" ON "Package"("travelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Travel_email_key" ON "Travel"("email");
