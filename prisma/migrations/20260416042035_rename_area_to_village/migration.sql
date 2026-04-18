-- Rename Area table to Village
ALTER TABLE "Area" RENAME TO "Village";

-- Rename areaId to villageId in Listing
ALTER TABLE "Listing" RENAME COLUMN "areaId" TO "villageId";

-- Drop redundant location text columns
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "locationEn";
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "locationLo";
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "locationZh";

-- AlterTable
ALTER TABLE "Village" RENAME CONSTRAINT "Area_pkey" TO "Village_pkey";

-- RenameForeignKey
ALTER TABLE "Listing" RENAME CONSTRAINT "Listing_areaId_fkey" TO "Listing_villageId_fkey";

-- RenameIndex
ALTER INDEX "Area_nameEn_key" RENAME TO "Village_nameEn_key";

-- RenameIndex
ALTER INDEX "Area_slug_key" RENAME TO "Village_slug_key";
