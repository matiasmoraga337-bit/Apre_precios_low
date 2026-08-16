-- CreateTable
CREATE TABLE "AlertDelivery" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertDelivery_snapshotId_idx" ON "AlertDelivery"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertDelivery_alertId_snapshotId_key" ON "AlertDelivery"("alertId", "snapshotId");

-- AddForeignKey
ALTER TABLE "AlertDelivery" ADD CONSTRAINT "AlertDelivery_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "PriceAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDelivery" ADD CONSTRAINT "AlertDelivery_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PriceSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
