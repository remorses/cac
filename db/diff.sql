-- AlterTable
ALTER TABLE
    "public"."FramerLoginSession"
ADD
    COLUMN "projectId" TEXT,
ADD
    COLUMN "projectName" TEXT;

-- AlterTable
ALTER TABLE
    "public"."Generation"
ADD
    COLUMN "pagePath" TEXT,
ADD
    COLUMN "projectName" TEXT;