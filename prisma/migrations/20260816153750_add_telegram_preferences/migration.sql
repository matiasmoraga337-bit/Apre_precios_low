-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramAlertsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramChatId" TEXT;
