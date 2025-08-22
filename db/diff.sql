-- CreateEnum
CREATE TYPE "public"."ReactExportComponentType" AS ENUM ('codeFile', 'component');

-- AlterTable
ALTER TABLE "public"."ReactExportComponent" ADD COLUMN     "componentType" "public"."ReactExportComponentType" NOT NULL DEFAULT 'component';

