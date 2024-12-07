-- CreateTable
CREATE TABLE "public"."ReactExportWebPage" (
    "webPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ReactExportWebPage_pkey" PRIMARY KEY ("webPageId")
);

-- AddForeignKey
ALTER TABLE "public"."ReactExportWebPage" ADD CONSTRAINT "ReactExportWebPage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."ReactExportProject"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

