-- AlterTable
ALTER TABLE "public"."ReactExportProject" ADD COLUMN     "connectedGitHubRepoAt" TIMESTAMP(3),
ADD COLUMN     "connectedGitHubRepoName" TEXT,
ADD COLUMN     "invitedGitHubRepoUsername" TEXT;

