-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PriceUnit" ADD VALUE 'per_day';
ALTER TYPE "PriceUnit" ADD VALUE 'per_week';
ALTER TYPE "PriceUnit" ADD VALUE 'per_three_months';

-- AlterEnum
ALTER TYPE "PropertyCategory" ADD VALUE 'hotel';
