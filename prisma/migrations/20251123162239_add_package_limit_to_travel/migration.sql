-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Travel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
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
    "packageLimit" INTEGER NOT NULL DEFAULT 10,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Travel" ("address", "city", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "isVerified", "lastLogin", "legalDocs", "licenses", "logo", "name", "password", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished") SELECT "address", "city", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "isVerified", "lastLogin", "legalDocs", "licenses", "logo", "name", "password", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished" FROM "Travel";
DROP TABLE "Travel";
ALTER TABLE "new_Travel" RENAME TO "Travel";
CREATE UNIQUE INDEX "Travel_username_key" ON "Travel"("username");
CREATE UNIQUE INDEX "Travel_email_key" ON "Travel"("email");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "preferredLocation" TEXT,
    "lastActive" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "id", "lastActive", "name", "password", "phone", "preferredLocation", "updatedAt") SELECT "avatar", "createdAt", "email", "id", "lastActive", "name", "password", "phone", "preferredLocation", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
