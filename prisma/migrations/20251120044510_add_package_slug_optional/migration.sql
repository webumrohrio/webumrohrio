/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Package` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");
