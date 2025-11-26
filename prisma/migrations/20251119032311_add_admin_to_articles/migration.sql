-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredLocation" TEXT;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Slider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "targetCity" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOverlay" BOOLEAN NOT NULL DEFAULT true,
    "objectFit" TEXT NOT NULL DEFAULT 'cover',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "image" TEXT,
    "slug" TEXT NOT NULL,
    "tags" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "travelId" TEXT,
    "adminId" TEXT,
    CONSTRAINT "Article_travelId_fkey" FOREIGN KEY ("travelId") REFERENCES "Travel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("content", "createdAt", "excerpt", "id", "image", "isPublished", "slug", "tags", "title", "travelId", "updatedAt", "views") SELECT "content", "createdAt", "excerpt", "id", "image", "isPublished", "slug", "tags", "title", "travelId", "updatedAt", "views" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE TABLE "new_Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "travelId" TEXT NOT NULL,
    CONSTRAINT "Package_travelId_fkey" FOREIGN KEY ("travelId") REFERENCES "Travel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("cashback", "category", "createdAt", "departureCity", "departureDate", "description", "duration", "excludes", "facilities", "id", "image", "includes", "isActive", "itinerary", "name", "originalPrice", "price", "priceOptions", "quota", "quotaAvailable", "rating", "returnDate", "travelId", "updatedAt") SELECT "cashback", "category", "createdAt", "departureCity", "departureDate", "description", "duration", "excludes", "facilities", "id", "image", "includes", "isActive", "itinerary", "name", "originalPrice", "price", "priceOptions", "quota", "quotaAvailable", "rating", "returnDate", "travelId", "updatedAt" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE TABLE "new_Travel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalJamaah" INTEGER NOT NULL DEFAULT 0,
    "yearEstablished" INTEGER,
    "licenses" TEXT,
    "facilities" TEXT,
    "services" TEXT,
    "gallery" TEXT,
    "legalDocs" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Travel" ("address", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "legalDocs", "licenses", "logo", "name", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished") SELECT "address", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "legalDocs", "licenses", "logo", "name", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished" FROM "Travel";
DROP TABLE "Travel";
ALTER TABLE "new_Travel" RENAME TO "Travel";
CREATE UNIQUE INDEX "Travel_username_key" ON "Travel"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
