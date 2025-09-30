-- CreateEnum
CREATE TYPE "public"."ReactExportCreationReason" AS ENUM ('USER_REQUESTED', 'MCP_FIRST_OPEN');

-- AlterTable
ALTER TABLE "public"."ReactExportProject" ADD COLUMN     "creationReason" "public"."ReactExportCreationReason" NOT NULL DEFAULT 'USER_REQUESTED';

