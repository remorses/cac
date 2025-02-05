-- AddForeignKey
ALTER TABLE "public"."ReactExportProject" ADD CONSTRAINT "ReactExportProject_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

