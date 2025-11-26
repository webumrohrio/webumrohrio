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
    "packageUsed" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Travel" ("address", "city", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "isVerified", "lastLogin", "legalDocs", "licenses", "logo", "name", "packageLimit", "password", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished") SELECT "address", "city", "coverImage", "createdAt", "description", "email", "facilities", "gallery", "id", "isActive", "isVerified", "lastLogin", "legalDocs", "licenses", "logo", "name", "packageLimit", "password", "phone", "rating", "services", "totalJamaah", "totalReviews", "updatedAt", "username", "website", "yearEstablished" FROM "Travel";
DROP TABLE "Travel";
ALTER TABLE "new_Travel" RENAME TO "Travel";
CREATE UNIQUE INDEX "Travel_username_key" ON "Travel"("username");
CREATE UNIQUE INDEX "Travel_email_key" ON "Travel"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
