-- CreateTable
CREATE TABLE "public"."ComponentBreakpoint" (
    "componentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "breakpointName" TEXT NOT NULL,

    CONSTRAINT "ComponentBreakpoint_pkey" PRIMARY KEY ("componentId","projectId","variantId")
);

-- AddForeignKey
ALTER TABLE "public"."ComponentBreakpoint" ADD CONSTRAINT "ComponentBreakpoint_componentId_projectId_fkey" FOREIGN KEY ("componentId", "projectId") REFERENCES "public"."ReactExportComponent"("id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

