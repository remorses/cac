-- CreateTable
CREATE TABLE "public"."ReactExportLocale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ReactExportLocale_pkey" PRIMARY KEY ("id","projectId")
);

-- AddForeignKey
ALTER TABLE "public"."ReactExportLocale" ADD CONSTRAINT "ReactExportLocale_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."ReactExportProject"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

