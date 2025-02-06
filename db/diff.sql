-- CreateTable
CREATE TABLE "public"."LLMRewriteGeneration" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgId" TEXT NOT NULL,
    "words" INTEGER NOT NULL,
    "chars" INTEGER NOT NULL,
    "description" TEXT,
    "status" "public"."GenerationStatus" NOT NULL DEFAULT 'accepted',
    "projectName" TEXT,

    CONSTRAINT "LLMRewriteGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LLMRewriteGeneration_orgId_idx" ON "public"."LLMRewriteGeneration"("orgId");

-- AddForeignKey
ALTER TABLE "public"."LLMRewriteGeneration" ADD CONSTRAINT "LLMRewriteGeneration_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

