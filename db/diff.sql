-- CreateEnum
CREATE TYPE "public"."GenerationStatus" AS ENUM ('accepted', 'discarded');

-- AlterTable
ALTER TABLE "public"."Generation" DROP COLUMN "arguments",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "initialXml" TEXT,
ADD COLUMN     "resultXml" TEXT,
ADD COLUMN     "status" "public"."GenerationStatus" NOT NULL DEFAULT 'accepted';

