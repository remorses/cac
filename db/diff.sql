-- CreateEnum
CREATE TYPE "public"."PluginName" AS ENUM ('migrate', 'gitHubSync');

-- AlterTable
ALTER TABLE "public"."PaymentForCredits" ADD COLUMN     "pluginName" "public"."PluginName" NOT NULL DEFAULT 'migrate';

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "pluginName" "public"."PluginName" NOT NULL DEFAULT 'migrate';

