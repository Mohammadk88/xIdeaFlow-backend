/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `credit_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `user_subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paddlePlanId]` on the table `subscription_plans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paddleSubscriptionId]` on the table `user_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "subscription_plans_stripePriceId_key";

-- DropIndex
DROP INDEX "user_subscriptions_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "credit_transactions" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "paddleCheckoutId" TEXT,
ADD COLUMN     "paddlePaymentId" TEXT;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "stripePriceId",
ADD COLUMN     "paddlePlanId" TEXT;

-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "paddleCustomerId" TEXT,
ADD COLUMN     "paddleSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_paddlePlanId_key" ON "subscription_plans"("paddlePlanId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_paddleSubscriptionId_key" ON "user_subscriptions"("paddleSubscriptionId");
