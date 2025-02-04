-- CreateTable
CREATE TABLE "public"."AngledScreenImagesGenerated" (
    "framerUserId" TEXT NOT NULL,
    "generations" INTEGER NOT NULL,
    "licenseKey" TEXT,

    CONSTRAINT "AngledScreenImagesGenerated_pkey" PRIMARY KEY ("framerUserId")
);

