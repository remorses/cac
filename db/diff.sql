-- AlterTable
ALTER TABLE "public"."ReactExportProject" ADD COLUMN     "framerUserId" TEXT;

-- CreateTable
CREATE TABLE "public"."ReactExportComponentInstance" (
    "webPageId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ordering" DOUBLE PRECISION NOT NULL,
    "nodeDepth" INTEGER NOT NULL,
    "controls" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ReactExportComponentInstance_pkey" PRIMARY KEY ("webPageId","componentId","projectId")
);

-- AddForeignKey
ALTER TABLE "public"."ReactExportComponentInstance" ADD CONSTRAINT "ReactExportComponentInstance_webPageId_projectId_fkey" FOREIGN KEY ("webPageId", "projectId") REFERENCES "public"."ReactExportWebPage"("webPageId", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReactExportComponentInstance" ADD CONSTRAINT "ReactExportComponentInstance_componentId_projectId_fkey" FOREIGN KEY ("componentId", "projectId") REFERENCES "public"."ReactExportComponent"("id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

