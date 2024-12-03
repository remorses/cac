-- AlterTable
ALTER TABLE "public"."GitHubSync" DROP COLUMN "fileShas",
DROP COLUMN "fileSlugs",
ADD COLUMN     "installationId" INTEGER;

-- CreateTable
CREATE TABLE "public"."GitHubSyncedFile" (
    "slug" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,

    CONSTRAINT "GitHubSyncedFile_pkey" PRIMARY KEY ("installationId","slug")
);

-- AddForeignKey
ALTER TABLE "public"."GitHubSync" ADD CONSTRAINT "GitHubSync_installationId_orgId_fkey" FOREIGN KEY ("installationId", "orgId") REFERENCES "public"."GithubInstallation"("installationId", "orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GitHubSyncedFile" ADD CONSTRAINT "GitHubSyncedFile_installationId_orgId_fkey" FOREIGN KEY ("installationId", "orgId") REFERENCES "public"."GithubInstallation"("installationId", "orgId") ON DELETE CASCADE ON UPDATE CASCADE;

